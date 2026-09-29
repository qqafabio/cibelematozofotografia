/* ============================================================
   CRM · Cibele Matozo Fotografia — Módulo: Eventos
   Carregado como <script> clássico (escopo global compartilhado).
   NÃO usar import/export: os handlers onclick inline e o estado
   global dependem deste escopo. Ordem de carga definida em crm.html.
   ============================================================ */

async function excluirEventoComConfirmacao(evento){
  const mensagem = `Excluir o evento de "${evento['Cliente / Responsável']}" em ${evento['Data do evento'] || '(sem data)'}? Isso remove também a produção, o compromisso na Agenda, os custos e as parcelas do Financeiro. Não pode ser desfeito.`;
  if (!confirm(mensagem)) return;
  const btn = document.getElementById('excluirEvento');
  if (btn){ btn.disabled = true; btn.textContent = 'Excluindo…'; }
  try{
    await apiCall('excluirEvento', { idEvento: evento['ID Evento'] });
    loaded = false; fecharOverlay(); await renderMain(); showToast('Excluído.');
  } catch(err){
    const bloqueadoPorPagamento = /recebido/.test(err.message);
    if (bloqueadoPorPagamento && confirm(err.message + '\n\nSe for um evento de teste, você pode excluir mesmo assim — isso apaga também o valor recebido do Financeiro, sem estorno real. Confirma a exclusão forçada?')){
      try{
        await apiCall('excluirEvento', { idEvento: evento['ID Evento'], forcar: true });
        loaded = false; fecharOverlay(); await renderMain(); showToast('Excluído.');
        return;
      } catch(err2){ mostrarErro('eventoErr', err2.message); }
    } else {
      mostrarErro('eventoErr', err.message);
    }
    if (btn){ btn.disabled = false; btn.textContent = 'Excluir'; }
  }
}
/* ============ EVENTOS ============ */
function renderEventos(main){
  main.innerHTML = `
    <div class="view-header">
      <div><h1>Eventos</h1><p>${eventos.length} registrados. Novo evento cria automaticamente o compromisso na Agenda.</p></div>
      <button class="btn-primary" id="novoEventoBtn">+ Novo evento</button>
    </div>
    <div class="panel"><div id="tabelaEventos"></div></div>
  `;
  document.getElementById('novoEventoBtn').addEventListener('click', () => abrirFormEvento(null));
  desenharTabelaEventos();
}
function desenharTabelaEventos(){
  const el = document.getElementById('tabelaEventos');
  if (!eventos.length){ el.innerHTML = `<div class="empty-state">Nenhum evento cadastrado ainda.</div>`; return; }
  const ordenados = [...eventos].sort((a,b) => (parseDataBR(b['Data do evento'])||0) - (parseDataBR(a['Data do evento'])||0));
  el.innerHTML = `
    <table class="responsive-table">
      <thead><tr><th>Data</th><th>Cliente</th><th>Tipo</th><th>Pacote</th><th>Valor</th><th>Status</th></tr></thead>
      <tbody>${ordenados.map(e => `
        <tr class="clickable" data-id="${esc(e['ID Evento'])}">
          <td data-label="Data">${esc(e['Data do evento'])}</td><td data-label="Cliente">${esc(e['Cliente / Responsável'])}</td><td data-label="Tipo">${esc(e['Tipo de evento'])}</td>
          <td data-label="Pacote">${esc(e['Pacote'])}</td><td data-label="Valor">${formatBRL(e['Valor final'])}</td>
          <td data-label="Status"><span class="status-pill ${String(e.Status).toLowerCase()==='confirmado'?'confirmado':''}">${esc(e.Status)}</span></td>
        </tr>`).join('')}</tbody>
    </table>`;
  el.querySelectorAll('tr.clickable').forEach(row => {
    row.addEventListener('click', () => {
      const evento = eventos.find(e => String(e['ID Evento']) === row.dataset.id);
      abrirFormEvento(evento);
    });
  });
}
function abrirFormEvento(evento){
  const editando = !!evento;
  const root = document.getElementById('overlayRoot');
  const opcoesClientes = clientes.map(c => `<option value="${esc(c['ID Cliente'])}" ${editando && String(evento['ID Cliente'])===String(c['ID Cliente'])?'selected':''}>${esc(c['Nome / Responsável'])}</option>`).join('');
  root.innerHTML = `
    <div class="form-overlay" id="overlay">
      <div class="form-panel">
        <h2>${editando ? 'Editar evento' : 'Novo evento'}</h2>
        <div class="form-err" id="eventoErr" style="display:none;"></div>
        <div class="field"><label>Cliente</label>
          <select id="f_idCliente">${clientes.length ? opcoesClientes : '<option value="">Cadastre um cliente primeiro</option>'}</select>
        </div>
        <div class="row3">
          <div class="field"><label>Status</label>
            <select id="f_status">${opcoesSelect(listas['Status evento'], editando?evento.Status:'')}</select>
          </div>
          <div class="field"><label>Data do evento</label><input id="f_data" placeholder="DD/MM/AAAA" value="${esc(editando?evento['Data do evento']:'')}"></div>
          <div class="field"><label>Tipo de evento</label><select id="f_tipo">${opcoesSelect(listas['Tipo de evento'], editando?evento['Tipo de evento']:'')}</select></div>
        </div>
        <div class="row2">
          <div class="field"><label>Hora início</label><input id="f_horaIni" placeholder="HH:MM" value="${esc(editando?evento['Hora início']:'')}"></div>
          <div class="field"><label>Hora fim</label><input id="f_horaFim" placeholder="HH:MM" value="${esc(editando?evento['Hora fim']:'')}"></div>
        </div>
        <div class="row2">
          <div class="field"><label>Local</label><input id="f_local" value="${esc(editando?evento['Local']:'')}"></div>
          <div class="field"><label>Cidade</label><input id="f_cidade" value="${esc(editando?evento['Cidade']:'')}"></div>
        </div>
        <div class="row3">
          <div class="field"><label>Pacote</label><select id="f_pacote">${opcoesSelect(listas['Pacote'], editando?evento['Pacote']:'')}</select></div>
          <div class="field"><label>Valor pacote</label><input id="f_valorPacote" type="number" step="0.01" value="${esc(editando?evento['Valor pacote']:'')}"></div>
          <div class="field"><label>Valor final</label><input id="f_valorFinal" type="number" step="0.01" value="${esc(editando?evento['Valor final']:'')}"></div>
        </div>
        <div class="field"><label>Observações</label><textarea id="f_obs" rows="3">${esc(editando?evento['Observações']:'')}</textarea></div>
        <div class="form-actions">
          ${editando ? `<button class="btn-danger" id="excluirEvento" type="button">Excluir</button>` : ''}
          <button class="btn-ghost" id="cancelarEvento">Cancelar</button>
          <button class="btn-primary" id="salvarEvento">${editando?'Salvar alterações':'Criar evento'}</button>
        </div>
      </div>
    </div>`;
  document.getElementById('cancelarEvento').addEventListener('click', fecharOverlay);
  document.getElementById('salvarEvento').addEventListener('click', () => salvarEvento(editando ? evento['ID Evento'] : null));
  if (editando){
    document.getElementById('excluirEvento').addEventListener('click', () => excluirEventoComConfirmacao(evento));
  }
  aplicarMascara('f_data', maskData);
  aplicarMascara('f_horaIni', maskHora);
  aplicarMascara('f_horaFim', maskHora);
}
async function salvarEvento(idEvento){
  const idCliente = document.getElementById('f_idCliente').value;
  if (!idCliente){ mostrarErro('eventoErr','Escolha um cliente.'); return; }
  const dados = {
    idCliente,
    status: document.getElementById('f_status').value,
    dataEvento: document.getElementById('f_data').value.trim(),
    tipoEvento: document.getElementById('f_tipo').value.trim(),
    horaInicio: document.getElementById('f_horaIni').value.trim(),
    horaFim: document.getElementById('f_horaFim').value.trim(),
    local: document.getElementById('f_local').value.trim(),
    cidade: document.getElementById('f_cidade').value.trim(),
    pacote: document.getElementById('f_pacote').value.trim(),
    valorPacote: Number(document.getElementById('f_valorPacote').value || 0),
    valorFinal: Number(document.getElementById('f_valorFinal').value || 0),
    observacoes: document.getElementById('f_obs').value.trim(),
  };
  const btn = document.getElementById('salvarEvento'); btn.disabled = true; btn.textContent = 'Salvando…';
  try{
    if (idEvento) await apiCall('atualizarEvento', Object.assign({ idEvento }, dados));
    else await apiCall('criarEvento', dados);
    loaded = false; fecharOverlay(); await renderMain(); showToast(idEvento ? 'Evento atualizado.' : 'Evento criado e adicionado à Agenda.');
  } catch(err){ mostrarErro('eventoErr', err.message); btn.disabled=false; btn.textContent = idEvento?'Salvar alterações':'Criar evento'; }
}
 
