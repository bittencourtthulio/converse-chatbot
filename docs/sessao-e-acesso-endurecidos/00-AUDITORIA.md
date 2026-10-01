# Auditoria — sessao-e-acesso-endurecidos

Data: 2026-10-01. O agente `auditor-plano` não existe neste harness: a primeira passada foi feita lendo só os arquivos do plano, e a segunda e a terceira por um agente independente de leitura (sem ter visto o raciocínio da F3).

## Primeira passada (VEREDITO: NÃO, plano regerado na F3)

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| ALTA | sprint-02/tasks.md (T-02.03) | `assinarSessao` muda o terceiro argumento e `perfil.ts` ainda passava o número até a T-02.06, deixando `tests/perfil.test.ts` vermelho com a T-02.03 em `verde` | `perfil.ts` em `arquivos.altera` da T-02.03, passando `{ agora: corte }` |
| ALTA | sprint-02/tasks.md (T-02.05, T-02.06) | a T-02.05 trocava o corte por versão enquanto `trocarSenha` só incrementava na T-02.06 | a T-02.05 mantém o corte; a T-02.06 troca leitura e gravação juntas |
| MÉDIA | sprint-02/tasks.md (T-02.05, T-02.07) | faltava o relógio injetável em `entrar` | `entrar(entrada, { agora })` na T-02.05 |
| MÉDIA | sprint-04/tasks.md (T-04.03) | `listar` sem ator quebraria com TypeError | conferir `autor?.id` antes do papel |

## Segunda passada (agente independente, VEREDITO: NÃO, plano regerado na F3)

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| ALTA | sprint-02, 03 e 04 (T-02.02, T-02.08, T-03.01, T-03.03, T-04.02, T-04.03) | `tests/projeto.test.ts` fixa citações `arquivo:linha` que as tasks deslocam | `tests/projeto.test.ts`, `CONVENCOES.md` e `LACUNAS.md` em `arquivos.altera` de toda task que altera `src/`, com o reajuste no critério |
| MÉDIA | sprint-02/tasks.md (T-02.03, T-02.05) | o teto `ini + máximo` não era exercitado com os valores padrão | testes que forçam `SESSAO_MAXIMA_HORAS=1` com TTL maior e que forjam token com `inicio` antigo; duas mutações |
| MÉDIA | sprint-04 e sprint-05 | testes de servidor usam o `.next` existente sem exigir `npm run build` | build no critério de aceite e no ORQUESTRADOR |
| BAIXA | T-02.01, T-05.x, T-06.02, T-06.03 | `prisma generate`, TTL fixo e ordem dos casos, escopo do defeito visual, consolidação das mutações no `ENTREGA.md` | ajustados no plano |
| (decisão) | D-06, PR-102 | o formulário de `sair` enviado sem JavaScript não leva `next-action`: o proxy poderia renovar na mesma resposta | não renovar POST a uma página (com ou sem `next-action`); POST a `/api` renova |

## Terceira passada (agente independente)

Nenhum achado. Risco residual BAIXO aceito: com `JWT_TTL_SEGUNDOS=8` os casos da sprint 05 correm contra o relógio e podem ficar instáveis em máquina carregada; resolve-se esperando (regra 8 do `ORQUESTRADOR.md`).

VEREDITO: SIM — o plano está pronto para execução autônoma.
