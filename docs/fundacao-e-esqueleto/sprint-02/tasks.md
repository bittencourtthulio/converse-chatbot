---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: fundacao-e-esqueleto
origem_buildx: plataforma-chatbot-ia
feature_id: FT-01
sprint_id: sprint-02
atualizado_em: 2026-09-30
sprint:
  titulo: "Servicos e seguranca: nome do produto, limite de uso, login limitado e cabecalhos"
  status: nao_iniciado
  criterio_saida: "npm test, npm run lint, npx tsc --noEmit e npm run build terminam com 0 falhas e o login recusa a sexta tentativa por minuto com mensagem em portugues."
  riscos: ["confiar em X-Forwarded-For sem proxy permite forjar o IP (PR-36, base/autenticacao-e-sessao.md)", "o limite em memoria vale por processo (PR-36)"]
  fora_de_escopo: ["limite de uso do chat publico e do Telegram - FT-06 e FT-07 apenas reutilizam o modulo"]
fases:
  - id: F-02.1
    titulo: "Servicos e seguranca"
    status: nao_iniciado
    criterio_saida: "todos os testes novos passam e o build de producao gera as rotas"
    paralelizavel: false
    paralela_com: []
    tasks: [T-02.01, T-02.02, T-02.03, T-02.04, T-02.05]
tasks:
  - id: T-02.01
    titulo: "Modulo limite-de-uso"
    fase: F-02.1
    status: pendente
    objetivo: "Criar a janela deslizante em memoria com relogio injetavel."
    arquivos:
      cria: ["src/lib/limite-de-uso.ts", "tests/limite-de-uso.test.ts"]
      altera: []
    teste_integracao: "tests/limite-de-uso.test.ts usa um relogio falso injetado em criarLimitador, sem timers reais."
    teste_funcional: "Com max 3 e janela de 1000 ms, as tres primeiras chamadas devolvem permitido true com restante 2, 1 e 0, a quarta devolve permitido false e reiniciaEmMs igual ao tempo ate a chamada mais antiga sair da janela, e apos avancar o relogio 1000 ms volta a permitir; chaves diferentes nao se afetam."
    criterio_aceite: "O teste passa com casos de janela deslizante, chaves independentes e limpeza de chaves vencidas."
    depende_de: []
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-02.02
    titulo: "Nome do produto e confianca no proxy no ambiente"
    fase: F-02.1
    status: pendente
    objetivo: "Ler APP_NAME (padrao Converse) e TRUST_PROXY em src/lib/ambiente.ts."
    arquivos:
      cria: ["tests/ambiente.test.ts"]
      altera: ["src/lib/ambiente.ts"]
    teste_integracao: "tests/ambiente.test.ts altera process.env e le ambiente."
    teste_funcional: "Sem APP_NAME, nomeDoProduto e Converse; com APP_NAME=Acme e Acme; APP_NAME so com espacos volta ao padrao; confiarNoProxy e true so quando TRUST_PROXY e 1."
    criterio_aceite: "O teste de ambiente passa sem exigir variavel nova para o build."
    depende_de: []
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-02.03
    titulo: "IP do cliente a partir dos cabecalhos"
    fase: F-02.1
    status: pendente
    objetivo: "Extrair o IP do cliente respeitando TRUST_PROXY."
    arquivos:
      cria: ["src/lib/requisicao.ts", "tests/requisicao.test.ts"]
      altera: []
    teste_integracao: "tests/requisicao.test.ts chama ipDeCabecalhos com um objeto que imita Headers."
    teste_funcional: "Com confiarNoProxy verdadeiro e X-Forwarded-For 203.0.113.9, 10.0.0.1 devolve 203.0.113.9; com falso devolve desconhecido; sem o cabecalho devolve desconhecido."
    criterio_aceite: "O teste passa e ipDoCliente le headers() de next/headers apenas no invólucro."
    depende_de: [T-02.02]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-02.04
    titulo: "Login com limite de tentativas"
    fase: F-02.1
    status: pendente
    objetivo: "Bloquear tentativas em excesso por IP mais e-mail e por IP, com erro 429 e mensagem amigavel."
    arquivos:
      cria: ["tests/limite-de-login.test.ts"]
      altera: ["src/lib/erros.ts", "src/servicos/autenticacao.ts", "src/app/acoes.ts"]
    teste_integracao: "tests/limite-de-login.test.ts chama exigirLimiteDeLogin com um limitador de relogio falso e depois entrar no banco de teste."
    teste_funcional: "A sexta chamada em um minuto com o mesmo IP e e-mail lanca ErroDeAplicacao 429 com Muitas tentativas e quantos segundos faltam, a vigesima primeira do mesmo IP com e-mails diferentes tambem, e passado o minuto volta a permitir; entrar com credencial certa continua devolvendo token."
    criterio_aceite: "O teste passa e os 13 testes de autenticacao continuam verdes."
    depende_de: [T-02.01, T-02.03]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-02.05
    titulo: "Cabecalhos de seguranca"
    fase: F-02.1
    status: pendente
    objetivo: "Enviar nosniff, Referrer-Policy, X-Frame-Options DENY e Permissions-Policy em toda resposta."
    arquivos:
      cria: []
      altera: ["next.config.ts", "tests/rotas.test.ts"]
    teste_integracao: "tests/rotas.test.ts pede /entrar ao servidor de producao ja de pe e le os cabecalhos da resposta."
    teste_funcional: "A resposta de /entrar e a de uma rota autenticada trazem X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin, X-Frame-Options DENY e Permissions-Policy negando camera, microfone e geolocalizacao."
    criterio_aceite: "O teste de cabecalhos passa apos npm run build."
    depende_de: [T-02.02]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Plano — Sprint 02 — Servicos e seguranca: nome do produto, limite de uso, login limitado e cabecalhos

## Objetivo da sprint

Entrega o modulo reutilizavel de limite de uso, o nome do produto por configuracao, o limite de tentativas de login e os cabecalhos de seguranca, tudo sem interface nova.

## Critério de saída da sprint

npm test, npm run lint, npx tsc --noEmit e npm run build terminam com 0 falhas e o login recusa a sexta tentativa por minuto com mensagem em portugues.

## Riscos conhecidos

- confiar em X-Forwarded-For sem proxy permite forjar o IP (PR-36, base/autenticacao-e-sessao.md)
- o limite em memoria vale por processo (PR-36)

## Fora de escopo

- limite de uso do chat publico e do Telegram - FT-06 e FT-07 apenas reutilizam o modulo

## Fase F-02.1 — Servicos e seguranca

**Objetivo:** Modulo de limite, ambiente, IP do cliente, login limitado e cabecalhos.

**Tasks:** T-02.01, T-02.02, T-02.03, T-02.04, T-02.05

**Critério de saída:** todos os testes novos passam e o build de producao gera as rotas

**Roda em paralelo com:** nenhuma.

### Grafo de tasks

```mermaid
% Grafo de tasks — sprint-02 — gerado pela sprintx a partir deste arquivo
flowchart LR
  subgraph fase_02_1["F-02.1 Servicos e seguranca"]
    T_02_01["T-02.01<br/>Modulo limite-de-uso"]
    T_02_02["T-02.02<br/>Nome do produto e confianca "]
    T_02_03["T-02.03<br/>IP do cliente a partir dos c"]
    T_02_04["T-02.04<br/>Login com limite de tentativ"]
    T_02_05["T-02.05<br/>Cabecalhos de seguranca"]
  end
  T_02_02 --> T_02_03
  T_02_01 --> T_02_04
  T_02_03 --> T_02_04
  T_02_02 --> T_02_05
  classDef pendente fill:#F3F0EA,stroke:#8A7F70,color:#1A1815
  classDef em_andamento fill:#FDF0D5,stroke:#B4541E,color:#1A1815
  classDef concluida fill:#DFF0D8,stroke:#4A6B3A,color:#1A1815
  classDef bloqueada fill:#F8D7DA,stroke:#8C2F24,color:#1A1815
  classDef critico stroke-width:3px
  class T_02_01 pendente
  class T_02_02 pendente
  class T_02_03 pendente
  class T_02_04 pendente
  class T_02_05 pendente
```

## Tasks

---

```yaml
id: T-02.01
titulo: Modulo limite-de-uso
objetivo: Criar a janela deslizante em memoria com relogio injetavel.
arquivos:
  cria: [src/lib/limite-de-uso.ts, tests/limite-de-uso.test.ts]
  altera: []
teste_integracao: tests/limite-de-uso.test.ts usa um relogio falso injetado em criarLimitador, sem timers reais.
teste_funcional: Com max 3 e janela de 1000 ms, as tres primeiras chamadas devolvem permitido true com restante 2, 1 e 0, a quarta devolve permitido false e reiniciaEmMs igual ao tempo ate a chamada mais antiga sair da janela, e apos avancar o relogio 1000 ms volta a permitir; chaves diferentes nao se afetam.
criterio_aceite: O teste passa com casos de janela deslizante, chaves independentes e limpeza de chaves vencidas.
depende_de: []
paralelizavel: false
status: pendente
```

---

```yaml
id: T-02.02
titulo: Nome do produto e confianca no proxy no ambiente
objetivo: Ler APP_NAME (padrao Converse) e TRUST_PROXY em src/lib/ambiente.ts.
arquivos:
  cria: [tests/ambiente.test.ts]
  altera: [src/lib/ambiente.ts]
teste_integracao: tests/ambiente.test.ts altera process.env e le ambiente.
teste_funcional: Sem APP_NAME, nomeDoProduto e Converse; com APP_NAME=Acme e Acme; APP_NAME so com espacos volta ao padrao; confiarNoProxy e true so quando TRUST_PROXY e 1.
criterio_aceite: O teste de ambiente passa sem exigir variavel nova para o build.
depende_de: []
paralelizavel: false
status: pendente
```

---

```yaml
id: T-02.03
titulo: IP do cliente a partir dos cabecalhos
objetivo: Extrair o IP do cliente respeitando TRUST_PROXY.
arquivos:
  cria: [src/lib/requisicao.ts, tests/requisicao.test.ts]
  altera: []
teste_integracao: tests/requisicao.test.ts chama ipDeCabecalhos com um objeto que imita Headers.
teste_funcional: Com confiarNoProxy verdadeiro e X-Forwarded-For 203.0.113.9, 10.0.0.1 devolve 203.0.113.9; com falso devolve desconhecido; sem o cabecalho devolve desconhecido.
criterio_aceite: O teste passa e ipDoCliente le headers() de next/headers apenas no invólucro.
depende_de: [T-02.02]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-02.04
titulo: Login com limite de tentativas
objetivo: Bloquear tentativas em excesso por IP mais e-mail e por IP, com erro 429 e mensagem amigavel.
arquivos:
  cria: [tests/limite-de-login.test.ts]
  altera: [src/lib/erros.ts, src/servicos/autenticacao.ts, src/app/acoes.ts]
teste_integracao: tests/limite-de-login.test.ts chama exigirLimiteDeLogin com um limitador de relogio falso e depois entrar no banco de teste.
teste_funcional: A sexta chamada em um minuto com o mesmo IP e e-mail lanca ErroDeAplicacao 429 com Muitas tentativas e quantos segundos faltam, a vigesima primeira do mesmo IP com e-mails diferentes tambem, e passado o minuto volta a permitir; entrar com credencial certa continua devolvendo token.
criterio_aceite: O teste passa e os 13 testes de autenticacao continuam verdes.
depende_de: [T-02.01, T-02.03]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-02.05
titulo: Cabecalhos de seguranca
objetivo: Enviar nosniff, Referrer-Policy, X-Frame-Options DENY e Permissions-Policy em toda resposta.
arquivos:
  cria: []
  altera: [next.config.ts, tests/rotas.test.ts]
teste_integracao: tests/rotas.test.ts pede /entrar ao servidor de producao ja de pe e le os cabecalhos da resposta.
teste_funcional: A resposta de /entrar e a de uma rota autenticada trazem X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin, X-Frame-Options DENY e Permissions-Policy negando camera, microfone e geolocalizacao.
criterio_aceite: O teste de cabecalhos passa apos npm run build.
depende_de: [T-02.02]
paralelizavel: false
status: pendente
```

