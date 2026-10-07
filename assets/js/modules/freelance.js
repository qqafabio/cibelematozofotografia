/* ============================================================
   CRM · Cibele Matozo Fotografia — Módulo: Freelance
   Carregado como <script> clássico (escopo global compartilhado).
   NÃO usar import/export: os handlers onclick inline e o estado
   global dependem deste escopo. Ordem de carga definida em crm.html.
   ============================================================ */

/* ============ FREELANCE ============ */
let freelanceOrdemData = 'desc';
const SERVICO_ICONES = {
  'Fotografia': '📷', 'Edição de foto': '🖼️', 'Foto e edição': '📷🖼️',
  'Filmagem': '🎥', 'Edição de vídeo': '🎬', 'Filmagem e edição': '🎥🎬',
  'Storymaker': '📱',
};
const SERVICOS_EDICAO_PURA = ['Edição de foto', 'Edição de vídeo'];
function badgeServico(servico){
  const icone = SERVICO_ICONES[servico] || '📌';
  const classe = SERVICOS_EDICAO_PURA.includes(servico) ? 'info' : '';
  return `<span class="status-pill ${classe}">${icone} ${esc(servico || '—')}</span>`;
}

function renderFreelance(main){
  const totalGeral = freelanceEventos.reduce((s,e) => s + (e.valorPago||0), 0);
  const totalPendente = freelanceEventos.reduce((s,e) => s + (e.pendente||0), 0);
  main.innerHTML = `
    <div class="view-header">
      <div><h1>Freelance</h1><p>Trabalhos para a Matozo Foto e Vídeo — ${freelanceEventos.length} eventos.</p></div>
      <button class="btn-primary" id="novoFreelanceBtn">+ Novo freelance</button>
    </div>
    <div class="kpi-row">
      <div class="kpi-card"><div class="kpi-label">Total recebido (todo o período)</div><div class="kpi-value">${formatBRL(totalGeral)}</div></div>
      <div class="kpi-card"><div class="kpi-label">Total pendente</div><div class="kpi-value">${formatBRL(totalPendente)}</div></div>
      <div class="kpi-card"><div class="kpi-label">Recebido no período filtrado</div><div class="kpi-value" id="freelanceRecebidoFiltro">—</div></div>
    </div>
    <div class="panel spaced" style="padding:16px 18px;">
      <div class="row2">
        <div class="field tight"><label>De</label><input id="freelanceDe" placeholder="DD/MM/AAAA"></div>
        <div class="field tight"><label>Até</label><input id="freelanceAte" placeholder="DD/MM/AAAA"></div>
      </div>
    </div>
    <div class="panel"><div id="tabelaFreelance"></div></div>
  `;
  document.getElementById('novoFreelanceBtn').addEventListener('click', () => abrirFormFreelance(null));
  document.getElementById('freelanceDe').addEventListener('input', e => { e.target.value = maskData(e.target.value); atualizarRecebidoFiltro(); });
  document.getElementById('freelanceAte').addEventListener('input', e => { e.target.value = maskData(e.target.value); atualizarRecebidoFiltro(); });
  desenharTabelaFreelance();
  atualizarRecebidoFiltro();
}
function atualizarRecebidoFiltro(){
  const de = parseDataBR(document.getElementById('freelanceDe').value);
  const ate = parseDataBR(document.getElementById('freelanceAte').value);
  let total = 0;
  freelanceEventos.forEach(ev => {
    (ev.pagamentos||[]).forEach(p => {
      const d = parseDataBR(p['Data do pagamento']);
      if (!d) return;
      if (de && d < de) return;
      if (ate && d > ate) return;
      total += Number(p['Valor pago']||0);
    });
  });
  document.getElementById('freelanceRecebidoFiltro').textContent = (de||ate) ? formatBRL(total) : '—';
}
function desenharTabelaFreelance(){
  const el = document.getElementById('tabelaFreelance');
  if (!freelanceEventos.length){ el.innerHTML = `<div class="empty-state">Nenhum freelance cadastrado ainda.</div>`; return; }
  const comData = freelanceEventos.map(ev => Object.assign({ _data: parseDataBR(ev['Data']) }, ev));
  const ordenados = comData.sort((a,b) => {
    const da = a._data ? a._data.getTime() : -Infinity;
    const db = b._data ? b._data.getTime() : -Infinity;
    return freelanceOrdemData === 'desc' ? db - da : da - db;
  });
  const seta = freelanceOrdemData === 'desc' ? '↓' : '↑';
  el.innerHTML = `
    <table class="responsive-table">
      <thead><tr><th id="thDataFreelance" class="th-sort">Data ${seta}</th><th>Nome do evento</th><th>Fotografia</th><th>Total</th><th>Trabalho</th><th>Pagamento</th><th>Pendente</th></tr></thead>
      <tbody>${ordenados.map(ev => `
        <tr class="clickable" data-id="${esc(ev['ID Evento'])}">
          <td data-label="Data">${esc(ev['Data'])}</td><td data-label="Nome do evento">${esc(ev['Nome do evento'])}</td>
          <td data-label="Fotografia">${badgeServico(ev['Serviço'])}</td>
          <td data-label="Total">${formatBRL(ev['Total'])}</td>
          <td data-label="Trabalho"><span class="status-pill ${ev['Status do trabalho']==='Concluído'?'confirmado':''}">${esc(ev['Status do trabalho'])}</span></td>
          <td data-label="Pagamento"><span class="status-pill ${ev.statusPagamento==='Pago'?'confirmado':''}">${esc(ev.statusPagamento)}</span></td>
          <td data-label="Pendente">${formatBRL(ev.pendente)}</td>
        </tr>`).join('')}</tbody>
    </table>`;
  document.getElementById('thDataFreelance').addEventListener('click', () => {
    freelanceOrdemData = freelanceOrdemData === 'desc' ? 'asc' : 'desc';
    desenharTabelaFreelance();
  });
  el.querySelectorAll('tr.clickable').forEach(row => {
    row.addEventListener('click', () => abrirFormFreelance(freelanceEventos.find(e => String(e['ID Evento']) === row.dataset.id)));
  });
}
function abrirFormFreelance(ev){
  const editando = !!ev;
  const opcoesStatusTrabalho = listas['Status do trabalho'] || ['Pendente','Concluído'];
  document.getElementById('overlayRoot').innerHTML = `
    <div class="form-overlay" id="overlay">
      <div class="form-panel">
        <h2>${editando ? 'Editar freelance' : 'Novo freelance'}</h2>
        <div class="form-err" id="freelanceErr" style="display:none;"></div>
        <div class="row2">
          <div class="field"><label>Data</label><input id="f_data" class="p-mask-data" placeholder="DD/MM/AAAA" value="${esc(editando?ev['Data']:'')}"></div>
          <div class="field"><label>Nome do evento</label><input id="f_nomeEvento" value="${esc(editando?ev['Nome do evento']:'')}"></div>
        </div>
        <div class="row2">
          <div class="field"><label>Serviço</label><select id="f_servico">${opcoesSelect(Object.keys(SERVICO_ICONES), editando?ev['Serviço']:'')}</select></div>
          <div class="field"><label>Status do trabalho</label><select id="f_statusTrabalho">${opcoesSelect(opcoesStatusTrabalho, editando?ev['Status do trabalho']:'Pendente')}</select></div>
        </div>
        <div class="row2">
          <div class="field"><label>Valor fotografia</label><input id="f_valorFotografia" type="number" step="0.01" value="${esc(editando?ev['Valor Fotografia']:'')}"></div>
          <div class="field"><label>Valor edição</label><input id="f_valorEdicao" type="number" step="0.01" value="${esc(editando?ev['Valor Edição']:'')}"></div>
        </div>
        <div class="row2">
          <div class="field"><label>Valor da filmagem</label><input id="f_valorFilmagem" type="number" step="0.01" value="${esc(editando?ev['Valor Filmagem']:'')}"></div>
          <div class="field"><label>Valor do storymaker</label><input id="f_valorStorymaker" type="number" step="0.01" value="${esc(editando?ev['Valor Storymaker']:'')}"></div>
        </div>
        <div class="row3">
          <div class="field"><label>Fotógrafo(a)</label><input id="f_fotografo" value="${esc(editando?ev['Fotógrafo(a)']:'')}"></div>
          <div class="field"><label>Filmmaker</label><input id="f_filmmaker" value="${esc(editando?ev['Filmmaker']:'')}"></div>
          <div class="field"><label>Storymaker</label><input id="f_storymaker" value="${esc(editando?ev['Storymaker']:'')}"></div>
        </div>
        <div class="row2">
          <div class="field"><label>Editor(a) de fotos</label><input id="f_editorFotos" value="${esc(editando?ev['Editor(a) de fotos']:'')}"></div>
          <div class="field"><label>Editor(a) de vídeos</label><input id="f_editorVideos" value="${esc(editando?ev['Editor(a) de vídeos']:'')}"></div>
        </div>
        <div class="field"><label>Observações</label><textarea id="f_obs" rows="2">${esc(editando?ev['Observações']:'')}</textarea></div>
        ${editando ? `
        <hr class="rule-sep">
        <p class="hint">Pagamentos recebidos por este evento <span class="hint-soft">(clique num pagamento para editar)</span></p>
        <div id="pagamentosFreelanceLista"></div>
        <input type="hidden" id="f_pagamentoEditando" value="">
        <div class="row2" style="margin-top:10px;">
          <div class="field"><label>Data do pagamento</label><input id="f_novoPagData" class="p-mask-data" placeholder="DD/MM/AAAA"></div>
          <div class="field"><label>Valor</label><input id="f_novoPagValor" type="number" step="0.01"></div>
        </div>
        <div class="btn-row">
          <button class="btn-ghost" id="addPagamentoBtn" type="button">+ Registrar pagamento</button>
          <button class="btn-ghost" id="cancelarEdicaoPagBtn" type="button" style="display:none;">Cancelar edição</button>
          <button class="btn-danger" id="excluirPagamentoBtn" type="button" style="display:none;margin-right:0;">Excluir pagamento</button>
        </div>
        ` : ''}
        <div class="form-actions">
          ${editando ? `<button class="btn-danger" id="excluirFreelance" type="button">Excluir</button>` : ''}
          <button class="btn-ghost" id="cancelarFreelance">Cancelar</button>
          <button class="btn-primary" id="salvarFreelanceBtn">${editando?'Salvar alterações':'Criar freelance'}</button>
        </div>
      </div>
    </div>`;
  document.getElementById('cancelarFreelance').addEventListener('click', fecharOverlay);
  document.getElementById('salvarFreelanceBtn').addEventListener('click', () => salvarFreelanceEvento(editando ? ev['ID Evento'] : null));
  document.querySelectorAll('#overlayRoot .p-mask-data').forEach(inp => inp.addEventListener('input', () => { inp.value = maskData(inp.value); }));
  if (editando){
    desenharPagamentosFreelance(ev);
    document.getElementById('addPagamentoBtn').addEventListener('click', () => salvarPagamentoFreelance(ev['ID Evento']));
    document.getElementById('cancelarEdicaoPagBtn').addEventListener('click', () => limparFormPagamento());
    document.getElementById('excluirPagamentoBtn').addEventListener('click', () => {
      const idPagamento = document.getElementById('f_pagamentoEditando').value;
      excluirComConfirmacao(
        'Excluir este pagamento? Isso não pode ser desfeito.',
        'excluirFreelancePagamento', { idPagamento }, 'excluirPagamentoBtn', 'freelanceErr'
      );
    });
    document.getElementById('excluirFreelance').addEventListener('click', () => excluirComConfirmacao(
      `Excluir o freelance "${ev['Nome do evento']}"? Isso remove também todos os pagamentos lançados para ele. Não pode ser desfeito.`,
      'excluirFreelanceEvento', { idEvento: ev['ID Evento'] }, 'excluirFreelance', 'freelanceErr'
    ));
  }
}
function limparFormPagamento(){
  document.getElementById('f_novoPagData').value = '';
  document.getElementById('f_novoPagValor').value = '';
  document.getElementById('f_pagamentoEditando').value = '';
  document.getElementById('addPagamentoBtn').textContent = '+ Registrar pagamento';
  document.getElementById('cancelarEdicaoPagBtn').style.display = 'none';
  document.getElementById('excluirPagamentoBtn').style.display = 'none';
}
function desenharPagamentosFreelance(ev){
  const wrap = document.getElementById('pagamentosFreelanceLista');
  if (!ev.pagamentos || !ev.pagamentos.length){ wrap.innerHTML = `<div class="empty-state">Nenhum pagamento registrado ainda para este evento.</div>`; return; }
  wrap.innerHTML = `<table class="responsive-table"><tbody>${ev.pagamentos.map(p => `
    <tr class="clickable" data-id-pagamento="${esc(p['ID Pagamento'])}">
      <td data-label="Data">${esc(p['Data do pagamento'])}</td><td data-label="Valor">${formatBRL(p['Valor pago'])}</td>
    </tr>`).join('')}</tbody></table>`;
  wrap.querySelectorAll('tr.clickable').forEach(row => {
    row.addEventListener('click', () => {
      const pag = ev.pagamentos.find(p => String(p['ID Pagamento']) === row.dataset.idPagamento);
      document.getElementById('f_novoPagData').value = pag['Data do pagamento'];
      document.getElementById('f_novoPagValor').value = pag['Valor pago'];
      document.getElementById('f_pagamentoEditando').value = pag['ID Pagamento'];
      document.getElementById('addPagamentoBtn').textContent = 'Salvar edição do pagamento';
      document.getElementById('cancelarEdicaoPagBtn').style.display = 'inline-block';
      document.getElementById('excluirPagamentoBtn').style.display = 'inline-block';
    });
  });
}
async function salvarFreelanceEvento(idEvento){
  const dados = {
    data: document.getElementById('f_data').value.trim(),
    nomeEvento: document.getElementById('f_nomeEvento').value.trim(),
    servico: document.getElementById('f_servico').value,
    statusTrabalho: document.getElementById('f_statusTrabalho').value,
    valorFotografia: Number(document.getElementById('f_valorFotografia').value || 0),
    valorEdicao: Number(document.getElementById('f_valorEdicao').value || 0),
    valorFilmagem: Number(document.getElementById('f_valorFilmagem').value || 0),
    valorStorymaker: Number(document.getElementById('f_valorStorymaker').value || 0),
    fotografo: document.getElementById('f_fotografo').value.trim(),
    filmmaker: document.getElementById('f_filmmaker').value.trim(),
    storymaker: document.getElementById('f_storymaker').value.trim(),
    editorFotos: document.getElementById('f_editorFotos').value.trim(),
    editorVideos: document.getElementById('f_editorVideos').value.trim(),
    observacoes: document.getElementById('f_obs').value.trim(),
  };
  if (!dados.nomeEvento){ mostrarErro('freelanceErr','Informe o nome do evento.'); return; }
  const btn = document.getElementById('salvarFreelanceBtn'); btn.disabled = true; btn.textContent = 'Salvando…';
  try{
    if (idEvento) await apiCall('atualizarFreelanceEvento', Object.assign({ idEvento }, dados));
    else await apiCall('criarFreelanceEvento', dados);
    loaded = false; fecharOverlay(); await renderMain(); showToast('Freelance salvo.');
  } catch(err){ mostrarErro('freelanceErr', err.message); btn.disabled=false; btn.textContent = idEvento?'Salvar alterações':'Criar freelance'; }
}
async function salvarPagamentoFreelance(idEvento){
  const data = document.getElementById('f_novoPagData').value.trim();
  const valor = Number(document.getElementById('f_novoPagValor').value || 0);
  const idPagamento = document.getElementById('f_pagamentoEditando').value;
  if (!valor){ mostrarErro('freelanceErr','Informe o valor do pagamento.'); return; }
  const btn = document.getElementById('addPagamentoBtn');
  btn.disabled = true; btn.textContent = idPagamento ? 'Salvando…' : 'Registrando…';
  try{
    if (idPagamento) await apiCall('atualizarFreelancePagamento', { idPagamento, data, valor });
    else await apiCall('criarFreelancePagamento', { idEvento, data, valor });
    loaded = false;
    await renderMain();
    const atualizado = freelanceEventos.find(e => String(e['ID Evento']) === String(idEvento));
    abrirFormFreelance(atualizado);
    showToast(idPagamento ? 'Pagamento atualizado.' : 'Pagamento registrado.');
  } catch(err){ mostrarErro('freelanceErr', err.message); btn.disabled=false; btn.textContent = idPagamento ? 'Salvar edição do pagamento' : '+ Registrar pagamento'; }
}

