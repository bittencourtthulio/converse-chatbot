---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: operacao-e-backup
origem_buildx: plataforma-chatbot-ia
feature_id: FT-11
sprint_id: sprint-07
atualizado_em: 2026-10-01
fases:
  - id: F-07.1
    titulo: "Desligamento limpo e administrador inicial"
    status: concluido
    criterio_saida: "A fila para de reivindicar e o desligamento drena, e o comando cria o administrador sem imprimir senha"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-07.01", "T-07.02"]
  - id: F-07.2
    titulo: "Imagem, compose e CI"
    status: nao_iniciado
    criterio_saida: "Os arquivos de conteiner passam nos testes estaticos, a verificacao real passa e o CI constroi a imagem"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-07.03", "T-07.04", "T-07.05"]
---

# Fases — Sprint 07

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo.

```mermaid
%% Grafo de tasks — sprint-07 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_07_1["F-07.1 — Desligamento limpo e administrador inicial"]
    T_07_01["T-07.01<br/>Desligamento limpo no…"]
    T_07_02["T-07.02<br/>Comando do primeiro…"]
  end
  subgraph fase_07_2["F-07.2 — Imagem, compose e CI"]
    T_07_03["T-07.03<br/>Dockerfile, entrypoint,…"]
    T_07_04["T-07.04<br/>Verificacao real do…"]
    T_07_05["T-07.05<br/>Job de CI que constroi a…"]
  end
  T_07_01 --> T_07_02
  T_07_02 --> T_07_03
  T_07_03 --> T_07_04
  T_07_04 --> T_07_05

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_07_01 concluida
  class T_07_02 concluida
  class T_07_03 pendente
  class T_07_04 pendente
  class T_07_05 pendente
  class T_07_05,T_07_04,T_07_03,T_07_02,T_07_01 critico
```

---

## F-07.1 — Desligamento limpo e administrador inicial

**Objetivo:** Desligamento limpo e administrador inicial.

**Tasks que a compõem:** T-07.01, T-07.02

**Critério de saída:** A fila para de reivindicar e o desligamento drena, e o comando cria o administrador sem imprimir senha.

**Roda em paralelo com:** nenhuma

---

## F-07.2 — Imagem, compose e CI

**Objetivo:** Imagem, compose e CI.

**Tasks que a compõem:** T-07.03, T-07.04, T-07.05

**Critério de saída:** Os arquivos de conteiner passam nos testes estaticos, a verificacao real passa e o CI constroi a imagem.

**Roda em paralelo com:** nenhuma

---

