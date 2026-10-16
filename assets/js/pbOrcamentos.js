/* ============================================================
   CRM · Cibele Matozo Fotografia — Adapter PocketBase · Orçamentos (v3.18)
   <script> clássico. Histórico imutável: 1 linha por versão gerada.
   id_orcamento é atribuído pelo pb_hook. Nunca há update (só create/delete).
   ============================================================ */

async function pbCriarOrcamento(dados){
  await pbAuthGarantir();
  const snap = dados.snapshot;
  return PB.collection('orcamentos').create({
    id_lead: Number(dados.idLead),
    versao: Number(dados.versao),
    data_geracao: hojeBR_(),
    valor_total: Number(snap && snap.totais ? snap.totais.total : 0),
    hash: String(dados.hash || ''),
    snapshot: JSON.stringify(snap),
  });
}

// Remove todas as versões de um lead (chamado ao excluir o lead).
async function pbExcluirOrcamentosDoLead(idLead){
  await pbAuthGarantir();
  const regs = await PB.collection('orcamentos').getFullList({ filter: `id_lead = ${Number(idLead)}` });
  for (const r of regs) await PB.collection('orcamentos').delete(r.id);
}

Object.assign(window.PB_ACTIONS, {
  criarOrcamento: (d) => perfTime('PB criarOrcamento', pbCriarOrcamento(d)),
});
