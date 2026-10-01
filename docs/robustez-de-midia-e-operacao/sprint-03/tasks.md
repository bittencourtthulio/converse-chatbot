---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: robustez-de-midia-e-operacao
origem_buildx: plataforma-chatbot-ia
feature_id: FT-13
sprint_id: sprint-03
atualizado_em: 2026-10-01
tasks:
  - id: T-03.01
    titulo: "Leitor de corpo com teto em stream"
    fase: F-03.1
    status: concluida
    objetivo: "Criar lerCorpoLimitado, que lê um stream contando bytes e cancela ao passar do teto (PR-106)."
    arquivos:
      cria: ["docs/robustez-de-midia-e-operacao/sprint-03/sprint.md", "docs/robustez-de-midia-e-operacao/sprint-03/fases.md", "docs/robustez-de-midia-e-operacao/sprint-03/tasks.md", "src/lib/corpo-limitado.ts", "tests/corpo-limitado.test.ts"]
      altera: ["docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "Um stream de pedaços de 64 KB com contador de pedaços puxados e teto de 1 MB: ao passar do teto lerCorpoLimitado lança CorpoGrandeDemais, cancela o stream e puxou no máximo 17 pedaços."
    teste_funcional: "Corpo de 100 KB sob teto de 1 MB devolve os 100 KB, corpo exatamente do teto passa, um byte acima lança e corpo nulo devolve vazio."
    criterio_aceite: "tests/corpo-limitado.test.ts passa e falha quando a contagem de bytes é removida (mutação registrada)."
    depende_de: ["T-01.04"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-03.02
    titulo: "Rota de documentos com corpo limitado"
    fase: F-03.1
    status: concluida
    objetivo: "Fazer o POST de documentos ler o corpo por lerCorpoLimitado e só então o multipart, com 413 inclusive para corpo chunked (PR-106)."
    arquivos:
      cria: ["tests/fontes-rota-chunked.test.ts"]
      altera: ["src/app/api/agentes/[id]/fontes/route.ts", "src/app/api/agentes/[id]/fontes/resposta.ts", "docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "tests/fontes-rota-chunked.test.ts contra next start (porta 3253, MAX_UPLOAD_MB=1): corpo chunked sem Content-Length de 14 MB com content-type multipart e conteúdo inválido recebe 413 corpo_grande_demais (o código antigo daria 422 entrada_invalida); um multipart válido com dois arquivos pequenos recebe 202."
    teste_funcional: "Um multipart de 3 arquivos de 400 KB com MAX_UPLOAD_MB=1 recebe 202 e os testes de upload existentes (fontes-rota-upload, fontes-rota, fontes-rota-formatos, fontes-rota-ciclo) seguem verdes."
    criterio_aceite: "Os testes passam depois de npm run build e o de corpo chunked falha (422 no lugar de 413) quando a rota volta a chamar request.formData() direto (mutação registrada); a prova de bytes lidos fica na T-03.01."
    depende_de: ["T-03.01"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-03.03
    titulo: "Extração isolada em processo filho"
    fase: F-03.2
    status: pendente
    objetivo: "Criar extrairTextoIsolado e o trabalhador que roda a extração num processo encerrável, com limite de páginas conferido ao abrir (PR-107)."
    arquivos:
      cria: ["src/lib/extracao/isolada.ts", "src/lib/extracao/trabalhador.ts", "tests/extracao-isolada.test.ts", "tests/apoio/trabalhador-travado.mjs"]
      altera: ["docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "extrairTextoIsolado roda o trabalhador real (node --import tsx) sobre um PDF de 3 páginas e devolve o texto, e com o comando injetado apontando para um script que trava o filho é morto no prazo de 1 s com o erro extracao_demorou."
    teste_funcional: "O PDF de 501 páginas devolve pdf_paginas_demais sem texto, um DOCX e um HTML válidos devolvem o texto, bytes inválidos devolvem conteudo_invalido e o processo filho não existe depois do prazo."
    criterio_aceite: "tests/extracao-isolada.test.ts passa e falha quando o encerramento por prazo é removido (mutação registrada)."
    depende_de: ["T-03.02"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-03.04
    titulo: "Fila usa a extração isolada para PDF, DOCX e HTML"
    fase: F-03.2
    status: pendente
    objetivo: "Trocar o extrair padrão da fila para escolher o processo filho nos formatos pesados (PR-107)."
    arquivos:
      cria: ["tests/fontes-fila-extracao.test.ts"]
      altera: ["src/servicos/fontes-fila.ts", "src/lib/extracao/isolada.ts", "tests/fontes-fila.test.ts", "tests/fontes-ciclo.test.ts", "tests/fontes-arquivos.test.ts", "tests/fontes-rota.test.ts", "tests/fontes-rota-upload.test.ts", "tests/fontes-rota-formatos.test.ts", "tests/fontes-rota-ciclo.test.ts", "docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "tests/fontes-fila-extracao.test.ts com banco real: OpcoesDaFila ganha extrairIsolado (padrão extrairTextoIsolado) e a fila leva um PDF de 3 páginas a pronto, um PDF de 501 páginas a erro com a mensagem do limite e, com extrairIsolado travado e prazo de 1 s, a fonte vira erro com A leitura do arquivo demorou demais e foi interrompida."
    teste_funcional: "Um espião em extrairIsolado prova que PDF, DOCX e HTML passam por ele e TXT e CSV não, e os testes de fila e de rota existentes seguem verdes (com a duração medida; os que estourarem o tempo injetam extrair ou sobem o testTimeout, declarados em altera)."
    criterio_aceite: "Os testes passam e falham quando a fila volta a chamar extrairTexto para PDF (mutação registrada)."
    depende_de: ["T-03.03"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-03.05
    titulo: "Extração isolada sob o build do Next"
    fase: F-03.2
    status: pendente
    objetivo: "Provar o processo filho sob next build e next start, ou registrar o motivo se inviável (PR-107, PEND-27)."
    arquivos:
      cria: ["tests/fontes-rota-pdf-isolado.test.ts"]
      altera: ["docs/robustez-de-midia-e-operacao/MUTACOES.md", "docs/robustez-de-midia-e-operacao/00-BLOQUEIOS.md", "src/lib/extracao/isolada.ts", "src/servicos/fontes-fila.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "Contra next start (porta 3254) o upload de um PDF de 3 páginas pela rota vira fonte pronta com o texto e o de 501 páginas vira erro pdf_paginas_demais, o que prova o filho sob o build do Next."
    teste_funcional: "npm run build termina com código 0 e o servidor de produção segue respondendo enquanto o filho processa o PDF."
    criterio_aceite: "O teste passa; se o filho não funcionar sob o build, a constante EXTRACAO_ISOLADA_ATIVA de src/lib/extracao/isolada.ts passa a false (a fila volta a extrairTexto), um teste prova esse estado, a saída é registrada em 00-BLOQUEIOS.md e a PEND-27 vira decisao_humana no fechamento em vez de entregar algo frágil; nos dois ramos a task conclui."
    depende_de: ["T-03.04"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 03

> Um bloco por task. Na execução (F6) a linha `status` muda em cada transição; ao concluir, acrescente data e resultado da suíte.

---

```yaml
id: T-03.01
titulo: "Leitor de corpo com teto em stream"
objetivo: "Criar lerCorpoLimitado, que lê um stream contando bytes e cancela ao passar do teto (PR-106)."
arquivos:
  cria: ["docs/robustez-de-midia-e-operacao/sprint-03/sprint.md", "docs/robustez-de-midia-e-operacao/sprint-03/fases.md", "docs/robustez-de-midia-e-operacao/sprint-03/tasks.md", "src/lib/corpo-limitado.ts", "tests/corpo-limitado.test.ts"]
  altera: ["docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
teste_integracao: "Um stream de pedaços de 64 KB com contador de pedaços puxados e teto de 1 MB: ao passar do teto lerCorpoLimitado lança CorpoGrandeDemais, cancela o stream e puxou no máximo 17 pedaços."
teste_funcional: "Corpo de 100 KB sob teto de 1 MB devolve os 100 KB, corpo exatamente do teto passa, um byte acima lança e corpo nulo devolve vazio."
criterio_aceite: "tests/corpo-limitado.test.ts passa e falha quando a contagem de bytes é removida (mutação registrada)."
depende_de: ["T-01.04"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/corpo-limitado 5 passed; mutação registrada
```

---

```yaml
id: T-03.02
titulo: "Rota de documentos com corpo limitado"
objetivo: "Fazer o POST de documentos ler o corpo por lerCorpoLimitado e só então o multipart, com 413 inclusive para corpo chunked (PR-106)."
arquivos:
  cria: ["tests/fontes-rota-chunked.test.ts"]
  altera: ["src/app/api/agentes/[id]/fontes/route.ts", "src/app/api/agentes/[id]/fontes/resposta.ts", "docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
teste_integracao: "tests/fontes-rota-chunked.test.ts contra next start (porta 3253, MAX_UPLOAD_MB=1): corpo chunked sem Content-Length de 14 MB com content-type multipart e conteúdo inválido recebe 413 corpo_grande_demais (o código antigo daria 422 entrada_invalida); um multipart válido com dois arquivos pequenos recebe 202."
teste_funcional: "Um multipart de 3 arquivos de 400 KB com MAX_UPLOAD_MB=1 recebe 202 e os testes de upload existentes (fontes-rota-upload, fontes-rota, fontes-rota-formatos, fontes-rota-ciclo) seguem verdes."
criterio_aceite: "Os testes passam depois de npm run build e o de corpo chunked falha (422 no lugar de 413) quando a rota volta a chamar request.formData() direto (mutação registrada); a prova de bytes lidos fica na T-03.01."
depende_de: ["T-03.01"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — fontes-rota-chunked, fontes-rota-upload, fontes-rota, fontes-rota-formatos, fontes-rota-ciclo, video-rota e projeto: 271 passed após npm run build; mutação registrada
```

---

```yaml
id: T-03.03
titulo: "Extração isolada em processo filho"
objetivo: "Criar extrairTextoIsolado e o trabalhador que roda a extração num processo encerrável, com limite de páginas conferido ao abrir (PR-107)."
arquivos:
  cria: ["src/lib/extracao/isolada.ts", "src/lib/extracao/trabalhador.ts", "tests/extracao-isolada.test.ts", "tests/apoio/trabalhador-travado.mjs"]
  altera: ["docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
teste_integracao: "extrairTextoIsolado roda o trabalhador real (node --import tsx) sobre um PDF de 3 páginas e devolve o texto, e com o comando injetado apontando para um script que trava o filho é morto no prazo de 1 s com o erro extracao_demorou."
teste_funcional: "O PDF de 501 páginas devolve pdf_paginas_demais sem texto, um DOCX e um HTML válidos devolvem o texto, bytes inválidos devolvem conteudo_invalido e o processo filho não existe depois do prazo."
criterio_aceite: "tests/extracao-isolada.test.ts passa e falha quando o encerramento por prazo é removido (mutação registrada)."
depende_de: ["T-03.02"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-03.04
titulo: "Fila usa a extração isolada para PDF, DOCX e HTML"
objetivo: "Trocar o extrair padrão da fila para escolher o processo filho nos formatos pesados (PR-107)."
arquivos:
  cria: ["tests/fontes-fila-extracao.test.ts"]
  altera: ["src/servicos/fontes-fila.ts", "src/lib/extracao/isolada.ts", "tests/fontes-fila.test.ts", "tests/fontes-ciclo.test.ts", "tests/fontes-arquivos.test.ts", "tests/fontes-rota.test.ts", "tests/fontes-rota-upload.test.ts", "tests/fontes-rota-formatos.test.ts", "tests/fontes-rota-ciclo.test.ts", "docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
teste_integracao: "tests/fontes-fila-extracao.test.ts com banco real: OpcoesDaFila ganha extrairIsolado (padrão extrairTextoIsolado) e a fila leva um PDF de 3 páginas a pronto, um PDF de 501 páginas a erro com a mensagem do limite e, com extrairIsolado travado e prazo de 1 s, a fonte vira erro com A leitura do arquivo demorou demais e foi interrompida."
teste_funcional: "Um espião em extrairIsolado prova que PDF, DOCX e HTML passam por ele e TXT e CSV não, e os testes de fila e de rota existentes seguem verdes (com a duração medida; os que estourarem o tempo injetam extrair ou sobem o testTimeout, declarados em altera)."
criterio_aceite: "Os testes passam e falham quando a fila volta a chamar extrairTexto para PDF (mutação registrada)."
depende_de: ["T-03.03"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-03.05
titulo: "Extração isolada sob o build do Next"
objetivo: "Provar o processo filho sob next build e next start, ou registrar o motivo se inviável (PR-107, PEND-27)."
arquivos:
  cria: ["tests/fontes-rota-pdf-isolado.test.ts"]
  altera: ["docs/robustez-de-midia-e-operacao/MUTACOES.md", "docs/robustez-de-midia-e-operacao/00-BLOQUEIOS.md", "src/lib/extracao/isolada.ts", "src/servicos/fontes-fila.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
teste_integracao: "Contra next start (porta 3254) o upload de um PDF de 3 páginas pela rota vira fonte pronta com o texto e o de 501 páginas vira erro pdf_paginas_demais, o que prova o filho sob o build do Next."
teste_funcional: "npm run build termina com código 0 e o servidor de produção segue respondendo enquanto o filho processa o PDF."
criterio_aceite: "O teste passa; se o filho não funcionar sob o build, a constante EXTRACAO_ISOLADA_ATIVA de src/lib/extracao/isolada.ts passa a false (a fila volta a extrairTexto), um teste prova esse estado, a saída é registrada em 00-BLOQUEIOS.md e a PEND-27 vira decisao_humana no fechamento em vez de entregar algo frágil; nos dois ramos a task conclui."
depende_de: ["T-03.04"]
paralelizavel: false
status: pendente
```

