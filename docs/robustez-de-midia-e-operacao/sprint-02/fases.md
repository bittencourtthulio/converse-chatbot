---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: robustez-de-midia-e-operacao
origem_buildx: plataforma-chatbot-ia
feature_id: FT-13
sprint_id: sprint-02
atualizado_em: 2026-10-01
fases:
  - id: F-02.1
    titulo: "Núcleo da transcrição sem fala"
    status: concluido
    criterio_saida: "as tasks T-02.01, T-02.02 concluídas com os dois testes passando"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-02.01", "T-02.02"]
  - id: F-02.2
    titulo: "Fila e vídeo mudo ponta a ponta"
    status: concluido
    criterio_saida: "as tasks T-02.03 concluídas com os dois testes passando"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-02.03"]
---

# Fases — Sprint 02

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo (todas compartilham o banco de teste e a suíte roda sem paralelismo).

```mermaid
%% Grafo de tasks — sprint-02 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_02_1["F-02.1 — Núcleo da transcrição sem fala"]
    T_02_01["T-02.01<br/>Marcador sem fala e filtr…"]
    T_02_02["T-02.02<br/>Transcrição grava segment…"]
  end
  subgraph fase_02_2["F-02.2 — Fila e vídeo mudo ponta a ponta"]
    T_02_03["T-02.03<br/>Fila sem trecho de marcad…"]
  end
  T_02_01 --> T_02_02
  T_02_02 --> T_02_03

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_02_01 concluida
  class T_02_02 concluida
  class T_02_03 concluida
  class T_02_01,T_02_02,T_02_03 critico
```

---

## F-02.1 — Núcleo da transcrição sem fala

**Objetivo:** Núcleo da transcrição sem fala.

**Tasks que a compõem:** T-02.01, T-02.02

**Critério de saída:** as tasks T-02.01, T-02.02 concluídas com os dois testes passando.

**Roda em paralelo com:** nenhuma

---

## F-02.2 — Fila e vídeo mudo ponta a ponta

**Objetivo:** Fila e vídeo mudo ponta a ponta.

**Tasks que a compõem:** T-02.03

**Critério de saída:** as tasks T-02.03 concluídas com os dois testes passando.

**Roda em paralelo com:** nenhuma

