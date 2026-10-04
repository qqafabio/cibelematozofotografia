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
   Os rótulos batem 1:1 com os cabeçalhos das abas (ver backend.txt);
   as colunas do PocketBase usam snake_case minúsculo.
   Clientes NÃO está aqui: seu adapter dedicado é pbClientes.js.
   ============================================================ */

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
