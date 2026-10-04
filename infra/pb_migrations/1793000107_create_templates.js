/// <reference path="../pb_data/types.d.ts" />
// v3.2 — cria a coleção "templates" (gerada de assets/js/pbSchema.js).
migrate((db) => {
  const collection = new Collection({
  name: "templates",
  type: "base",
  listRule: "@request.auth.id != ''",
  viewRule: "@request.auth.id != ''",
  createRule: "@request.auth.id != ''",
  updateRule: "@request.auth.id != ''",
  deleteRule: "@request.auth.id != ''",
  schema: [
    new SchemaField({ name: "id_template", type: "number", required: true, options: { noDecimal: true } }),
    new SchemaField({ name: "nome", type: "text", required: false }),
    new SchemaField({ name: "descricao", type: "text", required: false }),
    new SchemaField({ name: "corpo", type: "text", required: false }),
    new SchemaField({ name: "padrao", type: "text", required: false }),
    new SchemaField({ name: "data_criacao", type: "text", required: false }),
  ],
  indexes: [
    "CREATE UNIQUE INDEX `idx_templates_id_template` ON `templates` (`id_template`)"
  ],
  });
  return new Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("templates");
  return dao.deleteCollection(collection);
});
