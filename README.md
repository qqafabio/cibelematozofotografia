# Cibele Matozo Fotografia

Duas ferramentas independentes da Cibele Matozo Fotografia, hospedadas de graça no GitHub Pages:

| Ferramenta | Arquivo(s) | Back-end |
|---|---|---|
| **Contrato Digital** — formulário que o cliente preenche (dados, pacote, cálculo automático, contrato e assinatura) | `index.html` (público) + `gerador-de-link.html` (uso interno, cria o link personalizado por cliente) | Apps Script próprio (existe só no editor do Apps Script — não fica neste repositório) |
| **CRM** — leads, clientes, eventos, agenda, orçamentos, financeiro, cobranças, produção, custos e freelance | `crm.html` + `assets/` | PocketBase (leitura e escrita) + Apps Script enxuto para a Google Agenda |

> 📋 **Histórico de versões:** veja o [RELEASE_NOTES.md](./RELEASE_NOTES.md). Toda versão implantada deve ser registrada lá — este README descreve só o estado atual do projeto.

## Tecnologias

- **Front-end:** HTML + CSS + JavaScript puro (sem framework e sem build), servido pelo GitHub Pages.
  Bibliotecas por CDN: Bootstrap 5.3 + Bootstrap Icons, ApexCharts (gráficos), SweetAlert2 (confirmações), flatpickr (datas e horas) e PocketBase JS SDK.
- **Contrato Digital:** Google Apps Script + Google Sheets + Google Drive (PDF) + Gmail.
- **CRM — dados:** PocketBase 0.22 (VM Oracle, `cibelecrm.duckdns.org`) como master de leitura e escrita; Google Sheets mantido como espelho/legado.
- **CRM — Google Agenda:** Apps Script enxuto (`agendaSincronizarEvento`, `agendaSincronizarEntrega`, `agendaExcluir`).
- **Infra:** scripts, migrations e hooks do PocketBase em [`infra/`](./infra/README.md).

## Estrutura do repositório

```
index.html               Contrato Digital (público)
gerador-de-link.html     gerador de link personalizado (interno)
crm.html                 esqueleto do CRM: <head>, <body> e tags de carregamento
assets/css/crm.css       estilo do CRM
assets/js/
  config.js              URLs da API e flags (USE_POCKETBASE_*)
  state.js, api.js       estado global e apiCall (roteia PocketBase / Apps Script)
  ui.js, router.js       helpers de UI, navegação e roteador de views
  pb*.js                 adapters PocketBase (schema, leitura, escrita, agenda)
  modules/               uma tela por arquivo (dashboard, clientes, eventos, financeiro, ...)
  main.js                inicialização (carrega por último)
docs/                    documentação do módulo de Cobranças
infra/                   PocketBase: migrations, hooks, backup e runbooks (aplicados na VM)
backend.txt              cópia local (não versionada) do Código.gs do CRM
```

> ⚠️ **Não converter os scripts do CRM para ES Modules.** Eles são carregados como `<script>` clássicos, compartilhando um único escopo global — é isso que mantém os `onclick` inline funcionando. A ordem de carregamento no `crm.html` importa (estado primeiro, `main.js` por último).

## Módulos do CRM

Lead → Cliente → Evento (individual ou coletivo, com sincronização na Google Agenda) → Orçamento → Financeiro (entrada + parcelas) → Cobranças → Produção → Custos, além do menu de **Freelance** (serviços prestados a outra empresa de foto e vídeo), **Pacotes**, **Templates** de mensagem e **Dashboard**.

Regras de exclusão que protegem o rastro financeiro:
- **Cliente:** só pode ser excluído se não houver evento vinculado.
- **Evento / conta do Financeiro:** bloqueado se houver "Valor pago" lançado (a exclusão forçada, com segunda confirmação, existe para limpar dados de teste).
- Excluir um evento remove em cascata a agenda, a produção, os custos e as parcelas dele.

## Configuração

### Contrato Digital

1. No [script.google.com](https://script.google.com), crie um projeto, cole o `Code.gs` e preencha `PLANILHA_ID`, `PASTA_DRIVE_ID` e `EMAIL_CIBELE` no topo.
2. **Implantar → Nova implantação → App da Web** (executar como **Eu**, acesso **Qualquer pessoa**) e copie a URL `.../exec`.
3. No `index.html`, troque `APPS_SCRIPT_EXEC_URL` por essa URL.
4. Publique pelo GitHub Pages (branch `main`, pasta `/root`). A URL do GitHub Pages — não a do Apps Script — é a que vai para o cliente e para o campo "Link da página do contrato" do `gerador-de-link.html`.
5. Teste de ponta a ponta: a linha aparece na planilha, o PDF cai no Drive e os e-mails chegam. Se o envio falhar com erro de **CORS** no console, confira a URL (sem espaços) e o acesso "Qualquer pessoa".

### CRM

1. Configure o PocketBase na VM seguindo [`infra/README.md`](./infra/README.md) (migrations, hooks, backup).
2. Em `assets/js/config.js`, ajuste `PB_URL`, `CRM_API_URL` (Apps Script da Agenda) e as flags `USE_POCKETBASE_LEITURA` / `USE_POCKETBASE_ESCRITA`. Voltar uma flag para `false` é o rollback.
3. Publique o `crm.html` e a pasta `assets/` no GitHub Pages.

Para o Apps Script do CRM: cole o `backend.txt` no `Código.gs`, implante como **App da Web** (executar como **Eu**, acesso **Qualquer pessoa**) e use a URL `.../exec` em `CRM_API_URL`. As funções de planilha casam os dados pelo **nome exato do cabeçalho** de cada aba.

## Atualizando depois de publicado

- **Front-end** (`index.html`, `crm.html`, `assets/**`): edite e suba no GitHub — vale na hora. Incremente o sufixo `?v=` das tags em mudanças grandes para furar o cache.
- **Back-end Apps Script** (`Code.gs` / `backend.txt`): cole no editor do Apps Script e crie uma **Nova implantação**. Sem isso, a versão antiga continua rodando.
- Valide a sintaxe do JS antes de publicar: `node --check assets/js/**/*.js`.

## Como registrar uma nova versão

1. Adicione uma entrada **no topo** do índice e da lista do [RELEASE_NOTES.md](./RELEASE_NOTES.md) (versão, data, o que mudou, se exige reimplantar o Apps Script ou aplicar migrations).
2. Mantenha o README apenas com o estado atual — nada de detalhes por versão aqui.

## Documentação adicional

- [RELEASE_NOTES.md](./RELEASE_NOTES.md) — histórico de versões
- [docs/MODULO_COBRANCA.md](./docs/MODULO_COBRANCA.md) e [docs/API_COBRANCAS.md](./docs/API_COBRANCAS.md) — módulo de Cobranças
- [infra/README.md](./infra/README.md) — PocketBase (migrations, hooks, VM, backup)

## Limites gratuitos

Contas Gmail pessoais têm limite de referência de **100 e-mails/dia** no Apps Script (Workspace é bem maior), e o Apps Script limita execuções simultâneas por script. GitHub Pages é gratuito para repositórios públicos. Para o volume de uma fotógrafa de eventos, é mais do que suficiente.

## Personalizando

- **Contrato Digital:** cores e fontes nas variáveis `:root` do `<style>` do `index.html`; cláusulas em `buildClauses()`; preços e pacotes no objeto `PACOTES`.
- **CRM:** variáveis `:root` em `assets/css/crm.css`.
- **Assinatura eletrônica:** o Contrato Digital oferece assinatura por desenho e aceite por nome digitado. Uma plataforma paga (Clicksign, D4Sign etc.) poderia entrar como terceira aba, mas envolve custo por assinatura.

## Licença

[MIT](./LICENSE)
