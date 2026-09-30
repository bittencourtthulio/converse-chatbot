# E4 — DESCRIÇÃO DO PULL REQUEST

Você está no E4. Aqui você monta a descrição da entrega **a partir dos artefatos que já existem**. Você não escreve nada de novo sobre a mudança: costura resumos e aponta links (regra 7).

A descrição tem um leitor só, e ele é apressado: o revisor que não participou do planejamento, não leu a causa raiz e não sabe o raio de impacto. Hoje ele descobre tudo isso lendo diff. A descrição existe para ele não precisar.

**Cabe em uma tela.** Cada seção é resumo com link, nunca cópia (regra 10).

## Pré-requisitos verificáveis

- O E2 devolveu `PRONTO`.
- O E3 rodou e `docs/entregas/<trabalho_id>/ATENCAO.md` existe.

## A ordem das seções — e por que ela é essa

A ordem não é estética. É o caminho mais curto entre o revisor e o entendimento:

| # | Seção | Existe para |
|---|---|---|
| 1 | O que muda e por quê | Situar em 10 segundos |
| 2 | **Arquivos alterados** | Perceber sobreposição com outro PR aberto, **antes** de qualquer coisa |
| 3 | Origem | Saber de onde veio a demanda |
| 4 | Causa raiz ou análise de impacto | Não refazer a investigação mentalmente |
| 5 | Raio de impacto | Calibrar o risco antes de julgar a solução |
| 6 | O que foi testado | Saber o que a máquina já provou |
| 7 | O que foi congelado | Entender o que não pode mudar de comportamento |
| 8 | Como reverter | Decidir com a saída conhecida |
| 9 | Roteiro de teste manual | Passar adiante para o QA |
| 10 | **Onde eu quero seu olho** | Saber onde gastar atenção — **por último de propósito** |
| 11 | Fora de escopo | Não cobrar o que não era para estar aqui |

A seção 10 é a última porque é o que o revisor lê **imediatamente antes de abrir o diff**. Ela é a ponte entre a descrição e o código.

## Passo a passo por seção

Para cada uma: se o insumo não existe, **omita a seção inteira** e registre a ausência na lista de avisos do E4. Nunca preencha com "não se aplica", "n/a" ou texto genérico (regra 10).

### 1. O que muda e por quê — 3 linhas, sem jargão de método

Fonte: `objetivo` do `ORQUESTRADOR.md`, mais o título do trabalho.

Escreva para quem não conhece a sprintx nem a runx. Nada de "F6", "E3", "task T-01.02", "raio". Diga o que o sistema passa a fazer e por quê.

Correto: "O ICMS-ST passa a excluir o desconto incondicional da base de cálculo. Hoje ele inclui, e as notas com desconto saem com imposto a maior."

Errado: "Executa as tasks da sprint-01 conforme o ORQUESTRADOR, fechando o E3 da ocorrência."

### 2. Arquivos alterados — a lista, agrupada por pasta, em destaque

Fonte: `git diff --name-status <branch-base>...HEAD`.

Agrupe por pasta, ordem alfabética, com o tipo de mudança. Esta é a seção que permite ao revisor perceber sobreposição com outro PR **sem ferramenta nenhuma** — por isso ela vem logo no topo, e por isso ela é a lista completa, não uma amostra.

```
src/fiscal/
  M calculo_icms_st.py
  M base_calculo.py
src/relatorios/
  M exportador_nfe.py
tests/fiscal/
  A test_icms_st_desconto.py
```

Se o diff tiver muitos arquivos, mantenha a lista completa e acrescente a contagem por pasta. **Não resuma com "e mais N arquivos"**: o arquivo omitido é justamente o que colide.

#### O histórico de cada arquivo — só quando o memox está instalado

Verifique se `.claude/skills/memox/assets/memox.py` existe. **Não existindo, pule em
silêncio**: a seção fica exatamente como está acima, sem nenhuma menção ao memox, sem linha
dizendo que o histórico não foi consultado.

Existindo, o E3 já consultou o índice arquivo por arquivo (`references/03-atencao-humana.md`,
Passo 2.b). Reaproveite aquela saída — **não consulte de novo**. Para cada arquivo **com
histórico relevante**, acrescente uma linha logo abaixo do caminho, com duas informações e o
link para o artefato:

```
src/fiscal/
  M calculo_icms_st.py
      3 trabalhos ja tocaram este arquivo; 1 causou regressao (OC-2026-0142, 2026-08-29)
      ver: docs/manutencao/OC-2026-0142-arredondamento/01-CAUSA-RAIZ.md
  M base_calculo.py
tests/fiscal/
  A test_icms_st_desconto.py
```

- **Quantas vezes já foi tocado**: `sinais.trabalhos` da resposta do memox.
- **Se já causou regressão**: `sinais.regressoes` não vazio. Nomeie o trabalho e a data do
  posterior (`trabalho_posterior`, `data_posterior`) — é o que dá ao revisor onde olhar.
- **O link**: `origem_causa` da regressão, ou o `artefato` da entrada mais recente quando não
  há regressão. Caminho relativo, sempre.

Arquivo sem histórico relevante fica **sem linha nenhuma**. Não escreva "sem histórico", "0
trabalhos" nem "nunca causou regressão": ruído recorrente treina o revisor a pular o bloco
inteiro, inclusive na vez em que ele continha o aviso que importava.

#### Os limites de ruído

Os limites são do memox e valem aqui inteiros — eles vivem em `.expx/memoria/config.json`, que
é do projeto, e a mergex os respeita em vez de inventar os seus:

| Limite | Padrão | O que a descrição do PR faz |
|---|---|---|
| `max_entradas_recentes` | 3 | No máximo 3 entradas recentes por arquivo |
| `sempre_incluir` | regressão, reprovação em QA, zona de risco | Entram **sempre**, independentemente da data — a idade não as torna irrelevantes |
| `teto_entradas` | 8 | **Acima do teto, informe a contagem em vez de listar** |

Acima do teto, o memox devolve `"estourou": true` e não lista as entradas. A descrição faz o
mesmo — a contagem **é** a informação, e "reprovado em QA 12x" diz mais sobre o risco de mexer
naquele arquivo do que a leitura das doze entradas diria:

```
src/nucleo/
  M core.ts
      40 trabalhos ja tocaram este arquivo; 14 relevantes, acima do limite de 8
      reprovado em QA 12x
      consulte: /memox-arquivo src/nucleo/core.ts
```

**A lista de arquivos nunca é cortada por causa disso** (regra 10 e DM-30). O que o teto
limita é o histórico anexado a cada linha, nunca a lista de caminhos: o arquivo omitido seria
justamente o que colide com outro PR, que é a razão de esta seção existir e vir no topo.

### 3. Origem

Fonte: `00-OCORRENCIA.md` da runx, ou o trabalho da sprintx.

- **runx:** o identificador da ocorrência, o tipo e **o relato do cliente em uma linha** — extraído do relato original preservado, não reescrito com interpretação sua.
- **sprintx:** a feature e o slug do trabalho.

### 4. Causa raiz ou análise de impacto

Fonte: `01-CAUSA-RAIZ.md` da runx.

Resumo de 2 a 3 linhas do que a investigação **provou**, com link relativo para o arquivo. Não copie a investigação inteira: o revisor abre o arquivo se quiser.

Trabalho da sprintx sem esse artefato: omita a seção.

### 5. Raio de impacto — só em modo legado

Fonte: artefatos da legadox (`docs/legado/`).

Três coisas: a **faixa** (BAIXO, MÉDIO, ALTO), os **sinais** que a determinaram, e as **zonas tocadas**.

Em modo legado, esta seção fica **em destaque** — é a informação que muda como o revisor lê tudo o mais. Sem `PERFIL.md`, a seção não existe: omita (não escreva "sem raio calculado" como se fosse um resultado).

### 6. O que foi testado

Fonte: `tasks.md` (campos de teste), mais o resultado da suíte.

- Os testes por task, resumidos — um item por task, não a descrição inteira.
- **O teste de regressão e o que ele reproduzia** — em trabalho de bug, é a prova de que o defeito existia. Diga o que ele fazia falhar antes.
- O resultado da suíte inteira, com o comando usado (o do `ORQUESTRADOR.md`).

### 7. O que foi congelado — só em modo legado

Fonte: testes de caracterização da legadox.

Quais testes de caracterização foram escritos e **o que eles fixaram**. Inclua explicitamente o **comportamento errado preservado de propósito**, quando houver: é a informação que mais surpreende o revisor, e a que ele mais precisa. Um teste que congela um bug conhecido é uma decisão, não um descuido — e a descrição tem que dizer isso.

### 8. Como reverter

Fonte: plano de reversão da legadox.

O plano, resumido, **incluindo os efeitos que o versionador não desfaz**: migração aplicada, dado transformado, mensagem publicada em fila, arquivo enviado, e-mail disparado. Reverter o commit não desfaz nada disso, e é isso que o revisor precisa saber antes de aprovar.

Sem plano de reversão registrado: omita.

### 9. Roteiro de teste manual

Fonte: `QA.md` da runx e `QA-PACOTE.md` (E5).

Link relativo, **número de casos** e **o que observar de colateral** — telas, relatórios e fluxos vizinhos que podem ter sido afetados sem estar no diff.

### 10. Onde eu quero seu olho

Fonte: `docs/entregas/<trabalho_id>/ATENCAO.md` (E3), integralmente.

As três faixas, na ordem: OLHO OBRIGATÓRIO, LEITURA RÁPIDA, DISPENSÁVEL. Cada arquivo com a justificativa de uma linha. **Não resuma esta seção** — ela é o produto principal do E3 e o motivo de o revisor confiar na classificação.

Se a lista de OLHO OBRIGATÓRIO estiver vazia, diga isso explicitamente: é uma informação forte, não uma omissão.

### 11. Fora de escopo

Fonte: `DIVIDA.md`.

O que foi **observado e não tocado** durante o trabalho. Existe para o revisor não cobrar no PR o que foi deliberadamente deixado de fora — e para a dívida não se perder.

Sem `DIVIDA.md`: omita.

## Passo final — gravar

Grave `docs/entregas/<trabalho_id>/PR.md` a partir de `assets/TEMPLATE-PR.md`, **sempre** — mesmo quando o E7 for conseguir abrir o PR pela ferramenta de linha de comando. O arquivo é o registro da entrega; o PR é a cópia dele no serviço de hospedagem.

Confira antes de dar por gravado:

- [ ] Nenhuma seção sem insumo foi preenchida com texto genérico — foi omitida.
- [ ] Nenhum marcador de template (`{{...}}`) sobrou.
- [ ] Nenhum caminho absoluto.
- [ ] A lista de arquivos está completa e agrupada por pasta.
- [ ] Sem o memox instalado, nenhuma linha de histórico e nenhuma menção a ele na descrição.
- [ ] Arquivo acima do teto de ruído tem a contagem, não a lista das entradas.
- [ ] Nenhum arquivo sem histórico ganhou linha dizendo que não tem histórico.
- [ ] Nada foi afirmado sobre a mudança sem artefato que sustente.
- [ ] Cabe em uma tela até o fim da seção 5 — o resto é lista e link.

## Critério de saída

`PR.md` existe, tem só as seções com insumo, e a lista de avisos registra o que faltou. Siga para o E5.

## Quando falha

| Situação | O que fazer |
|---|---|
| `ORQUESTRADOR.md` sem objetivo claro | Use o título do trabalho e registre o aviso; não invente a motivação |
| Sem `01-CAUSA-RAIZ.md` | Omita a seção 4 e registre no aviso |
| Sem modo legado | Omita as seções 5, 7 e 8 — não escreva "não se aplica" |
| Sem `DIVIDA.md` | Omita a seção 11 |
| Descrição passando de uma tela | Corte prosa, nunca a lista de arquivos nem a seção 10 |
| Insumo contraditório entre dois artefatos | Relate os dois, aponte a contradição, não escolha por conta própria |
| memox não instalado | Pule o histórico **em silêncio**; a seção 2 fica idêntica à de antes |
| Arquivo com dezenas de trabalhos no histórico | Informe a contagem e aponte o índice; **nunca corte a lista de arquivos** |
| Histórico do memox contradiz o `ATENCAO.md` | Reaproveite a saída do E3; o E3 é quem classifica, o E4 só costura |
