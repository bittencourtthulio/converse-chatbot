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
| T-02.06 | a troca de senha derruba as outras sessões (versão de sessão) | removido o `increment` de `versaoDaSessao` em `trocarSenha` | `tests/sessao-versao.test.ts` e `tests/perfil.test.ts` |
| T-02.06 | `usuarioDaSessao` recusa token de versão menor | removida a comparação `sessao.versao < usuario.versaoDaSessao` | `tests/sessao-versao.test.ts` e `tests/perfil.test.ts` |
| T-02.07 | a renovação nunca passa do limite absoluto | `exp` renovado = agora + TTL, sem o `min` com início mais o máximo | `tests/sessao-renovacao.test.ts` ("limite absoluto") |
| T-02.07 | só renova depois da metade da vida | removida a condição da metade | `tests/sessao-renovacao.test.ts` ("antes da metade da vida não renova") |
| T-02.07 | a renovação mantém o `jti` (revogar uma vez cobre o token roubado antes) | a renovação gera `jti` novo | `tests/sessao-renovacao.test.ts` ("a renovação mantém o jti") |
| T-02.08 | o expurgo apaga as revogações de sessão vencidas | a limpeza de `sessoes_revogadas` é removida de `executarExpurgo` | 2 casos de `tests/expurgo-sessoes.test.ts` |
| T-03.01 | `sair` revoga a sessão de verdade | a chamada `revogarSessao(token)` sai da ação `sair` | 2 casos de `tests/acao-sair.test.ts` ("revoga o jti do cookie...", "falha ao gravar a revogação...") |
| T-03.02 | `salvarSenha` mantém quem trocou a senha logado, com o cookie certo | a chamada `gravarCookieDeSessao(token)` sai de `salvarSenha` | `tests/acao-salvar-senha.test.ts` ("o cookie gravado tem os atributos de sempre...") |
| T-03.03 | o proxy renova o cookie depois da metade da vida | a chamada `renovarCookieNaResposta` sai de `src/proxy.ts` | 3 casos de `tests/proxy-renovacao.test.ts` |
| T-03.03 | o proxy não renova Server Action (com `next-action` ou POST a página) | removidas as duas condições de `requisicaoRenovaSessao` | 2 casos de `tests/proxy-renovacao.test.ts` |
| T-03.03 | o proxy não renova rotas públicas (`/embed`, `/api/publico`, `/api/telegram`, `/api/saude`) | lista de prefixos esvaziada | 4 casos de `tests/proxy-renovacao.test.ts` |
| T-04.01 | o limite de tentativas de login vale na ação `autenticar` (PR-16, PR-36) | a chamada `exigirLimiteDeLogin` sai de `autenticar` | 5 casos de `tests/acao-autenticar-limite.test.ts` |
| T-04.02 | o GET público da conversa tem limite por IP e agente (PR-56, PR-57) | a chamada `exigirLimiteDeIp` sai de `retomarConversaDoVisitante` | `tests/publico-conversa-limite.test.ts` (o caso de serviço e o caso da rota real contra `next start`, depois de novo build) |
