/// <reference path="../pb_data/types.d.ts" />
// v3.4 — adiciona a coluna "data_cadastro" (text) às coleções JÁ EXISTENTES
// "eventos" e "clientes". As migrations create_*.js não alteram coleção já
// criada; esta é a migration de ATUALIZAÇÃO, escrita à mão.
//
// Espelha:
//   - Eventos: 'Data de cadastro' (carimbado em criarEvento/criarEventoColetivo)
//   - Clientes: 'Primeiro contato' → data_cadastro (reaproveitado; ver gen_gas_sync.cjs)
//
// Habilita as tendências reais de volume no Dashboard (KPIs Clientes/Eventos).
migrate((db) => {
  const dao = new Dao(db);
  ["eventos", "clientes"].forEach((nome) => {
    const collection = dao.findCollectionByNameOrId(nome);
    // idempotência: não duplica se já existir
    if (!collection.schema.getFieldByName("data_cadastro")) {
      collection.schema.addField(new SchemaField({
        name: "data_cadastro",
        type: "text",
        required: false,
      }));
      dao.saveCollection(collection);
    }
  });
}, (db) => {
  const dao = new Dao(db);
  ["eventos", "clientes"].forEach((nome) => {
    const collection = dao.findCollectionByNameOrId(nome);
    const field = collection.schema.getFieldByName("data_cadastro");
    if (field) {
      collection.schema.removeField(field.id);
      dao.saveCollection(collection);
    }
  });
});
