---
expx_schema: 1
expx_tool: buildx
kind: relatorio_feature
projeto_id: plataforma-chatbot-ia
feature_id: FT-12
trabalho_id: sessao-e-acesso-endurecidos
status: entregue
sprints: 6
tasks: 26
testes_suite: 2993
data: 2026-10-01
---

# Relatório da FT-12: Sessão e acesso endurecidos

Branch `feat/sessao-e-acesso-endurecidos`, a partir de `buildx/b5-ciclo-2` (branch só de documentação, empilhada sobre `feat/operacao-e-backup`; PRs empilhados, sem remoto). Realiza PR-12, PR-16, PR-27, PR-31, PR-36 e PR-56 e cria as premissas PR-101 a PR-104 (origem `recursao`, etapa `b5`). Resolve PEND-12 a PEND-17. PR local: `docs/entregas/sessao-e-acesso-endurecidos/PR.md`; pacote de QA: `docs/entregas/sessao-e-acesso-endurecidos/QA-PACOTE.md`.

## O que foi entregue

- **Sair revoga de verdade** (PEND-14): o token ganhou `jti`; `sair` grava o `jti` em `sessoes_revogadas` e `usuarioDaSessao` recusa o token revogado, de página (307) e de API (401). Outras sessões do mesmo usuário continuam. O expurgo apaga as revogações vencidas.
- **Renovação por atividade com limite absoluto** (PEND-14): depois da metade da vida do token, o `src/proxy.ts` reemite o cookie (mesmo `jti`, `exp` limitado a `SESSAO_MAXIMA_HORAS`, padrão 12). Usuário ativo continua logado além dos 15 minutos; inativo é derrubado.
- **Login logo depois da troca de senha** (PEND-15): contador `versaoDaSessao` no usuário no lugar do corte `agora + 1 s`; a troca incrementa, token de versão menor cai, sem comparar relógios.
- **Limite de login provado na ação** (PEND-12) e **limite no GET público da conversa** (PEND-17): a ação `autenticar` e o `GET /api/publico/agentes/[id]/conversa` barram o excesso (5 por minuto por IP e e-mail, 20 por IP; 10 por minuto por IP e agente).
- **Atributos do cookie provados** (PEND-13): `opcoesDoCookie()`, a ação `salvarSenha` com a gravação real e o `Set-Cookie` do login real contra `next start` (`HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` em produção, `Max-Age`).
- **Guardas em profundidade** (PEND-16): a página de detalhe da conversa chama `exigirUsuario()`, `auditoria.listar` recebe o ator e exige admin, a varredura dos serviços está em `docs/sessao-e-acesso-endurecidos/VARREDURA-DE-GUARDAS.md` e `tests/guardas-arquitetura.test.ts` falha se uma tela ou rota nova ficar sem guarda.
- **Prova que falha sem a proteção:** 32 mutações temporárias registradas em `docs/sessao-e-acesso-endurecidos/MUTACOES.md` (e copiadas no `ENTREGA.md`).

## Como demonstrar

Subir como de costume (`npm run setup`, `npm run build`, `npm run start`), entrar com a conta de demonstração e seguir `docs/entregas/sessao-e-acesso-endurecidos/QA-PACOTE.md`. Para ver a renovação sem esperar 15 minutos: `JWT_TTL_SEGUNDOS=30`. Para ver o logout real: copiar o cookie `expx_sessao` nas ferramentas do navegador, clicar em Sair e recolocá-lo. A verificação feita num Chrome próprio está em `docs/sessao-e-acesso-endurecidos/VERIFICACAO-VISUAL.md`.

## O que a FT-13 precisa saber

- **`src/proxy.ts`:** o `matcher` não mudou (continua excluindo `_next/static`, `_next/image`, `favicon.ico` e as rotas de upload `api/agentes/[^/]+/fontes`). O proxy agora também chama `renovarCookieNaResposta` (`src/app/renovar-sessao.ts`): renova em requisição GET e em POST a `/api`, depois da metade da vida do token; **não** renova Server Action (POST a uma página, com ou sem o cabeçalho `next-action`), `/embed`, `/api/publico`, `/api/telegram`, `/api/saude`, nem token inválido ou revogado, e uma falha na renovação só vira o aviso `renovacao_falhou` no log. O uso só por upload não renova a sessão: se a FT-13 mexer no matcher dos uploads (PEND-19), isso continua valendo.
- **Banco:** migration `prisma/migrations/20261003000000_sessao_e_acesso_endurecidos`, que só acrescenta: a tabela `sessoes_revogadas` (`jti` chave primária, `usuarioId` sem chave estrangeira, `revogadaEm`, `expiraEm` com índice) e a coluna `usuarios.versaoDaSessao` (inteiro, padrão 0). `usuarios.sessoesValidasDesde` ficou sem uso. Tabela e coluna entram no backup (a cópia é do banco inteiro). **Restauração (PEND-20):** restaurar um backup antigo desfaz as revogações e as versões gravadas depois dele; tokens ainda dentro do `exp` (no máximo 12 horas) voltariam a valer, o que o aviso de restauração deveria mencionar.
- **Expurgo:** `executarExpurgo` (`src/servicos/expurgo.ts`) apaga, na mesma rodada de 6 em 6 horas, as `sessoes_revogadas` com `expiraEm` anterior a agora (`expiraEm` é o início da sessão mais `SESSAO_MAXIMA_HORAS`); a contagem sai em `ResultadoDoExpurgo.sessoesRevogadas` e não entra nos detalhes da auditoria `expurgo_automatico`.
- **Assinaturas que mudaram:** `assinarSessao(usuarioId, papel, { versao, jti, inicio, agora })`, `lerSessao(token, { agora })`, `opcoesDoCookie(maxAge)`, `entrar(entrada, { agora })`, `usuarioDaSessao(token, { agora })`, `retomarConversaDoVisitante(agenteId, visitante, { ip, limitador })` e `auditoria.listar(autor, filtros)`. Novas: `revogarSessao`, `renovarSessaoSePreciso`, `tokenDaSessao` (`src/app/sessao-servidor.ts`).
- **Variável nova:** `SESSAO_MAXIMA_HORAS` (padrão 12), lida só em `src/lib/ambiente.ts`, validada no start de produção e documentada no `.env.example` e no README.
- **Apoios de teste novos:** `tests/apoio/next-falso.ts` (cookies, cabeçalhos e redirecionamento do Next simulados), `tests/apoio/login-http.ts` (formulários de Server Action contra `next start`) e `tests/apoio/guardas.ts`; o limitador padrão lê o relógio na hora da chamada (`vi.setSystemTime` o alcança); portas dos servidores de teste novos: 3250, 3251 e 3252. Todo teste que sobe `next start` exige `npm run build` depois da última mudança em `src/`.
- **Citações de linha:** `tests/projeto.test.ts` confere citações `arquivo:linha` de `CONVENCOES.md` e `LACUNAS.md`; mudar `src/` desloca linhas e a task precisa reajustá-las.
- **Teste intermitente alheio** (PEND-30): `tests/embed-pagina.test.ts` proíbe `4321` no HTML do 404 e o código de referência aleatório às vezes o contém; é da FT-13.

## Desvios do plano

Os desvios task a task estão em `docs/sessao-e-acesso-endurecidos/FECHAMENTO.md`. Os principais: o teste do fechamento da FT-11 fixava o placar do mapa e foi relaxado; uma suíte inteira teve uma falha intermitente alheia (`suite: parcial` na T-02.03); o teste de arquitetura ganhou a verificação das funções internas sem ator.

## Premissas e pendências

Novas: PR-101 a PR-104 (`Provisória: false`). Realizadas na FT-12: PR-12, PR-16, PR-27, PR-31, PR-36 e PR-56. Resolvidas: PEND-12 a PEND-17. Novas pendências: **PEND-31** (`decisao_humana`: cookie roubado sem logout vale até o `exp` ou as 12 horas; segundo fator ou ligação ao IP) e **PEND-30** (`trabalho_novo`, FT-13: teste intermitente). Limites em `docs/stack/LACUNAS.md` (43 a 51).

## Verificação

2993 testes passam na suíte inteira (130 novos; os 9 pulados são os do contêiner, opt-in); `npx tsc --noEmit`, `npm run lint`, `npm run build` e `npm audit --audit-level=high` (0) verdes. Verificação no navegador em `docs/sessao-e-acesso-endurecidos/VERIFICACAO-VISUAL.md`.
