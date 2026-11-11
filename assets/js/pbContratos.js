/* ============================================================
   CRM · Cibele Matozo Fotografia — Adapter PocketBase · Contratos (v3.23 — Fase 2
   + v3.25 — Fase 3: snapshot completo para a página pública
   + v3.27 — Fase 4 ajustes: e-mail do cliente com fallback pro Orçamento,
   exige local/horário do evento preenchidos antes de gerar)
   <script> clássico (escopo global compartilhado). Depende de pbCore.js
   (PB/pbAuthGarantir/perfTime), pbEscrita.js (hojeBR_/PB_ACTIONS),
   pbClientes.js (pbAcharPorIdCliente) e orcamentoRegras.js
   (orcRegrasDoTipo_/orcParseDados_, para resolver o ensaio pré-evento).
   Ordem de carga definida em crm.html.

   Gera o Contrato Digital a partir do que já está cadastrado no CRM (Cliente +
   Evento + Pacote + parcelas do Financeiro + regras do Orçamento original),
   disparado pelo botão "Gerar contrato" em CRM · Orçamentos (leadForm.js)
   quando o lead está "Fechado". O snapshot é congelado em JSON
   ('dados_snapshot') no momento da geração — mesmo princípio já usado pelo
   Orçamento ('leads.orc_dados'/'orcamentos.snapshot'): editar o cadastro
   depois não muda um contrato já gerado. A página pública (index.html, Fase 3)
   é um renderizador "burro": toda regra de negócio (quais cláusulas cabem,
   se o ensaio pré-evento está incluso, etc.) já vem resolvida aqui.
   ============================================================ */

// Token público: 32 caracteres hex, mesmo gerador já usado pela Vitrine de Fotos.
function pbGerarTokenContrato_(){
  return crypto.randomUUID().replace(/-/g, '');
}

// Link público para copiar/enviar — mesma base do gerador-de-link.html.
function contratoLinkPublico_(token){
  const base = String(typeof CONTRATO_PUBLIC_BASE_URL !== 'undefined' ? CONTRATO_PUBLIC_BASE_URL : '').replace(/\/?$/, '/');
  return base + '?token=' + token;
}

// Resolve se o ensaio pré-evento está incluso no pacote fechado: precisa que o
// TIPO DE EVENTO admita ensaio (orcRegrasDoTipo_, mesma regra do Orçamento) E
// que o pacote efetivamente fechado tenha marcado "ensaio pré-evento" na
// configuração do orçamento original (leads.orc_dados — só existe pelo
// id_lead do evento; eventos.id_lead fica fora do payload do app de
// propósito, mas o registro RAW do PB aqui tem a coluna). Fail-soft: sem
// lead/orc_dados (evento criado manualmente, fora do fluxo de orçamento),
// assume que não há ensaio incluso — a fotógrafa ajusta via Observações.
function pbEnsaioPreIncluidoDoLead_(evento, lead){
  try {
    if (!lead || typeof orcParseDados_ !== 'function' || typeof orcRegrasDoTipo_ !== 'function') return false;
    const regras = orcRegrasDoTipo_(evento.tipo_evento);
    if (!regras.ensaioPre) return false;
    const cfg = orcParseDados_(lead.orc_dados);
    const pacoteEscolhido = (cfg.pacotes || []).find(p => String(p.nome || '').trim() === String(evento.pacote || '').trim());
    return !!(pacoteEscolhido && pacoteEscolhido.ensaioPre);
  } catch (e){ return false; }
}

// Snapshot congelado: contratante (cadastro do cliente) + evento + pacote do
// catálogo (itens inclusos/descrição) + parcelas já lançadas no Financeiro +
// flags resolvidas (quais serviços/cláusulas se aplicam).
async function pbMontarSnapshotContrato_(evento, cliente, lead){
  const pacoteCatalogo = (typeof pacotes !== 'undefined' ? pacotes : [])
    .find(p => String(p['Nome']) === String(evento.pacote));
  const parcelas = await PB.collection('financeiro')
    .getFullList({ filter: 'id_evento=' + Number(evento.id_evento), sort: 'num_parcela' });
  const servicoStr = String(evento.servico_contratado || '');
  const temFoto = /foto/i.test(servicoStr);
  const temVideo = /v[ií]deo/i.test(servicoStr);
  const temStorymaker = /storymaker/i.test(servicoStr);
  const ensaioPreIncluido = temFoto && pbEnsaioPreIncluidoDoLead_(evento, lead);

  return {
    geradoEm: hojeBR_(),
    temFoto, temVideo, temStorymaker, ensaioPreIncluido,
    contratante: {
      nome: cliente.nome || '', cpf: cliente.cpf || '', whatsapp: cliente.whatsapp || '',
      email: cliente.email || (lead && lead.email) || '',
      rua: cliente.endereco_rua || '', numero: cliente.endereco_numero || '', complemento: cliente.endereco_complemento || '',
      bairro: cliente.endereco_bairro || '', cidade: cliente.cidade || '', uf: cliente.endereco_uf || '',
    },
    evento: {
      tipoEvento: evento.tipo_evento || '', dataEvento: evento.data_evento || '',
      horaInicio: evento.hora_inicio || '', horaFim: evento.hora_fim || '',
      local: evento.local || '', cidade: evento.cidade || '',
      servicoContratado: evento.servico_contratado || '',
      formaPagamentoCombinada: evento.forma_pagamento_combinada || '',
      pacote: evento.pacote || '', valorPacote: Number(evento.valor_pacote || 0),
      desconto: Number(evento.desconto || 0), valorFinal: Number(evento.valor_final || 0),
      observacoes: evento.observacoes || '',
    },
    pacoteCatalogo: pacoteCatalogo ? {
      descricao: pacoteCatalogo['Descrição'] || '',
      itensInclusos: pacoteCatalogo['Itens inclusos'] || '',
      prazoEntrega: pacoteCatalogo['Prazo entrega'] || '',
    } : null,
    parcelas: parcelas.map(p => ({
      tipo: p.tipo_cobranca || '', numero: Number(p.num_parcela || 0), total: Number(p.total_parcelas || 0),
      vencimento: p.vencimento || '', valor: Number(p.valor_previsto || 0),
    })),
  };
}

// Núcleo compartilhado por "Gerar contrato" (botão, criarSeNaoExistir=true) e
// pelo "Salvar" normal do Orçamento (criarSeNaoExistir=false, chamado para
// TODO lead salvo — silencioso, não cria nada sozinho). Resolve 3 casos:
//   1) Sem contrato ainda: só cria se criarSeNaoExistir (botão explícito).
//   2) Contrato "Pendente" já existe: ATUALIZA o snapshot em cima do MESMO
//      registro (mesmo token/link) — é a correção pedida pelo usuário: editar
//      cliente/evento e salvar o Orçamento de novo tem que refletir no link
//      já enviado, sem precisar reenviar outro. Nunca mexe num contrato
//      "Assinado" (imutável, igual um documento já assinado de verdade).
//   3) Já existe mas está "Assinado"/"Cancelado": só gera um novo se foi
//      pedido explicitamente (botão) — um salvamento qualquer do Orçamento
//      não deve criar contrato novo sozinho.
async function pbRefrescarOuGerarContrato_(idLead, criarSeNaoExistir){
  const evento = await PB.collection('eventos').getFirstListItem('id_lead=' + idLead).catch(() => null);
  if (!evento){
    if (criarSeNaoExistir) throw new Error('Nenhum evento encontrado para este lead — confirme que ele já foi fechado.');
    return null;
  }

  const existentes = await PB.collection('contratos').getList(1, 1, { filter: 'id_evento=' + Number(evento.id_evento) });
  const existente = existentes.items[0] || null;

  if (existente && existente.status === 'Pendente'){
    const cli = await pbAcharPorIdCliente(evento.id_cliente);
    if (!cli) return existente;
    const lead = await PB.collection('leads').getFirstListItem('id_lead=' + idLead).catch(() => null);
    const snapshot = await pbMontarSnapshotContrato_(evento, cli, lead);
    return PB.collection('contratos').update(existente.id, { dados_snapshot: JSON.stringify(snapshot) });
  }
  if (existente) return criarSeNaoExistir ? pbCriarContratoNovo_(idLead, evento) : existente;
  return criarSeNaoExistir ? pbCriarContratoNovo_(idLead, evento) : null;
}

async function pbCriarContratoNovo_(idLead, evento){
  if (!String(evento.local || '').trim() || !String(evento.hora_inicio || '').trim() || !String(evento.hora_fim || '').trim()){
    throw new Error('Complete o local e o horário (início/fim) do evento antes de gerar o contrato — no Orçamento ("Instituição / local" + Hora início/fim) ou direto na tela Eventos.');
  }
  const cli = await pbAcharPorIdCliente(evento.id_cliente);
  if (!cli) throw new Error('Cliente do evento não encontrado.');
  const lead = await PB.collection('leads').getFirstListItem('id_lead=' + idLead).catch(() => null);
  const snapshot = await pbMontarSnapshotContrato_(evento, cli, lead);

  return PB.collection('contratos').create({
    id_lead: idLead,
    id_evento: Number(evento.id_evento),
    id_cliente: Number(evento.id_cliente),
    token: pbGerarTokenContrato_(),
    status: 'Pendente',
    dados_snapshot: JSON.stringify(snapshot),
    link_pdf: '',
    data_criacao: hojeBR_(),
    data_assinatura: '',
  });
}

// Botão "Gerar contrato": cria se não existir; se já existe "Pendente",
// atualiza o snapshot nele; se já está "Assinado"/"Cancelado", cria um novo.
async function pbGerarContrato_(dados){
  await pbAuthGarantir();
  if (!dados.idLead) throw new Error('idLead é obrigatório.');
  return pbRefrescarOuGerarContrato_(Number(dados.idLead), true);
}

// Chamado pelo "Salvar" normal do Orçamento (lfSalvar_, leadForm.js) depois de
// salvar o lead/cliente — silencioso e fail-soft: só atualiza um contrato
// "Pendente" que já existia; não cria nem avisa de erro (o salvamento do
// lead não pode travar por causa disso).
async function pbAtualizarContratoPendenteDoLead_(idLead){
  try {
    await pbAuthGarantir();
    return await pbRefrescarOuGerarContrato_(Number(idLead), false);
  } catch (e){
    console.error('pbAtualizarContratoPendenteDoLead_: falhou (segue): ' + e);
    return null;
  }
}

Object.assign(window.PB_ACTIONS, {
  gerarContrato: (d) => perfTime('PB gerarContrato', pbGerarContrato_(d)),
});
