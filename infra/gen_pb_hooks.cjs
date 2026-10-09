#!/usr/bin/env node
/* ============================================================
   CRM · Cibele Matozo — Gerador do hook de ID atômico (v3.3)
   Lê a FONTE ÚNICA assets/js/pbSchema.js e emite um único arquivo
   infra/pb_hooks/auto_id.pb.js com um hook onRecordBeforeCreateRequest
   por coleção que tem id de negócio sequencial (max+1).

   Por que no servidor: hoje o "próximo id" é calculado no cliente
   (pbClientes.js) / no Apps Script (proximoId_), o que corre risco de
   corrida. Movendo o cálculo para o pb_hook (dentro do request do PB) +
   o índice UNIQUE da coleção como rede de segurança, a geração de id
   deixa de depender do cliente.

   Uso (Node instalado):
     node infra/gen_pb_hooks.cjs
   Depois transferir infra/pb_hooks/*.pb.js para /opt/pocketbase/pb_hooks
   na VM e reiniciar o PocketBase (systemctl restart pocketbase).

   PB 0.22.x (JSVM, API pré-0.23): hooks globais em arquivos *.pb.js;
   onRecordBeforeCreateRequest((e)=>{...}, "colecao"); sem e.next().
   ============================================================ */

const fs = require('fs');
const path = require('path');
const { PB_SCHEMA } = require('../assets/js/pbSchema.js');

const OUT_DIR = path.join(__dirname, 'pb_hooks');

// Coleções cujo id NÃO é uma sequência max+1 e, portanto, NÃO recebem hook:
//  - producao: 1:1 com o evento; o id_evento é HERDADO do evento (setado pela
//    cascata criarEvento), não é um contador próprio.
const SEM_SEQUENCIA = new Set(['producao']);

// clientes não está em pbSchema (adapter dedicado), mas também é max+1:
// incluímos manualmente para centralizar a geração de id no servidor.
const EXTRA = [{ collection: 'clientes', idPb: 'id_cliente' }];

// Monta o bloco de hook para uma coleção (col) e seu campo de id (idPb).
function hookSrc(col, idPb){
  return `onRecordBeforeCreateRequest((e) => {
  // id já informado explicitamente (ex.: cascata que herda o id do pai) -> respeita.
  if (e.record.get("${idPb}")) return;
  const row = new DynamicModel({ maxid: 0 });
  $app.dao().db().newQuery("SELECT COALESCE(MAX(${idPb}), 0) AS maxid FROM ${col}").one(row);
  e.record.set("${idPb}", row.maxid + 1);
}, "${col}");`;
}

function main(){
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const alvos = [];
  for (const key of Object.keys(PB_SCHEMA)){
    const s = PB_SCHEMA[key];
    if (SEM_SEQUENCIA.has(s.collection)) continue;
    if (!s.id || !s.id.pb) continue;
    alvos.push({ collection: s.collection, idPb: s.id.pb });
  }
  alvos.push(...EXTRA);

  const blocos = alvos.map(a => hookSrc(a.collection, a.idPb));
  const src = `/// <reference path="../pb_data/types.d.ts" />
// v3.3 — ID atômico server-side (gerado de assets/js/pbSchema.js por infra/gen_pb_hooks.cjs).
// Para cada coleção com id de negócio sequencial, se o create vier SEM id,
// o PocketBase atribui max(id)+1 dentro do próprio request. O índice UNIQUE
// de cada coleção é a rede de segurança contra colisão em concorrência rara.
// NÃO editar à mão: regenerar com \`node infra/gen_pb_hooks.cjs\`.

${blocos.join('\n\n')}
`;
  fs.writeFileSync(path.join(OUT_DIR, 'auto_id.pb.js'), src);
  console.log(`Gerado infra/pb_hooks/auto_id.pb.js com ${alvos.length} hooks:`);
  alvos.forEach(a => console.log('  - ' + a.collection + ' (' + a.idPb + ')'));
}

main();
