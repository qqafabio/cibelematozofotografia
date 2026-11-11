/// <reference path="../pb_data/types.d.ts" />
// v3.23 — adiciona endereço completo à coleção JÁ EXISTENTE "clientes" (rua, número,
// complemento, bairro, UF — "Cidade" já existia). Necessário para a Qualificação das
// Partes do Contrato Digital (Fase 1 da integração CRM↔Contrato). Escrita à mão
// (clientes fica fora de pbSchema.js/gen_pb_migrations.cjs de propósito — ver
// comentário no topo de pbSchema.js), aditiva e idempotente.
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("clientes");
  const campos = ["endereco_rua", "endereco_numero", "endereco_complemento", "endereco_bairro", "endereco_uf"];
  campos.forEach((nome) => {
    if (!collection.schema.getFieldByName(nome)) {
      collection.schema.addField(new SchemaField({
        name: nome,
        type: "text",
        required: false,
      }));
    }
  });
  dao.saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("clientes");
  ["endereco_rua", "endereco_numero", "endereco_complemento", "endereco_bairro", "endereco_uf"].forEach((nome) => {
    const field = collection.schema.getFieldByName(nome);
    if (field) collection.schema.removeField(field.id);
  });
  dao.saveCollection(collection);
});
