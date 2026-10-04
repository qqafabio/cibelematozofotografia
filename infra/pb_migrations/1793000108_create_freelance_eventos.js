/// <reference path="../pb_data/types.d.ts" />
// v3.2 — cria a coleção "freelance_eventos" (gerada de assets/js/pbSchema.js).
migrate((db) => {
  const collection = new Collection({
  name: "freelance_eventos",
  type: "base",
  listRule: "@request.auth.id != ''",
  viewRule: "@request.auth.id != ''",
  createRule: "@request.auth.id != ''",
  updateRule: "@request.auth.id != ''",
  deleteRule: "@request.auth.id != ''",
  schema: [
    new SchemaField({ name: "id_evento", type: "number", required: true, options: { noDecimal: true } }),
    new SchemaField({ name: "data", type: "text", required: false }),
    new SchemaField({ name: "nome_do_evento", type: "text", required: false }),
    new SchemaField({ name: "servico", type: "text", required: false }),
    new SchemaField({ name: "valor_fotografia", type: "number", required: false, options: { noDecimal: false } }),
    new SchemaField({ name: "valor_edicao", type: "number", required: false, options: { noDecimal: false } }),
    new SchemaField({ name: "valor_filmagem", type: "number", required: false, options: { noDecimal: false } }),
    new SchemaField({ name: "valor_storymaker", type: "number", required: false, options: { noDecimal: false } }),
    new SchemaField({ name: "total", type: "number", required: false, options: { noDecimal: false } }),
    new SchemaField({ name: "status_do_trabalho", type: "text", required: false }),
    new SchemaField({ name: "fotografo", type: "text", required: false }),
    new SchemaField({ name: "filmmaker", type: "text", required: false }),
    new SchemaField({ name: "storymaker", type: "text", required: false }),
    new SchemaField({ name: "editor_fotos", type: "text", required: false }),
    new SchemaField({ name: "editor_videos", type: "text", required: false }),
    new SchemaField({ name: "observacoes", type: "text", required: false }),
  ],
  indexes: [
    "CREATE UNIQUE INDEX `idx_freelance_eventos_id_evento` ON `freelance_eventos` (`id_evento`)"
  ],
  });
  return new Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("freelance_eventos");
  return dao.deleteCollection(collection);
});
