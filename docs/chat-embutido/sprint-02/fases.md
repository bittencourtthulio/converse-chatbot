---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: chat-embutido
origem_buildx: plataforma-chatbot-ia
feature_id: FT-06
sprint_id: sprint-02
atualizado_em: 2026-09-30
fases:
  - id: F-02.1
    titulo: "Configuracao"
    status: nao_iniciado
    criterio_saida: "Salvar e ler a configuracao, inclusive a visao publica."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-02.01", "T-02.02"]
  - id: F-02.2
    titulo: "Turno publico"
    status: nao_iniciado
    criterio_saida: "Limites, posse da conversa, erros e fontes do canal widget."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-02.03", "T-02.04", "T-02.05"]
---

# Fases — Sprint 02

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo.

```mermaid
% Grafo de tasks — sprint-02 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_02_1["F-02.1 — Configuracao"]
    T_02_01["T-02.01<br/>Servico de configuracao: sal"]
    T_02_02["T-02.02<br/>Leitura publica e dominios d"]
  end
  subgraph fase_02_2["F-02.2 — Turno publico"]
    T_02_03["T-02.03<br/>Limites e teto diario"]
    T_02_04["T-02.04<br/>Servico do turno publico"]
    T_02_05["T-02.05<br/>Tradutor SSE com mapeador de"]
  end
  T_02_01 --> T_02_02
  T_02_02 --> T_02_03
  T_02_03 --> T_02_04
  T_02_04 --> T_02_05

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_02_01 pendente
  class T_02_02 pendente
  class T_02_03 pendente
  class T_02_04 pendente
  class T_02_05 pendente
  class T_02_01,T_02_02,T_02_03,T_02_04,T_02_05 critico
```

---

## F-02.1 — Configuracao

**Objetivo:** Salvar e ler a configuracao, inclusive a visao publica.

**Tasks que a compõem:** T-02.01, T-02.02

**Critério de saída:** Salvar e ler a configuracao, inclusive a visao publica.

**Roda em paralelo com:** nenhuma

---

## F-02.2 — Turno publico

**Objetivo:** Limites, posse da conversa, erros e fontes do canal widget.

**Tasks que a compõem:** T-02.03, T-02.04, T-02.05

**Critério de saída:** Limites, posse da conversa, erros e fontes do canal widget.

**Roda em paralelo com:** nenhuma
