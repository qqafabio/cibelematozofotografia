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
   navegador do cliente, sem passar pelo Apps Script a cada foto) — só na
   PRIMEIRA vez (pula quando já está assim, ver pularSeJaCompartilhado_).

   Cache (v3.19.4): resultado fica em cache por coleção/pasta por até 6h
   (CacheService, teto do próprio Apps Script) — sem isso, TODA visita à
   vitrine relistava a pasta inteira e reajustava a permissão de cada foto,
   o que ficava perceptivelmente lento em pastas grandes. Some sozinho do
   cache depois das 6h; novas fotos upadas aparecem assim que o cache vence
   (ou imediatamente se a pasta mudou — ver `chaveCache_`, que inclui a
   contagem de arquivos para invalidar o cache quando ela muda).
   ============================================================ */

function doGet(e) {
  try {
    const pasta = (e.parameter.pasta || '').trim();
    if (!pasta) return jsonVitrine_({ ok: false, error: 'Parâmetro "pasta" é obrigatório' });

    const folderId = extrairIdPastaDrive_(pasta);
    if (!folderId) return jsonVitrine_({ ok: false, error: 'Não encontrei o ID da pasta nesse link' });

    const cache = CacheService.getScriptCache();
    const chaveContagem = 'vitrine_count_' + folderId;
    const contagemAnterior = cache.get(chaveContagem);
    const chave = 'vitrine_fotos_' + folderId + '_' + (contagemAnterior || '0');
    const emCache = cache.get(chave);
    if (emCache) return jsonVitrine_({ ok: true, arquivos: JSON.parse(emCache), cache: true });

    const folder = DriveApp.getFolderById(folderId);
    const arquivos = [];
    const it = folder.getFiles();
    while (it.hasNext()) {
      const file = it.next();
      if (file.getMimeType().indexOf('image/') !== 0) continue; // só fotos
      pularSeJaCompartilhado_(file);
      const id = file.getId();
      arquivos.push({
        id: id,
        nome: file.getName(),
        thumbnailLink: 'https://drive.google.com/thumbnail?id=' + id + '&sz=w1000',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=' + id,
      });
    }

    try {
      const novaContagem = String(arquivos.length);
      cache.put(chaveContagem, novaContagem, 21600); // 6h (teto do CacheService)
      cache.put('vitrine_fotos_' + folderId + '_' + novaContagem, JSON.stringify(arquivos), 21600);
    } catch (cacheErr) {
      // Pasta grande demais para o cache (teto de 100KB por chave) — segue
      // sem cache; só fica mais lento, não quebra a vitrine.
    }

    return jsonVitrine_({ ok: true, arquivos: arquivos });
  } catch (err) {
    return jsonVitrine_({ ok: false, error: String(err) });
  }
}

// Só chama a API de permissão (lenta, uma chamada de rede por arquivo) quando
// ainda não está certo — a 2ª vez em diante (já compartilhado) isso vira uma
// leitura local, sem custo de rede.
function pularSeJaCompartilhado_(file) {
  try {
    if (file.getSharingAccess() === DriveApp.Access.ANYONE_WITH_LINK) return;
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (permErr) {
    // Drive de organização pode bloquear "qualquer um com o link" — segue
    // mesmo assim (o arquivo já pode estar compartilhado de outro jeito).
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

