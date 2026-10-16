/// <reference path="../pb_data/types.d.ts" />
// v3.18 — adiciona colunas à coleção JÁ EXISTENTE "pacotes" (as create_*.js não
// alteram coleção criada). Aditiva e idempotente.
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("pacotes");
  const campos = [
    { name: "itens_inclusos", type: "text" },
    { name: "prazo_entrega", type: "text" },
    { name: "tipos_evento", type: "text" },
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
  const collection = dao.findCollectionByNameOrId("pacotes");
  ["itens_inclusos", "prazo_entrega", "tipos_evento"].forEach((nome) => {
    const field = collection.schema.getFieldByName(nome);
    if (field) collection.schema.removeField(field.id);
  });
  dao.saveCollection(collection);
});
