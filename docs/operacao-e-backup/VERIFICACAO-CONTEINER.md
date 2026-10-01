# Verificação do contêiner — FT-11

Data: 2026-10-01. Docker 29.2.1 (Docker Desktop, arquitetura aarch64 do host), Compose v5.1.0. Executada por `VERIFICAR_CONTEINER=1 npx vitest run tests/conteiner-imagem.test.ts` (9 casos, 121 s), com nomes próprios: imagem `converse-teste:ft11`, projeto `converse-ft11-teste`, volume e rede com esse prefixo. Segredos descartáveis gerados na hora e passados pelo ambiente do comando; nenhum arquivo os guarda. Nada de outros projetos foi tocado.

## O que foi verificado de verdade

| Item | Resultado |
|---|---|
| `docker build` da imagem (3 estágios, `npm ci`, `prisma generate`, `next build` com `/widget.js`, poda) | construiu |
| Subida por `docker compose up -d` com o volume nomeado `dados` | healthy; `GET /api/saude` 200 `{"status":"ok"}` com `X-Correlacao`; `/entrar` e `/widget.js` 200 |
| `ffmpeg -version` e `ffprobe -version` dentro do contêiner | respondem |
| Usuário não-root, `/data` gravável, `TZ=America/Sao_Paulo` | confirmados |
| `npm run admin:criar` dentro do contêiner e login (`entrar`) com a senha; senha errada recusada | ok; a senha não aparece na saída |
| Seed de demonstração: recusada em produção; rodada só na verificação com `NODE_ENV=development`; login `admin@exemplo.local` | ok |
| Rota protegida `/configuracoes/sistema` sem sessão | 307 para o login |
| Persistência: `docker compose down` e `up`; usuários criados continuam | ok |
| `npm run backup` dentro do contêiner: arquivo 0600 em `/data/backups`, aviso da `ENCRYPTION_KEY` | ok |
| `npm run restore` com o servidor de pé | recusado ("Pare o servidor") |
| `docker compose stop`, `docker compose run --rm app npm run restore -- <arquivo>`, `start`: usuário apagado depois do backup volta; cópia `pre-restauracao-*` criada | ok |
| `docker stop` (`stop_grace_period` 30 s): código de saída 0, menos de 28 s, linhas `desligamento_iniciado` e `desligamento_concluido`, sem pilha nem segredo no log | ok |
| Limpeza: `down -v`, remoção da imagem; nenhum contêiner, volume, rede ou imagem do projeto restou | confirmado |

## O que não foi verificado

- Outras arquiteturas (amd64): a imagem só foi construída e executada em aarch64; o `better-sqlite3` usa binário pré-compilado ou compila (as ferramentas estão no estágio de dependências).
- Atrás de um proxy HTTPS real (o exemplo Caddy do README é documentação, não foi executado) e o webhook do Telegram contra um domínio público.
- Login pela interface dentro do contêiner por clique (o login foi provado pelo serviço `entrar` dentro do contêiner; a interface é vista na verificação no navegador).
- Restauração com o servidor de pé em outro contêiner do mesmo volume: a recusa só enxerga o próprio contêiner (lacuna registrada).
