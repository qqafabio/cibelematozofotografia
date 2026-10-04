/* ============================================================
   CRM · Cibele Matozo Fotografia — Leitura total do PocketBase (v3.2)
   Carregado como <script> clássico (escopo global compartilhado).
   NÃO usar import/export. Ordem em crm.html: DEPOIS de pbSchema.js,
   pbCore.js e pbClientes.js (reutiliza PB_SCHEMA, perfTime/pbAuthGarantir
   e pbCarregarClientes), e ANTES de main.js.

   Só age quando USE_POCKETBASE_LEITURA === true. Monta um payload com o
   MESMO formato que o Apps Script devolve em carregarTudo (as mesmas
   chaves rotuladas), para que api.js/aplicarListas_ e os módulos não
   percebam a diferença. Rollback = flag false.
   ============================================================ */

/* ---- Tradução genérica: registro do PB (snake_case) → objeto rotulado ---- */
function pbRecordToObj(rec, schema){
  const o = {};
  o[schema.id.label] = Number(rec[schema.id.pb]);
  for (const campo of schema.fields){
    const label = campo[0], pb = campo[1], tipo = campo[2];
    const v = rec[pb];
    if (tipo === 'number'){
      o[label] = Number(v || 0);
    } else if (tipo === 'fk'){
      // Chave estrangeira numérica: preserva '' quando vazia (ex.: evento
      // coletivo sem ID Cliente), como fazem as planilhas.
      o[label] = (v === '' || v == null || Number(v) === 0) ? '' : Number(v);
    } else {
      o[label] = (v == null ? '' : v);
    }
  }
  o.__pbId = rec.id; // id nativo do PB (para update/delete futuros)
  return o;
}

/* ---- Carrega uma coleção inteira já traduzida ---- */
async function pbCarregarColecao(schema){
  const regs = await PB.collection(schema.collection).getFullList({ sort: schema.id.pb });
  return regs.map(r => pbRecordToObj(r, schema));
}

/* ---- Listas (menus): coleção { campo, valor, ordem } → { campo: [valores] } ---- */
async function pbCarregarListas(){
  const regs = await PB.collection(PB_LISTAS.collection).getFullList({ sort: 'ordem' });
  const out = {};
  for (const r of regs){
    if (!r.campo) continue;
    (out[r.campo] = out[r.campo] || []).push(r.valor);
  }
  return out;
}

/* ---- Pós-processamento fiel ao backend ---- */

// listarFinanceiro marca como "Vencida" a parcela Pendente com vencimento no
// passado. Replicamos no cliente (sem persistir — o master é o Apps Script).
function marcarVencidasPB_(financeiro){
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  for (const p of financeiro){
    if (p['Status'] === 'Pendente'){
      const venc = (typeof parseDataBR === 'function') ? parseDataBR(p['Vencimento']) : null;
      if (venc && venc < hoje) p['Status'] = 'Vencida';
    }
  }
  return financeiro;
}

// Replica listarContasEmAtraso: parcelas vencidas, não quitadas e não "Pago",
// com diasEmAtraso, ordenadas da mais urgente para a menos. Alimenta o alerta
// inicial (alertaCobrancasVencidas) — a tela de Cobranças refaz seu próprio fetch.
function derivarContasEmAtrasoPB_(financeiro){
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  return financeiro.filter(p => {
    const status = p['Status'] || '';
    const previsto = Number(p['Valor previsto'] || 0);
    const pago = Number(p['Valor pago'] || 0);
    const venc = (typeof parseDataBR === 'function') ? parseDataBR(p['Vencimento']) : null;
    return venc && venc < hoje && pago < previsto && status !== 'Pago';
  }).map(p => {
    const venc = (typeof parseDataBR === 'function') ? parseDataBR(p['Vencimento']) : null;
    const diasEmAtraso = venc ? Math.floor((hoje - venc) / 86400000) : 0;
    return Object.assign({}, p, { diasEmAtraso });
  }).sort((a, b) => b.diasEmAtraso - a.diasEmAtraso);
}

// Replica listarFreelanceEventos: aninha os pagamentos em cada evento e calcula
// valorPago / pendente / statusPagamento (campos derivados que o módulo consome).
function montarFreelancePB_(eventosF, pagamentosF){
  for (const ev of eventosF){
    const doEvento = pagamentosF.filter(p => String(p['ID Evento']) === String(ev['ID Evento']));
    const valorPago = doEvento.reduce((s, p) => s + Number(p['Valor pago'] || 0), 0);
    const total = Number(ev['Total'] || 0);
    ev.pagamentos = doEvento;
    ev.valorPago = valorPago;
    ev.pendente = Math.max(total - valorPago, 0);
    ev.statusPagamento = valorPago <= 0 ? 'Pendente' : (valorPago >= total ? 'Pago' : 'Parcial');
  }
  return eventosF;
}

/* ---- Payload completo (mesmo formato do Apps Script carregarTudo) ---- */
async function pbCarregarTudoPB(){
  await pbAuthGarantir();
  const S = PB_SCHEMA;
  const [
    clientesR, eventosR, leadsR, financeiroR, producaoR, custosR,
    participantesR, templatesR, pacotesR, freEvR, frePgR, listasR,
  ] = await Promise.all([
    perfTime('PB clientes',      pbCarregarClientes(),                 a => a.length),
    perfTime('PB eventos',       pbCarregarColecao(S.eventos),         a => a.length),
    perfTime('PB leads',         pbCarregarColecao(S.leads),           a => a.length),
    perfTime('PB financeiro',    pbCarregarColecao(S.financeiro),      a => a.length),
    perfTime('PB producao',      pbCarregarColecao(S.producao),        a => a.length),
    perfTime('PB custos',        pbCarregarColecao(S.custos),          a => a.length),
    perfTime('PB participantes', pbCarregarColecao(S.participantes),   a => a.length),
    perfTime('PB templates',     pbCarregarColecao(S.templates),       a => a.length),
    perfTime('PB pacotes',       pbCarregarColecao(S.pacotes),         a => a.length),
    perfTime('PB freelanceEv',   pbCarregarColecao(S.freelanceEventos), a => a.length),
    perfTime('PB freelancePg',   pbCarregarColecao(S.freelancePagamentos), a => a.length),
    perfTime('PB listas',        pbCarregarListas()),
  ]);

  marcarVencidasPB_(financeiroR);
  const freelanceEventos = montarFreelancePB_(freEvR, frePgR);

  return {
    clientes: clientesR,
    eventos: eventosR,
    leads: leadsR,
    financeiro: financeiroR,
    contasEmAtraso: derivarContasEmAtrasoPB_(financeiroR),
    producao: producaoR,
    custos: custosR,
    listas: listasR,
    freelanceEventos: freelanceEventos,
    templates: templatesR,
    pacotes: pacotesR,
    participantes: participantesR,
  };
}
