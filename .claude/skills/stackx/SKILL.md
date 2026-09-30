---
name: stackx
description: Descobre e formaliza as convenções técnicas reais de um repositório — onde os arquivos de teste moram e como se chamam, como o banco é isolado entre testes, quais comandos de teste/lint/build funcionam de verdade, quais camadas existem e quem pode chamar quem, como erro é sinalizado e como configuração é lida — e grava tudo em docs/stack/CONVENCOES.md com evidência (arquivo e linha) para cada regra. Use sempre que precisar entender ou registrar como este projeto faz as coisas, configurar um repositório para trabalho assistido, saber onde colocar um teste novo ou qual comando roda a suíte, verificar se uma mudança respeitou os padrões do projeto, ou consultar riscos de migração de esquema, N+1 no ORM e teste instável no runner. Use mesmo que o usuário não diga "convenção" nem "stackx" por nome: basta ele perguntar "como escrevo teste aqui?", "onde coloco esse arquivo?", "qual o padrão do projeto?", "esse código está no padrão?" ou pedir para preparar/configurar o repositório.
---

# stackx — o dialeto técnico do projeto

O stackx lê o repositório real e escreve `docs/stack/CONVENCOES.md`: o arquivo que
as demais skills passam a obedecer ao produzir código naquele projeto.

## Princípio central

**Convenção não se propõe, se descobre.**

O que o repositório já faz é convenção. O que ele ainda não faz é PROPOSTA, e
proposta precisa de confirmação humana antes de virar regra.

## Detector e gerador, não catálogo

O stackx **não** é um catálogo de pacotes por linguagem ou framework. Essa
abordagem foi considerada e descartada:

1. **Explosão combinatória.** Linguagem × framework × runner × ORM × banco gera
   centenas de combinações impossíveis de manter. Pacote desatualizado é pior que
   pacote inexistente.
2. **O modelo já sabe.** Explicar a sintaxe de um runner popular não acrescenta
   nada e queima contexto — o recurso mais caro do sprintx.
3. **O erro real está no dialeto, não na stack.** A IA não erra "como se escreve
   teste"; erra se o teste fica ao lado do arquivo ou em pasta própria, se usa
   factory ou fixture, se o banco reseta por transação ou por truncate, se a
   camada HTTP é mockada ou sobe container. Isso não existe em pacote genérico:
   existe no repositório do cliente.

Uma skill só, qualquer stack, e o resultado é o dialeto verdadeiro do projeto —
não um ideal de artigo de blog.

## Regra de evidência

Toda convenção escrita aponta **pelo menos um arquivo real do repositório** que a
exemplifica, com caminho e linha. Convenção sem exemplo no código não é
convenção: é PROPOSTA, e é marcada como tal.

Formato da citação, sempre relativo à raiz do repositório:

```
Evidência: src/users/create-user.test.ts:14, src/orders/place-order.test.ts:9
```

## Precedência com o legadox

| Skill   | Governa                                              |
| ------- | ---------------------------------------------------- |
| stackx  | o que **deve** ser seguido daqui pra frente          |
| legadox | o que **existe** hoje, incluindo dialetos conflitantes |

Regra inegociável:

- **Projeto novo** (sem `docs/legado/PERFIL.md`): só o stackx governa.
- **Projeto legado** (com `docs/legado/PERFIL.md`): na área tocada manda o padrão
  local descrito no PERFIL.md. O stackx governa **apenas código novo, em arquivo
  novo**.

Sem essa regra a IA "moderniza" arquivo antigo achando que está obedecendo
convenção — exatamente o colateral que o legadox proíbe.

## As cinco etapas

### Etapa 1 — Detecção
Roda no agente `cartografo` (ver abaixo). Varre o repositório e coleta evidência
real, nesta ordem: manifestos e locks →
configuração de runner/lint/formatador/type checker/build → **os testes que já
existem** (a fonte mais rica) → migrações e schema → scripts dos manifestos →
integração contínua → arquivos de ambiente de exemplo → o próprio código
(pastas, imports, camadas). Detalhe em `references/01-deteccao.md`.

### Etapa 2 — O CONVENCOES.md
Produz `docs/stack/CONVENCOES.md` respondendo, no mínimo: identidade técnica;
comandos que funcionam de verdade; testes; banco de dados em teste; estrutura e
camadas; padrões de código com consequência. Cada seção termina com a evidência.
Detalhe em `references/02-convencoes.md`.

### Etapa 3 — Conflito e lacuna
**Conflito**: o repositório faz a mesma coisa de duas formas → lista cada dialeto
com contagem, localização e data no histórico, e **pergunta**. **Lacuna**: sem
evidência sobre um ponto → `docs/stack/LACUNAS.md` com o impacto de não saber
aquilo, e no máximo uma PROPOSTA marcada no CONVENCOES.md. Detalhe em
`references/03-conflito-e-lacuna.md`.

### Etapa 4 — Verificação de aderência
Confere um diff ou pasta contra o CONVENCOES.md. Saída: tabela
`severidade | arquivo | convenção violada | correção sugerida`. Aponta, não
corrige. Roda em duas formas: sob demanda (`/stackx-check`, completa) e contínua
(hook `aderencia`, a cada escrita, deliberadamente mais estreita). Detalhe em
`references/04-aderencia.md`.

### Etapa 5 — Atualização
Redetecta e apresenta um DIFF entre o CONVENCOES.md atual e o que o repositório
mostra hoje. Nunca sobrescreve em silêncio. Detalhe em
`references/05-atualizacao.md`.

## Os três cartuchos

Critério de existência de um cartucho — os três, juntos: **não óbvio**,
**específico de versão ou engine**, e **caro de errar**. Nada entra sem isso.

| Cartucho | Arquivo | Cobre |
| -------- | ------- | ----- |
| Migração segura por engine | `references/cartuchos/migracao-segura.md` | O que trava tabela e por quanto tempo, índice sem bloqueio, coluna obrigatória em tabela grande, ordem segura de renomear em deploy sem indisponibilidade, como reverter, e o que fazer quando reverter não é possível |
| N+1 e carga de dados no ORM | `references/cartuchos/orm-carga-de-dados.md` | Consultas que explodem em produção e passam nos testes com massa pequena; como identificar e corrigir no ORM detectado |
| Teste instável por runner | `references/cartuchos/teste-instavel.md` | Estado global, paralelismo sem isolamento de banco, relógio, ordem, fuso, rede; o que desligar ou configurar no runner detectado |

Leia **apenas a seção da engine/ORM/runner em uso**, confirmada no
CONVENCOES.md. Comportamento varia por versão.

## Agentes e hooks

Esta é a skill com **menos** hooks, e isso é intencional: ela produz o arquivo que
as outras consultam. O papel dela na camada de hooks é ser a fonte de verdade.

### O agente `cartografo`

A Etapa 1 roda em agente próprio, compartilhado com o legadox (prompt diferente
por skill: aqui o alvo é extrair convenção; lá, montar perfil e zonas de risco).

| | |
| --- | --- |
| Ferramentas | leitura, busca e histórico do versionador; sem escrita fora de `docs/stack/` |
| Por que agente | a detecção lê muito — manifestos, configuração, todos os testes, migrações, estrutura. Em contexto próprio, isso não consome o contexto de quem depois vai planejar |
| Regra no prompt | toda convenção aponta arquivo e linha que a exemplifica. Sem exemplo, é `PROPOSTA`, e proposta não governa |

O uso do histórico é o que faz o agente valer: é ele que diz qual dialeto é o
mais **recente**, não só o mais numeroso. Sem isso o agente cristaliza o legado
como convenção oficial — o erro que a skill inteira existe para evitar.

Arquivos: `.claude/agents/cartografo.md`, `.opencode/agent/cartografo.md`.

### Os dois hooks

| Hook | Evento | Faz |
| ---- | ------ | --- |
| `aderencia` | `PostToolUse` em ferramentas de escrita | Etapa 4 contínua: nome do arquivo de teste contra o padrão declarado, e segredo literal |
| `sem-convencoes` | `SessionStart` | Sem `CONVENCOES.md` e com código no projeto, injeta **uma** linha sugerindo a detecção. Não bloqueia nada |

**A nota que não pode ser esquecida:** ponto marcado `PROPOSTA` no
`CONVENCOES.md` **nunca gera violação**. No máximo um aviso, e o rastro registra
separadamente. Convenção sem evidência no código não governa — se governasse, o
stackx viraria uma máquina de impor padrão inventado. Vale igual para
`CONFLITO EM ABERTO`.

**Exclusão obrigatória:** o `aderencia` não roda em arquivo antigo, nem dentro de
área tocada, quando `docs/legado/PERFIL.md` existir. Ali manda o padrão local.
Sem essa exclusão, os hooks das duas skills brigam e a IA moderniza legado
achando que obedece convenção.

Ambos nascem em modo `aviso` (`.expx/hooks.json`) e o `aderencia` provavelmente
fica nele por bastante tempo: a heurística de "local esperado do arquivo de
teste" erra com facilidade em repositório real — por isso ela não está no hook.

Arquivos: `.claude/hooks/stackx/`, registrados em `.claude/settings.json` e, no
OpenCode, em `.opencode/plugin/stackx-hooks.js` — que invoca os mesmos scripts.

### O papel do stackx nos hooks das outras skills

O `CONVENCOES.md` é consultado por hooks que não são desta skill:

| Hook | Skill | O que consulta |
| ---- | ----- | -------------- |
| `tdd-teste-antes` | sprintx | onde o teste correspondente deveria estar |
| `escopo-da-task` | sprintx | camadas, para explicar melhor a violação |
| convenção de commit e branch | mergex | formato de mensagem e nome de branch |
| comando de teste | todas | o comando real, para o hook não chutar |

Consequência de desenho: **esses hooks ficam inativos quando o `CONVENCOES.md`
não existe**, em vez de adivinhar. Hook que chuta o local do teste gera falso
positivo, e falso positivo mata a adoção de todos os hooks juntos.

## Regras invioláveis

1. Toda convenção aponta um arquivo real do repositório que a exemplifica, com caminho e linha.
2. Convenção sem evidência no código não é convenção: é PROPOSTA, e é marcada como tal.
3. PROPOSTA não governa. Nas outras skills ela vira decisão a levantar, nunca regra a obedecer.
4. Diante de dialetos conflitantes, o stackx não escolhe sozinho: apresenta os dialetos com contagem e histórico, e pergunta.
5. Comando declarado precisa ter sido encontrado em manifesto, script ou integração contínua. Comando nunca é inferido do nome do framework.
6. Em projeto legado, na área tocada manda o PERFIL.md do legadox. O stackx governa apenas código novo em arquivo novo.
7. Atualização de convenção nunca sobrescreve em silêncio: apresenta diff e espera confirmação.
8. A verificação de aderência aponta, não corrige.
9. Cartucho não repete o que o modelo já sabe. Se virou tutorial de sintaxe, foi escrito errado.
10. Nenhum segredo, credencial ou dado real de cliente entra em CONVENCOES.md, exemplo ou template.

## Mapa de etapas, references e templates

| Etapa | Reference | Template / saída |
| ----- | --------- | ---------------- |
| 1 — Detecção | `references/01-deteccao.md` | inventário em memória, insumo da Etapa 2 |
| 2 — CONVENCOES.md | `references/02-convencoes.md` | `assets/TEMPLATE-CONVENCOES.md` → `docs/stack/CONVENCOES.md` |
| 3 — Conflito e lacuna | `references/03-conflito-e-lacuna.md` | `assets/TEMPLATE-conflito.md`, `assets/TEMPLATE-LACUNAS.md` → `docs/stack/LACUNAS.md` |
| 4 — Aderência | `references/04-aderencia.md` | `assets/TEMPLATE-aderencia.md` |
| 5 — Atualização | `references/05-atualizacao.md` | diff sobre `docs/stack/CONVENCOES.md` |

| Componente | Arquivo |
| ---------- | ------- |
| Agente `cartografo` | `.claude/agents/cartografo.md` · `.opencode/agent/cartografo.md` |
| Hook `aderencia` | `.claude/hooks/stackx/aderencia.py` |
| Hook `sem-convencoes` | `.claude/hooks/stackx/sem-convencoes.py` |
| Rastro de eventos | `.claude/hooks/stackx/_rastro.py` → `docs/eventos/<trabalho_id>.jsonl` |
| Registro dos hooks | `.claude/settings.json` · `.opencode/plugin/stackx-hooks.js` |
| Modo de cada hook | `.expx/hooks.json` |

| Skill irmã | Reference de integração |
| ---------- | ----------------------- |
| sprintx | `references/integracao/sprintx.md` |
| runx | `references/integracao/runx.md` |
| legadox | `references/integracao/legadox.md` |

## Comandos

| Comando | Faz |
| ------- | --- |
| `/stackx` | Roteador: sem CONVENCOES.md conduz à detecção; com ele, mostra resumo, lacunas e PROPOSTAS |
| `/stackx-detectar` | Etapas 1 e 2 — gera o CONVENCOES.md |
| `/stackx-check` | Etapa 4 — verifica aderência de um diff ou pasta |
| `/stackx-atualizar` | Etapa 5 — redetecta e apresenta o diff |
| `/stackx-migracao` | Consulta dirigida ao cartucho de migração segura |
