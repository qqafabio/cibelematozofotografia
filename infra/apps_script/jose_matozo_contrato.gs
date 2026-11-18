/* ============================================================
   Contrato Digital — Matozo Foto e Vídeo
   Apps Script independente do CRM da Cibele Matozo Fotografia
   (negócio diferente, backend próprio — não compartilha
   planilha nem implantação com o `backend.txt`/Código.gs do CRM).

   Front-end que consome este backend: jose-matozo/contrato.html
   (jose-matozo/assets/js/config.js aponta para a URL implantada).

   PASSO A PASSO DE IMPLANTAÇÃO
   1) script.google.com → Novo projeto → cole este arquivo inteiro.
   2) Preencha as constantes de configuração logo abaixo.
   3) Implantar → Nova implantação → Tipo "App da Web":
        Executar como: Eu
        Quem pode acessar: Qualquer pessoa   (⚠️ NÃO "Qualquer pessoa
        com Conta do Google" — isso obriga o cliente a fazer login e
        pode abrir a tela de troca de conta quando ele tem mais de uma
        conta Google logada no navegador, problema já visto antes)
   4) Copie a URL ".../exec" e cole em APPS_SCRIPT_URL, em
      jose-matozo/assets/js/config.js.
   5) Teste: abra a URL ".../exec" no navegador — deve responder
      "Matozo Foto e Vídeo — Contrato Digital API online.". Depois teste de
      ponta a ponta assinando um contrato de teste.
   6) Toda alteração neste arquivo exige **Nova implantação** (não só
      salvar) para valer no link já publicado.
   ============================================================ */

/* ============ CONFIGURAÇÃO ============ */
// E-mail que recebe cópia de cada contrato assinado, além do cliente.
const EMAIL_FOTOGRAFO = 'cibelematozofotografia@gmail.com';

// ID de uma pasta do Google Drive (opcional) onde salvar uma cópia do PDF.
// Deixe em branco ('') para não guardar cópia no Drive.
const PASTA_DRIVE_ID = '';

// Nome da aba (dentro da planilha vinculada a este projeto Apps Script)
// onde cada contrato assinado é registrado. Criada automaticamente.
const ABA_CONTRATOS = 'Contratos';

/* ============ ROTEAMENTO ============ */
function doGet(e) {
  return ContentService
    .createTextOutput('Matozo Foto e Vídeo — Contrato Digital API online.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  let acao = '';
  try {
    const corpo = JSON.parse(e.postData.contents || '{}');
    acao = corpo.action;
    let resultado;
    switch (acao) {
      case 'enviarContratoAssinado':
        resultado = enviarContratoAssinado_(corpo.dados || {});
        break;
      default:
        throw new Error('Ação desconhecida: ' + acao);
    }
    return jsonOutput_({ ok: true, dados: resultado });
  } catch (err) {
    console.error('doPost(' + acao + '): ' + err);
    return jsonOutput_({ ok: false, erro: String(err && err.message || err) });
  }
}

function jsonOutput_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ============ AÇÃO: enviarContratoAssinado ============
   Espera em `dados`:
   { protocolo, nomeCliente, emailCliente, tituloEvento, pdfBase64, nomeArquivo }
   Envia o PDF por e-mail para o cliente e para EMAIL_FOTOGRAFO, salva uma
   cópia opcional no Drive e registra uma linha na planilha de controle. */
function enviarContratoAssinado_(dados) {
  const protocolo = String(dados.protocolo || '').trim();
  const nomeCliente = String(dados.nomeCliente || '').trim();
  const emailCliente = String(dados.emailCliente || '').trim();
  const tituloEvento = String(dados.tituloEvento || '').trim();
  const nomeArquivo = String(dados.nomeArquivo || 'contrato.pdf').trim();
  const pdfBase64 = dados.pdfBase64;

  if (!emailCliente) throw new Error('emailCliente é obrigatório.');
  if (!pdfBase64) throw new Error('pdfBase64 é obrigatório.');

  const pdfBlob = Utilities.newBlob(
    Utilities.base64Decode(pdfBase64), 'application/pdf', nomeArquivo
  );

  const assunto = 'Contrato assinado — Matozo Foto e Vídeo' +
    (tituloEvento ? ' · ' + tituloEvento : '');
  const corpoCliente = 'Olá, ' + nomeCliente + '!\n\n' +
    'Segue em anexo o contrato de prestação de serviços fotográficos, assinado ' +
    'eletronicamente.\n\nQualquer dúvida, fale com Matozo Foto e Vídeo pelo ' +
    'telefone/WhatsApp (41) 99919-1498.\n\nProtocolo: JM-' + new Date().getFullYear() + '-' + protocolo;
  const corpoFotografo = 'Contrato assinado por ' + nomeCliente + ' (' + emailCliente + ').\n\n' +
    'Evento: ' + (tituloEvento || '—') + '\n' +
    'Protocolo: JM-' + new Date().getFullYear() + '-' + protocolo;

  GmailApp.sendEmail(emailCliente, assunto, corpoCliente, { attachments: [pdfBlob], name: 'Matozo Foto e Vídeo' });
  GmailApp.sendEmail(EMAIL_FOTOGRAFO, assunto, corpoFotografo, { attachments: [pdfBlob], name: 'Matozo Foto e Vídeo — Contratos' });

  let linkDrive = '';
  if (PASTA_DRIVE_ID) {
    try {
      const pasta = DriveApp.getFolderById(PASTA_DRIVE_ID);
      const arquivo = pasta.createFile(pdfBlob);
      linkDrive = arquivo.getUrl();
    } catch (e) {
      console.error('Falha ao salvar cópia no Drive: ' + e);
    }
  }

  registrarContratoNaPlanilha_({ protocolo, nomeCliente, emailCliente, tituloEvento, nomeArquivo, linkDrive });

  return { protocolo, linkDrive };
}

function registrarContratoNaPlanilha_(linha) {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  let aba = planilha.getSheetByName(ABA_CONTRATOS);
  if (!aba) {
    aba = planilha.insertSheet(ABA_CONTRATOS);
    aba.appendRow(['Data/hora', 'Protocolo', 'Cliente', 'E-mail', 'Evento', 'Arquivo', 'Link no Drive']);
  }
  aba.appendRow([
    new Date(), linha.protocolo, linha.nomeCliente, linha.emailCliente,
    linha.tituloEvento, linha.nomeArquivo, linha.linkDrive || '',
  ]);
}
