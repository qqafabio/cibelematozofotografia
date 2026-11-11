/// <reference path="../pb_data/types.d.ts" />
// v3.2 — cria a coleção "contratos" (gerada de assets/js/pbSchema.js).
migrate((db) => {
  const collection = new Collection({
  name: "contratos",
  type: "base",
  listRule: "@request.auth.id != \"\"",
  viewRule: "@request.auth.id != \"\" || (token != \"\" && token = @request.query.token && status != \"Cancelado\")",
  createRule: "@request.auth.id != \"\"",
  updateRule: "@request.auth.id != \"\"",
  deleteRule: "@request.auth.id != \"\"",
  schema: [
    new SchemaField({ name: "id_contrato", type: "number", required: false, options: { noDecimal: true } }),
    new SchemaField({ name: "id_lead", type: "number", required: false, options: { noDecimal: true } }),
    new SchemaField({ name: "id_evento", type: "number", required: false, options: { noDecimal: true } }),
    new SchemaField({ name: "id_cliente", type: "number", required: false, options: { noDecimal: true } }),
    new SchemaField({ name: "token", type: "text", required: false }),
    new SchemaField({ name: "status", type: "text", required: false }),
    new SchemaField({ name: "dados_snapshot", type: "text", required: false }),
    new SchemaField({ name: "link_pdf", type: "text", required: false }),
    new SchemaField({ name: "data_criacao", type: "text", required: false }),
    new SchemaField({ name: "data_assinatura", type: "text", required: false }),
  ],
  indexes: [
    "CREATE UNIQUE INDEX `idx_contratos_id_contrato` ON `contratos` (`id_contrato`)"
  ],
  });
  return new Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("contratos");
  return dao.deleteCollection(collection);
});
