/// <reference path="../pb_data/types.d.ts" />
// v3.19 Fase 3 — adiciona o campo "preview" (derivado com marca d'água,
// gerado no navegador no upload) à coleção JÁ EXISTENTE "vitrine_fotos" (a
// 1793000401_create_vitrine_fotos.js não altera coleção já criada). Aditiva
// e idempotente. O campo "arquivo" (original, sem marca d'água) continua
// existindo e nunca é alterado — só passa a não ser mais servido na vitrine
// pública (ver vitrine.html), que vira reservado para a entrega final
// (Fase 4, ainda não construída).
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("vitrine_fotos");
  if (!collection.schema.getFieldByName("preview")) {
    collection.schema.addField(new SchemaField({
      name: "preview",
      type: "file",
      required: false,
      options: { maxSelect: 1, maxSize: 52428800, thumbs: ["400x400"] },
    }));
  }
  dao.saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("vitrine_fotos");
  const field = collection.schema.getFieldByName("preview");
  if (field) collection.schema.removeField(field.id);
  dao.saveCollection(collection);
});
