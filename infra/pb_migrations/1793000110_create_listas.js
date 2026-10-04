/// <reference path="../pb_data/types.d.ts" />
// v3.2 — cria a coleção "listas" (gerada de assets/js/pbSchema.js).
migrate((db) => {
  const collection = new Collection({
  name: "listas",
  type: "base",
  listRule: "@request.auth.id != ''",
  viewRule: "@request.auth.id != ''",
  createRule: "@request.auth.id != ''",
  updateRule: "@request.auth.id != ''",
  deleteRule: "@request.auth.id != ''",
  schema: [
    new SchemaField({ name: "campo", type: "text", required: false }),
    new SchemaField({ name: "valor", type: "text", required: false }),
    new SchemaField({ name: "ordem", type: "number", required: false, options: { noDecimal: false } }),
  ],
  indexes: [],
  });
  return new Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("listas");
  return dao.deleteCollection(collection);
});
