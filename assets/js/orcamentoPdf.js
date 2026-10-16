/* ============================================================
   CRM · Cibele Matozo Fotografia — Geração do PDF do Orçamento (v3.18)
   <script> clássico. Usa jsPDF (CDN, window.jspdf). Reproduz a identidade do
   contrato/CRM: paleta creme/dourado/preto, serifada nos títulos (Times como
   substituta da Fraunces) e sans no corpo (Helvetica como substituta da Work Sans).
   ============================================================ */

const ORC_EMPRESA = {
  nome: 'Cibele Matozo Fotografia',
  responsavel: 'Cibele Matozo de Lara',
  cnpj: '69.546.199/0001-54',
  endereco: 'Rua Dilermando Pereira de Almeida, 394, casa 5, Pinheirinho, Curitiba/PR · CEP 81870-070',
  telefone: '(41) 99602-5409',
  email: 'cibelematozofotografia@gmail.com',
};
const ORC_COR = {
  paper: [251, 249, 244], ink: [34, 31, 28], soft: [107, 100, 89],
  rule: [220, 212, 196], gold: [168, 121, 30], goldSoft: [241, 230, 204],
};

function orcBRL_(n){
  return 'R$ ' + Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function orcSlug_(s){
  return orcNorm_(s).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'cliente';
}

function orcGerarPdf_(snap){
  if (!window.jspdf || !window.jspdf.jsPDF) throw new Error('Biblioteca de PDF (jsPDF) não carregou. Verifique a conexão e recarregue a página.');
  const doc = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210, H = 297, M = 18, CW = W - 2 * M, FOOT = 18;
  const C = ORC_COR;
  let y = 0;

  const fill = c => doc.setFillColor(c[0], c[1], c[2]);
  const stroke = c => doc.setDrawColor(c[0], c[1], c[2]);
  const color = c => doc.setTextColor(c[0], c[1], c[2]);
  const serif = (sz, bold) => { doc.setFont('times', bold ? 'bold' : 'normal'); doc.setFontSize(sz); };
  const sans = (sz, bold) => { doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(sz); };

  function fundo(){ fill(C.paper); doc.rect(0, 0, W, H, 'F'); }

  // Logo: a câmera do CRM (vetor) + wordmark.
  function logo(x, yy){
    stroke(C.ink); doc.setLineWidth(0.35);
    doc.roundedRect(x, yy + 2.2, 7, 5, 0.6, 0.6, 'S');
    doc.lines([[0.55, -0.9], [1.6, 0], [0.55, 0.9]], x + 2.2, yy + 2.2, [1, 1], 'S');
    doc.circle(x + 3.5, yy + 4.7, 1.5, 'S');
    color(C.ink); sans(10.5, true);
    doc.text('CIBELE MATOZO', x + 10, yy + 4.4, { charSpace: 0.5 });
    color(C.gold); sans(7.5, false);
    doc.text('FOTOGRAFIA', x + 10, yy + 8, { charSpace: 1.2 });
  }
  function cabecalho(){
    fundo();
    logo(M, 12);
    color(C.soft); sans(8, false);
    doc.text(`Orçamento nº ${snap.idLead}-v${snap.versao}`, W - M, 15, { align: 'right' });
    doc.text(`Emitido em ${snap.geradoEm}`, W - M, 19, { align: 'right' });
    stroke(C.rule); doc.setLineWidth(0.3); doc.line(M, 24, W - M, 24);
    y = 34;
  }
  function garantir(h){ if (y + h > H - FOOT){ doc.addPage(); cabecalho(); } }

  function secao(num, titulo){
    garantir(34);
    y += 4;
    color(C.gold); serif(11, true);
    doc.text(`${num}.`, M, y);
    color(C.ink); serif(12.5, true);
    doc.text(titulo.toUpperCase(), M + 7, y, { charSpace: 0.3 });
    stroke(C.gold); doc.setLineWidth(0.35); doc.line(M, y + 2, M + 22, y + 2);
    y += 8;
  }
  function paragrafo(texto, opts){
    opts = opts || {};
    sans(opts.size || 10, !!opts.bold);
    const linhas = doc.splitTextToSize(String(texto), opts.largura || CW);
    const lh = (opts.size || 10) * 0.46;
    for (const ln of linhas){
      garantir(lh + 1);
      sans(opts.size || 10, !!opts.bold); color(opts.cor || C.ink);
      doc.text(ln, opts.x || M, y); y += lh;
    }
    y += opts.depois == null ? 2 : opts.depois;
  }
  function bullet(texto){
    sans(10, false);
    const linhas = doc.splitTextToSize(String(texto), CW - 7);
    garantir(linhas.length * 4.7 + 1);
    sans(10, false);
    fill(C.gold); doc.circle(M + 1.6, y - 1.1, 0.7, 'F');
    color(C.ink);
    for (const ln of linhas){ doc.text(ln, M + 6, y); y += 4.7; }
    y += 0.8;
  }
  function linhaValor(rotulo, detalhe, valor, destaque){
    const alt = detalhe ? 11 : 8;
    garantir(alt + 2);
    if (destaque){ fill(C.goldSoft); doc.rect(M, y - 5.6, CW, alt + 1.4, 'F'); }
    color(C.ink);
    if (destaque){ serif(13, true); } else { sans(10, false); }
    doc.text(rotulo, M + (destaque ? 3 : 0), y);
    doc.text(valor, W - M - (destaque ? 3 : 0), y, { align: 'right' });
    if (detalhe){ color(C.soft); sans(8.5, false); doc.text(detalhe, M, y + 4.2); }
    if (!destaque){ stroke(C.rule); doc.setLineWidth(0.2); doc.line(M, y + alt - 4.6, W - M, y + alt - 4.6); }
    y += alt + (destaque ? 1 : 0);
  }
  function rotuloProduto(p){
    return p.cobranca === 'fixo' ? p.nome : `${p.nome} (${p.qtd} × ${orcBRL_(p.valor)})`;
  }

  /* ---------- Página 1 ---------- */
  cabecalho();
  color(C.gold); sans(8.5, true);
  doc.text('PROPOSTA DE COBERTURA FOTOGRÁFICA', M, y, { charSpace: 1.1 });
  y += 9;
  color(C.ink); serif(24, false);
  const tituloEvento = [snap.tipoEvento, snap.instituicao].filter(Boolean).join(' • ') || 'Evento';
  for (const ln of doc.splitTextToSize(tituloEvento, CW)){ doc.text(ln, M, y); y += 10; }
  y += 2;

  // Quadro de identificação
  const info = [
    ['Cliente', snap.cliente.nome],
    snap.dataDesejada ? ['Data prevista', snap.dataDesejada] : null,
    ['Empresa', `${ORC_EMPRESA.nome} — ${ORC_EMPRESA.responsavel}`],
    ['Contato', `${ORC_EMPRESA.telefone} • ${ORC_EMPRESA.email}`],
  ].filter(Boolean);
  fill(C.goldSoft); doc.roundedRect(M, y - 4, CW, info.length * 6.4 + 4, 1.5, 1.5, 'F');
  y += 1;
  for (const [k, v] of info){
    color(C.soft); sans(8.5, true); doc.text(k.toUpperCase(), M + 4, y, { charSpace: 0.4 });
    color(C.ink); sans(10, false); doc.text(String(v), M + 34, y);
    y += 6.4;
  }
  y += 4;

  let n = 1;
  secao(n++, 'Apresentação');
  paragrafo(`A ${ORC_EMPRESA.nome} apresenta esta proposta para a cobertura fotográfica de ${snap.tipoEvento || 'seu evento'}`
    + `${snap.instituicao ? ' — ' + snap.instituicao : ''}${snap.dataDesejada ? ', prevista para ' + snap.dataDesejada : ''}, `
    + `preparada especialmente para ${snap.cliente.nome}. Cada detalhe abaixo foi pensado para registrar os melhores momentos com cuidado, sensibilidade e profissionalismo.`);

  const incluso = snap.pacote.itens.concat(snap.pacote.extras);
  if (snap.pacote.nome || incluso.length){
    secao(n++, snap.pacote.nome ? `Serviços inclusos — ${snap.pacote.nome}` : 'Serviços inclusos');
    if (snap.pacote.descricao) paragrafo(snap.pacote.descricao, { cor: C.soft });
    if (incluso.length) incluso.forEach(bullet);
    else paragrafo('Detalhamento do pacote conforme combinado.', { cor: C.soft });
  }

  secao(n++, 'Investimento');
  const t = snap.totais;
  linhaValor(snap.pacote.nome ? `Pacote ${snap.pacote.nome}` : 'Cobertura fotográfica', '', orcBRL_(t.pacote));
  snap.produtos.forEach(p => linhaValor(rotuloProduto(p), p.descricao, orcBRL_(p.subtotal)));
  if (t.desconto > 0) linhaValor('Desconto', '', '- ' + orcBRL_(t.desconto));
  y += 2;
  linhaValor('TOTAL', '', orcBRL_(t.total), true);
  y += 3;

  if (snap.opcionais.length){
    secao(n++, 'Opcionais disponíveis');
    paragrafo('Itens que podem ser contratados à parte e não estão somados ao total acima.', { cor: C.soft });
    snap.opcionais.forEach(o => linhaValor(o.nome + (o.cobranca === 'fixo' ? '' : ' (por unidade)'), o.descricao, orcBRL_(o.valor)));
    y += 2;
  }

  secao(n++, 'Contratação e pagamento');
  [
    'A data é considerada reservada somente após a confirmação do pagamento da entrada ou do valor estabelecido para reserva.',
    'Cartão de crédito: parcelamento em até 10x, com as taxas da operadora sob responsabilidade do contratante.',
    'Cartão de débito e dinheiro: pagamento à vista.',
    'PIX: parcelamento a combinar diretamente com a Cibele.',
  ].forEach(bullet);

  if (snap.pacote.prazoEntrega){
    secao(n++, 'Entrega do material');
    bullet(snap.pacote.prazoEntrega);
  }

  y += 4;
  garantir(14);
  color(C.soft); sans(8.5, false);
  paragrafo('Proposta elaborada especialmente para ' + snap.cliente.nome + '. Os valores e condições podem ser ajustados mediante alinhamento prévio e formalização em contrato.', { size: 8.5, cor: C.soft });

  /* ---------- Rodapé em todas as páginas ---------- */
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++){
    doc.setPage(i);
    stroke(C.rule); doc.setLineWidth(0.3); doc.line(M, H - 14, W - M, H - 14);
    color(C.soft); sans(7.5, false);
    doc.text(`${ORC_EMPRESA.nome} · MEI · CNPJ ${ORC_EMPRESA.cnpj} · ${ORC_EMPRESA.telefone} · ${ORC_EMPRESA.email}`, M, H - 9.5);
    doc.text(ORC_EMPRESA.endereco, M, H - 5.8);
    doc.text(`Página ${i} de ${total}`, W - M, H - 9.5, { align: 'right' });
  }
  return doc;
}

function orcNomeArquivo_(snap){
  return `Orcamento-${orcSlug_(snap.cliente.nome)}-${snap.idLead}-v${snap.versao}.pdf`;
}
function orcBaixarPdf_(snap){
  orcGerarPdf_(snap).save(orcNomeArquivo_(snap));
}
function orcArquivoPdf_(snap){
  return new File([orcGerarPdf_(snap).output('blob')], orcNomeArquivo_(snap), { type: 'application/pdf' });
}
