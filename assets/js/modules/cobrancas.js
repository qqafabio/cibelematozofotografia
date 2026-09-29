/* ============================================================
   CRM · Cibele Matozo Fotografia — Módulo: Cobranças + exportação CSV
   Carregado como <script> clássico (escopo global compartilhado).
   NÃO usar import/export: os handlers onclick inline e o estado
   global dependem deste escopo. Ordem de carga definida em crm.html.
   ============================================================ */

async function exportarRelatorioCobracas(){
  const filtros = await abrirFiltrosExportacao();
  if (!filtros) return;

  try {
    const result = await apiCall('relatorioCobrancas', {
      filtroCliente: filtros.cliente || '',
      filtroValorMinimo: filtros.valorMin || 0,
      filtroDiasAtraso: filtros.diasMin || 0
    });

    let contas = (result.dados || []);

    if (filtros.incluirTodas === false) {
      contas = contas.filter(c => ['CRÍTICA','ALTA','MÉDIA'].includes(c.prioridade));
    }

    if (filtros.incluirBloqueados === false) {
      contas = contas.filter(c => c.statusCobranca !== 'Cliente bloqueado');
    }

    if (filtros.ordenar === 'valor') contas.sort((a,b) => b.saldo - a.saldo);
    else if (filtros.ordenar === 'cliente') contas.sort((a,b) => a.cliente.localeCompare(b.cliente));
    else contas.sort((a,b) => b.diasEmAtraso - a.diasEmAtraso);

    const csv = gerarRelatorioCSV(contas);
    downloadCSV(csv, `relatorio_cobrancas_${yyyymmdd()}.csv`);
    showToast('✅ CSV exportado com sucesso!');
  } catch (err) {
    showToast('❌ Erro ao exportar: ' + err.message);
  }
}

function gerarRelatorioCSV(contas){
  const header = 'Cliente,Valor (R$),Saldo (R$),Dias Atraso,Tentativas,Urgência,Status\r\n';
  const linhas = contas.map(c => {
    const cliente = String(c.cliente || '').replace(/"/g, '""');
    const valor = (Number(c.valor) || 0).toFixed(2);
    const saldo = (Number(c.saldo) || 0).toFixed(2);
    return `"${cliente}",${valor},${saldo},${c.diasEmAtraso},${c.tentativas},${c.prioridade},"${String(c.statusCobranca || '').replace(/"/g, '""')}"`;
  }).join('\r\n');

  return '﻿' + header + linhas;
}

function downloadCSV(content, filename){
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

async function abrirFiltrosExportacao(){
  return new Promise(resolve => {
    document.getElementById('overlayRoot').innerHTML = `
      <div class="form-overlay" id="overlay">
        <div class="form-panel" style="max-width:480px;">
          <h2>Exportar Relatório de Cobranças</h2>
          <div class="field">
            <label>Cliente (busca parcial)</label>
            <input id="f_clienteExp" type="text" placeholder="Ex.: João">
          </div>
          <div class="row2">
            <div class="field">
              <label>Valor mínimo (R$)</label>
              <input id="f_valorMinExp" type="number" placeholder="0" min="0" step="0.01">
            </div>
            <div class="field">
              <label>Dias mínimo de atraso</label>
              <input id="f_diasMinExp" type="number" placeholder="0" min="0">
            </div>
          </div>
          <div class="row2">
            <div class="field">
              <label><input type="checkbox" id="f_todosExp" checked> Incluir todas as contas</label>
            </div>
            <div class="field">
              <label><input type="checkbox" id="f_bloqExp" checked> Incluir bloqueados</label>
            </div>
          </div>
          <div class="field">
            <label>Ordenar por</label>
            <select id="f_ordenarExp">
              <option value="dias" selected>Dias de atraso (DESC)</option>
              <option value="valor">Valor (DESC)</option>
              <option value="cliente">Cliente (A-Z)</option>
            </select>
          </div>
          <div class="form-actions">
            <button class="btn-ghost" onclick="document.getElementById('overlay').remove(); window.exportModalResolve(null);">Cancelar</button>
            <button class="btn-primary" onclick="document.getElementById('overlay').remove(); window.exportModalResolve({cliente:document.getElementById('f_clienteExp').value,valorMin:Number(document.getElementById('f_valorMinExp').value)||0,diasMin:Number(document.getElementById('f_diasMinExp').value)||0,incluirTodas:document.getElementById('f_todosExp').checked,incluirBloqueados:document.getElementById('f_bloqExp').checked,ordenar:document.getElementById('f_ordenarExp').value});">Exportar</button>
          </div>
        </div>
      </div>
    `;
    window.exportModalResolve = resolve;
  });
}
/* ============ CONTAS EM ATRASO / COBRANÇAS ============ */

async function renderContasEmAtraso(main) {
  try {
    const result = await apiCall('listarContasEmAtrasoComFiltros', { limite: 100 });
    contasEmAtraso = result.dados || [];
    const { paginacao } = result;

    const totalAtraso = contasEmAtraso.reduce((s, c) => s + (Number(c['Valor'] || 0) - Number(c['Valor pago'] || 0)), 0);

    main.innerHTML = `
      <div class="view-header">
        <div><h1>📧 Cobranças</h1><p>${contasEmAtraso.length} conta${contasEmAtraso.length === 1 ? '' : 's'} em atraso</p></div>
      </div>
      <div class="kpi-row">
        <div class="kpi-card"><div class="kpi-label">Total em atraso</div><div class="kpi-value">${formatBRL(totalAtraso)}</div></div>
        <div class="kpi-card"><div class="kpi-label">Contas vencidas</div><div class="kpi-value">${contasEmAtraso.length}</div></div>
      </div>
      <div class="panel" id="tabelaAtraso"></div>
    `;

    desenharTabelaAtraso();
  } catch (err) {
    main.innerHTML = `<div class="view-header"><h1>Cobranças</h1></div><p style="color:var(--error);">Erro ao carregar contas: ${err.message}</p>`;
  }
}

function desenharTabelaAtraso() {
  const el = document.getElementById('tabelaAtraso');
  if (!contasEmAtraso.length) {
    el.innerHTML = `<div class="empty-state">✅ Nenhuma conta em atraso — parabéns!</div>`;
    return;
  }

  const ordenados = [...contasEmAtraso].sort((a, b) => b.diasEmAtraso - a.diasEmAtraso);
  el.innerHTML = `
    <table class="responsive-table">
      <thead>
        <tr>
          <th>Cliente</th>
          <th>Valor</th>
          <th>Dias de atraso</th>
          <th>Vencimento</th>
          <th>Ação</th>
        </tr>
      </thead>
      <tbody>
        ${ordenados.map((c, idx) => {
          const saldo = Number(c['Valor'] || 0) - Number(c['Valor pago'] || 0);
          return `
          <tr>
            <td data-label="Cliente">${esc(c['Cliente'] || '—')}</td>
            <td data-label="Valor">${formatBRL(saldo)}</td>
            <td data-label="Dias de atraso"><strong style="color:var(--error);">${c.diasEmAtraso} dias</strong></td>
            <td data-label="Vencimento">${esc(c['Vencimento'] || '—')}</td>
            <td data-label="Ação">
              <button class="btn-ghost" style="font-size:12px;padding:6px 10px;" onclick="abrirCopiadorMensagem(contasEmAtraso[${idx}]); event.preventDefault();">
                📋 Copiar
              </button>
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  `;
}

async function renderDashboardCobrancas(main) {
  try {
    const resumo = await apiCall('resumoCobrancas');
    const relatorio = await apiCall('relatorioCobrancas', { limite: 1000 });

    const { resumo: metricas, distribuicaoTentativas, urgencia } = resumo;
    const contas = (relatorio.dados || []).sort((a, b) => b.diasEmAtraso - a.diasEmAtraso);
    const top10 = contas.slice(0, 10);

    // Armazena em variável global para acesso via onclick
    dashboardCobrancas = top10.map(c => ({
      'ID Parcela': c.idParcela,
      'Cliente': c.cliente,
      'Valor': c.saldo,
      'diasEmAtraso': c.diasEmAtraso,
      'Vencimento': c.vencimento,
      'Tentativas Cobranca': c.tentativas
    }));

    const agora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    main.innerHTML = `
      <div class="view-header">
        <div><h1>📊 Análise de Cobranças</h1><p>Dashboard executivo • Atualizado: ${agora}</p></div>
        <button class="btn-primary" onclick="exportarRelatorioCobracas();">⬇️ Exportar CSV</button>
      </div>

      <!-- KPI: Resumo Geral -->
      <div class="kpi-row">
        <div class="kpi-card">
          <div class="kpi-label">Total em atraso</div>
          <div class="kpi-value">${formatBRL(metricas.totalEmAtraso)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Contas vencidas</div>
          <div class="kpi-value">${metricas.quantidadeContas}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Dias médio</div>
          <div class="kpi-value">${metricas.diasMedioAtraso}d</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Valor médio</div>
          <div class="kpi-value">${formatBRL(metricas.valorMedioAtraso)}</div>
        </div>
      </div>

      <!-- Distribuição de Tentativas -->
      <div class="panel" style="margin-bottom:20px;">
        <h2>Distribuição de Tentativas</h2>
        <div class="kpi-row">
          <div class="kpi-card" style="background:var(--ok-soft);">
            <div class="kpi-label">0 Tentativas (Novo)</div>
            <div class="kpi-value">${distribuicaoTentativas['0_tentativas']}</div>
          </div>
          <div class="kpi-card" style="background:#e3f2fd;">
            <div class="kpi-label">1 Tentativa</div>
            <div class="kpi-value">${distribuicaoTentativas['1_tentativa']}</div>
          </div>
          <div class="kpi-card" style="background:#fff3e0;">
            <div class="kpi-label">2 Tentativas</div>
            <div class="kpi-value">${distribuicaoTentativas['2_tentativas']}</div>
          </div>
          <div class="kpi-card" style="background:#ffebee;">
            <div class="kpi-label">3+ / Bloqueados</div>
            <div class="kpi-value">${distribuicaoTentativas['3_tentativas_ou_bloqueado']}</div>
          </div>
        </div>
      </div>

      <!-- Urgência -->
      <div class="panel" style="margin-bottom:20px;">
        <h2>Classificação por Urgência</h2>
        <div class="kpi-row">
          <div class="kpi-card urgency-critica">
            <div class="kpi-label" style="color:white;">🔴 Crítica (&gt;30 dias)</div>
            <div class="kpi-value" style="color:white;">${urgencia.critica}</div>
          </div>
          <div class="kpi-card urgency-alta">
            <div class="kpi-label" style="color:white;">🟠 Alta (15-30 dias)</div>
            <div class="kpi-value" style="color:white;">${urgencia.alta}</div>
          </div>
          <div class="kpi-card urgency-media">
            <div class="kpi-label">🟡 Média (7-15 dias)</div>
            <div class="kpi-value">${urgencia.media}</div>
          </div>
          <div class="kpi-card urgency-baixa">
            <div class="kpi-label" style="color:white;">🟢 Baixa (&lt;7 dias)</div>
            <div class="kpi-value" style="color:white;">${urgencia.baixa}</div>
          </div>
        </div>
      </div>

      <!-- Top 10 Contas Urgentes -->
      <div class="panel">
        <h2>Top ${Math.min(10, top10.length)} Contas Mais Urgentes</h2>
        ${top10.length ? `
          <table class="responsive-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Saldo</th>
                <th>Dias Atraso</th>
                <th>Tentativas</th>
                <th>Urgência</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              ${top10.map((c, idx) => {
                const urgClass = c.prioridade === 'CRÍTICA' ? 'urgency-critica' :
                                 c.prioridade === 'ALTA' ? 'urgency-alta' :
                                 c.prioridade === 'MÉDIA' ? 'urgency-media' : 'urgency-baixa';
                return `
                  <tr>
                    <td data-label="Cliente"><strong>${esc(c.cliente)}</strong></td>
                    <td data-label="Saldo">${formatBRL(c.saldo)}</td>
                    <td data-label="Dias Atraso"><strong style="color:var(--error);">${c.diasEmAtraso}d</strong></td>
                    <td data-label="Tentativas">${c.tentativas}/3</td>
                    <td data-label="Urgência"><span class="urgency-badge ${urgClass}">${c.prioridade}</span></td>
                    <td data-label="Ação">
                      <button class="btn-ghost" style="font-size:12px;padding:6px 10px;" onclick="abrirCopiadorMensagemFlutuante(dashboardCobrancas[${idx}]); event.preventDefault();">
                        📋 Cobrar
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        ` : `<div class="empty-state">✅ Nenhuma conta em atraso!</div>`}
      </div>
    `;
  } catch (err) {
    main.innerHTML = `<div class="view-header"><h1>Análise de Cobranças</h1></div><p style="color:var(--error);">Erro ao carregar dashboard: ${esc(err.message)}</p>`;
  }
}

