---
expx_schema: 1
expx_tool: sprintx
kind: entrega
trabalho_id: sessao-e-acesso-endurecidos
origem_buildx: plataforma-chatbot-ia
feature_id: FT-12
entregue_por: mergex
titulo: Sessao e acesso endurecidos
tipo_trabalho: feature
tipo_ocorrencia: null
estado: aberto
versionado: true
branch: feat/sessao-e-acesso-endurecidos
branch_base: buildx/b5-ciclo-2
commits: []
modulo_afetado: []
arquivos_alterados: []
faixa_atencao: []
raio: null
atencao:
  olho_obrigatorio: 0
  leitura_rapida: 0
  dispensavel: 0
portao: null
desvios: []
push_feito: false
pr_url: null
pr_estado: null
criado_em: 2026-10-01
atualizado_em: 2026-10-01
entregue_em: null
---

# Entrega: Sessão e acesso endurecidos

Branch aberta a partir de `buildx/b5-ciclo-2` (base indicada pelo laço do buildx: PRs empilhados sobre `feat/operacao-e-backup`).

## Avisos

- `docs/sessao-e-acesso-endurecidos/ORQUESTRADOR.md` ainda não existe (a F4 do sprintx vem depois); a linha da branch entra nele quando for gerado.

## Mutações que provam as proteções

Regra da feature: cada proteção tem um teste que falha quando ela é removida. A mutação foi aplicada temporariamente, o teste rodou e falhou, e o código voltou ao original. A tabela completa e atualizada está em `docs/sessao-e-acesso-endurecidos/MUTACOES.md`.

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
| T-04.03 | `auditoria.listar` só para admin, no serviço (PR-12, ressalva R-02) | `exigirAdmin(autor)` e a conferência do ator saem de `listar` | `tests/auditoria-guarda.test.ts` (403 do usuário comum, 403 antes do 422) |
| T-04.03 | `auditoria.listar` sem ator é 401, não TypeError | removida a conferência `autor?.id` | `tests/auditoria-guarda.test.ts` ("ator ausente recebe 401") |
| T-04.04 | a página de detalhe da conversa chama `exigirUsuario()` por conta própria (PR-12, ressalva R-01) | `await exigirUsuario()` sai de `conversas/[id]/page.tsx` | 2 casos de `tests/conversas-detalhe-guarda.test.tsx` |
| T-04.05 | toda página de `(sistema)` tem guarda própria | `await exigirUsuario()` sai de `conversas/[id]/page.tsx` | `tests/guardas-arquitetura.test.ts` ("toda tela e toda rota tem guarda própria") |
| T-04.05 | toda rota de `api` tem `usuarioAtual()` ou `exigirSessao()`, salvo as públicas listadas | `exigirSessao()` vira `null` em `api/conversas/apagar/route.ts` | `tests/guardas-arquitetura.test.ts` (mesmo caso) |
| T-04.05 | telas de `configuracoes/` exigem `exigirUsuarioAdmin()` | a tela de auditoria passa a chamar só `exigirUsuario()` | `tests/guardas-arquitetura.test.ts` (mesmo caso) |
| T-04.05 | a apresentação não importa funções internas sem ator | `PainelDoSistema.tsx` importa `obterChaveDoOpenrouter` | `tests/guardas-arquitetura.test.ts` ("nenhum arquivo real de src/app ou src/componentes importa...") |
| T-05.01 | o `Set-Cookie` do login real tem `HttpOnly` e `Secure` em produção | `httpOnly: false` e `secure: false` em `opcoesDoCookie`, novo `npm run build` | `tests/sessao-fim-a-fim.test.ts` ("o cookie do login real", contra `next start`) |
| T-05.01 | o login logo depois da troca de senha abre o sistema e a sessão anterior cai | `trocarSenha` sem o `increment` de `versaoDaSessao`, novo build | `tests/sessao-fim-a-fim.test.ts` ("login logo depois da troca de senha") |
| T-05.02 | `sair` revoga de verdade: o cookie roubado antes do logout é barrado (página 307, API 401) | a chamada `revogarSessao` sai da ação `sair`, novo build | `tests/sessao-fim-a-fim.test.ts` ("sair revoga de verdade", contra `next start`) |
| T-05.03 | quem usa o sistema continua logado além do TTL (renovação no proxy) | a chamada `renovarCookieNaResposta` sai de `src/proxy.ts`, novo build | `tests/sessao-fim-a-fim.test.ts` ("renovação do usuário ativo e queda do inativo", contra `next start`) |
