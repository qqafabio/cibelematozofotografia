/* ============================================================
   CRM · Cibele Matozo Fotografia — Navegação & roteador de views
   Carregado como <script> clássico (escopo global compartilhado).
   NÃO usar import/export: os handlers onclick inline e o estado
   global dependem deste escopo. Ordem de carga definida em crm.html.
   ============================================================ */

/* Accordion da sidebar (v3.11): só um grupo expandido por vez.
   grupoAberto = índice do grupo aberto (ou null = todos fechados).
   navUltimaView detecta troca de view para abrir o grupo da rota ativa sem
   sobrescrever um toggle manual do usuário (que não muda a view). */
let grupoAberto = null;
let navUltimaView = null;

function renderNav(){
  const el = document.getElementById('navList');
  // 'eventoDetalhe' não é item de menu: destaca a seção Eventos enquanto aberto.
  const viewAtiva = currentView === 'eventoDetalhe' ? 'eventos' : currentView;
  const idxAtivo = NAV.findIndex(g => g.items.some(n => n.id === viewAtiva));
  // Ao navegar (view mudou), abre o grupo da rota ativa; toggles manuais do
  // cabeçalho não mexem na view, então são respeitados.
  if (navUltimaView !== currentView){
    navUltimaView = currentView;
    if (idxAtivo >= 0) grupoAberto = idxAtivo;
  }
  if (grupoAberto === null && navUltimaView === null) grupoAberto = idxAtivo >= 0 ? idxAtivo : 0;

  el.innerHTML = NAV.map((g, gi) => `
    <div class="nav-group ${gi===grupoAberto?'open':'collapsed'}">
      <button class="nav-group-title" type="button" data-group-toggle="${gi}">
        <span>${g.group}</span><i class="bi bi-chevron-down nav-chevron"></i>
      </button>
      <div class="nav-group-items">
        ${g.items.map(n => `
          <div class="nav-item ${n.id===viewAtiva?'active':''} ${!n.ready?'disabled':''}" data-id="${n.id}">
            <span>${n.label}</span>
            ${!n.ready ? '<span class="nav-soon">em breve</span>' : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  // Accordion: clicar no cabeçalho abre esse grupo e fecha o anterior (ou fecha
  // se já estava aberto). Não altera a navegação.
  el.querySelectorAll('[data-group-toggle]').forEach(h => h.addEventListener('click', () => {
    const gi = Number(h.dataset.groupToggle);
    grupoAberto = (grupoAberto === gi) ? null : gi;
    renderNav();
  }));

  const itens = NAV.flatMap(g => g.items);
  el.querySelectorAll('.nav-item').forEach(item => {
    const nav = itens.find(n => n.id === item.dataset.id);
    if (!nav.ready) return;
    item.addEventListener('click', () => {
      if (nav.href){ location.href = nav.href; return; } // item externo (mesma aba)
      currentView = nav.id; renderNav(); renderMain(); toggleNavMobile(true);
    });
  });
  marcarBottomNav();
}

/* Bottom-nav mobile (v3.4): marca o item ativo conforme a view atual.
   "Início" cobre o dashboard; "Mais" nunca fica ativo (é só a gaveta). */
function marcarBottomNav(){
  const mapaView = { dashboard:'dashboard', clientes:'clientes', eventos:'eventos', eventoDetalhe:'eventos' };
  document.querySelectorAll('.bottomnav-item').forEach(btn => {
    btn.classList.toggle('active', mapaView[currentView] === btn.dataset.view);
  });
}
/* Fiação dos 4 botões do bottom-nav (uma vez, no boot — ver main.js). */
function wireBottomNav(){
  document.querySelectorAll('.bottomnav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const v = btn.dataset.view;
      if (v === '__mais'){ toggleNavMobile(); return; }
      currentView = v; renderNav(); renderMain(); toggleNavMobile(true);
    });
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
  else if (currentView === 'eventoDetalhe') renderDetalheEvento(main);
  else if (currentView === 'eventosColetivos') renderEventosColetivos(main);
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
 
