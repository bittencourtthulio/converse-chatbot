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
| 5 | HTTP de saída, armazenamento e serviço externo em teste ainda sem código | a regra de servidor local de teste e de `STORAGE_DIR` não tem exemplo para copiar | resolvida na FT-02 (OpenRouter) e na FT-04 (arquivos) |
| 6 | sem log estruturado nem correlação própria | erro inesperado só vai para `console.error` e o operador não liga a tela ao log | FT-11 (PR-21) |
| 7 | sem handler HTTP em `src/app/api` | a regra "handler fino" não tem exemplo | FT-06 |
| 8 | sem tarefa em segundo plano | `src/instrumentation.ts` e o padrão `-fila.ts` não têm exemplo | FT-04 |
| 9 | regra "migração só acrescenta" sem verificação automática | uma migração destrutiva passaria sem aviso | avaliar teste que leia o SQL das migrations quando houver a segunda migração (FT-02) |

Resolvidas na FT-01: a direção das camadas sem regra de lint (agora `eslint.config.mjs:8-60` e `tests/camadas.test.ts`).
