---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: canal-telegram
origem_buildx: plataforma-chatbot-ia
feature_id: FT-07
sprint_id: sprint-02
atualizado_em: 2026-09-30
fases:
  - id: F-02.1
    titulo: "Nucleo e metodos de configuracao"
    status: pendente
    criterio_saida: "Chamada, redacao e erros prontos, com getMe, setWebhook, deleteWebhook e getWebhookInfo."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-02.01"]
  - id: F-02.2
    titulo: "Envio e prova do token"
    status: pendente
    criterio_saida: "Envio dividido, digitando e a prova de que o token nao vaza."
    paralelizavel: false
    paralela_com: []
    tasks: ["T-02.02", "T-02.03"]
---

# Fases — Sprint 02

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo.

```mermaid
% Grafo de tasks — sprint-02 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_02_1["F-02.1 — Nucleo e metodos de configuracao"]
    T_02_01["T-02.01<br/>Nucleo do adaptador e metodo"]
  end
  subgraph fase_02_2["F-02.2 — Envio e prova do token"]
    T_02_02["T-02.02<br/>Envio de mensagem, digitando"]
    T_02_03["T-02.03<br/>O token nunca aparece em err"]
  end
  T_02_01 --> T_02_02
  T_02_02 --> T_02_03

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_02_01 concluida
  class T_02_02 pendente
  class T_02_03 pendente
  class T_02_01,T_02_02,T_02_03 critico
```

---

## F-02.1 — Nucleo e metodos de configuracao

**Objetivo:** Chamada, redacao e erros prontos, com getMe, setWebhook, deleteWebhook e getWebhookInfo.

**Tasks que a compõem:** T-02.01

**Critério de saída:** Chamada, redacao e erros prontos, com getMe, setWebhook, deleteWebhook e getWebhookInfo.

**Roda em paralelo com:** nenhuma

---

## F-02.2 — Envio e prova do token

**Objetivo:** Envio dividido, digitando e a prova de que o token nao vaza.

**Tasks que a compõem:** T-02.02, T-02.03

**Critério de saída:** Envio dividido, digitando e a prova de que o token nao vaza.

**Roda em paralelo com:** nenhuma

---
