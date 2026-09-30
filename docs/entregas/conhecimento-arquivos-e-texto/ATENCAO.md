---
expx_schema: 1
expx_tool: sprintx
kind: atencao
trabalho_id: conhecimento-arquivos-e-texto
origem_buildx: plataforma-chatbot-ia
feature_id: FT-04
raio: null
olho_obrigatorio: 20
leitura_rapida: 35
dispensavel: 95
atualizado_em: 2026-09-30
---

# Atenção humana — conhecimento-arquivos-e-texto

Sem modo legado e sem raio calculado: a classificação vem do tipo de arquivo e da evidência das tasks. Entrada não confiável (nomes, PDF, DOCX, ZIP), caminho em disco, migração, contrato novo de rota com sessão, exclusão que apaga arquivo, fila em segundo plano, efeito na subida do servidor, configuração e dependências ficam em OLHO OBRIGATÓRIO; parsers simples, telas e estilos já cobertos por teste, em LEITURA RÁPIDA; testes, fixtures, lockfile e documentos em DISPENSÁVEL, porque a suíte de 891 testes os exerce. O tamanho do diff não entrou no critério. O memox estava instalado e foi consultado nos 21 arquivos alterados que já existiam: nenhum tem regressão ou reprovação em QA registrada (O9 não se aplica); só trouxe `faixa_atencao_frequente`, que não altera faixa. Os arquivos `ATENCAO.md`, `PR.md`, `QA-PACOTE.md`, `FECHAMENTO.md` e `RELATORIO-FEATURE.md` entram na conta porque são criados logo depois desta classificação.


### OLHO OBRIGATÓRIO — ler linha a linha

- `package.json` (M, +5/-2) — O1 dependências: unpdf, mammoth e parse5 com versão fixa e `next` e `eslint-config-next` 16.3.3 para 16.3.8 pela auditoria; `npm audit --audit-level=high` em 0
- `prisma/migrations/20260930180000_fontes/migration.sql` (A, +43/-0) — O3 migração de banco: só CREATE TABLE e CREATE INDEX (tests/migracoes.test.ts), cascata provada por tests/fontes-modelo.test.ts
- `prisma/schema.prisma` (M, +51/-0) — O3 modelo de banco: Fonte e Trecho com cascata do agente e SET NULL do usuário; provado por tests/fontes-modelo.test.ts
- `src/app/api/agentes/[id]/fontes/[fonteId]/reprocessar/route.ts` (A, +17/-0) — O4 contrato público novo (POST reprocessar) e O2 sessão no servidor; provado por tests/fontes-rota-ciclo.test.ts
- `src/app/api/agentes/[id]/fontes/[fonteId]/route.ts` (A, +17/-0) — O4 contrato público novo (DELETE) com efeito irreversível (O6: apaga linha, trechos e arquivo); provado por tests/fontes-rota-ciclo.test.ts
- `src/app/api/agentes/[id]/fontes/resposta.ts` (A, +45/-0) — O1 o que chega ao navegador em caso de erro: só a mensagem do operador ou o código de correlação, sem pilha; usado por todas as rotas de fontes
- `src/app/api/agentes/[id]/fontes/route.ts` (A, +55/-0) — O4 contrato público novo (GET e POST multipart) e O2 sessão no servidor: 401, 404, 413 por Content-Length, 415, 422; provado por tests/fontes-rota.test.ts e tests/fontes-rota-upload.test.ts
- `src/app/api/agentes/[id]/fontes/texto/route.ts` (A, +26/-0) — O4 contrato público novo (POST JSON) e O2 sessão no servidor; provado por tests/fontes-rota.test.ts
- `src/instrumentation.ts` (A, +17/-0) — O1 efeito na subida do servidor: retoma `processando` e liga a fila só no runtime Node, sem bloquear; provado por tests/instrumentacao.test.ts e pelo servidor de produção em tests/fontes-rota-formatos.test.ts
- `src/lib/ambiente.ts` (M, +16/-0) — O1 configuração: STORAGE_DIR e MAX_UPLOAD_MB, com `turbopackIgnore` para o build; provado por tests/ambiente.test.ts
- `src/lib/armazenamento.ts` (A, +79/-0) — O1 segurança de caminho em disco (PR-13): ids de alfabeto fechado, caminho conferido dentro da raiz, gravação atômica e permissões; provado por tests/armazenamento.test.ts
- `src/lib/extracao/conteudo.ts` (A, +44/-0) — O1 entrada não confiável: confere o conteúdo real (assinatura do PDF, texto com BOM e Latin-1, byte nulo, JSON); provado por tests/extracao-conteudo.test.ts
- `src/lib/extracao/docx.ts` (A, +24/-0) — O1 entrada não confiável: parser de DOCX de terceiros depois da conferência do ZIP; provado por tests/extracao-docx.test.ts
- `src/lib/extracao/formatos.ts` (A, +68/-0) — O1 nome enviado pelo usuário: sanitização do nome de exibição e mapa de extensões; provado por tests/extracao-formatos.test.ts
- `src/lib/extracao/index.ts` (A, +100/-0) — O1 fachada da extração: limite de 5 milhões de caracteres, prazo de 120 s e conversão de qualquer exceção em mensagem sem vazar a da biblioteca; provado por tests/extracao.test.ts
- `src/lib/extracao/pdf.ts` (A, +57/-0) — O1 entrada não confiável: parser de PDF de terceiros no processo do servidor, limite de páginas e mensagem de PDF escaneado; provado por tests/extracao-pdf.test.ts
- `src/lib/extracao/zip.ts` (A, +99/-0) — O1 entrada não confiável: leitura própria do ZIP do DOCX e descompactação com teto contra zip bomb, sem confiar no cabeçalho; provado por tests/extracao-zip.test.ts
- `src/servicos/agentes.ts` (M, +9/-0) — O6 efeito irreversível novo: excluir o agente agora apaga também o diretório dele em disco; provado por tests/agentes.test.ts
- `src/servicos/fontes-fila.ts` (A, +218/-0) — O1 processamento em segundo plano: reivindicação atômica, transação que substitui trechos, erro amigável sem vazar detalhe e log sem conteúdo; provado por tests/fontes-fila.test.ts e tests/fontes-fila-execucao.test.ts
- `src/servicos/fontes.ts` (A, +332/-0) — O2 autorização e validação de entrada (zod), ordem arquivo antes da linha, exclusão definitiva e 404 para fonte de outro agente; provado por tests/fontes.test.ts, tests/fontes-arquivos.test.ts e tests/fontes-ciclo.test.ts

### LEITURA RÁPIDA — conferir intenção, não implementação

- `.env.example` (M, +9/-0) — L2 variáveis novas documentadas sem valor real; conferido por tests/projeto.test.ts
- `README.md` (M, +12/-1) — L2 documentação de uso; conferida por tests/projeto.test.ts
- `prisma/seed.ts` (M, +57/-0) — L2 só roda em desenvolvimento e recusa produção; coberto por tests/seed.test.ts
- `src/app/(sistema)/agentes/[id]/conhecimento/[fonteId]/loading.tsx` (A, +16/-0) — L3 arquivo novo de interface ou página, com os dois testes verdes (tests/conhecimento-paginas.test.tsx, tests/painel-de-conhecimento.test.tsx, tests/adicionar-fontes.test.tsx, tests/estado-dos-envios.test.ts, tests/conhecimento-logica.test.ts)
- `src/app/(sistema)/agentes/[id]/conhecimento/[fonteId]/page.tsx` (A, +32/-0) — L3 arquivo novo de interface ou página, com os dois testes verdes (tests/conhecimento-paginas.test.tsx, tests/painel-de-conhecimento.test.tsx, tests/adicionar-fontes.test.tsx, tests/estado-dos-envios.test.ts, tests/conhecimento-logica.test.ts)
- `src/app/(sistema)/agentes/[id]/conhecimento/loading.tsx` (A, +19/-0) — L3 arquivo novo de interface ou página, com os dois testes verdes (tests/conhecimento-paginas.test.tsx, tests/painel-de-conhecimento.test.tsx, tests/adicionar-fontes.test.tsx, tests/estado-dos-envios.test.ts, tests/conhecimento-logica.test.ts)
- `src/app/(sistema)/agentes/[id]/conhecimento/page.tsx` (A, +27/-0) — L3 arquivo novo de interface ou página, com os dois testes verdes (tests/conhecimento-paginas.test.tsx, tests/painel-de-conhecimento.test.tsx, tests/adicionar-fontes.test.tsx, tests/estado-dos-envios.test.ts, tests/conhecimento-logica.test.ts)
- `src/componentes/AdicionarFontes.tsx` (A, +67/-0) — L3 arquivo novo de interface ou página, com os dois testes verdes (tests/conhecimento-paginas.test.tsx, tests/painel-de-conhecimento.test.tsx, tests/adicionar-fontes.test.tsx, tests/estado-dos-envios.test.ts, tests/conhecimento-logica.test.ts)
- `src/componentes/BotaoExcluirFonte.tsx` (A, +78/-0) — L3 arquivo novo de interface ou página, com os dois testes verdes (tests/conhecimento-paginas.test.tsx, tests/painel-de-conhecimento.test.tsx, tests/adicionar-fontes.test.tsx, tests/estado-dos-envios.test.ts, tests/conhecimento-logica.test.ts)
- `src/componentes/CartoesDeResumo.tsx` (A, +30/-0) — L3 arquivo novo de interface ou página, com os dois testes verdes (tests/conhecimento-paginas.test.tsx, tests/painel-de-conhecimento.test.tsx, tests/adicionar-fontes.test.tsx, tests/estado-dos-envios.test.ts, tests/conhecimento-logica.test.ts)
- `src/componentes/FormularioDeTexto.tsx` (A, +104/-0) — L3 arquivo novo de interface ou página, com os dois testes verdes (tests/conhecimento-paginas.test.tsx, tests/painel-de-conhecimento.test.tsx, tests/adicionar-fontes.test.tsx, tests/estado-dos-envios.test.ts, tests/conhecimento-logica.test.ts)
- `src/componentes/Icones.tsx` (M, +32/-0) — L2 sete ícones novos; coberto por tests/abas-do-agente.test.tsx
- `src/componentes/LinhaDeFonte.tsx` (A, +82/-0) — L3 arquivo novo de interface ou página, com os dois testes verdes (tests/conhecimento-paginas.test.tsx, tests/painel-de-conhecimento.test.tsx, tests/adicionar-fontes.test.tsx, tests/estado-dos-envios.test.ts, tests/conhecimento-logica.test.ts)
- `src/componentes/ListaDeTrechos.tsx` (A, +116/-0) — L3 arquivo novo de interface ou página, com os dois testes verdes (tests/conhecimento-paginas.test.tsx, tests/painel-de-conhecimento.test.tsx, tests/adicionar-fontes.test.tsx, tests/estado-dos-envios.test.ts, tests/conhecimento-logica.test.ts)
- `src/componentes/PainelDeConhecimento.tsx` (A, +111/-0) — L3 arquivo novo de interface ou página, com os dois testes verdes (tests/conhecimento-paginas.test.tsx, tests/painel-de-conhecimento.test.tsx, tests/adicionar-fontes.test.tsx, tests/estado-dos-envios.test.ts, tests/conhecimento-logica.test.ts)
- `src/componentes/ZonaDeArquivos.tsx` (A, +173/-0) — L3 arquivo novo de interface ou página, com os dois testes verdes (tests/conhecimento-paginas.test.tsx, tests/painel-de-conhecimento.test.tsx, tests/adicionar-fontes.test.tsx, tests/estado-dos-envios.test.ts, tests/conhecimento-logica.test.ts)
- `src/componentes/abas-do-agente.ts` (M, +2/-1) — L2 uma entrada na lista de abas; coberto por tests/abas-do-agente.test.tsx
- `src/componentes/conhecimento-logica.ts` (A, +87/-0) — L3 arquivo novo de interface ou página, com os dois testes verdes (tests/conhecimento-paginas.test.tsx, tests/painel-de-conhecimento.test.tsx, tests/adicionar-fontes.test.tsx, tests/estado-dos-envios.test.ts, tests/conhecimento-logica.test.ts)
- `src/componentes/enviar-arquivo.ts` (A, +46/-0) — L3 arquivo novo de interface ou página, com os dois testes verdes (tests/conhecimento-paginas.test.tsx, tests/painel-de-conhecimento.test.tsx, tests/adicionar-fontes.test.tsx, tests/estado-dos-envios.test.ts, tests/conhecimento-logica.test.ts)
- `src/componentes/estado-dos-envios.ts` (A, +96/-0) — L3 arquivo novo de interface ou página, com os dois testes verdes (tests/conhecimento-paginas.test.tsx, tests/painel-de-conhecimento.test.tsx, tests/adicionar-fontes.test.tsx, tests/estado-dos-envios.test.ts, tests/conhecimento-logica.test.ts)
- `src/componentes/fonte-da-tela.ts` (A, +33/-0) — L3 arquivo novo de interface ou página, com os dois testes verdes (tests/conhecimento-paginas.test.tsx, tests/painel-de-conhecimento.test.tsx, tests/adicionar-fontes.test.tsx, tests/estado-dos-envios.test.ts, tests/conhecimento-logica.test.ts)
- `src/componentes/itens-de-menu.ts` (M, +7/-0) — L2 sete nomes de ícone no tipo; coberto por tests/abas-do-agente.test.tsx
- `src/componentes/opcoes-de-fonte.ts` (A, +26/-0) — L3 arquivo novo de interface ou página, com os dois testes verdes (tests/conhecimento-paginas.test.tsx, tests/painel-de-conhecimento.test.tsx, tests/adicionar-fontes.test.tsx, tests/estado-dos-envios.test.ts, tests/conhecimento-logica.test.ts)
- `src/estilos/global.css` (M, +194/-0) — L2 só tokens de cor, conferido por tests/tokens.test.ts e tests/conhecimento-estilos.test.ts
- `src/lib/extracao/csv.ts` (A, +71/-0) — L3 arquivo novo coberto por tests/extracao-planilha-json.test.ts
- `src/lib/extracao/html.ts` (A, +108/-0) — L3 arquivo novo: parse5 só monta árvore (nada executa); saída só como texto; tests/extracao-html.test.ts
- `src/lib/extracao/json.ts` (A, +38/-0) — L3 arquivo novo coberto por tests/extracao-planilha-json.test.ts
- `src/lib/extracao/legenda.ts` (A, +42/-0) — L3 arquivo novo coberto por tests/extracao-texto.test.ts
- `src/lib/extracao/limites.ts` (A, +19/-0) — L3 constantes num só lugar; conferidas por tests/extracao-formatos.test.ts
- `src/lib/extracao/texto.ts` (A, +7/-0) — L3 arquivo novo coberto por tests/extracao-texto.test.ts
- `src/servicos/trechos.ts` (A, +97/-0) — L3 arquivo novo, puro, com 70 testes entre propriedade (60 sementes) e casos
- `tests/abas-do-agente.test.tsx` (M, +31/-7) — L1 asserções existentes alteradas para três abas, mais casos novos
- `tests/chat-de-teste.test.tsx` (M, +6/-2) — L1 asserção existente alterada (fetch para /api só em componente cliente), a regra de fundo continua
- `tests/rotas.test.ts` (M, +1/-1) — L1 asserção existente alterada (três abas em vez de duas)
- `tests/setup.ts` (M, +7/-1) — L2 o setup de todos os testes agora cria e apaga um STORAGE_DIR temporário; nada mais mudou

### DISPENSÁVEL — a máquina já provou

- `docs/conhecimento-arquivos-e-texto/00-AUDITORIA.md` (A, +21/-0) — D2 documento sem efeito em execução
- `docs/conhecimento-arquivos-e-texto/00-BLOQUEIOS.md` (A, +14/-0) — D2 documento sem efeito em execução
- `docs/conhecimento-arquivos-e-texto/00-DECISOES.md` (A, +201/-0) — D2 documento sem efeito em execução
- `docs/conhecimento-arquivos-e-texto/BRIEFING-BUILDX.md` (A, +46/-0) — D2 documento sem efeito em execução
- `docs/conhecimento-arquivos-e-texto/FECHAMENTO.md` (A, +0/-0) — D2 documento sem efeito em execução
- `docs/conhecimento-arquivos-e-texto/ORQUESTRADOR.md` (A, +99/-0) — D2 documento sem efeito em execução
- `docs/conhecimento-arquivos-e-texto/RELATORIO-FEATURE.md` (A, +0/-0) — D2 documento sem efeito em execução
- `docs/conhecimento-arquivos-e-texto/VERIFICACAO-VISUAL.md` (A, +28/-0) — D2 documento sem efeito em execução
- `docs/conhecimento-arquivos-e-texto/base/00-INDICE.md` (A, +33/-0) — D2 documento sem efeito em execução
- `docs/conhecimento-arquivos-e-texto/base/00-LACUNAS.md` (A, +13/-0) — D2 documento sem efeito em execução
- `docs/conhecimento-arquivos-e-texto/base/banco-armazenamento-e-ambiente.md` (A, +28/-0) — D2 documento sem efeito em execução
- `docs/conhecimento-arquivos-e-texto/base/extracao-bibliotecas.md` (A, +32/-0) — D2 documento sem efeito em execução
- `docs/conhecimento-arquivos-e-texto/base/interface-do-agente-e-conhecimento.md` (A, +28/-0) — D2 documento sem efeito em execução
- `docs/conhecimento-arquivos-e-texto/base/servicos-handlers-e-fila.md` (A, +31/-0) — D2 documento sem efeito em execução
- `docs/conhecimento-arquivos-e-texto/sprint-01/fases.md` (A, +53/-0) — D2 documento sem efeito em execução
- `docs/conhecimento-arquivos-e-texto/sprint-01/sprint.md` (A, +39/-0) — D2 documento sem efeito em execução
- `docs/conhecimento-arquivos-e-texto/sprint-01/tasks.md` (A, +151/-0) — D2 documento sem efeito em execução
- `docs/conhecimento-arquivos-e-texto/sprint-02/fases.md` (A, +53/-0) — D2 documento sem efeito em execução
- `docs/conhecimento-arquivos-e-texto/sprint-02/sprint.md` (A, +39/-0) — D2 documento sem efeito em execução
- `docs/conhecimento-arquivos-e-texto/sprint-02/tasks.md` (A, +151/-0) — D2 documento sem efeito em execução
- `docs/conhecimento-arquivos-e-texto/sprint-03/fases.md` (A, +72/-0) — D2 documento sem efeito em execução
- `docs/conhecimento-arquivos-e-texto/sprint-03/sprint.md` (A, +40/-0) — D2 documento sem efeito em execução
- `docs/conhecimento-arquivos-e-texto/sprint-03/tasks.md` (A, +321/-0) — D2 documento sem efeito em execução
- `docs/conhecimento-arquivos-e-texto/sprint-04/fases.md` (A, +72/-0) — D2 documento sem efeito em execução
- `docs/conhecimento-arquivos-e-texto/sprint-04/sprint.md` (A, +40/-0) — D2 documento sem efeito em execução
- `docs/conhecimento-arquivos-e-texto/sprint-04/tasks.md` (A, +219/-0) — D2 documento sem efeito em execução
- `docs/conhecimento-arquivos-e-texto/sprint-05/fases.md` (A, +53/-0) — D2 documento sem efeito em execução
- `docs/conhecimento-arquivos-e-texto/sprint-05/sprint.md` (A, +39/-0) — D2 documento sem efeito em execução
- `docs/conhecimento-arquivos-e-texto/sprint-05/tasks.md` (A, +151/-0) — D2 documento sem efeito em execução
- `docs/conhecimento-arquivos-e-texto/sprint-06/fases.md` (A, +91/-0) — D2 documento sem efeito em execução
- `docs/conhecimento-arquivos-e-texto/sprint-06/sprint.md` (A, +41/-0) — D2 documento sem efeito em execução
- `docs/conhecimento-arquivos-e-texto/sprint-06/tasks.md` (A, +219/-0) — D2 documento sem efeito em execução
- `docs/conhecimento-arquivos-e-texto/sprint-07/fases.md` (A, +53/-0) — D2 documento sem efeito em execução
- `docs/conhecimento-arquivos-e-texto/sprint-07/sprint.md` (A, +38/-0) — D2 documento sem efeito em execução
- `docs/conhecimento-arquivos-e-texto/sprint-07/tasks.md` (A, +151/-0) — D2 documento sem efeito em execução
- `docs/entregas/conhecimento-arquivos-e-texto/ATENCAO.md` (A, +0/-0) — D2 documento sem efeito em execução
- `docs/entregas/conhecimento-arquivos-e-texto/ENTREGA.md` (A, +56/-0) — D2 documento sem efeito em execução
- `docs/entregas/conhecimento-arquivos-e-texto/PR.md` (A, +0/-0) — D2 documento sem efeito em execução
- `docs/entregas/conhecimento-arquivos-e-texto/QA-PACOTE.md` (A, +0/-0) — D2 documento sem efeito em execução
- `docs/projeto/MAPA.md` (M, +7/-4) — D2 documento sem efeito em execução
- `docs/projeto/PREMISSAS.md` (M, +68/-3) — D2 documento sem efeito em execução
- `docs/projeto/PROJETO.md` (M, +1/-1) — D2 documento sem efeito em execução
- `docs/projeto/RECURSAO.md` (M, +2/-2) — D2 documento sem efeito em execução
- `docs/stack/CONVENCOES.md` (M, +12/-7) — D2 documento sem efeito em execução
- `docs/stack/LACUNAS.md` (M, +5/-3) — D2 documento sem efeito em execução
- `package-lock.json` (M, +273/-49) — D3 gerado pelo npm a partir do package.json
- `tests/adicionar-fontes.test.tsx` (A, +99/-0) — D1 arquivo de teste ou apoio que só acrescenta caso
- `tests/agentes.test.ts` (M, +49/-1) — D1 arquivo de teste ou apoio que só acrescenta caso
- `tests/ajuda.ts` (M, +2/-0) — D1 arquivo de teste ou apoio que só acrescenta caso
- `tests/ambiente.test.ts` (M, +43/-1) — D1 arquivo de teste ou apoio que só acrescenta caso
- `tests/apoio/fixtures-fontes.ts` (A, +258/-0) — D1 arquivo de teste ou apoio que só acrescenta caso
- `tests/apoio/fontes.ts` (A, +47/-0) — D1 arquivo de teste ou apoio que só acrescenta caso
- `tests/apoio/gerar-fixtures.ts` (A, +12/-0) — D1 arquivo de teste ou apoio que só acrescenta caso
- `tests/apoio/servidor.ts` (A, +45/-0) — D1 arquivo de teste ou apoio que só acrescenta caso
- `tests/armazenamento.test.ts` (A, +109/-0) — D1 arquivo de teste ou apoio que só acrescenta caso
- `tests/conhecimento-estilos.test.ts` (A, +69/-0) — D1 arquivo de teste ou apoio que só acrescenta caso
- `tests/conhecimento-logica.test.ts` (A, +106/-0) — D1 arquivo de teste ou apoio que só acrescenta caso
- `tests/conhecimento-paginas.test.tsx` (A, +132/-0) — D1 arquivo de teste ou apoio que só acrescenta caso
- `tests/dependencias-extracao.test.ts` (A, +24/-0) — D1 arquivo de teste ou apoio que só acrescenta caso
- `tests/estado-dos-envios.test.ts` (A, +99/-0) — D1 arquivo de teste ou apoio que só acrescenta caso
- `tests/extracao-conteudo.test.ts` (A, +84/-0) — D1 arquivo de teste ou apoio que só acrescenta caso
- `tests/extracao-docx.test.ts` (A, +66/-0) — D1 arquivo de teste ou apoio que só acrescenta caso
- `tests/extracao-formatos.test.ts` (A, +98/-0) — D1 arquivo de teste ou apoio que só acrescenta caso
- `tests/extracao-html.test.ts` (A, +63/-0) — D1 arquivo de teste ou apoio que só acrescenta caso
- `tests/extracao-pdf.test.ts` (A, +80/-0) — D1 arquivo de teste ou apoio que só acrescenta caso
- `tests/extracao-planilha-json.test.ts` (A, +80/-0) — D1 arquivo de teste ou apoio que só acrescenta caso
- `tests/extracao-texto.test.ts` (A, +50/-0) — D1 arquivo de teste ou apoio que só acrescenta caso
- `tests/extracao-zip.test.ts` (A, +90/-0) — D1 arquivo de teste ou apoio que só acrescenta caso
- `tests/extracao.test.ts` (A, +107/-0) — D1 arquivo de teste ou apoio que só acrescenta caso
- `tests/fixtures-fontes.test.ts` (A, +70/-0) — D1 arquivo de teste ou apoio que só acrescenta caso
- `tests/fixtures/escaneado.pdf` (A, +32/-0) — D3 fixture gerada por código (tests/apoio/gerar-fixtures.ts) e conferida por tests/fixtures-fontes.test.ts
- `tests/fixtures/exemplo.csv` (A, +4/-0) — D3 fixture gerada por código (tests/apoio/gerar-fixtures.ts) e conferida por tests/fixtures-fontes.test.ts
- `tests/fixtures/exemplo.docx` (A, +-/--) — D3 fixture gerada por código (tests/apoio/gerar-fixtures.ts) e conferida por tests/fixtures-fontes.test.ts
- `tests/fixtures/exemplo.html` (A, +19/-0) — D3 fixture gerada por código (tests/apoio/gerar-fixtures.ts) e conferida por tests/fixtures-fontes.test.ts
- `tests/fixtures/exemplo.json` (A, +17/-0) — D3 fixture gerada por código (tests/apoio/gerar-fixtures.ts) e conferida por tests/fixtures-fontes.test.ts
- `tests/fixtures/exemplo.md` (A, +8/-0) — D3 fixture gerada por código (tests/apoio/gerar-fixtures.ts) e conferida por tests/fixtures-fontes.test.ts
- `tests/fixtures/exemplo.pdf` (A, +32/-0) — D3 fixture gerada por código (tests/apoio/gerar-fixtures.ts) e conferida por tests/fixtures-fontes.test.ts
- `tests/fixtures/exemplo.srt` (A, +11/-0) — D3 fixture gerada por código (tests/apoio/gerar-fixtures.ts) e conferida por tests/fixtures-fontes.test.ts
- `tests/fixtures/exemplo.txt` (A, +7/-0) — D3 fixture gerada por código (tests/apoio/gerar-fixtures.ts) e conferida por tests/fixtures-fontes.test.ts
- `tests/fixtures/exemplo.vtt` (A, +13/-0) — D3 fixture gerada por código (tests/apoio/gerar-fixtures.ts) e conferida por tests/fixtures-fontes.test.ts
- `tests/fontes-arquivos.test.ts` (A, +130/-0) — D1 arquivo de teste ou apoio que só acrescenta caso
- `tests/fontes-ciclo.test.ts` (A, +105/-0) — D1 arquivo de teste ou apoio que só acrescenta caso
- `tests/fontes-fila-execucao.test.ts` (A, +170/-0) — D1 arquivo de teste ou apoio que só acrescenta caso
- `tests/fontes-fila.test.ts` (A, +129/-0) — D1 arquivo de teste ou apoio que só acrescenta caso
- `tests/fontes-modelo.test.ts` (A, +110/-0) — D1 arquivo de teste ou apoio que só acrescenta caso
- `tests/fontes-rota-ciclo.test.ts` (A, +103/-0) — D1 arquivo de teste ou apoio que só acrescenta caso
- `tests/fontes-rota-formatos.test.ts` (A, +119/-0) — D1 arquivo de teste ou apoio que só acrescenta caso
- `tests/fontes-rota-upload.test.ts` (A, +165/-0) — D1 arquivo de teste ou apoio que só acrescenta caso
- `tests/fontes-rota.test.ts` (A, +129/-0) — D1 arquivo de teste ou apoio que só acrescenta caso
- `tests/fontes.test.ts` (A, +179/-0) — D1 arquivo de teste ou apoio que só acrescenta caso
- `tests/instrumentacao.test.ts` (A, +103/-0) — D1 arquivo de teste ou apoio que só acrescenta caso
- `tests/painel-de-conhecimento.test.tsx` (A, +136/-0) — D1 arquivo de teste ou apoio que só acrescenta caso
- `tests/projeto.test.ts` (M, +18/-0) — D1 arquivo de teste ou apoio que só acrescenta caso
- `tests/seed.test.ts` (M, +79/-0) — D1 arquivo de teste ou apoio que só acrescenta caso
- `tests/trechos.test.ts` (A, +145/-0) — D1 arquivo de teste ou apoio que só acrescenta caso

### Fontes consultadas

- `docs/conhecimento-arquivos-e-texto/sprint-0*/tasks.md`: que task tocou cada arquivo e os testes que o cobrem
- `docs/stack/CONVENCOES.md`: arquivos gerados (o lockfile) e camadas
- memox (`.claude/skills/memox/assets/memox.py`): histórico dos 21 arquivos já existentes, sem regressão nem reprovação em QA

### Fontes ausentes

- `docs/legado/PERFIL.md`, raio de impacto, caracterização e plano de reversão da legadox: não existem (projeto sem legado); zonas de risco e efeito irreversível declarado não foram avaliados por essas fontes
- relatório de cobertura: o repositório não tem ferramenta de cobertura (lacuna 2 em `docs/stack/LACUNAS.md`); a cobertura citada vem dos testes nomeados por task
