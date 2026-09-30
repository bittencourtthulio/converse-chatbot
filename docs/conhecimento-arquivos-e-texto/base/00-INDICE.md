---
expx_schema: 1
expx_tool: sprintx
kind: base_indice
trabalho_id: conhecimento-arquivos-e-texto
origem_buildx: plataforma-chatbot-ia
feature_id: FT-04
atualizado_em: 2026-09-30
areas:
  - arquivo: extracao-bibliotecas.md
    titulo: Bibliotecas de extracao de PDF, DOCX, HTML e ZIP
    lacunas: 3
  - arquivo: banco-armazenamento-e-ambiente.md
    titulo: Banco, armazenamento em disco e ambiente
    lacunas: 1
  - arquivo: servicos-handlers-e-fila.md
    titulo: Servicos, handlers, upload e tarefa em segundo plano
    lacunas: 2
  - arquivo: interface-do-agente-e-conhecimento.md
    titulo: Interface do agente, abas, componentes, estilos e testes
    lacunas: 2
---

# Índice da base — conhecimento-arquivos-e-texto

Modo EXTERNO parcial (bibliotecas npm de extração) mais INTERNO (código existente das FT-01 a FT-03). Briefing em `../BRIEFING-BUILDX.md`.

| Arquivo | Área | Resumo |
|---|---|---|
| `extracao-bibliotecas.md` | Extração | `unpdf`, `mammoth`, `parse5`, `jszip`: versões, licenças, API, ausência de limites, riscos de zip bomb e de bundler. |
| `banco-armazenamento-e-ambiente.md` | Banco e disco | Modelos atuais, migrations aditivas, `limparBanco`, `STORAGE_DIR` e `MAX_UPLOAD_MB` inexistentes, `.gitignore` de `storage/`. |
| `servicos-handlers-e-fila.md` | Serviços e HTTP | Padrão de serviço e handler, `formData()`, `instrumentation.ts`, riscos de singleton e de corpo grande. |
| `interface-do-agente-e-conhecimento.md` | Interface | Abas, componentes, classes e tokens, teste sem jsdom, riscos de polling e de arrastar-e-soltar. |
