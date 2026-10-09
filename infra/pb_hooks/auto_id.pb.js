/// <reference path="../pb_data/types.d.ts" />
// v3.3 — ID atômico server-side (gerado de assets/js/pbSchema.js por infra/gen_pb_hooks.cjs).
// Para cada coleção com id de negócio sequencial, se o create vier SEM id,
// o PocketBase atribui max(id)+1 dentro do próprio request. O índice UNIQUE
// de cada coleção é a rede de segurança contra colisão em concorrência rara.
// NÃO editar à mão: regenerar com `node infra/gen_pb_hooks.cjs`.

onRecordBeforeCreateRequest((e) => {
  // id já informado explicitamente (ex.: cascata que herda o id do pai) -> respeita.
  if (e.record.get("id_evento")) return;
  const row = new DynamicModel({ maxid: 0 });
  $app.dao().db().newQuery("SELECT COALESCE(MAX(id_evento), 0) AS maxid FROM eventos").one(row);
  e.record.set("id_evento", row.maxid + 1);
}, "eventos");

onRecordBeforeCreateRequest((e) => {
  // id já informado explicitamente (ex.: cascata que herda o id do pai) -> respeita.
  if (e.record.get("id_pacote")) return;
  const row = new DynamicModel({ maxid: 0 });
  $app.dao().db().newQuery("SELECT COALESCE(MAX(id_pacote), 0) AS maxid FROM pacotes").one(row);
  e.record.set("id_pacote", row.maxid + 1);
}, "pacotes");

onRecordBeforeCreateRequest((e) => {
  // id já informado explicitamente (ex.: cascata que herda o id do pai) -> respeita.
  if (e.record.get("id_lead")) return;
  const row = new DynamicModel({ maxid: 0 });
  $app.dao().db().newQuery("SELECT COALESCE(MAX(id_lead), 0) AS maxid FROM leads").one(row);
  e.record.set("id_lead", row.maxid + 1);
}, "leads");

onRecordBeforeCreateRequest((e) => {
  // id já informado explicitamente (ex.: cascata que herda o id do pai) -> respeita.
  if (e.record.get("id_parcela")) return;
  const row = new DynamicModel({ maxid: 0 });
  $app.dao().db().newQuery("SELECT COALESCE(MAX(id_parcela), 0) AS maxid FROM financeiro").one(row);
  e.record.set("id_parcela", row.maxid + 1);
}, "financeiro");

onRecordBeforeCreateRequest((e) => {
  // id já informado explicitamente (ex.: cascata que herda o id do pai) -> respeita.
  if (e.record.get("id_custo")) return;
  const row = new DynamicModel({ maxid: 0 });
  $app.dao().db().newQuery("SELECT COALESCE(MAX(id_custo), 0) AS maxid FROM custos").one(row);
  e.record.set("id_custo", row.maxid + 1);
}, "custos");

onRecordBeforeCreateRequest((e) => {
  // id já informado explicitamente (ex.: cascata que herda o id do pai) -> respeita.
  if (e.record.get("id_participante")) return;
  const row = new DynamicModel({ maxid: 0 });
  $app.dao().db().newQuery("SELECT COALESCE(MAX(id_participante), 0) AS maxid FROM participantes").one(row);
  e.record.set("id_participante", row.maxid + 1);
}, "participantes");

onRecordBeforeCreateRequest((e) => {
  // id já informado explicitamente (ex.: cascata que herda o id do pai) -> respeita.
  if (e.record.get("id_template")) return;
  const row = new DynamicModel({ maxid: 0 });
  $app.dao().db().newQuery("SELECT COALESCE(MAX(id_template), 0) AS maxid FROM templates").one(row);
  e.record.set("id_template", row.maxid + 1);
}, "templates");

onRecordBeforeCreateRequest((e) => {
  // id já informado explicitamente (ex.: cascata que herda o id do pai) -> respeita.
  if (e.record.get("id_evento")) return;
  const row = new DynamicModel({ maxid: 0 });
  $app.dao().db().newQuery("SELECT COALESCE(MAX(id_evento), 0) AS maxid FROM freelance_eventos").one(row);
  e.record.set("id_evento", row.maxid + 1);
}, "freelance_eventos");

onRecordBeforeCreateRequest((e) => {
  // id já informado explicitamente (ex.: cascata que herda o id do pai) -> respeita.
  if (e.record.get("id_pagamento")) return;
  const row = new DynamicModel({ maxid: 0 });
  $app.dao().db().newQuery("SELECT COALESCE(MAX(id_pagamento), 0) AS maxid FROM freelance_pagamentos").one(row);
  e.record.set("id_pagamento", row.maxid + 1);
}, "freelance_pagamentos");

onRecordBeforeCreateRequest((e) => {
  // id já informado explicitamente (ex.: cascata que herda o id do pai) -> respeita.
  if (e.record.get("id_cliente")) return;
  const row = new DynamicModel({ maxid: 0 });
  $app.dao().db().newQuery("SELECT COALESCE(MAX(id_cliente), 0) AS maxid FROM clientes").one(row);
  e.record.set("id_cliente", row.maxid + 1);
}, "clientes");
