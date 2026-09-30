---
expx_schema: 1
expx_tool: buildx
kind: relatorio_feature
projeto_id: plataforma-chatbot-ia
feature_id: FT-05
trabalho_id: respostas-com-conhecimento
status: entregue
sprints: 6
tasks: 22
testes_suite: 1065
data: 2026-09-30
---

# Relatório da FT-05 — Respostas com base no conhecimento

Branch `feat/respostas-com-conhecimento`, a partir de `feat/conhecimento-arquivos-e-texto` (PRs empilhados). PR local: descrição em `docs/entregas/respostas-com-conhecimento/PR.md`, pacote de QA em `docs/entregas/respostas-com-conhecimento/QA-PACOTE.md`.

## O que foi entregue

- Migration `20260930190000_busca_fts5` (SQL cru, só acrescenta): tabela virtual `trechos_fts` de conteúdo externo sobre `trechos`, tokenizer `unicode61 remove_diacritics 2`, três gatilhos e `rebuild` inicial. Provado: insert, update, delete, cascata de fonte e de agente, reprocessamento e `limparBanco`, e preenchimento de trechos pré-existentes.
- `src/servicos/recuperacao.ts` e `src/servicos/recuperacao-termos.ts`: `buscarTrechos` (FTS5, BM25, até 6 trechos, só fonte `pronto` do agente, termos limpos entre aspas, nunca concatenados em SQL), `buscarNaBase`, `reconstruirIndiceDeTrechos`; limiar por termo significativo; continuação por pergunta anterior; ~5.000 trechos em poucas dezenas de ms.
- Modo fundamentado em `src/servicos/chat.ts` e `chat-prompt.ts`: agente com fonte pronta recebe o material numerado em bloco com marcador aleatório por requisição, instruções anti-injeção (PR-15), higienização e orçamento de 6000 caracteres; sem trecho relevante, a instrução de dizer que não encontrou; sem fonte pronta, turno idêntico ao da FT-03.
- Evento SSE `fontes` antes do `fim`, JSON em `Mensagem.fontes`, retomada da conversa com as fontes; falha nas fontes não derruba a resposta.
- Aba Testar: Fontes abaixo da resposta (citadas em destaque, consultadas recolhidas, trecho expansível) e referências `[n]` clicáveis pelo renderizador seguro; cartão "Testar busca" e `POST /api/agentes/[id]/buscar` na aba Conhecimento.
- Convenções e lacunas com evidência do SQL cru para FTS5 e da regra "texto do usuário nunca concatenado em SQL"; README.

## Como demonstrar

`npm run setup`, `npm run build`, `npm run start`, entrar com as contas de demonstração do README e seguir `docs/entregas/respostas-com-conhecimento/QA-PACOTE.md`. Sem gastar crédito, apontar `OPENROUTER_BASE_URL` para o servidor simulado (`tests/apoio/openrouter-falso.ts`). O "Testar busca" funciona sem chave.

## Verificação

1065 testes na suíte inteira (174 novos); `npx tsc --noEmit`, `npm run lint`, `npm run build` e `npm audit --audit-level=high` (0) verdes. Verificação visual em `docs/respostas-com-conhecimento/VERIFICACAO-VISUAL.md`: aba Testar com fontes e cartão nos temas escuro e claro (Testar com fontes só no escuro); 375 px não foi possível.

## O que a próxima feature precisa saber

- `buscarTrechos(agenteId: string, pergunta: string, opcoes?: { limite?: number; perguntaAnterior?: string }): Promise<TrechoEncontrado[]>` em `src/servicos/recuperacao.ts`, com `TrechoEncontrado = { trechoId, fonteId, titulo, posicao (a partir de 1), texto, pontuacao (BM25 com sinal trocado, maior é melhor) }`. Só lê; não exige sessão (quem chama decide).
- `responderMensagem` (`src/servicos/chat.ts`) agora também emite `{ tipo: 'fontes', fontes: FonteDaResposta[] }` logo antes do `fim` quando houve trechos. `src/app/eventos-sse.ts` o traduz para `event: fontes` e `src/componentes/leitor-de-sse.ts` o lê; eventos desconhecidos continuam ignorados por clientes antigos.
- `Mensagem.fontes` guarda o JSON `FonteDaResposta[]` = `[{ fonteId, titulo, citada, trechos: [{ n, posicao, trechoTexto (até 300 caracteres) }] }]`; `lerFontesGravadas` (`src/servicos/fontes-da-resposta.ts`) lê com segurança (JSON inválido vira lista vazia). A FT-09 pode mostrar as fontes por ele.
- Canais públicos (FT-06, FT-07): quem chama `responderMensagem` com `canal: 'widget'` ou `'telegram'` herda o modo fundamentado sem mudar nada, porque a busca e o prompt dependem só do `agenteId`. O handler público deve só traduzir o evento `fontes` se quiser mostrá-lo (o visitante pode ignorá-lo); a mensagem ao visitante em erro continua `mensagemParaVisitante`. O modo fundamentado é decidido por existir fonte `pronto`, não por canal.
- FT-11 (backup e restauração): o índice `trechos_fts` depende do `rowid` de `trechos`; depois de restaurar ou de um `VACUUM`, rodar `reconstruirIndiceDeTrechos()` (PR-50).
- Nenhuma variável de ambiente nova; nenhuma dependência nova.

## Desvios do plano

- Sem desvio de escopo. Ajustes de arquivos: `src/componentes/ChatDeTeste.tsx` teve um `else if` já na T-04.01 (o tipo novo de evento quebrava o `tsc`); `tests/rotas.test.ts`, `tests/apoio/servidor.ts`, `prisma/seed.ts` e `src/app/(sistema)/agentes/[id]/testar/page.tsx` estavam previstos e não precisaram de mudança; `src/estilos/global.css` foi corrigido também na T-06.02 (alinhamento do chip, achado da verificação visual); `package.json` e `package-lock.json` não mudaram.
- Em várias tasks o teste e o código foram escritos no mesmo passo em vez de em vermelho primeiro (T-01.03, T-03.05, T-04.03, T-05.04); nas demais a primeira execução foi vermelha.
- A pontuação BM25 de base pequena aparece como "< 0,01" no cartão (limite conhecido, sem correção).

## Premissas e pendências

Novas: PR-50 (índice FTS5 de conteúdo externo), PR-51 (parâmetros da recuperação), PR-52 (modo fundamentado e prompt), PR-53 (fontes da resposta), PR-54 (Testar busca). PR-04, PR-15 e PR-30 passam a realizadas. Sem pendência nova; a PEND-07 (verificação em celular real) ganhou as Fontes, as referências e o cartão. Limites conhecidos em `docs/stack/LACUNAS.md` (10 a 13): `migrate dev` com tabela virtual, `rowid` e `VACUUM`, comportamento do modelo real não testável, interação sem jsdom.
