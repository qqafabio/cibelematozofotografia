/* ============================================================
   CRM · Cibele Matozo Fotografia — Adapter PocketBase · Leads (v3.3)
   <script> clássico. Depende de pbCore.js/pbEscrita.js/pbClientes.js.
   Espelha criarLead/atualizarLead/excluirLead do Apps Script (backend.txt
   516-600 / 1144-1150). Id de negócio (id_lead) é atribuído pelo pb_hook.
   ============================================================ */

// camelCase do form → colunas snake_case da coleção 'leads' (criação).
// 'Valor ponderado' é DERIVADO: valor_estimado × probabilidade / 100.
// Cliente/WhatsApp/E-mail vêm do CADASTRO do cliente (cli), não do form.
function leadCriarToPb_(dados, cli){
  const ve = Number(dados.valorEstimado || 0);
  const pr = Number(dados.probabilidade || 0);
  return {
    data_entrada: hojeBR_(),                           // backend grava new Date()
    cliente: cli.nome,
    whatsapp: cli.whatsapp,
    email: cli.email,
    tipo_evento: dados.tipoEvento || '',
    data_desejada: dados.dataDesejada || '',
    servico_interesse: dados.servico || '',
    pacote: dados.pacote || '',
    origem: dados.origem || '',
    etapa_comercial: dados.etapa || 'Novo lead',       // default do backend
    valor_estimado: ve,
    desconto: Number(dados.desconto || 0),
    probabilidade: pr,
    valor_ponderado: ve * pr / 100,                    // derivado
    proximo_contato: dados.proximoContato || '',
    prioridade: dados.prioridade || 'Normal',          // default do backend
    observacoes: dados.observacoes || '',
    id_cliente: cli.idCliente,
    // 'Motivo perdido' não é gravado na criação (fica '' por padrão da coleção).
  };
}

// atualizarLead é PATCH parcial: só grava as chaves presentes em `dados`.
const MAPA_LEAD = {
  tipoEvento: 'tipo_evento', dataDesejada: 'data_desejada', servico: 'servico_interesse',
  pacote: 'pacote', origem: 'origem', etapa: 'etapa_comercial', valorEstimado: 'valor_estimado',
  desconto: 'desconto', probabilidade: 'probabilidade', proximoContato: 'proximo_contato',
  prioridade: 'prioridade', motivoPerdido: 'motivo_perdido', observacoes: 'observacoes',
};

async function pbCriarLead(dados){
  await pbAuthGarantir();
  const cli = await pbLocalizarOuCriarCliente(dados.nome, dados.whatsapp, dados.cpf, dados.email);
  return PB.collection('leads').create(leadCriarToPb_(dados, cli)); // sem id_lead → hook atribui
}

async function pbAtualizarLead(dados){
  await pbAuthGarantir();
  const rec = await pbAchar_('leads', 'id_lead', dados.idLead);
  const patch = {};
  for (const k of Object.keys(MAPA_LEAD)){
    if (dados[k] !== undefined) patch[MAPA_LEAD[k]] = dados[k];
  }
  // Campos numéricos da coleção exigem number (o backend grava cru no Sheets).
  if (patch.valor_estimado !== undefined) patch.valor_estimado = Number(patch.valor_estimado || 0);
  if (patch.desconto !== undefined) patch.desconto = Number(patch.desconto || 0);
  if (patch.probabilidade !== undefined) patch.probabilidade = Number(patch.probabilidade || 0);
  // Recalcula 'Valor ponderado' se veio valorEstimado OU probabilidade (backend 559-563),
  // usando o valor atual do record para a variável que não veio.
  if (dados.valorEstimado !== undefined || dados.probabilidade !== undefined){
    const ve = dados.valorEstimado !== undefined ? Number(dados.valorEstimado) : Number(rec.valor_estimado || 0);
    const pr = dados.probabilidade !== undefined ? Number(dados.probabilidade) : Number(rec.probabilidade || 0);
    patch.valor_ponderado = ve * pr / 100;
  }
  const upd = await PB.collection('leads').update(rec.id, patch);
  // TODO Fase 3: se dados.etapa==='Fechado' e a etapa anterior != 'Fechado',
  // o backend (566-586) chama criarEvento(...) com status 'Aguardando aprovação'.
  // Essa cascata depende do adapter/hook de Eventos (ainda não portado) — será
  // feita na Fase 3 junto com a cascata evento→produção→conta.
  return upd;
}

async function pbExcluirLead(dados){
  await pbAuthGarantir();
  const rec = await pbAchar_('leads', 'id_lead', dados.idLead);
  await PB.collection('leads').delete(rec.id);
  return { idLead: dados.idLead, excluido: true };
}

Object.assign(window.PB_ACTIONS, {
  criarLead: (d) => perfTime('PB criarLead', pbCriarLead(d)),
  atualizarLead: (d) => perfTime('PB atualizarLead', pbAtualizarLead(d)),
  excluirLead: (d) => perfTime('PB excluirLead', pbExcluirLead(d)),
});
