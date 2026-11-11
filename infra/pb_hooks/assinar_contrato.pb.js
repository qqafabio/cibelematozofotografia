/// <reference path="../pb_data/types.d.ts" />
// v3.25 — Contrato Digital, Fase 3: quando o CLIENTE cria um registro em
// "contrato_assinaturas" (botão "Assinar" da página pública), marca o
// contrato pai como "Assinado". É o único jeito de gravar isso: a regra de
// escrita de "contratos" continua auth-only (o cliente nunca atualiza o
// contrato diretamente) — só este hook, rodando com privilégio de servidor,
// consegue. Mesmo padrão de infra/pb_hooks/notificar_selecao.pb.js (Vitrine
// de Fotos: cliente cria "vitrine_finalizacoes", o hook marca "vitrines").
//
// v3.26 — Fase 4: além de marcar o status, avisa por e-mail (Resend, mesma
// API já usada em notificar_selecao.pb.js) a fotógrafa e o cliente, com um
// link para baixar o PDF assinado (gerado no navegador do cliente, anexado
// no mesmo create() em "pdf_arquivo"). O link do arquivo não exige token
// (arquivos do PocketBase nesta versão não são protegidos por regra —
// mesmo nível de confiança já aceito pela Vitrine de Fotos: quem tem a URL
// exata, com o nome de arquivo gerado, consegue baixar).
//
// ⚠️ SEGREDO: troque RESEND_API_KEY e EMAIL_FOTOGRAFA abaixo SÓ NA CÓPIA QUE
// RODA NA VM (/opt/pocketbase/pb_hooks/assinar_contrato.pb.js) — nunca
// commite os valores reais aqui (o repositório é público). Enquanto
// RESEND_API_KEY continuar com o valor de exemplo, o hook pula o envio dos
// e-mails (loga um aviso) mas SEGUE marcando o contrato como assinado
// normalmente.
//
// Tudo dentro de try/catch: um erro aqui nunca pode impedir a gravação da
// assinatura nem derrubar o PocketBase (já vimos um bug de migration travar
// o serviço inteiro).
onRecordAfterCreateRequest((e) => {
  try {
    const RESEND_API_KEY = "COLE_AQUI_SUA_CHAVE_DA_RESEND";
    const EMAIL_FOTOGRAFA = "coloque-aqui@seu-email.com";
    const PB_PUBLIC_URL = "https://cibelecrm.duckdns.org";

    const dao = $app.dao();
    const idContrato = e.record.get("id_contrato"); // relation -> id nativo do PB do registro pai
    const contrato = dao.findRecordById("contratos", idContrato);
    const jaAssinado = contrato.get("status") === "Assinado"; // corrida rara -> não sobrescreve, mas ainda tenta notificar
    if (!jaAssinado) {
      contrato.set("status", "Assinado");
      contrato.set("data_assinatura", e.record.get("data_assinatura"));
      dao.saveRecord(contrato);
    }

    if (RESEND_API_KEY === "COLE_AQUI_SUA_CHAVE_DA_RESEND" || !EMAIL_FOTOGRAFA || EMAIL_FOTOGRAFA.indexOf("@") === -1) {
      console.log("assinar_contrato: Resend não configurado ainda, pulei os e-mails (contrato já foi marcado como assinado).");
      return;
    }

    let snap = {};
    try { snap = JSON.parse(contrato.get("dados_snapshot") || "{}"); } catch (parseErr) { /* snapshot inválido -> segue sem os dados dele */ }
    const nomeCliente = (snap.contratante && snap.contratante.nome) || "Cliente";
    const emailCliente = (snap.contratante && snap.contratante.email) || "";
    const tituloEvento = (snap.evento && (snap.evento.tipoEvento + " · " + snap.evento.dataEvento)) || ("evento #" + contrato.get("id_evento"));

    const pdfArquivo = e.record.get("pdf_arquivo");
    const linkPdf = pdfArquivo
      ? (PB_PUBLIC_URL + "/api/files/contrato_assinaturas/" + e.record.id + "/" + pdfArquivo)
      : "";

    const enviar = (destinatario, assunto, texto) => {
      try {
        $http.send({
          url: "https://api.resend.com/emails",
          method: "POST",
          headers: { "Authorization": "Bearer " + RESEND_API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "Contrato Digital <onboarding@resend.dev>",
            to: [destinatario],
            subject: assunto,
            text: texto,
          }),
        });
      } catch (sendErr) {
        console.log("assinar_contrato: falha ao enviar e-mail para " + destinatario + " — " + sendErr);
      }
    };

    enviar(
      EMAIL_FOTOGRAFA,
      "✍️ Contrato assinado — " + tituloEvento,
      nomeCliente + " assinou o contrato de \"" + tituloEvento + "\"." + (linkPdf ? ("\n\nPDF assinado: " + linkPdf) : "\n\nEntre no CRM, CRM · Orçamentos, para conferir.")
    );
    if (emailCliente) {
      enviar(
        emailCliente,
        "Seu contrato com a Cibele Matozo Fotografia foi assinado",
        "Olá, " + nomeCliente.split(" ")[0] + "! Recebemos sua assinatura do contrato de \"" + tituloEvento + "\"." + (linkPdf ? ("\n\nVocê pode baixar uma cópia do PDF assinado aqui: " + linkPdf) : "") + "\n\nQualquer dúvida, fale com a Cibele pelo WhatsApp (41) 99602-5409."
      );
    }
  } catch (err) {
    console.log("assinar_contrato: erro (não impede a assinatura) — " + err);
  }
}, "contrato_assinaturas");
