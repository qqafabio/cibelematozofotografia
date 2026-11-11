/// <reference path="../pb_data/types.d.ts" />
// v3.32 — CORREÇÃO CRÍTICA: a listRule de "contratos" só tinha a regra
// auth-only, sem a cláusula pública por token que a viewRule já tinha.
// getFirstListItem (usado por index.html pra abrir o contrato pelo token) faz
// uma consulta de LISTA por baixo dos panos — é a listRule que vale, não a
// viewRule. Resultado: todo cliente externo (sem sessão do CRM salva no
// navegador) recebia uma lista vazia (200 OK, 0 itens) e a página pública
// mostrava "Contrato não encontrado", mesmo com o token certo e o contrato
// existindo. Só não aparecia nos testes internos porque o navegador da
// fotógrafa já tinha login do CRM salvo (PocketBase guarda o authStore no
// localStorage da própria origem do GitHub Pages).
// Escrita à mão, idempotente (reaplica a mesma regra sempre).
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("contratos");
  const regraPublica = '@request.auth.id != "" || (token != "" && token = @request.query.token && status != "Cancelado")';
  collection.listRule = regraPublica;
  collection.viewRule = regraPublica;
  dao.saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("contratos");
  collection.listRule = '@request.auth.id != ""';
  dao.saveCollection(collection);
});
