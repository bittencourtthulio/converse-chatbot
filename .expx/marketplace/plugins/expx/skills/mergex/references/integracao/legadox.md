# Integração — legadox

A `legadox` é uma **camada modificadora**: não tem fluxo próprio nem estágios. Ela é acionada pela presença de `docs/legado/PERFIL.md` e muda o comportamento da sprintx e da runx em projeto legado — calcula raio de impacto, exige testes de caracterização, orçamento de mudança e plano de reversão.

**A mergex não aciona a legadox e a legadox não aciona a mergex.** O que existe é consumo de artefato: a mergex lê o que a legadox produziu.

## O gatilho

`docs/legado/PERFIL.md` existe → **modo legado ativo**.

Não existe → modo normal. As seções e verificações que dependem da legadox são **omitidas** ou marcadas `n/a`, **nunca preenchidas com texto genérico** (regra 10) e nunca inventadas (regra 7).

Não deduza modo legado de outros sinais (idade do código, ausência de teste, tamanho do repositório). O gatilho é o arquivo.

## O que a mergex consome

| Artefato | O que traz | Usado em |
|---|---|---|
| `PERFIL.md` | As **zonas de risco declaradas** do sistema | E3 (critério O1), E2 (V8) |
| Raio de impacto do trabalho | A **faixa** (BAIXO, MÉDIO, ALTO), os **sinais** que a determinaram e as **zonas tocadas** | E2 (V8), E3 (O8), E4 (seção 5), E8 (`raio`), E9 (critério 1 da ordenação) |
| Testes de caracterização | O que foi **congelado** e o que os testes fixaram | E2 (V8), E3 (L1), E4 (seção 7) |
| Plano de reversão | Como desfazer, **incluindo efeitos que o versionador não desfaz** | E2 (V8), E3 (O7), E4 (seção 8) |
| Orçamento de mudança | O limite declarado e se foi estourado | E2 (V8) |
| Aprovação humana de raio ALTO | Se houve aprovação registrada | E2 (V8) |
| `DIVIDA.md` | O que foi **observado e não tocado** | E4 (seção 11), E5 (seção 7 do pacote de QA) |

## Onde cada um entra

### E2 — o portão (verificação V8)

Só roda em modo legado. Cinco itens, cada um barra:

| Item | Barra quando |
|---|---|
| Raio calculado | Não há raio registrado para este trabalho |
| Caracterização | Raio MÉDIO ou ALTO sem testes de caracterização registrados |
| Reversão | Não há plano de reversão registrado |
| Orçamento | O orçamento de mudança declarado foi estourado |
| Aprovação humana | Raio ALTO sem aprovação humana registrada |

Fora do modo legado: V8 inteira é `n/a`.

### E3 — a classificação

A legadox alimenta quatro critérios da faixa mais rigorosa e um da intermediária:

- **O1** — arquivo em zona de risco declarada no `PERFIL.md`. Casa o caminho do arquivo com as zonas listadas. **É o critério que faz um arquivo de uma linha ser OLHO OBRIGATÓRIO**, e o que mais se perde sem a legadox.
- **O7** — efeito irreversível declarado no plano de reversão.
- **O8** — tudo que veio de raio ALTO.
- **L1** — mudança coberta por teste de caracterização que continua passando. Sem caracterização, o arquivo não pode ser rebaixado para LEITURA RÁPIDA por este critério.

Sem `PERFIL.md`, estes critérios **não podem ser avaliados**. Registre como **fonte ausente** na saída do E3: o revisor precisa saber que a dimensão "zona de risco" não foi avaliada — não que ela foi avaliada e deu negativo.

Os demais critérios continuam valendo integralmente. Mudança de cálculo (O2), migração (O3), autenticação e dado pessoal (O4), contrato público (O5) e código sem cobertura (O6) são OLHO OBRIGATÓRIO **com ou sem modo legado**.

### E4 — a descrição do PR

Três seções existem **só** em modo legado:

- **Seção 5 — Raio de impacto**, em destaque: faixa, sinais e zonas tocadas. É o que calibra como o revisor lê todo o resto.
- **Seção 7 — O que foi congelado**: os testes de caracterização e o que fixaram, **incluindo comportamento errado preservado de propósito**. É a informação que mais surpreende o revisor e a que ele mais precisa: um teste que congela um bug conhecido é decisão, não descuido.
- **Seção 8 — Como reverter**: o plano, com os **efeitos que o versionador não desfaz** — migração aplicada, dado transformado, mensagem publicada, arquivo enviado.

Fora do modo legado, as três são **omitidas** (regra 10).

A seção 11 (fora de escopo) vem do `DIVIDA.md`, que pode existir mesmo sem modo legado.

### E5 — o pacote de QA

O raio e as zonas tocadas alimentam a seção **"o que observar de colateral"**: telas, relatórios e fluxos vizinhos que podem ter sido afetados sem estar no roteiro. Traduza para linguagem de navegação — o QA não lê nome de zona técnica.

Sem raio, derive os colaterais dos arquivos alterados e **declare que a lista pode estar incompleta**.

### E8 — o registro

`raio` recebe `baixo`, `medio` ou `alto`. Sem modo legado, `raio: null` — nunca uma faixa inventada.

### E9 — a ordenação da revisão

A faixa de raio é o **primeiro critério** de ordenação, e a `atencao.olho_obrigatorio` é o segundo. Um PR de raio ALTO fica no fim da fila (maior impacto) e exige a **confirmação dupla**: o desenvolvedor precisa confirmar que revisou os arquivos de OLHO OBRIGATÓRIO, nomeados, antes de o merge ser oferecido.

PR sem registro de raio entra como "raio não calculado" e é tratado como menor impacto **naquele critério** — os outros cinco critérios continuam decidindo.

## O que a mergex NÃO faz com a legadox

- **Não calcula raio.** Lê o que a legadox calculou. Se não há raio, não há raio — não estime.
- **Não escreve teste de caracterização**, não decide o que congelar.
- **Não escreve plano de reversão.**
- **Nunca commita amostra de dado real** vinda da comparação da legadox: as amostras de caracterização podem conter dado de cliente. Isso está no E1 (seleção do que entra) e na varredura de segredo.
- Não deduz modo legado sem `PERFIL.md`.
