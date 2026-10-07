/* ============================================================
   CRM · Cibele Matozo Fotografia — Módulo: Dashboard (v3.4)
   Carregado como <script> clássico (escopo global compartilhado).
   NÃO usar import/export: os handlers onclick inline e o estado
   global dependem deste escopo. Ordem de carga definida em crm.html.
   ============================================================ */

/* ============ Helpers de tendência (mês a mês) ============
   agregarMes soma (ou conta) itens cujo campoData cai no mês atual × mês
   anterior. valorFn opcional: ausente → contagem (1 por item); presente →
   soma de um valor numérico. pct fica null quando não há base no mês
   anterior — o card mostra "—" em vez de inventar um percentual. */
function agregarMes(itens, campoData, valorFn){
  const hoje = new Date();
  const mAtual = hoje.getFullYear() * 12 + hoje.getMonth();
  let atual = 0, anterior = 0;
  (itens || []).forEach(it => {
    const d = parseDataBR(it[campoData]);
    if (!d) return;
    const m = d.getFullYear() * 12 + d.getMonth();
    const v = valorFn ? Number(valorFn(it)) || 0 : 1;
    if (m === mAtual) atual += v;
    else if (m === mAtual - 1) anterior += v;
  });
  const pct = anterior > 0 ? Math.round((atual - anterior) / anterior * 100) : null;
  return { atual, anterior, pct };
}
function tendenciaMes(itens, campoData){ return agregarMes(itens, campoData); }

/* Série dos últimos nMeses meses (terminando no mês atual) para os gráficos.
   Mesma chave de bucketing de agregarMes (ano*12+mês), mas devolve um array
   por mês — com zeros onde não há dado, para o gráfico sempre ter eixo.
   valorFn ausente → contagem; presente → soma. Rótulos curtos pt-BR (out/25). */
const MESES_CURTOS = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
function serieMensal(itens, campoData, valorFn, nMeses){
  nMeses = nMeses || 12;
  const hoje = new Date();
  const base = (hoje.getFullYear() * 12 + hoje.getMonth()) - (nMeses - 1);
  const labels = [], valores = [];
  for (let i = 0; i < nMeses; i++){
    const key = base + i;
    labels.push(MESES_CURTOS[((key % 12) + 12) % 12] + '/' + String(Math.floor(key / 12)).slice(-2));
    valores.push(0);
  }
  (itens || []).forEach(it => {
    const d = parseDataBR(it[campoData]);
    if (!d) return;
    const idx = (d.getFullYear() * 12 + d.getMonth()) - base;
    if (idx < 0 || idx >= nMeses) return;
    valores[idx] += valorFn ? (Number(valorFn(it)) || 0) : 1;
  });
  return { labels, valores };
}

/* Linha de tendência de um KPI. Nunca mostra número falso: sem base no mês
   anterior → "— vs. mês anterior" (neutro). */
function badgeTendencia(info){
  if (!info || info.pct == null)
    return `<span class="kpi-trend neutro">— <span class="kpi-trend-sub">vs. mês anterior</span></span>`;
  const up = info.pct >= 0;
  return `<span class="kpi-trend ${up ? 'up' : 'down'}">${up ? '↑' : '↓'} ${Math.abs(info.pct)}% <span class="kpi-trend-sub">vs. mês anterior</span></span>`;
}

/* Bolinha de status para a lista de próximos eventos. */
function statusDot(status){
  const s = String(status || '').toLowerCase();
  const cls = s === 'confirmado' ? 'ok' : (s === 'cancelado' ? 'off' : 'pend');
  return `<span class="status-dot ${cls}" title="${esc(status || '')}"></span>`;
}

/* ============ Período do Dashboard (v3.8) ============
   Presets no topo direito. 'ano' = de janeiro ao mês atual; 'mes' = mês corrente.
   As funções traduzem o preset em nº de meses (janela dos gráficos) e em data de
   início (recorte dos KPIs e da lista de últimos clientes). Estado global de módulo. */
let dashPeriodo = '12';
const DASH_PERIODOS = [
  { v:'mes', label:'Este mês' },
  { v:'3',   label:'Últimos 3 meses' },
  { v:'6',   label:'Últimos 6 meses' },
  { v:'12',  label:'Últimos 12 meses' },
  { v:'ano', label:'Este ano' },
];
function opcoesPeriodo(){
  return DASH_PERIODOS.map(p => `<option value="${p.v}" ${p.v === dashPeriodo ? 'selected' : ''}>${p.label}</option>`).join('');
}
function periodoMeses(){
  if (dashPeriodo === 'ano') return new Date().getMonth() + 1;
  if (dashPeriodo === 'mes') return 1;
  return Number(dashPeriodo) || 12;
}
function periodoInicio(){
  const h = new Date(); h.setHours(0,0,0,0);
  if (dashPeriodo === 'ano') return new Date(h.getFullYear(), 0, 1);
  const n = periodoMeses();
  return new Date(h.getFullYear(), h.getMonth() - (n - 1), 1);
}
// Conta/soma itens no período; devolve também quantos têm data, p/ fallback
// quando o backend ainda não carimbou as datas (ver comentário dos KPIs).
function contarNoPeriodo(itens, campoData, inicio){
  let comData = 0, noPeriodo = 0;
  (itens || []).forEach(it => { const d = parseDataBR(it[campoData]); if (d){ comData++; if (d >= inicio) noPeriodo++; } });
  return { comData, noPeriodo };
}
function somarNoPeriodo(itens, campoData, valorFn, inicio){
  let total = 0, comData = 0;
  (itens || []).forEach(it => { const d = parseDataBR(it[campoData]); if (d){ comData++; if (d >= inicio) total += Number(valorFn(it)) || 0; } });
  return { total, comData };
}

/* ============ Status em pílula — Dashboard/Clientes (v3.8) ============
   Reaproveitadas pelas telas de Clientes (Fase 2) e Eventos (Fase 3), pois o
   escopo de <script> é global. Mapeiam o texto do status para as classes de
   .status-pill já existentes no crm.css. */
function pillStatusEvento(status){
  const s = String(status || '').toLowerCase();
  let cls = '';
  if (s === 'confirmado') cls = 'confirmado';
  else if (s === 'cancelado') cls = 'vencida';
  else if (s === 'pendente' || s === 'a confirmar' || s === 'orçamento') cls = 'info';
  // "Em andamento" e demais → pílula âmbar (base).
  return `<span class="status-pill ${cls}">${esc(status || '—')}</span>`;
}
// Status derivado do cliente: tem evento vinculado → "Ativo"; senão → "Lead".
function statusCliente(cli){
  const id = cli['ID Cliente'], nome = cli['Nome / Responsável'];
  const temEvento = (eventos || []).some(e =>
    (id != null && id !== '' && String(e['ID Cliente']) === String(id)) ||
    (nome && e['Cliente / Responsável'] === nome));
  return temEvento ? 'Ativo' : 'Lead';
}
function pillStatusCliente(cli){
  const st = statusCliente(cli);
  return `<span class="status-pill ${st === 'Ativo' ? 'confirmado' : 'lead'}">${st}</span>`;
}
// Tipo do evento mais recente do cliente (coluna "Evento" em Últimos clientes).
function eventoRecenteDoCliente(cli){
  const id = cli['ID Cliente'], nome = cli['Nome / Responsável'];
  const evs = (eventos || []).filter(e =>
    (id != null && id !== '' && String(e['ID Cliente']) === String(id)) ||
    (nome && e['Cliente / Responsável'] === nome));
  if (!evs.length) return '';
  evs.sort((a,b) => {
    const da = parseDataBR(a['Data do evento']), db = parseDataBR(b['Data do evento']);
    return (db ? db.getTime() : 0) - (da ? da.getTime() : 0);
  });
  return evs[0]['Tipo de evento'] || '';
}

/* ============ Gráficos do Dashboard (v3.7 · ApexCharts) ============
   renderDashboard reconstrói todo o innerHTML a cada visita e NÃO faz wiring
   pós-render; por isso os gráficos são instanciados aqui, depois que os
   containers já estão no DOM. Guardamos as instâncias para destruí-las antes
   de recriar (evita vazar gráficos ao voltar para a rota). */
let dashCharts = [];
function desenharGraficosDashboard(dados){
  const ids = ['grafReceitaMes', 'grafEventosMes', 'grafReceitaCusto'];
  dashCharts.forEach(c => { try { c.destroy(); } catch(e){} });
  dashCharts = [];
  // CDN fora do ar: não quebra o resto do Dashboard, só avisa no lugar do gráfico.
  if (typeof ApexCharts === 'undefined'){
    ids.forEach(id => { const el = document.getElementById(id); if (el) el.innerHTML = '<div class="empty-state">Não foi possível carregar os gráficos.</div>'; });
    return;
  }
  const GOLD = '#A8791E', INK = '#221F1C', INK_SOFT = '#6B6459', RULE = '#DCD4C4', RULE_SOFT = '#EBE4D6', ERROR = '#B23B2E';
  const brlCompacto = v => {
    v = Number(v) || 0;
    return Math.abs(v) >= 1000
      ? 'R$ ' + (v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + 'k'
      : 'R$ ' + v.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
  };
  // Base temática compartilhada (paleta da marca, Work Sans, sem toolbar).
  const base = (categorias) => ({
    chart: { fontFamily: "'Work Sans',sans-serif", height: 260, toolbar: { show: false }, parentHeightOffset: 0, animations: { enabled: true } },
    dataLabels: { enabled: false },
    grid: { borderColor: RULE_SOFT, strokeDashArray: 3 },
    xaxis: {
      categories: categorias,
      labels: { style: { colors: INK_SOFT, fontSize: '11px', fontFamily: "'Work Sans',sans-serif" } },
      axisBorder: { color: RULE }, axisTicks: { color: RULE },
    },
    legend: { fontFamily: "'Work Sans',sans-serif", labels: { colors: INK } },
  });

  const grafs = [
    // 1) Receita por mês — área dourada, dinheiro em formatBRL.
    Object.assign(base(dados.receitaMensal.labels), {
      series: [{ name: 'Receita', data: dados.receitaMensal.valores }],
      chart: Object.assign(base().chart, { id: 'grafReceitaMes', type: 'area' }),
      colors: [GOLD], stroke: { curve: 'smooth', width: 2 },
      fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05 } },
      yaxis: { labels: { style: { colors: INK_SOFT }, formatter: brlCompacto } },
      tooltip: { y: { formatter: v => formatBRL(v) } },
    }),
    // 2) Eventos por mês — colunas (contagem inteira).
    Object.assign(base(dados.eventosMensal.labels), {
      series: [{ name: 'Eventos', data: dados.eventosMensal.valores }],
      chart: Object.assign(base().chart, { id: 'grafEventosMes', type: 'bar' }),
      colors: [INK], plotOptions: { bar: { borderRadius: 3, columnWidth: '55%' } },
      yaxis: { labels: { style: { colors: INK_SOFT }, formatter: v => String(Math.round(v)) } },
      tooltip: { y: { formatter: v => Math.round(v) + (Math.round(v) === 1 ? ' evento' : ' eventos') } },
    }),
    // 3) Receita × Custo por mês — colunas agrupadas (ouro × vermelho).
    Object.assign(base(dados.receitaMensal.labels), {
      series: [{ name: 'Receita', data: dados.receitaMensal.valores }, { name: 'Custo', data: dados.custoMensal.valores }],
      chart: Object.assign(base().chart, { id: 'grafReceitaCusto', type: 'bar' }),
      colors: [GOLD, ERROR], plotOptions: { bar: { borderRadius: 3, columnWidth: '60%' } },
      yaxis: { labels: { style: { colors: INK_SOFT }, formatter: brlCompacto } },
      tooltip: { y: { formatter: v => formatBRL(v) } },
    }),
  ];

  ids.forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    const chart = new ApexCharts(el, grafs[i]);
    chart.render();
    dashCharts.push(chart);
  });
}

/* ============ DASHBOARD ============ */
function renderDashboard(main){
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const inicio = periodoInicio();
  const nMeses = periodoMeses();

  // --- Próximos eventos (sempre prospectivo; coletivos têm tela própria) ---
  const proximos = eventos
    .filter(e => e['Data do evento'] && String(e['Coletivo']) !== 'Sim')
    .map(e => ({ ...e, _data: parseDataBR(e['Data do evento']) }))
    .filter(e => e._data && e._data >= hoje)
    .sort((a,b) => a._data - b._data)
    .slice(0, 8);

  // --- KPIs no período selecionado ---
  // Clientes/Eventos contam no período; com fallback para o total quando o
  // backend ainda não carimbou as datas (senão o card mostraria 0). Receita
  // soma o período. "A receber" é saldo pendente global (não depende do período).
  const evNaoColetivos = eventos.filter(e => String(e['Coletivo']) !== 'Sim');
  const cCli = contarNoPeriodo(clientes, 'Data de cadastro', inicio);
  const nClientes = cCli.comData ? cCli.noPeriodo : clientes.length;
  const cEv = contarNoPeriodo(evNaoColetivos, 'Data do evento', inicio);
  const totalEventos = cEv.comData ? cEv.noPeriodo : evNaoColetivos.length;
  const receitaPeriodo = somarNoPeriodo(financeiro, 'Data pagamento', p => p['Valor pago'], inicio);

  let previsto = 0, pago = 0, descontoTot = 0;
  (financeiro || []).forEach(p => {
    pago += Number(p['Valor pago'] || 0);
    if (String(p['Tipo cobrança']) === 'Desconto') descontoTot += Number(p['Valor previsto'] || 0);
    else previsto += Number(p['Valor previsto'] || 0);
  });
  const aReceber = Math.max(0, previsto - pago - descontoTot);
  const nAtraso = (contasEmAtraso && contasEmAtraso.length) || 0;

  // --- Tendências mês-a-mês (contexto secundário; independem do período) ---
  const tClientes = tendenciaMes(clientes, 'Data de cadastro');
  const tEventos  = tendenciaMes(evNaoColetivos, 'Data de cadastro');
  const receitaMes = agregarMes(financeiro, 'Data pagamento', p => p['Valor pago']);

  // --- Últimos clientes: recorte do período (fallback = todos), recentes 1º ---
  const clientesBase = cCli.comData
    ? clientes.filter(c => { const d = parseDataBR(c['Data de cadastro']); return d && d >= inicio; })
    : [...(clientes || [])];
  const ultimosClientes = clientesBase
    .sort((a,b) => {
      const da = parseDataBR(a['Data de cadastro']), db = parseDataBR(b['Data de cadastro']);
      if (da && db) return db - da;
      if (da) return -1;
      if (db) return 1;
      return (Number(b['ID Cliente']) || 0) - (Number(a['ID Cliente']) || 0);
    })
    .slice(0, 6);

  // --- Séries mensais para os gráficos (janela do período selecionado) ---
  const receitaMensal = serieMensal(financeiro, 'Data pagamento', p => p['Valor pago'], nMeses);
  const eventosMensal = serieMensal(evNaoColetivos, 'Data do evento', null, nMeses);
  const custoMensal   = serieMensal(custos, 'Data', c => c['Valor'], nMeses);

  main.innerHTML = `
    <div class="view-header">
      <div><h1>Dashboard</h1><p>Panorama geral do negócio.</p></div>
      <select class="list-filter" id="dashPeriodo" aria-label="Período">${opcoesPeriodo()}</select>
    </div>

    <div class="row g-3 kpi-grid">
      <div class="col-6 col-lg-3">
        <div class="kpi-card">
          <div class="kpi-head"><span class="kpi-label">Clientes</span><span class="kpi-icon-badge azul"><i class="bi bi-people"></i></span></div>
          <div class="kpi-value">${nClientes}</div>
          <div class="kpi-foot">${badgeTendencia(tClientes)}</div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="kpi-card">
          <div class="kpi-head"><span class="kpi-label">Eventos</span><span class="kpi-icon-badge roxo"><i class="bi bi-calendar-event"></i></span></div>
          <div class="kpi-value">${totalEventos}</div>
          <div class="kpi-foot">${badgeTendencia(tEventos)}</div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="kpi-card">
          <div class="kpi-head"><span class="kpi-label">Receita (período)</span><span class="kpi-icon-badge verde"><i class="bi bi-cash-coin"></i></span></div>
          <div class="kpi-value">${formatBRL(receitaPeriodo.total)}</div>
          <div class="kpi-foot">${badgeTendencia(receitaMes)}</div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="kpi-card">
          <div class="kpi-head"><span class="kpi-label">A receber</span><span class="kpi-icon-badge rosa"><i class="bi bi-wallet2"></i></span></div>
          <div class="kpi-value">${formatBRL(aReceber)}</div>
          <div class="kpi-foot">${nAtraso > 0
            ? `<span class="kpi-trend down">${nAtraso} em atraso</span>`
            : `<span class="kpi-trend neutro">em dia 🎉</span>`}</div>
        </div>
      </div>
    </div>

    <div class="row g-3 dash-cols">
      <div class="col-12 col-lg-7">
        <div class="panel">
          <div class="panel-head">
            <h2><i class="bi bi-calendar-event"></i>Próximos eventos</h2>
            <button class="panel-link" data-goto="eventos">Ver todos <i class="bi bi-arrow-right"></i></button>
          </div>
          ${proximos.length ? `<table class="responsive-table">
            <thead><tr><th>Data</th><th>Cliente</th><th>Evento</th><th>Status</th></tr></thead>
            <tbody>${proximos.map(e => `
              <tr>
                <td data-label="Data">${esc(e['Data do evento'])}</td>
                <td data-label="Cliente">${esc(e['Cliente / Responsável'])}</td>
                <td data-label="Evento">${esc(e['Tipo de evento'])}</td>
                <td data-label="Status">${pillStatusEvento(e.Status)}</td>
              </tr>`).join('')}</tbody></table>`
            : `<div class="empty-state">Nenhum evento futuro cadastrado ainda.</div>`}
        </div>
      </div>
      <div class="col-12 col-lg-5">
        <div class="panel">
          <div class="panel-head">
            <h2><i class="bi bi-people"></i>Últimos clientes</h2>
            <button class="panel-link" data-goto="clientes">Ver todos <i class="bi bi-arrow-right"></i></button>
          </div>
          ${ultimosClientes.length ? `<table class="responsive-table">
            <thead><tr><th>Nome</th><th>Evento</th><th>Contato</th><th>Status</th></tr></thead>
            <tbody>${ultimosClientes.map(c => `
              <tr>
                <td data-label="Nome">${esc(c['Nome / Responsável'])}</td>
                <td data-label="Evento">${esc(eventoRecenteDoCliente(c)) || '—'}</td>
                <td data-label="Contato">${c['WhatsApp'] ? `<span class="tel-cell">${esc(c['WhatsApp'])}${iconeWhatsapp(c['WhatsApp'])}</span>` : '—'}</td>
                <td data-label="Status">${pillStatusCliente(c)}</td>
              </tr>`).join('')}</tbody></table>`
            : `<div class="empty-state">Nenhum cliente cadastrado ainda.</div>`}
        </div>
      </div>
    </div>

    <div class="row g-3 chart-row">
      <div class="col-12 col-lg-6">
        <div class="panel chart-panel">
          <h2>Receita por mês</h2>
          <div class="chart-box" id="grafReceitaMes"></div>
        </div>
      </div>
      <div class="col-12 col-lg-6">
        <div class="panel chart-panel">
          <h2>Eventos por mês</h2>
          <div class="chart-box" id="grafEventosMes"></div>
        </div>
      </div>
      <div class="col-12">
        <div class="panel chart-panel">
          <h2>Receita × Custo por mês</h2>
          <div class="chart-box" id="grafReceitaCusto"></div>
        </div>
      </div>
    </div>
  `;

  // Wiring pós-render (v3.8): filtro de período + navegação "Ver todos".
  const selP = document.getElementById('dashPeriodo');
  if (selP) selP.addEventListener('change', e => { dashPeriodo = e.target.value; renderDashboard(document.getElementById('mainArea')); });
  main.querySelectorAll('[data-goto]').forEach(a => a.addEventListener('click', () => {
    currentView = a.dataset.goto; renderNav(); renderMain();
  }));

  // Gráficos: instanciados após o innerHTML (containers já no DOM).
  desenharGraficosDashboard({ receitaMensal, eventosMensal, custoMensal });
}
function parseDataBR(s){
  const p = String(s).split('/');
  if (p.length !== 3) return null;
  return new Date(p[2], p[1]-1, p[0]);
}
