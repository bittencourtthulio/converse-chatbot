# Camada 9 — COMPARAÇÃO ANTES E DEPOIS COM DADO REAL

Você está provando, sobre uma amostra de dados reais, o que exatamente mudou de resultado entre o código antigo e o novo.

Obrigatória em raio **ALTO** e em **qualquer mudança de cálculo ou de regra de negócio**, seja qual for a faixa.

O teste de caracterização congela os casos que você **pensou** em cobrir. A comparação com dado real encontra os casos que ninguém pensaria: a nota de 2019 com desconto que não existe mais, o cliente com regime tributário que só ele tem, o registro com campo nulo que o sistema nunca deveria ter aceitado e aceitou.

## Pré-requisitos verificáveis

- Raio ALTO, ou mudança de cálculo/regra de negócio em qualquer faixa.
- Existe forma de executar o código antigo e o novo sobre a mesma entrada.
- Existe acesso a uma amostra de dados reais **anonimizável**.

## Regra dura deste reference

**A amostra é anonimizada e nunca é commitada** (regra 11). Nem a amostra, nem a saída, nem o relatório bruto de divergências com dado identificável. O que entra no repositório é o **sumário** da comparação; os exemplos de divergência aparecem nele já anonimizados.

E: **divergência não explicada bloqueia a entrega.**

---

## Passo 1 — Definir a amostra

A amostra precisa ser **representativa**, não grande. Mil registros escolhidos com critério valem mais que cem mil aleatórios.

Componha deliberadamente:

| Fatia | Por que |
|---|---|
| Casos comuns, alto volume | o que a maioria dos clientes vê |
| Extremos numéricos | maior, menor, zero, negativo |
| Bordas de faixa | logo abaixo e logo acima de cada limite da regra |
| Cada variante de configuração | regime, categoria, tipo de contrato, estado, alíquota |
| Registros antigos | de antes de mudanças anteriores no mesmo cálculo |
| Casos historicamente problemáticos | o que já gerou chamado nessa área |
| Nulos e vazios | campos que a validação de hoje impediria, mas o histórico contém |

As duas últimas linhas são as que mais encontram surpresa em legado.

Declare o tamanho e o critério de seleção. "Todas as notas de janeiro" é critério; "uma amostra representativa" não é.

---

## Passo 2 — Anonimizar

Antes de qualquer processamento, remova ou substitua:

- nome, razão social, nome fantasia
- documento (CPF, CNPJ, RG, inscrição)
- endereço, telefone, e-mail
- identificador de conta, contrato, cartão
- qualquer campo livre que possa conter dado pessoal (observação, descrição)

**Preserve o que o cálculo usa**: valores, datas, quantidades, alíquotas, códigos de configuração, e a distribuição desses valores. Anonimizar não pode alterar o resultado do cálculo — se alterar, a comparação não vale nada.

Substitua identificadores por chaves estáveis (`CLIENTE-001`, `NOTA-0042`) para que uma divergência possa ser rastreada de volta pela pessoa que tem acesso ao dado real, sem que a chave revele quem é.

A amostra anonimizada vive **fora do repositório**, em diretório temporário ou ambiente de trabalho local. Se o repositório tiver `.gitignore`, confirme que o caminho usado está ignorado — mas não confie só nisso: o padrão é a amostra nem chegar perto da árvore versionada.

---

## Passo 3 — Executar as duas versões

1. **Antes.** Com o código **atual, intocado**, processe a amostra e guarde a saída. Se a mudança já foi feita, use o código anterior a partir do versionador, em cópia de trabalho separada.
2. **Depois.** Com o código novo, processe **exatamente a mesma entrada**.

Cuidados que invalidam a comparação se ignorados:

- **Mesma entrada, byte a byte.** Não regere a amostra entre as duas execuções.
- **Fixe o não determinístico.** Data de referência, hora, sequenciais, aleatório. Uma execução em 31/12 e outra em 01/01 diverge por motivo que não é a mudança.
- **Mesma configuração.** Parâmetros, variáveis de ambiente, tabelas de apoio, taxas vigentes.
- **Sem efeito colateral.** A execução da comparação não pode gravar, enviar, emitir nem disparar nada. Se o código alvo tiver efeito colateral, isole-o antes — e isso frequentemente é o próprio ponto de costura da Camada 4.

Guarde a saída em formato comparável e estável: mesma ordem de registros, mesma precisão, mesmo formato de número e data.

---

## Passo 4 — Comparar

Compare **campo a campo**, não o registro inteiro como bloco. Um registro "diferente" sem dizer qual campo mudou não ajuda ninguém.

Classifique cada divergência:

| Classe | Significado |
|---|---|
| **Esperada** | a mudança pretendia exatamente isso; a task que a autoriza é citada |
| **Esperada em forma, não em magnitude** | mudou o que devia, mas mais (ou menos) do que se previa — investigue antes de aceitar |
| **Não explicada** | ninguém sabe por quê. **Bloqueia a entrega.** |
| **De ruído** | diferença que não é do código: ordenação instável, arredondamento de ponto flutuante na serialização, timestamp de execução. Só é ruído depois de provado que é |

Reduza também as divergências a **padrões**, não só a exemplos. "347 divergências" é ruído informacional; "347 divergências, todas em notas com alíquota reduzida, todas com diferença de exatamente um centavo para menos" é um diagnóstico.

---

## Passo 5 — Reportar

O relatório entra em `docs/legado/comparacao/<trabalho_id>.md`, de `assets/TEMPLATE-comparacao.md`, e contém obrigatoriamente:

```
Total de casos comparados:  <N>
Casos idênticos:            <N> (<%>)
Casos divergentes:          <N> (<%>)
  esperadas:                <N>
  não explicadas:           <N>   ← qualquer valor > 0 bloqueia a entrega
```

Mais, para cada **padrão** de divergência:

```
Padrão <N>: <descrição do padrão>
Quantos casos: <N>
Exemplo (anonimizado): entrada <chave estável> → antes <valor> / depois <valor>
Explicação: <por que esta divergência é esperada, citando a task que a autoriza>
Impacto conhecido: <quem consumia o valor antigo e o que acontece com eles>
```

A linha **impacto conhecido** é o que transforma o relatório em insumo de decisão. "1.240 notas do exercício anterior passam a exibir um centavo a menos" é a informação que faz o humano decidir se aprova, e é exatamente o tipo de coisa que só a comparação revela.

---

## Formato exato da saída

`docs/legado/comparacao/<trabalho_id>.md`, com os blocos do Passo 5. **Sem dado identificável.** A amostra e as saídas brutas permanecem fora do repositório.

## Critério de saída

- [ ] O arquivo existe e traz totais, idênticos e divergentes.
- [ ] O critério de seleção da amostra está declarado e é verificável.
- [ ] Toda divergência está classificada.
- [ ] **Zero divergências não explicadas.**
- [ ] Cada padrão de divergência traz explicação, task que autoriza e impacto conhecido.
- [ ] Os exemplos usam chaves estáveis anonimizadas, nunca dado identificável.
- [ ] A amostra não está no repositório e não foi commitada.
- [ ] Nenhum caminho absoluto.

## Quando o critério não é atendido

**Há divergência não explicada.** A entrega está bloqueada. Investigue até classificá-la, e não conclua o trabalho antes disso. Se depois de investigar continuar sem explicação, isso é o achado mais importante do trabalho inteiro: significa que existe caminho no código que ninguém mapeou. Escale para o humano com os exemplos, e trate como potencial retorno à investigação (F1 da sprintx, E1 da runx).

**Não há acesso a dado real.** Não invente amostra plausível e não a chame de real. Duas saídas honestas: pedir ao usuário uma extração anonimizada da base de homologação, declarando exatamente quais campos são necessários; ou registrar em `docs/legado/LACUNAS.md` que a Camada 9 não pôde ser executada, e **manter o bloqueio** em raio ALTO. Em ALTO, comparação não executada só é liberada por aprovação humana explícita que assume o risco, e essa aprovação fica registrada no arquivo do raio.

**Não é possível rodar o código antigo** (a mudança é destrutiva, o estado anterior não sobe). Reconstrua a versão anterior em cópia de trabalho separada a partir do versionador. Se nem isso for possível, use a saída **já registrada em produção** como "antes" — relatório arquivado, arquivo gerado no mês passado, log — e diga que a comparação foi contra saída histórica, não contra execução controlada.

**A amostra é grande demais para processar.** Reduza mantendo a composição do Passo 1: proporcional por fatia, não aleatória. Declare o novo tamanho e o método de redução. Uma amostra estratificada de 500 casos vale mais que 50 mil aleatórios que só cobrem o caso comum.

**A execução tem efeito colateral que não dá para isolar** (emite documento, chama terceiro). Não execute contra serviço real. Isole por configuração de ambiente ou dublê na borda externa, e declare no relatório o que foi isolado — porque o que foi isolado não foi comparado.
