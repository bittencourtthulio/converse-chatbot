# Ambiente e start do servidor

## Contrato de entrada

`src/lib/ambiente.ts` expõe `ambiente` com getters lazy: `jwtSecret` falha ao ser lido sem valor (`src/lib/ambiente.ts:6-15,28-30`); `chaveDeCriptografia` devolve `undefined` sem valor e só `src/lib/cripto.ts` a valida ao cifrar ou decifrar (`src/lib/ambiente.ts:47-50`); `appUrl` tem padrão `http://localhost:3000` (`src/lib/ambiente.ts:57-60`) e `appUrlPublica` não tem padrão e rejeita o que não é URL http(s) (`src/lib/ambiente.ts:66-80`); `ehProducao` lê `NODE_ENV` (`src/lib/ambiente.ts:111`). `DATABASE_URL` é lida por `src/lib/prisma.ts:7` e `prisma.config.ts:14` (exceção declarada em CONVENCOES seção 6). Não existe `validarAmbiente`. `src/instrumentation.ts:9-31` roda `register()` só com `NEXT_RUNTIME === 'nodejs'`, com um bloco `try` por tarefa (auditoria, expurgo, fila).

## Contrato de saída

Variáveis hoje: `DATABASE_URL`, `JWT_SECRET`, `JWT_TTL_SEGUNDOS`, `APP_NAME`, `TRUST_PROXY`, `ENCRYPTION_KEY`, `OPENROUTER_BASE_URL`, `APP_URL`, `MAX_TOKENS_RESPOSTA`, `STORAGE_DIR`, `MAX_UPLOAD_MB`, `TELEGRAM_API_BASE`, `TELEGRAM_PERMITIR_URL_NAO_HTTPS`, `MAX_VIDEO_MB`, `MAX_VIDEO_MINUTOS`, `FFMPEG_PATH`, `FFPROBE_PATH`, `OPENROUTER_MODELO_TRANSCRICAO`, `YOUTUBE_BASE`, `AUDITORIA_RETENCAO_DIAS` (`.env.example:1-95`). `EXIGIR_FFMPEG` é só de teste e CI (`.github/workflows/ci.yml:12`).

## Limites e cotas

`ENCRYPTION_KEY`: 32 bytes em hexadecimal (64 caracteres) ou base64 (`.env.example:19-24`); a validação mora em `src/lib/cripto.ts:29`. `JWT_SECRET`: tamanho mínimo NÃO DOCUMENTADO no código atual (o exemplo só diz para gerar 32 bytes, `.env.example:7-9`). O teste de rotas sobe `next start` com `NODE_ENV: 'production'` e o ambiente do teste: `JWT_SECRET` de 37 caracteres e `ENCRYPTION_KEY` válida (`tests/setup.ts:13-18`, `tests/apoio/servidor.ts:22`), então a validação em produção passa nesses testes.

## Erros conhecidos e tratamento

`obrigatoria` lança `Error` com o nome da variável e a remissão ao `.env.example` (`src/lib/ambiente.ts:9-14`). `register()` engole a falha de cada tarefa e grava uma linha de log (`src/instrumentation.ts:13-30`).

## Riscos para a nossa implementação

Derrubar o start em produção por variável ausente só vale para `NODE_ENV=production`; em teste e desenvolvimento o comportamento lazy continua (decisão a registrar, especializa a D-02 da FT-02). `APP_URL` sem HTTPS é aviso, não falha, porque o chat embutido e o Telegram dependem dela. A `ENCRYPTION_KEY` não entra no backup (premissa a registrar).

## Fonte

`src/lib/ambiente.ts`, `src/lib/prisma.ts`, `src/lib/cripto.ts`, `src/instrumentation.ts`, `.env.example`, `tests/setup.ts`, `tests/apoio/servidor.ts` — acessado em 2026-10-01
