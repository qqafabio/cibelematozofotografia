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

- **Mudou algo no front** (`crm.html`, `assets/css/*` ou `assets/js/*`): edite e suba de novo no GitHub. Vale na hora (o sufixo `?v=2.8.2` nas tags ajuda a furar o cache; incremente-o em mudanças grandes).
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

## Sobre os limites gratuitos

Contas Gmail pessoais (@gmail.com) têm um limite de referência de **100 e-mails enviados por dia** pelo Apps Script; contas Google Workspace têm um limite bem maior. O Apps Script também limita **execuções simultâneas por script** — por isso o CRM carrega todas as listas da tela inicial numa única chamada (`carregarTudo`) em vez de várias chamadas em paralelo, evitando erros intermitentes de "JSON inválido" por concorrência. GitHub Pages é gratuito para repositórios públicos, sem limite prático para esse volume de uso. Para o volume de uma fotógrafa de eventos, tudo isso é mais do que suficiente.

## Personalizando

- **Contrato Digital:** cores e fontes nas variáveis `:root` (`--paper`, `--ink`, `--gold` etc.) dentro de `<style>` no `index.html`; textos das cláusulas na função `buildClauses()`; preços e pacotes no objeto `PACOTES` — tudo no topo do `index.html`.
- **CRM:** cores e fontes seguem o mesmo padrão de variáveis `:root`, agora em `assets/css/crm.css` (a partir da v2.6; antes ficavam no `<style>` do `crm.html`).

## Sobre a assinatura eletrônica via plataforma paga

O Contrato Digital inclui as duas opções gratuitas: **assinatura por desenho** (canvas) e **aceite eletrônico** (nome digitado). Se no futuro vocês quiserem somar uma terceira opção via plataforma especializada (Clicksign, D4Sign etc.), ela normalmente entra como mais uma aba ao lado das outras duas na etapa de assinatura — mas isso já envolve custo por assinatura, fora do escopo gratuito que vocês pediram.
