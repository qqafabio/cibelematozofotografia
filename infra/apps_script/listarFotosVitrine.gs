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

   Cache (v3.20.14) — duas camadas, por pasta:
   1) "compartilhados": quais arquivos já foram CONFIRMADOS com a permissão
      certa — por até 6h (teto do CacheService). Cresce aos poucos: incluir
      uma foto nova na pasta só exige checar ESSA foto, nunca refaz a
      checagem (1 chamada à API do Drive por arquivo) das que já estavam ok.
   2) "resultado": a lista pronta pra responder, por só 10 min — evita
      relistar a pasta inteira em recarregamentos próximos (ex.: o botão
      "Tentar novamente" da vitrine), sem precisar esperar 6h pra uma foto
      nova aparecer.
   Antes da v3.20.14, as duas coisas eram UM cache só, invalidado por inteiro
   toda vez que a CONTAGEM de arquivos mudava — ou seja, subir mais uma foto
   forçava reconferir a permissão de TODAS as fotos da pasta de novo, o que
   podia demorar bastante numa pasta grande (uma chamada de rede por arquivo)
   e, em rede celular, a conexão do cliente podia cair antes da resposta
   chegar ("Load failed" no Safari/iOS, relatado por um cliente em produção
   — a vitrine.html também ganhou retry automático pra esse cenário, mas o
   certo é a causa raiz não demorar tanto a ponto de precisar disso).
   ============================================================ */

function doGet(e) {
  try {
    const pasta = (e.parameter.pasta || '').trim();
    if (!pasta) return jsonVitrine_({ ok: false, error: 'Parâmetro "pasta" é obrigatório' });

    const folderId = extrairIdPastaDrive_(pasta);
    if (!folderId) return jsonVitrine_({ ok: false, error: 'Não encontrei o ID da pasta nesse link' });

    const cache = CacheService.getScriptCache();
    const chaveResultado = 'vitrine_fotos_' + folderId;
    const emCache = cache.get(chaveResultado);
    if (emCache) return jsonVitrine_({ ok: true, arquivos: JSON.parse(emCache), cache: true });

    const chaveCompartilhados = 'vitrine_compartilhados_' + folderId;
    let compartilhados = {};
    try { compartilhados = JSON.parse(cache.get(chaveCompartilhados) || '{}'); } catch (parseErr) { /* cache vazio/corrompido: começa do zero */ }

    const folder = DriveApp.getFolderById(folderId);
    const arquivos = [];
    const it = folder.getFiles();
    while (it.hasNext()) {
      const file = it.next();
      if (file.getMimeType().indexOf('image/') !== 0) continue; // só fotos
      const id = file.getId();
      if (!compartilhados[id]) {
        pularSeJaCompartilhado_(file);
        compartilhados[id] = true;
      }
      arquivos.push({
        id: id,
        nome: file.getName(),
        thumbnailLink: 'https://drive.google.com/thumbnail?id=' + id + '&sz=w1000',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=' + id,
      });
    }

    try {
      cache.put(chaveResultado, JSON.stringify(arquivos), 600); // 10 min
      cache.put(chaveCompartilhados, JSON.stringify(compartilhados), 21600); // 6h (teto do CacheService)
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

