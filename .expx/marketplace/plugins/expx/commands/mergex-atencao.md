---
description: Classifica o diff em três faixas de atenção humana — etapa E3 da mergex, isolada. Diz, arquivo por arquivo, o que exige leitura linha a linha, o que só precisa de conferência de intenção e o que a máquina já provou. Use ao preparar uma revisão, ao perguntar o que precisa ser revisado com cuidado, onde olhar no diff, ou o que é arriscado nesta mudança.
---

Acione a skill `mergex` e execute **apenas a etapa E3 (classificação da atenção humana)**, seguindo `references/03-atencao-humana.md`.

Trabalho: $ARGUMENTS

## O que fazer

1. Levante o diff: `git diff --name-status <branch-base>...HEAD` (três pontos). Sem versionador, classifique os arquivos declarados nas tasks.
2. Reúna as evidências: `PERFIL.md` (zonas de risco), raio da legadox, testes de caracterização, plano de reversão, `tasks.md`, relatório de cobertura, `CONVENCOES.md` da stackx. **Fonte ausente não vira suposição** — registre-a como fonte ausente.
2b. Consulte o histórico do arquivo no `memox`, **quando ele estiver instalado** (`.claude/skills/memox/assets/memox.py`): `python3 .claude/skills/memox/assets/memox.py arquivo "<caminho>" --formato json`. Não instalado, **pule em silêncio** — sem aviso, sem menção na saída.
3. Classifique cada arquivo, aplicando os critérios na ordem: OLHO OBRIGATÓRIO (O1–O9), LEITURA RÁPIDA (L1–L3), DISPENSÁVEL (D1–D3). Pare no primeiro que bater.
4. Escreva a justificativa de cada arquivo nomeando o critério e a evidência.
5. Grave `docs/entregas/<trabalho_id>/ATENCAO.md` com `assets/TEMPLATE-atencao.md`, na ordem: olho obrigatório primeiro.
6. Registre no `ENTREGA.md` as contagens (`atencao`) e a faixa por arquivo (`faixa_atencao`, com `alta`/`media`/`baixa`).

## Regras duras

- Todo arquivo do diff cai em **exatamente uma** faixa. Nenhum fica de fora.
- A classificação é derivada de **evidência registrada**, nunca de sensação.
- **Tamanho do diff NÃO é critério** — nem para subir, nem para descer. Um arquivo de uma linha em zona de risco é OLHO OBRIGATÓRIO.
- Zona de risco, migração de banco, mudança de contrato público e efeito irreversível são **sempre** OLHO OBRIGATÓRIO.
- Na dúvida entre duas faixas, **sobe para a mais rigorosa e diz por quê**.
- **Arquivo com histórico de regressão é OLHO OBRIGATÓRIO** (O9), qualquer que seja o tamanho da mudança. Toda subida por O9 cita trabalho, data e artefato (`ver:`).
- A faixa **nunca desce** por causa do memox, e `coincidencias_arquivo` **não sobe** faixa nenhuma.
- Sem o memox instalado, o critério O9 não se aplica e a classificação é a mesma de sempre.
- Arquivo sem evidência suficiente vai para OLHO OBRIGATÓRIO, com a razão declarada.
