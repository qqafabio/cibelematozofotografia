/// <reference path="../pb_data/types.d.ts" />
// v3.19.11 — adiciona "selecao_habilitada" à coleção JÁ EXISTENTE "vitrines"
// (a 1793000400_create_vitrines.js não altera coleção já criada). Aditiva e
// idempotente. Vazio ('') conta como "Sim" em vitrine.html — vitrines criadas
// antes desta mudança continuam com seleção habilitada, sem precisar
// preencher nada aqui.
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("vitrines");
  if (!collection.schema.getFieldByName("selecao_habilitada")) {
    collection.schema.addField(new SchemaField({
      name: "selecao_habilitada",
      type: "text",
      required: false,
    }));
  }
  dao.saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("vitrines");
  const field = collection.schema.getFieldByName("selecao_habilitada");
  if (field) collection.schema.removeField(field.id);
  dao.saveCollection(collection);
});
