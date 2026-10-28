---
expx_schema: 1
expx_tool: runx
kind: qa
trabalho_id: OC-2026-0001
veredito: aprovado
executado_em: 2026-10-28
achados:
  - severidade: baixa
    arquivo: tests/criar-admin.test.ts
    problema: ADMIN_SENHA nao e passada nas linhas 69 e 76, entao o dotenv do script poderia preenche-la a partir do ambiente do desenvolvedor
    correcao_sugerida: Passar ADMIN_SENHA como undefined, que agora chega vazia ao script
  - severidade: baixa
    arquivo: tests/restauracao-comando.test.ts
    problema: Outras variaveis (ENCRYPTION_KEY, JWT_SECRET, BACKUP_MANTER, LOG_LEVEL, APP_URL) nao sao passadas e podem vir do ambiente do desenvolvedor; nenhuma toca o banco dele
    correcao_sugerida: Nova ocorrencia para um conjunto minimo fixo de variaveis no helper
  - severidade: baixa
    arquivo: tests/apoio/comando.ts
    problema: Linha longa no JSDoc do cabecalho mistura duas ideias
    correcao_sugerida: Quebrar a frase em duas linhas
---

# QA — OC-2026-0001 teste-sobrescreve-banco-dev-chat-500

Data: 2026-10-28. Revisão feita por agente separado, somente leitura, que recebeu o diff e não a conclusão do E3; o diff contra o escopo foi conferido por quem escreve este relatório.

## Achados

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| BAIXA | `tests/criar-admin.test.ts` | `ADMIN_SENHA` não é passada (linhas 69 e 76); o `dotenv` do script poderia preenchê-la | Passar `ADMIN_SENHA: undefined` |
| BAIXA | `tests/restauracao-comando.test.ts` | Variáveis como `ENCRYPTION_KEY` e `JWT_SECRET` não são passadas; nenhuma toca o banco do desenvolvedor | Nova ocorrência: conjunto mínimo fixo de variáveis no helper |
| BAIXA | `tests/apoio/comando.ts` | Linha longa no JSDoc | Quebrar a frase |

## Verificação dos 8 itens

1. **Regressão falhava antes e passa agora.** Sim: o teste novo saiu com código 0 (leu a isca) antes do fix, e passa depois. O agente confirmou também pelo código (`node_modules/dotenv/lib/main.js:383`) que a string vazia impede o preenchimento.
2. **Dois testes por task.** Conferidos contra `tasks.md`; descrição e teste coincidem.
3. **Teste que não discrimina.** Nenhum encontrado nos três arquivos tocados.
4. **Suíte inteira.** Rodada pelo E3 depois das três tasks: 271 arquivos e 3121 testes passaram, 9 ignorados, 845,9 s. O QA reexecutou `backup-comando` (6/6) e `ambiente-start` (3/3). `tsc --noEmit` e `npm run lint` sem erro.
5. **Critério de aceite.** Atendido, incluindo `shasum prisma/dev.db` igual (`cdfe5899…`) antes e depois da suíte.
6. **Critérios de saída de fase e sprint.** Atendidos.
7. **Escopo.** Diff da ocorrência = `tests/apoio/comando.ts`, `tests/backup-comando.test.ts`, `tests/ambiente-start.test.ts`, os três autorizados. Os outros arquivos modificados (`src/instrumentation.ts`, `src/estilos/global.css`, `docs/stack/*`, quatro testes) já estavam sujos antes da ocorrência. `tests/restauracao-comando.test.ts` está na lista de impactados e não foi alterado: observação, o helper já o protege.
8. **Base × código.** `''` é tratado como ausente em todos os caminhos de `src/lib/ambiente.ts`; a base descreve o código como ele está.

## Saída da suíte

```
 Test Files  271 passed (271)
      Tests  3121 passed | 9 skipped (3130)
   Duration  845.87s
```

VEREDITO: APROVADO — a ocorrência está pronta para fechamento.
