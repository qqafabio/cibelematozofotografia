/// <reference path="../pb_data/types.d.ts" />
// v3.3 (Fase 3c) — adiciona as colunas de BLOQUEIO DE COBRANÇA à coleção JÁ
// EXISTENTE "clientes". As migrations create_*.js não alteram coleção já
// criada; esta é uma migration de ATUALIZAÇÃO, escrita à mão (mesmo padrão de
// 1793000200_add_data_cadastro.js).
//
// Espelha as colunas que o Apps Script grava em "Clientes" no 3-strikes
// (bloquearClienteCobranca / registrarEnvioManual, backend.txt 1441-1455 /
// 1990-2006):
//   'Bloqueado Cobranca' → bloqueado_cobranca  ("Sim" / "Não")
//   'Motivo Bloqueio'    → motivo_bloqueio
//   'Data Bloqueio'      → data_bloqueio        ("DD/MM/AAAA")
//
// SEGURANÇA: colunas nullable e aditivas — não quebram o espelho Sheets→PB
// (sincronizarPB.gs não escreve nelas; ficam vazias). Pode ser aplicada a
// qualquer momento; só é NECESSÁRIA na VM até a Fase 4 (cutover), quando o
// front passa a gravar o auto-bloqueio via pbCobranca.js.
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("clientes");
  const campos = [
    { name: "bloqueado_cobranca", type: "text" },
    { name: "motivo_bloqueio", type: "text" },
    { name: "data_bloqueio", type: "text" },
  ];
  campos.forEach((c) => {
    // idempotência: não duplica se já existir
    if (!collection.schema.getFieldByName(c.name)) {
      collection.schema.addField(new SchemaField({
        name: c.name,
        type: c.type,
        required: false,
      }));
    }
  });
  dao.saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("clientes");
  ["bloqueado_cobranca", "motivo_bloqueio", "data_bloqueio"].forEach((nome) => {
    const field = collection.schema.getFieldByName(nome);
    if (field) collection.schema.removeField(field.id);
  });
  dao.saveCollection(collection);
});
