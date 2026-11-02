/// <reference path="../pb_data/types.d.ts" />
// v3.19 — cria a coleção "vitrine_finalizacoes" (gerada de assets/js/pbSchema.js).
migrate((db) => {
  const dao = new Dao(db);
  const vitrinesCol = dao.findCollectionByNameOrId("vitrines");
  const collection = new Collection({
  name: "vitrine_finalizacoes",
  type: "base",
  listRule: "@request.auth.id != \"\"",
  viewRule: "@request.auth.id != \"\"",
  createRule: "@request.auth.id != \"\" || (@request.data.id_vitrine.status = \"Ativa\" && @request.data.id_vitrine.token != \"\" && @request.data.id_vitrine.token = @request.query.token && (@request.data.id_vitrine.validade = \"\" || @request.data.id_vitrine.validade >= @now) && (@request.data.id_vitrine.senha_hash = \"\" || @request.data.id_vitrine.senha_hash = @request.query.senha_hash))",
  updateRule: "@request.auth.id != \"\"",
  deleteRule: "@request.auth.id != \"\"",
  schema: [
    new SchemaField({ name: "id_finalizacao", type: "number", required: false, options: { noDecimal: true } }),
    new SchemaField({ name: "id_vitrine", type: "relation", required: false, options: { collectionId: vitrinesCol.id, maxSelect: 1, cascadeDelete: true } }),
    new SchemaField({ name: "qtd_selecionadas", type: "number", required: false, options: { noDecimal: false } }),
    new SchemaField({ name: "data", type: "text", required: false }),
  ],
  indexes: [
    "CREATE UNIQUE INDEX `idx_vitrine_finalizacoes_id_finalizacao` ON `vitrine_finalizacoes` (`id_finalizacao`)"
  ],
  });
  return dao.saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("vitrine_finalizacoes");
  return dao.deleteCollection(collection);
});
