# infra/pb_hooks/ — hooks server-side do PocketBase (v3.3)

Hooks em JavaScript (JSVM) que rodam **dentro do processo do PocketBase** na VM.
Entram em cena na **v3.3**, quando o PocketBase passa a ser **master de escrita**
(o Google Sheets deixa de ser). São carregados automaticamente de
`/opt/pocketbase/pb_hooks` (todo arquivo `*.pb.js`) no start do PB.

> PocketBase **0.22.55** (API JSVM pré-0.23): `onRecordBeforeCreateRequest((e)=>{…}, "colecao")`,
> `$app.dao()`, `DynamicModel`. **Não** há `e.next()` nessa versão.

## `auto_id.pb.js` — ID de negócio atômico (gerado)

Para cada coleção com `id_<entidade>` sequencial, se o `create` chegar **sem**
id, o hook atribui `max(id)+1` **no próprio request** do PB. Isso tira a geração
de id do cliente (`pbClientes.js`) e do Apps Script (`proximoId_`), que corriam
risco de corrida. O índice **UNIQUE** de cada coleção é a rede de segurança
contra colisão numa concorrência rara. Se o id vier preenchido (ex.: a cascata
`criarEvento` que faz a `producao` **herdar** o id do evento), o hook respeita.

Coleções cobertas: `eventos`, `pacotes`, `leads`, `financeiro`, `custos`,
`participantes`, `templates`, `freelance_eventos`, `freelance_pagamentos`,
`clientes`. **Fora:** `producao` (id herdado do evento, não é sequência) e
`listas` (sem id de negócio).

### Regerar

Fonte única: `assets/js/pbSchema.js`. Nunca editar o `.pb.js` à mão.

```bash
node infra/gen_pb_hooks.cjs
```

### Aplicar na VM

```bash
# enviar os hooks para a VM
scp -i ~/crm-key.key infra/pb_hooks/*.pb.js opc@163.176.154.238:/tmp/
ssh -i ~/crm-key.key opc@163.176.154.238 \
  'sudo install -o pocketbase -g pocketbase -m 0644 /tmp/auto_id.pb.js /opt/pocketbase/pb_hooks/auto_id.pb.js'

# reiniciar o PocketBase (carrega os hooks no start)
ssh -i ~/crm-key.key opc@163.176.154.238 'sudo systemctl restart pocketbase'
```

> **Seguro de aplicar adiantado:** enquanto `USE_POCKETBASE_ESCRITA` (em
> `config.js`) estiver `false`, as escritas ainda chegam com id preenchido (via
> Apps Script → `sincronizarPB.gs`), então o hook cai no `return` e **não muda
> nada**. Ele só começa a agir quando o front passa a criar sem id (Fase 1+).

### Verificação

Criar dois registros quase simultâneos numa coleção (ex.: dois `leads`) **sem**
id e confirmar que recebem ids sequenciais, sem colisão nem buraco.
