/// <reference path="../pb_data/types.d.ts" />
// v3.19 Fase 2 — adiciona campos de seleção à coleção JÁ EXISTENTE "vitrines"
// (a 1793000400_create_vitrines.js não altera coleção já criada). Aditiva e
// idempotente. "selecao_finalizada_em" e "qtd_fotos_selecionadas_final" são
// setados pelo pb_hook (notificar_selecao.pb.js), nunca diretamente pelo
// cliente — por isso vitrines.updateRule continua auth-only.
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("vitrines");
  const campos = [
    { name: "qtd_fotos_pacote", type: "number" },
    { name: "selecao_finalizada_em", type: "text" },
    { name: "qtd_fotos_selecionadas_final", type: "number" },
  ];
  campos.forEach((c) => {
    if (!collection.schema.getFieldByName(c.name)) {
      collection.schema.addField(new SchemaField({
        name: c.name,
        type: c.type,
        required: false,
      }));
    }
  });
  dao.saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("vitrines");
  ["qtd_fotos_pacote", "selecao_finalizada_em", "qtd_fotos_selecionadas_final"].forEach((nome) => {
    const field = collection.schema.getFieldByName(nome);
    if (field) collection.schema.removeField(field.id);
  });
  dao.saveCollection(collection);
});
