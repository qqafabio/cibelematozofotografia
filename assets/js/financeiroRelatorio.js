/* ============================================================
   CRM · Cibele Matozo Fotografia — Relatório do Financeiro (.xlsx)
   <script> clássico. Depende de ExcelJS (CDN, crm.html), de parseDataBR()
   (modules/dashboard.js) e de eventos (state.js). Gera 2 abas: "Contas"
   (1 linha por conta) e "Parcelas" (1 linha por entrada/parcela), a partir
   das contas já filtradas na tela (agruparContas, modules/financeiro.js).
   ============================================================ */

const REL_FIN_COR = {
  cabecalho: { fundo: 'FF2B2A28', texto: 'FFFFFFFF' },
  'Recebido': { fundo: 'FFC6EFCE', texto: 'FF006100' },
  'Atrasada': { fundo: 'FFFFC7CE', texto: 'FF9C0006' },
  'A receber': { fundo: 'FFFFEB9C', texto: 'FF9C5700' },
  'Parcial': { fundo: 'FFDDEBF7', texto: 'FF1F4E78' },
};
const REL_FIN_BRL = '"R$" #,##0.00;[Red]-"R$" #,##0.00';
const REL_FIN_DATA = 'dd/mm/yyyy';
const REL_FIN_LINHA_CAB = 4; // linhas 1-2: título/subtítulo; 3: vazia; 4: cabeçalho da tabela

// Situação de uma parcela/entrada: Recebido | Atrasada | Parcial | A receber.
function situacaoParcelaRel_(p){
  const previsto = Number(p['Valor previsto'] || 0);
  const pago = Number(p['Valor pago'] || 0);
  if (p['Status'] === 'Recebido' || (previsto > 0 && pago >= previsto)) return 'Recebido';
  if (p['Status'] === 'Vencida') return 'Atrasada';
  if (pago > 0) return 'Parcial';
  return 'A receber';
}

// "DD/MM/AAAA" → Date em UTC (o Excel não desloca o dia); texto inválido volta como veio.
function dataParaExcelRel_(s){
  const d = s ? parseDataBR(s) : null;
  return d && !isNaN(d) ? new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())) : (s || '');
}

function diasEmAtrasoRel_(venc){
  const d = venc ? parseDataBR(venc) : null;
  if (!d || isNaN(d)) return '';
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((hoje - d) / 86400000));
}

function novaAbaRel_(wb, nome, titulo, subtitulo, colunas){
  const ws = wb.addWorksheet(nome, { views: [{ state: 'frozen', xSplit: 1, ySplit: REL_FIN_LINHA_CAB }] });
  ws.columns = colunas.map(([, largura]) => ({ width: largura }));
  ws.mergeCells(1, 1, 1, colunas.length);
  ws.getCell(1, 1).value = titulo;
  ws.getCell(1, 1).font = { bold: true, size: 15 };
  ws.mergeCells(2, 1, 2, colunas.length);
  ws.getCell(2, 1).value = subtitulo;
  ws.getCell(2, 1).font = { italic: true, color: { argb: 'FF666666' } };
  const cab = ws.getRow(REL_FIN_LINHA_CAB);
  cab.values = colunas.map(([nomeCol]) => nomeCol);
  cab.height = 30;
  cab.eachCell(cell => {
    cell.font = { bold: true, color: { argb: REL_FIN_COR.cabecalho.texto } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: REL_FIN_COR.cabecalho.fundo } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  });
  return ws;
}

function pintarSituacaoRel_(cell, situacao){
  const cor = REL_FIN_COR[situacao];
  if (!cor) return;
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cor.fundo } };
  cell.font = { bold: true, color: { argb: cor.texto } };
  cell.alignment = { horizontal: 'center' };
}

// Linha de totais com SUBTOTAL (respeita o filtro aplicado dentro do Excel) e autofiltro só sobre as linhas de dados.
function linhaTotaisRel_(ws, totais, qtdLinhas){
  const ini = REL_FIN_LINHA_CAB + 1, fim = REL_FIN_LINHA_CAB + qtdLinhas;
  ws.autoFilter = { from: { row: REL_FIN_LINHA_CAB, column: 1 }, to: { row: fim, column: ws.columnCount } };
  const row = ws.addRow([]);
  row.getCell(1).value = 'TOTAL';
  Object.keys(totais).forEach(letra => {
    const cell = row.getCell(letra);
    cell.value = { formula: `SUBTOTAL(109,${letra}${ini}:${letra}${fim})`, result: totais[letra] };
    cell.numFmt = REL_FIN_BRL;
  });
  row.eachCell({ includeEmpty: true }, cell => {
    cell.font = { bold: true };
    cell.border = { top: { style: 'medium' } };
  });
}

function montarAbaContasRel_(wb, contas, subtitulo){
  const ws = novaAbaRel_(wb, 'Contas', 'Relatório Financeiro — Contas', subtitulo, [
    ['Cliente', 32], ['Evento', 26], ['Data do evento', 14], ['Status da conta', 16],
    ['Parcelas (total)', 11], ['Recebidas', 11], ['A receber', 11], ['Atrasadas', 11],
    ['Total previsto', 16], ['Desconto', 14], ['Total recebido', 16], ['Saldo a receber', 16],
  ]);
  const eventoPorId = {};
  (eventos || []).forEach(e => { eventoPorId[e['ID Evento']] = e; });
  const situacaoConta = { Quitado: 'Recebido', Vencida: 'Atrasada', Parcial: 'Parcial', Pendente: 'A receber' };
  const totais = { I: 0, J: 0, K: 0, L: 0 };

  contas.forEach(c => {
    const ev = eventoPorId[c.idEvento] || {};
    const sit = c.parcelasReais.map(situacaoParcelaRel_);
    const saldo = Math.max(0, c.saldo);
    const row = ws.addRow([
      c.cliente || '',
      ev['Tipo de evento'] || ('Evento ' + c.idEvento),
      dataParaExcelRel_(ev['Data do evento']),
      c.status,
      c.parcelasReais.length,
      sit.filter(s => s === 'Recebido').length,
      sit.filter(s => s === 'A receber' || s === 'Parcial').length,
      sit.filter(s => s === 'Atrasada').length,
      c.totalPrevisto, c.desconto || 0, c.totalPago, saldo,
    ]);
    row.getCell(3).numFmt = REL_FIN_DATA;
    ['I', 'J', 'K', 'L'].forEach(l => { row.getCell(l).numFmt = REL_FIN_BRL; });
    [3, 5, 6, 7, 8].forEach(i => { row.getCell(i).alignment = { horizontal: 'center' }; });
    pintarSituacaoRel_(row.getCell(4), situacaoConta[c.status]);
    totais.I += c.totalPrevisto; totais.J += c.desconto || 0; totais.K += c.totalPago; totais.L += saldo;
  });
  linhaTotaisRel_(ws, totais, contas.length);
}

function montarAbaParcelasRel_(wb, contas, subtitulo){
  const ws = novaAbaRel_(wb, 'Parcelas', 'Relatório Financeiro — Parcelas', subtitulo, [
    ['Cliente', 32], ['Parcela', 10], ['Tipo de cobrança', 18], ['Vencimento', 14],
    ['Valor previsto', 16], ['Situação', 14], ['Forma de pagamento', 20], ['Data do recebimento', 16],
    ['Valor recebido', 16], ['Saldo', 16], ['Dias em atraso', 11],
  ]);
  const totais = { E: 0, I: 0, J: 0 };
  let qtd = 0;

  contas.forEach(c => {
    const ordenadas = [...c.parcelasReais].sort((a, b) => Number(a['Nº parcela'] || 0) - Number(b['Nº parcela'] || 0));
    ordenadas.forEach(p => {
      const situacao = situacaoParcelaRel_(p);
      const previsto = Number(p['Valor previsto'] || 0);
      const pago = Number(p['Valor pago'] || 0);
      const saldo = situacao === 'Recebido' ? 0 : Math.max(0, previsto - pago);
      const entrada = String(p['Tipo cobrança']) === 'Entrada';
      const row = ws.addRow([
        c.cliente || '',
        entrada ? 'Entrada' : `${p['Nº parcela'] || '?'}/${p['Total parcelas'] || '?'}`,
        p['Tipo cobrança'] || '',
        dataParaExcelRel_(p['Vencimento']),
        previsto, situacao, p['Forma pagamento'] || '',
        dataParaExcelRel_(p['Data pagamento']),
        pago, saldo,
        situacao === 'Atrasada' ? diasEmAtrasoRel_(p['Vencimento']) : '',
      ]);
      row.getCell(4).numFmt = REL_FIN_DATA; row.getCell(8).numFmt = REL_FIN_DATA;
      ['E', 'I', 'J'].forEach(l => { row.getCell(l).numFmt = REL_FIN_BRL; });
      [2, 4, 8, 11].forEach(i => { row.getCell(i).alignment = { horizontal: 'center' }; });
      pintarSituacaoRel_(row.getCell(6), situacao);
      totais.E += previsto; totais.I += pago; totais.J += saldo;
      qtd++;
    });
  });
  linhaTotaisRel_(ws, totais, qtd);
}

async function exportarRelatorioFinanceiro(contas, descricaoFiltros){
  if (typeof ExcelJS === 'undefined') throw new Error('Biblioteca de planilhas (ExcelJS) não carregou. Verifique a conexão e recarregue a página.');
  if (!contas.length) throw new Error('Nenhuma conta para exportar com os filtros atuais.');

  const agora = new Date();
  const hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const subtitulo = `Gerado em ${agora.toLocaleDateString('pt-BR')} às ${hora} · ${descricaoFiltros} · ${contas.length} conta${contas.length === 1 ? '' : 's'}`;
  const ordenadas = [...contas].sort((a, b) => String(a.cliente || '').localeCompare(String(b.cliente || ''), 'pt-BR'));

  const wb = new ExcelJS.Workbook();
  wb.creator = 'CRM · Cibele Matozo Fotografia';
  wb.created = agora;
  montarAbaContasRel_(wb, ordenadas, subtitulo);
  montarAbaParcelasRel_(wb, ordenadas, subtitulo);

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `relatorio-financeiro-${agora.toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 10000);
}
