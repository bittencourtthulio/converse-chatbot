# Auditoria que não sobe calada: saúde e tela Sistema

## Contrato de entrada

`register()` em `src/instrumentation.ts` importa `ligarAuditoria` e a chama dentro de `try/catch`; a falha vira só `log.erro('auditoria_nao_ligou', ...)` (`src/instrumentation.ts:24-29`). `ligarAuditoria()` é idempotente e guarda o estado em `globalThis[Symbol.for('converse.auditoriaLigada')]` (`src/servicos/auditoria-ouvintes.ts:67-82`). A validação de ambiente em produção derruba o start com `ErroDeConfiguracao` (`instrumentation.ts:16-23`; `src/lib/ambiente.ts`).

## Contrato de saída

`verificarSaude` devolve `{status, itens}` com os itens `banco`, `disco`, `busca` e `midia`; `degradado` é uma capacidade a menos (`src/servicos/saude.ts:14-27,111-133`); `GET /api/saude` devolve só o status, 200 para `ok` e `degradado`, 503 para `falha` (`src/app/api/saude/route.ts:9-17`). `obterSistema` monta `DadosDoSistema` (`src/servicos/sistema.ts:19-38,120-150`), exibido por `PainelDoSistema` com rótulos de `src/componentes/sistema-logica.ts:58-63`.

## Limites e cotas

A sonda de mídia roda no máximo uma vez por minuto (`saude.ts:42`). `NODE_ENV` define "produção" (`instrumentation.ts:13`).

## Erros conhecidos e tratamento

R-03 de `premissas-01-34.md`: se o `import` falhar, o servidor sobe sem trilha e só há uma linha de log. Testes: `tests/instrumentacao.test.ts` (register com fila e agendador), `tests/auditoria-ouvintes.test.ts`, `tests/saude.test.ts`, `tests/saude-rota.test.ts`, `tests/sistema.test.ts`, `tests/sistema-pagina.test.tsx`, `tests/painel-do-sistema.test.tsx`, `tests/sistema-logica.test.ts`.

## Riscos para a nossa implementação

(1) O estado "ligada" precisa de uma função exportada (`auditoriaLigada()`), e a saúde precisa conhecê-lo sem importar a instrumentação; em testes de rota (servidor de produção) a instrumentação roda. (2) Falha em produção derruba o start com mensagem clara e sem dado sensível (só o nome do erro); fora de produção fica `degradado`. (3) `verificarSaude` hoje não consulta a auditoria e `sistema.ts` não tem o campo: o tipo `NomeDoItemDeSaude` e `ROTULOS_DOS_ITENS` crescem (`saude.ts:15`, `sistema-logica.ts:50-55`). (4) Testes existentes que montam saúde e sistema não ligam a auditoria: o novo item só pode degradar quando a instrumentação rodou e falhou, ou os testes ajustam o estado. (5) README e `validarAmbiente` precisam citar a regra.

## Fonte

`src/instrumentation.ts`, `src/servicos/auditoria-ouvintes.ts`, `src/servicos/saude.ts`, `src/servicos/sistema.ts`, `src/app/api/saude/route.ts`, `src/componentes/sistema-logica.ts`, `src/componentes/PainelDoSistema.tsx`, `docs/projeto/validacao/premissas-01-34.md` (R-03) — acessado em 2026-10-01
