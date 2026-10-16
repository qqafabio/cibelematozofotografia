/// <reference path="../pb_data/types.d.ts" />
// v3.2 — cria a coleção "orcamentos" (gerada de assets/js/pbSchema.js).
migrate((db) => {
  const collection = new Collection({
  name: "orcamentos",
  type: "base",
  listRule: "@request.auth.id != ''",
  viewRule: "@request.auth.id != ''",
  createRule: "@request.auth.id != ''",
  updateRule: "@request.auth.id != ''",
  deleteRule: "@request.auth.id != ''",
  schema: [
    new SchemaField({ name: "id_orcamento", type: "number", required: true, options: { noDecimal: true } }),
    new SchemaField({ name: "id_lead", type: "number", required: false, options: { noDecimal: true } }),
    new SchemaField({ name: "versao", type: "number", required: false, options: { noDecimal: false } }),
    new SchemaField({ name: "data_geracao", type: "text", required: false }),
    new SchemaField({ name: "valor_total", type: "number", required: false, options: { noDecimal: false } }),
    new SchemaField({ name: "hash", type: "text", required: false }),
    new SchemaField({ name: "snapshot", type: "text", required: false }),
  ],
  indexes: [
    "CREATE UNIQUE INDEX `idx_orcamentos_id_orcamento` ON `orcamentos` (`id_orcamento`)"
  ],
  });
  return new Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("orcamentos");
  return dao.deleteCollection(collection);
});
