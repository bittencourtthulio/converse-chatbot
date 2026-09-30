# Etapa 3 — Conflito e lacuna

Dois desfechos da detecção exigem tratamento explícito. São os que separam esta
skill de uma varredura ingênua.

---

# Parte A — CONFLITO

**Definição.** O repositório faz a mesma coisa de duas ou mais formas, e as duas
têm massa relevante.

**A regra.** O stackx **não escolhe sozinho**. Este é o único momento em que a
skill pergunta, e ela é **obrigada** a perguntar.

> Escolher o dialeto majoritário por conta própria é erro: às vezes o
> majoritário é o legado e o minoritário é o novo padrão. É justamente o caso em
> que acertar sozinho importa mais — e é o caso em que a maioria mente.

## Quando é conflito, e quando não é

| Situação | É conflito? |
| -------- | ----------- |
| 34 arquivos de um jeito, 9 de outro | **Sim** |
| 45% × 55% | **Sim** — nunca resolva por maioria apertada |
| 120 de um jeito, 2 de outro, os 2 antigos e parados | Não — convenção com `Exceção` |
| 120 de um jeito, 2 de outro, os 2 **dos últimos 30 dias** | **Sim** — recência transforma minoria trivial em conflito |
| Camadas diferentes com nomeações diferentes, cada uma consistente | Não — é estrutura; documente por camada |
| Pacotes de um monorepo com stacks distintas | Não — documente por pacote |

Regra de bolso: **minoria < 10% e sem sinal de recência** vira exceção; qualquer
outra coisa vira conflito.

## Pré-requisitos verificáveis

Antes de perguntar, tenha para **cada dialeto**:

- [ ] contagem de arquivos
- [ ] onde vivem (padrão de caminho)
- [ ] nascido em (primeiro arquivo criado com o padrão)
- [ ] último arquivo **novo** com aquele padrão
- [ ] último toque em qualquer arquivo do grupo
- [ ] um exemplo citável de cada lado

```bash
git log --diff-filter=A --format='%ad' --date=short -- '<glob>' | tail -1   # nascido
git log --diff-filter=A --format='%ad' --date=short -- '<glob>' | head -1   # último novo
git log -1 --format='%ad' --date=short -- '<glob>'                          # último toque
```

Sem `.git`: apresente sem datas e **diga explicitamente** que não há datação —
a pergunta vai sem sugestão de ordem.

## Passo a passo

1. Monte o bloco a partir de `assets/TEMPLATE-conflito.md`.
2. Apresente **todos** os conflitos de uma vez, numerados. Não pergunte um por
   mensagem.
3. Para cada um, ofereça as opções reais encontradas + "manter os dois, decidir
   por área" + "adiar". Nunca ofereça uma opção que não existe no repositório.
4. Você **pode** apontar o sinal do histórico ("o dialeto B concentra os
   arquivos dos últimos 6 meses") — isso é evidência, não escolha. **Não**
   escreva "recomendo B".
5. Registre a resposta no CONVENCOES.md com autor e data.
6. Conflito não respondido → bloco `CONFLITO EM ABERTO` no CONVENCOES.md e linha
   em LACUNAS. Nunca resolva por conta.

## Formato exato da apresentação

```markdown
### CONFLITO 1 — Local do arquivo de teste

| Dialeto | Arquivos | Onde | Nascido | Último novo | Último toque |
| ------- | -------- | ---- | ------- | ----------- | ------------ |
| A — co-localizado | 34 | `src/**/*.test.ts` | 2022-03 | 2024-01 | 2024-06 |
| B — pasta espelhada | 9 | `tests/**/*.test.ts` | 2025-02 | 2025-08 | 2025-08 |

Exemplo A: `src/users/create-user.test.ts:1`
Exemplo B: `tests/orders/place-order.test.ts:1`

Sinal do histórico: o dialeto A não recebe arquivo novo há 19 meses; todos os
arquivos criados nos últimos 6 meses seguem B.

Qual adotar para código novo?
  (1) A — co-localizado
  (2) B — pasta espelhada
  (3) manter os dois, decidir por área
  (4) adiar — fica como CONFLITO EM ABERTO
```

## Critério de saída (conflito)

- [ ] Todo conflito foi apresentado com as três datas e a contagem.
- [ ] Nenhum conflito foi resolvido sem resposta do usuário.
- [ ] Cada decisão foi gravada com autor e data.
- [ ] Conflitos não respondidos estão como CONFLITO EM ABERTO no CONVENCOES.md
      **e** em LACUNAS.

---

# Parte B — LACUNA

**Definição.** O repositório não tem evidência sobre um ponto que o CONVENCOES.md
precisa responder.

**A regra.** Lacuna vai para `docs/stack/LACUNAS.md` **com o impacto de não saber
aquilo**. O impacto é o que importa: uma lista de lacunas sem impacto não ajuda
ninguém a priorizar.

## PROPOSTA — o que é e o que não pode virar

Para uma lacuna, o stackx **pode** registrar uma PROPOSTA no CONVENCOES.md,
sempre marcada como tal e **nunca** apresentada como convenção existente.

```markdown
> **PROPOSTA** — sem evidência no repositório. Não governa: as skills irmãs
> tratam este ponto como decisão a levantar, não como regra.
```

Consequências, em todo o ecossistema:

| | |
| --- | --- |
| PROPOSTA governa? | **Não** |
| Gera violação em `/stackx-check`? | **Não** — no máximo `AVISO` |
| No sprintx | Vira decisão a levantar na F2 (descoberta) |
| No runx | Vira decisão a levantar na E1 (investigação) |
| Vira convenção quando? | Só depois de confirmação humana **ou** de código real que a exemplifique |

Uma PROPOSTA só é útil se for **acionável e mínima**: proponha a coisa mais
conservadora que resolve, não a arquitetura ideal. Se a proposta exigir
refatoração de código existente, ela não é proposta do stackx — é assunto do
sprintx ou do legadox.

## Classificação de impacto

| Impacto | Quando | Exemplos |
| ------- | ------ | -------- |
| **ALTO** | Sem isso, a skill irmã produz código que quebra ou fica inseguro | Sem estratégia de isolamento de banco; sem comando de teste; sem redaction de log; sem padrão de erro |
| **MÉDIO** | Produz código inconsistente, mas funcional | Sem convenção de nome de caso de teste; sem factory; sem comando de build |
| **BAIXO** | Cosmético ou raramente acionado | Ordem de imports; formato de comentário |

## Caso especial: repositório sem nenhum teste

Este caso tem tratamento próprio, e é o mais comum em projeto novo.

1. A seção "Testes" do CONVENCOES.md sai **inteira** marcada PROPOSTA. Não sai
   omitida — a ausência precisa ficar visível.
2. A seção "Banco de dados em teste" também, se houver banco.
3. Uma única linha em LACUNAS de impacto **ALTO** cobrindo o conjunto.
4. **Nada** ali é apresentado como convenção existente. Sem "Evidência:" —
   não há.
5. `/stackx-check` não gera nenhuma violação de teste nesse repositório, só
   avisos.

## Passo a passo (lacuna)

1. Liste todo fato `AUSENTE` do inventário.
2. Para cada um, escreva o impacto concreto: *o que acontece quando uma skill
   irmã precisa disso e não encontra*. Não escreva "não sabemos X" — escreva a
   consequência.
3. Classifique ALTO / MÉDIO / BAIXO.
4. Decida se cabe PROPOSTA. Cabe quando existe uma opção conservadora óbvia e
   barata. Não cabe quando a decisão é arquitetural.
5. Escreva `docs/stack/LACUNAS.md` a partir de `assets/TEMPLATE-LACUNAS.md`.

## Formato exato da saída

```markdown
### L-03 — Isolamento de banco entre testes · impacto ALTO

**O que falta:** os testes tocam o banco, mas não há transação, truncate,
banco por worker nem container no setup do runner.

**Impacto:** qualquer task que crie teste com banco vai produzir suíte que
passa isolada e falha em conjunto ou em paralelo. O sprintx não tem como
escrever o teste da task sem inventar a estratégia.

**Onde se procurou:** `vitest.config.ts:1-40`, `tests/setup.ts`, `package.json:8-16`

**Proposta registrada?** Não — decisão arquitetural, precisa do usuário.
```

## Critério de saída (lacuna)

- [ ] Todo fato AUSENTE virou linha em LACUNAS.
- [ ] Toda lacuna tem impacto **escrito como consequência**, não como ausência.
- [ ] Toda lacuna tem classificação ALTO/MÉDIO/BAIXO.
- [ ] Toda PROPOSTA no CONVENCOES.md tem a lacuna correspondente em LACUNAS.
- [ ] Nenhuma PROPOSTA está escrita sem o marcador literal.
- [ ] Se não há testes, a seção inteira saiu como PROPOSTA e há lacuna ALTA.

## Quando o critério não é atendido

| Situação | O que fazer |
| -------- | ----------- |
| O usuário não responde os conflitos | Entregue com CONFLITO EM ABERTO. É um estado válido do arquivo. |
| Muitas lacunas ALTAS (> 5) | Diga isso na entrega: o repositório não tem convenção estabelecida ainda, e o valor do CONVENCOES.md hoje é baixo. Sugira rodar `/stackx-atualizar` depois das primeiras tasks. |
| Tentação de "resolver" a lacuna consultando conhecimento geral | Não. Conhecimento geral vira PROPOSTA marcada, nunca convenção. |
| Conflito onde um lado é claramente código morto (não roda no runner) | Ainda apresente, mas informe que o lado B não é casado pela config do runner — isso é evidência forte e útil. |
