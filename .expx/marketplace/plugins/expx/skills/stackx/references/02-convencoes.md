# Etapa 2 — Escrever o CONVENCOES.md

Você recebe o inventário da Etapa 1 e produz `docs/stack/CONVENCOES.md`. Aqui
você **transcreve evidência**, não opina.

## Pré-requisitos verificáveis

- [ ] O inventário da Etapa 1 existe e cada fato tem EVIDÊNCIA e FORÇA.
- [ ] `docs/stack/CONVENCOES.md` **não** existe. Se existir, isto é Etapa 5.
- [ ] Os conflitos da Etapa 1 já foram levados ao usuário
      (`03-conflito-e-lacuna.md`) **antes** de escrever. Conflito não resolvido
      não vira convenção — vira bloco `CONFLITO EM ABERTO` no arquivo.

```bash
mkdir -p docs/stack
test -f docs/stack/CONVENCOES.md && echo "JÁ EXISTE — Etapa 5" || echo "ok, escrever"
```

## Passo a passo

1. Copie `assets/TEMPLATE-CONVENCOES.md` para `docs/stack/CONVENCOES.md`.
2. Preencha o frontmatter: `expx-schema: v1`, `skill: stackx`, data de geração,
   commit de referência (`git rev-parse --short HEAD`).
3. Para cada uma das seis seções, transcreva os fatos do inventário aplicando a
   tabela de decisão abaixo.
4. Remova do template toda linha de instrução entre `<!-- -->` que sobrou.
5. Escreva `docs/stack/LACUNAS.md` a partir dos fatos `AUSENTE`.
6. Rode o critério de saída.

## A tabela de decisão — como cada fato vira texto

| FORÇA no inventário | Como escrever |
| ------------------- | ------------- |
| UNÂNIME | Frase afirmativa no presente + `Evidência:` |
| MAJORITÁRIO, minoria trivial | Frase afirmativa + `Exceção: n arquivo(s) em <local>, não replicar` |
| ÚNICO CASO | Frase afirmativa + `Base: um único exemplo` |
| CONFLITO resolvido pelo usuário | Frase afirmativa + `Decidido por <usuário> em <data>. Dialeto anterior: <descrição>, não replicar` |
| CONFLITO em aberto | Bloco `> **CONFLITO EM ABERTO**` com os dialetos. **Não** escolha. |
| AUSENTE | `> **PROPOSTA** — sem evidência no repositório` ou omissão + linha em LACUNAS |

## As seis seções, e o que cada uma precisa responder

### 1. Identidade técnica
Linguagem e versão · runtime e versão · gerenciador de pacotes · framework
principal e versão. Versão exata do lock, com a faixa entre parênteses. Nada
presumido: tudo lido de manifesto.

### 2. Comandos que funcionam de verdade
Tabela com uma linha por alvo: suíte inteira, um teste só, com cobertura, lint,
formatador, type check, build, subir ambiente local. Cada linha tem uma coluna
**Origem** apontando onde o comando foi encontrado.

> **Regra 5.** Alvo sem script, sem alvo de Makefile e sem linha de CI vira
> linha `— (LACUNA)`. Nunca escreva o comando "padrão" do framework.

Para "um teste só", escreva a forma **derivada da invocação real** do projeto,
com um caminho de exemplo que existe no repositório.

### 3. Testes
Onde o arquivo mora · como se nomeia o arquivo · como se nomeia o caso ·
runner e biblioteca de asserção · estrutura típica **apontando um teste exemplar
inteiro** · factory/fixture/builder/nada · o que se mocka e o que fica real (uma
linha por eixo: HTTP saída, HTTP entrada, relógio, arquivos, fila, externo) ·
como se marca teste lento ou de integração.

O exemplar é o mais importante desta seção: as outras skills copiam a forma dele.
Escolha um recente, de tamanho médio, representativo — não o maior nem o mais
antigo.

### 4. Banco de dados em teste
Engine e versão · ORM ou camada de acesso · **estratégia de isolamento entre
testes** (transação com rollback, truncate, banco por worker, container efêmero,
em memória) com a evidência no setup · como se semeia dado · onde vivem as
migrações, como se roda e como se reverte uma.

Registre também a combinação **isolamento × paralelismo**: ela é o insumo do
cartucho de teste instável.

### 5. Estrutura e camadas
As camadas que existem **com os nomes do repositório** · a pasta de cada uma ·
quem pode chamar quem (com a força da evidência: regra de lint > contagem de
imports) · dependência proibida, só se houver evidência · onde entra código novo
de cada tipo, com um arquivo exemplar por tipo.

Direção com pouquíssimas ocorrências contra muitas na oposta é **violação
existente**, e vai escrita como tal — não como regra.

### 6. Padrões de código com consequência
Sinalização de erro · validação de entrada e em que camada · log e **o que nunca
vai para o log** · leitura de configuração e segredo · nomeação de arquivo,
classe, função e variável de ambiente (a nomeação pode diferir por camada; se
for consistente dentro de cada uma, documente por camada).

## Formato exato da saída

`docs/stack/CONVENCOES.md`, seguindo `assets/TEMPLATE-CONVENCOES.md`. Toda seção
termina com a linha de evidência:

```markdown
**Evidência:** `src/users/create-user.test.ts:14`, `src/orders/place-order.test.ts:9`
```

Marcadores, sempre nesta forma literal:

```markdown
> **PROPOSTA** — sem evidência no repositório. Não governa: as skills irmãs
> tratam este ponto como decisão a levantar, não como regra.

> **CONFLITO EM ABERTO** — o repositório faz isto de duas formas. Ver
> `docs/stack/LACUNAS.md`. Enquanto não houver decisão, siga o padrão do
> arquivo vizinho e registre a escolha na task.
```

## Critério de saída

- [ ] As seis seções existem, nenhuma vazia.
- [ ] Toda afirmação tem `Evidência:` com caminho **e** linha, ou está marcada
      PROPOSTA / CONFLITO EM ABERTO.
- [ ] Nenhum comando sem coluna Origem preenchida.
- [ ] A seção de testes aponta um teste exemplar por caminho.
- [ ] `docs/stack/LACUNAS.md` existe e cobre todo fato AUSENTE.
- [ ] Nenhum valor de `.env`, credencial, host real, nome de cliente ou dado
      pessoal aparece no arquivo.
- [ ] Nenhum caminho absoluto: tudo relativo à raiz do repositório.
- [ ] Se `docs/legado/PERFIL.md` existe, o cabeçalho traz o aviso de precedência.

Verificação mecânica:

```bash
grep -nE '^(#{2,3}) ' docs/stack/CONVENCOES.md            # as seis seções
grep -c 'Evidência:' docs/stack/CONVENCOES.md             # ≥ 6
grep -nE '/(Users|home|mnt|c:)/' docs/stack/CONVENCOES.md # deve sair vazio
grep -nE '(SECRET|PASSWORD|TOKEN|KEY)\s*=\s*\S' docs/stack/CONVENCOES.md # vazio
```

## Quando o critério não é atendido

| Situação | O que fazer |
| -------- | ----------- |
| Uma seção ficaria inteira sem evidência | Escreva a seção inteira como PROPOSTA e registre lacuna de impacto alto. Não a omita: a ausência precisa ficar visível. |
| Conflito ainda não respondido pelo usuário | Grave o bloco CONFLITO EM ABERTO e entregue assim. Não escolha para "não deixar o arquivo incompleto". |
| Evidência aponta arquivo que não existe mais | Refaça a coleta daquele ponto. Evidência quebrada é pior que ausência. |
| Tentação de escrever uma boa prática que o repo não segue | Não escreva. Se for relevante, vai para LACUNAS como recomendação, nunca para CONVENCOES.md como regra. |

Com o arquivo escrito, siga para `03-conflito-e-lacuna.md` se houver conflito em
aberto, ou entregue.
