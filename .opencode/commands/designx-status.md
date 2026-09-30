---
description: "Mostra o estado do design system e as violacoes detectadas"
---

# /designx-status

Status do design system do projeto.

## Instrucoes

1. Verifique se `docs/design-system/DESIGN-SYSTEM.md` existe.
2. Se existe, leia o frontmatter e mostre: nome, versao, origem, consistente, drift.
3. Verifique se `docs/design-system/AUDIT.md` existe e mostre o ultimo veredito.
4. Conte as violacoes de design no rastro.
5. Mostre o resumo.

## Saida esperada

```
Design System: <nome> v<versao>
Origem: <origem>
Consistente: sim/nao
Drift detectado: N

Ultimo audit: <data>
Veredito: <veredito>
Violacoes: N
Avisos: N

Violacoes acumuladas: N
Regra mais violada: <regra>
```
