/// <reference path="../pb_data/types.d.ts" />
// v3.19 — cria a coleção "vitrine_selecoes" (gerada de assets/js/pbSchema.js).
migrate((db) => {
  const dao = new Dao(db);
  const vitrinesCol = dao.findCollectionByNameOrId("vitrines");
  const collection = new Collection({
  name: "vitrine_selecoes",
  type: "base",
  listRule: "@request.auth.id != \"\" || (id_vitrine.status = \"Ativa\" && id_vitrine.token != \"\" && id_vitrine.token = @request.query.token && (id_vitrine.validade = \"\" || id_vitrine.validade >= @now) && (id_vitrine.senha_hash = \"\" || id_vitrine.senha_hash = @request.query.senha_hash))",
  viewRule: "@request.auth.id != \"\" || (id_vitrine.status = \"Ativa\" && id_vitrine.token != \"\" && id_vitrine.token = @request.query.token && (id_vitrine.validade = \"\" || id_vitrine.validade >= @now) && (id_vitrine.senha_hash = \"\" || id_vitrine.senha_hash = @request.query.senha_hash))",
  createRule: "@request.auth.id != \"\" || (@request.data.id_vitrine.status = \"Ativa\" && @request.data.id_vitrine.token != \"\" && @request.data.id_vitrine.token = @request.query.token && (@request.data.id_vitrine.validade = \"\" || @request.data.id_vitrine.validade >= @now) && (@request.data.id_vitrine.senha_hash = \"\" || @request.data.id_vitrine.senha_hash = @request.query.senha_hash))",
  updateRule: "@request.auth.id != \"\"",
  deleteRule: "@request.auth.id != \"\" || (id_vitrine.status = \"Ativa\" && id_vitrine.token != \"\" && id_vitrine.token = @request.query.token && (id_vitrine.validade = \"\" || id_vitrine.validade >= @now) && (id_vitrine.senha_hash = \"\" || id_vitrine.senha_hash = @request.query.senha_hash))",
  schema: [
    new SchemaField({ name: "id_selecao", type: "number", required: false, options: { noDecimal: true } }),
    new SchemaField({ name: "id_vitrine", type: "relation", required: false, options: { collectionId: vitrinesCol.id, maxSelect: 1, cascadeDelete: true } }),
    new SchemaField({ name: "arquivo_ref", type: "text", required: false }),
    new SchemaField({ name: "nome_arquivo", type: "text", required: false }),
    new SchemaField({ name: "data_selecao", type: "text", required: false }),
  ],
  indexes: [
    "CREATE UNIQUE INDEX `idx_vitrine_selecoes_id_selecao` ON `vitrine_selecoes` (`id_selecao`)"
  ],
  });
  return dao.saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("vitrine_selecoes");
  return dao.deleteCollection(collection);
});
