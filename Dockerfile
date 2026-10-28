# syntax=docker/dockerfile:1
#
# Imagem de produção do Converse (FT-11, PR-24, PR-99).
#   - Node 22 em Debian "bookworm-slim" (a mesma versão do CI e do README) e ffmpeg do próprio Debian.
#   - Três estágios: instala as dependências, constrói (prisma generate + next build, que inclui o
#     src/widget/widget.js e a rota /widget.js) e monta a imagem final só com o que roda.
#   - Usuário "node" (não-root). Tudo que muda mora em /data (volume): o banco, o storage e os backups.
#   - HEALTHCHECK em /api/saude. O entrypoint aplica as migrations e executa o servidor; qualquer outro
#     comando (npm run backup, npm run restore, npm run admin:criar) roda direto.
#   - Não roda em função serverless: SQLite em arquivo, disco local e processamento em segundo plano pedem um
#     processo de longa duração. O HTTPS é do proxy reverso na frente (veja o README).

# ---- 1. dependências (todas, inclusive as de desenvolvimento: o build precisa delas) ----------------------
FROM node:22-bookworm-slim AS dependencias
WORKDIR /app
# better-sqlite3 traz binário pronto para as arquiteturas comuns; se não houver, o npm compila com estas ferramentas.
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

# ---- 2. construção -----------------------------------------------------------------------------------------
FROM dependencias AS construcao
COPY tsconfig.json next.config.ts prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src
COPY scripts ./scripts
RUN npx prisma generate
# O build só precisa de valores de mentira para DATABASE_URL e JWT_SECRET: nenhum segredo entra na imagem.
RUN DATABASE_URL=file:/tmp/construcao.db JWT_SECRET=segredo-de-construcao-descartavel-0123456789abcdef npm run build \
  && rm -rf .next/cache \
  && npm prune --omit=dev

# ---- 3. imagem final ---------------------------------------------------------------------------------------
FROM node:22-bookworm-slim AS final
# ffmpeg (traz o ffprobe) para a transcrição de vídeo e áudio; tzdata para o fuso (o painel agrupa por dia local).
RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg tzdata ca-certificates python3 python3-venv \
  && rm -rf /var/lib/apt/lists/*

# Versão fixada com o componente EJS para os desafios JavaScript do YouTube.
ARG YTDLP_VERSION=2026.10.26
RUN python3 -m venv /opt/ytdlp \
  && /opt/ytdlp/bin/pip install --no-cache-dir "yt-dlp[default]==${YTDLP_VERSION}"
ENV YTDLP_PATH=/opt/ytdlp/bin/yt-dlp

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    NEXT_MANUAL_SIG_HANDLE=1 \
    TZ=America/Sao_Paulo \
    PORT=3000 \
    DATABASE_URL=file:/data/app.db \
    STORAGE_DIR=/data/storage \
    BACKUP_DIR=/data/backups

WORKDIR /app
COPY --from=construcao --chown=node:node /app/package.json /app/package-lock.json ./
COPY --from=construcao --chown=node:node /app/node_modules ./node_modules
COPY --from=construcao --chown=node:node /app/.next ./.next
COPY --from=construcao --chown=node:node /app/prisma ./prisma
COPY --from=construcao --chown=node:node /app/src ./src
COPY --from=construcao --chown=node:node /app/scripts ./scripts
COPY --from=construcao --chown=node:node /app/tsconfig.json /app/next.config.ts /app/prisma.config.ts ./
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
  && mkdir -p /data \
  && chown node:node /data

USER node
VOLUME ["/data"]
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/api/saude').then((r) => process.exit(r.status === 200 ? 0 : 1), () => process.exit(1))"

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["servidor"]
