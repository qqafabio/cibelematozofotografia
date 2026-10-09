/* ============================================================
   CRM · Cibele Matozo Fotografia — Adapter PocketBase · Pacotes (v3.3)
   <script> clássico. Depende de pbCore.js/pbEscrita.js.
   Espelha criarPacote/atualizarPacote/deletarPacote (backend.txt 1745-1786).
   id_pacote é atribuído pelo pb_hook.
   ============================================================ */

// 'Qtd fotos incluídas' é coluna de TEXTO no PB: preserva '' (não vira 0) e,
// quando preenchida, guarda o número como string (o front faz Number() na leitura).
function qtdFotos_(v){
  return (v === '' || v === undefined || v === null) ? '' : String(Number(v));
}

// Objeto FIXO (create e update montam o mesmo conjunto; não é PATCH parcial).
function pacoteCamposToPb_(dados){
  return {
    nome: String(dados.nome).trim(),
    descricao: dados.descricao ? String(dados.descricao).trim() : '',
    valor_pacote: Number(dados.valorPacote || 0),
    qtd_fotos_incluidas: qtdFotos_(dados.qtdFotos),
    valor_foto_extra: Number(dados.valorFotoExtra || 0),
  };
}

async function pbCriarPacote(dados){
  await pbAuthGarantir();
  if (!dados.nome || !String(dados.nome).trim()) throw new Error('Nome do pacote é obrigatório');
  const payload = Object.assign(pacoteCamposToPb_(dados), {
    data_criacao: hojeBR_(),
    data_atualizacao: '',
  });
  return PB.collection('pacotes').create(payload); // sem id_pacote → hook
}

async function pbAtualizarPacote(dados){
  await pbAuthGarantir();
  if (!dados.nome || !String(dados.nome).trim()) throw new Error('Nome do pacote é obrigatório');
  const rec = await pbAchar_('pacotes', 'id_pacote', dados.id);
  const patch = Object.assign(pacoteCamposToPb_(dados), {
    data_atualizacao: hojeBR_(),   // 'Data criação' fica intacta
  });
  return PB.collection('pacotes').update(rec.id, patch);
}

async function pbExcluirPacote(dados){
  await pbAuthGarantir();
  const rec = await pbAchar_('pacotes', 'id_pacote', dados.id);
  await PB.collection('pacotes').delete(rec.id);
  return { id: dados.id, deletado: true };
}

Object.assign(window.PB_ACTIONS, {
  criarPacote: (d) => perfTime('PB criarPacote', pbCriarPacote(d)),
  atualizarPacote: (d) => perfTime('PB atualizarPacote', pbAtualizarPacote(d)),
  deletarPacote: (d) => perfTime('PB deletarPacote', pbExcluirPacote(d)),
});
