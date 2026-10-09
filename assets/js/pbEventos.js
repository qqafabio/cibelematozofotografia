/* ============================================================
   CRM · Cibele Matozo Fotografia — Adapter PocketBase · Eventos (v3.3)
   <script> clássico. Depende de pbCore.js/pbEscrita.js/pbAgenda.js e de
   pbClientes.js (pbAcharPorIdCliente).

   Espelha criarEvento/atualizarEvento/excluirEvento/excluirProducao do
   backend.txt (308-409, 1215-1259). Estratégia "front-first" (Fase 3):
   a cascata evento→produção→conta roda aqui, no front, em sequência; a
   Agenda é orquestrada por pbAgenda.js (fail-soft); a ÚNICA guarda
   server-side (bloquear exclusão de parcela paga) vai num pb_hook que só
   é implantado no cutover (Fase 4) — ver infra/pb_hooks/delete_guard.pb.js.

   id_evento é atribuído pelo pb_hook de ID atômico (Fase 0) — NÃO enviamos.
   A produção herda id_evento do pai (enviado explicitamente). As parcelas
   recebem id_parcela do mesmo hook.
   ============================================================ */

// camelCase do formulário → colunas snake_case da coleção 'eventos'.
const MAPA_EVENTO = {
  status: 'status', dataEvento: 'data_evento', horaInicio: 'hora_inicio', horaFim: 'hora_fim',
  tipoEvento: 'tipo_evento', servicoContratado: 'servico_contratado', local: 'local', cidade: 'cidade',
  pacote: 'pacote', valorPacote: 'valor_pacote', valorFotoExtra: 'valor_foto_extra', desconto: 'desconto',
  valorFinal: 'valor_final', prazoEntrega: 'prazo_entrega', contrato: 'contrato', linkContrato: 'link_contrato',
  linkBriefing: 'link_briefing', linkPasta: 'link_pasta_drive', equipe: 'equipe', observacoes: 'observacoes',
  organizador: 'organizador',
};
const CAMPOS_NUM_EVENTO = { valor_pacote: 1, valor_foto_extra: 1, desconto: 1, valor_final: 1 };

// Cria a linha de Produção do evento (1:1), com as 11 etapas em "Não iniciado"
// (espelha criarProducaoParaEvento_, backend 846-860). id_evento herdado do pai.
async function pbCriarProducao_(ev){
  return PB.collection('producao').create({
    id_evento: Number(ev.id_evento),
    cliente: ev.cliente_responsavel || '',
    tipo_evento: ev.tipo_evento || '',
    data_evento: ev.data_evento || '',
    briefing: 'Não iniciado', pre_evento: 'Não iniciado', captacao: 'Não iniciado', backup: 'Não iniciado',
    selecao: 'Não iniciado', edicao_foto: 'Não iniciado', edicao_video: 'Não iniciado',
    storymaker_teaser: 'Não iniciado', album: 'Não iniciado', aprovacao: 'Não iniciado', entrega: 'Não iniciado',
  });
}

// Cria UMA conta pendente "Saldo do evento" com o valor final (espelha
// criarContaPendente_ → salvarConta de 1 parcela, backend 414-418/744-819).
async function pbCriarContaPendente_(ev){
  const valorFinal = Number(ev.valor_final || 0);
  return PB.collection('financeiro').create({
    id_evento: Number(ev.id_evento),
    id_cliente: ev.id_cliente || '',
    cliente: ev.cliente_responsavel || '',
    tipo_cobranca: 'Saldo do evento',
    num_parcela: 1,
    total_parcelas: 1,
    vencimento: '',
    valor_previsto: valorFinal,
    forma_pagamento: '',
    status: 'Pendente',
    data_pagamento: '',
    valor_pago: 0,
    saldo: valorFinal,
    // sem id_parcela → hook atribui
  });
}

async function pbCriarEvento(dados){
  await pbAuthGarantir();
  if (!dados.idCliente) throw new Error('idCliente é obrigatório para criar um evento.');
  const cli = await pbAcharPorIdCliente(dados.idCliente);  // de pbClientes.js
  if (!cli) throw new Error('Cliente não encontrado: ' + dados.idCliente);

  const registro = {
    status: dados.status || 'Novo',
    cliente_responsavel: cli.nome || '',
    whatsapp: cli.whatsapp || '',
    data_evento: dados.dataEvento || '',
    hora_inicio: dados.horaInicio || '',
    hora_fim: dados.horaFim || '',
    tipo_evento: dados.tipoEvento || '',
    servico_contratado: dados.servicoContratado || '',
    local: dados.local || '',
    cidade: dados.cidade || '',
    pacote: dados.pacote || '',
    valor_pacote: Number(dados.valorPacote || 0),
    desconto: Number(dados.desconto || 0),
    valor_final: Number(dados.valorFinal || dados.valorPacote || 0),
    prazo_entrega: dados.prazoEntrega || '',
    contrato: dados.contrato || 'Não',
    link_contrato: dados.linkContrato || '',
    link_briefing: dados.linkBriefing || '',
    link_pasta_drive: dados.linkPasta || '',
    equipe: dados.equipe || '',
    observacoes: dados.observacoes || '',
    id_cliente: cli.id_cliente,
    data_cadastro: hojeBR_(),
    // sem id_evento → hook atribui
  };

  const ev = await PB.collection('eventos').create(registro);

  // Cascata (sequencial, front-first): produção SEMPRE; conta se Confirmado.
  await pbCriarProducao_(ev);
  if (ev.status === 'Confirmado'){
    try { await pbCriarContaPendente_(ev); }
    catch (e){ console.error('criarEvento: conta pendente falhou (segue): ' + e); }
  }
  // Agenda (fail-soft): grava id_calendar de volta no record.
  if (typeof sincronizarAgendaEvento === 'function'){
    const idCal = await sincronizarAgendaEvento(ev);
    if (idCal) ev.id_calendar = idCal;
  }
  return ev;
}

async function pbAtualizarEvento(dados){
  await pbAuthGarantir();
  if (!dados.idEvento) throw new Error('idEvento é obrigatório para atualizar.');
  const atual = await pbAchar_('eventos', 'id_evento', dados.idEvento);

  const patch = {};
  for (const k of Object.keys(MAPA_EVENTO)){
    if (dados[k] !== undefined){
      const col = MAPA_EVENTO[k];
      patch[col] = CAMPOS_NUM_EVENTO[col] ? Number(dados[k] || 0) : dados[k];
    }
  }

  const atualizado = await PB.collection('eventos').update(atual.id, patch);

  // Agenda (fail-soft): sincroniza o compromisso e grava id_calendar.
  if (typeof sincronizarAgendaEvento === 'function'){
    await sincronizarAgendaEvento(atualizado);
  }

  // Status virou "Confirmado" agora (não já estava) → gera conta pendente.
  if (dados.status === 'Confirmado' && atual.status !== 'Confirmado'){
    try { await pbCriarContaPendente_(atualizado); }
    catch (e){ console.error('atualizarEvento: conta pendente falhou (segue): ' + e); }
  }

  // Evento coletivo: se mudou Valor pacote/foto extra, reaplica aos participantes
  // já importados (backend 384-396). Preserva o Valor pago. Fail-soft.
  if (String(atual.coletivo) === 'Sim'){
    const mudouPacote = patch.valor_pacote !== undefined &&
      Number(patch.valor_pacote) !== Number(atual.valor_pacote || 0);
    const mudouFotoExtra = patch.valor_foto_extra !== undefined &&
      Number(patch.valor_foto_extra) !== Number(atual.valor_foto_extra || 0);
    if (mudouPacote || mudouFotoExtra){
      try {
        const parts = await PB.collection('participantes').getFullList({ filter: 'id_evento=' + Number(dados.idEvento) });
        for (const p of parts){
          if (mudouPacote && typeof reaplicarPacoteParticipante_ === 'function'){
            await reaplicarPacoteParticipante_(atualizado, p.id_cliente, p.nome_participante);
          }
          if (mudouFotoExtra && typeof recalcularFotosExtrasParticipante_ === 'function'){
            await recalcularFotosExtrasParticipante_(atualizado, p.id_cliente, p.nome_participante, p.qtd_fotos_extras);
          }
        }
      } catch (e){ console.error('atualizarEvento: reaplicação de valores do coletivo falhou (segue): ' + e); }
    }
  }

  return { idEvento: dados.idEvento, atualizado: true };
}

// Exclui o evento inteiro, com guarda de valor pago e cascata (produção,
// financeiro, custos, participantes) + remoção dos compromissos na Agenda.
async function pbExcluirEvento(dados){
  await pbAuthGarantir();
  if (!dados.idEvento) throw new Error('idEvento é obrigatório.');
  const idEv = Number(dados.idEvento);
  const evento = await pbAchar_('eventos', 'id_evento', idEv);

  const parcelas = await PB.collection('financeiro').getFullList({ filter: 'id_evento=' + idEv });
  const valorPago = parcelas.reduce((s, p) => s + Number(p.valor_pago || 0), 0);
  if (valorPago > 0 && !dados.forcar){
    throw new Error('Não é possível excluir: este evento já tem R$ ' + valorPago.toFixed(2) +
      ' recebido(s) no Financeiro. Reverta o(s) pagamento(s) antes de excluir, ou confirme a exclusão forçada.');
  }
  const optForcar = dados.forcar ? { query: { forcar: 1 } } : undefined;

  // Agenda do evento
  if (typeof excluirAgenda === 'function') await excluirAgenda(evento.id_calendar);

  // Produção (+ Agenda de entrega)
  try {
    const prod = await pbAchar_('producao', 'id_evento', idEv);
    if (prod){
      if (typeof excluirAgenda === 'function') await excluirAgenda(prod.id_calendar_entrega);
      await PB.collection('producao').delete(prod.id);
    }
  } catch (e){ /* produção pode não existir */ }

  // Financeiro, Custos, Participantes
  for (const p of parcelas){ await PB.collection('financeiro').delete(p.id, optForcar); }
  const custos = await PB.collection('custos').getFullList({ filter: 'id_evento=' + idEv });
  for (const c of custos){ await PB.collection('custos').delete(c.id); }
  try {
    const parts = await PB.collection('participantes').getFullList({ filter: 'id_evento=' + idEv });
    for (const pt of parts){ await PB.collection('participantes').delete(pt.id); }
  } catch (e){ /* coleção pode não existir em bases antigas */ }

  await PB.collection('eventos').delete(evento.id);
  return { idEvento: dados.idEvento, excluido: true };
}

// Exclui só a Produção (+ compromisso de entrega) — evento e Financeiro ficam.
async function pbExcluirProducao(dados){
  await pbAuthGarantir();
  if (!dados.idEvento) throw new Error('idEvento é obrigatório.');
  const prod = await pbAchar_('producao', 'id_evento', dados.idEvento);
  if (typeof excluirAgenda === 'function') await excluirAgenda(prod.id_calendar_entrega);
  await PB.collection('producao').delete(prod.id);
  return { idEvento: dados.idEvento, excluido: true };
}

Object.assign(window.PB_ACTIONS, {
  criarEvento: (d) => perfTime('PB criarEvento', pbCriarEvento(d)),
  atualizarEvento: (d) => perfTime('PB atualizarEvento', pbAtualizarEvento(d)),
  excluirEvento: (d) => perfTime('PB excluirEvento', pbExcluirEvento(d)),
  excluirProducao: (d) => perfTime('PB excluirProducao', pbExcluirProducao(d)),
});
