---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: conhecimento-arquivos-e-texto
origem_buildx: plataforma-chatbot-ia
feature_id: FT-04
sprint_id: sprint-03
atualizado_em: 2026-09-30
tasks:
  - id: T-03.01
    titulo: "Formatos, limites e nome sanitizado"
    fase: F-03.1
    status: concluida
    objetivo: "Centralizar extensoes aceitas, MIME por extensao, constantes de limite e a sanitizacao do nome de exibicao."
    arquivos:
      cria: ["src/lib/extracao/formatos.ts", "src/lib/extracao/limites.ts", "tests/extracao-formatos.test.ts"]
      altera: []
    teste_integracao: "formatoDaNome mapeia as dez extensoes aceitas (com htm igual a html) e recusa as outras, e limites.ts exporta 500 paginas, 5000000 caracteres, 100 MB descompactado, razao 100 e 120000 ms."
    teste_funcional: "sanitizarNome('..\\\\..\\\\etc/passwd.txt') devolve 'passwd.txt', tira caracteres de controle, corta em 200 caracteres e devolve 'arquivo' para nome vazio."
    criterio_aceite: "tests/extracao-formatos.test.ts passa."
    depende_de: ["T-01.01"]
    paralelizavel: true
    concluida_em: 2026-09-30
    suite: verde
  - id: T-03.02
    titulo: "Conferencia do conteudo real"
    fase: F-03.1
    status: concluida
    objetivo: "Conferir assinatura de PDF, decodificar texto com BOM e fallback Latin-1 e validar JSON."
    arquivos:
      cria: ["src/lib/extracao/conteudo.ts", "tests/extracao-conteudo.test.ts"]
      altera: []
    teste_integracao: "As fixtures exemplo.pdf, exemplo.txt e exemplo.json passam na conferencia e um .pdf que comeca por outra coisa e recusado."
    teste_funcional: "Bytes UTF-8 com BOM viram texto sem o BOM, bytes Latin-1 invalidos em UTF-8 viram texto legivel, e um byte nulo recusa o arquivo."
    criterio_aceite: "tests/extracao-conteudo.test.ts passa."
    depende_de: ["T-01.03", "T-01.04", "T-03.01"]
    paralelizavel: true
    concluida_em: 2026-09-30
    suite: verde
  - id: T-03.03
    titulo: "Conferencia do ZIP do DOCX"
    fase: F-03.1
    status: concluida
    objetivo: "Ler o diretorio central do ZIP e descompactar cada entrada com teto para barrar zip bomb."
    arquivos:
      cria: ["src/lib/extracao/zip.ts", "tests/extracao-zip.test.ts"]
      altera: []
    teste_integracao: "exemplo.docx passa e um ZIP montado no teste com entrada cifrada, sem word/document.xml ou com cabecalho declarando tamanho pequeno e dados reais enormes e recusado."
    teste_funcional: "Um ZIP de 200 KB que descompacta para mais de 100 MB e recusado com a mensagem de arquivo comprimido demais sem estourar a memoria."
    criterio_aceite: "tests/extracao-zip.test.ts passa e src/lib/extracao/zip.ts nao usa jszip."
    depende_de: ["T-01.04", "T-03.01"]
    paralelizavel: true
    concluida_em: 2026-09-30
    suite: verde
  - id: T-03.04
    titulo: "Adaptadores de texto e legenda"
    fase: F-03.2
    status: concluida
    objetivo: "Extrair TXT, MD, SRT e VTT para texto puro."
    arquivos:
      cria: ["src/lib/extracao/texto.ts", "src/lib/extracao/legenda.ts", "tests/extracao-texto.test.ts"]
      altera: []
    teste_integracao: "Cada adaptador processa a fixture correspondente de tests/fixtures/ e o resultado contem a fala ficticia esperada."
    teste_funcional: "Um SRT com numeracao, marcas de tempo e tags <i> vira so as falas unidas por espaco, e um VTT sem o cabecalho WEBVTT e sem blocos NOTE."
    criterio_aceite: "tests/extracao-texto.test.ts passa."
    depende_de: ["T-03.02"]
    paralelizavel: true
    concluida_em: 2026-09-30
    suite: verde
  - id: T-03.05
    titulo: "Adaptadores de CSV e JSON"
    fase: F-03.2
    status: concluida
    objetivo: "Extrair CSV como registros coluna: valor e JSON achatado em caminho: valor."
    arquivos:
      cria: ["src/lib/extracao/csv.ts", "src/lib/extracao/json.ts", "tests/extracao-planilha-json.test.ts"]
      altera: []
    teste_integracao: "Cada adaptador processa a fixture correspondente de tests/fixtures/ e o resultado contem os pares esperados."
    teste_funcional: "O CSV 'nome;idade' com linha 'Ana;30' vira 'Colunas: nome, idade' e 'nome: Ana; idade: 30', com aspas e virgula dentro de campo tratadas, e o JSON {a:{b:[1,2]}} vira 'a.b[0]: 1' e 'a.b[1]: 2'."
    criterio_aceite: "tests/extracao-planilha-json.test.ts passa."
    depende_de: ["T-03.02"]
    paralelizavel: true
    concluida_em: 2026-09-30
    suite: verde
  - id: T-03.06
    titulo: "Adaptador de HTML"
    fase: F-03.2
    status: concluida
    objetivo: "Extrair texto de HTML com parse5 sem executar nada, descartando script, style, nav e noscript."
    arquivos:
      cria: ["src/lib/extracao/html.ts", "tests/extracao-html.test.ts"]
      altera: []
    teste_integracao: "O adaptador processa exemplo.html e devolve titulos com # e paragrafos separados por linha em branco."
    teste_funcional: "Um HTML com script, style, nav, noscript e comentario devolve so o texto visivel e nunca o conteudo desses blocos."
    criterio_aceite: "tests/extracao-html.test.ts passa."
    depende_de: ["T-01.02", "T-03.02"]
    paralelizavel: true
    concluida_em: 2026-09-30
    suite: verde
  - id: T-03.07
    titulo: "Adaptador de PDF"
    fase: F-03.2
    status: concluida
    objetivo: "Extrair texto de PDF com unpdf, limitar paginas e tratar PDF sem texto."
    arquivos:
      cria: ["src/lib/extracao/pdf.ts", "tests/extracao-pdf.test.ts"]
      altera: []
    teste_integracao: "O adaptador extrai o texto ficticio de exemplo.pdf com o unpdf real."
    teste_funcional: "escaneado.pdf lanca ErroDeAplicacao com a mensagem exata 'Este PDF nao tem texto selecionavel (parece escaneado). OCR nao e suportado.' (com acentos), um PDF invalido lanca mensagem generica sem repassar a da biblioteca e um PDF acima de 500 paginas e recusado."
    criterio_aceite: "tests/extracao-pdf.test.ts passa."
    depende_de: ["T-01.04", "T-03.01"]
    paralelizavel: true
    concluida_em: 2026-09-30
    suite: verde
  - id: T-03.08
    titulo: "Adaptador de DOCX"
    fase: F-03.2
    status: pendente
    objetivo: "Extrair texto bruto de DOCX com mammoth depois da conferencia do ZIP."
    arquivos:
      cria: ["src/lib/extracao/docx.ts", "tests/extracao-docx.test.ts"]
      altera: []
    teste_integracao: "O adaptador extrai o texto ficticio de exemplo.docx com o mammoth real."
    teste_funcional: "Um DOCX sem texto e um arquivo que nao e ZIP lancam ErroDeAplicacao com mensagem propria em portugues sem repassar a da biblioteca."
    criterio_aceite: "tests/extracao-docx.test.ts passa."
    depende_de: ["T-03.03"]
    paralelizavel: true
    concluida_em: null
    suite: nao_executada
  - id: T-03.09
    titulo: "Fachada extrairTexto"
    fase: F-03.3
    status: pendente
    objetivo: "Despachar por formato, limitar o texto e o tempo e normalizar qualquer excecao."
    arquivos:
      cria: ["src/lib/extracao/index.ts", "tests/extracao.test.ts"]
      altera: []
    teste_integracao: "extrairTexto processa as nove fixtures reais por formato e devolve texto nao vazio para cada uma."
    teste_funcional: "Texto acima de 5000000 caracteres, extracao que passa do prazo e resultado so com espacos viram ErroDeAplicacao com mensagem clara, e uma excecao qualquer vira frase generica."
    criterio_aceite: "tests/extracao.test.ts passa e src/lib/extracao/ nao importa next/* nem src/servicos."
    depende_de: ["T-03.04", "T-03.05", "T-03.06", "T-03.07", "T-03.08"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 03

> Um bloco por task.

---

```yaml
id: T-03.01
titulo: Formatos, limites e nome sanitizado
objetivo: Centralizar extensoes aceitas, MIME por extensao, constantes de limite e a sanitizacao do nome de exibicao.
arquivos:
  cria: ["src/lib/extracao/formatos.ts", "src/lib/extracao/limites.ts", "tests/extracao-formatos.test.ts"]
  altera: []
teste_integracao: formatoDaNome mapeia as dez extensoes aceitas (com htm igual a html) e recusa as outras, e limites.ts exporta 500 paginas, 5000000 caracteres, 100 MB descompactado, razao 100 e 120000 ms.
teste_funcional: sanitizarNome('..\\..\\etc/passwd.txt') devolve 'passwd.txt', tira caracteres de controle, corta em 200 caracteres e devolve 'arquivo' para nome vazio.
criterio_aceite: tests/extracao-formatos.test.ts passa.
depende_de: ["T-01.01"]
paralelizavel: true
status: concluida
concluida_em: 2026-09-30
suite: 683 passed, 0 failed
```

---

```yaml
id: T-03.02
titulo: Conferencia do conteudo real
objetivo: Conferir assinatura de PDF, decodificar texto com BOM e fallback Latin-1 e validar JSON.
arquivos:
  cria: ["src/lib/extracao/conteudo.ts", "tests/extracao-conteudo.test.ts"]
  altera: []
teste_integracao: As fixtures exemplo.pdf, exemplo.txt e exemplo.json passam na conferencia e um .pdf que comeca por outra coisa e recusado.
teste_funcional: Bytes UTF-8 com BOM viram texto sem o BOM, bytes Latin-1 invalidos em UTF-8 viram texto legivel, e um byte nulo recusa o arquivo.
criterio_aceite: tests/extracao-conteudo.test.ts passa.
depende_de: ["T-01.03", "T-01.04", "T-03.01"]
paralelizavel: true
status: concluida
concluida_em: 2026-09-30
suite: 692 passed, 0 failed
```

---

```yaml
id: T-03.03
titulo: Conferencia do ZIP do DOCX
objetivo: Ler o diretorio central do ZIP e descompactar cada entrada com teto para barrar zip bomb.
arquivos:
  cria: ["src/lib/extracao/zip.ts", "tests/extracao-zip.test.ts"]
  altera: []
teste_integracao: exemplo.docx passa e um ZIP montado no teste com entrada cifrada, sem word/document.xml ou com cabecalho declarando tamanho pequeno e dados reais enormes e recusado.
teste_funcional: Um ZIP de 200 KB que descompacta para mais de 100 MB e recusado com a mensagem de arquivo comprimido demais sem estourar a memoria.
criterio_aceite: tests/extracao-zip.test.ts passa e src/lib/extracao/zip.ts nao usa jszip.
depende_de: ["T-01.04", "T-03.01"]
paralelizavel: true
status: concluida
concluida_em: 2026-09-30
suite: 702 passed, 0 failed
```

---

```yaml
id: T-03.04
titulo: Adaptadores de texto e legenda
objetivo: Extrair TXT, MD, SRT e VTT para texto puro.
arquivos:
  cria: ["src/lib/extracao/texto.ts", "src/lib/extracao/legenda.ts", "tests/extracao-texto.test.ts"]
  altera: []
teste_integracao: Cada adaptador processa a fixture correspondente de tests/fixtures/ e o resultado contem a fala ficticia esperada.
teste_funcional: Um SRT com numeracao, marcas de tempo e tags <i> vira so as falas unidas por espaco, e um VTT sem o cabecalho WEBVTT e sem blocos NOTE.
criterio_aceite: tests/extracao-texto.test.ts passa.
depende_de: ["T-03.02"]
paralelizavel: true
status: concluida
concluida_em: 2026-09-30
suite: 709 passed (709)
```

---

```yaml
id: T-03.05
titulo: Adaptadores de CSV e JSON
objetivo: Extrair CSV como registros coluna: valor e JSON achatado em caminho: valor.
arquivos:
  cria: ["src/lib/extracao/csv.ts", "src/lib/extracao/json.ts", "tests/extracao-planilha-json.test.ts"]
  altera: []
teste_integracao: Cada adaptador processa a fixture correspondente de tests/fixtures/ e o resultado contem os pares esperados.
teste_funcional: O CSV 'nome;idade' com linha 'Ana;30' vira 'Colunas: nome, idade' e 'nome: Ana; idade: 30', com aspas e virgula dentro de campo tratadas, e o JSON {a:{b:[1,2]}} vira 'a.b[0]: 1' e 'a.b[1]: 2'.
criterio_aceite: tests/extracao-planilha-json.test.ts passa.
depende_de: ["T-03.02"]
paralelizavel: true
status: concluida
concluida_em: 2026-09-30
suite: 720 passed, 0 failed
```

---

```yaml
id: T-03.06
titulo: Adaptador de HTML
objetivo: Extrair texto de HTML com parse5 sem executar nada, descartando script, style, nav e noscript.
arquivos:
  cria: ["src/lib/extracao/html.ts", "tests/extracao-html.test.ts"]
  altera: []
teste_integracao: O adaptador processa exemplo.html e devolve titulos com # e paragrafos separados por linha em branco.
teste_funcional: Um HTML com script, style, nav, noscript e comentario devolve so o texto visivel e nunca o conteudo desses blocos.
criterio_aceite: tests/extracao-html.test.ts passa.
depende_de: ["T-01.02", "T-03.02"]
paralelizavel: true
status: concluida
concluida_em: 2026-09-30
suite: 729 passed, 0 failed
```

---

```yaml
id: T-03.07
titulo: Adaptador de PDF
objetivo: Extrair texto de PDF com unpdf, limitar paginas e tratar PDF sem texto.
arquivos:
  cria: ["src/lib/extracao/pdf.ts", "tests/extracao-pdf.test.ts"]
  altera: []
teste_integracao: O adaptador extrai o texto ficticio de exemplo.pdf com o unpdf real.
teste_funcional: escaneado.pdf lanca ErroDeAplicacao com a mensagem exata 'Este PDF nao tem texto selecionavel (parece escaneado). OCR nao e suportado.' (com acentos), um PDF invalido lanca mensagem generica sem repassar a da biblioteca e um PDF acima de 500 paginas e recusado.
criterio_aceite: tests/extracao-pdf.test.ts passa.
depende_de: ["T-01.04", "T-03.01"]
paralelizavel: true
status: concluida
concluida_em: 2026-09-30
suite: 735 passed, 0 failed
```

---

```yaml
id: T-03.08
titulo: Adaptador de DOCX
objetivo: Extrair texto bruto de DOCX com mammoth depois da conferencia do ZIP.
arquivos:
  cria: ["src/lib/extracao/docx.ts", "tests/extracao-docx.test.ts"]
  altera: []
teste_integracao: O adaptador extrai o texto ficticio de exemplo.docx com o mammoth real.
teste_funcional: Um DOCX sem texto e um arquivo que nao e ZIP lancam ErroDeAplicacao com mensagem propria em portugues sem repassar a da biblioteca.
criterio_aceite: tests/extracao-docx.test.ts passa.
depende_de: ["T-03.03"]
paralelizavel: true
status: pendente
```

---

```yaml
id: T-03.09
titulo: Fachada extrairTexto
objetivo: Despachar por formato, limitar o texto e o tempo e normalizar qualquer excecao.
arquivos:
  cria: ["src/lib/extracao/index.ts", "tests/extracao.test.ts"]
  altera: []
teste_integracao: extrairTexto processa as nove fixtures reais por formato e devolve texto nao vazio para cada uma.
teste_funcional: Texto acima de 5000000 caracteres, extracao que passa do prazo e resultado so com espacos viram ErroDeAplicacao com mensagem clara, e uma excecao qualquer vira frase generica.
criterio_aceite: tests/extracao.test.ts passa e src/lib/extracao/ nao importa next/* nem src/servicos.
depende_de: ["T-03.04", "T-03.05", "T-03.06", "T-03.07", "T-03.08"]
paralelizavel: false
status: pendente
```
