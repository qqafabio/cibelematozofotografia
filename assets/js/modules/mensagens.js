/* ============================================================
   CRM · Cibele Matozo Fotografia — Módulo: Cópia de mensagens de cobrança
   Carregado como <script> clássico (escopo global compartilhado).
   NÃO usar import/export: os handlers onclick inline e o estado
   global dependem deste escopo. Ordem de carga definida em crm.html.
   ============================================================ */

/* ============ MÓDULO DE COBRANÇA — CÓPIA DE MENSAGENS ============ */

async function abrirCopiadorMensagem(conta) {
  try {
    // Carrega os templates do backend
    const result = await apiCall('obterTemplatesMensagem');
    const { templates } = result;

    if (!templates || !templates.length) {
      showToast('Nenhum template disponível');
      return;
    }

    // Prepara dados dinâmicos
    const idParcela = conta['ID Parcela'] || '';
    const cliente = conta['Cliente'] || 'Cliente';
    const valor = Number(conta['Valor'] || 0).toFixed(2);
    const diasAtraso = conta['diasEmAtraso'] || 0;
    const vencimento = conta['Vencimento'] || 'N/A';
    const tentativasAtuais = Number(conta['Tentativas Cobranca'] || 0);
    const maxTentativas = 3;

    // Função para preencher variáveis
    const preencherTemplate = (template) => {
      return template
        .replace(/\{\{cliente\}\}/g, cliente)
        .replace(/\{\{valor\}\}/g, valor)
        .replace(/\{\{diasAtraso\}\}/g, diasAtraso)
        .replace(/\{\{vencimento\}\}/g, vencimento);
    };

    // Cria HTML do modal com botão de registro
    const templateCards = templates.map((tpl, idx) => {
      const corpoPreenchido = preencherTemplate(tpl.corpo);
      const progresso = tentativasAtuais + 1;
      const podeRegistrar = progresso <= maxTentativas;
      return `
        <div class="template-card" style="background:var(--paper-raised);border:1px solid var(--rule);border-radius:4px;padding:16px;margin-bottom:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <div>
              <strong style="color:var(--gold);">${tpl.nome}</strong>
              <p style="color:var(--ink-soft);font-size:12px;margin:4px 0 0;">${tpl.descricao}</p>
            </div>
            <div style="text-align:right;font-size:11px;color:var(--ink-soft);">
              Tentativa: <strong style="color:var(--ink);">${progresso}/${maxTentativas}</strong>
            </div>
          </div>
          <textarea readonly style="width:100%;min-height:140px;padding:12px;border:1px solid var(--rule);border-radius:3px;background:var(--paper);font-family:monospace;font-size:12px;resize:none;color:var(--ink);">${corpoPreenchido}</textarea>
          <div style="display:flex;gap:8px;margin-top:10px;">
            <button class="btn-primary" style="flex:1;" onclick="copiarMensagem('${tpl.id}', ${idx}); event.preventDefault();">
              📋 Copiar
            </button>
            <button class="btn-primary" style="flex:1;background:var(--ok);" onclick="marcarEnvio('${idParcela}', '${tpl.id}', ${idx}); event.preventDefault();" ${!podeRegistrar ? 'disabled style="opacity:0.5;"' : ''}>
              ✅ Enviado
            </button>
          </div>
        </div>
      `;
    }).join('');

    document.getElementById('overlayRoot').innerHTML = `
      <div class="form-overlay" id="overlay">
        <div class="form-panel" style="max-width:680px;">
          <h2>📧 Copiar Mensagem de Cobrança</h2>
          <p style="color:var(--ink-soft);font-size:13px;margin-bottom:20px;">
            Cliente: <strong>${cliente}</strong> • Valor: <strong>R$ ${valor}</strong> • Dias: <strong>${diasAtraso}</strong> • Tentativas: <strong>${tentativasAtuais}/${maxTentativas}</strong>
          </p>
          <div id="copiadorMensagensTipos">
            ${templateCards}
          </div>
          <div class="form-actions" style="margin-top:20px;">
            <button class="btn-ghost" onclick="fecharOverlay()">Fechar</button>
          </div>
        </div>
      </div>
    `;

    // Event listener para fechar ao clicar no fundo
    document.getElementById('overlay').addEventListener('click', (e) => {
      if (e.target.id === 'overlay') fecharOverlay();
    });
  } catch (err) {
    mostrarErro('modalErr', 'Erro ao carregar templates: ' + err.message);
  }
}

function copiarMensagem(templateId, index) {
  const textareas = document.querySelectorAll('.template-card textarea');
  if (textareas[index]) {
    const texto = textareas[index].value;
    navigator.clipboard.writeText(texto).then(() => {
      showToast(`✅ Mensagem copiada! Pronto para enviar via WhatsApp.`);
    }).catch(() => {
      // Fallback para navegadores mais antigos
      const textarea = document.createElement('textarea');
      textarea.value = texto;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast(`✅ Mensagem copiada! Pronto para enviar via WhatsApp.`);
    });
  }
}

async function marcarEnvio(idParcela, templateId, index) {
  if (!idParcela) {
    showToast('❌ Erro: ID da parcela não encontrado');
    return;
  }

  try {
    const btn = event.target;
    btn.disabled = true;
    btn.textContent = 'Registrando…';

    // Chama o backend para registrar o envio
    await apiCall('registrarEnvioManual', {
      idParcela: idParcela,
      templateUsado: templateId,
      usuarioEnviou: 'Manual (App)'
    });

    showToast(`✅ Envio registrado! Aguardando resposta do cliente.`);

    // Recarrega os dados e fecha o modal
    loaded = false;
    await renderMain();
    fecharOverlay();

  } catch (err) {
    event.target.disabled = false;
    event.target.textContent = '✅ Enviado';

    if (err.message.includes('Máximo de 3 tentativas')) {
      showToast('⚠️ 3 tentativas atingidas. Cliente será bloqueado.');
      setTimeout(() => {
        loaded = false;
        renderMain();
        fecharOverlay();
      }, 1500);
    } else {
      mostrarErro('modalErr', 'Erro ao registrar envio: ' + err.message);
    }
  }
}

async function abrirCopiadorMensagemFlutuante(conta) {
  try {
    const result = await apiCall('obterTemplatesMensagem');
    const { templates } = result;

    if (!templates || !templates.length) {
      showToast('Nenhum template disponível');
      return;
    }

    const idParcela = conta['ID Parcela'] || '';
    const cliente = conta['Cliente'] || 'Cliente';
    const valor = Number(conta['Valor'] || 0).toFixed(2);
    const diasAtraso = conta['diasEmAtraso'] || 0;
    const vencimento = conta['Vencimento'] || 'N/A';
    const tentativasAtuais = Number(conta['Tentativas Cobranca'] || 0);
    const maxTentativas = 3;

    const preencherTemplate = (template) => {
      return template
        .replace(/\{\{cliente\}\}/g, cliente)
        .replace(/\{\{valor\}\}/g, valor)
        .replace(/\{\{diasAtraso\}\}/g, diasAtraso)
        .replace(/\{\{vencimento\}\}/g, vencimento);
    };

    const templateCards = templates.map((tpl, idx) => {
      const corpoPreenchido = preencherTemplate(tpl.corpo);
      const progresso = tentativasAtuais + 1;
      const podeRegistrar = progresso <= maxTentativas;
      return `
        <div class="template-card" style="background:var(--paper-raised);border:1px solid var(--rule);border-radius:4px;padding:16px;margin-bottom:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <div>
              <strong style="color:var(--gold);">${tpl.nome}</strong>
              <p style="color:var(--ink-soft);font-size:12px;margin:4px 0 0;">${tpl.descricao}</p>
            </div>
            <div style="text-align:right;font-size:11px;color:var(--ink-soft);">
              Tentativa: <strong style="color:var(--ink);">${progresso}/${maxTentativas}</strong>
            </div>
          </div>
          <textarea readonly style="width:100%;min-height:120px;padding:12px;border:1px solid var(--rule);border-radius:3px;background:var(--paper);font-family:monospace;font-size:12px;resize:none;color:var(--ink);">${corpoPreenchido}</textarea>
          <div style="display:flex;gap:8px;margin-top:10px;">
            <button class="btn-primary" style="flex:1;" onclick="copiarMensagem('${tpl.id}', ${idx}); event.preventDefault();">📋 Copiar</button>
            <button class="btn-primary" style="flex:1;background:var(--ok);" onclick="marcarEnvio('${idParcela}', '${tpl.id}', ${idx}); event.preventDefault();" ${!podeRegistrar ? 'disabled style="opacity:0.5;"' : ''}>✅ Enviado</button>
          </div>
        </div>
      `;
    }).join('');

    const htmlContent = `
      <p style="color:var(--ink-soft);font-size:13px;margin-bottom:16px;margin-top:0;">
        <strong>${cliente}</strong> • R$ ${valor} • ${diasAtraso}d • ${tentativasAtuais}/${maxTentativas}
      </p>
      <div id="copiadorMensagensTiposFlutuante">
        ${templateCards}
      </div>
    `;

    const fw = new FloatingWindow('copiadorMensagensFlutuante', { saveName: 'copiadorMensagens' });
    fw.create('📧 Copiar Mensagem de Cobrança', htmlContent);
  } catch (err) {
    showToast('❌ Erro: ' + err.message);
  }
}

