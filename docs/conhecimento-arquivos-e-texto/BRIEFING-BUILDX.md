---
expx_schema: 1
expx_tool: sprintx
kind: briefing
trabalho_id: conhecimento-arquivos-e-texto
origem_buildx: plataforma-chatbot-ia
feature_id: FT-04
criado_em: 2026-09-30
atualizado_em: 2026-09-30
---

# Briefing do buildx — FT-04 Base de conhecimento: arquivos e textos

## Problema

O usuário sobe arquivos (PDF, Word, texto, planilha CSV, HTML, JSON, legendas) e cola textos na base de um agente e acompanha cada fonte de "processando" até "pronto" ou o motivo do erro.

## Escopo

1. Modelo: `Fonte` (id opaco; `agenteId` em cascata; `tipo` `arquivo|texto|video|youtube`, só `arquivo` e `texto` criados agora, os outros reservados para a FT-08; `titulo`; `nomeOriginal` opcional; `tipoMime` opcional; `tamanhoBytes`; `caminhoArquivo` relativo a `STORAGE_DIR` ou nulo; `status` `pendente|processando|pronto|erro`; `mensagemErro`; `totalTrechos`; `caracteres`; `criadoPorId` SET NULL; `criadoEm`, `atualizadoEm`, `processadoEm`) e `Trecho` (id; `fonteId` em cascata; `agenteId` desnormalizado para a recuperação da FT-05; `indice`; `texto`; `caracteres`). Índices por `agenteId` e por `fonteId, indice`. Migration só acrescenta; `limparBanco` atualizado.
2. Armazenamento (PR-11): `STORAGE_DIR` (padrão `./storage`, lido em `src/lib/ambiente.ts`, documentado no `.env.example`). Arquivo em `<STORAGE_DIR>/fontes/<agenteId>/<fonteId>/original`; o nome enviado nunca entra em caminho, só no banco (sanitizado para exibição). Excluir a fonte apaga arquivo e diretório; excluir o agente apaga o diretório do agente. Módulo `src/lib/armazenamento.ts` (gravar, ler, apagar, proteção contra travessia de diretório).
3. Validação do upload (PR-13, PR-10): extensões `.pdf .docx .txt .md .csv .html .htm .json .srt .vtt`; tamanho máximo `MAX_UPLOAD_MB` (padrão 25); recusa vazio; confere o conteúdo real (assinatura `%PDF-`; ZIP com `word/document.xml` para DOCX; texto decodifica como UTF-8, com BOM e fallback Latin-1, sem bytes nulos); limite de texto extraído por fonte (5 milhões de caracteres); limite de páginas do PDF (500) e de tamanho descompactado do DOCX (zip bomb). Erros por arquivo em pt-BR, sem vazar caminho interno. Texto colado: título 1–120 e conteúdo 1–200.000 caracteres.
4. Extração em `src/lib/extracao/` (sem `next/*`): PDF (`unpdf` ou similar; sem camada de texto: "Este PDF não tem texto selecionável (parece escaneado). OCR não é suportado."), DOCX (`mammoth`, texto bruto), TXT/MD, CSV (cabeçalho + linhas como `coluna: valor; …`; delimitador `,` ou `;`), HTML (remove `script/style/nav/noscript`, preserva parágrafos e títulos; parser confiável), JSON (achatado em `caminho: valor`), SRT/VTT (sem numeração e marcas de tempo). Dependências mínimas, versão fixa, `npm audit --audit-level=high` em 0. Fixtures pequenas em `tests/fixtures/`.
5. Divisão em trechos `src/servicos/trechos.ts` (pura, determinística): ~1000 caracteres, sobreposição ~150, fronteiras de parágrafo, frase, palavra; nunca vazio; testes de propriedade.
6. Fila em segundo plano no mesmo processo `src/servicos/fontes-fila.ts` (PR-05): estado no banco; concorrência 2; `processarPendentes()` aguardável; ao subir (`src/instrumentation.ts`, só runtime Node) `processando` volta a `pendente` e retoma; falha grava `erro` com `mensagemErro` amigável e não derruba a fila; reprocessar refaz a extração e substitui os trechos em transação; relógio e diretório injetáveis.
7. Serviço `src/servicos/fontes.ts`: `adicionarArquivos`, `adicionarTexto`, `listar`, `obter`, `excluir`, `reprocessar`, `resumo`. Qualquer usuário autenticado gerencia (PR-12).
8. Handlers finos em `src/app/api/agentes/[id]/fontes/`: POST multipart (vários arquivos, resposta por arquivo, 202), POST `/texto`, GET lista, DELETE `/[fonteId]`, POST `/[fonteId]/reprocessar`. Sessão obrigatória; 401/404/413/415/422; corpo grande recusado por `Content-Length`.
9. UI: aba "Conhecimento" (`abas-do-agente.ts`, subrota `conhecimento/`): cartões de resumo, seção "Adicionar" como lista extensível de opções (Arquivos com zona de soltar e progresso por arquivo; Texto com contador), lista de fontes (ícone, título, tamanho, data, badge de status com spinner, motivo do erro, Reprocessar, Excluir com confirmação na tela), "Ver conteúdo" em `conhecimento/[fonteId]` com trechos paginados; polling de 2 s enquanto houver fonte pendente/processando; estados vazio, carregando, erro; acessível, 375px, tokens, dois temas. Seed do agente de exemplo ganha fonte de texto fictícia já processada (mesmo serviço, sem rodar a fila).
10. Convenções: lacunas 5 e 8 e a de armazenamento em `docs/stack/`.
11. Verificação visual nos dois temas com upload real de arquivo pequeno, se houver ferramenta de navegador.

## Não-objetivos

Busca, FTS5 e recuperação (FT-05); respostas com fontes (FT-05); chat embutido (FT-06); Telegram (FT-07); vídeo, áudio, YouTube e transcrição (FT-08, só os valores reservados de `tipo`); histórico (FT-09); retenção, exclusão de usuário e auditoria (FT-10); backup do `storage/` e saúde (FT-11); OCR e XLSX.

## Critérios de aceite de negócio cobertos

- Subo um arquivo (PDF, Word, texto) e um texto colado e vejo cada um passar de "processando" para "pronto" (o vídeo é da FT-08).

## Premissas aplicáveis

PR-05, PR-10, PR-11, PR-13 (realiza); PR-12, PR-21, PR-23, PR-26, PR-28, PR-30, PR-40 (`docs/projeto/PREMISSAS.md`).

## Convenções

`docs/stack/CONVENCOES.md`.
