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

## Pendências de infra (fora deste commit)

- **Import one-time** dos dados atuais do Sheets preservando os IDs de
  negócio (dump do `carregarTudo` no console → migrations de import).
- **Backup automático** do `pb_data` (cron diário com `tar` + retenção).
- **`sincronizarPB_()`** no Apps Script: upsert + reconcile no PB ao fim de
  cada mutação (mantém PB == Sheets). Credenciais do usuário de serviço nas
  **Script Properties**, nunca no repositório.
