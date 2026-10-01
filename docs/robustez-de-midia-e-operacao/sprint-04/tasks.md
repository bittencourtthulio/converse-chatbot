---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: robustez-de-midia-e-operacao
origem_buildx: plataforma-chatbot-ia
feature_id: FT-13
sprint_id: sprint-04
atualizado_em: 2026-10-01
tasks:
  - id: T-04.01
    titulo: "Trava com batimento do servidor"
    fase: F-04.1
    status: pendente
    objetivo: "Criar o módulo da trava .servidor.lock com batimento, avaliação e conferência para a restauração (PR-108)."
    arquivos:
      cria: ["docs/robustez-de-midia-e-operacao/sprint-04/sprint.md", "docs/robustez-de-midia-e-operacao/sprint-04/fases.md", "docs/robustez-de-midia-e-operacao/sprint-04/tasks.md", "src/lib/trava-do-servidor.ts", "tests/trava-do-servidor.test.ts"]
      altera: ["docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "iniciarBatimento com diretório temporário e relógio falso grava .servidor.lock com pid, host, iniciadoEm e batimentoEm, o regrava a cada 10 s e parar remove só a trava própria."
    teste_funcional: "avaliarTrava devolve viva para batimento de 5 s atrás, velha para 31 s atrás e ausente sem arquivo, e conferirTravaParaRestaurar recusa a viva sem forcar, avisa com forcar e ignora a velha com aviso."
    criterio_aceite: "tests/trava-do-servidor.test.ts passa e falha quando o limite de 30 s é removido (mutação registrada)."
    depende_de: ["T-03.04"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-04.02
    titulo: "Servidor grava e remove a trava"
    fase: F-04.1
    status: pendente
    objetivo: "Ligar o batimento em register(), removê-lo no desligamento limpo e ao sair do processo e ignorar o arquivo no git."
    arquivos:
      cria: ["tests/trava-do-servidor-producao.test.ts", "tests/setup-trava.ts"]
      altera: ["src/instrumentation.ts", ".gitignore", "vitest.config.ts", "tests/apoio/servidor.ts", "tests/instrumentacao.test.ts", "docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "Contra next start (porta 3255) o .servidor.lock aparece no diretório do banco com batimento fresco e some depois do SIGTERM, e register() chamado nos testes mais desligarComCalma removem a trava."
    teste_funcional: "tests/setup-trava.ts (afterAll global, no setupFiles do vitest) apaga .servidor.lock do diretório do banco de teste, de modo que nenhum teste deixa trava em prisma/ mesmo quando o servidor filho é morto sem desligamento limpo, e o .gitignore contém .servidor.lock."
    criterio_aceite: "Os testes passam e o de produção falha quando register() deixa de iniciar o batimento (mutação registrada)."
    depende_de: ["T-04.01"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-04.03
    titulo: "Restauração recusa servidor de pé em outro contêiner"
    fase: F-04.1
    status: pendente
    objetivo: "Fazer npm run restore ler a trava antes da recusa HTTP e atualizar o README e o teste fim a fim (PR-108)."
    arquivos:
      cria: []
      altera: ["scripts/restore.ts", "README.md", "tests/restauracao-comando.test.ts", "tests/restauracao-fim-a-fim.test.ts", "docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "tests/restauracao-comando.test.ts roda o comando real com um .servidor.lock de outro host e batimento fresco no diretório do banco e o comando sai com 1 e a mensagem da recusa sem tocar na instalação."
    teste_funcional: "Com --forcar o comando avisa e restaura, com a trava velha (mais de 30 s) ignora com aviso e restaura, sem trava restaura, o tar de um backup gerado com a trava presente não contém .servidor.lock, a restauração preserva a trava do diretório e o fim a fim da restauração continua verde."
    criterio_aceite: "Os testes passam e falham quando a leitura da trava é removida de scripts/restore.ts (mutação registrada) e o README descreve a trava, o --forcar e os 30 s."
    depende_de: ["T-04.02"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-04.04
    titulo: "Auditoria que falha fechada em produção"
    fase: F-04.2
    status: pendente
    objetivo: "Fazer register() derrubar o start em produção quando ligarAuditoria falhar e registrar o estado fora dela (PR-111)."
    arquivos:
      cria: ["tests/instrumentacao-auditoria.test.ts"]
      altera: ["src/instrumentation.ts", "src/servicos/auditoria-ouvintes.ts", "src/lib/ambiente.ts", "tests/ambiente.test.ts", "README.md", "docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "tests/instrumentacao-auditoria.test.ts com ligarAuditoria simulado para lançar: com NODE_ENV production register() rejeita com A trilha de auditoria não pôde ser ligada e o servidor não sobe sem ela. sem dado sensível no log, e fora de produção resolve e registra a falha."
    teste_funcional: "auditoriaLigada() é false antes de ligar e true depois, ambiente.auditoriaExigida é true só com NODE_ENV production e o log traz só o nome do erro."
    criterio_aceite: "Os testes passam e falham quando a falha volta a ser só log em produção (mutação registrada), e o README e a validação de ambiente citam a regra."
    depende_de: ["T-04.03"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-04.05
    titulo: "Saúde e tela Sistema mostram a trilha de auditoria"
    fase: F-04.2
    status: pendente
    objetivo: "Acrescentar o item auditoria à saúde (degradado se falhou) e a linha Trilha de auditoria à tela Sistema (PR-111)."
    arquivos:
      cria: []
      altera: ["src/servicos/saude.ts", "src/servicos/sistema.ts", "src/componentes/sistema-logica.ts", "src/componentes/PainelDoSistema.tsx", "tests/saude.test.ts", "tests/sistema.test.ts", "tests/painel-do-sistema.test.tsx", "tests/sistema-logica.test.ts", "tests/saude-rota.test.ts", "tests/backup-ui.test.tsx", "tests/sistema-pagina.test.tsx", "tests/sistema-estilos.test.ts", "docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "tests/saude-rota.test.ts e tests/sistema.test.ts: com a falha da auditoria registrada verificarSaude devolve status degradado com o item auditoria degradado, /api/saude responde 200 com status degradado e obterSistema devolve auditoria.ativa false."
    teste_funcional: "O PainelDoSistema renderiza Trilha de auditoria: ativa quando ligada e Trilha de auditoria: inativa quando não, e sem falha registrada a saúde segue ok."
    criterio_aceite: "Os testes passam e falham quando o item auditoria deixa de degradar a saúde (mutação registrada)."
    depende_de: ["T-04.04"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 04

> Um bloco por task. Na execução (F6) a linha `status` muda em cada transição; ao concluir, acrescente data e resultado da suíte.

---

```yaml
id: T-04.01
titulo: "Trava com batimento do servidor"
objetivo: "Criar o módulo da trava .servidor.lock com batimento, avaliação e conferência para a restauração (PR-108)."
arquivos:
  cria: ["docs/robustez-de-midia-e-operacao/sprint-04/sprint.md", "docs/robustez-de-midia-e-operacao/sprint-04/fases.md", "docs/robustez-de-midia-e-operacao/sprint-04/tasks.md", "src/lib/trava-do-servidor.ts", "tests/trava-do-servidor.test.ts"]
  altera: ["docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
teste_integracao: "iniciarBatimento com diretório temporário e relógio falso grava .servidor.lock com pid, host, iniciadoEm e batimentoEm, o regrava a cada 10 s e parar remove só a trava própria."
teste_funcional: "avaliarTrava devolve viva para batimento de 5 s atrás, velha para 31 s atrás e ausente sem arquivo, e conferirTravaParaRestaurar recusa a viva sem forcar, avisa com forcar e ignora a velha com aviso."
criterio_aceite: "tests/trava-do-servidor.test.ts passa e falha quando o limite de 30 s é removido (mutação registrada)."
depende_de: ["T-03.04"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-04.02
titulo: "Servidor grava e remove a trava"
objetivo: "Ligar o batimento em register(), removê-lo no desligamento limpo e ao sair do processo e ignorar o arquivo no git."
arquivos:
  cria: ["tests/trava-do-servidor-producao.test.ts", "tests/setup-trava.ts"]
  altera: ["src/instrumentation.ts", ".gitignore", "vitest.config.ts", "tests/apoio/servidor.ts", "tests/instrumentacao.test.ts", "docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
teste_integracao: "Contra next start (porta 3255) o .servidor.lock aparece no diretório do banco com batimento fresco e some depois do SIGTERM, e register() chamado nos testes mais desligarComCalma removem a trava."
teste_funcional: "tests/setup-trava.ts (afterAll global, no setupFiles do vitest) apaga .servidor.lock do diretório do banco de teste, de modo que nenhum teste deixa trava em prisma/ mesmo quando o servidor filho é morto sem desligamento limpo, e o .gitignore contém .servidor.lock."
criterio_aceite: "Os testes passam e o de produção falha quando register() deixa de iniciar o batimento (mutação registrada)."
depende_de: ["T-04.01"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-04.03
titulo: "Restauração recusa servidor de pé em outro contêiner"
objetivo: "Fazer npm run restore ler a trava antes da recusa HTTP e atualizar o README e o teste fim a fim (PR-108)."
arquivos:
  cria: []
  altera: ["scripts/restore.ts", "README.md", "tests/restauracao-comando.test.ts", "tests/restauracao-fim-a-fim.test.ts", "docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
teste_integracao: "tests/restauracao-comando.test.ts roda o comando real com um .servidor.lock de outro host e batimento fresco no diretório do banco e o comando sai com 1 e a mensagem da recusa sem tocar na instalação."
teste_funcional: "Com --forcar o comando avisa e restaura, com a trava velha (mais de 30 s) ignora com aviso e restaura, sem trava restaura, o tar de um backup gerado com a trava presente não contém .servidor.lock, a restauração preserva a trava do diretório e o fim a fim da restauração continua verde."
criterio_aceite: "Os testes passam e falham quando a leitura da trava é removida de scripts/restore.ts (mutação registrada) e o README descreve a trava, o --forcar e os 30 s."
depende_de: ["T-04.02"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-04.04
titulo: "Auditoria que falha fechada em produção"
objetivo: "Fazer register() derrubar o start em produção quando ligarAuditoria falhar e registrar o estado fora dela (PR-111)."
arquivos:
  cria: ["tests/instrumentacao-auditoria.test.ts"]
  altera: ["src/instrumentation.ts", "src/servicos/auditoria-ouvintes.ts", "src/lib/ambiente.ts", "tests/ambiente.test.ts", "README.md", "docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
teste_integracao: "tests/instrumentacao-auditoria.test.ts com ligarAuditoria simulado para lançar: com NODE_ENV production register() rejeita com A trilha de auditoria não pôde ser ligada e o servidor não sobe sem ela. sem dado sensível no log, e fora de produção resolve e registra a falha."
teste_funcional: "auditoriaLigada() é false antes de ligar e true depois, ambiente.auditoriaExigida é true só com NODE_ENV production e o log traz só o nome do erro."
criterio_aceite: "Os testes passam e falham quando a falha volta a ser só log em produção (mutação registrada), e o README e a validação de ambiente citam a regra."
depende_de: ["T-04.03"]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-04.05
titulo: "Saúde e tela Sistema mostram a trilha de auditoria"
objetivo: "Acrescentar o item auditoria à saúde (degradado se falhou) e a linha Trilha de auditoria à tela Sistema (PR-111)."
arquivos:
  cria: []
  altera: ["src/servicos/saude.ts", "src/servicos/sistema.ts", "src/componentes/sistema-logica.ts", "src/componentes/PainelDoSistema.tsx", "tests/saude.test.ts", "tests/sistema.test.ts", "tests/painel-do-sistema.test.tsx", "tests/sistema-logica.test.ts", "tests/saude-rota.test.ts", "tests/backup-ui.test.tsx", "tests/sistema-pagina.test.tsx", "tests/sistema-estilos.test.ts", "docs/robustez-de-midia-e-operacao/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
teste_integracao: "tests/saude-rota.test.ts e tests/sistema.test.ts: com a falha da auditoria registrada verificarSaude devolve status degradado com o item auditoria degradado, /api/saude responde 200 com status degradado e obterSistema devolve auditoria.ativa false."
teste_funcional: "O PainelDoSistema renderiza Trilha de auditoria: ativa quando ligada e Trilha de auditoria: inativa quando não, e sem falha registrada a saúde segue ok."
criterio_aceite: "Os testes passam e falham quando o item auditoria deixa de degradar a saúde (mutação registrada)."
depende_de: ["T-04.04"]
paralelizavel: false
status: pendente
```

