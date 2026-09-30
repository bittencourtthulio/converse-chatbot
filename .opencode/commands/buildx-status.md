---
description: Painel seco do buildx — features, ciclos de recursão, pendências e premissas. Só lê, não executa etapa nenhuma.
---

Use a skill `buildx`. **Este comando não executa etapa nenhuma.** Lê e mostra.

Sem `docs/projeto/PROJETO.md`: diga que não há projeto do buildx aqui, e que `/buildx <descrição>` começa um.

```
buildx — <titulo>
Etapa: <B-N> · Modo: <autonomo | briefing>

FEATURES                                    <n> de <n> entregues
| ID | feature | status | PR | testes |
|----|---------|--------|----|--------|

RECURSÃO
Ciclo <n> de <teto>
Resolvidas: <n> · Abertas: <n>

PENDÊNCIAS
| # | assunto | classe | origem |
|---|---------|--------|--------|

PREMISSAS
Registradas: <n> · Provisórias: <n> · Sem feature que as realize: <n>

VALIDAÇÃO
<veredito, se o B6 já rodou; senão "não executada">
```

## Comente três coisas, quando se aplicarem

- **Premissa sem feature que a realize** — é a falha mais cara do método: documenta uma proteção que ninguém construiu. Diga quais são.
- **Ciclo de recursão no teto** — diga que o buildx vai parar de tentar e que o resto vira decisão humana.
- **Feature bloqueada duas vezes pelo mesmo motivo** — laço em falso; deveria ter sido reclassificada como `decisao_humana`.

Não ofereça consertar nada. Este comando só informa.
