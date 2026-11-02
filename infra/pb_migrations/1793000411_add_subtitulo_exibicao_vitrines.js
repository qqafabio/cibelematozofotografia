/// <reference path="../pb_data/types.d.ts" />
// v3.19.12 — adiciona "subtitulo_exibicao" à coleção JÁ EXISTENTE "vitrines"
// (a 1793000400_create_vitrines.js não altera coleção já criada). Aditiva e
// idempotente. Não remove "capa_posicao" (ficou sem uso no novo header, que
// mostra a capa inteira em vez de recortada, mas removê-la do banco não é
// necessário — coluna órfã inofensiva).
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("vitrines");
  if (!collection.schema.getFieldByName("subtitulo_exibicao")) {
    collection.schema.addField(new SchemaField({
      name: "subtitulo_exibicao",
      type: "text",
      required: false,
    }));
  }
  dao.saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("vitrines");
  const field = collection.schema.getFieldByName("subtitulo_exibicao");
  if (field) collection.schema.removeField(field.id);
  dao.saveCollection(collection);
});
