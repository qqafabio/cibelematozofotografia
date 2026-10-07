/* ============================================================
   CRM · Cibele Matozo Fotografia — Módulo: Eventos
   Carregado como <script> clássico (escopo global compartilhado).
   NÃO usar import/export: os handlers onclick inline e o estado
   global dependem deste escopo. Ordem de carga definida em crm.html.
   ============================================================ */

/* Paginação da lista (v3.10). eventosBusca/eventosFiltroStatus/eventoDetalheId
   ficam em state.js; a página é estado local desta tela. htmlPaginacao vem de
   clientes.js (carregado antes). */
let eventosPagina = 1;
const EVENTOS_POR_PAGINA = 10;

/* Cliente vinculado ao evento (por ID Cliente, com fallback pelo nome). */
function clienteDoEvento(ev){
  const id = ev['ID Cliente'], nome = ev['Cliente / Responsável'];
  return (clientes || []).find(c =>
    (id != null && id !== '' && String(c['ID Cliente']) === String(id)) ||
    (nome && c['Nome / Responsável'] === nome)) || null;
}
/* Pacote do evento (referenciado por nome). */
function pacoteDoEvento(ev){
  const nome = ev['Pacote'];
  if (!nome) return null;
  return (pacotes || []).find(p => p['Nome'] === nome) || null;
}
/* Só dígitos (p/ link wa.me) → centralizado em ui.js: telParaWhatsapp. */
/* Rota no Google Maps para o local do evento. */
function linkMapsEvento(ev){
  const destino = [ev['Local'], ev['Cidade']].filter(Boolean).join(', ');
  return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(destino);
}

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
      <div class="search-box"><input type="text" id="buscaEvento" placeholder="Buscar por cliente ou evento…" value="${esc(eventosBusca)}"></div>
      <select id="filtroStatusEvento" class="list-filter">${opcoesStatus}</select>
    </div>
    <div class="panel panel-list"><div id="tabelaEventos"></div></div>
  `;
  document.getElementById('novoEventoBtn').addEventListener('click', () => abrirFormEvento(null));
  document.getElementById('buscaEvento').addEventListener('input', e => { eventosBusca = e.target.value; eventosPagina = 1; desenharTabelaEventos(); });
  document.getElementById('filtroStatusEvento').addEventListener('change', e => { eventosFiltroStatus = e.target.value; eventosPagina = 1; desenharTabelaEventos(); });
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

  const totalPaginas = Math.max(1, Math.ceil(ordenados.length / EVENTOS_POR_PAGINA));
  if (eventosPagina > totalPaginas) eventosPagina = totalPaginas;
  const ini = (eventosPagina - 1) * EVENTOS_POR_PAGINA;
  const pagina = ordenados.slice(ini, ini + EVENTOS_POR_PAGINA);

  el.innerHTML = `
    <table class="responsive-table">
      <thead><tr><th>Data</th><th>Cliente</th><th>Evento</th><th>Pacote</th><th>Valor</th><th>Status</th><th>Ações</th></tr></thead>
      <tbody>${pagina.map(e => `
        <tr class="clickable" data-id="${esc(e['ID Evento'])}">
          <td data-label="Data">${esc(e['Data do evento'])}</td><td data-label="Cliente">${esc(e['Cliente / Responsável'])}</td><td data-label="Evento">${esc(e['Tipo de evento'])}</td>
          <td data-label="Pacote">${esc(e['Pacote'])}</td><td data-label="Valor">${formatBRL(e['Valor final'])}</td>
          <td data-label="Status"><span class="status-pill ${String(e.Status).toLowerCase()==='confirmado'?'confirmado':''}">${esc(e.Status)}</span></td>
          <td data-label="Ações"><div class="row-actions">
            <button class="btn-icon" data-view="${esc(e['ID Evento'])}" title="Abrir detalhe"><i class="bi bi-eye"></i></button>
            <div class="dropdown d-inline-block">
              <button class="btn-icon" data-bs-toggle="dropdown" aria-expanded="false" title="Mais"><i class="bi bi-three-dots-vertical"></i></button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><button class="dropdown-item text-danger" data-del="${esc(e['ID Evento'])}"><i class="bi bi-trash"></i> Excluir</button></li>
              </ul>
            </div>
          </div></td>
        </tr>`).join('')}</tbody>
    </table>
    ${htmlPaginacao(eventosPagina, totalPaginas)}`;

  el.querySelectorAll('tr.clickable').forEach(row => {
    row.addEventListener('click', () => abrirDetalheEvento(row.dataset.id));
  });
  // Ações não devem disparar o clique da linha.
  el.querySelectorAll('.row-actions').forEach(a => a.addEventListener('click', ev => ev.stopPropagation()));
  el.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => abrirDetalheEvento(b.dataset.view)));
  el.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => {
    const evItem = eventos.find(x => String(x['ID Evento']) === b.dataset.del);
    if (evItem) excluirEventoComConfirmacao(evItem);
  }));
  el.querySelectorAll('[data-pg]').forEach(b => b.addEventListener('click', () => {
    const p = Number(b.dataset.pg);
    if (p >= 1){ eventosPagina = p; desenharTabelaEventos(); }
  }));
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
        <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#aba-resumo" type="button" role="tab"><i class="bi bi-card-text"></i> Resumo</button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" data-bs-toggle="tab" data-bs-target="#aba-cliente" type="button" role="tab"><i class="bi bi-person"></i> Cliente</button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" data-bs-toggle="tab" data-bs-target="#aba-pacote" type="button" role="tab"><i class="bi bi-box-seam"></i> Pacote</button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" data-bs-toggle="tab" data-bs-target="#aba-financeiro" type="button" role="tab"><i class="bi bi-cash-coin"></i> Financeiro</button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" data-bs-toggle="tab" data-bs-target="#aba-producao" type="button" role="tab"><i class="bi bi-camera"></i> Produção</button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" data-bs-toggle="tab" data-bs-target="#aba-mensagens" type="button" role="tab"><i class="bi bi-chat-dots"></i> Mensagens</button>
      </li>
    </ul>
    <div class="tab-content">
      <div class="tab-pane fade show active" id="aba-resumo" role="tabpanel">${htmlAbaResumo(ev)}</div>
      <div class="tab-pane fade" id="aba-cliente" role="tabpanel">${htmlAbaCliente(ev)}</div>
      <div class="tab-pane fade" id="aba-pacote" role="tabpanel">${htmlAbaPacote(ev)}</div>
      <div class="tab-pane fade" id="aba-financeiro" role="tabpanel">${htmlAbaFinanceiro(ev)}</div>
      <div class="tab-pane fade" id="aba-producao" role="tabpanel">${htmlAbaProducao(ev)}</div>
      <div class="tab-pane fade" id="aba-mensagens" role="tabpanel">${htmlAbaMensagens(ev)}</div>
    </div>
  `;
  document.getElementById('voltarEvento').addEventListener('click', voltarParaEventos);
  document.getElementById('editarEvento').addEventListener('click', () => abrirFormEvento(ev));
  document.getElementById('excluirEventoDetalhe').addEventListener('click', () => excluirEventoComConfirmacao(ev));
  const abrirConta = document.getElementById('abaAbrirConta');
  if (abrirConta){ const conta = contaDoEvento(ev['ID Evento']); abrirConta.addEventListener('click', () => abrirFormConta(conta)); }
  const abrirProd = document.getElementById('abaAbrirProducao');
  if (abrirProd){ const prod = producaoDoEvento(ev['ID Evento']); abrirProd.addEventListener('click', () => abrirFormProducao(prod)); }
  // Botões "Editar informações"/"Editar anotações" (Resumo) → formulário do evento.
  main.querySelectorAll('[data-edit-evento]').forEach(b => b.addEventListener('click', () => abrirFormEvento(ev)));
  // "Abrir cadastro" (aba Cliente) → formulário do cliente.
  const abrirCad = document.getElementById('abaAbrirCliente');
  if (abrirCad){ const cli = clienteDoEvento(ev); if (cli) abrirCad.addEventListener('click', () => abrirFormCliente(cli)); }
  // "Abrir mensagens de cobrança" (aba Mensagens) → copiador da conta do evento.
  const abrirMsg = document.getElementById('abaAbrirMensagens');
  if (abrirMsg){ const conta = contaDoEvento(ev['ID Evento']); abrirMsg.addEventListener('click', () => abrirCopiadorMensagem(conta)); }
}

/* -------- Aba Resumo: 2 cards (informações + anotações), dados reais -------- */
function htmlAbaResumo(ev){
  const hora = [ev['Hora início'], ev['Hora fim']].filter(Boolean).join(' – ');
  const temLocal = !!(ev['Local'] || ev['Cidade']);
  const localTxt = [ev['Local'], ev['Cidade']].filter(Boolean).join(' · ');
  const local = temLocal
    ? `<a href="${linkMapsEvento(ev)}" target="_blank" rel="noopener" title="Abrir rota no Google Maps">${esc(localTxt)} <i class="bi bi-geo-alt"></i></a>`
    : '—';
  const confirmado = String(ev.Status).toLowerCase() === 'confirmado';
  const fato = (rotulo, valor) => `<div class="detalhe-campo"><span class="dc-label">${rotulo}</span><span class="dc-valor">${valor}</span></div>`;
  const anotacoes = ev['Observações']
    ? `<p style="white-space:pre-wrap;margin:0;">${esc(ev['Observações'])}</p>`
    : `<p class="detalhe-vazio">Sem anotações para este evento.</p>`;
  return `
    <div class="row g-3">
      <div class="col-12 col-lg-6">
        <div class="detalhe-bloco">
          <div class="detalhe-bloco-head"><h3>Informações do evento</h3>
            <button class="btn-ghost btn-sm" data-edit-evento="1">Editar informações</button></div>
          <div class="detalhe-grid">
            ${fato('Data', esc(ev['Data do evento']||'—'))}
            ${fato('Horário', esc(hora||'—'))}
            ${fato('Local', local)}
            ${fato('Evento', esc(ev['Tipo de evento']||'—'))}
            ${fato('Status', `<span class="status-pill ${confirmado?'confirmado':''}">${esc(ev.Status||'—')}</span>`)}
            ${fato('Pacote', esc(ev['Pacote']||'—'))}
          </div>
        </div>
      </div>
      <div class="col-12 col-lg-6">
        <div class="detalhe-bloco">
          <div class="detalhe-bloco-head"><h3>Anotações</h3>
            <button class="btn-ghost btn-sm" data-edit-evento="1">Editar anotações</button></div>
          ${anotacoes}
        </div>
      </div>
    </div>`;
}

/* -------- Aba Cliente: contato do cliente vinculado -------- */
function htmlAbaCliente(ev){
  const cli = clienteDoEvento(ev);
  if (!cli){ return `<div class="detalhe-bloco"><p class="detalhe-vazio">Cliente não encontrado no cadastro.</p></div>`; }
  const fato = (rotulo, valor) => `<div class="detalhe-campo"><span class="dc-label">${rotulo}</span><span class="dc-valor">${valor}</span></div>`;
  const zap = telParaWhatsapp(cli['WhatsApp']);
  const tel = cli['WhatsApp']
    ? `<a href="https://wa.me/${zap}" target="_blank" rel="noopener">${esc(cli['WhatsApp'])} <i class="bi bi-whatsapp"></i></a>` : '—';
  const email = cli['E-mail'] ? `<a href="mailto:${esc(cli['E-mail'])}">${esc(cli['E-mail'])}</a>` : '—';
  const insta = cli['Instagram']
    ? `<a href="https://instagram.com/${esc(String(cli['Instagram']).replace(/^@/, ''))}" target="_blank" rel="noopener">${esc(cli['Instagram'])}</a>` : '—';
  return `
    <div class="detalhe-bloco">
      <div class="detalhe-bloco-head"><h3>${esc(cli['Nome / Responsável']||'Cliente')}</h3>
        <button class="btn-ghost btn-sm" id="abaAbrirCliente">Abrir cadastro</button></div>
      <div class="detalhe-grid">
        ${fato('Telefone', tel)}
        ${fato('E-mail', email)}
        ${fato('Cidade', esc(cli['Cidade']||'—'))}
        ${fato('Instagram', insta)}
      </div>
    </div>`;
}

/* -------- Aba Pacote: pacote referenciado pelo evento -------- */
function htmlAbaPacote(ev){
  const fato = (rotulo, valor) => `<div class="detalhe-campo"><span class="dc-label">${rotulo}</span><span class="dc-valor">${valor}</span></div>`;
  const pac = pacoteDoEvento(ev);
  if (!pac){
    // Sem pacote cadastrado por nome: mostra ao menos o que está no evento.
    if (!ev['Pacote']){ return `<div class="detalhe-bloco"><p class="detalhe-vazio">Nenhum pacote associado a este evento.</p></div>`; }
    return `<div class="detalhe-bloco"><h3>${esc(ev['Pacote'])}</h3>
      <div class="detalhe-grid">${fato('Valor pacote', formatBRL(ev['Valor pacote']))}${fato('Valor final', formatBRL(ev['Valor final']))}</div></div>`;
  }
  const desc = pac['Descrição'] ? `<p style="white-space:pre-wrap;margin:0 0 12px;">${esc(pac['Descrição'])}</p>` : '';
  return `
    <div class="detalhe-bloco">
      <h3>${esc(pac['Nome']||ev['Pacote'])}</h3>
      ${desc}
      <div class="detalhe-grid">
        ${fato('Valor do pacote', formatBRL(pac['Valor pacote']))}
        ${fato('Fotos incluídas', esc(pac['Qtd fotos incluídas']||'—'))}
        ${fato('Foto extra', Number(pac['Valor foto extra']||0) > 0 ? formatBRL(pac['Valor foto extra']) : '—')}
        ${fato('Valor neste evento', formatBRL(ev['Valor final']))}
      </div>
    </div>`;
}

/* -------- Aba Mensagens: atalho de WhatsApp e copiador de cobrança -------- */
function htmlAbaMensagens(ev){
  const cli = clienteDoEvento(ev);
  const zap = cli ? telParaWhatsapp(cli['WhatsApp']) : '';
  const conta = contaDoEvento(ev['ID Evento']);
  const btnZap = zap
    ? `<a class="btn-primary" href="https://wa.me/${zap}" target="_blank" rel="noopener"><i class="bi bi-whatsapp"></i> Enviar WhatsApp</a>`
    : `<p class="detalhe-vazio">Cliente sem telefone cadastrado.</p>`;
  const btnMsg = conta
    ? `<button class="btn-ghost" id="abaAbrirMensagens">Mensagens de cobrança</button>`
    : '';
  return `
    <div class="detalhe-bloco">
      <h3>Contato</h3>
      <p class="hint">Abra uma conversa no WhatsApp com o cliente ou copie uma mensagem de cobrança pronta para enviar.</p>
      <div class="btn-row">${btnZap}${btnMsg}</div>
    </div>`;
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

