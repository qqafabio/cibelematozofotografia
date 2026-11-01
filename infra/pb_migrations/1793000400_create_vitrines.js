/// <reference path="../pb_data/types.d.ts" />
// v3.2 — cria a coleção "vitrines" (gerada de assets/js/pbSchema.js).
migrate((db) => {
  const collection = new Collection({
  name: "vitrines",
  type: "base",
  listRule: "@request.auth.id != \"\" || (status = \"Ativa\" && token != \"\" && token = @request.query.token && (validade = \"\" || validade >= @now) && (senha_hash = \"\" || senha_hash = @request.query.senha_hash))",
  viewRule: "@request.auth.id != \"\" || (status = \"Ativa\" && token != \"\" && token = @request.query.token && (validade = \"\" || validade >= @now) && (senha_hash = \"\" || senha_hash = @request.query.senha_hash))",
  createRule: "@request.auth.id != \"\"",
  updateRule: "@request.auth.id != \"\"",
  deleteRule: "@request.auth.id != \"\"",
  schema: [
    new SchemaField({ name: "id_vitrine", type: "number", required: false, options: { noDecimal: true } }),
    new SchemaField({ name: "id_evento", type: "number", required: false, options: { noDecimal: true } }),
    new SchemaField({ name: "token", type: "text", required: false }),
    new SchemaField({ name: "senha_hash", type: "text", required: false }),
    new SchemaField({ name: "validade", type: "date", required: false }),
    new SchemaField({ name: "status", type: "text", required: false }),
    new SchemaField({ name: "fonte_imagens", type: "text", required: false }),
    new SchemaField({ name: "link_pasta_drive", type: "text", required: false }),
    new SchemaField({ name: "nome_exibicao", type: "text", required: false }),
    new SchemaField({ name: "data_exibicao", type: "text", required: false }),
    new SchemaField({ name: "tema", type: "text", required: false }),
    new SchemaField({ name: "cor_primaria", type: "text", required: false }),
    new SchemaField({ name: "tipografia", type: "text", required: false }),
    new SchemaField({ name: "capa_url", type: "text", required: false }),
    new SchemaField({ name: "capa_posicao", type: "text", required: false }),
    new SchemaField({ name: "data_criacao", type: "text", required: false }),
  ],
  indexes: [
    "CREATE UNIQUE INDEX `idx_vitrines_id_vitrine` ON `vitrines` (`id_vitrine`)"
  ],
  });
  return new Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("vitrines");
  return dao.deleteCollection(collection);
});
