---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: conhecimento-arquivos-e-texto
origem_buildx: plataforma-chatbot-ia
feature_id: FT-04
sprint_id: sprint-06
atualizado_em: 2026-09-30
tasks:
  - id: T-06.01
    titulo: "Aba Conhecimento e icones"
    fase: F-06.1
    status: concluida
    objetivo: "Acrescentar a aba na lista e os icones novos."
    arquivos:
      cria: []
      altera: ["src/componentes/abas-do-agente.ts", "tests/abas-do-agente.test.tsx", "src/componentes/Icones.tsx", "src/componentes/itens-de-menu.ts"]
    teste_integracao: "AbasDoAgente renderizado para um agente lista Configuracoes, Conhecimento e Testar e marca Conhecimento como atual em /agentes/x/conhecimento/y."
    teste_funcional: "hrefDaAba devolve /agentes/<id>/conhecimento e cada icone novo (arquivo, texto, lixeira, upload, relogio, atualizar) renderiza um svg com aria-hidden."
    criterio_aceite: "tests/abas-do-agente.test.tsx passa."
    depende_de: ["T-05.04"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: verde
  - id: T-06.02
    titulo: "Logica pura da tela de conhecimento"
    fase: F-06.2
    status: concluida
    objetivo: "Validar arquivo no navegador, reducer de envios, decisao do polling, formatadores e lista de opcoes."
    arquivos:
      cria: ["src/componentes/conhecimento-logica.ts", "src/componentes/estado-dos-envios.ts", "src/componentes/opcoes-de-fonte.ts", "tests/conhecimento-logica.test.ts", "tests/estado-dos-envios.test.ts"]
      altera: []
    teste_integracao: "Os modulos puros importam as constantes de formatos de src/lib/extracao sem tocar o DOM, validam extensao e tamanho antes de enviar e listam as opcoes arquivos e texto."
    teste_funcional: "O reducer leva um envio de aguardando a enviando com percentual, aceito ou recusado com motivo, deveContinuarPolling e verdadeiro so com fonte pendente ou processando, e formatarTamanho(1536) devolve '1,5 KB'."
    criterio_aceite: "tests/conhecimento-logica.test.ts e tests/estado-dos-envios.test.ts passam."
    depende_de: ["T-03.01"]
    paralelizavel: true
    concluida_em: 2026-09-30
    suite: verde
  - id: T-06.03
    titulo: "Paginas do servidor e leitura de trechos"
    fase: F-06.3
    status: concluida
    objetivo: "Pagina de conhecimento, loading e a pagina Ver conteudo com trechos paginados."
    arquivos:
      cria: ["src/app/(sistema)/agentes/[id]/conhecimento/page.tsx", "src/app/(sistema)/agentes/[id]/conhecimento/loading.tsx", "src/app/(sistema)/agentes/[id]/conhecimento/[fonteId]/page.tsx", "src/app/(sistema)/agentes/[id]/conhecimento/[fonteId]/loading.tsx", "src/componentes/CartoesDeResumo.tsx", "src/componentes/ListaDeTrechos.tsx", "tests/conhecimento-paginas.test.tsx"]
      altera: []
    teste_integracao: "CartoesDeResumo e ListaDeTrechos renderizados com dados do servico mostram fontes, prontas e caracteres, e os trechos como texto puro."
    teste_funcional: "Um trecho contendo <script> aparece escapado como texto, a pagina 2 mostra o link Anterior e o total de paginas, e fonte sem trechos mostra o estado vazio com o motivo do erro."
    criterio_aceite: "tests/conhecimento-paginas.test.tsx passa e nenhum dangerouslySetInnerHTML novo aparece em src/."
    depende_de: ["T-06.01", "T-06.02", "T-04.05"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: verde
  - id: T-06.04
    titulo: "Painel: lista de fontes, status e acoes"
    fase: F-06.3
    status: concluida
    objetivo: "Componente cliente com a lista, badges, polling, excluir com confirmacao e reprocessar."
    arquivos:
      cria: ["src/componentes/PainelDeConhecimento.tsx", "src/componentes/LinhaDeFonte.tsx", "src/componentes/BotaoExcluirFonte.tsx", "tests/painel-de-conhecimento.test.tsx", "src/componentes/fonte-da-tela.ts"]
      altera: ["src/app/(sistema)/agentes/[id]/conhecimento/page.tsx", "tests/chat-de-teste.test.tsx"]
    teste_integracao: "O painel renderizado com fontes em cada status mostra Na fila, Processando com spinner, Pronto e Erro com o motivo, e Reprocessar so na linha em erro."
    teste_funcional: "A maquina de estados da confirmacao passa de inicial a confirmando a inicial sem window.confirm, e o painel vazio mostra o convite para adicionar a primeira fonte."
    criterio_aceite: "tests/painel-de-conhecimento.test.tsx passa."
    depende_de: ["T-06.03"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: verde
  - id: T-06.05
    titulo: "Adicionar: arquivos e texto"
    fase: F-06.4
    status: pendente
    objetivo: "Zona de soltar com varios arquivos, progresso e erro por arquivo, e formulario de texto com contador."
    arquivos:
      cria: ["src/componentes/AdicionarFontes.tsx", "src/componentes/ZonaDeArquivos.tsx", "src/componentes/FormularioDeTexto.tsx", "tests/adicionar-fontes.test.tsx"]
      altera: ["src/componentes/PainelDeConhecimento.tsx"]
    teste_integracao: "AdicionarFontes renderizado mostra as duas opcoes vindas de opcoes-de-fonte, a zona com a lista de formatos e o limite em MB e o formulario com o contador de 0 de 200000."
    teste_funcional: "O formulario recusa titulo vazio antes de enviar, e a zona de arquivos tem input file multiple, aria-label e alvo de toque de 44px pelas classes do estilo."
    criterio_aceite: "tests/adicionar-fontes.test.tsx passa."
    depende_de: ["T-06.04"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-06.06
    titulo: "Estilos da aba Conhecimento"
    fase: F-06.4
    status: pendente
    objetivo: "Estilos sobre tokens para cartoes, zona de soltar, tabela, badges e spinner nos dois temas."
    arquivos:
      cria: ["tests/conhecimento-estilos.test.ts"]
      altera: ["src/estilos/global.css"]
    teste_integracao: "tests/tokens.test.ts continua passando: nenhum valor de cor literal fora de tokens.css e contraste 4,5 para 1 mantido."
    teste_funcional: "As classes usadas pelos componentes novos existem em global.css com foco visivel, alvo de 44px e regra para 375px, e um teste le o CSS e as confere."
    criterio_aceite: "tests/tokens.test.ts passa e o teste novo de classes em tests/conhecimento-estilos.test.ts passa."
    depende_de: ["T-06.05"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 06

> Um bloco por task.

---

```yaml
id: T-06.01
titulo: Aba Conhecimento e icones
objetivo: Acrescentar a aba na lista e os icones novos.
arquivos:
  cria: []
  altera: ["src/componentes/abas-do-agente.ts", "tests/abas-do-agente.test.tsx", "src/componentes/Icones.tsx", "src/componentes/itens-de-menu.ts"]
teste_integracao: AbasDoAgente renderizado para um agente lista Configuracoes, Conhecimento e Testar e marca Conhecimento como atual em /agentes/x/conhecimento/y.
teste_funcional: hrefDaAba devolve /agentes/<id>/conhecimento e cada icone novo (arquivo, texto, lixeira, upload, relogio, atualizar) renderiza um svg com aria-hidden.
criterio_aceite: tests/abas-do-agente.test.tsx passa.
depende_de: ["T-05.04"]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: 834 passed 834, 0 failed
```

---

```yaml
id: T-06.02
titulo: Logica pura da tela de conhecimento
objetivo: Validar arquivo no navegador, reducer de envios, decisao do polling, formatadores e lista de opcoes.
arquivos:
  cria: ["src/componentes/conhecimento-logica.ts", "src/componentes/estado-dos-envios.ts", "src/componentes/opcoes-de-fonte.ts", "tests/conhecimento-logica.test.ts", "tests/estado-dos-envios.test.ts"]
  altera: []
teste_integracao: Os modulos puros importam as constantes de formatos de src/lib/extracao sem tocar o DOM, validam extensao e tamanho antes de enviar e listam as opcoes arquivos e texto.
teste_funcional: O reducer leva um envio de aguardando a enviando com percentual, aceito ou recusado com motivo, deveContinuarPolling e verdadeiro so com fonte pendente ou processando, e formatarTamanho(1536) devolve '1,5 KB'.
criterio_aceite: tests/conhecimento-logica.test.ts e tests/estado-dos-envios.test.ts passam.
depende_de: ["T-03.01"]
paralelizavel: true
status: concluida
concluida_em: 2026-09-30
suite: 854 passed 854, 0 failed
```

---

```yaml
id: T-06.03
titulo: Paginas do servidor e leitura de trechos
objetivo: Pagina de conhecimento, loading e a pagina Ver conteudo com trechos paginados.
arquivos:
  cria: ["src/app/(sistema)/agentes/[id]/conhecimento/page.tsx", "src/app/(sistema)/agentes/[id]/conhecimento/loading.tsx", "src/app/(sistema)/agentes/[id]/conhecimento/[fonteId]/page.tsx", "src/app/(sistema)/agentes/[id]/conhecimento/[fonteId]/loading.tsx", "src/componentes/CartoesDeResumo.tsx", "src/componentes/ListaDeTrechos.tsx", "tests/conhecimento-paginas.test.tsx"]
  altera: []
teste_integracao: CartoesDeResumo e ListaDeTrechos renderizados com dados do servico mostram fontes, prontas e caracteres, e os trechos como texto puro.
teste_funcional: Um trecho contendo <script> aparece escapado como texto, a pagina 2 mostra o link Anterior e o total de paginas, e fonte sem trechos mostra o estado vazio com o motivo do erro.
criterio_aceite: tests/conhecimento-paginas.test.tsx passa e nenhum dangerouslySetInnerHTML novo aparece em src/.
depende_de: ["T-06.01", "T-06.02", "T-04.05"]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: 861 passed 861, 0 failed
```

---

```yaml
id: T-06.04
titulo: Painel: lista de fontes, status e acoes
objetivo: Componente cliente com a lista, badges, polling, excluir com confirmacao e reprocessar.
arquivos:
  cria: ["src/componentes/PainelDeConhecimento.tsx", "src/componentes/LinhaDeFonte.tsx", "src/componentes/BotaoExcluirFonte.tsx", "tests/painel-de-conhecimento.test.tsx", "src/componentes/fonte-da-tela.ts"]
  altera: ["src/app/(sistema)/agentes/[id]/conhecimento/page.tsx", "tests/chat-de-teste.test.tsx"]
teste_integracao: O painel renderizado com fontes em cada status mostra Na fila, Processando com spinner, Pronto e Erro com o motivo, e Reprocessar so na linha em erro.
teste_funcional: A maquina de estados da confirmacao passa de inicial a confirmando a inicial sem window.confirm, e o painel vazio mostra o convite para adicionar a primeira fonte.
criterio_aceite: tests/painel-de-conhecimento.test.tsx passa.
depende_de: ["T-06.03"]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: 870 passed 870, 0 failed
```

---

```yaml
id: T-06.05
titulo: Adicionar: arquivos e texto
objetivo: Zona de soltar com varios arquivos, progresso e erro por arquivo, e formulario de texto com contador.
arquivos:
  cria: ["src/componentes/AdicionarFontes.tsx", "src/componentes/ZonaDeArquivos.tsx", "src/componentes/FormularioDeTexto.tsx", "tests/adicionar-fontes.test.tsx"]
  altera: ["src/componentes/PainelDeConhecimento.tsx"]
teste_integracao: AdicionarFontes renderizado mostra as duas opcoes vindas de opcoes-de-fonte, a zona com a lista de formatos e o limite em MB e o formulario com o contador de 0 de 200000.
teste_funcional: O formulario recusa titulo vazio antes de enviar, e a zona de arquivos tem input file multiple, aria-label e alvo de toque de 44px pelas classes do estilo.
criterio_aceite: tests/adicionar-fontes.test.tsx passa.
depende_de: ["T-06.04"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-06.06
titulo: Estilos da aba Conhecimento
objetivo: Estilos sobre tokens para cartoes, zona de soltar, tabela, badges e spinner nos dois temas.
arquivos:
  cria: ["tests/conhecimento-estilos.test.ts"]
  altera: ["src/estilos/global.css"]
teste_integracao: tests/tokens.test.ts continua passando: nenhum valor de cor literal fora de tokens.css e contraste 4,5 para 1 mantido.
teste_funcional: As classes usadas pelos componentes novos existem em global.css com foco visivel, alvo de 44px e regra para 375px, e um teste le o CSS e as confere.
criterio_aceite: tests/tokens.test.ts passa e o teste novo de classes em tests/conhecimento-estilos.test.ts passa.
depende_de: ["T-06.05"]
paralelizavel: false
status: pendente
```
