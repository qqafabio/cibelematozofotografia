/// <reference path="../pb_data/types.d.ts" />
// v3.2 — cria a coleção "leads" (gerada de assets/js/pbSchema.js).
migrate((db) => {
  const collection = new Collection({
  name: "leads",
  type: "base",
  listRule: "@request.auth.id != ''",
  viewRule: "@request.auth.id != ''",
  createRule: "@request.auth.id != ''",
  updateRule: "@request.auth.id != ''",
  deleteRule: "@request.auth.id != ''",
  schema: [
    new SchemaField({ name: "id_lead", type: "number", required: true, options: { noDecimal: true } }),
    new SchemaField({ name: "data_entrada", type: "text", required: false }),
    new SchemaField({ name: "cliente", type: "text", required: false }),
    new SchemaField({ name: "whatsapp", type: "text", required: false }),
    new SchemaField({ name: "email", type: "text", required: false }),
    new SchemaField({ name: "tipo_evento", type: "text", required: false }),
    new SchemaField({ name: "data_desejada", type: "text", required: false }),
    new SchemaField({ name: "servico_interesse", type: "text", required: false }),
    new SchemaField({ name: "pacote", type: "text", required: false }),
    new SchemaField({ name: "origem", type: "text", required: false }),
    new SchemaField({ name: "etapa_comercial", type: "text", required: false }),
    new SchemaField({ name: "valor_estimado", type: "number", required: false, options: { noDecimal: false } }),
    new SchemaField({ name: "desconto", type: "number", required: false, options: { noDecimal: false } }),
    new SchemaField({ name: "probabilidade", type: "number", required: false, options: { noDecimal: false } }),
    new SchemaField({ name: "valor_ponderado", type: "number", required: false, options: { noDecimal: false } }),
    new SchemaField({ name: "proximo_contato", type: "text", required: false }),
    new SchemaField({ name: "prioridade", type: "text", required: false }),
    new SchemaField({ name: "motivo_perdido", type: "text", required: false }),
    new SchemaField({ name: "observacoes", type: "text", required: false }),
    new SchemaField({ name: "id_cliente", type: "number", required: false, options: { noDecimal: true } }),
  ],
  indexes: [
    "CREATE UNIQUE INDEX `idx_leads_id_lead` ON `leads` (`id_lead`)"
  ],
  });
  return new Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("leads");
  return dao.deleteCollection(collection);
});
