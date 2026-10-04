/// <reference path="../pb_data/types.d.ts" />
// v3.2 — cria a coleção "eventos" (gerada de assets/js/pbSchema.js).
migrate((db) => {
  const collection = new Collection({
  name: "eventos",
  type: "base",
  listRule: "@request.auth.id != ''",
  viewRule: "@request.auth.id != ''",
  createRule: "@request.auth.id != ''",
  updateRule: "@request.auth.id != ''",
  deleteRule: "@request.auth.id != ''",
  schema: [
    new SchemaField({ name: "id_evento", type: "number", required: true, options: { noDecimal: true } }),
    new SchemaField({ name: "status", type: "text", required: false }),
    new SchemaField({ name: "cliente_responsavel", type: "text", required: false }),
    new SchemaField({ name: "whatsapp", type: "text", required: false }),
    new SchemaField({ name: "data_evento", type: "text", required: false }),
    new SchemaField({ name: "hora_inicio", type: "text", required: false }),
    new SchemaField({ name: "hora_fim", type: "text", required: false }),
    new SchemaField({ name: "tipo_evento", type: "text", required: false }),
    new SchemaField({ name: "servico_contratado", type: "text", required: false }),
    new SchemaField({ name: "local", type: "text", required: false }),
    new SchemaField({ name: "cidade", type: "text", required: false }),
    new SchemaField({ name: "pacote", type: "text", required: false }),
    new SchemaField({ name: "valor_pacote", type: "number", required: false, options: { noDecimal: false } }),
    new SchemaField({ name: "valor_foto_extra", type: "number", required: false, options: { noDecimal: false } }),
    new SchemaField({ name: "desconto", type: "number", required: false, options: { noDecimal: false } }),
    new SchemaField({ name: "valor_final", type: "number", required: false, options: { noDecimal: false } }),
    new SchemaField({ name: "prazo_entrega", type: "text", required: false }),
    new SchemaField({ name: "contrato", type: "text", required: false }),
    new SchemaField({ name: "link_contrato", type: "text", required: false }),
    new SchemaField({ name: "link_briefing", type: "text", required: false }),
    new SchemaField({ name: "link_pasta_drive", type: "text", required: false }),
    new SchemaField({ name: "equipe", type: "text", required: false }),
    new SchemaField({ name: "observacoes", type: "text", required: false }),
    new SchemaField({ name: "id_cliente", type: "number", required: false, options: { noDecimal: true } }),
    new SchemaField({ name: "id_calendar", type: "text", required: false }),
    new SchemaField({ name: "coletivo", type: "text", required: false }),
    new SchemaField({ name: "organizador", type: "text", required: false }),
  ],
  indexes: [
    "CREATE UNIQUE INDEX `idx_eventos_id_evento` ON `eventos` (`id_evento`)"
  ],
  });
  return new Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("eventos");
  return dao.deleteCollection(collection);
});
