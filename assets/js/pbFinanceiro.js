/* ============================================================
   CRM · Cibele Matozo Fotografia — Adapter PocketBase · Financeiro (v3.3)
   <script> clássico. Depende de pbCore.js/pbEscrita.js e de pbAgenda.js
   (sincronizarAgendaEntrega). Espelha salvarConta/excluirContaFinanceiro
   e o helper reconciliarDescontoConta_ do Apps Script (backend.txt
   721-840 / 1266-1289).

   id_parcela é atribuído pelo pb_hook de ID atômico (Fase 0) — parcelas
   NOVAS NÃO enviam id_parcela. Parcelas existentes são atualizadas pelo
   id nativo do PB (localizado por id_parcela de negócio via pbAchar_).
   ============================================================ */

/* (Re)aplica o desconto (R$) de uma conta como linha dedicada 'Desconto' no
   Financeiro, identificada por id_evento + id_cliente. desc>0 cria/atualiza;
   desc<=0 remove. Linha fora de Cobranças (vencimento ''), Status 'Aplicado',
   Saldo 0 — quem abate o saldo exibido é o front (backend.txt 721-742). */
async function reconciliarDescontoConta_(idEvento, idCliente, nomeCliente, desconto){
  const desc = Number(desconto || 0);
  const doEvento = await PB.collection('financeiro').getFullList({ filter: 'id_evento=' + Number(idEvento) });
  const linha = doEvento.find(p =>
    Number(p.id_cliente || 0) === Number(idCliente || 0) &&
    String(p.tipo_cobranca) === 'Desconto');
  if (desc > 0){
    const campos = {
      tipo_cobranca: 'Desconto', num_parcela: 0, total_parcelas: 0, vencimento: '',
      valor_previsto: desc, forma_pagamento: '', status: 'Aplicado', data_pagamento: '',
      valor_pago: 0, saldo: 0, cliente: nomeCliente, id_cliente: idClienteParaPb_(idCliente),
    };
    if (linha){
      await PB.collection('financeiro').update(linha.id, campos);
    } else {
      await PB.collection('financeiro').create(Object.assign({ id_evento: Number(idEvento) }, campos));
    }
  } else if (linha){
    await PB.collection('financeiro').delete(linha.id);
  }
}

// id_cliente do Financeiro: number quando houver; '' quando vazio (coletivo/
// responsável sem cliente). Mesma convenção de pbCriarContaPendente_.
function idClienteParaPb_(v){
  return (v === '' || v === null || v === undefined) ? '' : Number(v);
}

// Monta os campos de uma linha de parcela/entrada (comum a entrada e parcelas).
function camposParcela_(p, numParcela, totalParcelas, contaCliente, contaIdCliente){
  const valorPrevisto = Number(p.valor || 0);
  const valorPago = p.__entrada ? (p.status === 'Pago' ? valorPrevisto : 0) : Number(p.valorPago || 0);
  return {
    tipo_cobranca: p.__entrada ? 'Entrada' : (p.tipoCobranca || ''),
    num_parcela: numParcela,
    total_parcelas: totalParcelas,
    vencimento: p.__entrada ? '' : (p.vencimento || ''),
    valor_previsto: valorPrevisto,
    forma_pagamento: p.formaPagamento || '',
    status: p.status || 'Pendente',
    data_pagamento: p.dataPagamento || '',
    valor_pago: valorPago,
    saldo: valorPrevisto - valorPago,
    cliente: contaCliente,
    id_cliente: idClienteParaPb_(contaIdCliente),
  };
}

/* Salva o plano de cobrança inteiro de um evento (a "conta"): a Entrada (se
   houver) vira sua própria linha fora da contagem; cada parcela com idParcela é
   atualizada, sem idParcela nasce nova e todas ficam renumeradas 1..N. Pode ser
   do responsável do evento ou de um participante (idCliente/clienteNome).
   backend.txt 744-840. */
async function pbSalvarConta(dados){
  await pbAuthGarantir();
  if (!dados.idEvento) throw new Error('idEvento é obrigatório.');
  const lista = dados.parcelas || [];
  if (!dados.entrada && !lista.length) throw new Error('Informe a entrada ou ao menos uma parcela.');
  const evento = await pbAchar_('eventos', 'id_evento', dados.idEvento);

  const contaCliente = (dados.clienteNome !== undefined && String(dados.clienteNome).trim() !== '')
    ? String(dados.clienteNome).trim() : (evento.cliente_responsavel || '');
  const contaIdCliente = (dados.idCliente !== undefined && dados.idCliente !== '' && dados.idCliente !== null)
    ? dados.idCliente : (evento.id_cliente || '');

  // Entrada (fora da contagem de parcelas): Nº 0, Total = nº de parcelas.
  if (dados.entrada && Number(dados.entrada.valor) > 0){
    const e = dados.entrada;
    const campos = camposParcela_(Object.assign({ __entrada: true }, e), 0, lista.length, contaCliente, contaIdCliente);
    if (e.idParcela){
      const rec = await pbAchar_('financeiro', 'id_parcela', e.idParcela);
      await PB.collection('financeiro').update(rec.id, campos);
    } else {
      await PB.collection('financeiro').create(Object.assign({ id_evento: Number(evento.id_evento) }, campos));
    }
  }

  // Parcelas renumeradas 1..N.
  const total = lista.length;
  for (let i = 0; i < lista.length; i++){
    const parcela = lista[i];
    const campos = camposParcela_(parcela, i + 1, total, contaCliente, contaIdCliente);
    if (parcela.idParcela){
      const rec = await pbAchar_('financeiro', 'id_parcela', parcela.idParcela);
      await PB.collection('financeiro').update(rec.id, campos);
    } else {
      await PB.collection('financeiro').create(Object.assign({ id_evento: Number(evento.id_evento) }, campos));
    }
  }

  // Desconto (R$): linha dedicada. Só a modal do Financeiro manda dados.desconto;
  // chamadas internas (importarParticipantes) não mandam → preserva a linha atual.
  if (dados.desconto !== undefined){
    await reconciliarDescontoConta_(evento.id_evento, contaIdCliente, contaCliente, dados.desconto);
  }

  // Se já há entrega no Calendar, atualiza o status financeiro no compromisso.
  await sincronizarEntregaSeHouver_(dados.idEvento);

  return { idEvento: dados.idEvento, salvo: true };
}

// Atualiza o status financeiro na Agenda de entrega, se existir (fail-soft).
async function sincronizarEntregaSeHouver_(idEvento){
  try {
    const prod = await pbAchar_('producao', 'id_evento', idEvento);
    if (prod && prod.data_entrega && prod.id_calendar_entrega && typeof sincronizarAgendaEntrega === 'function'){
      await sincronizarAgendaEntrega(prod);
    }
  } catch (e){ /* sem produção/entrega ou Agenda indisponível — segue */ }
}

/* Exclui a conta de um evento (todas as parcelas) ou, com idCliente, só a conta
   de um participante. Guarda valor pago>0 sem forcar. backend.txt 1266-1289. */
async function pbExcluirContaFinanceiro(dados){
  await pbAuthGarantir();
  if (!dados.idEvento) throw new Error('idEvento é obrigatório.');
  const temCliente = dados.idCliente !== undefined && dados.idCliente !== '' && dados.idCliente !== null;
  const todas = await PB.collection('financeiro').getFullList({ filter: 'id_evento=' + Number(dados.idEvento) });
  const parcelas = todas.filter(p => !temCliente || Number(p.id_cliente || 0) === Number(dados.idCliente));
  if (!parcelas.length) throw new Error('Conta não encontrada.');
  const valorPago = parcelas.reduce((s, p) => s + Number(p.valor_pago || 0), 0);
  if (valorPago > 0 && !dados.forcar){
    throw new Error('Não é possível excluir: esta conta já tem R$ ' + valorPago.toFixed(2) +
      ' recebido(s). Reverta o(s) pagamento(s) antes de excluir, ou confirme a exclusão forçada.');
  }
  const optForcar = dados.forcar ? { query: { forcar: 1 } } : undefined;
  for (const p of parcelas){ await PB.collection('financeiro').delete(p.id, optForcar); }
  await sincronizarEntregaSeHouver_(dados.idEvento);
  return { idEvento: dados.idEvento, excluido: true };
}

Object.assign(window.PB_ACTIONS, {
  salvarConta: (d) => perfTime('PB salvarConta', pbSalvarConta(d)),
  excluirContaFinanceiro: (d) => perfTime('PB excluirContaFinanceiro', pbExcluirContaFinanceiro(d)),
});
