---
kind: produto_indice
schema: expx-schema-v1
criado_em: 2026-09-30
atualizado_em: 2026-09-30
total_pedidos: 1
via_triagem: 0
via_avaliacao: 1
nao_viraram_trabalho: 0
---

# Índice de pedidos

Append-only. Uma linha por pedido, da triagem à avaliação completa.

| data | PD-ID | titulo | origem | via | veredito | motivo | trabalho_gerado |
|------|-------|--------|--------|-----|----------|--------|-----------------|
| 2026-09-30 | PD-2026-0001 | Plataforma de chatbot com IA e base de conhecimento | interno | avaliacao | fazer | projeto inteiro, sem sistema existente (auto-assinado pelo buildx) | sprintx:plataforma-chatbot-ia |

## Indicadores

- **Total de pedidos:** 1
- **Via triagem:** 0 (0%)
- **Via avaliação completa:** 1 (100%)
- **Não viraram trabalho:** 0 (0%)

Este indicador não se aplica a vereditos do buildx: todo projeto do buildx sai `fazer`
por construção (`references/integracao/prodx.md`).
