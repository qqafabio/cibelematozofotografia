/* ============================================================
   CRM · Cibele Matozo Fotografia — Módulo: Eventos Coletivos
   Carregado como <script> clássico (escopo global compartilhado).
   NÃO usar import/export: os handlers onclick inline e o estado
   global dependem deste escopo. Ordem de carga definida em crm.html.
   ============================================================ */

/* ============ EVENTOS COLETIVOS + PARTICIPANTES ============ */
/* Um evento coletivo é um Evento com "Coletivo" = "Sim" (muitos clientes num
   só evento: Formatura, Crisma, Investidura, etc.). O responsável é o
   organizador (igreja/escola); cada participante vira Cliente real e ganha uma
   conta no Financeiro com o valor do pacote. */

const PARTICIPANTE_STATUS = ['Sem contato', 'Interessado', 'Comprou', 'Pago', 'Não quis'];

function eventosColetivosLista(){
  return eventos.filter(e => String(e['Coletivo']) === 'Sim');
}
function participantesDoEvento(idEvento){
  return (participantes || []).filter(p => String(p['ID Evento']) === String(idEvento));
}
/* "Valor foto extra" aplicável ao evento (espelha valorFotoExtraDoEvento_ do back-end):
   prioriza o valor próprio do evento; se não houver, cai no cadastro de Pacotes pelo nome.
   Usado para calcular o previsto localmente e atualizar a tela na hora, sem esperar a rede. */
function valorFotoExtraDoEventoFront(ev){
  const doEvento = Number(ev && ev['Valor foto extra'] || 0);
  if (doEvento > 0) return doEvento;
  const nome = String(ev && ev['Pacote'] || '').trim();
  if (!nome) return 0;
  const p = (pacotes || []).find(x => String(x['Nome']).trim() === nome);
  return p ? Number(p['Valor foto extra'] || 0) : 0;
}
/* Soma as contas do participante no Financeiro (ignora Canceladas). As linhas de
   "Desconto" não entram no previsto: viram um abatimento à parte, subtraído do saldo. */
function contasDoParticipante(idEvento, idCliente){
  const linhas = (financeiro || []).filter(f =>
    String(f['ID Evento']) === String(idEvento) &&
    String(f['ID Cliente']) === String(idCliente) &&
    String(f['Status']) !== 'Cancelado');
  const previsto = linhas.filter(f => String(f['Tipo cobrança']) !== 'Desconto')
    .reduce((s, f) => s + Number(f['Valor previsto'] || 0), 0);
  const pago = linhas.reduce((s, f) => s + Number(f['Valor pago'] || 0), 0);
  const desconto = linhas.filter(f => String(f['Tipo cobrança']) === 'Desconto')
    .reduce((s, f) => s + Number(f['Valor previsto'] || 0), 0);
  return { previsto, pago, desconto, saldo: previsto - pago - desconto };
}

function renderEventosColetivos(main){
  const lista = eventosColetivosLista();
  main.innerHTML = `
    <div class="view-header">
      <div><h1>Eventos Coletivos</h1><p>${lista.length} evento${lista.length===1?'':'s'} com muitos participantes (formatura, crisma, investidura…).</p></div>
      <button class="btn-primary" id="novoColetivoBtn">+ Novo evento coletivo</button>
    </div>
    <div class="panel"><div id="tabelaColetivos"></div></div>
  `;
  document.getElementById('novoColetivoBtn').addEventListener('click', () => abrirFormEventoColetivo(null));
  desenharTabelaColetivos();
}
function desenharTabelaColetivos(){
  const el = document.getElementById('tabelaColetivos');
  const lista = eventosColetivosLista();
  if (!lista.length){ el.innerHTML = `<div class="empty-state">Nenhum evento coletivo cadastrado ainda.</div>`; return; }
  const ordenados = [...lista].sort((a,b) => (parseDataBR(b['Data do evento'])||0) - (parseDataBR(a['Data do evento'])||0));
  el.innerHTML = `
    <table class="responsive-table">
      <thead><tr><th>Data</th><th>Tipo</th><th>Organizador</th><th>Local</th><th>Participantes</th><th>Pacote</th></tr></thead>
      <tbody>${ordenados.map(e => `
        <tr class="clickable" data-id="${esc(e['ID Evento'])}">
          <td data-label="Data">${esc(e['Data do evento'])}</td>
          <td data-label="Tipo">${esc(e['Tipo de evento'])}</td>
          <td data-label="Organizador">${esc(e['Organizador']||e['Cliente / Responsável'])}</td>
          <td data-label="Local">${esc(e['Local'])}</td>
          <td data-label="Participantes">${participantesDoEvento(e['ID Evento']).length}</td>
          <td data-label="Pacote">${esc(e['Pacote'])}</td>
        </tr>`).join('')}</tbody>
    </table>`;
  el.querySelectorAll('tr.clickable').forEach(row => {
    row.addEventListener('click', () => {
      const ev = eventos.find(e => String(e['ID Evento']) === row.dataset.id);
      abrirDetalheColetivo(ev['ID Evento']);
    });
  });
}

function abrirFormEventoColetivo(evento){
  const editando = !!evento;
  document.getElementById('overlayRoot').innerHTML = `
    <div class="form-overlay" id="overlay">
      <div class="form-panel">
        <h2>${editando ? 'Editar evento coletivo' : 'Novo evento coletivo'}</h2>
        <div class="form-err" id="coletivoErr" style="display:none;"></div>
        <div class="row2">
          <div class="field"><label>Tipo de evento</label><select id="f_tipo">${opcoesSelect(listas['Tipo de evento'], editando?evento['Tipo de evento']:'')}</select></div>
          <div class="field"><label>Organizador (igreja/escola)</label><input id="f_organizador" value="${esc(editando?(evento['Organizador']||evento['Cliente / Responsável']):'')}"></div>
        </div>
        <div class="row3">
          <div class="field"><label>Status</label><select id="f_status">${opcoesSelect(listas['Status evento'], editando?evento['Status']:'')}</select></div>
          <div class="field"><label>Data do evento</label><input id="f_data" placeholder="DD/MM/AAAA" value="${esc(editando?evento['Data do evento']:'')}"></div>
          <div class="field"><label>Local</label><input id="f_local" value="${esc(editando?evento['Local']:'')}"></div>
        </div>
        <div class="row3">
          <div class="field"><label>Hora início</label><input id="f_horaIni" placeholder="HH:MM" value="${esc(editando?evento['Hora início']:'')}"></div>
          <div class="field"><label>Hora fim</label><input id="f_horaFim" placeholder="HH:MM" value="${esc(editando?evento['Hora fim']:'')}"></div>
          <div class="field"><label>Cidade</label><input id="f_cidade" value="${esc(editando?evento['Cidade']:'')}"></div>
        </div>
        <div class="row2">
          <div class="field"><label>Pacote padrão</label><select id="f_pacote">${opcoesPacotes(editando?evento['Pacote']:'')}</select></div>
          <div class="field"><label>Valor pacote (por participante)</label><input id="f_valorPacote" type="number" step="0.01" value="${esc(editando?evento['Valor pacote']:'')}"></div>
        </div>
        <div class="row2">
          <div class="field"><label>Valor foto extra (por foto)</label><input id="f_valorFotoExtra" type="number" step="0.01" value="${esc(editando?evento['Valor foto extra']:'')}"></div>
          <div class="field"></div>
        </div>
        <div class="field"><label>Observações</label><textarea id="f_obs" rows="2">${esc(editando?evento['Observações']:'')}</textarea></div>
        <div class="form-actions">
          <button class="btn-ghost" id="cancelarColetivo">Cancelar</button>
          <button class="btn-primary" id="salvarColetivo">${editando?'Salvar alterações':'Criar evento coletivo'}</button>
        </div>
      </div>
    </div>`;
  document.getElementById('cancelarColetivo').addEventListener('click', fecharOverlay);
  document.getElementById('salvarColetivo').addEventListener('click', () => salvarEventoColetivo(editando ? evento['ID Evento'] : null));
  aplicarMascara('f_data', maskData);
  aplicarMascara('f_horaIni', maskHora);
  aplicarMascara('f_horaFim', maskHora);
  vincularAutoValorPacote('f_pacote', 'f_valorPacote', { inputFotoExtraId: 'f_valorFotoExtra' });
}
async function salvarEventoColetivo(idEvento){
  const dados = {
    status: document.getElementById('f_status').value,
    tipoEvento: document.getElementById('f_tipo').value.trim(),
    organizador: document.getElementById('f_organizador').value.trim(),
    dataEvento: document.getElementById('f_data').value.trim(),
    horaInicio: document.getElementById('f_horaIni').value.trim(),
    horaFim: document.getElementById('f_horaFim').value.trim(),
    local: document.getElementById('f_local').value.trim(),
    cidade: document.getElementById('f_cidade').value.trim(),
    pacote: document.getElementById('f_pacote').value.trim(),
    valorPacote: Number(document.getElementById('f_valorPacote').value || 0),
    valorFotoExtra: Number(document.getElementById('f_valorFotoExtra').value || 0),
    observacoes: document.getElementById('f_obs').value.trim(),
  };
  if (!dados.organizador){ mostrarErro('coletivoErr','Informe o organizador (igreja/escola).'); return; }
  const btn = document.getElementById('salvarColetivo'); btn.disabled = true; btn.textContent = 'Salvando…';
  try{
    let idAlvo = idEvento;
    if (idEvento){
      await apiCall('atualizarEvento', Object.assign({ idEvento }, dados));
    } else {
      const novo = await apiCall('criarEventoColetivo', dados);
      idAlvo = novo && novo['ID Evento'];
    }
    loaded = false; await carregarTudo(); fecharOverlay();
    if (idAlvo) abrirDetalheColetivo(idAlvo); else renderMain();
    showToast(idEvento ? 'Evento atualizado.' : 'Evento coletivo criado.');
  } catch(err){ mostrarErro('coletivoErr', err.message); btn.disabled=false; btn.textContent = idEvento?'Salvar alterações':'Criar evento coletivo'; }
}

/* ---------- Detalhe do evento coletivo (cabeçalho + importação + participantes) ---------- */
/* Painel-resumo (participantes/previsto/recebido/saldo) — extraído para atualizar só
   esse trecho após uma edição, sem redesenhar a tela inteira. */
function htmlResumoColetivo(idEvento){
  const parts = participantesDoEvento(idEvento);
  let totalPrevisto = 0, totalPago = 0, totalDesconto = 0, totalSaldo = 0;
  parts.forEach(p => {
    const c = contasDoParticipante(idEvento, p['ID Cliente']);
    totalPrevisto += c.previsto; totalPago += c.pago; totalDesconto += c.desconto;
    totalSaldo += Math.max(0, c.saldo);
  });
  const descontoHtml = totalDesconto > 0 ? `<div>Desconto: <strong>${formatBRL(totalDesconto)}</strong></div>` : '';
  return `
    <div style="display:flex;gap:24px;flex-wrap:wrap;">
      <div><strong>${parts.length}</strong> participante${parts.length===1?'':'s'}</div>
      <div>Previsto: <strong>${formatBRL(totalPrevisto)}</strong></div>
      <div>Recebido: <strong>${formatBRL(totalPago)}</strong></div>
      ${descontoHtml}
      <div>Saldo: <strong>${formatBRL(totalSaldo)}</strong></div>
    </div>`;
}
function atualizarResumoDetalheColetivo(idEvento){
  const el = document.getElementById('resumoColetivo');
  if (el) el.innerHTML = htmlResumoColetivo(idEvento);
}
function abrirDetalheColetivo(idEvento){
  const main = document.getElementById('mainArea');
  const ev = eventos.find(e => String(e['ID Evento']) === String(idEvento));
  if (!ev){ renderMain(); return; }
  main.innerHTML = `
    <div class="view-header">
      <div>
        <h1>${esc(ev['Tipo de evento']||'Evento coletivo')} · ${esc(ev['Organizador']||ev['Cliente / Responsável'])}</h1>
        <p>${esc(ev['Data do evento']||'(sem data)')} · ${esc(ev['Local']||'')} · Pacote: ${esc(ev['Pacote']||'—')} (${formatBRL(ev['Valor pacote'])})</p>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn-ghost" id="voltarColetivos">← Voltar</button>
        <button class="btn-ghost" id="editarColetivo">✏️ Editar cabeçalho</button>
        <button class="btn-danger" id="excluirColetivo">🗑 Excluir evento</button>
      </div>
    </div>

    <div class="panel" id="resumoColetivo" style="margin-bottom:16px;padding:16px;">${htmlResumoColetivo(idEvento)}</div>

    <div class="panel" style="margin-bottom:16px;padding:16px;">
      <h3 style="margin:0 0 8px;color:var(--gold);">Importar participantes</h3>
      <p style="margin:0 0 8px;color:var(--ink-soft);font-size:13px;">Um por linha. Aceita só o nome, ou <code>Nome, WhatsApp</code>. Cada um vira Cliente e recebe uma conta com o valor do pacote (${formatBRL(ev['Valor pacote'])}).</p>
      <textarea id="importarLista" rows="5" style="width:100%;font-family:monospace;font-size:13px;" placeholder="Maria Silva, (41) 99999-0000&#10;João Souza&#10;Ana Paula"></textarea>
      <div class="form-err" id="importarErr" style="display:none;margin-top:8px;"></div>
      <div style="margin-top:8px;text-align:right;"><button class="btn-primary" id="importarBtn">Importar lista</button></div>
    </div>

    <div class="search-box"><input type="text" id="buscaParticipante" placeholder="Buscar participante por nome…"></div>
    <div class="panel"><div id="tabelaParticipantes"></div></div>
  `;
  document.getElementById('voltarColetivos').addEventListener('click', () => renderMain());
  document.getElementById('editarColetivo').addEventListener('click', () => abrirFormEventoColetivo(ev));
  document.getElementById('excluirColetivo').addEventListener('click', () => excluirEventoColetivoComConfirmacao(ev));
  document.getElementById('importarBtn').addEventListener('click', () => importarParticipantesUI(idEvento));
  document.getElementById('buscaParticipante').addEventListener('input', e => desenharTabelaParticipantes(idEvento, e.target.value));
  desenharTabelaParticipantes(idEvento, '');
}
function desenharTabelaParticipantes(idEvento, filtro){
  const el = document.getElementById('tabelaParticipantes');
  if (!el) return;
  const f = (filtro||'').trim().toLowerCase();
  const parts = participantesDoEvento(idEvento)
    .filter(p => !f || String(p['Nome participante']||'').toLowerCase().includes(f));
  if (!parts.length){ el.innerHTML = `<div class="empty-state">Nenhum participante ${f?'encontrado':'importado ainda'}.</div>`; return; }
  el.innerHTML = `
    <table class="responsive-table">
      <thead><tr><th>Nome</th><th>Status</th><th>Fotos extras</th><th>Previsto</th><th>Pago</th><th>Desconto</th><th>Saldo</th></tr></thead>
      <tbody>${parts.map(p => {
        const c = contasDoParticipante(idEvento, p['ID Cliente']);
        const statusOpts = PARTICIPANTE_STATUS.map(s => `<option value="${esc(s)}" ${String(p['Status compra'])===s?'selected':''}>${esc(s)}</option>`).join('');
        return `
        <tr data-id="${esc(p['ID'])}">
          <td data-label="Nome">${esc(p['Nome participante'])}</td>
          <td data-label="Status"><select class="part-status" data-id="${esc(p['ID'])}" style="padding:4px;">${statusOpts}</select></td>
          <td data-label="Fotos extras"><input class="part-extras" data-id="${esc(p['ID'])}" type="number" step="1" min="0" value="${esc(p['Qtd fotos extras']||0)}" style="width:70px;padding:4px;"></td>
          <td data-label="Previsto">${formatBRL(c.previsto)}</td>
          <td data-label="Pago">${formatBRL(c.pago)}</td>
          <td data-label="Desconto"><input class="part-desconto" data-id="${esc(p['ID'])}" type="number" step="0.01" min="0" value="${esc(c.desconto||'')}" style="width:90px;padding:4px;"></td>
          <td data-label="Saldo"><strong>${formatBRL(Math.max(0, c.saldo))}</strong></td>
        </tr>`;
      }).join('')}</tbody>
    </table>`;
  el.querySelectorAll('.part-status').forEach(sel => {
    sel.addEventListener('change', () => salvarParticipante(idEvento, sel.dataset.id, { statusCompra: sel.value }));
  });
  el.querySelectorAll('.part-extras').forEach(inp => {
    inp.addEventListener('change', () => salvarParticipante(idEvento, inp.dataset.id, { qtdFotosExtras: Number(inp.value || 0) }));
  });
  el.querySelectorAll('.part-desconto').forEach(inp => {
    inp.addEventListener('change', () => salvarParticipante(idEvento, inp.dataset.id, { desconto: Number(inp.value || 0) }));
  });
}
async function importarParticipantesUI(idEvento){
  const raw = document.getElementById('importarLista').value;
  const lista = String(raw || '').split('\n').map(linha => {
    const l = linha.trim();
    if (!l) return null;
    const partes = l.split(',');
    return { nome: (partes[0]||'').trim(), whatsapp: (partes[1]||'').trim() };
  }).filter(x => x && x.nome);
  if (!lista.length){ mostrarErro('importarErr', 'Cole ao menos um nome.'); return; }
  const btn = document.getElementById('importarBtn'); btn.disabled = true; btn.textContent = 'Importando…';
  try{
    const r = await apiCall('importarParticipantes', { idEvento, lista });
    loaded = false; await carregarTudo();
    abrirDetalheColetivo(idEvento);
    showToast(`Importados: ${r.criados} · Ignorados: ${r.ignorados}`);
  } catch(err){ mostrarErro('importarErr', err.message); btn.disabled=false; btn.textContent = 'Importar lista'; }
}
/* Aplica localmente a mudança de um participante (espelha atualizarParticipante do back-end),
   para a tela refletir na hora. O back-end reconcilia depois. */
function aplicarMudancaParticipanteLocal(ev, part, campos){
  const idEvento = ev['ID Evento'], idCliente = part['ID Cliente'];
  if (campos.statusCompra !== undefined){
    part['Status compra'] = campos.statusCompra;
    if (campos.statusCompra === 'Não quis'){
      (financeiro || []).forEach(f => {
        if (String(f['ID Evento']) === String(idEvento) && String(f['ID Cliente']) === String(idCliente) && String(f['Status']) !== 'Pago'){
          f['Status'] = 'Cancelado';
        }
      });
    }
  }
  if (campos.qtdFotosExtras !== undefined){
    const qtd = Number(campos.qtdFotosExtras || 0);
    part['Qtd fotos extras'] = qtd;
    const totalExtras = qtd * valorFotoExtraDoEventoFront(ev);
    const idx = (financeiro || []).findIndex(f =>
      String(f['ID Evento']) === String(idEvento) && String(f['ID Cliente']) === String(idCliente) &&
      String(f['Tipo cobrança']) === 'Fotos extras');
    if (totalExtras > 0){
      if (idx >= 0){
        const pago = Number(financeiro[idx]['Valor pago'] || 0);
        financeiro[idx]['Valor previsto'] = totalExtras;
        financeiro[idx]['Saldo'] = totalExtras - pago;
      } else {
        financeiro.push({
          'ID Parcela': 'tmp-' + Date.now(), 'ID Evento': idEvento, 'ID Cliente': idCliente,
          'Cliente': part['Nome participante'], 'Tipo cobrança': 'Fotos extras',
          'Vencimento': '', 'Valor previsto': totalExtras, 'Status': 'Pendente',
          'Valor pago': 0, 'Saldo': totalExtras,
        });
      }
    } else if (idx >= 0){
      financeiro.splice(idx, 1);
    }
  }
  if (campos.desconto !== undefined){
    const desc = Number(campos.desconto || 0);
    const idx = (financeiro || []).findIndex(f =>
      String(f['ID Evento']) === String(idEvento) && String(f['ID Cliente']) === String(idCliente) &&
      String(f['Tipo cobrança']) === 'Desconto');
    if (desc > 0){
      if (idx >= 0){
        financeiro[idx]['Valor previsto'] = desc;
        financeiro[idx]['Saldo'] = 0;
      } else {
        financeiro.push({
          'ID Parcela': 'tmp-' + Date.now(), 'ID Evento': idEvento, 'ID Cliente': idCliente,
          'Cliente': part['Nome participante'], 'Tipo cobrança': 'Desconto',
          'Vencimento': '', 'Valor previsto': desc, 'Status': 'Aplicado',
          'Valor pago': 0, 'Saldo': 0,
        });
      }
    } else if (idx >= 0){
      financeiro.splice(idx, 1);
    }
  }
}
async function salvarParticipante(idEvento, idParticipante, campos){
  const ev = eventos.find(e => String(e['ID Evento']) === String(idEvento));
  const part = (participantes || []).find(p => String(p['ID']) === String(idParticipante));
  // 1) Atualização otimista: reflete na tela imediatamente, sem esperar o Apps Script.
  if (ev && part) aplicarMudancaParticipanteLocal(ev, part, campos);
  const filtro = (document.getElementById('buscaParticipante') || {}).value || '';
  atualizarResumoDetalheColetivo(idEvento);
  desenharTabelaParticipantes(idEvento, filtro);
  // 2) Persiste em segundo plano e reconcilia com o estado fresco do back-end.
  try{
    const r = await apiCall('atualizarParticipante', Object.assign({ id: idParticipante }, campos));
    if (r && Array.isArray(r.participantes) && Array.isArray(r.financeiro)){
      participantes = r.participantes;
      financeiro = r.financeiro;
    } else {
      loaded = false; await carregarTudo();
    }
    const f2 = (document.getElementById('buscaParticipante') || {}).value || filtro;
    atualizarResumoDetalheColetivo(idEvento);
    desenharTabelaParticipantes(idEvento, f2);
  } catch(err){
    loaded = false; await carregarTudo();
    abrirDetalheColetivo(idEvento);
    showToast('❌ ' + err.message);
  }
}
/* Exclui o evento coletivo com as mesmas validações do evento individual (bloqueia se
   houver valor recebido; permite exclusão forçada). Cascata no back-end remove também
   os participantes, produção, agenda, custos e parcelas do Financeiro. */
async function excluirEventoColetivoComConfirmacao(evento){
  const n = participantesDoEvento(evento['ID Evento']).length;
  const mensagem = `Excluir o evento coletivo "${evento['Tipo de evento']||'—'} · ${evento['Organizador']||evento['Cliente / Responsável']||''}"? Isso remove os ${n} participante${n===1?'':'s'} do evento, a produção, o compromisso na Agenda, os custos e as parcelas do Financeiro. Os clientes cadastrados continuam na base. Não pode ser desfeito.`;
  if (!await confirmarAcao({ titulo: 'Excluir evento coletivo?', texto: mensagem })) return;
  const btn = document.getElementById('excluirColetivo');
  if (btn){ btn.disabled = true; btn.textContent = 'Excluindo…'; }
  try{
    await apiCall('excluirEvento', { idEvento: evento['ID Evento'] });
    loaded = false; await renderMain(); showToast('Evento coletivo excluído.');
  } catch(err){
    const bloqueadoPorPagamento = /recebido/.test(err.message);
    if (bloqueadoPorPagamento && await confirmarAcao({ titulo: 'Exclusão forçada?', texto: err.message + '\n\nSe for um evento de teste, você pode excluir mesmo assim — isso apaga também o valor recebido do Financeiro, sem estorno real. Confirma a exclusão forçada?', confirmar: 'Excluir assim mesmo' })){
      try{
        await apiCall('excluirEvento', { idEvento: evento['ID Evento'], forcar: true });
        loaded = false; await renderMain(); showToast('Evento coletivo excluído.');
        return;
      } catch(err2){ showToast('❌ ' + err2.message); }
    } else {
      showToast('❌ ' + err.message);
    }
    if (btn){ btn.disabled = false; btn.textContent = '🗑 Excluir evento'; }
  }
}
