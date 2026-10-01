---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: sessao-e-acesso-endurecidos
origem_buildx: plataforma-chatbot-ia
feature_id: FT-12
sprint_id: sprint-02
atualizado_em: 2026-10-01
fases:
  - id: F-02.1
    titulo: "Esquema e configuracao"
    status: nao_iniciado
    criterio_saida: "as tasks T-02.01, T-02.02 concluidas com os dois testes passando"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-02.01", "T-02.02"]
  - id: F-02.2
    titulo: "Token, cookie e validacao"
    status: nao_iniciado
    criterio_saida: "as tasks T-02.03, T-02.04, T-02.05 concluidas com os dois testes passando"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-02.03", "T-02.04", "T-02.05"]
  - id: F-02.3
    titulo: "Versao, renovacao e expurgo"
    status: nao_iniciado
    criterio_saida: "as tasks T-02.06, T-02.07, T-02.08 concluidas com os dois testes passando"
    paralelizavel: false
    paralela_com: []
    tasks: ["T-02.06", "T-02.07", "T-02.08"]
---

# Fases — Sprint 02

> O paralelismo declarado aqui é definitivo: nenhuma fase nem task corre em paralelo (todas compartilham o banco de teste e a suíte roda sem paralelismo).

```mermaid
%% Grafo de tasks — sprint-02 — gerado pela sprintx a partir de tasks.md
flowchart LR
  subgraph fase_02_1["F-02.1 — Esquema e configuracao"]
    T_02_01["T-02.01<br/>Migration e modelos da sess…"]
    T_02_02["T-02.02<br/>SESSAO_MAXIMA_HORAS no ambi…"]
  end
  subgraph fase_02_2["F-02.2 — Token, cookie e validacao"]
    T_02_03["T-02.03<br/>Token de sessao com jti, ve…"]
    T_02_04["T-02.04<br/>Atributos do cookie de sess…"]
    T_02_05["T-02.05<br/>Entrar, validar e revogar a…"]
  end
  subgraph fase_02_3["F-02.3 — Versao, renovacao e expurgo"]
    T_02_06["T-02.06<br/>Troca de senha por versao d…"]
    T_02_07["T-02.07<br/>Renovacao deslizante com li…"]
    T_02_08["T-02.08<br/>Expurgo das revogacoes venc…"]
  end
  T_02_01 --> T_02_02
  T_02_02 --> T_02_03
  T_02_03 --> T_02_04
  T_02_01 --> T_02_05
  T_02_03 --> T_02_05
  T_02_05 --> T_02_06
  T_02_06 --> T_02_07
  T_02_05 --> T_02_08

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px

  class T_02_01 concluida
  class T_02_02 concluida
  class T_02_03 pendente
  class T_02_04 pendente
  class T_02_05 pendente
  class T_02_06 pendente
  class T_02_07 pendente
  class T_02_08 pendente
  class T_02_01,T_02_02,T_02_03,T_02_04,T_02_05,T_02_06,T_02_07,T_02_08 critico
```

---

## F-02.1 — Esquema e configuracao

**Objetivo:** Esquema e configuracao.

**Tasks que a compõem:** T-02.01, T-02.02

**Critério de saída:** as tasks T-02.01, T-02.02 concluídas com os dois testes passando.

**Roda em paralelo com:** nenhuma

---

## F-02.2 — Token, cookie e validacao

**Objetivo:** Token, cookie e validacao.

**Tasks que a compõem:** T-02.03, T-02.04, T-02.05

**Critério de saída:** as tasks T-02.03, T-02.04, T-02.05 concluídas com os dois testes passando.

**Roda em paralelo com:** nenhuma

---

## F-02.3 — Versao, renovacao e expurgo

**Objetivo:** Versao, renovacao e expurgo.

**Tasks que a compõem:** T-02.06, T-02.07, T-02.08

**Critério de saída:** as tasks T-02.06, T-02.07, T-02.08 concluídas com os dois testes passando.

**Roda em paralelo com:** nenhuma
