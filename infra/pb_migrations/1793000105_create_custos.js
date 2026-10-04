/// <reference path="../pb_data/types.d.ts" />
// v3.2 — cria a coleção "custos" (gerada de assets/js/pbSchema.js).
migrate((db) => {
  const collection = new Collection({
  name: "custos",
  type: "base",
  listRule: "@request.auth.id != ''",
  viewRule: "@request.auth.id != ''",
  createRule: "@request.auth.id != ''",
  updateRule: "@request.auth.id != ''",
  deleteRule: "@request.auth.id != ''",
  schema: [
    new SchemaField({ name: "id_custo", type: "number", required: true, options: { noDecimal: true } }),
    new SchemaField({ name: "id_evento", type: "number", required: false, options: { noDecimal: true } }),
    new SchemaField({ name: "data", type: "text", required: false }),
    new SchemaField({ name: "categoria", type: "text", required: false }),
    new SchemaField({ name: "fornecedor", type: "text", required: false }),
    new SchemaField({ name: "descricao", type: "text", required: false }),
    new SchemaField({ name: "valor", type: "number", required: false, options: { noDecimal: false } }),
    new SchemaField({ name: "pago", type: "text", required: false }),
    new SchemaField({ name: "forma_pagamento", type: "text", required: false }),
    new SchemaField({ name: "observacoes", type: "text", required: false }),
  ],
  indexes: [
    "CREATE UNIQUE INDEX `idx_custos_id_custo` ON `custos` (`id_custo`)"
  ],
  });
  return new Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("custos");
  return dao.deleteCollection(collection);
});
