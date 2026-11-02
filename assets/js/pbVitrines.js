/* ============================================================
   CRM · Cibele Matozo Fotografia — Adapter PocketBase · Vitrine de Fotos (v3.19)
   <script> clássico. Depende de pbCore.js/pbEscrita.js/pbSchema.js.
   Fase 1: galeria pública (token+senha+validade), branding e as duas fontes
   de imagem (upload_proprio no PocketBase, ou google_drive por link de pasta).
   id_vitrine/id_foto são atribuídos pelo pb_hook (auto_id.pb.js).

   Senha: NUNCA guardamos em texto puro. O navegador calcula o SHA-256 (hex)
   da senha digitada e só isso vai para o campo `senha_hash` — tanto ao
   criar/editar (aqui) quanto ao conferir na vitrine pública (vitrine.html),
   que manda o mesmo hash como query param para a regra do PocketBase
   comparar no próprio banco (ver `rules` em pbSchema.js).

   Validade: campo `date` nativo do PocketBase (não texto DD/MM/AAAA como o
   resto do app) — é o único jeito da regra pública comparar com @now sem
   lógica no servidor. As funções `validadeParaISO_`/`validadeParaBR_` abaixo
   fazem a ponte com o <input data-picker="date"> do formulário.
   ============================================================ */

const VITRINE_FONTES = ['upload_proprio', 'google_drive'];
const VITRINE_TEMAS = ['noir', 'linen', 'terra'];

// DD/MM/AAAA (como os outros campos de data do app) -> "AAAA-MM-DD 00:00:00.000Z"
// (formato que o PocketBase aceita/devolve num campo `date`). Grava meia-noite
// UTC do dia escolhido — no horário de Brasília (UTC-3) isso expira a vitrine
// ~3h ANTES da meia-noite local do dia seguinte (ex.: validade "31/12" para de
// funcionar às 21h de Brasília do dia 30). Aceito conscientemente para manter
// o round-trip simples; se incomodar, basta a fotógrafa escolher 1 dia a mais.
function validadeParaISO_(brStr){
  if (!brStr) return '';
  const d = parseDataBR(brStr);
  if (!d || isNaN(d.getTime())) throw new Error('Data de validade inválida');
  return d.toISOString().slice(0, 10) + ' 00:00:00.000Z';
}
// ISO (como o PocketBase devolve) -> DD/MM/AAAA (para reabrir no formulário).
// Usa getters UTC (não locais): o valor é gravado como meia-noite UTC, e o
// Brasil está sempre atrás do UTC — getDate()/getMonth() locais mostrariam o
// dia anterior. Troca o espaço por "T" para o Safari aceitar o parse.
function validadeParaBR_(isoStr){
  if (!isoStr) return '';
  const d = new Date(String(isoStr).replace(' ', 'T'));
  if (isNaN(d.getTime())) return '';
  return String(d.getUTCDate()).padStart(2, '0') + '/' + String(d.getUTCMonth() + 1).padStart(2, '0') + '/' + d.getUTCFullYear();
}

// Token público: 32 caracteres hex, só com crypto.randomUUID (sem libs extra).
function pbGerarTokenVitrine_(){
  return crypto.randomUUID().replace(/-/g, '');
}
// '' entrada = sem senha (hash vazio); senão SHA-256 hex via SubtleCrypto.
async function pbHashSenha_(senha){
  if (!senha) return '';
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(senha));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function validarVitrine_(dados){
  if (!dados.idEvento) throw new Error('Evento é obrigatório');
  if (VITRINE_FONTES.indexOf(dados.fonteImagens) === -1) throw new Error('Fonte de imagens inválida');
  if (dados.fonteImagens === 'google_drive' && !String(dados.linkPastaDrive || '').trim()){
    throw new Error('Informe o link da pasta do Google Drive');
  }
}

async function pbCriarVitrine(dados){
  await pbAuthGarantir();
  validarVitrine_(dados);
  const senhaHash = await pbHashSenha_(dados.senha || '');
  return PB.collection('vitrines').create({
    id_evento: Number(dados.idEvento),
    token: pbGerarTokenVitrine_(),
    senha_hash: senhaHash,
    validade: dados.validade ? validadeParaISO_(dados.validade) : '',
    status: 'Ativa',
    fonte_imagens: dados.fonteImagens,
    link_pasta_drive: dados.fonteImagens === 'google_drive' ? String(dados.linkPastaDrive).trim() : '',
    nome_exibicao: dados.nomeExibicao ? String(dados.nomeExibicao).trim() : '',
    subtitulo_exibicao: dados.subtituloExibicao ? String(dados.subtituloExibicao).trim() : '',
    data_exibicao: dados.dataExibicao ? String(dados.dataExibicao).trim() : '',
    tema: VITRINE_TEMAS.indexOf(dados.tema) !== -1 ? dados.tema : 'linen',
    cor_primaria: dados.corPrimaria || '',
    tipografia: dados.tipografia === 'sans' ? 'sans' : 'serif',
    capa_url: dados.capaUrl ? String(dados.capaUrl).trim() : '',
    qtd_fotos_pacote: Number(dados.qtdFotosPacote || 0),
    selecao_habilitada: dados.selecaoHabilitada === false ? 'Não' : 'Sim',
    entrega_validade: dados.entregaValidade ? String(dados.entregaValidade).trim() : '',
    entrega_max_downloads: Number(dados.entregaMaxDownloads || 0),
    data_criacao: hojeBR_(),
    // sem id_vitrine → hook atribui
  });
}

async function pbAtualizarVitrine(dados){
  await pbAuthGarantir();
  validarVitrine_(dados);
  const rec = await pbAchar_('vitrines', 'id_vitrine', dados.id);
  const patch = {
    id_evento: Number(dados.idEvento),
    status: dados.status === 'Pausada' ? 'Pausada' : 'Ativa',
    fonte_imagens: dados.fonteImagens,
    link_pasta_drive: dados.fonteImagens === 'google_drive' ? String(dados.linkPastaDrive).trim() : '',
    nome_exibicao: dados.nomeExibicao ? String(dados.nomeExibicao).trim() : '',
    subtitulo_exibicao: dados.subtituloExibicao ? String(dados.subtituloExibicao).trim() : '',
    data_exibicao: dados.dataExibicao ? String(dados.dataExibicao).trim() : '',
    tema: VITRINE_TEMAS.indexOf(dados.tema) !== -1 ? dados.tema : 'linen',
    cor_primaria: dados.corPrimaria || '',
    tipografia: dados.tipografia === 'sans' ? 'sans' : 'serif',
    capa_url: dados.capaUrl ? String(dados.capaUrl).trim() : '',
    qtd_fotos_pacote: Number(dados.qtdFotosPacote || 0),
    selecao_habilitada: dados.selecaoHabilitada === false ? 'Não' : 'Sim',
    entrega_validade: dados.entregaValidade ? String(dados.entregaValidade).trim() : '',
    entrega_max_downloads: Number(dados.entregaMaxDownloads || 0),
    validade: dados.validade ? validadeParaISO_(dados.validade) : '',
  };
  // dados.senha === undefined → mantém a senha atual; string (mesmo '') → regrava.
  if (dados.senha !== undefined) patch.senha_hash = await pbHashSenha_(dados.senha);
  return PB.collection('vitrines').update(rec.id, patch);
}

// Revoga o link atual (ex.: vazou) sem apagar a vitrine — gera um token novo.
async function pbRegerarTokenVitrine(dados){
  await pbAuthGarantir();
  const rec = await pbAchar_('vitrines', 'id_vitrine', dados.id);
  const token = pbGerarTokenVitrine_();
  await PB.collection('vitrines').update(rec.id, { token });
  return { id: dados.id, token };
}

/* ---- Entrega final (v3.19 Fase 4) — liberar/revogar é separado do resto
   do formulário porque é uma decisão operacional (não um campo de edição
   normal): a fotógrafa aperta o botão quando a entrega está pronta. */
async function pbLiberarEntrega(dados){
  await pbAuthGarantir();
  const rec = await pbAchar_('vitrines', 'id_vitrine', dados.id);
  await PB.collection('vitrines').update(rec.id, { entrega_liberada_em: hojeBR_() });
  return { id: dados.id, liberada: true };
}
async function pbRevogarEntrega(dados){
  await pbAuthGarantir();
  const rec = await pbAchar_('vitrines', 'id_vitrine', dados.id);
  await PB.collection('vitrines').update(rec.id, { entrega_liberada_em: '' });
  return { id: dados.id, liberada: false };
}

async function pbExcluirVitrine(dados){
  await pbAuthGarantir();
  const rec = await pbAchar_('vitrines', 'id_vitrine', dados.id);
  await PB.collection('vitrines').delete(rec.id); // cascata apaga as vitrine_fotos (relation cascadeDelete)
  return { id: dados.id, deletado: true };
}

/* ---- Fotos (modo upload_proprio) — carregadas sob demanda, não no bulk load ---- */

// idVitrinePb = id NATIVO do PocketBase (rec.id da vitrine), não o id_vitrine de negócio —
// é o que a relation `vitrine_fotos.id_vitrine` guarda.
async function pbListarFotosVitrine(idVitrinePb){
  await pbAuthGarantir();
  return PB.collection('vitrine_fotos').getFullList({ filter: `id_vitrine="${idVitrinePb}"`, sort: 'ordem' });
}

/* ---- Marca d'água (v3.19 Fase 3) — gerada no NAVEGADOR DA FOTÓGRAFA no
   momento do upload (não no do cliente): o arquivo que chega no navegador do
   cliente já é essa versão derivada, então não dá pra "inspecionar e tirar"
   a marca d'água como daria se fosse aplicada só visualmente na tela do
   cliente. O 'arquivo' original nunca é tocado — fica guardado para uma
   futura entrega final controlada (Fase 4, ainda não existe). Redimensiona
   pro lado maior ~1600px (resolução de conferência, não de impressão) e
   tiles o texto em diagonal. Só modo upload_proprio por enquanto — o modo
   Google Drive ainda não tem essa proteção (Fase 3b, não construída). */
const VITRINE_MARCA_DAGUA_TEXTO = 'CIBELE MATOZO FOTOGRAFIA';
const VITRINE_PREVIEW_LADO_MAX = 1600;

async function gerarPreviewComMarcaDagua_(arquivo){
  if (typeof createImageBitmap !== 'function') return null; // navegador muito antigo: upload segue sem preview
  const bitmap = await createImageBitmap(arquivo);
  const escala = Math.min(1, VITRINE_PREVIEW_LADO_MAX / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * escala));
  const h = Math.max(1, Math.round(bitmap.height * escala));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const fonte = Math.max(16, Math.round(w / 22));
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(-Math.PI / 6); // -30°, mesmo ângulo clássico de marca d'água tiled
  ctx.font = 'bold ' + fonte + 'px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 1;
  const passoX = ctx.measureText(VITRINE_MARCA_DAGUA_TEXTO).width + 70;
  const passoY = fonte * 3;
  const diag = Math.sqrt(w * w + h * h); // cobre o canto a canto mesmo depois de rotacionar
  for (let y = -diag; y < diag; y += passoY){
    for (let x = -diag; x < diag; x += passoX){
      ctx.strokeText(VITRINE_MARCA_DAGUA_TEXTO, x, y);
      ctx.fillText(VITRINE_MARCA_DAGUA_TEXTO, x, y);
    }
  }
  ctx.restore();

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
}

async function pbUploadFotoVitrine(dados){
  await pbAuthGarantir();
  if (!dados.idVitrinePb) throw new Error('Vitrine inválida');
  if (!dados.arquivo) throw new Error('Selecione um arquivo');
  const fd = new FormData();
  fd.append('id_vitrine', dados.idVitrinePb);
  fd.append('arquivo', dados.arquivo);
  try {
    const preview = await gerarPreviewComMarcaDagua_(dados.arquivo);
    if (preview) fd.append('preview', preview, 'preview.jpg');
  } catch (err){
    // Sem preview com marca d'água, a vitrine pública cai pro 'arquivo'
    // original (ver vitrine.html) — upload não trava por causa disso.
    console.error('Falha ao gerar preview com marca d\'água: ' + err);
  }
  fd.append('ordem', String(dados.ordem || 0));
  fd.append('nome_original', dados.arquivo.name || '');
  fd.append('categoria', dados.categoria ? String(dados.categoria).trim() : '');
  fd.append('data_upload', hojeBR_());
  return PB.collection('vitrine_fotos').create(fd);
}

async function pbExcluirFotoVitrine(dados){
  await pbAuthGarantir();
  await PB.collection('vitrine_fotos').delete(dados.id); // dados.id = id nativo do PB
  return { id: dados.id, deletado: true };
}

/* ---- Seleção do cliente (v3.19 Fase 2) — só leitura, pro CRM conferir ---- */
async function pbListarSelecoesVitrine(idVitrinePb){
  await pbAuthGarantir();
  return PB.collection('vitrine_selecoes').getFullList({ filter: `id_vitrine="${idVitrinePb}"` });
}

Object.assign(window.PB_ACTIONS, {
  criarVitrine: (d) => perfTime('PB criarVitrine', pbCriarVitrine(d)),
  atualizarVitrine: (d) => perfTime('PB atualizarVitrine', pbAtualizarVitrine(d)),
  regerarTokenVitrine: (d) => perfTime('PB regerarTokenVitrine', pbRegerarTokenVitrine(d)),
  liberarEntrega: (d) => perfTime('PB liberarEntrega', pbLiberarEntrega(d)),
  revogarEntrega: (d) => perfTime('PB revogarEntrega', pbRevogarEntrega(d)),
  deletarVitrine: (d) => perfTime('PB deletarVitrine', pbExcluirVitrine(d)),
  uploadFotoVitrine: (d) => perfTime('PB uploadFotoVitrine', pbUploadFotoVitrine(d)),
  excluirFotoVitrine: (d) => perfTime('PB excluirFotoVitrine', pbExcluirFotoVitrine(d)),
});
