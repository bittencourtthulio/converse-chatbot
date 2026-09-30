---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: conversa-de-teste
origem_buildx: plataforma-chatbot-ia
feature_id: FT-03
sprint_id: sprint-06
atualizado_em: 2026-09-30
sprint:
  titulo: "Aba Testar"
  status: pendente
  criterio_saida: "npm test termina com 0 failed; tests/chat-de-teste.test.tsx, tests/abas-do-agente.test.tsx e tests/rotas.test.ts passam; npm run build verde; lint e tsc com codigo 0."
  riscos: ["a pagina de servidor carrega a ultima conversa: nao pode expor conversa de outro usuario", "cores so por tokens (tests/tokens.test.ts barra valor literal)"]
  fora_de_escopo: ["lista e apagamento de conversas pela interface - FT-09"]
fases:
  - id: F-06.1
    titulo: "Tela Testar"
    status: pendente
    criterio_saida: "a aba Testar abre em /agentes/[id]/testar com o chat, os estados vazio, carregando e erro, e a conversa retomada"
    paralelizavel: false
    paralela_com: []
    tasks: [T-06.01, T-06.02]
tasks:
  - id: T-06.01
    titulo: "Componente ChatDeTeste e estilos"
    fase: F-06.1
    status: concluida
    objetivo: "Componente cliente de chat (unico com fetch) sobre os modulos puros, com icones e classes de estilo por tokens."
    arquivos:
      cria: ["src/componentes/ChatDeTeste.tsx", "tests/chat-de-teste.test.tsx"]
      altera: ["src/componentes/Icones.tsx", "src/estilos/global.css", "src/componentes/itens-de-menu.ts", "src/componentes/estado-da-conversa.ts", "tests/estado-da-conversa.test.ts"]
    teste_integracao: "tests/chat-de-teste.test.tsx renderiza o componente com renderToStaticMarkup em cada estado inicial."
    teste_funcional: "estado vazio traz a mensagem inicial do agente como primeira bolha, o campo rotulado com aria-label, Enviar, o contador e a regiao aria-live polite, conversa retomada mostra as bolhas na ordem, agente sem chave mostra aviso com link para Integracoes so para admin, nenhum dangerouslySetInnerHTML, e tests/tokens.test.ts continua sem cor literal."
    criterio_aceite: "O teste passa, tsc e lint com codigo 0, e ChatDeTeste.tsx e o unico arquivo de src/ com fetch para /api."
    depende_de: [T-05.01, T-05.02, T-05.03]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: verde
  - id: T-06.02
    titulo: "Aba, subrota e aviso de exclusao"
    fase: F-06.1
    status: concluida
    objetivo: "Acrescentar a aba Testar, a pagina de servidor com a ultima conversa do painel, o loading e o aviso de exclusao."
    arquivos:
      cria: ["src/app/(sistema)/agentes/[id]/testar/page.tsx", "src/app/(sistema)/agentes/[id]/testar/loading.tsx"]
      altera: ["src/componentes/abas-do-agente.ts", "src/app/(sistema)/agentes/[id]/page.tsx", "tests/abas-do-agente.test.tsx", "tests/rotas.test.ts", "src/servicos/conversas.ts", "tests/conversas.test.ts", "src/servicos/integracoes.ts", "tests/integracoes.test.ts"]
    teste_integracao: "tests/rotas.test.ts pede /agentes/<id>/testar ao servidor de producao com e sem sessao, com conversa gravada no banco de teste."
    teste_funcional: "sem sessao 307 para o login, com sessao 200 com a mensagem inicial e a aba Testar marcada, agente inexistente 404, a conversa mais recente do usuario e retomada e a de outro usuario nao aparece, e a pagina de configuracoes avisa que excluir apaga as conversas."
    criterio_aceite: "O teste de rotas passa depois de npm run build e ABAS_DO_AGENTE tem Configuracoes e Testar nessa ordem."
    depende_de: [T-06.01, T-04.02]
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: verde
---

# Plano — Sprint 06 — Aba Testar

## Critério de saída da sprint

npm test termina com 0 failed; tests/chat-de-teste.test.tsx, tests/abas-do-agente.test.tsx e tests/rotas.test.ts passam; npm run build verde; lint e tsc com codigo 0.

## Riscos conhecidos

- a pagina de servidor carrega a ultima conversa: nao pode expor conversa de outro usuario
- cores so por tokens (tests/tokens.test.ts barra valor literal)

## Fora de escopo

- lista e apagamento de conversas pela interface - FT-09

## Fase F-06.1 — Tela Testar

**Tasks:** T-06.01, T-06.02

**Critério de saída:** a aba Testar abre em /agentes/[id]/testar com o chat, os estados vazio, carregando e erro, e a conversa retomada

**Roda em paralelo com:** nenhuma.

### Grafo de tasks

```mermaid
% Grafo de tasks — sprint-06 — gerado pela sprintx a partir deste arquivo
flowchart LR
  subgraph fase_06_1["F-06.1 Chat no painel"]
    T_06_01["T-06.01<br/>Componente ChatDeTeste e est"]
    T_06_02["T-06.02<br/>Aba, subrota e aviso de excl"]
  end
  T_06_01 --> T_06_02
  classDef pendente fill:#F3F0EA,stroke:#8A7F70,color:#1A1815
  classDef em_andamento fill:#FDF0D5,stroke:#B4541E,color:#1A1815
  classDef concluida fill:#DFF0D8,stroke:#4A6B3A,color:#1A1815
  classDef bloqueada fill:#F8D7DA,stroke:#8C2F24,color:#1A1815
  classDef critico stroke-width:3px
  class T_06_01 concluida
  class T_06_02 concluida
```

## Tasks

---

```yaml
id: T-06.01
titulo: Componente ChatDeTeste e estilos
objetivo: Componente cliente de chat (unico com fetch) sobre os modulos puros, com icones e classes de estilo por tokens.
arquivos:
  cria: [src/componentes/ChatDeTeste.tsx, tests/chat-de-teste.test.tsx]
  altera: [src/componentes/Icones.tsx, src/estilos/global.css, src/componentes/itens-de-menu.ts, src/componentes/estado-da-conversa.ts, tests/estado-da-conversa.test.ts]
teste_integracao: tests/chat-de-teste.test.tsx renderiza o componente com renderToStaticMarkup em cada estado inicial.
teste_funcional: estado vazio traz a mensagem inicial do agente como primeira bolha, o campo rotulado com aria-label, Enviar, o contador e a regiao aria-live polite, conversa retomada mostra as bolhas na ordem, agente sem chave mostra aviso com link para Integracoes so para admin, nenhum dangerouslySetInnerHTML, e tests/tokens.test.ts continua sem cor literal.
criterio_aceite: O teste passa, tsc e lint com codigo 0, e ChatDeTeste.tsx e o unico arquivo de src/ com fetch para /api.
depende_de: [T-05.01, T-05.02, T-05.03]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: verde
resultado: chat-de-teste 16 testes; suite 561 verdes; tsc e lint 0
```

---

```yaml
id: T-06.02
titulo: Aba, subrota e aviso de exclusao
objetivo: Acrescentar a aba Testar, a pagina de servidor com a ultima conversa do painel, o loading e o aviso de exclusao.
arquivos:
  cria: ["src/app/(sistema)/agentes/[id]/testar/page.tsx", "src/app/(sistema)/agentes/[id]/testar/loading.tsx"]
  altera: ["src/componentes/abas-do-agente.ts", "src/app/(sistema)/agentes/[id]/page.tsx", "tests/abas-do-agente.test.tsx", "tests/rotas.test.ts", "src/servicos/conversas.ts", "tests/conversas.test.ts", "src/servicos/integracoes.ts", "tests/integracoes.test.ts"]
teste_integracao: tests/rotas.test.ts pede /agentes/<id>/testar ao servidor de producao com e sem sessao, com conversa gravada no banco de teste.
teste_funcional: sem sessao 307 para o login, com sessao 200 com a mensagem inicial e a aba Testar marcada, agente inexistente 404, a conversa mais recente do usuario e retomada e a de outro usuario nao aparece, e a pagina de configuracoes avisa que excluir apaga as conversas.
criterio_aceite: O teste de rotas passa depois de npm run build e ABAS_DO_AGENTE tem Configuracoes e Testar nessa ordem.
depende_de: [T-06.01, T-04.02]
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: verde
resultado: rotas +6, conversas +4, integracoes +1; build verde; suite 572 verdes; tsc e lint 0
```

