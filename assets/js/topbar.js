/* ============================================================
   CRM · Cibele Matozo Fotografia — Topbar: sino de notificações + busca global (v3.4)
   Carregado como <script> clássico (escopo global compartilhado).
   NÃO usar import/export: estado e handlers globais dependem deste escopo.
   Ordem de carga: logo antes de main.js (ver crm.html).
   ============================================================ */

/* ---- Sino de notificações ----
   Reusa a mesma modal-lembrete de contas em atraso que abre no startup
   (alertaCobrancasVencidas, em modules/cobrancas.js). O sino é o acesso
   manual a ela. Sem contas vencidas, mostra um estado vazio amigável. */
function abrirNotificacoes(){
  if (contasEmAtraso && contasEmAtraso.length){ alertaCobrancasVencidas(); return; }
  const root = document.getElementById('overlayRoot');
  root.innerHTML = `
    <div class="form-overlay" id="overlay">
      <div class="form-panel" style="max-width:420px;">
        <h2>🔔 Notificações</h2>
        <div class="empty-state" style="padding:28px 10px;">Nenhuma conta em atraso. 🎉</div>
        <div class="form-actions">
          <button class="btn-primary" onclick="fecharOverlay();">Fechar</button>
        </div>
      </div>
    </div>`;
}

/* Atualiza o selo numérico do sino (desktop + mobile) com a contagem de
   contas em atraso. Chamado após carregarTudo e ao navegar entre telas. */
function atualizarBadgeSino(){
  const n = (contasEmAtraso && contasEmAtraso.length) || 0;
  ['bellBadge', 'bellBadgeMobile'].forEach(id => {
    const b = document.getElementById(id);
    if (!b) return;
    if (n > 0){ b.textContent = n > 99 ? '99+' : String(n); b.hidden = false; }
    else { b.hidden = true; }
  });
}

/* ---- Busca global ----
   Paleta client-side simples: casa por nome em clientes/eventos/leads e abre
   o registro. Sem bibliotecas; roda só no desktop (a .app-topbar some no mobile). */
function buscaGlobal(termo){
  const box = document.getElementById('searchResults');
  if (!box) return;
  const q = String(termo || '').trim().toLowerCase();
  if (q.length < 2){ box.hidden = true; box.innerHTML = ''; return; }

  const norm = s => String(s == null ? '' : s).toLowerCase();
  const res = [];
  (clientes || []).forEach(c => {
    if (norm(c['Nome / Responsável']).includes(q))
      res.push({ tipo:'Cliente', icone:'bi-person', rotulo:c['Nome / Responsável'],
                 abrir:() => { irParaView('clientes'); abrirFormCliente(c); } });
  });
  (eventos || []).forEach(e => {
    if (String(e['Coletivo']) === 'Sim') return;
    if (norm(`${e['Cliente / Responsável']} ${e['Tipo de evento']}`).includes(q))
      res.push({ tipo:'Evento', icone:'bi-calendar-event',
                 rotulo:`${e['Cliente / Responsável']} · ${e['Tipo de evento'] || ''}`.replace(/ · $/, ''),
                 abrir:() => { irParaView('eventos'); abrirFormEvento(e); } });
  });
  (leads || []).forEach(l => {
    if (norm(l['Cliente']).includes(q))
      res.push({ tipo:'Lead', icone:'bi-stars',
                 rotulo:`${l['Cliente']} · ${l['Tipo de evento'] || ''}`.replace(/ · $/, ''),
                 abrir:() => { irParaView('leads'); abrirFormLead(l); } });
  });

  const top = res.slice(0, 8);
  if (!top.length){
    box.innerHTML = `<div class="search-empty">Nada encontrado para "${esc(termo)}".</div>`;
    box.hidden = false; return;
  }
  box.innerHTML = top.map((r, i) => `
    <div class="search-result" data-i="${i}">
      <i class="bi ${r.icone}"></i><span>${esc(r.rotulo)}</span><span class="sr-tipo">${r.tipo}</span>
    </div>`).join('');
  box.querySelectorAll('.search-result').forEach(el => {
    el.addEventListener('click', () => { const r = top[Number(el.dataset.i)]; limparBusca(); r.abrir(); });
  });
  box.hidden = false;
}

function irParaView(view){ currentView = view; renderNav(); renderMain(); atualizarBadgeSino(); }
function limparBusca(){
  const inp = document.getElementById('globalSearch');
  const box = document.getElementById('searchResults');
  if (inp) inp.value = '';
  if (box){ box.hidden = true; box.innerHTML = ''; }
}

/* ---- Fiação (uma vez; os elementos são estáticos no crm.html) ---- */
(function wireTopbar(){
  const bellDesktop = document.getElementById('btnNotificacoes');
  const bellMobile = document.getElementById('btnNotificacoesMobile');
  if (bellDesktop) bellDesktop.addEventListener('click', abrirNotificacoes);
  if (bellMobile) bellMobile.addEventListener('click', abrirNotificacoes);

  const inp = document.getElementById('globalSearch');
  if (inp){
    inp.addEventListener('input', () => buscaGlobal(inp.value));
    inp.addEventListener('keydown', e => { if (e.key === 'Escape') limparBusca(); });
  }
  // Fecha o dropdown ao clicar fora da caixa de busca.
  document.addEventListener('click', e => {
    const search = document.querySelector('.app-search');
    if (search && !search.contains(e.target)){
      const box = document.getElementById('searchResults');
      if (box) box.hidden = true;
    }
  });
})();
