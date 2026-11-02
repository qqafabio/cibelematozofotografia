/* ============================================================
   CRM · Cibele Matozo Fotografia — Regras e cálculo do Orçamento (v3.18)
   <script> clássico (escopo global). Sem DOM: só regras por tipo de evento,
   totais, hash de versionamento e montagem do snapshot que vira PDF.
   ============================================================ */

/* ---- Regras por tipo de evento (casa por texto normalizado: tolera acento/caixa) ---- */
const ORC_REGRAS = [
  { rx: /formatura/,                   becaCanudo: true,  ensaioPre: true },
  { rx: /anivers/,                     becaCanudo: false, ensaioPre: true },
  { rx: /15\s*anos|quinze|debut/,      becaCanudo: false, ensaioPre: true },
  { rx: /casament/,                    becaCanudo: false, ensaioPre: true },
  { rx: /bodas/,                       becaCanudo: false, ensaioPre: true },
];
function orcNorm_(s){
  return String(s == null ? '' : s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}
// { becaCanudo, ensaioPre } — tipos fora da tabela (ex.: Crisma) não têm opcionais.
function orcRegrasDoTipo_(tipo){
  const t = orcNorm_(tipo);
  const r = ORC_REGRAS.find(x => x.rx.test(t));
  return { becaCanudo: !!(r && r.becaCanudo), ensaioPre: !!(r && r.ensaioPre) };
}

/* ---- Configuração do orçamento guardada em leads.orc_dados (JSON) ----
   v3.20: um orçamento pode oferecer MAIS DE UM pacote (o cliente escolhe qual
   fechar) — por isso `pacotes` é uma lista, não mais um valor/itens únicos.
   Extras e produtos continuam valendo para qualquer pacote escolhido (decisão
   do usuário: mais simples de ler no PDF do que ter extras por pacote), e o
   desconto também é único (não por pacote). */
function orcConfigVazia_(){
  return { pacotes: [], extras: { becaCapelo: false, canudo: false, ensaioPre: false }, produtos: [] };
}
function orcPacoteVazio_(){
  return { nome: '', valorPacote: null, itens: null };
}
function orcParseDados_(json){
  const base = orcConfigVazia_();
  if (!json) return base;
  try {
    const o = JSON.parse(json);
    if (Array.isArray(o.pacotes)){
      base.pacotes = o.pacotes.map(p => ({
        nome: String(p.nome || ''),
        valorPacote: p.valorPacote == null || p.valorPacote === '' ? null : Number(p.valorPacote),
        itens: typeof p.itens === 'string' ? p.itens : null,
      }));
    } else if ((o.valorPacote != null && o.valorPacote !== '') || typeof o.itens === 'string'){
      // Formato anterior ao v3.20 (um único pacote, sem nome próprio — o nome
      // vivia em leads.pacote). `nome: null` é preenchido por orcConfigDoLead_,
      // que é quem tem acesso à linha do lead.
      base.pacotes = [{ nome: null,
        valorPacote: o.valorPacote == null || o.valorPacote === '' ? null : Number(o.valorPacote),
        itens: typeof o.itens === 'string' ? o.itens : null }];
    }
    Object.assign(base.extras, o.extras || {});
    base.produtos = Array.isArray(o.produtos) ? o.produtos.map(p => ({
      id: Number(p.id), nome: String(p.nome || ''), valor: Number(p.valor || 0),
      cobranca: p.cobranca === 'fixo' ? 'fixo' : 'unitario', qtd: Math.max(1, Number(p.qtd || 1)),
    })) : [];
  } catch (e){ /* JSON inválido → configuração vazia */ }
  return base;
}
function orcSerializarDados_(cfg){
  return JSON.stringify({
    pacotes: cfg.pacotes.map(p => ({
      nome: String(p.nome || ''),
      valorPacote: p.valorPacote == null ? null : Number(p.valorPacote),
      itens: p.itens == null ? null : String(p.itens),
    })),
    extras: { becaCapelo: !!cfg.extras.becaCapelo, canudo: !!cfg.extras.canudo, ensaioPre: !!cfg.extras.ensaioPre },
    produtos: cfg.produtos.map(p => ({ id: p.id, nome: p.nome, valor: p.valor, cobranca: p.cobranca, qtd: p.qtd })),
  });
}

/* Itens inclusos de 1 pacote: texto próprio (p.itens) ou, se nunca editado, o do catálogo. */
function orcItensDoPacote_(nomePacote){
  const pac = (typeof pacotes !== 'undefined' ? pacotes : []).find(p => String(p['Nome']) === String(nomePacote));
  return pac ? String(pac['Itens inclusos'] || '') : '';
}
function orcItensEfetivosPacote_(p){
  const txt = p.itens != null ? p.itens : orcItensDoPacote_(p.nome);
  return String(txt).split('\n').map(s => s.trim()).filter(Boolean);
}

/* ---- Totais ---- */
function orcSubtotalProduto_(p){
  return p.cobranca === 'fixo' ? Number(p.valor || 0) : Number(p.valor || 0) * Number(p.qtd || 1);
}
// valorEstimado = pacote + produtos (é o que vai para leads.valor_estimado); total = estimado − desconto.
// Continua recebendo 1 valor de pacote por vez — orcTotaisPacotes_ chama isso para cada pacote da lista.
function orcTotais_(valorPacote, produtosSel, desconto){
  const pacote = Number(valorPacote || 0);
  const produtosTotal = (produtosSel || []).reduce((s, p) => s + orcSubtotalProduto_(p), 0);
  const valorEstimado = pacote + produtosTotal;
  const desc = Number(desconto || 0);
  return { pacote, produtosTotal, valorEstimado, desconto: desc, total: Math.max(0, valorEstimado - desc) };
}
// 1 total por pacote do orçamento (produtos/desconto são os mesmos para todos).
function orcTotaisPacotes_(cfg, desconto){
  return (cfg.pacotes || []).map(p => Object.assign({ nome: p.nome }, orcTotais_(p.valorPacote, cfg.produtos, desconto)));
}
// Número único para leads.valor_estimado (funil/dashboard) quando há vários pacotes: média.
function orcMedia_(totaisPorPacote, chave){
  if (!totaisPorPacote.length) return 0;
  return totaisPorPacote.reduce((s, t) => s + t[chave], 0) / totaisPorPacote.length;
}

/* ---- Hash: só o que aparece no PDF. Mudou → exige novo orçamento (nova versão). ---- */
function orcCyrb53_(str){
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++){
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}
// e: { cliente, tipoEvento, dataDesejada, instituicao, desconto, cfg }
function orcHash_(e){
  const cfg = e.cfg || orcConfigVazia_();
  const regras = orcRegrasDoTipo_(e.tipoEvento);
  return orcCyrb53_(JSON.stringify([
    String(e.cliente || '').trim(), String(e.tipoEvento || '').trim(), String(e.dataDesejada || '').trim(),
    String(e.instituicao || '').trim(),
    cfg.pacotes.map(p => [String(p.nome || '').trim(), Number(p.valorPacote || 0), orcItensEfetivosPacote_(p)]),
    Number(e.desconto || 0),
    regras.becaCanudo && !!cfg.extras.becaCapelo, regras.becaCanudo && !!cfg.extras.canudo,
    regras.ensaioPre && !!cfg.extras.ensaioPre,
    cfg.produtos.map(p => [p.id, p.qtd, p.valor, p.cobranca]).sort((a, b) => a[0] - b[0]),
  ]));
}
// Mesma conta a partir de uma linha de lead já gravada (lista/detalhe).
function orcHashDoLead_(l){
  return orcHash_({
    cliente: l['Cliente'], tipoEvento: l['Tipo de evento'], dataDesejada: l['Data desejada'],
    instituicao: l['Instituição'], desconto: l['Desconto'],
    cfg: orcConfigDoLead_(l),
  });
}
// Leads antigos (sem orc_dados, ou formato anterior ao v3.20 com 1 pacote sem
// nome próprio): completa com leads.pacote/valor_estimado para não perder o
// que já estava preenchido.
function orcConfigDoLead_(l){
  const cfg = orcParseDados_(l['Orçamento dados']);
  if (cfg.pacotes.length === 1 && cfg.pacotes[0].nome == null){
    cfg.pacotes[0].nome = String(l['Pacote'] || '').trim();
    if (cfg.pacotes[0].valorPacote == null) cfg.pacotes[0].valorPacote = Number(l['Valor estimado'] || 0);
  } else if (!cfg.pacotes.length && (l['Pacote'] || Number(l['Valor estimado'] || 0) > 0)){
    cfg.pacotes.push({ nome: String(l['Pacote'] || '').trim(), valorPacote: Number(l['Valor estimado'] || 0), itens: null });
  }
  return cfg;
}
// 'sem' (nunca gerado) | 'atual' | 'desatualizado'
function orcSituacaoLead_(l){
  const versao = Number(l['Orçamento versão'] || 0);
  if (!versao) return 'sem';
  return orcHashDoLead_(l) === String(l['Orçamento hash'] || '') ? 'atual' : 'desatualizado';
}

/* ---- Snapshot imutável que alimenta o PDF e o histórico ----
   c: { idLead, versao, cliente:{nome,whatsapp,email}, tipoEvento, dataDesejada,
        instituicao, desconto, cfg }
   snap.totais é um resumo AGREGADO (média entre os pacotes quando há mais de
   um) — usado em orcamentos.valor_total e leads.valor_estimado, que exigem um
   número único. O valor de cada pacote individual fica em snap.pacotes[i]. */
function orcMontarSnapshot_(c){
  const cfg = c.cfg;
  const regras = orcRegrasDoTipo_(c.tipoEvento);
  const catalogoPacotes = (typeof pacotes !== 'undefined' ? pacotes : []);
  const extras = [];
  if (regras.becaCanudo && cfg.extras.becaCapelo) extras.push('Aluguel de 01 beca completa com capelo');
  if (regras.becaCanudo && cfg.extras.canudo) extras.push('01 canudo de formatura');
  if (regras.ensaioPre && cfg.extras.ensaioPre) extras.push('Ensaio fotográfico pré-evento');

  const totaisPorPacote = orcTotaisPacotes_(cfg, c.desconto);
  const snapPacotes = cfg.pacotes.map((p, i) => {
    const pac = catalogoPacotes.find(x => String(x['Nome']) === String(p.nome));
    return {
      nome: p.nome || '', descricao: pac ? (pac['Descrição'] || '') : '',
      itens: orcItensEfetivosPacote_(p), extras,
      prazoEntrega: pac ? (pac['Prazo entrega'] || '') : '',
      valor: Number(p.valorPacote || 0), total: totaisPorPacote[i].total,
    };
  });

  const selIds = new Set(cfg.produtos.map(p => Number(p.id)));
  const catalogo = (typeof produtos !== 'undefined' ? produtos : []);
  const opcionais = catalogo
    .filter(p => String(p['Ativo'] || 'Sim') !== 'Não' && !selIds.has(Number(p['ID'])) && aplicaAoTipoEvento_(p['Tipos de evento'], c.tipoEvento))
    .map(p => ({ nome: p['Nome'], descricao: p['Descrição'] || '', valor: Number(p['Valor'] || 0), cobranca: p['Tipo de cobrança'] === 'fixo' ? 'fixo' : 'unitario' }));

  const produtosTotal = cfg.produtos.reduce((s, p) => s + orcSubtotalProduto_(p), 0);
  return {
    idLead: c.idLead, versao: c.versao, geradoEm: new Date().toLocaleDateString('pt-BR'),
    cliente: c.cliente, tipoEvento: c.tipoEvento || '', dataDesejada: c.dataDesejada || '',
    instituicao: c.instituicao || '',
    pacotes: snapPacotes,
    produtos: cfg.produtos.map(p => Object.assign({}, p, { subtotal: orcSubtotalProduto_(p),
      descricao: ((catalogo.find(x => Number(x['ID']) === Number(p.id)) || {})['Descrição']) || '' })),
    opcionais,
    totais: { produtosTotal, desconto: Number(c.desconto || 0),
      valorEstimado: orcMedia_(totaisPorPacote, 'valorEstimado'), total: orcMedia_(totaisPorPacote, 'total') },
  };
}
