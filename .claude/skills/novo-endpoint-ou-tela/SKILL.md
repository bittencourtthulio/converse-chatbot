---
name: novo-endpoint-ou-tela
description: Use ao criar rota HTTP (`src/app/api/**`), página, ação de servidor ou componente que chama serviço neste projeto Next.js, incluindo rota pública sem sessão. Não use para ajuste puramente visual de CSS.
---

# Novo endpoint ou tela

## Quando usar
- Handler novo em `src/app/api/<recurso>/route.ts` (com sessão ou público).
- Página nova em `src/app/(sistema)/...` ou ação de servidor em `src/app/acoes.ts`.

## Quando NÃO usar
- Só estilo: edite `src/estilos/` usando tokens, sem esta skill.
- Regra de negócio nova: ela vai primeiro para `src/servicos` (agente `servicos`).

## Procedimento
1. **A regra já existe num serviço?** Se não, peça ao orquestrador o agente `servicos`. A rota e a tela não calculam nada.
2. **Teste primeiro.** Rota: `tests/<assunto>-rota.test.ts` sobe `next start` por `tests/apoio/servidor.ts` (exige `npm run build`). Lógica de tela: módulo puro `src/componentes/<assunto>-logica.ts` com teste `node`.
3. **Handler com sessão:** `usuarioAtual()` → 401 em JSON (sem redirecionar) → corpo validado por zod → serviço → tradução do `ErroDeAplicacao` para o status → `export const dynamic = 'force-dynamic'`. Modelo: `src/app/api/agentes/[id]/conversar/route.ts`.
4. **Handler público** (`src/app/api/publico/...`): nenhum cookie nem sessão; 404 igual para inexistente e inativo; 429 com `Retry-After`; `Cache-Control: no-store`; erro ao visitante só por `erroParaVisitante`; IP por `ipDoCliente`; `POST` recusa `Origin` estranha.
5. **Stream:** serviço devolve `AsyncGenerator`; a rota usa `fluxoDeEventos` de `src/app/eventos-sse.ts`.
6. **Página:** dentro de `(sistema)` ganha a guarda de acesso; fora dele (como a landing) precisa ser pública de propósito. Menu em `itens-de-menu.ts`; aba de agente em `abas-do-agente.ts`.
7. **Estilo:** só tokens de `src/estilos/tokens.css`; texto do modelo por `TextoDoModelo`.
8. **Verifique:** `npx tsc --noEmit`, `npx eslint src/app src/componentes`, `npx vitest run tests/camadas.test.ts tests/tokens.test.ts`, `npm run build` e o teste de rota. Cole a saída.

## Red flags
- ✅ Rota com menos de ~40 linhas, delegando ao serviço.
- 🚩 `import ... '@/lib/prisma'` ou `'@/gerado'` na apresentação (erro de lint).
- 🚩 Página do sistema sem guarda; rota pública lendo cookie; erro do provedor indo ao visitante.
- 🚩 `dangerouslySetInnerHTML`; cor ou fonte literal; fonte/script de CDN.

## Exemplo
Entrada: "endpoint para o admin listar backups".
Saída: `src/servicos/backup.ts` já tem `listarBackups(autor)` → `src/app/api/backups/route.ts` (novo; hoje só existe `[nome]/route.ts`) com `usuarioAtual()` + checagem de papel → teste de rota → verificação do passo 8.

## Checklist final
- [ ] Teste escrito antes e verde
- [ ] Guarda de sessão/papel (ou público de propósito)
- [ ] Nenhum import de Prisma na apresentação
- [ ] Tokens, sem valor literal
- [ ] tsc, lint, build e teste de rota com saída colada
