/// <reference path="../pb_data/types.d.ts" />
// v3.19 — cria a coleção "contrato_assinaturas" (gerada de assets/js/pbSchema.js).
migrate((db) => {
  const dao = new Dao(db);
  const contratosCol = dao.findCollectionByNameOrId("contratos");
  const collection = new Collection({
  name: "contrato_assinaturas",
  type: "base",
  listRule: "@request.auth.id != \"\"",
  viewRule: "@request.auth.id != \"\"",
  createRule: "@request.auth.id != \"\" || (id_contrato.token != \"\" && id_contrato.token = @request.query.token && id_contrato.status != \"Cancelado\" && id_contrato.status != \"Assinado\")",
  updateRule: "@request.auth.id != \"\"",
  deleteRule: "@request.auth.id != \"\"",
  schema: [
    new SchemaField({ name: "id_assinatura", type: "number", required: false, options: { noDecimal: true } }),
    new SchemaField({ name: "id_contrato", type: "relation", required: false, options: { collectionId: contratosCol.id, maxSelect: 1, cascadeDelete: true } }),
    new SchemaField({ name: "autorizacao_imagem", type: "text", required: false }),
    new SchemaField({ name: "declaracoes", type: "text", required: false }),
    new SchemaField({ name: "metodo_assinatura", type: "text", required: false }),
    new SchemaField({ name: "nome_assinatura", type: "text", required: false }),
    new SchemaField({ name: "assinatura_arquivo", type: "file", required: false, options: { maxSelect: 1, maxSize: 52428800, thumbs: ["400x400", "1600x0"] } }),
    new SchemaField({ name: "ensaio_local", type: "text", required: false }),
    new SchemaField({ name: "ensaio_endereco", type: "text", required: false }),
    new SchemaField({ name: "modalidade_video", type: "text", required: false }),
    new SchemaField({ name: "data_assinatura", type: "text", required: false }),
  ],
  indexes: [
    "CREATE UNIQUE INDEX `idx_contrato_assinaturas_id_assinatura` ON `contrato_assinaturas` (`id_assinatura`)"
  ],
  });
  return dao.saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("contrato_assinaturas");
  return dao.deleteCollection(collection);
});
