/// <reference path="../pb_data/types.d.ts" />
// v3.19 Fase 4 — adiciona "categoria" (álbum, ex. "Cerimônia"/"Festa") à
// coleção JÁ EXISTENTE "vitrine_fotos" (a 1793000401_create_vitrine_fotos.js
// não altera coleção já criada). Aditiva e idempotente.
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("vitrine_fotos");
  if (!collection.schema.getFieldByName("categoria")) {
    collection.schema.addField(new SchemaField({
      name: "categoria",
      type: "text",
      required: false,
    }));
  }
  dao.saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("vitrine_fotos");
  const field = collection.schema.getFieldByName("categoria");
  if (field) collection.schema.removeField(field.id);
  dao.saveCollection(collection);
});
