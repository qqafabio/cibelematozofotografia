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
  const totalIndividuais = eventos.filter(e => String(e['Coletivo']) !== 'Sim').length;
  const opcoesStatus = `<option value="">Todos os status</option>` +
    (listas['Status evento'] || []).map(v =>
      `<option value="${esc(v)}" ${eventosFiltroStatus===v?'selected':''}>${esc(v)}</option>`).join('');
  main.innerHTML = `
    <div class="view-header">
      <div><h1>Eventos</h1><p>${totalIndividuais} registrados. Novo evento cria automaticamente o compromisso na Agenda.</p></div>
      <button class="btn-primary" id="novoEventoBtn">+ Novo evento</button>
    </div>
    <div class="list-toolbar">
      <div class="search-box"><input type="text" id="buscaEvento" placeholder="Buscar por cliente ou tipo…" value="${esc(eventosBusca)}"></div>
      <select id="filtroStatusEvento" class="list-filter">${opcoesStatus}</select>
    </div>
    <div class="panel"><div id="tabelaEventos"></div></div>
  `;
  document.getElementById('novoEventoBtn').addEventListener('click', () => abrirFormEvento(null));
  document.getElementById('buscaEvento').addEventListener('input', e => { eventosBusca = e.target.value; desenharTabelaEventos(); });
  document.getElementById('filtroStatusEvento').addEventListener('change', e => { eventosFiltroStatus = e.target.value; desenharTabelaEventos(); });
  desenharTabelaEventos();
}
function desenharTabelaEventos(){
  const el = document.getElementById('tabelaEventos');
  const individuais = eventos.filter(e => String(e['Coletivo']) !== 'Sim');
  if (!individuais.length){ el.innerHTML = `<div class="empty-state">Nenhum evento cadastrado ainda.</div>`; return; }
  const termo = (eventosBusca || '').trim().toLowerCase();
  const filtrados = individuais.filter(e => {
    if (eventosFiltroStatus && String(e.Status) !== eventosFiltroStatus) return false;
    if (!termo) return true;
    const alvo = `${e['Cliente / Responsável']||''} ${e['Tipo de evento']||''}`.toLowerCase();
    return alvo.includes(termo);
  });
  if (!filtrados.length){ el.innerHTML = `<div class="empty-state">Nenhum evento encontrado com esses filtros.</div>`; return; }
  const ordenados = [...filtrados].sort((a,b) => (parseDataBR(b['Data do evento'])||0) - (parseDataBR(a['Data do evento'])||0));
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
    row.addEventListener('click', () => abrirDetalheEvento(row.dataset.id));
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
          <div class="field"><label>Pacote</label><select id="f_pacote">${opcoesPacotes(editando?evento['Pacote']:'')}</select></div>
          <div class="field"><label>Valor pacote</label><input id="f_valorPacote" type="number" step="0.01" value="${esc(editando?evento['Valor pacote']:'')}"></div>
          <div class="field"><label>Desconto (R$)</label><input id="f_desconto" type="number" step="0.01" min="0" value="${esc(editando?evento['Desconto']:'')}"></div>
        </div>
        <div class="field"><label>Valor final</label><input id="f_valorFinal" type="number" step="0.01" value="${esc(editando?evento['Valor final']:'')}"></div>
        <p style="font-size:12px;color:var(--ink-soft);margin:-8px 0 14px;">Calculado como Valor pacote − Desconto. Você pode ajustar manualmente.</p>
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
  vincularAutoValorPacote('f_pacote', 'f_valorPacote');
  // Valor final = Valor pacote − Desconto, recalculado ao vivo (campo segue editável).
  const recalcularValorFinal = () => {
    const vp = Number(document.getElementById('f_valorPacote').value || 0);
    const desc = Number(document.getElementById('f_desconto').value || 0);
    document.getElementById('f_valorFinal').value = Math.max(0, vp - desc);
  };
  document.getElementById('f_pacote').addEventListener('change', recalcularValorFinal);
  document.getElementById('f_valorPacote').addEventListener('input', recalcularValorFinal);
  document.getElementById('f_desconto').addEventListener('input', recalcularValorFinal);
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
    desconto: Number(document.getElementById('f_desconto').value || 0),
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

/* ============ DETALHE DO EVENTO (individual) — tela com abas ============ */
const NFSE_URL = 'https://www.nfse.gov.br/EmissorNacional/Login?ReturnUrl=%2fEmissorNacional';

/* Navega para a tela de detalhe do evento. Usa a view 'eventoDetalhe' (router.js)
   para que re-renders após editar/salvar permaneçam no detalhe. */
function abrirDetalheEvento(idEvento){
  eventoDetalheId = idEvento;
  currentView = 'eventoDetalhe';
  renderNav();
  renderMain();
}
function voltarParaEventos(){
  currentView = 'eventos';
  renderNav();
  renderMain();
}
/* Conta do evento individual no Financeiro (idCliente vazio ⇒ 1 conta por evento). */
function contaDoEvento(idEvento){
  return agruparContas().find(c => String(c.idEvento) === String(idEvento) && !c.idCliente) || null;
}
function producaoDoEvento(idEvento){
  return (producao || []).find(p => String(p['ID Evento']) === String(idEvento)) || null;
}

function renderDetalheEvento(main){
  const ev = eventos.find(e => String(e['ID Evento']) === String(eventoDetalheId));
  if (!ev){ voltarParaEventos(); return; } // evento sumiu (ex.: excluído) → volta à lista
  const confirmado = String(ev.Status).toLowerCase() === 'confirmado';
  const hora = [ev['Hora início'], ev['Hora fim']].filter(Boolean).join(' – ');
  const localCidade = [ev['Local'], ev['Cidade']].filter(Boolean).join(' · ');
  main.innerHTML = `
    <div class="detalhe-head">
      <div class="detalhe-head-top">
        <button class="btn-ghost" id="voltarEvento">← Voltar</button>
        <div class="detalhe-actions">
          <button class="btn-ghost" id="editarEvento">✏️ Editar</button>
          <a class="btn-ghost" href="${NFSE_URL}" target="_blank" rel="noopener">Emitir NFS-e</a>
          <button class="btn-danger" id="excluirEventoDetalhe">🗑 Excluir</button>
        </div>
      </div>
      <h1>${esc(ev['Cliente / Responsável']||'Evento')} <span class="status-pill ${confirmado?'confirmado':''}">${esc(ev.Status)}</span></h1>
      <div class="detalhe-fatos">
        <span><i class="bi bi-calendar-event"></i> ${esc(ev['Data do evento']||'—')}</span>
        ${hora ? `<span><i class="bi bi-clock"></i> ${esc(hora)}</span>` : ''}
        ${ev['Tipo de evento'] ? `<span><i class="bi bi-camera"></i> ${esc(ev['Tipo de evento'])}</span>` : ''}
        ${localCidade ? `<span><i class="bi bi-geo-alt"></i> ${esc(localCidade)}</span>` : ''}
        <span><i class="bi bi-cash-coin"></i> ${formatBRL(ev['Valor final'])}</span>
      </div>
    </div>

    <ul class="nav nav-tabs" id="abasEvento" role="tablist">
      <li class="nav-item" role="presentation">
        <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#aba-resumo" type="button" role="tab">Resumo</button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" data-bs-toggle="tab" data-bs-target="#aba-financeiro" type="button" role="tab">Financeiro</button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" data-bs-toggle="tab" data-bs-target="#aba-producao" type="button" role="tab">Produção</button>
      </li>
    </ul>
    <div class="tab-content">
      <div class="tab-pane fade show active" id="aba-resumo" role="tabpanel">${htmlAbaResumo(ev)}</div>
      <div class="tab-pane fade" id="aba-financeiro" role="tabpanel">${htmlAbaFinanceiro(ev)}</div>
      <div class="tab-pane fade" id="aba-producao" role="tabpanel">${htmlAbaProducao(ev)}</div>
    </div>
  `;
  document.getElementById('voltarEvento').addEventListener('click', voltarParaEventos);
  document.getElementById('editarEvento').addEventListener('click', () => abrirFormEvento(ev));
  document.getElementById('excluirEventoDetalhe').addEventListener('click', () => excluirEventoComConfirmacao(ev));
  const abrirConta = document.getElementById('abaAbrirConta');
  if (abrirConta){ const conta = contaDoEvento(ev['ID Evento']); abrirConta.addEventListener('click', () => abrirFormConta(conta)); }
  const abrirProd = document.getElementById('abaAbrirProducao');
  if (abrirProd){ const prod = producaoDoEvento(ev['ID Evento']); abrirProd.addEventListener('click', () => abrirFormProducao(prod)); }
}

/* -------- Aba Resumo: campos do evento + mini-resumo financeiro + produção -------- */
function htmlAbaResumo(ev){
  const conta = contaDoEvento(ev['ID Evento']);
  const prod = producaoDoEvento(ev['ID Evento']);
  const fato = (rotulo, valor) => `<div class="detalhe-campo"><span class="dc-label">${rotulo}</span><span class="dc-valor">${valor}</span></div>`;
  const campos = [
    fato('Pacote', esc(ev['Pacote']||'—')),
    fato('Valor pacote', formatBRL(ev['Valor pacote'])),
    fato('Desconto', Number(ev['Desconto']||0) > 0 ? formatBRL(ev['Desconto']) : '—'),
    fato('Valor final', formatBRL(ev['Valor final'])),
  ].join('');
  let financeiroResumo = '<p class="detalhe-vazio">Sem conta lançada no Financeiro.</p>';
  if (conta){
    financeiroResumo = `<div class="detalhe-grid">
      ${fato('Previsto', formatBRL(conta.totalPrevisto))}
      ${fato('Recebido', formatBRL(conta.totalPago))}
      ${conta.desconto > 0 ? fato('Desconto', formatBRL(conta.desconto)) : ''}
      ${fato('Saldo', formatBRL(Math.max(0, conta.saldo)))}
    </div>`;
  }
  const entrega = prod ? (prod['Entrega'] || prod['Entrega final'] || '—') : null;
  const producaoResumo = prod
    ? `<div class="detalhe-grid">${fato('Entrega', esc(entrega))}${fato('Edição foto', esc(prod['Edição foto']||'—'))}</div>`
    : '<p class="detalhe-vazio">Sem registro de produção.</p>';
  const obs = ev['Observações'] ? `<div class="detalhe-bloco"><h3>Observações</h3><p>${esc(ev['Observações'])}</p></div>` : '';
  return `
    <div class="detalhe-bloco"><h3>Dados do evento</h3><div class="detalhe-grid">${campos}</div></div>
    <div class="detalhe-bloco"><h3>Financeiro</h3>${financeiroResumo}</div>
    <div class="detalhe-bloco"><h3>Produção</h3>${producaoResumo}</div>
    ${obs}`;
}

/* -------- Aba Financeiro: parcelas da conta do evento -------- */
function htmlAbaFinanceiro(ev){
  const conta = contaDoEvento(ev['ID Evento']);
  if (!conta){
    return `<div class="detalhe-bloco"><p class="detalhe-vazio">Nenhuma conta lançada para este evento.</p>
      <button class="btn-primary" onclick="abrirFormConta(null)">+ Nova conta</button></div>`;
  }
  const parcelas = conta.parcelas.filter(p => String(p['Tipo cobrança']) !== 'Desconto');
  const linhas = parcelas.map(p => {
    const st = String(p['Status']||'');
    const cls = st === 'Pago' ? 'confirmado' : (st === 'Vencida' ? 'vencida' : '');
    return `<tr>
      <td data-label="Tipo">${esc(p['Tipo cobrança']||'—')}</td>
      <td data-label="Vencimento">${esc(p['Vencimento']||'—')}</td>
      <td data-label="Previsto">${formatBRL(p['Valor previsto'])}</td>
      <td data-label="Pago">${formatBRL(p['Valor pago'])}</td>
      <td data-label="Status"><span class="status-pill ${cls}">${esc(st||'—')}</span></td>
    </tr>`;
  }).join('');
  return `
    <div class="detalhe-bloco">
      <div class="detalhe-resumo-linha">
        <span>Previsto: <strong>${formatBRL(conta.totalPrevisto)}</strong></span>
        <span>Recebido: <strong>${formatBRL(conta.totalPago)}</strong></span>
        ${conta.desconto > 0 ? `<span>Desconto: <strong>${formatBRL(conta.desconto)}</strong></span>` : ''}
        <span>Saldo: <strong>${formatBRL(Math.max(0, conta.saldo))}</strong></span>
        <button class="btn-ghost" id="abaAbrirConta" style="margin-left:auto;">Abrir conta</button>
      </div>
      ${parcelas.length ? `<table class="responsive-table">
        <thead><tr><th>Tipo</th><th>Vencimento</th><th>Previsto</th><th>Pago</th><th>Status</th></tr></thead>
        <tbody>${linhas}</tbody>
      </table>` : '<p class="detalhe-vazio">Conta sem parcelas lançadas.</p>'}
    </div>`;
}

/* -------- Aba Produção: etapas e entrega (read-only) -------- */
function htmlAbaProducao(ev){
  const prod = producaoDoEvento(ev['ID Evento']);
  if (!prod){ return `<div class="detalhe-bloco"><p class="detalhe-vazio">Nenhum registro de produção para este evento.</p></div>`; }
  const pill = (valor) => {
    const v = String(valor||'');
    const cls = v.toLowerCase() === 'concluído' ? 'confirmado' : '';
    return `<span class="status-pill ${cls}">${esc(v||'—')}</span>`;
  };
  const etapa = (rotulo, valor) => `<div class="detalhe-campo"><span class="dc-label">${rotulo}</span><span class="dc-valor">${pill(valor)}</span></div>`;
  const campo = (rotulo, valor) => `<div class="detalhe-campo"><span class="dc-label">${rotulo}</span><span class="dc-valor">${esc(valor||'—')}</span></div>`;
  const link = prod['Link das fotos']
    ? `<div class="detalhe-campo"><span class="dc-label">Link das fotos</span><span class="dc-valor"><a href="${esc(prod['Link das fotos'])}" target="_blank" rel="noopener">abrir</a></span></div>`
    : '';
  return `
    <div class="detalhe-bloco"><h3>Etapas</h3>
      <div class="detalhe-grid">
        ${etapa('Backup', prod['Backup'])}
        ${etapa('Seleção', prod['Seleção'])}
        ${etapa('Edição foto', prod['Edição foto'])}
        ${etapa('Edição vídeo', prod['Edição vídeo'])}
        ${etapa('Álbum', prod['Álbum'])}
        ${etapa('Aprovação', prod['Aprovação'])}
        ${etapa('Entrega', prod['Entrega'])}
      </div>
    </div>
    <div class="detalhe-bloco"><h3>Responsáveis e entrega</h3>
      <div class="detalhe-grid">
        ${campo('Fotógrafo', prod['Foto responsável'])}
        ${campo('Cinegrafista', prod['Vídeo responsável'])}
        ${campo('Data entrega', prod['Data entrega'])}
        ${campo('Hora entrega', prod['Hora entrega'])}
        ${campo('Local entrega', prod['Local de entrega'])}
        ${link}
      </div>
      ${prod['Pendências'] ? `<p style="margin:12px 0 0;"><strong>Pendências:</strong> ${esc(prod['Pendências'])}</p>` : ''}
      <div style="margin-top:14px;"><button class="btn-ghost" id="abaAbrirProducao">Abrir produção</button></div>
    </div>`;
}

