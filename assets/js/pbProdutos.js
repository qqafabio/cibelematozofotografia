/* ============================================================
   CRM · Cibele Matozo Fotografia — Adapter PocketBase · Produtos (v3.18)
   <script> clássico. Depende de pbCore.js/pbEscrita.js.
   Catálogo de itens vendáveis no orçamento (quadro, álbum...).
   id_produto é atribuído pelo pb_hook.
   ============================================================ */

function produtoCamposToPb_(dados){
  return {
    nome: String(dados.nome).trim(),
    descricao: dados.descricao ? String(dados.descricao).trim() : '',
    valor: Number(dados.valor || 0),
    tipo_cobranca: dados.tipoCobranca === 'fixo' ? 'fixo' : 'unitario',
    tipos_evento: dados.tiposEvento ? String(dados.tiposEvento) : '',
    ativo: dados.ativo === 'Não' ? 'Não' : 'Sim',
  };
}

async function pbCriarProduto(dados){
  await pbAuthGarantir();
  if (!dados.nome || !String(dados.nome).trim()) throw new Error('Nome do produto é obrigatório');
  const payload = Object.assign(produtoCamposToPb_(dados), {
    data_criacao: hojeBR_(),
    data_atualizacao: '',
  });
  return PB.collection('produtos').create(payload);
}

async function pbAtualizarProduto(dados){
  await pbAuthGarantir();
  if (!dados.nome || !String(dados.nome).trim()) throw new Error('Nome do produto é obrigatório');
  const rec = await pbAchar_('produtos', 'id_produto', dados.id);
  const patch = Object.assign(produtoCamposToPb_(dados), { data_atualizacao: hojeBR_() });
  return PB.collection('produtos').update(rec.id, patch);
}

async function pbExcluirProduto(dados){
  await pbAuthGarantir();
  const rec = await pbAchar_('produtos', 'id_produto', dados.id);
  await PB.collection('produtos').delete(rec.id);
  return { id: dados.id, deletado: true };
}

Object.assign(window.PB_ACTIONS, {
  criarProduto: (d) => perfTime('PB criarProduto', pbCriarProduto(d)),
  atualizarProduto: (d) => perfTime('PB atualizarProduto', pbAtualizarProduto(d)),
  deletarProduto: (d) => perfTime('PB deletarProduto', pbExcluirProduto(d)),
});
