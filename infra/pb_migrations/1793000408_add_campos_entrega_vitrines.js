/// <reference path="../pb_data/types.d.ts" />
// v3.19 Fase 4 — adiciona campos de entrega final à coleção JÁ EXISTENTE
// "vitrines" (a 1793000400_create_vitrines.js não altera coleção já criada).
// Aditiva e idempotente. "entrega_downloads_count" é setado pelo pb_hook
// (contar_downloads.pb.js), nunca diretamente pelo cliente.
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("vitrines");
  const campos = [
    { name: "entrega_liberada_em", type: "text" },
    { name: "entrega_validade", type: "text" },
    { name: "entrega_max_downloads", type: "number" },
    { name: "entrega_downloads_count", type: "number" },
  ];
  campos.forEach((c) => {
    if (!collection.schema.getFieldByName(c.name)) {
      collection.schema.addField(new SchemaField({
        name: c.name,
        type: c.type,
        required: false,
      }));
    }
  });
  dao.saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("vitrines");
  ["entrega_liberada_em", "entrega_validade", "entrega_max_downloads", "entrega_downloads_count"].forEach((nome) => {
    const field = collection.schema.getFieldByName(nome);
    if (field) collection.schema.removeField(field.id);
  });
  dao.saveCollection(collection);
});
