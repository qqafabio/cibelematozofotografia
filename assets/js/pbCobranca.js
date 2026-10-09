/* ============================================================
   CRM · Cibele Matozo Fotografia — Adapter PocketBase · Cobrança 3-strikes (v3.3)
   <script> clássico. Depende de pbCore.js/pbEscrita.js/pbClientes.js.
   Espelha registrarEnvioManual/registrarTentativaCobranca/bloquear/
   desbloquear/obterHistoricoCobranca do Apps Script (backend.txt
   1415-1487 / 1959-2016).

   Colunas: Financeiro → observacoes_cobranca (log) + tentativas_cobranca.
   Clientes → bloqueado_cobranca / motivo_bloqueio / data_bloqueio
   (migração 1793000201_add_bloqueio_cobranca.js; aplicar na VM até a Fase 4).
   ============================================================ */

// Carimbo "DD/MM/AAAA HH:MM:SS" — mesmo que o backend monta em registrarEnvio*.
function agoraBR_(){
  const agora = new Date();
  return agora.toLocaleDateString('pt-BR') + ' ' + agora.toLocaleTimeString('pt-BR');
}

// Acumula o histórico no log de cobrança (observacoes_cobranca), separando as
// notas por "---" como o backend (obsAntiga ? obsAntiga + '\n---\n' + nova : nova).
function acumularLogCobranca_(obsAntiga, novaNota){
  const antiga = obsAntiga || '';
  return antiga ? antiga + '\n---\n' + novaNota : novaNota;
}

/* Bloqueia um cliente para cobrança (backend.txt 1441-1455). */
async function pbBloquearClienteCobranca(dados){
  await pbAuthGarantir();
  if (!dados.idCliente) throw new Error('idCliente é obrigatório');
  if (!dados.motivo) throw new Error('motivo é obrigatório');
  const rec = await pbAcharPorIdCliente(dados.idCliente);
  await PB.collection('clientes').update(rec.id, {
    bloqueado_cobranca: 'Sim',
    motivo_bloqueio: dados.motivo,
    data_bloqueio: hojeBR_(),
  });
  return { idCliente: dados.idCliente, bloqueado: true };
}

/* Remove o bloqueio de um cliente (backend.txt 1458-1469). */
async function pbDesbloquearClienteCobranca(dados){
  await pbAuthGarantir();
  if (!dados.idCliente) throw new Error('idCliente é obrigatório');
  const rec = await pbAcharPorIdCliente(dados.idCliente);
  await PB.collection('clientes').update(rec.id, {
    bloqueado_cobranca: 'Não',
    motivo_bloqueio: '',
  });
  return { idCliente: dados.idCliente, desbloqueado: true };
}

/* Histórico (log) de cobrança de uma parcela (backend.txt 1473-1487). */
async function pbObterHistoricoCobranca(dados){
  await pbAuthGarantir();
  if (!dados.idParcela) throw new Error('idParcela é obrigatório');
  const rec = await pbAchar_('financeiro', 'id_parcela', dados.idParcela);
  return {
    idParcela: dados.idParcela,
    observacoes: rec.observacoes_cobranca || 'Sem histórico de cobrança',
    totalTentativas: Number(rec.tentativas_cobranca || 0),
  };
}

/* Registra uma tentativa avulsa de cobrança (backend.txt 1415-1438).
   A numeração vem pronta de `dados.tentativaNumero` (como no backend). */
async function pbRegistrarTentativaCobranca(dados){
  await pbAuthGarantir();
  if (!dados.idParcela) throw new Error('idParcela é obrigatório');
  const rec = await pbAchar_('financeiro', 'id_parcela', dados.idParcela);
  const dataHora = agoraBR_();
  const usuarioEnviou = dados.usuarioEnviou || 'Sistema';
  const templateUsado = dados.templateUsado || 'Padrão';
  const novaNota = `Tentativa ${dados.tentativaNumero}/3 - ${dataHora} por ${usuarioEnviou}\nTemplate: ${templateUsado}\n`;
  await PB.collection('financeiro').update(rec.id, {
    observacoes_cobranca: acumularLogCobranca_(rec.observacoes_cobranca, novaNota),
    tentativas_cobranca: Number(dados.tentativaNumero) || 1,
  });
  return { idParcela: dados.idParcela, tentativaRegistrada: true, dataHora };
}

/* Registra um envio manual via WhatsApp (backend.txt 1959-2016).
   É o fluxo que o front chama de fato (mensagens.js → marcarEnvio). Incrementa
   o contador, acumula o log e — ao atingir 3 — bloqueia o cliente automaticamente. */
async function pbRegistrarEnvioManual(dados){
  await pbAuthGarantir();
  if (!dados.idParcela) throw new Error('idParcela é obrigatório');
  if (!dados.templateUsado) throw new Error('templateUsado é obrigatório');
  const rec = await pbAchar_('financeiro', 'id_parcela', dados.idParcela);

  const dataHora = agoraBR_();
  const usuarioEnviou = dados.usuarioEnviou || 'Manual (App)';
  const tentativaAtual = Number(rec.tentativas_cobranca || 0) + 1;
  if (tentativaAtual > 3){
    throw new Error('Máximo de 3 tentativas atingido. Cliente será bloqueado automaticamente.');
  }
  const nomeTemplate = dados.templateUsado === 'leve' ? 'LEVE'
    : (dados.templateUsado === 'media' ? 'MÉDIA' : 'PESADA');
  const novaNota = `✓ Envio ${tentativaAtual}/3 - ${dataHora} por ${usuarioEnviou}\nTemplate: ${nomeTemplate} (manual via WhatsApp)\n`;
  await PB.collection('financeiro').update(rec.id, {
    observacoes_cobranca: acumularLogCobranca_(rec.observacoes_cobranca, novaNota),
    tentativas_cobranca: tentativaAtual,
  });

  // Ao atingir 3 tentativas, bloqueia o cliente automaticamente. No PB a parcela
  // já carrega id_cliente; se faltar, resolve via o evento (como o backend faz).
  // Fail-soft: o auto-bloqueio não interrompe o registro do envio.
  if (tentativaAtual >= 3){
    try {
      let idCli = Number(rec.id_cliente || 0);
      if (!idCli && rec.id_evento){
        try { const ev = await pbAchar_('eventos', 'id_evento', rec.id_evento); idCli = Number(ev.id_cliente || 0); } catch(e){ /* sem evento */ }
      }
      if (idCli){
        await pbBloquearClienteCobranca({
          idCliente: idCli,
          motivo: '3 tentativas de cobrança sem resposta (' + new Date().toLocaleDateString('pt-BR') + ')',
        });
      }
    } catch (e){
      console.error('registrarEnvioManual: auto-bloqueio falhou (segue): ' + e);
    }
  }

  return {
    idParcela: dados.idParcela,
    envioRegistrado: true,
    tentativaRegistrada: tentativaAtual,
    dataHora: dataHora,
    proximaTentativa: tentativaAtual < 3,
    clienteBloqueado: tentativaAtual >= 3,
  };
}

Object.assign(window.PB_ACTIONS, {
  registrarEnvioManual: (d) => perfTime('PB registrarEnvioManual', pbRegistrarEnvioManual(d)),
  registrarTentativaCobranca: (d) => perfTime('PB registrarTentativaCobranca', pbRegistrarTentativaCobranca(d)),
  bloquearClienteCobranca: (d) => perfTime('PB bloquearClienteCobranca', pbBloquearClienteCobranca(d)),
  desbloquearClienteCobranca: (d) => perfTime('PB desbloquearClienteCobranca', pbDesbloquearClienteCobranca(d)),
  obterHistoricoCobranca: (d) => perfTime('PB obterHistoricoCobranca', pbObterHistoricoCobranca(d)),
});
