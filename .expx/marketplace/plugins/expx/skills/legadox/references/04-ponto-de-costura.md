# Camada 4 — PONTO DE COSTURA

Você está escolhendo **onde intervir** no código legado sem alterar o comportamento em volta. Etapa obrigatória do plano em raio MEDIO e ALTO.

Ponto de costura é um lugar do código onde se pode mudar o comportamento **sem editar o código naquele lugar** — ou, quando isso não existe em legado acoplado, o menor lugar onde a intervenção fica contida e o que está ao redor continua provado pela caracterização.

Em legado acoplado, metade do trabalho é achar esse lugar. A outra metade é resistir à tentação de criá-lo refatorando meio módulo.

## Pré-requisitos verificáveis

- `docs/legado/raio/<trabalho_id>.md` existe, faixa MEDIO ou ALTO.
- Os testes de caracterização (Camada 3) existem e passam. Você precisa deles: são a rede que prova que a costura não mexeu no que está em volta.
- Você tem o mapa de chamadores do Sinal 1 do raio.

## Regra dura deste reference

**Não existir ponto de costura viável é um achado, não uma licença para refatorar.** Se a única forma de fazer a mudança for reestruturar o módulo, isso sobe para o humano antes de qualquer código. Você não decide sozinho refatorar legado.

---

## Passo 1 — Listar os candidatos

Percorra o caminho entre o ponto de entrada e o comportamento a alterar, e liste todos os lugares onde seria possível intervir. Candidatos típicos, da borda para o miolo:

| Candidato | Onde procurar |
|---|---|
| Parâmetro que já entra | assinatura da função/construtor no caminho alvo |
| Retorno consumido em um só lugar | o chamador único de uma função interna |
| Configuração ou flag já lida | leitura de config no caminho, arquivo de settings |
| Ponto de extensão existente | evento, hook, observer, middleware, interceptor que a stack ofereça |
| Fronteira de camada | onde controller chama service, service chama repositório |
| Fronteira de dados | a query, a view, a procedure, o mapeamento do ORM |
| Wrapper de entrada | o adaptador que já traduz de fora para dentro |

Para cada candidato registre: caminho e linha, o que ele isola, e o que **fica de fora** da intervenção se você escolher ali.

---

## Passo 2 — Avaliar cada candidato

Quatro critérios, na ordem de importância:

1. **Contenção.** Quantos arquivos precisam ser tocados se a costura for aqui? Menos é melhor — e o teto é o orçamento da Camada 5.
2. **Cobertura pela caracterização.** O comportamento em volta desta costura está congelado por teste? Se não, ou você caracteriza mais, ou escolhe outro ponto.
3. **Alcance.** A costura aqui cobre **todos** os chamadores que o trabalho precisa afetar? Uma costura que corrige a tela mas não o job é meia correção — e é assim que nasce a divergência entre tela e relatório.
4. **Reversibilidade.** Desfazer a intervenção aqui é reverter o commit, ou tem efeito residual (dado gravado, flag, cache)? Alimenta a Camada 7.

O critério 3 merece cuidado especial em legado. A tentação é costurar no lugar mais fácil — normalmente a borda mais próxima da tela. Verifique na lista de chamadores do raio se todos os consumidores relevantes passam por ali.

---

## Passo 3 — Escolher e declarar

O plano da skill irmã declara, obrigatoriamente:

```
Ponto de costura escolhido: <caminho/relativo/arquivo.ext>:<linha> — <o que é>
Por que ali: <contenção, alcance, cobertura — em uma ou duas linhas>
O que isola: <o que fica dentro da intervenção>
O que NÃO cobre: <chamadores ou caminhos que continuam com o comportamento antigo,
                  e por que isso é aceitável — ou a task adicional que cuidará deles>
Alternativas descartadas:
  <candidato> — <motivo do descarte>
  <candidato> — <motivo do descarte>
```

A linha **"o que NÃO cobre"** é obrigatória e não pode ser "nada". Toda costura deixa algo de fora; se você não sabe o quê, não mapeou o suficiente. Se de fato cobre todos os chamadores levantados no raio, escreva exatamente isso: "cobre os N chamadores levantados no raio; nenhum caminho alternativo identificado".

As alternativas descartadas não são burocracia: são o que permite ao revisor humano discordar da escolha sem refazer a investigação inteira.

---

## Passo 4 — Verificar que a costura não vaza

Depois de intervir, e antes de dar a task por concluída:

1. A suíte de caracterização inteira roda. Quebra fora do comportamento alvo = a costura vazou.
2. O diff cabe no orçamento da Camada 5.
3. Nenhum arquivo fora da lista declarada foi tocado.

---

## Formato exato da saída

O bloco do Passo 3, dentro do plano da skill irmã (na fase/task correspondente), e replicado na seção de ponto de costura de `docs/legado/raio/<trabalho_id>.md`.

## Critério de saída

- [ ] Pelo menos dois candidatos foram avaliados; se só houver um viável, isso está escrito com o motivo.
- [ ] O escolhido cita caminho relativo e linha.
- [ ] "O que isola" e "o que NÃO cobre" estão preenchidos, nenhum vazio.
- [ ] As alternativas descartadas trazem o motivo do descarte.
- [ ] O comportamento em volta da costura está coberto pela caracterização.
- [ ] A intervenção cabe no orçamento da faixa.

## Quando o critério não é atendido

**Nenhum candidato é viável.** Este é o caso que a regra dura cobre. Pare e escale para o humano, com este conteúdo e nada além dele:

```
Não há ponto de costura viável para <trabalho_id>.
Candidatos avaliados e por que cada um falha: <lista>
O que seria necessário: <a menor mudança estrutural que criaria um ponto de costura>
Raio dessa mudança estrutural: <calculado como trabalho próprio, pela Camada 2>
Risco de fazer sem ela: <o que se quebra ao mudar sem costura>
```

E então **espere**. Não refatore. Não faça "só um ajustezinho para destravar". A mudança estrutural, se aprovada, é um trabalho próprio, com raio próprio, caracterização própria e orçamento próprio.

**Todos os candidatos estouram o orçamento.** Ou a task é quebrada em tasks menores, cada uma cabendo no orçamento, ou o caso escala (Camada 5). Não estoure o orçamento em silêncio.

**A costura cobre a tela mas não o job.** Não escolha assim mesmo torcendo para ninguém notar. Duas saídas legítimas: escolher um ponto mais fundo, que ambos atravessem; ou declarar duas tasks, uma por caminho, cada uma com sua costura e seu orçamento. A segunda é frequentemente a certa em legado, onde a tela e o job de fato divergiram anos atrás.

**A costura exigiria mexer em código de terceiro ou em biblioteca vendorizada.** Trate como não viável e escale. Alterar dependência é proibido pela Camada 6, e patch em vendor é dívida que ninguém encontra depois.
