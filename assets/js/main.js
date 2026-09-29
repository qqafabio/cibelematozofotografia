/* ============================================================
   CRM · Cibele Matozo Fotografia — Inicialização (carrega por último)
   Carregado como <script> clássico (escopo global compartilhado).
   NÃO usar import/export: os handlers onclick inline e o estado
   global dependem deste escopo. Ordem de carga definida em crm.html.
   ============================================================ */

/* ============ INÍCIO ============ */
document.getElementById('navToggle').addEventListener('click', () => toggleNavMobile());
document.getElementById('navBackdrop').addEventListener('click', () => toggleNavMobile(true));
renderNav();
renderMain();
