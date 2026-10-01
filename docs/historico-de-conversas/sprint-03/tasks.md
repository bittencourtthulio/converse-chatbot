---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: historico-de-conversas
origem_buildx: plataforma-chatbot-ia
feature_id: FT-09
sprint_id: sprint-03
atualizado_em: 2026-10-01
tasks:
  - id: T-03.01
    titulo: "DELETE de conversa e apagar em lote"
    fase: F-03.1
    status: pendente
    objetivo: "Criar DELETE /api/conversas/[id] e POST /api/conversas/apagar finos sobre o servico."
    arquivos:
      cria: ["src/app/api/conversas/[id]/route.ts", "src/app/api/conversas/apagar/route.ts", "tests/conversas-apagar-rota.test.ts", "docs/historico-de-conversas/sprint-03/sprint.md", "docs/historico-de-conversas/sprint-03/fases.md", "docs/historico-de-conversas/sprint-03/tasks.md"]
      altera: []
    teste_integracao: "Contra o servidor de producao do teste, DELETE e POST sem sessao dao 401 e com sessao apagam e devolvem a contagem."
    teste_funcional: "DELETE de id inexistente da 404, POST com lote vazio, com 51 ids ou com id nao texto da 422 e uma conversa apagada some do banco com as mensagens."
    criterio_aceite: "tests/conversas-apagar-rota.test.ts passa."
    depende_de: ["T-02.05"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-03.02
    titulo: "Exportar conversa em texto"
    fase: F-03.1
    status: pendente
    objetivo: "Criar GET /api/conversas/[id]/exportar que devolve o texto como anexo seguro."
    arquivos:
      cria: ["src/app/api/conversas/[id]/exportar/route.ts", "tests/conversas-exportar-rota.test.ts"]
      altera: []
    teste_integracao: "Contra o servidor de producao do teste, o GET sem sessao da 401 e com sessao devolve o texto da conversa."
    teste_funcional: "A resposta tem text/plain com charset utf-8, Content-Disposition attachment com nome conversa-<id>.txt sem rotulo nem identificador externo, Cache-Control no-store e nosniff, e id inexistente da 404."
    criterio_aceite: "tests/conversas-exportar-rota.test.ts passa."
    depende_de: ["T-03.01"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-03.03
    titulo: "Item de menu Conversas"
    fase: F-03.2
    status: pendente
    objetivo: "Acrescentar Conversas ao grupo sem titulo, logo abaixo de Agentes, com migalhas para o detalhe."
    arquivos:
      cria: []
      altera: ["src/componentes/itens-de-menu.ts", "tests/menu.test.ts"]
    teste_integracao: "A lista de menu, lida pelos testes reais, traz Painel, Agentes e Conversas nessa ordem para os dois papeis."
    teste_funcional: "migalhasDaRota de /conversas e de /conversas/abc devolve Conversas, rotaEstaAtiva marca o item no detalhe e o icone renderiza."
    criterio_aceite: "tests/menu.test.ts passa."
    depende_de: ["T-03.02"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 03

> Um bloco por task. Convenção de suíte: `suite: verde` só quando a suíte inteira rodou na task; subconjunto é `parcial`, com o subconjunto declarado na linha da task.

---

```yaml
id: T-03.01
titulo: "DELETE de conversa e apagar em lote"
objetivo: "Criar DELETE /api/conversas/[id] e POST /api/conversas/apagar finos sobre o servico."
arquivos:
  cria: ["src/app/api/conversas/[id]/route.ts", "src/app/api/conversas/apagar/route.ts", "tests/conversas-apagar-rota.test.ts", "docs/historico-de-conversas/sprint-03/sprint.md", "docs/historico-de-conversas/sprint-03/fases.md", "docs/historico-de-conversas/sprint-03/tasks.md"]
  altera: []
teste_integracao: "Contra o servidor de producao do teste, DELETE e POST sem sessao dao 401 e com sessao apagam e devolvem a contagem."
teste_funcional: "DELETE de id inexistente da 404, POST com lote vazio, com 51 ids ou com id nao texto da 422 e uma conversa apagada some do banco com as mensagens."
criterio_aceite: "tests/conversas-apagar-rota.test.ts passa."
depende_de: ["T-02.05"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-03.02
titulo: "Exportar conversa em texto"
objetivo: "Criar GET /api/conversas/[id]/exportar que devolve o texto como anexo seguro."
arquivos:
  cria: ["src/app/api/conversas/[id]/exportar/route.ts", "tests/conversas-exportar-rota.test.ts"]
  altera: []
teste_integracao: "Contra o servidor de producao do teste, o GET sem sessao da 401 e com sessao devolve o texto da conversa."
teste_funcional: "A resposta tem text/plain com charset utf-8, Content-Disposition attachment com nome conversa-<id>.txt sem rotulo nem identificador externo, Cache-Control no-store e nosniff, e id inexistente da 404."
criterio_aceite: "tests/conversas-exportar-rota.test.ts passa."
depende_de: ["T-03.01"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-03.03
titulo: "Item de menu Conversas"
objetivo: "Acrescentar Conversas ao grupo sem titulo, logo abaixo de Agentes, com migalhas para o detalhe."
arquivos:
  cria: []
  altera: ["src/componentes/itens-de-menu.ts", "tests/menu.test.ts"]
teste_integracao: "A lista de menu, lida pelos testes reais, traz Painel, Agentes e Conversas nessa ordem para os dois papeis."
teste_funcional: "migalhasDaRota de /conversas e de /conversas/abc devolve Conversas, rotaEstaAtiva marca o item no detalhe e o icone renderiza."
criterio_aceite: "tests/menu.test.ts passa."
depende_de: ["T-03.02"]
paralelizavel: false
status: pendente
```

