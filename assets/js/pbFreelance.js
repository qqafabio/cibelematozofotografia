/* ============================================================
   CRM · Cibele Matozo Fotografia — Adapter PocketBase · Freelance (v3.3)
   <script> clássico. Depende de pbCore.js/pbEscrita.js.
   Espelha eventos e pagamentos de freelance (backend.txt 1028-1126).
   id_evento / id_pagamento são atribuídos pelos pb_hooks.
   ============================================================ */

/* ---------- Eventos (freelance_eventos) ---------- */

// 'Total' é DERIVADO: soma dos 4 valores.
function freValores_(dados, rec){
  const base = rec || {};
  const vfoto = dados.valorFotografia !== undefined ? Number(dados.valorFotografia) : Number(base.valor_fotografia || 0);
  const vedi  = dados.valorEdicao     !== undefined ? Number(dados.valorEdicao)     : Number(base.valor_edicao || 0);
  const vfil  = dados.valorFilmagem   !== undefined ? Number(dados.valorFilmagem)   : Number(base.valor_filmagem || 0);
  const vsto  = dados.valorStorymaker !== undefined ? Number(dados.valorStorymaker) : Number(base.valor_storymaker || 0);
  return { vfoto, vedi, vfil, vsto, total: vfoto + vedi + vfil + vsto };
}

async function pbCriarFreelanceEvento(dados){
  await pbAuthGarantir();
  const v = freValores_(dados, null);
  return PB.collection('freelance_eventos').create({
    data: dados.data || '',
    nome_do_evento: dados.nomeEvento || '',
    servico: dados.servico || '',
    valor_fotografia: v.vfoto,
    valor_edicao: v.vedi,
    valor_filmagem: v.vfil,
    valor_storymaker: v.vsto,
    total: v.total,
    status_do_trabalho: dados.statusTrabalho || 'Pendente',   // default do backend
    fotografo: dados.fotografo || '',
    filmmaker: dados.filmmaker || '',
    storymaker: dados.storymaker || '',
    editor_fotos: dados.editorFotos || '',
    editor_videos: dados.editorVideos || '',
    observacoes: dados.observacoes || '',
    // sem id_evento → hook atribui
  });
}

// PATCH parcial dos campos de texto/seleção.
const MAPA_FRE = {
  data: 'data', nomeEvento: 'nome_do_evento', servico: 'servico',
  statusTrabalho: 'status_do_trabalho', fotografo: 'fotografo', filmmaker: 'filmmaker',
  storymaker: 'storymaker', editorFotos: 'editor_fotos', editorVideos: 'editor_videos',
  observacoes: 'observacoes',
};

async function pbAtualizarFreelanceEvento(dados){
  await pbAuthGarantir();
  const rec = await pbAchar_('freelance_eventos', 'id_evento', dados.idEvento);
  const patch = {};
  for (const k of Object.keys(MAPA_FRE)){
    if (dados[k] !== undefined) patch[MAPA_FRE[k]] = dados[k];
  }
  // Se QUALQUER um dos 4 valores veio, o backend (1068-1080) regrava os 4 +
  // recalcula o Total (usando o valor atual para os que não vieram).
  const temValor = ['valorFotografia', 'valorEdicao', 'valorFilmagem', 'valorStorymaker']
    .some(k => dados[k] !== undefined);
  if (temValor){
    const v = freValores_(dados, rec);
    patch.valor_fotografia = v.vfoto;
    patch.valor_edicao = v.vedi;
    patch.valor_filmagem = v.vfil;
    patch.valor_storymaker = v.vsto;
    patch.total = v.total;
  }
  return PB.collection('freelance_eventos').update(rec.id, patch);
}

// Excluir evento remove, em cascata, os pagamentos dele (backend 1110-1118).
async function pbExcluirFreelanceEvento(dados){
  await pbAuthGarantir();
  const rec = await pbAchar_('freelance_eventos', 'id_evento', dados.idEvento);
  const pagamentos = await PB.collection('freelance_pagamentos')
    .getFullList({ filter: 'id_evento=' + Number(dados.idEvento) });
  for (const p of pagamentos){ await PB.collection('freelance_pagamentos').delete(p.id); }
  await PB.collection('freelance_eventos').delete(rec.id);
  return { idEvento: dados.idEvento, excluido: true };
}

/* ---------- Pagamentos (freelance_pagamentos) ---------- */

async function pbCriarFreelancePagamento(dados){
  await pbAuthGarantir();
  return PB.collection('freelance_pagamentos').create({
    id_evento: Number(dados.idEvento),
    data_do_pagamento: dados.data || '',
    valor_pago: Number(dados.valor || 0),
    observacoes: dados.observacoes || '',
    // sem id_pagamento → hook atribui
  });
}

async function pbAtualizarFreelancePagamento(dados){
  await pbAuthGarantir();
  const rec = await pbAchar_('freelance_pagamentos', 'id_pagamento', dados.idPagamento);
  const patch = {};
  if (dados.data !== undefined) patch.data_do_pagamento = dados.data;
  if (dados.valor !== undefined) patch.valor_pago = Number(dados.valor || 0);
  if (dados.observacoes !== undefined) patch.observacoes = dados.observacoes;
  return PB.collection('freelance_pagamentos').update(rec.id, patch);
}

async function pbExcluirFreelancePagamento(dados){
  await pbAuthGarantir();
  const rec = await pbAchar_('freelance_pagamentos', 'id_pagamento', dados.idPagamento);
  await PB.collection('freelance_pagamentos').delete(rec.id);
  return { idPagamento: dados.idPagamento, excluido: true };
}

Object.assign(window.PB_ACTIONS, {
  criarFreelanceEvento: (d) => perfTime('PB criarFreelanceEvento', pbCriarFreelanceEvento(d)),
  atualizarFreelanceEvento: (d) => perfTime('PB atualizarFreelanceEvento', pbAtualizarFreelanceEvento(d)),
  excluirFreelanceEvento: (d) => perfTime('PB excluirFreelanceEvento', pbExcluirFreelanceEvento(d)),
  criarFreelancePagamento: (d) => perfTime('PB criarFreelancePagamento', pbCriarFreelancePagamento(d)),
  atualizarFreelancePagamento: (d) => perfTime('PB atualizarFreelancePagamento', pbAtualizarFreelancePagamento(d)),
  excluirFreelancePagamento: (d) => perfTime('PB excluirFreelancePagamento', pbExcluirFreelancePagamento(d)),
});
