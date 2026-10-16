/// <reference path="../pb_data/types.d.ts" />
// v3.18 — adiciona colunas à coleção JÁ EXISTENTE "leads" (as create_*.js não
// alteram coleção criada). Aditiva e idempotente.
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("leads");
  const campos = [
    { name: "instituicao", type: "text" },
    { name: "orc_versao", type: "number" },
    { name: "orc_hash", type: "text" },
    { name: "orc_dados", type: "text" },
    { name: "id_calendar", type: "text" },
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
  const collection = dao.findCollectionByNameOrId("leads");
  ["instituicao", "orc_versao", "orc_hash", "orc_dados", "id_calendar"].forEach((nome) => {
    const field = collection.schema.getFieldByName(nome);
    if (field) collection.schema.removeField(field.id);
  });
  dao.saveCollection(collection);
});
