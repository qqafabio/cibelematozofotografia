/* ============================================================
   CRM · Cibele Matozo Fotografia — Módulo: Leads/Orçamentos
   Carregado como <script> clássico (escopo global compartilhado).
   NÃO usar import/export: os handlers onclick inline e o estado
   global dependem deste escopo. Ordem de carga definida em crm.html.
   ============================================================ */

/* ============ LEADS / CRM · ORÇAMENTOS ============ */
let leadEditandoId = null;
function renderLeads(main){
  main.innerHTML = `
    <div class="view-header">
      <div><h1>CRM · Orçamentos</h1><p>${leads.length} leads no funil.</p></div>
      <button class="btn-primary" id="novoLeadBtn">+ Novo lead</button>
    </div>
    <div class="panel panel-list"><div id="tabelaLeads"></div></div>
  `;
  document.getElementById('novoLeadBtn').addEventListener('click', () => abrirFormLead(null));
  desenharTabelaLeads();
}
function desenharTabelaLeads(){
  const el = document.getElementById('tabelaLeads');
  if (!leads.length){ el.innerHTML = `<div class="empty-state">Nenhum lead cadastrado ainda.</div>`; return; }
  const ordenados = [...leads].sort((a,b) => Number(b['ID Lead']) - Number(a['ID Lead']));
  el.innerHTML = `
    <table class="responsive-table">
      <thead><tr><th>Cliente</th><th>Tipo</th><th>Etapa</th><th>Valor estimado</th><th>Próximo contato</th><th>Ações</th></tr></thead>
      <tbody>${ordenados.map(l => linhaLead(l)).join('')}</tbody>
    </table>`;
  wireTabelaLeads(el);
}

/* Linha: modo normal (olho/lápis/⋮) ou edição rápida (Etapa/Valor/Próximo contato). */
function linhaLead(l){
  const id = l['ID Lead'];
  if (String(id) === String(leadEditandoId)){
    return `<tr data-id="${esc(id)}" class="row-edit">
      <td data-label="Cliente">${esc(l['Cliente'])}</td>
      <td data-label="Tipo">${esc(l['Tipo de evento'])}</td>
      <td data-label="Etapa"><select class="inline-input" id="edit_etapa_${esc(id)}">${opcoesSelect(listas['Etapa comercial'], l['Etapa comercial'])}</select></td>
      <td data-label="Valor estimado"><input class="inline-input" type="number" step="0.01" id="edit_valor_${esc(id)}" value="${esc(l['Valor estimado'])}"></td>
      <td data-label="Próximo contato"><input class="inline-input" id="edit_prox_${esc(id)}" value="${esc(l['Próximo contato'])}"></td>
      <td data-label="Ações"><div class="row-actions">
        <button class="btn-icon ok" data-save="${esc(id)}" title="Salvar"><i class="bi bi-check-lg"></i></button>
        <button class="btn-icon" data-cancel="1" title="Cancelar"><i class="bi bi-x-lg"></i></button>
      </div></td>
    </tr>`;
  }
  return `<tr data-id="${esc(id)}">
    <td data-label="Cliente">${esc(l['Cliente'])}</td><td data-label="Tipo">${esc(l['Tipo de evento'])}</td>
    <td data-label="Etapa"><span class="status-pill ${String(l['Etapa comercial']).toLowerCase()==='ganho'?'confirmado':''}">${esc(l['Etapa comercial'])}</span></td>
    <td data-label="Valor estimado">${formatBRL(l['Valor estimado'])}</td>
    <td data-label="Próximo contato">${esc(l['Próximo contato'])}</td>
    <td data-label="Ações"><div class="row-actions">
      <button class="btn-icon" data-view="${esc(id)}" title="Abrir lead"><i class="bi bi-eye"></i></button>
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

function wireTabelaLeads(el){
  el.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () =>
    abrirFormLead(leads.find(l => String(l['ID Lead']) === b.dataset.view))));
  el.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => {
    leadEditandoId = b.dataset.edit;
    desenharTabelaLeads();
    aplicarMascara('edit_prox_' + leadEditandoId, maskData);
  }));
  el.querySelectorAll('[data-cancel]').forEach(b => b.addEventListener('click', () => {
    leadEditandoId = null; desenharTabelaLeads();
  }));
  el.querySelectorAll('[data-save]').forEach(b => b.addEventListener('click', () => salvarEdicaoInlineLead(b.dataset.save)));
  el.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => {
    const l = leads.find(x => String(x['ID Lead']) === b.dataset.del);
    excluirComConfirmacao(
      `Excluir o lead de "${l ? l['Cliente'] : ''}"? Isso não pode ser desfeito.`,
      'excluirLead', { idLead: b.dataset.del }, null, null
    );
  }));
}

/* Edição rápida: só Etapa/Valor/Próximo contato. Reenvia os demais campos a partir
   do registro atual para o backend não sobrescrever com vazio (atualizarLead grava
   o lead inteiro) — mesmo padrão de salvarEdicaoInlineCliente. */
async function salvarEdicaoInlineLead(id){
  const lead = leads.find(l => String(l['ID Lead']) === String(id));
  if (!lead) return;
  const etapa = document.getElementById('edit_etapa_' + id).value;
  const valorEstimado = Number(document.getElementById('edit_valor_' + id).value || 0);
  const proximoContato = document.getElementById('edit_prox_' + id).value.trim();
  const btn = document.querySelector(`[data-save="${id}"]`);
  if (btn){ btn.disabled = true; btn.innerHTML = '…'; }
  try{
    await apiCall('atualizarLead', {
      idLead: id,
      tipoEvento: lead['Tipo de evento'] || '',
      dataDesejada: lead['Data desejada'] || '',
      servico: lead['Serviço de interesse'] || '',
      pacote: lead['Pacote'] || '',
      origem: lead['Origem'] || '',
      etapa,
      valorEstimado,
      desconto: Number(lead['Desconto'] || 0),
      proximoContato,
      observacoes: lead['Observações'] || '',
    });
    leadEditandoId = null; loaded = false; await renderMain(); showToast('Lead atualizado.');
  } catch(err){
    showToast('❌ ' + err.message);
    if (btn){ btn.disabled = false; btn.innerHTML = '<i class="bi bi-check-lg"></i>'; }
  }
}
function abrirFormLead(lead){
  const editando = !!lead;
  document.getElementById('overlayRoot').innerHTML = `
    <div class="form-overlay" id="overlay">
      <div class="form-panel">
        <h2>${editando ? 'Editar lead' : 'Novo lead'}</h2>
        <div class="form-err" id="leadErr" style="display:none;"></div>
        ${editando ? `<div class="field"><label>Cliente</label><input value="${esc(lead['Cliente'])}" disabled></div>` : `
        <div class="row2">
          <div class="field"><label>Nome</label><input id="f_nome"></div>
          <div class="field"><label>WhatsApp</label><input id="f_whatsapp" placeholder="(41) 90000-0000"></div>
        </div>
        <div class="field"><label>E-mail (opcional)</label><input id="f_email"></div>
        `}
        <div class="row2">
          <div class="field"><label>Tipo de evento</label><select id="f_tipo">${opcoesSelect(listas['Tipo de evento'], editando?lead['Tipo de evento']:'')}</select></div>
          <div class="field"><label>Data desejada</label><input id="f_dataDesejada" placeholder="DD/MM/AAAA" value="${esc(editando?lead['Data desejada']:'')}"></div>
        </div>
        <div class="row2">
          <div class="field"><label>Serviço de interesse</label><select id="f_servico">${opcoesSelect(listas['Serviço'], editando?lead['Serviço de interesse']:'')}</select></div>
          <div class="field"><label>Pacote</label><select id="f_pacote">${opcoesPacotes(editando?lead['Pacote']:'')}</select></div>
        </div>
        <div class="row2">
          <div class="field"><label>Origem</label><select id="f_origem">${opcoesSelect(listas['Canal'], editando?lead['Origem']:'')}</select></div>
          <div class="field"><label>Etapa comercial</label><select id="f_etapa">${opcoesSelect(listas['Etapa comercial'], editando?lead['Etapa comercial']:'')}</select></div>
        </div>
        <div class="row2">
          <div class="field"><label>Valor estimado</label><input id="f_valorEstimado" type="number" step="0.01" value="${esc(editando?lead['Valor estimado']:'')}"></div>
          <div class="field"><label>Desconto (R$)</label><input id="f_desconto" type="number" step="0.01" min="0" value="${esc(editando?lead['Desconto']:'')}"></div>
        </div>
        <p id="valorComDesconto" style="font-size:12.5px;color:var(--ink-soft);margin:-8px 0 14px;"></p>
        <div class="field"><label>Próximo contato</label><input id="f_proximoContato" placeholder="DD/MM/AAAA" value="${esc(editando?lead['Próximo contato']:'')}"></div>
        <div class="field"><label>Observações</label><textarea id="f_obs" rows="3">${esc(editando?lead['Observações']:'')}</textarea></div>
        <div class="form-actions">
          ${editando ? `<button class="btn-danger" id="excluirLead" type="button">Excluir</button>` : ''}
          <button class="btn-ghost" id="cancelarLead">Cancelar</button>
          <button class="btn-primary" id="salvarLead">${editando?'Salvar alterações':'Criar lead'}</button>
        </div>
      </div>
    </div>`;
  document.getElementById('cancelarLead').addEventListener('click', fecharOverlay);
  document.getElementById('salvarLead').addEventListener('click', () => salvarLead(editando ? lead['ID Lead'] : null));
  if (editando){
    document.getElementById('excluirLead').addEventListener('click', () => excluirComConfirmacao(
      `Excluir o lead de "${lead['Cliente']}"? Isso não pode ser desfeito.`,
      'excluirLead', { idLead: lead['ID Lead'] }, 'excluirLead', 'leadErr'
    ));
  }
  aplicarMascara('f_whatsapp', maskWhatsapp);
  aplicarMascara('f_dataDesejada', maskData);
  aplicarMascara('f_proximoContato', maskData);
  vincularAutoValorPacote('f_pacote', 'f_valorEstimado', { somenteSeVazio: true });
  // Mostra "Valor com desconto" = Valor estimado − Desconto, atualizado ao vivo.
  const atualizarValorComDesconto = () => {
    const est = Number(document.getElementById('f_valorEstimado').value || 0);
    const desc = Number(document.getElementById('f_desconto').value || 0);
    const el = document.getElementById('valorComDesconto');
    el.textContent = desc > 0 ? `Valor com desconto: ${formatBRL(Math.max(0, est - desc))}` : '';
  };
  document.getElementById('f_valorEstimado').addEventListener('input', atualizarValorComDesconto);
  document.getElementById('f_pacote').addEventListener('change', atualizarValorComDesconto);
  document.getElementById('f_desconto').addEventListener('input', atualizarValorComDesconto);
  atualizarValorComDesconto();
}
async function salvarLead(idLead){
  const dados = {
    tipoEvento: document.getElementById('f_tipo').value.trim(),
    dataDesejada: document.getElementById('f_dataDesejada').value.trim(),
    servico: document.getElementById('f_servico').value.trim(),
    pacote: document.getElementById('f_pacote').value.trim(),
    origem: document.getElementById('f_origem').value.trim(),
    etapa: document.getElementById('f_etapa').value,
    valorEstimado: Number(document.getElementById('f_valorEstimado').value || 0),
    desconto: Number(document.getElementById('f_desconto').value || 0),
    proximoContato: document.getElementById('f_proximoContato').value.trim(),
    observacoes: document.getElementById('f_obs').value.trim(),
  };
  if (!idLead){
    dados.nome = document.getElementById('f_nome').value.trim();
    dados.whatsapp = document.getElementById('f_whatsapp').value.trim();
    dados.email = document.getElementById('f_email').value.trim();
    if (!dados.nome){ mostrarErro('leadErr','Informe o nome.'); return; }
  }
  const btn = document.getElementById('salvarLead'); btn.disabled = true; btn.textContent = 'Salvando…';
  try{
    if (idLead) await apiCall('atualizarLead', Object.assign({ idLead }, dados));
    else await apiCall('criarLead', dados);
    loaded = false; fecharOverlay(); await renderMain(); showToast('Lead salvo.');
  } catch(err){ mostrarErro('leadErr', err.message); btn.disabled=false; btn.textContent = idLead?'Salvar alterações':'Criar lead'; }
}
 
