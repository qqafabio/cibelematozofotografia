/// <reference path="../pb_data/types.d.ts" />
// v3.26 — Fase 4 do Contrato Digital: adiciona "pdf_arquivo" à coleção JÁ
// EXISTENTE "contrato_assinaturas" — o PDF do contrato assinado, gerado no
// navegador do cliente (jsPDF, igual orcamentoPdf.js) no momento da assinatura
// e enviado junto no mesmo create(). Sem thumbs (não é imagem). Escrita à mão,
// aditiva e idempotente (mesmo padrão de 1793000413/1793000414).
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("contrato_assinaturas");
  if (!collection.schema.getFieldByName("pdf_arquivo")) {
    collection.schema.addField(new SchemaField({
      name: "pdf_arquivo",
      type: "file",
      required: false,
      options: { maxSelect: 1, maxSize: 52428800, thumbs: [] },
    }));
    dao.saveCollection(collection);
  }
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("contrato_assinaturas");
  const field = collection.schema.getFieldByName("pdf_arquivo");
  if (field) {
    collection.schema.removeField(field.id);
    dao.saveCollection(collection);
  }
});
