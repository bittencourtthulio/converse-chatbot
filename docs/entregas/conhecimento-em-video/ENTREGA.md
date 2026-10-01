---
expx_schema: 1
expx_tool: sprintx
kind: entrega
trabalho_id: conhecimento-em-video
origem_buildx: plataforma-chatbot-ia
feature_id: FT-08
entregue_por: mergex
titulo: Base de conhecimento - video
tipo_trabalho: feature
tipo_ocorrencia: null
estado: entregue
versionado: true
branch: feat/conhecimento-em-video
branch_base: feat/canal-telegram
commits:
  - task: T-01.01
    commit: 54e90f9
  - task: T-01.02
    commit: 17a90b1
  - task: T-01.03
    commit: 705b089
  - task: T-01.04
    commit: 3c6ddb9
  - task: T-01.05
    commit: 4f91ef1
  - task: T-02.01
    commit: cc3ac5a
  - task: T-02.02
    commit: ed4101c
  - task: T-02.03
    commit: c04d8a8
  - task: T-02.04
    commit: 685ad6b
  - task: T-03.01
    commit: e06d9b0
  - task: T-03.02
    commit: 38542e5
  - task: T-03.03
    commit: 57124f7
  - task: T-03.04
    commit: c2a1b5f
  - task: T-04.01
    commit: 88fa65b
  - task: T-04.02
    commit: 697ee5f
  - task: T-04.03
    commit: c6a6cee
  - task: T-04.04
    commit: ba23f1f
  - task: T-04.05
    commit: cb99daf
  - task: T-05.01
    commit: bb64baf
  - task: T-05.02
    commit: 0c0a2a5
  - task: T-05.03
    commit: 8c4986c
  - task: T-05.04
    commit: ebede37
  - task: T-05.05
    commit: 90e22c6
  - task: T-05.06
    commit: 51d1eac
  - task: T-06.01
    commit: 89be027
  - task: T-06.02
    commit: cd02ac3
  - task: T-06.03
    commit: 62462a0
  - task: T-06.04
    commit: 59f3b98
  - task: T-07.01
    commit: 40f4411
  - task: T-07.02
    commit: 4910ef5
  - task: T-07.03
    commit: 21f99bd
modulo_afetado: [apresentacao, aplicacao, infraestrutura, banco, testes, documentacao]
arquivos_alterados: [".env.example", ".github/workflows/ci.yml", "README.md", "docs/conhecimento-em-video/00-AUDITORIA.md", "docs/conhecimento-em-video/00-BLOQUEIOS.md", "docs/conhecimento-em-video/00-DECISOES.md", "docs/conhecimento-em-video/BRIEFING-BUILDX.md", "docs/conhecimento-em-video/FECHAMENTO.md", "docs/conhecimento-em-video/ORQUESTRADOR.md", "docs/conhecimento-em-video/RELATORIO-FEATURE.md", "docs/conhecimento-em-video/VERIFICACAO-VISUAL.md", "docs/conhecimento-em-video/base/00-INDICE.md", "docs/conhecimento-em-video/base/00-LACUNAS.md", "docs/conhecimento-em-video/base/dados-ambiente-e-integracoes.md", "docs/conhecimento-em-video/base/fila-fontes-e-armazenamento.md", "docs/conhecimento-em-video/base/midia-ffmpeg.md", "docs/conhecimento-em-video/base/openrouter-audio.md", "docs/conhecimento-em-video/base/upload-testes-e-ci.md", "docs/conhecimento-em-video/base/youtube-legendas.md", "docs/conhecimento-em-video/sprint-01/fases.md", "docs/conhecimento-em-video/sprint-01/sprint.md", "docs/conhecimento-em-video/sprint-01/tasks.md", "docs/conhecimento-em-video/sprint-02/fases.md", "docs/conhecimento-em-video/sprint-02/sprint.md", "docs/conhecimento-em-video/sprint-02/tasks.md", "docs/conhecimento-em-video/sprint-03/fases.md", "docs/conhecimento-em-video/sprint-03/sprint.md", "docs/conhecimento-em-video/sprint-03/tasks.md", "docs/conhecimento-em-video/sprint-04/fases.md", "docs/conhecimento-em-video/sprint-04/sprint.md", "docs/conhecimento-em-video/sprint-04/tasks.md", "docs/conhecimento-em-video/sprint-05/fases.md", "docs/conhecimento-em-video/sprint-05/sprint.md", "docs/conhecimento-em-video/sprint-05/tasks.md", "docs/conhecimento-em-video/sprint-06/fases.md", "docs/conhecimento-em-video/sprint-06/sprint.md", "docs/conhecimento-em-video/sprint-06/tasks.md", "docs/conhecimento-em-video/sprint-07/fases.md", "docs/conhecimento-em-video/sprint-07/sprint.md", "docs/conhecimento-em-video/sprint-07/tasks.md", "docs/entregas/conhecimento-em-video/ATENCAO.md", "docs/entregas/conhecimento-em-video/ENTREGA.md", "docs/entregas/conhecimento-em-video/PR.md", "docs/entregas/conhecimento-em-video/QA-PACOTE.md", "docs/projeto/MAPA.md", "docs/projeto/PREMISSAS.md", "docs/projeto/PROJETO.md", "docs/projeto/RECURSAO.md", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "prisma/migrations/20261001000000_conhecimento_em_video/migration.sql", "prisma/schema.prisma", "src/app/(sistema)/agentes/[id]/conhecimento/page.tsx", "src/app/(sistema)/configuracoes/integracoes/page.tsx", "src/app/acoes.ts", "src/app/api/agentes/[id]/fontes/video/route.ts", "src/app/api/agentes/[id]/fontes/youtube/route.ts", "src/componentes/AdicionarFontes.tsx", "src/componentes/FormularioDoYoutube.tsx", "src/componentes/Icones.tsx", "src/componentes/LinhaDeFonte.tsx", "src/componentes/ListaDeTrechos.tsx", "src/componentes/PainelDeConhecimento.tsx", "src/componentes/PainelDeVideo.tsx", "src/componentes/PainelDoModeloDeTranscricao.tsx", "src/componentes/ZonaDeVideo.tsx", "src/componentes/conhecimento-logica.ts", "src/componentes/enviar-video.ts", "src/componentes/itens-de-menu.ts", "src/componentes/opcoes-de-fonte.ts", "src/componentes/video-logica.ts", "src/estilos/global.css", "src/lib/ambiente.ts", "src/lib/armazenamento.ts", "src/lib/midia-formatos.ts", "src/lib/midia.ts", "src/lib/openrouter.ts", "src/lib/youtube-url.ts", "src/lib/youtube.ts", "src/servicos/fontes-fila.ts", "src/servicos/fontes.ts", "src/servicos/integracoes.ts", "src/servicos/transcricao-de-midia.ts", "src/servicos/transcricao-marcadores.ts", "tests/adicionar-fontes.test.tsx", "tests/ambiente.test.ts", "tests/apoio-ffmpeg.test.ts", "tests/apoio/ffmpeg.ts", "tests/apoio/openrouter-falso.ts", "tests/apoio/servir-falso.ts", "tests/apoio/servir-youtube-falso.ts", "tests/apoio/youtube-falso.ts", "tests/armazenamento-segmentos.test.ts", "tests/armazenamento-stream.test.ts", "tests/conhecimento-estilos.test.ts", "tests/conhecimento-logica.test.ts", "tests/conhecimento-paginas.test.tsx", "tests/fontes-fila-video.test.ts", "tests/fontes-fila-youtube.test.ts", "tests/fontes-fila.test.ts", "tests/fontes-video-fim-a-fim.test.ts", "tests/fontes-video.test.ts", "tests/fontes-youtube.test.ts", "tests/integracoes-transcricao.test.ts", "tests/linha-de-fonte-video.test.tsx", "tests/midia-extracao.test.ts", "tests/midia-formatos.test.ts", "tests/midia-sonda.test.ts", "tests/openrouter-falso-audio.test.ts", "tests/openrouter-transcricao.test.ts", "tests/painel-de-conhecimento.test.tsx", "tests/painel-de-video.test.tsx", "tests/painel-modelo-transcricao.test.tsx", "tests/projeto.test.ts", "tests/transcricao-de-midia.test.ts", "tests/transcricao-marcadores.test.ts", "tests/video-logica.test.ts", "tests/video-modelo.test.ts", "tests/video-rota.test.ts", "tests/youtube-falso.test.ts", "tests/youtube-legenda.test.ts", "tests/youtube-pagina.test.ts", "tests/youtube-rota.test.ts", "tests/youtube-url.test.ts"]
faixa_atencao:
  - arquivo: ".github/workflows/ci.yml"
    faixa: alta
  - arquivo: "prisma/migrations/20261001000000_conhecimento_em_video/migration.sql"
    faixa: alta
  - arquivo: "prisma/schema.prisma"
    faixa: alta
  - arquivo: "src/app/acoes.ts"
    faixa: alta
  - arquivo: "src/app/api/agentes/[id]/fontes/video/route.ts"
    faixa: alta
  - arquivo: "src/app/api/agentes/[id]/fontes/youtube/route.ts"
    faixa: alta
  - arquivo: "src/componentes/FormularioDoYoutube.tsx"
    faixa: alta
  - arquivo: "src/componentes/ZonaDeVideo.tsx"
    faixa: alta
  - arquivo: "src/componentes/enviar-video.ts"
    faixa: alta
  - arquivo: "src/lib/ambiente.ts"
    faixa: alta
  - arquivo: "src/lib/armazenamento.ts"
    faixa: alta
  - arquivo: "src/lib/midia-formatos.ts"
    faixa: alta
  - arquivo: "src/lib/midia.ts"
    faixa: alta
  - arquivo: "src/lib/openrouter.ts"
    faixa: alta
  - arquivo: "src/lib/youtube-url.ts"
    faixa: alta
  - arquivo: "src/lib/youtube.ts"
    faixa: alta
  - arquivo: "src/servicos/fontes-fila.ts"
    faixa: alta
  - arquivo: "src/servicos/fontes.ts"
    faixa: alta
  - arquivo: "src/servicos/integracoes.ts"
    faixa: alta
  - arquivo: "src/servicos/transcricao-de-midia.ts"
    faixa: alta
  - arquivo: ".env.example"
    faixa: media
  - arquivo: "README.md"
    faixa: media
  - arquivo: "docs/projeto/MAPA.md"
    faixa: media
  - arquivo: "docs/projeto/PREMISSAS.md"
    faixa: media
  - arquivo: "docs/projeto/PROJETO.md"
    faixa: media
  - arquivo: "docs/projeto/RECURSAO.md"
    faixa: media
  - arquivo: "docs/stack/CONVENCOES.md"
    faixa: media
  - arquivo: "docs/stack/LACUNAS.md"
    faixa: media
  - arquivo: "src/app/(sistema)/agentes/[id]/conhecimento/page.tsx"
    faixa: media
  - arquivo: "src/app/(sistema)/configuracoes/integracoes/page.tsx"
    faixa: media
  - arquivo: "src/componentes/AdicionarFontes.tsx"
    faixa: media
  - arquivo: "src/componentes/Icones.tsx"
    faixa: media
  - arquivo: "src/componentes/LinhaDeFonte.tsx"
    faixa: media
  - arquivo: "src/componentes/ListaDeTrechos.tsx"
    faixa: media
  - arquivo: "src/componentes/PainelDeConhecimento.tsx"
    faixa: media
  - arquivo: "src/componentes/PainelDeVideo.tsx"
    faixa: media
  - arquivo: "src/componentes/PainelDoModeloDeTranscricao.tsx"
    faixa: media
  - arquivo: "src/componentes/conhecimento-logica.ts"
    faixa: media
  - arquivo: "src/componentes/itens-de-menu.ts"
    faixa: media
  - arquivo: "src/componentes/opcoes-de-fonte.ts"
    faixa: media
  - arquivo: "src/componentes/video-logica.ts"
    faixa: media
  - arquivo: "src/estilos/global.css"
    faixa: media
  - arquivo: "src/servicos/transcricao-marcadores.ts"
    faixa: media
  - arquivo: "tests/apoio/ffmpeg.ts"
    faixa: media
  - arquivo: "tests/apoio/openrouter-falso.ts"
    faixa: media
  - arquivo: "tests/apoio/servir-falso.ts"
    faixa: media
  - arquivo: "tests/apoio/servir-youtube-falso.ts"
    faixa: media
  - arquivo: "tests/apoio/youtube-falso.ts"
    faixa: media
  - arquivo: "tests/conhecimento-logica.test.ts"
    faixa: media
  - arquivo: "tests/projeto.test.ts"
    faixa: media
  - arquivo: "docs/conhecimento-em-video/00-AUDITORIA.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-em-video/00-BLOQUEIOS.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-em-video/00-DECISOES.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-em-video/BRIEFING-BUILDX.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-em-video/FECHAMENTO.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-em-video/ORQUESTRADOR.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-em-video/RELATORIO-FEATURE.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-em-video/VERIFICACAO-VISUAL.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-em-video/base/00-INDICE.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-em-video/base/00-LACUNAS.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-em-video/base/dados-ambiente-e-integracoes.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-em-video/base/fila-fontes-e-armazenamento.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-em-video/base/midia-ffmpeg.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-em-video/base/openrouter-audio.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-em-video/base/upload-testes-e-ci.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-em-video/base/youtube-legendas.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-em-video/sprint-01/fases.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-em-video/sprint-01/sprint.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-em-video/sprint-01/tasks.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-em-video/sprint-02/fases.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-em-video/sprint-02/sprint.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-em-video/sprint-02/tasks.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-em-video/sprint-03/fases.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-em-video/sprint-03/sprint.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-em-video/sprint-03/tasks.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-em-video/sprint-04/fases.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-em-video/sprint-04/sprint.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-em-video/sprint-04/tasks.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-em-video/sprint-05/fases.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-em-video/sprint-05/sprint.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-em-video/sprint-05/tasks.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-em-video/sprint-06/fases.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-em-video/sprint-06/sprint.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-em-video/sprint-06/tasks.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-em-video/sprint-07/fases.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-em-video/sprint-07/sprint.md"
    faixa: baixa
  - arquivo: "docs/conhecimento-em-video/sprint-07/tasks.md"
    faixa: baixa
  - arquivo: "docs/entregas/conhecimento-em-video/ATENCAO.md"
    faixa: baixa
  - arquivo: "docs/entregas/conhecimento-em-video/ENTREGA.md"
    faixa: baixa
  - arquivo: "docs/entregas/conhecimento-em-video/PR.md"
    faixa: baixa
  - arquivo: "docs/entregas/conhecimento-em-video/QA-PACOTE.md"
    faixa: baixa
  - arquivo: "tests/adicionar-fontes.test.tsx"
    faixa: baixa
  - arquivo: "tests/ambiente.test.ts"
    faixa: baixa
  - arquivo: "tests/apoio-ffmpeg.test.ts"
    faixa: baixa
  - arquivo: "tests/armazenamento-segmentos.test.ts"
    faixa: baixa
  - arquivo: "tests/armazenamento-stream.test.ts"
    faixa: baixa
  - arquivo: "tests/conhecimento-estilos.test.ts"
    faixa: baixa
  - arquivo: "tests/conhecimento-paginas.test.tsx"
    faixa: baixa
  - arquivo: "tests/fontes-fila-video.test.ts"
    faixa: baixa
  - arquivo: "tests/fontes-fila-youtube.test.ts"
    faixa: baixa
  - arquivo: "tests/fontes-fila.test.ts"
    faixa: baixa
  - arquivo: "tests/fontes-video-fim-a-fim.test.ts"
    faixa: baixa
  - arquivo: "tests/fontes-video.test.ts"
    faixa: baixa
  - arquivo: "tests/fontes-youtube.test.ts"
    faixa: baixa
  - arquivo: "tests/integracoes-transcricao.test.ts"
    faixa: baixa
  - arquivo: "tests/linha-de-fonte-video.test.tsx"
    faixa: baixa
  - arquivo: "tests/midia-extracao.test.ts"
    faixa: baixa
  - arquivo: "tests/midia-formatos.test.ts"
    faixa: baixa
  - arquivo: "tests/midia-sonda.test.ts"
    faixa: baixa
  - arquivo: "tests/openrouter-falso-audio.test.ts"
    faixa: baixa
  - arquivo: "tests/openrouter-transcricao.test.ts"
    faixa: baixa
  - arquivo: "tests/painel-de-conhecimento.test.tsx"
    faixa: baixa
  - arquivo: "tests/painel-de-video.test.tsx"
    faixa: baixa
  - arquivo: "tests/painel-modelo-transcricao.test.tsx"
    faixa: baixa
  - arquivo: "tests/transcricao-de-midia.test.ts"
    faixa: baixa
  - arquivo: "tests/transcricao-marcadores.test.ts"
    faixa: baixa
  - arquivo: "tests/video-logica.test.ts"
    faixa: baixa
  - arquivo: "tests/video-modelo.test.ts"
    faixa: baixa
  - arquivo: "tests/video-rota.test.ts"
    faixa: baixa
  - arquivo: "tests/youtube-falso.test.ts"
    faixa: baixa
  - arquivo: "tests/youtube-legenda.test.ts"
    faixa: baixa
  - arquivo: "tests/youtube-pagina.test.ts"
    faixa: baixa
  - arquivo: "tests/youtube-rota.test.ts"
    faixa: baixa
  - arquivo: "tests/youtube-url.test.ts"
    faixa: baixa
raio: null
atencao:
  olho_obrigatorio: 20
  leitura_rapida: 30
  dispensavel: 74
portao: pronto
desvios:
  - "T-03.03: src/lib/midia-formatos.ts (mimeDeMidia) alterado depois da T-02.03, e tests/conhecimento-paginas.test.tsx e tests/painel-de-conhecimento.test.tsx ganharam os quatro campos novos de FonteVisivel para o tsc passar"
  - "E5: tests/apoio/servir-falso.ts ganhou a porta de controle (estado e configurar, padrao 4401) para o roteiro de QA fazer uma parte falhar e ver os pedidos recebidos; arquivo ja declarado na T-07.01"
  - "suite: as tasks guardam parcial (subconjunto da task, declarado na linha da task); a suite inteira rodou verde em cada fechamento de sprint (1760, 1810, 1835, 1870, 1937, 1970 e 2010 testes) e no estado final do HEAD, 2010 testes em 151 arquivos; so a T-07.03 guarda verde"
  - "T-07.01: tests/apoio/servir-falso.ts (transcricoes por parte e latencia, para o roteiro de QA) e src/estilos/global.css (a regra .fonte-item da FT-05 passou a valer so em .fontes-lista; achado da verificacao: a lista de fontes da aba Conhecimento aparecia empilhada e centralizada)"
  - "T-06.04: tests/acoes.test.ts nao existe; a acao foi provada em tests/painel-modelo-transcricao.test.tsx (mesmo padrao de tests/telegram-acoes.test.ts) e as acoes existentes seguem cobertas por tests/acoes-de-agente.test.ts, tests/telegram-acoes.test.ts e tests/publicar-acao.test.ts"
  - "T-06.03: tests/conhecimento-logica.test.ts alterado (icone do tipo video e a lista de opcoes com Video); nao havia src/componentes/fonte-da-tela.ts a alterar: os campos novos de FonteVisivel ja atravessam serializarFonte"
  - "T-06.02: tests/adicionar-fontes.test.tsx, tests/painel-de-conhecimento.test.tsx e tests/conhecimento-estilos.test.ts foram alterados (novas props de video, tres abas, novos componentes na lista de classes conferidas); a opcao Video em opcoes-de-fonte.ts entrou nesta task"
  - "T-06.01: nasceu src/lib/youtube-url.ts (parte pura do YouTube, sem ambiente) porque o navegador valida o link ao digitar e src/lib/youtube.ts importa ambiente.ts; youtube.ts reexporta as funcoes. A opcao Video em opcoes-de-fonte.ts passou para a T-06.02 para nao deixar tests/adicionar-fontes.test.tsx vermelho entre as duas tasks"
  - "T-05.06: src/lib/youtube.ts (T-05.01) ganhou tituloProvisorioDoYoutube, movido de fontes.ts para evitar importacao circular, e src/servicos/fontes.ts (T-05.04) passou a importa-lo"
  - "T-05.03: tests/apoio/youtube-falso.ts (T-01.05) ganhou a opcao ignorarFmt para servir XML mesmo com fmt=json3, usada no teste da legenda em XML"
  - "T-04.05: src/servicos/fontes-fila.ts ganhou a opcao segundosPorParte (so teste: partes de 10 segundos) e reprocessar zera etapa e progresso"
  - "T-04.04: tests/fontes-fila.test.ts teve o titulo do caso do tipo video corrigido (o tipo deixou de ser reservado); as citacoes de linha de src/servicos/fontes-fila.ts, src/servicos/integracoes.ts e src/lib/armazenamento.ts em CONVENCOES.md mudaram e sao reconferidas na T-07.02"
  - "T-04.03: src/lib/armazenamento.ts ganhou apagarAudio (apaga só audio/), usado ao fim da transcricao para limpar o audio e manter os segmentos"
push_feito: false
pr_url: null
pr_estado: null
criado_em: 2026-09-30
atualizado_em: 2026-10-01
entregue_em: 2026-10-01
---

# Entrega — Base de conhecimento: vídeo

O usuário sobe um vídeo ou áudio, ou cola um link do YouTube, e a fala vira uma fonte da base que o agente usa. A entrega está na branch `feat/conhecimento-em-video`, empilhada sobre `feat/canal-telegram`; sem remoto configurado, nada foi enviado.

## Onde está o quê

| O quê | Onde |
|---|---|
| Descrição do pull request | [PR.md](PR.md) |
| Pacote de QA | [QA-PACOTE.md](QA-PACOTE.md) |
| Classificação da atenção | [ATENCAO.md](ATENCAO.md) |
| Trabalho de origem | [conhecimento-em-video](../../conhecimento-em-video/) |
| Pull request | não aberto (sem remoto) |

## Estado da entrega

- Portão de prontidão: PRONTO
- Commits: 31, um por task
- Atenção humana: 20 olho obrigatório, 30 leitura rápida, 74 dispensável
- Push: não feito — o repositório não tem remoto configurado (PEND-05); nada foi criado nem enviado
- Pull request: não aberto; a descrição está pronta em `PR.md` e basta abri-lo manualmente depois do push
- Falta para o merge: revisão humana (começando pela faixa OLHO OBRIGATÓRIO) e a execução do pacote de QA

## Avisos

- Base `feat/canal-telegram` (ponta da pilha FT-01 a FT-07), embora a FT-08 dependa funcionalmente só da FT-04 (e da FT-02 para a chave do OpenRouter): empilha na ponta para não haver conflito em arquivos compartilhados (`abas-do-agente`, `ambiente.ts`, `.env.example`, `fontes-fila.ts`, `AdicionarFontes.tsx`, CI).
- Sem modo legado: sem raio, caracterização, plano de reversão nem relatório de cobertura; sem agente `revisor-diff`: a classificação de atenção foi feita pelo executor.
- A migration já aplicada em um banco não é desfeita por reverter o commit (só acrescenta colunas anuláveis).
- A transcrição real e o YouTube real nunca foram chamados (PEND-06); a aba Vídeo foi vista com a largura emulada de 375 px (PEND-07).

## Desvios

- T-03.03: src/lib/midia-formatos.ts (mimeDeMidia) alterado depois da T-02.03, e tests/conhecimento-paginas.test.tsx e tests/painel-de-conhecimento.test.tsx ganharam os quatro campos novos de FonteVisivel para o tsc passar
- T-04.03: src/lib/armazenamento.ts ganhou apagarAudio (apaga só audio/), usado ao fim da transcricao para limpar o audio e manter os segmentos
- T-04.04: tests/fontes-fila.test.ts teve o titulo do caso do tipo video corrigido (o tipo deixou de ser reservado); as citacoes de linha de src/servicos/fontes-fila.ts, src/servicos/integracoes.ts e src/lib/armazenamento.ts em CONVENCOES.md mudaram e sao reconferidas na T-07.02
- T-04.05: src/servicos/fontes-fila.ts ganhou a opcao segundosPorParte (so teste: partes de 10 segundos) e reprocessar zera etapa e progresso
- T-05.03: tests/apoio/youtube-falso.ts (T-01.05) ganhou a opcao ignorarFmt para servir XML mesmo com fmt=json3, usada no teste da legenda em XML
- T-05.06: src/lib/youtube.ts (T-05.01) ganhou tituloProvisorioDoYoutube, movido de fontes.ts para evitar importacao circular, e src/servicos/fontes.ts (T-05.04) passou a importa-lo
- T-06.01: nasceu src/lib/youtube-url.ts (parte pura do YouTube, sem ambiente) porque o navegador valida o link ao digitar e src/lib/youtube.ts importa ambiente.ts; youtube.ts reexporta as funcoes. A opcao Video em opcoes-de-fonte.ts passou para a T-06.02 para nao deixar tests/adicionar-fontes.test.tsx vermelho entre as duas tasks
- T-06.02: tests/adicionar-fontes.test.tsx, tests/painel-de-conhecimento.test.tsx e tests/conhecimento-estilos.test.ts foram alterados (novas props de video, tres abas, novos componentes na lista de classes conferidas); a opcao Video em opcoes-de-fonte.ts entrou nesta task
- T-06.03: tests/conhecimento-logica.test.ts alterado (icone do tipo video e a lista de opcoes com Video); nao havia src/componentes/fonte-da-tela.ts a alterar: os campos novos de FonteVisivel ja atravessam serializarFonte
- T-06.04: tests/acoes.test.ts nao existe; a acao foi provada em tests/painel-modelo-transcricao.test.tsx (mesmo padrao de tests/telegram-acoes.test.ts) e as acoes existentes seguem cobertas por tests/acoes-de-agente.test.ts, tests/telegram-acoes.test.ts e tests/publicar-acao.test.ts
- T-07.01: tests/apoio/servir-falso.ts (transcricoes por parte e latencia, para o roteiro de QA) e src/estilos/global.css (a regra .fonte-item da FT-05 passou a valer so em .fontes-lista; achado da verificacao: a lista de fontes da aba Conhecimento aparecia empilhada e centralizada)
- suite: as tasks guardam parcial (subconjunto da task, declarado na linha da task); a suite inteira rodou verde em cada fechamento de sprint (1760, 1810, 1835, 1870, 1937, 1970 e 2010 testes) e no estado final do HEAD, 2010 testes em 151 arquivos; so a T-07.03 guarda verde
- E5: tests/apoio/servir-falso.ts ganhou a porta de controle (estado e configurar, padrao 4401) para o roteiro de QA fazer uma parte falhar e ver os pedidos recebidos; arquivo ja declarado na T-07.01
