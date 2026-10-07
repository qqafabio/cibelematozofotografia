/* ============================================================
   CRM · Cibele Matozo Fotografia — Módulo: Clientes
   Carregado como <script> clássico (escopo global compartilhado).
   NÃO usar import/export: os handlers onclick inline e o estado
   global dependem deste escopo. Ordem de carga definida em crm.html.
   ============================================================ */

/* ============ CLIENTES (v3.9 — Fase 2 do overhaul) ============
   Estado de tela em variáveis de módulo: persistem entre re-renders (ex.: após
   salvar, renderMain reconstrói a tela mas preserva busca/filtro/página). */
let clientesBusca = '';
let clientesStatusFiltro = '';
let clientesPagina = 1;
let clienteEditandoId = null;
const CLIENTES_POR_PAGINA = 10;

/* Paginação client-side simples (reusada por Clientes e Eventos — este arquivo
   carrega antes de eventos.js). Devolve o HTML dos controles; o chamador liga
   os cliques por [data-pg]. */
function htmlPaginacao(pagina, totalPaginas){
  if (totalPaginas <= 1) return '';
  let nums = '';
  for (let p = 1; p <= totalPaginas; p++){
    nums += `<button class="pager-btn ${p === pagina ? 'active' : ''}" data-pg="${p}">${p}</button>`;
  }
  return `<div class="pager">
    <button class="pager-btn" data-pg="${pagina - 1}" ${pagina <= 1 ? 'disabled' : ''} aria-label="Anterior">‹</button>
    ${nums}
    <button class="pager-btn" data-pg="${pagina + 1}" ${pagina >= totalPaginas ? 'disabled' : ''} aria-label="Próxima">›</button>
  </div>`;
}

function renderClientes(main){
  main.innerHTML = `
    <div class="view-header">
      <div><h1>Clientes</h1><p>${clientes.length} cadastrados.</p></div>
      <button class="btn-primary" id="novoClienteBtn">+ Novo cliente</button>
    </div>
    <div class="list-toolbar">
      <div class="search-box"><input type="text" id="buscaCliente" placeholder="Buscar por nome, telefone ou e-mail…" value="${esc(clientesBusca)}"></div>
      <select class="list-filter" id="filtroStatusCliente" aria-label="Status">
        <option value="">Todos os status</option>
        <option value="Ativo" ${clientesStatusFiltro === 'Ativo' ? 'selected' : ''}>Ativo</option>
        <option value="Lead" ${clientesStatusFiltro === 'Lead' ? 'selected' : ''}>Lead</option>
      </select>
    </div>
    <div class="panel panel-list"><div id="tabelaClientes"></div></div>
  `;
  document.getElementById('novoClienteBtn').addEventListener('click', () => abrirFormCliente(null));
  document.getElementById('buscaCliente').addEventListener('input', e => { clientesBusca = e.target.value; clientesPagina = 1; desenharTabelaClientes(); });
  document.getElementById('filtroStatusCliente').addEventListener('change', e => { clientesStatusFiltro = e.target.value; clientesPagina = 1; desenharTabelaClientes(); });
  desenharTabelaClientes();
}

function desenharTabelaClientes(){
  const f = clientesBusca.trim().toLowerCase();
  let lista = clientes.filter(c => !f ||
    String(c['Nome / Responsável'] || '').toLowerCase().includes(f) ||
    String(c['WhatsApp'] || '').toLowerCase().includes(f) ||
    String(c['E-mail'] || '').toLowerCase().includes(f));
  if (clientesStatusFiltro) lista = lista.filter(c => statusCliente(c) === clientesStatusFiltro);

  const el = document.getElementById('tabelaClientes');
  if (!lista.length){ el.innerHTML = `<div class="empty-state">Nenhum cliente encontrado.</div>`; return; }

  const totalPaginas = Math.max(1, Math.ceil(lista.length / CLIENTES_POR_PAGINA));
  if (clientesPagina > totalPaginas) clientesPagina = totalPaginas;
  const ini = (clientesPagina - 1) * CLIENTES_POR_PAGINA;
  const pagina = lista.slice(ini, ini + CLIENTES_POR_PAGINA);

  el.innerHTML = `
    <table class="responsive-table">
      <thead><tr><th>Nome</th><th>Telefone</th><th>E-mail</th><th>Status</th><th>Ações</th></tr></thead>
      <tbody>${pagina.map(c => linhaCliente(c)).join('')}</tbody>
    </table>
    ${htmlPaginacao(clientesPagina, totalPaginas)}`;
  wireTabelaClientes(el);
}

/* Linha da tabela: modo normal (ações olho/lápis/⋮) ou modo de edição rápida
   (inputs de Nome/Telefone/E-mail + salvar/cancelar). */
function linhaCliente(c){
  const id = c['ID Cliente'];
  if (String(id) === String(clienteEditandoId)){
    return `<tr data-id="${esc(id)}" class="row-edit">
      <td data-label="Nome"><input class="inline-input" id="edit_nome_${esc(id)}" value="${esc(c['Nome / Responsável'])}"></td>
      <td data-label="Telefone"><input class="inline-input" id="edit_tel_${esc(id)}" value="${esc(c['WhatsApp'])}"></td>
      <td data-label="E-mail"><input class="inline-input" id="edit_email_${esc(id)}" value="${esc(c['E-mail'])}"></td>
      <td data-label="Status">${pillStatusCliente(c)}</td>
      <td data-label="Ações"><div class="row-actions">
        <button class="btn-icon ok" data-save="${esc(id)}" title="Salvar"><i class="bi bi-check-lg"></i></button>
        <button class="btn-icon" data-cancel="1" title="Cancelar"><i class="bi bi-x-lg"></i></button>
      </div></td>
    </tr>`;
  }
  return `<tr data-id="${esc(id)}">
    <td data-label="Nome">${esc(c['Nome / Responsável'])}</td>
    <td data-label="Telefone">${c['WhatsApp'] ? `<span class="tel-cell">${esc(c['WhatsApp'])}${iconeWhatsapp(c['WhatsApp'])}</span>` : '—'}</td>
    <td data-label="E-mail">${esc(c['E-mail']) || '—'}</td>
    <td data-label="Status">${pillStatusCliente(c)}</td>
    <td data-label="Ações"><div class="row-actions">
      <button class="btn-icon" data-view="${esc(id)}" title="Abrir cadastro"><i class="bi bi-eye"></i></button>
      <button class="btn-icon" data-edit="${esc(id)}" title="Edição rápida"><i class="bi bi-pencil"></i></button>
      <div class="dropdown d-inline-block">
        <button class="btn-icon" data-bs-toggle="dropdown" aria-expanded="false" title="Mais"><i class="bi bi-three-dots-vertical"></i></button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><button class="dropdown-item text-danger" data-del="${esc(id)}"><i class="bi bi-trash"></i> Excluir</button></li>
        </ul>
      </div>
    </div></td>
  </tr>`;
}

function wireTabelaClientes(el){
  el.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () =>
    abrirFormCliente(clientes.find(c => String(c['ID Cliente']) === b.dataset.view))));
  el.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => {
    clienteEditandoId = b.dataset.edit;
    desenharTabelaClientes();
    aplicarMascara('edit_tel_' + clienteEditandoId, maskWhatsapp);
  }));
  el.querySelectorAll('[data-cancel]').forEach(b => b.addEventListener('click', () => {
    clienteEditandoId = null; desenharTabelaClientes();
  }));
  el.querySelectorAll('[data-save]').forEach(b => b.addEventListener('click', () => salvarEdicaoInlineCliente(b.dataset.save)));
  el.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => {
    const c = clientes.find(x => String(x['ID Cliente']) === b.dataset.del);
    excluirComConfirmacao(
      `Excluir o cliente "${c ? c['Nome / Responsável'] : ''}"? Isso não pode ser desfeito.`,
      'excluirCliente', { idCliente: b.dataset.del }, null, null
    );
  }));
  el.querySelectorAll('[data-pg]').forEach(b => b.addEventListener('click', () => {
    const p = Number(b.dataset.pg);
    if (p >= 1){ clientesPagina = p; desenharTabelaClientes(); }
  }));
}

/* Edição rápida: só Nome/Telefone/E-mail. Reenvia os demais campos a partir do
   registro atual para o backend não sobrescrever com vazio (atualizarCliente
   grava o cliente inteiro). */
async function salvarEdicaoInlineCliente(id){
  const cliente = clientes.find(c => String(c['ID Cliente']) === String(id));
  if (!cliente) return;
  const nome = document.getElementById('edit_nome_' + id).value.trim();
  const whatsapp = document.getElementById('edit_tel_' + id).value.trim();
  const email = document.getElementById('edit_email_' + id).value.trim();
  if (!nome){ showToast('❌ Informe o nome.'); return; }
  const btn = document.querySelector(`[data-save="${id}"]`);
  if (btn){ btn.disabled = true; btn.innerHTML = '…'; }
  try{
    await apiCall('atualizarCliente', {
      idCliente: id, nome, whatsapp, email,
      cpf: cliente['CPF/CNPJ'] || '', cidade: cliente['Cidade'] || '',
      instagram: cliente['Instagram'] || '', canal: cliente['Canal de origem'] || '',
      observacoes: cliente['Observações'] || '',
    });
    clienteEditandoId = null; loaded = false; await renderMain(); showToast('Cliente atualizado.');
  } catch(err){
    showToast('❌ ' + err.message);
    if (btn){ btn.disabled = false; btn.innerHTML = '<i class="bi bi-check-lg"></i>'; }
  }
}

function abrirFormCliente(cliente){
  const editando = !!cliente;
  const root = document.getElementById('overlayRoot');
  root.innerHTML = `
    <div class="form-overlay" id="overlay">
      <div class="form-panel">
        <h2>${editando ? 'Editar cliente' : 'Novo cliente'}</h2>
        <div class="form-err" id="clienteErr" style="display:none;"></div>
        <div class="field"><label>Nome completo</label><input id="f_nome" value="${esc(editando?cliente['Nome / Responsável']:'')}"></div>
        <div class="row2">
          <div class="field"><label>Telefone</label><input id="f_whatsapp" value="${esc(editando?cliente['WhatsApp']:'')}"></div>
          <div class="field"><label>E-mail</label><input id="f_email" value="${esc(editando?cliente['E-mail']:'')}"></div>
        </div>
        <div class="row2">
          <div class="field"><label>CPF/CNPJ</label><input id="f_cpf" value="${esc(editando?cliente['CPF/CNPJ']:'')}"></div>
          <div class="field"><label>Cidade</label><input id="f_cidade" value="${esc(editando?cliente['Cidade']:'')}"></div>
        </div>
        <div class="row2">
          <div class="field"><label>Instagram</label><input id="f_instagram" value="${esc(editando?cliente['Instagram']:'')}"></div>
          <div class="field"><label>Canal de origem</label><input id="f_canal" value="${esc(editando?cliente['Canal de origem']:'')}"></div>
        </div>
        <div class="field"><label>Observações</label><textarea id="f_obs" rows="3">${esc(editando?cliente['Observações']:'')}</textarea></div>
        <div class="form-actions">
          ${editando ? `<button class="btn-danger" id="excluirCliente" type="button">Excluir</button>` : ''}
          <button class="btn-ghost" id="cancelarCliente">Cancelar</button>
          <button class="btn-primary" id="salvarCliente">${editando?'Salvar alterações':'Criar cliente'}</button>
        </div>
      </div>
    </div>`;
  document.getElementById('cancelarCliente').addEventListener('click', fecharOverlay);
  document.getElementById('salvarCliente').addEventListener('click', () => salvarCliente(editando ? cliente['ID Cliente'] : null));
  if (editando){
    document.getElementById('excluirCliente').addEventListener('click', () => excluirComConfirmacao(
      `Excluir o cliente "${cliente['Nome / Responsável']}"? Isso não pode ser desfeito.`,
      'excluirCliente', { idCliente: cliente['ID Cliente'] }, 'excluirCliente', 'clienteErr'
    ));
  }
  aplicarMascara('f_whatsapp', maskWhatsapp);
}
async function salvarCliente(idCliente){
  const dados = {
    nome: document.getElementById('f_nome').value.trim(),
    whatsapp: document.getElementById('f_whatsapp').value.trim(),
    email: document.getElementById('f_email').value.trim(),
    cpf: document.getElementById('f_cpf').value.trim(),
    cidade: document.getElementById('f_cidade').value.trim(),
    instagram: document.getElementById('f_instagram').value.trim(),
    canal: document.getElementById('f_canal').value.trim(),
    observacoes: document.getElementById('f_obs').value.trim(),
  };
  if (!dados.nome){ mostrarErro('clienteErr','Informe o nome.'); return; }
  const btn = document.getElementById('salvarCliente'); btn.disabled = true; btn.textContent = 'Salvando…';
  try{
    if (idCliente) await apiCall('atualizarCliente', Object.assign({ idCliente }, dados));
    else await apiCall('criarCliente', dados);
    loaded = false; fecharOverlay(); await renderMain(); showToast('Cliente salvo.');
  } catch(err){ mostrarErro('clienteErr', err.message); btn.disabled=false; btn.textContent = idCliente?'Salvar alterações':'Criar cliente'; }
}
