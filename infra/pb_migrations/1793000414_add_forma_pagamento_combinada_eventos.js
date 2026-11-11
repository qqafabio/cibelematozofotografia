/// <reference path="../pb_data/types.d.ts" />
// v3.23 — adiciona "forma_pagamento_combinada" à coleção JÁ EXISTENTE "eventos":
// forma de pagamento combinada com o cliente no fechamento do lead (preenchida em
// leadForm.js junto com "Qual pacote foi fechado?"). Distinta de
// financeiro.forma_pagamento, que é por parcela e só é preenchida depois que a
// parcela é efetivamente recebida. Fase 1 da integração CRM↔Contrato Digital.
// Escrita à mão, aditiva e idempotente (mesmo padrão de 1793000303/1793000305).
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("eventos");
  if (!collection.schema.getFieldByName("forma_pagamento_combinada")) {
    collection.schema.addField(new SchemaField({
      name: "forma_pagamento_combinada",
      type: "text",
      required: false,
    }));
    dao.saveCollection(collection);
  }
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("eventos");
  const field = collection.schema.getFieldByName("forma_pagamento_combinada");
  if (field) {
    collection.schema.removeField(field.id);
    dao.saveCollection(collection);
  }
});
