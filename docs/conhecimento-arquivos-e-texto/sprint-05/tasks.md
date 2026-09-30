---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: conhecimento-arquivos-e-texto
origem_buildx: plataforma-chatbot-ia
feature_id: FT-04
sprint_id: sprint-05
atualizado_em: 2026-09-30
tasks:
  - id: T-05.01
    titulo: "Handlers: lista e texto colado"
    fase: F-05.1
    status: concluida
    objetivo: "GET da lista e POST do texto, com a resposta de erro comum e o servidor de producao de teste."
    arquivos:
      cria: ["src/app/api/agentes/[id]/fontes/route.ts", "src/app/api/agentes/[id]/fontes/texto/route.ts", "src/app/api/agentes/[id]/fontes/resposta.ts", "tests/apoio/servidor.ts", "tests/fontes-rota.test.ts"]
      altera: []
    teste_integracao: "Com next start e STORAGE_DIR temporario, POST /texto responde 202, o GET mostra a fonte passar de pendente ou processando a pronto pelo processamento real da fila e a lista traz o resumo."
    teste_funcional: "Sem cookie a resposta e 401, agente inexistente 404, corpo que nao e JSON 415, titulo vazio 422, e o corpo nunca traz caminhoArquivo."
    criterio_aceite: "tests/fontes-rota.test.ts passa."
    depende_de: ["T-04.06"]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: verde
  - id: T-05.02
    titulo: "Handler: upload multipart"
    fase: F-05.1
    status: pendente
    objetivo: "POST multipart com varios arquivos, resposta por arquivo e recusa cedo de corpo grande."
    arquivos:
      cria: ["tests/fontes-rota-upload.test.ts"]
      altera: ["src/app/api/agentes/[id]/fontes/route.ts"]
    teste_integracao: "Um FormData real com o PDF, o DOCX e o CSV das fixtures enviado por fetch responde 202 com tres resultados aceitos e as tres fontes chegam a pronto."
    teste_funcional: "Content-Length acima do teto responde 413 sem ler o corpo, Content-Type que nao e multipart responde 415, um lote em que nenhum arquivo e aceito responde 422 com um motivo por arquivo, e lote misto responde 202."
    criterio_aceite: "tests/fontes-rota-upload.test.ts passa."
    depende_de: ["T-05.01"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-05.03
    titulo: "Handlers: excluir e reprocessar"
    fase: F-05.1
    status: pendente
    objetivo: "DELETE 204 e POST de reprocessar 202 com verificacao de que a fonte e do agente da URL."
    arquivos:
      cria: ["src/app/api/agentes/[id]/fontes/[fonteId]/route.ts", "src/app/api/agentes/[id]/fontes/[fonteId]/reprocessar/route.ts", "tests/fontes-rota-ciclo.test.ts"]
      altera: []
    teste_integracao: "DELETE de uma fonte pronta responde 204, o GET seguinte nao a lista e o diretorio some do STORAGE_DIR de teste."
    teste_funcional: "Reprocessar uma fonte em erro responde 202 e leva a pronto, reprocessar fonte pronta responde 409, e fonte de outro agente responde 404 nos dois."
    criterio_aceite: "tests/fontes-rota-ciclo.test.ts passa."
    depende_de: ["T-05.02"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-05.04
    titulo: "Ponta a ponta de todos os formatos e build"
    fase: F-05.2
    status: pendente
    objetivo: "Provar pelo servidor de producao os nove formatos e resolver o que o bundler exigir."
    arquivos:
      cria: ["tests/fontes-rota-formatos.test.ts"]
      altera: ["next.config.ts"]
    teste_integracao: "Os nove formatos enviados por multipart real chegam a pronto pelo servidor de producao e os trechos de cada um contem o texto ficticio esperado."
    teste_funcional: "O PDF escaneado chega a erro com a mensagem de OCR e um DOCX com cabecalho de tamanho mentiroso e recusado no envio, tudo pelo servidor de producao."
    criterio_aceite: "npm run build termina com 0, tests/fontes-rota-formatos.test.ts passa e o servidor de producao, ao subir com uma fonte pendente no banco de teste, a leva a pronto sem nenhuma requisicao."
    depende_de: ["T-05.03"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 05

> Um bloco por task.

---

```yaml
id: T-05.01
titulo: Handlers: lista e texto colado
objetivo: GET da lista e POST do texto, com a resposta de erro comum e o servidor de producao de teste.
arquivos:
  cria: ["src/app/api/agentes/[id]/fontes/route.ts", "src/app/api/agentes/[id]/fontes/texto/route.ts", "src/app/api/agentes/[id]/fontes/resposta.ts", "tests/apoio/servidor.ts", "tests/fontes-rota.test.ts"]
  altera: []
teste_integracao: Com next start e STORAGE_DIR temporario, POST /texto responde 202, o GET mostra a fonte passar de pendente ou processando a pronto pelo processamento real da fila e a lista traz o resumo.
teste_funcional: Sem cookie a resposta e 401, agente inexistente 404, corpo que nao e JSON 415, titulo vazio 422, e o corpo nunca traz caminhoArquivo.
criterio_aceite: tests/fontes-rota.test.ts passa.
depende_de: ["T-04.06"]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: 806 passed 806, 0 failed
```

---

```yaml
id: T-05.02
titulo: Handler: upload multipart
objetivo: POST multipart com varios arquivos, resposta por arquivo e recusa cedo de corpo grande.
arquivos:
  cria: ["tests/fontes-rota-upload.test.ts"]
  altera: ["src/app/api/agentes/[id]/fontes/route.ts"]
teste_integracao: Um FormData real com o PDF, o DOCX e o CSV das fixtures enviado por fetch responde 202 com tres resultados aceitos e as tres fontes chegam a pronto.
teste_funcional: Content-Length acima do teto responde 413 sem ler o corpo, Content-Type que nao e multipart responde 415, um lote em que nenhum arquivo e aceito responde 422 com um motivo por arquivo, e lote misto responde 202.
criterio_aceite: tests/fontes-rota-upload.test.ts passa.
depende_de: ["T-05.01"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-05.03
titulo: Handlers: excluir e reprocessar
objetivo: DELETE 204 e POST de reprocessar 202 com verificacao de que a fonte e do agente da URL.
arquivos:
  cria: ["src/app/api/agentes/[id]/fontes/[fonteId]/route.ts", "src/app/api/agentes/[id]/fontes/[fonteId]/reprocessar/route.ts", "tests/fontes-rota-ciclo.test.ts"]
  altera: []
teste_integracao: DELETE de uma fonte pronta responde 204, o GET seguinte nao a lista e o diretorio some do STORAGE_DIR de teste.
teste_funcional: Reprocessar uma fonte em erro responde 202 e leva a pronto, reprocessar fonte pronta responde 409, e fonte de outro agente responde 404 nos dois.
criterio_aceite: tests/fontes-rota-ciclo.test.ts passa.
depende_de: ["T-05.02"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-05.04
titulo: Ponta a ponta de todos os formatos e build
objetivo: Provar pelo servidor de producao os nove formatos e resolver o que o bundler exigir.
arquivos:
  cria: ["tests/fontes-rota-formatos.test.ts"]
  altera: ["next.config.ts"]
teste_integracao: Os nove formatos enviados por multipart real chegam a pronto pelo servidor de producao e os trechos de cada um contem o texto ficticio esperado.
teste_funcional: O PDF escaneado chega a erro com a mensagem de OCR e um DOCX com cabecalho de tamanho mentiroso e recusado no envio, tudo pelo servidor de producao.
criterio_aceite: npm run build termina com 0, tests/fontes-rota-formatos.test.ts passa e o servidor de producao, ao subir com uma fonte pendente no banco de teste, a leva a pronto sem nenhuma requisicao.
depende_de: ["T-05.03"]
paralelizavel: false
status: pendente
```
