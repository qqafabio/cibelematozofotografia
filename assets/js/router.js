/* ============================================================
   CRM · Cibele Matozo Fotografia — Navegação & roteador de views
   Carregado como <script> clássico (escopo global compartilhado).
   NÃO usar import/export: os handlers onclick inline e o estado
   global dependem deste escopo. Ordem de carga definida em crm.html.
   ============================================================ */

function renderNav(){
  const el = document.getElementById('navList');
  el.innerHTML = NAV.map(n => `
    <div class="nav-item ${n.id===currentView?'active':''} ${!n.ready?'disabled':''}" data-id="${n.id}">
      <span>${n.label}</span>
      ${!n.ready ? '<span class="nav-soon">em breve</span>' : ''}
    </div>
  `).join('');
  el.querySelectorAll('.nav-item').forEach(item => {
    const nav = NAV.find(n => n.id === item.dataset.id);
    if (!nav.ready) return;
    item.addEventListener('click', () => { currentView = nav.id; renderNav(); renderMain(); toggleNavMobile(true); });
  });
}
function toggleNavMobile(forceClose){
  const sidebar = document.querySelector('.sidebar');
  const backdrop = document.getElementById('navBackdrop');
  const open = forceClose ? false : !sidebar.classList.contains('open');
  sidebar.classList.toggle('open', open);
  backdrop.classList.toggle('open', open);
}

/* ============ RENDER PRINCIPAL ============ */
async function renderMain(){
  const main = document.getElementById('mainArea');
  if (!isConfigurado()){
    main.innerHTML = `<div class="panel"><div class="loading-note" style="padding:24px;">Configure a constante <code>CRM_API_URL</code> no topo do arquivo com o link do backend do CRM (Apps Script) para começar a usar.</div></div>`;
    return;
  }
  if (!loaded){
    main.innerHTML = `<div class="loading-note">Carregando dados…</div>`;
    try { await carregarTudo(); } catch(err){ main.innerHTML = `<div class="form-err">Não foi possível carregar os dados: ${esc(err.message)}</div>`; return; }
  }
  if (currentView === 'dashboard') renderDashboard(main);
  else if (currentView === 'clientes') renderClientes(main);
  else if (currentView === 'eventos') renderEventos(main);
  else if (currentView === 'pacotes') renderPacotes(main);
  else if (currentView === 'leads') renderLeads(main);
  else if (currentView === 'financeiro') renderFinanceiro(main);
  else if (currentView === 'contasEmAtraso') renderContasEmAtraso(main);
  else if (currentView === 'dashboardCobrancas') renderDashboardCobrancas(main);
  else if (currentView === 'producao') renderProducao(main);
  else if (currentView === 'custos') renderCustos(main);
  else if (currentView === 'templates') renderTemplates(main);
  else if (currentView === 'freelance') renderFreelance(main);
}
 
