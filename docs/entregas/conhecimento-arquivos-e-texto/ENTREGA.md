---
expx_schema: 1
expx_tool: sprintx
kind: entrega
trabalho_id: conhecimento-arquivos-e-texto
origem_buildx: plataforma-chatbot-ia
feature_id: FT-04
entregue_por: mergex
titulo: Base de conhecimento, arquivos e textos
tipo_trabalho: feature
tipo_ocorrencia: null
estado: aberto
versionado: true
branch: feat/conhecimento-arquivos-e-texto
branch_base: feat/conversa-de-teste
commits: []
modulo_afetado: []
arquivos_alterados: []
faixa_atencao: []
raio: null
atencao:
  olho_obrigatorio: 0
  leitura_rapida: 0
  dispensavel: 0
portao: pronto
desvios: []
push_feito: false
pr_url: null
pr_estado: null
criado_em: 2026-09-30
atualizado_em: 2026-09-30
entregue_em: null
---

# Entrega — Base de conhecimento, arquivos e textos

Branch aberta a partir de `feat/conversa-de-teste` (PRs empilhados; base indicada pelo pedido do buildx).

## Avisos

- O `ORQUESTRADOR.md` da feature ainda não existe (a F4 vem depois): a linha da branch será acrescentada quando ele for criado.

## Desvios

- T-01.02: `npm audit --audit-level=high` já acusava 1 vulnerabilidade crítica no `next` 16.3.3 (advisory publicado depois da FT-03). Atualizados, com versão fixa, `next` e `eslint-config-next` para 16.3.8 (patch dentro de 16.3); `package.json` e o lockfile já constavam na task. Build, testes e auditoria verdes depois.
- T-02.04: o teste funcional previsto ("três parágrafos curtos viram um trecho por parágrafo") foi reescrito: parágrafos que cabem juntos na janela de 1000 caracteres ficam no mesmo trecho; o teste confere que o corte cai na quebra de parágrafo e que o trecho seguinte traz a sobreposição. Também entrou uma regra não prevista: a sobreposição que não leva conteúdo novo (antes de uma palavra gigante) é descartada.
- T-05.01 e T-05.02: o `route.ts` foi escrito inteiro (GET e POST multipart) na T-05.01, junto do apoio `resposta.ts`; a T-05.02 então só acrescentou o teste de upload, que passou de primeira (sem ciclo vermelho separado). O 413 e o 415 do multipart ficam provados no teste, contra o servidor de produção.
- T-05.01: `src/lib/ambiente.ts` ganhou o comentário `turbopackIgnore` no `path.resolve` de `storageDir`; sem ele o Turbopack avisava que o acesso dinâmico ao sistema de arquivos faria o rastreamento incluir o projeto inteiro no pacote do servidor.
- T-01.03 e T-01.04: foram concluídas no mesmo commit (`9df888d`), porque o gerador de fixtures é um arquivo só.
- T-05.04: `next.config.ts` não precisou mudar: `unpdf` e `mammoth` rodam no servidor de produção sem `serverExternalPackages` (provado por `tests/fontes-rota-formatos.test.ts`), resolvendo a lacuna 3 da base sem alteração.
- T-06.03: `conhecimento/page.tsx` nasce só com os cartões de resumo, porque o painel cliente ainda não existe; a T-06.04 o altera para ligar a lista de fontes (o arquivo já consta em `cria` da T-06.03).
- T-06.04: entrou um módulo não previsto, `src/componentes/fonte-da-tela.ts` (tipo da fonte que cruza para o navegador e `serializarFonte`), porque uma função de arquivo `'use client'` não pode ser chamada pelo servidor; e a T-06.04 altera `conhecimento/page.tsx` (criado na T-06.03) para ligar o painel.
- T-06.04: o teste `tests/chat-de-teste.test.tsx` (FT-03) afirmava que `ChatDeTeste.tsx` era o único arquivo com `fetch` para `/api`. A regra de fundo (fetch só em componente cliente) continua; o teste passou a exigir que todo arquivo com esse `fetch` esteja em `src/componentes/` e comece por `'use client'`.
- T-06.05: entrou um módulo não previsto, `src/componentes/enviar-arquivo.ts` (envio por XMLHttpRequest, para ter progresso por arquivo, e `interpretarRespostaDoEnvio`, pura e testada).
- T-07.03: `tests/rotas.test.ts` (FT-03) contava duas abas na página do agente; com a aba Conhecimento são três. A falha só apareceu depois do `npm run build` da verificação visual, porque o teste de rotas roda contra o build. Ajustado o número.
- Portão E2 (primeira rodada): V9 acusou os 14 arquivos `sprint.md` e `fases.md` das sprints 01 a 07, criados na F3 e não declarados em nenhuma task. Declarados em `arquivos.cria` da T-07.04 (fechamento no laço do buildx).
