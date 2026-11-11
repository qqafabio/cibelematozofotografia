/* ============================================================
   CRM · Cibele Matozo Fotografia — Adapter PocketBase · Contratos (v3.23 — Fase 2)
   <script> clássico (escopo global compartilhado). Depende de pbCore.js
   (PB/pbAuthGarantir/perfTime), pbEscrita.js (hojeBR_/PB_ACTIONS) e
   pbClientes.js (pbAcharPorIdCliente). Ordem de carga definida em crm.html.

   Gera o Contrato Digital a partir do que já está cadastrado no CRM (Cliente +
   Evento + Pacote + parcelas do Financeiro), disparado pelo botão "Gerar
   contrato" em CRM · Orçamentos (leadForm.js) quando o lead está "Fechado".
   O snapshot é congelado em JSON ('dados_snapshot') no momento da geração —
   mesmo princípio já usado pelo Orçamento ('leads.orc_dados'/'orcamentos.snapshot'):
   editar o cadastro depois não muda um contrato já gerado.
   A página pública do contrato (Fase 3) ainda não lê esse token — por ora o
   link gerado aponta para o index.html atual (fixo para aniversário infantil).
   ============================================================ */

// Token público: 32 caracteres hex, mesmo gerador já usado pela Vitrine de Fotos.
function pbGerarTokenContrato_(){
  return crypto.randomUUID().replace(/-/g, '');
}

// Snapshot congelado: contratante (cadastro do cliente) + evento + pacote do
// catálogo (itens inclusos/descrição) + parcelas já lançadas no Financeiro.
async function pbMontarSnapshotContrato_(evento, cliente){
  const pacoteCatalogo = (typeof pacotes !== 'undefined' ? pacotes : [])
    .find(p => String(p['Nome']) === String(evento.pacote));
  const parcelas = await PB.collection('financeiro')
    .getFullList({ filter: 'id_evento=' + Number(evento.id_evento), sort: 'num_parcela' });
  return {
    geradoEm: hojeBR_(),
    contratante: {
      nome: cliente.nome || '', cpf: cliente.cpf || '', whatsapp: cliente.whatsapp || '', email: cliente.email || '',
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

// Gera (ou devolve o já existente) o contrato do evento criado a partir deste
// lead. Idempotente: um evento nunca acumula 2 contratos pendentes/assinados
// (reconfirma no próprio banco, não só no estado em memória — mesmo cuidado
// de leadJaGerouEvento_ em pbLeads.js).
async function pbGerarContrato_(dados){
  await pbAuthGarantir();
  if (!dados.idLead) throw new Error('idLead é obrigatório.');
  const idLead = Number(dados.idLead);

  const evento = await PB.collection('eventos').getFirstListItem('id_lead=' + idLead).catch(() => null);
  if (!evento) throw new Error('Nenhum evento encontrado para este lead — confirme que ele já foi fechado.');

  const existentes = await PB.collection('contratos').getList(1, 1, { filter: 'id_evento=' + Number(evento.id_evento) });
  if (existentes.items.length) return existentes.items[0];

  const cli = await pbAcharPorIdCliente(evento.id_cliente);
  if (!cli) throw new Error('Cliente do evento não encontrado.');

  const snapshot = await pbMontarSnapshotContrato_(evento, cli);

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

Object.assign(window.PB_ACTIONS, {
  gerarContrato: (d) => perfTime('PB gerarContrato', pbGerarContrato_(d)),
});
