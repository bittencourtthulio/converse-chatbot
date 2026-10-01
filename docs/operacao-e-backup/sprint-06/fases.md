---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: operacao-e-backup
origem_buildx: plataforma-chatbot-ia
feature_id: FT-11
sprint_id: sprint-06
atualizado_em: 2026-10-01
fases:
  - id: F-06.1
    titulo: "Biblioteca de restauracao"
    status: nao_iniciado
    criterio_saida: "A validacao recusa o invalido sem efeito e a troca desfaz em falha"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-06.01", "T-06.02"]
  - id: F-06.2
    titulo: "Comando e prova"
    status: nao_iniciado
    criterio_saida: "O comando restaura e os testes fim a fim e de recusas passam"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-06.03", "T-06.04", "T-06.05"]
---

# Fases — Sprint 06

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo.

```mermaid
%% Grafo de tasks — sprint-06 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_06_1["F-06.1 — Biblioteca de restauracao"]
    T_06_01["T-06.01<br/>Validacao do backup antes…"]
    T_06_02["T-06.02<br/>Troca de banco e storage…"]
  end
  subgraph fase_06_2["F-06.2 — Comando e prova"]
    T_06_03["T-06.03<br/>Comando npm run restore"]
    T_06_04["T-06.04<br/>Teste fim a fim da…"]
    T_06_05["T-06.05<br/>Casos de recusa da…"]
  end
  T_06_01 --> T_06_02
  T_06_02 --> T_06_03
  T_06_03 --> T_06_04
  T_06_04 --> T_06_05

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_06_01 pendente
  class T_06_02 pendente
  class T_06_03 pendente
  class T_06_04 pendente
  class T_06_05 pendente
  class T_06_05,T_06_04,T_06_03,T_06_02,T_06_01 critico
```

---

## F-06.1 — Biblioteca de restauracao

**Objetivo:** Biblioteca de restauracao.

**Tasks que a compõem:** T-06.01, T-06.02

**Critério de saída:** A validacao recusa o invalido sem efeito e a troca desfaz em falha.

**Roda em paralelo com:** nenhuma

---

## F-06.2 — Comando e prova

**Objetivo:** Comando e prova.

**Tasks que a compõem:** T-06.03, T-06.04, T-06.05

**Critério de saída:** O comando restaura e os testes fim a fim e de recusas passam.

**Roda em paralelo com:** nenhuma

---

