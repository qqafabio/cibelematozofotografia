/* ============================================================
   CRM · Cibele Matozo Fotografia — Esquema PocketBase (v3.2)
   Carregado como <script> clássico (escopo global compartilhado).
   NÃO usar import/export para o navegador; há um module.exports no
   final SÓ para o gerador de migrations rodar no Node (infra/).

   FONTE ÚNICA da verdade dos campos de cada coleção. Dirige:
     - o adapter de leitura (pbLeitura.js: snake_case → rótulos do app);
     - o gerador das migrations de criação (infra/gen_pb_migrations.cjs).
   Assim o esquema do PocketBase e o que o front consome NÃO divergem.

   Cada coleção: { collection, id:{label,pb}, fields:[[label, pb, tipo]] }
     tipo: 'text' | 'number' | 'fk'  (fk = número que vira '' quando vazio)
         | 'date'                    (campo de data nativo do PocketBase —
           só use quando uma REGRA de acesso precisa comparar com @now; o
           resto do app guarda data como texto "DD/MM/AAAA")
         | 'file'                    (upload nativo do PocketBase, com thumbs)
         | 'relation:<colecao>'      (relation nativa do PocketBase — só use
           quando uma REGRA pública precisa expandir campo.de.outra.colecao;
           fk de negócio comum continua sendo número simples, como sempre)
   Coleção pode trazer `rules: { listRule, viewRule, createRule, updateRule,
   deleteRule }` para sobrescrever a regra padrão "@request.auth.id != ''"
   (usado pelas vitrines públicas — ver 'vitrines'/'vitrineFotos' abaixo).
   Os rótulos batem 1:1 com os cabeçalhos das abas (ver backend.txt);
   as colunas do PocketBase usam snake_case minúsculo.
   Clientes NÃO está aqui: seu adapter dedicado é pbClientes.js.
   ============================================================ */

/* Condição de acesso público (token+senha+validade+status) compartilhada por
   'vitrines' e tudo que pendura nela ('vitrine_fotos', 'vitrine_selecoes',
   'vitrine_finalizacoes'). `prefixo` é o caminho até os campos da vitrine:
     ''                      → regra da própria coleção 'vitrines'
     'id_vitrine.'           → list/view/delete de uma coleção filha (relation)
     '@request.data.id_vitrine.' → create de uma coleção filha (valida o
                                    id_vitrine que está sendo enviado no body)
   Sempre combinada com "@request.auth.id != ''" (staff sempre passa). */
function regraVitrinePublica_(prefixo){
  const p = prefixo;
  return `(${p}status = "Ativa" && ${p}token != "" && ${p}token = @request.query.token && (${p}validade = "" || ${p}validade >= @now) && (${p}senha_hash = "" || ${p}senha_hash = @request.query.senha_hash))`;
}

const PB_SCHEMA = {
  /* Eventos — individuais e coletivos (flag 'coletivo'). Aba "Eventos". */
  eventos: {
    collection: 'eventos',
    id: { label: 'ID Evento', pb: 'id_evento' },
    fields: [
      ['Status', 'status', 'text'],
      ['Cliente / Responsável', 'cliente_responsavel', 'text'],
      ['WhatsApp', 'whatsapp', 'text'],
      ['Data do evento', 'data_evento', 'text'],
      ['Hora início', 'hora_inicio', 'text'],
      ['Hora fim', 'hora_fim', 'text'],
      ['Tipo de evento', 'tipo_evento', 'text'],
      ['Serviço contratado', 'servico_contratado', 'text'],
      ['Local', 'local', 'text'],
      ['Cidade', 'cidade', 'text'],
      ['Pacote', 'pacote', 'text'],
      ['Valor pacote', 'valor_pacote', 'number'],
      ['Valor foto extra', 'valor_foto_extra', 'number'],
      ['Desconto', 'desconto', 'number'],
      ['Valor final', 'valor_final', 'number'],
      ['Prazo entrega', 'prazo_entrega', 'text'],
      ['Forma de pagamento combinada', 'forma_pagamento_combinada', 'text'], // v3.23: combinada no fechamento do lead (Contrato Digital) — distinta de financeiro.forma_pagamento (por parcela, só após o recebimento)
      ['Contrato', 'contrato', 'text'],
      ['Link contrato', 'link_contrato', 'text'],
      ['Link briefing', 'link_briefing', 'text'],
      ['Link pasta/Drive', 'link_pasta_drive', 'text'],
      ['Equipe', 'equipe', 'text'],
      ['Observações', 'observacoes', 'text'],
      ['ID Cliente', 'id_cliente', 'fk'],
      ['ID Calendar', 'id_calendar', 'text'],
      ['Coletivo', 'coletivo', 'text'],
      ['Organizador', 'organizador', 'text'],
      ['Data de cadastro', 'data_cadastro', 'text'],
    ],
  },

  /* Pacotes. Aba "Pacotes". Referenciado por NOME em Eventos/Leads. */
  pacotes: {
    collection: 'pacotes',
    id: { label: 'ID', pb: 'id_pacote' },
    fields: [
      ['Nome', 'nome', 'text'],
      ['Descrição', 'descricao', 'text'],
      ['Valor pacote', 'valor_pacote', 'number'],
      ['Qtd fotos incluídas', 'qtd_fotos_incluidas', 'text'],
      ['Valor foto extra', 'valor_foto_extra', 'number'],
      ['Itens inclusos', 'itens_inclusos', 'text'],   // v3.18: 1 item por linha → bullets do orçamento
      ['Prazo entrega', 'prazo_entrega', 'text'],     // v3.18
      ['Tipos de evento', 'tipos_evento', 'text'],    // v3.18: "A;B" — vazio = todos
      ['Data criação', 'data_criacao', 'text'],
      ['Data atualização', 'data_atualizacao', 'text'],
    ],
  },

  /* Leads / Orçamentos. Aba "CRM & Orçamentos". */
  leads: {
    collection: 'leads',
    id: { label: 'ID Lead', pb: 'id_lead' },
    fields: [
      ['Data entrada', 'data_entrada', 'text'],
      ['Cliente', 'cliente', 'text'],
      ['WhatsApp', 'whatsapp', 'text'],
      ['E-mail', 'email', 'text'],
      ['Tipo de evento', 'tipo_evento', 'text'],
      ['Data desejada', 'data_desejada', 'text'],
      ['Hora início', 'hora_inicio', 'text'],   // v3.28: junto do card "Evento" do Orçamento — vai para eventos.hora_inicio ao fechar
      ['Hora fim', 'hora_fim', 'text'],
      ['Serviço de interesse', 'servico_interesse', 'text'],
      ['Pacote', 'pacote', 'text'],
      ['Origem', 'origem', 'text'],
      ['Etapa comercial', 'etapa_comercial', 'text'],
      ['Valor estimado', 'valor_estimado', 'number'],
      ['Desconto', 'desconto', 'number'],
      ['Probabilidade %', 'probabilidade', 'number'],
      ['Valor ponderado', 'valor_ponderado', 'number'],
      ['Próximo contato', 'proximo_contato', 'text'],
      ['Prioridade', 'prioridade', 'text'],
      ['Motivo perdido', 'motivo_perdido', 'text'],
      ['Observações', 'observacoes', 'text'],
      ['ID Cliente', 'id_cliente', 'fk'],
      ['Instituição', 'instituicao', 'text'],          // v3.18
      ['Orçamento versão', 'orc_versao', 'number'],    // v3.18
      ['Orçamento hash', 'orc_hash', 'text'],          // v3.18
      ['Orçamento dados', 'orc_dados', 'text'],        // v3.18: JSON da configuração atual
      ['ID Calendar', 'id_calendar', 'text'],          // v3.18: lembrete do próximo contato
    ],
  },

  /* Financeiro — 1 linha = 1 parcela. Aba "Financeiro".
     Observação dupla preservada: 'Observações' (lançamento) vs
     'Observacoes' (log de cobrança) — colunas distintas no backend. */
  financeiro: {
    collection: 'financeiro',
    id: { label: 'ID Parcela', pb: 'id_parcela' },
    fields: [
      ['ID Evento', 'id_evento', 'fk'],
      ['ID Cliente', 'id_cliente', 'fk'],
      ['Cliente', 'cliente', 'text'],
      ['Tipo cobrança', 'tipo_cobranca', 'text'],
      ['Nº parcela', 'num_parcela', 'number'],
      ['Total parcelas', 'total_parcelas', 'number'],
      ['Vencimento', 'vencimento', 'text'],
      ['Valor previsto', 'valor_previsto', 'number'],
      ['Forma pagamento', 'forma_pagamento', 'text'],
      ['Status', 'status', 'text'],
      ['Data pagamento', 'data_pagamento', 'text'],
      ['Valor pago', 'valor_pago', 'number'],
      ['Saldo', 'saldo', 'number'],
      ['Observações', 'observacoes', 'text'],
      ['Observacoes', 'observacoes_cobranca', 'text'],
      ['Tentativas Cobranca', 'tentativas_cobranca', 'number'],
    ],
  },

  /* Produção — 1:1 com evento (o próprio ID Evento é a identidade). Aba "Produção". */
  producao: {
    collection: 'producao',
    id: { label: 'ID Evento', pb: 'id_evento' },
    fields: [
      ['Cliente', 'cliente', 'text'],
      ['Tipo de evento', 'tipo_evento', 'text'],
      ['Data evento', 'data_evento', 'text'],
      ['Foto responsável', 'foto_responsavel', 'text'],
      ['Vídeo responsável', 'video_responsavel', 'text'],
      ['Storymaker responsável', 'storymaker_responsavel', 'text'],
      ['Briefing', 'briefing', 'text'],
      ['Pré-evento', 'pre_evento', 'text'],
      ['Captação', 'captacao', 'text'],
      ['Backup', 'backup', 'text'],
      ['Seleção', 'selecao', 'text'],
      ['Edição foto', 'edicao_foto', 'text'],
      ['Edição vídeo', 'edicao_video', 'text'],
      ['Storymaker/Teaser', 'storymaker_teaser', 'text'],
      ['Álbum', 'album', 'text'],
      ['Aprovação', 'aprovacao', 'text'],
      ['Entrega', 'entrega', 'text'],
      ['Link das fotos', 'link_das_fotos', 'text'],
      ['Data entrega', 'data_entrega', 'text'],
      ['Hora entrega', 'hora_entrega', 'text'],
      ['Local de entrega', 'local_de_entrega', 'text'],
      ['Link entrega', 'link_entrega', 'text'],
      ['Pendências', 'pendencias', 'text'],
      ['Observações', 'observacoes', 'text'],
      ['ID Calendar Entrega', 'id_calendar_entrega', 'text'],
    ],
  },

  /* Custos. Aba "Custos". */
  custos: {
    collection: 'custos',
    id: { label: 'ID Custo', pb: 'id_custo' },
    fields: [
      ['ID Evento', 'id_evento', 'fk'],
      ['Data', 'data', 'text'],
      ['Categoria', 'categoria', 'text'],
      ['Fornecedor', 'fornecedor', 'text'],
      ['Descrição', 'descricao', 'text'],
      ['Valor', 'valor', 'number'],
      ['Pago?', 'pago', 'text'],
      ['Forma pagamento', 'forma_pagamento', 'text'],
      ['Observações', 'observacoes', 'text'],
    ],
  },

  /* Participantes (complementa eventos coletivos). Aba "Participantes". */
  participantes: {
    collection: 'participantes',
    id: { label: 'ID', pb: 'id_participante' },
    fields: [
      ['ID Evento', 'id_evento', 'fk'],
      ['ID Cliente', 'id_cliente', 'fk'],
      ['Nome participante', 'nome_participante', 'text'],
      ['WhatsApp', 'whatsapp', 'text'],
      ['Status compra', 'status_compra', 'text'],
      ['Qtd fotos extras', 'qtd_fotos_extras', 'number'],
      ['Observações', 'observacoes', 'text'],
      ['Data criação', 'data_criacao', 'text'],
    ],
  },

  /* Templates de cobrança. Aba "Templates". */
  templates: {
    collection: 'templates',
    id: { label: 'ID', pb: 'id_template' },
    fields: [
      ['Nome', 'nome', 'text'],
      ['Descrição', 'descricao', 'text'],
      ['Corpo', 'corpo', 'text'],
      ['Padrão', 'padrao', 'text'],
      ['Data Criação', 'data_criacao', 'text'],
    ],
  },

  /* Freelance — eventos (planilha separada). Aba "Eventos" (freelance). */
  freelanceEventos: {
    collection: 'freelance_eventos',
    id: { label: 'ID Evento', pb: 'id_evento' },
    fields: [
      ['Data', 'data', 'text'],
      ['Nome do evento', 'nome_do_evento', 'text'],
      ['Serviço', 'servico', 'text'],
      ['Valor Fotografia', 'valor_fotografia', 'number'],
      ['Valor Edição', 'valor_edicao', 'number'],
      ['Valor Filmagem', 'valor_filmagem', 'number'],
      ['Valor Storymaker', 'valor_storymaker', 'number'],
      ['Total', 'total', 'number'],
      ['Status do trabalho', 'status_do_trabalho', 'text'],
      ['Fotógrafo(a)', 'fotografo', 'text'],
      ['Filmmaker', 'filmmaker', 'text'],
      ['Storymaker', 'storymaker', 'text'],
      ['Editor(a) de fotos', 'editor_fotos', 'text'],
      ['Editor(a) de vídeos', 'editor_videos', 'text'],
      ['Observações', 'observacoes', 'text'],
    ],
  },

  /* Freelance — pagamentos (planilha separada). Aba "Pagamentos" (freelance). */
  freelancePagamentos: {
    collection: 'freelance_pagamentos',
    id: { label: 'ID Pagamento', pb: 'id_pagamento' },
    fields: [
      ['ID Evento', 'id_evento', 'fk'],
      ['Data do pagamento', 'data_do_pagamento', 'text'],
      ['Valor pago', 'valor_pago', 'number'],
      ['Observações', 'observacoes', 'text'],
    ],
  },

  /* Produtos (v3.18) — catálogo de itens vendáveis no orçamento (quadro, álbum...).
     Só PocketBase (não há aba no Sheets). 'migrationTs' fixa o timestamp da migration
     para não renumerar as já aplicadas. */
  produtos: {
    collection: 'produtos',
    migrationTs: 1793000300,
    somentePB: true,
    id: { label: 'ID', pb: 'id_produto' },
    fields: [
      ['Nome', 'nome', 'text'],
      ['Descrição', 'descricao', 'text'],
      ['Valor', 'valor', 'number'],
      ['Tipo de cobrança', 'tipo_cobranca', 'text'],   // 'unitario' | 'fixo'
      ['Tipos de evento', 'tipos_evento', 'text'],     // "A;B" — vazio = todos
      ['Ativo', 'ativo', 'text'],                      // 'Sim' | 'Não'
      ['Data criação', 'data_criacao', 'text'],
      ['Data atualização', 'data_atualizacao', 'text'],
    ],
  },

  /* Orçamentos (v3.18) — histórico imutável: 1 linha por versão gerada de um lead. */
  orcamentos: {
    collection: 'orcamentos',
    migrationTs: 1793000301,
    somentePB: true,
    id: { label: 'ID Orçamento', pb: 'id_orcamento' },
    fields: [
      ['ID Lead', 'id_lead', 'fk'],
      ['Versão', 'versao', 'number'],
      ['Data geração', 'data_geracao', 'text'],
      ['Valor total', 'valor_total', 'number'],
      ['Hash', 'hash', 'text'],
      ['Snapshot', 'snapshot', 'text'],                // JSON completo enviado ao PDF
    ],
  },

  /* Vitrines (v3.19) — Fase 1 da vitrine de fotos: 1 linha por galeria pública
     gerada para um evento. Acesso público é por token (ver `rules` abaixo),
     não pela regra padrão "@request.auth.id != ''" — por isso esta coleção
     declara `rules` explícitas (o gerador usa isso no lugar da RULE genérica).
     'validade' é do tipo PocketBase 'date' (não texto como o resto do app)
     DE PROPÓSITO: é o único jeito da regra pública comparar com @now no
     próprio banco. 'senha_hash' é o SHA-256 (hex) da senha, calculado no
     navegador (nunca guardamos a senha em texto puro). */
  vitrines: {
    collection: 'vitrines',
    migrationTs: 1793000400,
    somentePB: true,
    id: { label: 'ID Vitrine', pb: 'id_vitrine' },
    rules: {
      listRule: `@request.auth.id != "" || (status = "Ativa" && token != "" && token = @request.query.token && (validade = "" || validade >= @now) && (senha_hash = "" || senha_hash = @request.query.senha_hash))`,
      viewRule: `@request.auth.id != "" || (status = "Ativa" && token != "" && token = @request.query.token && (validade = "" || validade >= @now) && (senha_hash = "" || senha_hash = @request.query.senha_hash))`,
      createRule: `@request.auth.id != ""`,
      updateRule: `@request.auth.id != ""`,
      deleteRule: `@request.auth.id != ""`,
    },
    fields: [
      ['ID Evento', 'id_evento', 'fk'],
      ['Token', 'token', 'text'],
      ['Senha hash', 'senha_hash', 'text'],
      ['Validade', 'validade', 'date'],
      ['Status', 'status', 'text'],                    // 'Ativa' | 'Pausada'
      ['Fonte imagens', 'fonte_imagens', 'text'],       // 'upload_proprio' | 'google_drive'
      ['Link pasta Drive', 'link_pasta_drive', 'text'],
      ['Nome exibição', 'nome_exibicao', 'text'],
      ['Subtítulo exibição', 'subtitulo_exibicao', 'text'], // v3.19.12 — "linha acima do título" do novo header (ex.: nome do cliente)
      ['Data exibição', 'data_exibicao', 'text'],
      ['Tema', 'tema', 'text'],                         // 'noir' | 'linen' | 'terra'
      ['Cor primária', 'cor_primaria', 'text'],
      ['Tipografia', 'tipografia', 'text'],             // 'serif' | 'sans'
      ['Capa URL', 'capa_url', 'text'],
      ['Qtd fotos pacote', 'qtd_fotos_pacote', 'number'], // 0 = sem limite (v3.19 Fase 2)
      ['Seleção habilitada', 'selecao_habilitada', 'text'], // 'Sim' | 'Não' (v3.19.11) — '' (vitrines antigas) conta como 'Sim', ver vitrine.html
      ["Marca d'água habilitada", 'marca_dagua_habilitada', 'text'], // 'Sim' | 'Não' (v3.20.1) — '' conta como 'Sim' (preserva o comportamento anterior), ver vitrine.html
      ['Seleção finalizada em', 'selecao_finalizada_em', 'text'], // setado pelo pb_hook, não pelo cliente (v3.19 Fase 2)
      ['Qtd selecionadas final', 'qtd_fotos_selecionadas_final', 'number'], // idem — espelha vitrine_finalizacoes.qtd_selecionadas pra lista do CRM não precisar de outra query
      ['Entrega liberada em', 'entrega_liberada_em', 'text'],       // setado pelo admin (v3.19 Fase 4) — '' = entrega ainda não liberada
      ['Entrega validade', 'entrega_validade', 'text'],             // DD/MM/AAAA, opcional — checado no cliente (vitrine.html), não é regra do PocketBase
      ['Entrega máx downloads', 'entrega_max_downloads', 'number'], // 0 = sem limite
      ['Entrega downloads count', 'entrega_downloads_count', 'number'], // setado pelo pb_hook (contar_downloads.pb.js), espelha a contagem de vitrine_downloads
      ['Data criação', 'data_criacao', 'text'],
    ],
  },

  /* Fotos da vitrine (v3.19) — só usada quando vitrines.fonte_imagens =
     'upload_proprio'. 'id_vitrine' é uma RELATION nativa do PocketBase (não
     o padrão fk=número do resto do app) para a regra pública poder expandir
     `id_vitrine.token`/`id_vitrine.status`/etc. — sem isso não dá para
     validar token/senha/validade sem duplicar esses campos em cada foto. */
  vitrineFotos: {
    collection: 'vitrine_fotos',
    migrationTs: 1793000401,
    somentePB: true,
    id: { label: 'ID Foto', pb: 'id_foto' },
    rules: {
      listRule: `@request.auth.id != "" || (id_vitrine.status = "Ativa" && id_vitrine.token != "" && id_vitrine.token = @request.query.token && (id_vitrine.validade = "" || id_vitrine.validade >= @now) && (id_vitrine.senha_hash = "" || id_vitrine.senha_hash = @request.query.senha_hash))`,
      viewRule: `@request.auth.id != "" || (id_vitrine.status = "Ativa" && id_vitrine.token != "" && id_vitrine.token = @request.query.token && (id_vitrine.validade = "" || id_vitrine.validade >= @now) && (id_vitrine.senha_hash = "" || id_vitrine.senha_hash = @request.query.senha_hash))`,
      createRule: `@request.auth.id != ""`,
      updateRule: `@request.auth.id != ""`,
      deleteRule: `@request.auth.id != ""`,
    },
    fields: [
      ['ID Vitrine', 'id_vitrine', 'relation:vitrines'],
      ['Arquivo', 'arquivo', 'file'],
      ['Preview', 'preview', 'file'], // derivado com marca d'água, gerado no navegador no upload (v3.19 Fase 3) — o 'arquivo' original nunca é alterado
      ['Categoria', 'categoria', 'text'], // álbum/categoria opcional (v3.19 Fase 4), ex. "Cerimônia", "Festa" — '' = sem categoria
      ['Ordem', 'ordem', 'number'],
      ['Nome original', 'nome_original', 'text'],
      ['Data upload', 'data_upload', 'text'],
    ],
  },

  /* Seleções da vitrine (v3.19 Fase 2) — 1 linha por foto que o CLIENTE
     marcou. Cliente cria quando seleciona e apaga quando desmarca (sem
     coluna de "status": a existência da linha já é a seleção). 'arquivo_ref'
     é texto solto (não relation) porque referencia coisas de tipos
     diferentes conforme a fonte da vitrine: o id nativo de 'vitrine_fotos'
     (upload_proprio) OU o id do arquivo no Google Drive (google_drive, que
     nem tem registro no PocketBase) — não dá pra ter uma relation que aponte
     pros dois. 'id_vitrine' SEGUE relation (igual vitrine_fotos) para a
     regra pública expandir token/senha/validade. */
  vitrineSelecoes: {
    collection: 'vitrine_selecoes',
    migrationTs: 1793000403,
    somentePB: true,
    id: { label: 'ID Seleção', pb: 'id_selecao' },
    rules: {
      listRule: `@request.auth.id != "" || ${regraVitrinePublica_('id_vitrine.')}`,
      viewRule: `@request.auth.id != "" || ${regraVitrinePublica_('id_vitrine.')}`,
      createRule: `@request.auth.id != "" || ${regraVitrinePublica_('@request.data.id_vitrine.')}`,
      updateRule: `@request.auth.id != ""`,
      deleteRule: `@request.auth.id != "" || ${regraVitrinePublica_('id_vitrine.')}`,
    },
    fields: [
      ['ID Vitrine', 'id_vitrine', 'relation:vitrines'],
      ['Arquivo ref', 'arquivo_ref', 'text'],
      ['Nome arquivo', 'nome_arquivo', 'text'],
      ['Data seleção', 'data_selecao', 'text'],
    ],
  },

  /* Finalização da seleção (v3.19 Fase 2) — 1 linha quando o cliente clica
     "Finalizar seleção" (não é editável/apagável pelo público: é só um
     carimbo de "terminei", lido pela fotógrafa no CRM e usado pelo pb_hook
     de notificação por e-mail — ver infra/pb_hooks/notificar_selecao.pb.js). */
  vitrineFinalizacoes: {
    collection: 'vitrine_finalizacoes',
    migrationTs: 1793000404,
    somentePB: true,
    id: { label: 'ID Finalização', pb: 'id_finalizacao' },
    rules: {
      listRule: `@request.auth.id != ""`,
      viewRule: `@request.auth.id != ""`,
      createRule: `@request.auth.id != "" || ${regraVitrinePublica_('@request.data.id_vitrine.')}`,
      updateRule: `@request.auth.id != ""`,
      deleteRule: `@request.auth.id != ""`,
    },
    fields: [
      ['ID Vitrine', 'id_vitrine', 'relation:vitrines'],
      ['Qtd selecionadas', 'qtd_selecionadas', 'number'],
      ['Data', 'data', 'text'],
    ],
  },

  /* Downloads da entrega final (v3.19 Fase 4) — 1 linha por clique em
     "Baixar" na seção de entrega final (contador "auto-declarado": o
     cliente cria a linha ao clicar, não é um proxy que de fato intercepta
     o arquivo — mesmo nível de confiança do resto da vitrine, dá pra ver
     quantos downloads rolaram e avisar/bloquear na tela ao atingir o
     limite, mas não impede alguém tecnicamente capaz de contornar).
     'arquivo_ref' guarda o id do arquivo (upload_proprio) ou do Drive
     (google_drive) — mesmo padrão solto de vitrine_selecoes. */
  vitrineDownloads: {
    collection: 'vitrine_downloads',
    migrationTs: 1793000407,
    somentePB: true,
    id: { label: 'ID Download', pb: 'id_download' },
    rules: {
      listRule: `@request.auth.id != ""`,
      viewRule: `@request.auth.id != ""`,
      createRule: `@request.auth.id != "" || ${regraVitrinePublica_('@request.data.id_vitrine.')}`,
      updateRule: `@request.auth.id != ""`,
      deleteRule: `@request.auth.id != ""`,
    },
    fields: [
      ['ID Vitrine', 'id_vitrine', 'relation:vitrines'],
      ['Arquivo ref', 'arquivo_ref', 'text'],
      ['Data', 'data', 'text'],
    ],
  },

  /* Contratos (v3.23 — Fase 2 da integração CRM↔Contrato Digital) — 1 linha por
     contrato gerado a partir de um evento (lead "Fechado"). 'dados_snapshot'
     congela contratante+evento+pacote+parcelas no momento da geração (mesmo
     princípio do 'orc_dados'/'orcamentos.snapshot' do Orçamento): editar o
     cadastro depois não altera um contrato já gerado. 'ID Lead' é denormalizado
     (igual 'orcamentos') para achar o contrato do lead sem precisar de
     eventos.id_lead (que fica fora do payload do app de propósito).
     Acesso público (Fase 3, página do contrato) por token, mesmo padrão da
     Vitrine de Fotos — sem o gate "status = Ativa" das vitrines porque aqui o
     status é de NEGÓCIO (Pendente/Assinado), não de acesso. */
  contratos: {
    collection: 'contratos',
    migrationTs: 1793000500,
    somentePB: true,
    id: { label: 'ID Contrato', pb: 'id_contrato' },
    rules: {
      // v3.32: listRule precisa da MESMA regra pública da viewRule — getFirstListItem
      // (usado por index.html pra buscar o contrato pelo token) faz uma consulta de
      // LISTA por baixo dos panos, então é a listRule que vale, não a viewRule. Com
      // listRule só auth-only, todo cliente externo (sem sessão do CRM) recebia uma
      // lista vazia (200 OK, 0 itens) e a página mostrava "Contrato não encontrado" —
      // só não aparecia nos testes porque o navegador já tinha login salvo do CRM.
      listRule: `@request.auth.id != "" || (token != "" && token = @request.query.token && status != "Cancelado")`,
      viewRule: `@request.auth.id != "" || (token != "" && token = @request.query.token && status != "Cancelado")`,
      createRule: `@request.auth.id != ""`,
      updateRule: `@request.auth.id != ""`,
      deleteRule: `@request.auth.id != ""`,
    },
    fields: [
      ['ID Lead', 'id_lead', 'fk'],
      ['ID Evento', 'id_evento', 'fk'],
      ['ID Cliente', 'id_cliente', 'fk'],
      ['Token', 'token', 'text'],
      ['Status', 'status', 'text'],                    // 'Pendente' | 'Assinado' | 'Cancelado'
      ['Dados snapshot', 'dados_snapshot', 'text'],     // JSON congelado no momento da geração
      ['Link PDF', 'link_pdf', 'text'],                 // preenchido na Fase 4 (pb_hook + Apps Script)
      ['Data criação', 'data_criacao', 'text'],
      ['Data assinatura', 'data_assinatura', 'text'],
    ],
  },

  /* Assinaturas de contrato (v3.25 — Fase 3) — 1 linha por assinatura enviada
     pela página pública do Contrato Digital. Só o CLIENTE cria (createRule
     pública por token, igual padrão da Vitrine de Fotos); quem marca o
     contrato como "Assinado" é o pb_hook assinar_contrato.pb.js (privilégio
     de servidor), nunca o próprio cliente — por isso 'contratos.updateRule'
     continua auth-only. 'id_contrato' é relation nativa (igual
     vitrine_fotos.id_vitrine) para a regra pública poder expandir
     id_contrato.token/.status sem duplicar esses campos aqui. */
  contratoAssinaturas: {
    collection: 'contrato_assinaturas',
    migrationTs: 1793000501,
    somentePB: true,
    id: { label: 'ID Assinatura', pb: 'id_assinatura' },
    rules: {
      listRule: `@request.auth.id != ""`,
      viewRule: `@request.auth.id != ""`,
      createRule: `@request.auth.id != "" || (id_contrato.token != "" && id_contrato.token = @request.query.token && id_contrato.status != "Cancelado" && id_contrato.status != "Assinado")`,
      updateRule: `@request.auth.id != ""`,
      deleteRule: `@request.auth.id != ""`,
    },
    fields: [
      ['ID Contrato', 'id_contrato', 'relation:contratos'],
      ['Autorização imagem', 'autorizacao_imagem', 'text'],   // 'autorizo' | 'nao_autorizo'
      ['Declarações', 'declaracoes', 'text'],                 // JSON { d1: true, d2: true, ... }
      ['Método assinatura', 'metodo_assinatura', 'text'],     // 'desenho' | 'aceite'
      ['Nome assinatura', 'nome_assinatura', 'text'],
      ['Assinatura arquivo', 'assinatura_arquivo', 'file'],   // PNG do traço (vazio quando método = 'aceite')
      ['Ensaio local', 'ensaio_local', 'text'],               // '' quando o pacote não inclui ensaio pré-evento
      ['Ensaio endereço', 'ensaio_endereco', 'text'],
      ['Modalidade vídeo', 'modalidade_video', 'text'],       // '' quando não há filmagem contratada
      ['PDF arquivo', 'pdf_arquivo', 'file'],                 // PDF gerado no navegador do cliente ao assinar (v3.26 — Fase 4)
      ['Data assinatura', 'data_assinatura', 'text'],
    ],
  },
};

/* Listas (menus suspensos): modelada à parte porque no app vira um OBJETO
   { campo: [valores...] }, não uma lista de registros. No PocketBase: uma
   coleção 'listas' com registros { campo, valor, ordem }. */
const PB_LISTAS = {
  collection: 'listas',
  fields: [
    ['campo', 'campo', 'text'],
    ['valor', 'valor', 'text'],
    ['ordem', 'ordem', 'number'],
  ],
};

// Export só para o gerador de migrations (Node); inócuo no navegador.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PB_SCHEMA, PB_LISTAS };
}
