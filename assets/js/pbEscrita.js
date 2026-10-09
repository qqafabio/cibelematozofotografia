/* ============================================================
   CRM · Cibele Matozo Fotografia — Base de escrita no PocketBase (v3.3)
   Carregado como <script> clássico (escopo global compartilhado).
   NÃO usar import/export. Ordem em crm.html: DEPOIS de pbCore.js,
   pbSchema.js e pbClientes.js (reutiliza PB/pbAuthGarantir/perfTime e
   pbCriarCliente/pbAcharPorIdCliente), e ANTES dos adapters pb<Colecao>.js.

   Reúne o que os adapters de escrita compartilham: o registro PB_ACTIONS
   (consumido por api.js quando USE_POCKETBASE_ESCRITA === true), helpers
   de data/dígitos, a busca por id de negócio e o localizarOuCriarCliente_
   portado do Apps Script (backend.txt 275-286).

   Atenção aos IDs: com os pb_hooks da Fase 0 no ar, as coleções com id de
   negócio recebem max(id)+1 NO SERVIDOR quando o campo vem vazio. Por isso
   os adapters NÃO enviam id_<colecao> na criação — quem atribui é o hook.
   ============================================================ */

// Registro único de ações de escrita (cada adapter faz Object.assign aqui).
window.PB_ACTIONS = window.PB_ACTIONS || {};

// Data de hoje no formato BR "DD/MM/AAAA" — mesmo que o backend grava com
// new Date().toLocaleDateString('pt-BR'); é o formato que parseDataBR espera.
function hojeBR_(){ return new Date().toLocaleDateString('pt-BR'); }

// Só dígitos (dedup de WhatsApp/CPF), como localizarOuCriarCliente_ faz.
function soDigitos_(v){ return String(v || '').replace(/\D/g, ''); }

// Localiza o record nativo do PB a partir do id de negócio da coleção.
async function pbAchar_(collection, pbIdField, idValor){
  return PB.collection(collection).getFirstListItem(pbIdField + '=' + Number(idValor));
}

/* localizarOuCriarCliente_ (backend.txt 275-286): dedup por WhatsApp (só
   dígitos) e, se não achar, por CPF; senão cria o cliente com canal
   'Automático'. Retorna { idCliente, nome, whatsapp, email } — os campos
   que o lead copia do CADASTRO do cliente (não do formulário). */
async function pbLocalizarOuCriarCliente(nome, whatsapp, cpf, email){
  await pbAuthGarantir();
  const clientes = await PB.collection('clientes').getFullList({ sort: 'id_cliente' });
  const wa = soDigitos_(whatsapp), cp = soDigitos_(cpf);
  let achado = wa ? clientes.find(c => soDigitos_(c.whatsapp) === wa) : null;
  if (!achado && cp) achado = clientes.find(c => soDigitos_(c.cpf) === cp);
  if (achado){
    return { idCliente: Number(achado.id_cliente), nome: achado.nome || '', whatsapp: achado.whatsapp || '', email: achado.email || '' };
  }
  // Reusa o adapter de clientes (que já resolve id e dedup do POC v3.1).
  const r = await pbCriarCliente({ nome, whatsapp, cpf, email, canal: 'Automático' });
  const c = r.cliente || {};
  return { idCliente: r.idCliente, nome: c['Nome / Responsável'] || '', whatsapp: c['WhatsApp'] || '', email: c['E-mail'] || '' };
}
