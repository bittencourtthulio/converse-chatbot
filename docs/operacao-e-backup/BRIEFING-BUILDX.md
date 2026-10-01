---
expx_schema: 1
expx_tool: sprintx
kind: briefing
trabalho_id: operacao-e-backup
origem_buildx: plataforma-chatbot-ia
feature_id: FT-11
criado_em: 2026-10-01
atualizado_em: 2026-10-01
---

# Briefing do buildx — FT-11 Operação e backup

## Problema

O operador sobe o sistema por contêiner numa máquina limpa, vê o estado de saúde numa tela de Configurações e gera e restaura um backup do banco e dos arquivos.

## Escopo

1. **Log estruturado** `src/lib/log.ts` (infraestrutura): uma linha JSON por evento (`nivel`, `quando`, `msg`, `correlacao`, campos), nível por `LOG_LEVEL`, redação central de chaves sensíveis (senha, token, chave, `authorization`, `cookie`, `secret`, texto de mensagem de conversa, e-mail mascarado) provada por teste que injeta valores sensíveis; correlação por requisição (`AsyncLocalStorage`) com o cabeçalho de resposta `X-Correlacao`. Todo `console.*` de `src/` passa a usar o log (unificando a correlação que `chat-erros` já faz) e um teste de arquitetura proíbe `console.*` novo em `src/` fora de `log.ts`. Erro inesperado devolve ao usuário o código de referência (a correlação) e uma mensagem genérica, nunca pilha; `error.tsx`, `global-error.tsx` e `not-found.tsx` em estilo SaaS mostram o código de referência. Teste prova que a pilha não vaza em rota de API nem em página.
2. **Configuração validada no start (L20):** `validarAmbiente()` em `src/lib/ambiente.ts`, chamada por `src/instrumentation.ts`. Em produção, `JWT_SECRET` (32 caracteres ou mais), `DATABASE_URL` e `ENCRYPTION_KEY` válida são obrigatórias e derrubam o start com a lista dos nomes ausentes (nunca valores); `APP_URL` ausente ou sem HTTPS em produção é aviso. Em desenvolvimento e teste o comportamento lazy da `ENCRYPTION_KEY` continua.
3. **Saúde:** `GET /api/saude` público e mínimo (`ok`, `degradado` ou `falha`; HTTP 200 ou 503; sem detalhe; `Cache-Control: no-store`) que confere o banco, o diretório de dados gravável e a tabela FTS5; e a tela **Configurações > Sistema** (admin) com versão do app e do esquema, tempo de atividade, Node, fuso, tamanho do banco e do `storage/`, ffmpeg e ffprobe, fila de fontes, agendador do expurgo, `ENCRYPTION_KEY`, `APP_URL`, chave do OpenRouter (sim ou não, nunca o valor) e o último backup. Ffmpeg ausente é `degradado`, não falha.
4. **Backup:** `scripts/backup.ts` (`npm run backup`, também chamado pela tela): cópia consistente do SQLite pela API de backup online (nunca o arquivo cru em uso) mais o `storage/` sem temporários (`audio/`, `segmentos/`, `*.parcial`), em um único `.tar.gz` com `manifest.json` (data, versão do app, migrations, contagens por tabela, SHA-256 de cada parte), em `BACKUP_DIR` com permissão 0600; retenção `BACKUP_MANTER` (padrão 7) só sobre arquivos do próprio padrão de nome; sem shell. Na tela: "Gerar backup agora" (auditoria `backup_gerado`), lista dos backups e download autenticado e seguro. O backup NÃO contém a `ENCRYPTION_KEY`, e isso é dito com destaque.
5. **Restauração:** `scripts/restore.ts` (`npm run restore -- <arquivo>`), só por linha de comando: valida manifest e SHA-256 antes de tocar em qualquer coisa, recusa esquema mais novo, guarda uma cópia do estado atual em `BACKUP_DIR/pre-restauracao-<data>`, troca banco e `storage/` o mais atomicamente possível, aplica `prisma migrate deploy` se o esquema for mais antigo, reconstrói o índice FTS5, grava a auditoria `restauracao` no banco já restaurado e recusa rodar com o servidor de pé (a menos que `--forcar`).
6. **Teste da restauração (PR-20):** instalação com dados de todas as camadas, backup, destruição, restauração em diretórios limpos e conferência linha a linha (busca FTS, arquivo original, temporários de fora, auditoria `restauracao`, chave cifrada ainda decifra); casos negativos (adulterado, sem manifest, esquema mais novo, truncado, diretório sem permissão). Nenhum teste toca o banco ou o `storage/` reais.
7. **Contêiner (PR-24):** `Dockerfile` multi-estágio com ffmpeg, usuário não-root, `HEALTHCHECK`, volume `/data`, entrypoint que aplica as migrations e trata `SIGTERM`; `docker-compose.yml`; `.dockerignore`; construído e executado de verdade nesta máquina.
8. **Documentação operacional** no README (requisitos, tabela de variáveis, Docker, HTTPS e proxy, URL pública, backup e restauração, cron, atualização, segurança, solução de problemas pelo código de referência), job de CI que constrói a imagem, `.env.example` completo.
9. **Convenções, premissas e lacunas** novas; testes que contam itens de menu atualizados.
10. **Verificação no navegador** da tela Sistema, do backup (gerar, listar, baixar), das páginas de erro e 404 com o código de referência, nos dois temas e a 375px, e do contêiner.

## Não-objetivos

Métrica e rastreamento distribuído (descartados no PROJETO.md); restauração pela interface (decisão desta feature: só por linha de comando); backup para nuvem ou agendamento interno de backup (o operador agenda por cron do sistema); multiempresa (PR-02); alta disponibilidade e mais de uma instância (PR-05); hospedagem serverless (PR-24); alterar o comportamento de FT-01 a FT-10 além dos pontos de contato listados (trocar `console.*` pelo log, o `error.tsx`, o item de menu e a ação de auditoria nova).

## Critérios de aceite de negócio cobertos

- Restauro um backup em uma instalação limpa e os dados voltam.
- A interface funciona no celular e nos temas claro e escuro.
- (Operação) subir por contêiner atrás de HTTPS com volume persistente (PR-24).

## Premissas aplicáveis

PR-20, PR-21 e PR-24 (realiza); PR-05, PR-11, PR-14, PR-19, PR-23, PR-26, PR-37, PR-42, PR-50, PR-72, PR-86, PR-89 (`docs/projeto/PREMISSAS.md`).

## Convenções

`docs/stack/CONVENCOES.md`.
