---
expx_schema: 1
expx_tool: sprintx
kind: briefing
trabalho_id: sessao-e-acesso-endurecidos
origem_buildx: plataforma-chatbot-ia
feature_id: FT-12
criado_em: 2026-10-01
atualizado_em: 2026-10-01
---

# Briefing do buildx — FT-12 Sessão e acesso endurecidos

## Problema

O usuário que sai tem a sessão encerrada de fato, quem usa o sistema continua logado sem ser derrubado a cada 15 minutos, o login logo depois de trocar a senha funciona, e o excesso de tentativas de login e de leituras públicas é barrado, tudo provado por teste.

Origem: achados do B6 (ciclo 2) em `docs/projeto/validacao/premissas-01-34.md` (A-01, A-02, A-04, R-01 a R-03), `premissas-35-70.md` (achados 1 e 4) e `sistema-de-pe.md` (A-1); pendências PEND-12 a PEND-17 de `docs/projeto/RECURSAO.md`. Premissas de segurança com evidência parcial não podem sair como pendência aceita: cada proteção precisa de um teste que **falhe** quando ela é removida (mutação temporária, registrada no `ENTREGA.md`).

## Escopo

1. **Limite de login provado na ação (PEND-12):** teste que chama a ação `autenticar` (`src/app/acoes.ts`, com `next/headers` e cookies simulados como o projeto já faz) com o mesmo IP e e-mail e prova o bloqueio na tentativa seguinte ao limite (5 por minuto por IP+e-mail, 20 por IP), a mensagem amigável, que credencial certa dentro do limite não é bloqueada indevidamente e que o limite reinicia com o relógio injetado. Remover a chamada ao limitador em `autenticar` quebra a suíte.
2. **Atributos do cookie de sessão provados (PEND-13):** testes de `opcoesDoCookie()` em teste e em produção (`HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` em produção, `Max-Age` coerente), o `Set-Cookie` de um login real contra o servidor de produção de `tests/rotas.test.ts` e o teste de `salvarSenha` sem simular `gravarCookieDeSessao`.
3. **Sair revoga de verdade (PEND-14, L4):** o token ganha identificador (`jti`); `sair` grava o `jti` numa tabela de revogados com a data de expiração (migration só acrescenta); a validação de sessão (`src/servicos/autenticacao.ts` e o que o `proxy.ts` usar) recusa token revogado; token roubado antes do logout e reutilizado depois recebe 401 ou redirecionamento; outras sessões do mesmo usuário continuam valendo; o expurgo (`src/servicos/expurgo.ts`) apaga revogados já expirados. Teste de ponta a ponta contra o servidor de produção.
4. **Renovação por atividade (PEND-14, L4):** renovação deslizante: em requisição autenticada, com o token além da metade da vida, o cookie é reemitido (mesmo vínculo de sessão, nova expiração) em handler, ação ou `src/proxy.ts` (nunca em componente de servidor), sem quebrar a exclusão das rotas de upload; **limite absoluto de duração** `SESSAO_MAXIMA_HORAS` (padrão 12, lida só em `src/lib/ambiente.ts`, documentada no `.env.example`); respeita revogação e invalidação por troca de senha; relógio injetável. Teste: ativo continua logado além de 15 min; inativo cai; sessão não passa do limite absoluto; token revogado não renova.
5. **Login logo depois da troca de senha (PEND-15):** o corte `agora + 1 s` de `src/servicos/perfil.ts` é trocado por um **contador de versão de sessão** no usuário (coluna nova, padrão 0; o token carrega a versão; a troca de senha incrementa; versão menor é inválida). Teste: login imediato após a troca funciona, a sessão antiga cai, duas trocas seguidas, migração de usuários existentes (versão 0); mantém a propriedade de `tests/perfil.test.ts` (outras sessões caem).
6. **Guardas em profundidade (PEND-16):** `src/app/(sistema)/conversas/[id]/page.tsx` chama `exigirUsuario()`; `listar` de `src/servicos/auditoria.ts` confere o papel admin (ator como parâmetro, chamadores e testes ajustados); varredura dos demais serviços e telas de administração (privacidade, sistema, titulares, integrações, usuários) com lista do que se encontrou e correção; **teste de arquitetura** que enumera telas e rotas sob `(sistema)` e `api` e falha se uma que lê ou altera dado não tiver guarda própria, com lista explícita e comentada de exceções públicas.
7. **Limite de uso na leitura pública (PEND-17):** `GET /api/publico/agentes/[id]/conversa` usa `exigirLimiteDeIp`; teste do bloqueio e de que a resposta de bloqueio não vaza nada.
8. **Premissas e documentos:** premissas novas (`Origem: recursao`, `Etapa: b5`) para jti/revogação, renovação deslizante e limite absoluto, contador de versão de sessão e teste de arquitetura das guardas; lacunas convertidas em `docs/stack/LACUNAS.md` e `docs/stack/CONVENCOES.md` (inclusive a regra "guarda no layout", se mudou); fechamento no `RECURSAO.md` (PEND-12 a PEND-17 em "Resolvido nos ciclos", ciclo 2, FT-12).
9. **Verificação no navegador** (Chrome próprio, porta livre, alvo confirmado): login, uso além da metade da vida com `JWT_TTL_SEGUNDOS` reduzido, logout e reuso do cookie antigo, troca de senha e login imediato, bloqueio de tentativas; dois temas e 375 px.

## Não-objetivos

FT-13 (robustez de mídia, upload e operação: vídeo sem fala, corpo de upload sem `Content-Length`, restauração com servidor em outro contêiner, `X-Correlacao` nas rotas de upload, hachura dos badges, aviso de exclusão de agente, teste do alternador de tema, trava de rede real, aviso de auditoria desligada, extração de PDF); confiança no IP atrás de proxy (PEND-11, decisão humana); limite de login compartilhado entre processos (PR-05, PR-36); SSO e login social (PR-27); novas telas além do que a verificação precisar; alterar o comportamento de FT-01 a FT-11 fora dos pontos de contato listados.

## Critérios de aceite de negócio cobertos

- Um administrador cadastra outro usuário, e essa pessoa entra e troca a própria senha (a troca e o login seguinte passam a funcionar sem janela de falha).
- Entro com a conta de demonstração e uso o sistema sem ser derrubado enquanto estiver ativo; ao sair, a sessão deixa de valer de fato.
- (Segurança, PR-12, PR-16, PR-27, PR-31, PR-36, PR-56) acesso por papel no servidor e limites de uso provados por teste.

## Premissas aplicáveis

PR-12, PR-16, PR-27, PR-31, PR-36 e PR-56 (realiza); PR-05, PR-13, PR-18, PR-19, PR-26, PR-28, PR-93 (`docs/projeto/PREMISSAS.md`).

## Convenções

`docs/stack/CONVENCOES.md`.
