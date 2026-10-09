/* ============================================================
   CRM · Cibele Matozo Fotografia — Configuração & Navegação (dados)
   Carregado como <script> clássico (escopo global compartilhado).
   NÃO usar import/export: os handlers onclick inline e o estado
   global dependem deste escopo. Ordem de carga definida em crm.html.
   ============================================================ */

/* ============ CONFIGURAÇÃO ============ */
const CRM_API_URL = 'https://script.google.com/macros/s/AKfycbyFy5w3fdEQ6t4lwVPMzpIiiN0CxCWu5tIqFTDGa4x_o3F9VtZKDXScaKY-HusEIpLx/exec';

/* ============ POC PocketBase (v3.1) — só a tela de Clientes ============
   Flag liga/desliga a prova de conceito: com ele TRUE, os Clientes passam a
   vir/gravar no PocketBase; todo o resto do CRM continua no Apps Script.
   Rollback é só voltar para false (nenhum outro arquivo depende do PB).
   Durante o POC, clientes só devem ser criados por aqui — NÃO criar cliente
   pela planilha em paralelo (o "próximo ID" divergiria). Ver README. */
const USE_POCKETBASE_CLIENTES = false;             // v3.2 cutover: escrita de cliente volta ao Apps Script (leitura vem do PB abaixo)
const PB_URL = 'https://cibelecrm.duckdns.org';    // VM Oracle (PocketBase 0.22.55, auto-TLS)
const PB_EMAIL = 'app@cibelecrm.duckdns.org';      // usuário de app neutro (a senha é pedida no 1º acesso)

/* ============ v3.2 — Leitura total no PocketBase ============
   Com esta flag TRUE, carregarTudo() monta TODO o payload a partir do
   PocketBase (réplica de leitura rápida), eliminando a chamada lenta ao
   Apps Script. O Sheets/Apps Script segue como MASTER de escrita e
   espelha as mudanças no PB. Mantida FALSE até as coleções estarem
   criadas e populadas na VM. Rollback = voltar para false.
   No cutover, ligar esta e DESLIGAR USE_POCKETBASE_CLIENTES juntas
   (as escritas de cliente voltam ao Apps Script, como as demais). */
const USE_POCKETBASE_LEITURA = true;               // v3.2 cutover: carregarTudo() lê TODO o payload do PB

/* Teto de espera da leitura do PB antes de cair para o Apps Script. O PB
   normal responde em ~150 ms; 6 s pega a VM travada/lenta com folga, sem
   falso positivo. Fallback = CRM "lento" (AS) em vez de "fora do ar". */
const PB_LEITURA_TIMEOUT_MS = 6000;

/* ============ v3.3 — Escrita total no PocketBase ============
   Flag MESTRA do cutover de escrita. Com ela TRUE, as mutações do CRM
   deixam de ir ao Apps Script e passam a gravar DIRETO no PocketBase
   (adapters pb*.js, roteados por api.js via PB_ACTIONS). O PB vira o
   master de escrita; o Apps Script encolhe para só a cola de Google
   Agenda. Mantida FALSE até os adapters + pb_hooks estarem prontos e
   testados. Rollback = voltar para false (volta tudo ao Apps Script).
   Quando TRUE, também roteia Clientes pelo PB (engloba o POC v3.1). */
const USE_POCKETBASE_ESCRITA = false;

/* ============ NAVEGAÇÃO ============ */
/* Sidebar agrupada por seção. Cada grupo tem um título (com emoji) e seus
   itens; o emoji vive no cabeçalho da seção e os itens ficam com nome puro.
   renderNav() (router.js) desenha os cabeçalhos + itens; a busca por id usa
   NAV.flatMap(g => g.items). */
const NAV = [
  { group:'📊 Visão geral', items:[
    { id:'dashboard', label:'Dashboard', ready:true },
  ]},
  { group:'👥 Clientes', items:[
    { id:'clientes', label:'Clientes', ready:true },
    { id:'leads', label:'CRM · Orçamentos', ready:true },
  ]},
  { group:'📅 Eventos', items:[
    { id:'eventos', label:'Eventos', ready:true },
    { id:'eventosColetivos', label:'Eventos Coletivos', ready:true },
    { id:'producao', label:'Produção', ready:true },
  ]},
  { group:'💰 Financeiro', items:[
    { id:'financeiro', label:'Financeiro', ready:true },
    { id:'contasEmAtraso', label:'Cobranças', ready:true },
    { id:'dashboardCobrancas', label:'Análise', ready:true },
    { id:'custos', label:'Custos', ready:true },
  ]},
  { group:'📦 Serviços', items:[
    { id:'pacotes', label:'Pacotes', ready:true },
    { id:'freelance', label:'Freelance', ready:true },
  ]},
  { group:'💬 Comunicação', items:[
    { id:'templates', label:'Templates', ready:true },
  ]},
  { group:'🔗 Ferramentas', items:[
    { id:'geradorLink', label:'Gerador de link', ready:true, href:'gerador-de-link.html' },
  ]},
];
