/* ============================================================
   CRM · Cibele Matozo Fotografia — Adapter PocketBase · Clientes (v3.1/v3.2)
   Carregado como <script> clássico (escopo global compartilhado).
   NÃO usar import/export. Ordem de carga definida em crm.html:
   DEPOIS do SDK UMD, de config.js e de pbCore.js (de onde vêm perfMark/
   perfTime/pbInit/pbAuthGarantir/PB), e ANTES de pbLeitura.js / main.js.

   Mutações de cliente são roteadas por api.js (PB_CLIENT_ACTIONS) quando
   USE_POCKETBASE_CLIENTES === true. A leitura de clientes (pbCarregarClientes)
   também é reutilizada pelo caminho de leitura total (pbLeitura.js, v3.2).
   ============================================================ */

/* ---- Tradução de campos (contrato do resto do app) ---- */
// PB record → objeto com as chaves rotuladas que clientes.js/eventos.js consomem.
function pbRecordToCliente(rec){
  return {
    'ID Cliente': Number(rec.id_cliente),     // NUMBER (o AS compara Number(...))
    'Nome / Responsável': rec.nome || '',
    'WhatsApp': rec.whatsapp || '',
    'E-mail': rec.email || '',
    'CPF/CNPJ': rec.cpf || '',
    'Cidade': rec.cidade || '',
    'Instagram': rec.instagram || '',
    'Canal de origem': rec.canal || '',
    'Observações': rec.observacoes || '',
    'Qtd. eventos': contarEventosDoCliente(rec.id_cliente),
    'Data de cadastro': rec.data_cadastro || '',
    __pbId: rec.id,                           // id nativo do PB (p/ update/delete)
  };
}
// Form (camelCase, como salvarCliente monta) → campos do PocketBase.
function clienteFormToPb(dados){
  return {
    nome: (dados.nome || '').trim(),
    whatsapp: (dados.whatsapp || '').trim(),
    email: (dados.email || '').trim(),
    cpf: (dados.cpf || '').trim(),
    cidade: (dados.cidade || '').trim(),
    instagram: (dados.instagram || '').trim(),
    canal: (dados.canal || '').trim(),
    observacoes: (dados.observacoes || '').trim(),
  };
}
// 'Qtd. eventos' é calculada: os eventos continuam vindo do Apps Script.
function contarEventosDoCliente(idCliente){
  if (!Array.isArray(eventos) || !eventos.length) return 0;
  const alvo = Number(idCliente);
  let n = 0;
  for (const ev of eventos){ if (Number(ev['ID Cliente']) === alvo) n++; }
  return n;
}

/* ---- Operações (mesmo contrato de retorno do apiCall) ---- */
async function pbCarregarClientes(){
  await pbAuthGarantir();
  const registros = await PB.collection('clientes').getFullList({ sort: 'id_cliente' });
  return registros.map(pbRecordToCliente);
}
// Localiza o record do PB a partir do 'ID Cliente' de negócio.
async function pbAcharPorIdCliente(idCliente){
  return PB.collection('clientes').getFirstListItem('id_cliente=' + Number(idCliente));
}
async function pbCriarCliente(dados){
  await pbAuthGarantir();
  // "próximo id" = max(id_cliente)+1, replicando proximoId_ do Apps Script.
  let proximo = 1;
  try {
    const topo = await PB.collection('clientes').getList(1, 1, { sort: '-id_cliente' });
    if (topo.items.length) proximo = Number(topo.items[0].id_cliente) + 1;
  } catch(e){ /* coleção vazia → mantém 1 */ }
  const rec = await PB.collection('clientes').create(Object.assign({ id_cliente: proximo }, clienteFormToPb(dados)));
  return { idCliente: proximo, cliente: pbRecordToCliente(rec) }; // shape só por contrato; salvarCliente ignora
}
async function pbAtualizarCliente(dados){
  await pbAuthGarantir();
  const rec = await pbAcharPorIdCliente(dados.idCliente);
  const atualizado = await PB.collection('clientes').update(rec.id, clienteFormToPb(dados));
  return { cliente: pbRecordToCliente(atualizado) };
}
async function pbExcluirCliente(dados){
  await pbAuthGarantir();
  const rec = await pbAcharPorIdCliente(dados.idCliente);
  await PB.collection('clientes').delete(rec.id);
  return { ok: true };
}

/* ---- Tabela de roteamento consumida por api.js ---- */
const PB_CLIENT_ACTIONS = {
  criarCliente: (dados) => perfTime('PB criarCliente', pbCriarCliente(dados)),
  atualizarCliente: (dados) => perfTime('PB atualizarCliente', pbAtualizarCliente(dados)),
  excluirCliente: (dados) => perfTime('PB excluirCliente', pbExcluirCliente(dados)),
};
