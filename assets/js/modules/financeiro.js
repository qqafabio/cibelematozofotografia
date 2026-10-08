/* ============================================================
   CRM · Cibele Matozo Fotografia — Módulo: Financeiro
   Carregado como <script> clássico (escopo global compartilhado).
   NÃO usar import/export: os handlers onclick inline e o estado
   global dependem deste escopo. Ordem de carga definida em crm.html.
   ============================================================ */

async function excluirContaComConfirmacao(conta){
  const mensagem = `Excluir toda a conta de "${conta.cliente}"? Isso remove todas as parcelas lançadas. Não pode ser desfeito.`;
  if (!confirm(mensagem)) return;
  const btn = document.getElementById('excluirConta');
  if (btn){ btn.disabled = true; btn.textContent = 'Excluindo…'; }
  try{
    await apiCall('excluirContaFinanceiro', { idEvento: conta.idEvento, idCliente: conta.idCliente || '' });
    loaded = false; fecharOverlay(); await renderMain(); showToast('Excluído.');
  } catch(err){
    const bloqueadoPorPagamento = /recebido/.test(err.message);
    if (bloqueadoPorPagamento && confirm(err.message + '\n\nSe for uma conta de teste, você pode excluir mesmo assim — isso apaga também o valor recebido, sem estorno real. Confirma a exclusão forçada?')){
      try{
        await apiCall('excluirContaFinanceiro', { idEvento: conta.idEvento, idCliente: conta.idCliente || '', forcar: true });
        loaded = false; fecharOverlay(); await renderMain(); showToast('Excluído.');
        return;
      } catch(err2){ mostrarErro('contaErr', err2.message); }
    } else {
      mostrarErro('contaErr', err.message);
    }
    if (btn){ btn.disabled = false; btn.textContent = 'Excluir conta'; }
  }
}
/* ============ FINANCEIRO ============ */
function agruparContas(){
  const grupos = {};
  financeiro.forEach(p => {
    // Em evento coletivo, cada participante (ID Cliente) é uma conta própria sob o mesmo
    // ID Evento. Em evento individual, ID Cliente é vazio → 1 conta por evento (sem mudança).
    const idCliente = p['ID Cliente'] || '';
    const key = p['ID Evento'] + '|' + idCliente;
    if (!grupos[key]) grupos[key] = { key: key, idEvento: p['ID Evento'], idCliente: idCliente, cliente: p['Cliente'], parcelas: [] };
    grupos[key].parcelas.push(p);
  });
  return Object.values(grupos).map(g => {
    // Linhas "Desconto" não entram no previsto nem na contagem de parcelas: viram
    // um abatimento à parte, subtraído do saldo (fonte única de verdade do desconto).
    const parcelasReais = g.parcelas.filter(p => String(p['Tipo cobrança']) !== 'Desconto');
    const totalPrevisto = parcelasReais.reduce((s,p) => s + Number(p['Valor previsto']||0), 0);
    const totalPago = g.parcelas.reduce((s,p) => s + Number(p['Valor pago']||0), 0);
    const desconto = g.parcelas.filter(p => String(p['Tipo cobrança']) === 'Desconto')
      .reduce((s,p) => s + Number(p['Valor previsto']||0), 0);
    const saldo = totalPrevisto - totalPago - desconto;
    const temVencida = parcelasReais.some(p => p['Status'] === 'Vencida');
    const status = saldo <= 0 ? 'Quitado' : (temVencida ? 'Vencida' : (totalPago > 0 ? 'Parcial' : 'Pendente'));
    return Object.assign(g, { totalPrevisto, totalPago, desconto, saldo, status, parcelasReais });
  });
}
function renderFinanceiro(main){
  const contas = agruparContas();
  const totalPrevisto = contas.reduce((s,c) => s + c.totalPrevisto, 0);
  const totalPago = contas.reduce((s,c) => s + c.totalPago, 0);
  main.innerHTML = `
    <div class="view-header">
      <div><h1>Financeiro</h1><p>${contas.length} conta${contas.length===1?'':'s'}, ${financeiro.length} parcela${financeiro.length===1?'':'s'} no total.</p></div>
      <button class="btn-primary" id="novaContaBtn">+ Nova conta</button>
    </div>
    <div class="kpi-row">
      <div class="kpi-card"><div class="kpi-label">Total previsto</div><div class="kpi-value">${formatBRL(totalPrevisto)}</div></div>
      <div class="kpi-card"><div class="kpi-label">Total recebido</div><div class="kpi-value">${formatBRL(totalPago)}</div></div>
    </div>
    <div class="panel panel-list"><div id="tabelaFinanceiro"></div></div>
  `;
  document.getElementById('novaContaBtn').addEventListener('click', () => abrirFormConta(null));
  desenharTabelaFinanceiro();
}
function desenharTabelaFinanceiro(){
  const el = document.getElementById('tabelaFinanceiro');
  const contas = agruparContas();
  if (!contas.length){ el.innerHTML = `<div class="empty-state">Nenhuma conta lançada ainda.</div>`; return; }
  const ordenados = [...contas].sort((a,b) => Number(b.idEvento) - Number(a.idEvento));
  el.innerHTML = `
    <table class="responsive-table">
      <thead><tr><th>Cliente</th><th>Parcelas</th><th>Total previsto</th><th>Recebido</th><th>Desconto</th><th>Saldo</th><th>Status</th><th>Ações</th></tr></thead>
      <tbody>${ordenados.map(c => `
        <tr data-id="${esc(c.key)}">
          <td data-label="Cliente">${esc(c.cliente)}</td><td data-label="Parcelas">${c.parcelasReais.length}</td>
          <td data-label="Total previsto">${formatBRL(c.totalPrevisto)}</td><td data-label="Recebido">${formatBRL(c.totalPago)}</td>
          <td data-label="Desconto">${c.desconto > 0 ? formatBRL(c.desconto) : '—'}</td>
          <td data-label="Saldo">${formatBRL(Math.max(0, c.saldo))}</td>
          <td data-label="Status"><span class="status-pill ${c.status==='Quitado'?'confirmado':(c.status==='Vencida'?'vencida':'')}">${c.status}</span></td>
          <td data-label="Ações"><div class="row-actions">
            <button class="btn-icon" data-view="${esc(c.key)}" title="Abrir conta"><i class="bi bi-eye"></i></button>
            <div class="dropdown d-inline-block">
              <button class="btn-icon" data-bs-toggle="dropdown" aria-expanded="false" title="Mais"><i class="bi bi-three-dots-vertical"></i></button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><button class="dropdown-item text-danger" data-del="${esc(c.key)}"><i class="bi bi-trash"></i> Excluir conta</button></li>
              </ul>
            </div>
          </div></td>
        </tr>`).join('')}</tbody>
    </table>`;
  el.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () =>
    abrirFormConta(contas.find(c => String(c.key) === b.dataset.view))));
  el.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => {
    const conta = contas.find(c => String(c.key) === b.dataset.del);
    if (conta) excluirContaComConfirmacao(conta);
  }));
}
function abrirFormConta(conta){
  const editando = !!conta;
  const opcoesEventos = eventos.map(e => `<option value="${esc(e['ID Evento'])}">${esc(e['Cliente / Responsável'])} — ${esc(e['Data do evento'])}</option>`).join('');
  // Separa a linha de Entrada (Tipo cobrança = "Entrada") e a de Desconto das demais parcelas.
  const entradaExistente = editando ? conta.parcelas.find(p => p['Tipo cobrança'] === 'Entrada') : null;
  const descontoExistente = editando ? conta.parcelas.find(p => p['Tipo cobrança'] === 'Desconto') : null;
  const parcelasRestantes = editando ? conta.parcelas.filter(p => p['Tipo cobrança'] !== 'Entrada' && p['Tipo cobrança'] !== 'Desconto') : [];
 
  document.getElementById('overlayRoot').innerHTML = `
    <div class="form-overlay" id="overlay">
      <div class="form-panel">
        <h2>${editando ? 'Conta — ' + esc(conta.cliente) : 'Nova conta'}</h2>
        <div class="form-err" id="contaErr" style="display:none;"></div>
        ${editando ? `<input type="hidden" id="f_idEvento" value="${esc(conta.idEvento)}">` : `
        <div class="field"><label>Evento</label><select id="f_idEvento">${eventos.length?opcoesEventos:'<option value="">Cadastre um evento primeiro</option>'}</select></div>
        `}
        <p id="saldoEventoInfo" style="font-size:12.5px;color:var(--ink-soft);margin:-4px 0 14px;"></p>
 
        <input type="hidden" id="f_entradaIdParcela" value="${esc(entradaExistente ? entradaExistente['ID Parcela'] : '')}">
        <div class="row2">
          <div class="field"><label>Entrada (valor)</label><input id="f_entradaValor" type="number" step="0.01" value="${esc(entradaExistente ? entradaExistente['Valor previsto'] : '')}"></div>
          <div class="field"><label>Status da entrada</label><select id="f_entradaStatus">${opcoesSelect(listas['Status cobrança'], entradaExistente ? entradaExistente['Status'] : 'Pago')}</select></div>
        </div>
        <p style="font-size:12px;color:var(--ink-soft);margin:-8px 0 14px;">Para reverter um pagamento já recebido, não zere o valor — mude o Status da entrada para algo diferente de "Pago".</p>
        <div class="row2">
          <div class="field"><label>Forma pagamento</label><select id="f_entradaForma">${opcoesSelect(listas['Forma pagamento'], entradaExistente ? entradaExistente['Forma pagamento'] : '')}</select></div>
          <div class="field"><label>Data pagamento</label><input id="f_entradaDataPagamento" class="p-mask-data" placeholder="DD/MM/AAAA" value="${esc(entradaExistente ? entradaExistente['Data pagamento'] : '')}"></div>
        </div>
 
        <hr style="border:none;border-top:1px solid var(--rule);margin:20px 0;">
 
        <div class="field"><label>Total de parcelas</label><input id="f_totalParcelas" type="number" min="0" value="${editando ? parcelasRestantes.length : 1}"></div>
        <div id="parcelasLista"></div>

        <hr style="border:none;border-top:1px solid var(--rule);margin:20px 0;">
        <input type="hidden" id="f_descontoIdParcela" value="${esc(descontoExistente ? descontoExistente['ID Parcela'] : '')}">
        <div class="field"><label>Desconto (R$)</label><input id="f_descontoValor" type="number" step="0.01" min="0" value="${esc(descontoExistente ? descontoExistente['Valor previsto'] : '')}"></div>
        <p style="font-size:12px;color:var(--ink-soft);margin:-8px 0 14px;">Abatido do saldo que o cliente deve pagar. Deixe vazio ou 0 para remover o desconto.</p>

        <div class="form-actions">
          ${editando ? `<button class="btn-danger" id="excluirConta" type="button">Excluir conta</button>` : ''}
          <button class="btn-ghost" id="cancelarConta">Cancelar</button>
          <button class="btn-primary" id="salvarContaBtn">${editando?'Salvar conta':'Criar conta'}</button>
        </div>
      </div>
    </div>`;
  document.getElementById('cancelarConta').addEventListener('click', fecharOverlay);
  document.getElementById('salvarContaBtn').addEventListener('click', () => salvarConta(editando ? conta : null));
  if (editando){
    document.getElementById('excluirConta').addEventListener('click', () => excluirContaComConfirmacao(conta));
  }
  document.getElementById('f_totalParcelas').addEventListener('input', () => renderLinhasParcelas(parcelasRestantes));
  document.getElementById('f_entradaValor').addEventListener('input', atualizarSaldoEventoInfo);
  document.getElementById('f_descontoValor').addEventListener('input', atualizarSaldoEventoInfo);
  document.querySelectorAll('#overlayRoot .p-mask-data').forEach(inp => {
    if (!inp.closest('.linha-parcela')) inp.addEventListener('input', () => { inp.value = maskData(inp.value); });
  });
  if (!editando) document.getElementById('f_idEvento').addEventListener('change', atualizarSaldoEventoInfo);
  renderLinhasParcelas(parcelasRestantes);
}
function idEventoDoForm(){
  const hidden = document.getElementById('f_idEvento');
  return hidden ? hidden.value : '';
}
function atualizarSaldoEventoInfo(){
  const idEvento = idEventoDoForm();
  const evento = eventos.find(e => String(e['ID Evento']) === String(idEvento));
  const info = document.getElementById('saldoEventoInfo');
  if (!evento){ info.textContent = ''; return; }
  const valorFinal = Number(evento['Valor final'] || 0);
  const entrada = Number(document.getElementById('f_entradaValor').value || 0);
  const somaParcelas = Array.from(document.querySelectorAll('.p-valor')).reduce((s, inp) => s + (Number(inp.value) || 0), 0);
  const descEl = document.getElementById('f_descontoValor');
  const desconto = descEl ? Number(descEl.value || 0) : 0;
  const restante = valorFinal - entrada - somaParcelas;
  const descTxt = desconto > 0 ? ` · desconto: ${formatBRL(desconto)}` : '';
  info.textContent = `Valor do evento: ${formatBRL(valorFinal)} · entrada: ${formatBRL(entrada)} · parcelas: ${formatBRL(somaParcelas)}${descTxt} · restante: ${formatBRL(restante)}`;
  info.style.color = restante < 0 ? 'var(--error)' : 'var(--ink-soft)';
}
function renderLinhasParcelas(parcelasExistentes){
  const total = Math.max(0, Number(document.getElementById('f_totalParcelas').value) || 0);
  const wrap = document.getElementById('parcelasLista');
  const jaTemLinhas = wrap.querySelectorAll('.linha-parcela').length > 0;
  // na primeira renderização, parte das parcelas já existentes; depois, preserva o que já foi digitado
  const base = jaTemLinhas
    ? Array.from(wrap.querySelectorAll('.linha-parcela')).map(linha => ({
        idParcela: linha.dataset.idParcela || '',
        tipo: linha.querySelector('.p-tipo').value,
        venc: linha.querySelector('.p-venc').value,
        valor: linha.querySelector('.p-valor').value,
        status: linha.querySelector('.p-status').value,
        forma: linha.querySelector('.p-forma').value,
        valorPago: linha.querySelector('.p-valorPago').value,
        dataPagamento: linha.querySelector('.p-dataPagamento').value,
      }))
    : (parcelasExistentes || []).map(p => ({
        idParcela: p['ID Parcela'], tipo: p['Tipo cobrança'], venc: p['Vencimento'], valor: p['Valor previsto'],
        status: p['Status'], forma: p['Forma pagamento'],
        valorPago: p['Valor pago'], dataPagamento: p['Data pagamento'],
      }));
  wrap.innerHTML = Array.from({length: total}, (_, i) => {
    const ant = base[i] || {};
    return `
    <div class="linha-parcela" data-id-parcela="${esc(ant.idParcela||'')}" style="border-top:1px solid var(--rule);padding-top:12px;margin-top:12px;">
      <p style="font-size:12.5px;color:var(--ink-soft);margin:0 0 8px;">Parcela ${i+1} de ${total}${ant.idParcela?' · já lançada':''}</p>
      <div class="row2">
        <div class="field"><label>Tipo cobrança</label><select class="p-tipo">${opcoesSelect(listas['Tipo cobrança'], ant.tipo||'')}</select></div>
        <div class="field"><label>Vencimento</label><input class="p-venc p-mask-data" placeholder="DD/MM/AAAA" value="${esc(ant.venc||'')}"></div>
      </div>
      <div class="row2">
        <div class="field"><label>Valor</label><input class="p-valor" type="number" step="0.01" value="${esc(ant.valor||'')}"></div>
        <div class="field"><label>Status</label><select class="p-status">${opcoesSelect(listas['Status cobrança'], ant.status||'Pendente')}</select></div>
      </div>
      <div class="row2">
        <div class="field"><label>Forma pagamento</label><select class="p-forma">${opcoesSelect(listas['Forma pagamento'], ant.forma||'')}</select></div>
        <div class="field"><label>Data pagamento</label><input class="p-dataPagamento p-mask-data" placeholder="DD/MM/AAAA" value="${esc(ant.dataPagamento||'')}"></div>
      </div>
      <div class="field"><label>Valor pago</label><input class="p-valorPago" type="number" step="0.01" value="${esc(ant.valorPago||'')}"></div>
    </div>`;
  }).join('');
  wrap.querySelectorAll('.p-mask-data').forEach(inp => inp.addEventListener('input', () => { inp.value = maskData(inp.value); }));
  wrap.querySelectorAll('.p-valor').forEach(inp => inp.addEventListener('input', atualizarSaldoEventoInfo));
  atualizarSaldoEventoInfo();
}
async function salvarConta(contaExistente){
  const idEvento = (contaExistente && contaExistente.idEvento) || document.getElementById('f_idEvento').value;
  if (!idEvento){ mostrarErro('contaErr','Escolha um evento.'); return; }

  const entradaValor = Number(document.getElementById('f_entradaValor').value || 0);
  const entrada = entradaValor > 0 ? {
    idParcela: document.getElementById('f_entradaIdParcela').value || undefined,
    valor: entradaValor,
    status: document.getElementById('f_entradaStatus').value,
    formaPagamento: document.getElementById('f_entradaForma').value,
    dataPagamento: document.getElementById('f_entradaDataPagamento').value.trim(),
  } : null;

  const parcelas = Array.from(document.querySelectorAll('.linha-parcela')).map(linha => ({
    idParcela: linha.dataset.idParcela || undefined,
    tipoCobranca: linha.querySelector('.p-tipo').value,
    vencimento: linha.querySelector('.p-venc').value.trim(),
    valor: Number(linha.querySelector('.p-valor').value || 0),
    status: linha.querySelector('.p-status').value,
    formaPagamento: linha.querySelector('.p-forma').value,
    dataPagamento: linha.querySelector('.p-dataPagamento').value.trim(),
    valorPago: Number(linha.querySelector('.p-valorPago').value || 0),
  }));
  if (parcelas.some(p => !p.valor)){ mostrarErro('contaErr','Preencha o valor de todas as parcelas.'); return; }
  if (!entrada && !parcelas.length){ mostrarErro('contaErr','Informe a entrada ou ao menos uma parcela.'); return; }

  // Conta de participante (evento coletivo): mantém o vínculo com o cliente ao salvar,
  // para não colar a parcela no responsável do evento.
  const payload = { idEvento, entrada, parcelas };
  payload.desconto = Number(document.getElementById('f_descontoValor').value || 0);
  if (contaExistente && contaExistente.idCliente){
    payload.idCliente = contaExistente.idCliente;
    payload.clienteNome = contaExistente.cliente;
  }

  const btn = document.getElementById('salvarContaBtn'); btn.disabled = true; btn.textContent = 'Salvando…';
  try{
    await apiCall('salvarConta', payload);
    loaded = false; fecharOverlay(); await renderMain(); showToast('Conta salva.');
  } catch(err){ mostrarErro('contaErr', err.message); btn.disabled=false; btn.textContent = contaExistente?'Salvar conta':'Criar conta'; }
}

