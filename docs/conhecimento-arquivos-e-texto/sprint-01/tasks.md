---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: conhecimento-arquivos-e-texto
origem_buildx: plataforma-chatbot-ia
feature_id: FT-04
sprint_id: sprint-01
atualizado_em: 2026-09-30
tasks:
  - id: T-01.01
    titulo: "Ambiente: STORAGE_DIR e MAX_UPLOAD_MB"
    fase: F-01.1
    status: pendente
    objetivo: "Ler as duas variaveis novas em ambiente.ts, documentar no exemplo de ambiente e apontar o armazenamento de teste para um diretorio temporario."
    arquivos:
      cria: []
      altera: ["src/lib/ambiente.ts", "tests/ambiente.test.ts", "tests/setup.ts", ".env.example", "tests/projeto.test.ts"]
    teste_integracao: "O setup de teste define STORAGE_DIR como um diretorio temporario que existe durante o arquivo de teste e e apagado ao fim, e ambiente le esse valor."
    teste_funcional: "Sem variaveis, ambiente.storageDir termina em /storage e ambiente.maxUploadBytes vale 26214400; com MAX_UPLOAD_MB=abc a leitura lanca erro claro."
    criterio_aceite: "tests/ambiente.test.ts passa com os quatro casos (padrao, valor valido, valor invalido, STORAGE_DIR relativo resolvido contra o cwd) e .env.example documenta STORAGE_DIR e MAX_UPLOAD_MB."
    depende_de: []
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-01.02
    titulo: "Dependencias de extracao com versao fixa"
    fase: F-01.1
    status: pendente
    objetivo: "Instalar unpdf 1.8.1, mammoth 1.13.0 e parse5 8.0.1 sem faixa de versao e auditar."
    arquivos:
      cria: ["tests/dependencias-extracao.test.ts"]
      altera: ["package.json", "package-lock.json"]
    teste_integracao: "O teste importa unpdf, mammoth e parse5 no Node do vitest e chama uma funcao simples de cada uma."
    teste_funcional: "package.json fixa as tres versoes exatas sem ^ nem ~ e npm audit --audit-level=high termina com 0 vulnerabilidades."
    criterio_aceite: "tests/dependencias-extracao.test.ts passa e npm audit --audit-level=high devolve 0."
    depende_de: ["T-01.01"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-01.03
    titulo: "Fixtures de texto e gerador"
    fase: F-01.2
    status: pendente
    objetivo: "Gerar por codigo as fixtures textuais dos formatos e conferir que as commitadas em tests/fixtures/ sao iguais."
    arquivos:
      cria: ["tests/apoio/fixtures-fontes.ts", "tests/apoio/gerar-fixtures.ts", "tests/fixtures-fontes.test.ts", "tests/fixtures/exemplo.txt", "tests/fixtures/exemplo.md", "tests/fixtures/exemplo.csv", "tests/fixtures/exemplo.html", "tests/fixtures/exemplo.json", "tests/fixtures/exemplo.srt", "tests/fixtures/exemplo.vtt"]
      altera: []
    teste_integracao: "Cada fixture textual commitada em tests/fixtures/ e byte a byte igual ao que gerarFixtures() devolve para o mesmo nome."
    teste_funcional: "gerarFixtures() devolve os sete formatos textuais com texto ficticio da Loja Exemplo e sem nenhum dado real."
    criterio_aceite: "tests/fixtures-fontes.test.ts passa e os sete arquivos existem em tests/fixtures/."
    depende_de: ["T-01.01"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-01.04
    titulo: "Fixtures de PDF e DOCX validos"
    fase: F-01.2
    status: pendente
    objetivo: "Gerar um PDF com texto, um PDF sem texto e um DOCX minimo validos por codigo."
    arquivos:
      cria: ["tests/fixtures/exemplo.pdf", "tests/fixtures/escaneado.pdf", "tests/fixtures/exemplo.docx"]
      altera: ["tests/apoio/fixtures-fontes.ts", "tests/fixtures-fontes.test.ts"]
    teste_integracao: "unpdf extrai o texto ficticio de exemplo.pdf e mammoth extrai o de exemplo.docx."
    teste_funcional: "escaneado.pdf abre no unpdf e devolve texto vazio, e exemplo.docx e um ZIP que contem word/document.xml."
    criterio_aceite: "tests/fixtures-fontes.test.ts passa com os tres casos novos e os tres arquivos existem em tests/fixtures/."
    depende_de: ["T-01.02", "T-01.03"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 01

> Um bloco por task.

---

```yaml
id: T-01.01
titulo: Ambiente: STORAGE_DIR e MAX_UPLOAD_MB
objetivo: Ler as duas variaveis novas em ambiente.ts, documentar no exemplo de ambiente e apontar o armazenamento de teste para um diretorio temporario.
arquivos:
  cria: []
  altera: ["src/lib/ambiente.ts", "tests/ambiente.test.ts", "tests/setup.ts", ".env.example", "tests/projeto.test.ts"]
teste_integracao: O setup de teste define STORAGE_DIR como um diretorio temporario que existe durante o arquivo de teste e e apagado ao fim, e ambiente le esse valor.
teste_funcional: Sem variaveis, ambiente.storageDir termina em /storage e ambiente.maxUploadBytes vale 26214400; com MAX_UPLOAD_MB=abc a leitura lanca erro claro.
criterio_aceite: tests/ambiente.test.ts passa com os quatro casos (padrao, valor valido, valor invalido, STORAGE_DIR relativo resolvido contra o cwd) e .env.example documenta STORAGE_DIR e MAX_UPLOAD_MB.
depende_de: []
paralelizavel: false
status: pendente
```

---

```yaml
id: T-01.02
titulo: Dependencias de extracao com versao fixa
objetivo: Instalar unpdf 1.8.1, mammoth 1.13.0 e parse5 8.0.1 sem faixa de versao e auditar.
arquivos:
  cria: ["tests/dependencias-extracao.test.ts"]
  altera: ["package.json", "package-lock.json"]
teste_integracao: O teste importa unpdf, mammoth e parse5 no Node do vitest e chama uma funcao simples de cada uma.
teste_funcional: package.json fixa as tres versoes exatas sem ^ nem ~ e npm audit --audit-level=high termina com 0 vulnerabilidades.
criterio_aceite: tests/dependencias-extracao.test.ts passa e npm audit --audit-level=high devolve 0.
depende_de: ["T-01.01"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-01.03
titulo: Fixtures de texto e gerador
objetivo: Gerar por codigo as fixtures textuais dos formatos e conferir que as commitadas em tests/fixtures/ sao iguais.
arquivos:
  cria: ["tests/apoio/fixtures-fontes.ts", "tests/apoio/gerar-fixtures.ts", "tests/fixtures-fontes.test.ts", "tests/fixtures/exemplo.txt", "tests/fixtures/exemplo.md", "tests/fixtures/exemplo.csv", "tests/fixtures/exemplo.html", "tests/fixtures/exemplo.json", "tests/fixtures/exemplo.srt", "tests/fixtures/exemplo.vtt"]
  altera: []
teste_integracao: Cada fixture textual commitada em tests/fixtures/ e byte a byte igual ao que gerarFixtures() devolve para o mesmo nome.
teste_funcional: gerarFixtures() devolve os sete formatos textuais com texto ficticio da Loja Exemplo e sem nenhum dado real.
criterio_aceite: tests/fixtures-fontes.test.ts passa e os sete arquivos existem em tests/fixtures/.
depende_de: ["T-01.01"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-01.04
titulo: Fixtures de PDF e DOCX validos
objetivo: Gerar um PDF com texto, um PDF sem texto e um DOCX minimo validos por codigo.
arquivos:
  cria: ["tests/fixtures/exemplo.pdf", "tests/fixtures/escaneado.pdf", "tests/fixtures/exemplo.docx"]
  altera: ["tests/apoio/fixtures-fontes.ts", "tests/fixtures-fontes.test.ts"]
teste_integracao: unpdf extrai o texto ficticio de exemplo.pdf e mammoth extrai o de exemplo.docx.
teste_funcional: escaneado.pdf abre no unpdf e devolve texto vazio, e exemplo.docx e um ZIP que contem word/document.xml.
criterio_aceite: tests/fixtures-fontes.test.ts passa com os tres casos novos e os tres arquivos existem em tests/fixtures/.
depende_de: ["T-01.02", "T-01.03"]
paralelizavel: false
status: pendente
```
