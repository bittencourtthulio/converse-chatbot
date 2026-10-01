---
expx_schema: 1
expx_tool: buildx
kind: relatorio_feature
projeto_id: plataforma-chatbot-ia
feature_id: FT-08
trabalho_id: conhecimento-em-video
status: entregue
sprints: 7
tasks: 31
testes_suite: 2010
data: 2026-10-01
---

# Relatório da FT-08 — Base de conhecimento: vídeo

Branch `feat/conhecimento-em-video`, a partir de `feat/canal-telegram` (PRs empilhados). A FT-08 depende funcionalmente só da FT-04 (e da FT-02 para a chave do OpenRouter); a branch empilha na ponta da pilha para não gerar conflito nos arquivos compartilhados (`abas-do-agente`, `ambiente.ts`, `.env.example`, `fontes-fila.ts`, `AdicionarFontes.tsx`, CI). PR local: descrição em `docs/entregas/conhecimento-em-video/PR.md`, pacote de QA em `docs/entregas/conhecimento-em-video/QA-PACOTE.md`.

## O que foi entregue

- Migration `20261001000000_conhecimento_em_video` (só acrescenta): `progresso`, `etapa`, `duracaoSegundos` e `urlOrigem` em `Fonte`; `modeloDeTranscricao` em `ConfiguracaoDoWorkspace`.
- Upload em stream: `POST /api/agentes/[id]/fontes/video?nome=` grava o corpo bruto em `original.parcial` e renomeia; `MAX_VIDEO_MB` por `Content-Length` (413) e por contagem de bytes; conferência da assinatura real dos primeiros bytes (415, 422); limpeza em qualquer falha. Barra de progresso real do envio no navegador.
- `src/lib/midia.ts`: `sondar`, `extrairAudio` (MP3 mono 16 kHz 32 kbps), `dividirEmSegmentos` (10 minutos), `verificarMidia`; `spawn` sem shell, prazo por processo, erro claro com ffmpeg ausente.
- `transcreverAudio` em `src/lib/openrouter.ts` (`input_audio`, sem stream) e o modelo configurável (banco, `OPENROUTER_MODELO_TRANSCRICAO`, constante).
- Fila de duas raias (vídeo com concorrência 1), `etapa` e `progresso` no banco, texto de cada parte em `segmentos/NN.txt`, retomada, marcadores `[MM:SS]`, limpeza ao concluir; falha de parte vira erro com a parte indicada e Reprocessar retoma.
- YouTube por legendas (`src/lib/youtube.ts`, `POST .../fontes/youtube`): manual em português, inglês, primeira, automática; SSRF por host; um redirect; prazo e teto de tamanho.
- Interface: opção Vídeo com duas abas, aviso de créditos, lista com ícone, barra, etapa, duração e link de origem, Ver conteúdo com marcadores em destaque, Modelo de transcrição em Integrações.
- Simulados `tests/apoio/openrouter-falso.ts` (áudio) e `tests/apoio/youtube-falso.ts`, apoio de ffmpeg com `EXIGIR_FFMPEG` e o ffmpeg instalado no CI.

## Como demonstrar

`npm run setup`, `npm run build`, `npm run start` com `OPENROUTER_BASE_URL` e `YOUTUBE_BASE` apontando para os simulados (`npx tsx tests/apoio/servir-falso.ts`, `npx tsx tests/apoio/servir-youtube-falso.ts`), entrar com as contas de demonstração e seguir `docs/entregas/conhecimento-em-video/QA-PACOTE.md`. Precisa do ffmpeg instalado.

## Verificação

2010 testes na suíte inteira (280 novos); `npx tsc --noEmit`, lint, build e `npm audit --audit-level=high` (0) verdes. Verificação no navegador em `docs/conhecimento-em-video/VERIFICACAO-VISUAL.md`: envio com barra, etapas, Pronto, YouTube, busca, 375 px e tema claro vistos; transcrição real, YouTube real e celular real não.

## Desvios do plano

Todos em `docs/entregas/conhecimento-em-video/ENTREGA.md`. Os principais: `src/lib/youtube-url.ts` (parte pura do YouTube para a tela validar o link) e `apagarAudio` em `armazenamento.ts` não previstos; a opção Vídeo em `opcoes-de-fonte.ts` passou da T-06.01 para a T-06.02; seis testes existentes ajustados (`conhecimento-paginas`, `painel-de-conhecimento`, `adicionar-fontes`, `conhecimento-logica`, `conhecimento-estilos`, `fontes-fila`); a verificação achou a regra `.fonte-item` da FT-05 desfazendo o layout da lista de fontes desde a FT-05, corrigida; as citações `arquivo:linha` de `CONVENCOES.md` que mudaram foram refeitas.

## Premissas e pendências

Novas: PR-71 (upload em stream), PR-72 (pipeline de áudio e partes de 10 minutos), PR-73 (transcrição e modelo configurável), PR-74 (fila de vídeo e retomada por parte), PR-75 (YouTube por legendas e fragilidade), PR-76 (contrato HTTP e tela), PR-77 (ambiente e simulados). PR-09 realizada. Sem pendência nova: a PEND-06 passou a exigir chave com saldo e ffmpeg; a PEND-07 ganhou a aba Vídeo e o Modelo de transcrição.
