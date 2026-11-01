/* ============================================================
   CRM · Cibele Matozo Fotografia — Módulo: Vitrine de Fotos (v3.19, Fase 1)
   Carregado como <script> clássico (escopo global compartilhado).
   NÃO usar import/export: os handlers onclick inline e o estado
   global dependem deste escopo. Ordem de carga definida em crm.html.

   Fase 1: galeria pública com link exclusivo (token+senha+validade),
   marca personalizada (tema/cor/fonte/capa) e as duas fontes de imagem
   (upload direto no PocketBase, ou link de pasta do Google Drive).
   Seleção de fotos, marca d'água e contador de download ficam para as
   próximas fases (ver plano salvo em C:\Users\Fábio\.claude\plans).
   ============================================================ */

const VITRINE_TEMA_LABEL = { noir: 'Noir (escuro)', linen: 'Linen (claro)', terra: 'Terra (terroso)' };

/* Mesma chave/preferência do Gerador de link: base pública do GitHub Pages,
   lembrada no navegador. As duas ferramentas apontam para o mesmo site. */
const VITRINE_BASE_KEY = 'cmf_link_base';
function vitrineBasePublica_(){
  return (localStorage.getItem(VITRINE_BASE_KEY) || 'https://qqafabio.github.io/cibelematozofotografia/').replace(/\/?$/, '/');
}
function vitrineLinkPublico_(token){
  return vitrineBasePublica_() + 'vitrine.html?token=' + encodeURIComponent(token);
}

function eventoDaVitrine_(v){
  return eventos.find(e => String(e['ID Evento']) === String(v['ID Evento']));
}
function vitrineTituloExibicao_(v){
  if (v['Nome exibição']) return v['Nome exibição'];
  const ev = eventoDaVitrine_(v);
  return ev ? ev['Cliente / Responsável'] : ('Evento #' + v['ID Evento']);
}

/* ============ LISTA ============ */
function renderVitrines(main){
  main.innerHTML = `
    <div class="view-header">
      <div><h1>📸 Vitrine de Fotos</h1><p>${vitrines.length} vitrine${vitrines.length === 1 ? '' : 's'} criada${vitrines.length === 1 ? '' : 's'}</p></div>
      <button class="btn-primary" id="novaVitrineBtn">+ Nova vitrine</button>
    </div>
    <div id="listaVitrines"></div>
  `;
  document.getElementById('novaVitrineBtn').addEventListener('click', () => abrirFormVitrine(null));
  desenharListaVitrines();
}

function desenharListaVitrines(){
  const container = document.getElementById('listaVitrines');
  if (!vitrines.length){
    container.innerHTML = `<div class="panel"><div class="empty-state">Nenhuma vitrine criada ainda. Use "Nova vitrine" para gerar a primeira galeria para um evento.</div></div>`;
    return;
  }

  const ordenadas = vitrines.slice().sort((a, b) => Number(b['ID Vitrine']) - Number(a['ID Vitrine']));
  container.innerHTML = ordenadas.map(v => {
    const ev = eventoDaVitrine_(v);
    const statusClasse = v['Status'] === 'Pausada' ? 'alerta' : 'confirmado';
    const fonteLabel = v['Fonte imagens'] === 'google_drive' ? 'Google Drive' : 'Upload direto';
    const validade = v['Validade'] ? validadeParaBR_(v['Validade']) : 'sem validade';
    const link = vitrineLinkPublico_(v['Token']);
    return `
      <div class="panel tpl-card">
        <div class="tpl-card-head">
          <div>
            <h3>${esc(vitrineTituloExibicao_(v))} <span class="status-pill ${statusClasse}">${esc(v['Status'])}</span></h3>
            <p>${ev ? esc(ev['Tipo de evento'] || '') + ' — ' + esc(ev['Data do evento'] || '') : ''} · ${fonteLabel} · validade: ${esc(validade)}${v['Senha hash'] ? ' · 🔒 com senha' : ''}</p>
          </div>
          <div class="tpl-actions row-actions">
            <button class="btn-ghost btn-sm" data-copiar="${esc(v['ID Vitrine'])}">🔗 Copiar link</button>
            ${v['Fonte imagens'] === 'upload_proprio' ? `<button class="btn-ghost btn-sm" data-fotos="${esc(v['ID Vitrine'])}">🖼️ Fotos</button>` : ''}
            <button class="btn-ghost btn-sm" data-editar="${esc(v['ID Vitrine'])}">✏️ Editar</button>
            <button class="btn-ghost btn-sm" data-pausar="${esc(v['ID Vitrine'])}">${v['Status'] === 'Pausada' ? '▶️ Ativar' : '⏸️ Pausar'}</button>
            <button class="btn-ghost btn-sm" data-regerar="${esc(v['ID Vitrine'])}">♻️ Revogar link</button>
            <button class="btn-danger btn-sm" data-excluir="${esc(v['ID Vitrine'])}">🗑️ Excluir</button>
          </div>
        </div>
        <input class="inline-input" readonly value="${esc(link)}" onclick="this.select()">
      </div>
    `;
  }).join('');

  container.querySelectorAll('[data-copiar]').forEach(b => b.addEventListener('click', () => copiarLinkVitrine_(b.dataset.copiar)));
  container.querySelectorAll('[data-fotos]').forEach(b => b.addEventListener('click', () => abrirGerenciarFotos_(b.dataset.fotos)));
  container.querySelectorAll('[data-editar]').forEach(b => b.addEventListener('click', () => abrirFormVitrine(b.dataset.editar)));
  container.querySelectorAll('[data-pausar]').forEach(b => b.addEventListener('click', () => alternarStatusVitrine_(b.dataset.pausar)));
  container.querySelectorAll('[data-regerar]').forEach(b => b.addEventListener('click', () => confirmarRegerarToken_(b.dataset.regerar)));
  container.querySelectorAll('[data-excluir]').forEach(b => b.addEventListener('click', () => confirmarExcluirVitrine_(b.dataset.excluir)));
}

function copiarLinkVitrine_(id){
  const v = vitrines.find(x => String(x['ID Vitrine']) === String(id));
  if (!v) return;
  navigator.clipboard.writeText(vitrineLinkPublico_(v['Token']));
  showToast('🔗 Link copiado');
}

async function alternarStatusVitrine_(id){
  const v = vitrines.find(x => String(x['ID Vitrine']) === String(id));
  if (!v) return;
  const novoStatus = v['Status'] === 'Pausada' ? 'Ativa' : 'Pausada';
  try {
    await apiCall('atualizarVitrine', vitrineParaPayload_(v, { status: novoStatus }));
    v['Status'] = novoStatus;
    showToast(novoStatus === 'Pausada' ? '⏸️ Vitrine pausada' : '▶️ Vitrine ativada novamente');
    desenharListaVitrines();
  } catch (err){
    showToast('❌ Erro: ' + err.message);
  }
}

async function confirmarRegerarToken_(id){
  if (!await confirmarAcao({ titulo: 'Revogar o link atual?', texto: 'O link antigo para de funcionar e um novo é gerado. Use se o link vazou ou foi parar em mãos erradas.', confirmar: 'Revogar e gerar novo' })) return;
  try {
    const r = await apiCall('regerarTokenVitrine', { id });
    const v = vitrines.find(x => String(x['ID Vitrine']) === String(id));
    if (v) v['Token'] = r.token;
    showToast('♻️ Novo link gerado');
    desenharListaVitrines();
  } catch (err){
    showToast('❌ Erro: ' + err.message);
  }
}

async function confirmarExcluirVitrine_(id){
  const v = vitrines.find(x => String(x['ID Vitrine']) === String(id));
  if (!v) return;
  if (await confirmarAcao({ titulo: 'Excluir vitrine?', texto: `A galeria "${vitrineTituloExibicao_(v)}" e (se houver) as fotos enviadas diretamente serão apagadas. Esta ação não pode ser desfeita.`, confirmar: 'Excluir' })){
    try {
      await apiCall('deletarVitrine', { id });
      vitrines = vitrines.filter(x => String(x['ID Vitrine']) !== String(id));
      showToast('✅ Vitrine excluída');
      renderVitrines(document.getElementById('mainArea'));
    } catch (err){
      showToast('❌ Erro: ' + err.message);
    }
  }
}

/* ============ FORMULÁRIO (criar/editar) ============ */
function vitrineParaPayload_(v, extra){
  return Object.assign({
    id: v['ID Vitrine'],
    idEvento: v['ID Evento'],
    fonteImagens: v['Fonte imagens'],
    linkPastaDrive: v['Link pasta Drive'],
    nomeExibicao: v['Nome exibição'],
    dataExibicao: v['Data exibição'],
    tema: v['Tema'],
    corPrimaria: v['Cor primária'],
    tipografia: v['Tipografia'],
    capaUrl: v['Capa URL'],
    validade: v['Validade'] ? validadeParaBR_(v['Validade']) : '',
    status: v['Status'],
  }, extra);
}

function abrirFormVitrine(id){
  const v = id ? vitrines.find(x => String(x['ID Vitrine']) === String(id)) : null;
  const editando = !!v;
  const idEvSelecionado = editando ? v['ID Evento'] : '';
  const opcoesEventos = eventos.map(e => `<option value="${esc(e['ID Evento'])}" ${String(idEvSelecionado) === String(e['ID Evento']) ? 'selected' : ''}>${esc(e['Cliente / Responsável'])} — ${esc(e['Data do evento'])}</option>`).join('');
  const fonte = editando ? v['Fonte imagens'] : 'upload_proprio';

  document.getElementById('overlayRoot').innerHTML = `
    <div class="form-overlay" id="overlay">
      <div class="form-panel">
        <h2>${editando ? 'Editar vitrine' : 'Nova vitrine'}</h2>
        <div id="vitrineErr" class="form-err" style="display:none;"></div>
        <form id="formVitrine" class="form-stack">
          <div class="field"><label>Evento *</label>
            <select id="vf_idEvento" required>${eventos.length ? opcoesEventos : '<option value="">Cadastre um evento primeiro</option>'}</select>
          </div>
          <div class="row2">
            <div class="field"><label>Nome de exibição</label><input id="vf_nomeExibicao" placeholder="Ex.: Ana & Léo" value="${esc(editando ? v['Nome exibição'] : '')}"></div>
            <div class="field"><label>Data de exibição</label><input id="vf_dataExibicao" placeholder="Ex.: 14 · Março · 2026" value="${esc(editando ? v['Data exibição'] : '')}"></div>
          </div>

          <div class="field"><label>Fonte das imagens *</label>
            <select id="vf_fonte">
              <option value="upload_proprio" ${fonte === 'upload_proprio' ? 'selected' : ''}>Upload direto no sistema</option>
              <option value="google_drive" ${fonte === 'google_drive' ? 'selected' : ''}>Link de uma pasta do Google Drive</option>
            </select>
          </div>
          <div class="field" id="vf_driveWrap" style="${fonte === 'google_drive' ? '' : 'display:none;'}">
            <label>Link da pasta do Google Drive</label>
            <input id="vf_linkDrive" placeholder="https://drive.google.com/drive/folders/..." value="${esc(editando ? v['Link pasta Drive'] : '')}">
          </div>
          <p class="hint" id="vf_uploadHint" style="${fonte === 'upload_proprio' ? '' : 'display:none;'}">Depois de salvar, use o botão "🖼️ Fotos" na lista para enviar as imagens.</p>

          <div class="row2">
            <div class="field"><label>Tema</label>
              <select id="vf_tema">${Object.keys(VITRINE_TEMA_LABEL).map(k => `<option value="${k}" ${(editando ? v['Tema'] : 'linen') === k ? 'selected' : ''}>${VITRINE_TEMA_LABEL[k]}</option>`).join('')}</select>
            </div>
            <div class="field"><label>Cor primária</label><input type="color" id="vf_cor" value="${esc(editando && v['Cor primária'] ? v['Cor primária'] : '#A8791E')}" style="height:42px;padding:4px;"></div>
          </div>
          <div class="row2">
            <div class="field"><label>Tipografia</label>
              <select id="vf_tipografia">
                <option value="serif" ${(editando ? v['Tipografia'] : 'serif') === 'serif' ? 'selected' : ''}>Serifada (elegante)</option>
                <option value="sans" ${(editando ? v['Tipografia'] : 'serif') === 'sans' ? 'selected' : ''}>Sem serifa (moderna)</option>
              </select>
            </div>
            <div class="field"><label>Capa (URL de uma imagem)</label><input id="vf_capa" placeholder="https://..." value="${esc(editando ? v['Capa URL'] : '')}"></div>
          </div>

          <div class="row2">
            <div class="field"><label>Senha (opcional)</label><input type="text" id="vf_senha" placeholder="${editando && v['Senha hash'] ? 'Já tem senha — deixe em branco para manter' : 'Deixe em branco para não exigir senha'}"></div>
            <div class="field"><label>Validade (opcional)</label><input id="vf_validade" data-picker="date" placeholder="DD/MM/AAAA" value="${editando && v['Validade'] ? validadeParaBR_(v['Validade']) : ''}"></div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-ghost" onclick="fecharOverlay()">Cancelar</button>
            <button type="submit" class="btn-primary">💾 Salvar</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const fonteSelect = document.getElementById('vf_fonte');
  fonteSelect.addEventListener('change', () => {
    const drive = fonteSelect.value === 'google_drive';
    document.getElementById('vf_driveWrap').style.display = drive ? '' : 'none';
    document.getElementById('vf_uploadHint').style.display = drive ? 'none' : '';
  });

  document.getElementById('formVitrine').addEventListener('submit', async (e) => {
    e.preventDefault();
    const dados = {
      idEvento: document.getElementById('vf_idEvento').value,
      nomeExibicao: document.getElementById('vf_nomeExibicao').value.trim(),
      dataExibicao: document.getElementById('vf_dataExibicao').value.trim(),
      fonteImagens: document.getElementById('vf_fonte').value,
      linkPastaDrive: document.getElementById('vf_linkDrive').value.trim(),
      tema: document.getElementById('vf_tema').value,
      corPrimaria: document.getElementById('vf_cor').value,
      tipografia: document.getElementById('vf_tipografia').value,
      capaUrl: document.getElementById('vf_capa').value.trim(),
      validade: document.getElementById('vf_validade').value.trim(),
    };
    const senhaDigitada = document.getElementById('vf_senha').value;
    if (senhaDigitada) dados.senha = senhaDigitada; // em branco = mantém a senha atual (ou nenhuma)

    try {
      if (editando){
        dados.id = v['ID Vitrine'];
        dados.status = v['Status'];
        await apiCall('atualizarVitrine', dados);
        showToast('✅ Vitrine atualizada');
      } else {
        await apiCall('criarVitrine', dados);
        showToast('✅ Vitrine criada');
      }
      loaded = false;
      await renderMain();
      fecharOverlay();
    } catch (err){
      mostrarErro('vitrineErr', err.message);
    }
  });

  document.getElementById('overlay').addEventListener('click', (e) => {
    if (e.target.id === 'overlay') fecharOverlay();
  });
}

/* ============ FOTOS (modo upload_proprio) ============ */
async function abrirGerenciarFotos_(id){
  const v = vitrines.find(x => String(x['ID Vitrine']) === String(id));
  if (!v) return;
  document.getElementById('overlayRoot').innerHTML = `
    <div class="form-overlay" id="overlay">
      <div class="form-panel" style="max-width:720px;">
        <h2>Fotos — ${esc(vitrineTituloExibicao_(v))}</h2>
        <div class="field"><input type="file" id="vf_arquivos" accept="image/*" multiple></div>
        <div id="vf_fotosGrid" class="vitrine-fotos-grid"><div class="empty-state">Carregando…</div></div>
        <div class="form-actions"><button type="button" class="btn-ghost" onclick="fecharOverlay()">Fechar</button></div>
      </div>
    </div>
  `;
  document.getElementById('overlay').addEventListener('click', (e) => { if (e.target.id === 'overlay') fecharOverlay(); });
  document.getElementById('vf_arquivos').addEventListener('change', async (e) => {
    const arquivos = Array.from(e.target.files || []);
    if (!arquivos.length) return;
    await pbAuthGarantir();
    const fotosAtuais = await pbListarFotosVitrine(v.__pbId);
    let ordem = fotosAtuais.length;
    for (const arquivo of arquivos){
      try {
        await apiCall('uploadFotoVitrine', { idVitrinePb: v.__pbId, arquivo, ordem: ordem++ });
      } catch (err){
        showToast('❌ Erro ao enviar ' + arquivo.name + ': ' + err.message);
      }
    }
    showToast('✅ Fotos enviadas');
    desenharGridFotos_(v);
  });
  desenharGridFotos_(v);
}

async function desenharGridFotos_(v){
  const grid = document.getElementById('vf_fotosGrid');
  await pbAuthGarantir();
  const fotos = await pbListarFotosVitrine(v.__pbId);
  if (!fotos.length){
    grid.innerHTML = `<div class="empty-state">Nenhuma foto enviada ainda.</div>`;
    return;
  }
  grid.innerHTML = fotos.map(f => `
    <div class="vitrine-foto-card">
      <img src="${PB.getFileUrl(f, f.arquivo, { thumb: '400x400' })}" loading="lazy">
      <button class="btn-icon vitrine-foto-del" data-del="${f.id}" title="Excluir"><i class="bi bi-trash"></i></button>
    </div>
  `).join('');
  grid.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => {
    try {
      await apiCall('excluirFotoVitrine', { id: b.dataset.del });
      desenharGridFotos_(v);
    } catch (err){
      showToast('❌ Erro: ' + err.message);
    }
  }));
}
