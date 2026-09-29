# Módulo de Cobrança v.2.4

## Status: Em Desenvolvimento (Task 1.1 ✅)

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

## Estrutura de Dados

### Campos Novos em "Financeiro" (aba de parcelas)

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

- [ ] Task 1.2: Backend - Lógica de identificação
- [ ] Task 1.4: Endpoints de API
- [ ] Task 1.5: Templates de mensagem
- [ ] Task 2.1: Modal flutuante
- ...

---

**Data**: 29/09/2026  
**Status**: Task 1.1 ✅ Concluída
