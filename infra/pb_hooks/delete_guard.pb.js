/// <reference path="../pb_data/types.d.ts" />
// v3.3 — GUARDA DE EXCLUSÃO (Fase 3, front-first).
//
// ⚠️ NÃO IMPLANTAR AINDA. Enquanto o Google Sheets for o master de escrita, o
// espelho Sheets→PB (infra/apps_script/sincronizarPB.gs) RECONCILIA deletando
// registros do PB que saíram da planilha (inclui parcelas pagas, quando a
// exclusão foi forçada lá). Este hook bloquearia esses deletes (sem o query
// ?forcar=1) e quebraria o espelho. Portanto só vai para /opt/pocketbase/pb_hooks
// no CUTOVER (Fase 4), junto com USE_POCKETBASE_ESCRITA=true — quando o espelho
// deixa de existir e o front passa a ser a única origem de deletes.
//
// O que faz: impede excluir uma parcela do Financeiro que já tem valor pago,
// a não ser que o request traga ?forcar=1 (rede de segurança server-side para
// a mesma regra que o front já aplica em pbExcluirEvento/excluirConta — evita
// perder o rastro de dinheiro recebido por engano). Guarda de usuária única:
// protege contra erro acidental, não contra cliente adversário.

onRecordBeforeDeleteRequest((e) => {
  const pago = e.record.getFloat("valor_pago");
  if (pago > 0) {
    const forcar = e.httpContext.queryParam("forcar");
    if (forcar !== "1") {
      throw new BadRequestError(
        "Parcela com R$ " + pago.toFixed(2) + " recebido(s) não pode ser excluída. " +
        "Reverta o pagamento antes, ou confirme a exclusão forçada."
      );
    }
  }
}, "financeiro");
