/// <reference path="../pb_data/types.d.ts" />
// v3.19 — cria a coleção "vitrine_fotos" (gerada de assets/js/pbSchema.js).
migrate((db) => {
  const dao = new Dao(db);
  const vitrinesCol = dao.findCollectionByNameOrId("vitrines");
  const collection = new Collection({
  name: "vitrine_fotos",
  type: "base",
  listRule: "@request.auth.id != \"\" || (id_vitrine.status = \"Ativa\" && id_vitrine.token != \"\" && id_vitrine.token = @request.query.token && (id_vitrine.validade = \"\" || id_vitrine.validade >= @now) && (id_vitrine.senha_hash = \"\" || id_vitrine.senha_hash = @request.query.senha_hash))",
  viewRule: "@request.auth.id != \"\" || (id_vitrine.status = \"Ativa\" && id_vitrine.token != \"\" && id_vitrine.token = @request.query.token && (id_vitrine.validade = \"\" || id_vitrine.validade >= @now) && (id_vitrine.senha_hash = \"\" || id_vitrine.senha_hash = @request.query.senha_hash))",
  createRule: "@request.auth.id != \"\"",
  updateRule: "@request.auth.id != \"\"",
  deleteRule: "@request.auth.id != \"\"",
  schema: [
    new SchemaField({ name: "id_foto", type: "number", required: false, options: { noDecimal: true } }),
    new SchemaField({ name: "id_vitrine", type: "relation", required: false, options: { collectionId: vitrinesCol.id, maxSelect: 1, cascadeDelete: true } }),
    new SchemaField({ name: "arquivo", type: "file", required: false, options: { maxSelect: 1, maxSize: 52428800, thumbs: ["400x400", "1600x0"] } }),
    new SchemaField({ name: "ordem", type: "number", required: false, options: { noDecimal: false } }),
    new SchemaField({ name: "nome_original", type: "text", required: false }),
    new SchemaField({ name: "data_upload", type: "text", required: false }),
  ],
  indexes: [
    "CREATE UNIQUE INDEX `idx_vitrine_fotos_id_foto` ON `vitrine_fotos` (`id_foto`)"
  ],
  });
  return dao.saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("vitrine_fotos");
  return dao.deleteCollection(collection);
});
