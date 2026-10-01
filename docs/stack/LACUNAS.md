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
| 2 | sem cobertura de teste | nenhum número diz quanto código os testes exercitam | opcional, não bloqueia |
| 3 | sem reversão de migração | erro de migração se corrige avançando, nunca voltando | mitigado pelo backup (PR-20, FT-11) |
| 4 | sem `engines` no `package.json` | `npm install` em Node antigo não avisa; o CI e o README dizem 22, mas nada trava | acrescentar `engines` quando uma feature tocar o `package.json`; baixo |
| 5 | ~~armazenamento em teste ainda sem código~~ | resolvida na FT-04: `tests/setup.ts:23-24` cria o `STORAGE_DIR` temporário por arquivo de teste e `src/lib/armazenamento.ts:30` recebe a raiz por parâmetro; a parte de HTTP de saída e serviço externo foi resolvida na FT-02 (`tests/apoio/openrouter-falso.ts:90`) | — |
| 6 | sem log estruturado nem correlação própria | erro inesperado só vai para `console.error` e o operador não liga a tela ao log | FT-11 (PR-21) |
| 7 | ~~sem handler HTTP em `src/app/api`~~ | resolvida na FT-03: `src/app/api/agentes/[id]/conversar/route.ts:30` é o exemplo de handler fino, com stream SSE | — |
| 8 | ~~sem tarefa em segundo plano~~ | resolvida na FT-04: `src/instrumentation.ts:6` e `src/servicos/fontes-fila.ts:53` são o exemplo (estado no banco, reivindicação atômica, retomada na subida) | — |
| 9 | ~~regra "migração só acrescenta" sem verificação automática~~ | resolvida na FT-02: `tests/migracoes.test.ts:14` falha em `DROP TABLE` ou `DROP COLUMN` sem a marca `-- destrutiva-autorizada` | — |

Resolvidas na FT-07: o primeiro webhook de terceiro, autenticado por segredo em tempo constante (`src/servicos/telegram-webhook.ts:38`, provado contra o servidor de produção em `tests/telegram-webhook-rota.test.ts`), o primeiro uso de `after()` do Next 16 em `next start` (`src/app/api/telegram/[agenteId]/webhook/route.ts:21`) e o simulado do segundo serviço externo (`tests/apoio/telegram-falso.ts:91`). Novas, baixas: (18) o **Telegram real** nunca foi chamado: o comportamento do `secret_token`, do reenvio e do `retry_after` está provado só contra o simulado e pela documentação (PEND-06: só com token e URL pública HTTPS do usuário); (19) o app responde 200 antes de atender, então um **reinício** do processo entre o 200 e a resposta perde aquela atualização (o Telegram já recebeu 200 e não reenvia), e mensagens enviadas com o canal pausado nunca são atendidas depois; (20) o limite por minuto por chat, a exclusão mútua por chat e a purga do dedupe são em memória e valem por processo (PR-05); (21) a aba Canais não foi vista a **375 px** nem o aviso de `APP_URL` e o selo "Com erro" no navegador (PEND-07), só em teste de renderização e de rota (`docs/canal-telegram/VERIFICACAO-VISUAL.md`).

Resolvidas na FT-06: o primeiro handler público sem sessão (`src/app/api/publico/agentes/[id]/conversar/route.ts:35`, testado em `tests/publico-conversar-rota.test.ts`), o primeiro uso de cabeçalho de segurança dinâmico por rota e de `proxy.ts` (`src/proxy.ts:12`, provado em `tests/embed-cabecalhos.test.ts`: o Prisma roda no runtime Node do proxy e a expressão regular que tira `/embed` do `X-Frame-Options: DENY` funciona no `next.config.ts`). Novas, baixas: (14) o script `widget.js` é provado em `happy-dom` e numa verificação manual no Chrome (`docs/chat-embutido/VERIFICACAO-VISUAL.md`), mas não em site com HTTPS nem com CSP própria, nem a 375 px (PEND-07); (15) o `proxy.ts` consulta o banco a cada carregamento de `/embed`, o que basta para um processo e uma instalação pequena, mas não tem cache; (16) o limite por minuto do chat público é em memória e sem `TRUST_PROXY=1` todos os visitantes dividem um IP só (a aba Publicar avisa); (17) `tests/rotas.test.ts` e os demais testes de rota usam o `.next` que existir: rodar `npm run build` antes de cada suíte inteira, senão o teste vê a construção antiga.

Resolvidas na FT-05: a ressalva "SQL cru só para FTS5 (ainda não existe)" do CONVENCOES (agora `prisma/migrations/20260930190000_busca_fts5/migration.sql:10` e `src/servicos/recuperacao.ts:76`). Novas, baixas: (10) `prisma migrate dev` não foi usado com a tabela virtual FTS5 e suas tabelas de sombra: a migration é escrita à mão e provada por `migrate deploy` do zero e por `migrate status`, mas o comportamento do `migrate dev` (divergência de esquema) segue não verificado; (11) o `rowid` de `trechos` (sem chave `INTEGER PRIMARY KEY`) pode ser renumerado por `VACUUM` ou por restauração de backup e desalinhar o índice FTS5: o remédio é `reconstruirIndiceDeTrechos()` (`src/servicos/recuperacao.ts:126`), a lembrar na FT-11; (12) o comportamento do modelo real diante do prompt fundamentado (citar `[n]`, tratar o material como dado, dizer que não encontrou) não é testável sem chamar o provedor: só a estrutura do prompt é provada (`tests/chat-fundamentado.test.ts`); (13) sem jsdom, abrir a fonte ao clicar numa referência `[n]` só é provado pela lógica pura e pela verificação visual.

Resolvidas na FT-04: lacunas 5 (armazenamento em teste) e 8 (tarefa em segundo plano, primeiro uso de `src/instrumentation.ts`). Nova, baixa: sem jsdom nem janela de 375 px na ferramenta de navegador, o arrastar-e-soltar, o spinner de "Processando" e as regras de 375 px só são provados por módulo puro, por teste do CSS e pela verificação visual parcial (`docs/conhecimento-arquivos-e-texto/VERIFICACAO-VISUAL.md`). Nova, baixa: o texto do CONVENCOES que cita 184 testes da FT-01 está defasado (a suíte tem 890).

Resolvidas na FT-03: lacuna 7 (handler HTTP, `src/app/api/agentes/[id]/conversar/route.ts:30`, testado em `tests/conversar-rota.test.ts`). Nova, baixa: sem ambiente de teste com DOM (jsdom), o comportamento interativo de componente cliente só é provado nos módulos puros e na verificação visual.

Resolvidas na FT-02: lacuna 9 (teste do SQL das migrations) e a parte de HTTP de saída da 5.

Resolvidas na FT-01: a direção das camadas sem regra de lint (agora `eslint.config.mjs:8-60` e `tests/camadas.test.ts`).
