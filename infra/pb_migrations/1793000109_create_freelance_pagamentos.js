/// <reference path="../pb_data/types.d.ts" />
// v3.2 — cria a coleção "freelance_pagamentos" (gerada de assets/js/pbSchema.js).
migrate((db) => {
  const collection = new Collection({
  name: "freelance_pagamentos",
  type: "base",
  listRule: "@request.auth.id != ''",
  viewRule: "@request.auth.id != ''",
  createRule: "@request.auth.id != ''",
  updateRule: "@request.auth.id != ''",
  deleteRule: "@request.auth.id != ''",
  schema: [
    new SchemaField({ name: "id_pagamento", type: "number", required: true, options: { noDecimal: true } }),
    new SchemaField({ name: "id_evento", type: "number", required: false, options: { noDecimal: true } }),
    new SchemaField({ name: "data_do_pagamento", type: "text", required: false }),
    new SchemaField({ name: "valor_pago", type: "number", required: false, options: { noDecimal: false } }),
    new SchemaField({ name: "observacoes", type: "text", required: false }),
  ],
  indexes: [
    "CREATE UNIQUE INDEX `idx_freelance_pagamentos_id_pagamento` ON `freelance_pagamentos` (`id_pagamento`)"
  ],
  });
  return new Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("freelance_pagamentos");
  return dao.deleteCollection(collection);
});
