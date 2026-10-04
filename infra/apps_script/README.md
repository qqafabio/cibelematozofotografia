# infra/apps_script/ — Espelhamento Sheets → PocketBase (v3.2)

`sincronizarPB.gs` é **gerado** por `infra/gen_gas_sync.cjs` a partir de
`assets/js/pbSchema.js` (fonte única). Ele mantém o PocketBase como
**réplica de leitura**: a cada mutação no Sheets, espelha a(s) entidade(s)
afetada(s) no PB (upsert + reconcile de deletes). O **Sheets segue master
de escrita** — se o PB estiver fora, a mutação não quebra (fail-soft).

> Regerar depois de mudar o esquema: `node infra/gen_gas_sync.cjs`.

## Passo a passo (editor do Apps Script do CRM)

### 1) Colar o módulo
Crie um arquivo novo (ex.: `sincronizarPB.gs`) e cole todo o conteúdo de
`infra/apps_script/sincronizarPB.gs`.

### 2) Configurar as credenciais (Script Properties — nunca no código)
Projeto → ⚙️ **Configurações do projeto** → **Propriedades do script** →
adicionar:

| Propriedade | Valor |
| --- | --- |
| `PB_URL` | `https://cibelecrm.duckdns.org` |
| `PB_SYNC_EMAIL` | `app@cibelecrm.duckdns.org` (usuário de app do PB) |
| `PB_SYNC_PASSWORD` | a senha desse usuário |

A senha **não** vai para o repositório — fica só aqui.

### 3) Ligar o gatilho no `doPost`
No `doPost`, **logo antes** de `return jsonOutput_({ ok: true, dados: resultado });`,
acrescente a linha (fail-soft — nunca derruba a mutação):

```js
    try { sincronizarPBPorAcao_(acao); } catch (e) { console.error('sincronizarPB: ' + e); }
    return jsonOutput_({ ok: true, dados: resultado });
```

`sincronizarPBPorAcao_` consulta `PB_SYNC_ACOES` e só sincroniza em ações de
mutação (listagens não fazem nada).

### 4) Semear o PB (uma vez)
Com as coleções já criadas na VM (migrations aplicadas) e o PB vazio, rode
**`sincronizarPBTudo`** pelo menu **Executar** do editor. Autorize os escopos
na primeira execução. Ele reconcilia **todas** as entidades + a aba `Listas`.
Erros aparecem no log de execução.

### 5) Cutover no front
Depois que o seed rodar e as telas conferirem, em `assets/js/config.js`:
ligar `USE_POCKETBASE_LEITURA = true` e desligar `USE_POCKETBASE_CLIENTES`
(as escritas de cliente voltam ao Apps Script, como as demais).

## Notas

- **Permissões:** as coleções usam a regra `@request.auth.id != ''`; o
  usuário de app autenticado pode fazer create/update/delete. Convidado
  (sem login) só enxerga lista vazia.
- **IDs de negócio** (`id_evento`, `id_parcela`, …) são a chave do espelho.
  O Sheets continua dono da geração desses IDs.
- **Listas:** a aba é orientada a coluna (cabeçalho = `campo`); o sync
  "derrete" em registros `{ campo, valor, ordem }`, que é como o
  `pbLeitura.js` remonta os menus no front.
- **Custo/quota:** cada sync faz 1 leitura por coleção afetada + as escritas
  necessárias (só o que mudou). Para o volume do CRM, fica folgado nos
  limites de `UrlFetchApp` do Apps Script.
