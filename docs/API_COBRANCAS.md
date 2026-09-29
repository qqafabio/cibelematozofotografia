# API REST — Módulo de Cobranças v2.4

## 📋 Índice
- [Endpoints de Dados](#endpoints-de-dados)
- [Endpoints de Ação](#endpoints-de-ação)
- [Endpoints de Relatórios](#endpoints-de-relatórios)
- [Formato de Resposta](#formato-de-resposta)
- [Exemplos de Uso](#exemplos-de-uso)

---

## Endpoints de Dados

### 1. Listar Contas em Atraso (Básico)

```
POST https://script.google.com/macros/s/.../exec
```

**Payload:**
```json
{
  "action": "listarContasEmAtraso"
}
```

**Resposta:**
```json
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

---

### 2. Listar Contas em Atraso (Com Filtros)

**Payload:**
```json
{
  "action": "listarContasEmAtrasoComFiltros",
  "dados": {
    "filtroCliente": "João",
    "filtroValorMinimo": 500,
    "filtroDiasAtraso": 7,
    "ordenarPor": "diasAtraso",
    "pagina": 1,
    "limite": 20
  }
}
```

**Parâmetros:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| filtroCliente | string | Não | Busca parcial por nome |
| filtroValorMinimo | number | Não | Valor mínimo do saldo |
| filtroDiasAtraso | number | Não | Mínimo de dias em atraso |
| ordenarPor | string | Não | "diasAtraso", "valor", "vencimento" |
| pagina | number | Não | Número da página (padrão: 1) |
| limite | number | Não | Registros por página (padrão: 20, máx: 100) |

**Resposta:**
```json
{
  "dados": [...],
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

---

### 3. Obter Templates de Mensagem

**Payload:**
```json
{
  "action": "obterTemplatesMensagem"
}
```

**Resposta:**
```json
{
  "templates": [
    {
      "id": "leve",
      "nome": "LEVE",
      "descricao": "Primeira abordagem - Educada e amigável",
      "corpo": "Olá {{cliente}}! 👋\n\nTudo bem?..."
    },
    {
      "id": "media",
      "nome": "MÉDIA",
      "descricao": "Segunda abordagem - Firme mas profissional",
      "corpo": "Olá {{cliente}},\n\nGostaríamos de..."
    },
    {
      "id": "pesada",
      "nome": "PESADA",
      "descricao": "Terceira abordagem - Formal e solene",
      "corpo": "Prezado(a) {{cliente}},\n\nINFORMAÇÃO..."
    }
  ]
}
```

---

### 4. Obter Histórico de Cobrança

**Payload:**
```json
{
  "action": "obterHistoricoCobranca",
  "dados": {
    "idParcela": "1001"
  }
}
```

**Resposta:**
```json
{
  "idParcela": "1001",
  "observacoes": "Tentativa 1/3 - 28/09/2026 14:20 por João\nTemplate: LEVE\n---\nTentativa 2/3 - 29/09/2026 10:30 por Maria\nTemplate: MÉDIA",
  "totalTentativas": 2
}
```

---

## Endpoints de Ação

### 5. Registrar Tentativa de Cobrança

**Payload:**
```json
{
  "action": "registrarTentativaCobranca",
  "dados": {
    "idParcela": "1001",
    "tentativaNumero": 1,
    "usuarioEnviou": "João",
    "templateUsado": "MÉDIA"
  }
}
```

**Resposta:**
```json
{
  "idParcela": "1001",
  "tentativaRegistrada": true,
  "dataHora": "29/09/2026 14:30:45"
}
```

---

### 6. Registrar Envio Manual

**Payload:**
```json
{
  "action": "registrarEnvioManual",
  "dados": {
    "idParcela": "1001",
    "templateUsado": "media",
    "usuarioEnviou": "Maria"
  }
}
```

**Parâmetros:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| idParcela | string | ✓ | ID da parcela |
| templateUsado | string | ✓ | 'leve', 'media' ou 'pesada' |
| usuarioEnviou | string | Não | Nome do usuário (padrão: "Manual (App)") |

**Resposta:**
```json
{
  "idParcela": "1001",
  "envioRegistrado": true,
  "tentativaRegistrada": 2,
  "dataHora": "29/09/2026 14:35:22",
  "proximaTentativa": true,
  "clienteBloqueado": false
}
```

---

### 7. Bloquear Cliente para Cobrança

**Payload:**
```json
{
  "action": "bloquearClienteCobranca",
  "dados": {
    "idCliente": "C001",
    "motivo": "3 tentativas sem resposta"
  }
}
```

**Resposta:**
```json
{
  "idCliente": "C001",
  "bloqueado": true
}
```

---

### 8. Desbloquear Cliente para Cobrança

**Payload:**
```json
{
  "action": "desbloquearClienteCobranca",
  "dados": {
    "idCliente": "C001"
  }
}
```

**Resposta:**
```json
{
  "idCliente": "C001",
  "desbloqueado": true
}
```

---

## Endpoints de Relatórios

### 9. Resumo Executivo de Cobranças

**Payload:**
```json
{
  "action": "resumoCobrancas"
}
```

**Resposta:**
```json
{
  "timestamp": "2026-09-29T14:35:22Z",
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

### 10. Relatório Detalhado de Cobranças

**Payload:**
```json
{
  "action": "relatorioCobrancas",
  "dados": {
    "filtroCliente": "",
    "filtroValorMinimo": 0,
    "filtroDiasAtraso": 0
  }
}
```

**Resposta:**
```json
{
  "timestamp": "2026-09-29T14:35:22Z",
  "filtrosAplicados": {},
  "totalRegistros": 12,
  "totalEmAtraso": 45000.50,
  "dados": [
    {
      "idParcela": "1001",
      "cliente": "João Silva",
      "valor": "1500.00",
      "valorPago": "0.00",
      "saldo": "1500.00",
      "vencimento": "25/09/2026",
      "diasEmAtraso": 4,
      "tentativas": 0,
      "statusCobranca": "Primeira cobrança",
      "prioridade": "BAIXA"
    },
    {
      "idParcela": "1002",
      "cliente": "Maria Santos",
      "valor": "3000.00",
      "valorPago": "1000.00",
      "saldo": "2000.00",
      "vencimento": "15/09/2026",
      "diasEmAtraso": 14,
      "tentativas": 1,
      "statusCobranca": "Primeira abordagem enviada",
      "prioridade": "MÉDIA"
    }
  ]
}
```

---

## Formato de Resposta

### Resposta de Sucesso

Todas as respostas bem-sucedidas seguem este padrão:

```json
{
  "ok": true,
  "dados": { ... }
}
```

### Resposta de Erro

```json
{
  "ok": false,
  "error": "Descrição do erro"
}
```

**Códigos de erro comuns:**
- `"idParcela é obrigatório"` — Falta parâmetro necessário
- `"Parcela não encontrada"` — ID inválido
- `"Máximo de 3 tentativas atingido"` — Cliente será bloqueado
- `"Ação desconhecida"` — Action não existe

---

## Exemplos de Uso

### JavaScript/Frontend

```javascript
async function obterCobrancas() {
  const result = await fetch(CRM_API_URL, {
    method: 'POST',
    body: JSON.stringify({
      action: 'listarContasEmAtrasoComFiltros',
      dados: {
        filtroDiasAtraso: 7,
        limite: 20
      }
    })
  });
  
  const { ok, dados } = await result.json();
  if (!ok) throw new Error(dados?.error);
  
  return dados;
}
```

### cURL

```bash
curl -X POST https://script.google.com/macros/s/.../exec \
  -H "Content-Type: application/json" \
  -d '{
    "action": "resumoCobrancas"
  }'
```

### Python

```python
import requests
import json

API_URL = "https://script.google.com/macros/s/.../exec"

def get_cobrancas_resumo():
    payload = {"action": "resumoCobrancas"}
    response = requests.post(API_URL, json=payload)
    return response.json()

resumo = get_cobrancas_resumo()
print(f"Total em atraso: R$ {resumo['dados']['resumo']['totalEmAtraso']}")
```

---

## Endpoints de Gerenciamento de Templates

### 11. Listar Todos os Templates

**Payload:**
```json
{
  "action": "listarTemplates"
}
```

**Resposta:**
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

---

### 12. Criar Novo Template

**Payload:**
```json
{
  "action": "criarTemplate",
  "dados": {
    "nome": "SUPER LEVE",
    "descricao": "Ultra amigável e descontraído",
    "corpo": "Opa {{cliente}}! 👋\n\nTudo bem? Vimos que tem uma parcela vencida..."
  }
}
```

**Parâmetros:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| nome | string | ✓ | Nome do template |
| descricao | string | ✓ | Descrição/contexto de uso |
| corpo | string | ✓ | Corpo da mensagem (deve conter {{cliente}}, {{valor}}, {{diasAtraso}}, {{vencimento}}) |

**Resposta:**
```json
{
  "ID": 4,
  "Nome": "SUPER LEVE",
  "Descrição": "Ultra amigável e descontraído",
  "Corpo": "Opa {{cliente}}!...",
  "Padrão": "Não",
  "Data Criação": "29/09/2026"
}
```

---

### 13. Atualizar Template Existente

**Payload:**
```json
{
  "action": "atualizarTemplate",
  "dados": {
    "id": 4,
    "nome": "SUPER LEVE v2",
    "descricao": "Ultra amigável (revisado)",
    "corpo": "Opa {{cliente}}! Olha só..."
  }
}
```

**Parâmetros:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| id | number | ✓ | ID do template |
| nome | string | ✓ | Novo nome |
| descricao | string | ✓ | Nova descrição |
| corpo | string | ✓ | Novo corpo (deve conter 4 variáveis) |

**Resposta:**
```json
{
  "id": 4,
  "atualizado": true
}
```

---

### 14. Deletar Template

**Payload:**
```json
{
  "action": "deletarTemplate",
  "dados": {
    "id": 4
  }
}
```

**Parâmetros:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| id | number | ✓ | ID do template |

**Resposta:**
```json
{
  "id": 4,
  "deletado": true
}
```

---

## Notas de Implementação

1. **Autenticação**: API exposta como "Qualquer pessoa" — sem autenticação necessária
2. **Rate Limit**: Não há limite implementado; Apps Script tem quotas padrão
3. **Timeout**: Google Apps Script timeout padrão = 6 minutos
4. **Paginação**: Máximo 100 registros por página para evitar timeouts
5. **Histórico**: Todas as ações ficam registradas no campo "Observacoes"

---

**Última atualização**: 29/09/2026 (Task 1.5)
