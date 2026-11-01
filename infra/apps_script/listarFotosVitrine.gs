/* ============================================================
   listarFotosVitrine.gs — Vitrine de Fotos (v3.19) · modo "Google Drive"
   NÃO é um projeto novo: cole este arquivo como um .gs A MAIS dentro do
   MESMO projeto Apps Script que já serve o CRM_API_URL (o que hoje só tem
   doPost). Depois: Implantar > Gerenciar implantações > editar a implantação
   existente > "Nova versão" — a URL continua a MESMA (CRM_API_URL), só que
   agora também responde a GET. Não precisa criar projeto no Google Cloud,
   conta de serviço nem compartilhar a pasta com ninguém: o script roda com
   o acesso à conta Google da própria fotógrafa (dona das pastas do Drive).

   Contrato: GET <CRM_API_URL>?pasta=<link ou ID da pasta do Drive>
   Resposta: { ok: true, arquivos: [{ id, nome, thumbnailLink, downloadUrl }] }
             ou { ok: false, error: "..." }

   Cada arquivo tem sua permissão ajustada para "qualquer pessoa com o link
   pode visualizar" (necessário para o <img>/download funcionar direto no
   navegador do cliente, sem passar pelo Apps Script a cada foto).
   ============================================================ */

function doGet(e) {
  try {
    const pasta = (e.parameter.pasta || '').trim();
    if (!pasta) return jsonVitrine_({ ok: false, error: 'Parâmetro "pasta" é obrigatório' });

    const folderId = extrairIdPastaDrive_(pasta);
    if (!folderId) return jsonVitrine_({ ok: false, error: 'Não encontrei o ID da pasta nesse link' });

    const folder = DriveApp.getFolderById(folderId);
    const arquivos = [];
    const it = folder.getFiles();
    while (it.hasNext()) {
      const file = it.next();
      if (file.getMimeType().indexOf('image/') !== 0) continue; // só fotos
      try {
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (permErr) {
        // Drive de organização pode bloquear "qualquer um com o link" — segue
        // mesmo assim (o arquivo já pode estar compartilhado de outro jeito).
      }
      const id = file.getId();
      arquivos.push({
        id: id,
        nome: file.getName(),
        thumbnailLink: 'https://drive.google.com/thumbnail?id=' + id + '&sz=w1000',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=' + id,
      });
    }
    return jsonVitrine_({ ok: true, arquivos: arquivos });
  } catch (err) {
    return jsonVitrine_({ ok: false, error: String(err) });
  }
}

// Aceita tanto o link completo (".../folders/ABC123?usp=sharing") quanto só o ID.
function extrairIdPastaDrive_(valor) {
  const m = String(valor).match(/[-\w]{25,}/);
  return m ? m[0] : '';
}

function jsonVitrine_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
