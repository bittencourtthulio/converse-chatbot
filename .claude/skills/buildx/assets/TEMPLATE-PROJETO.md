---
expx_schema: 1
expx_tool: buildx
kind: projeto
projeto_id: <slug-do-projeto>
titulo: <titulo curto do sistema>
modo: <autonomo | briefing>
criado_em: <AAAA-MM-DD>
atualizado_em: <AAAA-MM-DD>
etapa: <b1 | b2 | b3 | b4 | b5 | b6 | concluido>
total_features: <n | null>
features_entregues: <n>
features_bloqueadas: <n>
ciclos_recursao: <n>
---

# <titulo> — Projeto

## Descrição original

<O texto do usuário, LITERAL, sem edição, sem correção, sem resumo.
É a única fonte contra a qual o B6 valida. Se o usuário respondeu ao
briefing, as respostas entram aqui embaixo, marcadas como tal.>

## O problema

<Do P2 do prodx. O requisito destilado — o problema, não a solução pedida.
Regra 4 do prodx: a solução que o usuário descreveu nunca é o requisito.>

## O que foi pedido

<Um item por linha, verificável, tirado da descrição original. Cada um
vira uma linha da lista de conferência do B6.>

- <item>

## O que foi descoberto

<Cada lacuna do catálogo que virou requisito, com o PR-NN da premissa
que a sustenta. Esta seção é a razão de o buildx existir: é o que o
usuário não pensou em pedir e que o sistema precisa ter.>

| Eixo | Requisito | Premissa |
|---|---|---|
| <L-NN> | <o que passa a ser exigido> | <PR-NN> |

## Considerado e descartado

<Cada item do catálogo que NÃO se aplica a este sistema, com o porquê.
Não é burocracia: é o que prova que a varredura rodou inteira, e o B6
confere a lista dos três.>

| Eixo | Por que não se aplica |
|---|---|
| <L-NN> | <razão, ancorada no tipo e no porte do sistema> |

## Escopo mínimo

<Do P4 do prodx. A versão que já entrega valor. No buildx ele NÃO corta
features: ordena. Tudo que está aqui vem antes no MAPA.md.>

## Critérios de aceite do ponto de vista do negócio

<O que o usuário do sistema consegue fazer que não conseguia. Nada de
critério técnico. Cada um vira linha da conferência do B6.>

- <critério>

## Fora de escopo

<Explícito, para o B3 não recortar feature que ninguém pediu e para o
B6 não cobrar o que foi deliberadamente deixado de fora.>

- <item>

## Origem

**Veredito:** <caminho do VEREDITO.md do prodx>
**Assinado por:** <buildx (modo autonomo) | nome, se houve assinatura humana>
**Modo:** <autonomo | briefing>
