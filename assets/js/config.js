/* ============================================================
   CRM · Cibele Matozo Fotografia — Configuração & Navegação (dados)
   Carregado como <script> clássico (escopo global compartilhado).
   NÃO usar import/export: os handlers onclick inline e o estado
   global dependem deste escopo. Ordem de carga definida em crm.html.
   ============================================================ */

/* ============ CONFIGURAÇÃO ============ */
const CRM_API_URL = 'https://script.google.com/macros/s/AKfycbyFy5w3fdEQ6t4lwVPMzpIiiN0CxCWu5tIqFTDGa4x_o3F9VtZKDXScaKY-HusEIpLx/exec';
 
/* ============ NAVEGAÇÃO ============ */
const NAV = [
  { id:'dashboard', label:'Dashboard', ready:true },
  { id:'clientes', label:'Clientes', ready:true },
  { id:'eventos', label:'Eventos · Agenda', ready:true },
  { id:'eventosColetivos', label:'Eventos Coletivos', ready:true },
  { id:'pacotes', label:'Pacotes', ready:true },
  { id:'leads', label:'CRM · Orçamentos', ready:true },
  { id:'financeiro', label:'Financeiro', ready:true },
  { id:'contasEmAtraso', label:'📧 Cobranças', ready:true },
  { id:'dashboardCobrancas', label:'📊 Análise', ready:true },
  { id:'producao', label:'Produção', ready:true },
  { id:'custos', label:'Custos', ready:true },
  { id:'templates', label:'⚙️ Templates', ready:true },
  { id:'freelance', label:'Freelance', ready:true },
];
