/* ============================================================
   CRM · Cibele Matozo Fotografia — Módulo: Formulário de Lead + Orçamento (v3.18)
   <script> clássico (escopo global). View 'leadForm' em tela cheia, em seções.
   Mudou algo que aparece no PDF → "Salvar" vira "Salvar e gerar orçamento vN".
   ============================================================ */

let lfEst = null; // estado vivo do formulário: { cfg, versaoAtual, hashAtual, lead }

function abrirFormLead(lead){
  leadFormId = lead ? lead['ID Lead'] : null;
  currentView = 'leadForm'; renderNav(); renderMain();
}
function lfVoltar_(){ currentView = 'leads'; renderNav(); renderMain(); }

function lfOpcoesPacotes_(tipo, selecionado){
  const sel = selecionado == null ? '' : String(selecionado);
  const lista = (pacotes || []).filter(p => aplicaAoTipoEvento_(p['Tipos de evento'], tipo) || String(p['Nome']) === sel);
  if (!lista.length) return opcoesPacotes(sel);
  return ['<option value="">—</option>'].concat(lista.map(p => {
    const nome = String(p['Nome'] || '');
    return `<option value="${esc(nome)}" ${nome === sel ? 'selected' : ''}>${esc(nome)}</option>`;
  })).join('');
}

function renderLeadForm(main){
  const lead = leadFormId ? leads.find(l => String(l['ID Lead']) === String(leadFormId)) : null;
  if (leadFormId && !lead){ currentView = 'leads'; renderLeads(main); return; }
  const editando = !!lead;
  const cfg = lead ? orcConfigDoLead_(lead) : orcConfigVazia_();
  lfEst = { cfg, lead, versaoAtual: lead ? Number(lead['Orçamento versão'] || 0) : 0, hashAtual: lead ? String(lead['Orçamento hash'] || '') : '' };
  const v = k => esc(editando ? lead[k] : '');

  main.innerHTML = `
  <div class="lf-wrap">
    <div class="lf-top">
      <button class="btn-ghost" id="lfVoltar" type="button"><i class="bi bi-arrow-left"></i> Leads</button>
      <h1>${editando ? esc(lead['Cliente']) : 'Novo lead'}</h1>
      <span id="lfBadge"></span>
    </div>
    <div class="form-err" id="leadErr" style="display:none;"></div>

    <div class="lf-card">
      <h3><i class="bi bi-person"></i> Cliente</h3>
      ${editando ? `
      <div class="row g-3">
        <div class="col-md-6 field"><label>Cliente</label><input value="${v('Cliente')}" disabled></div>
        <div class="col-md-3 field"><label>WhatsApp</label><input value="${v('WhatsApp')}" disabled></div>
        <div class="col-md-3 field"><label>E-mail</label><input value="${v('E-mail')}" disabled></div>
      </div>` : `
      <div class="row g-3">
        <div class="col-md-5 field"><label>Nome *</label><input id="f_nome"></div>
        <div class="col-md-3 field"><label>WhatsApp</label><input id="f_whatsapp" placeholder="(41) 90000-0000"></div>
        <div class="col-md-4 field"><label>E-mail (opcional)</label><input id="f_email"></div>
      </div>`}
    </div>

    <div class="lf-card">
      <h3><i class="bi bi-calendar-event"></i> Evento</h3>
      <div class="row g-3">
        <div class="col-md-4 field"><label>Tipo de evento</label><select id="f_tipo">${opcoesSelect(listas['Tipo de evento'], editando ? lead['Tipo de evento'] : '')}</select></div>
        <div class="col-md-4 field"><label>Data desejada</label><input id="f_dataDesejada" data-picker="date" placeholder="DD/MM/AAAA" value="${v('Data desejada')}"></div>
        <div class="col-md-4 field"><label>Instituição / local</label><input id="f_instituicao" placeholder="Ex: Colégio Fazenda Rio Grande" value="${v('Instituição')}"></div>
        <div class="col-md-3 field"><label>Hora início</label><input id="f_horaInicio" data-picker="time" placeholder="HH:MM" value="${v('Hora início')}"></div>
        <div class="col-md-3 field"><label>Hora fim</label><input id="f_horaFim" data-picker="time" placeholder="HH:MM" value="${v('Hora fim')}"></div>
        <div class="col-md-6 field"><label>Serviço de interesse</label><select id="f_servico">${opcoesSelect(listas['Serviço'], editando ? lead['Serviço de interesse'] : '')}</select></div>
        <div class="col-md-6 field"><label>Origem</label><select id="f_origem">${opcoesSelect(listas['Canal'], editando ? lead['Origem'] : '')}</select></div>
      </div>
    </div>

    <div class="lf-card">
      <h3><i class="bi bi-receipt"></i> Orçamento</h3>
      <div id="lfPacotes"></div>
      <div id="lfDinamico"></div>
      <div class="lf-resumo" id="lfResumo"></div>
    </div>

    <div class="lf-card">
      <h3><i class="bi bi-flag"></i> Acompanhamento</h3>
      <div class="row g-3">
        <div class="col-md-6 field"><label>Etapa comercial</label><select id="f_etapa">${opcoesSelect(listas['Etapa comercial'], editando ? lead['Etapa comercial'] : '')}</select></div>
        <div class="col-md-6 field"><label>Próximo contato</label><input id="f_proximoContato" data-picker="date" placeholder="DD/MM/AAAA" value="${v('Próximo contato')}"><small class="text-muted">Cria um lembrete de dia inteiro na Google Agenda.</small></div>
        <div class="col-12 field" id="lfPacoteFechadoWrap" style="display:none;"><label>Qual pacote foi fechado? <small class="text-muted">(o evento criado a partir deste lead usa este pacote)</small></label><select id="f_pacoteFechado"></select></div>
        <div class="col-md-6 field" id="lfFormaPagamentoWrap" style="display:none;"><label>Forma de pagamento combinada <small class="text-muted">(vai para o Contrato Digital)</small></label><select id="f_formaPagamentoCombinada">${opcoesSelect(listas['Forma pagamento'], '')}</select></div>
        <div class="col-12 field"><label>Observações</label><textarea id="f_obs" rows="3">${v('Observações')}</textarea></div>
      </div>
    </div>

    ${editando ? `<div class="lf-card"><h3><i class="bi bi-clock-history"></i> Histórico de orçamentos</h3><div id="lfHist"></div></div>` : ''}

    ${editando ? `<div class="lf-card" id="lfContratoCard" style="display:none;"><h3><i class="bi bi-file-earmark-text"></i> Contrato</h3><div id="lfContratoBody"></div></div>` : ''}

    <div class="lf-bar">
      <span class="lf-bar-info" id="lfBarInfo"></span>
      ${editando ? `<button class="btn-danger" id="lfExcluir" type="button">Excluir</button>` : ''}
      <button class="btn-ghost" id="lfCancelar" type="button">Cancelar</button>
      <button class="btn-primary" id="lfSalvar" type="button">Salvar</button>
    </div>
  </div>`;

  document.getElementById('lfVoltar').addEventListener('click', lfVoltar_);
  document.getElementById('lfCancelar').addEventListener('click', lfVoltar_);
  document.getElementById('lfSalvar').addEventListener('click', lfSalvar_);
  if (editando){
    document.getElementById('lfExcluir').addEventListener('click', () => excluirComConfirmacao(
      `Excluir o lead de "${lead['Cliente']}" e os orçamentos gerados? Isso não pode ser desfeito.`,
      'excluirLead', { idLead: lead['ID Lead'] }, 'lfExcluir', 'leadErr'
    ));
    lfDesenharHistorico_();
    lfDesenharContrato_();
  }
  if (!editando) aplicarMascara('f_whatsapp', maskWhatsapp);

  const sTipo = document.getElementById('f_tipo');
  lfDesenharPacotes_();
  lfDesenharDinamico_();

  sTipo.addEventListener('change', () => {
    // Troca de tipo: descarta produtos que não se aplicam e refaz a lista de pacotes.
    lfEst.cfg.produtos = lfEst.cfg.produtos.filter(p => {
      const cat = produtos.find(x => Number(x['ID']) === p.id);
      return !cat || aplicaAoTipoEvento_(cat['Tipos de evento'], sTipo.value);
    });
    lfDesenharPacotes_();
    lfDesenharDinamico_();
  });
  ['f_dataDesejada', 'f_instituicao', 'f_nome'].forEach(id => {
    const el = document.getElementById(id);
    if (el){ el.addEventListener('input', lfAtualizarResumo_); el.addEventListener('change', lfAtualizarResumo_); }
  });
  document.getElementById('f_etapa').addEventListener('change', lfAtualizarPacoteFechado_);
}

/* Lista de pacotes do orçamento (v3.20): 1+ blocos, cada um com pacote do
   catálogo (auto-preenche valor/itens) + valor + itens, todos editáveis.
   v3.22: desconto e ensaio pré-evento também moraram para dentro de cada
   pacote (nem todo pacote tem ensaio pré-evento, e o desconto pode valer só
   para um deles). Estado vivo em lfEst.cfg.pacotes — os listeners escrevem
   direto nele, igual ao padrão já usado para extras/produtos em lfDesenharDinamico_. */
function lfDesenharPacotes_(){
  const cont = document.getElementById('lfPacotes');
  const tipo = document.getElementById('f_tipo').value;
  const regras = orcRegrasDoTipo_(tipo);
  const cfg = lfEst.cfg;
  if (!cfg.pacotes.length) cfg.pacotes.push(orcPacoteVazio_());

  cont.innerHTML = cfg.pacotes.map((p, i) => `
    <div class="lf-pacote" data-pacote="${i}">
      <div class="lf-pacote-head">
        <strong>Pacote ${i + 1}</strong>
        ${cfg.pacotes.length > 1 ? `<button type="button" class="btn-ghost lf-pacote-remover" data-pac-remover="${i}" title="Remover este pacote"><i class="bi bi-trash"></i></button>` : ''}
      </div>
      <div class="row g-3">
        <div class="col-md-7 field"><label>Pacote do catálogo</label><select data-pac-nome="${i}">${lfOpcoesPacotes_(tipo, p.nome)}</select></div>
        <div class="col-md-5 field"><label>Valor (R$)</label><input type="number" step="0.01" min="0" data-pac-valor="${i}" value="${p.valorPacote == null ? '' : esc(p.valorPacote)}"></div>
      </div>
      <div class="field mt-2"><label>Itens inclusos neste orçamento <small class="text-muted">(um por linha · só deste lead, não altera o pacote)</small></label>
        <textarea rows="4" data-pac-itens="${i}" placeholder="Selecione um pacote para preencher, ou escreva os itens">${esc(p.itens != null ? p.itens : orcItensDoPacote_(p.nome))}</textarea></div>
      <div class="row g-3 mt-1">
        <div class="col-md-5 field"><label>Desconto neste pacote (R$)</label><input type="number" step="0.01" min="0" data-pac-desconto="${i}" value="${p.desconto == null ? '' : esc(p.desconto)}"></div>
        ${regras.ensaioPre ? `<div class="col-md-7 field d-flex align-items-end"><label class="lf-check" style="margin:0 0 10px;"><input type="checkbox" data-pac-ensaio="${i}" ${p.ensaioPre ? 'checked' : ''}> Ensaio pré-evento</label></div>` : ''}
      </div>
    </div>`).join('')
    + `<button type="button" class="btn-ghost" id="lfAdicionarPacote"><i class="bi bi-plus-lg"></i> Adicionar outro pacote</button>`;

  cont.querySelectorAll('[data-pac-nome]').forEach(sel => sel.addEventListener('change', () => {
    const i = Number(sel.dataset.pacNome);
    const p = cfg.pacotes[i];
    p.nome = sel.value;
    const pac = pacotes.find(x => String(x['Nome']) === sel.value);
    const valorEl = cont.querySelector(`[data-pac-valor="${i}"]`);
    const itensEl = cont.querySelector(`[data-pac-itens="${i}"]`);
    if (pac){ p.valorPacote = Number(pac['Valor pacote'] || 0); if (valorEl) valorEl.value = p.valorPacote; }
    p.itens = null; // volta a seguir os itens do catálogo até o usuário editar manualmente
    if (itensEl) itensEl.value = pac ? String(pac['Itens inclusos'] || '') : '';
    lfAtualizarResumo_();
  }));
  cont.querySelectorAll('[data-pac-valor]').forEach(inp => inp.addEventListener('input', () => {
    const i = Number(inp.dataset.pacValor);
    cfg.pacotes[i].valorPacote = inp.value === '' ? null : Number(inp.value);
    lfAtualizarResumo_();
  }));
  cont.querySelectorAll('[data-pac-itens]').forEach(ta => ['input', 'change'].forEach(ev => ta.addEventListener(ev, () => {
    const i = Number(ta.dataset.pacItens);
    cfg.pacotes[i].itens = ta.value;
    lfAtualizarResumo_();
  })));
  cont.querySelectorAll('[data-pac-desconto]').forEach(inp => inp.addEventListener('input', () => {
    const i = Number(inp.dataset.pacDesconto);
    cfg.pacotes[i].desconto = inp.value === '' ? null : Number(inp.value);
    lfAtualizarResumo_();
  }));
  cont.querySelectorAll('[data-pac-ensaio]').forEach(chk => chk.addEventListener('change', () => {
    const i = Number(chk.dataset.pacEnsaio);
    cfg.pacotes[i].ensaioPre = chk.checked;
    lfAtualizarResumo_();
  }));
  cont.querySelectorAll('[data-pac-remover]').forEach(btn => btn.addEventListener('click', () => {
    cfg.pacotes.splice(Number(btn.dataset.pacRemover), 1);
    lfDesenharPacotes_();
    lfAtualizarResumo_();
  }));
  const addBtn = document.getElementById('lfAdicionarPacote');
  if (addBtn) addBtn.addEventListener('click', () => {
    cfg.pacotes.push(orcPacoteVazio_());
    lfDesenharPacotes_();
    lfAtualizarResumo_();
  });
  lfAtualizarPacoteFechado_();
}

/* Com 2+ pacotes no orçamento, o evento criado ao marcar o lead como
   "Fechado" (cascata em pbLeads.js) não pode herdar leads.pacote (vira
   "Nome A; Nome B") nem leads.valor_estimado (vira a média) — por isso só
   aparece quando faz sentido, pedindo qual dos pacotes foi o escolhido. */
function lfAtualizarPacoteFechado_(){
  const etapa = document.getElementById('f_etapa');
  const fechando = !!(etapa && etapa.value === 'Fechado');

  const wrapForma = document.getElementById('lfFormaPagamentoWrap');
  if (wrapForma) wrapForma.style.display = fechando ? '' : 'none';

  const wrap = document.getElementById('lfPacoteFechadoWrap');
  if (!wrap) return;
  const nomes = lfEst.cfg.pacotes.map(p => String(p.nome || '').trim()).filter(Boolean);
  const mostrar = nomes.length > 1 && fechando;
  wrap.style.display = mostrar ? '' : 'none';
  if (!mostrar) return;
  const sel = document.getElementById('f_pacoteFechado');
  const atual = sel.value;
  sel.innerHTML = nomes.map(n => `<option value="${esc(n)}" ${n === atual ? 'selected' : ''}>${esc(n)}</option>`).join('');
}

/* Opcionais da regra do tipo + produtos do catálogo aplicáveis. v3.22: "Ensaio
   pré-evento" saiu daqui — agora é escolhido dentro de cada pacote (lfDesenharPacotes_),
   já que nem todo pacote do orçamento inclui ensaio pré-evento. */
function lfDesenharDinamico_(){
  const cont = document.getElementById('lfDinamico');
  const tipo = document.getElementById('f_tipo').value;
  const regras = orcRegrasDoTipo_(tipo);
  const cfg = lfEst.cfg;
  const selIds = new Set(cfg.produtos.map(p => p.id));
  const catalogo = produtos.filter(p => selIds.has(Number(p['ID']))
    || (String(p['Ativo'] || 'Sim') !== 'Não' && aplicaAoTipoEvento_(p['Tipos de evento'], tipo)));

  let html = '';
  if (regras.becaCanudo){
    html += `<div class="lf-checks">
      <label class="lf-check"><input type="checkbox" data-extra="becaCapelo" ${cfg.extras.becaCapelo ? 'checked' : ''}> Beca com capelo</label>
      <label class="lf-check"><input type="checkbox" data-extra="canudo" ${cfg.extras.canudo ? 'checked' : ''}> Canudo</label>
    </div>`;
  }
  if (catalogo.length){
    html += `<div class="mb-2" style="font-size:12.5px;color:var(--ink-soft);">Produtos</div>` + catalogo.map(p => {
      const id = Number(p['ID']);
      const sel = cfg.produtos.find(x => x.id === id);
      const unit = p['Tipo de cobrança'] !== 'fixo';
      return `<div class="lf-prod" data-prod="${id}">
        <input type="checkbox" class="form-check-input" data-prod-sel="${id}" ${sel ? 'checked' : ''}>
        <div class="lf-prod-info"><strong>${esc(p['Nome'])}</strong>
          <small>${formatBRL(p['Valor'])}${unit ? ' por unidade' : ' (valor fixo)'}${p['Descrição'] ? ' · ' + esc(p['Descrição']) : ''}</small></div>
        ${unit ? `<input type="number" min="1" step="1" class="form-control form-control-sm lf-prod-qtd" data-prod-qtd="${id}" value="${sel ? sel.qtd : 1}" ${sel ? '' : 'disabled'} title="Quantidade">` : ''}
        <div class="lf-prod-sub" data-prod-sub="${id}"></div>
      </div>`;
    }).join('');
  }
  cont.innerHTML = html;

  cont.querySelectorAll('[data-extra]').forEach(i => i.addEventListener('change', () => {
    cfg.extras[i.dataset.extra] = i.checked; lfAtualizarResumo_();
  }));
  cont.querySelectorAll('[data-prod-sel]').forEach(i => i.addEventListener('change', () => {
    const id = Number(i.dataset.prodSel);
    const p = produtos.find(x => Number(x['ID']) === id);
    const qEl = cont.querySelector(`[data-prod-qtd="${id}"]`);
    if (i.checked){
      cfg.produtos.push({ id, nome: p['Nome'], valor: Number(p['Valor'] || 0),
        cobranca: p['Tipo de cobrança'] === 'fixo' ? 'fixo' : 'unitario', qtd: qEl ? Math.max(1, Number(qEl.value || 1)) : 1 });
    } else {
      cfg.produtos = cfg.produtos.filter(x => x.id !== id);
    }
    if (qEl) qEl.disabled = !i.checked;
    lfAtualizarResumo_();
  }));
  cont.querySelectorAll('[data-prod-qtd]').forEach(i => i.addEventListener('input', () => {
    const sel = cfg.produtos.find(x => x.id === Number(i.dataset.prodQtd));
    if (sel){ sel.qtd = Math.max(1, Number(i.value || 1)); lfAtualizarResumo_(); }
  }));
  lfAtualizarResumo_();
}

/* Lê o formulário inteiro (inclui o estado vivo de pacotes/extras/produtos).
   v3.22: desconto não é mais um campo único do formulário — vive em cada
   cfg.pacotes[i].desconto (editado direto em lfDesenharPacotes_). */
function lfLer_(){
  const g = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
  const lead = lfEst.lead;
  return {
    nome: lead ? lead['Cliente'] : g('f_nome'),
    whatsapp: lead ? lead['WhatsApp'] : g('f_whatsapp'),
    email: lead ? lead['E-mail'] : g('f_email'),
    tipoEvento: g('f_tipo'), dataDesejada: g('f_dataDesejada'), instituicao: g('f_instituicao'),
    horaInicio: g('f_horaInicio'), horaFim: g('f_horaFim'),
    servico: g('f_servico'), origem: g('f_origem'),
    etapa: document.getElementById('f_etapa').value,
    proximoContato: g('f_proximoContato'), observacoes: g('f_obs'), cfg: lfEst.cfg,
  };
}
function lfHash_(c, nomeCliente){
  return orcHash_({ cliente: nomeCliente == null ? c.nome : nomeCliente, tipoEvento: c.tipoEvento, dataDesejada: c.dataDesejada,
    instituicao: c.instituicao, cfg: c.cfg });
}
function lfPrecisaGerar_(c){
  const mudou = lfHash_(c) !== lfEst.hashAtual;
  const temPacote = c.cfg.pacotes.some(p => String(p.nome || '').trim());
  return mudou && (temPacote || lfEst.versaoAtual > 0);
}

function lfAtualizarResumo_(){
  if (!document.getElementById('lfResumo')) return;
  const c = lfLer_();
  const totaisPorPacote = orcTotaisPacotes_(c.cfg);
  const multi = totaisPorPacote.length > 1;
  document.getElementById('lfResumo').innerHTML = `
    ${c.cfg.pacotes.map((p, i) => `<div class="lf-linha"><span>Pacote${p.nome ? ' ' + esc(p.nome) : ' ' + (i + 1)}</span><span>${formatBRL(totaisPorPacote[i] ? totaisPorPacote[i].pacote : 0)}</span></div>`).join('')}
    ${c.cfg.produtos.map(p => `<div class="lf-linha"><span>${esc(p.nome)}${p.cobranca === 'fixo' ? '' : ` (${p.qtd} × ${formatBRL(p.valor)})`}</span><span>${formatBRL(orcSubtotalProduto_(p))}</span></div>`).join('')}
    ${totaisPorPacote.map((t, i) => (t.desconto > 0 ? `<div class="lf-linha"><span>Desconto${multi ? ' — ' + esc(c.cfg.pacotes[i].nome || 'Pacote ' + (i + 1)) : ''}</span><span>− ${formatBRL(t.desconto)}</span></div>` : '')).join('')}
    ${totaisPorPacote.map((t, i) => `<div class="lf-linha ${multi ? 'lf-total-pacote' : 'lf-total'}"><span>${multi ? esc(c.cfg.pacotes[i].nome || 'Pacote ' + (i + 1)) : 'Total'}</span><span>${formatBRL(t.total)}</span></div>`).join('')}`;
  c.cfg.produtos.forEach(p => {
    const el = document.querySelector(`[data-prod-sub="${p.id}"]`);
    if (el) el.textContent = formatBRL(orcSubtotalProduto_(p));
  });
  document.querySelectorAll('[data-prod-sub]').forEach(el => {
    if (!c.cfg.produtos.some(p => String(p.id) === el.dataset.prodSub)) el.textContent = '';
  });

  const precisa = lfPrecisaGerar_(c);
  const prox = lfEst.versaoAtual + 1;
  document.getElementById('lfSalvar').textContent = precisa ? `Salvar e gerar orçamento v${prox}` : 'Salvar';
  document.getElementById('lfBarInfo').textContent = precisa
    ? 'Dados do orçamento alterados: será gerada uma nova versão em PDF.'
    : (lfEst.versaoAtual ? `Orçamento v${lfEst.versaoAtual} está atualizado.` : '');
  const badge = document.getElementById('lfBadge');
  badge.innerHTML = lfEst.versaoAtual
    ? `<span class="status-pill ${precisa ? 'alerta' : 'confirmado'}">Orçamento v${lfEst.versaoAtual}${precisa ? ' · desatualizado' : ''}</span>` : '';
}

function lfDesenharHistorico_(){
  const el = document.getElementById('lfHist');
  if (!el) return;
  const hist = orcamentosDoLead_(leadFormId);
  if (!hist.length){ el.innerHTML = `<p class="text-muted" style="font-size:13px;">Nenhum orçamento gerado ainda.</p>`; return; }
  el.innerHTML = `<div class="lf-hist">${hist.map(o => `<div class="lf-hist-row">
    <div class="lf-hist-info"><strong>v${o['Versão']}</strong><span>${esc(o['Data geração'])}</span><span>${formatBRL(o['Valor total'])}</span></div>
    <div class="lf-hist-acoes">
      <button class="btn-ghost" type="button" data-orc-pdf="${o['ID Orçamento']}"><i class="bi bi-file-earmark-pdf"></i> PDF</button>
      <button class="btn-ghost" type="button" data-orc-wa="${o['ID Orçamento']}"><i class="bi bi-whatsapp"></i> WhatsApp</button>
    </div></div>`).join('')}</div>`;
  el.querySelectorAll('[data-orc-pdf]').forEach(b => b.addEventListener('click', () => orcAcaoHistorico_(b.dataset.orcPdf, false)));
  el.querySelectorAll('[data-orc-wa]').forEach(b => b.addEventListener('click', () => orcAcaoHistorico_(b.dataset.orcWa, true)));
}
function orcamentosDoLead_(idLead){
  return (orcamentos || []).filter(o => String(o['ID Lead']) === String(idLead))
    .sort((a, b) => Number(b['Versão']) - Number(a['Versão']));
}

/* Contrato Digital (v3.23 — Fase 2): "Gerar contrato" só aparece com o lead em
   "Fechado" (o evento já existe, criado pela cascata de pbLeads.js). Idempotente
   do lado do servidor (pbGerarContrato_) — aqui só decide o que mostrar: botão
   de gerar (sem contrato ainda) ou status + link (já gerado). */
// Pode existir mais de um contrato por lead (ex.: um antigo já "Assinado" +
// um novo "Pendente" gerado depois de corrigir o evento) — mostra sempre o
// mais recente (maior ID Contrato), o histórico anterior fica só no banco.
function contratoDoLead_(idLead){
  const lista = (typeof contratos !== 'undefined' ? contratos : [])
    .filter(c => Number(c['ID Lead']) === Number(idLead));
  if (!lista.length) return null;
  return lista.reduce((mais, atual) => Number(atual['ID Contrato']) > Number(mais['ID Contrato']) ? atual : mais);
}
// contratoLinkPublico_ vem de pbContratos.js (carregado antes neste crm.html) — reaproveitado aqui.
function lfDesenharContrato_(){
  const card = document.getElementById('lfContratoCard');
  if (!card) return;
  const lead = lfEst.lead;
  const fechado = !!(lead && String(lead['Etapa comercial']) === 'Fechado');
  card.style.display = fechado ? '' : 'none';
  if (!fechado) return;
  const body = document.getElementById('lfContratoBody');
  const c = contratoDoLead_(leadFormId);
  if (!c){
    body.innerHTML = `<p class="text-muted" style="font-size:13px;">Nenhum contrato gerado ainda.</p>
      <button class="btn-primary" id="btnGerarContrato" type="button">Gerar contrato</button>`;
    document.getElementById('btnGerarContrato').addEventListener('click', lfGerarContrato_);
    return;
  }
  const link = contratoLinkPublico_(c['Token']);
  body.innerHTML = `
    <p style="font-size:13px;">Status: <span class="status-pill ${c['Status'] === 'Assinado' ? 'confirmado' : ''}">${esc(c['Status'])}</span></p>
    <div class="lf-hist-acoes">
      <button class="btn-ghost" type="button" id="btnCopiarContrato"><i class="bi bi-link-45deg"></i> Copiar link</button>
      <button class="btn-ghost" type="button" id="btnWaContrato"><i class="bi bi-whatsapp"></i> WhatsApp</button>
    </div>`;
  document.getElementById('btnCopiarContrato').addEventListener('click', () => {
    navigator.clipboard.writeText(link);
    showToast('Link do contrato copiado.');
  });
  document.getElementById('btnWaContrato').addEventListener('click', () => {
    let tel = String(lead['WhatsApp'] || '').replace(/\D/g, '');
    if (!tel){ showToast('Cliente sem WhatsApp cadastrado. Copie o link manualmente.'); return; }
    if (tel.length <= 11) tel = '55' + tel;
    const msg = `Olá, ${String(lead['Cliente'] || '').split(' ')[0]}! Segue o link do seu contrato: ${link}`;
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });
}
async function lfGerarContrato_(){
  const btn = document.getElementById('btnGerarContrato');
  if (btn){ btn.disabled = true; btn.textContent = 'Gerando…'; }
  try {
    await apiCall('gerarContrato', { idLead: leadFormId });
    loaded = false;
    await renderMain();
    showToast('Contrato gerado.');
  } catch (err){
    showToast('❌ ' + err.message);
    if (btn){ btn.disabled = false; btn.textContent = 'Gerar contrato'; }
  }
}
async function orcAcaoHistorico_(idOrc, whatsapp){
  const o = orcamentos.find(x => String(x['ID Orçamento']) === String(idOrc));
  if (!o) return;
  try {
    const snap = JSON.parse(o['Snapshot']);
    if (whatsapp) await orcEnviarWhatsApp_(snap);
    else orcBaixarPdf_(snap);
  } catch (err){
    if (err && err.name === 'AbortError') return;
    showToast('❌ ' + err.message);
  }
}
function orcMensagemWhatsApp_(snap){
  const primeiro = String(snap.cliente.nome || '').split(' ')[0];
  const pacotesSnap = Array.isArray(snap.pacotes) ? snap.pacotes : null;
  const valorTxt = pacotesSnap && pacotesSnap.length > 1
    ? `com opções de pacote entre ${formatBRL(Math.min(...pacotesSnap.map(p => p.total)))} e ${formatBRL(Math.max(...pacotesSnap.map(p => p.total)))}`
    : `no valor total de ${formatBRL(snap.totais.total)}`;
  return `Olá, ${primeiro}! Segue o orçamento${snap.tipoEvento ? ' do seu evento (' + snap.tipoEvento + ')' : ''}, ${valorTxt}. Qualquer dúvida estou à disposição! — Cibele Matozo Fotografia`;
}
async function orcEnviarWhatsApp_(snap){
  const msg = orcMensagemWhatsApp_(snap);
  const file = orcArquivoPdf_(snap);
  if (navigator.canShare && navigator.canShare({ files: [file] })){
    await navigator.share({ files: [file], text: msg });
    return;
  }
  orcBaixarPdf_(snap);
  let tel = String((snap.cliente && snap.cliente.whatsapp) || '').replace(/\D/g, '');
  if (!tel){ showToast('Cliente sem WhatsApp cadastrado. O PDF foi baixado.'); return; }
  if (tel.length <= 11) tel = '55' + tel;
  window.open(`https://wa.me/${tel}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  showToast('PDF baixado — anexe-o na conversa do WhatsApp.');
}

async function lfSalvar_(){
  const c = lfLer_();
  if (!lfEst.lead && !c.nome){ mostrarErro('leadErr', 'Informe o nome.'); window.scrollTo(0, 0); return; }
  const totaisPorPacote = orcTotaisPacotes_(c.cfg);
  const nomesPacotes = c.cfg.pacotes.map(p => String(p.nome || '').trim()).filter(Boolean);
  const wrapFechado = document.getElementById('lfPacoteFechadoWrap');
  const pacoteFechadoVisivel = wrapFechado && wrapFechado.style.display !== 'none';
  // Só exige a escolha quando a cascata (pbLeads.js) de fato vai rodar — ou seja,
  // na transição PARA "Fechado" (ela é idempotente: não roda de novo se já estava).
  const etapaAnterior = lfEst.lead ? String(lfEst.lead['Etapa comercial'] || '') : '';
  const vaiFechar = c.etapa === 'Fechado' && etapaAnterior !== 'Fechado';
  if (pacoteFechadoVisivel && vaiFechar && !document.getElementById('f_pacoteFechado').value){
    mostrarErro('leadErr', 'Selecione qual pacote foi fechado.'); window.scrollTo(0, 0); return;
  }
  if (vaiFechar && !document.getElementById('f_formaPagamentoCombinada').value){
    mostrarErro('leadErr', 'Selecione a forma de pagamento combinada.'); window.scrollTo(0, 0); return;
  }
  if (vaiFechar && !c.instituicao.trim()){
    mostrarErro('leadErr', 'Informe o local do evento (campo "Instituição / local").'); window.scrollTo(0, 0); return;
  }
  if (vaiFechar && (!c.horaInicio.trim() || !c.horaFim.trim())){
    mostrarErro('leadErr', 'Informe o horário de início e fim do evento.'); window.scrollTo(0, 0); return;
  }
  const precisa = lfPrecisaGerar_(c);
  const btn = document.getElementById('lfSalvar');
  const rotulo = btn.textContent;
  btn.disabled = true; btn.textContent = 'Salvando…';
  const valorEstimadoMedio = orcMedia_(totaisPorPacote, 'valorEstimado');
  // leads.desconto (DB) é único: com 2+ pacotes guarda a média, igual a valorEstimado.
  const descontoMedio = orcMedia_(totaisPorPacote, 'desconto');
  const dados = {
    tipoEvento: c.tipoEvento, dataDesejada: c.dataDesejada, servico: c.servico, pacote: nomesPacotes.join('; '), origem: c.origem,
    etapa: c.etapa, valorEstimado: valorEstimadoMedio, desconto: descontoMedio, proximoContato: c.proximoContato,
    observacoes: c.observacoes, instituicao: c.instituicao, orcDados: orcSerializarDados_(c.cfg),
    horaInicio: c.horaInicio, horaFim: c.horaFim,
  };
  // Lead "Fechado" cria um evento automaticamente (pbLeads.js) — com 1 pacote só,
  // herda leads.pacote/valor_estimado/desconto normalmente; com 2+, o pacote
  // realmente fechado (escolhido acima) é quem define o que vai para o evento.
  if (pacoteFechadoVisivel){
    const nome = document.getElementById('f_pacoteFechado').value;
    const i = c.cfg.pacotes.findIndex(p => String(p.nome || '').trim() === nome);
    dados.pacoteFechadoNome = nome;
    dados.pacoteFechadoValor = i !== -1 ? totaisPorPacote[i].valorEstimado : valorEstimadoMedio;
    dados.pacoteFechadoDesconto = i !== -1 ? totaisPorPacote[i].desconto : descontoMedio;
  }
  if (vaiFechar){
    dados.formaPagamentoCombinada = document.getElementById('f_formaPagamentoCombinada').value;

  }
  let pdfErro = null;
  try {
    let idLead = leadFormId, cliente;
    if (idLead){
      await apiCall('atualizarLead', Object.assign({ idLead }, dados));
      cliente = { nome: lfEst.lead['Cliente'], whatsapp: lfEst.lead['WhatsApp'], email: lfEst.lead['E-mail'] };
    } else {
      const rec = await apiCall('criarLead', Object.assign({ nome: c.nome, whatsapp: c.whatsapp, email: c.email }, dados));
      idLead = rec.id_lead || rec.idLead || rec['ID Lead'];
      cliente = { nome: rec.cliente || c.nome, whatsapp: rec.whatsapp || c.whatsapp, email: rec.email || c.email };
    }
    if (precisa){
      const versao = lfEst.versaoAtual + 1;
      const hash = lfHash_(c, cliente.nome);
      const snap = orcMontarSnapshot_({ idLead, versao, cliente, tipoEvento: c.tipoEvento, dataDesejada: c.dataDesejada,
        instituicao: c.instituicao, cfg: c.cfg });
      await apiCall('criarOrcamento', { idLead, versao, hash, snapshot: snap });
      // Só marca a versão/hash no lead depois que o orçamento foi gravado: se algo falhar
      // antes, o lead continua "desatualizado" e o orçamento é exigido de novo.
      await apiCall('atualizarLead', { idLead, orcVersao: versao, orcHash: hash });
      try { orcBaixarPdf_(snap); } catch (e){ pdfErro = e; }
    }
    loaded = false; currentView = 'leads'; renderNav(); await renderMain();
    showToast(pdfErro ? `Lead e orçamento salvos, mas o PDF falhou: ${pdfErro.message}` : (precisa ? 'Lead salvo e orçamento gerado.' : 'Lead salvo.'));
  } catch (err){
    mostrarErro('leadErr', err.message); window.scrollTo(0, 0);
    btn.disabled = false; btn.textContent = rotulo;
  }
}
