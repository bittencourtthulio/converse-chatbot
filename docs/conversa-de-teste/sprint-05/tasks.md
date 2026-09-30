---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: conversa-de-teste
origem_buildx: plataforma-chatbot-ia
feature_id: FT-03
sprint_id: sprint-05
atualizado_em: 2026-09-30
sprint:
  titulo: "Modulos testaveis da interface"
  status: pendente
  criterio_saida: "npm test termina com 0 failed; tests/texto-seguro.test.tsx, tests/leitor-de-sse.test.ts e tests/estado-da-conversa.test.ts passam; lint e tsc com codigo 0."
  riscos: ["sem jsdom o comportamento interativo so e provado nos modulos puros (base/interface-do-agente.md): o componente fica fino", "texto do modelo e entrada nao confiavel: nenhum HTML pode ser interpretado"]
  fora_de_escopo: ["o componente de chat e a pagina - sprint 06"]
fases:
  - id: F-05.1
    titulo: "Modulos puros de interface"
    status: pendente
    criterio_saida: "parser de texto seguro, leitor de SSE do navegador e reducer da conversa verdes e sem fetch"
    paralelizavel: false
    paralela_com: []
    tasks: [T-05.01, T-05.02, T-05.03]
tasks:
  - id: T-05.01
    titulo: "Renderizacao segura do texto do modelo"
    fase: F-05.1
    status: concluida
    objetivo: "Parser puro de blocos e inline e componente React sem dangerouslySetInnerHTML."
    arquivos:
      cria: ["src/componentes/texto-seguro.ts", "src/componentes/TextoDoModelo.tsx", "tests/texto-seguro.test.tsx"]
      altera: []
    teste_integracao: "tests/texto-seguro.test.tsx renderiza TextoDoModelo com renderToStaticMarkup."
    teste_funcional: "paragrafos, lista com marcador, lista numerada, negrito, codigo em linha e bloco de codigo saem como elementos, <script> e <img onerror> aparecem como texto escapado, link https ganha rel 'noopener noreferrer' e target _blank, javascript: e data: viram texto sem link, e nenhum componente usa dangerouslySetInnerHTML (so o script constante do tema em src/app/layout.tsx)."
    criterio_aceite: "O teste passa e grep de dangerouslySetInnerHTML em src/ so encontra o script constante do tema em src/app/layout.tsx."
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-09-30
    suite: verde
  - id: T-05.02
    titulo: "Leitor de SSE do navegador"
    fase: F-05.1
    status: pendente
    objetivo: "Modulo que le um ReadableStream SSE e devolve eventos tipados, tolerante a pacotes partidos."
    arquivos:
      cria: ["src/componentes/leitor-de-sse.ts", "tests/leitor-de-sse.test.ts"]
      altera: []
    teste_integracao: "tests/leitor-de-sse.test.ts alimenta o leitor com ReadableStream construido no teste, inclusive vindo de src/app/eventos-sse.ts."
    teste_funcional: "le trecho, fim e erro na ordem, junta um evento partido em dois pacotes e uma letra UTF-8 partida no meio, ignora comentarios e linhas desconhecidas, JSON invalido vira evento erro local e stream que acaba sem fim nem erro devolve evento erro de conexao."
    criterio_aceite: "O teste passa e o modulo nao usa fetch."
    depende_de: [T-04.01]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-05.03
    titulo: "Estado da conversa e teclas"
    fase: F-05.1
    status: pendente
    objetivo: "Reducer da conversa (mensagens, envio, trecho, fim, erro, parada, nova conversa) e decisao de tecla do campo."
    arquivos:
      cria: ["src/componentes/estado-da-conversa.ts", "tests/estado-da-conversa.test.ts"]
      altera: []
    teste_integracao: "tests/estado-da-conversa.test.ts aplica sequencias de acoes ao reducer puro."
    teste_funcional: "enviar adiciona a bolha do usuario e abre a do agente vazia em digitacao, trechos acumulam, fim fixa o id da conversa e encerra a digitacao, erro mantem o texto parcial marcado e mostra a mensagem, parar encerra sem erro, nova conversa zera mensagens e id, Enter envia, Shift+Enter nao envia, Enter durante composicao de IME nao envia, e o contador de caracteres so aparece a partir de 3500 de 4000."
    criterio_aceite: "O teste passa e as constantes 4000 e 3500 vem de um unico lugar exportado."
    depende_de: []
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Plano — Sprint 05 — Modulos testaveis da interface

## Critério de saída da sprint

npm test termina com 0 failed; tests/texto-seguro.test.tsx, tests/leitor-de-sse.test.ts e tests/estado-da-conversa.test.ts passam; lint e tsc com codigo 0.

## Riscos conhecidos

- sem jsdom o comportamento interativo so e provado nos modulos puros (base/interface-do-agente.md): o componente fica fino
- texto do modelo e entrada nao confiavel: nenhum HTML pode ser interpretado

## Fora de escopo

- o componente de chat e a pagina - sprint 06

## Fase F-05.1 — Modulos puros de interface

**Tasks:** T-05.01, T-05.02, T-05.03

**Critério de saída:** parser de texto seguro, leitor de SSE do navegador e reducer da conversa verdes e sem fetch

**Roda em paralelo com:** nenhuma.

### Grafo de tasks

```mermaid
% Grafo de tasks — sprint-05 — gerado pela sprintx a partir deste arquivo
flowchart LR
  subgraph fase_05_1["F-05.1 Texto, SSE e estado"]
    T_05_01["T-05.01<br/>Renderizacao segura do texto"]
    T_05_02["T-05.02<br/>Leitor de SSE do navegador"]
    T_05_03["T-05.03<br/>Estado da conversa e teclas"]
  end
  classDef pendente fill:#F3F0EA,stroke:#8A7F70,color:#1A1815
  classDef em_andamento fill:#FDF0D5,stroke:#B4541E,color:#1A1815
  classDef concluida fill:#DFF0D8,stroke:#4A6B3A,color:#1A1815
  classDef bloqueada fill:#F8D7DA,stroke:#8C2F24,color:#1A1815
  classDef critico stroke-width:3px
  class T_05_01 concluida
  class T_05_02 pendente
  class T_05_03 pendente
```

## Tasks

---

```yaml
id: T-05.01
titulo: Renderizacao segura do texto do modelo
objetivo: Parser puro de blocos e inline e componente React sem dangerouslySetInnerHTML.
arquivos:
  cria: [src/componentes/texto-seguro.ts, src/componentes/TextoDoModelo.tsx, tests/texto-seguro.test.tsx]
  altera: []
teste_integracao: tests/texto-seguro.test.tsx renderiza TextoDoModelo com renderToStaticMarkup.
teste_funcional: paragrafos, lista com marcador, lista numerada, negrito, codigo em linha e bloco de codigo saem como elementos, <script> e <img onerror> aparecem como texto escapado, link https ganha rel 'noopener noreferrer' e target _blank, javascript: e data: viram texto sem link, e nenhum componente usa dangerouslySetInnerHTML (so o script constante do tema em src/app/layout.tsx).
criterio_aceite: O teste passa e grep de dangerouslySetInnerHTML em src/ so encontra o script constante do tema em src/app/layout.tsx.
depende_de: []
paralelizavel: false
status: concluida
concluida_em: 2026-09-30
suite: verde
resultado: texto-seguro 19 testes; suite 502 verdes; tsc e lint 0
```

---

```yaml
id: T-05.02
titulo: Leitor de SSE do navegador
objetivo: Modulo que le um ReadableStream SSE e devolve eventos tipados, tolerante a pacotes partidos.
arquivos:
  cria: [src/componentes/leitor-de-sse.ts, tests/leitor-de-sse.test.ts]
  altera: []
teste_integracao: tests/leitor-de-sse.test.ts alimenta o leitor com ReadableStream construido no teste, inclusive vindo de src/app/eventos-sse.ts.
teste_funcional: le trecho, fim e erro na ordem, junta um evento partido em dois pacotes e uma letra UTF-8 partida no meio, ignora comentarios e linhas desconhecidas, JSON invalido vira evento erro local e stream que acaba sem fim nem erro devolve evento erro de conexao.
criterio_aceite: O teste passa e o modulo nao usa fetch.
depende_de: [T-04.01]
paralelizavel: false
status: pendente
```

---

```yaml
id: T-05.03
titulo: Estado da conversa e teclas
objetivo: Reducer da conversa (mensagens, envio, trecho, fim, erro, parada, nova conversa) e decisao de tecla do campo.
arquivos:
  cria: [src/componentes/estado-da-conversa.ts, tests/estado-da-conversa.test.ts]
  altera: []
teste_integracao: tests/estado-da-conversa.test.ts aplica sequencias de acoes ao reducer puro.
teste_funcional: enviar adiciona a bolha do usuario e abre a do agente vazia em digitacao, trechos acumulam, fim fixa o id da conversa e encerra a digitacao, erro mantem o texto parcial marcado e mostra a mensagem, parar encerra sem erro, nova conversa zera mensagens e id, Enter envia, Shift+Enter nao envia, Enter durante composicao de IME nao envia, e o contador de caracteres so aparece a partir de 3500 de 4000.
criterio_aceite: O teste passa e as constantes 4000 e 3500 vem de um unico lugar exportado.
depende_de: []
paralelizavel: false
status: pendente
```

