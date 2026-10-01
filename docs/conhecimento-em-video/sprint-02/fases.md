---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: conhecimento-em-video
origem_buildx: plataforma-chatbot-ia
feature_id: FT-08
sprint_id: sprint-02
atualizado_em: 2026-09-30
fases:
  - id: F-02.1
    titulo: "Midia com ffmpeg"
    status: nao_iniciado
    criterio_saida: "Sonda, extracao e divisao de audio testadas, inclusive binario ausente."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-02.01", "T-02.02"]
  - id: F-02.2
    titulo: "Formatos e transcricao"
    status: nao_iniciado
    criterio_saida: "Assinaturas de midia e transcreverAudio testados."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-02.03", "T-02.04"]
---

# Fases — Sprint 02

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo.

```mermaid
%% Grafo de tasks — sprint-02 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_02_1["F-02.1 — Midia com ffmpeg"]
    T_02_01["T-02.01<br/>Midia: binarios e sonda"]
    T_02_02["T-02.02<br/>Midia: extrair e dividir aud"]
  end
  subgraph fase_02_2["F-02.2 — Formatos e transcricao"]
    T_02_03["T-02.03<br/>Formatos e assinatura de mid"]
    T_02_04["T-02.04<br/>Transcricao pelo OpenRouter"]
  end
  T_02_01 --> T_02_02

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_02_01 concluida
  class T_02_02 pendente
  class T_02_03 pendente
  class T_02_04 pendente
```

---

## F-02.1 — Midia com ffmpeg

**Objetivo:** Sonda, extracao e divisao de audio testadas, inclusive binario ausente.

**Tasks que a compõem:** T-02.01, T-02.02

**Critério de saída:** Sonda, extracao e divisao de audio testadas, inclusive binario ausente.

**Roda em paralelo com:** nenhuma

---

## F-02.2 — Formatos e transcricao

**Objetivo:** Assinaturas de midia e transcreverAudio testados.

**Tasks que a compõem:** T-02.03, T-02.04

**Critério de saída:** Assinaturas de midia e transcreverAudio testados.

**Roda em paralelo com:** nenhuma

---

