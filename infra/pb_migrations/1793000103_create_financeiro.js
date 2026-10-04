/// <reference path="../pb_data/types.d.ts" />
// v3.2 — cria a coleção "financeiro" (gerada de assets/js/pbSchema.js).
migrate((db) => {
  const collection = new Collection({
  name: "financeiro",
  type: "base",
  listRule: "@request.auth.id != ''",
  viewRule: "@request.auth.id != ''",
  createRule: "@request.auth.id != ''",
  updateRule: "@request.auth.id != ''",
  deleteRule: "@request.auth.id != ''",
  schema: [
    new SchemaField({ name: "id_parcela", type: "number", required: true, options: { noDecimal: true } }),
    new SchemaField({ name: "id_evento", type: "number", required: false, options: { noDecimal: true } }),
    new SchemaField({ name: "id_cliente", type: "number", required: false, options: { noDecimal: true } }),
    new SchemaField({ name: "cliente", type: "text", required: false }),
    new SchemaField({ name: "tipo_cobranca", type: "text", required: false }),
    new SchemaField({ name: "num_parcela", type: "number", required: false, options: { noDecimal: false } }),
    new SchemaField({ name: "total_parcelas", type: "number", required: false, options: { noDecimal: false } }),
    new SchemaField({ name: "vencimento", type: "text", required: false }),
    new SchemaField({ name: "valor_previsto", type: "number", required: false, options: { noDecimal: false } }),
    new SchemaField({ name: "forma_pagamento", type: "text", required: false }),
    new SchemaField({ name: "status", type: "text", required: false }),
    new SchemaField({ name: "data_pagamento", type: "text", required: false }),
    new SchemaField({ name: "valor_pago", type: "number", required: false, options: { noDecimal: false } }),
    new SchemaField({ name: "saldo", type: "number", required: false, options: { noDecimal: false } }),
    new SchemaField({ name: "observacoes", type: "text", required: false }),
    new SchemaField({ name: "observacoes_cobranca", type: "text", required: false }),
    new SchemaField({ name: "tentativas_cobranca", type: "number", required: false, options: { noDecimal: false } }),
  ],
  indexes: [
    "CREATE UNIQUE INDEX `idx_financeiro_id_parcela` ON `financeiro` (`id_parcela`)"
  ],
  });
  return new Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("financeiro");
  return dao.deleteCollection(collection);
});
