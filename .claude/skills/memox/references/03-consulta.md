# Etapa 3 — CONSULTA

Quatro modos de consulta, todos sobre o índice em disco. **Sem chamada de modelo, sem rede, sem serviço externo** (regra 10). Uma consulta que precisa de rede não é consulta de índice: é outra coisa, e não pertence ao memox.

## Pré-requisitos

`.expx/memoria/indice.json` existe. Se não existir, o motor reconstrói na hora da primeira consulta e segue — reconstruir é barato (etapa 5). Se não houver artefato nenhum, a consulta devolve silêncio.

## Os quatro modos

| Modo | Comando | Pergunta que responde |
|---|---|---|
| por arquivo | `memox.py arquivo <caminho>` | o que se sabe sobre este caminho |
| por módulo | `memox.py modulo <nome>` | o que se sabe sobre esta área |
| por termo | `memox.py buscar <termo>` | onde este assunto já apareceu |
| por trabalho | `memox.py trabalho <id>` | o histórico completo de uma ocorrência ou feature |

Todos aceitam `--formato json` para consumo por outra skill, e `--raiz <dir>` para consultar um projeto que não é o diretório atual.

### Casamento parcial

- **Arquivo**: casa o caminho exato; não achando, casa por sufixo (`calculo.ts` → `src/frete/calculo.ts`). Mais de um candidato, o memox **lista os candidatos e não escolhe** — adivinhar o arquivo errado dá uma resposta confiante e errada.
- **Módulo** e **trabalho**: mesma regra, por substring.

## Formato da resposta

Sempre com proveniência: o trabalho, a data, o tipo, a causa em uma linha, e o caminho do artefato onde ler o detalhe.

```
memox — arquivo src/frete/calculo.ts (3 trabalhos no historico)
  sinais: JA CAUSOU REGRESSAO (1); reprovado em QA 1x; zona de risco declarada
- 2026-08-29 OC-2026-0142 (bug) — O arredondamento acima de 50kg usava floor.
  ver: docs/relatorios/2026-08-29-OC-2026-0142-arredondamento/tecnico.md
- 2026-05-10 OC-2026-0100 (bug) — A faixa de peso tinha o limite exclusivo.
  ver: docs/relatorios/2026-05-10-OC-2026-0100-faixa-peso/tecnico.md
```

A linha `ver:` não é decoração: é o que separa uma resposta verificável de uma alegação. **Nunca a remova ao repassar o resultado ao usuário.** O memox não substitui ler o artefato; ele diz qual artefato ler.

Entradas promovidas pelo controle de ruído levam a marca do motivo: `[regressao]`, `[reprovacao_qa]`.

## Controle de ruído

A parte que decide se isso é útil ou irritante. Arquivo muito tocado aparece em dezenas de trabalhos; injetar todos é pior que não injetar nada.

### As regras

1. **No máximo 3 entradas recentes** por arquivo (`max_entradas_recentes`).
2. **Mais**, sempre e independentemente da data, as entradas que envolveram **regressão** ou **reprovação em QA**. Elas furam o limite de recência porque a idade não as torna irrelevantes: um arquivo que regrediu há dois anos continua sendo um arquivo que regride.
3. **Acima de 8 entradas relevantes** (`teto_entradas`), não lista: informa a contagem e aponta o índice, deixando o humano decidir se abre.

Zona de risco e dívida são sinais **do arquivo**, não de uma entrada: aparecem na linha de sinais e não promovem entradas antigas para a lista.

### Acima do teto

```
memox — arquivo src/nucleo/core.ts: 14 trabalhos relevantes, acima do limite de 8.
  total de trabalhos que tocaram: 40
  sinais: reprovado em QA 12x
  consulte o indice: .expx/memoria/indice.json (chave por_arquivo -> src/nucleo/core.ts)
  ou rode: /memox-arquivo src/nucleo/core.ts
```

A contagem **é** a informação: "este arquivo foi reprovado em QA doze vezes" diz mais sobre o risco de mexer nele que a leitura das doze entradas. Não tente contornar o teto listando em lotes.

### Por que os limites existem

Ruído recorrente treina o time a ignorar. Um bloco de quarenta entradas é pulado inteiro — inclusive na vez em que continha exatamente o aviso que importava. O teto protege o valor das vezes em que o memox tem algo a dizer.

Os limites são configuráveis em `.expx/memoria/config.json`. Aumentar `teto_entradas` para além de ~12 na prática desliga o controle: se fizer isso, saiba que está trocando precisão por volume.

## Silêncio (regra 5)

Consulta sem resultado relevante devolve **string vazia**. Não "nenhum resultado encontrado", não "o memox não achou nada": nada.

Na consulta manual (`/memox-arquivo`), o agente traduz o silêncio em uma linha para o usuário, que fez uma pergunta e merece resposta. Na injeção automática (etapa 4), o silêncio é literal: nenhum caractere.

## Critério de saída

- [ ] Toda entrada exibida tem trabalho, data e caminho de artefato.
- [ ] Nenhuma consulta lista mais que `teto_entradas` entradas.
- [ ] Consulta sem resultado devolve saída vazia.
- [ ] Nenhuma chamada de rede ou de modelo na consulta.
- [ ] Consulta sobre 200 trabalhos abaixo de 200 ms.

## Quando falha

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| Arquivo existe no repositório mas a consulta é vazia | nenhum trabalho fechado o tocou | correto. O memox indexa trabalho fechado, não código. Diga isso e pare |
| "casa com mais de um alvo" | caminho parcial ambíguo | escolha um dos candidatos listados. Não adivinhe |
| Consulta lenta (> 200 ms) | índice muito grande ou disco lento | confira `duracao_ms` no índice; reconstrua. Se persistir, reduza `teto_entradas` |
| Resultado sem a linha `ver:` | artefato de origem não identificado na indexação | o trabalho entrou por uma fonte sem caminho próprio. Reconstrua; se persistir, o artefato provavelmente não tem frontmatter |
| Busca textual não acha o que existe | busca é textual simples, sem sinônimo nem paráfrase | tente a palavra que apareceria no título ou na causa; ou consulte por arquivo/módulo, que são cortes mais precisos |
