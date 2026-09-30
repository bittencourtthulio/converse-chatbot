---
name: mergex
description: "Use para levar o trabalho já implementado até o repositório e até o revisor humano — criar a branch do trabalho, commitar cada task concluída, verificar se a entrega está pronta, montar a descrição do pull request, gerar o pacote do QA e classificar o que exige olho humano no diff. Use mesmo quando o usuário não disser mergex por nome: basta ele começar a implementar uma feature ou uma ocorrência, terminar uma task, pedir para versionar, criar branch, commitar, subir o trabalho, abrir PR, preparar a entrega, mandar para revisão ou passar para o QA. Cobre abertura da branch, commit por task, portão de prontidão, classificação de atenção humana, descrição do PR, pacote de QA, push, abertura do pull request e registro da entrega."
---

# merge^x

merge^x ("merge elevado a x") é o último metro do método Expx (Exponencial): o que leva o trabalho feito até o repositório e até o revisor humano.

As irmãs terminam com código escrito. A `sprintx` planeja e executa features (F1–F6), a `runx` trata ocorrências de produção (E1–E5), a `legadox` modifica o comportamento das duas em projeto legado, a `stackx` descobre o dialeto técnico do repositório. Nenhuma diz como esse código chega ao revisor. É esse metro final que a mergex cobre — e é onde o rigor costuma se perder.

## Princípio central

**O revisor humano é recurso caro e finito.** O trabalho da mergex é gastar esse recurso onde ele muda o resultado, e não gastá-lo onde a máquina já provou. Toda a skill se organiza em torno disso: o portão barra o que não está pronto, a classificação diz onde olhar linha a linha e onde não olhar, e o pacote de QA tira do revisor o que não é trabalho dele.

## Automático e manual

Esta é a distinção mais importante da skill.

**Todo o fluxo é automático.** As skills irmãs acionam a mergex sozinhas: ela cria a branch, commita cada task, verifica a prontidão, classifica o diff, monta a entrega, sobe a branch e abre o pull request, sem intervenção e sem pedir autorização.

**A única exceção é o comando de revisão e merge de pull requests** (`/mergex-revisar`, etapa E9). Ele **nunca dispara sozinho**: não é encadeado por nenhum fluxo, não é sugerido ao fim de um trabalho, não aparece como "próximo passo" em relatório nenhum, e só roda quando o desenvolvedor o chama explicitamente pelo nome. Integrar código é decisão humana.

## A mergex não gera conteúdo novo

A mergex **costura**, não inventa. Tudo que ela escreve sobre a mudança vem de artefato que já existe:

| Insumo | Origem |
|---|---|
| tasks, testes, arquivos declarados | `tasks.md` da sprintx ou da runx |
| rota, comandos, definição de pronto | `ORQUESTRADOR.md` |
| causa raiz ou análise de impacto | `01-CAUSA-RAIZ.md` da runx |
| relato original do cliente | `00-OCORRENCIA.md` da runx |
| raio de impacto, zonas de risco, caracterização, reversão | artefatos da legadox (`docs/legado/`) |
| roteiro de teste manual, veredito do QA | `QA.md` da runx |
| convenções de branch, commit e teste | `docs/stack/CONVENCOES.md` da stackx |
| fora de escopo observado | `DIVIDA.md` |
| histórico do arquivo: regressão, reprovação em QA, faixa de atenção anterior | índice do `memox` — **fonte opcional**; ausente, o critério não se aplica |

**Insumo ausente vira aviso do que falta, nunca invenção.** Seção sem insumo é omitida da entrega — jamais preenchida com texto genérico. Se a mergex não consegue afirmar algo a partir de um arquivo, ela diz que o arquivo não existe e segue.

## O que a mergex NÃO faz

- **Não aprova o próprio trabalho.** Prepara a revisão; não a dispensa nem a substitui.
- **Não faz merge no fluxo automático.** A integração é sempre decisão humana.
- **Não cria release, não publica, não faz deploy.**
- **Não altera código para caber na entrega.** Trabalho incompleto é barrado, nunca maquiado.
- **NÃO PREVINE COLISÃO ENTRE DESENVOLVEDORES.** Não avisa que outro trabalho planeja tocar o mesmo arquivo, não reserva arquivo, não resolve conflito. A branch **isola** o trabalho; ela não impede que duas pessoas alterem o mesmo código. Quem resolve conflito é quem revisa o pull request, com contexto humano.

Como consequência direta dessa última linha, duas coisas são tratadas como prioritárias na skill:

1. **A mensagem de commit por task** — é o que permite entender a *intenção* de cada mudança durante um merge difícil, meses depois, por alguém que não participou do trabalho.
2. **A lista de arquivos alterados em destaque no pull request** — é o que permite ao revisor perceber sobreposição com outro PR aberto sem ferramenta nenhuma.

## As nove etapas

O fluxo não é uma máquina de estados sequencial como a da sprintx ou da runx: E0 e E1 acontecem *durante* a execução do trabalho, E2–E8 acontecem no fim, e E9 é manual e avulsa.

**E0 ABERTURA** — no início do trabalho (F6 da sprintx, E3 da runx). Detecta versionamento, exige árvore limpa, determina a branch base, cria a branch do trabalho e registra em `ORQUESTRADOR.md` e em `docs/entregas/<trabalho_id>/ENTREGA.md`. Branch que já existe é retomada, nunca duplicada.

**E1 COMMIT POR TASK** — durante a execução. Cada task com os dois testes escritos, suíte inteira verde e `status: concluida` vira um commit próprio, no momento em que fecha. Varredura de segredo antes de cada commit.

**E2 PORTÃO DE PRONTIDÃO** — ao fim da execução, antes de qualquer preparação de entrega. Devolve `PRONTO` ou `BLOQUEADO` com o que falta e onde corrigir. `BLOQUEADO` encerra: a mergex não segue e não maquia.

**E3 CLASSIFICAÇÃO DA ATENÇÃO HUMANA** — divide o diff em três faixas e explica cada arquivo. É o coração da skill.

**E4 DESCRIÇÃO DO PULL REQUEST** — monta a descrição a partir dos artefatos existentes, na ordem que faz o revisor entender rápido. Cabe em uma tela.

**E5 PACOTE PARA O QA** — gera `docs/entregas/<trabalho_id>/QA-PACOTE.md`. O QA não deve precisar ler código para trabalhar.

**E6 PUSH** — sobe a branch depois de E2 aprovar e do pacote de QA existir. Nunca forçado, nunca na principal.

**E7 ABERTURA DO PULL REQUEST** — abre o PR pela ferramenta de linha de comando do serviço de hospedagem, quando existir e estiver autenticada. Ausente, grava a descrição em `PR.md` e informa — nunca falha, nunca pede credencial.

**E8 REGISTRO DA ENTREGA** — grava `ENTREGA.md` com frontmatter `expx-schema v1`, `kind: entrega`. É o que o expx-panel lê para mostrar o que aguarda revisão.

**E9 REVISÃO E MERGE — MANUAL.** Lista os pull requests abertos, ordena do menor para o maior impacto, apresenta o estado de cada um e conduz um PR por vez com confirmação explícita. Nunca resolve conflito. **Só roda por chamada explícita do desenvolvedor.**

## As três faixas de atenção humana

A classificação é **derivada de evidência registrada** — raio, zonas de risco, cobertura de teste, tipo de mudança. Nunca escolhida por sensação. Na dúvida entre duas faixas, sobe para a mais rigorosa e diz por quê.

**Tamanho do diff NÃO é critério.** Um arquivo de uma linha em zona de risco é OLHO OBRIGATÓRIO.

**O passado do arquivo é critério.** Quando o `memox` está instalado, um arquivo que já causou
regressão sobe para OLHO OBRIGATÓRIO — e a subida vem sempre com o trabalho, a data e o
artefato que a sustentam. A faixa **nunca desce** por causa do memox: ausência de histórico é
ausência de informação, não atestado de segurança. Sem o memox, o critério simplesmente não se
aplica e a classificação é a mesma de sempre.

| Faixa | O que o revisor faz | Critérios — basta um |
|---|---|---|
| **OLHO OBRIGATÓRIO** | Lê linha a linha | Arquivo em zona de risco declarada no `PERFIL.md`; mudança de regra de negócio ou de cálculo; migração de banco, qualquer uma; autenticação, autorização ou dado pessoal; alteração de contrato público (rota, payload, evento, retorno); código sem cobertura de teste antes e depois; efeito irreversível declarado no plano de reversão; tudo que veio de raio ALTO; **arquivo com histórico de regressão registrado no memox, ou com reprovação anterior em QA no mesmo arquivo** |
| **LEITURA RÁPIDA** | Confere intenção, não implementação | Mudança coberta por teste de caracterização que continua passando; alteração em camada isolada com cobertura existente; código novo em arquivo novo, com os dois testes verdes |
| **DISPENSÁVEL** | A máquina já provou | Arquivo de teste que só acrescenta caso; alteração mecânica coberta por teste de regressão verde; arquivo gerado automaticamente, quando declarado como tal |

Todo arquivo do diff cai em exatamente uma faixa, e cada um leva a evidência que o classificou. Detalhe operacional, exemplos de classificação correta e incorreta: `references/03-atencao-humana.md`.

## Segurança de versionamento

Vale para toda a skill, em qualquer etapa, sem exceção:

- Nunca push forçado, em nenhuma circunstância.
- Nunca commit ou push direto na branch principal.
- Nunca trocar de branch com alteração não commitada pendente.
- Nunca reescrever histórico já enviado ao remoto.
- Nunca resolver conflito automaticamente.
- Nunca descartar alteração local de ninguém.
- Nunca configurar credencial nem armazenar segredo.
- Repositório sem versionador: seguir sem essas etapas, sem erro e sem bloqueio.

## Hooks e agentes

As 20 regras invioláveis abaixo continuam as mesmas. O que muda é **quem as
garante**: hoje elas são instrução que o modelo pode esquecer numa execução
longa; os hooks as tornam mecânicas, porque quem executa é o harness.

A mergex é a skill que mais toca o versionador — é onde os hooks de segurança
importam mais.

### Os agentes

| Agente | Quando | Ferramentas | Papel |
|---|---|---|---|
| `revisor-diff` | E3 | leitura | Classifica o diff nas três faixas, sem ter visto a implementação |
| `analista-de-conflito` | E9, **só pelo comando manual** | leitura, sem execução de comando | Explica o que cada lado do conflito pretendia |

Os dois rodam em contexto próprio. É o que torna estrutural — e não uma
promessa que o modelo faz a si mesmo — a regra de que quem produz não avalia.
O `analista-de-conflito` não tem ferramenta de escrita nem de execução: é
**impossibilidade técnica**, não disciplina, que o impede de resolver conflito.

### Os hooks

| Hook | Modo inicial | O que garante |
|---|---|---|
| `sem-segredo` | **bloqueio** | Regra 5 — varredura a cada commit, não só no portão |
| `git-perigoso` | **bloqueio** | Regra 11 — nunca forçado, nunca na principal, nunca reescrever o enviado |
| `branch-limpa` | **bloqueio** | Regra 2 — nunca criar ou trocar branch com alteração pendente |
| `commit-por-task` | aviso | Regra 3 — um commit por task, concluída e com suíte verde |
| `arquivo-fora-do-plano` | aviso | Regra 4 — nunca commitar arquivo fora da lista declarada |
| `pr-so-com-portao` | aviso | Regra 6 — sem `PRONTO` no portão, não sobe e não abre PR |

Os de segurança nascem em bloqueio: segredo commitado não tem volta. Os de
método nascem em aviso e só sobem depois de rodarem sem falso positivo — hook
que atrapalha é desinstalado, e junto com ele vão os que funcionavam.

O modo de cada um vive em `.expx/hooks.json`. Detalhe operacional, os três
cuidados de desenho e os testes: `.claude/hooks/README.md`.

### O rastro

Os hooks e as etapas gravam em `docs/eventos/<trabalho_id>.jsonl`, no formato
do contrato `expx-eventos` v1. A mergex grava `commit_criado` (E1) com a task
correspondente, `pr_aberto` (E7) com a URL, e `veredito_emitido` (E3) do
`revisor-diff`.

No comando manual (E9), grava a lista de PRs avaliados, a ordem apresentada e o
que foi mergeado — e **nunca faz merge por conta própria em nenhum caminho**.

Com isso o painel mostra, sem tocar no versionador: por trabalho, a branch, os
commits e a task de cada um; o que aguarda revisão e há quanto tempo; e a
distribuição das três faixas por PR — que diz quanto de olho humano cada
entrega está pedindo. Se todo PR sai com metade dos arquivos em olho
obrigatório, ou o trabalho está mal fatiado ou as zonas de risco estão largas
demais.

## Regras invioláveis

1. A branch nasce com o trabalho, não no fim.
2. Nunca criar ou trocar branch com alteração não commitada pendente.
3. Cada task concluída com suíte verde vira um commit próprio. Nunca amontoar tasks distintas.
4. Nunca commitar arquivo fora da lista declarada na task.
5. A verificação de segredo, credencial e dado real de cliente roda a cada commit e também no portão de prontidão.
6. O portão de prontidão barra e explica. Nunca maquia.
7. Nada na entrega é inventado: todo conteúdo vem de artefato existente. Insumo ausente vira aviso do que falta.
8. A classificação de atenção humana é derivada de evidência registrada, nunca de sensação. Na dúvida, sobe para a faixa mais rigorosa. Tamanho de diff não é critério.
9. Zona de risco, migração de banco, mudança de contrato público e efeito irreversível são sempre OLHO OBRIGATÓRIO.
10. A descrição do pull request cabe em uma tela. Seção sem insumo é omitida, não preenchida com texto genérico.
11. Nunca push forçado, nunca na branch principal, nunca reescrever histórico já enviado.
12. Ferramenta de abertura de PR ausente não é erro: grava a descrição em arquivo e informa. Nunca pede credencial.
13. O pacote de QA não exige leitura de código para ser executado.
14. Convenção do repositório vence a convenção padrão da mergex.
15. Repositório sem versionador não é erro: a skill segue sem essas etapas.
16. O comando de revisão e merge nunca executa automaticamente. Só por chamada explícita do desenvolvedor.
17. O comando de revisão nunca resolve conflito e nunca faz merge sem confirmação daquele PR específico.
18. A mergex não faz merge no fluxo automático, não aprova, não publica e não faz deploy.
19. A mergex entrega; quem fecha a ocorrência é a runx.
20. Arquivo com histórico de regressão é OLHO OBRIGATÓRIO, qualquer que seja o tamanho da mudança.

Regra transversal: use sempre caminhos relativos; nunca escreva caminhos absolutos em nenhum artefato.

## Onde ficam os artefatos da entrega

`docs/entregas/<trabalho_id>/` é sempre ancorado na raiz do repositório mais próxima do diretório de trabalho atual (o diretório que contém `.git/`). Em monorepo sem `.git` visível, suba diretórios até encontrar a raiz; se não houver `.git` em nenhum ancestral, use a raiz do diretório de trabalho. Antes de criar `docs/`, verifique se já existe um na raiz — se existir, use-o.

O `<trabalho_id>` é o mesmo da skill de origem: o `<slug-da-feature>` da sprintx (`docs/<slug>/`) ou o `<OC-ID>-<slug>` da runx (`docs/manutencao/<OC-ID>-<slug>/`).

```
docs/entregas/
  <trabalho_id>/
    ENTREGA.md        registro da entrega, com frontmatter (kind: entrega)
    QA-PACOTE.md      pacote executável pelo QA, sem ler código
    ATENCAO.md        a classificação das três faixas
    PR.md             a descrição do PR (sempre gravada, mesmo com PR aberto)
```

## Etapas → arquivos da skill

Os caminhos são relativos à raiz desta skill. O detalhe operacional de cada etapa mora **exclusivamente** no reference correspondente; leia-o quando a etapa chegar, e somente o da etapa atual.

| Etapa | Roteiro operacional | Templates usados |
|---|---|---|
| contrato do frontmatter (E0, E1, E8) | `references/00-schema.md` | — |
| estado da barra (E0, E7, E8, E9) | `references/10-estado.md` | — |
| E0 ABERTURA | `references/00-abertura.md` | `assets/TEMPLATE-ENTREGA.md` |
| E1 COMMIT POR TASK | `references/01-commits.md` | — |
| E2 PORTÃO DE PRONTIDÃO | `references/02-prontidao.md` | `assets/TEMPLATE-prontidao.md` |
| E3 ATENÇÃO HUMANA | `references/03-atencao-humana.md` | `assets/TEMPLATE-atencao.md` |
| E4 DESCRIÇÃO DO PR | `references/04-descricao-pr.md` | `assets/TEMPLATE-PR.md` |
| E5 PACOTE DE QA | `references/05-pacote-qa.md` | `assets/TEMPLATE-QA-PACOTE.md` |
| E6 PUSH | `references/06-push.md` | — |
| E7 ABERTURA DO PR | `references/07-abertura-pr.md` | `assets/TEMPLATE-PR.md` |
| E8 REGISTRO | `references/08-registro.md` | `assets/TEMPLATE-ENTREGA.md` |
| E9 REVISÃO (manual) | `references/09-revisao.md` | `assets/TEMPLATE-revisao.md` |

## Integração com as skills irmãs

| Skill | Acionamento | Reference |
|---|---|---|
| `sprintx` | E0 no início da F6; E1 ao fechar cada task; E2–E8 ao fim da F6 | `references/integracao/sprintx.md` |
| `runx` | E0 no início do E3; E1 ao fechar cada task; E2–E8 entre o E4 e o E5 da runx | `references/integracao/runx.md` |
| `legadox` | sem acionamento próprio; alimenta E2, E3, E4 e a ordenação de E9 | `references/integracao/legadox.md` |
| `stackx` | convenções de branch, commit e comando de teste | `references/integracao/stackx.md` |
| `memox` | sem acionamento próprio; alimenta o E3 e o E4, e é reindexado pelo E8 | `references/integracao/memox.md` |

**A ausência da mergex nunca quebra o fluxo das outras skills**, e a ausência de qualquer irmã nunca quebra o fluxo da mergex: insumo que não existe vira aviso do que falta.
