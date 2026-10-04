/* ============================================================
   CRM · Cibele Matozo Fotografia — API (Facade) & carregamento
   Carregado como <script> clássico (escopo global compartilhado).
   NÃO usar import/export: os handlers onclick inline e o estado
   global dependem deste escopo. Ordem de carga definida em crm.html.
   ============================================================ */

/* ============ API ============ */
function isConfigurado(){ return CRM_API_URL && CRM_API_URL.indexOf('COLE_AQUI') === -1; }
async function apiCall(action, dados){
  // POC v3.1: com o flag ligado, mutações de cliente vão para o PocketBase
  // (mesmo contrato de retorno). O resto segue no Apps Script, inalterado.
  if (typeof USE_POCKETBASE_CLIENTES !== 'undefined' && USE_POCKETBASE_CLIENTES
      && typeof PB_CLIENT_ACTIONS !== 'undefined' && PB_CLIENT_ACTIONS[action]){
    return PB_CLIENT_ACTIONS[action](dados || {});
  }
  const res = await fetch(CRM_API_URL, { method:'POST', body: JSON.stringify({ action, dados: dados||{} }) });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Erro desconhecido');
  return json.dados;
}
async function carregarTudo(){
  // v3.2: leitura TOTAL do PocketBase. Monta o payload inteiro a partir do
  // PB (réplica de leitura) no mesmo formato do Apps Script. Supera o ramo
  // do POC de clientes. O Apps Script segue como master de escrita.
  const usarLeituraPB = typeof USE_POCKETBASE_LEITURA !== 'undefined' && USE_POCKETBASE_LEITURA
      && typeof pbCarregarTudoPB === 'function';
  if (usarLeituraPB){
    const t = performance.now();
    const r = await pbCarregarTudoPB();
    perfMark('PB carregarTudo', performance.now() - t);
    aplicarListas_(r);
    clientes = r.clientes;
    for (const c of clientes){ c['Qtd. eventos'] = contarEventosDoCliente(c['ID Cliente']); }
    loaded = true;
    return;
  }

  // POC v3.1: quando o flag liga, Clientes vêm do PocketBase e o resto do
  // Apps Script. Rodamos as duas fontes em paralelo e cronometramos cada
  // uma (window.__perf) para comparar o desempenho antes da migração total.
  const usarPB = typeof USE_POCKETBASE_CLIENTES !== 'undefined' && USE_POCKETBASE_CLIENTES
      && typeof pbCarregarClientes === 'function';
  if (usarPB){
    const tAS = performance.now();
    const pAS = apiCall('carregarTudo').then(r => { perfMark('AS carregarTudo', performance.now() - tAS); return r; });
    const tPB = performance.now();
    const pPB = pbCarregarClientes().then(cs => { perfMark('PB carregarClientes', performance.now() - tPB, cs.length); return cs; });
    const [r, pbClientes] = await Promise.all([pAS, pPB]);
    aplicarListas_(r);
    clientes = pbClientes;                 // PocketBase manda nos clientes
    // 'Qtd. eventos' depende de `eventos`, que só agora está fresco (as duas
    // fontes rodaram em paralelo) — recalcula com os eventos recém-carregados.
    for (const c of clientes){ c['Qtd. eventos'] = contarEventosDoCliente(c['ID Cliente']); }
    loaded = true;
    return;
  }
  const r = await apiCall('carregarTudo');
  aplicarListas_(r);
  clientes = r.clientes;
  loaded = true;
}
// Atribui às globais tudo que vem do Apps Script, EXCETO `clientes`
// (que no POC pode vir do PocketBase). Mantém uma única fonte da verdade.
function aplicarListas_(r){
  eventos = r.eventos; leads = r.leads; financeiro = r.financeiro;
  producao = r.producao; custos = r.custos; listas = r.listas || {};
  freelanceEventos = r.freelanceEventos; templates = r.templates || [];
  contasEmAtraso = r.contasEmAtraso || [];
  pacotes = r.pacotes || [];
  participantes = r.participantes || [];
}
 
