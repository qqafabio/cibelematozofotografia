/// <reference path="../pb_data/types.d.ts" />
// v3.19.3 — adiciona "capa_posicao" à coleção JÁ EXISTENTE "vitrines" (a
// 1793000400_create_vitrines.js não altera coleção já criada). Aditiva e
// idempotente. Permite ajustar o foco vertical da foto de capa (ex.: rosto
// de criança cortado quando a foto é de retrato e o recorte é só "center").
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("vitrines");
  if (!collection.schema.getFieldByName("capa_posicao")) {
    collection.schema.addField(new SchemaField({
      name: "capa_posicao",
      type: "text",
      required: false,
    }));
  }
  dao.saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("vitrines");
  const field = collection.schema.getFieldByName("capa_posicao");
  if (field) collection.schema.removeField(field.id);
  dao.saveCollection(collection);
});
