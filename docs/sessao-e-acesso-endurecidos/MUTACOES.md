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
| T-02.03 | `lerSessao` recusa token sem `jti` | removida a conferência de `jti` em `src/lib/sessao.ts` | `tests/sessao-token.test.ts` ("token sem a claim jti é recusado com 401") |
| T-02.03 | o `exp` nunca passa de início mais `SESSAO_MAXIMA_HORAS` | `exp = agora + TTL`, sem o `min` com o limite absoluto | 2 casos de `tests/sessao-token.test.ts` ("limite absoluto no exp") |
| T-02.04 | cookie de sessão `HttpOnly` | `httpOnly: false` em `opcoesDoCookie` | 3 casos de `tests/sessao-cookie.test.ts` |
| T-02.04 | cookie de sessão `Secure` em produção | `secure: false` fixo | `tests/sessao-cookie.test.ts` ("em produção: os mesmos atributos e Secure") |
| T-02.04 | cookie de sessão `SameSite=Lax` | `sameSite: 'none'` | 3 casos de `tests/sessao-cookie.test.ts` |
| T-02.05 | `usuarioDaSessao` recusa token revogado | removida a consulta a `sessoes_revogadas` | `tests/sessao-revogacao.test.ts` ("depois de revogar, o token recebe 401 e outra sessão do mesmo usuário continua válida") |
| T-02.05 | `usuarioDaSessao` recusa sessão além do limite absoluto mesmo com `exp` válido | removida a conferência de início mais o máximo | `tests/sessao-revogacao.test.ts` ("um token forjado com início antigo e exp ainda válido") |
