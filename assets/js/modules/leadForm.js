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
        <div class="col-md-6 field"><label>Serviço de interesse</label><select id="f_servico">${opcoesSelect(listas['Serviço'], editando ? lead['Serviço de interesse'] : '')}</select></div>
        <div class="col-md-6 field"><label>Origem</label><select id="f_origem">${opcoesSelect(listas['Canal'], editando ? lead['Origem'] : '')}</select></div>
      </div>
    </div>

    <div class="lf-card">
      <h3><i class="bi bi-receipt"></i> Orçamento</h3>
      <div class="row g-3">
        <div class="col-md-6 field"><label>Pacote</label><select id="f_pacote"></select></div>
        <div class="col-md-3 field"><label>Valor do pacote (R$)</label><input id="f_valorPacote" type="number" step="0.01" min="0" value="${cfg.valorPacote == null ? '' : esc(cfg.valorPacote)}"></div>
        <div class="col-md-3 field"><label>Desconto (R$)</label><input id="f_desconto" type="number" step="0.01" min="0" value="${v('Desconto')}"></div>
      </div>
      <div class="field mt-3"><label>Itens inclusos neste orçamento <small class="text-muted">(um por linha · aparecem no PDF · só deste lead, não altera o pacote)</small></label>
        <textarea id="f_itens" rows="6" placeholder="Selecione um pacote para preencher, ou escreva os itens"></textarea></div>
      <div id="lfDinamico"></div>
      <div class="lf-resumo" id="lfResumo"></div>
    </div>

    <div class="lf-card">
      <h3><i class="bi bi-flag"></i> Acompanhamento</h3>
      <div class="row g-3">
        <div class="col-md-6 field"><label>Etapa comercial</label><select id="f_etapa">${opcoesSelect(listas['Etapa comercial'], editando ? lead['Etapa comercial'] : '')}</select></div>
        <div class="col-md-6 field"><label>Próximo contato</label><input id="f_proximoContato" data-picker="date" placeholder="DD/MM/AAAA" value="${v('Próximo contato')}"><small class="text-muted">Cria um lembrete de dia inteiro na Google Agenda.</small></div>
        <div class="col-12 field"><label>Observações</label><textarea id="f_obs" rows="3">${v('Observações')}</textarea></div>
      </div>
    </div>

    ${editando ? `<div class="lf-card"><h3><i class="bi bi-clock-history"></i> Histórico de orçamentos</h3><div id="lfHist"></div></div>` : ''}

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
  }
  if (!editando) aplicarMascara('f_whatsapp', maskWhatsapp);

  const sTipo = document.getElementById('f_tipo');
  const sPacote = document.getElementById('f_pacote');
  sPacote.innerHTML = lfOpcoesPacotes_(sTipo.value, editando ? lead['Pacote'] : '');
  document.getElementById('f_itens').value = cfg.itens != null ? cfg.itens : orcItensDoPacote_(sPacote.value);
  lfDesenharDinamico_();

  sTipo.addEventListener('change', () => {
    // Troca de tipo: descarta produtos que não se aplicam e refaz a lista de pacotes.
    lfEst.cfg.produtos = lfEst.cfg.produtos.filter(p => {
      const cat = produtos.find(x => Number(x['ID']) === p.id);
      return !cat || aplicaAoTipoEvento_(cat['Tipos de evento'], sTipo.value);
    });
    sPacote.innerHTML = lfOpcoesPacotes_(sTipo.value, sPacote.value);
    lfDesenharDinamico_();
  });
  sPacote.addEventListener('change', () => {
    const pac = pacotes.find(p => String(p['Nome']) === sPacote.value);
    if (pac) document.getElementById('f_valorPacote').value = Number(pac['Valor pacote'] || 0);
    document.getElementById('f_itens').value = pac ? String(pac['Itens inclusos'] || '') : '';
    lfAtualizarResumo_();
  });
  ['f_valorPacote', 'f_itens', 'f_desconto', 'f_dataDesejada', 'f_instituicao', 'f_nome'].forEach(id => {
    const el = document.getElementById(id);
    if (el){ el.addEventListener('input', lfAtualizarResumo_); el.addEventListener('change', lfAtualizarResumo_); }
  });
}

/* Opcionais da regra do tipo + produtos do catálogo aplicáveis. */
function lfDesenharDinamico_(){
  const cont = document.getElementById('lfDinamico');
  const tipo = document.getElementById('f_tipo').value;
  const regras = orcRegrasDoTipo_(tipo);
  const cfg = lfEst.cfg;
  const selIds = new Set(cfg.produtos.map(p => p.id));
  const catalogo = produtos.filter(p => selIds.has(Number(p['ID']))
    || (String(p['Ativo'] || 'Sim') !== 'Não' && aplicaAoTipoEvento_(p['Tipos de evento'], tipo)));

  let html = '';
  if (regras.becaCanudo || regras.ensaioPre){
    html += `<div class="lf-checks">
      ${regras.becaCanudo ? `
      <label class="lf-check"><input type="checkbox" data-extra="becaCapelo" ${cfg.extras.becaCapelo ? 'checked' : ''}> Beca com capelo</label>
      <label class="lf-check"><input type="checkbox" data-extra="canudo" ${cfg.extras.canudo ? 'checked' : ''}> Canudo</label>` : ''}
      ${regras.ensaioPre ? `<label class="lf-check"><input type="checkbox" data-extra="ensaioPre" ${cfg.extras.ensaioPre ? 'checked' : ''}> Ensaio pré-evento</label>` : ''}
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

/* Lê o formulário inteiro (inclui o estado vivo de extras/produtos). */
function lfLer_(){
  const g = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
  const lead = lfEst.lead;
  const vp = g('f_valorPacote');
  lfEst.cfg.valorPacote = vp === '' ? null : Number(vp);
  lfEst.cfg.itens = document.getElementById('f_itens').value;
  return {
    nome: lead ? lead['Cliente'] : g('f_nome'),
    whatsapp: lead ? lead['WhatsApp'] : g('f_whatsapp'),
    email: lead ? lead['E-mail'] : g('f_email'),
    tipoEvento: g('f_tipo'), dataDesejada: g('f_dataDesejada'), instituicao: g('f_instituicao'),
    servico: g('f_servico'), origem: g('f_origem'), pacote: g('f_pacote'),
    desconto: Number(g('f_desconto') || 0), etapa: document.getElementById('f_etapa').value,
    proximoContato: g('f_proximoContato'), observacoes: g('f_obs'), cfg: lfEst.cfg,
  };
}
function lfHash_(c, nomeCliente){
  return orcHash_({ cliente: nomeCliente == null ? c.nome : nomeCliente, tipoEvento: c.tipoEvento, dataDesejada: c.dataDesejada,
    instituicao: c.instituicao, pacote: c.pacote, desconto: c.desconto, cfg: c.cfg });
}
function lfPrecisaGerar_(c){
  const mudou = lfHash_(c) !== lfEst.hashAtual;
  return mudou && (!!c.pacote || lfEst.versaoAtual > 0);
}

function lfAtualizarResumo_(){
  if (!document.getElementById('lfResumo')) return;
  const c = lfLer_();
  const t = orcTotais_(c.cfg.valorPacote, c.cfg.produtos, c.desconto);
  document.getElementById('lfResumo').innerHTML = `
    <div class="lf-linha"><span>Pacote${c.pacote ? ' ' + esc(c.pacote) : ''}</span><span>${formatBRL(t.pacote)}</span></div>
    ${c.cfg.produtos.map(p => `<div class="lf-linha"><span>${esc(p.nome)}${p.cobranca === 'fixo' ? '' : ` (${p.qtd} × ${formatBRL(p.valor)})`}</span><span>${formatBRL(orcSubtotalProduto_(p))}</span></div>`).join('')}
    ${t.desconto > 0 ? `<div class="lf-linha"><span>Desconto</span><span>− ${formatBRL(t.desconto)}</span></div>` : ''}
    <div class="lf-linha lf-total"><span>Total</span><span>${formatBRL(t.total)}</span></div>`;
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
  el.innerHTML = `<table class="lf-hist"><tbody>${hist.map(o => `<tr>
    <td><strong>v${o['Versão']}</strong></td><td>${esc(o['Data geração'])}</td><td>${formatBRL(o['Valor total'])}</td>
    <td style="text-align:right;white-space:nowrap;">
      <button class="btn-ghost" type="button" data-orc-pdf="${o['ID Orçamento']}"><i class="bi bi-file-earmark-pdf"></i> PDF</button>
      <button class="btn-ghost" type="button" data-orc-wa="${o['ID Orçamento']}"><i class="bi bi-whatsapp"></i> WhatsApp</button>
    </td></tr>`).join('')}</tbody></table>`;
  el.querySelectorAll('[data-orc-pdf]').forEach(b => b.addEventListener('click', () => orcAcaoHistorico_(b.dataset.orcPdf, false)));
  el.querySelectorAll('[data-orc-wa]').forEach(b => b.addEventListener('click', () => orcAcaoHistorico_(b.dataset.orcWa, true)));
}
function orcamentosDoLead_(idLead){
  return (orcamentos || []).filter(o => String(o['ID Lead']) === String(idLead))
    .sort((a, b) => Number(b['Versão']) - Number(a['Versão']));
}
function orcAcaoHistorico_(idOrc, whatsapp){
  const o = orcamentos.find(x => String(x['ID Orçamento']) === String(idOrc));
  if (!o) return;
  try {
    const snap = JSON.parse(o['Snapshot']);
    orcBaixarPdf_(snap);
    if (whatsapp) orcAbrirWhatsApp_(snap);
  } catch (err){ showToast('❌ ' + err.message); }
}
// Abre a conversa com a mensagem pronta; o PDF recém-baixado é anexado à mão.
function orcAbrirWhatsApp_(snap){
  let tel = String((snap.cliente && snap.cliente.whatsapp) || '').replace(/\D/g, '');
  if (!tel){ showToast('Cliente sem WhatsApp cadastrado. O PDF foi baixado.'); return; }
  if (tel.length <= 11) tel = '55' + tel;
  const primeiro = String(snap.cliente.nome || '').split(' ')[0];
  const msg = `Olá, ${primeiro}! Segue o orçamento${snap.tipoEvento ? ' do seu evento (' + snap.tipoEvento + ')' : ''}, no valor total de ${formatBRL(snap.totais.total)}. `
    + `Qualquer dúvida estou à disposição! — Cibele Matozo Fotografia`;
  window.open(`https://wa.me/${tel}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  showToast('PDF baixado — anexe-o na conversa do WhatsApp.');
}

async function lfSalvar_(){
  const c = lfLer_();
  if (!lfEst.lead && !c.nome){ mostrarErro('leadErr', 'Informe o nome.'); window.scrollTo(0, 0); return; }
  const precisa = lfPrecisaGerar_(c);
  const btn = document.getElementById('lfSalvar');
  const rotulo = btn.textContent;
  btn.disabled = true; btn.textContent = 'Salvando…';
  const t = orcTotais_(c.cfg.valorPacote, c.cfg.produtos, c.desconto);
  const dados = {
    tipoEvento: c.tipoEvento, dataDesejada: c.dataDesejada, servico: c.servico, pacote: c.pacote, origem: c.origem,
    etapa: c.etapa, valorEstimado: t.valorEstimado, desconto: c.desconto, proximoContato: c.proximoContato,
    observacoes: c.observacoes, instituicao: c.instituicao, orcDados: orcSerializarDados_(c.cfg),
  };
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
        instituicao: c.instituicao, pacote: c.pacote, desconto: c.desconto, cfg: c.cfg });
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
