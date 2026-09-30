# Converse

Plataforma de agentes de IA com base de conhecimento própria. Você cria agentes, escolhe o modelo de linguagem (via OpenRouter), alimenta a base com arquivos, textos e vídeos e publica o agente no Telegram e num chat embutido em qualquer site com um script.

O projeto é construído por features, na ordem de `docs/projeto/MAPA.md`. Hoje existe a fundação: login, papéis, painel, cadastro de usuários, perfil e troca de senha, num layout de SaaS com tema claro e escuro. Agentes, base de conhecimento e canais chegam nas próximas features. O nome "Converse" é provisório e se troca por `APP_NAME`.

## Pré-requisitos

- Node 22 ou superior e npm 10.

## Como rodar

1. Copie o exemplo de configuração: `cp .env.example .env`, e preencha `JWT_SECRET` no `.env` com um segredo seu (o comando para gerar está no próprio arquivo de exemplo).
2. Instale as dependências: `npm install`.
3. Prepare o banco: `npm run setup` (gera o client do Prisma, aplica as migrations e cria as contas de demonstração).
4. Suba o servidor: `npm run dev` e abra `http://localhost:3000`.

## Contas de demonstração

Fictícias, criadas pela seed, que se recusa a rodar em produção.

| Papel | E-mail | Senha |
|---|---|---|
| Administrador | `admin@exemplo.local` | `demo1234` |
| Usuário | `usuario@exemplo.local` | `demo1234` |

Só o administrador cadastra outros usuários (Configurações, Usuários).

## Configuração

Toda variável é lida em um ponto só, `src/lib/ambiente.ts`. O que cada uma faz está no `.env.example`.

| Variável | Para quê | Obrigatória |
|---|---|---|
| `DATABASE_URL` | arquivo SQLite | sim |
| `JWT_SECRET` | assinatura da sessão | sim |
| `JWT_TTL_SEGUNDOS` | vida da sessão (padrão 900) | não |
| `APP_NAME` | nome do produto na interface (padrão Converse) | não |
| `TRUST_PROXY` | `1` atrás de proxy, para o limite de login usar `X-Forwarded-For` | não |

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | build de produção (precisa de `DATABASE_URL` e `JWT_SECRET` no ambiente) |
| `npm run start` | servidor de produção (depois do build) |
| `npm run lint` | ESLint, inclusive a regra da direção das camadas |
| `npm test` | suíte inteira (Vitest); o teste de rotas sobe o servidor de produção e pede um `npm run build` antes |
| `npm run test:watch` | testes em modo observação |
| `npm run setup` | generate, migrations e seed |
| `npm run db:migrate` | aplica as migrations |
| `npm run db:seed` | cria as contas de demonstração |
| `npx tsc --noEmit` | checagem de tipos |
| `npm audit --audit-level=high` | auditoria de dependências |

A pipeline (`.github/workflows/ci.yml`) roda lint, tipos, build, testes e auditoria a cada mudança.

## Camadas

A dependência segue uma direção só, e o `npm run lint` a impõe.

| Camada | Pasta | Regra |
|---|---|---|
| Apresentação | `src/app`, `src/componentes`, `src/estilos` | chama `src/servicos`; não importa `src/lib/prisma` |
| Aplicação | `src/servicos` | casos de uso e validação com zod; não importa `next/*` nem a apresentação |
| Dados e infraestrutura | `src/lib` | Prisma, sessão, ambiente, limite de uso; não importa serviços nem a apresentação |

Para acrescentar uma tela ao menu, edite só `src/componentes/itens-de-menu.ts`. As cores vivem em `src/estilos/tokens.css`; nenhum componente usa cor literal.
