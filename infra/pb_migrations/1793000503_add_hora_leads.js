/// <reference path="../pb_data/types.d.ts" />
// v3.28 — adiciona "hora_inicio"/"hora_fim" à coleção JÁ EXISTENTE "leads": o
// card "Evento" do Orçamento (leadForm.js) ganhou esses dois campos, junto de
// "Data desejada" — antes só existiam no Evento, preenchidos depois do
// fechamento, então o contrato gerado logo após fechar o lead saía sem
// horário. Escrita à mão, aditiva e idempotente (mesmo padrão de
// 1793000303/1793000413/1793000414).
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("leads");
  ["hora_inicio", "hora_fim"].forEach((nome) => {
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
  const collection = dao.findCollectionByNameOrId("leads");
  ["hora_inicio", "hora_fim"].forEach((nome) => {
    const field = collection.schema.getFieldByName(nome);
    if (field) collection.schema.removeField(field.id);
  });
  dao.saveCollection(collection);
});
