# Integração — prodx

O prodx é a camada de produto: o portão entre o pedido e o planejamento técnico. O buildx o invoca duas vezes — no B1 para abrir o projeto, no B6 para validá-lo.

## Por que o prodx e não o buildx

O raciocínio de produto — separar solução de problema, achar o escopo mínimo, decidir se vale — já existe e está escrito. Reimplementá-lo no buildx criaria duas fontes que envelhecem separadas. O buildx invoca; o prodx pensa.

## O modo greenfield

O prodx foi desenhado para triar pedidos sobre um sistema **que existe**. No buildx não existe sistema nenhum. Quatro coisas mudam, e nenhuma outra:

| Etapa | Normal | Greenfield |
|---|---|---|
| P0 triagem | decide entre veredito direto e avaliação completa | **pulada.** Um projeto inteiro dispara G1 e G8 por definição; triar seria teatro |
| P1 produto | monta o `PRODUTO.md` do sistema existente | monta a partir da descrição do usuário. Signatário `buildx (modo autonomo)`, `provisorio: true` |
| P3 existência | verifica se já existe, com evidência | **pulada.** Não há onde procurar. Grave o `02-existencia.md` registrando o pulo e a razão — não omita o arquivo |
| P5 veredito | aguarda assinatura humana | **auto-assinado:** `fazer`, `aprovado_por: buildx (modo autonomo)`, `provisorio: true` |

P2 e P4 rodam sem alteração, e são onde o prodx ganha o dia.

## Por que P2 e P4 importam tanto aqui

**P2 — o requisito é o problema.** Uma descrição de projeto é quase toda solução: "quero um dashboard com gráfico de pizza", "preciso de um botão que exporte". O P2 converte em problema — "quem decide precisa ver a distribuição por categoria" — e é essa conversão que impede o B3 de recortar features a partir de uma solução que o usuário imaginou em trinta segundos.

**P4 — o escopo mínimo.** O campo mais valioso do prodx no contexto do buildx. Um projeto descrito num parágrafo quase sempre entrega valor com metade do que foi listado.

No buildx o escopo mínimo **não corta nada** do mapa: ele **ordena**. Tudo que está nele vem antes de tudo que não está. O ganho aparece quando a execução trava na feature nove — o que existe é um sistema útil incompleto, não um esqueleto de tudo pela metade.

## As duas regras do prodx que o buildx quebra

| Regra | Como fica |
|---|---|
| **R1** — a skill não decide, humano assina | o buildx assina, `provisorio: true` |
| **R2** — nada segue ao sprintx sem veredito assinado | a auto-assinatura satisfaz o portão |

Ambas restritas ao modo, ambas registradas no artefato que tocam. Um `VEREDITO.md` do buildx é distinguível de um assinado por gente em uma olhada: o campo `aprovado_por` diz quem foi e o `provisorio: true` diz o que isso vale.

**A razão de quebrar.** A R1 existe porque dizer "não" a um cliente tem consequência comercial. No buildx não há cliente ouvindo não: o usuário já disse sim ao projeto inteiro, e o veredito é `fazer` por construção. A regra protege contra um risco que o modo autônomo não corre.

## O indicador do prodx no buildx

O prodx mede a taxa de pedidos que **não** viram trabalho — se tudo que entra vira trabalho, ele é carimbo.

**Esse indicador não se aplica ao buildx**, e o `/prodx` não deve reportá-lo como alarme quando os vereditos vierem de projetos do buildx. Todo projeto do buildx sai `fazer`; o usuário decidiu construir antes de invocar. O prodx aqui não filtra: ele estrutura.

Distinga pela `via`: veredito com `aprovado_por: buildx (modo autonomo)` fica fora do cálculo do indicador.

## O B6 — o prodx como auditor

No fim, o prodx volta pelo outro lado: confere o construído contra o `PROJETO.md` que ele mesmo ajudou a montar.

O valor vem de ser **a mesma camada, no papel invertido**. O prodx do B1 perguntou "o que este sistema precisa ter"; o do B6 pergunta "tem?". A lista de conferência é literalmente a saída do B1, e é por isso que o B1 gasta esforço registrando até o que descartou: sem o registro, o B6 não tem contra o que conferir.

Detalhe operacional em `07-validacao.md`.

## Comportamento sem prodx instalado

O buildx **não roda sem prodx**. Diferente do que valeria para o memox, isto não é degradação graciosa: sem o P2 o buildx recortaria features a partir da solução imaginada pelo usuário, e sem o P4 não haveria escopo mínimo para ordenar o mapa.

Sem prodx, diga qual camada falta e como instalar (`npx expxdev init`), e pare.
