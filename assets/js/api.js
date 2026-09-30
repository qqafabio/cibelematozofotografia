/* ============================================================
   CRM · Cibele Matozo Fotografia — API (Facade) & carregamento
   Carregado como <script> clássico (escopo global compartilhado).
   NÃO usar import/export: os handlers onclick inline e o estado
   global dependem deste escopo. Ordem de carga definida em crm.html.
   ============================================================ */

/* ============ API ============ */
function isConfigurado(){ return CRM_API_URL && CRM_API_URL.indexOf('COLE_AQUI') === -1; }
async function apiCall(action, dados){
  const res = await fetch(CRM_API_URL, { method:'POST', body: JSON.stringify({ action, dados: dados||{} }) });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Erro desconhecido');
  return json.dados;
}
async function carregarTudo(){
  const r = await apiCall('carregarTudo');
  clientes = r.clientes; eventos = r.eventos; leads = r.leads; financeiro = r.financeiro;
  producao = r.producao; custos = r.custos; listas = r.listas || {};
  freelanceEventos = r.freelanceEventos; templates = r.templates || [];
  contasEmAtraso = r.contasEmAtraso || [];
  pacotes = r.pacotes || [];
  participantes = r.participantes || [];
  loaded = true;
}
 
