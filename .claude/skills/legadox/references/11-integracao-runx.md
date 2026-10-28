# INTEGRAÇÃO COM A RUNX — o que muda em cada estágio no modo legado

Este reference descreve, estágio a estágio, o que a `runx` passa a fazer quando `docs/legado/PERFIL.md` existe.

**A sequência não muda.** Continuam os cinco estágios, na mesma ordem: E1 INVESTIGAÇÃO → E2 PLANO → E3 FIX → E4 QA → E5 RELATÓRIO. O legadox não acrescenta estágio, não remove estágio e não reordena nada. Ele muda o **rigor** de cada um.

## O gatilho, verificado uma vez

No início do E1, a runx verifica se `docs/legado/PERFIL.md` existe.

- **Não existe** → modo legado desligado. A runx segue exatamente como hoje.
- **Existe** → modo legado ativo. A runx anuncia em uma linha ("modo legado ativo — PERFIL.md encontrado") e aplica o que segue.

O `<trabalho_id>` do legadox é o `<OC-ID>-<slug>` da runx. Mesma ocorrência, mesmo nome.

**A runx é a metade que mais se beneficia do legadox.** Ocorrência de manutenção em sistema antigo é, por definição, trabalho em legado: o comportamento atual já tem cliente dependendo dele, e a correção precisa preservar tudo que não foi reclamado.

---

## E1 INVESTIGAÇÃO — a base fica mais ampla, e o raio nasce aqui

O E1 tem duas metades: **E1.a base de conhecimento**, depois **E1.b causa raiz ou análise de impacto**. As duas continuam, na mesma ordem. Acrescenta-se:

### Em E1.a

**1. Ler o `PERFIL.md`.** Fonte de primeira classe para a base: stack real, pontos de entrada, comandos de teste, cobertura por pasta.

**2. Coletar os padrões conflitantes da área tocada.** Da seção de padrões conflitantes do PERFIL, extraia os dialetos que valem **nas pastas da ocorrência** e registre no arquivo de área da base. É o que impede o fix de introduzir um dialeto novo enquanto corrige.

O eixo **dinheiro** merece atenção quando a ocorrência é de cálculo divergente: se o PERFIL registra que a área usa `float` para valor monetário, essa é frequentemente a causa raiz, e é achado registrado — não corrigido de brinde (Camada 6).

**3. Rodar a Camada 10 — prova de código vivo.** Para cada arquivo suspeito, verifique a cadeia de chamadores até um ponto de entrada. Segue `references/09-zonas-e-perguntas.md`. Suspeita de morto vai para `DIVIDA.md`; nada é removido.

### Em E1.b

A causa raiz comprovada (para `tipo: bug`) ou a análise de impacto (para os demais tipos) continua exatamente como hoje, com a mesma exigência de prova.

O que muda: **a lista de arquivos e módulos impactados de `01-CAUSA-RAIZ.md` é o conjunto de arquivos alvo do raio.** A runx já trava o escopo nessa lista; no modo legado ela também alimenta o cálculo.

### Ao fim do E1 — o cálculo do raio

Execute `references/02-raio-de-impacto.md` na íntegra. Produz `docs/legado/raio/<OC-ID>-<slug>.md`.

**O E2 não começa sem o raio escrito** (regra 2).

### Ainda no E1 — as perguntas da zona

**Quando o Sinal 5 do raio indicar zona de risco tocada**, as perguntas obrigatórias da Camada 11 disparam **ainda no E1**, antes do E2, seguindo `references/09-zonas-e-perguntas.md`.

Este é o segundo momento em que a runx pergunta. O primeiro é o portão único do E1 (bug sem reprodução). Ambos são exceções previstas por regra, e ambos acontecem no E1 — nunca durante o E3, onde a runx não pergunta nada.

As respostas entram nas decisões de `01-CAUSA-RAIZ.md` e são referenciadas no arquivo do raio. **Sem elas, o E2 não gera plano** (regra 8).

Em raio ALTO, o E1 é também onde a **aprovação humana** (regra 9) é obtida e registrada, com escopo e riscos declarados.

---

## E2 PLANO — quatro exigências novas, conforme a faixa

Em raio **MEDIO ou ALTO**, o plano só é considerado completo com:

**1. A task de caracterização como primeira task da primeira fase.** Segue `references/03-caracterizacao.md`.

Atenção à ordem, porque a runx já tem um teste na primeira posição: **caracterização primeiro, teste de regressão depois.**

```
T-01.01  caracterização — congela o comportamento atual da área, inclusive o errado
T-01.02  teste de regressão — reproduz o problema relatado e falha hoje
T-01.03  o fix
```

Os dois testes têm papéis opostos e complementares, e é justamente essa oposição que torna o par valioso: a caracterização afirma "isto é o que o sistema faz e deve continuar fazendo"; a regressão afirma "isto é o que o sistema faz e precisa parar de fazer". Se um teste de caracterização congelou exatamente o comportamento que a regressão quer derrubar, isso é declarado na task, com o antes e o depois, e a quebra daquele teste é intencional e autorizada.

**2. Ponto de costura declarado.** Segue `references/04-ponto-de-costura.md`. Se não houver ponto de costura viável, o E2 **para e escala para o humano** — nunca autoriza refatoração. Isto reforça a regra 8 da runx (escopo travado): não existe "já que estou aqui".

**3. Orçamento por task.** Conforme a faixa (`references/05-orcamento-e-colateral.md`), declarado no planejamento.

Aqui a regra de proporcionalidade da runx e o orçamento do legadox se encontram bem: a runx já manda uma correção de uma linha gerar 1 sprint, 1 fase e 2 tasks. O orçamento apenas dá o teto verificável do que "uma linha" pode virar.

**4. Plano de reversão por task.** Os seis itens de `references/06-reversao.md`, com classe declarada.

Em raio **BAIXO**, o E2 é exatamente o de hoje.

---

## E3 FIX — orçamento e colateral, sem perguntar

O E3 continua sendo execução autônoma sob TDD, **sem perguntar nada** (regra 13 da runx). No modo legado, acrescenta-se:

- **Respeitar o orçamento.** Medir o diff antes de concluir cada task. Estourou: quebrar a task ou escalar. Sem autorização disponível, registrar em `BLOQUEIOS.md`, pular a task e seguir — a runx não para para esperar.
- **Proibição de melhoria colateral.** O que incomodar vai para `docs/legado/DIVIDA.md`. Isto é a regra 8 da runx (escopo travado) com um lugar concreto para depositar a tentação.
- **Ler o próprio diff** antes de concluir, contra o checklist da Camada 6.
- **A ordem dos testes é obrigatória:** caracterização passando antes de qualquer alteração (regra 4). Se a caracterização não passa no código atual, o comportamento não foi compreendido — não se altera nada até que passe.

O retorno ao E1 previsto pela runx (teste de regressão passa **antes** do fix) continua valendo. No modo legado há um segundo retorno análogo: **se um teste de caracterização falhar contra o código intocado**, o E3 para e volta ao E1, porque a base de conhecimento está errada sobre o comportamento atual.

---

## E4 QA — cinco verificações novas, mais a comparação

O E4 continua sendo papel distinto do E3 e **não corrige nada**. No modo legado, o QA verifica adicionalmente:

| # | Verificação |
|---|---|
| 1 | O raio foi calculado e está escrito, com os oito sinais e método de coleta declarado |
| 2 | A faixa corresponde aos sinais, aplicando os limiares do PERFIL |
| 3 | Toda task respeitou o orçamento, ou o excesso está autorizado e registrado |
| 4 | Em MEDIO/ALTO: caracterização foi a primeira task e passou contra o código intocado |
| 5 | Em MEDIO/ALTO: toda task tem plano de reversão com os seis itens e classe declarada |
| 6 | Nenhuma alteração colateral no diff — ler o diff inteiro contra o checklist da Camada 6 |
| 7 | O diff da suíte de caracterização foi analisado: toda quebra é intencional e justificada, ou é regressão |
| 8 | O roteiro manual existe em `docs/legado/manual/<OC-ID>-<slug>.md`, com a seção de colateral preenchida |

E, específicas de ALTO:

| # | Verificação |
|---|---|
| 9 | Perguntas da zona respondidas e registradas antes do plano |
| 10 | Aprovação humana registrada com nome, data, escopo e riscos |
| 11 | **A comparação com dado real foi executada** (`references/08-comparacao-real.md`), com zero divergências não explicadas |

A verificação 11 é a mais dura do modo legado na runx: **divergência não explicada reprova o QA.** O veredito volta REPROVADO e a ocorrência retorna ao E3 — ou, se a divergência revelar caminho de código não mapeado, ao E1.

A Camada 9 também é obrigatória, em qualquer faixa, quando o `tipo` da ocorrência for **`regra-de-calculo`** — é literalmente uma mudança de cálculo, e o tipo já diz isso.

---

## E5 RELATÓRIO — o que os relatórios passam a incluir

Os dois relatórios continuam: `tecnico.md` e `uso.md`, mais a atualização do `INDICE.md`. No modo legado:

### No relatório técnico

- **Raio de impacto:** a faixa, o sinal que a determinou, e o link relativo para `docs/legado/raio/<OC-ID>-<slug>.md`.
- **O que foi congelado por caracterização:** quantos casos, o que cobrem, e — o item mais valioso para quem ler isso daqui a dois anos — **os comportamentos surpreendentes descobertos**, aqueles que o sistema fazia e ninguém sabia.
- **O diff da caracterização:** o que mudou de comportamento, com a task que autorizou cada mudança.
- **Ponto de costura escolhido**, com o que ele não cobre.
- **Plano de reversão consolidado**, com a classe de reversibilidade da entrega como um todo — que é a pior classe entre as tasks.
- **Comparação com dado real**, quando houve: totais e os padrões de divergência com o impacto conhecido. Nunca dado identificável.
- **Achados registrados em `DIVIDA.md`** durante o trabalho, listados com link relativo.

### No relatório de uso

Escrito para quem não é técnico, e é aqui que o legadox mais ajuda o cliente:

- **O que mudou de comportamento**, em linguagem de negócio, incluindo o que **deixou de acontecer**.
- **Quem é afetado e como.** Se a comparação encontrou 1.240 registros antigos que passam a exibir valor diferente, isso é informação de negócio e vai no relatório de uso, não só no técnico.
- **O roteiro de teste manual**, com link relativo, apontado como o que precisa ser executado antes do aceite.
- **Como reverter**, em linguagem de operação: o que acontece se precisar voltar atrás, quanto tempo leva, e o que não se desfaz.

### No índice

A linha do `INDICE.md` ganha a faixa do raio junto ao tipo, para que uma listagem simples mostre o histórico de risco do sistema ao longo do tempo.

---

## Resumo por faixa

| | BAIXO | MEDIO | ALTO |
|---|:---:|:---:|:---:|
| E1 lê PERFIL, padrões conflitantes, código vivo | sim | sim | sim |
| Raio calculado ao fim do E1 | sim | sim | sim |
| E1 com perguntas da zona | não | se tocar zona | sim |
| E1 com aprovação humana registrada | não | não | sim |
| E2 com caracterização antes da regressão | não | sim | sim |
| E2 com ponto de costura declarado | não | sim | sim |
| E2 com orçamento por task | 5 arq / 150 linhas | 3 arq / 80 linhas | 2 arq / 40 linhas |
| E2 com plano de reversão | não | sim | sim |
| E3 com proibição de colateral | sim | sim | sim |
| E4 com as verificações 1 a 8 | 1 a 3 e 6 | 1 a 8 | 1 a 11 |
| E4 exige comparação com dado real | não | não | sim |
| E5 relata raio, caracterização, reversão, manual | raio | tudo | tudo |
| Roteiro manual gerado | não | sim | sim |

Em BAIXO, na prática, a runx roda como hoje e o legadox deixou apenas um arquivo de raio para trás, mais a linha do raio no relatório. É o comportamento pretendido.
