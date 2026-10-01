---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: conhecimento-em-video
origem_buildx: plataforma-chatbot-ia
feature_id: FT-08
sprint_id: sprint-06
atualizado_em: 2026-10-01
tasks:
  - id: T-06.01
    titulo: "Logica pura e envio do video"
    fase: F-06.1
    status: concluida
    objetivo: "Criar video-logica.ts (validacao de arquivo e URL no navegador, duracao, texto de etapa, aviso de creditos) e enviar-video.ts (XMLHttpRequest com corpo bruto), o icone de video e a opcao Video."
    arquivos:
      cria: ["src/componentes/video-logica.ts", "src/componentes/enviar-video.ts", "tests/video-logica.test.ts", "docs/conhecimento-em-video/sprint-06/sprint.md", "docs/conhecimento-em-video/sprint-06/fases.md", "docs/conhecimento-em-video/sprint-06/tasks.md"]
      altera: ["src/componentes/opcoes-de-fonte.ts", "src/componentes/itens-de-menu.ts", "src/componentes/Icones.tsx", "src/lib/youtube-url.ts", "src/lib/youtube.ts"]
    teste_integracao: "A lista de opcoes tem Video depois de Texto com o icone novo e a interpretacao da resposta do envio traduz 202, 413, 415 e 422 em mensagens."
    teste_funcional: "Um arquivo txt acima do limite ou vazio e recusado no navegador com motivo, uma URL do YouTube valida e aceita e uma de outro host recusada, 3725 segundos viram 1h 02min e a etapa Transcrevendo parte 2 de 5 vira o texto com percentual."
    criterio_aceite: "tests/video-logica.test.ts e tests/opcoes-de-fonte.test.ts passam."
    depende_de: ["T-03.04", "T-05.05"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-06.02
    titulo: "Painel de video com duas abas"
    fase: F-06.1
    status: concluida
    objetivo: "Criar o painel Video com as abas Enviar arquivo (zona de soltar, barra de progresso, aviso de creditos) e Link do YouTube, ligar em AdicionarFontes e passar os limites e o modelo pela pagina."
    arquivos:
      cria: ["src/componentes/PainelDeVideo.tsx", "src/componentes/ZonaDeVideo.tsx", "src/componentes/FormularioDoYoutube.tsx", "tests/painel-de-video.test.tsx"]
      altera: ["src/componentes/AdicionarFontes.tsx", "src/componentes/PainelDeConhecimento.tsx", "src/app/(sistema)/agentes/[id]/conhecimento/page.tsx", "src/estilos/global.css", "tests/adicionar-fontes.test.tsx", "tests/painel-de-conhecimento.test.tsx", "tests/conhecimento-estilos.test.ts"]
    teste_integracao: "A renderizacao do painel mostra as duas abas acessiveis, os tipos aceitos, o limite em MB e minutos, o aviso de creditos com o nome do modelo e a barra de progresso com valor."
    teste_funcional: "A aba Link do YouTube mostra a nota de legendas e o erro de URL invalida, a aba de arquivo lista o arquivo recusado com motivo e nenhum valor de cor literal entra no CSS novo."
    criterio_aceite: "tests/painel-de-video.test.tsx, tests/tokens.test.ts e tests/componentes.test.tsx passam."
    depende_de: ["T-06.01"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-06.03
    titulo: "Lista e Ver conteudo do video"
    fase: F-06.2
    status: pendente
    objetivo: "Mostrar na LinhaDeFonte o icone de video, a barra de progresso com etapa, a duracao e o link de origem do YouTube, e a duracao em Ver conteudo."
    arquivos:
      cria: []
      altera: ["src/componentes/LinhaDeFonte.tsx", "src/componentes/ListaDeTrechos.tsx", "src/componentes/conhecimento-logica.ts", "src/componentes/fonte-da-tela.ts", "src/estilos/global.css", "tests/linha-de-fonte-video.test.tsx"]
    teste_integracao: "A renderizacao de uma fonte video processando mostra a barra com valor, a etapa e a duracao e a de uma fonte youtube pronta mostra o link de origem com rel noopener noreferrer."
    teste_funcional: "Uma fonte em erro mostra o motivo com Reprocessar e Excluir, uma urlOrigem que nao e http ou https de host do YouTube nao vira link e Ver conteudo exibe os trechos com [00:00] e a duracao."
    criterio_aceite: "tests/linha-de-fonte-video.test.tsx e tests/conhecimento-logica.test.ts passam."
    depende_de: ["T-06.02"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-06.04
    titulo: "Modelo de transcricao nas Integracoes"
    fase: F-06.2
    status: pendente
    objetivo: "Criar o painel Modelo de transcricao em Configuracoes e Integracoes (admin), com padrao visivel, salvar e restaurar o padrao por acao de servidor."
    arquivos:
      cria: ["src/componentes/PainelDoModeloDeTranscricao.tsx", "tests/painel-modelo-transcricao.test.tsx"]
      altera: ["src/app/acoes.ts", "src/app/(sistema)/configuracoes/integracoes/page.tsx"]
    teste_integracao: "Contra o banco de teste a acao salva o modelo informado pelo admin, a pagina mostra o modelo efetivo e o padrao e a acao de usuario comum e recusada."
    teste_funcional: "Salvar vazio restaura o padrao, modelo com espaco mostra erro de validacao em portugues e a renderizacao do painel mostra o aviso de que a transcricao consome creditos."
    criterio_aceite: "tests/painel-modelo-transcricao.test.tsx e tests/acoes.test.ts passam."
    depende_de: ["T-06.03", "T-04.02"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 06

> Um bloco por task. Convenção de suíte: `suite: verde` só quando a suíte inteira rodou na task; subconjunto é `parcial`, com o subconjunto declarado na linha da task.

---

```yaml
id: T-06.01
titulo: "Logica pura e envio do video"
objetivo: "Criar video-logica.ts (validacao de arquivo e URL no navegador, duracao, texto de etapa, aviso de creditos) e enviar-video.ts (XMLHttpRequest com corpo bruto), o icone de video e a opcao Video."
arquivos:
  cria: ["src/componentes/video-logica.ts", "src/componentes/enviar-video.ts", "tests/video-logica.test.ts", "docs/conhecimento-em-video/sprint-06/sprint.md", "docs/conhecimento-em-video/sprint-06/fases.md", "docs/conhecimento-em-video/sprint-06/tasks.md"]
  altera: ["src/componentes/opcoes-de-fonte.ts", "src/componentes/itens-de-menu.ts", "src/componentes/Icones.tsx", "src/lib/youtube-url.ts", "src/lib/youtube.ts"]
teste_integracao: "A lista de opcoes tem Video depois de Texto com o icone novo e a interpretacao da resposta do envio traduz 202, 413, 415 e 422 em mensagens."
teste_funcional: "Um arquivo txt acima do limite ou vazio e recusado no navegador com motivo, uma URL do YouTube valida e aceita e uma de outro host recusada, 3725 segundos viram 1h 02min e a etapa Transcrevendo parte 2 de 5 vira o texto com percentual."
criterio_aceite: "tests/video-logica.test.ts e tests/opcoes-de-fonte.test.ts passam."
depende_de: ["T-03.04", "T-05.05"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/video-logica.test.ts, tests/adicionar-fontes.test.tsx, tests/menu.test.ts, tests/componentes.test.tsx e tests/youtube-url.test.ts, 100+ passed
```

---

```yaml
id: T-06.02
titulo: "Painel de video com duas abas"
objetivo: "Criar o painel Video com as abas Enviar arquivo (zona de soltar, barra de progresso, aviso de creditos) e Link do YouTube, ligar em AdicionarFontes e passar os limites e o modelo pela pagina."
arquivos:
  cria: ["src/componentes/PainelDeVideo.tsx", "src/componentes/ZonaDeVideo.tsx", "src/componentes/FormularioDoYoutube.tsx", "tests/painel-de-video.test.tsx"]
  altera: ["src/componentes/AdicionarFontes.tsx", "src/componentes/PainelDeConhecimento.tsx", "src/app/(sistema)/agentes/[id]/conhecimento/page.tsx", "src/estilos/global.css", "tests/adicionar-fontes.test.tsx", "tests/painel-de-conhecimento.test.tsx", "tests/conhecimento-estilos.test.ts"]
teste_integracao: "A renderizacao do painel mostra as duas abas acessiveis, os tipos aceitos, o limite em MB e minutos, o aviso de creditos com o nome do modelo e a barra de progresso com valor."
teste_funcional: "A aba Link do YouTube mostra a nota de legendas e o erro de URL invalida, a aba de arquivo lista o arquivo recusado com motivo e nenhum valor de cor literal entra no CSS novo."
criterio_aceite: "tests/painel-de-video.test.tsx, tests/tokens.test.ts e tests/componentes.test.tsx passam."
depende_de: ["T-06.01"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/painel-de-video.test.tsx, tests/adicionar-fontes.test.tsx, tests/painel-de-conhecimento.test.tsx, tests/conhecimento-estilos.test.ts, tests/tokens.test.ts, tests/componentes.test.tsx e tests/conhecimento-paginas.test.tsx, 105 passed
```

---

```yaml
id: T-06.03
titulo: "Lista e Ver conteudo do video"
objetivo: "Mostrar na LinhaDeFonte o icone de video, a barra de progresso com etapa, a duracao e o link de origem do YouTube, e a duracao em Ver conteudo."
arquivos:
  cria: []
  altera: ["src/componentes/LinhaDeFonte.tsx", "src/componentes/ListaDeTrechos.tsx", "src/componentes/conhecimento-logica.ts", "src/componentes/fonte-da-tela.ts", "src/estilos/global.css", "tests/linha-de-fonte-video.test.tsx"]
teste_integracao: "A renderizacao de uma fonte video processando mostra a barra com valor, a etapa e a duracao e a de uma fonte youtube pronta mostra o link de origem com rel noopener noreferrer."
teste_funcional: "Uma fonte em erro mostra o motivo com Reprocessar e Excluir, uma urlOrigem que nao e http ou https de host do YouTube nao vira link e Ver conteudo exibe os trechos com [00:00] e a duracao."
criterio_aceite: "tests/linha-de-fonte-video.test.tsx e tests/conhecimento-logica.test.ts passam."
depende_de: ["T-06.02"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-06.04
titulo: "Modelo de transcricao nas Integracoes"
objetivo: "Criar o painel Modelo de transcricao em Configuracoes e Integracoes (admin), com padrao visivel, salvar e restaurar o padrao por acao de servidor."
arquivos:
  cria: ["src/componentes/PainelDoModeloDeTranscricao.tsx", "tests/painel-modelo-transcricao.test.tsx"]
  altera: ["src/app/acoes.ts", "src/app/(sistema)/configuracoes/integracoes/page.tsx"]
teste_integracao: "Contra o banco de teste a acao salva o modelo informado pelo admin, a pagina mostra o modelo efetivo e o padrao e a acao de usuario comum e recusada."
teste_funcional: "Salvar vazio restaura o padrao, modelo com espaco mostra erro de validacao em portugues e a renderizacao do painel mostra o aviso de que a transcricao consome creditos."
criterio_aceite: "tests/painel-modelo-transcricao.test.tsx e tests/acoes.test.ts passam."
depende_de: ["T-06.03", "T-04.02"]
paralelizavel: false
status: pendente
```

---

