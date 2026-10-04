/// <reference path="../pb_data/types.d.ts" />
// v3.2 — cria a coleção "pacotes" (gerada de assets/js/pbSchema.js).
migrate((db) => {
  const collection = new Collection({
  name: "pacotes",
  type: "base",
  listRule: "@request.auth.id != ''",
  viewRule: "@request.auth.id != ''",
  createRule: "@request.auth.id != ''",
  updateRule: "@request.auth.id != ''",
  deleteRule: "@request.auth.id != ''",
  schema: [
    new SchemaField({ name: "id_pacote", type: "number", required: true, options: { noDecimal: true } }),
    new SchemaField({ name: "nome", type: "text", required: false }),
    new SchemaField({ name: "descricao", type: "text", required: false }),
    new SchemaField({ name: "valor_pacote", type: "number", required: false, options: { noDecimal: false } }),
    new SchemaField({ name: "qtd_fotos_incluidas", type: "text", required: false }),
    new SchemaField({ name: "valor_foto_extra", type: "number", required: false, options: { noDecimal: false } }),
    new SchemaField({ name: "data_criacao", type: "text", required: false }),
    new SchemaField({ name: "data_atualizacao", type: "text", required: false }),
  ],
  indexes: [
    "CREATE UNIQUE INDEX `idx_pacotes_id_pacote` ON `pacotes` (`id_pacote`)"
  ],
  });
  return new Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("pacotes");
  return dao.deleteCollection(collection);
});
