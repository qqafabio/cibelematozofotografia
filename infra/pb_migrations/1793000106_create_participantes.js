/// <reference path="../pb_data/types.d.ts" />
// v3.2 — cria a coleção "participantes" (gerada de assets/js/pbSchema.js).
migrate((db) => {
  const collection = new Collection({
  name: "participantes",
  type: "base",
  listRule: "@request.auth.id != ''",
  viewRule: "@request.auth.id != ''",
  createRule: "@request.auth.id != ''",
  updateRule: "@request.auth.id != ''",
  deleteRule: "@request.auth.id != ''",
  schema: [
    new SchemaField({ name: "id_participante", type: "number", required: true, options: { noDecimal: true } }),
    new SchemaField({ name: "id_evento", type: "number", required: false, options: { noDecimal: true } }),
    new SchemaField({ name: "id_cliente", type: "number", required: false, options: { noDecimal: true } }),
    new SchemaField({ name: "nome_participante", type: "text", required: false }),
    new SchemaField({ name: "whatsapp", type: "text", required: false }),
    new SchemaField({ name: "status_compra", type: "text", required: false }),
    new SchemaField({ name: "qtd_fotos_extras", type: "number", required: false, options: { noDecimal: false } }),
    new SchemaField({ name: "observacoes", type: "text", required: false }),
    new SchemaField({ name: "data_criacao", type: "text", required: false }),
  ],
  indexes: [
    "CREATE UNIQUE INDEX `idx_participantes_id_participante` ON `participantes` (`id_participante`)"
  ],
  });
  return new Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("participantes");
  return dao.deleteCollection(collection);
});
