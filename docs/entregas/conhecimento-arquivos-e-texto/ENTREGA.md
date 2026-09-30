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
modulo_afetado: [apresentacao, aplicacao, infraestrutura, banco, testes, documentacao]
arquivos_alterados: [".env.example", "README.md", "docs/conhecimento-arquivos-e-texto/00-AUDITORIA.md", "docs/conhecimento-arquivos-e-texto/00-BLOQUEIOS.md", "docs/conhecimento-arquivos-e-texto/00-DECISOES.md", "docs/conhecimento-arquivos-e-texto/BRIEFING-BUILDX.md", "docs/conhecimento-arquivos-e-texto/FECHAMENTO.md", "docs/conhecimento-arquivos-e-texto/ORQUESTRADOR.md", "docs/conhecimento-arquivos-e-texto/RELATORIO-FEATURE.md", "docs/conhecimento-arquivos-e-texto/VERIFICACAO-VISUAL.md", "docs/conhecimento-arquivos-e-texto/base/00-INDICE.md", "docs/conhecimento-arquivos-e-texto/base/00-LACUNAS.md", "docs/conhecimento-arquivos-e-texto/base/banco-armazenamento-e-ambiente.md", "docs/conhecimento-arquivos-e-texto/base/extracao-bibliotecas.md", "docs/conhecimento-arquivos-e-texto/base/interface-do-agente-e-conhecimento.md", "docs/conhecimento-arquivos-e-texto/base/servicos-handlers-e-fila.md", "docs/conhecimento-arquivos-e-texto/sprint-01/fases.md", "docs/conhecimento-arquivos-e-texto/sprint-01/sprint.md", "docs/conhecimento-arquivos-e-texto/sprint-01/tasks.md", "docs/conhecimento-arquivos-e-texto/sprint-02/fases.md", "docs/conhecimento-arquivos-e-texto/sprint-02/sprint.md", "docs/conhecimento-arquivos-e-texto/sprint-02/tasks.md", "docs/conhecimento-arquivos-e-texto/sprint-03/fases.md", "docs/conhecimento-arquivos-e-texto/sprint-03/sprint.md", "docs/conhecimento-arquivos-e-texto/sprint-03/tasks.md", "docs/conhecimento-arquivos-e-texto/sprint-04/fases.md", "docs/conhecimento-arquivos-e-texto/sprint-04/sprint.md", "docs/conhecimento-arquivos-e-texto/sprint-04/tasks.md", "docs/conhecimento-arquivos-e-texto/sprint-05/fases.md", "docs/conhecimento-arquivos-e-texto/sprint-05/sprint.md", "docs/conhecimento-arquivos-e-texto/sprint-05/tasks.md", "docs/conhecimento-arquivos-e-texto/sprint-06/fases.md", "docs/conhecimento-arquivos-e-texto/sprint-06/sprint.md", "docs/conhecimento-arquivos-e-texto/sprint-06/tasks.md", "docs/conhecimento-arquivos-e-texto/sprint-07/fases.md", "docs/conhecimento-arquivos-e-texto/sprint-07/sprint.md", "docs/conhecimento-arquivos-e-texto/sprint-07/tasks.md", "docs/entregas/conhecimento-arquivos-e-texto/ATENCAO.md", "docs/entregas/conhecimento-arquivos-e-texto/ENTREGA.md", "docs/entregas/conhecimento-arquivos-e-texto/PR.md", "docs/entregas/conhecimento-arquivos-e-texto/QA-PACOTE.md", "docs/projeto/MAPA.md", "docs/projeto/PREMISSAS.md", "docs/projeto/PROJETO.md", "docs/projeto/RECURSAO.md", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "package-lock.json", "package.json", "prisma/migrations/20260930180000_fontes/migration.sql", "prisma/schema.prisma", "prisma/seed.ts", "src/app/(sistema)/agentes/[id]/conhecimento/[fonteId]/loading.tsx", "src/app/(sistema)/agentes/[id]/conhecimento/[fonteId]/page.tsx", "src/app/(sistema)/agentes/[id]/conhecimento/loading.tsx", "src/app/(sistema)/agentes/[id]/conhecimento/page.tsx", "src/app/api/agentes/[id]/fontes/[fonteId]/reprocessar/route.ts", "src/app/api/agentes/[id]/fontes/[fonteId]/route.ts", "src/app/api/agentes/[id]/fontes/resposta.ts", "src/app/api/agentes/[id]/fontes/route.ts", "src/app/api/agentes/[id]/fontes/texto/route.ts", "src/componentes/AdicionarFontes.tsx", "src/componentes/BotaoExcluirFonte.tsx", "src/componentes/CartoesDeResumo.tsx", "src/componentes/FormularioDeTexto.tsx", "src/componentes/Icones.tsx", "src/componentes/LinhaDeFonte.tsx", "src/componentes/ListaDeTrechos.tsx", "src/componentes/PainelDeConhecimento.tsx", "src/componentes/ZonaDeArquivos.tsx", "src/componentes/abas-do-agente.ts", "src/componentes/conhecimento-logica.ts", "src/componentes/enviar-arquivo.ts", "src/componentes/estado-dos-envios.ts", "src/componentes/fonte-da-tela.ts", "src/componentes/itens-de-menu.ts", "src/componentes/opcoes-de-fonte.ts", "src/estilos/global.css", "src/instrumentation.ts", "src/lib/ambiente.ts", "src/lib/armazenamento.ts", "src/lib/extracao/conteudo.ts", "src/lib/extracao/csv.ts", "src/lib/extracao/docx.ts", "src/lib/extracao/formatos.ts", "src/lib/extracao/html.ts", "src/lib/extracao/index.ts", "src/lib/extracao/json.ts", "src/lib/extracao/legenda.ts", "src/lib/extracao/limites.ts", "src/lib/extracao/pdf.ts", "src/lib/extracao/texto.ts", "src/lib/extracao/zip.ts", "src/servicos/agentes.ts", "src/servicos/fontes-fila.ts", "src/servicos/fontes.ts", "src/servicos/trechos.ts", "tests/abas-do-agente.test.tsx", "tests/adicionar-fontes.test.tsx", "tests/agentes.test.ts", "tests/ajuda.ts", "tests/ambiente.test.ts", "tests/apoio/fixtures-fontes.ts", "tests/apoio/fontes.ts", "tests/apoio/gerar-fixtures.ts", "tests/apoio/servidor.ts", "tests/armazenamento.test.ts", "tests/chat-de-teste.test.tsx", "tests/conhecimento-estilos.test.ts", "tests/conhecimento-logica.test.ts", "tests/conhecimento-paginas.test.tsx", "tests/dependencias-extracao.test.ts", "tests/estado-dos-envios.test.ts", "tests/extracao-conteudo.test.ts", "tests/extracao-docx.test.ts", "tests/extracao-formatos.test.ts", "tests/extracao-html.test.ts", "tests/extracao-pdf.test.ts", "tests/extracao-planilha-json.test.ts", "tests/extracao-texto.test.ts", "tests/extracao-zip.test.ts", "tests/extracao.test.ts", "tests/fixtures-fontes.test.ts", "tests/fixtures/escaneado.pdf", "tests/fixtures/exemplo.csv", "tests/fixtures/exemplo.docx", "tests/fixtures/exemplo.html", "tests/fixtures/exemplo.json", "tests/fixtures/exemplo.md", "tests/fixtures/exemplo.pdf", "tests/fixtures/exemplo.srt", "tests/fixtures/exemplo.txt", "tests/fixtures/exemplo.vtt", "tests/fontes-arquivos.test.ts", "tests/fontes-ciclo.test.ts", "tests/fontes-fila-execucao.test.ts", "tests/fontes-fila.test.ts", "tests/fontes-modelo.test.ts", "tests/fontes-rota-ciclo.test.ts", "tests/fontes-rota-formatos.test.ts", "tests/fontes-rota-upload.test.ts", "tests/fontes-rota.test.ts", "tests/fontes.test.ts", "tests/instrumentacao.test.ts", "tests/painel-de-conhecimento.test.tsx", "tests/projeto.test.ts", "tests/rotas.test.ts", "tests/seed.test.ts", "tests/setup.ts", "tests/trechos.test.ts"]
faixa_atencao:
  - arquivo: "package.json"
    faixa: alta
  - arquivo: "prisma/migrations/20260930180000_fontes/migration.sql"
    faixa: alta
  - arquivo: "prisma/schema.prisma"
    faixa: alta
  - arquivo: "src/app/api/agentes/[id]/fontes/[fonteId]/reprocessar/route.ts"
    faixa: alta
  - arquivo: "src/app/api/agentes/[id]/fontes/[fonteId]/route.ts"
    faixa: alta
  - arquivo: "src/app/api/agentes/[id]/fontes/resposta.ts"
    faixa: alta
  - arquivo: "src/app/api/agentes/[id]/fontes/route.ts"
    faixa: alta
  - arquivo: "src/app/api/agentes/[id]/fontes/texto/route.ts"
    faixa: alta
  - arquivo: "src/instrumentation.ts"
    faixa: alta
  - arquivo: "src/lib/ambiente.ts"
    faixa: alta
  - arquivo: "src/lib/armazenamento.ts"
    faixa: alta
  - arquivo: "src/lib/extracao/conteudo.ts"
    faixa: alta
  - arquivo: "src/lib/extracao/docx.ts"
    faixa: alta
  - arquivo: "src/lib/extracao/formatos.ts"
    faixa: alta
  - arquivo: "src/lib/extracao/index.ts"
    faixa: alta
  - arquivo: "src/lib/extracao/pdf.ts"
    faixa: alta
  - arquivo: "src/lib/extracao/zip.ts"
    faixa: alta
  - arquivo: "src/servicos/agentes.ts"
    faixa: alta
  - arquivo: "src/servicos/fontes-fila.ts"
    faixa: alta
  - arquivo: "src/servicos/fontes.ts"
    faixa: alta
  - arquivo: ".env.example"
    faixa: media
  - arquivo: "README.md"
    faixa: media
  - arquivo: "prisma/seed.ts"
    faixa: media
  - arquivo: "src/app/(sistema)/agentes/[id]/conhecimento/[fonteId]/loading.tsx"
    faixa: media
  - arquivo: "src/app/(sistema)/agentes/[id]/conhecimento/[fonteId]/page.tsx"
    faixa: media
  - arquivo: "src/app/(sistema)/agentes/[id]/conhecimento/loading.tsx"
    faixa: media
  - arquivo: "src/app/(sistema)/agentes/[id]/conhecimento/page.tsx"
    faixa: media
  - arquivo: "src/componentes/AdicionarFontes.tsx"
    faixa: media
  - arquivo: "src/componentes/BotaoExcluirFonte.tsx"
    faixa: media
  - arquivo: "src/componentes/CartoesDeResumo.tsx"
    faixa: media
  - arquivo: "src/componentes/FormularioDeTexto.tsx"
    faixa: media
  - arquivo: "src/componentes/Icones.tsx"
    faixa: media
  - arquivo: "src/componentes/LinhaDeFonte.tsx"
    faixa: media
  - arquivo: "src/componentes/ListaDeTrechos.tsx"
    faixa: media
  - arquivo: "src/componentes/PainelDeConhecimento.tsx"
    faixa: media
  - arquivo: "src/componentes/ZonaDeArquivos.tsx"
    faixa: media
  - arquivo: "src/componentes/abas-do-agente.ts"
    faixa: media
  - arquivo: "src/componentes/conhecimento-logica.ts"
    faixa: media
  - arquivo: "src/componentes/enviar-arquivo.ts"
    faixa: media
  - arquivo: "src/componentes/estado-dos-envios.ts"
    faixa: media
  - arquivo: "src/componentes/fonte-da-tela.ts"
    faixa: media
  - arquivo: "src/componentes/itens-de-menu.ts"
    faixa: media
  - arquivo: "src/componentes/opcoes-de-fonte.ts"
    faixa: media
  - arquivo: "src/estilos/global.css"
    faixa: media
  - arquivo: "src/lib/extracao/csv.ts"
    faixa: media
  - arquivo: "src/lib/extracao/html.ts"
    faixa: media
  - arquivo: "src/lib/extracao/json.ts"
    faixa: media
  - arquivo: "src/lib/extracao/legenda.ts"
    faixa: media
  - arquivo: "src/lib/extracao/limites.ts"
    faixa: media
  - arquivo: "src/lib/extracao/texto.ts"
    faixa: media
  - arquivo: "src/servicos/trechos.ts"
    faixa: media
  - arquivo: "tests/abas-do-agente.test.tsx"
    faixa: media
  - arquivo: "tests/chat-de-teste.test.tsx"
    faixa: media
  - arquivo: "tests/rotas.test.ts"
    faixa: media
  - arquivo: "tests/setup.ts"
    faixa: media
  - arquivo: "docs/conhecimento-arquivos-e-texto/00-AUDITORIA.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-arquivos-e-texto/00-BLOQUEIOS.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-arquivos-e-texto/00-DECISOES.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-arquivos-e-texto/BRIEFING-BUILDX.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-arquivos-e-texto/FECHAMENTO.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-arquivos-e-texto/ORQUESTRADOR.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-arquivos-e-texto/RELATORIO-FEATURE.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-arquivos-e-texto/VERIFICACAO-VISUAL.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-arquivos-e-texto/base/00-INDICE.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-arquivos-e-texto/base/00-LACUNAS.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-arquivos-e-texto/base/banco-armazenamento-e-ambiente.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-arquivos-e-texto/base/extracao-bibliotecas.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-arquivos-e-texto/base/interface-do-agente-e-conhecimento.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-arquivos-e-texto/base/servicos-handlers-e-fila.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-arquivos-e-texto/sprint-01/fases.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-arquivos-e-texto/sprint-01/sprint.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-arquivos-e-texto/sprint-01/tasks.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-arquivos-e-texto/sprint-02/fases.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-arquivos-e-texto/sprint-02/sprint.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-arquivos-e-texto/sprint-02/tasks.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-arquivos-e-texto/sprint-03/fases.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-arquivos-e-texto/sprint-03/sprint.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-arquivos-e-texto/sprint-03/tasks.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-arquivos-e-texto/sprint-04/fases.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-arquivos-e-texto/sprint-04/sprint.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-arquivos-e-texto/sprint-04/tasks.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-arquivos-e-texto/sprint-05/fases.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-arquivos-e-texto/sprint-05/sprint.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-arquivos-e-texto/sprint-05/tasks.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-arquivos-e-texto/sprint-06/fases.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-arquivos-e-texto/sprint-06/sprint.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-arquivos-e-texto/sprint-06/tasks.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-arquivos-e-texto/sprint-07/fases.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-arquivos-e-texto/sprint-07/sprint.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-arquivos-e-texto/sprint-07/tasks.md"
    faixa: baixa
  - arquivo: "docs/entregas/conhecimento-arquivos-e-texto/ATENCAO.md"
    faixa: baixa
  - arquivo: "docs/entregas/conhecimento-arquivos-e-texto/ENTREGA.md"
    faixa: baixa
  - arquivo: "docs/entregas/conhecimento-arquivos-e-texto/PR.md"
    faixa: baixa
  - arquivo: "docs/entregas/conhecimento-arquivos-e-texto/QA-PACOTE.md"
    faixa: baixa
  - arquivo: "docs/projeto/MAPA.md"
    faixa: baixa
  - arquivo: "docs/projeto/PREMISSAS.md"
    faixa: baixa
  - arquivo: "docs/projeto/PROJETO.md"
    faixa: baixa
  - arquivo: "docs/projeto/RECURSAO.md"
    faixa: baixa
  - arquivo: "docs/stack/CONVENCOES.md"
    faixa: baixa
  - arquivo: "docs/stack/LACUNAS.md"
    faixa: baixa
  - arquivo: "package-lock.json"
    faixa: baixa
  - arquivo: "tests/adicionar-fontes.test.tsx"
    faixa: baixa
  - arquivo: "tests/agentes.test.ts"
    faixa: baixa
  - arquivo: "tests/ajuda.ts"
    faixa: baixa
  - arquivo: "tests/ambiente.test.ts"
    faixa: baixa
  - arquivo: "tests/apoio/fixtures-fontes.ts"
    faixa: baixa
  - arquivo: "tests/apoio/fontes.ts"
    faixa: baixa
  - arquivo: "tests/apoio/gerar-fixtures.ts"
    faixa: baixa
  - arquivo: "tests/apoio/servidor.ts"
    faixa: baixa
  - arquivo: "tests/armazenamento.test.ts"
    faixa: baixa
  - arquivo: "tests/conhecimento-estilos.test.ts"
    faixa: baixa
  - arquivo: "tests/conhecimento-logica.test.ts"
    faixa: baixa
  - arquivo: "tests/conhecimento-paginas.test.tsx"
    faixa: baixa
  - arquivo: "tests/dependencias-extracao.test.ts"
    faixa: baixa
  - arquivo: "tests/estado-dos-envios.test.ts"
    faixa: baixa
  - arquivo: "tests/extracao-conteudo.test.ts"
    faixa: baixa
  - arquivo: "tests/extracao-docx.test.ts"
    faixa: baixa
  - arquivo: "tests/extracao-formatos.test.ts"
    faixa: baixa
  - arquivo: "tests/extracao-html.test.ts"
    faixa: baixa
  - arquivo: "tests/extracao-pdf.test.ts"
    faixa: baixa
  - arquivo: "tests/extracao-planilha-json.test.ts"
    faixa: baixa
  - arquivo: "tests/extracao-texto.test.ts"
    faixa: baixa
  - arquivo: "tests/extracao-zip.test.ts"
    faixa: baixa
  - arquivo: "tests/extracao.test.ts"
    faixa: baixa
  - arquivo: "tests/fixtures-fontes.test.ts"
    faixa: baixa
  - arquivo: "tests/fixtures/escaneado.pdf"
    faixa: baixa
  - arquivo: "tests/fixtures/exemplo.csv"
    faixa: baixa
  - arquivo: "tests/fixtures/exemplo.docx"
    faixa: baixa
  - arquivo: "tests/fixtures/exemplo.html"
    faixa: baixa
  - arquivo: "tests/fixtures/exemplo.json"
    faixa: baixa
  - arquivo: "tests/fixtures/exemplo.md"
    faixa: baixa
  - arquivo: "tests/fixtures/exemplo.pdf"
    faixa: baixa
  - arquivo: "tests/fixtures/exemplo.srt"
    faixa: baixa
  - arquivo: "tests/fixtures/exemplo.txt"
    faixa: baixa
  - arquivo: "tests/fixtures/exemplo.vtt"
    faixa: baixa
  - arquivo: "tests/fontes-arquivos.test.ts"
    faixa: baixa
  - arquivo: "tests/fontes-ciclo.test.ts"
    faixa: baixa
  - arquivo: "tests/fontes-fila-execucao.test.ts"
    faixa: baixa
  - arquivo: "tests/fontes-fila.test.ts"
    faixa: baixa
  - arquivo: "tests/fontes-modelo.test.ts"
    faixa: baixa
  - arquivo: "tests/fontes-rota-ciclo.test.ts"
    faixa: baixa
  - arquivo: "tests/fontes-rota-formatos.test.ts"
    faixa: baixa
  - arquivo: "tests/fontes-rota-upload.test.ts"
    faixa: baixa
  - arquivo: "tests/fontes-rota.test.ts"
    faixa: baixa
  - arquivo: "tests/fontes.test.ts"
    faixa: baixa
  - arquivo: "tests/instrumentacao.test.ts"
    faixa: baixa
  - arquivo: "tests/painel-de-conhecimento.test.tsx"
    faixa: baixa
  - arquivo: "tests/projeto.test.ts"
    faixa: baixa
  - arquivo: "tests/seed.test.ts"
    faixa: baixa
  - arquivo: "tests/trechos.test.ts"
    faixa: baixa
raio: null
atencao:
  olho_obrigatorio: 20
  leitura_rapida: 35
  dispensavel: 95
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
