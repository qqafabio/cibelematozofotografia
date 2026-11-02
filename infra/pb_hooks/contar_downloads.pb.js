/// <reference path="../pb_data/types.d.ts" />
// v3.19 Fase 4 — Vitrine de Fotos: contador de downloads da entrega final.
// Dispara quando o CLIENTE cria um registro em "vitrine_downloads" (clique
// em "Baixar" na seção de entrega final, ver vitrine.html). Incrementa
// vitrines.entrega_downloads_count — campo que o cliente NÃO pode editar
// diretamente (updateRule de "vitrines" continua auth-only; só este hook,
// rodando com privilégio de servidor, consegue gravar ali). Igual ao padrão
// de notificar_selecao.pb.js: tudo em try/catch, nunca derruba o PocketBase.
onRecordAfterCreateRequest((e) => {
  try {
    const dao = $app.dao();
    const idVitrine = e.record.get("id_vitrine");
    const vitrine = dao.findRecordById("vitrines", idVitrine);
    vitrine.set("entrega_downloads_count", vitrine.getInt("entrega_downloads_count") + 1);
    dao.saveRecord(vitrine);
  } catch (err) {
    console.log("contar_downloads: erro (não impede o download) — " + err);
  }
}, "vitrine_downloads");
