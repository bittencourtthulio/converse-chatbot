---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: operacao-e-backup
origem_buildx: plataforma-chatbot-ia
feature_id: FT-11
sprint_id: sprint-02
atualizado_em: 2026-10-01
titulo: "Log em todo o sistema e erro com codigo de referencia"
status: concluido
criterio_saida: "Nenhum console.* em src/ fora de src/lib/log.ts, X-Correlacao em toda resposta, e a pilha nao aparece em rota de API nem em pagina contra o servidor de producao"
fases: ["F-02.1", "F-02.2"]
riscos: ["os testes que liam o campo evento passam a ler msg (28 pontos em tests/)", "citacoes de linha de CONVENCOES.md e tests/projeto.test.ts deslocam a cada servico tocado", "o proxy passa a rodar em todas as rotas e nao pode quebrar o frame-ancestors do /embed"]
---

# Sprint 02 — Log em todo o sistema e erro com codigo de referencia

## Objetivo

Troca todo console.* de src/ pelo log, faz o proxy gerar a correlacao de cada requisicao, impoe a regra por lint e por teste, cria as paginas de erro com codigo de referencia e prova que a pilha nao vaza.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-02.1 | Correlacao e fim do console | nenhuma |
| F-02.2 | Erro com codigo de referencia | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

Nenhum console.* em src/ fora de src/lib/log.ts, X-Correlacao em toda resposta, e a pilha nao aparece em rota de API nem em pagina contra o servidor de producao.

## Riscos conhecidos

- os testes que liam o campo evento passam a ler msg (28 pontos em tests/)
- citacoes de linha de CONVENCOES.md e tests/projeto.test.ts deslocam a cada servico tocado
- o proxy passa a rodar em todas as rotas e nao pode quebrar o frame-ancestors do /embed
