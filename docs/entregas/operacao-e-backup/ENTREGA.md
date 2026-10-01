---
expx_schema: 1
expx_tool: sprintx
kind: entrega
trabalho_id: operacao-e-backup
origem_buildx: plataforma-chatbot-ia
feature_id: FT-11
entregue_por: mergex
titulo: Operação e backup
tipo_trabalho: feature
tipo_ocorrencia: null
estado: entregue
versionado: true
branch: feat/operacao-e-backup
branch_base: feat/privacidade-e-auditoria
commits:
- task: T-01.01
  commit: 613b67f
- task: T-01.02
  commit: 9bb0dfc
- task: T-01.03
  commit: 213ab20
- task: T-02.01
  commit: 899ec15
- task: T-02.02
  commit: 2944e89
- task: T-02.03
  commit: 60f132a
- task: T-02.04
  commit: fba5c86
- task: T-02.05
  commit: 12deb25
- task: T-02.06
  commit: 797d0b5
- task: T-02.07
  commit: 11a331b
- task: T-03.01
  commit: 7a9f0bc
- task: T-03.02
  commit: 4efa9ae
- task: T-03.03
  commit: ed939d1
- task: T-03.04
  commit: bdd5f03
- task: T-04.01
  commit: 18b0c96
- task: T-04.02
  commit: a20f2ad
- task: T-04.03
  commit: 0741afe
- task: T-05.01
  commit: f324ce8
- task: T-05.02
  commit: 5824c8a
- task: T-05.03
  commit: 1b2f23a
- task: T-05.04
  commit: 2251b95
- task: T-05.05
  commit: 5f948b9
- task: T-05.06
  commit: caf7d75
- task: T-05.07
  commit: 30a6e8f
- task: T-06.01
  commit: 0a5f496
- task: T-06.02
  commit: 4799834
- task: T-06.03
  commit: 6e8becc
- task: T-06.04
  commit: 3468e78
- task: T-06.05
  commit: 67609a3
- task: T-07.01
  commit: 5dca787
- task: T-07.02
  commit: 2cd5e11
- task: T-07.03
  commit: 8c251ab
- task: T-07.04
  commit: 1c3abf8
- task: T-07.05
  commit: 4f7eddc
- task: T-08.01
  commit: 299e6f2
- task: T-08.02
  commit: 988cd4b
- task: T-08.03
  commit: 8c1682a
- task: T-08.04
  commit: 6f2072d
modulo_afetado: [apresentacao, aplicacao, infraestrutura, testes, documentacao]
arquivos_alterados: [".dockerignore", ".env.example", ".github/workflows/ci.yml", ".gitignore", "Dockerfile", "README.md", "docker-compose.yml", "docker-entrypoint.sh", "docs/entregas/operacao-e-backup/ATENCAO.md", "docs/entregas/operacao-e-backup/ENTREGA.md", "docs/entregas/operacao-e-backup/PR.md", "docs/entregas/operacao-e-backup/QA-PACOTE.md", "docs/operacao-e-backup/00-AUDITORIA.md", "docs/operacao-e-backup/00-BLOQUEIOS.md", "docs/operacao-e-backup/00-DECISOES.md", "docs/operacao-e-backup/BRIEFING-BUILDX.md", "docs/operacao-e-backup/FECHAMENTO.md", "docs/operacao-e-backup/ORQUESTRADOR.md", "docs/operacao-e-backup/RELATORIO-FEATURE.md", "docs/operacao-e-backup/VERIFICACAO-CONTEINER.md", "docs/operacao-e-backup/VERIFICACAO-VISUAL.md", "docs/operacao-e-backup/base/00-INDICE.md", "docs/operacao-e-backup/base/00-LACUNAS.md", "docs/operacao-e-backup/base/ambiente-e-start.md", "docs/operacao-e-backup/base/banco-e-armazenamento.md", "docs/operacao-e-backup/base/conteiner-e-ferramentas.md", "docs/operacao-e-backup/base/log-e-erros.md", "docs/operacao-e-backup/base/segundo-plano-e-auditoria.md", "docs/operacao-e-backup/base/telas-menu-e-guardas.md", "docs/operacao-e-backup/base/testes-ci-e-docs.md", "docs/operacao-e-backup/sprint-01/fases.md", "docs/operacao-e-backup/sprint-01/sprint.md", "docs/operacao-e-backup/sprint-01/tasks.md", "docs/operacao-e-backup/sprint-02/fases.md", "docs/operacao-e-backup/sprint-02/sprint.md", "docs/operacao-e-backup/sprint-02/tasks.md", "docs/operacao-e-backup/sprint-03/fases.md", "docs/operacao-e-backup/sprint-03/sprint.md", "docs/operacao-e-backup/sprint-03/tasks.md", "docs/operacao-e-backup/sprint-04/fases.md", "docs/operacao-e-backup/sprint-04/sprint.md", "docs/operacao-e-backup/sprint-04/tasks.md", "docs/operacao-e-backup/sprint-05/fases.md", "docs/operacao-e-backup/sprint-05/sprint.md", "docs/operacao-e-backup/sprint-05/tasks.md", "docs/operacao-e-backup/sprint-06/fases.md", "docs/operacao-e-backup/sprint-06/sprint.md", "docs/operacao-e-backup/sprint-06/tasks.md", "docs/operacao-e-backup/sprint-07/fases.md", "docs/operacao-e-backup/sprint-07/sprint.md", "docs/operacao-e-backup/sprint-07/tasks.md", "docs/operacao-e-backup/sprint-08/fases.md", "docs/operacao-e-backup/sprint-08/sprint.md", "docs/operacao-e-backup/sprint-08/tasks.md", "docs/projeto/MAPA.md", "docs/projeto/PREMISSAS.md", "docs/projeto/PROJETO.md", "docs/projeto/RECURSAO.md", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "eslint.config.mjs", "package-lock.json", "package.json", "scripts/backup.ts", "scripts/criar-admin.ts", "scripts/restore.ts", "src/app/(sistema)/configuracoes/sistema/layout.tsx", "src/app/(sistema)/configuracoes/sistema/loading.tsx", "src/app/(sistema)/configuracoes/sistema/page.tsx", "src/app/(sistema)/error.tsx", "src/app/acoes.ts", "src/app/api/agentes/[id]/conversar/route.ts", "src/app/api/agentes/[id]/fontes/resposta.ts", "src/app/api/backups/[nome]/route.ts", "src/app/api/conversas/resposta.ts", "src/app/api/publico/resposta.ts", "src/app/api/resposta-de-erro.ts", "src/app/api/saude/route.ts", "src/app/correlacao-servidor.ts", "src/app/error.tsx", "src/app/eventos-sse.ts", "src/app/global-error.tsx", "src/app/not-found.tsx", "src/componentes/CodigoDeReferencia.tsx", "src/componentes/GeradorDeBackup.tsx", "src/componentes/Icones.tsx", "src/componentes/ListaDeBackups.tsx", "src/componentes/PaginaDeErro.tsx", "src/componentes/PainelDoSistema.tsx", "src/componentes/auditoria-logica.ts", "src/componentes/itens-de-menu.ts", "src/componentes/sistema-logica.ts", "src/estilos/global.css", "src/instrumentation.ts", "src/lib/ambiente.ts", "src/lib/backup.ts", "src/lib/cripto.ts", "src/lib/log.ts", "src/lib/restauracao.ts", "src/lib/versao.ts", "src/proxy.ts", "src/servicos/agentes.ts", "src/servicos/auditoria-acoes.ts", "src/servicos/auditoria.ts", "src/servicos/backup.ts", "src/servicos/canal-telegram.ts", "src/servicos/chat-erros.ts", "src/servicos/chat.ts", "src/servicos/expurgo.ts", "src/servicos/fontes-fila.ts", "src/servicos/fontes.ts", "src/servicos/historico.ts", "src/servicos/saude.ts", "src/servicos/sistema.ts", "src/servicos/telegram-webhook.ts", "src/servicos/transcricao-de-midia.ts", "src/servicos/usuarios.ts", "tests/agentes.test.ts", "tests/ambiente-start.test.ts", "tests/ambiente-validar.test.ts", "tests/ambiente.test.ts", "tests/apoio/backups-de-teste.ts", "tests/apoio/comando.ts", "tests/apoio/instalacao.ts", "tests/auditoria-acoes.test.ts", "tests/auditoria-logica.test.ts", "tests/auditoria.test.ts", "tests/backup-acao.test.ts", "tests/backup-comando.test.ts", "tests/backup-lib.test.ts", "tests/backup-retencao.test.ts", "tests/backup-servico.test.ts", "tests/backup-ui.test.tsx", "tests/backups-rota.test.ts", "tests/chat-falhas.test.ts", "tests/chat-fontes.test.ts", "tests/conteiner-imagem.test.ts", "tests/conteiner.test.ts", "tests/correlacao.test.ts", "tests/criar-admin.test.ts", "tests/dependencias-operacao.test.ts", "tests/desligamento.test.ts", "tests/erro-inesperado.test.ts", "tests/erro-paginas.test.tsx", "tests/expurgo-agendador.test.ts", "tests/fontes-ciclo.test.ts", "tests/fontes-fila-video.test.ts", "tests/fontes-fila.test.ts", "tests/historico-apagar.test.ts", "tests/instalacao-apoio.test.ts", "tests/instrumentacao.test.ts", "tests/log-arquitetura.test.ts", "tests/log-servicos.test.ts", "tests/log.test.ts", "tests/menu.test.ts", "tests/painel-do-sistema.test.tsx", "tests/pilha-nao-vaza.test.ts", "tests/projeto.test.ts", "tests/restauracao-comando.test.ts", "tests/restauracao-fim-a-fim.test.ts", "tests/restauracao-recusas.test.ts", "tests/restauracao-troca.test.ts", "tests/restauracao-validacao.test.ts", "tests/saude-rota.test.ts", "tests/saude.test.ts", "tests/setup.ts", "tests/sistema-estilos.test.ts", "tests/sistema-logica.test.ts", "tests/sistema-pagina.test.tsx", "tests/sistema.test.ts", "tests/usuarios.test.ts", "tests/versao.test.ts"]
faixa_atencao:
- arquivo: '.dockerignore'
  faixa: alta
- arquivo: '.env.example'
  faixa: media
- arquivo: '.github/workflows/ci.yml'
  faixa: alta
- arquivo: '.gitignore'
  faixa: media
- arquivo: 'Dockerfile'
  faixa: alta
- arquivo: 'README.md'
  faixa: media
- arquivo: 'docker-compose.yml'
  faixa: alta
- arquivo: 'docker-entrypoint.sh'
  faixa: alta
- arquivo: 'docs/entregas/operacao-e-backup/ATENCAO.md'
  faixa: baixa
- arquivo: 'docs/entregas/operacao-e-backup/ENTREGA.md'
  faixa: baixa
- arquivo: 'docs/entregas/operacao-e-backup/PR.md'
  faixa: baixa
- arquivo: 'docs/entregas/operacao-e-backup/QA-PACOTE.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/00-AUDITORIA.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/00-BLOQUEIOS.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/00-DECISOES.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/BRIEFING-BUILDX.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/FECHAMENTO.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/ORQUESTRADOR.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/RELATORIO-FEATURE.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/VERIFICACAO-CONTEINER.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/VERIFICACAO-VISUAL.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/base/00-INDICE.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/base/00-LACUNAS.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/base/ambiente-e-start.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/base/banco-e-armazenamento.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/base/conteiner-e-ferramentas.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/base/log-e-erros.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/base/segundo-plano-e-auditoria.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/base/telas-menu-e-guardas.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/base/testes-ci-e-docs.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/sprint-01/fases.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/sprint-01/sprint.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/sprint-01/tasks.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/sprint-02/fases.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/sprint-02/sprint.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/sprint-02/tasks.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/sprint-03/fases.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/sprint-03/sprint.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/sprint-03/tasks.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/sprint-04/fases.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/sprint-04/sprint.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/sprint-04/tasks.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/sprint-05/fases.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/sprint-05/sprint.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/sprint-05/tasks.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/sprint-06/fases.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/sprint-06/sprint.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/sprint-06/tasks.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/sprint-07/fases.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/sprint-07/sprint.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/sprint-07/tasks.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/sprint-08/fases.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/sprint-08/sprint.md'
  faixa: baixa
- arquivo: 'docs/operacao-e-backup/sprint-08/tasks.md'
  faixa: baixa
- arquivo: 'docs/projeto/MAPA.md'
  faixa: media
- arquivo: 'docs/projeto/PREMISSAS.md'
  faixa: alta
- arquivo: 'docs/projeto/PROJETO.md'
  faixa: media
- arquivo: 'docs/projeto/RECURSAO.md'
  faixa: media
- arquivo: 'docs/stack/CONVENCOES.md'
  faixa: media
- arquivo: 'docs/stack/LACUNAS.md'
  faixa: media
- arquivo: 'eslint.config.mjs'
  faixa: media
- arquivo: 'package-lock.json'
  faixa: baixa
- arquivo: 'package.json'
  faixa: alta
- arquivo: 'scripts/backup.ts'
  faixa: alta
- arquivo: 'scripts/criar-admin.ts'
  faixa: alta
- arquivo: 'scripts/restore.ts'
  faixa: alta
- arquivo: 'src/app/(sistema)/configuracoes/sistema/layout.tsx'
  faixa: alta
- arquivo: 'src/app/(sistema)/configuracoes/sistema/loading.tsx'
  faixa: media
- arquivo: 'src/app/(sistema)/configuracoes/sistema/page.tsx'
  faixa: alta
- arquivo: 'src/app/(sistema)/error.tsx'
  faixa: media
- arquivo: 'src/app/acoes.ts'
  faixa: alta
- arquivo: 'src/app/api/agentes/[id]/conversar/route.ts'
  faixa: alta
- arquivo: 'src/app/api/agentes/[id]/fontes/resposta.ts'
  faixa: alta
- arquivo: 'src/app/api/backups/[nome]/route.ts'
  faixa: alta
- arquivo: 'src/app/api/conversas/resposta.ts'
  faixa: alta
- arquivo: 'src/app/api/publico/resposta.ts'
  faixa: alta
- arquivo: 'src/app/api/resposta-de-erro.ts'
  faixa: alta
- arquivo: 'src/app/api/saude/route.ts'
  faixa: alta
- arquivo: 'src/app/correlacao-servidor.ts'
  faixa: alta
- arquivo: 'src/app/error.tsx'
  faixa: media
- arquivo: 'src/app/eventos-sse.ts'
  faixa: alta
- arquivo: 'src/app/global-error.tsx'
  faixa: media
- arquivo: 'src/app/not-found.tsx'
  faixa: media
- arquivo: 'src/componentes/CodigoDeReferencia.tsx'
  faixa: media
- arquivo: 'src/componentes/GeradorDeBackup.tsx'
  faixa: media
- arquivo: 'src/componentes/Icones.tsx'
  faixa: media
- arquivo: 'src/componentes/ListaDeBackups.tsx'
  faixa: media
- arquivo: 'src/componentes/PaginaDeErro.tsx'
  faixa: media
- arquivo: 'src/componentes/PainelDoSistema.tsx'
  faixa: media
- arquivo: 'src/componentes/auditoria-logica.ts'
  faixa: media
- arquivo: 'src/componentes/itens-de-menu.ts'
  faixa: media
- arquivo: 'src/componentes/sistema-logica.ts'
  faixa: media
- arquivo: 'src/estilos/global.css'
  faixa: media
- arquivo: 'src/instrumentation.ts'
  faixa: alta
- arquivo: 'src/lib/ambiente.ts'
  faixa: alta
- arquivo: 'src/lib/backup.ts'
  faixa: alta
- arquivo: 'src/lib/cripto.ts'
  faixa: alta
- arquivo: 'src/lib/log.ts'
  faixa: alta
- arquivo: 'src/lib/restauracao.ts'
  faixa: alta
- arquivo: 'src/lib/versao.ts'
  faixa: media
- arquivo: 'src/proxy.ts'
  faixa: alta
- arquivo: 'src/servicos/agentes.ts'
  faixa: media
- arquivo: 'src/servicos/auditoria-acoes.ts'
  faixa: alta
- arquivo: 'src/servicos/auditoria.ts'
  faixa: alta
- arquivo: 'src/servicos/backup.ts'
  faixa: alta
- arquivo: 'src/servicos/canal-telegram.ts'
  faixa: media
- arquivo: 'src/servicos/chat-erros.ts'
  faixa: alta
- arquivo: 'src/servicos/chat.ts'
  faixa: media
- arquivo: 'src/servicos/expurgo.ts'
  faixa: alta
- arquivo: 'src/servicos/fontes-fila.ts'
  faixa: alta
- arquivo: 'src/servicos/fontes.ts'
  faixa: media
- arquivo: 'src/servicos/historico.ts'
  faixa: media
- arquivo: 'src/servicos/saude.ts'
  faixa: alta
- arquivo: 'src/servicos/sistema.ts'
  faixa: alta
- arquivo: 'src/servicos/telegram-webhook.ts'
  faixa: media
- arquivo: 'src/servicos/transcricao-de-midia.ts'
  faixa: media
- arquivo: 'src/servicos/usuarios.ts'
  faixa: alta
- arquivo: 'tests/agentes.test.ts'
  faixa: media
- arquivo: 'tests/ambiente-start.test.ts'
  faixa: baixa
- arquivo: 'tests/ambiente-validar.test.ts'
  faixa: baixa
- arquivo: 'tests/ambiente.test.ts'
  faixa: media
- arquivo: 'tests/apoio/backups-de-teste.ts'
  faixa: baixa
- arquivo: 'tests/apoio/comando.ts'
  faixa: baixa
- arquivo: 'tests/apoio/instalacao.ts'
  faixa: baixa
- arquivo: 'tests/auditoria-acoes.test.ts'
  faixa: media
- arquivo: 'tests/auditoria-logica.test.ts'
  faixa: baixa
- arquivo: 'tests/auditoria.test.ts'
  faixa: media
- arquivo: 'tests/backup-acao.test.ts'
  faixa: baixa
- arquivo: 'tests/backup-comando.test.ts'
  faixa: baixa
- arquivo: 'tests/backup-lib.test.ts'
  faixa: baixa
- arquivo: 'tests/backup-retencao.test.ts'
  faixa: baixa
- arquivo: 'tests/backup-servico.test.ts'
  faixa: baixa
- arquivo: 'tests/backup-ui.test.tsx'
  faixa: baixa
- arquivo: 'tests/backups-rota.test.ts'
  faixa: baixa
- arquivo: 'tests/chat-falhas.test.ts'
  faixa: media
- arquivo: 'tests/chat-fontes.test.ts'
  faixa: baixa
- arquivo: 'tests/conteiner-imagem.test.ts'
  faixa: baixa
- arquivo: 'tests/conteiner.test.ts'
  faixa: baixa
- arquivo: 'tests/correlacao.test.ts'
  faixa: baixa
- arquivo: 'tests/criar-admin.test.ts'
  faixa: baixa
- arquivo: 'tests/dependencias-operacao.test.ts'
  faixa: baixa
- arquivo: 'tests/desligamento.test.ts'
  faixa: baixa
- arquivo: 'tests/erro-inesperado.test.ts'
  faixa: baixa
- arquivo: 'tests/erro-paginas.test.tsx'
  faixa: baixa
- arquivo: 'tests/expurgo-agendador.test.ts'
  faixa: media
- arquivo: 'tests/fontes-ciclo.test.ts'
  faixa: media
- arquivo: 'tests/fontes-fila-video.test.ts'
  faixa: media
- arquivo: 'tests/fontes-fila.test.ts'
  faixa: media
- arquivo: 'tests/historico-apagar.test.ts'
  faixa: media
- arquivo: 'tests/instalacao-apoio.test.ts'
  faixa: baixa
- arquivo: 'tests/instrumentacao.test.ts'
  faixa: media
- arquivo: 'tests/log-arquitetura.test.ts'
  faixa: baixa
- arquivo: 'tests/log-servicos.test.ts'
  faixa: baixa
- arquivo: 'tests/log.test.ts'
  faixa: baixa
- arquivo: 'tests/menu.test.ts'
  faixa: media
- arquivo: 'tests/painel-do-sistema.test.tsx'
  faixa: baixa
- arquivo: 'tests/pilha-nao-vaza.test.ts'
  faixa: baixa
- arquivo: 'tests/projeto.test.ts'
  faixa: media
- arquivo: 'tests/restauracao-comando.test.ts'
  faixa: baixa
- arquivo: 'tests/restauracao-fim-a-fim.test.ts'
  faixa: baixa
- arquivo: 'tests/restauracao-recusas.test.ts'
  faixa: baixa
- arquivo: 'tests/restauracao-troca.test.ts'
  faixa: baixa
- arquivo: 'tests/restauracao-validacao.test.ts'
  faixa: baixa
- arquivo: 'tests/saude-rota.test.ts'
  faixa: baixa
- arquivo: 'tests/saude.test.ts'
  faixa: baixa
- arquivo: 'tests/setup.ts'
  faixa: baixa
- arquivo: 'tests/sistema-estilos.test.ts'
  faixa: baixa
- arquivo: 'tests/sistema-logica.test.ts'
  faixa: baixa
- arquivo: 'tests/sistema-pagina.test.tsx'
  faixa: baixa
- arquivo: 'tests/sistema.test.ts'
  faixa: baixa
- arquivo: 'tests/usuarios.test.ts'
  faixa: media
- arquivo: 'tests/versao.test.ts'
  faixa: baixa
raio: null
atencao:
  olho_obrigatorio: 38
  leitura_rapida: 46
  dispensavel: 85
portao: pronto
desvios:
  - "T-01.02: teste e instalação de teste gravados juntos (sem vermelho observado)"
  - "T-01.03: citações de linha de src/lib/ambiente.ts refeitas em tests/projeto.test.ts e docs/stack/CONVENCOES.md"
  - "T-02.01: o proxy truncava o corpo de upload em 10 MB (a suíte inteira achou, tests/video-rota); o matcher de src/proxy.ts passou a excluir api/agentes/[id]/fontes"
  - "T-05.02: link simbólico pendente no storage quebrava o follow do tar; corrigido com um espelho de links por arquivo listado"
  - "T-05.06: o .gitignore ignorava backups/ em qualquer nível e escondia src/app/api/backups; passou a /backups/"
  - "T-06.02: duas restaurações no mesmo segundo colidiam no nome de pre-restauracao; ganhou sufixo numérico. A troca entre volumes (EXDEV) só tem o caminho de cópia, não exercitado"
  - "T-07.01: o desligamento usa NEXT_MANUAL_SIG_HANDLE=1 e register() instala o tratamento de SIGTERM"
  - "T-07.03: prisma e tsx passaram de devDependencies para dependencies, porque a imagem de produção os executa"
  - "T-08.03: global.css estava declarado e não precisou de alteração (a verificação no navegador não achou defeito)"
  - "As tasks de prova e as que só criaram arquivos de teste novos ficaram com suite parcial; a suíte inteira rodou ao fim de cada sprint e no fechamento"
  - "portao V2: 22 tasks guardam suite parcial (subconjunto declarado na linha da task) e 16 guardam verde; a suite inteira rodou verde ao fechar cada sprint e no estado final (2863 testes, 243 arquivos), e o portao tratou V2 como aviso, como nas FT-09 e FT-10"
push_feito: false
pr_url: null
pr_estado: null
criado_em: 2026-10-01
atualizado_em: 2026-10-01
entregue_em: 2026-10-01
---

# Entrega — FT-11 Operação e backup

O operador sobe o sistema por contêiner, vê a saúde em Configurações > Sistema e gera e restaura um backup; a feature está commitada na branch `feat/operacao-e-backup` (empilhada sobre `feat/privacidade-e-auditoria`), sem push nem PR porque não há remoto.

## Onde está o quê

- Descrição do pull request: [PR.md](PR.md)
- Pacote para o QA (14 casos): [QA-PACOTE.md](QA-PACOTE.md)
- Onde gastar atenção (38 olho obrigatório, 46 leitura rápida, 85 dispensável): [ATENCAO.md](ATENCAO.md)
- Trabalho de origem: [docs/operacao-e-backup/](../../operacao-e-backup/) (plano, fechamento, relatório, verificação visual e do contêiner)

## Estado da entrega

- Portão de prontidão: PRONTO (V2 como aviso, ver Desvios; V9 sem arquivo fora da lista declarada; V10 sem segredo, só tokens fictícios de teste).
- Push: não feito. `git remote -v` está vazio (PEND-05).
- Pull request: não aberto. A descrição está em `PR.md`.
- O que falta para o merge: um remoto, o push da branch e a abertura do PR (PEND-05); a execução do QA-PACOTE.md; a decisão da PEND-09 (hospedagem, cópia externa dos backups e guarda da `ENCRYPTION_KEY`).

## Avisos

- Sem modo legado, raio, testes de caracterização nem plano de reversão da legadox: seções de raio, congelado e reversão omitidas.
- Sem `revisor-diff`: a classificação de atenção foi aplicada pelo executor, que escreveu o código.
- Sem `DIVIDA.md`: seção "Fora de escopo" omitida; o que ficou de fora está em `docs/stack/LACUNAS.md` (34 a 42) e na PEND-09.
- Sem relatório de cobertura (lacuna 2).
- Ferramenta de PR e remoto ausentes: PR não aberto.

## Desvios

Os desvios por task estão em `docs/operacao-e-backup/FECHAMENTO.md` e na lista `desvios` do cabeçalho.
