/* ============================================================
   CRM · Cibele Matozo Fotografia — Módulo: Custos
   Carregado como <script> clássico (escopo global compartilhado).
   NÃO usar import/export: os handlers onclick inline e o estado
   global dependem deste escopo. Ordem de carga definida em crm.html.
   ============================================================ */

/* ============ CUSTOS ============ */
let custoEditandoId = null;
function agruparReceitaCusto(){
  const porEvento = {};
  eventos.forEach(e => {
    porEvento[e['ID Evento']] = { idEvento: e['ID Evento'], cliente: e['Cliente / Responsável'], receita: Number(e['Valor final']||0), custo: 0 };
  });
  custos.forEach(c => {
    const g = porEvento[c['ID Evento']];
    if (g) g.custo += Number(c['Valor']||0);
  });
  return Object.values(porEvento)
    .filter(g => g.receita > 0 || g.custo > 0)
    .map(g => Object.assign(g, { margem: g.receita - g.custo, margemPct: g.receita ? ((g.receita - g.custo) / g.receita * 100) : 0 }));
}
function renderCustos(main){
  const total = custos.reduce((s,c) => s + Number(c['Valor']||0), 0);
  const porEvento = agruparReceitaCusto();
  main.innerHTML = `
    <div class="view-header">
      <div><h1>Custos</h1><p>${custos.length} lançamentos.</p></div>
      <button class="btn-primary" id="novoCustoBtn">+ Novo custo</button>
    </div>
    <div class="kpi-row"><div class="kpi-card"><div class="kpi-label">Total lançado</div><div class="kpi-value">${formatBRL(total)}</div></div></div>
    <div class="panel spaced">
      <h2>Receita × custo por evento</h2>
      ${porEvento.length ? `<table class="responsive-table">
        <thead><tr><th>Cliente</th><th>Receita</th><th>Custos</th><th>Margem</th><th>Margem %</th><th>Ações</th></tr></thead>
        <tbody>${porEvento.map(g => `
          <tr>
            <td data-label="Cliente">${esc(g.cliente)}</td><td data-label="Receita">${formatBRL(g.receita)}</td><td data-label="Custos">${formatBRL(g.custo)}</td>
            <td data-label="Margem">${formatBRL(g.margem)}</td>
            <td data-label="Margem %"><span class="status-pill ${g.margem>=0?'confirmado':'vencida'}">${g.margemPct.toFixed(0)}%</span></td>
            <td data-label="Ações"><div class="row-actions">
              <button class="btn-icon" data-addcusto="${esc(g.idEvento)}" title="Lançar custo neste evento"><i class="bi bi-plus-lg"></i></button>
            </div></td>
          </tr>`).join('')}</tbody></table>` : `<div class="empty-state">Nenhum evento com receita ou custo lançado ainda.</div>`}
    </div>
    <div class="panel panel-list"><div id="tabelaCustos"></div></div>
  `;
  document.getElementById('novoCustoBtn').addEventListener('click', () => abrirFormCusto(null));
  main.querySelectorAll('[data-addcusto]').forEach(b => b.addEventListener('click', () => abrirFormCusto(null, b.dataset.addcusto)));
  desenharTabelaCustos();
}
function desenharTabelaCustos(){
  const el = document.getElementById('tabelaCustos');
  if (!custos.length){ el.innerHTML = `<div class="empty-state">Nenhum custo lançado ainda.</div>`; return; }
  const ordenados = [...custos].sort((a,b) => Number(b['ID Custo']) - Number(a['ID Custo']));
  el.innerHTML = `
    <table class="responsive-table">
      <thead><tr><th>Evento</th><th>Categoria</th><th>Fornecedor</th><th>Valor</th><th>Pago?</th><th>Ações</th></tr></thead>
      <tbody>${ordenados.map(c => linhaCusto(c)).join('')}</tbody>
    </table>`;
  wireTabelaCustos(el);
}

/* Linha: modo normal (olho/lápis/⋮) ou edição rápida (Fornecedor/Valor/Pago?). */
function linhaCusto(c){
  const id = c['ID Custo'];
  if (String(id) === String(custoEditandoId)){
    const pago = String(c['Pago?']);
    return `<tr data-id="${esc(id)}" class="row-edit">
      <td data-label="Evento">${esc(c['Cliente'])}</td>
      <td data-label="Categoria">${esc(c['Categoria'])}</td>
      <td data-label="Fornecedor"><input class="inline-input" id="edit_forn_${esc(id)}" value="${esc(c['Fornecedor'])}"></td>
      <td data-label="Valor"><input class="inline-input" type="number" step="0.01" id="edit_valor_${esc(id)}" value="${esc(c['Valor'])}"></td>
      <td data-label="Pago?"><select class="inline-input" id="edit_pago_${esc(id)}"><option ${pago==='Sim'?'selected':''}>Sim</option><option ${pago!=='Sim'?'selected':''}>Não</option></select></td>
      <td data-label="Ações"><div class="row-actions">
        <button class="btn-icon ok" data-save="${esc(id)}" title="Salvar"><i class="bi bi-check-lg"></i></button>
        <button class="btn-icon" data-cancel="1" title="Cancelar"><i class="bi bi-x-lg"></i></button>
      </div></td>
    </tr>`;
  }
  return `<tr data-id="${esc(id)}">
    <td data-label="Evento">${esc(c['Cliente'])}</td><td data-label="Categoria">${esc(c['Categoria'])}</td><td data-label="Fornecedor">${esc(c['Fornecedor'])}</td>
    <td data-label="Valor">${formatBRL(c['Valor'])}</td>
    <td data-label="Pago?"><span class="status-pill ${String(c['Pago?']).toLowerCase()==='sim'?'confirmado':''}">${esc(c['Pago?'])}</span></td>
    <td data-label="Ações"><div class="row-actions">
      <button class="btn-icon" data-view="${esc(id)}" title="Abrir custo"><i class="bi bi-eye"></i></button>
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

function wireTabelaCustos(el){
  el.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () =>
    abrirFormCusto(custos.find(c => String(c['ID Custo']) === b.dataset.view))));
  el.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => {
    custoEditandoId = b.dataset.edit; desenharTabelaCustos();
  }));
  el.querySelectorAll('[data-cancel]').forEach(b => b.addEventListener('click', () => {
    custoEditandoId = null; desenharTabelaCustos();
  }));
  el.querySelectorAll('[data-save]').forEach(b => b.addEventListener('click', () => salvarEdicaoInlineCusto(b.dataset.save)));
  el.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => {
    const c = custos.find(x => String(x['ID Custo']) === b.dataset.del);
    excluirComConfirmacao(
      `Excluir o custo "${c ? (c['Descrição'] || c['Categoria'] || '') : ''}"? Isso não pode ser desfeito.`,
      'excluirCusto', { idCusto: b.dataset.del }, null, null
    );
  }));
}

/* Edição rápida: só Fornecedor/Valor/Pago?. Reenvia os demais campos a partir do
   registro atual (atualizarCusto grava o custo inteiro) — padrão de salvarEdicaoInlineCliente. */
async function salvarEdicaoInlineCusto(id){
  const custo = custos.find(c => String(c['ID Custo']) === String(id));
  if (!custo) return;
  const fornecedor = document.getElementById('edit_forn_' + id).value.trim();
  const valor = Number(document.getElementById('edit_valor_' + id).value || 0);
  const pago = document.getElementById('edit_pago_' + id).value;
  const btn = document.querySelector(`[data-save="${id}"]`);
  if (btn){ btn.disabled = true; btn.innerHTML = '…'; }
  try{
    await apiCall('atualizarCusto', {
      idCusto: id,
      idEvento: custo['ID Evento'] || '',
      data: custo['Data'] || '',
      categoria: custo['Categoria'] || '',
      fornecedor,
      descricao: custo['Descrição'] || '',
      valor,
      pago,
      formaPagamento: custo['Forma pagamento'] || '',
      observacoes: custo['Observações'] || '',
    });
    custoEditandoId = null; loaded = false; await renderMain(); showToast('Custo atualizado.');
  } catch(err){
    showToast('❌ ' + err.message);
    if (btn){ btn.disabled = false; btn.innerHTML = '<i class="bi bi-check-lg"></i>'; }
  }
}
function abrirFormCusto(custo, idEventoPadrao){
  const editando = !!custo;
  const idEvSelecionado = editando ? custo['ID Evento'] : (idEventoPadrao || '');
  const opcoesEventos = eventos.map(e => `<option value="${esc(e['ID Evento'])}" ${String(idEvSelecionado)===String(e['ID Evento'])?'selected':''}>${esc(e['Cliente / Responsável'])} — ${esc(e['Data do evento'])}</option>`).join('');
  document.getElementById('overlayRoot').innerHTML = `
    <div class="form-overlay" id="overlay">
      <div class="form-panel">
        <h2>${editando?'Editar custo':'Novo custo'}</h2>
        <div class="form-err" id="custoErr" style="display:none;"></div>
        <div class="field"><label>Evento</label><select id="f_idEvento">${eventos.length?opcoesEventos:'<option value="">Cadastre um evento primeiro</option>'}</select></div>
        <div class="row2">
          <div class="field"><label>Data</label><input id="f_data" placeholder="DD/MM/AAAA" value="${esc(editando?custo['Data']:'')}"></div>
          <div class="field"><label>Categoria</label><select id="f_categoria">${opcoesSelect(listas['Tipo custo'], editando?custo['Categoria']:'')}</select></div>
        </div>
        <div class="row2">
          <div class="field"><label>Fornecedor</label><input id="f_fornecedor" value="${esc(editando?custo['Fornecedor']:'')}"></div>
          <div class="field"><label>Valor</label><input id="f_valor" type="number" step="0.01" value="${esc(editando?custo['Valor']:'')}"></div>
        </div>
        <div class="field"><label>Descrição</label><input id="f_descricao" value="${esc(editando?custo['Descrição']:'')}"></div>
        <div class="row2">
          <div class="field"><label>Pago?</label><select id="f_pago"><option ${editando&&custo['Pago?']==='Sim'?'selected':''}>Sim</option><option ${!editando||custo['Pago?']==='Não'?'selected':''}>Não</option></select></div>
          <div class="field"><label>Forma pagamento</label><input id="f_formaPagamento" value="${esc(editando?custo['Forma pagamento']:'')}"></div>
        </div>
        <div class="field"><label>Observações</label><textarea id="f_obs" rows="2">${esc(editando?custo['Observações']:'')}</textarea></div>
        <div class="form-actions">
          ${editando ? `<button class="btn-danger" id="excluirCusto" type="button">Excluir</button>` : ''}
          <button class="btn-ghost" id="cancelarCusto">Cancelar</button>
          <button class="btn-primary" id="salvarCusto">${editando?'Salvar alterações':'Criar custo'}</button>
        </div>
      </div>
    </div>`;
  document.getElementById('cancelarCusto').addEventListener('click', fecharOverlay);
  document.getElementById('salvarCusto').addEventListener('click', () => salvarCusto(editando ? custo['ID Custo'] : null));
  if (editando){
    document.getElementById('excluirCusto').addEventListener('click', () => excluirComConfirmacao(
      `Excluir o custo "${custo['Descrição'] || custo['Categoria'] || ''}"? Isso não pode ser desfeito.`,
      'excluirCusto', { idCusto: custo['ID Custo'] }, 'excluirCusto', 'custoErr'
    ));
  }
  aplicarMascara('f_data', maskData);
}
async function salvarCusto(idCusto){
  const idEvento = document.getElementById('f_idEvento').value;
  if (!idEvento){ mostrarErro('custoErr','Escolha um evento.'); return; }
  const dados = {
    idEvento,
    data: document.getElementById('f_data').value.trim(),
    categoria: document.getElementById('f_categoria').value.trim(),
    fornecedor: document.getElementById('f_fornecedor').value.trim(),
    descricao: document.getElementById('f_descricao').value.trim(),
    valor: Number(document.getElementById('f_valor').value || 0),
    pago: document.getElementById('f_pago').value,
    formaPagamento: document.getElementById('f_formaPagamento').value.trim(),
    observacoes: document.getElementById('f_obs').value.trim(),
  };
  const btn = document.getElementById('salvarCusto'); btn.disabled = true; btn.textContent = 'Salvando…';
  try{
    if (idCusto) await apiCall('atualizarCusto', Object.assign({ idCusto }, dados));
    else await apiCall('criarCusto', dados);
    loaded = false; fecharOverlay(); await renderMain(); showToast('Custo salvo.');
  } catch(err){ mostrarErro('custoErr', err.message); btn.disabled=false; btn.textContent = idCusto?'Salvar alterações':'Criar custo'; }
}
 
