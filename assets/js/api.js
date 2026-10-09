/* ============================================================
   CRM · Cibele Matozo Fotografia — API (Facade) & carregamento
   Carregado como <script> clássico (escopo global compartilhado).
   NÃO usar import/export: os handlers onclick inline e o estado
   global dependem deste escopo. Ordem de carga definida em crm.html.
   ============================================================ */

/* ============ API ============ */
function isConfigurado(){ return CRM_API_URL && CRM_API_URL.indexOf('COLE_AQUI') === -1; }
async function apiCall(action, dados){
  dados = dados || {};
  // Overlay global de "processando" (só aparece se passar de ~150 ms). Cobre
  // tanto o caminho PocketBase quanto o fetch ao Apps Script. Some no finally.
  if (typeof mostrarAppBusy === 'function') mostrarAppBusy();
  try {
    return await apiCallInterno_(action, dados);
  } finally {
    if (typeof esconderAppBusy === 'function') esconderAppBusy();
  }
}
async function apiCallInterno_(action, dados){
  dados = dados || {};
  // POC v3.1: com o flag próprio ligado, mutações de cliente vão para o
  // PocketBase. A flag mestra da v3.3 (USE_POCKETBASE_ESCRITA) também roteia
  // clientes pelo PB — por isso os dois flags caem no mesmo ramo.
  const usarPBClientes = typeof USE_POCKETBASE_CLIENTES !== 'undefined' && USE_POCKETBASE_CLIENTES;
  const usarPBEscrita  = typeof USE_POCKETBASE_ESCRITA  !== 'undefined' && USE_POCKETBASE_ESCRITA;
  if ((usarPBClientes || usarPBEscrita)
      && typeof PB_CLIENT_ACTIONS !== 'undefined' && PB_CLIENT_ACTIONS[action]){
    return PB_CLIENT_ACTIONS[action](dados);
  }
  // v3.3: escrita geral no PocketBase (adapters pb*.js registram em PB_ACTIONS).
  // Mesmo contrato de retorno do Apps Script; o que não estiver mapeado aqui
  // continua caindo no Apps Script abaixo (transição fase a fase).
  if (usarPBEscrita && typeof PB_ACTIONS !== 'undefined' && PB_ACTIONS[action]){
    return PB_ACTIONS[action](dados);
  }
  const res = await fetch(CRM_API_URL, { method:'POST', body: JSON.stringify({ action, dados }) });
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
    try {
      const t = performance.now();
      // Timeout: numa queda a VM fica LENTA (não dá erro na hora). Se o PB não
      // responder a tempo, desistimos e caímos para o Apps Script (master),
      // transformando "CRM fora do ar" em "CRM lento".
      const r = await comTimeout_(pbCarregarTudoPB(), PB_LEITURA_TIMEOUT_MS, 'PocketBase sem resposta');
      perfMark('PB carregarTudo', performance.now() - t);
      aplicarListas_(r);
      clientes = r.clientes;
      for (const c of clientes){ c['Qtd. eventos'] = contarEventosDoCliente(c['ID Cliente']); }
      loaded = true;
      return;
    } catch (e){
      // Réplica de leitura fora/lenta: degrada para o Apps Script (sempre
      // disponível, porém mais lento). Avisa no console e marca no __perf.
      console.error('carregarTudo: PocketBase indisponível, caindo para o Apps Script — ' + e);
      perfMark('PB->AS fallback', 0);
      await carregarTudoViaAppsScript_();
      return;
    }
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
  await carregarTudoViaAppsScript_();
}
// Caminho base de leitura pelo Apps Script (master de escrita e fonte de
// verdade). Usado quando a leitura do PB está desligada OU como fallback
// quando o PB está indisponível.
async function carregarTudoViaAppsScript_(){
  const r = await apiCall('carregarTudo');
  aplicarListas_(r);
  clientes = r.clientes;
  loaded = true;
}
// Corrida com timeout: resolve com a promise original ou rejeita após `ms`.
function comTimeout_(promise, ms, msg){
  let id;
  const limite = new Promise((_, rej) => { id = setTimeout(() => rej(new Error(msg || ('timeout ' + ms + 'ms'))), ms); });
  return Promise.race([promise, limite]).finally(() => clearTimeout(id));
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
 
