---
description: O comando único do buildx — recebe a descrição de um projeto inteiro em linguagem natural e conduz prodx, stackx, sprintx e mergex até o sistema estar pronto, testado e validado. Sem argumento, mostra em que etapa o projeto está.
---

Use a skill `buildx`.

## Com argumento — a descrição do projeto

`$ARGUMENTS` é a descrição do sistema que o usuário quer construir.

Comece pelo B1, e a primeira coisa é **a pergunta única** (`references/01-concepcao.md`):

```
Como você quer conduzir este projeto?

  1. AUTÔNOMO TOTAL — eu decido tudo, você não é interrompido em
     nenhum momento até o sistema estar pronto. Cada decisão tomada
     em seu nome fica registrada como premissa, para você auditar
     depois.

  2. BRIEFING — eu faço uma rodada de perguntas agora, só as que
     mudam a arquitetura, e depois rodo sozinho até o fim.
```

Resposta pouco clara, ou o usuário emenda detalhes do projeto em vez de escolher: assuma `autonomo`, diga em uma linha que assumiu, e siga. **Nunca repita a pergunta** — repetir já é violar a regra 1.

Daí em diante, as seis etapas, sem parar:

```
B1 CONCEPÇÃO → B2 FUNDAÇÃO → B3 DECOMPOSIÇÃO → B4 CONSTRUÇÃO → B5 RECURSÃO → B6 VALIDAÇÃO
                                                      ↑                │
                                                      └────────────────┘
```

Leia o reference da etapa quando ela chegar, e somente o dela.

## Sem argumento — o roteador

Não execute etapa nenhuma. Identifique o estado pelo disco e mostre o painel:

1. `docs/projeto/PROJETO.md` existe? Se não, peça a descrição do projeto em uma linha e pare.
2. Se existe, leia o frontmatter e o `MAPA.md`, e mostre:

```
buildx — <titulo do projeto>
Etapa: <B-N> · Modo: <autonomo | briefing> · Ciclo de recursão: <n> de <teto>

FEATURES
| ID | feature | status | PR |
|----|---------|--------|----|

PENDÊNCIAS
Decisão humana: <n>
Recurso externo: <n>

PREMISSAS
Registradas: <n> · Provisórias: <n>
```

3. Encaminhe: `/buildx-retomar` se houver etapa pendente, `/buildx-mapa` para ver ou regerar o mapa.

## O que este comando nunca faz

- **Não faz uma segunda pergunta.** No modo autônomo a pergunta única foi a última. Dúvida vira premissa registrada ou pendência — nunca interrupção.
- **Não faz merge.** O buildx entrega PRs abertos, verdes e descritos. Integrar é decisão humana, e não é oferecida no fim.
- **Não decide regra de negócio.** A fronteira: o buildx decide como o sistema se protege, não o que o sistema faz.
- **Não para no primeiro bloqueio.** Registra, marca a feature, segue para a próxima. O B5 classifica depois.

## Relatar não é perguntar

Nos dois modos, relate o progresso em uma linha por transição de feature. Nunca peça confirmação para seguir, nunca ofereça parar. O usuário fechou os olhos; abrir por conta própria quebra o acordo.

```
FT-03 autenticacao-e-usuarios ......... entregue  (PR #12, 4 sprints, 31 testes)
FT-04 cadastro-de-contratos ........... em andamento, sprint 2 de 3
```
