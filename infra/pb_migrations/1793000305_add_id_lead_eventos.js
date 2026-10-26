/// <reference path="../pb_data/types.d.ts" />
// v3.18.5 — adiciona "id_lead" (number) à coleção JÁ EXISTENTE "eventos": liga o evento ao lead
// que o originou (lead "Fechado"), para não gerar evento/conta duplicados se o lead for
// reaberto e fechado de novo. Escrita à mão, aditiva e idempotente.
// Fica de fora de pbSchema.js de propósito (mesmo padrão de bloqueado_cobranca): não vira
// coluna do espelho Sheets→PB nem do payload do app.
// Backfill: eventos criados pela cascata antes desta versão carregam "...a partir do lead #N."
// nas observações; o N é copiado para id_lead.
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("eventos");
  if (!collection.schema.getFieldByName("id_lead")) {
    collection.schema.addField(new SchemaField({
      name: "id_lead",
      type: "number",
      required: false,
      options: { noDecimal: true },
    }));
    dao.saveCollection(collection);
  }

  const registros = dao.findRecordsByExpr(
    "eventos",
    $dbx.exp("observacoes LIKE {:m}", { m: "%Criado automaticamente a partir do lead #%" })
  );
  registros.forEach((r) => {
    if (r.get("id_lead")) return;
    const m = String(r.get("observacoes") || "").match(/a partir do lead #(\d+)\./);
    if (!m) return;
    r.set("id_lead", Number(m[1]));
    dao.saveRecord(r);
  });
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("eventos");
  const field = collection.schema.getFieldByName("id_lead");
  if (field) {
    collection.schema.removeField(field.id);
    dao.saveCollection(collection);
  }
});
