# Camadas 5 e 6 — ORÇAMENTO DE MUDANÇA E PROIBIÇÃO DE MELHORIA COLATERAL

Duas camadas no mesmo arquivo porque atuam no mesmo momento e sobre a mesma coisa: **o tamanho do diff**.

A Camada 5 limita quanto se pode mudar. A Camada 6 proíbe mudar o que não foi pedido. Juntas, elas existem para que a revisão humana — a última defesa que sobra em legado — continue possível.

---

# Camada 5 — ORÇAMENTO DE MUDANÇA

Teto declarado **por task**: número máximo de arquivos e de linhas alteradas.

## Os tetos

Valores padrão, editáveis na seção de limiares do `PERFIL.md`:

| Faixa do raio | Arquivos | Linhas |
|---|---|---|
| BAIXO | até 5 | até 150 |
| MEDIO | até 3 | até 80 |
| ALTO | até 2 | até 40 |

**Quanto maior o risco, MENOR o orçamento.** A inversão é deliberada e é o que a torna eficaz: onde o estrago seria maior, a mudança precisa ser pequena o bastante para caber inteira na cabeça de um revisor.

## O que conta

Contam para o orçamento:

- linhas adicionadas e removidas em **código de produção**
- todo arquivo de produção tocado, mesmo que por uma linha

Não contam:

- arquivos de teste, inclusive os de caracterização
- arquivos de documentação e os artefatos em `docs/legado/`
- arquivo **criado** inteiro e novo, contado como 1 arquivo mas com as linhas fora do teto — código novo em arquivo novo não polui o diff de legado. Cuidado: isso não é brecha para mover código antigo para um arquivo novo e chamar de criação; mover código conta como alteração nos dois lados.

Como medir, antes de dar a task por concluída:

```
git diff --stat -- <arquivos de producao>
git diff --numstat | awk '{a+=$1; r+=$2} END {print a+r" linhas, "NR" arquivos"}'
```

## O orçamento na barra de status

A mesma contagem que você acabou de fazer alimenta o `.expx/estado.json`, que a barra de status do terminal lê. É o que faz o `2/3 arq · 31/40 ln` subir na tela enquanto se trabalha, em vez de o estouro aparecer só depois de escrito.

**Regravar a cada arquivo alterado dentro da task.** É essa cadência que dá o efeito ao vivo, e é o mesmo momento em que o hook `orcamento-de-mudanca` já está contando.

**Reuse a contagem do hook, não faça uma segunda.** Os critérios são os desta seção — só código de produção, sem teste, sem documentação, sem `docs/legado/`. Duas contagens paralelas divergem, e a barra passaria a mentir sobre o mesmo diff que o hook está julgando.

O caminho é de mão única, e isso é regra: a contagem do diff real alimenta o `estado.json`; **o hook nunca lê o `estado.json` como fonte.** Ele continua contando a partir do `git diff HEAD --numstat`, como sempre fez. Um hook que lesse o arquivo que ele mesmo alimenta ficaria cego para tudo que acontecesse fora da skill.

O que vai em cada campo:

| Momento | `orcamento_arquivos` | `orcamento_linhas` |
|---|---|---|
| Raio calculado, task não iniciada | `"0/3"` | `"0/80"` |
| Durante a task | `"2/3"` | `"31/40"` |
| Troca de task | volta a `"0/3"` | volta a `"0/80"` |
| Trabalho concluído | `null` | `null` |

Usados voltam a zero na troca de task; o teto permanece, porque é da faixa e a faixa é do trabalho.

**Em raio BAIXO os dois campos ficam `null`** e o orçamento não aparece na barra. É a mesma proporcionalidade que já governa a camada: nenhum hook de método roda em BAIXO, e correção de rótulo não pode ter contador de orçamento piscando na tela.

Isto é gravação derivada e somente exibição: nenhuma decisão desta camada lê aquele arquivo, apagá-lo não quebra nada, e se `.expx/` não existir você segue sem gravar, sem erro e sem aviso. O procedimento completo — escrita atômica e preservação dos campos das outras skills — está em `references/12-estado.md`.

## O orçamento é declarado, não descoberto

Cada task do plano declara seu orçamento **antes** da execução, no bloco da task:

```
orcamento: 2 arquivos, 40 linhas (raio ALTO)
```

Declarar depois do diff pronto é justificar, não orçar.

## Quando estoura

Estourou o teto: **a task é quebrada, ou escala para decisão humana.** Nunca se estoura o orçamento em silêncio (regra 6).

Na ordem:

1. **Quebrar a task.** Quase sempre a saída certa. Se a task toca 5 arquivos e o teto é 3, provavelmente há duas tasks ali dentro, cada uma com sua costura e seu critério de aceite. Reordene o plano e siga.
2. **Rever o ponto de costura.** Um orçamento estourado costuma ser sintoma de costura escolhida no lugar errado (Camada 4). Volte ao Passo 2 daquele reference antes de pedir exceção.
3. **Escalar.** Se a mudança é genuinamente indivisível — uma assinatura que muda e obriga todos os chamadores a acompanhar — escale com este conteúdo:

```
Task <id> estoura o orçamento da faixa <faixa>: <N> arquivos, <M> linhas.
Teto: <A> arquivos, <L> linhas.
Por que não é divisível: <o que quebra se dividir>
O que aumenta o diff: <ex.: 14 chamadores acompanham a mudança de assinatura>
Alternativa avaliada: <ex.: manter assinatura antiga como adaptador; por que foi ou não descartada>
```

Autorização registrada = a task segue com o orçamento excedido, e o excesso fica escrito na task. Sem autorização, a task não é executada.

É este mecanismo que impede o clássico **"a IA refatorou 40 arquivos para corrigir um rótulo"**.

---

# Camada 6 — PROIBIÇÃO DE MELHORIA COLATERAL

## O que é proibido

Em arquivo tocado, é **proibido**:

- renomear variável, função, classe ou arquivo fora do escopo da task
- reformatar código, ajustar indentação, quebrar linha longa
- rodar corretor automático de estilo, formatador ou `--fix` de linter
- reorganizar, ordenar ou limpar imports
- atualizar dependência, ou trocar chamada por API mais nova da mesma dependência
- converter sintaxe antiga para moderna
- extrair método, extrair classe, mover código entre arquivos, sem que o plano preveja
- acrescentar tipagem, anotação ou docblock não previstos
- remover código morto, comentado ou aparentemente inútil
- "aproveitar e corrigir" outro bug percebido no arquivo

**Motivo prático:** um diff de 400 linhas de formatação esconde as 3 que importam, e revisão humana é a única defesa que sobra em legado.

Isso vale em **todas as faixas**, inclusive BAIXO. A proibição não é uma etapa: não custa tempo e não pesa no fluxo.

## O que fazer com a tentação

Tudo que a IA identificar como problema vai para `docs/legado/DIVIDA.md`. **Registro, nunca correção. Tentação vira backlog.**

Cada achado registra:

```
| data | arquivo:linha | o que foi visto | por que incomoda | risco de mexer | trabalho de origem |
```

- **o que foi visto** — factual, sem adjetivo: "consulta dentro de laço `for`", não "código ruim"
- **por que incomoda** — a consequência concreta: "N+1 em lista de até 5000 itens"
- **risco de mexer** — a faixa que um trabalho para corrigir isso provavelmente teria, com o sinal que a justifica: "ALTO — zona fiscal"
- **trabalho de origem** — o `<trabalho_id>` em que o achado apareceu, para rastrear

`DIVIDA.md` é **append-only**. Nunca reescreva nem apague linhas; um item resolvido ganha nova linha marcando a resolução, citando o trabalho que a fez.

## Exceções — e são só duas

1. **Mudança exigida pela própria task.** Se a correção obriga a renomear um parâmetro porque o tipo mudou, isso não é colateral: é a mudança. Está no plano, cabe no orçamento.
2. **Formatação automática imposta por hook do repositório**, que roda sem você pedir. Nesse caso: **declare no fechamento da task** quais arquivos foram reformatados por hook e confirme que a mudança semântica está isolada. Se possível, faça a formatação em commit separado da mudança de comportamento.

Não há terceira exceção. "Estava obviamente errado" não é exceção. "É uma linha só" não é exceção.

## Verificação antes de concluir a task

Leia o próprio diff antes de dar a task por concluída, e responda:

- [ ] Toda linha do diff serve ao objetivo declarado da task?
- [ ] Alguma linha mudou só de forma (espaço, aspas, ordem, nome)? Reverta.
- [ ] Algum import foi reordenado sem necessidade? Reverta.
- [ ] Algum arquivo fora da lista da task foi tocado? Reverta.
- [ ] O que você quis corrigir e não corrigiu está em `DIVIDA.md`?

Se a resposta a qualquer uma delas for desconfortável, o diff está errado, não o checklist.

---

## Formato exato da saída

- O orçamento declarado no bloco de cada task do plano da skill irmã.
- A medição do diff registrada no fechamento de cada task.
- `docs/legado/DIVIDA.md`, de `assets/TEMPLATE-DIVIDA.md`, com uma linha por achado.
- Quando houver estouro autorizado: o bloco de escalonamento e a autorização, na própria task.

## Critério de saída

- [ ] Toda task de MEDIO ou ALTO declara orçamento antes de executar.
- [ ] O diff medido de cada task está dentro do teto, ou o excesso está autorizado e registrado.
- [ ] Nenhuma alteração colateral no diff.
- [ ] Todo achado colateral percebido está em `DIVIDA.md`.
- [ ] `DIVIDA.md` só cresceu; nenhuma linha foi reescrita ou removida.
- [ ] O orçamento consumido foi regravado em `.expx/estado.json` a cada arquivo alterado, com a mesma contagem do hook — ou a gravação foi dispensada porque `.expx/` não existe ou a faixa é BAIXO.

## Quando o critério não é atendido

**O diff estourou e ninguém está disponível para autorizar.** A task não é executada. Registre o bloqueio pelo mecanismo da skill irmã (`00-BLOQUEIOS.md` na sprintx, `BLOQUEIOS.md` na runx), pule a task e siga para a próxima paralelizável. Nunca execute contando com autorização retroativa.

**O linter do repositório quebra o build por causa do código antigo que você tocou.** Não rode `--fix` no arquivo inteiro. Corrija apenas as linhas que você introduziu, ou suprima a regra localmente com comentário citando o trabalho, e registre o resto em `DIVIDA.md`.

**Você já fez a melhoria colateral antes de lembrar da regra.** Reverta a parte colateral e registre em `DIVIDA.md`. Manter porque "já está feito e funciona" é exatamente o hábito que a camada existe para quebrar.

**O achado de dívida é grave — dado de cliente exposto, credencial no código, falha de segurança ativa.** Aí não é dívida: é ocorrência nova e urgente. Registre em `DIVIDA.md` **e** comunique imediatamente ao usuário, em uma linha, sem corrigir por conta própria dentro desta task. Uma correção de segurança tem raio próprio e merece seu próprio trabalho.
