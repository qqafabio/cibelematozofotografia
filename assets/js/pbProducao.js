/* ============================================================
   CRM · Cibele Matozo Fotografia — Adapter PocketBase · Produção (v3.3)
   <script> clássico. Depende de pbCore.js/pbEscrita.js.
   Espelha atualizarProducao (backend.txt 818-859) — só UPDATE, localizado
   pelo 'ID Evento' (a produção é 1:1 com o evento; não tem id próprio nem
   create/delete pela tela). PATCH parcial.
   ============================================================ */

// camelCase → colunas snake_case da coleção 'producao' (mapaCampoProducao_).
const MAPA_PRODUCAO = {
  fotoResponsavel: 'foto_responsavel', videoResponsavel: 'video_responsavel',
  storymakerResponsavel: 'storymaker_responsavel', briefing: 'briefing', preEvento: 'pre_evento',
  captacao: 'captacao', backup: 'backup', selecao: 'selecao', edicaoFoto: 'edicao_foto',
  edicaoVideo: 'edicao_video', storymakerTeaser: 'storymaker_teaser', album: 'album',
  linkFotos: 'link_das_fotos', aprovacao: 'aprovacao', entrega: 'entrega',
  dataEntrega: 'data_entrega', horaEntrega: 'hora_entrega', localEntrega: 'local_de_entrega',
  linkEntrega: 'link_entrega', pendencias: 'pendencias', observacoes: 'observacoes',
};

async function pbAtualizarProducao(dados){
  await pbAuthGarantir();
  const rec = await pbAchar_('producao', 'id_evento', dados.idEvento);
  const patch = {};
  for (const k of Object.keys(MAPA_PRODUCAO)){
    if (dados[k] !== undefined) patch[MAPA_PRODUCAO[k]] = dados[k];
  }
  const upd = await PB.collection('producao').update(rec.id, patch);
  // TODO Fase 2 (Agenda): quando o estado resultante tiver 'Data entrega', o
  // backend (818-846) sincroniza o compromisso de ENTREGA na Google Agenda e
  // grava 'ID Calendar Entrega'. Isso vira orquestração no front (pbAgenda.js).
  return upd;
}

Object.assign(window.PB_ACTIONS, {
  atualizarProducao: (d) => perfTime('PB atualizarProducao', pbAtualizarProducao(d)),
});
