/// <reference path="../pb_data/types.d.ts" />
// v3.33 — adiciona "parcelas_cartao" à coleção JÁ EXISTENTE "eventos": só
// relevante quando forma_pagamento_combinada = "Cartão de crédito" — define em
// quantas vezes a conta pendente do Financeiro é dividida na hora de criar
// (pbCriarContaPendente_, pbEventos.js). Escrita à mão, aditiva e idempotente
// (mesmo padrão de 1793000413/1793000414/1793000503).
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("eventos");
  if (!collection.schema.getFieldByName("parcelas_cartao")) {
    collection.schema.addField(new SchemaField({
      name: "parcelas_cartao",
      type: "number",
      required: false,
      options: { noDecimal: true },
    }));
    dao.saveCollection(collection);
  }
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("eventos");
  const field = collection.schema.getFieldByName("parcelas_cartao");
  if (field) {
    collection.schema.removeField(field.id);
    dao.saveCollection(collection);
  }
});
