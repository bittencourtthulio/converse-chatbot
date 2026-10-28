---
name: legadox-raio
description: "legadox Camada 2 — calcula o raio de impacto de um trabalho por evidência, e declara quais camadas isso aciona"
argument-hint: "[trabalho: slug da feature, OC-ID da ocorrência, ou os arquivos que serão tocados]"
---

Invoque a skill `legadox` e execute a Camada 2 seguindo `references/02-raio-de-impacto.md`.

Trabalho: $ARGUMENTS

Pré-requisito verificável: `docs/legado/PERFIL.md` precisa existir. Se não existir, não calcule nada — conduza para a Camada 1 primeiro (regra 1).

Produz `docs/legado/raio/<trabalho_id>.md`, onde `<trabalho_id>` é o `<slug-da-feature>` da sprintx ou o `<OC-ID>-<slug>` da runx.

Colete os oito sinais, cada um com o método de coleta declarado. Lembre-se das duas regras duras desta camada:

- **A faixa nunca é escolhida por sensação** (regra 3). Ela é o resultado da aplicação dos limiares da seção 9 do PERFIL sobre os sinais coletados. Se você se pegar pensando "isso parece simples", pare e colete.
- **Sinal não coletável conta como pior caso**, e o arquivo registra qual sinal foi assumido e por quê.

Ao terminar, mostre ao usuário: a faixa, o sinal que a determinou, e a lista das camadas acionadas. Se a faixa for ALTO, diga explicitamente que as perguntas da zona (Camada 11) e a aprovação humana precisam vir antes do plano.

Se `docs/legado/raio/<trabalho_id>.md` já existir, recalcule apenas se o conjunto de arquivos alvo mudou, e registre o recálculo no histórico do arquivo.
