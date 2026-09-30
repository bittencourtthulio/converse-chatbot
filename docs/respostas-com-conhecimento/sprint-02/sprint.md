---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: respostas-com-conhecimento
origem_buildx: plataforma-chatbot-ia
feature_id: FT-05
sprint_id: sprint-02
titulo: "Servico de recuperacao"
status: pendente
criterio_saida: "tests/recuperacao-termos.test.ts, tests/recuperacao.test.ts, tests/recuperacao-desempenho.test.ts e tests/seed.test.ts passam e a suite inteira esta verde."
fases: ["F-02.1", "F-02.2"]
riscos: ["stopwords em portugues sao lista propria e podem esconder termo util (D-05)", "desempenho com 5.000 trechos depende da maquina: limite folgado de 500 ms"]
atualizado_em: 2026-09-30
---

# Sprint 02 — Servico de recuperacao

## Objetivo

buscarTrechos devolve os trechos certos do agente, com expressao MATCH segura, BM25, limiar e continuacao, e a seed fica coberta.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-02.1 | Termos e expressao MATCH | nenhuma |
| F-02.2 | Busca, desempenho e seed | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

tests/recuperacao-termos.test.ts, tests/recuperacao.test.ts, tests/recuperacao-desempenho.test.ts e tests/seed.test.ts passam e a suite inteira esta verde.

## Riscos conhecidos

- stopwords em portugues sao lista propria e podem esconder termo util (D-05)
- desempenho com 5.000 trechos depende da maquina: limite folgado de 500 ms
