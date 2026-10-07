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

  // --- Próximos eventos (individuais; coletivos têm tela própria) ---
  const proximos = eventos
    .filter(e => e['Data do evento'] && String(e['Coletivo']) !== 'Sim')
    .map(e => ({ ...e, _data: parseDataBR(e['Data do evento']) }))
    .filter(e => e._data && e._data >= hoje)
    .sort((a,b) => a._data - b._data)
    .slice(0, 8);

  // --- Financeiro: receita do mês (por Data pagamento) e saldo a receber ---
  const receita = agregarMes(financeiro, 'Data pagamento', p => p['Valor pago']);
  let previsto = 0, pago = 0, descontoTot = 0;
  (financeiro || []).forEach(p => {
    pago += Number(p['Valor pago'] || 0);
    if (String(p['Tipo cobrança']) === 'Desconto') descontoTot += Number(p['Valor previsto'] || 0);
    else previsto += Number(p['Valor previsto'] || 0);
  });
  const aReceber = Math.max(0, previsto - pago - descontoTot);
  const nAtraso = (contasEmAtraso && contasEmAtraso.length) || 0;

  // --- Tendências de volume (contam por data de cadastro; "—" até o backend
  //     carimbar as datas — ver Parte 5 do plano v3.4) ---
  const tClientes = tendenciaMes(clientes, 'Data de cadastro');
  const tEventos  = tendenciaMes(eventos.filter(e => String(e['Coletivo']) !== 'Sim'), 'Data de cadastro');
  const totalEventos = eventos.filter(e => String(e['Coletivo']) !== 'Sim').length;

  // --- Últimos clientes: por data de cadastro desc; sem data, maior ID
  //     Cliente = mais recente. Colunas reais (clientes não têm "status"). ---
  const ultimosClientes = [...(clientes || [])]
    .sort((a,b) => {
      const da = parseDataBR(a['Data de cadastro']), db = parseDataBR(b['Data de cadastro']);
      if (da && db) return db - da;
      if (da) return -1;
      if (db) return 1;
      return (Number(b['ID Cliente']) || 0) - (Number(a['ID Cliente']) || 0);
    })
    .slice(0, 6);

  // --- Séries mensais para os gráficos (últimos 12 meses) ---
  const receitaMensal = serieMensal(financeiro, 'Data pagamento', p => p['Valor pago']);
  const eventosMensal = serieMensal(eventos.filter(e => String(e['Coletivo']) !== 'Sim'), 'Data do evento');
  const custoMensal   = serieMensal(custos, 'Data', c => c['Valor']);

  main.innerHTML = `
    <div class="view-header"><div><h1>Dashboard</h1><p>Panorama geral do negócio.</p></div></div>

    <div class="row g-3 kpi-grid">
      <div class="col-6 col-lg-3">
        <div class="kpi-card">
          <div class="kpi-head"><span class="kpi-label">Clientes</span><i class="bi bi-people kpi-icon"></i></div>
          <div class="kpi-value">${clientes.length}</div>
          <div class="kpi-foot">${badgeTendencia(tClientes)}</div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="kpi-card">
          <div class="kpi-head"><span class="kpi-label">Eventos</span><i class="bi bi-calendar-event kpi-icon"></i></div>
          <div class="kpi-value">${totalEventos}</div>
          <div class="kpi-foot">${badgeTendencia(tEventos)}</div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="kpi-card">
          <div class="kpi-head"><span class="kpi-label">Receita (mês)</span><i class="bi bi-cash-coin kpi-icon"></i></div>
          <div class="kpi-value">${formatBRL(receita.atual)}</div>
          <div class="kpi-foot">${badgeTendencia(receita)}</div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="kpi-card">
          <div class="kpi-head"><span class="kpi-label">A receber</span><i class="bi bi-hourglass-split kpi-icon"></i></div>
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
          <h2>Próximos eventos</h2>
          ${proximos.length ? `<table class="responsive-table">
            <thead><tr><th>Data</th><th>Cliente</th><th>Tipo</th><th>Pacote</th><th>Status</th></tr></thead>
            <tbody>${proximos.map(e => `
              <tr>
                <td data-label="Data">${esc(e['Data do evento'])}</td>
                <td data-label="Cliente">${esc(e['Cliente / Responsável'])}</td>
                <td data-label="Tipo">${esc(e['Tipo de evento'])}</td>
                <td data-label="Pacote">${esc(e['Pacote'])}</td>
                <td data-label="Status">${statusDot(e.Status)}${esc(e.Status)}</td>
              </tr>`).join('')}</tbody></table>`
            : `<div class="empty-state">Nenhum evento futuro cadastrado ainda.</div>`}
        </div>
      </div>
      <div class="col-12 col-lg-5">
        <div class="panel">
          <h2>Últimos clientes</h2>
          ${ultimosClientes.length ? `<table class="responsive-table">
            <thead><tr><th>Nome</th><th>Cidade</th><th>Eventos</th></tr></thead>
            <tbody>${ultimosClientes.map(c => `
              <tr>
                <td data-label="Nome">${esc(c['Nome / Responsável'])}</td>
                <td data-label="Cidade">${esc(c['Cidade']) || '—'}</td>
                <td data-label="Eventos">${esc(c['Qtd. eventos'] != null ? c['Qtd. eventos'] : '0')}</td>
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

  // Gráficos: instanciados após o innerHTML (containers já no DOM).
  desenharGraficosDashboard({ receitaMensal, eventosMensal, custoMensal });
}
function parseDataBR(s){
  const p = String(s).split('/');
  if (p.length !== 3) return null;
  return new Date(p[2], p[1]-1, p[0]);
}
