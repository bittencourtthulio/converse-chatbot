# B3 — Decomposição

Converter um projeto inteiro numa lista ordenada de features, cada uma do tamanho que o sprintx sabe planejar.

Entrada: `PROJETO.md`, `PREMISSAS.md`, `CONVENCOES.md`. Saída: `docs/projeto/MAPA.md`.

**Esta é a única etapa que faz algo que nenhuma outra camada da suíte faz.** O sprintx planeja *uma* feature com profundidade; ele não sabe olhar um sistema e decidir onde cortar. Se o B3 recortar mal, todo o resto do buildx executa bem uma decomposição ruim — e isso é pior do que não ter buildx, porque o erro vem embrulhado em onze planos impecáveis.

## O que é uma feature, aqui

Uma feature do `MAPA.md` é **uma fatia vertical que atravessa as três camadas e entrega algo que um usuário do sistema consegue fazer.**

Três testes, todos obrigatórios:

| Teste | Pergunta |
|---|---|
| **Vertical** | atravessa apresentação, aplicação e dados? Uma feature só de banco não é feature, é task. |
| **Enunciável** | cabe numa frase do tipo "o usuário consegue ___ que antes não conseguia"? |
| **Demonstrável** | dá para mostrar funcionando numa tela, sem explicar o que ainda falta? |

Falhou em qualquer um dos três: não é feature. Junte com outra, ou é uma task dentro de uma.

### O que não é feature

- **"Modelagem do banco"** — corte horizontal. O modelo de cada entidade nasce dentro da feature que precisa dela.
- **"Configurar o projeto"** — isso é o B2, e já aconteceu.
- **"Testes"** — TDD do sprintx: o teste nasce dentro da task, nunca depois, nunca em separado.
- **"Refatorar"** — não há o que refatorar num projeto que não existe.
- **"Melhorias de UX"** — acabamento é parte de cada feature (P-6), não uma fatia no fim que sempre é cortada.

## O tamanho certo

O sprintx planeja bem uma feature que rende **entre uma e três sprints**. Fora dessa faixa, corrija:

| Sintoma | Diagnóstico | Correção |
|---|---|---|
| a `entrega` precisa de "e" para caber numa frase | grande demais | quebre pelo "e" |
| a F2 teria mais de dez decisões a tomar | grande demais | quebre por eixo de decisão |
| a feature sozinha não é demonstrável | pequena demais | junte com a vizinha |
| duas features sempre mudam os mesmos arquivos | corte errado | corte na fronteira certa |

Faixa saudável de um projeto descrito num parágrafo: **entre 6 e 15 features.** Menos de 5, o recorte está grosso. Mais de 20, está picado — e cada feature carrega o custo fixo de branch, plano, auditoria e PR.

## Features que já têm módulo

**Esta consulta acontece com o `MAPA.md` fechado e antes de ele ser gravado**, e a ordem não é detalhe: nessa janela ela é barata e não contamina. Antes, decidiria o recorte; depois, não influenciaria nada.

Terminado o recorte, para cada feature que integra um terceiro — pagamento, WhatsApp, storage, email transacional, nota fiscal, assinatura digital, mensageria — rode `/modulex-buscar` com o **problema** da feature, na linguagem do `MAPA.md`. Nunca pelo nome do fornecedor.

O desfecho entra na feature como campo (`modulo_disponivel`, `fatias_candidatas`), não como texto solto.

### O módulo não recorta o projeto

**Os três testes — vertical, enunciável, demonstrável — continuam sendo os únicos que decidem onde cortar.** A fatia de um módulo é **candidata** a fronteira, nunca a fronteira: as fatias conhecem o sistema de onde o módulo saiu; os três testes conhecem este projeto.

Fatias sugerindo fronteira diferente do seu recorte: **anote a divergência e siga com o seu recorte.** Refazer o corte para casar com o módulo é a casa de origem decidindo a arquitetura da casa de destino.

**A exceção, e ela é estreita:** quando uma fatia opcional cobre exatamente uma feature que o seu recorte tinha grudado em outra, e separá-las passa nos três testes, separe. Aí o módulo é evidência de que a fronteira existe, não razão para criá-la.

### Dois módulos para o mesmo problema

Entram os dois, como dois candidatos. **O buildx não escolhe fornecedor** — a escolha acontece na F2/F3 do sprintx, dentro do B4, com o `CONVENCOES.md` na mesa.

### A escolha de fatias, sem quebrar a pergunta única

O M1 do `modulex`, por desenho, **não injeta módulo inteiro por padrão**: sem fatia indicada, ele pergunta quais fatias. O buildx não pode perguntar — depois da pergunta única, nenhuma outra chega ao usuário, em nenhum dos dois modos.

A resolução é a mesma que o B4 já usa para a F2 do sprintx: **responder no lugar do humano e registrar a premissa.**

1. Derive a escolha do **escopo da feature no `MAPA.md`**, que é fonte legítima porque saiu do `PROJETO.md` e das premissas.
2. Registre em `docs/projeto/PREMISSAS.md` **antes de usar**, com o que assume e o que a invalidaria:

   ```
   Premissa: a feature FT-04 usa as fatias <nucleo> do modulo <id>.
   Assume que <o que o MAPA.md diz que a feature entrega>.
   Invalidada se o usuario quiser <o que as fatias descartadas cobrem>.
   ```

3. **Não sendo derivável qual fatia serve, a premissa é só o núcleo obrigatório.**

**Injetar tudo é proibido.** Injetar seis fatias numa feature que só quer receber e responder mensagem enche a base da F1 com IA, ligações e grupos que ninguém pediu — e a F3 planeja o que foi injetado. No modo autônomo ninguém percebe a tempo.

Errar para menos custa uma injeção a mais depois. Errar para mais custa um projeto inteiro planejado a mais. Por isso o padrão é o núcleo.

### O que não desce daqui

A stack **herdada** do módulo não vai para o `CONVENCOES.md` — ele é do B2, e já aconteceu. O que o módulo declara como **essencial ao terceiro** entra como restrição técnica a respeitar, nunca como convenção a adotar. Ver `references/integracao/stackx.md`.

**Sem `modulex` instalado, ou com o catálogo não alcançável:** decomponha como sempre, com os dois campos em `-`. Não instale nada, não pergunte, não pare.

## O contrato da feature

Toda feature do `MAPA.md` declara, obrigatoriamente:

| Campo | Conteúdo | Regra |
|---|---|---|
| `id` | `FT-NN` | sequencial, nunca reaproveitado |
| `slug` | o que o sprintx usará em `docs/<slug>/` | minúsculo, sem acento, hifens, no máximo 5 palavras |
| `titulo` | título curto | sem verbo de pedido |
| `entrega` | o que o usuário consegue fazer que não conseguia | **verificável, sem adjetivo** |
| `depende_de` | `[ids]` ou `[]` | explícito; nunca inferido em tempo de execução |
| `paralelizavel` | `true` \| `false` | declarado aqui, nunca decidido no B4 |
| `origem` | `descricao` \| `premissa` \| `recursao` \| `template` | rastreia por que a feature existe |
| `status` | `pendente` \| `em_andamento` \| `entregue` \| `bloqueada` | nasce `pendente` |
| `modulo_disponivel` | `<id>` \| `-` | preenchido pela consulta ao catálogo; `-` quando não há |
| `fatias_candidatas` | `<slugs>` \| `-` | as fatias do módulo que cobrem esta feature |

O campo `origem` é o que o B6 usa para conferir: toda premissa de segurança do `PREMISSAS.md` precisa ter virado feature com `origem: premissa`, ou estar explicitamente dentro de uma feature com `origem: descricao`. Premissa registrada que não virou código é a falha mais cara que este método pode cometer — ela cria a impressão de que o sistema está protegido.

## A ordem

Não é negociável em dois pontos.

**1. A fundação vem primeiro.** A `FT-01` é sempre a feature da fundação —
autenticação, modelo de usuário e papéis —, porque toda outra feature vai
verificar quem está pedindo, e acrescentar autorização depois exige revisar
toda rota já escrita (L2).

**Mas ela chega ao B4 já implementada.** O template copiado no B2 traz a
autenticação, o usuário de demonstração (P-5), a casca visual (P-6) e o
esqueleto de aplicação (P-9) prontos e com suíte verde. Então a `FT-01`
muda de natureza: em vez de construir do zero, ela **adapta e verifica**.

O que a `FT-01` faz, então:

| Trabalho | O que é |
|---|---|
| adaptar | nome do sistema, textos do painel, itens de navegação que o projeto exigir |
| semear | os dados de exemplo do domínio, para que as telas do projeto tenham o que mostrar |
| verificar | rodar a suíte herdada inteira, numa cópia limpa |
| converter | rodar o `stackx-detectar` sobre o código real e trocar `decidido_pelo_buildx` pela evidência (o Passo 6 do B2) |

Ela declara `origem: template` — um valor a mais no contrato, ao lado de
`descricao`, `premissa` e `recursao` —, e é a única feature que pode nascer
com o código já escrito. Isso é rastro, não atalho: o B6 continua tendo o
que conferir, e as premissas que ela realiza continuam tendo dona.

**Se o projeto não precisar de adaptação nenhuma**, a `FT-01` ainda existe e
ainda é entregue: rodar a suíte herdada numa cópia limpa e converter as
convenções é trabalho real, e é o que prova que o template chegou inteiro
*neste* projeto.

**2. Nenhuma feature precede aquilo de que depende.** Ordene por dependência topológica. Empate, decida por: primeiro o que mais features dependem; depois o que está no escopo mínimo do `PROJETO.md`; depois o que é mais simples.

### O escopo mínimo manda na ordem, não no conteúdo

O P4 do prodx registrou o escopo mínimo — a versão que já entrega valor. Ele **não corta features do mapa**: ordena. Tudo que estiver no escopo mínimo vem antes de tudo que não estiver.

O ganho é concreto: se a execução travar na feature nove, o que existe é um sistema útil incompleto, não um esqueleto de tudo.

## O paralelismo

Declarado aqui, no B3, e nunca decidido em tempo de execução (regra 6 do sprintx, herdada).

Marque `paralelizavel: true` apenas quando as duas condições valerem:

- não há dependência entre as features, direta ou transitiva
- os conjuntos de arquivos que cada uma toca **não se sobrepõem**

Na dúvida, `false`. Duas features paralelas que colidem no mesmo arquivo custam um conflito de merge, que custa uma decisão humana — exatamente o que o modo autônomo não pode pagar.

## Passo a passo

1. **Leia o `PROJETO.md` inteiro.** As oito seções, inclusive "considerado e descartado" — ela evita recortar feature que o B1 já descartou.
2. **Liste os verbos do usuário.** Cada coisa que alguém consegue fazer no sistema é candidata a feature. É o recorte mais confiável, porque é o recorte do usuário.
3. **Agrupe por entidade e por ator.** Verbos sobre a mesma entidade, para o mesmo ator, costumam ser uma feature ("criar, editar, arquivar contrato").
4. **Extraia a fundação.** Autenticação, usuário, papéis, casca visual, usuário de demonstração e o esqueleto do P-9 viram a `FT-01`, com `origem: template` — ela chega implementada pelo B2, e o trabalho dela é adaptar e verificar.
5. **Percorra o `PREMISSAS.md`.** Cada premissa: já está dentro de alguma feature? Se não, vira feature própria com `origem: premissa`. Nenhuma pode sobrar.
6. **Aplique os três testes** a cada candidata. Ajuste o tamanho.
7. **Ordene** por dependência, com o escopo mínimo primeiro.
8. **Declare o paralelismo**, conservador.
9. **Grave o `MAPA.md`** com `assets/TEMPLATE-MAPA.md`.

## Critério de saída do B3

- `MAPA.md` existe, com frontmatter válido e toda feature com os oito campos
- toda feature passa nos três testes: vertical, enunciável, demonstrável
- `FT-01` é a fundação, com `origem: template`: autenticação, usuário de demonstração, casca visual e o esqueleto do P-9, herdados do B2 e verificados
- nenhuma feature do mapa duplica o que o P-9 já entrega: feature de negócio acrescenta item à barra lateral e tela ao sistema, não recria a área de configurações
- o grafo de `depende_de` não tem ciclo, e nenhuma feature precede sua dependência
- **toda premissa do `PREMISSAS.md` está coberta** por alguma feature
- todo item de "o que foi pedido" do `PROJETO.md` está coberto por alguma feature
- nada em "fora de escopo" virou feature
- entre 5 e 20 features; fora disso, o recorte foi revisado

## Erros que esta etapa comete

- **Cortar em camadas em vez de fatias.** "Banco", "API", "telas" é o erro clássico: nada é demonstrável até a última, e a última nunca chega inteira.
- **Deixar premissa órfã.** Rate limit, trilha de auditoria e exclusão de conta pela LGPD não pertencem a nenhuma feature de negócio; se ninguém as adotar, viram feature própria.
- **Deixar o acabamento visual para o fim.** Vira a feature que se corta quando o tempo aperta, e o sistema é reprovado por quem olha.
- **Tratar o esqueleto do P-9 como feature adiável.** "Cadastro de usuários" e "perfil" parecem features de negócio e não são: são a moldura. Recortados como `FT-08`, chegam depois de sete features que já leem usuário — e cada uma precisa ser revisada.
- **Otimismo no paralelismo.** Marcar `true` porque "provavelmente não conflita" troca tempo de máquina por decisão humana no meio do modo autônomo.
- **Feature que só um desenvolvedor entende.** Se a `entrega` não faz sentido para quem vai usar o sistema, o corte é técnico e não sobrevive à validação do B6.
