# E5 — PACOTE PARA O QA

Você está no E5. Aqui você produz `docs/entregas/<trabalho_id>/QA-PACOTE.md`.

O critério de qualidade deste arquivo é um só, e é duro: **o QA não deve precisar ler código para trabalhar** (regra 13). Numa software house com QA separado do desenvolvimento, quem vai executar isso não abre a IDE, não sabe o que é uma task, não sabe o que é um raio de impacto, e não deveria precisar saber.

Antes de dar o arquivo por pronto, leia-o como se você não soubesse programar. Se em algum ponto for preciso abrir código para entender o que fazer, reescreva aquele ponto.

## Pré-requisitos verificáveis

- O E2 devolveu `PRONTO`.
- Existe roteiro de teste manual (`QA.md` da runx) ou, na ausência dele, os critérios de aceite das tasks — que você vai traduzir para linguagem de produto.

## As sete seções

Use `assets/TEMPLATE-QA-PACOTE.md`. Nesta ordem.

### 1. O que mudou, em linguagem de produto

Fonte: o objetivo do trabalho e o relato original do cliente.

Duas ou três frases sobre **o que a pessoa que usa o sistema vai ver de diferente**. Nada de nome de arquivo, de função, de tabela ou de endpoint.

Correto: "As notas fiscais com desconto passam a calcular o ICMS-ST sobre o valor já com o desconto aplicado. Antes, o imposto era calculado sobre o valor cheio, e saía mais alto do que deveria."

Errado: "Ajustado o método `calcular_base_st()` para subtrair `desconto_incondicional` antes do rateio."

### 2. O roteiro de teste manual, completo

Fonte: o roteiro de teste manual da runx (`QA.md`), integralmente — **completo, não resumido e não linkado**. O QA trabalha dentro deste arquivo.

Cada caso numerado, com:

- **o que fazer**, passo a passo, em linguagem de tela: onde clicar, o que preencher, o que enviar;
- **o que deve acontecer**, de forma observável — um número na tela, uma linha no relatório, uma mensagem;
- **o que indicaria falha**.

Se o roteiro original estiver escrito em linguagem técnica, traduza. Não invente casos novos: traduzir é reescrever o mesmo caso em outras palavras, não acrescentar cobertura.

### 3. O que observar de colateral

Fonte: raio de impacto e zonas tocadas da legadox; arquivos alterados do E3.

**Telas, relatórios e fluxos vizinhos** que podem ter sido afetados sem estar no roteiro. Esta seção é o que separa um QA que testa o que mudou de um QA que pega a regressão.

Escreva em linguagem de navegação: "Confira também o relatório de faturamento mensal e a segunda via do boleto — os dois leem o mesmo valor de imposto."

Sem raio calculado, derive dos arquivos alterados o que o usuário alcança a partir deles; se não for possível derivar com segurança, diga que a lista pode estar incompleta.

### 4. Dado de teste sugerido

**Sem dado real de cliente. Nunca.** Nem em exemplo, nem em anexo, nem "só para ilustrar".

Descreva o dado pelas **características que importam para o caso**, com valores fictícios: "um pedido com dois itens, um deles com desconto de 10%, cliente de outro estado, produto com substituição tributária".

Se o caso exige um cenário difícil de montar, diga como chegar a ele pela interface.

### 5. Ambiente e como chegar ao estado inicial

- **Onde testar**: qual ambiente (homologação, sandbox), como acessar. Nunca credencial no arquivo — diga com quem obtê-la ou onde ela está guardada.
- **Como chegar ao estado inicial**: o que precisa existir antes do primeiro passo — cadastro, configuração, permissão, dado prévio.
- **O que precisa estar ligado**: integração, serviço externo, job.

### 6. Critério objetivo de aprovação e de reprovação

Fonte: `criterio_aceite` das tasks, traduzido.

Objetivo e binário. Sem adjetivo, sem "funcionando bem", sem "aparentemente correto".

```
APROVADO quando: todos os casos passam, e o valor do ICMS-ST na nota com
desconto de 10% sobre R$ 100,00 sai como R$ 16,20.

REPROVADO quando: qualquer caso falha, ou o valor sai diferente, ou alguma
tela vizinha da lista de colaterais mudou de comportamento.
```

### 7. O que NÃO faz parte desta entrega

Fonte: `DIVIDA.md` e o escopo declarado.

Existe para o QA não reprovar por algo que nunca esteve no escopo — e para não deixar passar como "já foi resolvido" algo que não foi.

## Quando o trabalho é da runx

Acrescente ao fim uma linha apontando o **relatório de uso**: é o texto que o suporte devolve ao cliente **depois** da aprovação.

O relatório de uso é produzido pelo **E5 da runx**, que só roda depois da entrega aceita — a mergex entrega, a runx fecha (regra 19). Aponte o caminho onde ele vai ficar (`docs/relatorios/<AAAA-MM-DD>-<OC-ID>-<slug>/uso.md`) e deixe claro que ele ainda não existe se ainda não existir. Não escreva o relatório de uso: não é da mergex.

## O teste de legibilidade

Antes de gravar, verifique linha a linha:

- [ ] Nenhum nome de arquivo, função, classe, tabela, coluna ou endpoint no corpo do roteiro.
- [ ] Nenhum jargão de método: task, sprint, fase, raio, caracterização, portão, faixa.
- [ ] Nenhum passo diz "verifique se o código faz X".
- [ ] Todo caso tem resultado esperado **observável na tela ou no documento**.
- [ ] Nenhum dado real de cliente.
- [ ] Nenhuma credencial.
- [ ] Nenhum caminho absoluto.
- [ ] O critério de aprovação é binário.

## Critério de saída

`docs/entregas/<trabalho_id>/QA-PACOTE.md` existe, com as sete seções, e passa no teste de legibilidade. Registre no `ENTREGA.md` que o pacote existe. Siga para o E6.

O pacote de QA é **pré-requisito do push** (E6): a branch não sobe sem ele.

## Quando falha

| Situação | O que fazer |
|---|---|
| Sem roteiro de teste manual | Derive os casos dos `criterio_aceite` das tasks, traduzidos, e registre o aviso de que o roteiro original não existia |
| Sem raio calculado | Derive os colaterais dos arquivos alterados e declare que a lista pode estar incompleta |
| Caso impossível de descrever sem código | O caso não é testável manualmente: registre isso explicitamente em vez de escrever um passo que exige IDE |
| Trabalho da sprintx | Sem relatório de uso; omita a linha final |
| Dado real apareceu no roteiro original | Substitua por fictício equivalente e registre o aviso |
