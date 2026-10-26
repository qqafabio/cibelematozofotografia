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
    instituicao: dados.instituicao || '',
    orc_dados: dados.orcDados || '',
    orc_versao: Number(dados.orcVersao || 0),
    orc_hash: dados.orcHash || '',
    // 'Motivo perdido' não é gravado na criação (fica '' por padrão da coleção).
  };
}

// atualizarLead é PATCH parcial: só grava as chaves presentes em `dados`.
const MAPA_LEAD = {
  tipoEvento: 'tipo_evento', dataDesejada: 'data_desejada', servico: 'servico_interesse',
  pacote: 'pacote', origem: 'origem', etapa: 'etapa_comercial', valorEstimado: 'valor_estimado',
  desconto: 'desconto', probabilidade: 'probabilidade', proximoContato: 'proximo_contato',
  prioridade: 'prioridade', motivoPerdido: 'motivo_perdido', observacoes: 'observacoes',
  instituicao: 'instituicao', orcDados: 'orc_dados', orcVersao: 'orc_versao', orcHash: 'orc_hash',
};

const CAMPOS_AGENDA_LEAD = ['proximo_contato', 'tipo_evento', 'data_desejada', 'instituicao', 'pacote',
  'valor_estimado', 'desconto', 'etapa_comercial', 'observacoes', 'cliente', 'whatsapp', 'email'];
function leadAgendaMudou_(antes, depois){
  if (!antes.id_calendar && depois.proximo_contato) return true;
  return CAMPOS_AGENDA_LEAD.some(k => String(antes[k] == null ? '' : antes[k]) !== String(depois[k] == null ? '' : depois[k]));
}

// Reabrir e fechar o lead de novo não pode duplicar evento/conta. Vínculo por eventos.id_lead
// (migration 1793000305); se a coluna ainda não existe (filtro rejeitado), cai na marca das observações.
async function leadJaGerouEvento_(idLead, marca){
  try {
    const r = await PB.collection('eventos').getList(1, 1, { filter: `id_lead = ${Number(idLead)}` });
    if (r.items.length) return true;
  } catch (e){ /* coluna ausente: usa a marca abaixo */ }
  const r = await PB.collection('eventos').getList(1, 1, { filter: `observacoes ~ "${marca}"` });
  return r.items.length > 0;
}

async function pbCriarLead(dados){
  await pbAuthGarantir();
  const cli = await pbLocalizarOuCriarCliente(dados.nome, dados.whatsapp, dados.cpf, dados.email);
  const criado = await PB.collection('leads').create(leadCriarToPb_(dados, cli)); // sem id_lead → hook atribui
  if (typeof sincronizarAgendaLead === 'function') await sincronizarAgendaLead(criado);
  return criado;
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
  if (patch.orc_versao !== undefined) patch.orc_versao = Number(patch.orc_versao || 0);
  // Recalcula 'Valor ponderado' se veio valorEstimado OU probabilidade (backend 559-563),
  // usando o valor atual do record para a variável que não veio.
  if (dados.valorEstimado !== undefined || dados.probabilidade !== undefined){
    const ve = dados.valorEstimado !== undefined ? Number(dados.valorEstimado) : Number(rec.valor_estimado || 0);
    const pr = dados.probabilidade !== undefined ? Number(dados.probabilidade) : Number(rec.probabilidade || 0);
    patch.valor_ponderado = ve * pr / 100;
  }
  const upd = await PB.collection('leads').update(rec.id, patch);
  // Lembrete do próximo contato na Agenda: só mexe quando algo que aparece nele mudou
  // (ou quando ainda não existe e há data) — evita uma ida ao Apps Script a cada salvar.
  if (typeof sincronizarAgendaLead === 'function' && leadAgendaMudou_(rec, upd)) await sincronizarAgendaLead(upd);
  // Cascata (Fase 3): lead virou "Fechado" agora (não já estava) → cria o
  // evento correspondente com status "Aguardando aprovação" (backend 614-634).
  // Fail-soft: se a criação do evento falhar, a atualização do lead não cai.
  if (dados.etapa === 'Fechado' && rec.etapa_comercial !== 'Fechado'
      && typeof pbCriarEvento === 'function'){
    try {
      const marca = `Criado automaticamente a partir do lead #${rec.id_lead}.`;
      if (await leadJaGerouEvento_(rec.id_lead, marca)) return upd;
      const estimadoFechar = dados.valorEstimado !== undefined ? Number(dados.valorEstimado) : Number(rec.valor_estimado || 0);
      const descontoFechar = dados.desconto !== undefined ? Number(dados.desconto) : Number(rec.desconto || 0);
      const evCriado = await pbCriarEvento({
        idCliente: rec.id_cliente,
        status: 'Aguardando aprovação',
        dataEvento: dados.dataDesejada !== undefined ? dados.dataDesejada : rec.data_desejada,
        tipoEvento: dados.tipoEvento !== undefined ? dados.tipoEvento : rec.tipo_evento,
        pacote: dados.pacote !== undefined ? dados.pacote : rec.pacote,
        valorPacote: estimadoFechar,
        desconto: descontoFechar,
        valorFinal: estimadoFechar - descontoFechar,
        observacoes: marca,
        idLead: rec.id_lead,
      });
      // Lança no Financeiro a conta pendente com o valor do orçamento (fail-soft).
      if (Number(evCriado.valor_final || 0) > 0 && typeof pbCriarContaPendente_ === 'function'){
        try { await pbCriarContaPendente_(evCriado); }
        catch (e){ console.error('atualizarLead: conta pendente (lead Fechado) falhou (segue): ' + e); }
      }
    } catch (e){
      console.error('atualizarLead: criação do evento (lead Fechado) falhou (segue): ' + e);
    }
  }
  return upd;
}

async function pbExcluirLead(dados){
  await pbAuthGarantir();
  const rec = await pbAchar_('leads', 'id_lead', dados.idLead);
  if (typeof excluirAgenda === 'function') await excluirAgenda(rec.id_calendar);
  await PB.collection('leads').delete(rec.id);
  // Histórico de orçamentos do lead vai junto (fail-soft: o lead já foi removido).
  if (typeof pbExcluirOrcamentosDoLead === 'function'){
    try { await pbExcluirOrcamentosDoLead(dados.idLead); }
    catch (e){ console.error('excluirLead: limpeza de orçamentos falhou (segue): ' + e); }
  }
  return { idLead: dados.idLead, excluido: true };
}

Object.assign(window.PB_ACTIONS, {
  criarLead: (d) => perfTime('PB criarLead', pbCriarLead(d)),
  atualizarLead: (d) => perfTime('PB atualizarLead', pbAtualizarLead(d)),
  excluirLead: (d) => perfTime('PB excluirLead', pbExcluirLead(d)),
});
