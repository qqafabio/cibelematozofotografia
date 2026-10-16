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
      <thead><tr><th>Cliente</th><th>Tipo</th><th>Etapa</th><th>Valor estimado</th><th>Orçamento</th><th>Próximo contato</th><th>Ações</th></tr></thead>
      <tbody>${ordenados.map(l => linhaLead(l)).join('')}</tbody>
    </table>`;
  wireTabelaLeads(el);
}

/* Situação do orçamento do lead: sem / vN atual / vN desatualizado (dados do PDF mudaram). */
function pillOrcamentoLead_(l){
  const sit = orcSituacaoLead_(l);
  if (sit === 'sem') return `<span class="status-pill info">Sem orçamento</span>`;
  const v = Number(l['Orçamento versão'] || 0);
  return sit === 'atual'
    ? `<span class="status-pill confirmado">v${v}</span>`
    : `<span class="status-pill alerta" title="Dados do orçamento mudaram: abra o lead para gerar nova versão">v${v} · desatualizado</span>`;
}

/* Linha: modo normal (olho/lápis/⋮) ou edição rápida (Etapa/Próximo contato). */
function linhaLead(l){
  const id = l['ID Lead'];
  if (String(id) === String(leadEditandoId)){
    return `<tr data-id="${esc(id)}" class="row-edit">
      <td data-label="Cliente">${esc(l['Cliente'])}</td>
      <td data-label="Tipo">${esc(l['Tipo de evento'])}</td>
      <td data-label="Etapa"><select class="inline-input" id="edit_etapa_${esc(id)}">${opcoesSelect(listas['Etapa comercial'], l['Etapa comercial'])}</select></td>
      <td data-label="Valor estimado">${formatBRL(l['Valor estimado'])}</td>
      <td data-label="Orçamento">${pillOrcamentoLead_(l)}</td>
      <td data-label="Próximo contato"><input class="inline-input" id="edit_prox_${esc(id)}" data-picker="date" placeholder="DD/MM/AAAA" value="${esc(l['Próximo contato'])}"></td>
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
    <td data-label="Orçamento">${pillOrcamentoLead_(l)}</td>
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

/* Edição rápida: só Etapa/Próximo contato (valor deriva do orçamento). Reenvia os demais campos a partir
   do registro atual para o backend não sobrescrever com vazio (atualizarLead grava
   o lead inteiro) — mesmo padrão de salvarEdicaoInlineCliente. */
async function salvarEdicaoInlineLead(id){
  const lead = leads.find(l => String(l['ID Lead']) === String(id));
  if (!lead) return;
  const etapa = document.getElementById('edit_etapa_' + id).value;
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
      valorEstimado: Number(lead['Valor estimado'] || 0),
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
