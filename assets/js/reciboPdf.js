/* ============================================================
   CRM · Cibele Matozo Fotografia — Recibo de Quitação (v3.33)
   <script> clássico. Usa jsPDF (CDN, window.jspdf — já carregado pelo
   orcamentoPdf.js). Reproduz o mesmo estilo visual do resto do sistema
   (creme/dourado/preto, serifada nos títulos). Gerado a partir de uma
   parcela (ou a Entrada) já "Recebida" no Financeiro — ver modules/financeiro.js.
   ============================================================ */

const RECIBO_COR = {
  paper: [251, 249, 244], ink: [34, 31, 28], soft: [107, 100, 89],
  rule: [220, 212, 196], gold: [168, 121, 30], goldSoft: [241, 230, 204],
};

/* ---- Valor por extenso (pt-BR) — cobre o uso real do sistema (até milhões) ---- */
function reciboExtenso999_(n){
  const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const dez19 = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
  if (n === 0) return '';
  if (n === 100) return 'cem';
  const c = Math.floor(n / 100);
  const resto = n % 100;
  const partes = [];
  if (c) partes.push(centenas[c]);
  if (resto){
    if (resto < 10) partes.push(unidades[resto]);
    else if (resto < 20) partes.push(dez19[resto - 10]);
    else {
      const d = Math.floor(resto / 10), u = resto % 10;
      partes.push(dezenas[d] + (u ? ' e ' + unidades[u] : ''));
    }
  }
  return partes.join(' e ');
}
function reciboValorExtenso_(valor){
  const v = Math.round(Number(valor || 0) * 100) / 100;
  const inteiro = Math.floor(v);
  const centavos = Math.round((v - inteiro) * 100);
  if (inteiro === 0 && centavos === 0) return 'zero reais';

  const milhoes = Math.floor(inteiro / 1000000);
  const milhares = Math.floor((inteiro % 1000000) / 1000);
  const resto999 = inteiro % 1000;

  const partes = [];
  if (milhoes) partes.push(milhoes === 1 ? 'um milhão' : reciboExtenso999_(milhoes) + ' milhões');
  if (milhares) partes.push(milhares === 1 ? 'mil' : reciboExtenso999_(milhares) + ' mil');
  if (resto999) partes.push(reciboExtenso999_(resto999));

  let reaisTxt = partes.filter(Boolean).join(' e ');
  if (reaisTxt) reaisTxt += inteiro === 1 ? ' real' : ' reais';

  let centavosTxt = '';
  if (centavos > 0) centavosTxt = reciboExtenso999_(centavos) + (centavos === 1 ? ' centavo' : ' centavos');

  if (reaisTxt && centavosTxt) return reaisTxt + ' e ' + centavosTxt;
  return reaisTxt || centavosTxt;
}

function reciboBRL_(n){
  return 'R$ ' + Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function reciboSlug_(s){
  return String(s || 'cliente').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'cliente';
}

/* dados: { cliente, cpf, tipoEvento, dataEvento, descricao, numero, total,
   valor, formaPagamento, dataPagamento, protocolo } */
function reciboGerarPdf_(dados){
  if (!window.jspdf || !window.jspdf.jsPDF) throw new Error('Biblioteca de PDF (jsPDF) não carregou. Verifique a conexão e recarregue a página.');
  const doc = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210, H = 297, M = 20, CW = W - 2 * M;
  const C = RECIBO_COR;

  const fill = c => doc.setFillColor(c[0], c[1], c[2]);
  const stroke = c => doc.setDrawColor(c[0], c[1], c[2]);
  const color = c => doc.setTextColor(c[0], c[1], c[2]);
  const serif = (sz, bold) => { doc.setFont('times', bold ? 'bold' : 'normal'); doc.setFontSize(sz); };
  const sans = (sz, bold) => { doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(sz); };

  fill(C.paper); doc.rect(0, 0, W, H, 'F');

  color(C.ink); sans(10.5, true);
  doc.text('CIBELE MATOZO FOTOGRAFIA', M, 18, { charSpace: 0.4 });
  color(C.gold); serif(20, true);
  doc.text('RECIBO', W / 2, 40, { align: 'center' });
  color(C.soft); sans(9, false);
  doc.text(`Nº ${dados.protocolo || '—'}`, W / 2, 47, { align: 'center' });
  stroke(C.rule); doc.setLineWidth(0.3); doc.line(M, 54, W - M, 54);

  let y = 68;
  fill(C.goldSoft); doc.rect(M, y - 10, CW, 20, 'F');
  color(C.ink); serif(22, true);
  doc.text(reciboBRL_(dados.valor), W / 2, y + 3, { align: 'center' });
  y += 20;

  sans(9.5, false); color(C.soft);
  doc.text(`(${reciboValorExtenso_(dados.valor)})`, W / 2, y, { align: 'center' });
  y += 16;

  const refEvento = dados.tipoEvento ? `${dados.tipoEvento}${dados.dataEvento ? ' em ' + dados.dataEvento : ''}` : (dados.dataEvento || '—');
  const refParcela = dados.total > 1 ? `${dados.descricao || 'Parcela'} ${dados.numero}/${dados.total}` : (dados.descricao || 'Pagamento');
  const corpo = `Recebi(emos) de ${dados.cliente || 'Cliente'}${dados.cpf ? ', CPF/CNPJ nº ' + dados.cpf : ''}, a importância de ${reciboBRL_(dados.valor)} (${reciboValorExtenso_(dados.valor)}), referente a ${refParcela} do evento "${refEvento}", pago via ${dados.formaPagamento || 'forma não informada'}${dados.dataPagamento ? ' em ' + dados.dataPagamento : ''}, dando plena quitação para os efeitos de direito, pelo valor aqui recebido.`;
  sans(11, false); color(C.ink);
  const linhas = doc.splitTextToSize(corpo, CW);
  linhas.forEach(ln => { doc.text(ln, M, y); y += 6; });

  y += 16;
  color(C.soft); sans(10, false);
  doc.text(`Curitiba/PR, ${dados.dataPagamento || new Date().toLocaleDateString('pt-BR')}.`, M, y);

  y += 6;
  if (typeof ASSINATURA_CIBELE_DATAURL !== 'undefined'){
    try { doc.addImage(ASSINATURA_CIBELE_DATAURL, 'PNG', M, y, 46, 32.9); } catch(e){ /* segue sem a imagem se não carregar */ }
    y += 33;
  }
  stroke(C.ink); doc.setLineWidth(0.35); doc.line(M, y, M + 80, y);
  y += 5;
  color(C.ink); serif(11, false);
  doc.text('Cibele Matozo de Lara', M, y);
  y += 5;
  color(C.soft); sans(8.5, false);
  doc.text('Cibele Matozo Fotografia · MEI · CNPJ 69.546.199/0001-54', M, y);

  stroke(C.rule); doc.setLineWidth(0.3); doc.line(M, H - 14, W - M, H - 14);
  color(C.soft); sans(7.5, false);
  doc.text('Cibele Matozo Fotografia · (41) 99602-5409 · cibelematozofotografia@gmail.com', M, H - 9.5);

  return doc;
}
function reciboNomeArquivo_(dados){
  return `Recibo-${reciboSlug_(dados.cliente)}-${dados.protocolo || Date.now()}.pdf`;
}
function reciboBaixarPdf_(dados){
  reciboGerarPdf_(dados).save(reciboNomeArquivo_(dados));
}
