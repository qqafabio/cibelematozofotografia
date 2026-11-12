/// <reference path="../pb_data/types.d.ts" />
// v3.20.13 — adiciona "tamanho_bytes" à coleção JÁ EXISTENTE "vitrine_fotos"
// (a 1793000401_create_vitrine_fotos.js não altera coleção já criada).
// Soma do tamanho de arquivo+preview no momento do upload — base do
// indicador de armazenamento usado na tela da Vitrine de Fotos (fotos
// enviadas antes desta mudança são preenchidas por um backfill à parte,
// não por esta migration). Aditiva e idempotente.
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("vitrine_fotos");
  if (!collection.schema.getFieldByName("tamanho_bytes")) {
    collection.schema.addField(new SchemaField({
      name: "tamanho_bytes",
      type: "number",
      required: false,
      options: { noDecimal: false },
    }));
  }
  dao.saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("vitrine_fotos");
  const field = collection.schema.getFieldByName("tamanho_bytes");
  if (field) collection.schema.removeField(field.id);
  dao.saveCollection(collection);
});
