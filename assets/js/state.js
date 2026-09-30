/* ============================================================
   CRM · Cibele Matozo Fotografia — Estado global da aplicação
   Carregado como <script> clássico (escopo global compartilhado).
   NÃO usar import/export: os handlers onclick inline e o estado
   global dependem deste escopo. Ordem de carga definida em crm.html.
   ============================================================ */

let currentView = 'dashboard';
let clientes = [];
let eventos = [];
let leads = [];
let financeiro = [];
let contasEmAtraso = [];
let producao = [];
let custos = [];
let templates = [];
let pacotes = [];
let listas = {};
let freelanceEventos = [];
let dashboardCobrancas = null;
let loaded = false;

