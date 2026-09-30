---
expx-schema: v1
skill: stackx
documento: lacunas
gerado-em: 2026-09-30
---

# Lacunas de convenção

| # | Lacuna | Impacto | Como resolver |
| - | ------ | ------- | ------------- |
| 1 | sem formatador (Prettier ou similar) | o estilo de formatação depende de cada autor e o ESLint não o impõe; diffs podem misturar mudança de estilo com mudança de comportamento | decidir numa feature futura; não bloqueia |
| 2 | sem cobertura de teste | nenhum número diz quanto código os 184 testes exercitam | opcional, não bloqueia |
| 3 | sem reversão de migração | erro de migração se corrige avançando, nunca voltando | mitigado pelo backup (PR-20, FT-11) |
| 4 | sem `engines` no `package.json` | `npm install` em Node antigo não avisa; o CI e o README dizem 22, mas nada trava | acrescentar `engines` quando uma feature tocar o `package.json`; baixo |
| 5 | armazenamento em teste ainda sem código | a regra de `STORAGE_DIR` por teste não tem exemplo para copiar | FT-04 (arquivos). A parte de HTTP de saída e serviço externo foi resolvida na FT-02 (`tests/apoio/openrouter-falso.ts:90`) |
| 6 | sem log estruturado nem correlação própria | erro inesperado só vai para `console.error` e o operador não liga a tela ao log | FT-11 (PR-21) |
| 7 | ~~sem handler HTTP em `src/app/api`~~ | resolvida na FT-03: `src/app/api/agentes/[id]/conversar/route.ts:30` é o exemplo de handler fino, com stream SSE | — |
| 8 | sem tarefa em segundo plano | `src/instrumentation.ts` e o padrão `-fila.ts` não têm exemplo | FT-04 |
| 9 | ~~regra "migração só acrescenta" sem verificação automática~~ | resolvida na FT-02: `tests/migracoes.test.ts:14` falha em `DROP TABLE` ou `DROP COLUMN` sem a marca `-- destrutiva-autorizada` | — |

Resolvidas na FT-03: lacuna 7 (handler HTTP, `src/app/api/agentes/[id]/conversar/route.ts:30`, testado em `tests/conversar-rota.test.ts`). Nova, baixa: sem ambiente de teste com DOM (jsdom), o comportamento interativo de componente cliente só é provado nos módulos puros e na verificação visual.

Resolvidas na FT-02: lacuna 9 (teste do SQL das migrations) e a parte de HTTP de saída da 5.

Resolvidas na FT-01: a direção das camadas sem regra de lint (agora `eslint.config.mjs:8-60` e `tests/camadas.test.ts`).
