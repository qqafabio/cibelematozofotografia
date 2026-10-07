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
  `;
}
function parseDataBR(s){
  const p = String(s).split('/');
  if (p.length !== 3) return null;
  return new Date(p[2], p[1]-1, p[0]);
}
