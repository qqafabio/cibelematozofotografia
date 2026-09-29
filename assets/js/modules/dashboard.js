/* ============================================================
   CRM · Cibele Matozo Fotografia — Módulo: Dashboard
   Carregado como <script> clássico (escopo global compartilhado).
   NÃO usar import/export: os handlers onclick inline e o estado
   global dependem deste escopo. Ordem de carga definida em crm.html.
   ============================================================ */

/* ============ DASHBOARD ============ */
function renderDashboard(main){
  const confirmados = eventos.filter(e => e.Status === 'Confirmado').length;
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const proximos = eventos
    .filter(e => e['Data do evento'])
    .map(e => ({ ...e, _data: parseDataBR(e['Data do evento']) }))
    .filter(e => e._data && e._data >= hoje)
    .sort((a,b) => a._data - b._data)
    .slice(0, 8);
 
  main.innerHTML = `
    <div class="view-header"><div><h1>Dashboard</h1><p>Panorama geral do negócio.</p></div></div>
    <div class="kpi-row">
      <div class="kpi-card"><div class="kpi-label">Clientes cadastrados</div><div class="kpi-value">${clientes.length}</div></div>
      <div class="kpi-card"><div class="kpi-label">Eventos no total</div><div class="kpi-value">${eventos.length}</div></div>
      <div class="kpi-card"><div class="kpi-label">Eventos confirmados</div><div class="kpi-value">${confirmados}</div></div>
      <div class="kpi-card"><div class="kpi-label">Próximos eventos</div><div class="kpi-value">${proximos.length}</div></div>
    </div>
    <div class="panel">
      <h2>Próximos eventos</h2>
      ${proximos.length ? `<table class="responsive-table">
        <thead><tr><th>Data</th><th>Cliente</th><th>Tipo</th><th>Pacote</th><th>Status</th></tr></thead>
        <tbody>${proximos.map(e => `
          <tr><td data-label="Data">${esc(e['Data do evento'])}</td><td data-label="Cliente">${esc(e['Cliente / Responsável'])}</td><td data-label="Tipo">${esc(e['Tipo de evento'])}</td><td data-label="Pacote">${esc(e['Pacote'])}</td><td data-label="Status"><span class="status-pill ${String(e.Status).toLowerCase()==='confirmado'?'confirmado':''}">${esc(e.Status)}</span></td></tr>
        `).join('')}</tbody></table>` : `<div class="empty-state">Nenhum evento futuro cadastrado ainda.</div>`}
    </div>
  `;
}
function parseDataBR(s){
  const p = String(s).split('/');
  if (p.length !== 3) return null;
  return new Date(p[2], p[1]-1, p[0]);
}
 
