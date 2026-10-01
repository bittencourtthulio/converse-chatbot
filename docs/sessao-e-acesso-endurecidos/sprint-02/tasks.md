---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: sessao-e-acesso-endurecidos
origem_buildx: plataforma-chatbot-ia
feature_id: FT-12
sprint_id: sprint-02
atualizado_em: 2026-10-01
tasks:
  - id: T-02.01
    titulo: "Migration e modelos da sessao revogavel"
    fase: F-02.1
    status: concluida
    objetivo: "Acrescentar a tabela sessoes_revogadas e a coluna usuarios.versaoDaSessao por migration que so acrescenta, com os modelos do Prisma."
    arquivos:
      cria: ["docs/sessao-e-acesso-endurecidos/sprint-02/sprint.md", "docs/sessao-e-acesso-endurecidos/sprint-02/fases.md", "docs/sessao-e-acesso-endurecidos/sprint-02/tasks.md", "prisma/migrations/20261003000000_sessao_e_acesso_endurecidos/migration.sql", "tests/sessao-esquema.test.ts"]
      altera: ["prisma/schema.prisma", "tests/ajuda.ts"]
    teste_integracao: "O banco criado por migrate deploy do zero tem a tabela sessoes_revogadas com jti unico e indice em expiraEm e a coluna versaoDaSessao inteira com padrao 0, e tests/migracoes.test.ts segue passando."
    teste_funcional: "Um usuario inserido por SQL sem a coluna nova le versaoDaSessao 0 pelo Prisma e dois registros com o mesmo jti violam a unicidade."
    criterio_aceite: "npx prisma generate executado, tests/sessao-esquema.test.ts e tests/migracoes.test.ts passam e limparBanco apaga a tabela nova."
    depende_de: ["T-01.03"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: verde
  - id: T-02.02
    titulo: "SESSAO_MAXIMA_HORAS no ambiente"
    fase: F-02.1
    status: concluida
    objetivo: "Ler SESSAO_MAXIMA_HORAS so em src/lib/ambiente.ts (padrao 12), valida-la no start de producao e documenta-la."
    arquivos:
      cria: []
      altera: ["src/lib/ambiente.ts", ".env.example", "README.md", "tests/ambiente.test.ts", "tests/ambiente-validar.test.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "ambiente.sessaoMaximaHoras le a variavel com padrao 12 e validarAmbiente em producao a lista entre as opcionais invalidas."
    teste_funcional: "Sem a variavel o valor e 12, com 3 e 3, e com 0 ou abc o getter lanca e o start de producao cita SESSAO_MAXIMA_HORAS sem repetir o valor."
    criterio_aceite: "Os testes de ambiente passam, o exemplo de ambiente documenta a variavel sem valor secreto e a tabela do README tem a linha dela (tests/projeto.test.ts) e as citacoes arquivo:linha de tests/projeto.test.ts, CONVENCOES.md e LACUNAS.md foram reajustadas."
    depende_de: ["T-02.01"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: verde
  - id: T-02.03
    titulo: "Token de sessao com jti, versao, inicio e relogio injetavel"
    fase: F-02.2
    status: concluida
    objetivo: "Fazer assinarSessao e lerSessao carregarem jti, versao e inicio, limitarem o exp ao limite absoluto e aceitarem o relogio por parametro, sem quebrar a chamada de duas posicoes; a troca de senha passa a chamar a forma nova com o corte atual para a suite seguir verde."
    arquivos:
      cria: ["tests/sessao-token.test.ts"]
      altera: ["src/lib/sessao.ts", "src/servicos/perfil.ts", "docs/sessao-e-acesso-endurecidos/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "tests/sessao-token.test.ts assina e le o token com relogio injetado e confere as claims jti, v e ini e o exp igual ao menor entre iat mais o TTL e ini mais o maximo."
    teste_funcional: "Um token sem jti, sem v ou sem ini e recusado com 401, um token adulterado ou de outro segredo tambem, e o token lido depois do exp injetado e recusado; com SESSAO_MAXIMA_HORAS=1 e JWT_TTL_SEGUNDOS=7200 o exp do login e iat mais 3600, nao mais 7200."
    criterio_aceite: "tests/sessao-token.test.ts passa e falha quando a conferencia do jti e removida e quando o teto ini mais maximo sai do exp (mutacoes registradas) e as citacoes arquivo:linha de tests/projeto.test.ts, CONVENCOES.md e LACUNAS.md foram reajustadas."
    depende_de: ["T-02.02"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-02.04
    titulo: "Atributos do cookie de sessao provados"
    fase: F-02.2
    status: concluida
    objetivo: "Provar HttpOnly, SameSite lax, Path /, Secure em producao e Max-Age coerente de opcoesDoCookie, com o Max-Age por parametro."
    arquivos:
      cria: ["tests/sessao-cookie.test.ts"]
      altera: ["src/lib/sessao.ts", "docs/sessao-e-acesso-endurecidos/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "tests/sessao-cookie.test.ts chama opcoesDoCookie com NODE_ENV test e production e confere cada atributo."
    teste_funcional: "Em teste secure e false, em producao e true, httpOnly e sempre true, sameSite e lax, path e / e maxAge e o TTL ou o valor passado."
    criterio_aceite: "tests/sessao-cookie.test.ts passa e falha quando httpOnly vira false, quando secure ignora producao ou quando sameSite muda (mutacao registrada) e as citacoes arquivo:linha de tests/projeto.test.ts, CONVENCOES.md e LACUNAS.md foram reajustadas."
    depende_de: ["T-02.03"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: parcial
  - id: T-02.05
    titulo: "Entrar, validar e revogar a sessao no servico"
    fase: F-02.2
    status: concluida
    objetivo: "Fazer entrar emitir jti e aceitar o relogio por parametro, usuarioDaSessao conferir revogacao e limite absoluto com relogio injetado (mantendo por ora o corte da troca de senha) e criar revogarSessao."
    arquivos:
      cria: ["tests/sessao-revogacao.test.ts"]
      altera: ["src/servicos/autenticacao.ts", "tests/autenticacao.test.ts", "docs/sessao-e-acesso-endurecidos/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "tests/sessao-revogacao.test.ts faz login real, revoga o token e prova que usuarioDaSessao o recusa com 401 enquanto uma segunda sessao do mesmo usuario continua valida."
    teste_funcional: "Revogar duas vezes nao falha e grava uma linha com expiraEm igual a ini mais o maximo, token adulterado ou expirado e ignorado sem linha e sem erro, e um token forjado com inicio antigo (assinarSessao com inicio e agora injetados) e exp ainda valido recebe 401 pela conferencia de ini mais o maximo, nao pela expiracao."
    criterio_aceite: "tests/sessao-revogacao.test.ts e tests/autenticacao.test.ts passam e falham quando a conferencia de revogados ou a de ini mais o maximo e removida (mutacoes registradas) e as citacoes arquivo:linha de tests/projeto.test.ts, CONVENCOES.md e LACUNAS.md foram reajustadas."
    depende_de: ["T-02.01", "T-02.03"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: verde
  - id: T-02.06
    titulo: "Troca de senha por versao de sessao"
    fase: F-02.3
    status: concluida
    objetivo: "Trocar, na mesma task, a leitura do corte por relogio em usuarioDaSessao e a gravacao em trocarSenha pela versaoDaSessao: entrar emite a versao, trocarSenha a incrementa e o token novo nasce na versao nova."
    arquivos:
      cria: ["tests/sessao-versao.test.ts"]
      altera: ["src/servicos/perfil.ts", "src/servicos/autenticacao.ts", "tests/perfil.test.ts", "tests/sessao-revogacao.test.ts", "docs/sessao-e-acesso-endurecidos/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "tests/sessao-versao.test.ts troca a senha e faz login no mesmo instante, sem esperar, e o login novo e o token devolvido pela troca valem enquanto o token anterior cai."
    teste_funcional: "Duas trocas seguidas deixam so o token da ultima e os logins posteriores validos, a versao vai de 0 a 1 e a 2, e um usuario existente de versao 0 mantem o token v0 valido ate a troca."
    criterio_aceite: "tests/sessao-versao.test.ts e tests/perfil.test.ts passam e falham quando o incremento da versao e removido (mutacao registrada) e as citacoes arquivo:linha de tests/projeto.test.ts, CONVENCOES.md e LACUNAS.md foram reajustadas."
    depende_de: ["T-02.05"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: verde
  - id: T-02.07
    titulo: "Renovacao deslizante com limite absoluto"
    fase: F-02.3
    status: concluida
    objetivo: "Criar renovarSessaoSePreciso, que reemite o token com o mesmo jti depois da metade da vida e nunca alem do limite absoluto."
    arquivos:
      cria: ["tests/sessao-renovacao.test.ts"]
      altera: ["src/servicos/autenticacao.ts", "docs/sessao-e-acesso-endurecidos/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "tests/sessao-renovacao.test.ts usa relogio injetado: antes da metade nao renova, depois renova com o mesmo jti, v e ini e exp igual a agora mais o TTL."
    teste_funcional: "Quem usa a cada 8 minutos continua logado alem de 15 minutos e ate o limite de 12 horas, quem some por 16 minutos cai, o exp nunca passa de ini mais o maximo, e token revogado ou de versao antiga nao renova."
    criterio_aceite: "tests/sessao-renovacao.test.ts passa e falha quando o teto do limite absoluto e removido (mutacao registrada) e as citacoes arquivo:linha de tests/projeto.test.ts, CONVENCOES.md e LACUNAS.md foram reajustadas."
    depende_de: ["T-02.06"]
    paralelizavel: false
    concluida_em: 2026-10-01
    suite: verde
  - id: T-02.08
    titulo: "Expurgo das revogacoes vencidas"
    fase: F-02.3
    status: pendente
    objetivo: "Fazer o expurgo apagar as sessoes revogadas com expiraEm no passado e devolver a contagem."
    arquivos:
      cria: ["tests/expurgo-sessoes.test.ts"]
      altera: ["src/servicos/expurgo.ts", "tests/expurgo.test.ts", "tests/expurgo-agendador.test.ts", "docs/sessao-e-acesso-endurecidos/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
    teste_integracao: "executarExpurgo com agora injetado apaga as revogacoes com expiraEm anterior a agora e mantem as demais, no banco de teste."
    teste_funcional: "A contagem sessoesRevogadas sai no resultado, uma segunda rodada apaga zero e revogacoes sozinhas nao geram a auditoria expurgo_automatico."
    criterio_aceite: "tests/expurgo-sessoes.test.ts e os testes de expurgo existentes passam e o novo falha quando a limpeza e removida (mutacao registrada) e as citacoes arquivo:linha de tests/projeto.test.ts, CONVENCOES.md e LACUNAS.md foram reajustadas."
    depende_de: ["T-02.05"]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 02

> Um bloco por task. Na execução (F6) a linha `status` muda em cada transição; ao concluir, acrescente data e resultado da suíte.

---

```yaml
id: T-02.01
titulo: "Migration e modelos da sessao revogavel"
objetivo: "Acrescentar a tabela sessoes_revogadas e a coluna usuarios.versaoDaSessao por migration que so acrescenta, com os modelos do Prisma."
arquivos:
  cria: ["docs/sessao-e-acesso-endurecidos/sprint-02/sprint.md", "docs/sessao-e-acesso-endurecidos/sprint-02/fases.md", "docs/sessao-e-acesso-endurecidos/sprint-02/tasks.md", "prisma/migrations/20261003000000_sessao_e_acesso_endurecidos/migration.sql", "tests/sessao-esquema.test.ts"]
  altera: ["prisma/schema.prisma", "tests/ajuda.ts"]
teste_integracao: "O banco criado por migrate deploy do zero tem a tabela sessoes_revogadas com jti unico e indice em expiraEm e a coluna versaoDaSessao inteira com padrao 0, e tests/migracoes.test.ts segue passando."
teste_funcional: "Um usuario inserido por SQL sem a coluna nova le versaoDaSessao 0 pelo Prisma e dois registros com o mesmo jti violam a unicidade."
criterio_aceite: "npx prisma generate executado, tests/sessao-esquema.test.ts e tests/migracoes.test.ts passam e limparBanco apaga a tabela nova."
depende_de: ["T-01.03"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: verde — suíte inteira: 246 arquivos, 2881 passed, 9 skipped, 0 failed; build antes
```

---

```yaml
id: T-02.02
titulo: "SESSAO_MAXIMA_HORAS no ambiente"
objetivo: "Ler SESSAO_MAXIMA_HORAS so em src/lib/ambiente.ts (padrao 12), valida-la no start de producao e documenta-la."
arquivos:
  cria: []
  altera: ["src/lib/ambiente.ts", ".env.example", "README.md", "tests/ambiente.test.ts", "tests/ambiente-validar.test.ts", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
teste_integracao: "ambiente.sessaoMaximaHoras le a variavel com padrao 12 e validarAmbiente em producao a lista entre as opcionais invalidas."
teste_funcional: "Sem a variavel o valor e 12, com 3 e 3, e com 0 ou abc o getter lanca e o start de producao cita SESSAO_MAXIMA_HORAS sem repetir o valor."
criterio_aceite: "Os testes de ambiente passam, o exemplo de ambiente documenta a variavel sem valor secreto e a tabela do README tem a linha dela (tests/projeto.test.ts) e as citacoes arquivo:linha de tests/projeto.test.ts, CONVENCOES.md e LACUNAS.md foram reajustadas."
depende_de: ["T-02.01"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: verde — suíte inteira: 246 arquivos, 2885 passed, 9 skipped, 0 failed; citações de ambiente.ts reajustadas
```

---

```yaml
id: T-02.03
titulo: "Token de sessao com jti, versao, inicio e relogio injetavel"
objetivo: "Fazer assinarSessao e lerSessao carregarem jti, versao e inicio, limitarem o exp ao limite absoluto e aceitarem o relogio por parametro, sem quebrar a chamada de duas posicoes; a troca de senha passa a chamar a forma nova com o corte atual para a suite seguir verde."
arquivos:
  cria: ["tests/sessao-token.test.ts"]
  altera: ["src/lib/sessao.ts", "src/servicos/perfil.ts", "docs/sessao-e-acesso-endurecidos/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
teste_integracao: "tests/sessao-token.test.ts assina e le o token com relogio injetado e confere as claims jti, v e ini e o exp igual ao menor entre iat mais o TTL e ini mais o maximo."
teste_funcional: "Um token sem jti, sem v ou sem ini e recusado com 401, um token adulterado ou de outro segredo tambem, e o token lido depois do exp injetado e recusado; com SESSAO_MAXIMA_HORAS=1 e JWT_TTL_SEGUNDOS=7200 o exp do login e iat mais 3600, nao mais 7200."
criterio_aceite: "tests/sessao-token.test.ts passa e falha quando a conferencia do jti e removida e quando o teto ini mais maximo sai do exp (mutacoes registradas) e as citacoes arquivo:linha de tests/projeto.test.ts, CONVENCOES.md e LACUNAS.md foram reajustadas."
depende_de: ["T-02.02"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — suíte inteira rodou: 2894 passed e 1 falha intermitente alheia (tests/embed-pagina.test.ts: o código de correlação aleatório 5c5a4321 contém 4321; o arquivo isolado passa, 10 passed); por isso parcial, e a próxima suíte inteira cobre
```

---

```yaml
id: T-02.04
titulo: "Atributos do cookie de sessao provados"
objetivo: "Provar HttpOnly, SameSite lax, Path /, Secure em producao e Max-Age coerente de opcoesDoCookie, com o Max-Age por parametro."
arquivos:
  cria: ["tests/sessao-cookie.test.ts"]
  altera: ["src/lib/sessao.ts", "docs/sessao-e-acesso-endurecidos/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
teste_integracao: "tests/sessao-cookie.test.ts chama opcoesDoCookie com NODE_ENV test e production e confere cada atributo."
teste_funcional: "Em teste secure e false, em producao e true, httpOnly e sempre true, sameSite e lax, path e / e maxAge e o TTL ou o valor passado."
criterio_aceite: "tests/sessao-cookie.test.ts passa e falha quando httpOnly vira false, quando secure ignora producao ou quando sameSite muda (mutacao registrada) e as citacoes arquivo:linha de tests/projeto.test.ts, CONVENCOES.md e LACUNAS.md foram reajustadas."
depende_de: ["T-02.03"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: parcial — tests/sessao-cookie.test.ts 5 passed e testes de sessão, autenticação, perfil e projeto verdes
```

---

```yaml
id: T-02.05
titulo: "Entrar, validar e revogar a sessao no servico"
objetivo: "Fazer entrar emitir jti e aceitar o relogio por parametro, usuarioDaSessao conferir revogacao e limite absoluto com relogio injetado (mantendo por ora o corte da troca de senha) e criar revogarSessao."
arquivos:
  cria: ["tests/sessao-revogacao.test.ts"]
  altera: ["src/servicos/autenticacao.ts", "tests/autenticacao.test.ts", "docs/sessao-e-acesso-endurecidos/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
teste_integracao: "tests/sessao-revogacao.test.ts faz login real, revoga o token e prova que usuarioDaSessao o recusa com 401 enquanto uma segunda sessao do mesmo usuario continua valida."
teste_funcional: "Revogar duas vezes nao falha e grava uma linha com expiraEm igual a ini mais o maximo, token adulterado ou expirado e ignorado sem linha e sem erro, e um token forjado com inicio antigo (assinarSessao com inicio e agora injetados) e exp ainda valido recebe 401 pela conferencia de ini mais o maximo, nao pela expiracao."
criterio_aceite: "tests/sessao-revogacao.test.ts e tests/autenticacao.test.ts passam e falham quando a conferencia de revogados ou a de ini mais o maximo e removida (mutacoes registradas) e as citacoes arquivo:linha de tests/projeto.test.ts, CONVENCOES.md e LACUNAS.md foram reajustadas."
depende_de: ["T-02.01", "T-02.03"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: verde — suíte inteira: 249 arquivos, 2905 passed, 9 skipped, 0 failed
```

---

```yaml
id: T-02.06
titulo: "Troca de senha por versao de sessao"
objetivo: "Trocar, na mesma task, a leitura do corte por relogio em usuarioDaSessao e a gravacao em trocarSenha pela versaoDaSessao: entrar emite a versao, trocarSenha a incrementa e o token novo nasce na versao nova."
arquivos:
  cria: ["tests/sessao-versao.test.ts"]
  altera: ["src/servicos/perfil.ts", "src/servicos/autenticacao.ts", "tests/perfil.test.ts", "tests/sessao-revogacao.test.ts", "docs/sessao-e-acesso-endurecidos/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
teste_integracao: "tests/sessao-versao.test.ts troca a senha e faz login no mesmo instante, sem esperar, e o login novo e o token devolvido pela troca valem enquanto o token anterior cai."
teste_funcional: "Duas trocas seguidas deixam so o token da ultima e os logins posteriores validos, a versao vai de 0 a 1 e a 2, e um usuario existente de versao 0 mantem o token v0 valido ate a troca."
criterio_aceite: "tests/sessao-versao.test.ts e tests/perfil.test.ts passam e falham quando o incremento da versao e removido (mutacao registrada) e as citacoes arquivo:linha de tests/projeto.test.ts, CONVENCOES.md e LACUNAS.md foram reajustadas."
depende_de: ["T-02.05"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: verde — suíte inteira: 250 arquivos, 2910 passed, 9 skipped, 0 failed
```

---

```yaml
id: T-02.07
titulo: "Renovacao deslizante com limite absoluto"
objetivo: "Criar renovarSessaoSePreciso, que reemite o token com o mesmo jti depois da metade da vida e nunca alem do limite absoluto."
arquivos:
  cria: ["tests/sessao-renovacao.test.ts"]
  altera: ["src/servicos/autenticacao.ts", "docs/sessao-e-acesso-endurecidos/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
teste_integracao: "tests/sessao-renovacao.test.ts usa relogio injetado: antes da metade nao renova, depois renova com o mesmo jti, v e ini e exp igual a agora mais o TTL."
teste_funcional: "Quem usa a cada 8 minutos continua logado alem de 15 minutos e ate o limite de 12 horas, quem some por 16 minutos cai, o exp nunca passa de ini mais o maximo, e token revogado ou de versao antiga nao renova."
criterio_aceite: "tests/sessao-renovacao.test.ts passa e falha quando o teto do limite absoluto e removido (mutacao registrada) e as citacoes arquivo:linha de tests/projeto.test.ts, CONVENCOES.md e LACUNAS.md foram reajustadas."
depende_de: ["T-02.06"]
paralelizavel: false
status: concluida   # 2026-10-01 · suíte: verde — suíte inteira: 251 arquivos, 2917 passed, 9 skipped, 0 failed
```

---

```yaml
id: T-02.08
titulo: "Expurgo das revogacoes vencidas"
objetivo: "Fazer o expurgo apagar as sessoes revogadas com expiraEm no passado e devolver a contagem."
arquivos:
  cria: ["tests/expurgo-sessoes.test.ts"]
  altera: ["src/servicos/expurgo.ts", "tests/expurgo.test.ts", "tests/expurgo-agendador.test.ts", "docs/sessao-e-acesso-endurecidos/MUTACOES.md", "tests/projeto.test.ts", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md"]
teste_integracao: "executarExpurgo com agora injetado apaga as revogacoes com expiraEm anterior a agora e mantem as demais, no banco de teste."
teste_funcional: "A contagem sessoesRevogadas sai no resultado, uma segunda rodada apaga zero e revogacoes sozinhas nao geram a auditoria expurgo_automatico."
criterio_aceite: "tests/expurgo-sessoes.test.ts e os testes de expurgo existentes passam e o novo falha quando a limpeza e removida (mutacao registrada) e as citacoes arquivo:linha de tests/projeto.test.ts, CONVENCOES.md e LACUNAS.md foram reajustadas."
depende_de: ["T-02.05"]
paralelizavel: false
status: pendente
```
