---
expx_schema: 1
expx_tool: sprintx
kind: decisoes
trabalho_id: {{slug-da-feature}}
densidade: {{mvp | padrao | completo | profundo}}
modo_construcao: {{entrevista | autonomo}}
atualizado_em: {{AAAA-MM-DD}}
decisoes:
  - id: D-00
    decisao: densidade {{mvp|padrao|completo|profundo}}, construcao {{entrevista|autonomo}}
    alternativa_descartada: {{sugestao anterior do prodx, se houver, ou null}}
    motivo: {{confirmado pelo usuario | ajustado pelo usuario, com a razao}}
    status: fechada
    bloqueante: false
  - id: D-{{NN}}
    decisao: {{decisao tomada, sem acento, uma linha}}
    alternativa_descartada: {{alternativa descartada, uma linha}}
    motivo: "{{motivo, uma linha; no modo autonomo comeca com (HIPOTESE) e cita a evidencia}}"
    status: fechada
    bloqueante: false
  - id: PENDENTE-{{NN}}
    decisao: {{pergunta em aberto, uma linha}}
    alternativa_descartada: null
    motivo: null
    status: pendente
    bloqueante: true
---

# Decisões — {{slug-da-feature}}

> Uma linha por decisão tomada no planejamento (F2 e, excepcionalmente, F3). Formato fixo. Não apague decisões: uma decisão revertida ganha nova linha que cita a anterior.

## Densidade e forma de construção

**Densidade:** {{mvp | padrao | completo | profundo}}
**Forma de construção:** {{entrevista | autonomo}}

<Se veio sugerido pelo prodx no BRIEFING.md: diga se foi confirmado como veio
ou ajustado, e por quê.>

## Decisões

```
D-00 | densidade {{...}}, construcao {{...}} | {{sugestao anterior, se houver}} | {{confirmado | ajustado, motivo}}
D-01 | {{decisão tomada}} | {{alternativa descartada}} | {{motivo — (HIPOTESE) + evidência, se modo autonomo}}
D-02 | {{decisão tomada}} | {{alternativa descartada}} | {{motivo}}
```

## Pendências

> Todo PENDENTE é bloqueante por padrão e trava a F3. Só marque `(NÃO BLOQUEANTE)` com autorização explícita do usuário, registrando a premissa assumida.

```
PENDENTE-01 | {{pergunta em aberto}} | trava: {{o que não pode ser planejado sem isso}}
```

Se não houver pendências, escreva: `Nenhuma pendência.`
