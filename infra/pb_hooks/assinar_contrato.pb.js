/// <reference path="../pb_data/types.d.ts" />
// v3.25 — Contrato Digital, Fase 3: quando o CLIENTE cria um registro em
// "contrato_assinaturas" (botão "Assinar" da página pública), marca o
// contrato pai como "Assinado". É o único jeito de gravar isso: a regra de
// escrita de "contratos" continua auth-only (o cliente nunca atualiza o
// contrato diretamente) — só este hook, rodando com privilégio de servidor,
// consegue. Mesmo padrão de infra/pb_hooks/notificar_selecao.pb.js (Vitrine
// de Fotos: cliente cria "vitrine_finalizacoes", o hook marca "vitrines").
//
// Tudo dentro de try/catch: um erro aqui nunca pode impedir a gravação da
// assinatura nem derrubar o PocketBase (já vimos um bug de migration travar
// o serviço inteiro).
onRecordAfterCreateRequest((e) => {
  try {
    const dao = $app.dao();
    const idContrato = e.record.get("id_contrato"); // relation -> id nativo do PB do registro pai
    const contrato = dao.findRecordById("contratos", idContrato);
    if (contrato.get("status") === "Assinado") return; // já assinado (corrida rara) -> não sobrescreve
    contrato.set("status", "Assinado");
    contrato.set("data_assinatura", e.record.get("data_assinatura"));
    dao.saveRecord(contrato);
  } catch (err) {
    console.log("assinar_contrato: erro (não impede a assinatura) — " + err);
  }
}, "contrato_assinaturas");
