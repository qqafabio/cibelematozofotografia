/* ============================================================
   sincronizarPB.gs — Sincronização Sheets -> PocketBase (v3.2)
   GERADO por infra/gen_gas_sync.cjs a partir de assets/js/pbSchema.js.
   NÃO editar à mão: rode o gerador de novo se o esquema mudar.

   Cole este arquivo como um novo .gs no projeto do Apps Script do CRM.
   Depois:
     1) Script Properties: PB_URL, PB_SYNC_EMAIL, PB_SYNC_PASSWORD
        (usuário de app do PocketBase — NUNCA versione a senha).
     2) No doPost, após a mutação, chame sincronizarPBPorAcao_(acao)
        (ver infra/apps_script/README.md).
     3) Rode sincronizarPBTudo() uma vez para semear o PB.
   ============================================================ */

const PB_SYNC_DEFS = [
  { chave: "clientes", colecao: "clientes", aba: "Clientes", freelance: false, idLabel: "ID Cliente", idPb: "id_cliente",
    campos: [["Nome / Responsável", "nome", "text"], ["WhatsApp", "whatsapp", "text"], ["E-mail", "email", "text"], ["CPF/CNPJ", "cpf", "text"], ["Cidade", "cidade", "text"], ["Instagram", "instagram", "text"], ["Canal de origem", "canal", "text"], ["Observações", "observacoes", "text"]] },
  { chave: "eventos", colecao: "eventos", aba: "Eventos", freelance: false, idLabel: "ID Evento", idPb: "id_evento",
    campos: [["Status", "status", "text"], ["Cliente / Responsável", "cliente_responsavel", "text"], ["WhatsApp", "whatsapp", "text"], ["Data do evento", "data_evento", "text"], ["Hora início", "hora_inicio", "text"], ["Hora fim", "hora_fim", "text"], ["Tipo de evento", "tipo_evento", "text"], ["Serviço contratado", "servico_contratado", "text"], ["Local", "local", "text"], ["Cidade", "cidade", "text"], ["Pacote", "pacote", "text"], ["Valor pacote", "valor_pacote", "number"], ["Valor foto extra", "valor_foto_extra", "number"], ["Desconto", "desconto", "number"], ["Valor final", "valor_final", "number"], ["Prazo entrega", "prazo_entrega", "text"], ["Contrato", "contrato", "text"], ["Link contrato", "link_contrato", "text"], ["Link briefing", "link_briefing", "text"], ["Link pasta/Drive", "link_pasta_drive", "text"], ["Equipe", "equipe", "text"], ["Observações", "observacoes", "text"], ["ID Cliente", "id_cliente", "fk"], ["ID Calendar", "id_calendar", "text"], ["Coletivo", "coletivo", "text"], ["Organizador", "organizador", "text"]] },
  { chave: "pacotes", colecao: "pacotes", aba: "Pacotes", freelance: false, idLabel: "ID", idPb: "id_pacote",
    campos: [["Nome", "nome", "text"], ["Descrição", "descricao", "text"], ["Valor pacote", "valor_pacote", "number"], ["Qtd fotos incluídas", "qtd_fotos_incluidas", "text"], ["Valor foto extra", "valor_foto_extra", "number"], ["Data criação", "data_criacao", "text"], ["Data atualização", "data_atualizacao", "text"]] },
  { chave: "leads", colecao: "leads", aba: "CRM & Orçamentos", freelance: false, idLabel: "ID Lead", idPb: "id_lead",
    campos: [["Data entrada", "data_entrada", "text"], ["Cliente", "cliente", "text"], ["WhatsApp", "whatsapp", "text"], ["E-mail", "email", "text"], ["Tipo de evento", "tipo_evento", "text"], ["Data desejada", "data_desejada", "text"], ["Serviço de interesse", "servico_interesse", "text"], ["Pacote", "pacote", "text"], ["Origem", "origem", "text"], ["Etapa comercial", "etapa_comercial", "text"], ["Valor estimado", "valor_estimado", "number"], ["Desconto", "desconto", "number"], ["Probabilidade %", "probabilidade", "number"], ["Valor ponderado", "valor_ponderado", "number"], ["Próximo contato", "proximo_contato", "text"], ["Prioridade", "prioridade", "text"], ["Motivo perdido", "motivo_perdido", "text"], ["Observações", "observacoes", "text"], ["ID Cliente", "id_cliente", "fk"]] },
  { chave: "financeiro", colecao: "financeiro", aba: "Financeiro", freelance: false, idLabel: "ID Parcela", idPb: "id_parcela",
    campos: [["ID Evento", "id_evento", "fk"], ["ID Cliente", "id_cliente", "fk"], ["Cliente", "cliente", "text"], ["Tipo cobrança", "tipo_cobranca", "text"], ["Nº parcela", "num_parcela", "number"], ["Total parcelas", "total_parcelas", "number"], ["Vencimento", "vencimento", "text"], ["Valor previsto", "valor_previsto", "number"], ["Forma pagamento", "forma_pagamento", "text"], ["Status", "status", "text"], ["Data pagamento", "data_pagamento", "text"], ["Valor pago", "valor_pago", "number"], ["Saldo", "saldo", "number"], ["Observações", "observacoes", "text"], ["Observacoes", "observacoes_cobranca", "text"], ["Tentativas Cobranca", "tentativas_cobranca", "number"]] },
  { chave: "producao", colecao: "producao", aba: "Produção", freelance: false, idLabel: "ID Evento", idPb: "id_evento",
    campos: [["Cliente", "cliente", "text"], ["Tipo de evento", "tipo_evento", "text"], ["Data evento", "data_evento", "text"], ["Foto responsável", "foto_responsavel", "text"], ["Vídeo responsável", "video_responsavel", "text"], ["Storymaker responsável", "storymaker_responsavel", "text"], ["Briefing", "briefing", "text"], ["Pré-evento", "pre_evento", "text"], ["Captação", "captacao", "text"], ["Backup", "backup", "text"], ["Seleção", "selecao", "text"], ["Edição foto", "edicao_foto", "text"], ["Edição vídeo", "edicao_video", "text"], ["Storymaker/Teaser", "storymaker_teaser", "text"], ["Álbum", "album", "text"], ["Aprovação", "aprovacao", "text"], ["Entrega", "entrega", "text"], ["Link das fotos", "link_das_fotos", "text"], ["Data entrega", "data_entrega", "text"], ["Hora entrega", "hora_entrega", "text"], ["Local de entrega", "local_de_entrega", "text"], ["Link entrega", "link_entrega", "text"], ["Pendências", "pendencias", "text"], ["Observações", "observacoes", "text"], ["ID Calendar Entrega", "id_calendar_entrega", "text"]] },
  { chave: "custos", colecao: "custos", aba: "Custos", freelance: false, idLabel: "ID Custo", idPb: "id_custo",
    campos: [["ID Evento", "id_evento", "fk"], ["Data", "data", "text"], ["Categoria", "categoria", "text"], ["Fornecedor", "fornecedor", "text"], ["Descrição", "descricao", "text"], ["Valor", "valor", "number"], ["Pago?", "pago", "text"], ["Forma pagamento", "forma_pagamento", "text"], ["Observações", "observacoes", "text"]] },
  { chave: "participantes", colecao: "participantes", aba: "Participantes", freelance: false, idLabel: "ID", idPb: "id_participante",
    campos: [["ID Evento", "id_evento", "fk"], ["ID Cliente", "id_cliente", "fk"], ["Nome participante", "nome_participante", "text"], ["WhatsApp", "whatsapp", "text"], ["Status compra", "status_compra", "text"], ["Qtd fotos extras", "qtd_fotos_extras", "number"], ["Observações", "observacoes", "text"], ["Data criação", "data_criacao", "text"]] },
  { chave: "templates", colecao: "templates", aba: "Templates", freelance: false, idLabel: "ID", idPb: "id_template",
    campos: [["Nome", "nome", "text"], ["Descrição", "descricao", "text"], ["Corpo", "corpo", "text"], ["Padrão", "padrao", "text"], ["Data Criação", "data_criacao", "text"]] },
  { chave: "freelanceEventos", colecao: "freelance_eventos", aba: "Eventos", freelance: true, idLabel: "ID Evento", idPb: "id_evento",
    campos: [["Data", "data", "text"], ["Nome do evento", "nome_do_evento", "text"], ["Serviço", "servico", "text"], ["Valor Fotografia", "valor_fotografia", "number"], ["Valor Edição", "valor_edicao", "number"], ["Valor Filmagem", "valor_filmagem", "number"], ["Valor Storymaker", "valor_storymaker", "number"], ["Total", "total", "number"], ["Status do trabalho", "status_do_trabalho", "text"], ["Fotógrafo(a)", "fotografo", "text"], ["Filmmaker", "filmmaker", "text"], ["Storymaker", "storymaker", "text"], ["Editor(a) de fotos", "editor_fotos", "text"], ["Editor(a) de vídeos", "editor_videos", "text"], ["Observações", "observacoes", "text"]] },
  { chave: "freelancePagamentos", colecao: "freelance_pagamentos", aba: "Pagamentos", freelance: true, idLabel: "ID Pagamento", idPb: "id_pagamento",
    campos: [["ID Evento", "id_evento", "fk"], ["Data do pagamento", "data_do_pagamento", "text"], ["Valor pago", "valor_pago", "number"], ["Observações", "observacoes", "text"]] }
];

const PB_SYNC_ACOES = {
  criarCliente: ["clientes"],
  atualizarCliente: ["clientes"],
  excluirCliente: ["clientes"],
  bloquearClienteCobranca: ["clientes"],
  desbloquearClienteCobranca: ["clientes"],
  criarEvento: ["eventos","financeiro","producao","clientes"],
  atualizarEvento: ["eventos","financeiro","producao"],
  excluirEvento: ["eventos","financeiro","producao"],
  criarLead: ["leads","clientes"],
  atualizarLead: ["leads","clientes"],
  excluirLead: ["leads"],
  criarParcela: ["financeiro"],
  salvarConta: ["financeiro"],
  excluirContaFinanceiro: ["financeiro"],
  registrarTentativaCobranca: ["financeiro"],
  registrarEnvioManual: ["financeiro"],
  atualizarProducao: ["producao"],
  excluirProducao: ["producao"],
  criarCusto: ["custos"],
  atualizarCusto: ["custos"],
  excluirCusto: ["custos"],
  criarPacote: ["pacotes"],
  atualizarPacote: ["pacotes"],
  deletarPacote: ["pacotes"],
  criarTemplate: ["templates"],
  atualizarTemplate: ["templates"],
  deletarTemplate: ["templates"],
  criarEventoColetivo: ["eventos","participantes","clientes","financeiro","producao"],
  importarParticipantes: ["participantes","clientes","financeiro"],
  atualizarParticipante: ["participantes","financeiro"],
  criarFreelanceEvento: ["freelanceEventos"],
  atualizarFreelanceEvento: ["freelanceEventos"],
  excluirFreelanceEvento: ["freelanceEventos","freelancePagamentos"],
  criarFreelancePagamento: ["freelancePagamentos"],
  atualizarFreelancePagamento: ["freelancePagamentos"],
  excluirFreelancePagamento: ["freelancePagamentos"],
};

/* ---- Config (Script Properties): PB_URL, PB_SYNC_EMAIL, PB_SYNC_PASSWORD ---- */
function pbSyncCfg_() {
  const p = PropertiesService.getScriptProperties();
  const url = p.getProperty('PB_URL');
  const email = p.getProperty('PB_SYNC_EMAIL');
  const senha = p.getProperty('PB_SYNC_PASSWORD');
  if (!url || !email || !senha) throw new Error('Faltam Script Properties: PB_URL / PB_SYNC_EMAIL / PB_SYNC_PASSWORD.');
  return { url: url.replace(/\/$/, ''), email: email, senha: senha };
}

function pbSyncToken_(cfg) {
  const res = UrlFetchApp.fetch(cfg.url + '/api/collections/users/auth-with-password', {
    method: 'post', contentType: 'application/json',
    payload: JSON.stringify({ identity: cfg.email, password: cfg.senha }),
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() !== 200) throw new Error('PB auth falhou (' + res.getResponseCode() + '): ' + res.getContentText());
  return JSON.parse(res.getContentText()).token;
}

function pbSyncReq_(metodo, url, token, corpo) {
  const opt = { method: metodo, contentType: 'application/json', muteHttpExceptions: true,
    headers: { Authorization: token } };
  if (corpo) opt.payload = JSON.stringify(corpo);
  const res = UrlFetchApp.fetch(url, opt);
  const code = res.getResponseCode();
  if (code >= 400) throw new Error(metodo + ' ' + url + ' -> ' + code + ': ' + res.getContentText());
  return res.getContentText() ? JSON.parse(res.getContentText()) : {};
}

/* Lê todos os registros de uma coleção, paginando, em um mapa chaveFn->registro. */
function pbSyncGetAll_(cfg, token, colecao, chaveFn) {
  const mapa = {};
  let page = 1; const perPage = 500;
  while (true) {
    const url = cfg.url + '/api/collections/' + colecao + '/records?perPage=' + perPage + '&page=' + page + '&skipTotal=1';
    const r = pbSyncReq_('get', url, token, null);
    (r.items || []).forEach(function (it) { mapa[chaveFn(it)] = it; });
    if (!r.items || r.items.length < perPage) break;
    page++;
  }
  return mapa;
}

function pbSyncValor_(v, tipo) {
  if (tipo === 'number' || tipo === 'fk') {
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  }
  if (v === null || v === undefined) return '';
  if (Object.prototype.toString.call(v) === '[object Date]') {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), 'dd/MM/yyyy');
  }
  return String(v);
}

/* Monta o corpo snake_case (id + campos) a partir de uma linha rotulada da aba. */
function pbSyncCorpo_(def, row) {
  const corpo = {};
  corpo[def.idPb] = Number(row[def.idLabel]) || 0;
  def.campos.forEach(function (c) { corpo[c[1]] = pbSyncValor_(row[c[0]], c[2]); });
  return corpo;
}

/* True se o registro do PB já bate com o corpo desejado (evita PATCH à toa). */
function pbSyncIgual_(regPb, corpo) {
  for (const k in corpo) {
    if (String(regPb[k] == null ? '' : regPb[k]) !== String(corpo[k] == null ? '' : corpo[k])) return false;
  }
  return true;
}

function pbSyncLerAba_(def) {
  const id = def.freelance ? FREELANCE_PLANILHA_ID : CRM_PLANILHA_ID;
  return lerAbaComoObjetos_(def.aba, id);
}

/* Upsert + reconcile de uma entidade comum (com id de negócio). */
function pbSyncEntidade_(cfg, token, def) {
  const base = cfg.url + '/api/collections/' + def.colecao + '/records';
  const linhas = pbSyncLerAba_(def);
  const existentes = pbSyncGetAll_(cfg, token, def.colecao, function (it) { return Number(it[def.idPb]); });
  const vistos = {};
  linhas.forEach(function (row) {
    const idNeg = Number(row[def.idLabel]);
    if (!idNeg) return;
    vistos[idNeg] = true;
    const corpo = pbSyncCorpo_(def, row);
    const atual = existentes[idNeg];
    if (!atual) pbSyncReq_('post', base, token, corpo);
    else if (!pbSyncIgual_(atual, corpo)) pbSyncReq_('patch', base + '/' + atual.id, token, corpo);
  });
  Object.keys(existentes).forEach(function (idNeg) {
    if (!vistos[idNeg]) pbSyncReq_('delete', base + '/' + existentes[idNeg].id, token, null);
  });
}

/* Listas: a aba é orientada a coluna (cabeçalho = campo). "Derrete" em
   registros { campo, valor, ordem } e reconcilia por campo+ordem. */
function pbSyncListas_(cfg, token) {
  const aba = SpreadsheetApp.openById(CRM_PLANILHA_ID).getSheetByName('Listas');
  if (!aba) return;
  const nLin = aba.getLastRow(), nCol = aba.getLastColumn();
  const desejado = {};
  if (nLin >= 2) {
    const cab = aba.getRange(1, 1, 1, nCol).getValues()[0];
    const dados = aba.getRange(2, 1, nLin - 1, nCol).getValues();
    cab.forEach(function (campo, i) {
      if (!campo) return;
      dados.forEach(function (lin, r) {
        const valor = lin[i];
        if (valor === '' || valor === null || valor === undefined) return;
        desejado[campo + '\u0001' + r] = { campo: String(campo), valor: String(valor), ordem: r };
      });
    });
  }
  const base = cfg.url + '/api/collections/listas/records';
  const existentes = pbSyncGetAll_(cfg, token, 'listas', function (it) { return it.campo + '\u0001' + it.ordem; });
  Object.keys(desejado).forEach(function (k) {
    const alvo = desejado[k], atual = existentes[k];
    if (!atual) pbSyncReq_('post', base, token, alvo);
    else if (String(atual.valor) !== String(alvo.valor)) pbSyncReq_('patch', base + '/' + atual.id, token, alvo);
  });
  Object.keys(existentes).forEach(function (k) {
    if (!desejado[k]) pbSyncReq_('delete', base + '/' + existentes[k].id, token, null);
  });
}

function pbSyncDefDe_(chave) {
  for (let i = 0; i < PB_SYNC_DEFS.length; i++) if (PB_SYNC_DEFS[i].chave === chave) return PB_SYNC_DEFS[i];
  return null;
}

/* Núcleo: sincroniza as entidades pedidas (ou TODAS se entidades for null).
   Fail-soft por padrão (loga e segue); com lancarErro=true, propaga. */
function sincronizarPB_(entidades, lancarErro) {
  let cfg, token;
  try {
    cfg = pbSyncCfg_();
    token = pbSyncToken_(cfg);
  } catch (e) {
    console.error('sincronizarPB_ (auth): ' + e);
    if (lancarErro) throw e;
    return;
  }
  const chaves = entidades || PB_SYNC_DEFS.map(function (d) { return d.chave; });
  const incluirListas = !entidades; // full sync inclui listas
  chaves.forEach(function (chave) {
    try {
      const def = pbSyncDefDe_(chave);
      if (def) pbSyncEntidade_(cfg, token, def);
    } catch (e) {
      console.error('sincronizarPB_ (' + chave + '): ' + e);
      if (lancarErro) throw e;
    }
  });
  if (incluirListas) {
    try { pbSyncListas_(cfg, token); }
    catch (e) { console.error('sincronizarPB_ (listas): ' + e); if (lancarErro) throw e; }
  }
}

/* Chamado pelo doPost após cada mutação bem-sucedida (fail-soft). */
function sincronizarPBPorAcao_(acao) {
  const alvos = PB_SYNC_ACOES[acao];
  if (alvos) sincronizarPB_(alvos, false);
}

/* Rode UMA VEZ manualmente (menu Executar) para semear o PB e reconciliar
   tudo, inclusive Listas. Propaga erros para aparecerem no log de execução. */
function sincronizarPBTudo() {
  sincronizarPB_(null, true);
  console.log('Sincronização completa concluída.');
}
