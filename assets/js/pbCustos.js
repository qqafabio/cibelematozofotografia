/* ============================================================
   CRM · Cibele Matozo Fotografia — Adapter PocketBase · Custos (v3.3)
   <script> clássico. Depende de pbCore.js/pbEscrita.js.
   Espelha criarCusto/atualizarCusto/excluirCusto (backend.txt 931-974).
   id_custo é atribuído pelo pb_hook.
   ============================================================ */

function custoCriarToPb_(dados){
  return {
    id_evento: Number(dados.idEvento),
    data: dados.data || hojeBR_(),                 // backend: default new Date()
    categoria: dados.categoria || '',
    fornecedor: dados.fornecedor || '',
    descricao: dados.descricao || '',
    valor: Number(dados.valor || 0),
    pago: dados.pago || 'Não',                     // default do backend
    forma_pagamento: dados.formaPagamento || '',
    observacoes: dados.observacoes || '',
  };
}

// atualizarCusto é PATCH parcial.
const MAPA_CUSTO = {
  data: 'data', categoria: 'categoria', fornecedor: 'fornecedor', descricao: 'descricao',
  valor: 'valor', pago: 'pago', formaPagamento: 'forma_pagamento', observacoes: 'observacoes',
};

async function pbCriarCusto(dados){
  await pbAuthGarantir();
  return PB.collection('custos').create(custoCriarToPb_(dados)); // sem id_custo → hook
}

async function pbAtualizarCusto(dados){
  await pbAuthGarantir();
  const rec = await pbAchar_('custos', 'id_custo', dados.idCusto);
  const patch = {};
  for (const k of Object.keys(MAPA_CUSTO)){
    if (dados[k] !== undefined) patch[MAPA_CUSTO[k]] = dados[k];
  }
  if (patch.valor !== undefined) patch.valor = Number(patch.valor || 0); // coluna number
  return PB.collection('custos').update(rec.id, patch);
}

async function pbExcluirCusto(dados){
  await pbAuthGarantir();
  const rec = await pbAchar_('custos', 'id_custo', dados.idCusto);
  await PB.collection('custos').delete(rec.id);
  return { idCusto: dados.idCusto, excluido: true };
}

Object.assign(window.PB_ACTIONS, {
  criarCusto: (d) => perfTime('PB criarCusto', pbCriarCusto(d)),
  atualizarCusto: (d) => perfTime('PB atualizarCusto', pbAtualizarCusto(d)),
  excluirCusto: (d) => perfTime('PB excluirCusto', pbExcluirCusto(d)),
});
