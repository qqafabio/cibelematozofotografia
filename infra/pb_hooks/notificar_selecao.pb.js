/// <reference path="../pb_data/types.d.ts" />
// v3.19 Fase 2 — Vitrine de Fotos: aviso de seleção finalizada.
// Dispara quando o CLIENTE cria um registro em "vitrine_finalizacoes" (botão
// "Finalizar seleção" na vitrine pública). Faz duas coisas, nessa ordem:
//   1) Marca a vitrine como finalizada (campos que o cliente NÃO pode editar
//      diretamente — updateRule de "vitrines" continua auth-only; só este
//      hook, rodando com privilégio de servidor, consegue gravar ali).
//   2) Manda um e-mail pra fotógrafa via API da Resend (grátis até 3.000/mês).
//
// ⚠️ SEGREDO: troque RESEND_API_KEY e EMAIL_FOTOGRAFA abaixo SÓ NA CÓPIA QUE
// RODA NA VM (/opt/pocketbase/pb_hooks/notificar_selecao.pb.js) — nunca
// commite os valores reais aqui (o repositório é público). Enquanto
// RESEND_API_KEY continuar com o valor de exemplo, o hook pula o envio do
// e-mail (loga um aviso) mas SEGUE marcando a vitrine como finalizada
// normalmente — ou seja, dá pra implantar isso antes mesmo de ter a conta
// da Resend pronta.
//
// Tudo dentro de try/catch: um erro aqui (ex.: API da Resend fora do ar)
// nunca pode derrubar a criação do registro nem o PocketBase (já vimos um
// bug de migration travar o serviço inteiro — isso aqui roda em TODO
// restart/requisição, então precisa ser à prova de exceção).
onRecordAfterCreateRequest((e) => {
  try {
    const RESEND_API_KEY = "COLE_AQUI_SUA_CHAVE_DA_RESEND";
    const EMAIL_FOTOGRAFA = "coloque-aqui@seu-email.com";

    const dao = $app.dao();
    const idVitrine = e.record.get("id_vitrine");
    const qtd = e.record.getInt("qtd_selecionadas");
    const agora = new Date().toISOString();

    const vitrine = dao.findRecordById("vitrines", idVitrine);
    vitrine.set("selecao_finalizada_em", agora);
    vitrine.set("qtd_fotos_selecionadas_final", qtd);
    dao.saveRecord(vitrine);

    if (RESEND_API_KEY === "COLE_AQUI_SUA_CHAVE_DA_RESEND" || !EMAIL_FOTOGRAFA || EMAIL_FOTOGRAFA.indexOf("@") === -1) {
      console.log("notificar_selecao: Resend não configurado ainda, pulei o e-mail (vitrine já foi marcada como finalizada).");
      return;
    }

    const nome = vitrine.get("nome_exibicao") || ("evento #" + vitrine.get("id_evento"));
    $http.send({
      url: "https://api.resend.com/emails",
      method: "POST",
      headers: { "Authorization": "Bearer " + RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Vitrine de Fotos <onboarding@resend.dev>",
        to: [EMAIL_FOTOGRAFA],
        subject: "📸 Seleção finalizada — " + nome,
        text: "O cliente finalizou a seleção de fotos de \"" + nome + "\" com " + qtd + " foto(s) escolhida(s). Entre no CRM, menu Vitrine de Fotos, para conferir.",
      }),
    });
  } catch (err) {
    console.log("notificar_selecao: erro (não impede a seleção) — " + err);
  }
}, "vitrine_finalizacoes");
