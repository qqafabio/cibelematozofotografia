/* ============================================================
   CRM · Cibele Matozo Fotografia — Adapter PocketBase · Templates (v3.3)
   <script> clássico. Depende de pbCore.js/pbEscrita.js.
   Espelha criarTemplate/atualizarTemplate/deletarTemplate
   (backend.txt 1799-1861). id_template é atribuído pelo pb_hook.
   ============================================================ */

// Mesmas validações do backend: campos obrigatórios + placeholders no corpo.
const PLACEHOLDERS_TEMPLATE = ['{{cliente}}', '{{valor}}', '{{diasAtraso}}', '{{vencimento}}'];
function validarTemplate_(dados){
  if (!dados.nome || !String(dados.nome).trim()) throw new Error('Nome é obrigatório');
  if (!dados.descricao || !String(dados.descricao).trim()) throw new Error('Descrição é obrigatória');
  if (!dados.corpo || !String(dados.corpo).trim()) throw new Error('Corpo é obrigatório');
  const faltando = PLACEHOLDERS_TEMPLATE.filter(p => String(dados.corpo).indexOf(p) === -1);
  if (faltando.length) throw new Error('O corpo deve conter: ' + faltando.join(', '));
}

async function pbCriarTemplate(dados){
  await pbAuthGarantir();
  validarTemplate_(dados);
  return PB.collection('templates').create({
    nome: dados.nome.trim(),
    descricao: dados.descricao.trim(),
    corpo: dados.corpo,                 // cru, sem trim (como o backend)
    padrao: 'Não',                      // criado pelo usuário nunca é padrão
    data_criacao: hojeBR_(),
    // sem id_template → hook atribui
  });
}

async function pbAtualizarTemplate(dados){
  await pbAuthGarantir();
  validarTemplate_(dados);
  const rec = await pbAchar_('templates', 'id_template', dados.id);
  if (rec.padrao === 'Sim') throw new Error('Não é possível editar templates padrão');
  // A coleção 'templates' no PB não tem coluna 'Data Atualização' (não existe
  // no pbSchema) — por isso não gravamos esse campo aqui; 'padrao' e
  // 'data_criacao' permanecem intactos.
  return PB.collection('templates').update(rec.id, {
    nome: dados.nome.trim(),
    descricao: dados.descricao.trim(),
    corpo: dados.corpo,
  });
}

async function pbExcluirTemplate(dados){
  await pbAuthGarantir();
  const rec = await pbAchar_('templates', 'id_template', dados.id);
  if (rec.padrao === 'Sim') throw new Error('Não é possível deletar templates padrão');
  await PB.collection('templates').delete(rec.id);
  return { id: dados.id, deletado: true };
}

Object.assign(window.PB_ACTIONS, {
  criarTemplate: (d) => perfTime('PB criarTemplate', pbCriarTemplate(d)),
  atualizarTemplate: (d) => perfTime('PB atualizarTemplate', pbAtualizarTemplate(d)),
  deletarTemplate: (d) => perfTime('PB deletarTemplate', pbExcluirTemplate(d)),
});
