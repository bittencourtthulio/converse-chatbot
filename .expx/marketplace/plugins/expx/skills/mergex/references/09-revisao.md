# E9 — REVISÃO E MERGE (MANUAL)

Você está no E9. Esta etapa é diferente de todas as outras da mergex.

**O E9 NUNCA executa automaticamente.** Não é encadeado por nenhum fluxo, não é sugerido ao fim de um trabalho, não aparece como "próximo passo" em relatório nenhum, e não é oferecido depois do E8. Ele só roda quando o desenvolvedor chama `/mergex-revisar` explicitamente (regra 16).

Se você chegou aqui por qualquer outro caminho que não uma chamada explícita, **volte**: você está encadeando o que não pode ser encadeado.

O E9 tem uma função: **dar ao desenvolvedor o estado real de cada PR aberto, na ordem que faz o dia render, e conduzir um merge por vez com confirmação.** Ele não decide, não resolve conflito, não aprova.

## Pré-requisitos verificáveis

- Chamada explícita do desenvolvedor.
- Repositório versionado com remoto configurado.
- Ferramenta de linha de comando do serviço presente e autenticada (`gh auth status` / `glab auth status`).

Sem a ferramenta, o E9 não tem como listar nem integrar PRs. Diga isso e encerre — **nunca peça credencial** (regra 12):

```
mergex E9 — não é possível listar os pull requests

Motivo: <ferramenta não instalada | não autenticada>
A revisão e o merge precisam ser feitos pela interface do serviço de hospedagem.
```

## Passo 1 — Listar os pull requests abertos

```
gh pr list --state open --json number,title,author,headRefName,baseRefName,isDraft,mergeable,url,files,statusCheckRollup
```

Inclui rascunhos: eles aparecem na lista, marcados, mas **nunca são oferecidos para merge**.

Nenhum PR aberto: diga isso e encerre.

## Passo 2 — Reunir o estado de cada PR

Para cada PR, junte **o que estiver disponível**. Fonte ausente vira "não disponível" na apresentação — nunca suposição.

| Dado | Onde buscar | Quando ausente |
|---|---|---|
| Registro de entrega da mergex | `docs/entregas/<trabalho_id>/ENTREGA.md` na branch do PR | "sem registro da mergex" — PR aberto por fora do método |
| Faixa de raio da legadox | `raio` do `ENTREGA.md` | "raio não calculado" |
| Classificação de atenção | `atencao` do `ENTREGA.md`, ou `ATENCAO.md` na branch | "não classificado" |
| Resultado da integração contínua | `statusCheckRollup` | "sem integração contínua configurada" |
| Conflito com a base | `mergeable` do PR | Verifique localmente (passo 5) |
| Arquivos tocados | `files` do PR | `git diff --name-only <base>...<head>` |
| Aberto pela mergex nesta máquina | `pr_url` do `ENTREGA.md` local casa com a URL do PR | Assuma que não |

### A marcação de trabalho próprio

Se o PR foi aberto pela mergex **na mesma máquina** — a `pr_url` de algum `ENTREGA.md` local casa com a URL do PR —, marque-o na lista:

```
[aberto por esta instalação da mergex — a skill não aprova o próprio trabalho]
```

Não é impedimento: é divulgação. Quem aprova é a pessoa, e ela precisa saber que a máquina que está apresentando o PR é a mesma que o produziu.

## Passo 3 — Detectar sobreposição entre PRs

Cruze as listas de arquivos de **todos** os PRs abertos, dois a dois.

Dois ou mais PRs tocando o mesmo arquivo vão **destacados no topo da lista**, com os dois identificados e os arquivos em comum nomeados:

```
SOBREPOSIÇÃO — dois PRs abertos tocam os mesmos arquivos

  #482 "Corrigir base de cálculo do ICMS-ST" (fix/OC-2026-0184-...)
  #479 "Extrair formatador de nota fiscal" (feature/formatador-nota)
  Em comum:
    src/fiscal/base_calculo.py

Isto não é um bloqueio e não há conflito ainda. É informação para decidir a
ordem: o segundo a entrar vai precisar rebasear ou resolver conflito.
```

**Isto não é prevenção de colisão.** A mergex não previne colisão entre desenvolvedores, não reserva arquivo e não resolve conflito. É informação para quem decide a ordem.

## Passo 4 — Ordenar do MENOR para o MAIOR impacto

**Menor primeiro**, por duas razões que devem ser declaradas na saída:

1. Cada merge fácil que entra **reduz a superfície do próximo** — menos PRs abertos, menos sobreposição possível.
2. **Adiar o difícil não o piora; adiar o fácil sim** — o fácil vai acumulando divergência com a base enquanto espera.

### O critério, na ordem de desempate

Some, em ordem lexicográfica de prioridade (o primeiro critério que difere decide):

| # | Critério | Menor impacto ← → Maior impacto |
|---|---|---|
| 1 | Faixa de raio | sem raio / baixo → médio → alto |
| 2 | Arquivos em OLHO OBRIGATÓRIO | zero → poucos → muitos |
| 3 | Sobreposição com outro PR aberto | nenhuma → com um → com vários |
| 4 | Conflito com a base | sem conflito → com conflito |
| 5 | Quantidade de arquivos tocados | poucos → muitos |
| 6 | Número do PR | menor → maior (desempate final, estável) |

**Declare o critério na saída**, sempre. A ordem sem o critério é opinião; com o critério, é auditável.

PRs **inelegíveis para merge** — rascunho, ou integração contínua vermelha — aparecem na lista, **no fim**, marcados com o motivo, e **não entram na condução do passo 6**.

## Passo 5 — Analisar conflitos (relatar, nunca resolver)

Para cada PR marcado com conflito, esta análise é **o que o E9 tem de mais útil**. É trabalho que ninguém mais faz e que economiza a parte mais cara do dia do revisor.

Levante o conflito sem alterar nada da árvore de trabalho:

```
git fetch origin <base> <head>
git merge-tree $(git merge-base origin/<base> origin/<head>) origin/<base> origin/<head>
```

`merge-tree` calcula o merge **sem tocar na árvore de trabalho e sem criar commit**. Nunca faça um merge de verdade para "ver o conflito".

### Delegue a análise ao agente `analista-de-conflito`

**Passe o conflito ao agente `analista-de-conflito`.** Ele recebe o conflito e
explica o que cada lado pretendia, segundo a mensagem de commit e o plano de
cada trabalho.

Ele é a peça mais útil deste comando, e a que mais se beneficia de contexto
próprio: **ele lê os dois trabalhos sem estar comprometido com nenhum.** Quem
escreveu um dos lados tende a achar que a intenção dele é a óbvia, e a do outro
é o desvio.

**As ferramentas dele são somente de leitura — `Read`, `Grep` e `Glob`, sem
execução de comando.** Não é uma promessa de que ele não vai resolver o
conflito: é impossibilidade técnica. Ele não tem como fazer checkout, merge, nem
escrever no arquivo.

Passe a ele: o conflito calculado com `merge-tree`, a mensagem de commit de cada
lado, e o `tasks.md` (mais o `01-CAUSA-RAIZ.md`, quando é da runx) de cada
trabalho.

**Restrição herdada:** este agente só é acionado por este comando manual. Nada
no fluxo automático da mergex pode chamá-lo.

Para cada arquivo em conflito, relate quatro coisas:

1. **Onde**: arquivo e trechos (as linhas ou a função).
2. **O que este PR pretendia ali**, segundo a mensagem de commit da task e o plano do trabalho.
3. **O que o outro lado pretendia ali** — a base, ou o outro PR — pela mesma fonte.
4. **Por que os dois se cruzaram**: mesma função, mesma linha, ou mudanças adjacentes que o versionador não consegue juntar.

```
CONFLITO — #482 contra main

  src/fiscal/base_calculo.py, função calcular_base_st(), linhas 40–58

  O que #482 pretendia:
    "Excluir o desconto incondicional da base de ST, conforme a regra vigente."
    (T-01.02, fix/OC-2026-0184-icms-st-base-desconto)

  O que entrou na base depois:
    "Extrair o rateio por item para um método próprio."
    (#479, mesclado em 2026-08-28)

  Por que se cruzaram:
    Os dois reescreveram o corpo de calcular_base_st(). Um mudou a fórmula, o
    outro mudou a estrutura. As duas intenções são compatíveis; a junção não é
    automática porque tocam as mesmas linhas.

  A mergex não resolve conflito. Resolver isto é decisão humana: as duas
  intenções precisam coexistir no código final.
```

**Nunca resolva.** Não escolha um lado, não sugira o texto final do arquivo, não faça checkout de versão, não rode `git checkout --ours/--theirs`, não peça ao versionador que decida. Relatar as duas intenções é o limite — e é o ponto (regra 17).

Acrescente, por trecho, **o que perguntar a quem decidir**: a pergunta que
destrava a decisão, não a resposta. É o que o `analista-de-conflito` devolve, e
é o que faz a análise valer o tempo de quem lê — ela nomeia a decisão que só
uma pessoa com contexto de negócio pode tomar.

## Passo 6 — Apresentar a lista

Use `assets/TEMPLATE-revisao.md`. Nesta ordem:

1. **Sobreposições** entre PRs abertos, destacadas no topo (passo 3).
2. **O critério de ordenação**, declarado.
3. **Os PRs elegíveis**, do menor para o maior impacto.
4. **Os inelegíveis**, no fim, com o motivo.

Por PR, exatamente estes campos:

```
#482 — Corrigir base de cálculo do ICMS-ST com desconto incondicional
  Autor: <autor>
  Trabalho: OC-2026-0184-icms-st-base-desconto (runx, regra-de-calculo)
  Impacto: raio ALTO — 3 arquivos em olho obrigatório
  Arquivos: 9 (src/fiscal/ 3, src/relatorios/ 1, tests/ 5)
  Integração contínua: verde
  Conflito: não
  [aberto por esta instalação da mergex — a skill não aprova o próprio trabalho]
  Recomendação: revisar os 3 arquivos de olho obrigatório antes de integrar;
                é o de maior impacto da fila.
```

A **recomendação é uma linha** e é derivada do estado, não de opinião. Ela nunca diz "pode integrar sem olhar".

## Passo 7 — Conduzir, um PR por vez

Na ordem apresentada, **um de cada vez**. Nunca em lote, nunca uma confirmação única para vários (regra 17).

Para cada PR elegível:

1. Apresente o bloco do PR de novo, resumido.
2. **Peça confirmação explícita daquele PR específico.** "Confirma o merge do #482?" — nunca "posso seguir com os três?".
3. Se houver arquivo em **OLHO OBRIGATÓRIO** ou o raio for **ALTO**, a confirmação é dupla: antes de perguntar sobre o merge, pergunte se o desenvolvedor **revisou os arquivos daquela faixa**, listando-os por nome:

```
Este PR tem 3 arquivos em OLHO OBRIGATÓRIO:
  src/fiscal/calculo_icms_st.py — zona de risco fiscal, altera base de cálculo
  src/fiscal/base_calculo.py — zona de risco fiscal, raio ALTO
  migrations/0042_ajusta_precisao_st.sql — migração de banco

Você revisou esses três arquivos? (o merge não segue sem esta confirmação)
```

Sem essa confirmação, **não ofereça o merge** deste PR. Passe para o próximo.

4. Confirmado, faça o merge com a estratégia que o repositório usa (detecte em `CONVENCOES.md` da stackx ou nos merges anteriores; na ausência, use o padrão do serviço). Nunca force, nunca reescreva histórico já enviado.
5. Atualize `pr_estado: merged` no `ENTREGA.md` correspondente, quando ele existir localmente.

   **E, somente se o PR mergeado for o do trabalho atual**, grave `pr_estado: merged`
   também em `.expx/estado.json`. O E9 percorre PRs de vários trabalhos e de outras
   pessoas; a barra mostra **um** trabalho, o que está em andamento nesta sessão. Mergear o
   PR de outro trabalho não muda o estado do seu.

   O PR é do trabalho atual quando a `pr_url` do `ENTREGA.md` daquele PR casa com a do
   `ENTREGA.md` do trabalho nomeado em `trabalho` no próprio `estado.json`. Se `trabalho`
   for `null`, se o `estado.json` não existir, ou se a correspondência não for certa,
   **não grave nada** — na dúvida, deixe a barra como está.

   Não toque em `branch`. O procedimento é o de `10-estado.md`, e falha de gravação vai
   para o rastro sem interromper a condução dos PRs seguintes.
6. Recusa ou silêncio: **não faça o merge**, siga para o próximo, e registre que ele ficou pendente.

### As cinco recusas duras

Não faça merge, em nenhuma hipótese:

| # | Nunca faça merge | Por quê |
|---|---|---|
| 1 | Com integração contínua vermelha | A máquina já provou que algo quebrou |
| 2 | De PR em rascunho | Rascunho declara que ainda não está pronto |
| 3 | Sem confirmação **daquele** PR específico | Confirmação em lote não é confirmação |
| 4 | Com faixa OLHO OBRIGATÓRIO sem a confirmação de que os arquivos foram revisados | É o propósito inteiro da classificação |
| 5 | Resolvendo conflito | A resolução é humana |

## Critério de saída

- [ ] Todos os PRs abertos foram listados, inclusive rascunhos e inelegíveis.
- [ ] Sobreposições estão no topo, com os PRs identificados e os arquivos em comum.
- [ ] O critério de ordenação está declarado.
- [ ] A ordem vai do menor para o maior impacto.
- [ ] PRs com integração vermelha e rascunhos não foram oferecidos para merge.
- [ ] Conflitos foram relatados com as duas intenções, sem resolução.
- [ ] Cada merge feito teve confirmação específica; os de OLHO OBRIGATÓRIO tiveram a confirmação dupla.
- [ ] PRs abertos por esta instalação da mergex estão marcados.
- [ ] `pr_estado: merged` foi para o `.expx/estado.json` **apenas** se o PR mergeado era o do trabalho atual; PR de outro trabalho não alterou a barra.

Ao fim, um resumo: o que foi integrado, o que ficou pendente e por quê.

## O rastro do comando manual

Grave em `docs/eventos/<trabalho_id>.jsonl`: **a lista de PRs avaliados, a ordem
apresentada e o que foi mergeado.**

```json
{"ts":"<ISO-8601 UTC>","expx_eventos":1,"trabalho_id":"<id>","ferramenta":"mergex","origem":"skill","evento":"veredito_emitido","fase":"e9","task":null,"agente":"analista-de-conflito","resultado":"ok","detalhe":"PRs avaliados: #479, #482; ordem: #479 < #482; mergeado: #479","arquivos":[]}
```

O registro é do que **uma pessoa decidiu**, não do que a skill decidiu: a
mergex **nunca faz merge por conta própria, em nenhum caminho**. Cada merge da
lista teve confirmação explícita daquele PR específico.

## Quando falha

| Situação | O que fazer |
|---|---|
| Ferramenta ausente ou não autenticada | Encerra dizendo que a revisão precisa ser feita pela interface; nunca pede credencial |
| Nenhum PR aberto | Diz e encerra |
| PR sem registro da mergex | Apresenta com o que houver e marca "sem registro da mergex" |
| Integração contínua não configurada | Marca "sem integração contínua"; não é impedimento, mas entra na recomendação |
| `mergeable` desconhecido | Verifica localmente com `merge-tree`; se não der, marca "conflito não verificado" e trata como conflito |
| Merge falha no serviço | Relata o erro literal e segue para o próximo PR; nunca tenta contornar |
| Usuário pede para resolver o conflito | Recusa: a mergex relata as duas intenções; a resolução é humana (regra 17) |
| Usuário pede merge em lote | Recusa: um por vez, com confirmação de cada (regra 17) |
