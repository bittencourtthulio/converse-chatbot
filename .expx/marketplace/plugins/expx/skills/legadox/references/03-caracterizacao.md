# Camada 3 — TESTES DE CARACTERIZAÇÃO

Você está escrevendo testes que **congelam o comportamento atual** de uma área sem cobertura, antes de alterá-la. Técnica clássica de trabalho em legado.

Um teste de caracterização não pergunta se o comportamento está certo. Ele registra **o que é**. Se o sistema arredonda para baixo onde deveria arredondar para cima, o teste de caracterização afirma que arredonda para baixo — porque existe cliente que já contou com isso.

Acionada em raio **MEDIO** e **ALTO**. Em BAIXO não se aplica.

## Pré-requisitos verificáveis

- `docs/legado/raio/<trabalho_id>.md` existe e a faixa é MEDIO ou ALTO.
- Você sabe rodar um teste isolado, pelo comando registrado no PERFIL.
- O código está **intocado**: nenhuma alteração de implementação foi feita ainda.

Se alguma alteração já foi feita, você não pode caracterizar: o comportamento que você congelaria seria o novo, não o de hoje. Reverta a alteração, caracterize, e só então altere.

## Regra dura deste reference

**O teste de caracterização precisa passar no código atual, sem modificação nenhuma no código de produção.** Teste de caracterização que falha de saída significa que o comportamento não foi compreendido — não que o sistema está errado. Corrija o teste, não o sistema.

---

## Passo 1 — Escolher o que caracterizar

Não caracterize o arquivo inteiro. Caracterize **o comportamento que o trabalho vai alterar**, mais a vizinhança que compartilha o mesmo caminho de código.

O conjunto mínimo:

1. o caminho feliz do comportamento alvo, com entrada representativa
2. as bordas que o código visivelmente trata: zero, vazio, nulo, negativo, limite de faixa
3. os desvios que o código toma: cada `if` relevante no caminho alvo, com uma entrada que o exercite
4. o formato exato da saída: casas decimais, arredondamento, tipo, ordem, nulo vs vazio, fuso da data
5. o efeito colateral observável: o que grava, o que dispara, o que registra

O item 4 é o mais esquecido e o que mais quebra cliente em legado. Duas casas decimais viraram quatro, `null` virou string vazia, a ordem da lista mudou — nada disso aparece em teste de lógica e tudo isso quebra integração de terceiro.

---

## Passo 2 — Descobrir o comportamento real

Não deduza do código o que ele faz. **Execute e observe.**

1. Escreva o teste com a asserção **deliberadamente errada** ou ausente.
2. Rode e leia o valor real produzido.
3. Escreva a asserção com o valor real observado.
4. Rode de novo e confirme verde.

Isso parece rodeio e não é: é a única forma de não congelar sua suposição em vez do comportamento. Em legado a diferença entre os dois é justamente onde moram os bugs que os clientes já absorveram.

Quando o valor observado for surpreendente, **registre a surpresa em um comentário no próprio teste**: "hoje retorna 10.00 e não 10.005 — trunca, não arredonda". Esse comentário é o que faz a revisão humana funcionar depois.

---

## Passo 3 — Isolar as dependências que impedem o teste

Legado costuma não ser testável sem intervenção. Ordem de preferência, da menos invasiva para a mais:

1. **Não isolar.** Se o teste roda contra banco de teste ou serviço local, prefira isso: quanto menos dublê, mais fiel a caracterização.
2. **Injetar pela borda existente.** Se a dependência já entra por parâmetro ou construtor, passe um dublê ali. Nenhuma alteração no código de produção.
3. **Fixar o não determinístico.** Data, hora, aleatório, sequencial, identificador gerado. Use o mecanismo que o projeto já tiver.
4. **Ponto de costura mínimo.** Se e somente se não houver outra forma, introduza o menor ponto de costura possível (Camada 4) — e isso vira uma task com seu próprio orçamento, testada por si.

Nunca altere a lógica do comportamento alvo para torná-lo testável. Se a única forma de testar for mudar o que se quer congelar, você está diante de um achado da Camada 4: não há ponto de costura viável, e o caso sobe para o humano.

---

## Passo 4 — Marcar como caracterização

Os testes de caracterização ficam **em suíte ou tag própria**, separados dos testes de especificação. Sem isso, alguém vai olhar um teste que afirma um comportamento errado e "corrigir" a asserção.

Use o mecanismo que a stack oferecer, registrado no PERFIL:

```
pasta própria       tests/caracterizacao/...
sufixo no arquivo   ...caracterizacao.test.*
tag ou grupo        conforme o runner do projeto
```

Todo arquivo de caracterização começa com um cabeçalho em comentário:

```
Testes de CARACTERIZAÇÃO — trabalho <trabalho_id>.
Congelam o comportamento vigente em <data>, inclusive o que estiver errado.
NÃO corrija uma asserção por parecer errada: a asserção é o retrato do sistema.
Quebra aqui = mudança de comportamento, intencional ou regressão.
```

---

## Passo 5 — A task de caracterização vem primeiro

No plano da skill irmã (F3 da sprintx, E2 da runx), a caracterização é a **primeira task da primeira fase**, antes de qualquer task de alteração. Ela declara, como toda task, teste de integração e teste funcional, e tem critério de aceite binário:

```
critério de aceite: os N testes de caracterização passam contra o código
                    atual, sem nenhuma alteração em código de produção
```

---

## Passo 6 — Depois da mudança, o diff é o relatório

Terminada a alteração, rode a suíte de caracterização de novo. **O diff é o relatório do que realmente mudou de comportamento.**

Para cada teste que passou a falhar, exatamente uma das duas conclusões, escrita no artefato de fechamento do trabalho:

- **Mudança intencional.** A task previa alterar esse comportamento. Registre o antes e o depois, e atualize a asserção **citando a task que autorizou**.
- **Regressão.** A task não previa. Corrija o código, não o teste.

Não existe terceira opção. "O teste estava exagerado" é regressão com outro nome.

Quando um teste de caracterização congelou um comportamento **errado que o trabalho pretende corrigir**, isso é declarado explicitamente na task, com o antes e o depois:

```
Comportamento congelado: trunca na segunda casa (10.005 → 10.00)
Comportamento após esta task: arredonda meio para cima (10.005 → 10.01)
Autoriza a quebra do teste: <id da task>
Impacto conhecido: <quem consumia o valor antigo>
```

Essa declaração é o que transforma "o teste quebrou" em "mudamos isso de propósito, e sabíamos quem seria afetado".

---

## Formato exato da saída

Os arquivos de teste, na suíte de caracterização do projeto, com o cabeçalho do Passo 4.

Mais o registro em `docs/legado/raio/<trabalho_id>.md`, na seção de caracterização, preenchido de `assets/TEMPLATE-caracterizacao.md`: o que foi congelado, quantos casos, onde os arquivos vivem, e a lista dos comportamentos surpreendentes observados.

## Critério de saída

- [ ] Todos os testes de caracterização **passam contra o código atual**, sem nenhuma alteração em código de produção.
- [ ] Estão na suíte ou tag própria, separados dos testes de especificação.
- [ ] Cada arquivo tem o cabeçalho de caracterização.
- [ ] O formato exato da saída está coberto (casas decimais, tipo, nulo, ordem, fuso), não só a lógica.
- [ ] Os efeitos colaterais observáveis estão cobertos.
- [ ] Comportamentos surpreendentes estão comentados no teste e registrados no arquivo do raio.
- [ ] A task de caracterização é a primeira do plano.

## Quando o critério não é atendido

**O teste falha de saída.** Você não entendeu o comportamento. Volte ao Passo 2: rode, observe o valor real, escreva o observado. Nunca "conserte" o código para o teste passar — isso é alterar antes de congelar, exatamente o que a regra 4 proíbe.

**O comportamento não é determinístico** (depende de hora, de ordem de registro, de concorrência). Fixe o que der (Passo 3.3). O que não der, caracterize pela **propriedade** em vez do valor: "retorna sempre duas casas decimais", "a soma dos itens é igual ao total", "a lista vem ordenada por data decrescente". Registre que foi caracterizado por propriedade e por quê.

**Não é possível testar sem alterar o código alvo.** Isso é um achado da Camada 4, não um obstáculo a contornar. Suba para o humano com o achado: o que impede, o menor ponto de costura possível, e o risco de introduzi-lo. Não refatore por conta própria.

**O comportamento atual depende de dado de produção que você não tem.** Caracterize com o dado sintético mais próximo e **registre a limitação**. Em raio ALTO, essa limitação é o que torna a Camada 9 indispensável: o que a caracterização não alcançou, a comparação com dado real precisa alcançar.
