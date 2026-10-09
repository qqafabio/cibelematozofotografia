/* ============================================================
   CRM · Cibele Matozo Fotografia — Adapter PocketBase · Coletivo/Participantes (v3.3)
   <script> clássico. Depende de pbCore.js/pbEscrita.js, pbAgenda.js
   (sincronizarAgendaEvento), pbEventos.js (pbCriarProducao_) e pbFinanceiro.js
   (pbSalvarConta/reconciliarDescontoConta_). Espelha criarEventoColetivo/
   importarParticipantes/atualizarParticipante + os helpers de valor por
   participante do Apps Script (backend.txt 1514-1753).

   id_evento/id_participante/id_parcela são atribuídos pelos pb_hooks de ID
   atômico (Fase 0) — não enviamos na criação.
   ============================================================ */

/* "Valor foto extra" aplicável ao evento: prioriza a coluna do próprio evento;
   se 0, cai no cadastro de Pacotes pelo nome (backend.txt 1563-1570). */
async function valorFotoExtraDoEvento_(evento){
  const doEvento = Number(evento.valor_foto_extra || 0);
  if (doEvento > 0) return doEvento;
  const nome = String(evento.pacote || '').trim();
  if (!nome) return 0;
  try {
    const pacotes = await PB.collection('pacotes').getFullList();
    const pacote = pacotes.find(p => String(p.nome || '').trim() === nome);
    return pacote ? Number(pacote.valor_foto_extra || 0) : 0;
  } catch (e){ return 0; }
}

/* (Re)calcula a parcela "Fotos extras" do participante = qtd × valor foto extra.
   Cria/atualiza (preservando valor pago) ou remove quando zera. backend 1575-1601. */
async function recalcularFotosExtrasParticipante_(evento, idCliente, nomeCliente, qtd){
  const total = Number(qtd || 0) * (await valorFotoExtraDoEvento_(evento));
  const doEvento = await PB.collection('financeiro').getFullList({ filter: 'id_evento=' + Number(evento.id_evento) });
  const linha = doEvento.find(p =>
    Number(p.id_cliente || 0) === Number(idCliente) && String(p.tipo_cobranca) === 'Fotos extras');
  if (total > 0){
    const pago = linha ? Number(linha.valor_pago || 0) : 0;
    if (linha){
      await PB.collection('financeiro').update(linha.id, { valor_previsto: total, saldo: total - pago });
    } else {
      await PB.collection('financeiro').create({
        id_evento: Number(evento.id_evento), id_cliente: Number(idCliente), cliente: nomeCliente,
        tipo_cobranca: 'Fotos extras', num_parcela: 1, total_parcelas: 1, vencimento: '',
        valor_previsto: total, forma_pagamento: '', status: 'Pendente', data_pagamento: '',
        valor_pago: 0, saldo: total,
      });
    }
  } else if (linha){
    await PB.collection('financeiro').delete(linha.id);
  }
}

/* (Re)aplica o "Valor pacote" do evento à parcela de pacote do participante.
   Atualiza (preservando valor pago) ou cria se não existir. Valor 0 não apaga
   a parcela existente. backend.txt 1607-1633. */
async function reaplicarPacoteParticipante_(evento, idCliente, nomeCliente){
  const valorPacote = Number(evento.valor_pacote || 0);
  const pacoteNome = String(evento.pacote || '').trim();
  const tipoPacote = pacoteNome ? ('Pacote ' + pacoteNome) : 'Pacote';
  const doEvento = await PB.collection('financeiro').getFullList({ filter: 'id_evento=' + Number(evento.id_evento) });
  const linha = doEvento.find(p =>
    Number(p.id_cliente || 0) === Number(idCliente) && String(p.tipo_cobranca || '').indexOf('Pacote') === 0);
  if (linha){
    const pago = Number(linha.valor_pago || 0);
    await PB.collection('financeiro').update(linha.id, {
      tipo_cobranca: tipoPacote, valor_previsto: valorPacote, saldo: valorPacote - pago,
    });
  } else if (valorPacote > 0){
    await PB.collection('financeiro').create({
      id_evento: Number(evento.id_evento), id_cliente: Number(idCliente), cliente: nomeCliente,
      tipo_cobranca: tipoPacote, num_parcela: 1, total_parcelas: 1, vencimento: '',
      valor_previsto: valorPacote, forma_pagamento: '', status: 'Pendente', data_pagamento: '',
      valor_pago: 0, saldo: valorPacote,
    });
  }
}

/* Cria um evento coletivo: idCliente vazio, responsável = organizador, Coletivo
   'Sim', SEM conta pendente (as contas nascem por participante). Produção +
   Agenda únicas. backend.txt 1514-1548. */
async function pbCriarEventoColetivo(dados){
  await pbAuthGarantir();
  const organizador = String(dados.organizador || '').trim();
  const valorPacote = Number(dados.valorPacote || 0);
  const registro = {
    status: dados.status || 'Novo',
    cliente_responsavel: organizador,
    whatsapp: '',
    data_evento: dados.dataEvento || '',
    hora_inicio: dados.horaInicio || '',
    hora_fim: dados.horaFim || '',
    tipo_evento: dados.tipoEvento || '',
    local: dados.local || '',
    cidade: dados.cidade || '',
    pacote: dados.pacote || '',
    valor_pacote: valorPacote,
    valor_foto_extra: Number(dados.valorFotoExtra || 0),
    valor_final: valorPacote,
    observacoes: dados.observacoes || '',
    id_cliente: '',
    coletivo: 'Sim',
    organizador: organizador,
    data_cadastro: hojeBR_(),
    // sem id_evento → hook atribui
  };
  const ev = await PB.collection('eventos').create(registro);

  // Agenda (fail-soft) grava id_calendar; depois a produção única (reusa pbEventos).
  if (typeof sincronizarAgendaEvento === 'function'){
    const idCal = await sincronizarAgendaEvento(ev);
    if (idCal) ev.id_calendar = idCal;
  }
  if (typeof pbCriarProducao_ === 'function') await pbCriarProducao_(ev);
  return ev;
}

/* Importa uma lista de participantes: dedup por nome (no evento), cria a linha
   em Participantes e lança UMA conta pendente com o valor do pacote (via
   salvarConta, vinculada ao participante). backend.txt 1646-1700. */
async function pbImportarParticipantes(dados){
  await pbAuthGarantir();
  if (!dados || !dados.idEvento) throw new Error('idEvento é obrigatório.');
  const lista = Array.isArray(dados.lista) ? dados.lista : [];
  if (!lista.length) throw new Error('Nenhum participante para importar.');
  const evento = await pbAchar_('eventos', 'id_evento', dados.idEvento);

  const valorPacote = (dados.valorPacote !== undefined && dados.valorPacote !== '')
    ? Number(dados.valorPacote) : Number(evento.valor_pacote || 0);
  const pacoteNome = dados.pacote || evento.pacote || '';
  const statusOverride = dados.statusInicial || '';

  const existentes = await PB.collection('participantes').getFullList({ filter: 'id_evento=' + Number(evento.id_evento) });
  const nomesExistentes = existentes.map(p => String(p.nome_participante || '').trim().toLowerCase());

  let criados = 0, ignorados = 0;
  const detalhes = [];
  for (const item of lista){
    const nome = String((item && item.nome) || '').trim();
    if (!nome){ ignorados++; continue; }
    if (nomesExistentes.indexOf(nome.toLowerCase()) > -1){
      ignorados++; detalhes.push({ nome: nome, status: 'ignorado (já no evento)' }); continue;
    }
    const whatsapp = String((item && item.whatsapp) || '').trim();
    const cli = await pbLocalizarOuCriarCliente(nome, whatsapp, '', '');
    const idCliente = cli.idCliente;
    const statusCompra = statusOverride || (whatsapp ? 'Interessado' : 'Sem contato');
    await PB.collection('participantes').create({
      id_evento: Number(evento.id_evento),
      id_cliente: Number(idCliente),
      nome_participante: nome,
      whatsapp: whatsapp,
      status_compra: statusCompra,
      qtd_fotos_extras: 0,
      observacoes: '',
      data_criacao: hojeBR_(),
      // sem id_participante → hook atribui
    });
    if (valorPacote > 0 && typeof pbSalvarConta === 'function'){
      await pbSalvarConta({
        idEvento: evento.id_evento,
        idCliente: idCliente,
        clienteNome: nome,
        parcelas: [{ tipoCobranca: pacoteNome ? ('Pacote ' + pacoteNome) : 'Pacote', vencimento: '', valor: valorPacote, status: 'Pendente', formaPagamento: '' }],
      });
    }
    nomesExistentes.push(nome.toLowerCase());
    criados++;
    detalhes.push({ nome: nome, status: 'importado' });
  }

  return { idEvento: evento.id_evento, criados: criados, ignorados: ignorados, total: lista.length, detalhes: detalhes };
}

/* Atualiza um participante (status/observações/fotos extras/desconto). Recalcula
   a parcela "Fotos extras", reconcilia o desconto, e "Não quis" cancela as contas
   em aberto. Retorno minimalista → o front reconcilia via carregarTudo (relê do
   PB com as chaves rotuladas). backend.txt 1711-1753. */
async function pbAtualizarParticipante(dados){
  await pbAuthGarantir();
  if (!dados || !dados.id) throw new Error('id do participante é obrigatório.');
  const participante = await pbAchar_('participantes', 'id_participante', dados.id);

  const campos = {};
  if (dados.statusCompra !== undefined) campos.status_compra = dados.statusCompra;
  if (dados.observacoes !== undefined) campos.observacoes = dados.observacoes;
  if (dados.qtdFotosExtras !== undefined) campos.qtd_fotos_extras = Number(dados.qtdFotosExtras || 0);
  if (Object.keys(campos).length) await PB.collection('participantes').update(participante.id, campos);

  let evento = null;
  try { evento = await pbAchar_('eventos', 'id_evento', participante.id_evento); }
  catch (e){ /* evento pode não existir */ }

  if (dados.qtdFotosExtras !== undefined && evento){
    await recalcularFotosExtrasParticipante_(evento, participante.id_cliente, participante.nome_participante, dados.qtdFotosExtras);
  }
  if (dados.desconto !== undefined && evento && typeof reconciliarDescontoConta_ === 'function'){
    await reconciliarDescontoConta_(evento.id_evento, participante.id_cliente, participante.nome_participante, dados.desconto);
  }
  if (dados.statusCompra === 'Não quis' && evento){
    const doEvento = await PB.collection('financeiro').getFullList({ filter: 'id_evento=' + Number(evento.id_evento) });
    const emAberto = doEvento.filter(p =>
      Number(p.id_cliente || 0) === Number(participante.id_cliente) && String(p.status) !== 'Pago');
    for (const p of emAberto){ await PB.collection('financeiro').update(p.id, { status: 'Cancelado' }); }
  }

  return { id: dados.id, atualizado: true };
}

Object.assign(window.PB_ACTIONS, {
  criarEventoColetivo: (d) => perfTime('PB criarEventoColetivo', pbCriarEventoColetivo(d)),
  importarParticipantes: (d) => perfTime('PB importarParticipantes', pbImportarParticipantes(d)),
  atualizarParticipante: (d) => perfTime('PB atualizarParticipante', pbAtualizarParticipante(d)),
});
