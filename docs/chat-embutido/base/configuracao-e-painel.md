# Configuração do chat por agente, aba Publicar, seed

## Contrato de entrada

- `Agente` (`prisma/schema.prisma`): `id`, `nome`, `instrucoes`, `modelo`, `temperatura`, `mensagemInicial`, `criadoPorId`. Nenhum campo de chat existe ainda. Migrations só acrescentam (`tests/migracoes.test.ts` lê o SQL); `migrate deploy` aplica (nunca `db push`).
- Serviços de agente recebem o autor (`UsuarioAutenticado`) e validam com zod (`src/servicos/agentes.ts`); qualquer usuário autenticado edita (PR-12, PR-40). Ações de formulário em `src/app/acoes.ts` (um arquivo); `Formulario`/`useActionState` em `src/componentes/Formulario.tsx`.
- Abas: lista única `src/componentes/abas-do-agente.ts` (`ABAS_DO_AGENTE`, `hrefDaAba`); subrota em `src/app/(sistema)/agentes/[id]/<caminho>` com `loading.tsx`; `carregarAgente` dá 404.
- `ambiente.appUrl` (`src/lib/ambiente.ts`) já existe com padrão `http://localhost:3000`, usada no `HTTP-Referer` do OpenRouter (PR-38); a FT-06 precisa distinguir "configurada" de "padrão" para cair na origem da requisição.
- Seed `prisma/seed.ts`: agente `agente-de-exemplo` com `upsert` e `update: {}`, fonte de exemplo pronta; `tests/seed.test.ts` a exercita.
- Tokens: `src/estilos/tokens.css`; `tests/tokens.test.ts` proíbe `#hex`, `rgb(`, `hsl(` e `oklch(` em qualquer `.ts`, `.tsx` e `.css` de `src` fora de `tokens.css`: a cor do agente (dado do usuário) e as amostras de cor não podem ser escritas como literal em código.

## Contrato de saída

- Nenhuma tela de publicação existe. A aba nova "Publicar" segue o padrão visual das abas existentes (cartões `cartao cartao-largo`, `pilha`, `campo`, `Alerta`, `Esqueleto`).

## Limites e cotas

- Sem limite novo de tamanho de formulário definido: a feature define (título, aviso 300, 3 sugestões, limite diário de 1 a 100000).

## Erros conhecidos e tratamento

- Erro de aplicação vira mensagem de tela pela ação (`mensagemDe`); inesperado vira frase genérica.

## Riscos para a nossa implementação

- `limparBanco` (`tests/ajuda.ts`) precisa apagar a tabela nova antes do agente (ou contar com a cascata).
- A seed é idempotente com `update: {}`: a configuração de chat do agente de exemplo precisa do mesmo padrão.
- A pré-visualização em iframe depende de `frame-ancestors 'self'` na rota do embed.

## Fonte

`prisma/schema.prisma`, `src/servicos/agentes.ts`, `src/app/acoes.ts`, `src/componentes/Formulario.tsx`, `src/componentes/abas-do-agente.ts`, `src/lib/ambiente.ts`, `prisma/seed.ts`, `tests/tokens.test.ts`, `tests/ajuda.ts` — acessados em 2026-09-30.
