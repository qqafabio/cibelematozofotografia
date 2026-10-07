#!/usr/bin/env node
/* ============================================================
   CRM · Cibele Matozo — Gerador do módulo de sincronização do
   Apps Script (v3.2). Lê a FONTE ÚNICA assets/js/pbSchema.js e
   emite infra/apps_script/sincronizarPB.gs, pronto para colar no
   editor do Apps Script.

   O módulo gerado espelha cada aba do Sheets na coleção
   correspondente do PocketBase (upsert + reconcile de deletes),
   mantendo o PB como RÉPLICA DE LEITURA. O Sheets segue master.

   Uso:  node infra/gen_gas_sync.cjs
   ============================================================ */

const fs = require('fs');
const path = require('path');
const { PB_SCHEMA } = require('../assets/js/pbSchema.js');

// Aba + planilha de cada entidade (fatos do backend.txt).
const ABA = {
  eventos:            { aba: 'Eventos',           freelance: false },
  pacotes:            { aba: 'Pacotes',           freelance: false },
  leads:              { aba: 'CRM & Orçamentos',  freelance: false },
  financeiro:         { aba: 'Financeiro',        freelance: false },
  producao:           { aba: 'Produção',          freelance: false },
  custos:             { aba: 'Custos',            freelance: false },
  participantes:      { aba: 'Participantes',     freelance: false },
  templates:          { aba: 'Templates',         freelance: false },
  freelanceEventos:   { aba: 'Eventos',           freelance: true  },
  freelancePagamentos:{ aba: 'Pagamentos',        freelance: true  },
};

// Clientes não está no pbSchema (tem adapter próprio). Mapa aba→PB aqui.
const CLIENTES_DEF = {
  chave: 'clientes', colecao: 'clientes', aba: 'Clientes', freelance: false,
  idLabel: 'ID Cliente', idPb: 'id_cliente',
  campos: [
    ['Nome / Responsável', 'nome', 'text'],
    ['WhatsApp', 'whatsapp', 'text'],
    ['E-mail', 'email', 'text'],
    ['CPF/CNPJ', 'cpf', 'text'],
    ['Cidade', 'cidade', 'text'],
    ['Instagram', 'instagram', 'text'],
    ['Canal de origem', 'canal', 'text'],
    ['Observações', 'observacoes', 'text'],
    ['Primeiro contato', 'data_cadastro', 'text'],
  ],
};

// Ação (doPost) → entidades a sincronizar. Inclui entidades correlatas
// que a orquestração do backend toca (ex.: confirmar evento cria conta +
// produção; criar lead/coletivo pode materializar cliente).
const ACOES = {
  criarCliente: ['clientes'], atualizarCliente: ['clientes'], excluirCliente: ['clientes'],
  bloquearClienteCobranca: ['clientes'], desbloquearClienteCobranca: ['clientes'],
  criarEvento: ['eventos', 'financeiro', 'producao', 'clientes'],
  atualizarEvento: ['eventos', 'financeiro', 'producao'],
  excluirEvento: ['eventos', 'financeiro', 'producao'],
  criarLead: ['leads', 'clientes'], atualizarLead: ['leads', 'clientes'], excluirLead: ['leads'],
  criarParcela: ['financeiro'], salvarConta: ['financeiro'], excluirContaFinanceiro: ['financeiro'],
  registrarTentativaCobranca: ['financeiro'], registrarEnvioManual: ['financeiro'],
  atualizarProducao: ['producao'], excluirProducao: ['producao'],
  criarCusto: ['custos'], atualizarCusto: ['custos'], excluirCusto: ['custos'],
  criarPacote: ['pacotes'], atualizarPacote: ['pacotes'], deletarPacote: ['pacotes'],
  criarTemplate: ['templates'], atualizarTemplate: ['templates'], deletarTemplate: ['templates'],
  criarEventoColetivo: ['eventos', 'participantes', 'clientes', 'financeiro', 'producao'],
  importarParticipantes: ['participantes', 'clientes', 'financeiro'],
  atualizarParticipante: ['participantes', 'financeiro'],
  criarFreelanceEvento: ['freelanceEventos'], atualizarFreelanceEvento: ['freelanceEventos'],
  excluirFreelanceEvento: ['freelanceEventos', 'freelancePagamentos'],
  criarFreelancePagamento: ['freelancePagamentos'], atualizarFreelancePagamento: ['freelancePagamentos'],
  excluirFreelancePagamento: ['freelancePagamentos'],
};

function defDe(chave, s){
  const meta = ABA[chave];
  return {
    chave, colecao: s.collection, aba: meta.aba, freelance: meta.freelance,
    idLabel: s.id.label, idPb: s.id.pb, campos: s.fields,
  };
}

function defsSrc(){
  const defs = [CLIENTES_DEF];
  for (const chave of Object.keys(PB_SCHEMA)) defs.push(defDe(chave, PB_SCHEMA[chave]));
  const linhas = defs.map(d => {
    const campos = d.campos.map(c => `[${JSON.stringify(c[0])}, ${JSON.stringify(c[1])}, ${JSON.stringify(c[2])}]`).join(', ');
    return `  { chave: ${JSON.stringify(d.chave)}, colecao: ${JSON.stringify(d.colecao)}, aba: ${JSON.stringify(d.aba)}, freelance: ${d.freelance}, idLabel: ${JSON.stringify(d.idLabel)}, idPb: ${JSON.stringify(d.idPb)},\n    campos: [${campos}] }`;
  });
  return 'const PB_SYNC_DEFS = [\n' + linhas.join(',\n') + '\n];';
}

function acoesSrc(){
  const linhas = Object.keys(ACOES).map(a => `  ${a}: ${JSON.stringify(ACOES[a])}`);
  return 'const PB_SYNC_ACOES = {\n' + linhas.join(',\n') + ',\n};';
}

const RUNTIME = `
/* ---- Config (Script Properties): PB_URL, PB_SYNC_EMAIL, PB_SYNC_PASSWORD ---- */
function pbSyncCfg_() {
  const p = PropertiesService.getScriptProperties();
  const url = p.getProperty('PB_URL');
  const email = p.getProperty('PB_SYNC_EMAIL');
  const senha = p.getProperty('PB_SYNC_PASSWORD');
  if (!url || !email || !senha) throw new Error('Faltam Script Properties: PB_URL / PB_SYNC_EMAIL / PB_SYNC_PASSWORD.');
  return { url: url.replace(/\\/$/, ''), email: email, senha: senha };
}

function pbSyncToken_(cfg) {
  const res = UrlFetchApp.fetch(cfg.url + '/api/collections/users/auth-with-password', {
    method: 'post', contentType: 'application/json',
    payload: JSON.stringify({ identity: cfg.email, password: cfg.senha }),
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() !== 200) throw new Error('PB auth falhou (' + res.getResponseCode() + '): ' + res.getContentText());
  return JSON.parse(res.getContentText()).token;
}

function pbSyncReq_(metodo, url, token, corpo) {
  const opt = { method: metodo, contentType: 'application/json', muteHttpExceptions: true,
    headers: { Authorization: token } };
  if (corpo) opt.payload = JSON.stringify(corpo);
  const res = UrlFetchApp.fetch(url, opt);
  const code = res.getResponseCode();
  if (code >= 400) throw new Error(metodo + ' ' + url + ' -> ' + code + ': ' + res.getContentText());
  return res.getContentText() ? JSON.parse(res.getContentText()) : {};
}

/* Lê todos os registros de uma coleção, paginando, em um mapa chaveFn->registro. */
function pbSyncGetAll_(cfg, token, colecao, chaveFn) {
  const mapa = {};
  let page = 1; const perPage = 500;
  while (true) {
    const url = cfg.url + '/api/collections/' + colecao + '/records?perPage=' + perPage + '&page=' + page + '&skipTotal=1';
    const r = pbSyncReq_('get', url, token, null);
    (r.items || []).forEach(function (it) { mapa[chaveFn(it)] = it; });
    if (!r.items || r.items.length < perPage) break;
    page++;
  }
  return mapa;
}

function pbSyncValor_(v, tipo) {
  if (tipo === 'number' || tipo === 'fk') {
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  }
  if (v === null || v === undefined) return '';
  if (Object.prototype.toString.call(v) === '[object Date]') {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), 'dd/MM/yyyy');
  }
  return String(v);
}

/* Monta o corpo snake_case (id + campos) a partir de uma linha rotulada da aba. */
function pbSyncCorpo_(def, row) {
  const corpo = {};
  corpo[def.idPb] = Number(row[def.idLabel]) || 0;
  def.campos.forEach(function (c) { corpo[c[1]] = pbSyncValor_(row[c[0]], c[2]); });
  return corpo;
}

/* True se o registro do PB já bate com o corpo desejado (evita PATCH à toa). */
function pbSyncIgual_(regPb, corpo) {
  for (const k in corpo) {
    if (String(regPb[k] == null ? '' : regPb[k]) !== String(corpo[k] == null ? '' : corpo[k])) return false;
  }
  return true;
}

function pbSyncLerAba_(def) {
  const id = def.freelance ? FREELANCE_PLANILHA_ID : CRM_PLANILHA_ID;
  return lerAbaComoObjetos_(def.aba, id);
}

/* Upsert + reconcile de uma entidade comum (com id de negócio). */
function pbSyncEntidade_(cfg, token, def) {
  const base = cfg.url + '/api/collections/' + def.colecao + '/records';
  const linhas = pbSyncLerAba_(def);
  const existentes = pbSyncGetAll_(cfg, token, def.colecao, function (it) { return Number(it[def.idPb]); });
  const vistos = {};
  linhas.forEach(function (row) {
    const idNeg = Number(row[def.idLabel]);
    if (!idNeg) return;
    vistos[idNeg] = true;
    const corpo = pbSyncCorpo_(def, row);
    const atual = existentes[idNeg];
    if (!atual) pbSyncReq_('post', base, token, corpo);
    else if (!pbSyncIgual_(atual, corpo)) pbSyncReq_('patch', base + '/' + atual.id, token, corpo);
  });
  Object.keys(existentes).forEach(function (idNeg) {
    if (!vistos[idNeg]) pbSyncReq_('delete', base + '/' + existentes[idNeg].id, token, null);
  });
}

/* Listas: a aba é orientada a coluna (cabeçalho = campo). "Derrete" em
   registros { campo, valor, ordem } e reconcilia por campo+ordem. */
function pbSyncListas_(cfg, token) {
  const aba = SpreadsheetApp.openById(CRM_PLANILHA_ID).getSheetByName('Listas');
  if (!aba) return;
  const nLin = aba.getLastRow(), nCol = aba.getLastColumn();
  const desejado = {};
  if (nLin >= 2) {
    const cab = aba.getRange(1, 1, 1, nCol).getValues()[0];
    const dados = aba.getRange(2, 1, nLin - 1, nCol).getValues();
    cab.forEach(function (campo, i) {
      if (!campo) return;
      dados.forEach(function (lin, r) {
        const valor = lin[i];
        if (valor === '' || valor === null || valor === undefined) return;
        desejado[campo + '\\u0001' + r] = { campo: String(campo), valor: String(valor), ordem: r };
      });
    });
  }
  const base = cfg.url + '/api/collections/listas/records';
  const existentes = pbSyncGetAll_(cfg, token, 'listas', function (it) { return it.campo + '\\u0001' + it.ordem; });
  Object.keys(desejado).forEach(function (k) {
    const alvo = desejado[k], atual = existentes[k];
    if (!atual) pbSyncReq_('post', base, token, alvo);
    else if (String(atual.valor) !== String(alvo.valor)) pbSyncReq_('patch', base + '/' + atual.id, token, alvo);
  });
  Object.keys(existentes).forEach(function (k) {
    if (!desejado[k]) pbSyncReq_('delete', base + '/' + existentes[k].id, token, null);
  });
}

function pbSyncDefDe_(chave) {
  for (let i = 0; i < PB_SYNC_DEFS.length; i++) if (PB_SYNC_DEFS[i].chave === chave) return PB_SYNC_DEFS[i];
  return null;
}

/* Núcleo: sincroniza as entidades pedidas (ou TODAS se entidades for null).
   Fail-soft por padrão (loga e segue); com lancarErro=true, propaga. */
function sincronizarPB_(entidades, lancarErro) {
  let cfg, token;
  try {
    cfg = pbSyncCfg_();
    token = pbSyncToken_(cfg);
  } catch (e) {
    console.error('sincronizarPB_ (auth): ' + e);
    if (lancarErro) throw e;
    return;
  }
  const chaves = entidades || PB_SYNC_DEFS.map(function (d) { return d.chave; });
  const incluirListas = !entidades; // full sync inclui listas
  chaves.forEach(function (chave) {
    try {
      const def = pbSyncDefDe_(chave);
      if (def) pbSyncEntidade_(cfg, token, def);
    } catch (e) {
      console.error('sincronizarPB_ (' + chave + '): ' + e);
      if (lancarErro) throw e;
    }
  });
  if (incluirListas) {
    try { pbSyncListas_(cfg, token); }
    catch (e) { console.error('sincronizarPB_ (listas): ' + e); if (lancarErro) throw e; }
  }
}

/* Chamado pelo doPost após cada mutação bem-sucedida (fail-soft). */
function sincronizarPBPorAcao_(acao) {
  const alvos = PB_SYNC_ACOES[acao];
  if (alvos) sincronizarPB_(alvos, false);
}

/* Rode UMA VEZ manualmente (menu Executar) para semear o PB e reconciliar
   tudo, inclusive Listas. Propaga erros para aparecerem no log de execução. */
function sincronizarPBTudo() {
  sincronizarPB_(null, true);
  console.log('Sincronização completa concluída.');
}
`;

function main(){
  const outDir = path.join(__dirname, 'apps_script');
  fs.mkdirSync(outDir, { recursive: true });
  const header = `/* ============================================================
   sincronizarPB.gs — Sincronização Sheets -> PocketBase (v3.2)
   GERADO por infra/gen_gas_sync.cjs a partir de assets/js/pbSchema.js.
   NÃO editar à mão: rode o gerador de novo se o esquema mudar.

   Cole este arquivo como um novo .gs no projeto do Apps Script do CRM.
   Depois:
     1) Script Properties: PB_URL, PB_SYNC_EMAIL, PB_SYNC_PASSWORD
        (usuário de app do PocketBase — NUNCA versione a senha).
     2) No doPost, após a mutação, chame sincronizarPBPorAcao_(acao)
        (ver infra/apps_script/README.md).
     3) Rode sincronizarPBTudo() uma vez para semear o PB.
   ============================================================ */

`;
  const conteudo = header + defsSrc() + '\n\n' + acoesSrc() + '\n' + RUNTIME;
  fs.writeFileSync(path.join(outDir, 'sincronizarPB.gs'), conteudo);
  console.log('Gerado infra/apps_script/sincronizarPB.gs (' + PB_SYNC_DEFS_count() + ' entidades).');
}

function PB_SYNC_DEFS_count(){ return Object.keys(PB_SCHEMA).length + 1; }

main();
