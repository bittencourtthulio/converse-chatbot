# Handler de upload, apoio de teste e CI (modo INTERNO)

## 1. Contrato de entrada

- Handler de fontes: sessão por `exigirSessao()`, `export const dynamic = 'force-dynamic'`, teto por `Content-Length` com `passaDoTeto` (413) e `erroDeTipo` (415) (`src/app/api/agentes/[id]/fontes/resposta.ts:34-52`). O corpo da requisição em route handler do Next é `request.body` (`ReadableStream`); a leitura em stream em `next start` com corpo grande: comportamento NÃO DOCUMENTADO nos arquivos do projeto; será provado contra o servidor de produção em teste.
- `subirServidor(porta, env, {capturarLogs})` e `cookieDe`, `esperar` (`tests/apoio/servidor.ts`) para provar rotas contra `next start` (exige `npm run build`).
- Servidor OpenRouter simulado: rotas `/models`, `/key`, `/chat/completions` (stream e não stream) com `opcoes.resposta`, `erroHttp`, `latenciaMs`; registra `requisicoes` com corpo JSON (`tests/apoio/openrouter-falso.ts:95-232`). Não reconhece `input_audio`: aceita qualquer `messages`; basta estender para devolver a transcrição por parte.
- Apoio de fontes: `criarAgenteDeTeste`, `criarFonteDeTeste`, `armazenamentoDeTeste()` (`tests/apoio/fontes.ts`); `STORAGE_DIR` temporário por arquivo de teste (`tests/setup.ts:23-24`).
- `vitest.config.ts`: `testTimeout` 30 s, `hookTimeout` 180 s, `fileParallelism: false`.
- CI: Node 22, passos lint, tipos, build, testes, auditoria (`.github/workflows/ci.yml`); sem instalação de ffmpeg.

## 2. Contrato de saída

- Resposta de upload hoje: 202 com `{resultados}` por arquivo (PR-49). O novo handler de vídeo devolve a fonte criada e o status 202, e erros `{codigo, mensagem}` (415, 413, 422).

## 3. Limites e cotas

- 500 MB por vídeo (PR-10, `MAX_VIDEO_MB`); `Content-Length` acima do limite recusado cedo; sem `Content-Length` conta bytes em stream e aborta.
- Teste de 500 MB real é inviável: provar o corte com limite baixo por variável de ambiente no servidor de teste.

## 4. Erros conhecidos e tratamento

- Escrita parcial: limpeza do temporário em qualquer falha (briefing); `armazenamento.gravar` já usa `.parcial` e `rename` (`src/lib/armazenamento.ts:42-47`).
- Cliente que aborta o envio: o stream de leitura falha; o temporário precisa ser apagado.

## 5. Riscos para a nossa implementação

- Testes de rota com upload em stream via `fetch` com `duplex: 'half'` (Node 22): suporte a corpo em stream NÃO DOCUMENTADO neste projeto; alternativa é enviar `Buffer` e provar o handler pela chamada direta da função de serviço com um `ReadableStream`.
- Rodar o ffmpeg dentro de testes: `describe.skipIf(!ffmpegDisponivel)` localmente; no CI `EXIGIR_FFMPEG=1` faz a ausência falhar (briefing).
- Rota `next start` não herda `FFMPEG_PATH` se não passado em `env`; `subirServidor` já aceita `env`.
- Duas suítes ao mesmo tempo corrompem o banco de teste (`prisma/test.db`): nunca rodar dois `vitest`.

## 6. Fonte

`src/app/api/agentes/[id]/fontes/resposta.ts`, `tests/apoio/servidor.ts`, `tests/apoio/openrouter-falso.ts`, `tests/apoio/fontes.ts`, `tests/setup.ts`, `vitest.config.ts`, `.github/workflows/ci.yml`, `docs/stack/CONVENCOES.md` seção 3, lidos em 2026-09-30.
