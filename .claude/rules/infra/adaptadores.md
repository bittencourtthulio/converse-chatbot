---
paths:
  - "src/lib/**"
  - "scripts/**"
  - "Dockerfile"
  - ".github/**"
---
# Adaptadores, ambiente e entrega

- **Ambiente:** toda variável é lida em `src/lib/ambiente.ts` (inclui `OPENROUTER_BASE_URL`, `TELEGRAM_API_BASE`, `STORAGE_DIR`, `TRUST_PROXY`, `SESSAO_MAXIMA_HORAS`). Variável nova entra também em `.env.example`; `tests/projeto.test.ts` confere o par.
- **Provedor externo:** um arquivo por provedor, URL base por ambiente (é o que deixa o servidor falso entrar em teste); erro do provedor vira `ErroDeAplicacao` sem repassar corpo. YouTube não tem API oficial: `src/lib/youtube.ts` lê a página e pode quebrar sem aviso.
- **Sessão:** JWT em cookie por `jose`, com `jti` e revogação no logout, renovação por atividade e limite absoluto (`src/lib/sessao.ts`).
- **Armazenamento:** `<raiz>/fontes/<agenteId>/<fonteId>/original`; só ids gerados pelo servidor; `path.resolve` de tempo de execução leva `turbopackIgnore`.
- **Backup:** `tar` + API de backup online do SQLite, manifesto e SHA-256; completo, sem incremento. Restaurar exige servidor parado.
- **Contêiner:** `node:22-bookworm-slim` com `ffmpeg`, usuário não-root, healthcheck em `/api/saude`; só testado em aarch64.
- **CI:** lint, tipos, build, testes e `npm audit --audit-level=high` a cada push e PR.
