/// <reference path="../pb_data/types.d.ts" />
// v3.2 — cria a coleção "produtos" (gerada de assets/js/pbSchema.js).
migrate((db) => {
  const collection = new Collection({
  name: "produtos",
  type: "base",
  listRule: "@request.auth.id != ''",
  viewRule: "@request.auth.id != ''",
  createRule: "@request.auth.id != ''",
  updateRule: "@request.auth.id != ''",
  deleteRule: "@request.auth.id != ''",
  schema: [
    new SchemaField({ name: "id_produto", type: "number", required: true, options: { noDecimal: true } }),
    new SchemaField({ name: "nome", type: "text", required: false }),
    new SchemaField({ name: "descricao", type: "text", required: false }),
    new SchemaField({ name: "valor", type: "number", required: false, options: { noDecimal: false } }),
    new SchemaField({ name: "tipo_cobranca", type: "text", required: false }),
    new SchemaField({ name: "tipos_evento", type: "text", required: false }),
    new SchemaField({ name: "ativo", type: "text", required: false }),
    new SchemaField({ name: "data_criacao", type: "text", required: false }),
    new SchemaField({ name: "data_atualizacao", type: "text", required: false }),
  ],
  indexes: [
    "CREATE UNIQUE INDEX `idx_produtos_id_produto` ON `produtos` (`id_produto`)"
  ],
  });
  return new Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("produtos");
  return dao.deleteCollection(collection);
});
