/* ============================================================
   CRM · Cibele Matozo Fotografia — Módulo: Produção
   Carregado como <script> clássico (escopo global compartilhado).
   NÃO usar import/export: os handlers onclick inline e o estado
   global dependem deste escopo. Ordem de carga definida em crm.html.
   ============================================================ */

/* ============ PRODUÇÃO ============ */
const ETAPAS_PRODUCAO = ['Não iniciado','Em andamento','Concluído'];
function renderProducao(main){
  main.innerHTML = `
    <div class="view-header"><div><h1>Produção</h1><p>Uma linha por evento — criada automaticamente ao cadastrar o evento.</p></div></div>
    <div class="panel"><div id="tabelaProducao"></div></div>
  `;
  desenharTabelaProducao();
}
function desenharTabelaProducao(){
  const el = document.getElementById('tabelaProducao');
  if (!producao.length){ el.innerHTML = `<div class="empty-state">Nenhum evento com produção em aberto ainda.</div>`; return; }
  el.innerHTML = `
    <table class="responsive-table">
      <thead><tr><th>Cliente</th><th>Tipo</th><th>Data evento</th><th>Edição</th><th>Entrega</th></tr></thead>
      <tbody>${producao.map(p => `
        <tr class="clickable" data-id="${esc(p['ID Evento'])}">
          <td data-label="Cliente">${esc(p['Cliente'])}</td><td data-label="Tipo">${esc(p['Tipo de evento'])}</td><td data-label="Data evento">${esc(p['Data evento'])}</td>
          <td data-label="Edição">${esc(p['Edição foto'])}</td>
          <td data-label="Entrega"><span class="status-pill ${String(p['Entrega']).toLowerCase()==='concluído'?'confirmado':''}">${esc(p['Entrega'])}</span></td>
        </tr>`).join('')}</tbody>
    </table>`;
  el.querySelectorAll('tr.clickable').forEach(row => {
    row.addEventListener('click', () => abrirFormProducao(producao.find(p => String(p['ID Evento']) === row.dataset.id)));
  });
}
function abrirFormProducao(p){
  const campoEtapa = (label, campo) => `
    <div class="field"><label>${label}</label>
      <select id="f_${campo}">${ETAPAS_PRODUCAO.map(e=>`<option ${p[mapaCampoProducaoLabel_(campo)]===e?'selected':''}>${e}</option>`).join('')}</select>
    </div>`;
  document.getElementById('overlayRoot').innerHTML = `
    <div class="form-overlay" id="overlay">
      <div class="form-panel">
        <h2>Produção — ${esc(p['Cliente'])}</h2>
        <div class="form-err" id="producaoErr" style="display:none;"></div>
        <div class="row2">
          <div class="field"><label>Fotógrafo responsável</label><input id="f_fotoResponsavel" value="${esc(p['Foto responsável'])}"></div>
          <div class="field"><label>Cinegrafista responsável</label><input id="f_videoResponsavel" value="${esc(p['Vídeo responsável'])}"></div>
        </div>
        <div class="row2">
          ${campoEtapa('Backup','backup')}
          ${campoEtapa('Seleção','selecao')}
        </div>
        <div class="row3">
          ${campoEtapa('Edição foto','edicaoFoto')}
          ${campoEtapa('Edição vídeo','edicaoVideo')}
          ${campoEtapa('Álbum','album')}
        </div>
        <div class="row2">
          ${campoEtapa('Aprovação do cliente','aprovacao')}
          ${campoEtapa('Entrega final','entrega')}
        </div>
        <div class="row2">
          <div class="field"><label>Link das fotos/vídeos</label><input id="f_linkFotos" value="${esc(p['Link das fotos'])}"></div>
          <div class="field"><label>Data de entrega</label><input id="f_dataEntrega" placeholder="DD/MM/AAAA" value="${esc(p['Data entrega'])}"></div>
        </div>
        <div class="row2">
          <div class="field"><label>Hora de entrega</label><input id="f_horaEntrega" placeholder="HH:MM" value="${esc(p['Hora entrega'])}"></div>
          <div class="field"><label>Local de entrega</label><input id="f_localEntrega" placeholder="Ex.: online, estúdio, endereço..." value="${esc(p['Local de entrega'])}"></div>
        </div>
        <p class="section-note" style="font-size:12px;color:var(--ink-soft);margin:-6px 0 14px;">Ao preencher data, hora ou local de entrega, um compromisso é criado (ou atualizado) automaticamente na Agenda, já com o status financeiro do evento.</p>
        <div class="field"><label>Pendências</label><textarea id="f_pendencias" rows="2">${esc(p['Pendências'])}</textarea></div>
        <div class="form-actions">
          <button class="btn-ghost" id="cancelarProducao">Cancelar</button>
          <button class="btn-primary" id="salvarProducao">Salvar alterações</button>
        </div>
      </div>
    </div>`;
  document.getElementById('cancelarProducao').addEventListener('click', fecharOverlay);
  document.getElementById('salvarProducao').addEventListener('click', () => salvarProducao(p['ID Evento']));
  aplicarMascara('f_dataEntrega', maskData);
  aplicarMascara('f_horaEntrega', maskHora);
}
function mapaCampoProducaoLabel_(campo){
  const mapa = { captacao:'Captação', backup:'Backup', selecao:'Seleção', edicaoFoto:'Edição foto',
    edicaoVideo:'Edição vídeo', album:'Álbum', aprovacao:'Aprovação', entrega:'Entrega' };
  return mapa[campo] || campo;
}
async function salvarProducao(idEvento){
  const dados = {
    fotoResponsavel: document.getElementById('f_fotoResponsavel').value.trim(),
    videoResponsavel: document.getElementById('f_videoResponsavel').value.trim(),
    backup: document.getElementById('f_backup').value,
    selecao: document.getElementById('f_selecao').value,
    edicaoFoto: document.getElementById('f_edicaoFoto').value,
    edicaoVideo: document.getElementById('f_edicaoVideo').value,
    album: document.getElementById('f_album').value,
    aprovacao: document.getElementById('f_aprovacao').value,
    entrega: document.getElementById('f_entrega').value,
    linkFotos: document.getElementById('f_linkFotos').value.trim(),
    dataEntrega: document.getElementById('f_dataEntrega').value.trim(),
    horaEntrega: document.getElementById('f_horaEntrega').value.trim(),
    localEntrega: document.getElementById('f_localEntrega').value.trim(),
    pendencias: document.getElementById('f_pendencias').value.trim(),
  };
  const btn = document.getElementById('salvarProducao'); btn.disabled = true; btn.textContent = 'Salvando…';
  try{
    await apiCall('atualizarProducao', Object.assign({ idEvento }, dados));
    loaded = false; fecharOverlay(); await renderMain(); showToast('Produção atualizada.');
  } catch(err){ mostrarErro('producaoErr', err.message); btn.disabled=false; btn.textContent='Salvar alterações'; }
}
 
