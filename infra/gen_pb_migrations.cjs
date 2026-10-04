#!/usr/bin/env node
/* ============================================================
   CRM · Cibele Matozo — Gerador de migrations do PocketBase (v3.2)
   Lê a FONTE ÚNICA assets/js/pbSchema.js e emite um arquivo de
   migration por coleção em infra/pb_migrations/ (padrão PocketBase
   0.22.x: Dao/Collection/SchemaField). Assim o esquema do PB nunca
   diverge do que o front consome.

   Uso (no seu terminal, Node instalado):
     node infra/gen_pb_migrations.cjs
   Depois transferir infra/pb_migrations/*.js para pb_migrations/ na VM
   e reiniciar o PocketBase (as migrations rodam no startup).

   OBS.: 'clientes' NÃO é gerado aqui (já existe na VM desde a v3.1).
   ============================================================ */

const fs = require('fs');
const path = require('path');
const { PB_SCHEMA, PB_LISTAS } = require('../assets/js/pbSchema.js');

const OUT_DIR = path.join(__dirname, 'pb_migrations');
const RULE = "@request.auth.id != ''"; // mesma regra do POC de clientes

// Converte [label, pb, tipo] do schema em um SchemaField do PocketBase.
function fieldSrc(pb, tipo){
  if (tipo === 'text'){
    return `    new SchemaField({ name: "${pb}", type: "text", required: false }),`;
  }
  // 'number' (moeda/quantidade: aceita decimais) e 'fk' (id inteiro).
  const noDecimal = (tipo === 'fk') ? 'true' : 'false';
  return `    new SchemaField({ name: "${pb}", type: "number", required: false, options: { noDecimal: ${noDecimal} } }),`;
}

// Monta o corpo de uma migration que cria uma coleção.
function migrationSrc(collection, idPb, fields){
  const linhas = [];
  if (idPb){
    linhas.push(`    new SchemaField({ name: "${idPb}", type: "number", required: true, options: { noDecimal: true } }),`);
  }
  for (const [, pb, tipo] of fields) linhas.push(fieldSrc(pb, tipo));

  const indexes = idPb
    ? `  indexes: [\n    "CREATE UNIQUE INDEX \`idx_${collection}_${idPb}\` ON \`${collection}\` (\`${idPb}\`)"\n  ],`
    : `  indexes: [],`;

  return `/// <reference path="../pb_data/types.d.ts" />
// v3.2 — cria a coleção "${collection}" (gerada de assets/js/pbSchema.js).
migrate((db) => {
  const collection = new Collection({
  name: "${collection}",
  type: "base",
  listRule: "${RULE}",
  viewRule: "${RULE}",
  createRule: "${RULE}",
  updateRule: "${RULE}",
  deleteRule: "${RULE}",
  schema: [
${linhas.join('\n')}
  ],
${indexes}
  });
  return new Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("${collection}");
  return dao.deleteCollection(collection);
});
`;
}

function main(){
  fs.mkdirSync(OUT_DIR, { recursive: true });
  let ts = 1793000100; // base dos timestamps (depois das migrations da v3.1)
  const gerados = [];

  for (const key of Object.keys(PB_SCHEMA)){
    const s = PB_SCHEMA[key];
    const src = migrationSrc(s.collection, s.id.pb, s.fields);
    const nome = `${ts}_create_${s.collection}.js`;
    fs.writeFileSync(path.join(OUT_DIR, nome), src);
    gerados.push(nome);
    ts++;
  }
  // Listas (sem id de negócio).
  {
    const src = migrationSrc(PB_LISTAS.collection, null, PB_LISTAS.fields);
    const nome = `${ts}_create_${PB_LISTAS.collection}.js`;
    fs.writeFileSync(path.join(OUT_DIR, nome), src);
    gerados.push(nome);
  }

  console.log(`Geradas ${gerados.length} migrations em infra/pb_migrations/:`);
  gerados.forEach(n => console.log('  - ' + n));
}

main();
