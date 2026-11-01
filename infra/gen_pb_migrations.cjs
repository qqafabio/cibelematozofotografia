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
// `relVar` (só para tipo 'relation:X') é o nome da variável JS que já guarda
// a coleção-alvo resolvida (ver montagem em migrationSrc) — evita qualquer
// pós-processamento no `collection.schema` depois de montado (goja não
// deixa iterar esse objeto com `for...of`, ver histórico desta função).
function fieldSrc(pb, tipo, relVar){
  if (tipo === 'text'){
    return `    new SchemaField({ name: "${pb}", type: "text", required: false }),`;
  }
  if (tipo === 'date'){
    return `    new SchemaField({ name: "${pb}", type: "date", required: false }),`;
  }
  if (tipo === 'file'){
    // Thumbs genéricas (grade da vitrine); o original fica intacto — PocketBase
    // nunca recomprime o arquivo-fonte, só gera essas variações à parte.
    return `    new SchemaField({ name: "${pb}", type: "file", required: false, options: { maxSelect: 1, maxSize: 52428800, thumbs: ["400x400", "1600x0"] } }),`;
  }
  if (tipo.startsWith('relation:')){
    return `    new SchemaField({ name: "${pb}", type: "relation", required: false, options: { collectionId: ${relVar}.id, maxSelect: 1, cascadeDelete: true } }),`;
  }
  // 'number' (moeda/quantidade: aceita decimais) e 'fk' (id inteiro).
  const noDecimal = (tipo === 'fk') ? 'true' : 'false';
  return `    new SchemaField({ name: "${pb}", type: "number", required: false, options: { noDecimal: ${noDecimal} } }),`;
}

// Nome de variável JS válido a partir do nome da coleção-alvo (ex.: "vitrines" -> "vitrinesCol").
function varDaColecao_(nome){
  return nome.replace(/[^a-zA-Z0-9]/g, '_') + 'Col';
}

// Monta o corpo de uma migration que cria uma coleção. `rules` (opcional)
// sobrescreve a RULE padrão por operação — usado pelas vitrines públicas.
function migrationSrc(collection, idPb, fields, rules){
  const alvosRelation = Array.from(new Set(
    fields.filter(([, , tipo]) => tipo.startsWith('relation:')).map(([, , tipo]) => tipo.slice('relation:'.length))
  ));

  const linhas = [];
  if (idPb){
    linhas.push(`    new SchemaField({ name: "${idPb}", type: "number", required: false, options: { noDecimal: true } }),`); // id preenchido pelo hook (após a validação)
  }
  for (const [, pb, tipo] of fields){
    const relVar = tipo.startsWith('relation:') ? varDaColecao_(tipo.slice('relation:'.length)) : null;
    linhas.push(fieldSrc(pb, tipo, relVar));
  }

  const indexes = idPb
    ? `  indexes: [\n    "CREATE UNIQUE INDEX \`idx_${collection}_${idPb}\` ON \`${collection}\` (\`${idPb}\`)"\n  ],`
    : `  indexes: [],`;

  const r = rules || {};
  const esc = (s) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const regra = (nome) => `"${esc(r[nome] != null ? r[nome] : RULE)}"`;

  // Collections sem relation mantêm o corpo antigo (idêntico ao já aplicado
  // nas migrations existentes — evita diff cosmético em arquivo já rodado em
  // produção). Só quem tem campo 'relation:' precisa resolver a coleção-alvo
  // ANTES de montar o Collection (ver comentário abaixo) e por isso ganha o
  // corpo maior.
  if (!alvosRelation.length){
    return `/// <reference path="../pb_data/types.d.ts" />
// v3.2 — cria a coleção "${collection}" (gerada de assets/js/pbSchema.js).
migrate((db) => {
  const collection = new Collection({
  name: "${collection}",
  type: "base",
  listRule: ${regra('listRule')},
  viewRule: ${regra('viewRule')},
  createRule: ${regra('createRule')},
  updateRule: ${regra('updateRule')},
  deleteRule: ${regra('deleteRule')},
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

  // Relation fields precisam do ID interno (não o nome) da coleção-alvo no
  // `collectionId` — resolvido ANTES de montar o Collection, via
  // dao.findCollectionByNameOrId (a coleção-alvo precisa já existir no banco
  // de destino; por isso 'vitrines' é gerada/aplicada ANTES de 'vitrine_fotos').
  // Nada de iterar/alterar `collection.schema` DEPOIS de montado: o goja do
  // PocketBase 0.22 não deixa (`for...of` em `collection.schema.fields`
  // falha com "object is not iterable" — já vimos isso derrubar a VM).
  const resolveLinhas = alvosRelation.map(a => `  const ${varDaColecao_(a)} = dao.findCollectionByNameOrId("${a}");`).join('\n');
  return `/// <reference path="../pb_data/types.d.ts" />
// v3.19 — cria a coleção "${collection}" (gerada de assets/js/pbSchema.js).
migrate((db) => {
  const dao = new Dao(db);
${resolveLinhas}
  const collection = new Collection({
  name: "${collection}",
  type: "base",
  listRule: ${regra('listRule')},
  viewRule: ${regra('viewRule')},
  createRule: ${regra('createRule')},
  updateRule: ${regra('updateRule')},
  deleteRule: ${regra('deleteRule')},
  schema: [
${linhas.join('\n')}
  ],
${indexes}
  });
  return dao.saveCollection(collection);
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
    const src = migrationSrc(s.collection, s.id.pb, s.fields, s.rules);
    // Coleções criadas depois (v3.18+) trazem timestamp fixo para não renumerar as já aplicadas.
    const nome = `${s.migrationTs || ts}_create_${s.collection}.js`;
    fs.writeFileSync(path.join(OUT_DIR, nome), src);
    gerados.push(nome);
    if (!s.migrationTs) ts++;
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
