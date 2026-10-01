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
