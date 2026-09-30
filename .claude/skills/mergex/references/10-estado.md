# Estado da barra — `expx-estado` v1

Leitura obrigatória em qualquer etapa que crie a branch (E0), abra o pull request (E7),
conclua ou abandone o trabalho (E8), ou mergeie um PR pelo comando manual (E9).

Este arquivo descreve **um arquivo derivado e descartável**. Ele não é a entrega, não é
registro do método e não governa decisão nenhuma. Se ele não existir, se estiver
desatualizado ou se alguém apagá-lo, **nada quebra** — nem a mergex, nem as irmãs, nem os
hooks. Trate a gravação com a mesma importância que você trataria um log.

O contrato completo, na forma em que o CLI o publica, está copiado em
`docs/contrato/CONTRATO-expx-estado.md` na raiz deste repositório. O que segue é o que a
mergex precisa dele.

## O que é

`.expx/estado.json` é um arquivo minúsculo que a barra de status do terminal lê a cada
mensagem do assistente. A barra não pode ler `tasks.md`, frontmatter, plano nem rastro: se
o script demorar, o harness mata a execução em vez de enfileirar, e a barra simplesmente
não aparece. Por isso a barra lê **um arquivo só, pequeno, já mastigado** — e quem o mantém
são as skills, que já estão gravando em disco de qualquer forma.

Ele é ignorado pelo versionador: é estado da máquina de quem está trabalhando, não do
projeto.

## O arquivo é compartilhado — você mantém dois campos

| Campo | Dono |
|---|---|
| `trabalho`, `ferramenta`, `titulo_curto`, `fase` | sprintx e runx |
| `task`, `tasks_concluidas`, `tasks_total` | sprintx e runx |
| `raio`, `orcamento_arquivos`, `orcamento_linhas` | legadox |
| **`branch`, `pr_estado`** | **mergex** |
| `bloqueios` | quem registrar bloqueio |

**Atualize APENAS os seus dois campos.** Leia o arquivo, altere `branch` e/ou `pr_estado`,
reescreva `atualizado_em`, grave. **Nunca monte um objeto novo e sobrescreva o arquivo**:
você apagaria o trabalho, a fase, a task e o orçamento que as irmãs mantêm, e a barra
ficaria vazia até a próxima transição delas.

## Os dois campos da mergex

| Campo | Valores |
|---|---|
| `branch` | `null` \| o nome da branch do trabalho |
| `pr_estado` | `null` \| `rascunho` \| `aberto` \| `merged` \| `fechado` |

**Grave o nome da branch completo, nunca cortado.** Ele pode ser longo
(`fix/OC-2026-0184-icms-st-base-desconto`). Quem corta para caber na tela é o script da
barra, que sabe a largura disponível; a skill não sabe e não deve adivinhar.

Os valores de `pr_estado` são os mesmos do enum do `expx-schema` (`references/00-schema.md`):
minúsculos, sem acento. `rascunho`, nunca `Rascunho`; `merged`, nunca `mergeado`.

## Quando gravar

| Momento | `branch` | `pr_estado` |
|---|---|---|
| **E0**, branch criada ou retomada | o nome da branch | `null` |
| **E7**, PR aberto e o QA **ainda não** aprovou | inalterado | `rascunho` |
| **E7**, PR aberto e o QA **já** aprovou | inalterado | `aberto` |
| **E7**, ferramenta de abertura de PR ausente | inalterado | **`null`** — permanece |
| **E9**, merge de um PR do **trabalho atual** | inalterado | `merged` |
| **E8**, trabalho concluído ou abandonado | `null` | `null` |
| Repositório **sem versionador** | `null` | `null` — e nada é gravado |

### O caso da ferramenta ausente

Quando `gh`/`glab` não existe, não está autenticada, ou o serviço não é suportado, o E7
grava a descrição em `PR.md` e informa o desenvolvedor. **Não houve pull request.**
`pr_estado` permanece `null`.

Não invente estado de PR que não existe. `rascunho` na barra significa "existe um PR em
rascunho no serviço de hospedagem"; usá-lo para "a descrição está pronta num arquivo"
faria a barra mentir exatamente para quem confia nela.

### O caso do repositório sem versionador

Sem versionador não há branch e não há pull request. Os dois campos ficam `null` — e como
`null` é o valor que eles já têm, **a mergex não grava nada**. Não crie o arquivo, não
reescreva `atualizado_em`, não toque em `.expx/`.

### O caso do merge no comando manual

O E9 percorre pull requests de **vários** trabalhos, inclusive de outras pessoas. Grave
`pr_estado: merged` **somente quando o PR mergeado for o do trabalho atual** — aquele cuja
`pr_url` casa com a do `ENTREGA.md` do trabalho que está em `trabalho` no próprio
`estado.json`.

Mergear o PR de outro trabalho não muda o estado do seu. Se o E9 rodar fora de um trabalho
em andamento (`trabalho: null`), não grave nada.

## O procedimento de gravação

Seis passos. Qualquer um que falhe encerra o procedimento em silêncio (ver "Tolerância a
falha").

**1. `.expx/` existe?**

```
test -d .expx
```

**Não existindo, pare aqui.** Não crie o diretório, não grave, não avise. A ausência de
`.expx/` significa que a barra não está instalada neste projeto; criar o diretório seria a
skill instalando infraestrutura que não é dela.

O diretório é procurado na raiz do repositório — a mesma que ancora `docs/entregas/`.

**2. Leia o que já está lá.**

```
cat .expx/estado.json
```

Arquivo ausente: o objeto de partida é vazio (`{}`). Arquivo ilegível — JSON quebrado,
truncado, sem permissão de leitura: **pare em silêncio.** Não tente consertar o arquivo de
outra skill e não o substitua por um objeto novo: você não sabe o que havia nele.

**3. Altere apenas os seus campos.**

Sobre o objeto lido, atribua `branch` e/ou `pr_estado` conforme a tabela de "Quando
gravar", e reescreva `atualizado_em` com o instante atual em ISO-8601 UTC (`date -u
+%Y-%m-%dT%H:%M:%SZ`, do sistema, nunca de memória). Se a chave `expx_estado` não existir,
acrescente-a com o valor `1`.

Toda chave que você não é dono permanece **exatamente** como estava — inclusive as que
valem `null`, que nunca são omitidas.

**4. Grave em arquivo temporário, no mesmo diretório.**

```
.expx/estado.json.tmp
```

O temporário precisa estar no **mesmo sistema de arquivos** do destino, senão o passo
seguinte deixa de ser atômico e vira cópia. `.expx/` garante isso.

**5. Renomeie por cima do destino.**

```
mv -f .expx/estado.json.tmp .expx/estado.json
```

`mv` dentro do mesmo sistema de arquivos é uma troca atômica: quem lê vê o arquivo antigo
inteiro ou o novo inteiro, nunca metade. **Isto não é preciosismo.** A barra roda a cada
mensagem do assistente e pode estar lendo no exato instante da gravação; um JSON pela
metade quebra o parse dela, e o que o usuário vê é a barra desaparecer.

**Nunca grave direto no destino** — nem com redirecionamento, nem com editor, nem em duas
etapas de truncar-e-escrever.

**6. Não verifique.** Não releia para conferir, não compare, não relate o que gravou. É um
arquivo de exibição; conferi-lo custaria mais do que ele vale.

### O procedimento inteiro, de uma vez

Com `python3` — que preserva as chaves das outras skills sem esforço:

```bash
python3 - <<'PY'
import json, os, datetime
p = ".expx/estado.json"
if os.path.isdir(".expx"):
    try:
        with open(p) as f: e = json.load(f)
    except FileNotFoundError: e = {}
    except Exception: raise SystemExit(0)      # ilegível: sai em silêncio
    e.setdefault("expx_estado", 1)
    e["branch"] = "<branch ou None>"           # só os campos da mergex
    e["pr_estado"] = None                      # idem
    e["atualizado_em"] = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    t = p + ".tmp"
    with open(t, "w") as f: json.dump(e, f, ensure_ascii=False, indent=2)
    os.replace(t, p)                           # atômico
PY
```

`os.replace` é a mesma troca atômica do `mv -f`. Sem `python3`, use `jq` com o mesmo
padrão (`jq '.branch = ...' estado.json > estado.json.tmp && mv -f estado.json.tmp
estado.json`) — jamais `jq ... > estado.json`, que trunca o arquivo antes de lê-lo.

Escreva apenas os campos que este momento manda escrever: no E7, não reescreva `branch`; no
E0, não toque em `pr_estado` a não ser para pô-lo em `null`.

## Tolerância a falha

**A barra nunca é motivo de interrupção de trabalho.** Nunca bloqueia commit, nunca bloqueia
push, nunca barra uma etapa, nunca vira aviso na saída ao usuário.

| Situação | O que fazer |
|---|---|
| `.expx/` não existe | Segue sem gravar. Sem erro, sem aviso, sem criar o diretório |
| `estado.json` não existe, mas `.expx/` existe | Cria a partir de `{}`, com os seus campos e `expx_estado: 1` |
| `estado.json` ilegível ou corrompido | Segue sem gravar. Não conserta, não substitui |
| Sem permissão de escrita, disco cheio, `mv` falhou | Registra no rastro e segue |
| `python3` e `jq` ausentes | Segue sem gravar |
| Repositório sem versionador | Não grava nada |

Falha de gravação vai para `docs/eventos/<trabalho_id>.jsonl`, com `resultado` `falha`, e o
trabalho continua:

```json
{"ts":"<ISO-8601 UTC>","expx_eventos":1,"trabalho_id":"<id>","ferramenta":"mergex","origem":"skill","evento":"artefato_gravado","fase":"<e0|e7|e8|e9>","task":null,"agente":null,"resultado":"falha","detalhe":"estado.json nao gravado: <erro literal>","arquivos":[".expx/estado.json"]}
```

`.expx/` ausente **não** é falha e não gera evento: é a configuração normal de um projeto
sem a barra instalada.

## O que NÃO fazer

- **Não leia o `estado.json` para decidir coisa alguma.** Nenhuma etapa, nenhum critério,
  nenhum portão consulta este arquivo. Ele é saída, nunca entrada. A branch atual vem de
  `git branch --show-current`; o estado do PR vem do `ENTREGA.md` e da ferramenta do
  serviço.
- **Nenhum hook pode usá-lo como fonte.** Em especial o `branch-limpa`, que continua
  consultando `git status --porcelain` diretamente. Um hook que lesse um arquivo derivado
  passaria a barrar ou liberar com base em informação que pode estar velha.
- **Não crie campo para alteração não commitada.** A barra mostra o marcador de árvore suja
  consultando o versionador diretamente, com tempo limite curto. Estado sujo muda a cada
  tecla; um arquivo nunca acompanharia, e estaria desatualizado justamente no momento em
  que a informação importa.
- **Não crie campos novos** de espécie nenhuma. O contrato é compartilhado; um campo a mais
  aqui é um campo que a barra não lê e que as outras skills preservam para sempre sem saber
  por quê.
- **Não substitua o `ENTREGA.md` por este arquivo.** O `ENTREGA.md` é o registro da entrega,
  com frontmatter, lido pelo painel e indexado pelo memox. Os dois continuam sendo gravados,
  e o `ENTREGA.md` é a fonte de verdade quando divergirem.
- **Não mencione a barra na saída ao usuário.** Gravação bem-sucedida é silenciosa.

## Verificação

- [ ] `.expx/` ausente: nada foi criado, nada foi gravado, nada foi avisado.
- [ ] A gravação passou por temporário e `mv`/`os.replace` — nunca direto no destino.
- [ ] O temporário ficou no mesmo diretório do destino.
- [ ] Todas as chaves das outras skills sobreviveram à gravação, inclusive as `null`.
- [ ] `atualizado_em` foi reescrito; `expx_estado` continua `1`.
- [ ] O nome da branch foi gravado completo, sem corte.
- [ ] `pr_estado` usa o enum em minúscula e sem acento.
- [ ] PR não aberto por ferramenta ausente: `pr_estado` continua `null`.
- [ ] Sem versionador: os dois campos `null` e nenhuma gravação.
- [ ] Nenhuma decisão da skill leu este arquivo.
- [ ] Nenhum campo de árvore suja foi criado.
- [ ] Falha de gravação virou linha no rastro, não interrupção.
