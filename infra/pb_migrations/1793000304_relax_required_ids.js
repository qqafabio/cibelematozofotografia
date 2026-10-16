/// <reference path="../pb_data/types.d.ts" />
// v3.18.2 — o campo id_<entidade> deixa de ser "required". O hook auto_id.pb.js atribui o
// id DEPOIS da validação do create, então com required=true todo create sem id falhava
// ("Missing required value"). A unicidade continua garantida pelo índice UNIQUE.
// Idempotente; coleções/campos ausentes são ignorados.
migrate((db) => {
  const dao = new Dao(db);
  const alvos = {
    eventos: "id_evento", pacotes: "id_pacote", leads: "id_lead", financeiro: "id_parcela",
    custos: "id_custo", participantes: "id_participante", templates: "id_template",
    freelance_eventos: "id_evento", freelance_pagamentos: "id_pagamento",
    produtos: "id_produto", orcamentos: "id_orcamento", clientes: "id_cliente",
  };
  Object.keys(alvos).forEach((nome) => {
    let collection;
    try { collection = dao.findCollectionByNameOrId(nome); } catch (e) { return; }
    const campo = collection.schema.getFieldByName(alvos[nome]);
    if (campo && campo.required) {
      campo.required = false;
      dao.saveCollection(collection);
    }
  });
}, (db) => {
  // sem rollback: voltar a required=true reintroduziria o bug
});
