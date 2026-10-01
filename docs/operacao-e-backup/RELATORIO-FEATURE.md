---
expx_schema: 1
expx_tool: buildx
kind: relatorio_feature
projeto_id: plataforma-chatbot-ia
feature_id: FT-11
trabalho_id: operacao-e-backup
status: entregue
sprints: 8
tasks: 38
testes_suite: 2863
data: 2026-10-01
---

# Relatório da FT-11 — Operação e backup

Branch `feat/operacao-e-backup`, a partir de `feat/privacidade-e-auditoria` (PRs empilhados, sem remoto). Realiza PR-20 (backup com restauração testada), PR-21 (log, erro, saúde e configuração) e PR-24 (contêiner com volume persistente). PR local: `docs/entregas/operacao-e-backup/PR.md`, pacote de QA em `docs/entregas/operacao-e-backup/QA-PACOTE.md`.

## O que foi entregue

- **Log e erro** (`src/lib/log.ts`, `src/proxy.ts`, `src/instrumentation.ts`): linha JSON por evento, níveis por `LOG_LEVEL`, redação central de segredos, correlação por requisição (`X-Correlacao`, `AsyncLocalStorage`) e erro inesperado com "Código de referência" e sem pilha em páginas, rotas e ações. Uma regra de lint proíbe `console` em `src/` fora de `log.ts`.
- **Configuração e saúde** (`src/lib/ambiente.ts`, `src/servicos/saude.ts`, `src/servicos/sistema.ts`): em produção, `JWT_SECRET`, `DATABASE_URL` e `ENCRYPTION_KEY` são obrigatórias e o start cai listando os nomes que faltam; `GET /api/saude` (`ok`, `degradado`, `falha`; 200 ou 503) e a tela **Configurações > Sistema** (admin): saúde, versão, migrations, tamanhos, fila, expurgo, configuração em sim ou não.
- **Backup** (`src/lib/backup.ts`, `src/servicos/backup.ts`, `scripts/backup.ts`, `GET /api/backups/[nome]`): um `.tar.gz` com manifesto e SHA-256, banco copiado pela API de backup online do SQLite, `storage/` sem temporários, modo 0600, retenção `BACKUP_MANTER`; gerar, listar e baixar na tela, auditado (`backup_gerado`).
- **Restauração** (`src/lib/restauracao.ts`, `scripts/restore.ts`): só por linha de comando; valida antes de tocar, recusa adulteração, truncamento e esquema mais novo, guarda `pre-restauracao-<data>`, troca com desfazer, migra esquema mais antigo, reconstrói o FTS5 e audita `restauracao`. Teste fim a fim numa instalação limpa (`tests/restauracao-fim-a-fim.test.ts`, PR-20).
- **Contêiner**: `Dockerfile` (três estágios, `node:22-bookworm-slim`, ffmpeg, usuário `node`, volume `/data`, `HEALTHCHECK`), `docker-entrypoint.sh` (migrate deploy e `next start`), `docker-compose.yml`, desligamento limpo no SIGTERM, `npm run admin:criar`, job de CI `construir-imagem`.
- Premissas PR-92 a PR-100, convenções e lacunas 34 a 42, README "Operação e backup", exemplo de ambiente.

## Como demonstrar

`docker compose up -d --build` (com o arquivo de ambiente preenchido a partir do exemplo), `docker compose run --rm app npm run admin:criar -- <e-mail> "<nome>"`, entrar, abrir Configurações > Sistema e usar Gerar backup agora. Roteiro completo em `docs/entregas/operacao-e-backup/QA-PACOTE.md`.

## O que a próxima etapa precisa saber

- Variáveis de operação lidas só em `src/lib/ambiente.ts`: `LOG_LEVEL`, `BACKUP_DIR`, `BACKUP_MANTER`, `TZ`, `STORAGE_DIR`, `DATABASE_URL`; `ADMIN_SENHA` só no comando de criação do administrador.
- Para registrar log use `log.info/aviso/erro` de `src/lib/log.ts` (nunca `console`); erro de rota devolve o código por `src/app/api/resposta-de-erro.ts`.
- Backup e restauração: `gerarBackup` em `src/lib/backup.ts`, `lerEValidarBackup` e `restaurarArquivos` em `src/lib/restauracao.ts`. Tabela ou pasta nova de dado persistente precisa entrar no backup (a lista do `storage/` está em `src/lib/backup.ts`) e ter teste em `tests/restauracao-fim-a-fim.test.ts`.
- Migration nova muda a conta "n de n migrations" da tela (`src/lib/versao.ts`).
- O proxy exclui as rotas de upload `/api/agentes/<id>/fontes...` porque o Next limita o corpo a 10 MB nas rotas que passam por ele.
- A `ENCRYPTION_KEY` não está no backup.

## Resumo operacional (para o relatório final do projeto)

- **Subir:** `docker compose up -d --build`. Primeiro administrador: `docker compose run --rm -e ADMIN_SENHA=<senha> app npm run admin:criar -- <e-mail> "<nome>"`.
- **Obrigatórias em produção:** `JWT_SECRET` (32 caracteres ou mais), `ENCRYPTION_KEY` (32 bytes em hex ou base64) e `DATABASE_URL` (a imagem já define `file:/data/app.db`). `APP_URL` com HTTPS é recomendada: sem ela o chat embutido e o Telegram não funcionam, e só há aviso no log.
- **O operador precisa fornecer:** a máquina com Docker, domínio e HTTPS por proxy reverso (exemplo Caddy no README, com `TRUST_PROXY=1`), chave do OpenRouter, token do bot do Telegram, um lugar fora da máquina para copiar os backups e um cofre separado para a `ENCRYPTION_KEY`.
- **Gerar backup:** Configurações > Sistema > Gerar backup agora, ou `docker compose exec app npm run backup` (serve ao cron).
- **Restaurar:** `docker compose stop app`, `docker compose run --rm app npm run restore -- /data/backups/<arquivo>.tar.gz`, `docker compose start app`. Só por linha de comando.
- **Verificado no contêiner (teste real, `VERIFICAR_CONTEINER=1`):** construção da imagem, saúde, ffmpeg, criação do administrador, seed, persistência após reinício, backup, restauração e SIGTERM com saída limpa. **Não verificado:** hospedagem real, registro de imagens, arm64 em servidor, o contêiner pelo navegador, restauração entre volumes diferentes, celular real e leitor de tela.

## Desvios do plano

Os desvios task a task estão em `docs/operacao-e-backup/FECHAMENTO.md`. Os principais: o proxy truncava uploads grandes e o matcher passou a excluir as rotas de fonte; o `.gitignore` escondia `src/app/api/backups`; um link simbólico pendente quebrava o tar; `prisma` e `tsx` viraram dependências de produção.

## Premissas e pendências

Novas: PR-92 a PR-100 (PR-99, o contêiner, `Provisória: true`). PR-20, PR-21 e PR-24 realizadas. Pendência nova: **PEND-09** (`recurso_externo`: hospedagem, cópia externa dos backups e guarda da `ENCRYPTION_KEY`); a PEND-07 ganhou as telas da FT-11. Limites em `docs/stack/LACUNAS.md` (34 a 42).

## Verificação

2863 testes passam na suíte inteira (319 novos; os 9 pulados são os do contêiner, opt-in); `npx tsc --noEmit`, `npm run lint`, `npm run build` e `npm audit --audit-level=high` (0) verdes. Verificação no navegador em `docs/operacao-e-backup/VERIFICACAO-VISUAL.md` e do contêiner em `docs/operacao-e-backup/VERIFICACAO-CONTEINER.md`.
