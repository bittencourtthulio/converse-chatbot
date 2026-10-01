---
expx_schema: 1
expx_tool: sprintx
kind: mutacoes
trabalho_id: sessao-e-acesso-endurecidos
origem_buildx: plataforma-chatbot-ia
feature_id: FT-12
atualizado_em: 2026-10-01
---

# Mutações que provam as proteções da FT-12

Regra da feature: cada proteção tem um teste que **falha** quando ela é removida. A mutação é temporária (aplicada, o teste roda e falha, o código volta ao original) e fica registrada aqui, task a task. A tabela é copiada para o `ENTREGA.md` no fechamento.

| Task | Proteção | Mutação aplicada (temporária) | Teste que falhou |
|---|---|---|---|
| T-01.01 | relógio do limitador padrão alcançável pelo relógio falso | o padrão de `criarLimitador` volta a ser a referência `Date.now` capturada | 3 casos de `tests/limite-de-uso.test.ts` ("o limitador padrão do processo e o relógio falso do teste") |
