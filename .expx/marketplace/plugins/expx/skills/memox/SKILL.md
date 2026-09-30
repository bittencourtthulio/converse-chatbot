---
name: memox
description: "Use sempre que a pergunta for sobre o passado do código: se um problema já aconteceu antes, se um erro é recorrente ou já voltou, quem mexeu num arquivo e por quê, o que já foi decidido sobre um módulo, o que já foi tentado e descartado, qual o histórico ou os antecedentes de uma área, se um arquivo é frágil ou já deu problema, se já houve regressão ali. Use também quando alguém declarar que vai mexer em arquivos ou módulos e valha a pena saber o que já se sabe sobre eles antes de planejar. Responde consultando o índice local dos artefatos do método Expx — relatórios técnicos, causas raiz, decisões, dívida, lacunas, QA e entregas — sempre com o caminho do artefato de origem e a data. Use mesmo quando o usuário não disser memox, memória, índice nem histórico por nome."
---

# memox

memox é a **memória do método Expx** (Exponencial). As demais camadas produzem conhecimento: a `sprintx` planeja features, a `runx` trata ocorrências, a `legadox` calcula raio de impacto, a `stackx` descobre o dialeto do repositório, a `mergex` versiona e entrega. Todas gravam artefatos em Markdown com frontmatter `expx-schema v1`. O memox não produz artefato novo: ele indexa o que as outras já gravaram e devolve na hora certa.

Como as demais camadas, o memox **não tem fluxo próprio**. Ele produz um índice que as outras skills consultam.

## Princípio central

**Memória que precisa ser consultada não é usada.** O memox entrega o que se sabe sobre um arquivo no momento em que alguém declara que vai tocá-lo, sem ninguém pedir.

Uma software house resolve o mesmo tipo de problema repetidamente. Bug de arredondamento numa faixa de peso hoje; bug parecido no cálculo de comissão em três meses. Quem lembra do primeiro resolve o segundo em vinte minutos. O conhecimento já existe em disco — falta ele chegar antes do plano existir.

## A decisão de arquitetura: índice, não acervo semântico

O memox é um **ÍNDICE INVERTIDO**. Não usa embedding, não usa banco vetorial, não resume transcript, não chama modelo para ingerir. A alternativa semântica foi considerada e descartada por três motivos, e eles governam todo o desenho:

1. **A pergunta real não é "o que é semanticamente parecido", é "quem já mexeu neste arquivo e por quê".** Isso é índice invertido, não busca vetorial.
2. **Resposta de índice é verificável:** aponta arquivo, trabalho e data. Recuperação semântica erra em silêncio.
3. **Índice não custa nada por sessão** e funciona desde o terceiro trabalho fechado. Acervo semântico precisa de volume para valer.

O memox também **não indexa transcript de conversa**. A fonte são os artefatos, que já foram curados e revisados por humano. Transcript é pensamento em voz alta: contém o caminho descartado com a mesma aparência do caminho adotado.

## Fontes indexadas

Cada fonte contribui campos específicos, e toda entrada guarda o caminho do artefato de origem e a data.

| Fonte | O que se extrai |
|---|---|
| `docs/relatorios/*/tecnico.md` | trabalho, data de fechamento, tipo, `modulo_afetado`, `arquivos_alterados`, causa em uma linha, risco residual |
| `docs/relatorios/INDICE.md` | a linha do tempo, para ordenação e contagem |
| `docs/manutencao/*/01-CAUSA-RAIZ.md` | `modo`, `comprovada`, `arquivos_impactados`, `decisoes` |
| `docs/<slug>/00-DECISOES.md` e `docs/manutencao/*/decisoes` | cada decisão com alternativa descartada e motivo |
| `docs/legado/DIVIDA.md` | dívida observada por arquivo, com risco estimado |
| `base/00-LACUNAS.md` de cada trabalho | o que a documentação não respondia |
| `docs/manutencao/*/QA.md` | reprovações — o sinal mais forte de área frágil |
| `docs/entregas/*/ENTREGA.md` | branch, commits e faixa de atenção por arquivo |

### Chaves do índice

| Chave | Conteúdo |
|---|---|
| por arquivo | lista de trabalhos que tocaram aquele caminho |
| por módulo | o mesmo, agregado por módulo |
| por decisão | decisões que afetam cada módulo |
| por termo | busca textual simples sobre título, causa e resumo |

## Sinais derivados

Além de listar, o índice calcula por arquivo e por módulo:

- **quantidade de trabalhos** que o tocaram;
- **data do trabalho mais recente**;
- **quantas vezes foi reprovado em QA**;
- **se já causou regressão** — existe trabalho posterior cuja causa raiz aponta para um arquivo alterado por trabalho anterior;
- **se está em zona de risco** declarada no `PERFIL.md`;
- **se tem dívida** registrada no `DIVIDA.md`;
- **faixa de atenção mais frequente** nas entregas.

### O sinal de regressão

É o mais valioso e o mais fácil de perder: é o que identifica o arquivo que **"sempre volta"**. Ele alimenta o cálculo de raio da `legadox`, que hoje não tem essa informação.

Regra dura: **regressão exige evidência causal, não coincidência de arquivo.** Dois trabalhos tocando o mesmo arquivo é um fato; dizer que um causou o outro exige que a causa raiz do segundo aponte para um arquivo alterado pelo primeiro, com o segundo posterior ao primeiro. Na dúvida, o índice registra `coincidencia_arquivo`, nunca `regressao`. O detalhe operacional está em `references/02-sinais.md`.

## Controle de ruído

A parte que decide se isso é útil ou irritante. Arquivo muito tocado aparece em dezenas de trabalhos; injetar todos é pior que não injetar nada.

- no máximo **3 entradas recentes** por arquivo;
- **mais**, sempre e independentemente da data, as entradas que envolveram **regressão**, **reprovação em QA** ou **zona de risco**;
- acima de **8 entradas relevantes**, não lista: informa a contagem e aponta o índice, deixando o humano decidir se abre.

Os limites são configuráveis em `.expx/memoria/config.json`.

## Regras invioláveis

1. O memox não guarda conhecimento próprio. Toda entrada do índice aponta para um artefato real, com caminho e data.
2. O índice é derivado e descartável. Reconstruir do zero é sempre seguro.
3. Não indexa transcript de conversa, e não chama modelo para ingerir.
4. Não inventa relação. Se dois trabalhos tocaram o mesmo arquivo, isso é um fato; dizer que um causou o outro exige que a causa raiz do segundo aponte para o primeiro.
5. Silêncio quando não há nada relevante. Nunca injeta linha vazia.
6. Respeita os limites de ruído. Acima do teto, informa a contagem em vez de listar.
7. Nunca injeta segredo, credencial ou dado pessoal: se um artefato contiver, o índice registra o caminho e omite o trecho, e reporta o artefato como contaminado.
8. O índice é ignorado pelo versionador. Os artefatos é que são commitados.
9. O memox nunca edita artefato. Ele só lê.
10. Consulta é local e instantânea: sem rede, sem modelo, sem chamada externa.

Regra transversal: use sempre caminhos relativos; nunca escreva caminho absoluto em nenhum artefato ou saída.

## Onde ficam o índice e a configuração

`.expx/memoria/` é ancorado na raiz do repositório Git mais próxima do diretório de trabalho (o diretório que contém `.git/`). Sem `.git` em nenhum ancestral, use a raiz do diretório de trabalho atual.

| Caminho | Conteúdo |
|---|---|
| `.expx/memoria/indice.json` | o índice, derivado e descartável |
| `.expx/memoria/config.json` | limites de ruído e fontes |
| `.expx/memoria/ultima-indexacao` | marca de tempo da última reconstrução |

Ambos entram no `.gitignore` (regra 8).

## Etapas → arquivos da skill

Ao executar uma etapa, leia o arquivo dela em `references/` antes de qualquer ação — e somente o da etapa atual.

| Etapa | Reference | Assets |
|---|---|---|
| 1 INDEXAÇÃO | `references/01-indexacao.md` | `assets/TEMPLATE-indice.md`, `assets/TEMPLATE-config.md` |
| 2 SINAIS DERIVADOS | `references/02-sinais.md` | `assets/TEMPLATE-indice.md` |
| 3 CONSULTA | `references/03-consulta.md` | — |
| 4 INJEÇÃO AUTOMÁTICA | `references/04-injecao.md` | — |
| 5 MANUTENÇÃO | `references/05-manutencao.md` | `assets/TEMPLATE-config.md` |

### Integração com as demais camadas

| Camada | Como consome o memox | Reference |
|---|---|---|
| `sprintx` | consulta na F1 e na F3, sobre os arquivos que o plano pretende tocar | `references/integracao/sprintx.md` |
| `runx` | consulta na E1 sobre os arquivos impactados; dispara reindexação na E5 | `references/integracao/runx.md` |
| `legadox` | consome regressão e reprovação em QA como entrada do cálculo de raio | `references/integracao/legadox.md` |
| `mergex` | consulta na classificação de atenção: histórico de regressão sobe a faixa | `references/integracao/mergex.md` |

Nenhuma integração altera comportamento quando o memox não está instalado.

## Comandos

| Comando | O que faz |
|---|---|
| `/memox` | estado do índice: quantos trabalhos, quando foi reconstruído, o que está fora do índice e por quê |
| `/memox-indexar` | reconstrói o índice do zero |
| `/memox-arquivo` | o que se sabe sobre um caminho |
| `/memox-modulo` | o que se sabe sobre uma área |
| `/memox-buscar` | busca textual em título, causa e resumo |

## Quando o projeto não tem artefato nenhum

O memox fica **inativo, sem erro**. Os hooks saem em silêncio com código 0, e `/memox` informa que não há o que indexar e aponta quais fontes ele procuraria. Um projeto que ainda não fechou trabalho não tem memória — isso é o estado correto, não uma falha.
