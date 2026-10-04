/* ============================================================
   CRM · Cibele Matozo Fotografia — Núcleo PocketBase (v3.2)
   Carregado como <script> clássico (escopo global compartilhado).
   NÃO usar import/export. Ordem em crm.html: DEPOIS do SDK UMD do
   PocketBase e de config.js, e ANTES de pbClientes.js / pbLeitura.js
   / api.js (todos reutilizam o que está aqui).

   Reúne o que era duplicado no POC (pbClientes.js): instrumentação de
   desempenho, a instância única do PocketBase e a autenticação lazy.
   ============================================================ */

/* ---- Medição de desempenho (comparar Apps Script × PocketBase) ----
   Empilha { label, ms, n } em window.__perf. Ver no console:
   console.table(window.__perf)  */
window.__perf = window.__perf || [];
function perfMark(label, ms, n){
  window.__perf.push({ label, ms: Math.round(ms), n: (n == null ? '' : n) });
}
// Cronometra uma promise e registra em __perf.
async function perfTime(label, promise, nFn){
  const t0 = performance.now();
  const out = await promise;
  const n = typeof nFn === 'function' ? nFn(out) : (nFn == null ? '' : nFn);
  perfMark(label, performance.now() - t0, n);
  return out;
}

/* ---- Instância & autenticação (lazy) ---- */
let PB = null;
function pbInit(){
  if (PB) return PB;
  if (typeof PocketBase === 'undefined') throw new Error('SDK do PocketBase não carregou (tag <script> UMD).');
  PB = new PocketBase(PB_URL);
  PB.autoCancellation(false); // evita abortar requests concorrentes (ex.: carregar várias coleções)
  return PB;
}
// Garante um token válido. Pede a senha UMA vez; o token persiste no
// localStorage (authStore). O repo é público, então nada de senha no código.
async function pbAuthGarantir(){
  pbInit();
  if (PB.authStore.isValid) return;
  const email = PB_EMAIL || window.prompt('E-mail de acesso ao PocketBase:');
  const senha = window.prompt('Senha de acesso ao PocketBase (cliente ' + email + '):');
  if (!email || !senha) throw new Error('Login no PocketBase cancelado.');
  await PB.collection('users').authWithPassword(email, senha);
}
