/* ============================================================
   CRM · Cibele Matozo Fotografia — Módulo: Clientes
   Carregado como <script> clássico (escopo global compartilhado).
   NÃO usar import/export: os handlers onclick inline e o estado
   global dependem deste escopo. Ordem de carga definida em crm.html.
   ============================================================ */

/* ============ CLIENTES ============ */
function renderClientes(main){
  main.innerHTML = `
    <div class="view-header">
      <div><h1>Clientes</h1><p>${clientes.length} cadastrados.</p></div>
      <button class="btn-primary" id="novoClienteBtn">+ Novo cliente</button>
    </div>
    <div class="search-box"><input type="text" id="buscaCliente" placeholder="Buscar por nome ou WhatsApp…"></div>
    <div class="panel"><div id="tabelaClientes"></div></div>
  `;
  document.getElementById('novoClienteBtn').addEventListener('click', () => abrirFormCliente(null));
  document.getElementById('buscaCliente').addEventListener('input', e => desenharTabelaClientes(e.target.value));
  desenharTabelaClientes('');
}
function desenharTabelaClientes(filtro){
  const f = filtro.trim().toLowerCase();
  const lista = clientes.filter(c => !f ||
    String(c['Nome / Responsável']||'').toLowerCase().includes(f) ||
    String(c['WhatsApp']||'').toLowerCase().includes(f));
  const el = document.getElementById('tabelaClientes');
  if (!lista.length){ el.innerHTML = `<div class="empty-state">Nenhum cliente encontrado.</div>`; return; }
  el.innerHTML = `
    <table class="responsive-table">
      <thead><tr><th>Nome</th><th>WhatsApp</th><th>E-mail</th><th>Cidade</th><th>Eventos</th></tr></thead>
      <tbody>${lista.map(c => `
        <tr class="clickable" data-id="${esc(c['ID Cliente'])}">
          <td data-label="Nome">${esc(c['Nome / Responsável'])}</td><td data-label="WhatsApp">${esc(c['WhatsApp'])}</td><td data-label="E-mail">${esc(c['E-mail'])}</td>
          <td data-label="Cidade">${esc(c['Cidade'])}</td><td data-label="Eventos">${esc(c['Qtd. eventos']||0)}</td>
        </tr>`).join('')}</tbody>
    </table>`;
  el.querySelectorAll('tr.clickable').forEach(row => {
    row.addEventListener('click', () => {
      const cliente = clientes.find(c => String(c['ID Cliente']) === row.dataset.id);
      abrirFormCliente(cliente);
    });
  });
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
          <div class="field"><label>WhatsApp</label><input id="f_whatsapp" value="${esc(editando?cliente['WhatsApp']:'')}"></div>
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
