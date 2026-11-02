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

Gera as coleções (padrão PocketBase 0.22.x `Dao`/`Collection`/`SchemaField`):
`eventos`, `pacotes`, `leads`, `financeiro`, `producao`, `custos`,
`participantes`, `templates`, `freelance_eventos`, `freelance_pagamentos`,
`listas`, `produtos`, `orcamentos` (estas duas só existem no PocketBase, sem aba no Sheets), `vitrines`/`vitrine_fotos` (v3.19 Fase 1) e `vitrine_selecoes`/`vitrine_finalizacoes` (v3.19 Fase 2 — seleção de fotos). Cada entidade de negócio tem um `id_<entidade>` numérico com índice
**único** e as 5 regras de acesso `@request.auth.id != ''` — **exceto**
as 4 coleções da Vitrine de Fotos, que declaram `rules` próprias em `pbSchema.js`
(acesso público por token, ver seção "Vitrine de Fotos" abaixo).

> As migrations `1793000302`/`1793000303`/`1793000305` (campos novos de `pacotes`, `leads` e `eventos.id_lead`) são escritas à mão e idempotentes, para quem já tem as coleções criadas. A `1793000305` também preenche `id_lead` nos eventos já gerados por lead "Fechado".

> `clientes` **não** é gerado aqui — já existe na VM desde a v3.1.

### Vitrine de Fotos (v3.19, Fase 1)

Galeria pública por evento com link exclusivo (token+senha+validade), marca
personalizada e duas fontes de imagem: upload direto no PocketBase, ou link
de uma pasta do Google Drive.

- **`vitrines`/`vitrine_fotos`** têm regras de acesso **públicas** (sem login),
  escopadas por `@request.query.token`/`senha_hash` — ver os comentários em
  `assets/js/pbSchema.js`. `vitrine_fotos.id_vitrine` é uma **relation nativa**
  do PocketBase (não o padrão fk=número do resto do app): é o que permite a
  regra pública expandir `id_vitrine.token`/`.status`/`.validade` sem duplicar
  esses campos em cada foto.
- **Upload direto**: usa o campo `file` nativo do PocketBase (com thumbs
  `400x400`/`1600x0`). **Já configurado para gravar no Cloudflare R2** (v3.19.9
  — bucket `cibele-vitrine-fotos`, camada grátis, egress sempre grátis) via
  *PocketBase Admin UI → Settings → Files storage → S3* — as credenciais
  ficam só nas configurações internas do PocketBase na VM, nunca neste
  repositório. Nenhum código muda por causa disso: o SDK do PocketBase já
  abstrai local-disk vs. S3. Se precisar reconfigurar/trocar de bucket, é só
  repetir esse mesmo caminho na Admin UI com as novas credenciais.
- **Modo Google Drive**: não usa conta de serviço/Google Cloud. `vitrine.html`
  chama o **mesmo** `CRM_API_URL` (Apps Script) por GET — ver
  `infra/apps_script/listarFotosVitrine.gs` (cole como um `.gs` a mais no
  projeto existente e reimplante a mesma implantação).
- **Fase 2 — seleção de fotos**: `vitrine_selecoes`/`vitrine_finalizacoes`
  seguem o mesmo padrão de regra pública. O pb_hook
  `infra/pb_hooks/notificar_selecao.pb.js` roda ao criar uma
  `vitrine_finalizacoes` (botão "Finalizar seleção" na vitrine pública):
  marca `vitrines.selecao_finalizada_em`/`qtd_fotos_selecionadas_final`
  (só o servidor grava isso — a regra de escrita da vitrine continua exigindo
  login) e manda um e-mail pra fotógrafa via Resend. **Troque
  `RESEND_API_KEY`/`EMAIL_FOTOGRAFA` só na cópia que roda na VM** — os valores
  no repositório são placeholders (nunca commitar a chave real).
- **Fase 3 — marca d'água**: só modo `upload_proprio` (Drive fica sem, por
  enquanto — Apps Script/PocketBase não compõem imagem). `vitrine_fotos`
  ganhou o campo `preview`: gerado **no navegador da fotógrafa** no upload
  (Canvas 2D, `gerarPreviewComMarcaDagua_` em `pbVitrines.js`), não na tela
  do cliente — por isso não dá pra inspecionar/remover. `vitrine.html` serve
  `preview` (com fallback pro `arquivo` original nas fotos de antes desta
  fase) na grade, no "ampliar" e no "baixar" (decisão consciente: sem uma
  entrega final controlada — Fase 4, ainda não existe — baixar o original
  esvaziaria a marca d'água).
- **Fase 4 — entrega final**: mesma vitrine/link, não uma página separada.
  `vitrines` ganha `entrega_liberada_em` (botão "📦 Liberar entrega" no CRM),
  `entrega_validade`/`entrega_max_downloads` (checados/aplicados no
  navegador, não são regra do PocketBase) e `entrega_downloads_count`
  (espelhado pelo pb_hook `contar_downloads.pb.js` a cada criação em
  `vitrine_downloads` — mesmo padrão "auto-declarado" da seleção: o cliente
  cria o registro ao clicar em baixar, não é um proxy que intercepta o
  arquivo). `vitrine_fotos` ganha `categoria` (álbum opcional) — a entrega
  agrupa por categoria quando há mais de uma. Reaproveita as mesmas fotos já
  na galeria (sem upload separado de versão editada): entrega só as
  selecionadas se o cliente finalizou uma seleção, senão entrega tudo.


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

## `gen_pb_hooks.cjs` — hooks server-side (v3.3)

Lê a **mesma** fonte única `assets/js/pbSchema.js` e gera
`infra/pb_hooks/auto_id.pb.js`: um hook `onRecordBeforeCreateRequest` por
coleção com id de negócio sequencial, que atribui `max(id)+1` **no servidor**
(fim da corrida do `proximoId_`/cliente). Faz parte da **v3.3**, quando o
PocketBase vira master de escrita. Deploy e detalhes em
**`infra/pb_hooks/README.md`**.

```bash
node infra/gen_pb_hooks.cjs
```

> Seguro de aplicar adiantado: enquanto `USE_POCKETBASE_ESCRITA` estiver
> `false`, as escritas ainda chegam com id preenchido e o hook não age.

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

## `vm/RUNBOOK_migracao_arm.md` — migração para ARM Ampere A1

Passo a passo para trocar o shape x86 (~1 GB) pelo **ARM A1 Flex** (Always Free
até 4 OCPU / 24 GB) — o fim **definitivo** das quedas por RAM. A sacada: o IP
`163.176.154.238` é **reservado**, então reatribui-se ao novo host e, como o
`pb_data` carrega o cache do certificado, o ARM sobe com **mesmo domínio e TLS**
— sem tocar no DuckDNS nem no `config.js`. O fallback do front cobre os segundos
do corte. Rollback = reatribuir o IP de volta ao x86.

## Pendências de infra (fora deste commit)

- **Import one-time** dos dados atuais do Sheets: **dispensado** se a planilha
  só tem dados de teste — nesse caso o PB começa vazio e o `sincronizarPB.gs`
  o popula conforme o uso (ou rode `sincronizarPBTudo` para semear o que houver).
- **Cópia off-site** dos backups (hoje ficam só na própria VM) — melhoria futura.
