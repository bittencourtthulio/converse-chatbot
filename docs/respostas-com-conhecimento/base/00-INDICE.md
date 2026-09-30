---
expx_schema: 1
expx_tool: sprintx
kind: base_indice
trabalho_id: respostas-com-conhecimento
origem_buildx: plataforma-chatbot-ia
feature_id: FT-05
atualizado_em: 2026-09-30
areas:
  - arquivo: fts5-e-migration.md
    titulo: FTS5 do SQLite, Prisma e migration
    lacunas: 4
  - arquivo: turno-de-chat-e-sse.md
    titulo: Turno de chat, prompt e protocolo SSE
    lacunas: 1
  - arquivo: interface-testar-e-conhecimento.md
    titulo: Interface da aba Testar e da aba Conhecimento, seed
    lacunas: 1
---

# Índice da base — respostas-com-conhecimento

Modo INTERNO (código das FT-03 e FT-04) mais verificação local do FTS5 do `better-sqlite3`. Briefing em `../BRIEFING-BUILDX.md`.

| Arquivo | Área | Resumo |
|---|---|---|
| `fts5-e-migration.md` | Banco e índice | FTS5 disponível (SQLite 3.53.2), conteúdo externo e gatilhos, `rebuild`, riscos de `migrate dev`, `VACUUM` e cascata, regra de migrations aditivas. |
| `turno-de-chat-e-sse.md` | Serviços e protocolo | `responderMensagem`, ponto de extensão `materialDeConsulta`, eventos SSE e leitor compatível, `Mensagem.fontes`, riscos de injeção e de continuação. |
| `interface-testar-e-conhecimento.md` | Interface e seed | `ChatDeTeste`, reducer, renderizador seguro, aba Conhecimento, seed por `createMany`. |
