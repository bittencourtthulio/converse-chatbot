# Tarefa em segundo plano e ambiente

## Contrato de entrada

`src/instrumentation.ts:6-18`: só no runtime Node, import dinâmico da fila de fontes, `retomar()` e `iniciar()`, falha vira `console.error` de uma linha sem derrubar. `obterFila()` guarda o singleton em `globalThis` (`src/servicos/fontes-fila.ts:318-325`). Variáveis lidas só em `src/lib/ambiente.ts` (`src/lib/ambiente.ts:25-43`); helper `inteiroComPadrao` rejeita zero e negativos (`src/lib/ambiente.ts:19-27`).

## Contrato de saída

Testes de serviço controlam a fila (`acordar()` só age depois de `iniciar()`) (`docs/stack/CONVENCOES.md` seção 5, linha "Tarefa em segundo plano"). `tests/instrumentacao.test.ts` cobre `register`.

## Limites e cotas

Concorrência e relógio injetáveis na fila de fontes (`src/servicos/fontes-fila.ts:57`). Lotes de 500 para o SQLite: NÃO DOCUMENTADO limite do driver; premissa a registrar.

## Erros conhecidos e tratamento

`.env.example` documenta cada variável e `tests/projeto.test.ts` confere o exemplo e o README (`tests/projeto.test.ts:30-60`).

## Riscos para a nossa implementação

Dois temporizadores em processo (fila e expurgo) valem por processo (PR-05). O `TZ` do processo afeta o dia local do painel, não o corte do expurgo (que usa instantes UTC). Restauração de backup (FT-11) não deve concorrer com o expurgo.

## Fonte

`src/instrumentation.ts`, `src/servicos/fontes-fila.ts`, `src/lib/ambiente.ts`, `tests/projeto.test.ts` — acessado em 2026-10-01
