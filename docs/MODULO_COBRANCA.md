# Módulo de Cobrança v.2.4

## Status: Em Desenvolvimento (Task 1.5 ✅)

---

## Função 1: `listarContasEmAtraso()`

**Localização**: Backend Google Apps Script  
**Objetivo**: Listar todas as parcelas em atraso

**Lógica**:
- Consulta a aba "Financeiro"
- Filtra parcelas onde:
  - Status = 'Vencida'
  - Valor Pago < Valor (não foi totalmente paga)
  - Vencimento < Hoje
- Calcula `diasEmAtraso` para cada parcela
- Ordena por dias em atraso (DESC)

**Retorno**:
```javascript
[
  {
    "ID Parcela": "1001",
    "Cliente": "João Silva",
    "Valor": 1500.00,
    "Valor pago": 0.00,
    "Vencimento": "25/09/2026",
    "Status": "Vencida",
    "diasEmAtraso": 4,
    "Observacoes": "..."
  }
]
```

**Endpoint**: `POST /` com `action: "listarContasEmAtraso"`

---

## Função 1.1: `listarContasEmAtrasoComFiltros(dados)` ⭐

**Localização**: Backend Google Apps Script  
**Objetivo**: Listar contas em atraso com filtros, ordenação e paginação

**Parâmetros** (todos opcionais):
```javascript
{
  "filtroCliente": "João",         // busca parcial por nome
  "filtroValorMinimo": 500.00,     // apenas parcelas >= valor
  "filtroDiasAtraso": 7,           // apenas com 7+ dias de atraso
  "ordenarPor": "diasAtraso",      // "diasAtraso" | "valor" | "vencimento"
  "pagina": 1,                     // página (padrão: 1)
  "limite": 20                     // registros por página (padrão: 20, máx: 100)
}
```

**Lógica**:
1. Lista todas as contas em atraso (via `listarContasEmAtraso()`)
2. Aplica filtros (cliente, valor mínimo, dias)
3. Ordena conforme solicitado
4. Pagina os resultados
5. Retorna dados + metadados de paginação

**Retorno**:
```javascript
{
  "dados": [
    {
      "ID Parcela": "1001",
      "Cliente": "João Silva",
      "Valor": 1500.00,
      "Valor pago": 0.00,
      "Vencimento": "25/09/2026",
      "Status": "Vencida",
      "diasEmAtraso": 4,
      "Observacoes": "..."
    }
    // ... mais registros
  ],
  "paginacao": {
    "paginaAtual": 1,
    "limite": 20,
    "totalRegistros": 47,
    "totalPaginas": 3,
    "temProxima": true,
    "temAnterior": false
  }
}
```

**Exemplos de uso**:

```javascript
// Listar todos em atraso, página 1
apiCall('listarContasEmAtrasoComFiltros', {})

// Cliente específico
apiCall('listarContasEmAtrasoComFiltros', {
  filtroCliente: "Maria"
})

// Atrasos críticos (15+ dias, valor >= 1000)
apiCall('listarContasEmAtrasoComFiltros', {
  filtroDiasAtraso: 15,
  filtroValorMinimo: 1000,
  ordenarPor: "valor"
})

// Ordenar por data de vencimento (urgência natural)
apiCall('listarContasEmAtrasoComFiltros', {
  ordenarPor: "vencimento"
})

// Paginação: página 3, 50 por página
apiCall('listarContasEmAtrasoComFiltros', {
  pagina: 3,
  limite: 50
})
```

**Endpoint**: `POST /` com `action: "listarContasEmAtrasoComFiltros"`

---

## Função 2: `registrarTentativaCobranca(dados)`

**Localização**: Backend Google Apps Script  
**Objetivo**: Registrar uma tentativa de cobrança manual

**Parâmetros**:
```javascript
{
  "idParcela": "1001",          // obrigatório
  "tentativaNumero": 1,         // 1-3
  "usuarioEnviou": "João",      // quem enviou
  "templateUsado": "MÉDIA"      // qual template
}
```

**Lógica**:
- Localiza a parcela em "Financeiro"
- Prepara nota com: tentativa nº, data/hora, usuário, template
- Acumula no campo "Observacoes" (histórico)
- Atualiza contador "Tentativas Cobranca"

**Retorno**:
```javascript
{
  "idParcela": "1001",
  "tentativaRegistrada": true,
  "dataHora": "29/09/2026 14:30:45"
}
```

**Endpoint**: `POST /` com `action: "registrarTentativaCobranca"`

---

## Função 3: `bloquearClienteCobranca(dados)`

**Localização**: Backend Google Apps Script  
**Objetivo**: Bloquear cliente após 3 tentativas

**Parâmetros**:
```javascript
{
  "idCliente": "C001",           // obrigatório
  "motivo": "3 tentativas sem resposta"  // obrigatório
}
```

**Lógica**:
- Localiza cliente em "Clientes"
- Define campos:
  - "Bloqueado Cobranca" = "Sim"
  - "Motivo Bloqueio" = motivo fornecido
  - "Data Bloqueio" = data/hora atual

**Retorno**:
```javascript
{
  "idCliente": "C001",
  "bloqueado": true
}
```

**Endpoint**: `POST /` com `action: "bloquearClienteCobranca"`

---

## Função 4: `desbloquearClienteCobranca(dados)`

**Localização**: Backend Google Apps Script  
**Objetivo**: Remover bloqueio de cliente

**Parâmetros**:
```javascript
{
  "idCliente": "C001"  // obrigatório
}
```

**Lógica**:
- Localiza cliente em "Clientes"
- Define campos:
  - "Bloqueado Cobranca" = "Não"
  - "Motivo Bloqueio" = ""

**Retorno**:
```javascript
{
  "idCliente": "C001",
  "desbloqueado": true
}
```

**Endpoint**: `POST /` com `action: "desbloquearClienteCobranca"`

---

## Função 5: `obterHistoricoCobranca(dados)`

**Localização**: Backend Google Apps Script  
**Objetivo**: Recuperar histórico completo de cobranças

**Parâmetros**:
```javascript
{
  "idParcela": "1001"  // obrigatório
}
```

**Lógica**:
- Localiza parcela em "Financeiro"
- Retorna campo "Observacoes" (histórico acumulado)
- Retorna contador "Tentativas Cobranca"

**Retorno**:
```javascript
{
  "idParcela": "1001",
  "observacoes": "Tentativa 1/3 - 28/09/2026 14:20 por João\nTemplate: LEVE\n---\nTentativa 2/3 - 29/09/2026 10:30 por Maria\nTemplate: MÉDIA",
  "totalTentativas": 2
}
```

**Endpoint**: `POST /` com `action: "obterHistoricoCobranca"`

---

## Função 6: `obterTemplatesMensagem()` ⭐

**Localização**: Backend Google Apps Script  
**Objetivo**: Retornar 3 templates de mensagem para cobrança (LEVE, MÉDIA, PESADA)

**Parâmetros**: Nenhum

**Retorno**: Array com 3 templates contendo `id`, `nome`, `descricao` e `corpo`

**Variáveis Dinâmicas** (preenchidas no frontend):
- `{{cliente}}` - Nome do cliente
- `{{valor}}` - Valor da parcela em atraso
- `{{diasAtraso}}` - Dias em atraso
- `{{vencimento}}` - Data do vencimento

**Endpoint**: `POST /` com `action: "obterTemplatesMensagem"`

---

## Frontend: Task 1.3a ✅

**UI para Copiar Mensagem**

Implementado:
- Tela "📧 Cobranças" com tabela de contas em atraso
- Modal com 3 templates de mensagem
- Preenchimento dinâmico de variáveis
- Botão "Copiar para área de transferência"
- Notificação de sucesso

---

## Função 7: `registrarEnvioManual(dados)` ⭐

**Localização**: Backend Google Apps Script  
**Objetivo**: Registrar envio manual de mensagem de cobrança

**Parâmetros**:
```javascript
{
  "idParcela": "1001",           // obrigatório
  "templateUsado": "leve",       // obrigatório: 'leve', 'media', ou 'pesada'
  "usuarioEnviou": "João"        // opcional, padrão: "Manual (App)"
}
```

**Lógica**:
1. Localiza a parcela em "Financeiro"
2. Incrementa contador de tentativas (máximo 3)
3. Adiciona nota com timestamp, template e usuário
4. Se atingiu 3 tentativas: **bloqueia cliente automaticamente**

**Retorno**:
```javascript
{
  "idParcela": "1001",
  "envioRegistrado": true,
  "tentativaRegistrada": 2,     // número da tentativa (1, 2 ou 3)
  "dataHora": "29/09/2026 14:35:22",
  "proximaTentativa": true,      // false se atingiu 3
  "clienteBloqueado": false      // true se 3ª tentativa
}
```

**Histórico Registrado** (no campo "Observacoes"):
```
✓ Envio 1/3 - 29/09/2026 14:30:45 por Manual (App)
Template: LEVE (manual via WhatsApp)
---
✓ Envio 2/3 - 29/09/2026 14:35:22 por João
Template: MÉDIA (manual via WhatsApp)
---
✓ Envio 3/3 - 30/09/2026 10:15:00 por Maria
Template: PESADA (manual via WhatsApp)
⚠️ CLIENTE BLOQUEADO AUTOMATICAMENTE
```

**Endpoint**: `POST /` com `action: "registrarEnvioManual"`

---

## Frontend: Task 1.3b ✅

**Registro de Envio Manual**

Implementado:
- Botão "✅ Enviado" (verde) em cada template
- Indicador visual de progresso: "Tentativa X/3"
- Função `marcarEnvio()` que chama backend
- Feedback imediato (toast)
- Recarregar UI se cliente foi bloqueado
- Desabilita botão quando máximo atingido

**Fluxo de Uso**:
1. Usuário acessa "📧 Cobranças" e clica "📋 Copiar"
2. Modal abre com 3 templates + indicador "Tentativa 1/3"
3. Usuário clica "📋 Copiar" para copiar mensagem
4. Envia manualmente via WhatsApp
5. Volta ao modal e clica "✅ Enviado"
6. Sistema registra no backend:
   - Incrementa contador (1 → 2 → 3)
   - Atualiza histórico
   - Se 3ª tentativa: bloqueia cliente automaticamente

---

## API REST: Task 1.4 ✅

**Endpoints de API para Integração**

Documentação completa em: `docs/API_COBRANCAS.md`

**10 Endpoints Implementados:**

| # | Endpoint | Ação | Tipo |
|---|----------|------|------|
| 1 | `listarContasEmAtraso` | Lista contas vencidas | GET |
| 2 | `listarContasEmAtrasoComFiltros` | Lista com filtros + paginação | GET |
| 3 | `obterTemplatesMensagem` | Retorna 3 templates | GET |
| 4 | `obterHistoricoCobranca` | Histórico de ações | GET |
| 5 | `registrarTentativaCobranca` | Registra tentativa | POST |
| 6 | `registrarEnvioManual` | Registra envio manual | POST |
| 7 | `bloquearClienteCobranca` | Bloqueia cliente | POST |
| 8 | `desbloquearClienteCobranca` | Desbloqueia cliente | POST |
| 9 | `resumoCobrancas` | Dashboard executivo | GET |
| 10 | `relatorioCobrancas` | Relatório estruturado | GET |

**Novos Endpoints (Task 1.4)**

### `resumoCobrancas()` ⭐
Retorna dashboard executivo com métricas principais

**Retorno:**
```json
{
  "resumo": {
    "totalEmAtraso": 45000.50,
    "quantidadeContas": 12,
    "diasMedioAtraso": 18,
    "valorMedioAtraso": 3750.04,
    "clientesBlockeados": 2
  },
  "distribuicaoTentativas": {
    "0_tentativas": 5,
    "1_tentativa": 4,
    "2_tentativas": 1,
    "3_tentativas_ou_bloqueado": 2
  },
  "urgencia": {
    "critica": 2,
    "alta": 4,
    "media": 3,
    "baixa": 3
  }
}
```

---

## Backend CRUD: Task 1.5 ✅

**Templates de Mensagem Customizáveis**

Implementado:
- Aba "Templates" no Google Sheets
- Armazenamento de templates com: ID, Nome, Descrição, Corpo, Padrão (Sim/Não)
- 4 funções CRUD: listarTemplates(), criarTemplate(), atualizarTemplate(), deletarTemplate()
- Validação obrigatória: corpo deve conter {{cliente}}, {{valor}}, {{diasAtraso}}, {{vencimento}}
- Templates padrão protegidos (não podem ser editados nem deletados)
- obterTemplatesMensagem() agora retorna templates salvos + padrões

**Funções:**

### `listarTemplates()` ⭐
Retorna array de todos os templates

**Retorno:**
```json
[
  {
    "ID": 1,
    "Nome": "LEVE",
    "Descrição": "Primeira abordagem - Educada e amigável",
    "Corpo": "Olá {{cliente}}!...",
    "Padrão": "Sim",
    "Data Criação": "29/09/2026"
  },
  {
    "ID": 4,
    "Nome": "CUSTOMIZADO",
    "Descrição": "Meu template personalizado",
    "Corpo": "Prezado {{cliente}}...",
    "Padrão": "Não",
    "Data Criação": "29/09/2026",
    "Data Atualização": "29/09/2026"
  }
]
```

### `criarTemplate(dados)` ⭐
Cria novo template customizado

**Parâmetros:**
```javascript
{
  "nome": "SUPER LEVE",           // obrigatório
  "descricao": "Ultra amigável",  // obrigatório
  "corpo": "Olá {{cliente}}..."   // obrigatório, deve conter 4 variáveis
}
```

### `atualizarTemplate(dados)` ⭐
Atualiza template existente (não pode atualizar padrão)

**Parâmetros:**
```javascript
{
  "id": 4,
  "nome": "SUPER LEVE v2",
  "descricao": "Ultra amigável (revisado)",
  "corpo": "Oi {{cliente}}..."
}
```

### `deletarTemplate(dados)` ⭐
Deleta template customizado (padrões protegidos)

**Parâmetros:**
```javascript
{
  "id": 4
}
```

---

## Frontend CRUD: Task 1.5 ✅

**Tela de Gerenciamento de Templates**

Implementado:
- Novo item no menu: "⚙️ Templates"
- Visualização em cards: mostra Nome, Descrição e Corpo (readonly textarea)
- Badge "PADRÃO" para templates protegidos
- Botão "Novo Template" (+ ícone)
- Botões "✏️ Editar" e "🗑️ Deletar" (desativados para padrões)

**Modal de Criar/Editar:**
- Campos: Nome, Descrição, Corpo
- Preview em tempo real das variáveis substituídas
- Validação de presença das 4 variáveis obrigatórias
- Feedback (toast) ao criar/atualizar/deletar

**Fluxo de Uso:**
1. Clique "⚙️ Templates" no menu
2. Visualize templates padrão + customizados
3. Clique "+ Novo Template" para criar
4. Preencha Nome, Descrição, Corpo
5. Veja preview com valores de exemplo
6. Salve e use no modal de Cobranças

---

### Próximas Tasks

- [ ] Task 2.1: Modal flutuante (drag & drop, redimensionável)
- [ ] Task 2.2: Dashboard de cobranças (gráficos, KPIs)
- ...

---

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `Observacoes` | Text | Histórico acumulado de cobranças |
| `Tentativas Cobranca` | Number | Contador de tentativas (1-3) |

### Campos Novos em "Clientes"

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `Bloqueado Cobranca` | Text | "Sim" ou "Não" |
| `Motivo Bloqueio` | Text | Motivo do bloqueio |
| `Data Bloqueio` | Date | Quando foi bloqueado |

---

## Próximas Tasks

- [ ] Task 1.3a: Frontend - UI para copiar mensagem
- [ ] Task 1.3b: Frontend - Registro de envio manual
- [ ] Task 1.4: Endpoints de API
- [ ] Task 1.5: Templates de mensagem
- [ ] Task 2.1: Modal flutuante
- ...

---

**Data**: 29/09/2026  
**Status**: Task 1.2 ✅ Concluída
