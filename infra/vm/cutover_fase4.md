# Fase 4 — Cutover: PocketBase vira master de ESCRITA

> **Objetivo:** inverter o master de escrita. Hoje (v3.2/v3.3) o front **lê** do
> PocketBase mas **escreve** no Apps Script → Google Sheets (master) → espelho no PB.
> Depois do cutover, o front **escreve direto no PocketBase** e o Apps Script encolhe
> para **só a cola da Google Agenda**. O Sheets deixa de ser master.
>
> Gatilho: a flag mestra `USE_POCKETBASE_ESCRITA` em `assets/js/config.js`.
> **Rollback = voltar a flag para `false`** (reverte todo o roteamento de escrita).

Pré-requisitos já prontos no repo (Fases 0–3, commits `5287253`, `8c63634`,
`79af100`, `82097ea`, `7f87181`, `fe3e274`):
- `infra/pb_hooks/auto_id.pb.js` — **já implantado** na VM (ID atômico `max+1`).
- `infra/pb_hooks/delete_guard.pb.js` — versionado, **NÃO implantado** (sobe aqui).
- `infra/pb_migrations/1793000201_add_bloqueio_cobranca.js` — versionado, **aplicar aqui**.
- Adapters `assets/js/pb*.js` registrados em `PB_ACTIONS` — inertes enquanto a flag é `false`.

---

## Por que é seguro (verificado antes do cutover)

1. **O espelho (`sincronizarPBPorAcao_`) não tem gatilho por tempo.** Ele roda
   **só dentro do `doPost`**, por ação. Não há `ScriptApp.newTrigger` instalado.
   Se nenhuma ação de **escrita** chegar mais ao Apps Script, o espelho — que DELETA
   no PB o que não está no Sheets (linhas 172/203 do `sincronizarPB.gs`) — **não roda**.
2. **`PB_SYNC_ACOES` não mapeia nenhuma ação de Agenda.** As 3 ações que o front
   continua mandando ao GAS (`agendaSincronizarEvento`, `agendaSincronizarEntrega`,
   `agendaExcluir`) não estão no mapa → `alvos` fica `undefined` → espelho vira no-op.
3. **Toda ação de escrita que o front dispara tem contraparte em `PB_ACTIONS`.**
   Nenhuma "cai" para o Apps Script com a flag ligada. (`criarParcela` existe no `.gs`
   mas o front nunca chama.) Logo, o espelho destrutivo não tem como ser acionado.

O passo 3 abaixo ainda remove a chamada `sincronizarPBPorAcao_` do backend por
cinto-e-suspensório.

---

## Ordem de execução

### Passo 1 — Backup fresco do `pb_data` (rede de segurança)
Na VM (`opc@cibelecrm.duckdns.org`):
```bash
sudo /opt/pocketbase/backup_pbdata.sh
ls -lh /opt/pocketbase/backups/   # confirme o .tgz novo
```
Guarde o `.tgz` fora da VM se possível — o **rollback de dados** depende dele.

### Passo 2 — Enviar a migração de bloqueio da coleção `clientes`
A `pbCobranca.js` grava `bloqueado_cobranca` / `motivo_bloqueio` / `data_bloqueio`,
colunas que **só existem via migração**. É aditiva e nullable (não afeta nada enquanto
não usada). Aplica no próximo restart (passo 4).
```bash
scp infra/pb_migrations/1793000201_add_bloqueio_cobranca.js \
    opc@cibelecrm.duckdns.org:/opt/pocketbase/pb_migrations/
```

### Passo 3 — Encolher o Apps Script (neutralizar o espelho)
No `backend.txt` (cópia local que você cola no editor do Apps Script), **remova a
chamada do espelho** no `doPost` (linha ~91):
```js
// REMOVER (era: espelhar no PB após cada ação):
try { sincronizarPBPorAcao_(acao); } catch (e) { /* fail-soft */ }
```
O Apps Script passa a fazer **só** Agenda. **Implante** a nova versão
(Implantar → Gerenciar implantações → nova versão). `infra/apps_script/sincronizarPB.gs`
fica **aposentado**.
> Pode ser feito depois do passo 5 (o espelho já é inerte pós-flag), mas prefira antes
> para fechar a porta.

### Passo 4 — Implantar a guarda de exclusão + reiniciar o PB
`delete_guard.pb.js` bloqueia excluir parcela com `valor_pago>0` sem `?forcar=1`.
**Só pode subir agora** — antes do cutover, quebraria o espelho (que agora está morto).
```bash
scp infra/pb_hooks/delete_guard.pb.js opc@cibelecrm.duckdns.org:/opt/pocketbase/pb_hooks/
sudo systemctl restart pocketbase
curl -sf https://cibelecrm.duckdns.org/api/health && echo " OK"
```
O restart também aplica a migração do passo 2. Confira no log que subiu limpo
(sem erro de JSVM): `journalctl -u pocketbase -n 50 --no-pager`.

### Passo 5 — Ligar a flag mestra no front (alteração no repo, feita pelo assistente)
Em `assets/js/config.js`: `USE_POCKETBASE_ESCRITA = true` + bump do `?v=` do
`config.js` no `crm.html`. `USE_POCKETBASE_CLIENTES` fica `false` (a flag mestra já
roteia clientes — `api.js` 17-26). Commit (sem push). **Rollback = `false`**.

### Passo 6 — Smoke-test (com a flag ligada)
- Criar cliente → aparece no PB.
- Criar **evento Confirmado** → nascem **produção + conta "Saldo do evento"**; o
  compromisso aparece na **Google Agenda** e `id_calendar` fica gravado no PB.
- Editar a data do evento → compromisso atualiza na Agenda.
- Salvar **plano de cobrança** (entrada + parcelas + desconto) → linhas certas no Financeiro.
- Tentar **excluir** evento/conta com `valor pago > 0` **sem** forçar → **bloqueado**
  (guarda do passo 4).
- **Coletivo:** criar + importar participantes → conta de pacote por participante;
  marcar "Não quis" → cancela contas em aberto.
- **3-strikes:** 3 envios manuais → cliente auto-bloqueado.
- `console.table(window.__perf)` → as ações de escrita vão pelo caminho `PB *`.

---

## Rollback
- **Front (imediato):** `USE_POCKETBASE_ESCRITA = false` + bump `?v=` → tudo volta ao
  Apps Script/Sheets.
- **Apps Script:** se precisar reativar o espelho, reverta a implantação (passo 3) para
  a versão anterior.
- **Dados:** restaure o `pb_data` do passo 1
  (`systemctl stop pocketbase` → extrair o `.tgz` → `systemctl start`).

> ⚠️ Enquanto a flag esteve `true`, as escritas foram **só** no PB. Um rollback de front
> depois de muitas escritas deixa o Sheets **desatualizado** — por isso o backup e o
> smoke-test logo após o cutover.

---

## Checklist rápido
- [ ] 1. Backup do `pb_data` (`.tgz` guardado fora da VM)
- [ ] 2. `scp` da migração `1793000201_add_bloqueio_cobranca.js` → `pb_migrations/`
- [ ] 3. Remover `sincronizarPBPorAcao_` do `backend.txt` + implantar Apps Script fino
- [ ] 4. `scp` do `delete_guard.pb.js` → `pb_hooks/` + `systemctl restart pocketbase` + health 200
- [ ] 5. `USE_POCKETBASE_ESCRITA=true` + bump `?v=` (commit, sem push)
- [ ] 6. Smoke-test completo (evento Confirmado, cobrança, exclusão bloqueada, coletivo, 3-strikes)
- [ ] 7. Backup do `pb_data` pós-cutover
