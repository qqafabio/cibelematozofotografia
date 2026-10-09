/* ============================================================
   CRM · Cibele Matozo Fotografia — Orquestração da Agenda (v3.3)
   <script> clássico. Depende de pbCore.js (PB) e config.js (CRM_API_URL).

   Com o PocketBase virando master de ESCRITA, o Apps Script encolhe para
   SÓ a Google Agenda (ações finas agendaSincronizarEvento / ...Entrega /
   agendaExcluir no backend). Estes helpers são chamados pelos adapters de
   escrita DEPOIS de gravar no PB: chamam o GAS fino e gravam de volta o
   id_calendar / id_calendar_entrega no record. Tudo fail-soft — se a Agenda
   falhar, a escrita no PB não cai (espelha o try/catch de atualizarEvento/
   atualizarProducao no backend).

   NÃO entram em PB_ACTIONS: não são ações de apiCall, e sim utilitários que
   outros adapters (produção, e na Fase 3 eventos) invocam.
   ============================================================ */

// Chama uma ação FINA de Agenda no Apps Script — sempre direto (nunca via PB).
async function chamarAgendaGAS_(action, dados){
  const res = await fetch(CRM_API_URL, { method: 'POST', body: JSON.stringify({ action, dados: dados || {} }) });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Erro na Agenda');
  return json.dados;
}

// Texto de pagamento da entrega, calculado a partir do estado em memória (que
// na v3.2 já vem do PocketBase). Espelha calcularStatusFinanceiro_ +
// formatarMoeda_ do backend — assim o GAS fino não precisa ler o Financeiro.
function fmtMoedaAgenda_(n){ return 'R$ ' + Number(n || 0).toFixed(2).replace('.', ','); }
function statusEntregaTexto_(idEvento){
  const evs = (typeof eventos !== 'undefined' ? eventos : []);
  const fin = (typeof financeiro !== 'undefined' ? financeiro : []);
  const ev = evs.find(e => Number(e['ID Evento']) === Number(idEvento));
  const valorFinal = Number(ev && ev['Valor final'] || 0);
  const valorPago = fin
    .filter(p => Number(p['ID Evento']) === Number(idEvento))
    .reduce((s, p) => s + Number(p['Valor pago'] || 0), 0);
  const valorPendente = Math.max(valorFinal - valorPago, 0);
  return valorPendente <= 0
    ? `Pagamento: quitado (${fmtMoedaAgenda_(valorFinal)})`
    : `Pagamento: ${fmtMoedaAgenda_(valorPago)} pago · ${fmtMoedaAgenda_(valorPendente)} pendente`;
}

// Sincroniza o compromisso do EVENTO na Agenda e grava id_calendar de volta no
// PB. `recEvento` é o record snake da coleção 'eventos' (saída do create/update).
async function sincronizarAgendaEvento(recEvento){
  try {
    if (!recEvento || !recEvento.data_evento) return '';   // sem data → backend não agenda
    const r = await chamarAgendaGAS_('agendaSincronizarEvento', {
      idCalendar: recEvento.id_calendar || '',
      cliente: recEvento.cliente_responsavel || '',
      tipoEvento: recEvento.tipo_evento || '',
      pacote: recEvento.pacote || '',
      valorFinal: recEvento.valor_final || 0,
      whatsapp: recEvento.whatsapp || '',
      observacoes: recEvento.observacoes || '',
      local: recEvento.local || '',
      dataEvento: recEvento.data_evento || '',
      horaInicio: recEvento.hora_inicio || '',
      horaFim: recEvento.hora_fim || '',
    });
    const idCal = r && r.idCalendar;
    if (idCal && idCal !== recEvento.id_calendar){
      await PB.collection('eventos').update(recEvento.id, { id_calendar: idCal });
    }
    return idCal || '';
  } catch (e){
    console.error('Agenda (evento) falhou — segue sem bloquear: ' + e);
    return '';
  }
}

// Sincroniza o compromisso de ENTREGA na Agenda e grava id_calendar_entrega de
// volta no PB. `recProducao` é o record snake da coleção 'producao'.
async function sincronizarAgendaEntrega(recProducao){
  try {
    if (!recProducao || !recProducao.data_entrega) return '';   // backend só agenda com Data entrega
    const r = await chamarAgendaGAS_('agendaSincronizarEntrega', {
      idCalendarEntrega: recProducao.id_calendar_entrega || '',
      cliente: recProducao.cliente || '',
      tipoEvento: recProducao.tipo_evento || '',
      localEntrega: recProducao.local_de_entrega || '',
      dataEntrega: recProducao.data_entrega || '',
      horaEntrega: recProducao.hora_entrega || '',
      statusTexto: statusEntregaTexto_(recProducao.id_evento),
    });
    const idCal = r && r.idCalendar;
    if (idCal && idCal !== recProducao.id_calendar_entrega){
      await PB.collection('producao').update(recProducao.id, { id_calendar_entrega: idCal });
    }
    return idCal || '';
  } catch (e){
    console.error('Agenda (entrega) falhou — segue sem bloquear: ' + e);
    return '';
  }
}

// Remove um compromisso da Agenda (evento ou entrega). Tolerante: id vazio é no-op.
async function excluirAgenda(idCalendar){
  if (!idCalendar) return;
  try { await chamarAgendaGAS_('agendaExcluir', { idCalendar }); }
  catch (e){ console.error('Agenda (excluir) falhou — segue sem bloquear: ' + e); }
}
