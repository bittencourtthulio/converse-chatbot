# B1 — Concepção

Transformar um parágrafo em linguagem natural no escopo completo do projeto, incluindo tudo que o autor não pensou em pedir.

Entrada: a descrição do usuário. Saídas: `docs/produto/PRODUTO.md`, `docs/projeto/PROJETO.md`, `docs/projeto/PREMISSAS.md`, e o veredito auto-assinado do prodx.

## Passo 1 — A pergunta única

Antes de qualquer leitura, qualquer arquivo, qualquer análise. É a primeira coisa que acontece.

```
Como você quer conduzir este projeto?

  1. AUTÔNOMO TOTAL — eu decido tudo, você não é interrompido em
     nenhum momento até o sistema estar pronto. Cada decisão tomada
     em seu nome fica registrada como premissa, para você auditar
     depois.

  2. BRIEFING — eu faço uma rodada de perguntas agora, só as que
     mudam a arquitetura, e depois rodo sozinho até o fim.
```

Grave a resposta em `modo` no frontmatter do `PROJETO.md`. Ela governa o comportamento de todas as etapas seguintes e de todas as camadas invocadas.

**Se o usuário não responder claramente** — responde outra coisa, ou já emenda detalhes do projeto — assuma `autonomo` e diga em uma linha que assumiu. Não repita a pergunta: repetir pergunta já é violar a regra 1.

## Passo 2 — A rodada de briefing, se for o caso

Só no modo `briefing`. **Uma rodada, no máximo dez perguntas, todas de uma vez.** Não é conversa: é um formulário. Depois dela o silêncio começa e não é mais quebrado.

Pergunte apenas o que muda a arquitetura. O critério é duro: se as duas respostas possíveis levam ao mesmo desenho, a pergunta não entra. Os eixos que costumam qualificar:

| Eixo | Por que muda a arquitetura |
|---|---|
| Quem são os usuários e como se autenticam | e-mail/senha, SSO corporativo, OAuth social e magic link produzem sistemas diferentes |
| Um cliente ou vários (multi-tenant) | isolamento de dados atravessa todo o modelo, não se acrescenta depois |
| Onde roda | nuvem gerenciada, VPS própria e on-premise mudam deploy, backup e observabilidade |
| Volume esperado na largada | dez usuários e dez mil usuários não pedem a mesma arquitetura |
| Dado sensível envolvido | saúde, financeiro e dado pessoal disparam obrigação legal específica |
| Integração obrigatória com sistema existente | define contrato, formato e janela de indisponibilidade |
| Prazo ou marco imutável | muda o recorte das features, não o escopo total |
| Preferência ou restrição de stack | linguagem, banco ou nuvem já decididos pela casa |

Não pergunte o que o catálogo de lacunas (`02-lacunas.md`) sabe decidir sozinho. Retenção de log, política de senha e formato de auditoria são premissas, não perguntas.

Cada resposta vira premissa em `PREMISSAS.md` com `origem: briefing`, do mesmo jeito que as decididas — o registro é o mesmo, muda só quem decidiu.

## Passo 3 — O prodx em modo greenfield

Invoque o prodx. Ele é a camada dona do escopo; o buildx não reimplementa o raciocínio de produto.

O modo greenfield muda quatro coisas no prodx, e nenhuma outra:

| Etapa do prodx | No greenfield |
|---|---|
| P0 triagem | **pulada.** Não há chamado a triar; um projeto inteiro dispara G1 por definição. Vai direto para avaliação completa. |
| P1 contexto de produto | **roda**, mas monta o `PRODUTO.md` a partir da descrição do usuário, não de um sistema existente. Signatário: `buildx (modo autonomo)`, `provisorio: true`. |
| P3 verificação de existência | **pulada.** Não há sistema onde a funcionalidade pudesse já existir. Registre a razão do pulo no `02-existencia.md` em vez de omitir o arquivo. |
| P5 veredito | **auto-assinado.** `veredito: fazer`, `aprovado_por: buildx (modo autonomo)`, `provisorio: true`, `aprovado_em` com a data do sistema. |

O P2 (entendimento do pedido) e o P4 (avaliação) rodam normalmente — são exatamente onde a regra 4 do prodx ganha o dia: **o requisito é o problema, não a solução pedida.** Uma descrição de projeto vem cheia de solução ("quero um dashboard com gráfico de pizza"); o P2 é onde isso vira problema ("quem decide precisa ver a distribuição por categoria").

O `03-avaliacao.md` do P4 tem um campo que no greenfield é o mais importante de todos: **escopo mínimo**. Um projeto descrito em um parágrafo quase sempre pode entregar valor com metade do que foi listado. Registre a versão mínima; ela vira a ordem do `MAPA.md` no B3, não um corte do escopo.

Detalhe operacional do prodx: `references/integracao/prodx.md`.

## Passo 4 — A varredura de lacunas

**O coração do B1**, e a razão de o buildx existir em vez de o usuário falar direto com o sprintx.

Percorra o catálogo de `02-lacunas.md` inteiro. Para cada item:

1. A descrição do usuário mencionou? → registre como requisito no `PROJETO.md`, seção "o que foi pedido".
2. Não mencionou, mas o catálogo diz que este tipo de sistema exige? → **decida o padrão sensato**, registre como premissa em `PREMISSAS.md`, e acrescente ao `PROJETO.md` na seção "o que foi descoberto".
3. Não mencionou e o catálogo diz que não se aplica a este tipo de sistema? → não entra. Registre em uma linha na seção "considerado e descartado" do `PROJETO.md`, com o porquê.

O passo 3 importa tanto quanto o 2. Um projeto que declara ter considerado e descartado internacionalização é diferente de um que esqueceu que ela existe — e o `VALIDACAO.md` do B6 confere a lista dos três.

**Nunca invente requisito de negócio.** A varredura decide requisito **não-funcional** — o que todo sistema daquele tipo precisa ter para não ser irresponsável. Regra de negócio que o usuário não declarou não vira premissa: vira pergunta no modo briefing, ou pendência `decisao_humana` no `RECURSAO.md` no modo autônomo.

A fronteira, em uma frase: **o buildx decide como o sistema se protege, não o que o sistema faz.**

## Passo 5 — Gravar o PROJETO.md

Use `assets/TEMPLATE-PROJETO.md`. Seções obrigatórias:

- **Descrição original** — o texto do usuário, literal, sem edição. É a única fonte contra a qual o B6 valida.
- **O problema** — do P2 do prodx, o requisito destilado.
- **O que foi pedido** — cada item que a descrição mencionou, um por linha, verificável.
- **O que foi descoberto** — cada lacuna que virou requisito, com o `PR-NN` da premissa que a sustenta.
- **Considerado e descartado** — cada item do catálogo que não se aplica, com o porquê.
- **Escopo mínimo** — do P4, a versão que já entrega valor.
- **Critérios de aceite de negócio** — o que o usuário do sistema consegue fazer que não conseguia.
- **Fora de escopo** — explícito, para o B3 não recortar feature que ninguém pediu.

## Passo 6 — Gravar o PREMISSAS.md

Use `assets/TEMPLATE-PREMISSAS.md`. Cada premissa carrega cinco campos, e o quinto é o que a torna auditável:

| Campo | Conteúdo |
|---|---|
| `assunto` | o eixo do catálogo |
| `decisao` | o que foi decidido, em uma frase |
| `por_que` | a razão, ancorada no tipo de sistema |
| `o_que_invalida` | **o fato que, se descoberto, derruba esta decisão** |
| `origem` | `catalogo_lacunas`, `briefing`, `decisao_de_stack`, `f2_autonoma` ou `recursao` |

O campo `o_que_invalida` é o mais importante do arquivo. Ele é o que transforma uma decisão tomada às cegas em algo que o humano consegue revisar em trinta segundos: ele lê o que invalidaria, sabe se aquilo é verdade no caso dele, e só então precisa pensar.

## Critério de saída do B1

Todos verdadeiros, senão o B1 não terminou:

- `PROJETO.md` existe, com as oito seções preenchidas e frontmatter válido
- `PREMISSAS.md` existe, com toda premissa carregando `o_que_invalida` não vazio
- o catálogo de `02-lacunas.md` foi percorrido inteiro — todo item aparece numa das três seções
- `VEREDITO.md` do prodx existe, com `veredito: fazer` e `aprovado_por` preenchido
- nenhuma pergunta foi feita ao usuário além da pergunta única e da rodada de briefing

## Erros que este passo comete

- **Registrar como premissa o que o usuário disse.** Premissa é o que o buildx decidiu, não o que foi pedido. Confundir os dois esvazia o valor de auditoria do `PREMISSAS.md`.
- **Pular a seção "considerado e descartado" por parecer burocrática.** É ela que prova que a varredura rodou inteira, e o B6 a confere.
- **Deixar `o_que_invalida` genérico** ("se os requisitos mudarem"). Tem que ser um fato verificável: "se houver usuário fora do Brasil", "se o volume passar de mil requisições por minuto".
- **Decidir regra de negócio na varredura.** A fronteira é dura: como se protege, não o que faz.
