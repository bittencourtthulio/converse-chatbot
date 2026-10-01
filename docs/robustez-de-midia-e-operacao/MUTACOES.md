---
expx_schema: 1
expx_tool: sprintx
kind: mutacoes
trabalho_id: robustez-de-midia-e-operacao
origem_buildx: plataforma-chatbot-ia
feature_id: FT-13
atualizado_em: 2026-10-01
---

# Mutações que provam as correções da FT-13

Regra da feature: cada correção tem um teste que **falha** quando ela é removida. A mutação é temporária (aplicada, o teste roda e falha, o código volta ao original) e fica registrada aqui, task a task. A tabela é copiada para o `ENTREGA.md` no fechamento.

| Task | Correção | Mutação aplicada (temporária) | Teste que falhou |
|---|---|---|---|
| T-01.01 | trava contra rede real nos testes | comentada a chamada `instalarTravaDeRede()` de `tests/setup-rede.ts` | 3 casos de `tests/trava-de-rede.test.ts` (fetch, http/https e net.connect para host público) |
| T-01.02 | a regra do limite no embed não depende do código aleatório | `contemOLimite` volta a `html.includes('4321')` | "um código aleatório com 4321 no meio não dispara a regra, o limite solto dispara" em `tests/embed-pagina.test.ts` |
| T-01.03 | OpenRouter falso responde vazio ao índice de `silencios` | o ramo `silencios` do falso desligado (`false && ...`) | "responde vazio à parte listada em silencios e o texto simulado às demais" em `tests/apoio-audio-com-silencio.test.ts` |
| T-01.04 | o cliente chunked para de enviar quando o servidor recusa | removidas a contrapressão (`drain`) e a parada ao receber resposta em `enviarChunked` | "para de enviar quando o servidor recusa (413)..." de `tests/apoio-pdf-chunked.test.ts` (envia os 200 MB e passa do teto) |
| T-02.01 | o segmento `[sem fala]` entra no texto com o marcador de tempo e o trecho só de marcadores é reconhecido | `juntarPartes` filtra o texto `[sem fala]` junto com o vazio | 2 casos de `tests/transcricao-marcadores.test.ts` (junção entre as falas e descarte do trecho só de marcadores) |
| T-02.02 | o trecho vazio vira `[sem fala]` e a fonte segue | o ramo do vazio volta a lançar o erro (`throw erro`) em `transcreverParte` | 3 casos de `tests/transcricao-de-midia.test.ts` ("a parte vazia nas duas chamadas...", "a retomada não chama o transcritor...", "com todas as partes vazias...") |
| T-02.02 | a fonte só falha sem nenhuma fala | a conferência "nenhum segmento com fala" desligada em `transcreverMidia` | "com todas as partes vazias lança Não encontrei fala neste áudio." |
| T-02.03 | o trecho só de marcadores não vai ao índice de busca | removido o `.filter(!trechoSoDeMarcadores)` de `processarVideo` | "uma sequência longa de trechos sem fala não vira trecho de busca..." em `tests/fontes-fila-video.test.ts` |
| T-03.01 | o corpo é lido em stream com contagem de bytes e cancelado ao passar do teto | a conferência `total > teto` desligada em `lerCorpoLimitado` | 3 casos de `tests/corpo-limitado.test.ts` (cancelamento com no máximo 17 pedaços, teto exato e um byte acima, pedaço único grande) |
| T-03.02 | a rota de documentos lê o corpo com `lerCorpoLimitado` (413 para chunked acima do teto) | a rota volta a chamar `request.formData()` direto (versão anterior do arquivo, com novo `npm run build`) | "14 MB em pedaços, com multipart inválido, recebem 413..." de `tests/fontes-rota-chunked.test.ts` (devolve 422) |
