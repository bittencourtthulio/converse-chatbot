---
expx_schema: 1
expx_tool: buildx
kind: recursao
projeto_id: <slug-do-projeto>
atualizado_em: <AAAA-MM-DD>
ciclo_atual: <n>
teto_ciclos: 3
pendencias_abertas: <n>
pendencias_resolvidas: <n>
---

# <titulo> — Recursão

Tudo que ficou pelo caminho, classificado. O ciclo B4 → B5 repete enquanto
houver pendência resolvível, até o teto.

## Ciclos

| Ciclo | Pendências entraram | Viraram feature | Replanejadas | Ficaram para o humano |
|---|---|---|---|---|
| 1 | <n> | <n> | <n> | <n> |

---

## Aberto — o que exige decisão humana

<Vai para a PRIMEIRA seção do relatório final. Nunca vira feature,
nunca é resolvida por chute.>

### PEND-01 — <assunto>

**Classe:** `decisao_humana`
**Origem:** <FT-NN, ou a etapa que levantou>
**A decisão:** <o que precisa ser decidido, em uma frase>
**As opções:** <as alternativas reais, com o efeito de cada uma>
**O que o buildx fez enquanto isso:** <a decisão provisória adotada, e
onde ela está no código>
**Reversibilidade:** <o que custa mudar depois>

---

## Aberto — o que exige recurso externo

<Vai para a SEGUNDA seção do relatório final.>

### PEND-02 — <assunto>

**Classe:** `recurso_externo`
**Origem:** <FT-NN>
**O que falta:** <exatamente o que precisa ser providenciado —
credencial, acesso, conta, domínio, chave>
**O que destrava:** <o que passa a funcionar quando providenciado>
**Estado atual:** <o que existe sem isso — normalmente a feature
construída e não conectada>

---

## Resolvido nos ciclos

| ID | Assunto | Classe | Ciclo | Como resolveu |
|---|---|---|---|---|
| PEND-NN | <assunto> | <trabalho_novo \| replanejamento> | <n> | <FT-NN nova, ou replanejamento aprovado> |

---

<!--
AS QUATRO CLASSES

  trabalho_novo    → vira feature nova no MAPA.md, volta ao B4
  replanejamento   → a feature volta à F3 do sprintx (teto próprio: 2 voltas)
  decisao_humana   → fica aqui, vai para o relatório. NUNCA vira feature
  recurso_externo  → fica aqui, vai para o relatório

OS DOIS ERROS QUE ESTA CLASSIFICAÇÃO COMETE

  Classificar decisao_humana como trabalho_novo — o erro caro: o buildx
  decide regra de negócio no lugar do usuário e constrói, com esmero,
  a coisa errada.

  Classificar trabalho_novo como decisao_humana — o erro preguiçoso:
  joga para o humano o que a máquina resolveria, e esvazia a promessa
  do modo autônomo.

O TETO

Padrão 3 ciclos. O ciclo 2 resolve o que o B3 recortou mal — o mais
produtivo. O ciclo 3 resolve o que o 2 criou. Do quarto em diante o que
sobra normalmente não é falta de trabalho, é falta de decisão.

Atingido o teto: toda pendência aberta vira decisao_humana, com a nota
de que atingiu o teto, e o buildx segue para o B6.

O DETECTOR DE LAÇO EM FALSO

Independente do teto, reclassifique para decisao_humana quando:
  - a mesma pendência aparece em dois ciclos seguidos
  - uma feature entra em bloqueada duas vezes pelo mesmo motivo
  - o ciclo inteiro não converteu nenhuma pendência em entrega
-->
