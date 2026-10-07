/* ============================================================
   CRM · Cibele Matozo Fotografia — Módulo: Templates de cobrança
   Carregado como <script> clássico (escopo global compartilhado).
   NÃO usar import/export: os handlers onclick inline e o estado
   global dependem deste escopo. Ordem de carga definida em crm.html.
   ============================================================ */

/* ============ TEMPLATES DE COBRANÇA ============ */
function renderTemplates(main) {
  const naopadrao = templates.filter(t => t['Padrão'] !== 'Sim');
  main.innerHTML = `
    <div class="view-header">
      <div><h1>⚙️ Templates de Cobrança</h1><p>${templates.length} template${templates.length === 1 ? '' : 's'} disponível${templates.length === 1 ? '' : 's'}</p></div>
      <button class="btn-primary" id="novoTemplateBtn">+ Novo Template</button>
    </div>
    <div id="tabelaTemplates"></div>
  `;
  document.getElementById('novoTemplateBtn').addEventListener('click', () => abrirFormTemplate(null));
  desenharTabelaTemplates();
}

function desenharTabelaTemplates() {
  const container = document.getElementById('tabelaTemplates');
  if (!templates.length) {
    container.innerHTML = `<div class="panel"><div class="empty-state">Nenhum template disponível</div></div>`;
    return;
  }

  const cartoes = templates.map((tpl, idx) => {
    const ehPadraoTag = tpl['Padrão'] === 'Sim' ? '<span class="status-pill">PADRÃO</span>' : '';
    const acoesBotoes = tpl['Padrão'] === 'Sim'
      ? ''
      : `<button class="btn-ghost btn-sm" onclick="abrirFormTemplate(${idx})">✏️ Editar</button>
         <button class="btn-danger btn-sm" onclick="confirmarDeletarTemplate(${idx})">🗑️ Deletar</button>`;

    return `
      <div class="panel tpl-card">
        <div class="tpl-card-head">
          <div>
            <h3>${esc(tpl['Nome'])}${ehPadraoTag}</h3>
            <p>${esc(tpl['Descrição'])}</p>
          </div>
          <div class="tpl-actions">${acoesBotoes}</div>
        </div>
        <textarea class="code-area" readonly>${esc(tpl['Corpo'])}</textarea>
      </div>
    `;
  }).join('');

  container.innerHTML = cartoes;
}

async function abrirFormTemplate(indice) {
  const tpl = indice !== null ? templates[indice] : null;
  const titulo = tpl ? 'Editar Template' : 'Novo Template';
  const nome = tpl ? tpl['Nome'] : '';
  const descricao = tpl ? tpl['Descrição'] : '';
  const corpo = tpl ? tpl['Corpo'] : '';

  document.getElementById('overlayRoot').innerHTML = `
    <div class="form-overlay" id="overlay">
      <div class="form-panel">
        <h2>${titulo}</h2>
        <div id="formErr" class="form-err" style="display:none;"></div>
        <form id="formTemplate" class="form-stack">
          <div class="field">
            <label>Nome do Template *</label>
            <input type="text" id="tplNome" value="${esc(nome)}" placeholder="Ex: LEVE, MÉDIA, PESADA ou seu custom" required>
          </div>
          <div class="field">
            <label>Descrição *</label>
            <input type="text" id="tplDescricao" value="${esc(descricao)}" placeholder="Ex: Primeira abordagem - Educada" required>
          </div>
          <div class="field">
            <label>Corpo da Mensagem * (use {{cliente}}, {{valor}}, {{diasAtraso}}, {{vencimento}})</label>
            <textarea id="tplCorpo" class="code-area" placeholder="Escreva o corpo da mensagem com as variáveis..." required>${esc(corpo)}</textarea>
            <div id="tplPreview" class="preview-box" style="display:none;"></div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-ghost" onclick="fecharOverlay()">Cancelar</button>
            <button type="submit" class="btn-primary">💾 Salvar</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const form = document.getElementById('formTemplate');
  const preview = document.getElementById('tplPreview');
  const corpoInput = document.getElementById('tplCorpo');

  corpoInput.addEventListener('input', () => {
    const corpo = corpoInput.value;
    const preenchido = corpo
      .replace(/\{\{cliente\}\}/g, 'João Silva')
      .replace(/\{\{valor\}\}/g, '1.500,00')
      .replace(/\{\{diasAtraso\}\}/g, '5')
      .replace(/\{\{vencimento\}\}/g, '25/09/2026');
    preview.textContent = preenchido;
    preview.style.display = 'block';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('tplNome').value.trim();
    const descricao = document.getElementById('tplDescricao').value.trim();
    const corpo = document.getElementById('tplCorpo').value.trim();

    if (!nome) {
      mostrarErro('formErr', 'Nome é obrigatório');
      return;
    }
    if (!descricao) {
      mostrarErro('formErr', 'Descrição é obrigatória');
      return;
    }
    if (!corpo) {
      mostrarErro('formErr', 'Corpo é obrigatório');
      return;
    }

    try {
      if (tpl) {
        await apiCall('atualizarTemplate', { id: tpl['ID'], nome, descricao, corpo });
        showToast('✅ Template atualizado');
      } else {
        await apiCall('criarTemplate', { nome, descricao, corpo });
        showToast('✅ Template criado');
      }
      loaded = false;
      await renderMain();
      fecharOverlay();
    } catch (err) {
      mostrarErro('formErr', err.message);
    }
  });

  document.getElementById('overlay').addEventListener('click', (e) => {
    if (e.target.id === 'overlay') fecharOverlay();
  });
}

async function confirmarDeletarTemplate(indice) {
  const tpl = templates[indice];
  if (!tpl || tpl['Padrão'] === 'Sim') {
    showToast('⚠️ Não é possível deletar templates padrão');
    return;
  }

  if (confirm(`Tem certeza que deseja deletar o template "${tpl['Nome']}"?`)) {
    try {
      await apiCall('deletarTemplate', { id: tpl['ID'] });
      showToast('✅ Template deletado');
      loaded = false;
      await renderMain();
    } catch (err) {
      showToast('❌ Erro: ' + err.message);
    }
  }
}

