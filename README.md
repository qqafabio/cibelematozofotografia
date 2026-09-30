# Cibele Matozo Fotografia — Guia de configuração (README)

Este repositório reúne duas ferramentas independentes da Cibele Matozo Fotografia, hospedadas de graça no GitHub Pages, cada uma com seu próprio back-end em Google Apps Script:

| Ferramenta | Arquivo(s) neste repositório | Back-end |
|---|---|---|
| **Contrato Digital** — formulário que o cliente preenche (dados, pacote, cálculo automático, contrato e assinatura) | `index.html` (público, GitHub Pages) + `gerador-de-link.html` (uso interno, para criar o link personalizado por cliente) | Apps Script próprio (só existe no editor do Apps Script — não fica neste repositório) |
| **CRM** — lead, clientes, eventos, agenda, orçamentos, financeiro, produção, custos e freelance | `crm.html` (público, GitHub Pages) | Apps Script "Código.gs", espelhado localmente em `backend.txt` |

As duas ferramentas são independentes entre si (Apps Script, planilhas e implantações separadas) — só dividem o mesmo repositório e a mesma conta do GitHub Pages.

> **`backend.txt` não é versionado** (veja `.gitignore`) — ele é só uma cópia de trabalho do `Código.gs` do CRM, guardada localmente para eu poder editar o back-end com o assistente de código sem depender do editor do Apps Script. Sempre que ele for alterado, o conteúdo precisa ser colado manualmente no `Código.gs` do projeto Apps Script e reimplantado — ver "Atualizando depois de publicado" na Parte 2.

---

## Parte 1 — Contrato Digital

### Por que essa mudança

Antes, a página inteira morava dentro do `script.google.com`. Isso esbarrava num problema real: em navegadores com mais de uma conta Google logada, o Google às vezes tenta abrir o link pela conta errada e mostra "Não foi possível abrir o arquivo" — um risco real para qualquer cliente com mais de uma conta no celular ou computador.

Com a página movida para fora do Google (GitHub Pages), o cliente nunca precisa navegar até um endereço do Google para abrir o formulário — esse problema deixa de existir na etapa mais crítica, que é conseguir abrir o link. O Apps Script continua fazendo todo o trabalho pesado (planilha, PDF, e-mail), só que por trás dos panos.

Como bônus: ajustes na página (preços, textos das cláusulas, cores) passam a valer na hora, sem precisar da dança de "Nova versão" no Apps Script — essa etapa só volta a ser necessária quando você mexe no back-end (`Code.gs`).

### 1.1 Back-end no Apps Script

1. Acesse **script.google.com** com a conta Google do negócio.
2. **Novo projeto** → nomeie, por exemplo, "Contrato Digital CMF — Backend".
3. Cole o conteúdo do `Code.gs` deste projeto (mantido só no editor do Apps Script). Este projeto não precisa de nenhum arquivo Index/HTML — o formulário mora fora do Google agora.
4. Em **sheets.google.com**, crie uma planilha nova (ex.: "Contratos CMF"). Copie o ID da URL, o trecho entre `/d/` e `/edit`.
5. No **Google Drive**, crie uma pasta nova (ex.: "Contratos assinados (PDF)"). Copie o ID da URL da mesma forma.
6. No topo do `Code.gs`, preencha:
   ```js
   const PLANILHA_ID = 'COLE_AQUI_O_ID_DA_PLANILHA';
   const PASTA_DRIVE_ID = 'COLE_AQUI_O_ID_DA_PASTA_NO_DRIVE';
   const EMAIL_CIBELE = 'cibelematozofotografia@gmail.com';
   ```
7. **Implantar** → **Nova implantação** → ícone de engrenagem → tipo **App da Web**.
8. **Executar como:** Eu. **Quem tem acesso:** Qualquer pessoa.
9. **Implantar**, autorize o script quando pedido (é a própria conta autorizando o próprio script).
10. Copie o **link do app da Web** (algo como `https://script.google.com/macros/s/AKfycb.../exec`) — vai para dentro do `index.html` no próximo passo, mas **não é o link que você manda para clientes**.

### 1.2 Página do formulário no GitHub Pages

1. Antes de publicar, edite `index.html`: procure, perto do topo do bloco `<script>`, a linha
   ```js
   const APPS_SCRIPT_EXEC_URL = 'COLE_AQUI_A_URL_DO_SEU_APP_DA_WEB';
   ```
   e troque pelo link copiado no passo anterior (mantendo as aspas).
2. Suba (ou mantenha) o `index.html` na raiz do repositório publicado pelo GitHub Pages — o nome precisa ficar em minúsculas (`index.html`) para ser servido automaticamente.
3. Em **Settings → Pages** do repositório, confirme a branch (`main`) e a pasta (`/root`) usadas como fonte.
4. O GitHub mostra o link do site, algo como `https://seuusuario.github.io/seurepo/`. É esse o link definitivo do formulário.

### 1.3 Guarde o link nos lugares certos

- Cole essa URL no campo **"Link da página do contrato"** dentro do `gerador-de-link.html` (fica salva no navegador para as próximas vezes).
- É essa URL (não a do Apps Script) que vai na bio do Instagram e é encurtada com TinyURL/Bitly quando quiser um link mais curto para o WhatsApp.

### 1.4 Testando de ponta a ponta

1. Abra o link do GitHub Pages diretamente — deve carregar o formulário sem pedir login nenhum, em qualquer navegador ou conta.
2. Preencha um contrato de teste (pode usar seu próprio e-mail) e finalize.
3. Confira: a linha apareceu na planilha, o PDF foi salvo na pasta do Drive, os e-mails chegaram.
4. Se o envio final falhar, abra o Console do navegador (F12 → aba **Console**) durante o teste — se aparecer algo mencionando **CORS**, confira se copiou a URL do Apps Script corretamente (sem espaços) e se "Quem tem acesso" está mesmo como "Qualquer pessoa" na implantação.

### 1.5 Atualizando depois de publicado

- **Mudou preço, texto de cláusula, cor, ou qualquer coisa no `index.html`:** edite o arquivo e suba de novo no GitHub. Vale na hora, sem mexer no Apps Script.
- **Mudou algo no `Code.gs`** (estrutura da planilha, texto dos e-mails, layout do PDF): cole no editor do Apps Script e implante como **Nova versão**.

---

## Parte 2 — CRM

### 2.1 Módulos

Lead → Cliente → Evento (com sincronização automática no Google Agenda) → Orçamento → Financeiro (entrada + parcelas) → Produção → Custos, além de um menu à parte para lançamento de **trabalhos freelance** (serviços prestados por nós a outra empresa de foto e vídeo).

**v2.4 — Módulo de Cobranças** (✅ completo):
- Tela "📧 Cobranças" com lista de contas em atraso + filtros e paginação (Task 1.1-1.4)
- 3 templates de mensagem padrão (LEVE, MÉDIA, PESADA) com tom pessoal de estúdio + gerenciamento de templates customizados (Task 1.5)
- Copiar mensagem para WhatsApp (envio manual) com preenchimento dinâmico
- Registro de tentativas de cobrança + bloqueio automático após 3 tentativas
- Modal flutuante com drag & drop para composição de mensagens (Task 2.1)
- Dashboard executivo com KPIs, distribuição de tentativas e classificação de urgência (Task 2.2)
- Exportação estruturada de relatório em CSV com filtros avançados (Task 2.3)
- 14 endpoints de API para integração completa

### 2.2 Arquitetura

- **Frontend:** `crm.html` publicado no GitHub Pages (sem framework, sem build). A partir da v2.6 o código é dividido em `assets/css/crm.css` e vários `assets/js/*.js` carregados como scripts clássicos (ver 2.7). Toda a comunicação com o back-end passa por `apiCall(action, dados)`, que faz um `fetch` POST para a constante `CRM_API_URL` (em `assets/js/config.js`).
- **Back-end:** projeto Apps Script separado do Contrato Digital, arquivo `Código.gs`. O conteúdo é espelhado localmente em `backend.txt` (não versionado — veja aviso no topo deste guia). Funciona como uma API por ação: o `doPost` recebe `{ action, dados }` e despacha para a função correspondente, sempre devolvendo JSON (`{ ok, dados }` ou `{ ok:false, error }`).
- **Dados:** duas planilhas Google Sheets, configuradas no topo do `Código.gs`:
  - `CRM_PLANILHA_ID` — planilha principal (abas: Clientes, Eventos, CRM & Orçamentos, Financeiro, Produção, Custos, Listas).
  - `FREELANCE_PLANILHA_ID` — planilha separada, só para os trabalhos freelance (abas: Eventos, Pagamentos).
  - `CALENDAR_ID` — `'primary'` para a agenda principal da conta que implantou o script, ou o e-mail de uma agenda específica.
- As funções genéricas de planilha (`lerAbaComoObjetos_`, `anexarLinha_`, `atualizarLinhaPorId_` etc.) casam os dados pelo **nome exato da coluna no cabeçalho** de cada aba — mudar o texto de um cabeçalho na planilha exige atualizar o nome correspondente no `Código.gs`.

### 2.3 Configurando pela primeira vez

1. Em **script.google.com**, crie um projeto novo (ex.: "CRM CMF — Backend") e cole o conteúdo de `backend.txt` no `Código.gs`.
2. Crie as duas planilhas (principal e freelance) com as abas esperadas (veja 2.2) e preencha `CRM_PLANILHA_ID`, `FREELANCE_PLANILHA_ID` e `CALENDAR_ID` no topo do código.
3. **Implantar** → **Nova implantação** → tipo **App da Web** → **Executar como: Eu** → **Quem tem acesso: Qualquer pessoa** → **Implantar**, autorizando o script quando pedido.
4. Copie o link do app da Web (`.../exec`) e cole na constante `CRM_API_URL`, no topo do `crm.html`.
5. Publique o `crm.html` no GitHub Pages (mesmo processo da Parte 1.2).

### 2.4 Regra de segurança nas exclusões

Todos os módulos (Leads, Clientes, Eventos, Financeiro, Custos, Freelance) têm exclusão com confirmação. Duas travas específicas protegem o rastro financeiro:

- **Cliente:** só pode ser excluído se não houver nenhum evento vinculado a ele (evita órfãos no resto do sistema).
- **Evento / Conta do Financeiro:** bloqueado se já houver algum "Valor pago" lançado no Financeiro daquele evento — o pagamento precisa ser revertido antes (mudando o **Status** da parcela/entrada para algo diferente de "Pago", sem precisar zerar o valor previsto). Caso o bloqueio apareça mas o valor for de um teste, o próprio app oferece uma **exclusão forçada** (segunda confirmação explícita), que ignora a trava e apaga o valor recebido junto — sem gerar estorno real, só limpeza de dado de teste.
- Excluir um Evento também remove em cascata: o compromisso na Agenda, a linha de Produção (e o compromisso de entrega, se houver), os Custos vinculados e todas as parcelas do Financeiro daquele evento.

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

### 2.8 Atualizando depois de publicado

- **Mudou algo no front** (`crm.html`, `assets/css/*` ou `assets/js/*`): edite e suba de novo no GitHub. Vale na hora (o sufixo `?v=2.8.0` nas tags ajuda a furar o cache; incremente-o em mudanças grandes).
- **Mudou algo no back-end** (`backend.txt`): cole o conteúdo atualizado no `Código.gs`, no editor do Apps Script, e crie uma **Nova implantação** — sem isso, o CRM continua rodando a versão antiga do back-end mesmo com o `backend.txt` já atualizado aqui no repositório.

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

---

## Sobre os limites gratuitos

Contas Gmail pessoais (@gmail.com) têm um limite de referência de **100 e-mails enviados por dia** pelo Apps Script; contas Google Workspace têm um limite bem maior. O Apps Script também limita **execuções simultâneas por script** — por isso o CRM carrega todas as listas da tela inicial numa única chamada (`carregarTudo`) em vez de várias chamadas em paralelo, evitando erros intermitentes de "JSON inválido" por concorrência. GitHub Pages é gratuito para repositórios públicos, sem limite prático para esse volume de uso. Para o volume de uma fotógrafa de eventos, tudo isso é mais do que suficiente.

## Personalizando

- **Contrato Digital:** cores e fontes nas variáveis `:root` (`--paper`, `--ink`, `--gold` etc.) dentro de `<style>` no `index.html`; textos das cláusulas na função `buildClauses()`; preços e pacotes no objeto `PACOTES` — tudo no topo do `index.html`.
- **CRM:** cores e fontes seguem o mesmo padrão de variáveis `:root`, agora em `assets/css/crm.css` (a partir da v2.6; antes ficavam no `<style>` do `crm.html`).

## Sobre a assinatura eletrônica via plataforma paga

O Contrato Digital inclui as duas opções gratuitas: **assinatura por desenho** (canvas) e **aceite eletrônico** (nome digitado). Se no futuro vocês quiserem somar uma terceira opção via plataforma especializada (Clicksign, D4Sign etc.), ela normalmente entra como mais uma aba ao lado das outras duas na etapa de assinatura — mas isso já envolve custo por assinatura, fora do escopo gratuito que vocês pediram.
