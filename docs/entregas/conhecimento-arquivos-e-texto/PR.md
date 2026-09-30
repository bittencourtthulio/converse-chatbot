---
expx_schema: 1
expx_tool: sprintx
kind: pr
trabalho_id: conhecimento-arquivos-e-texto
origem_buildx: plataforma-chatbot-ia
feature_id: FT-04
branch: feat/conhecimento-arquivos-e-texto
branch_base: feat/conversa-de-teste
atualizado_em: 2026-09-30
---

# FT-04 — Base de conhecimento: arquivos e textos (projeto plataforma-chatbot-ia)

O usuário sobe arquivos (PDF, Word, texto, Markdown, CSV, HTML, JSON, legendas) e cola textos na base de um agente, e acompanha cada fonte de "processando" até "pronto" ou o motivo do erro. Nesta entrega a fonte é extraída, dividida em trechos e guardada; buscar nela e responder com ela é a FT-05.
Entram as tabelas `fontes` e `trechos`, o armazenamento em disco (`STORAGE_DIR`), a validação do upload, a extração por formato, a fila em segundo plano no mesmo processo, cinco rotas e a aba "Conhecimento".

Este PR está empilhado sobre `feat/conversa-de-teste` (FT-03).

## Arquivos alterados

```
./
  M .env.example
  M README.md
  M package-lock.json
  M package.json
docs/conhecimento-arquivos-e-texto/
  A 00-AUDITORIA.md
  A 00-BLOQUEIOS.md
  A 00-DECISOES.md
  A BRIEFING-BUILDX.md
  A FECHAMENTO.md
  A ORQUESTRADOR.md
  A RELATORIO-FEATURE.md
  A VERIFICACAO-VISUAL.md
docs/conhecimento-arquivos-e-texto/base/
  A 00-INDICE.md
  A 00-LACUNAS.md
  A banco-armazenamento-e-ambiente.md
  A extracao-bibliotecas.md
  A interface-do-agente-e-conhecimento.md
  A servicos-handlers-e-fila.md
docs/conhecimento-arquivos-e-texto/sprint-01/
  A fases.md
  A sprint.md
  A tasks.md
docs/conhecimento-arquivos-e-texto/sprint-02/
  A fases.md
  A sprint.md
  A tasks.md
docs/conhecimento-arquivos-e-texto/sprint-03/
  A fases.md
  A sprint.md
  A tasks.md
docs/conhecimento-arquivos-e-texto/sprint-04/
  A fases.md
  A sprint.md
  A tasks.md
docs/conhecimento-arquivos-e-texto/sprint-05/
  A fases.md
  A sprint.md
  A tasks.md
docs/conhecimento-arquivos-e-texto/sprint-06/
  A fases.md
  A sprint.md
  A tasks.md
docs/conhecimento-arquivos-e-texto/sprint-07/
  A fases.md
  A sprint.md
  A tasks.md
docs/entregas/conhecimento-arquivos-e-texto/
  A ATENCAO.md
  A ENTREGA.md
  A PR.md
  A QA-PACOTE.md
docs/projeto/
  M MAPA.md
  M PREMISSAS.md
  M PROJETO.md
  M RECURSAO.md
docs/stack/
  M CONVENCOES.md
  M LACUNAS.md
prisma/
  M schema.prisma
  M seed.ts
prisma/migrations/20260930180000_fontes/
  A migration.sql
src/
  A instrumentation.ts
src/app/(sistema)/agentes/[id]/conhecimento/
  A loading.tsx
  A page.tsx
src/app/(sistema)/agentes/[id]/conhecimento/[fonteId]/
  A loading.tsx
  A page.tsx
src/app/api/agentes/[id]/fontes/
  A resposta.ts
  A route.ts
src/app/api/agentes/[id]/fontes/[fonteId]/
  A route.ts
src/app/api/agentes/[id]/fontes/[fonteId]/reprocessar/
  A route.ts
src/app/api/agentes/[id]/fontes/texto/
  A route.ts
src/componentes/
  A AdicionarFontes.tsx
  A BotaoExcluirFonte.tsx
  A CartoesDeResumo.tsx
  A FormularioDeTexto.tsx
  M Icones.tsx
  A LinhaDeFonte.tsx
  A ListaDeTrechos.tsx
  A PainelDeConhecimento.tsx
  A ZonaDeArquivos.tsx
  M abas-do-agente.ts
  A conhecimento-logica.ts
  A enviar-arquivo.ts
  A estado-dos-envios.ts
  A fonte-da-tela.ts
  M itens-de-menu.ts
  A opcoes-de-fonte.ts
src/estilos/
  M global.css
src/lib/
  M ambiente.ts
  A armazenamento.ts
src/lib/extracao/
  A conteudo.ts
  A csv.ts
  A docx.ts
  A formatos.ts
  A html.ts
  A index.ts
  A json.ts
  A legenda.ts
  A limites.ts
  A pdf.ts
  A texto.ts
  A zip.ts
src/servicos/
  M agentes.ts
  A fontes-fila.ts
  A fontes.ts
  A trechos.ts
tests/
  M abas-do-agente.test.tsx
  A adicionar-fontes.test.tsx
  M agentes.test.ts
  M ajuda.ts
  M ambiente.test.ts
  A armazenamento.test.ts
  M chat-de-teste.test.tsx
  A conhecimento-estilos.test.ts
  A conhecimento-logica.test.ts
  A conhecimento-paginas.test.tsx
  A dependencias-extracao.test.ts
  A estado-dos-envios.test.ts
  A extracao-conteudo.test.ts
  A extracao-docx.test.ts
  A extracao-formatos.test.ts
  A extracao-html.test.ts
  A extracao-pdf.test.ts
  A extracao-planilha-json.test.ts
  A extracao-texto.test.ts
  A extracao-zip.test.ts
  A extracao.test.ts
  A fixtures-fontes.test.ts
  A fontes-arquivos.test.ts
  A fontes-ciclo.test.ts
  A fontes-fila-execucao.test.ts
  A fontes-fila.test.ts
  A fontes-modelo.test.ts
  A fontes-rota-ciclo.test.ts
  A fontes-rota-formatos.test.ts
  A fontes-rota-upload.test.ts
  A fontes-rota.test.ts
  A fontes.test.ts
  A instrumentacao.test.ts
  A painel-de-conhecimento.test.tsx
  M projeto.test.ts
  M rotas.test.ts
  M seed.test.ts
  M setup.ts
  A trechos.test.ts
tests/apoio/
  A fixtures-fontes.ts
  A fontes.ts
  A gerar-fixtures.ts
  A servidor.ts
tests/fixtures/
  A escaneado.pdf
  A exemplo.csv
  A exemplo.docx
  A exemplo.html
  A exemplo.json
  A exemplo.md
  A exemplo.pdf
  A exemplo.srt
  A exemplo.txt
  A exemplo.vtt
```

Total: 150 arquivos.

## Origem

Feature FT-04 (`conhecimento-arquivos-e-texto`) do mapa do projeto `plataforma-chatbot-ia`, que realiza as premissas PR-05, PR-10, PR-11 e PR-13. Planejamento e decisões em `docs/conhecimento-arquivos-e-texto/` (decisões `D-00` a `D-22`, premissas novas PR-45 a PR-49).

## Análise de impacto

Acrescenta duas tabelas (migration só de `CREATE TABLE` e `CREATE INDEX`), duas variáveis de ambiente opcionais (`STORAGE_DIR`, `MAX_UPLOAD_MB`), três dependências de execução com versão fixa (`unpdf`, `mammoth`, `parse5`), o primeiro `src/instrumentation.ts` (liga a fila na subida, só no runtime Node), cinco rotas que exigem sessão e a aba "Conhecimento". Excluir um agente passa a apagar também o diretório dele em `storage/`. O `next` subiu de 16.3.3 para 16.3.8, porque a auditoria de dependências acusou uma vulnerabilidade crítica na versão anterior. O processamento em segundo plano presume um processo só (PR-05).

Detalhe: [00-DECISOES.md](../../conhecimento-arquivos-e-texto/00-DECISOES.md)

## O que foi testado

- Fixtures geradas por código e conferidas: `tests/fixtures-fontes.test.ts`.
- Dados e disco: `tests/fontes-modelo.test.ts`, `tests/armazenamento.test.ts`, `tests/agentes.test.ts` (diretório do agente).
- Divisão em trechos: `tests/trechos.test.ts` (propriedades com 60 sementes).
- Validação e extração dos nove formatos: `tests/extracao*.test.ts` (inclui zip bomb, PDF escaneado, PDF e DOCX reais com `unpdf` e `mammoth`).
- Serviço e fila: `tests/fontes*.test.ts`, `tests/fontes-fila*.test.ts`, `tests/instrumentacao.test.ts`.
- Rotas contra o servidor de produção com upload multipart real: `tests/fontes-rota.test.ts`, `tests/fontes-rota-upload.test.ts`, `tests/fontes-rota-ciclo.test.ts`, `tests/fontes-rota-formatos.test.ts` (nove formatos e retomada na subida).
- Interface: módulos puros e render por componente (`tests/conhecimento-*.test.ts(x)`, `tests/painel-de-conhecimento.test.tsx`, `tests/adicionar-fontes.test.tsx`, `tests/estado-dos-envios.test.ts`).
Suíte: 891 testes, 0 falhas — `npm test` (o teste de rotas exige `npm run build` antes). `npx tsc --noEmit`, `npm run lint`, `npm run build` e `npm audit --audit-level=high` (0) verdes.

## Como reverter

O PR só acrescenta tabelas e colunas de código; reverter o código é desfazer os commits. Efeitos que o versionador NÃO desfaz: a migration aplicada (as tabelas `fontes` e `trechos` continuam no banco até um backup ser restaurado, pois o projeto não tem reversão de migration) e os arquivos enviados em `storage/` (ignorado pelo versionador).

## Roteiro de teste manual

[QA-PACOTE.md](QA-PACOTE.md) — 10 casos.
Colaterais a observar: aba Configurações e exclusão de agente, aba Testar (agora a terceira aba), lista de agentes, isolamento das fontes entre agentes.

## Onde eu quero seu olho

Detalhe e critério de cada arquivo em [ATENCAO.md](ATENCAO.md) (20 arquivos em olho obrigatório, 35 em leitura rápida, 95 dispensáveis).

- `src/lib/armazenamento.ts`, `src/lib/extracao/zip.ts`, `src/lib/extracao/conteudo.ts` e `src/lib/extracao/formatos.ts`: a defesa contra caminho forjado, zip bomb e arquivo que mente sobre o tipo (PR-13).
- `src/servicos/fontes-fila.ts` e `src/instrumentation.ts`: reivindicação atômica, transação que substitui trechos, retomada na subida sem bloquear o servidor.
- `src/app/api/agentes/[id]/fontes/route.ts` e as rotas vizinhas: sessão, teto por `Content-Length` (413), 415, 422 e o que chega ao navegador em caso de erro.
- `src/servicos/fontes.ts` e `src/servicos/agentes.ts`: autorização, ordem arquivo antes da linha e exclusão definitiva que apaga o arquivo.
- `package.json`: três dependências novas e a subida do `next`.

## Fora de escopo

Busca nos trechos e respostas com fontes (FT-05), vídeo e YouTube (FT-08; o valor de `tipo` já está reservado), histórico (FT-09), retenção e auditoria (FT-10), backup de `storage/` (FT-11), OCR e XLSX.
