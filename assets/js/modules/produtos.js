/* ============================================================
   CRM · Cibele Matozo Fotografia — Módulo: Produtos (v3.18)
   <script> clássico (escopo global). Catálogo de itens opcionais que
   entram no orçamento do lead (quadro de formatura, álbum...).
   ============================================================ */

/* ---- Helpers compartilhados com Pacotes (restrição por tipo de evento) ---- */
// "A;B" → ['A','B']
function tiposEventoLista_(csv){
  return String(csv || '').split(';').map(s => s.trim()).filter(Boolean);
}
// Vazio = vale para todos os tipos de evento.
function aplicaAoTipoEvento_(csv, tipo){
  const l = tiposEventoLista_(csv);
  return !l.length || l.includes(String(tipo || ''));
}
// Grade de checkboxes com os tipos da lista "Tipo de evento".
function checksTiposEvento_(prefixo, csv){
  const sel = tiposEventoLista_(csv);
  const tipos = (typeof listas !== 'undefined' && listas['Tipo de evento']) || [];
  return `<div class="tipos-evento-grid" id="${prefixo}">${tipos.map(t => `
    <label class="form-check-label d-inline-flex align-items-center gap-1 me-3">
      <input type="checkbox" class="form-check-input" value="${esc(t)}" ${sel.includes(t) ? 'checked' : ''}> ${esc(t)}
    </label>`).join('')}</div>
    <small class="text-muted">Nenhum marcado = disponível para todos os tipos de evento.</small>`;
}
function lerChecksTiposEvento_(prefixo){
  return Array.from(document.querySelectorAll(`#${prefixo} input:checked`)).map(i => i.value).join(';');
}

/* ============ PRODUTOS ============ */
function renderProdutos(main){
  main.innerHTML = `
    <div class="view-header">
      <div><h1>Produtos</h1><p>${produtos.length} cadastrado${produtos.length === 1 ? '' : 's'}. Itens opcionais (quadro, álbum...) que somam ao valor do orçamento do lead.</p></div>
      <button class="btn-primary" id="novoProdutoBtn">+ Novo produto</button>
    </div>
    <div class="search-box"><input type="text" id="buscaProduto" placeholder="Buscar por nome…"></div>
    <div class="panel panel-list"><div id="tabelaProdutos"></div></div>
  `;
  document.getElementById('novoProdutoBtn').addEventListener('click', () => abrirFormProduto(null));
  document.getElementById('buscaProduto').addEventListener('input', e => desenharTabelaProdutos(e.target.value));
  desenharTabelaProdutos('');
}
function desenharTabelaProdutos(filtro){
  const f = (filtro||'').trim().toLowerCase();
  const lista = produtos.filter(p => !f || String(p['Nome']||'').toLowerCase().includes(f));
  const el = document.getElementById('tabelaProdutos');
  if (!lista.length){ el.innerHTML = `<div class="empty-state">Nenhum produto encontrado.</div>`; return; }
  el.innerHTML = `
    <table class="responsive-table">
      <thead><tr><th>Nome</th><th>Valor</th><th>Cobrança</th><th>Eventos</th><th>Ativo</th><th>Ações</th></tr></thead>
      <tbody>${lista.map(p => `
        <tr data-id="${esc(p['ID'])}">
          <td data-label="Nome">${esc(p['Nome'])}</td>
          <td data-label="Valor">${formatBRL(p['Valor'])}</td>
          <td data-label="Cobrança">${p['Tipo de cobrança'] === 'fixo' ? 'Valor fixo' : 'Por unidade'}</td>
          <td data-label="Eventos">${esc(tiposEventoLista_(p['Tipos de evento']).join(', ') || 'Todos')}</td>
          <td data-label="Ativo">${esc(p['Ativo'] || 'Sim')}</td>
          <td data-label="Ações"><div class="row-actions">
            <button class="btn-icon" data-view="${esc(p['ID'])}" title="Abrir produto"><i class="bi bi-eye"></i></button>
            <div class="dropdown d-inline-block">
              <button class="btn-icon" data-bs-toggle="dropdown" aria-expanded="false" title="Mais"><i class="bi bi-three-dots-vertical"></i></button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><button class="dropdown-item text-danger" data-del="${esc(p['ID'])}"><i class="bi bi-trash"></i> Excluir</button></li>
              </ul>
            </div>
          </div></td>
        </tr>`).join('')}</tbody>
    </table>`;
  el.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () =>
    abrirFormProduto(produtos.find(p => String(p['ID']) === b.dataset.view))));
  el.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => {
    const p = produtos.find(x => String(x['ID']) === b.dataset.del);
    excluirComConfirmacao(
      `Excluir o produto "${p ? p['Nome'] : ''}"? Isso não pode ser desfeito.`,
      'deletarProduto', { id: b.dataset.del }, null, null
    );
  }));
}
function abrirFormProduto(produto){
  const editando = !!produto;
  const root = document.getElementById('overlayRoot');
  const cobr = editando ? (produto['Tipo de cobrança'] || 'unitario') : 'unitario';
  const ativo = editando ? (produto['Ativo'] || 'Sim') : 'Sim';
  root.innerHTML = `
    <div class="form-overlay" id="overlay">
      <div class="form-panel">
        <h2>${editando ? 'Editar produto' : 'Novo produto'}</h2>
        <div class="form-err" id="produtoErr" style="display:none;"></div>
        <div class="field"><label>Nome do produto *</label><input id="f_nome" value="${esc(editando?produto['Nome']:'')}" placeholder="Ex: Quadro de formatura em moldura de vidro"></div>
        <div class="field"><label>Descrição (aparece no orçamento)</label><textarea id="f_descricao" rows="2" placeholder="Ex: Foto e nome do formando em destaque">${esc(editando?produto['Descrição']:'')}</textarea></div>
        <div class="row3">
          <div class="field"><label>Valor</label><input id="f_valor" type="number" step="0.01" value="${esc(editando?produto['Valor']:'')}"></div>
          <div class="field"><label>Cobrança</label>
            <select id="f_cobranca">
              <option value="unitario" ${cobr==='unitario'?'selected':''}>Por unidade (valor × qtd)</option>
              <option value="fixo" ${cobr==='fixo'?'selected':''}>Valor fixo</option>
            </select></div>
          <div class="field"><label>Ativo</label>
            <select id="f_ativo"><option ${ativo==='Sim'?'selected':''}>Sim</option><option ${ativo==='Não'?'selected':''}>Não</option></select></div>
        </div>
        <div class="field"><label>Disponível para os eventos</label>${checksTiposEvento_('f_tiposEvento', editando?produto['Tipos de evento']:'')}</div>
        <div class="form-actions">
          ${editando ? `<button class="btn-danger" id="excluirProduto" type="button">Excluir</button>` : ''}
          <button class="btn-ghost" id="cancelarProduto">Cancelar</button>
          <button class="btn-primary" id="salvarProduto">${editando?'Salvar alterações':'Criar produto'}</button>
        </div>
      </div>
    </div>`;
  document.getElementById('cancelarProduto').addEventListener('click', fecharOverlay);
  document.getElementById('salvarProduto').addEventListener('click', () => salvarProduto(editando ? produto['ID'] : null));
  if (editando){
    document.getElementById('excluirProduto').addEventListener('click', () => excluirComConfirmacao(
      `Excluir o produto "${produto['Nome']}"? Isso não pode ser desfeito.`,
      'deletarProduto', { id: produto['ID'] }, 'excluirProduto', 'produtoErr'
    ));
  }
}
async function salvarProduto(id){
  const dados = {
    nome: document.getElementById('f_nome').value.trim(),
    descricao: document.getElementById('f_descricao').value.trim(),
    valor: Number(document.getElementById('f_valor').value || 0),
    tipoCobranca: document.getElementById('f_cobranca').value,
    ativo: document.getElementById('f_ativo').value,
    tiposEvento: lerChecksTiposEvento_('f_tiposEvento'),
  };
  if (!dados.nome){ mostrarErro('produtoErr','Informe o nome do produto.'); return; }
  const btn = document.getElementById('salvarProduto'); btn.disabled = true; btn.textContent = 'Salvando…';
  try{
    if (id) await apiCall('atualizarProduto', Object.assign({ id }, dados));
    else await apiCall('criarProduto', dados);
    loaded = false; fecharOverlay(); await renderMain(); showToast('Produto salvo.');
  } catch(err){ mostrarErro('produtoErr', err.message); btn.disabled=false; btn.textContent = id?'Salvar alterações':'Criar produto'; }
}
