/// <reference path="../pb_data/types.d.ts" />
// v3.18.6 — o status "Pago" das contas a RECEBER vira "Recebido" (quem registra é a fotógrafa
// recebendo do cliente, não pagando). Renomeia o valor gravado em: listas ("Status cobrança"),
// financeiro.status e participantes.status_compra. Custos e Freelance (contas a pagar) não mudam.
// Escrita à mão e idempotente (só mexe em quem ainda está "Pago"); o front v3.18.6 já compara "Recebido".
function renomear(db, de, para) {
  const dao = new Dao(db);
  const alvos = [
    ["listas", "campo = {:c} AND valor = {:v}", { c: "Status cobrança", v: de }, "valor"],
    ["financeiro", "status = {:v}", { v: de }, "status"],
    ["participantes", "status_compra = {:v}", { v: de }, "status_compra"],
  ];
  alvos.forEach((a) => {
    let registros = [];
    try {
      registros = dao.findRecordsByExpr(a[0], $dbx.exp(a[1], a[2]));
    } catch (e) {
      return; // coleção/coluna ausente em base antiga: nada a renomear
    }
    registros.forEach((r) => {
      r.set(a[3], para);
      dao.saveRecord(r);
    });
  });
}

migrate((db) => {
  renomear(db, "Pago", "Recebido");
}, (db) => {
  renomear(db, "Recebido", "Pago");
});
