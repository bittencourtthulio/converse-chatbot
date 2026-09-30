---
name: buildx
description: Use quando o usuário descrever um sistema ou projeto INTEIRO que quer construir do zero — "quero um sistema para X", "preciso de uma plataforma que faça Y", "monta um app de Z com A, B e C" — e quiser que a suíte Expx conduza tudo sozinha até o sistema estar pronto, testado e validado. Recebe uma descrição em linguagem natural, mapeia o escopo completo (inclusive o que não foi dito: autenticação, autorização, LGPD, auditoria, backup, observabilidade), decide a stack, quebra o projeto em features, e conduz prodx → stackx → sprintx → mergex feature a feature, recursivamente, até o fim. Use mesmo sem a palavra buildx. NÃO use para uma feature isolada num sistema que já existe (isso é sprintx) nem para defeito (isso é runx).
---

# build^x

build^x ("build elevado a x") é a **camada de orquestração** do método Expx (Exponencial): a peça que fica acima de todas as outras e conduz um projeto inteiro, do parágrafo de descrição ao sistema pronto.

## Princípio central

**Uma descrição entra, um sistema sai.** O humano gasta o esforço uma única vez, na descrição e na escolha do modo. Tudo depois é da máquina — inclusive descobrir o que o humano esqueceu de pedir.

## O que o buildx é, e o que ele não é

O buildx **não implementa nada, não planeja nada e não escreve teste nenhum.** Ele é um maestro: sabe qual camada chamar, em que ordem, com qual entrada, e o que fazer quando uma delas devolve bloqueio. Toda a competência real mora nas camadas irmãs.

| Camada | O que faz pelo buildx |
|---|---|
| `prodx` | mapeia o escopo, varre lacunas, emite o veredito e o briefing (B1); valida no fim (B6) |
| `stackx` | grava as convenções técnicas do projeto (B2) |
| `sprintx` | planeja e executa cada feature, F1 a F6 (B4) |
| `mergex` | abre a branch, verifica prontidão, monta PR e pacote de QA (B4) |
| `legadox` | não participa: projeto novo não tem legado |
| `modulex` | responde se a feature já tem módulo pronto (B3, com o `MAPA.md` fechado e antes de gravado); recebe de volta o que deveria virar módulo novo (B6) |
| `memox` | indexa o que a cadeia produziu; consultado no B5 |

A única coisa que o buildx faz e nenhuma outra camada faz é o **B3: quebrar um projeto em features**. Esse é o vão real que ele preenche — o sprintx planeja *uma* feature e não sabe recortar um sistema.

## A pergunta única

O buildx faz **exatamente uma pergunta**, sempre a primeira, antes de qualquer trabalho:

```
Como você quer conduzir este projeto?

  1. AUTÔNOMO TOTAL — eu decido tudo, você não é interrompido em
     nenhum momento até o sistema estar pronto. Cada decisão tomada
     em seu nome fica registrada como premissa, para você auditar
     depois.

  2. BRIEFING — eu faço uma rodada de perguntas agora, só as que
     mudam a arquitetura, e depois rodo sozinho até o fim.
```

**Modo autônomo:** essa foi a última pergunta. A partir daí, nenhuma outra chega ao usuário — nem do buildx, nem de nenhuma camada que ele invocar. Dúvida vira premissa registrada ou bloqueio registrado; nunca pergunta.

**Modo briefing:** uma única rodada de perguntas no B1, no máximo dez, cobrindo apenas os eixos que mudam a arquitetura (`references/01-concepcao.md` traz a lista). Respondidas, o comportamento é idêntico ao autônomo: silêncio até o fim.

Nos dois modos o buildx **relata progresso** — mas relatar não é perguntar. O usuário vê onde a cadeia está; não precisa responder nada.

## Máquina de estados

Seis etapas sequenciais. O buildx nunca pula etapa e descobre onde está inspecionando o disco em `docs/`:

```
B1 CONCEPÇÃO → B2 FUNDAÇÃO → B3 DECOMPOSIÇÃO → B4 CONSTRUÇÃO → B5 RECURSÃO → B6 VALIDAÇÃO
                                                      ↑                │
                                                      └────────────────┘
```

| Estado do disco | Etapa atual |
|---|---|
| `docs/projeto/PROJETO.md` não existe | B1 |
| `PROJETO.md` existe, `docs/stack/CONVENCOES.md` não | B2 |
| `CONVENCOES.md` existe, `docs/projeto/MAPA.md` não | B3 |
| `MAPA.md` existe, há feature com `status` diferente de `entregue` ou `bloqueada` | B4 |
| Todas as features `entregue` ou `bloqueada`, `docs/projeto/RECURSAO.md` desatualizado | B5 |
| Recursão sem pendência resolvível, `docs/projeto/VALIDACAO.md` não existe | B6 |
| `VALIDACAO.md` com `veredito: aprovado` | fim |

Se o usuário pedir uma etapa adiantada, execute a pendente e diga em uma linha o que fez em vez de obedecer fora de ordem.

## As etapas

### B1 — Concepção

Invoca o **prodx em modo greenfield**. Diferente do prodx normal, que triaga um pedido sobre um sistema existente, aqui não há sistema: a verificação de existência (P3) é vacuidade e é pulada.

O trabalho real do B1 é a **varredura de lacunas**: percorrer o catálogo de requisitos não-funcionais obrigatórios (`references/02-lacunas.md`) e, para cada um que a descrição do usuário não mencionou, decidir o padrão sensato e **registrá-lo como premissa explícita** em `docs/projeto/PREMISSAS.md`.

Saídas: `docs/produto/PRODUTO.md`, `docs/projeto/PROJETO.md`, `docs/projeto/PREMISSAS.md`, e um `VEREDITO.md` auto-assinado.

Roteiro: `references/01-concepcao.md`.

### B2 — Fundação

Invoca o **stackx**. Num projeto vazio não há convenção a detectar, então o stackx inverte de papel: em vez de descobrir o dialeto do repositório, o buildx **escolhe** a stack a partir do `PROJETO.md` e grava `docs/stack/CONVENCOES.md` como decisão, com cada escolha marcada `origem: decidido_pelo_buildx` em vez de `origem: <arquivo>:<linha>`.

Também **copia o template** (`template/`): um projeto real, versionado nesta skill, que já sobe, testa e traz implementado o que não depende do pedido do usuário — três camadas, banco com migrations, autenticação com papéis, usuário de demonstração, o design system do VS Code nas duas variantes, e as quatro telas do esqueleto de aplicação (P-9). Tudo com suíte verde e CI próprio.

O buildx não gera esse esqueleto: gerar custa milhares de tokens para produzir, a cada projeto, uma variação não verificada do que já estava verificado. O que depende do pedido do usuário continua nascendo no B4, sob TDD, sem exceção — e é por isso que o template não traz nenhuma entidade de domínio nem regra de negócio.

Roteiro: `references/03-fundacao.md`.

### B3 — Decomposição

**A peça que só existe aqui.** Converte o `PROJETO.md` numa lista ordenada de features, cada uma do tamanho que o sprintx sabe planejar, e grava `docs/projeto/MAPA.md`.

Contrato da feature — toda feature do mapa declara, obrigatoriamente:

| Campo | Conteúdo |
|---|---|
| `id` | `FT-NN` |
| `slug` | o `<slug-da-feature>` que o sprintx vai usar em `docs/<slug>/` |
| `titulo` | título curto |
| `entrega` | o que o usuário do sistema consegue fazer que não conseguia |
| `depende_de` | `[ids]` ou `[]` |
| `paralelizavel` | `true` \| `false` |
| `origem` | `descricao` (o usuário pediu) \| `premissa` (o buildx descobriu que faltava) |
| `status` | `pendente` \| `em_andamento` \| `entregue` \| `bloqueada` |

A ordem não é negociável em dois pontos: a **feature de fundação** vem primeiro, e nenhuma feature de negócio precede aquilo de que depende.

A `FT-01` é sempre a fundação — autenticação, usuário e papéis —, e carrega junto o **esqueleto de aplicação** (P-9): painel inicial com título e subtítulo, Configurações com cadastro de usuários, perfil e troca de senha, com os itens já na barra lateral. Não é escopo do sistema, é a moldura dele: nenhum usuário descreve isso, e sem isso a entrega não é operável por quem não é o desenvolvedor.

Ela chega ao B4 **já implementada pelo template do B2**, e por isso declara `origem: template`: o trabalho dela é adaptar ao projeto, semear os dados do domínio e verificar a suíte herdada — não construir do zero.

Roteiro: `references/04-decomposicao.md`.

### B4 — Construção

O laço. Para cada feature do `MAPA.md` em ordem de dependência:

```
mergex-abrir      → branch da feature
sprintx F1        → base de conhecimento
sprintx F2        → descoberta: RESPONDIDA PELO BUILDX (ver abaixo)
sprintx F3 → F5   → plano, orquestrador, auditoria
sprintx F6        → execução autônoma sob TDD
mergex-check      → portão de prontidão
mergex-pr         → descrição, push, PR aberto
```

**A F2 no modo autônomo.** A regra 10 do sprintx obriga a F2 a entrevistar o humano. No buildx o humano já falou — na descrição e, no modo briefing, na rodada única. Então o buildx **responde a F2 no lugar dele**, derivando cada resposta do `PROJETO.md`, do `PREMISSAS.md` e do `CONVENCOES.md`, e gravando em `00-DECISOES.md` com `respondido_por: buildx`. Nenhuma resposta é inventada: o que não estiver derivável de um desses três arquivos vira premissa nova em `PREMISSAS.md`, registrada antes de ser usada.

**Bloqueio nunca para o laço.** Feature bloqueada é marcada `bloqueada` no `MAPA.md`, com o motivo, e o laço segue para a próxima. É o B5 que decide o que fazer com ela.

Roteiro: `references/05-construcao.md`.

### B5 — Recursão

Depois que o laço passou por todas as features, o buildx varre os `00-BLOQUEIOS.md` de todas elas e o `MAPA.md`, e classifica cada pendência:

| Classe | Destino |
|---|---|
| resolvível por trabalho novo | vira feature nova no `MAPA.md`, volta ao B4 |
| resolvível por replanejamento | a feature volta para a F3 do sprintx |
| depende de decisão humana | fica em `RECURSAO.md`, reportada no fim |
| depende de recurso externo (credencial, serviço, acesso) | fica em `RECURSAO.md`, reportada no fim |

O ciclo B4 → B5 repete enquanto houver pendência resolvível, com **teto de ciclos** declarado em `RECURSAO.md`. Atingido o teto, o buildx para de tentar e reporta — girar em falso é pior que entregar com pendência declarada.

Roteiro: `references/06-recursao.md`.

### B6 — Validação

O prodx volta, agora como auditor. Confere, item a item, o `PROJETO.md` e o `PREMISSAS.md` contra o que existe de fato no repositório: feature entregue tem PR aberto e verde, cada critério de aceite de negócio tem teste que o cobre, cada premissa de segurança virou código.

Item não atendido e resolvível volta ao B3 como feature nova. Item não atendido e não resolvível entra no relatório final como pendência declarada.

Saída: `docs/projeto/VALIDACAO.md` e o **relatório final** ao usuário — a primeira coisa que ele lê desde a pergunta única.

Roteiro: `references/07-validacao.md`.

## O que o buildx quebra de propósito

O modo autônomo viola regras que existem por bons motivos nas camadas irmãs. Cada violação é deliberada, restrita ao modo, e registrada no artefato que ela toca:

| Regra violada | Camada | Como fica |
|---|---|---|
| "a skill não decide, humano assina" | prodx R1 | o buildx assina, com `provisorio: true` e `aprovado_por: buildx (modo autonomo)` |
| "nada vai ao sprintx sem veredito assinado" | prodx R2 | a auto-assinatura do buildx satisfaz o portão |
| "a F2 é obrigada a perguntar ao humano" | sprintx R10 | o buildx responde, tudo em `00-DECISOES.md` com `respondido_por: buildx` |
| "convenção só se registra com evidência no código" | stackx | no B2 a origem é `decidido_pelo_buildx`, não um arquivo |

**O que o buildx nunca quebra:**

- **`mergex-revisar` continua manual.** Integrar código é decisão humana, e essa é a última rede antes de produção. O buildx entrega PRs abertos, verdes e descritos; quem faz merge é gente.
- **TDD do sprintx.** Teste antes da implementação, sempre. Autonomia não é desculpa para pular a rede que torna a autonomia possível.
- **"Task só é concluída com os dois testes passando."** Não existe conclusão com ressalva, nem no modo autônomo.
- **Nada de segredo em artefato.** Credencial que faltar vira pendência no `RECURSAO.md`, nunca um valor inventado.

## As 12 regras invioláveis

1. Uma única pergunta ao usuário: o modo. No modo autônomo, nenhuma outra chega a ele, de nenhuma camada.
2. Toda decisão tomada no lugar do humano é registrada em `PREMISSAS.md` antes de ser usada, com o que ela assume e o que a invalidaria.
3. O buildx não implementa, não planeja e não testa. Ele invoca a camada dona e verifica a saída.
4. Bloqueio nunca para o laço: registra, marca a feature, segue para a próxima.
5. O ciclo B4 → B5 tem teto declarado. Atingido o teto, para e reporta.
6. Nenhuma feature entra no `MAPA.md` sem `entrega` verificável e `depende_de` explícito.
7. Feature de fundação vem primeiro; nenhuma feature precede aquilo de que depende.
8. Merge é humano. O buildx nunca invoca `mergex-revisar`, nem oferece.
9. O que não for derivável do `PROJETO.md`, `PREMISSAS.md` ou `CONVENCOES.md` vira premissa nova — nunca invenção silenciosa.
10. Todo artefato usa o frontmatter `expx-schema v1`. Artefato sem frontmatter válido é considerado não entregue.
11. Caminhos sempre relativos. Nunca escreva caminho absoluto em nenhum artefato.
12. O relatório final declara toda pendência. Entregar com pendência declarada é honesto; entregar dizendo que está pronto quando não está, não.
13. Módulo do `modulex` não recorta o projeto. No B3 os três testes continuam sendo os únicos que decidem onde cortar, e a fatia de um módulo é candidata a fronteira, nunca a fronteira. No B2 a stack herdada do módulo não entra no `CONVENCOES.md`: projeto novo não tem convenção ainda, e é aí que a herança alheia entra sem resistência.

## Estrutura em disco

```
docs/
  projeto/
    PROJETO.md        o escopo completo, o que foi pedido e o que foi descoberto
    PREMISSAS.md      toda decisão tomada em nome do humano
    MAPA.md           as features, em ordem de dependência
    RECURSAO.md       pendências por ciclo, e o teto
    VALIDACAO.md      a conferência final do prodx
    RELATORIO.md      o que o usuário lê no fim
  produto/            do prodx
  stack/              do stackx
  <slug-da-feature>/  do sprintx, uma pasta por feature do MAPA.md
```

`docs/` é sempre ancorado na raiz do repositório Git mais próxima. Em projeto novo sem `.git`, o B2 inicializa o repositório antes de qualquer coisa.

### Frontmatter

Padrão **expx-schema v1**: chaves em `snake_case` sem acento, enums minúsculos sem acento, datas em ISO, chave nunca omitida.

Kinds do buildx: `projeto`, `premissas`, `mapa`, `recursao`, `validacao`, `relatorio`.

## References e templates

| Arquivo | Conteúdo |
|---|---|
| `references/00-schema.md` | o contrato de frontmatter — **leitura obrigatória** em qualquer etapa que grave arquivo |
| `references/01-concepcao.md` | B1: a pergunta única, o prodx greenfield, o briefing de perguntas |
| `references/02-lacunas.md` | os padrões da casa (P-1 a P-9) e o catálogo de requisitos não-funcionais |
| `references/03-fundacao.md` | B2: escolha de stack, esqueleto testável, o stackx invertido |
| `references/04-decomposicao.md` | B3: como recortar um projeto em features, o contrato e a ordenação |
| `references/05-construcao.md` | B4: o laço, a F2 respondida pelo buildx, o tratamento de bloqueio |
| `references/06-recursao.md` | B5: classificação de pendência, o teto de ciclos |
| `references/07-validacao.md` | B6: a conferência item a item e o relatório final |
| `references/08-design-system.md` | o design system padrão: tokens do VS Code nas duas variantes, tipografia, espaçamento, layout e componentes |
| `template/` | **o esqueleto real** que o B2 copia: projeto Next.js com banco, autenticação, o P-9 implementado e suíte verde. Tem CI próprio; veja o `README.md` dele |
| `references/integracao/prodx.md` | o modo greenfield: o que muda no prodx |
| `references/integracao/sprintx.md` | a F2 autônoma e o contrato de invocação por feature |
| `references/integracao/mergex.md` | onde a mergex entra no laço, e por que o merge fica de fora |
| `references/integracao/stackx.md` | o stackx invertido em projeto vazio |
| `assets/TEMPLATE-PROJETO.md` | template do `PROJETO.md` |
| `assets/TEMPLATE-PREMISSAS.md` | template do `PREMISSAS.md` |
| `assets/TEMPLATE-MAPA.md` | template do `MAPA.md` |
| `assets/TEMPLATE-RECURSAO.md` | template do `RECURSAO.md` |
| `assets/TEMPLATE-VALIDACAO.md` | template do `VALIDACAO.md` |
| `assets/TEMPLATE-RELATORIO.md` | template do `RELATORIO.md` |

Os caminhos são relativos à raiz desta skill. O detalhe operacional mora no reference da etapa; leia-o quando a etapa chegar, e somente o dela.

## Comandos

| Comando | Função |
|---|---|
| `/buildx <descrição>` | o comando único: recebe a descrição, faz a pergunta do modo, e conduz tudo até o fim |
| `/buildx` sem argumento | roteador: mostra em que etapa o projeto está, quais features entregues, bloqueadas e pendentes |
| `/buildx-mapa` | B3 isolada: regera ou mostra o `MAPA.md` |
| `/buildx-retomar` | retoma um projeto interrompido a partir do estado em disco |
| `/buildx-status` | painel seco: features, ciclos de recursão, pendências |

## Comportamento sem as camadas irmãs

O buildx **depende** de prodx, stackx, sprintx e mergex — não é um fallback educado, é a arquitetura. Se alguma faltar, o buildx diz qual falta e como instalar, e para. Executar o método por conta própria seria reimplementar quatro skills mal.

O `legadox` não participa (projeto novo não tem legado) e o `memox` é opcional: sem ele o B5 perde a consulta ao histórico, mas o ciclo funciona.

## Ambiguidades

Decisões tomadas na ausência de informação estão registradas em `DECISOES-DA-SKILL.md`.
