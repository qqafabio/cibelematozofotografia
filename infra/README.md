# infra/ — PocketBase (réplica de leitura v3.2)

Artefatos de infraestrutura do PocketBase que roda na VM Oracle
(`cibelecrm.duckdns.org`, PocketBase 0.22.55). **Nada aqui roda no
GitHub Pages** — são scripts/migrations aplicados manualmente na VM.

## Arquitetura (v3.2)

O **Google Sheets / Apps Script continua sendo o master de escrita** (gera
IDs e orquestra Agenda, Produção, Financeiro e dedup de clientes). O
**PocketBase é uma réplica de LEITURA rápida**: com a flag
`USE_POCKETBASE_LEITURA` ligada (em `assets/js/config.js`), o
`carregarTudo()` do front monta todo o payload a partir do PB em vez da
chamada lenta ao Apps Script. Rollback = voltar a flag para `false`.

## `gen_pb_migrations.cjs` — gerador de migrations

Lê a **fonte única** `assets/js/pbSchema.js` (o mesmo mapa que o adapter de
leitura `pbLeitura.js` consome) e emite um arquivo de migration por coleção
em `pb_migrations/`. Assim o esquema do PB **não diverge** do que o front lê.

```bash
node infra/gen_pb_migrations.cjs
```

Gera as 11 coleções (padrão PocketBase 0.22.x `Dao`/`Collection`/`SchemaField`):
`eventos`, `pacotes`, `leads`, `financeiro`, `producao`, `custos`,
`participantes`, `templates`, `freelance_eventos`, `freelance_pagamentos`,
`listas`. Cada entidade de negócio tem um `id_<entidade>` numérico com índice
**único** e as 5 regras de acesso `@request.auth.id != ''`.

> `clientes` **não** é gerado aqui — já existe na VM desde a v3.1.

### Aplicar na VM

```bash
# da sua máquina, enviar as migrations para a VM
scp -i ~/crm-key.key infra/pb_migrations/*.js opc@163.176.154.238:/caminho/pb_migrations/

# na VM, reiniciar o PocketBase (as migrations rodam no startup)
sudo systemctl restart pocketbase
```

Se precisar reverter uma coleção, cada migration tem o `down` que faz
`deleteCollection`.

## `gen_gas_sync.cjs` — espelhamento Sheets → PocketBase

Lê a **mesma** fonte única `assets/js/pbSchema.js` (+ o mapa de `clientes`) e
gera `infra/apps_script/sincronizarPB.gs`: o módulo do Apps Script que espelha
cada aba na coleção correspondente do PB a cada mutação (upsert + reconcile),
mantendo o PB como **réplica de leitura**. O Sheets segue master de escrita.

```bash
node infra/gen_gas_sync.cjs
```

Passo a passo de instalação (colar o `.gs`, Script Properties, gatilho no
`doPost`, seed com `sincronizarPBTudo`) em **`infra/apps_script/README.md`**.

## `vm/backup_pbdata.sh` — backup diário do pb_data

Instalado na VM em `/opt/pocketbase/backup_pbdata.sh` e disparado pelo cron
`/etc/cron.d/pocketbase-backup` (diário às **03:17 GMT**, como root). Faz `tar`
do `pb_data` em `/opt/pocketbase/backups/pb_data_<stamp>.tgz` e remove backups
com mais de **14 dias**. Mantém a réplica recuperável; o Sheets segue master.

```bash
# instalar/atualizar na VM
scp -i ~/crm-key.key infra/vm/backup_pbdata.sh opc@163.176.154.238:/tmp/
ssh -i ~/crm-key.key opc@163.176.154.238 \
  'sudo install -o root -g root -m 0755 /tmp/backup_pbdata.sh /opt/pocketbase/backup_pbdata.sh'
# rodar sob demanda
ssh -i ~/crm-key.key opc@163.176.154.238 'sudo /opt/pocketbase/backup_pbdata.sh'
```

## `vm/99-pocketbase-lowmem.conf` — tuning de baixa RAM

A VM é uma x86 E2.1.Micro (~0,5 GB). Quando a RAM enche (picos dos próprios
agentes da Oracle), ela entra em *thrash* e o **sshd é o primeiro a sufocar**
("banner exchange timeout"), exigindo reboot pelo Console. Este arquivo
(instalado em `/etc/sysctl.d/99-pocketbase-lowmem.conf`) faz o kernel paginar
**proativamente** (`vm.swappiness=100`), reclamar cache mais rápido
(`vm.vfs_cache_pressure=150`) e manter folga mínima de RAM livre
(`vm.min_free_kbytes`). Também desligamos o `tuned` (daemon dispensável na
micro, ~19 MB). Não houve OOM matando o PocketBase — o PB usa só ~10 MB; o
problema era pressão de RAM geral derrubando a rede.

```bash
scp -i ~/crm-key.key infra/vm/99-pocketbase-lowmem.conf opc@163.176.154.238:/tmp/
ssh -i ~/crm-key.key opc@163.176.154.238 \
  'sudo install -o root -g root -m 0644 /tmp/99-pocketbase-lowmem.conf \
     /etc/sysctl.d/99-pocketbase-lowmem.conf && sudo sysctl --system >/dev/null \
   && sudo systemctl disable --now tuned'
```

## `vm/zram-swap.service` — swap comprimido em RAM (anti-thrash)

Mesmo com o tuning acima, a VM ainda travava quando o kernel paginava para o
swap **em disco** (I/O lento → *thrash* → sshd/PocketBase sufocam). O
`zram-swap.service` cria um bloco de swap na própria RAM, comprimido com
**zstd (~3:1)**, com **prioridade acima** dos swapfiles de disco — as páginas
vão primeiro para o zram (rápido) e só transbordam para o disco em último
caso. **É a mitigação que de fato corta as quedas** no shape x86. Instalado em
`/etc/systemd/system/zram-swap.service` (+ `/etc/modules-load.d/zram.conf`),
habilitado no boot. Confira com `swapon --show` (zram0 deve ter PRIO 100).
O fim **definitivo** das quedas é migrar para o shape ARM Ampere A1 (Always
Free dá até 24 GB de RAM).

## Pendências de infra (fora deste commit)

- **Import one-time** dos dados atuais do Sheets: **dispensado** se a planilha
  só tem dados de teste — nesse caso o PB começa vazio e o `sincronizarPB.gs`
  o popula conforme o uso (ou rode `sincronizarPBTudo` para semear o que houver).
- **Cópia off-site** dos backups (hoje ficam só na própria VM) — melhoria futura.
