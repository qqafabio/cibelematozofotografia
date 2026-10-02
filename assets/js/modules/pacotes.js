/* ============================================================
   CRM · Cibele Matozo Fotografia — Módulo: Pacotes
   Carregado como <script> clássico (escopo global compartilhado).
   NÃO usar import/export: os handlers onclick inline e o estado
   global dependem deste escopo. Ordem de carga definida em crm.html.
   ============================================================ */

/* ============ PACOTES ============ */
function renderPacotes(main){
  main.innerHTML = `
    <div class="view-header">
      <div><h1>Pacotes</h1><p>${pacotes.length} cadastrado${pacotes.length === 1 ? '' : 's'}. O valor definido aqui autopreenche o campo "Valor pacote" nos eventos.</p></div>
      <button class="btn-primary" id="novoPacoteBtn">+ Novo pacote</button>
    </div>
    <div class="search-box"><input type="text" id="buscaPacote" placeholder="Buscar por nome…"></div>
    <div class="panel"><div id="tabelaPacotes"></div></div>
  `;
  document.getElementById('novoPacoteBtn').addEventListener('click', () => abrirFormPacote(null));
  document.getElementById('buscaPacote').addEventListener('input', e => desenharTabelaPacotes(e.target.value));
  desenharTabelaPacotes('');
}
function desenharTabelaPacotes(filtro){
  const f = (filtro||'').trim().toLowerCase();
  const lista = pacotes.filter(p => !f || String(p['Nome']||'').toLowerCase().includes(f));
  const el = document.getElementById('tabelaPacotes');
  if (!lista.length){ el.innerHTML = `<div class="empty-state">Nenhum pacote encontrado.</div>`; return; }
  el.innerHTML = `
    <table class="responsive-table">
      <thead><tr><th>Nome</th><th>Descrição</th><th>Valor pacote</th><th>Fotos incluídas</th><th>Valor foto extra</th></tr></thead>
      <tbody>${lista.map(p => `
        <tr class="clickable" data-id="${esc(p['ID'])}">
          <td data-label="Nome">${esc(p['Nome'])}</td>
          <td data-label="Descrição">${esc(p['Descrição'])}</td>
          <td data-label="Valor pacote">${formatBRL(p['Valor pacote'])}</td>
          <td data-label="Fotos incluídas">${esc(p['Qtd fotos incluídas'])}</td>
          <td data-label="Valor foto extra">${formatBRL(p['Valor foto extra'])}</td>
        </tr>`).join('')}</tbody>
    </table>`;
  el.querySelectorAll('tr.clickable').forEach(row => {
    row.addEventListener('click', () => {
      const pacote = pacotes.find(p => String(p['ID']) === row.dataset.id);
      abrirFormPacote(pacote);
    });
  });
}
function abrirFormPacote(pacote){
  const editando = !!pacote;
  const root = document.getElementById('overlayRoot');
  root.innerHTML = `
    <div class="form-overlay" id="overlay">
      <div class="form-panel">
        <h2>${editando ? 'Editar pacote' : 'Novo pacote'}</h2>
        <div class="form-err" id="pacoteErr" style="display:none;"></div>
        <div class="field"><label>Nome do pacote *</label><input id="f_nome" value="${esc(editando?pacote['Nome']:'')}" placeholder="Ex: Prata, Ouro, Diamante"></div>
        <div class="field"><label>Descrição</label><textarea id="f_descricao" rows="2">${esc(editando?pacote['Descrição']:'')}</textarea></div>
        <div class="row3">
          <div class="field"><label>Valor pacote</label><input id="f_valorPacote" type="number" step="0.01" value="${esc(editando?pacote['Valor pacote']:'')}"></div>
          <div class="field"><label>Qtd fotos incluídas</label><input id="f_qtdFotos" type="number" step="1" value="${esc(editando?pacote['Qtd fotos incluídas']:'')}"></div>
          <div class="field"><label>Valor foto extra</label><input id="f_valorFotoExtra" type="number" step="0.01" value="${esc(editando?pacote['Valor foto extra']:'')}"></div>
        </div>
        <div class="form-actions">
          ${editando ? `<button class="btn-danger" id="excluirPacote" type="button">Excluir</button>` : ''}
          <button class="btn-ghost" id="cancelarPacote">Cancelar</button>
          <button class="btn-primary" id="salvarPacote">${editando?'Salvar alterações':'Criar pacote'}</button>
        </div>
      </div>
    </div>`;
  document.getElementById('cancelarPacote').addEventListener('click', fecharOverlay);
  document.getElementById('salvarPacote').addEventListener('click', () => salvarPacote(editando ? pacote['ID'] : null));
  if (editando){
    document.getElementById('excluirPacote').addEventListener('click', () => excluirComConfirmacao(
      `Excluir o pacote "${pacote['Nome']}"? Isso não pode ser desfeito.`,
      'deletarPacote', { id: pacote['ID'] }, 'excluirPacote', 'pacoteErr'
    ));
  }
}
async function salvarPacote(id){
  const dados = {
    nome: document.getElementById('f_nome').value.trim(),
    descricao: document.getElementById('f_descricao').value.trim(),
    valorPacote: Number(document.getElementById('f_valorPacote').value || 0),
    qtdFotos: document.getElementById('f_qtdFotos').value.trim(),
    valorFotoExtra: Number(document.getElementById('f_valorFotoExtra').value || 0),
  };
  if (!dados.nome){ mostrarErro('pacoteErr','Informe o nome do pacote.'); return; }
  const btn = document.getElementById('salvarPacote'); btn.disabled = true; btn.textContent = 'Salvando…';
  try{
    if (id) await apiCall('atualizarPacote', Object.assign({ id }, dados));
    else await apiCall('criarPacote', dados);
    loaded = false; fecharOverlay(); await renderMain(); showToast('Pacote salvo.');
  } catch(err){ mostrarErro('pacoteErr', err.message); btn.disabled=false; btn.textContent = id?'Salvar alterações':'Criar pacote'; }
}

/* ============ INTEGRAÇÃO DO CAMPO "PACOTE" (Eventos e Leads) ============ */
/* Monta as <option> do <select> de Pacote a partir do cadastro de Pacotes.
   Se ainda não houver pacotes cadastrados, cai no fallback da lista antiga
   (listas['Pacote']), para não quebrar formulários antes do primeiro seed. */
function opcoesPacotes(selecionado){
  if (!Array.isArray(pacotes) || !pacotes.length){
    return opcoesSelect((typeof listas !== 'undefined' && listas['Pacote']) || [], selecionado || '');
  }
  const atual = selecionado == null ? '' : String(selecionado);
  const options = ['<option value="">—</option>'].concat(
    pacotes.map(p => {
      const nome = String(p['Nome'] || '');
      return `<option value="${esc(nome)}" ${nome === atual ? 'selected' : ''}>${esc(nome)}</option>`;
    })
  );
  return options.join('');
}
/* Liga o <select> de Pacote ao input de valor: ao escolher um pacote, preenche
   o valor com o "Valor pacote" do cadastro. Reusa o padrão select→derivar-valor
   de financeiro.js (atualizarSaldoEventoInfo). Com somenteSeVazio=true, só
   preenche quando o campo de valor estiver vazio (usado em Leads, p/ não
   sobrescrever um valor estimado digitado à mão). Com inputFotoExtraId, também
   autopreenche o "Valor foto extra" a partir do cadastro (usado no evento coletivo). */
function vincularAutoValorPacote(selectId, valorInputId, opcoes){
  const somenteSeVazio = !!(opcoes && opcoes.somenteSeVazio);
  const inputFotoExtraId = opcoes && opcoes.inputFotoExtraId;
  const sel = document.getElementById(selectId);
  const input = document.getElementById(valorInputId);
  if (!sel || !input) return;
  const inputFotoExtra = inputFotoExtraId ? document.getElementById(inputFotoExtraId) : null;
  sel.addEventListener('change', () => {
    const pacote = pacotes.find(p => String(p['Nome']) === sel.value);
    if (!pacote) return;
    if (!(somenteSeVazio && String(input.value).trim() !== '')){
      input.value = Number(pacote['Valor pacote'] || 0);
    }
    if (inputFotoExtra && !(somenteSeVazio && String(inputFotoExtra.value).trim() !== '')){
      inputFotoExtra.value = Number(pacote['Valor foto extra'] || 0);
    }
  });
}

