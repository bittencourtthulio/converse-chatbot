# Integração — sprintx

O sprintx planeja e executa uma feature, F1 a F6. O buildx o invoca uma vez por feature do `MAPA.md`, dentro do laço do B4.

## A divisão

| Pergunta | Quem responde |
|---|---|
| Que sistema é este? | buildx, B1 (via prodx) |
| Quais features ele tem? | **buildx, B3** — o vão que só o buildx preenche |
| Em que ordem? | buildx, B3 |
| Como construir esta feature? | sprintx, F3 |
| Em que ordem dentro da feature? | sprintx, F3 |
| Quanto custa? | sprintx, F3.5 |

O sprintx é excelente em profundidade e não tem opinião sobre largura: ele planeja *uma* feature com rigor e não sabe olhar um sistema e decidir onde cortar. O buildx corta; o sprintx aprofunda.

## O que o buildx entrega por feature

Um briefing montado do `MAPA.md`, `PROJETO.md` e `PREMISSAS.md` — o mesmo papel do `BRIEFING.md` do prodx num pedido isolado:

| Campo | De onde vem | Por que a F1 não teria sozinha |
|---|---|---|
| problema | `entrega` da feature | o requisito já destilado pelo P2 |
| escopo | o recorte do B3 | a fronteira com as features vizinhas |
| não-objetivos | as features vizinhas, nominalmente | impede a F2 de invadir escopo alheio |
| critérios de aceite de negócio | `PROJETO.md` | os que esta feature cobre |
| premissas aplicáveis | os `PR-NN` que esta feature realiza | as decisões já tomadas, com o que as invalida |
| convenções | ponteiro para `CONVENCOES.md` | o dialeto do projeto, decidido no B2 |

Mais duas chaves no frontmatter de todo artefato da feature: `origem_buildx` (o `projeto_id`) e `feature_id` (o `FT-NN`). São elas que permitem, depois, abrir qualquer plano de sprint e saber de qual projeto e qual feature ele veio.

**O briefing não contém decisão técnica** — a mesma fronteira do prodx (regra 10 dele). Arquitetura, camada e biblioteca são do sprintx. A exceção é o `CONVENCOES.md`, que não é decisão desta feature: é o dialeto que o projeto inteiro já adotou no B2, e todas as features o respeitam igualmente.

## A F2 autônoma

**A única regra do sprintx que o buildx quebra**, e a mais séria.

A regra 10 obriga a F2 a entrevistar o humano em blocos de até cinco perguntas, esperando resposta. No modo autônomo isso é incompatível com a promessa: o usuário fechou os olhos.

Então o buildx responde. O procedimento tem quatro degraus, na ordem, sem pular:

| Degrau | Fonte | O que registrar |
|---|---|---|
| 1 | `PROJETO.md` | a seção que responde |
| 2 | `PREMISSAS.md` | o `PR-NN` |
| 3 | `CONVENCOES.md` | a regra |
| 4 | nenhuma responde | **crie a premissa primeiro**, com `origem: f2_autonoma`, e responda com ela |

O degrau 4 é o que separa decisão auditável de invenção. Nunca responda com algo que não esteja escrito em um dos três — se não estiver, escreva antes.

Grave em `00-DECISOES.md` com `respondido_por: buildx` e a fonte de cada resposta. O arquivo continua sendo o registro de decisões da feature; muda apenas quem decidiu, e isso fica à vista.

### A fronteira que a F2 não atravessa

Se a F2 levantar **regra de negócio** que nenhum dos três arquivos responde — prazo de validade de um contrato, se desconto acumula, qual imposto incide — o buildx não decide.

Isso não é requisito não-funcional. É o que o sistema faz, e decidir no lugar do usuário produz um sistema que funciona e está errado — o pior resultado possível, porque parece pronto.

Nesse caso: `00-BLOQUEIOS.md`, pendência `decisao_humana` no `RECURSAO.md`, e siga com **a decisão mais reversível possível**, marcada como provisória no código e na premissa. O relatório final abre com essas.

## As regras do sprintx que o buildx não toca

| Regra | Por que se mantém |
|---|---|
| **R3** — TDD obrigatório | a rede que torna a execução autônoma possível. Relaxar aqui é serrar o galho |
| **R4** — task só conclui com os dois testes passando | "concluída com ressalva" não existe, nem no modo autônomo |
| **R8** — dúvida vira bloqueio, nunca parada | já é exatamente o comportamento que o buildx precisa |
| **R14** — a F5 audita e não corrige; achado alto volta à F3 | execução autônoma sem auditoria respeitada é dano autônomo |
| **R15** — proibido código antes da F6 | o B2 entrega esqueleto, não funcionalidade |

A R8 merece nota: ela já foi escrita pensando em execução autônoma, e é o que faz o laço do B4 funcionar sem o buildx precisar inventar tratamento de erro.

## As fases, uma a uma, sob o buildx

| Fase | Sob o buildx |
|---|---|
| F1 ingestão | normal, com o briefing do buildx como entrada |
| F2 descoberta | **respondida pelo buildx**, quatro degraus |
| F3 plano | normal. A pergunta da R11 é respondida pelo mesmo procedimento |
| F3.5 estimativa | **opcional.** Não há prazo a negociar; rode se for barata |
| F4 orquestrador | normal |
| F5 auditoria | normal, e obedecida. Reprovado três vezes: a feature vira `bloqueada` |
| F6 execução | normal. O acabamento visual acontece nas tasks de interface, sobre os tokens do design system (P-6, P-7) |

## O laço F3 ↔ F5

Achado alto manda voltar à F3. Sem limite, isso gira.

**Limite: duas voltas.** Um plano reprovado três vezes tem problema que replanejar não resolve — normalmente o recorte da feature no B3 estava errado. Terceira reprovação: feature `bloqueada`, e o B5 classifica como `replanejamento` (que tem o próprio teto) ou `decisao_humana`.

## Comportamento sem sprintx

O buildx **não roda**. O sprintx é o motor de tudo que acontece no B4. Diga que falta e como instalar (`npx expxdev init`), e pare.
