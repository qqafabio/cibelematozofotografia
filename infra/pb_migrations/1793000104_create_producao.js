/// <reference path="../pb_data/types.d.ts" />
// v3.2 — cria a coleção "producao" (gerada de assets/js/pbSchema.js).
migrate((db) => {
  const collection = new Collection({
  name: "producao",
  type: "base",
  listRule: "@request.auth.id != ''",
  viewRule: "@request.auth.id != ''",
  createRule: "@request.auth.id != ''",
  updateRule: "@request.auth.id != ''",
  deleteRule: "@request.auth.id != ''",
  schema: [
    new SchemaField({ name: "id_evento", type: "number", required: true, options: { noDecimal: true } }),
    new SchemaField({ name: "cliente", type: "text", required: false }),
    new SchemaField({ name: "tipo_evento", type: "text", required: false }),
    new SchemaField({ name: "data_evento", type: "text", required: false }),
    new SchemaField({ name: "foto_responsavel", type: "text", required: false }),
    new SchemaField({ name: "video_responsavel", type: "text", required: false }),
    new SchemaField({ name: "storymaker_responsavel", type: "text", required: false }),
    new SchemaField({ name: "briefing", type: "text", required: false }),
    new SchemaField({ name: "pre_evento", type: "text", required: false }),
    new SchemaField({ name: "captacao", type: "text", required: false }),
    new SchemaField({ name: "backup", type: "text", required: false }),
    new SchemaField({ name: "selecao", type: "text", required: false }),
    new SchemaField({ name: "edicao_foto", type: "text", required: false }),
    new SchemaField({ name: "edicao_video", type: "text", required: false }),
    new SchemaField({ name: "storymaker_teaser", type: "text", required: false }),
    new SchemaField({ name: "album", type: "text", required: false }),
    new SchemaField({ name: "aprovacao", type: "text", required: false }),
    new SchemaField({ name: "entrega", type: "text", required: false }),
    new SchemaField({ name: "link_das_fotos", type: "text", required: false }),
    new SchemaField({ name: "data_entrega", type: "text", required: false }),
    new SchemaField({ name: "hora_entrega", type: "text", required: false }),
    new SchemaField({ name: "local_de_entrega", type: "text", required: false }),
    new SchemaField({ name: "link_entrega", type: "text", required: false }),
    new SchemaField({ name: "pendencias", type: "text", required: false }),
    new SchemaField({ name: "observacoes", type: "text", required: false }),
    new SchemaField({ name: "id_calendar_entrega", type: "text", required: false }),
  ],
  indexes: [
    "CREATE UNIQUE INDEX `idx_producao_id_evento` ON `producao` (`id_evento`)"
  ],
  });
  return new Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("producao");
  return dao.deleteCollection(collection);
});
