---
argument-hint: "[--force]"
description: "Gera o DESIGN-SYSTEM.md via cartografia visual do projeto"
---

# /designx-cartography

Cartografia visual do projeto. Analisa o codigo existente e gera o DESIGN-SYSTEM.md.

## Instrucoes

1. Verifique se `docs/design-system/DESIGN-SYSTEM.md` ja existe. Se sim e sem `--force`, avise e pare.
2. Rode o agente `cartografo-visual` com escopo no `src/` do projeto.
3. Gere o `DESIGN-SYSTEM.md` com frontmatter valido (exx_schema: 1, expx_tool: designx, kind: design_system).
4. Marque `origem: cartografia_automatica`.
5. Se drift Detectado > 0, marque `consistente: false`.
6. Grave em `docs/design-system/DESIGN-SYSTEM.md`.
7. Gere `docs/design-system/RESUMO.md` com o resumo dos tokens, componentes e padroes encontrados.
8. Registre `design_system_cartografado` no rastro.

## Saida esperada

```
Cartografia visual concluida.

DS gerado: docs/design-system/DESIGN-SYSTEM.md
Origem: cartografia_automatica
Consistente: sim/nao
Drift detectado: N

Tokens encontrados: N
Componentes detectados: N
Padroes de tela: N
```
