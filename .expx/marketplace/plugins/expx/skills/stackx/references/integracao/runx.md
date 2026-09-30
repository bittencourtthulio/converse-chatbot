# Integração — runx

O que muda no runx quando `docs/stack/CONVENCOES.md` existe.

**Regra de ativação:** sem o arquivo, o runx se comporta exatamente como hoje.

```bash
test -f docs/stack/CONVENCOES.md && echo "CONVENCOES ativo"
test -f docs/legado/PERFIL.md    && echo "LEGADO — precedência ativa"
```

**Particularidade do runx:** ocorrência quase sempre toca **código existente**.
Por isso a regra de precedência com o legadox (`integracao/legadox.md`) é bem mais
frequente aqui que no sprintx — leia-a junto com este arquivo.

---

## E1 — Causa / investigação

**Passa a:** ler `docs/stack/CONVENCOES.md` antes de formular hipótese, com foco
em três seções:

- **§2 comandos** — para reproduzir o defeito com o comando certo. Reproduzir com
  o comando errado (só o arquivo, quando a convenção é a suíte) é a forma mais
  comum de "não consigo reproduzir".
- **§4 banco em teste** — para saber por que o defeito aparece ou some conforme
  o isolamento.
- **§6 padrão de erro e log** — para saber **onde** o erro deveria ter aparecido.
  Se a convenção é retorno tipado e o código faz `throw`, o erro pode estar sendo
  engolido por um handler que não o esperava: a convenção violada **é** a causa.

**Uso dos cartuchos na investigação** — aqui eles rendem mais que em qualquer
outra fase, porque o defeito já existe e o cartucho descreve exatamente a forma
dele:

| Sintoma da ocorrência | Cartucho |
| --------------------- | -------- |
| Lentidão que aparece com volume, some em homologação | `orm-carga-de-dados.md` — seção do ORM de §4 |
| Timeout ou indisponibilidade durante deploy/migração | `migracao-segura.md` — seção da engine de §4 |
| Teste que passa e falha alternadamente; "só falha no CI" | `teste-instavel.md` — seção do runner de §3, e o roteiro de investigação em 6 passos |

**Achado importante:** se a investigação concluir que a causa raiz é uma
**violação de convenção** já existente, isso vai escrito na causa — e é insumo
para `/stackx-check` no resto do repositório.

**Se a área da ocorrência não tem convenção documentada:** registre como lacuna,
não como violação. Não invente a convenção para justificar a causa.

---

## E2 — Plano

**Passa a:** montar as tasks com as convenções embutidas, como na F3 do sprintx:

| Campo da task | Vem de |
| ------------- | ------ |
| Caminho exato do teste de regressão | §3 |
| Forma do nome do caso de teste | §3 |
| Montagem de dado | §3 |
| Isolamento de banco | §4 |
| Padrão de erro do fix | §6 |
| Camada onde o fix entra | §5 |
| Comando de verificação | §2 |

**A distinção que o runx precisa fazer, e o sprintx não:**

| Tipo de arquivo na task | Quem manda |
| ----------------------- | ---------- |
| Arquivo **novo** (teste de regressão, novo módulo) | CONVENCOES.md |
| Arquivo **existente** sendo corrigido | O padrão local do arquivo — sempre |

Corrigir um defeito **e** alinhar o arquivo à convenção na mesma task é melhoria
colateral. O plano separa: o fix é a task; o alinhamento, se valer a pena, é
ocorrência própria. Em projeto legado, o alinhamento é proibido pelo legadox.

**Teste de regressão é arquivo novo ou existente?** Se o arquivo de teste já
existe, o caso novo vai nele, no formato **daquele arquivo**, mesmo que divirja
do CONVENCOES.md. Consistência local vence, e a divergência vira nota.

---

## E3 — Fix

**Passa a:** obedecer §3 (padrão de teste) e §4 (isolamento de banco) ao escrever
o teste de regressão, e usar os comandos de §2 para verificar.

- O teste de regressão precisa **falhar antes do fix e passar depois** — TDD
  estrito continua valendo, e a convenção só define a **forma** do teste, nunca
  dispensa o vermelho.
- Padrão de erro de §6 no código novo.
- Fix que toca migração: consultar `migracao-segura.md` antes de escrever, e
  informar o raio ao legadox quando aplicável.
- Comando ausente em §2 → não invente; registre.

---

## E4 — QA

**Passa a:** rodar a verificação de aderência da Etapa 4 (`/stackx-check`) sobre
o diff da ocorrência e anexar a tabela ao relatório de QA.

**Veredito:**
- `CRÍTICO` ou `ALTO` em **arquivo novo** → QA não aprova.
- Divergência em **arquivo existente** → `INFO`, nunca reprova. O QA do runx não
  cobra modernização.
- `AVISO` de PROPOSTA → não reprova.

**Além da aderência**, o QA confere o de sempre: o teste de regressão existe,
falha sem o fix, e o comando executado é o de §2.

---

## E5 — Relatar

**Passa a:** incluir no relatório técnico:

- o commit de referência do CONVENCOES.md usado;
- a tabela de aderência do E4;
- **lacunas novas descobertas na investigação** — ocorrência é a melhor fonte de
  lacuna que existe, porque o defeito prova que a convenção faltava. Isso vira
  entrada para `/stackx-atualizar`.
- se a causa raiz foi uma violação de convenção, dizer isso explicitamente: é
  sinal de que o mesmo defeito pode existir em outros pontos do repositório.

---

## Resumo do contrato

1. Sem `docs/stack/CONVENCOES.md`, nada muda.
2. E1 lê §2, §4 e §6, e consulta o cartucho conforme o sintoma; E2 embute nas
   tasks; E3 obedece; E4 audita; E5 relata e realimenta.
3. Convenção governa **arquivo novo**. Arquivo existente segue o padrão local.
4. Nunca corrija o defeito e alinhe a convenção na mesma task.
5. PROPOSTA vira decisão a levantar no E1, nunca regra.
6. Lacuna descoberta na investigação volta ao stackx.
