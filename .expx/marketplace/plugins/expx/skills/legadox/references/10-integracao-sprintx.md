# INTEGRAÇÃO COM A SPRINTX — o que muda em cada fase no modo legado

Este reference descreve, fase a fase, o que a `sprintx` passa a fazer quando `docs/legado/PERFIL.md` existe.

**A sequência não muda.** Continuam as seis fases, na mesma ordem: F1 INGESTÃO → F2 DESCOBERTA → F3 PLANO → F4 ORQUESTRADOR → F5 AUDITORIA → F6 EXECUÇÃO. O legadox não acrescenta fase, não remove fase e não reordena nada. Ele muda o **rigor** de cada uma.

## O gatilho, verificado uma vez

No início da F1, a sprintx verifica se `docs/legado/PERFIL.md` existe.

- **Não existe** → modo legado desligado. A sprintx segue exatamente como hoje, e nada deste arquivo se aplica.
- **Existe** → modo legado ativo. A sprintx anuncia em uma linha ("modo legado ativo — PERFIL.md encontrado") e aplica o que segue.

O `<trabalho_id>` do legadox é o `<slug-da-feature>` da sprintx. Mesmo nome, mesmo trabalho.

---

## F1 INGESTÃO — a base fica mais ampla

Tudo que a F1 já faz continua. Acrescenta-se:

**1. Ler o `PERFIL.md`.** Ele entra na base como fonte de primeira classe. Especificamente: stack e versões reais, pontos de entrada, comandos de teste, e cobertura por pasta.

**2. Coletar os padrões conflitantes da área tocada.** Da seção de padrões conflitantes do PERFIL, extraia os dialetos que valem **nas pastas que a feature vai tocar** e registre-os no arquivo de base da área. Este é o insumo que impede a IA de introduzir um sétimo dialeto no projeto.

**3. Rodar a Camada 10 — prova de código vivo.** Para cada arquivo que a feature deve tocar, verifique se há cadeia de chamadores até um ponto de entrada. Segue `references/09-zonas-e-perguntas.md`. Resultado registrado; suspeita de morto vai para `DIVIDA.md` e não autoriza remoção.

**4. Identificar o conjunto de arquivos alvo.** A F1 já mapeia o que será tocado; no modo legado esse conjunto é declarado explicitamente, porque é a entrada do cálculo do raio.

A regra de "nada de invenção" da F1 ganha reforço: o que não for verificável vira `NÃO DOCUMENTADO` na base da sprintx e, se for lacuna do projeto como um todo, também `docs/legado/LACUNAS.md`.

---

## ENTRE F1 E F2 — o cálculo do raio

Este é o único ponto novo do fluxo, e ele não é uma fase: é um cálculo que acontece no fim da F1, com o conjunto de arquivos alvo já conhecido.

Execute `references/02-raio-de-impacto.md` na íntegra. Produz `docs/legado/raio/<slug-da-feature>.md`.

**A F2 não começa sem o raio escrito** (regra 2). A faixa resultante determina tudo o que vem depois:

- **BAIXO** → a sprintx segue como hoje, da F2 à F6, sem camada extra. O legadox registrou o raio e saiu do caminho.
- **MEDIO** → F2, F3, F5 e F6 ganham as exigências abaixo.
- **ALTO** → tudo de MEDIO, mais a Camada 11 antes da F2 e a Camada 9 na F6.

Se o conjunto de arquivos alvo mudar durante o trabalho, o raio é recalculado.

---

## F2 DESCOBERTA — as perguntas da zona entram no bloco

A F2 já é a fase de entrevista da sprintx, com perguntas em blocos de no máximo cinco. O modo legado acrescenta:

**Quando o Sinal 5 do raio indicar zona de risco tocada**, as perguntas obrigatórias da Camada 11 são feitas **antes de qualquer outra pergunta da F2**, seguindo `references/09-zonas-e-perguntas.md`: as seis mínimas mais as específicas da zona declaradas no PERFIL.

As respostas entram em `00-DECISOES.md` como decisões numeradas, e são referenciadas na seção de zona do arquivo do raio. **Sem elas, a F3 não gera plano** (regra 8) — mesmo que todas as demais decisões da F2 estejam fechadas.

Quando não há zona tocada, a F2 acontece exatamente como hoje.

Em raio ALTO, a F2 é também onde a **aprovação humana** (regra 9) é obtida e registrada, com escopo e riscos declarados.

---

## F3 PLANO — quatro exigências novas, conforme a faixa

Em raio **MEDIO ou ALTO**, o plano só é considerado completo com:

**1. A task de caracterização como primeira task da primeira fase.** Antes de qualquer task de alteração. Segue `references/03-caracterizacao.md`. Critério de aceite: os testes de caracterização passam contra o código atual, sem nenhuma alteração em código de produção.

**2. Ponto de costura declarado.** Segue `references/04-ponto-de-costura.md`: onde é, por que ali, o que isola, o que não cobre, alternativas descartadas. Se não houver ponto de costura viável, a F3 **para e escala para o humano** — nunca autoriza refatoração.

**3. Orçamento por task.** Cada task declara arquivos e linhas máximos, conforme a faixa (`references/05-orcamento-e-colateral.md`). Declarado no planejamento, não descoberto na execução.

**4. Plano de reversão por task.** Os seis itens de `references/06-reversao.md`, com a classe de reversibilidade. Task IRREVERSÍVEL traz o bloco de atenção e exige aprovação humana seja qual for a faixa.

A regra de granularidade da sprintx ganha um segundo critério no modo legado: além de "os dois testes cabem em uma frase cada", vale **"a task cabe no orçamento da faixa"**. Task que não cabe é quebrada na F3, não na execução.

Em raio **BAIXO**, a F3 é exatamente a de hoje.

---

## F4 ORQUESTRADOR — o raio entra no mapa

O ORQUESTRADOR ganha, no modo legado, uma linha de cabeçalho apontando o raio:

```
Raio de impacto: <BAIXO | MEDIO | ALTO> — docs/legado/raio/<slug-da-feature>.md
```

E, quando MEDIO ou ALTO, a task de caracterização aparece explicitamente no **caminho crítico**: nenhuma task de alteração pode ser executada antes dela, e isso vale inclusive para as tasks marcadas como paralelizáveis.

O paralelismo declarado no plano continua valendo entre tasks de alteração; o que a caracterização impõe é um portão sequencial antes de todas elas.

---

## F5 AUDITORIA — cinco verificações novas

A F5 continua sendo auditoria: **só aponta, nunca corrige**. No modo legado, o auditor verifica adicionalmente:

| # | Verificação | Severidade se falhar |
|---|---|---|
| 1 | O raio foi calculado e está escrito em `docs/legado/raio/<slug>.md`, com os oito sinais preenchidos e método de coleta declarado | ALTA |
| 2 | A faixa corresponde aos sinais coletados, aplicando os limiares do PERFIL — nenhuma faixa escolhida por sensação | ALTA |
| 3 | Toda task declara orçamento, e nenhuma o excede sem autorização registrada | ALTA |
| 4 | Em MEDIO ou ALTO: a task de caracterização é a primeira, e o ponto de costura está declarado com "o que não cobre" preenchido | ALTA |
| 5 | Em MEDIO ou ALTO: toda task tem plano de reversão com os seis itens respondidos e classe declarada | ALTA |

E mais três, específicas de ALTO:

| # | Verificação | Severidade se falhar |
|---|---|---|
| 6 | Perguntas da zona respondidas e registradas em `00-DECISOES.md` antes do plano | ALTA |
| 7 | Aprovação humana registrada com nome, data, escopo e riscos | ALTA |
| 8 | A Camada 9 está prevista no plano, com amostra e critério de seleção definidos | ALTA |

Regra da sprintx preservada: **achado de severidade ALTA manda voltar para a F3.** O auditor não corrige o plano à mão.

O auditor também verifica, em qualquer faixa, que nenhuma task planeja melhoria colateral: renomeação fora de escopo, reformatação, atualização de dependência, remoção de código morto. Task assim é achado ALTA.

---

## F6 EXECUÇÃO — orçamento, colateral e os dois artefatos finais

A execução autônoma da sprintx continua igual em mecânica. No modo legado, acrescenta-se:

**Durante cada task:**

- **Respeitar o orçamento.** Medir o diff antes de dar a task por concluída. Estourou: quebrar a task ou escalar, nunca em silêncio (regra 6). Sem autorização disponível, registrar em `00-BLOQUEIOS.md`, pular a task e seguir para a próxima paralelizável — a regra da sprintx de nunca parar continua valendo.
- **Proibição de melhoria colateral** (`references/05-orcamento-e-colateral.md`). O que incomodar vai para `docs/legado/DIVIDA.md`. Nada é corrigido de brinde.
- **Ler o próprio diff** antes de concluir, contra o checklist da Camada 6.

**Em MEDIO ou ALTO, ao fim da execução:**

- **Rodar a suíte de caracterização e ler o diff dela.** Cada teste que passou a falhar é mudança intencional (com a task que a autoriza citada) ou regressão (que se corrige no código, nunca no teste). Não há terceira classificação.
- **Gerar o roteiro de teste manual** em `docs/legado/manual/<slug-da-feature>.md`, seguindo `references/07-teste-manual.md`, com a seção de colateral preenchida a partir dos Sinais 2 e 3 do raio.

**Em ALTO, ou em qualquer mudança de cálculo ou regra de negócio:**

- **Executar a comparação com dado real** (`references/08-comparacao-real.md`), produzindo `docs/legado/comparacao/<slug-da-feature>.md`. **Divergência não explicada bloqueia a entrega** — a feature não é dada por concluída.

---

## Resumo por faixa

| | BAIXO | MEDIO | ALTO |
|---|:---:|:---:|:---:|
| F1 lê PERFIL, padrões conflitantes, código vivo | sim | sim | sim |
| Raio calculado antes da F2 | sim | sim | sim |
| F2 com perguntas da zona | não | se tocar zona | sim |
| F2 com aprovação humana registrada | não | não | sim |
| F3 com caracterização como primeira task | não | sim | sim |
| F3 com ponto de costura declarado | não | sim | sim |
| F3 com orçamento por task | 5 arq / 150 linhas | 3 arq / 80 linhas | 2 arq / 40 linhas |
| F3 com plano de reversão | não | sim | sim |
| F5 com as verificações 1 a 5 | 1 a 3 | 1 a 5 | 1 a 8 |
| F6 com proibição de colateral | sim | sim | sim |
| F6 gera roteiro manual | não | sim | sim |
| F6 executa comparação com dado real | não | não | sim |

Em BAIXO, na prática, a sprintx roda como hoje e o legadox deixou apenas um arquivo de raio para trás. É o comportamento pretendido.
