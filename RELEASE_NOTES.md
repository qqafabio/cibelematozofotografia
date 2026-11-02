# Release Notes — Cibele Matozo Fotografia

Histórico de versões do projeto. Para a visão geral, tecnologias e configuração, veja o [README](./README.md).

## Como alimentar este arquivo

A cada versão implantada:

1. Acrescente uma linha **no topo** da tabela "Versões" abaixo (versão, data, resumo, ação de deploy).
2. Acrescente a seção detalhada da versão (o que mudou, arquivos tocados, e se exige reimplantar o `Código.gs` ou aplicar migrations).
3. Não replique o detalhe no README.

> A numeração das seções (2.5, 2.6, ...) é histórica — foi preservada do antigo README para manter as referências cruzadas do texto. As seções abaixo estão em ordem cronológica (mais antiga primeiro); use a tabela para navegar pelas mais recentes. Existem duas trilhas de versão: **front-end** (v2.x → v3.15, que também é o sufixo `?v=` dos assets) e **PocketBase/back-end** (v3.1 → v3.5, rótulos dos commits).

## Versões

| Versão | Data | Resumo | Seção |
|---|---|---|---|
| v3.20 | 2026-11-02 | Orçamento passa a aceitar mais de um pacote por lead (o cliente escolhe qual fechar) | [2.38](#238-orçamento-com-múltiplos-pacotes-v320) |
| v3.20.4 | 2026-11-02 | Vitrine de Fotos: bloqueia baixar/ver em tela cheia foto por foto enquanto a marca d'água do Drive ainda não foi aplicada | [2.39](#239-vitrine-de-fotos--marca-dágua-opcional-v3201) |
| v3.20.3 | 2026-11-02 | Vitrine de Fotos: corrige marca d'água do Google Drive que não aparecia (erro de CORS no redirect do Drive) | [2.39](#239-vitrine-de-fotos--marca-dágua-opcional-v3201) |
| v3.20.2 | 2026-11-02 | Vitrine de Fotos: upload direto só gera a versão com marca d'água se o switch estiver ligado naquele momento | [2.39](#239-vitrine-de-fotos--marca-dágua-opcional-v3201) |
| v3.20.1 | 2026-11-02 | Vitrine de Fotos: marca d'água vira opcional por vitrine (upload direto e Google Drive) | [2.39](#239-vitrine-de-fotos--marca-dágua-opcional-v3201) |
| v3.19.14 | 2026-11-02 | Vitrine de Fotos: logo aumentada de novo e centralizada no header em mobile | [2.37](#237-vitrine-de-fotos--fase-4-entrega-final-v319-fase-4) |
| v3.19.13 | 2026-11-02 | Vitrine de Fotos: logo real da fotógrafa aplicada no header (link do Drive) e aumentada de tamanho | [2.37](#237-vitrine-de-fotos--fase-4-entrega-final-v319-fase-4) |
| v3.19.9 | 2026-11-02 | Vitrine de Fotos: upload direto passa a gravar no Cloudflare R2 (configuração de infra, sem mudança de código) | [2.37](#237-vitrine-de-fotos--fase-4-entrega-final-v319-fase-4) |
| v3.19 Fase 4 | 2026-11-02 | Vitrine de Fotos — entrega final (alta resolução sem marca d'água, álbuns por categoria, validade e limite de downloads próprios) — ⚠️ migrations + pb_hook | [2.37](#237-vitrine-de-fotos--fase-4-entrega-final-v319-fase-4) |
| v3.19 Fase 3 | 2026-11-02 | Vitrine de Fotos — marca d'água automática no upload direto (gerada no navegador da fotógrafa, não dá pra burlar na tela do cliente) — ⚠️ migration | [2.36](#236-vitrine-de-fotos--fase-3-marca-dágua-automática-v319-fase-3) |
| v3.19 Fase 2 | 2026-11-02 | Vitrine de Fotos — seleção de fotos pelo cliente (limite do pacote, avisa mas permite passar), botão "Finalizar seleção" e aviso por e-mail (Resend) — ⚠️ migrations + pb_hook | [2.35](#235-vitrine-de-fotos--fase-2-seleção-de-fotos-v319-fase-2) |
| v3.19 | 2026-11-01 | Vitrine de Fotos — Fase 1: galeria pública por evento (link+senha+validade, tema/marca, upload direto ou link do Drive) — ⚠️ migrations + reimplantar Apps Script | [2.34](#234-vitrine-de-fotos--fase-1-v319) |
| v3.18.8 | 2026-10-29 | Produção: nova opção "Não se aplica" nas etapas Backup, Seleção, Edição foto, Edição vídeo, Álbum e Aprovação do cliente | [2.33](#233-orçamento-em-pdf-produtos-formulário-de-lead-e-agenda-do-próximo-contato-v318) |
| v3.18.7 | 2026-10-29 | Produção: a lista passa a mostrar "Edição foto" e "Edição vídeo" em colunas separadas (antes só aparecia a foto) | [2.33](#233-orçamento-em-pdf-produtos-formulário-de-lead-e-agenda-do-próximo-contato-v318) |
| v3.18.6 | 2026-10-26 | Contas a receber: o status "Pago" vira "Recebido" (Financeiro, abas do evento, coletivo, Agenda e mensagens) — ⚠️ migration `1793000306` | [2.33](#233-orçamento-em-pdf-produtos-formulário-de-lead-e-agenda-do-próximo-contato-v318) |
| v3.18.4 | 2026-10-20 | Correção: lead "Fechado" passa a lançar a conta pendente no Financeiro e a conta do evento individual volta a aparecer na aba Financeiro do evento — sem mudança de dados | [2.33](#233-orçamento-em-pdf-produtos-formulário-de-lead-e-agenda-do-próximo-contato-v318)
| v3.18.3 | 2026-10-16 | Histórico de orçamentos responsivo no mobile e envio do PDF pelo WhatsApp via compartilhamento nativo (fallback: baixa o PDF e abre o `wa.me`) | [2.33](#233-orçamento-em-pdf-produtos-formulário-de-lead-e-agenda-do-próximo-contato-v318) |
| v3.18.2 | 2026-10-16 | Correção: "Failed to create record" ao gerar orçamento — id de negócio deixa de ser obrigatório no PocketBase (o hook atribui) — ⚠️ migration `1793000304` | [2.33](#233-orçamento-em-pdf-produtos-formulário-de-lead-e-agenda-do-próximo-contato-v318) |
| v3.18.1 | 2026-10-16 | Correção: checkboxes de tipos de evento (Pacotes/Produtos) e itens inclusos editáveis por lead no orçamento — sem mudança de dados | [2.33](#233-orçamento-em-pdf-produtos-formulário-de-lead-e-agenda-do-próximo-contato-v318) |
| v3.18 | 2026-10-16 | Orçamento em PDF por lead (versionado), cadastro de Produtos, formulário de lead em tela cheia e lembrete de "Próximo contato" na Agenda — ⚠️ migrations + reimplantar Apps Script | [2.33](#233-orçamento-em-pdf-produtos-formulário-de-lead-e-agenda-do-próximo-contato-v318) |
| v3.17 | 2026-10-15 | Contrato Digital — qualificação da CONTRATADA com CNPJ (MEI), nome empresarial e endereço comercial | [2.32](#232-contrato-digital--qualificação-da-contratada-com-cnpj-mei-v317) |
| v3.16 | 2026-10-13 | Seletor de data e hora (flatpickr) em todo o CRM — sem mudança de dados | [2.31](#231-seletor-de-data-e-hora-com-flatpickr-v316) |
| v3.5 (PB) | 2026-10-09 | Análise e Cobranças instantâneas — cálculo local do snapshot PocketBase | [2.30](#230-análise-e-cobranças-instantâneas--cálculo-local-do-snapshot-pocketbase-v35) |
| v3.4 (PB) | 2026-10-09 | Mensagens do sistema (SweetAlert2) + loading por view e nas escritas | [2.29](#229-mensagens-do-sistema-sweetalert2--loading-por-view-e-nas-escritas-v34) |
| v3.3 (PB) | 2026-10-09 | PocketBase vira master de **escrita** (Fases 0–4, cutover) — ⚠️ migrations/hooks + reimplantar Apps Script | [2.28](#228-pocketbase-vira-master-de-escrita-track-v33--fases-0--1--2--3--4) |
| v3.15 | 2026-10-08 | Padronização da linha das listas + coluna "Ações" nos 6 menus | [2.27](#227-padronização-da-linha-das-listas--coluna-ações-nos-6-menus-v315) |
| v3.14 | 2026-10-08 | Sidebar — hierarquia dos itens dentro dos grupos | [2.26](#226-sidebar--hierarquia-dos-itens-dentro-dos-grupos-v314) |
| v3.13 | 2026-10-07 | Detalhe do evento — anotações editáveis no lugar e fundo dos cards | [2.25](#225-detalhe-do-evento--anotações-editáveis-no-lugar-e-fundo-dos-cards-v313) |
| v3.12 | 2026-10-07 | Atalho de WhatsApp no telefone do cliente | [2.24](#224-atalho-de-whatsapp-no-telefone-do-cliente-v312) |
| v3.11 | 2026-10-07 | Sidebar em accordion + "Gerador de link" no menu | [2.23](#223-sidebar-em-accordion--gerador-de-link-no-menu-v311--fase-4-do-overhaul) |
| v3.10 | 2026-10-07 | Eventos — lista com ações/paginação + detalhe com 6 abas | [2.22](#222-eventos--lista-com-açõespaginação--detalhe-com-6-abas-v310--fase-3-do-overhaul) |
| v3.9 | 2026-10-07 | Clientes — status, ações, edição inline e paginação | [2.21](#221-clientes--status-ações-olholápis-edição-inline-e-paginação-v39--fase-2-do-overhaul) |
| v3.8 | 2026-10-07 | Dashboard — ícones, filtro de período e cards redesenhados | [2.20](#220-dashboard--ícones-filtro-de-período-e-cards-redesenhados-v38--fase-1-do-overhaul) |
| v3.7 | 2026-10-07 | Gráficos no Dashboard (ApexCharts) | [2.19](#219-gráficos-no-dashboard-v37) |
| v3.6 | 2026-10-07 | Refino visual das telas antigas (Fase 3) | [2.18](#218-refino-visual-das-telas-antigas-v36--fase-3) |
| v3.5 | 2026-10-07 | Eventos — lista com busca/filtro + detalhe com abas (Fase 2) | [2.17](#217-eventos--lista-com-buscafiltro--tela-de-detalhe-com-abas-v35--fase-2) |
| v3.4 | 2026-10-07 | Redesign do layout — Bootstrap + topbar + Dashboard + mobile (Fase 1) | [2.16](#216-redesign-do-layout--base-bootstrap--topbar--dashboard--mobile-v34--fase-1) |
| v3.3 | 2026-10-07 | Botão "Emitir NFS-e" na Produção + sidebar agrupada | [2.15](#215-botão-emitir-nfs-e-na-produção--sidebar-agrupada-v33) |
| v3.2 (PB) | 2026-10-04 | Leitura total no PocketBase (réplica de leitura) | [2.14](#214-leitura-total-no-pocketbase-v32--réplica-de-leitura) |
| v3.1 (PB) | 2026-10-03 | POC PocketBase — só a tela de Clientes | [2.13](#213-poc-pocketbase--só-a-tela-de-clientes-v31) |
| v3.0 | 2026-10-02 | Refino visual do CRM (frontend) | [2.12](#212-refino-visual-do-crm-v30--frontend) |
| v2.9 | 2026-10-02 | Desconto (R$) + valor foto extra por evento + reaplicar valores | [2.11](#211-desconto-r--valor-foto-extra-por-evento--reaplicar-valores-v29) |
| v2.8 / 2.8.1 / 2.8.2 | 2026-09-30 | Eventos Coletivos + Participantes | [2.10](#210-eventos-coletivos--participantes-v28--fase-2) |
| v2.7 | 2026-09-30 | Cadastro de Pacotes | [2.9](#29-cadastro-de-pacotes-v27--fase-1) |
| v2.6 / 2.6.1 / 2.6.2 | 2026-09-29 | Front dividido em CSS + módulos JS; correção de contas vencidas e do botão "Copiar" | [2.7](#27-arquitetura-do-front-v26--sanitização) |
| v2.4 | 2026-09-28/29 | Módulo de Cobranças, visualização mobile e templates de cobrança | [2.1](#v24--módulo-de-cobranças) |

---

## v2.4 — Módulo de Cobranças

Módulo completo (✅):
- Tela "📧 Cobranças" com lista de contas em atraso + filtros e paginação (Task 1.1-1.4)
- 3 templates de mensagem padrão (LEVE, MÉDIA, PESADA) com tom pessoal de estúdio + gerenciamento de templates customizados (Task 1.5)
- Copiar mensagem para WhatsApp (envio manual) com preenchimento dinâmico
- Registro de tentativas de cobrança + bloqueio automático após 3 tentativas
- Modal flutuante com drag & drop para composição de mensagens (Task 2.1)
- Dashboard executivo com KPIs, distribuição de tentativas e classificação de urgência (Task 2.2)
- Exportação estruturada de relatório em CSV com filtros avançados (Task 2.3)
- 14 endpoints de API para integração completa

### 2.5 Visualização mobile (v2.4)

O CRM tem um breakpoint responsivo em `max-width: 768px`, ativado automaticamente ao abrir em celular:

- **Navegação:** a sidebar fixa vira um menu gaveta — um botão ☰ na barra superior abre/fecha a sidebar como uma gaveta deslizante, com um fundo escurecido por trás; a gaveta fecha sozinha ao selecionar um módulo.
- **Tabelas:** as listas (Clientes, Eventos, Leads, Financeiro, Produção, Custos, Freelance etc.) deixam de mostrar colunas lado a lado e passam a exibir cada linha como um cartão, com cada coluna empilhada em formato rótulo/valor.
- **Formulários:** os campos que ficavam em 2-3 colunas (`.row2`/`.row3`) passam a uma coluna só, e o painel de edição ocupa a tela inteira (em vez de um modal pequeno centralizado), facilitando preencher formulários longos (Eventos, Produção, Freelance) pelo celular.

### 2.6 Templates de cobrança (v2.4)

Os 3 templates padrão foram reescritos para o tom de um estúdio de fotografia — pessoal e caloroso, com firmeza gradual (não corporativo/bancário):

- **LEVE** — lembrete gentil, presume esquecimento e já oferece o PIX.
- **MÉDIA** — follow-up que oferece solução concreta (parcelar/renegociar).
- **PESADA** — aviso formal com prazo de 5 dias úteis e referência ao contrato (sem ameaças agressivas).

Todo template (padrão ou customizado) precisa conter as 4 variáveis obrigatórias: `{{cliente}}`, `{{valor}}`, `{{diasAtraso}}`, `{{vencimento}}` — validadas no back-end em `criarTemplate`/`atualizarTemplate`.

> **Atenção ao aplicar os textos novos:** `_obterTemplatesPadroes_()` só é usado por `listarTemplates()` quando a aba **`Templates` ainda não existe** na planilha. Se a aba já foi criada com os textos antigos, os novos padrões não sobrescrevem automaticamente — nesse caso, edite os 3 direto pela tela "⚙️ Templates" ou apague/recrie a aba.

**Correção (bug):** `criarTemplate` tinha um erro de digitação no nome da variável de validação (`variavelisObritorias`/`variavelisAusentes` na declaração vs. `variaveis...` no uso), que causava `ReferenceError: variaveisObritorias is not defined` ao salvar um novo template. Corrigido; `atualizarTemplate` já estava correta.

Nenhuma mudança de back-end foi necessária — é só CSS/JS no `crm.html`.

### 2.7 Arquitetura do front (v2.6 — sanitização)

O `crm.html` era um único arquivo de ~2.200 linhas (CSS + ~2.000 linhas de JS). Na v2.6 ele foi **dividido em arquivos pequenos por responsabilidade**, sem alterar o comportamento e sem introduzir passo de build (o deploy continua sendo arquivos estáticos no GitHub Pages):

```
crm.html                 esqueleto: <head>, <body> e as tags de carregamento
assets/css/crm.css       todo o estilo (antigo bloco <style>)
assets/js/
  config.js              CRM_API_URL + NAV
  state.js               estado global (clientes, eventos, contasEmAtraso, ...)
  api.js                 apiCall (Facade) + carregarTudo
  ui.js                  janela flutuante, toast, overlay, helpers (esc, máscaras, formatBRL...)
  router.js              renderNav + renderMain (roteador de views) + navegação mobile
  main.js                inicialização (carrega por último)
  modules/               um arquivo por tela: dashboard, clientes, eventos,
                         eventosColetivos, pacotes, leads, financeiro, cobrancas,
                         producao, custos, freelance, templates, mensagens
```

> ⚠️ **Importante — não converter para ES Modules.** Os arquivos são carregados como
> `<script>` **clássicos**, que compartilham um único escopo global. É isso que mantém
> as funções e o estado acessíveis entre arquivos e faz os `onclick` inline (dentro das
> template strings) continuarem funcionando. A **ordem de carregamento** no `crm.html`
> importa: dados/estado primeiro, `main.js` por último. Usar `type="module"`,
> `import`/`export` quebraria os handlers inline e as referências globais.

Ao mexer no JS, valide a sintaxe de cada arquivo antes de publicar: `node --check assets/js/**/*.js`.

### 2.7.1 Correções e lembrete de cobrança (v2.6.1 / v2.6.2)

**Bug — contas vencidas não apareciam.** `listarContasEmAtraso` (e as funções que dependem dela: `listarContasEmAtrasoComFiltros`, `resumoCobrancas`, `relatorioCobrancas`) liam a coluna inexistente `'Valor'` — o nome real na aba Financeiro é **`'Valor previsto'`** — e interpretavam o vencimento com `new Date('DD/MM/AAAA')`, que retorna *Invalid Date* no Apps Script. Com isso, nenhuma parcela qualificava como em atraso: **Cobranças** ficava vazio, **Análise** zerada e o **CSV** sem linhas. Corrigido para `'Valor previsto'` + `parseDataBR_`; a regra de atraso passou a ser autossuficiente (vencimento no passado + saldo em aberto + status ≠ 'Pago'), sem depender do status 'Vencida' já ter sido persistido. Os mesmos usos de `'Valor'` no front (`cobrancas.js`, `mensagens.js`) foram corrigidos — antes exibiam R$ 0,00 e mandavam `{{valor}}` zerado na mensagem. (⚠️ como isso mexe no back-end, é preciso **reimplantar** o `Código.gs`.)

**Novo — lembrete automático de vencidas.** Ao carregar o CRM, se houver contas em atraso, abre uma modal-lembrete (`alertaCobrancasVencidas()` em `modules/cobrancas.js`, disparada por `main.js` após o `carregarTudo`) com a quantidade, o total em aberto, as 5 mais atrasadas e um botão "📧 Ver Cobranças". Aparece **uma vez por carregamento** (a cada refresh) e não reaparece ao navegar entre menus.

**Bug — botão "Copiar" não abria a modal de templates (v2.6.2).** `abrirCopiadorMensagem`/`abrirCopiadorMensagemFlutuante` (em `modules/mensagens.js`) liam os templates com chaves **minúsculas** (`tpl.corpo`, `tpl.nome`, `tpl.id`), mas o contrato de dados é **maiúsculo** em todo o resto (a aba `Templates`, `_obterTemplatesPadroes_()` e a tela `modules/templates.js` usam `tpl['Corpo']`, `tpl['Nome']`, `tpl['ID']`). Com isso `tpl['Corpo']` vinha `undefined` e `preencherTemplate(undefined)` estourava um `TypeError` — a modal nunca abria (o modal de cópia, na prática, nunca funcionou; não era regressão do refactor). Alinhado ao contrato maiúsculo. Além disso, o `catch` chamava `mostrarErro('modalErr', …)` num elemento inexistente, mascarando o erro real; trocado por `showToast`, e `mostrarErro` passou a ser tolerante a elemento ausente. Correção **só de front** (não precisa reimplantar o back-end).

### 2.9 Cadastro de Pacotes (v2.7 — Fase 1)

Antes, "Pacote" era apenas um texto solto na aba `Listas` (sem valor). Na v2.7 os pacotes
viraram **entidade própria**, com valor estruturado — base para os eventos coletivos (Fase 2).

- **Nova tela "Pacotes"** (menu após Eventos), com CRUD completo (`assets/js/modules/pacotes.js`,
  no molde de `modules/templates.js`). Campos: **Nome**, **Descrição**, **Valor pacote**,
  **Qtd fotos incluídas** e **Valor foto extra**.
- **Back-end:** nova aba `Pacotes` (colunas `ID`, `Nome`, `Descrição`, `Valor pacote`,
  `Qtd fotos incluídas`, `Valor foto extra`, `Data criação`, `Data atualização`) e as actions
  `listarPacotes` / `criarPacote` / `atualizarPacote` / `deletarPacote`. `carregarTudo` passou
  a devolver `pacotes`. Na primeira carga, `garantirAbaPacotes_` **cria a aba e semeia** os
  nomes que já existiam na lista `Pacote` (com valor 0, a preencher) — sem recadastro manual.
- **Integração do campo "Pacote"** (Eventos e Leads): o `<select>` agora lê do cadastro de
  Pacotes em vez da lista de texto, e ao escolher um pacote o valor é **autopreenchido** a
  partir do "Valor pacote" do cadastro (`opcoesPacotes` / `vincularAutoValorPacote` em
  `modules/pacotes.js`). Em **Eventos**, preenche o campo "Valor pacote" (sempre reflete a
  escolha); em **Leads**, preenche "Valor estimado" apenas quando estiver vazio (não
  sobrescreve um valor digitado à mão). Se ainda não houver pacotes cadastrados, o campo cai
  no fallback da lista antiga, sem quebrar os formulários.

> ⚠️ Esta fase mexe no back-end (`backend.txt`) — é preciso **reimplantar** o `Código.gs`
> (Nova implantação) para a aba `Pacotes` e as novas actions passarem a existir.

### 2.10 Eventos Coletivos + Participantes (v2.8 — Fase 2)

Alguns eventos da Cibele têm **muitos clientes num único evento** (Investidura, Formatura,
Crisma, Primeira Comunhão, Casamento Comunitário). O CRM modelava "1 evento = 1 cliente"; a
v2.8 adiciona o conceito de **evento coletivo** sem quebrar os eventos individuais.

- **Nova tela "Eventos Coletivos"** (menu após Eventos — `assets/js/modules/eventosColetivos.js`):
  - **Cabeçalho do evento** (criar/editar): tipo, data, horário, local, cidade, **organizador**
    (igreja/escola — é o responsável, no lugar do cliente), **pacote padrão** (autopreenche o
    valor por participante) e status. Um evento coletivo é um `Evento` com flag
    **`Coletivo = "Sim"`** — reaproveita a **Produção única** e a **Agenda única** do fluxo
    normal (criadas automaticamente), sem `ID Cliente`.
  - **Importar participantes**: cole uma lista (um por linha, aceita `Nome` ou `Nome, WhatsApp`).
    Cada nome vira **Cliente real** (dedup por WhatsApp via `localizarOuCriarCliente_`), entra
    na aba `Participantes` e recebe **uma conta pendente no Financeiro** com o valor do pacote —
    **sem vencimento**, para não entrar em Cobranças até haver uma data definida.
  - **Tabela de participantes**: busca por nome, **status de compra** inline
    (Sem contato / Interessado / Comprou / Pago / Não quis) e **qtd de fotos extras** inline;
    cada linha mostra previsto / pago / **saldo** calculado do Financeiro do participante.
- **Eventos individuais** (tela "Eventos") passam a **esconder** os coletivos
  (`Coletivo = "Sim"`), que vivem só na tela nova — sem duplicar na lista.
- **Back-end:**
  - Aba `Eventos` ganha as colunas `Coletivo` e `Organizador` (criadas sob demanda por
    `garantirColunas_`). Nova action `criarEventoColetivo` (não cria conta — as contas nascem
    por participante).
  - Nova aba `Participantes` (`ID`, `ID Evento`, `ID Cliente`, `Nome participante`, `WhatsApp`,
    `Status compra`, `Qtd fotos extras`, `Observações`, `Data criação`) + actions
    `listarParticipantes` / `importarParticipantes` / `atualizarParticipante`. `carregarTudo`
    passou a devolver `participantes`.
  - **Financeiro ganha a coluna `ID Cliente`** para distinguir a conta de cada participante sob
    o mesmo evento coletivo (antes o vínculo era só o nome copiado). `salvarConta` foi estendida
    de forma **retrocompatível**: aceita `idCliente`/`clienteNome` e, quando presentes, não
    sobrescreve com o responsável do evento; `listarFinanceiro` preserva o nome do participante.
  - `atualizarParticipante`: ao mudar **fotos extras**, (re)gera uma parcela "Fotos extras"
    = `qtd × Valor foto extra` do pacote; status **"Não quis"** marca as contas não-pagas do
    participante como `Cancelado` (somem de Cobranças).

> ⚠️ Esta fase também mexe no back-end (`backend.txt`) — é preciso **reimplantar** o `Código.gs`
> (Nova implantação) para as abas/colunas novas e as actions de participantes passarem a existir.

#### Correções v2.8.1 (após teste real)

- **Status na importação por participante:** cada nome importado recebe **"Interessado"** quando
  vem com telefone e **"Sem contato"** quando vem sem telefone (antes ficava "Comprou" para todos).
- **Uma conta por participante no Financeiro:** o Financeiro agrupava as contas só por `ID Evento`,
  então todos os participantes de um evento coletivo colapsavam numa **conta única** (a do 1º nome,
  com a soma das parcelas). Agora o agrupamento é por **`ID Evento` + `ID Cliente`** — cada
  participante é uma conta própria, onde entrada/parcelas/pagamento são lançados; editar ou excluir
  a conta de um participante não afeta os demais. Eventos individuais (sem `ID Cliente`) seguem como
  antes, uma conta por evento.
- **Fotos extras mais rápidas:** lançar a quantidade de fotos extras de um participante deixou de
  passar por `salvarConta` (que sincronizava a Agenda a cada mudança) e de recarregar tudo — agora
  grava direto no Financeiro e atualiza só o estado necessário.

#### Ajustes v2.8.2

- **Recálculo instantâneo (previsto/saldo):** ao mudar o status ou a quantidade de fotos extras de um
  participante, a tela agora atualiza **na hora** (atualização otimista local, espelhando a regra do
  back-end) e a gravação no Apps Script acontece em segundo plano, reconciliando o estado ao concluir.
  Some a sensação de espera que existia mesmo após a otimização da v2.8.1.
- **Excluir evento coletivo:** o detalhe do evento coletivo ganhou o botão **"🗑 Excluir evento"**, com
  as **mesmas validações do evento individual** — bloqueia se já houver valor recebido no Financeiro e
  oferece exclusão forçada para eventos de teste. A cascata no back-end (`excluirEvento`) remove também
  os **participantes** do evento (além de produção, Agenda, custos e parcelas); os **clientes**
  cadastrados permanecem na base, como acontece com o cliente de um evento individual.
- **Ícones nos menus:** todos os itens do menu lateral passaram a exibir um ícone ao lado do nome
  (🏠 Dashboard, 👥 Clientes, 📅 Eventos · Agenda, 🎓 Eventos Coletivos, 📦 Pacotes, 🎯 CRM · Orçamentos,
  💰 Financeiro, 🎬 Produção, 💸 Custos, 🤝 Freelance), no mesmo padrão de 📧 Cobranças, 📊 Análise e
  ⚙️ Templates.

### 2.11 Desconto (R$) + Valor foto extra por evento + reaplicar valores (v2.9)

A v2.9 nasceu do uso real da v2.8.x e cobre três frentes.

**1. Desconto (R$) em quatro menus, separado por natureza.** "Desconto" tem dois significados
diferentes no fluxo, e misturá-los causaria contagem dupla. Por isso cada menu trata o seu:

- **Desconto no valor contratado** (grava uma coluna no próprio registro):
  - **Eventos · Agenda** — novo campo **"Desconto (R$)"**. O **Valor final** passa a ser calculado ao
    vivo como `Valor pacote − Desconto` (e continua editável para ajuste manual).
  - **CRM · Orçamentos** — novo campo **"Desconto (R$)"** ao lado de "Valor estimado", com o texto
    **"Valor com desconto"** atualizado na hora. Ao **fechar o lead** (virar evento), o desconto e o
    valor já descontado são levados para o evento.
- **Desconto no saldo a receber** (lançado como uma linha dedicada no Financeiro, `Tipo cobrança =
  "Desconto"`, sem vencimento — por isso **não aparece em Cobranças**):
  - **Financeiro** — campo **"Desconto (R$)"** na conta; abate o saldo que o cliente ainda deve.
  - **Eventos Coletivos** — coluna **"Desconto"** por participante, abatendo o saldo daquela pessoa.
  - Em ambos, a tabela ganhou a coluna **"Desconto"**; o **Saldo** nunca fica negativo na tela
    (desconto maior que o previsto simplesmente quita a conta), e zerar o campo remove o desconto.

**2. "Valor foto extra" por evento (com prioridade sobre o cadastro).** Antes, o valor da foto extra
vinha **só** do cadastro de Pacotes — se o pacote não tivesse esse valor, o cálculo do coletivo dava
zero. Agora a **modal do evento coletivo** tem o campo **"Valor foto extra"** (autopreenchido ao
escolher o pacote, mas editável): quando preenchido no evento, ele **tem prioridade** sobre o cadastro.

**3. Reaplicar valores aos participantes ao editar o coletivo.** Antes, a parcela do pacote do
participante só era criada **na importação** e **só se o valor do pacote já existisse** naquele
momento — digitar/corrigir o "Valor pacote" ou o "Valor foto extra" do evento **depois** não
atualizava as contas já criadas (bug relatado). Agora, ao salvar o evento coletivo com um desses
valores alterado, o sistema **reaplica** a todos os participantes: ajusta/cria a parcela do pacote e
recalcula as fotos extras (`quantidade × valor`), **preservando o que já foi pago**.

**4. Fotos extras na conta do Financeiro.** Consequência direta do item 2: com "Valor foto extra" > 0,
a parcela **"Fotos extras"** passa a ser criada e aparece na conta do participante no Financeiro,
agrupada por `ID Evento | ID Cliente`, e **permanece** ao salvar a conta.

> **Reimplantação obrigatória do back-end:** a v2.9 altera o `Código.gs` (novas colunas `Desconto` e
> `Valor foto extra`, reaplicação de valores ao editar coletivo e tratamento do desconto nas contas).
> Depois do deploy do front, cole o conteúdo de `backend.txt` no `Código.gs` e faça **Nova
> implantação** (ver "Atualizando depois de publicado" na Parte 2).

### 2.12 Refino visual do CRM (v3.0 — frontend)

A v3.0 é um **polimento puramente visual**, feito **só em `assets/css/crm.css`** — sem mexer em
HTML/JS, sem framework (Bootstrap/Tailwind etc.) e **sem custo de performance**. Preserva a identidade
editorial do sistema (papel creme, tinta escura, dourado, títulos em Fraunces) e adiciona o acabamento
que faltava, no padrão de CRMs de mercado:

- **Design tokens no `:root`:** escala de espaçamento (4/8px), raios (`--r-sm/md/lg/pill`), **sombras em
  camadas** tintadas com a cor da marca (`--shadow-sm/md/lg`), transição base e uma divisória mais suave
  (`--rule-soft`). Base reutilizável para as próximas telas.
- **KPI cards e panels:** cantos mais macios, sombra sutil e **leve elevação no hover** dos cards; a
  tabela agora encaixa no card (`overflow:hidden`).
- **Botões:** raio macio; o primário ganhou sombra e micro-elevação no hover; o secundário acende em
  dourado.
- **Campos de formulário e busca:** **foco visível com anel dourado** (não existia) — mais usável e
  acessível.
- **Navegação, status pills, modais e toast:** transições suaves, pills em formato pílula e elevação
  adequada nos sobrepostos.
- **Acessibilidade:** contorno de foco (`:focus-visible`) nos elementos navegáveis.

> **Sem reimplantação de back-end nesta versão** — é só CSS. Basta publicar o front (o `?v=` dos assets
> subiu para `3.0`, forçando o navegador a baixar o CSS novo).

Faz parte de um plano maior (v3.x): a v3.0 cuida do visual; nas próximas fases, a **migração do banco**
de Google Sheets/Apps Script para **PocketBase** (self-host no Oracle Cloud Always Free), começando por
um POC antes de migrar tudo.

---

### 2.13 POC PocketBase — só a tela de Clientes (v3.1)

A v3.1 é uma **prova de conceito barata e reversível**: migra **apenas os Clientes** para o
**PocketBase** (banco real, self-host no Oracle Cloud Always Free) e mantém **todo o resto do CRM no
Apps Script**. O objetivo é **medir o ganho real de desempenho** (carga + CRUD) e o esforço de
portabilidade **antes** de comprometer a migração completa.

**Como funciona (interceptação mínima atrás de um flag):**

- **`assets/js/config.js`** ganhou três constantes:
  - `USE_POCKETBASE_CLIENTES` — liga/desliga o POC. **Vem `false`**; ligue (`true`) só quando a infra
    estiver pronta.
  - `PB_URL` — URL do PocketBase. **Já configurada:** `https://cibelecrm.duckdns.org`.
  - `PB_EMAIL` — e-mail do usuário de app neutro (`app@cibelecrm.duckdns.org`; não é segredo — a
    **senha nunca fica no código**, é pedida uma vez e o token fica salvo no navegador).
- **`assets/js/pbClientes.js`** (novo) é o adapter: traduz os campos do PocketBase para as mesmas chaves
  que o CRM já usa (`'ID Cliente'`, `'Nome / Responsável'`, …) e roteia criar/editar/excluir cliente.
- **`assets/js/api.js`** só ganhou o roteamento condicional — `clientes.js`, `router.js` e `state.js`
  **não mudaram**, então o **rollback é instantâneo**: volte `USE_POCKETBASE_CLIENTES` para `false`.

**Infra provisionada (feita uma vez, fora do repositório):** VM **Oracle Cloud Always Free** (shape x86
E2.1.Micro, **Oracle Linux 9**, usuário SSH `opc`, ~0,5 GB RAM + swap de 1,5 GB). O **PocketBase 0.22.55**
(binário `linux_amd64`) roda como serviço **systemd** com **HTTPS automático** (Let's Encrypt) no domínio
gratuito **`cibelecrm.duckdns.org`** (DuckDNS). A coleção `clientes` (campo **`id_cliente` numérico e
único**, que preserva o mesmo ID da planilha para não orfanar eventos) e a importação dos clientes foram
feitas por **migrations** do próprio PocketBase (`pb_migrations/`), e as regras de API exigem login
(`@request.auth.id != ""`). O `firewalld` libera 80/443 (além da Security List da VCN). O SDK JS **0.21.5**
(UMD via jsdelivr, já no `crm.html`) pareia com o servidor 0.22.x. Detalhes e armadilhas no plano da versão.

> ⚠️ **Durante o POC, com o flag ligado, cadastre clientes SÓ pelo CRM** (que grava no PocketBase).
> Não crie cliente direto na planilha em paralelo — o contador de "próximo ID" divergiria.

**Medir o desempenho:** com o POC rodando, abra o Console do navegador (F12) e rode
`console.table(window.__perf)`. Ele mostra, em milissegundos, o tempo do Apps Script × PocketBase para
carregar e para cada operação de cliente. Rode uma vez "fria" (logo após abrir) e algumas "quentes" e
compare as medianas — é isso que decide se vale migrar o resto.

> ⚠️ A **1ª medição é enganosa**: o cronômetro do PB inclui o tempo do prompt de senha (você digitando).
> Vale a **medição "a quente"** (recarregue sem Ctrl+F5, com o token já salvo).

**Resultado medido (v3.1):**

| Operação | PocketBase | Apps Script |
| --- | --- | --- |
| Carregar clientes (a quente) | **~42 ms** | — |
| `carregarTudo` (payload inteiro) | — | **~10.000–11.400 ms** (e instável) |
| Excluir cliente | **~78 ms** | — |

Ressalva: não é maçã-com-maçã — o `carregarTudo` traz **tudo** e o PB traz **só os clientes**. Ainda
assim, o ganho na fatia de clientes é de **~250×**, e o Apps Script não consegue devolver só os clientes
rápido (empacota tudo numa chamada pelo limite de execuções simultâneas). **Conclusão:** caso forte para a
**v3.2** (migrar o resto), em que cada tela buscaria seu dado no PB em dezenas de ms em vez dos ~10 s do
pacote monolítico.

> **Sem reimplantação de back-end Apps Script nesta versão** — ele continua intacto e no ar. O POC só
> adiciona o PocketBase ao lado. O `?v=` dos assets subiu para `3.1`.

### 2.14 Leitura total no PocketBase (v3.2 — réplica de leitura)

A v3.1 provou que o **gargalo do CRM é a leitura**: o `carregarTudo()` empacota todas as telas numa
única chamada ao Apps Script que leva **~10 s**, enquanto o PocketBase devolve dados em dezenas de ms.
A v3.2 ataca isso: com a flag ligada, **toda a leitura** passa a vir do PocketBase.

**Arquitetura — réplica de leitura, sem reimplementar nada no back-end:**

- O **Google Sheets / Apps Script continua sendo o master de ESCRITA** — ele gera os IDs e orquestra tudo
  (sincronizar Google Agenda, criar linha de Produção, lançar conta no Financeiro ao confirmar evento,
  deduplicar cliente a partir de lead/participante). Nada disso é reescrito.
- O **PocketBase vira uma réplica de LEITURA rápida.** Como o Sheets guarda tudo, a perda do PB é
  recuperável por reimportação (risco baixo).

**O que muda no front:**

- **`assets/js/config.js`** — nova flag **`USE_POCKETBASE_LEITURA`** (vem `false`). Ligada, o
  `carregarTudo()` monta **todo** o payload a partir do PB, no mesmo formato que o Apps Script devolvia —
  os módulos não percebem a diferença. Rollback = voltar para `false`.
  - No cutover, ligue `USE_POCKETBASE_LEITURA` e **desligue `USE_POCKETBASE_CLIENTES` juntas**: assim as
    escritas de cliente voltam ao Apps Script, como as demais (o master de escrita é o Sheets).
- **`assets/js/pbSchema.js`** (novo) — **fonte única** do mapeamento `rótulo ↔ coluna snake_case ↔ tipo`
  de cada entidade. É consumido **ao mesmo tempo** pelo adapter de leitura e pelo gerador de migrations,
  então o esquema do PB **não diverge** do que o front lê.
- **`assets/js/pbCore.js`** (novo) — núcleo reutilizável extraído do `pbClientes.js`: medição de
  desempenho (`perfMark`/`perfTime`), instância do PocketBase (`pbInit`) e autenticação (`pbAuthGarantir`).
- **`assets/js/pbLeitura.js`** (novo) — adapter genérico de leitura: traduz cada coleção do PB para as
  chaves rotuladas, e **replica fielmente os campos derivados do back-end** (marcar parcela "Vencida",
  contas em atraso para o alerta inicial, aninhamento de pagamentos no Freelance).

**Infra (pasta `infra/`, aplicada na VM — não roda no GitHub Pages):**

- **`infra/gen_pb_migrations.cjs`** — gera, a partir do `pbSchema.js`, as **11 migrations** de criação das
  coleções (`eventos`, `pacotes`, `leads`, `financeiro`, `producao`, `custos`, `participantes`,
  `templates`, `freelance_eventos`, `freelance_pagamentos`, `listas`). `clientes` já existe desde a v3.1.
  **Aplicadas na VM** em 04/10/2026 (as 12 coleções existem).
- **`infra/gen_gas_sync.cjs`** — gera, da **mesma** fonte única, o módulo do Apps Script
  **`infra/apps_script/sincronizarPB.gs`**: espelha cada aba do Sheets na coleção do PB a cada mutação
  (upsert + reconcile de deletes), com **fail-soft** (se o PB cair, a escrita no Sheets não quebra). É o
  que mantém a réplica de leitura em dia. Instalação (colar o `.gs`, Script Properties com as credenciais
  do usuário de app, gatilho `sincronizarPBPorAcao_(acao)` no `doPost`, seed com `sincronizarPBTudo`) em
  **`infra/apps_script/README.md`**.
- Ver **`infra/README.md`** para aplicar na VM e para as pendências (backup do `pb_data`).

**Cutover (feito em 04/10/2026):** com as 12 coleções criadas e **semeadas** na VM pelo
`sincronizarPBTudo` (184 registros espelhados do Sheets, sem erros), o cutover foi ligado em
`config.js`: **`USE_POCKETBASE_LEITURA = true`** e **`USE_POCKETBASE_CLIENTES = false`** (a escrita de
cliente volta ao Apps Script, como as demais). O `?v=` dos assets subiu para **`3.2.1`** para forçar o
refetch do `config.js`. **Rollback instantâneo:** voltar as duas flags (`LEITURA=false`,
`CLIENTES=true`) — o código de ambos os caminhos continua no repositório.

**Resultado medido (04/10/2026, em produção):** `carregarTudo()` lendo do PocketBase levou **146 ms**
(coleções em paralelo via `Promise.all`; a mais lenta foi `custos` 141 ms) contra **~10–11 s** do Apps
Script — **≈ 70× mais rápido** no bootstrap que era o gargalo. Medido com `console.table(window.__perf)`.

**Resiliência — fallback automático para o Apps Script:** como as telas passaram a ler do PB, uma queda
da VM derrubaria o CRM. Para evitar isso, `carregarTudo()` tenta o PB com um **timeout**
(`PB_LEITURA_TIMEOUT_MS`, 6 s) e, se o PB falhar **ou ficar lento**, **cai automaticamente** para o
`carregarTudo` do Apps Script (master, sempre disponível). Resultado: uma indisponibilidade do PB vira
**"CRM lento" (~10 s)**, não "CRM fora do ar". O desvio aparece como `PB->AS fallback` no `window.__perf`.

**Endurecimento da VM:** a micro (~0,5 GB) travava a rede sob pressão de RAM (não era OOM do PB, que usa
~10 MB). Mitigado com `infra/vm/99-pocketbase-lowmem.conf` (swappiness/vfs_cache_pressure/min_free_kbytes)
e `tuned` desligado; backup diário do `pb_data` via cron (`infra/vm/backup_pbdata.sh`). Como a RAM é a
causa-raiz, o fim definitivo das quedas é migrar para o shape **ARM Ampere A1** (Always Free dá até 24 GB)
— planejado; o `zram` (swap comprimido em RAM) é a mitigação intermediária no x86.

---

### 2.15 Botão "Emitir NFS-e" na Produção + sidebar agrupada (v3.3)

Duas melhorias de usabilidade, sem mudança de backend:

- **Emitir NFS-e (Produção):** cada linha da tabela de Produção ganhou uma coluna **NFS-e** com o botão
  **"Emitir NFS-e"**, que abre em nova aba o **Emissor Nacional de NFS-e**
  (`https://www.nfse.gov.br/EmissorNacional/Login?ReturnUrl=%2fEmissorNacional`). Como a linha inteira já
  é clicável (abre o formulário de edição da produção), o botão usa `onclick="event.stopPropagation()"`
  para não disparar a edição ao emitir a nota. O link leva só até o login do portal do governo — a emissão
  em si é feita lá, com o certificado/credenciais da fotógrafa (o CRM não guarda nada disso).
- **Sidebar agrupada por seção:** os módulos agora ficam organizados em **6 seções com cabeçalho** (emoji +
  título): 📊 **Visão geral** (Dashboard); 👥 **Clientes** (Clientes, CRM · Orçamentos); 📅 **Eventos**
  (Eventos, Eventos Coletivos, Produção); 💰 **Financeiro** (Financeiro, Cobranças, Análise, Custos);
  📦 **Serviços** (Pacotes, Freelance); 💬 **Comunicação** (Templates). O array `NAV` (`config.js`) passou a
  ser uma lista de grupos `{ group, items[] }` e o `renderNav()` (`router.js`) desenha cada cabeçalho
  `.nav-group-title` seguido dos itens; a busca de item por id usa `NAV.flatMap(g => g.items)`.

Arquivos: `assets/js/modules/producao.js` (coluna + botão), `assets/js/config.js` (grupos do `NAV`),
`assets/js/router.js` (`renderNav` por grupos), `assets/css/crm.css` (`.btn-nfse`, `.nav-group*`),
`crm.html` (bump `?v=3.3.0`).

---

### 2.16 Redesign do layout — base Bootstrap + topbar + Dashboard + mobile (v3.4 — Fase 1)

Evolução do visual para um padrão "SaaS profissional" **sem abandonar a identidade da marca**
(creme + dourado + preto, Fraunces/Work Sans). Adoção **gradual** do Bootstrap 5.3 como base de
grid/responsividade/componentes — não é uma reescrita. Esta é a **Fase 1**; a lista de Eventos nova e a
tela de detalhe com abas ficam para a **Fase 2 (v3.5)**.

- **Bootstrap 5.3 + Bootstrap Icons tematizados:** carregados **antes** do `crm.css` (via CDN jsDelivr).
  Um bloco de tema no topo do `crm.css` re-encosta as variáveis `--bs-*` na paleta/fontes da marca
  (`--bs-body-bg/-color/-font-*`, `--bs-border-color`, `--bs-primary` dourado) para o **Reboot** do framework
  não "vazar" o visual padrão nas telas ainda não redesenhadas. Só essas duas libs entram agora; ApexCharts,
  Flatpickr, Tom Select, SweetAlert2, SortableJS e DataTables ficam para as fases que as usarem.
- **Topbar persistente + sino de notificações (🔔):** a topbar fica **fora** do `#mainArea` (não é recriada a
  cada troca de tela). Traz **busca global** (paleta client-side que casa nome em clientes/eventos/leads e
  navega ao registro) e um **sino** com selo numérico: ele reabre a **mesma notificação de contas em atraso**
  que já aparece no startup (`alertaCobrancasVencidas`) — sem contas vencidas, mostra um estado vazio. **Não há**
  chip de usuário (o CRM não tem gestão de usuários). Novo arquivo `assets/js/topbar.js`.
- **Dashboard mais rico:** 4 KPIs (**Clientes, Eventos, Receita (mês), A receber**) com **linha de tendência
  real** (`↑/↓ N% vs. mês anterior`). Receita = soma de `Valor pago` por `Data pagamento`; "A receber" = saldo
  em aberto + contagem de contas em atraso. **Regra de honestidade:** quando não há base no mês anterior, o card
  mostra **"—"**, nunca um percentual inventado. Abaixo, duas colunas: **Próximos eventos** (com bolinha de
  status) e **Últimos clientes** (colunas reais — Nome, Cidade, Eventos).
- **Mobile:** **bottom-nav** fixa com 4 atalhos (🏠 Início, 👥 Clientes, 📅 Eventos, ☰ Mais — "Mais" abre a
  gaveta/sidebar), KPIs **2×2**, próximos eventos como **cartões empilhados**; o sino também aparece na
  `mobile-topbar`.
- **Rastreio de data de criação (backend — você implanta):** para as tendências de **Clientes/Eventos** serem
  reais, passamos a carimbar a data de cadastro. Eventos ganham a coluna **"Data de cadastro"**
  (`criarEvento`/`criarEventoColetivo` em `backend.txt`); Clientes reaproveitam o **"Primeiro contato"** já
  existente. O espelhamento no PocketBase usa o campo `data_cadastro` (via `pbSchema.js` para eventos e
  `gen_gas_sync.cjs`→`sincronizarPB.gs` para clientes), com a migration de atualização
  `infra/pb_migrations/1793000200_add_data_cadastro.js`. **O front sobe e funciona antes disso** — as tendências
  de volume mostram "—" até a data começar a fluir.

Arquivos: `crm.html` (CDN Bootstrap/Icons, reestrutura da topbar + bottom-nav, `<script> topbar.js`, bump
`?v=3.4.0`), `assets/css/crm.css` (tema `--bs-*`, `.app-topbar/.app-search/.app-bell`, `.mobile-bottomnav`,
cards de KPI com tendência, ajustes mobile), `assets/js/topbar.js` (novo — sino + busca), `assets/js/modules/dashboard.js`
(KPIs com tendência + 2 colunas; helpers `agregarMes`/`tendenciaMes`/`badgeTendencia`), `assets/js/router.js`
(fiação do bottom-nav), `assets/js/main.js` (selo do sino no boot). Backend: `backend.txt`, `assets/js/pbSchema.js`,
`assets/js/pbClientes.js`, `infra/gen_gas_sync.cjs` (+ `infra/apps_script/sincronizarPB.gs` regerado) e a nova
migration.

---

### 2.17 Eventos — lista com busca/filtro + tela de detalhe com abas (v3.5 — Fase 2)

Conclui o que ficou prometido na Fase 1: a tela de **Eventos** ganha um visual mais "SaaS" e, ao clicar numa
linha, abre uma **tela de detalhe do evento com abas** em vez de ir direto ao formulário de edição. Vale só para
**eventos individuais** (coletivos já têm tela própria). **Sem mudança de backend** — todos os dados das abas já
estão nos arrays globais carregados.

- **Lista com busca + filtro de status:** uma *toolbar* acima da tabela com **campo de busca** (casa em
  *Cliente / Responsável* e *Tipo de evento*) e um **select de status** (alimentado por `listas['Status evento']`).
  Os critérios ficam em `eventosBusca`/`eventosFiltroStatus` (em `state.js`), então sobrevivem ao redesenho da
  tabela e ao voltar do detalhe. Ordenação por data (desc) e o layout em cartões no mobile foram preservados.
- **Tela de detalhe (`renderDetalheEvento`):** página inteira no `#mainArea` (mesmo molde do detalhe de evento
  coletivo), com **cabeçalho** (← Voltar, nome do cliente + *pill* de status, fatos: data, horário, tipo,
  local/cidade, valor) e ações **Editar** / **Emitir NFS-e** / **Excluir**. Abaixo, **abas Bootstrap**
  (`nav-tabs`) tematizadas na paleta da marca:
  - **Resumo:** dados do evento (pacote, valores, desconto) + mini-resumo financeiro (previsto/recebido/saldo) +
    situação da produção (entrega/edição) + observações.
  - **Financeiro:** a conta do evento — tabela das parcelas (tipo, vencimento, previsto, pago, status) com totais
    e botão **Abrir conta** (reaproveita `abrirFormConta`); *empty-state* quando não há conta.
  - **Produção:** etapas (backup, seleção, edição, álbum, aprovação, entrega) e dados de entrega/links em grid
    *read-only*, com botão **Abrir produção** (`abrirFormProducao`); *empty-state* quando não há registro.
- **Roteamento:** nova view `eventoDetalhe` + `eventoDetalheId` (em `state.js`). O `renderMain()` ganhou o branch
  correspondente, e a sidebar/bottom-nav tratam `eventoDetalhe` como pertencente à seção **Eventos**. Assim,
  re-renders após salvar a edição **permanecem no detalhe** atualizado; ao excluir, o detalhe detecta a ausência
  do evento e volta sozinho para a lista.
- **Visual:** `nav-tabs` com sublinhado **dourado** (sem o azul padrão do Bootstrap), cabeçalho de detalhe, grids
  de campos e *pill* **"vencida"** (vermelho) — que também melhora a leitura de parcelas vencidas no Financeiro.
  Ajustes mobile: toolbar e cabeçalho empilhados, abas com rolagem horizontal.

Arquivos: `assets/js/modules/eventos.js` (busca/filtro, clique→detalhe, `renderDetalheEvento` + abas),
`assets/css/crm.css` (`.list-toolbar`, tema `nav-tabs`, `.detalhe-*`, `.status-pill.vencida`, mobile),
`assets/js/router.js` (branch `eventoDetalhe` + destaque da seção), `assets/js/state.js` (novas globais),
`crm.html` (bump `?v=3.5.0`).

---

### 2.18 Refino visual das telas antigas (v3.6 — Fase 3)

Quatro telas ainda não tinham passado pelo pente-fino do padrão visual adotado na v3.4/v3.5 (Bootstrap
tematizado + view-header → painel → tabela responsiva → `status-pill`/`empty-state`): **Pacotes, Custos,
Templates e Freelance**. Esta fase é **puramente visual/consistência** — zero features novas, zero mudança
de dados ou backend; todos os handlers, fluxos e chamadas `apiCall` foram preservados. O trabalho consistiu
em remover estilos `inline` soltos e trocá-los por classes reutilizáveis.

O que mudou:

- **`assets/css/crm.css`** — novo bloco de utilitários de refino: `.panel.spaced` (espaço entre painéis),
  `.field.tight` (campo de filtro sem margem), `.th-sort` (cabeçalho ordenável), `.rule-sep` (separador fino),
  `.hint` (nota auxiliar), `.btn-row` (barra de botões), `.btn-sm` (botão compacto), `.form-stack` (formulário
  empilhado), `.status-pill.info` (variante neutra do pill) e as classes dos cartões de template
  (`.tpl-card`, `.tpl-card-head`, `.tpl-actions`, `.code-area`, `.preview-box`), com regra mobile para o
  cabeçalho do cartão empilhar.
- **`assets/js/modules/templates.js`** — cartões de template agora usam `.panel.tpl-card` + classes (sem
  `style=` inline); badge "PADRÃO" virou `status-pill`; botões de ação viraram `.btn-ghost/.btn-danger` na
  variante `.btn-sm` (o "Deletar" agora usa o vermelho de erro padrão, não um token inexistente);
  empty-state padronizado; `<textarea>`/preview agora são `.code-area`/`.preview-box`; o `<form>` virou
  `.form-stack`. Comportamento (criar/editar/deletar, preview ao vivo, `confirm()` nativo) inalterado.
- **`assets/js/modules/freelance.js`** — inlines migrados para `.panel.spaced`, `.field.tight` e `.th-sort`;
  sub-tela de pagamentos padronizada (`.rule-sep`, `.hint`, `.btn-row`, `.empty-state`); badge de serviço só
  de edição agora usa `.status-pill.info` (antes caía numa classe sem estilo).
- **`assets/js/modules/custos.js`** — único inline (`margin-bottom`) trocado por `.panel.spaced`.
- **`crm.html`** — bump de cache-busting `?v=3.5.0 → 3.6.0` nos 25 assets próprios.

`pacotes.js` já estava conforme o padrão e **não foi tocado**. Validação: `node --check` nos três módulos
alterados.

Arquivos: `assets/css/crm.css` (utilitários de refino), `assets/js/modules/templates.js`,
`assets/js/modules/freelance.js`, `assets/js/modules/custos.js`, `crm.html` (bump `?v=3.6.0`).

---

### 2.19 Gráficos no Dashboard (v3.7)

O Dashboard mostrava 4 KPIs com setas de tendência (comparação de 2 meses) e duas tabelas, mas nenhuma
**visualização temporal**. A v3.7 adiciona três gráficos de série mensal (últimos 12 meses) via
**ApexCharts** (CDN), transformando dados que já existem em leitura de faturamento, sazonalidade e margem.
É **só leitura** — nenhuma mudança de backend/dados e a lógica dos KPIs/tabelas atuais ficou intacta.

Gráficos (todos dos últimos 12 meses):

- **Receita por mês** (área) — soma de `'Valor pago'` do `financeiro` por `'Data pagamento'`; tooltip/eixo
  em `formatBRL`. O último ponto bate com o KPI "Receita (mês)".
- **Eventos por mês** (colunas) — contagem de eventos não coletivos por `'Data do evento'` (mostra sazonalidade).
- **Receita × Custo por mês** (colunas agrupadas) — receita (`financeiro`/`'Valor pago'`) vs. custo
  (`custos`/`'Valor'`) por mês, para enxergar a margem ao longo do tempo.

Como foi feito (padrão compatível com o render atual):

- **`assets/js/modules/dashboard.js`** — novo helper `serieMensal(itens, campoData, valorFn, nMeses=12)`
  (mesmo bucketing `ano*12+mês` do `agregarMes`, reusando `parseDataBR`; devolve `{labels, valores}` com zeros
  onde não há dado). Como `renderDashboard` monta todo o `innerHTML` de uma vez e não faz wiring pós-render,
  os gráficos são instanciados por `desenharGraficosDashboard()` **depois** de o HTML entrar no DOM. As
  instâncias ficam em `dashCharts[]` e são destruídas antes de recriar (sem vazamento ao revisitar a rota).
  Se o CDN do ApexCharts estiver fora do ar, cada gráfico cai num `.empty-state` e o resto do Dashboard
  segue normal.
- **`crm.html`** — `<script>` do ApexCharts 3.54.1 (CDN, antes dos scripts locais) + bump `?v=3.6.0 → 3.7.0`.
- **`assets/css/crm.css`** — `.chart-panel` (`overflow:visible`, p/ o tooltip não ser cortado) e `.chart-box`
  (padding); altura e responsividade vêm das opções do próprio gráfico, dentro das colunas Bootstrap.

Tema: cores da marca (dourado `#A8791E` receita, tinta `#221F1C` eventos, vermelho `#B23B2E` custo), fonte
Work Sans, sem a toolbar padrão do ApexCharts. Validação: `node --check assets/js/modules/dashboard.js`.

Arquivos: `assets/js/modules/dashboard.js` (`serieMensal`, `desenharGraficosDashboard`), `crm.html`
(CDN ApexCharts + bump `?v=3.7.0`), `assets/css/crm.css` (`.chart-panel`/`.chart-box`).

---

### 2.20 Dashboard — ícones, filtro de período e cards redesenhados (v3.8 — Fase 1 do overhaul)

Primeira fase do overhaul responsivo para aproximar a UI dos mockups de referência. Toca **só o Dashboard**
(sem mudança de backend):

- **Ícones dos KPIs em selo colorido** — cada card ganha um `.kpi-icon-badge` com cor suave própria
  (Clientes = azul, Eventos = roxo, Receita = verde, A receber = rosa), no lugar do ícone dourado solto.
- **Filtro de período** (`<select class="list-filter" id="dashPeriodo">` no topo direito): presets **Este mês /
  Últimos 3 / 6 / 12 meses / Este ano** (padrão: últimos 12 meses). Recorta **KPIs**, **gráficos** (janela de
  meses) e **Últimos clientes**. Os KPIs Clientes/Eventos contam no período com **fallback para o total** quando
  o backend ainda não carimbou as datas (senão o card mostraria 0). "A receber" é saldo pendente **global**
  (não depende do período). "Próximos eventos" permanece prospectivo (sempre os futuros).
- **Card "Próximos eventos"** — ícone no título, link **"Ver todos" → Eventos**, coluna **Pacote** removida,
  **Tipo → Evento**, e Status agora em **pílula colorida** (`pillStatusEvento`): Confirmado = verde,
  Em andamento = âmbar, Pendente = cinza, Cancelado = vermelho.
- **Card "Últimos clientes"** — ícone no título, link **"Ver todos" → Clientes**, colunas agora
  **Nome · Evento · Contato · Status** (Evento = tipo do evento mais recente do cliente; Status = Ativo/Lead).

Como foi feito:

- **`assets/js/modules/dashboard.js`** — novos helpers (escopo global, reusados nas Fases 2/3): `periodoInicio`/
  `periodoMeses`/`opcoesPeriodo` + `contarNoPeriodo`/`somarNoPeriodo` (com fallback de data); `pillStatusEvento`,
  `statusCliente`/`pillStatusCliente` (tem evento → Ativo, senão Lead) e `eventoRecenteDoCliente`. `renderDashboard`
  passou a fazer um wiring mínimo pós-render (troca de período re-renderiza; "Ver todos" navega via
  `currentView`/`renderNav`/`renderMain`).
- **`assets/css/crm.css`** — `.kpi-icon-badge` (+ cores `azul`/`roxo`/`verde`/`rosa`), `.panel-head`/`.panel-link`
  (cabeçalho de painel com ação à direita) e `.status-pill.lead` (azul).
- **`crm.html`** — bump `?v=3.7.0 → 3.8.0`.

Validação: `node --check assets/js/modules/dashboard.js`.

---

### 2.21 Clientes — status, ações (olho/lápis/⋮), edição inline e paginação (v3.9 — Fase 2 do overhaul)

Segunda fase do overhaul, na tela de **Clientes** (sem mudança de backend — reads = PocketBase, writes = Apps Script):

- **Colunas e rótulos** — a tabela passa a **Nome · Telefone · E-mail · Status · Ações**. "Telefone" é só o rótulo
  de UI (tabela e formulário); a chave de dados continua `WhatsApp`.
- **Status Ativo/Lead** — reusa `statusCliente`/`pillStatusCliente` do Dashboard (cliente com evento vinculado =
  **Ativo**, senão **Lead**) + filtro **"Todos os status / Ativo / Lead"** ao lado da busca.
- **Busca** por nome, telefone ou e-mail (`#buscaCliente`).
- **Coluna "Ações"**:
  - 👁 **olho** → abre o cadastro completo (`abrirFormCliente`).
  - ✏️ **lápis** → **edição rápida na própria linha** de Nome/Telefone/E-mail (inputs + salvar/cancelar). Ao salvar,
    reenvia os **demais campos preservados** do registro (CPF, cidade, Instagram, canal, observações) porque o
    backend grava o cliente inteiro — assim nada é apagado.
  - ⋮ **3 pontos** (dropdown Bootstrap) → **Excluir** (reusa `excluirComConfirmacao`; backend bloqueia se houver eventos).
- **Paginação 10/página** — helper global `htmlPaginacao(pagina, totalPaginas)` (definido aqui, reaproveitável na
  Fase 3/Eventos). Busca/filtro resetam para a página 1.

Como foi feito:

- **`assets/js/modules/clientes.js`** — reescrito: estado de tela em variáveis de módulo (`clientesBusca`/
  `clientesStatusFiltro`/`clientesPagina`/`clienteEditandoId`); `desenharTabelaClientes` (filtro + paginação),
  `linhaCliente` (modo normal × modo edição), `wireTabelaClientes` (liga olho/lápis/⋮/salvar/cancelar/paginação) e
  `salvarEdicaoInlineCliente`. Rótulo "WhatsApp → Telefone" no `abrirFormCliente`.
- **`assets/css/crm.css`** — `.panel-list` (libera overflow para o menu ⋮), `.row-actions`/`.btn-icon`,
  `.inline-input` e `.pager`/`.pager-btn`.
- **`crm.html`** — bump `?v=3.8.0 → 3.9.0`.

Responsivo: a tabela já colapsa em cartões no mobile (`.responsive-table` + `data-label` nas novas colunas);
botões de ação e paginação com área de toque confortável.

Validação: `node --check assets/js/modules/clientes.js`.

---

### 2.22 Eventos — lista com ações/paginação + detalhe com 6 abas (v3.10 — Fase 3 do overhaul)

Terceira fase do overhaul, na tela de **Eventos** (sem mudança de backend):

- **Lista** — cabeçalho **Tipo → Evento**; nova coluna **Ações** (👁 abre o detalhe; ⋮ dropdown → **Excluir**, reusa
  `excluirEventoComConfirmacao`). O clique na linha continua abrindo o detalhe; os botões de ação usam
  `stopPropagation` para não disparar o clique da linha. **Paginação 10/página** (helper global `htmlPaginacao`,
  definido em `clientes.js`), preservando o filtro `Coletivo !== 'Sim'`; busca/filtro resetam para a página 1.
- **Detalhe com 6 abas** (antes eram 3) — **Resumo · Cliente · Pacote · Financeiro · Produção · Mensagens**, cada uma
  com ícone:
  - **Resumo** — dois **cards**: *Informações do evento* (data, horário, **local clicável → rota no Google Maps**,
    evento, status em pílula, pacote + "Editar informações") e *Anotações* (campo `Observações` + "Editar anotações").
  - **Cliente** — nome, **telefone com link `wa.me`**, e-mail (`mailto`), cidade, Instagram e atalho "Abrir cadastro".
  - **Pacote** — nome, descrição, valor do pacote, fotos incluídas, valor de foto extra e o valor aplicado no evento
    (dados do cadastro de Pacotes, com fallback para o que está no próprio evento).
  - **Financeiro** / **Produção** — reaproveitam `htmlAbaFinanceiro` / `htmlAbaProducao`.
  - **Mensagens** — CTA **"Enviar WhatsApp"** (link `wa.me` para o cliente) e atalho para as **mensagens de cobrança**
    (`abrirCopiadorMensagem`) quando o evento tem conta no Financeiro.

Como foi feito:

- **`assets/js/modules/eventos.js`** — paginação (`eventosPagina`/`EVENTOS_POR_PAGINA`) e wiring de ações na lista;
  helpers `clienteDoEvento`/`pacoteDoEvento`/`telParaWhatsapp`/`linkMapsEvento`; `renderDetalheEvento` com 6 abas;
  novo `htmlAbaResumo` (2 cards) + `htmlAbaCliente`/`htmlAbaPacote`/`htmlAbaMensagens`.
- **`assets/css/crm.css`** — `.detalhe-bloco-head` (título + ação) e visual de card para os blocos do Resumo
  (`#aba-resumo .detalhe-bloco`). A lista reusa `.panel-list`/`.row-actions`/`.btn-icon`/`.pager` da Fase 2.
- **`crm.html`** — bump `?v=3.9.0 → 3.10.0`.

Responsivo: a lista colapsa em cartões no mobile (`data-label` incluído em Evento/Ações); as abas do Bootstrap já
rolam na horizontal e os cards do Resumo empilham em coluna única.

Validação: `node --check assets/js/modules/eventos.js`.

---

### 2.23 Sidebar em accordion + "Gerador de link" no menu (v3.11 — Fase 4 do overhaul)

Quarta e última fase do overhaul, na **navegação lateral**:

- **Accordion** — os grupos da sidebar agora **recolhem**: o cabeçalho virou botão clicável com **chevron**, e **só um
  grupo fica aberto por vez** (estado `grupoAberto` em `router.js`). Por padrão abre o grupo que contém a rota atual;
  ao navegar para outra tela, o grupo dessa rota abre sozinho — sem desfazer um recolhimento que o usuário tenha feito
  manualmente no cabeçalho (detectado por `navUltimaView`, já que o toggle não muda a view).
- **"Gerador de link" no menu** — novo grupo **🔗 Ferramentas** com o item **Gerador de link**, que aponta para a
  página `gerador-de-link.html` (já existente na raiz) e abre **na mesma aba** (`location.href`). Itens de menu com
  `href` são tratados como link externo em `renderNav`.

Como foi feito:

- **`assets/js/router.js`** — `renderNav` reescrito: desenha grupos `open`/`collapsed`, liga o toggle do cabeçalho
  (accordion) e trata itens com `href`.
- **`assets/js/config.js`** — novo grupo "🔗 Ferramentas" no `NAV` com o item `geradorLink` (`href:'gerador-de-link.html'`).
- **`assets/css/crm.css`** — `.nav-group-title` como botão com `.nav-chevron` (gira ao recolher) e
  `.nav-group.collapsed .nav-group-items{display:none}`.
- **`crm.html`** — bump `?v=3.10.0 → 3.11.0`.

Com isso encerra o overhaul responsivo (v3.8 → v3.11): Dashboard, Clientes, Eventos e navegação alinhados aos mockups.

Validação: `node --check assets/js/router.js assets/js/config.js`.

---

### 2.24 Atalho de WhatsApp no telefone do cliente (v3.12)

Ao lado do número de telefone passou a aparecer um **ícone do WhatsApp** que abre a conversa com o cliente
(`https://wa.me/<número>`, em nova aba). Aparece na **lista de Clientes** e no card **"Últimos clientes"** do Dashboard.

Como foi feito:

- **`assets/js/ui.js`** — helpers compartilhados `telParaWhatsapp(tel)` (normaliza para o formato do `wa.me`,
  prefixando o DDI **55** quando o número vem sem) e `iconeWhatsapp(tel)` (devolve o ícone-link; `''` quando não há
  telefone; `stopPropagation` no clique para não disparar ações da linha).
- **`assets/js/modules/clientes.js`** e **`assets/js/modules/dashboard.js`** — a célula de telefone/contato agora
  mostra `número + ícone` via `.tel-cell`.
- **`assets/js/modules/eventos.js`** — a função `telParaWhatsapp` local foi removida (passou a vir do `ui.js`).
- **`assets/css/crm.css`** — `.tel-cell` e `.wa-link` (selo verde do WhatsApp).
- **`crm.html`** — bump `?v=3.11.0 → 3.12.0`.

Validação: `node --check assets/js/ui.js assets/js/modules/clientes.js assets/js/modules/dashboard.js assets/js/modules/eventos.js`.

---

### 2.25 Detalhe do evento — anotações editáveis no lugar e fundo dos cards (v3.13)

Ajustes no detalhe do evento (aba **Resumo**) após os testes da Fase 3:

- **Botão "Editar" do topo removido.** Era redundante com **"Editar informações"** no card *Informações do evento*
  (ambos abriam a mesma modal de edição). O topo agora traz só **Emitir NFS-e** e **Excluir**.
- **"Anotações" passou a ser editável no próprio card.** Antes o botão abria a modal de edição do evento. Agora ele
  troca o card por um `textarea` com **Salvar/Cancelar** e grava direto as observações (`editarAnotacoesEvento` /
  `salvarAnotacoesEvento`). Como o backend regrava o registro inteiro, as anotações são enviadas junto com todos os
  demais campos preservados (`dadosEventoPreservados`).
- **Campo "Observações" saiu da modal de edição do evento.** Ficou duplicado com as Anotações; a modal não mexe mais
  nesse campo e `salvarEvento` **preserva** o valor atual das observações em vez de lê-lo de um input inexistente.
- **Fundo dos cards do Resumo** (*Informações do evento* e *Anotações*) agora usa `var(--paper-raised)` — a mesma cor
  de fundo do sidebar.

Arquivos: `assets/js/modules/eventos.js`, `assets/css/crm.css` (`#aba-resumo .detalhe-bloco`), `crm.html`
(bump `?v=3.12.0 → 3.13.0`).

Validação: `node --check assets/js/modules/eventos.js`.

---

### 2.26 Sidebar — hierarquia dos itens dentro dos grupos (v3.14)

Após testes de UX, os itens do menu não pareciam pertencer ao seu grupo: embora ficassem logo abaixo do
título, eram **maiores (14px), mais escuros e começavam na mesma margem** do título — ou seja, o "filho"
competia com o "pai" e parecia um título solto. Ajuste puramente visual (CSS), mantendo o accordion:

- **Trilho + recuo:** o container `.nav-group-items` ganhou `margin-left`/`padding-left` + uma **guia vertical**
  (`border-left`) que liga visualmente os itens ao grupo.
- **Peso da hierarquia corrigido:** os itens ficaram menores (**13px**) e em cinza (`--ink-soft`), escurecendo
  no hover/ativo — assim o título do grupo volta a ser o elemento dominante. O item ativo mantém a pílula escura.

Arquivos: `assets/css/crm.css` (`.nav-item`, `.nav-group-items`), `crm.html` (bump `?v=3.13.0 → 3.14.0`).
Sem mudança de JS/markup — a estrutura `.nav-group-items > .nav-item` já existia.

---

### 2.27 Padronização da linha das listas + coluna "Ações" nos 6 menus (v3.15)

Duas situações de UX, sem tocar no back-end:

**1. Linha "apagando" os ícones (padronizar por Clientes).** Em Eventos a linha inteira era clicável e, no hover,
ganhava fundo bege (`--gold-soft`) que ficava quase da cor dos ícones cinza (olho/⋮), deixando-os lavados. Em
Clientes isso não acontecia porque a linha **não** é clicável — abre-se pelo ícone do olho. Padronizamos por
Clientes: **nenhuma linha muda de cor no hover nem abre ao ser clicada**; a abertura passa a ser **sempre pelo
ícone do olho**. Removidas as regras órfãs `tr.clickable` do CSS.

**2. Coluna "Ações" nos 6 menus.** CRM · Orçamentos, Produção, Financeiro, Custos, Pacotes e Freelance ganharam a
coluna **Ações** (mesmo padrão de Clientes/Eventos), com ícones por linha:

| Menu | 👁 olho (abrir) | ✏️ lápis (edição rápida) | ⋮ Mais |
|---|:---:|:---:|---|
| CRM · Orçamentos | ✔ | ✔ Etapa / Valor / Próximo contato | Excluir |
| Custos | ✔ | ✔ Fornecedor / Valor / Pago? | Excluir |
| Produção | ✔ | — | — (sem exclusão: a produção nasce/morre com o evento) |
| Financeiro | ✔ | — | Excluir conta |
| Pacotes | ✔ | — | Excluir |
| Freelance | ✔ | — | Excluir |

- **Edição rápida (lápis)** só em **Orçamentos** e **Custos**: edita os campos direto na linha e **reenvia o
  registro inteiro** ao salvar (lendo os demais campos do objeto em memória), para o back-end não sobrescrever
  nada com vazio — mesmo padrão de `salvarEdicaoInlineCliente`.
- O ⋮ reaproveita a exclusão existente de cada módulo (ex.: Financeiro usa `excluirContaComConfirmacao`, que trata
  parcelas/força; Pacotes usa `deletarPacote`). Os painéis dessas listas ganharam a classe `panel-list` para o
  dropdown do ⋮ não ser cortado.

Arquivos: `assets/js/modules/eventos.js`, `leads.js`, `custos.js`, `producao.js`, `financeiro.js`, `pacotes.js`,
`freelance.js`; `assets/css/crm.css` (remoção de `tr.clickable`); `crm.html` (bump `?v=3.14.0 → 3.15.0`).
Nenhum CSS novo foi necessário — `.row-actions`/`.btn-icon`/`.inline-input`/`.panel-list` já existiam da v3.9.

**Ajuste (v3.15.1) — lançar custo direto do resumo.** Na tela Custos, a tabela **"Receita × custo por evento"**
é um agregado por evento (não recebe os ícones de custo individual). Como o único caminho para dar um custo a um
evento era o "+ Novo custo" (reselecionando o evento na mão), cada linha do resumo ganhou um botão **"+ Custo"**
(ícone `＋`) que abre o formulário *Novo custo* **já com aquele evento pré-selecionado**. Para isso, `abrirFormCusto`
passou a aceitar um 2º parâmetro `idEventoPadrao`. `crm.html` (bump `?v=3.15.0 → 3.15.1`).

### 2.28 PocketBase vira master de ESCRITA (track v3.3 — Fases 0 + 1 + 2 + 3 + 4)

> Esta é a trilha **de back-end** (os commits a marcam como **v3.3**), paralela às seções visuais acima
> (v3.0–v3.15 são a trilha de **front-end**). Objetivo: **remover o Google Sheets como master de escrita**.
> Hoje (v3.2) o front **lê** do PocketBase mas ainda **escreve** no Apps Script, que grava o Sheets (master)
> e espelha no PB. A meta é inverter: **o PocketBase passa a ser autoritativo para escrita** e o Apps Script
> encolhe para **só a cola da Google Agenda**. Decisão de arquitetura: lógica **híbrida** (CRUD simples no
> front, estendendo o padrão do `pbClientes.js`; invariantes críticos em `pb_hooks` no servidor) e a **Agenda
> orquestrada pelo front** (grava no PB e chama um Apps Script enxuto de Calendar). Tudo atrás da flag mestra
> **`USE_POCKETBASE_ESCRITA`** (em `config.js`, **default `false`**); o rollback é só voltar a flag.

**Fase 0 — ID atômico no servidor (feita e já implantada na VM).** O `proximoId_` do Apps Script calculava
`max(id)+1` no cliente, sujeito a corrida. Movemos isso para um **hook do PocketBase**: `infra/gen_pb_hooks.cjs`
lê a fonte única `assets/js/pbSchema.js` e gera `infra/pb_hooks/auto_id.pb.js` — um `onRecordBeforeCreateRequest`
por coleção que, **se o id de negócio vier vazio**, atribui `max(coluna)+1` dentro do request (o índice único é
a rede de segurança). Exclui `producao` (id herdado do evento) e `listas` (sem id). **Seguro de ligar adiantado:**
enquanto a escrita ainda vai pelo Apps Script, o id chega preenchido e o hook não age. Deploy em
`infra/pb_hooks/README.md`.

**Fase 1 — adapters de CRUD simples no front (esta entrega).** Para cada coleção sem cascata, um adapter
espelha o padrão do `pbClientes.js`, converte o `dados` camelCase do formulário nas colunas snake_case do PB e
**reproduz fielmente os campos derivados/defaults do Apps Script** (senão gravaríamos vazio onde o back-end
calculava). Novos arquivos em `assets/js/`:

| Arquivo | Ações registradas | Regras portadas do back-end |
|---|---|---|
| `pbEscrita.js` (base) | — | `PB_ACTIONS`, `hojeBR_` (data BR), `pbLocalizarOuCriarCliente` (dedup WhatsApp→CPF) |
| `pbLeads.js` | criar/atualizar/excluirLead | `Valor ponderado = estimado × prob. ÷ 100`; `Data entrada`; defaults `Novo lead`/`Normal`; Cliente/WhatsApp/E-mail vêm do **cadastro** do cliente |
| `pbCustos.js` | criar/atualizar/excluirCusto | `Data` default = hoje; `Pago?` default `Não` |
| `pbPacotes.js` | criar/atualizar/deletarPacote | `Data criação`/`Data atualização`; `Qtd fotos` preserva `''` |
| `pbTemplates.js` | criar/atualizar/deletarTemplate | validação dos placeholders; `Padrão='Não'`; bloqueio de editar/excluir padrão |
| `pbProducao.js` | atualizarProducao | PATCH parcial por `ID Evento` (produção é 1:1 com o evento) |
| `pbFreelance.js` | criar/atualizar/excluir de Evento e Pagamento | `Total = soma dos 4 valores`; default `Pendente`; excluir evento **cascateia** os pagamentos |

- **`api.js`** passou a rotear por um registro geral **`PB_ACTIONS`**: com `USE_POCKETBASE_ESCRITA=true`, a ação
  cai no adapter PB; o que ainda não estiver mapeado continua indo ao Apps Script (transição fase a fase). O ramo
  do POC de clientes (`PB_CLIENT_ACTIONS`) foi mantido e passa a ser englobado pela flag mestra.
- Os `<script>` dos adapters entram em `crm.html` **depois** de `pbClientes.js` e **antes** de `pbLeitura.js`
  (`?v=3.15.1 → 3.15.2` nos arquivos tocados). **Inertes enquanto a flag estiver `false`** — zero efeito em produção.

**Fase 2 — Apps Script fino de Agenda + orquestração no front (esta entrega).** O Apps Script ganhou três ações
**públicas e enxutas** que expõem **só a Google Agenda**, reusando as funções internas de Calendar que já existiam:

| Ação (doPost) | O que faz | Reusa |
|---|---|---|
| `agendaSincronizarEvento` | cria/atualiza o compromisso do **evento** e devolve o `idCalendar` | `sincronizarEventoNaAgenda_` (datas/título/descrição continuam no GAS → mesma timezone) |
| `agendaSincronizarEntrega` | cria/atualiza o compromisso de **entrega** com o status de pagamento na descrição | `sincronizarEntregaNaAgenda_` (agora aceita o `statusTexto` já pronto) |
| `agendaExcluir` | remove um compromisso pelo `idCalendar` (tolerante a id vazio) | `excluirEventoDaAgenda_` |

A diferença-chave: **o que sai do Apps Script é a leitura do Sheets**. `sincronizarEntregaNaAgenda_` lia o Financeiro
(`calcularStatusFinanceiro_`) para montar a descrição; agora o **front calcula o texto de pagamento a partir do PB** e
manda pronto (`statusTexto`). A função ganhou um 2º argumento opcional — sem ele, mantém o comportamento antigo (lê do
Sheets), então **nada quebra** no fluxo atual.

No front, o novo **`assets/js/pbAgenda.js`** orquestra isso (não entra em `PB_ACTIONS` — é utilitário de outros adapters):
- `sincronizarAgendaEvento(recEvento)` e `sincronizarAgendaEntrega(recProducao)` chamam o GAS fino e **gravam de volta**
  `id_calendar` / `id_calendar_entrega` no record do PB. **Fail-soft**: se a Agenda falhar, a escrita no PB **não** cai
  (espelha o `try/catch` que o back-end já fazia em `atualizarEvento`/`atualizarProducao`).
- `excluirAgenda(idCalendar)` para remover o compromisso antes de um delete.
- `statusEntregaTexto_` replica `calcularStatusFinanceiro_` + `formatarMoeda_` a partir das globais (que na v3.2 já vêm
  do PB), sem tocar no Sheets.

Com isso, **a sincronização de entrega na Agenda** (o `TODO` da Fase 1 em `pbProducao.js`) passou a ser feita de verdade:
ao salvar a produção com `Data entrega`, o front chama `sincronizarAgendaEntrega` e guarda o `id_calendar_entrega`.
`pbAgenda.js` (`?v=3.15.3`) entra em `crm.html` logo após `pbEscrita.js`; `pbProducao.js` subiu para `?v=3.15.3`. Tudo
ainda **inerte** enquanto `USE_POCKETBASE_ESCRITA=false`.

**Pendências conhecidas (próximas fases):** a cascata **lead "Fechado" → cria evento** (em `pbLeads.js`) e os
**invariantes de evento** dependem da **Fase 3** em `pb_hooks`: cascata criar-evento→produção→conta, `atualizarEvento`→
conta ao confirmar, cascade-delete com guarda `valorPago>0` (disparando `excluirAgenda` antes do delete) e 3-strikes de
cobrança. O **cutover** (Fase 4) liga a flag mestra e aposenta o `sincronizarPB.gs`.

**Fase 3 — núcleo de Eventos + cascata do lead + cobrança + Financeiro/coletivo (COMPLETA: 3a + 3b + 3c + 3d).** Decisão (2026-10-09, revista
com a superfície completa à vista): **front-first** — a lógica pesada roda em adapters no front (valido com `node --check`,
deploy só de front), e **só a guarda de exclusão** vira `pb_hook` (rede server-side contra perda acidental de dinheiro).
Motivo: é um CRM de **usuária única** (só o navegador escreve), então o ganho de hook (cliente adversário/concorrência)
quase não existe; e hooks exigem `scp`+restart na VM de produção para cada ajuste, sem como testar localmente.

- **`assets/js/pbEventos.js`** (novo) — `criarEvento`/`atualizarEvento`/`excluirEvento`/`excluirProducao`:
  - **criar**: resolve o cliente, grava o evento (sem `id_evento` → hook da Fase 0) e roda a **cascata sequencial** —
    cria a **produção** (11 etapas em "Não iniciado") sempre, e, se o status for `Confirmado`, a **conta pendente**
    "Saldo do evento" no Financeiro. A Agenda é orquestrada por `pbAgenda.js` (grava `id_calendar` de volta), fail-soft.
  - **atualizar**: PATCH parcial, sincroniza a Agenda e, quando o status passa a `Confirmado` (não era), gera a conta
    pendente. *(A reaplicação de valores aos participantes de evento coletivo fica para a sub-fase 3d.)*
  - **excluir**: guarda `valorPago>0 && !forcar` (mesma mensagem do back-end), remove os compromissos da Agenda
    (evento e entrega) e **cascateia** produção, financeiro, custos e participantes antes de apagar o evento.
- **`pbLeads.js`** — resolvido o TODO da Fase 1: quando um lead passa a **"Fechado"** (e não era), cria o evento
  correspondente com status "Aguardando aprovação" (espelha o back-end), fail-soft.
- **`infra/pb_hooks/delete_guard.pb.js`** (novo, **versionado mas NÃO implantado**) — `onRecordBeforeDeleteRequest` em
  `financeiro` que bloqueia excluir uma parcela com `valor_pago>0` sem `?forcar=1`. **Só vai para a VM no cutover
  (Fase 4):** enquanto o Sheets for master, o espelho `sincronizarPB.gs` **deleta** registros no PB ao reconciliar, e o
  hook quebraria esse espelho. Fica guardado, pronto para subir quando o espelho sair de cena.
- `pbEventos.js?v=3.15.4` entra após `pbAgenda.js`; `pbLeads.js` subiu para `?v=3.15.4`. Tudo **inerte** sob a flag.

**Sub-fase 3c — cobrança/3-strikes (feita).** Novo **`assets/js/pbCobranca.js`** porta as cinco funções do Apps Script
(backend.txt 1415-1487 / 1959-2016) como ações do `PB_ACTIONS`: `registrarEnvioManual` (a que o front chama de fato, via
`mensagens.js → marcarEnvio`), `registrarTentativaCobranca`, `bloquearClienteCobranca`, `desbloquearClienteCobranca` e
`obterHistoricoCobranca`. O log de cobrança acumula em `financeiro.observacoes_cobranca` (separado por `---`) e o contador
em `financeiro.tentativas_cobranca`; ao atingir **3 envios** o cliente é **auto-bloqueado** (a parcela no PB já carrega
`id_cliente`; se faltar, resolve via o evento — como o backend). O auto-bloqueio é **fail-soft** (não derruba o registro).
Como a coleção `clientes` não tinha as colunas de bloqueio, foi criada a migração **`infra/pb_migrations/1793000201_add_bloqueio_cobranca.js`**
(adiciona `bloqueado_cobranca`/`motivo_bloqueio`/`data_bloqueio`, aditiva e nullable — não afeta o espelho; só precisa estar
na VM **até a Fase 4**). `pbCobranca.js?v=3.15.5` entra após `pbLeads.js`. **Inerte** sob a flag.

**Sub-fase 3d — Financeiro completo + evento coletivo (feita; fecha a Fase 3).** Dois adapters novos:
- **`assets/js/pbFinanceiro.js`** — `salvarConta` (plano de cobrança inteiro: Entrada fora da contagem + parcelas
  renumeradas 1..N; atualiza por `id_parcela` existente ou cria nova — o hook da Fase 0 atribui o `id_parcela`;
  reconcilia a linha de `Desconto` e sincroniza o status na Agenda de entrega, fail-soft) e `excluirContaFinanceiro`
  (conta do evento inteiro ou, com `idCliente`, só a de um participante; guarda `valorPago>0 && !forcar`). O helper
  compartilhado `reconciliarDescontoConta_` cria/atualiza/remove a linha dedicada `Desconto`. backend.txt 721-840 / 1266-1289.
- **`assets/js/pbColetivo.js`** — `criarEventoColetivo` (responsável = organizador, `coletivo='Sim'`, **sem** conta
  pendente; produção + Agenda únicas, reusa `pbCriarProducao_`), `importarParticipantes` (dedup por nome no evento,
  cria a linha em `participantes` e lança a conta do pacote por participante via `salvarConta`) e `atualizarParticipante`
  (status/observações/fotos extras/desconto; `Não quis` cancela as contas em aberto). Helpers `valorFotoExtraDoEvento_`
  (coluna do evento → fallback no cadastro de Pacotes), `recalcularFotosExtrasParticipante_` e `reaplicarPacoteParticipante_`
  (preservam o `Valor pago`). backend.txt 1514-1753.
- **`pbEventos.js`** ganhou a reaplicação de valores do coletivo no `atualizarEvento` (quando muda Valor pacote/foto
  extra num evento `coletivo='Sim'`, propaga aos participantes — backend 384-396), resolvendo o TODO da 3a.
- `atualizarParticipante` retorna minimalista (`{id, atualizado:true}`) de propósito: o front cai no `carregarTudo()` e
  relê do PB com as chaves rotuladas (evita mismatch de shape snake×rótulo). `pbEventos.js?v=3.15.6`; novos
  `pbFinanceiro.js?v=3.15.6` + `pbColetivo.js?v=3.15.6` (ordem: Financeiro antes do Coletivo). **Inerte** sob a flag.

**Fase 4 — cutover (CONCLUÍDO e aplicado na VM em 09/10/2026).** A flag mestra
`USE_POCKETBASE_ESCRITA` passou a **`true`** (`config.js?v=3.15.7`): o PocketBase virou o **master de escrita** e
o Apps Script encolheu para **só a cola da Google Agenda**. O `api.js` roteia **Clientes e todo o resto** pelo
PB sob a flag mestra (`USE_POCKETBASE_CLIENTES` fica `false`, redundante). **Rollback = voltar a flag para
`false`** + bump `?v=` + push. Passos de servidor executados (runbook versionado **`infra/vm/cutover_fase4.md`**),
todos verificados por smoke-test: (1) backup fresco do `pb_data`; (2) migração `1793000201_add_bloqueio_cobranca.js`
→ `pb_migrations/`; (3) **removida a chamada `sincronizarPBPorAcao_` do `backend.txt`** e Apps Script fino
reimplantado → o `sincronizarPB.gs` está **aposentado**; (4) `delete_guard.pb.js` → `pb_hooks/` +
`systemctl restart pocketbase` (health 200, migração aplicada); (5) front publicado com a flag ligada;
(6) smoke-test (evento Confirmado→produção+conta+Agenda, cobrança, guarda bloqueando exclusão de parcela paga,
coletivo, 3-strikes) **passou**; (7) backup pós-cutover. **O Google Sheets deixou de ser master** e fica como
arquivo morto/read-only (rede de segurança por alguns dias). **Objetivo da v3.3 atingido.**

### 2.29 Mensagens do sistema (SweetAlert2) + Loading por view e nas escritas (v3.4)

Duas melhorias de UX. **(1) Confirmações/alertas:** as confirmações de exclusão usavam o `confirm()` **nativo**
do navegador (sem identidade, com o cabeçalho "127.0.0.1:5500 says"). Agora usam **SweetAlert2** (via CDN
`sweetalert2@11/.../sweetalert2.all.min.js`, carregado antes do `ui.js`), responsivo/mobile por padrão. Um wrapper
fino **`confirmarAcao({ titulo, texto, confirmar, perigo })`** em `ui.js` desacopla os call-sites da lib (retorna
`boolean`; `buttonsStyling:false` reusa as classes `.btn` do Bootstrap já carregado) e cai no `confirm()` nativo
se a CDN falhar. Migrados os **8** pontos de `confirm()`: `ui.js` (`excluirComConfirmacao`) + `eventos.js`,
`eventosColetivos.js`, `financeiro.js`, `templates.js` (inclui os diálogos de **exclusão forçada** quando há valor
recebido). O `showToast` foi mantido. Tema alinhado aos tokens do `crm.css` (`.swal2-popup/title`, Fraunces no
título).

**(2) Loading:** a lentidão ao abrir **Análise** (`dashboardCobrancas`) e **Cobranças** (`contasEmAtraso`) era
**render síncrono** (ApexCharts + tabelões), não rede — a tela "congelava" sem feedback. Agora `renderMain`
(`router.js`) injeta um **spinner por view** (`.spinner-border` do Bootstrap, via `viewLoadingHTML`) e **cede um
frame pintado** (`proximoFrame`, duplo `requestAnimationFrame`) **antes** do render pesado, então o spinner
aparece de fato. Para as **ações de escrita**, `apiCall` (`api.js`) passou a envolver as chamadas com um
**overlay global** `mostrarAppBusy()`/`esconderAppBusy()` (reentrante, com atraso de ~150 ms para não "piscar" em
operações rápidas). CSS novo em `crm.css`: `.view-loading` e `.app-busy`. **Fora de escopo** (combinado): barra
NProgress e migrar o `showToast` para toast do SweetAlert2. Assets tocados em `?v=3.15.8` (`crm.css`, `api.js`,
`ui.js`, `router.js`, `modules/{eventos,eventosColetivos,financeiro,templates}.js`); `node --check` OK em todos.

---

### 2.30 Análise e Cobranças instantâneas — cálculo local do snapshot PocketBase (v3.5)

Continuação da v3.4. Lá o spinner **mascarava** a espera das telas **Análise** (`dashboardCobrancas`) e
**Cobranças** (`contasEmAtraso`); aqui a espera foi **eliminada**. Revisando, a lentidão dessas duas telas **não
era render síncrono — era rede**: elas disparavam fetches ao **Apps Script / Google Sheets** (`renderContasEmAtraso`
→ `listarContasEmAtrasoComFiltros`; `renderDashboardCobrancas` → `resumoCobrancas` **e** `relatorioCobrancas` em
**cascata**). Pior: pós-cutover (`USE_POCKETBASE_ESCRITA=true`) o Sheets virou **espelho possivelmente defasado**,
então os números podiam vir **velhos**.

Como o `carregarTudo()` (`pbLeitura.js`) **já traz todas as parcelas do PocketBase e já deriva `contasEmAtraso`**
(vencidas, com `diasEmAtraso`, ordenadas) — e o `renderMain` garante esse load antes de qualquer view — as duas
telas passaram a **calcular tudo localmente**, com **zero rede**:
- **Cobranças** usa direto o global `contasEmAtraso`.
- **Análise** usa dois derivadores novos em `cobrancas.js` — **`derivarRelatorioCobrancasLocal_()`** (lista por
  conta: saldo, `prioridade` por faixa de dias, tentativas, status) e **`derivarResumoCobrancasLocal_()`**
  (KPIs, distribuição de tentativas, urgência) — reproduzindo o mesmo contrato que o Apps Script devolvia.
- **Exportar CSV** também passou a usar o derivador local (filtros cliente/valor/dias aplicados em memória).

Resultado: abertura **instantânea** e números **consistentes com o master de escrita** (PocketBase). As faixas de
urgência seguem as já exibidas (>30 crítica, 15–30 alta, 7–15 média, <7 baixa); bloqueio usa `tentativas ≥ 3` como
proxy (o flag não é exposto no `clientes[]` em memória). **Sem** mexer em `apiCall`/roteamento nem remover as
actions do Apps Script (ficam como legado/rollback). Asset tocado: `modules/cobrancas.js?v=3.15.9`; `node --check` OK.

---

### 2.31 Seletor de data e hora com flatpickr (v3.16)

Todos os campos de data e hora do CRM, que eram texto puro com máscara, ganharam um seletor visual
(**flatpickr 4.6.13**, via CDN, com o locale pt-BR). O **Contrato Digital (`index.html`) não foi alterado**.

**Contrato de dados inalterado.** O `.value` continua sendo o mesmo texto de antes (`DD/MM/AAAA` e `HH:MM`),
então `apiCall`, os adapters `pb*.js`, o Apps Script, o `parseDataBR` e o Dashboard não mudaram. **Não exige
reimplantar o Apps Script nem aplicar migrations.**

**Como funciona.** Basta marcar o campo com `data-picker="date"` ou `data-picker="time"`. Um `MutationObserver`
(em `ui.js`) inicia o seletor quando o campo entra no DOM e o destrói quando sai — isso cobre formulários em
overlay, as linhas dinâmicas de parcelas do Financeiro e a edição inline de Leads, sem chamadas por tela.
- **Data:** formato `d/m/Y`, calendário em português.
- **Hora:** 24h, com passo de **5 minutos** nas setas do seletor (digitar um minuto fora do passo, como `09:32`, continua permitido).
- **Digitação:** `allowInput` ligado e a máscara (`maskData`/`maskHora`) mantida para quem prefere digitar.
- **Mobile:** `disableMobile: true`, para o seletor do flatpickr valer também no celular e o texto continuar no mesmo formato.
- **Idioma:** o `pt.js` do flatpickr traduz dias e meses (`flatpickr.l10ns.pt`), mas deixa em inglês os títulos e aria-labels (semana, ano, mês, hora, minuto). O `ui.js` complementa o locale com `PICKER_LOCALE_EXTRA` (em português). Cuidado: a propriedade é `l10ns` (com "s"), não `l10n`.
- **Atribuição por código:** usar `definirValorPicker(id, valor)` (em vez de `.value = ...`) para manter o estado interno do flatpickr em sincronia — usado no formulário de pagamentos do Freelance.

**Campos migrados (14 de data + 5 de hora):**
- Eventos e Eventos coletivos: data do evento, hora início e hora fim.
- Leads: data desejada, próximo contato (formulário e edição inline).
- Custos: data.
- Produção: data e hora de entrega.
- Financeiro: data de pagamento da entrada e, em cada parcela, vencimento e data de pagamento.
- Freelance: data do evento, data do pagamento e o filtro De/Até.

**Arquivos tocados** (`?v=3.16.0`, e `ui.js` em `?v=3.16.1`): `crm.html` (CDN do flatpickr), `assets/css/crm.css` (tema da marca no bloco
"flatpickr"), `assets/js/ui.js` e `modules/{eventos,eventosColetivos,leads,custos,producao,financeiro,freelance}.js`.
`node --check` OK; comportamento validado em jsdom (inicialização/destruição, formato do valor, máscara, 24h/5 min,
linhas dinâmicas sem vazamento de calendários).


### 2.32 Contrato Digital — qualificação da CONTRATADA com CNPJ (MEI) (v3.17)

Com a abertura do MEI, a cláusula **"QUALIFICAÇÃO DAS PARTES"** do contrato gerado pelo `index.html`
(`buildClauses()`) passou a qualificar a CONTRATADA como pessoa jurídica:
- **CNPJ** 69.546.199/0001-54, na condição de **microempreendedora individual (MEI)**.
- **Nome empresarial** "69.546.199 Cibele Matozo de Lara" e **nome fantasia** Cibele Matozo Fotografia (antes só o nome fantasia aparecia).
- **Endereço comercial** completo, com complemento "casa 5" e CEP 81870-070 (antes: "residente e domiciliada", sem complemento nem CEP).
- CPF, e-mail e WhatsApp mantidos; a qualificação do CONTRATANTE não mudou.

Só texto do contrato: **não exige reimplantar o Apps Script nem aplicar migrations**. Arquivo tocado: `index.html`. `node --check` OK.

### 2.33 Orçamento em PDF, Produtos, formulário de lead e Agenda do próximo contato (v3.18)

**Orçamento em PDF (menu CRM · Orçamentos).** Cada lead gera uma proposta em PDF, montada no navegador (jsPDF 2.5.1), com a identidade visual do contrato (logo, dados da empresa, creme/dourado). Conteúdo: apresentação, serviços inclusos, investimento (total em destaque), opcionais, contratação/pagamento e entrega.
- **Versionamento:** só os dados que aparecem no PDF (cliente, tipo, data, instituição, pacote, desconto, extras aplicáveis e produtos) entram no hash. Se mudarem, o lead fica **"vN · desatualizado"** e o botão vira "Salvar e gerar orçamento vN+1". Outras edições (etapa, observações...) não exigem nova versão.
- Histórico imutável na coleção `orcamentos` (snapshot JSON); cada versão pode ser baixada de novo ou enviada por WhatsApp (link `wa.me` com texto pronto; o PDF é anexado à mão).
- A versão/hash só são gravados no lead depois que o registro do orçamento foi salvo; falha ao gerar o PDF não desfaz o salvamento.

**Formulário de lead em tela cheia** (nova view `leadForm`, em `modules/leadForm.js`), em seções, com total ao vivo. Campos novos conforme o tipo de evento: beca com capelo/canudo (Formatura), **ensaio pré-evento** (Aniversário, 15 anos, Casamento, Bodas e Formatura — não Crisma), quadro de formatura em moldura de vidro e álbum, além de **instituição**. `valor_estimado` = pacote + produtos (o desconto fica separado), então valor ponderado e evento criado ao fechar o lead continuam corretos. A edição rápida na lista ficou só com Etapa e Próximo contato.

**Cadastro de Produtos** (menu Serviços, após Pacotes): nome, descrição, valor, cobrança unitária ou fixa, tipos de evento aplicáveis e ativo. **Pacotes** ganharam itens inclusos, prazo de entrega e tipos de evento.

**Agenda do Próximo contato.** Ao salvar um lead com "Próximo contato", cria-se um evento de **dia inteiro** no Google Calendar com cliente, WhatsApp, tipo/instituição, data desejada, pacote, valor e etapa. O evento é atualizado quando algum desses dados muda, removido se a data for limpa e excluído junto com o lead (id guardado em `leads.id_calendar`). Fail-soft: falha na Agenda não derruba o salvamento.

**Deploy necessário:**
1. Copiar `infra/pb_migrations/` para a VM e reiniciar o PocketBase (novas: `1793000300_create_produtos`, `1793000301_create_orcamentos`, `1793000302_add_campos_pacotes`, `1793000303_add_campos_leads_orcamento`; as migrations de `eventos`, `pacotes` e `leads` foram regeneradas) e atualizar `infra/pb_hooks/auto_id.pb.js`.
2. Colar a função `agendaSincronizarLead` e o `case 'agendaSincronizarLead'` do `doPost` no `Código.gs` e **reimplantar como nova versão**.

Arquivos: `pbSchema.js`, `pbProdutos.js`, `pbOrcamentos.js`, `pbLeads.js`, `pbPacotes.js`, `pbAgenda.js`, `pbLeitura.js`, `orcamentoRegras.js`, `orcamentoPdf.js`, `modules/{leadForm,produtos,leads,pacotes}.js`, `router.js`, `state.js`, `config.js`, `api.js`, `crm.css`, `crm.html`, geradores em `infra/`. `node --check` OK.

**v3.18.1 (correções).** (1) A grade "Disponível para os eventos" (Pacotes e Produtos) aparecia desformatada porque os checkboxes herdavam o estilo de campo de texto; agora é uma grade de checkboxes (`crm.css`). (2) O formulário do lead ganhou o campo **"Itens inclusos neste orçamento"** abaixo do Pacote: é preenchido com os itens do pacote ao selecioná-lo e pode ser editado só para aquele lead, sem passar pelo cadastro de pacotes. Fica em `orc_dados.itens`, entra no hash (alterar gera nova versão) e alimenta o PDF; sem texto próprio, vale o do pacote. Não exige migration nem reimplantar o Apps Script. Arquivos: `orcamentoRegras.js`, `modules/leadForm.js`, `crm.css`, `crm.html`.

**v3.18.2 (correção).** Gerar o orçamento falhava com *"Failed to create record"*: o `create` em `orcamentos` voltava 400 com `id_orcamento: Missing required value`. No PocketBase 0.22 a validação roda **antes** do hook `auto_id.pb.js`, então o campo `id_<entidade>` não pode ser `required` (o hook o preenche logo depois; a unicidade segue garantida pelo índice UNIQUE). A mesma falha atingiria qualquer criação pelo CRM (leads, pacotes, produtos...). Nova migration `1793000304_relax_required_ids.js` (idempotente) relaxa o campo nas 12 coleções com hook; `gen_pb_migrations.cjs` passou a gerar o campo como não obrigatório. Exige copiar a migration para a VM e reiniciar o PocketBase (já aplicado em 2026-10-16).

**v3.18.3.** O histórico de orçamentos no formulário do lead deixou de ser tabela e virou linhas flexíveis (`.lf-hist-row`), com os botões PDF/WhatsApp quebrando de linha no mobile em vez de estourar a tela. O botão WhatsApp agora gera o PDF como `File` (`orcArquivoPdf_`) e, quando o navegador suporta a Web Share API com arquivos (celulares), abre a folha de compartilhamento com o PDF anexado e a mensagem — basta escolher o WhatsApp e o contato. Em navegadores sem esse suporte (desktop), mantém o fallback anterior: baixa o PDF e abre a conversa em `wa.me` com a mensagem. Limitação: o `wa.me` não aceita anexo, e enviar o documento direto a um número exigiria a API oficial do WhatsApp Business (backend), fora do escopo.

**v3.18.4 (correção).** (1) Ao mudar o lead para **Fechado**, o evento criado automaticamente ("Aguardando aprovação") agora também recebe a conta pendente "Saldo do evento" com o valor do orçamento (valor − desconto), em `pbLeads.js`; antes a conta só nascia quando o evento virava Confirmado. `pbCriarContaPendente_` (`pbEventos.js`) ficou idempotente: se o evento já tem parcelas, não cria outra (evita duplicar na confirmação posterior). (2) A aba **Financeiro** do evento não mostrava contas lançadas pelo menu Financeiro: as parcelas de evento individual são gravadas com o `id_cliente` do responsável, mas `contaDoEvento` só aceitava contas sem cliente. `agruparContas` (`modules/financeiro.js`) agora trata o cliente do próprio evento individual como a conta única do evento (coletivos seguem com uma conta por participante), inclusive para parcelas já gravadas. Não exige migration nem reimplantar o Apps Script. Arquivos: `pbLeads.js`, `pbEventos.js`, `modules/financeiro.js`, `crm.html`.

**v3.18.6 (vocabulário).** No Financeiro quem registra é a fotógrafa **recebendo** do cliente, então "Pago" passou a "Recebido": status da entrada e da parcela (lista `Status cobrança`), textos de ajuda, "Valor recebido" e "Data do recebimento" no formulário da conta, coluna e etiqueta nas abas Financeiro do evento e do coletivo, status de participante, texto de pagamento no compromisso da Agenda e mensagens de exclusão ("recebimento(s)"). **Custos e Freelance não mudam** (ali é o usuário quem paga). O valor gravado também foi renomeado: a migration `1793000306_rename_status_pago_para_recebido.js` (idempotente, com `down`) converte `listas` ("Status cobrança"), `financeiro.status` e `participantes.status_compra`; o código passou a comparar `'Recebido'` (`pbFinanceiro.js`, `pbLeitura.js`, `pbColetivo.js`, `modules/eventos.js`, `modules/eventosColetivos.js`). **Ordem de deploy:** aplicar a migration na VM e reiniciar o PocketBase junto com a publicação do front; entre um e outro, parcelas ainda "Pago" deixam de ser reconhecidas como recebidas nas telas. Também atualiza o `?v=` dos scripts tocados (inclui `pbEventos.js`/`pbLeads.js`, que estavam com cache antigo desde a v3.18.5). Arquivos: `modules/{financeiro,eventos,eventosColetivos}.js`, `pbFinanceiro.js`, `pbEventos.js`, `pbLeitura.js`, `pbColetivo.js`, `pbAgenda.js`, `crm.html`, `docs/MODULO_COBRANCA.md`.

**v3.18.7 (correção).** Na lista do menu **Produção**, a coluna "Edição" lia só `Edição foto`; ao mudar apenas a "Edição vídeo" (produções só de vídeo) a lista seguia em "Não iniciado". A coluna foi separada em **Edição foto** e **Edição vídeo**, cada uma com a etiqueta de status (verde quando "Concluído"); não há status combinado porque uma produção pode ter só uma das edições. O salvamento já estava correto. Não exige migration. Arquivos: `modules/producao.js`, `crm.html`.

**v3.18.8 (melhoria).** As etapas **Backup, Seleção, Edição foto, Edição vídeo, Álbum e Aprovação do cliente** do formulário de Produção ganharam a opção **"Não se aplica"** (ex.: evento sem edição de vídeo), pois "Não iniciado/Em andamento/Concluído" confundia nesses casos. **Entrega final** continua só com as três opções originais. O valor é gravado como texto nos campos já existentes e aparece na lista de Produção e na aba Produção do evento com a etiqueta neutra. Os eventos já existentes não mudam (seguem em "Não iniciado" até serem editados). Não exige migration. Arquivos: `modules/producao.js`, `crm.html`.

### 2.34 Vitrine de Fotos — Fase 1 (v3.19)

Resolve a entrega de fotos hoje feita só com um link cru do Google Drive: o
evento ganha uma **galeria pública própria**, com a marca da fotógrafa, link
exclusivo (token + senha opcional + validade opcional) e duas fontes de
imagem à escolha — upload direto no sistema, ou link de uma pasta do Drive
já existente. Seleção de fotos, marca d'água e contador de download ficam
para as próximas fases.

**Novo menu "Vitrine de Fotos"** (grupo Ferramentas, `modules/vitrines.js`):
criar/editar vitrines por evento, escolher tema (Noir/Linen/Terra), cor,
tipografia e capa, copiar o link público, pausar/reativar, revogar o link
(gera um token novo sem apagar a vitrine) e, no modo upload direto, enviar e
excluir fotos (`vf_fotosGrid`, thumbs geradas pelo próprio PocketBase).

**Página pública `vitrine.html`** (sem login): lê `?token=`, busca a vitrine
e as fotos diretamente no PocketBase usando as **regras de acesso públicas**
da Fase 1 (`@request.query.token`/`senha_hash`, comparado no próprio banco —
nunca guardamos senha em texto puro, só o SHA-256 calculado no navegador).
Se a vitrine tiver senha, mostra um formulário antes de liberar a galeria
(não dá para avisar separadamente "senha errada" vs. "link expirado": a
regra do PocketBase só esconde o registro, não diz o motivo — limitação
aceita conscientemente). Galeria com grade, lightbox e download por foto ou
"baixar todas" (dispara downloads espaçados; não é um .zip real).

**Duas coleções novas, só no PocketBase** (`pbSchema.js` → `vitrines` e
`vitrine_fotos`, geradas por `gen_pb_migrations.cjs`): são as primeiras do
projeto com `rules` de acesso **customizadas por coleção** (o resto do app
usa a mesma regra `@request.auth.id != ''` para as 5 operações) e com campos
`file`/`date`/`relation` nativos do PocketBase (o resto do app usa texto
DD/MM/AAAA e fk numérico simples — aqui são exceções deliberadas: `date`
porque a regra pública precisa comparar com `@now` no banco, e `relation`
(não fk) porque a regra pública precisa expandir `id_vitrine.token`/`.status`/
`.validade` sem duplicar esses campos em cada foto). `gen_pb_migrations.cjs`
e `gen_pb_hooks.cjs` ganharam suporte a esses tipos/regras sem alterar a
saída das migrations já aplicadas (conferido por diff).

**Armazenamento do upload direto:** por padrão vai para o disco da própria
VM; para usar **Cloudflare R2** (gratuito até 10GB, egress sempre grátis —
ver análise na conversa de planejamento), basta configurar em *PocketBase
Admin UI → Settings → Files storage → S3* com as credenciais do bucket.
Nenhum código muda — o SDK do PocketBase abstrai local vs. S3.

**Modo Google Drive sem conta de serviço:** em vez de um projeto novo no
Google Cloud, `vitrine.html` chama o **mesmo** `CRM_API_URL` (Apps Script) por
GET — `infra/apps_script/listarFotosVitrine.gs` é colado como um `.gs` a mais
no projeto já existente (que já roda sob a conta Google da fotógrafa, dona
das pastas). Cada arquivo tem a permissão ajustada para "qualquer um com o
link pode visualizar" na hora da listagem, para o `<img>`/download funcionar
direto no navegador do cliente.

**Deploy necessário:**
1. Copiar `infra/pb_migrations/1793000400_create_vitrines.js` e
   `1793000401_create_vitrine_fotos.js` para a VM e reiniciar o PocketBase;
   atualizar `infra/pb_hooks/auto_id.pb.js` junto (ganhou os hooks de
   `id_vitrine`/`id_foto`).
2. Colar `infra/apps_script/listarFotosVitrine.gs` no projeto Apps Script
   existente (checar antes se já não há um `doGet` lá — se houver, mesclar
   em vez de sobrescrever) e reimplantar a mesma implantação (nova versão).
3. Opcional: configurar o bucket R2 em *PocketBase Admin UI → Settings →
   Files storage* se não quiser usar o disco da VM para os uploads diretos.

Arquivos: `pbSchema.js`, `pbVitrines.js`, `pbLeitura.js`, `modules/vitrines.js`,
`vitrine.html`, `router.js`, `config.js`, `state.js`, `api.js`, `crm.css`,
`crm.html`, `gen_pb_migrations.cjs`, `gen_pb_hooks.cjs`,
`infra/apps_script/listarFotosVitrine.gs`. `node --check` OK.

**v3.19.1–v3.19.5 (correções, testadas ao vivo com a fotógrafa).** (1) Capa
aceitava só URL de imagem direta — link de "ver" do Drive (`/view?usp=sharing`)
quebrava (`NS_ERROR_DOM_NETWORK_ERR`); `vitrine.html` agora converte link do
Drive pra URL de thumbnail sozinho. (2) Lightbox (ampliar foto) no modo Drive
usava a URL de *download* como `<img src>` — o Drive bloqueia isso como
recurso incorporado (403/CORB); passou a usar a URL de thumbnail (maior,
`w2000`) só pra ampliação, mantendo a URL de download só no botão de baixar.
(3) Capa ganhou campo **"Posição da capa"** (Topo/Centro/Base — `capa_posicao`,
migration `1793000402`) pra não cortar o rosto/assunto quando o recorte
central não funciona. (4) A vitrine demorava a abrir no modo Drive porque o
Apps Script reajustava a permissão de compartilhamento de CADA foto em TODA
visita; `listarFotosVitrine.gs` passou a pular essa chamada quando já está
compartilhado e a cachear a listagem por até 6h (`CacheService`) — e a capa/
título agora aparecem na hora, com spinner só na grade enquanto as fotos
carregam. (5) O rótulo "Capa (URL de uma imagem)" quebrava linha e desalinhava
a grade de 3 colunas no formulário; encurtado para "URL da capa" (conferido
em desktop e mobile). Arquivos: `vitrine.html`, `modules/vitrines.js`,
`infra/apps_script/listarFotosVitrine.gs`, `pbSchema.js`,
`infra/pb_migrations/1793000402_add_capa_posicao.js`, `pbVitrines.js`.

### 2.35 Vitrine de Fotos — Fase 2: seleção de fotos (v3.19 Fase 2)

Cliente passa a **escolher as fotos** direto na vitrine pública, até o limite
do pacote contratado (avisa mas deixa passar — cobrança de fotos extras
continua fora do escopo), e um botão **"Finalizar seleção"** que trava a
escolha e avisa a fotógrafa.

**Na vitrine pública:** cada foto ganha um coração (🤍/❤️) pra marcar/
desmarcar — cada clique cria/apaga uma linha em `vitrine_selecoes` na hora
(sem rascunho local: fechar a aba não perde a seleção). Contador "X de Y
selecionadas" acima da grade; passando do limite do pacote, mostra "(+N
extras)" sem bloquear. "Finalizar seleção" grava um registro em
`vitrine_finalizacoes` — um **pb_hook** (`notificar_selecao.pb.js`) carimba
`vitrines.selecao_finalizada_em`/`qtd_fotos_selecionadas_final` (só o servidor
grava isso; a regra de escrita da vitrine continua exigindo login) e manda um
e-mail pra fotógrafa via **Resend** (grátis até 3.000/mês). Depois de
finalizar, a vitrine reabre travada (sem corações, sem botão de finalizar) com
um aviso "✅ Seleção finalizada em DD/MM — N foto(s)"; download continua livre.

**No CRM:** campo novo **"Qtd. de fotos do pacote"** no formulário da vitrine
(sugerido automaticamente a partir do pacote do evento ao criar, sempre
editável) e um selo "✅ Seleção finalizada (N)" + botão **"❤️ Ver seleção"** na
lista, que abre as miniaturas do que o cliente escolheu.

**Duas coleções novas** (`vitrine_selecoes`, `vitrine_finalizacoes`) seguem o
mesmo padrão de regra pública por token da Fase 1. `vitrine_selecoes.id_vitrine`
é relation (não fk simples) pelo mesmo motivo de sempre: a regra pública
precisa expandir `id_vitrine.token`/`.senha_hash`/etc. sem duplicar esses
campos. `arquivo_ref` é texto solto (não relation) porque referencia coisas de
tipo diferente conforme a fonte da vitrine: o id nativo de `vitrine_fotos`
(upload direto) ou o id do arquivo no Drive (que nem tem registro no
PocketBase).

**⚠️ Segredo da Resend:** `infra/pb_hooks/notificar_selecao.pb.js` tem
`RESEND_API_KEY`/`EMAIL_FOTOGRAFA` com valores de exemplo — **troque só na
cópia que roda na VM** (nunca commitar a chave real, o repositório é
público). Enquanto não trocar, o hook pula o e-mail mas segue marcando a
vitrine como finalizada normalmente (testado localmente antes de aplicar em
produção).

**Deploy necessário:**
1. Copiar as migrations `1793000403_create_vitrine_selecoes.js`,
   `1793000404_create_vitrine_finalizacoes.js` e
   `1793000405_add_campos_selecao_vitrines.js` para a VM, atualizar
   `infra/pb_hooks/auto_id.pb.js` (ganhou os hooks de `id_selecao`/
   `id_finalizacao`) e `infra/pb_hooks/notificar_selecao.pb.js`
   (com a chave/e-mail reais), reiniciar o PocketBase.
2. Testado de ponta a ponta contra a produção com dados descartáveis
   (seleção, "+1 extra", finalizar, trava, limpo depois).

Arquivos: `pbSchema.js`, `pbVitrines.js`, `modules/vitrines.js`, `vitrine.html`,
`crm.html`, `infra/pb_migrations/{1793000403,1793000404,1793000405}*.js`,
`infra/pb_hooks/{auto_id,notificar_selecao}.pb.js`. `node --check` OK.

**v3.19.6 (Resend em produção).** A chave da Resend e o e-mail de aviso
(`infra/pb_hooks/notificar_selecao.pb.js`) foram configurados direto na VM —
testado com uma finalização real, e-mail confirmado recebido. O repositório
continua só com os valores de exemplo.

### 2.36 Vitrine de Fotos — Fase 3: marca d'água automática (v3.19 Fase 3)

Fotos enviadas direto no sistema (modo `upload_proprio`) ganham uma versão
com marca d'água, gerada **no navegador da fotógrafa no momento do upload**
(não na tela do cliente — por isso não dá pra "inspecionar e tirar": o
arquivo que chega no navegador do cliente já é essa versão). Decisão tomada
com a fotógrafa: enquanto a entrega final controlada não existir (Fase 4),
o botão de baixar na vitrine pública também entrega a versão com marca
d'água — senão a marca seria só cosmética (dava pra baixar o limpo igual).
Modo Google Drive **não** ganha marca d'água nesta fase (Apps Script e
PocketBase não conseguem compor imagem sem uma peça de infra nova — decisão
consciente, fica para uma Fase 3b se for necessário).

**Como funciona:** `vitrine_fotos` ganha um segundo campo de arquivo,
`preview` (migration `1793000406`, aditiva). No upload (`pbUploadFotoVitrine`),
antes de gravar, o navegador redimensiona a foto pro lado maior ~1600px
(resolução de conferência, não de impressão) e sobrepõe o texto "CIBELE
MATOZO FOTOGRAFIA" em grade diagonal (`gerarPreviewComMarcaDagua_`, Canvas
2D puro, sem lib nova) — os dois arquivos (`arquivo` original intacto e
`preview` com marca) sobem juntos no mesmo upload. `vitrine.html` passa a
servir `preview` (com fallback pro `arquivo` original, pras fotos enviadas
antes desta fase) na grade, no "ampliar" e no "baixar".

Testado localmente antes de aplicar em produção: migration aplicada numa
réplica do banco real, e o fluxo completo de upload+marca d'água conferido
visualmente contra um PocketBase de teste (imagem sintética gerada por
Canvas, marca d'água nítida e bem distribuída no resultado).

**Deploy necessário:** copiar
`infra/pb_migrations/1793000406_add_preview_vitrine_fotos.js` para a VM e
reiniciar o PocketBase.

Arquivos: `pbSchema.js`, `pbVitrines.js`, `vitrine.html`,
`infra/pb_migrations/1793000406_add_preview_vitrine_fotos.js`.
`node --check` OK.

### 2.37 Vitrine de Fotos — Fase 4: entrega final (v3.19 Fase 4)

Fecha o roteiro da Vitrine de Fotos: a fotógrafa libera uma seção
**"📦 Entrega final"** na mesma vitrine (mesmo link — não é uma página
separada), com as fotos em alta resolução **sem marca d'água**, validade e
limite de downloads próprios (independentes da validade/senha da vitrine).

**Decisões tomadas com a fotógrafa:** a entrega reaproveita as MESMAS fotos
já na galeria (sem um segundo upload de versão editada) — se o cliente
finalizou uma seleção, entrega só as selecionadas; senão, entrega a galeria
inteira (ex.: eventos sem fluxo de seleção). O contador de downloads vale
para os dois modos (upload direto e Google Drive), mas em ambos é
**"auto-declarado"**: o cliente cria um registro ao clicar em baixar (como a
seleção), não é um proxy que de fato intercepta o arquivo. Isso evitou
precisar de uma peça de infra nova pro modo Drive (que não tem como
interceptar downloads do próprio Google de qualquer forma).

**Como funciona:** `vitrines` ganha `entrega_liberada_em` (setado só pelo
botão "📦 Liberar entrega" na lista do CRM), `entrega_validade` (texto
DD/MM/AAAA, checado no navegador — não é regra do PocketBase, já que não
precisa comparar no banco), `entrega_max_downloads` e
`entrega_downloads_count` (espelhado pelo pb_hook `contar_downloads.pb.js`
a cada novo registro em `vitrine_downloads`, mesmo padrão de
`notificar_selecao.pb.js` da Fase 2). `vitrine_fotos` ganha `categoria`
(álbum opcional, ex. "Cerimônia"/"Festa" — preenchido no upload, um valor
por lote) — a entrega agrupa por categoria só quando há mais de uma usada
nas fotos entregues.

No modo upload direto, a entrega serve o `arquivo` original (sem marca
d'água) em vez do `preview`; a galeria de navegação/seleção normal continua
só com `preview`. Download que passa do limite é bloqueado na hora (alerta
+ clique ignorado), sem precisar recarregar a página.

Testado de ponta a ponta contra a produção com dados descartáveis: duas
fotos em categorias diferentes agruparam certo na entrega, e o aviso de
"limite de downloads atingido" apareceu corretamente ao simular o contador
no limite — tudo limpo depois.

**Deploy necessário:** copiar `infra/pb_migrations/1793000407_create_vitrine_downloads.js`,
`1793000408_add_campos_entrega_vitrines.js` e
`1793000409_add_categoria_vitrine_fotos.js` para a VM, atualizar
`infra/pb_hooks/auto_id.pb.js` (ganhou o hook de `id_download`) e colar
`infra/pb_hooks/contar_downloads.pb.js`, reiniciar o PocketBase.

Arquivos: `pbSchema.js`, `pbVitrines.js`, `modules/vitrines.js`, `vitrine.html`,
`crm.html`, `infra/pb_migrations/{1793000407,1793000408,1793000409}*.js`,
`infra/pb_hooks/{auto_id,contar_downloads}.pb.js`. `node --check` OK.

**Com isso, as 4 fases planejadas da Vitrine de Fotos estão completas.**

**v3.19.9 (armazenamento).** O upload direto passou a gravar no **Cloudflare R2** (bucket `cibele-vitrine-fotos`, camada grátis — 10GB, egress sempre grátis) em vez do disco da VM. Configurado via *PocketBase Admin UI → Settings → Files storage → S3* (credenciais aplicadas direto no servidor, nunca commitadas). Zero mudança de código — o SDK do PocketBase abstrai local-disk vs. S3, como já estava documentado desde a Fase 1. A única foto já enviada antes dessa mudança foi migrada (regravada no mesmo registro) e conferida byte a byte idêntica ao original; os arquivos órfãos no disco da VM foram removidos depois.

**v3.19.10 (correção).** Os avisos/confirmações da vitrine pública ("Finalizar a seleção com N foto(s)?", erro ao selecionar, limite de downloads atingido) usavam `confirm()`/`alert()` nativos do navegador — feios e sem a marca da vitrine. `vitrine.html` ganhou um modal próprio (`modalVitrine_`/`confirmarVitrine_`/`avisarVitrine_`), reaproveitando a classe `.painel` (já se adapta sozinha por tema — testado no tema "terra" com cor customizada, botão "OK" na cor da vitrine). Não usa o SweetAlert2 do CRM administrativo porque a vitrine tem tema/cor próprios por evento, diferente da marca fixa do CRM — mas segue o mesmo princípio de não usar diálogo nativo do navegador. Não exige migration. Arquivos: `vitrine.html`.

**v3.19.11 (melhoria).** Nem todo cliente deve passar pela etapa de seleção — às vezes a fotógrafa só quer disponibilizar a galeria inteira pra baixar. Novo switch **"Permitir que o cliente selecione fotos"** no formulário de vitrine (ligado por padrão — inclusive pras vitrines já existentes, já que o campo novo vazio conta como "Sim"). Desligado: a vitrine pública não busca seleções, e some o contador, os corações e o botão "Finalizar seleção" — fica só galeria + "Baixar todas as fotos" (e a entrega final, se liberada, continua entregando tudo, já que nunca há seleção finalizada nesse modo). O switch usa o componente nativo do Bootstrap (`.form-check.form-switch`); precisou de uma regra de CSS nova porque a regra geral de checkbox dentro de `.field` encolhia o switch pro tamanho de um checkbox comum. Testado visualmente (switch ligado/desligado) e de ponta a ponta contra a produção com dados descartáveis. Migration aditiva (`1793000410`) testada localmente antes de aplicar. Arquivos: `pbSchema.js`, `pbVitrines.js`, `modules/vitrines.js`, `vitrine.html`, `crm.css`, `crm.html`, `infra/pb_migrations/1793000410_add_selecao_habilitada_vitrines.js`.

**v3.19.12 (redesign).** Header da vitrine pública remodelado no modelo do Photoselect: à esquerda, logo da fotógrafa (espaço reservado — some texto estilizado enquanto não há uma imagem definida), subtítulo (ex.: nome de quem contratou), título, data e botão "Ver galeria" (rola suave até a grade); à direita, a foto de capa **inteira, sem corte** (`object-fit:contain`, redimensionada e mais leve, não pesada). Isso resolve por completo a questão do enquadramento da capa — removida a opção "Posição da capa" (Topo/Centro/Base) do formulário, já que não há mais recorte pra ajustar. Adicionada também uma linha de informação acima da grade ("N fotos nesta galeria · disponível até DD/MM/AAAA").

Novo campo **"Subtítulo"** no formulário (`vitrines.subtitulo_exibicao`, migration `1793000411`, aditiva), sugerido automaticamente a partir do responsável do evento ao criar uma vitrine nova (editável depois) — a vitrine pública não tem acesso aos dados do evento (regra de acesso exige login), então precisa desse campo próprio em vez de ler direto do evento. O campo `capa_posicao` não foi removido do banco (coluna órfã inofensiva, evita uma migration destrutiva sem necessidade), só parou de ser lido/escrito pelo código.

Testado visualmente (desktop e mobile via iframe 375px — empilha corretamente, sem corte na foto) e de ponta a ponta contra a produção com dados descartáveis (capa real do Unsplash, acentuação, contador de fotos). Arquivos: `pbSchema.js`, `pbVitrines.js`, `modules/vitrines.js`, `vitrine.html`, `crm.html`, `infra/pb_migrations/1793000411_add_subtitulo_exibicao_vitrines.js`.

**v3.19.13 (ajuste).** `VITRINE_LOGO_URL` passou a apontar pro link real da logo do estúdio (pasta do Drive da fotógrafa, convertido com o mesmo `driveImgUrl_` usado na capa — assim ela pode trocar a imagem só trocando o link, sem reimplantar nada). A logo é preta sobre fundo transparente (PNG, confirmado via `curl -sIL` que o endpoint de thumbnail do Drive preserva o alfa), então ganhou `filter:invert(1)` nos temas escuros (`noir`/`terra`) pra não ficar invisível. Depois de ver em produção com dados descartáveis (uma vitrine de teste por tema), a logo apareceu pequena demais — `.header-logo` foi de `max-width:100px;max-height:56px` para `max-width:220px;max-height:120px`. Não exige migration. Vitrines e usuário de teste usados na verificação foram apagados depois. Arquivos: `vitrine.html`.

**v3.19.14 (ajuste).** Novo pedido: logo ainda um pouco maior (`.header-logo` de `max-width:220px;max-height:120px` para `max-width:260px;max-height:140px`) e, no layout mobile (`@media max-width:760px`, onde o header empilha em coluna), a logo passou a ficar centralizada (`display:block;margin-left:auto;margin-right:auto`) em vez de colada à esquerda. Não exige migration. Arquivos: `vitrine.html`.

### 2.38 Orçamento com múltiplos pacotes (v3.20)

Até aqui cada orçamento só podia trazer **um** pacote. Na prática, muitas vezes a fotógrafa quer deixar o cliente escolher entre opções (ex.: "Essencial" vs. "Premium") dentro do mesmo PDF, em vez de gerar orçamentos separados. O formulário de lead agora tem uma lista de pacotes (botão "Adicionar outro pacote"/remover por linha), cada um com seu próprio pacote do catálogo (auto-preenche valor/itens, editável) e valor — extras (beca/capelo/canudo/ensaio) e produtos adicionais continuam valendo para qualquer pacote escolhido, e o desconto também é único (decisões tomadas com o usuário antes de implementar, para não precisar de UI por-pacote nesses três campos).

**Sem migration**: `leads.pacote` e `leads.orc_dados` já eram campos de texto/JSON livres — só mudou o que vai dentro deles. `leads.pacote` passa a gravar os nomes separados por "; " (mesmo padrão já usado em `pacotes.tipos_evento`), e `orc_dados.pacotes` vira uma lista `[{nome, valorPacote, itens}, ...]` em vez de um único `{valorPacote, itens}`. Leads antigos (de antes do v3.20, ou mesmo de antes do v3.18 sem `orc_dados` nenhum) continuam abrindo normalmente — `orcConfigDoLead_` reconhece o formato anterior e completa o nome do pacote a partir de `leads.pacote`/`leads.valor_estimado`.

**`leads.valor_estimado`** (usado no funil comercial, dashboard e "valor ponderado") precisa de um número único mesmo com vários pacotes — por decisão do usuário, vira a **média** entre os valores estimados de cada pacote (pacote + produtos, antes do desconto). O mesmo critério é usado no `orcamentos.valor_total` do histórico de versões.

**PDF** (`orcamentoPdf.js`): com 1 pacote só, o layout não muda nada (mesma seção "Serviços inclusos — Nome" + "Investimento" com o total de sempre) — inclusive snapshots **já gerados antes desta versão** (que trazem `snap.pacote` no singular, não `snap.pacotes`) continuam sendo renderizados exatamente como antes, via uma normalização no início da geração do PDF. Com 2+ pacotes, o layout muda para uma seção "Opções de pacote" (um bloco por pacote, com nome/descrição/itens), seguida de "Produtos adicionais" (se houver) e uma seção "Investimento" com uma linha "Total com `<nome do pacote>`" para cada opção — deixando claro que são alternativas, não uma soma.

**Lead "Fechado" com 2+ pacotes**: marcar o lead como "Fechado" cria automaticamente um evento (cascata já existente em `pbLeads.js`), que antes herdava `leads.pacote`/`valor_estimado` direto. Com múltiplos pacotes isso gravaria no evento real o texto "Essencial; Premium" e uma média, em vez do pacote que o cliente de fato fechou — por isso, quando há 2+ pacotes nomeados no orçamento e a etapa muda para "Fechado", aparece um campo extra "Qual pacote foi fechado?" (obrigatório nesse caso), e é esse pacote (nome + valor estimado individual) que vai para o evento criado — não a lista nem a média. Com 1 pacote só, nada muda.

Testado via Node (sem navegador): round-trip de serialização/parse de `orc_dados`, migração de leads em formato antigo/muito antigo, cálculo de totais/hash/snapshot com múltiplos pacotes, a geração do PDF (com um stub de jsPDF) nos três cenários — 1 pacote, 2+ pacotes, e snapshot legado singular —, e a lógica de escolha do pacote fechado na cascata lead→evento (1 pacote, 2+ pacotes com escolha, e fallback para leads sem essa informação). Não foi possível testar a interação do formulário num navegador real nesta sessão (sem aba compartilhada); a lógica de desenho dos blocos de pacote segue o mesmo padrão já usado (e testado em produção) para extras/produtos no mesmo formulário.

Arquivos: `orcamentoRegras.js`, `orcamentoPdf.js`, `modules/leadForm.js`, `pbLeads.js`, `crm.css`, `crm.html`. `node --check` OK nos quatro arquivos `.js`.



### 2.39 Vitrine de Fotos — marca d'água opcional (v3.20.1)

Até aqui, toda foto enviada direto no sistema (`upload_proprio`) sempre ganhava marca d'água, sem opção de desligar. Novo switch **"Aplicar marca d'água nas fotos"** no formulário de vitrine (ligado por padrão — campo novo vazio conta como "Sim", igual ao switch de seleção — vitrines já existentes continuam exatamente como estavam). Vale para as duas fontes de imagem:

- **`upload_proprio`**: o upload continua sempre gerando o `preview` com marca (igual antes — é barato, roda uma vez só no navegador da fotógrafa, e mantém a opção de ligar a marca depois sem precisar reenviar as fotos). O que muda é só qual arquivo a vitrine pública serve: com o switch ligado, `preview`; desligado, `arquivo` (original) — inclusive para o botão "baixar" durante a navegação normal, mesma lógica já usada para a entrega final.
- **`google_drive`**: antes não existia marca d'água nesse modo (adiado como "Fase 3b" por depender de reprocessar a imagem em algum lugar). Resolvido sem precisar de infra nova: quando o switch está ligado, o **navegador de quem está vendo a vitrine** baixa a foto original do Drive e desenha a marca num `<canvas>`, ao vivo — o mesmo algoritmo (texto em diagonal, redimensionado a ~1600px) já usado no upload direto, só que rodando no momento da visita em vez de uma vez só no upload. Isso só funciona porque o endpoint final de imagem do Drive (`lh3.googleusercontent.com`) manda `Access-Control-Allow-Origin: *` — confirmado com `curl -I` antes de implementar, senão o `canvas` ficaria "sujo" e travaria a geração do arquivo. A marca é aplicada **depois** que a grade já apareceu na tela (não atrasa o primeiro carregamento), foto por foto em segundo plano, com "Baixar todas as fotos" desabilitado («Preparando fotos…») enquanto isso não termina — sem essa trava, um clique apressado baixaria algumas fotos com marca e outras sem, dependendo da sorte do timing.

Sem migration que precise de dado novo além do campo: `vitrines.marca_dagua_habilitada` (texto, aditiva, `1793000412`) segue o mesmo padrão de `selecao_habilitada`. Testado: migration aplicada e verificada localmente (PocketBase 0.22.55 + cópia real das migrations/hooks de produção) antes de ir para a VM, e depois confirmada na própria produção (schema + um registro de teste gravando `'Não'`, lido de volta corretamente via Node — o mojibake que apareceu numa tentativa via `curl -d` inline foi só artefato do bash, não um bug). A lógica de decisão `preview` vs `arquivo` foi testada isoladamente (6 cenários: ligado/desligado/vazio × com/sem preview). Não foi possível testar ao vivo num navegador real nesta sessão (o tool de automação do navegador ficou instável e interrompeu até chamadas triviais) — o algoritmo de canvas em si é o mesmo já em produção desde a Fase 3, só reaproveitado contra uma imagem baixada do Drive em vez de um arquivo de upload; vale conferir visualmente (nas duas fontes, ligado e desligado) antes de confiar de olhos fechados.

Arquivos: `pbSchema.js`, `pbVitrines.js`, `modules/vitrines.js`, `vitrine.html`, `crm.html`, `infra/pb_migrations/1793000412_add_marca_dagua_habilitada_vitrines.js`. `node --check` OK em todos os `.js` e no bloco `<script>` extraído de `vitrine.html`.

**v3.20.2 (ajuste).** No desenho original, o upload direto sempre gerava o `preview` com marca d'água, e o switch só decidia qual arquivo a vitrine pública servia — assim, ligar o switch depois do upload já "ativava" a marca nas fotos existentes, sem precisar reenviar nada. O usuário pediu o oposto: só gerar o `preview` se o switch estiver ligado **no momento do upload** — evita gastar processamento à toa quando a marca nunca vai ser usada. `pbUploadFotoVitrine` agora só chama `gerarPreviewComMarcaDagua_` quando `dados.marcaDaguaHabilitada` vem `true` (o admin manda isso a partir do estado atual do switch da vitrine). Efeito colateral aceito conscientemente: se o switch estiver desligado no upload e for ligado depois, as fotos já enviadas continuam sem marca (só fotos enviadas *depois* de ligar o switch ganham `preview`) — `vitrine.html` já cai pro `arquivo` original quando não há `preview`, então não precisou mudar nada lá além do comentário. Não exige migration. Arquivos: `pbVitrines.js`, `modules/vitrines.js`, `vitrine.html` (só comentário).

**v3.20.3 (correção).** A marca d'água do modo Google Drive (v3.20.1) não aparecia em produção. Causa: `aplicarMarcaDaguaDriveNaGrade_` buscava a foto via `drive.google.com/thumbnail?id=...` (o mesmo link usado para exibir a foto normalmente), que faz um redirect 302 para `lh3.googleusercontent.com` — essa resposta de redirect **não manda `Access-Control-Allow-Origin`** (só a resposta final manda), e o Firefox recusa seguir um redirect cross-origin em modo `cors` se a resposta do 302 não tiver o cabeçalho, mesmo a URL final tendo (confirmado pelo console do usuário: "falta cabeçalho 'Access-Control-Allow-Origin' no CORS. Código de status: 302"). Isso não aparecia nos testes com `curl` porque `curl` não aplica política de CORS — só o navegador faz isso. Corrigido buscando direto o endpoint final (`https://lh3.googleusercontent.com/d/ID=w2000`, sem passar pelo redirect do `drive.google.com/thumbnail`), que sempre manda o cabeçalho liberado. A exibição normal da foto (tag `<img>`, não afetada por CORS) continua usando o link de sempre — só o fetch para gerar a marca mudou de endpoint. Não exige migration. Arquivos: `vitrine.html`.

**v3.20.4 (correção de segurança).** O usuário percebeu uma brecha: enquanto a marca d'água do modo Drive ainda está sendo aplicada em segundo plano (foto por foto), o link "baixar" e o clique pra abrir em tela cheia de uma foto *ainda não processada* continuavam apontando pro arquivo original do Drive — dava pra baixar sem marca só clicando antes da vez daquela foto específica ser processada ("Baixar todas as fotos" já ficava bloqueado até o fim, mas o download individual por card não tinha essa trava). Corrigido: cada card nasce com uma classe `pendente-marca` (ícone "protegendo…", botão de baixar com `cursor:wait`) que bloqueia tanto o clique em "baixar" (`preventDefault` + aviso) quanto o clique pra abrir em tela cheia, card por card, até aquela foto específica terminar de processar — só então o link/lightbox são liberados com a versão marcada. Também: cada foto agora tenta até 3 vezes antes de desistir (rede instável do visitante); se falhar nas 3, o card é liberado mesmo assim servindo o arquivo original sem marca — aceito conscientemente para não deixar uma foto bloqueada pra sempre por causa de uma falha de rede pontual, documentado no código. Não exige migration. Arquivos: `vitrine.html`.
