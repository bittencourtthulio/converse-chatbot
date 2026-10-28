# Estado da barra — `.expx/estado.json`

Você está mantendo os três campos que o legadox possui no arquivo que a barra de status do terminal lê. Este reference não descreve camada nenhuma: ele descreve uma **gravação derivada** que acompanha as camadas 2 e 5.

O contrato completo está em `docs/contrato/CONTRATO-expx-estado.md`, na raiz do repositório da skill. O que segue é o recorte que cabe ao legadox, na forma de procedimento.

## Por que isso existe

Hoje o desenvolvedor descobre que estourou o orçamento de mudança quando o hook avisa — depois de já ter escrito. Vendo `2/3 arq · 31/40 ln` subir na barra o tempo todo, ele percebe que está chegando no limite e para de gastar antes.

É a diferença entre um limite que pune e um que orienta. Vale o mesmo para a faixa: `ALTO` em vermelho o dia inteiro é lembrete constante de que ali não se improvisa.

## Regra de ouro deste reference

**Nenhuma regra ou comportamento do legadox muda por causa deste arquivo.** Ele é derivado e descartável. Em qualquer conflito entre o que está aqui e o que está nos outros references, **a skill vence** — os outros references descrevem o método; este descreve um efeito colateral visual do método.

---

## O que o legadox possui

| Campo | Valores | Significado |
|---|---|---|
| `raio` | `null` · `baixo` · `medio` · `alto` | a faixa calculada na Camada 2 |
| `orcamento_arquivos` | `null` · string `"usados/teto"` | ex.: `"2/3"` |
| `orcamento_linhas` | `null` · string `"usadas/teto"` | ex.: `"31/40"` |

Os dois campos de orçamento são **string já formatada, não número**. A barra não faz conta: ela imprime. Toda a lógica de contagem fica aqui.

Os enums são os do `expx-schema`: **minúsculo, sem acento**. `alto`, nunca `ALTO`; `medio`, nunca `MÉDIO`. A faixa aparece em maiúscula no arquivo do raio e nos hooks — aqui ela desce para minúscula na gravação.

Todos os demais campos do `estado.json` pertencem a outras skills: `trabalho`, `ferramenta`, `titulo_curto`, `fase`, `task`, `tasks_concluidas` e `tasks_total` são da sprintx e da runx; `branch` e `pr_estado` são da mergex; `bloqueios` é de quem registrar bloqueio. **Você não escreve nenhum deles, e nunca os apaga.**

---

## As cinco regras que não se negociam

1. **Somente exibição.** Nenhuma decisão do legadox lê este arquivo. Nenhuma camada consulta `raio` daqui — a faixa vem sempre de `docs/legado/raio/<trabalho_id>.md`. Apagar o `estado.json` não pode quebrar nada.

2. **O hook de orçamento nunca usa este arquivo como fonte.** Ele continua contando a partir do diff real (`git diff HEAD --numstat`), como sempre fez. O fluxo é de mão única: a contagem alimenta o `estado.json`, jamais o contrário. Um hook que lesse o próprio arquivo que ele alimenta ficaria cego para tudo que acontecesse fora da skill.

3. **Chave nunca omitida.** O que não se aplica vai `null`, não some.

4. **Escrita atômica.** Grave em temporário e renomeie. A barra pode estar lendo no exato instante da gravação, e JSON pela metade quebra o parse.

5. **Atualize apenas os seus campos.** Leia o arquivo, altere `raio`, `orcamento_arquivos` e `orcamento_linhas`, grave o resto como estava. **Nunca sobrescreva com objeto novo** — isso apagaria o trabalho, a fase e a task que o runx acabou de escrever.

---

## Quando gravar

### Ao concluir o cálculo do raio (Camada 2)

Terminado o Passo 4 do `references/02-raio-de-impacto.md`, grave a faixa e o orçamento zerado da faixa:

| Faixa | `raio` | `orcamento_arquivos` | `orcamento_linhas` |
|---|---|---|---|
| BAIXO | `"baixo"` | `null` | `null` |
| MEDIO | `"medio"` | `"0/3"` | `"0/80"` |
| ALTO | `"alto"` | `"0/2"` | `"0/40"` |

Os tetos são os da faixa. Se o `PERFIL.md` declarar tetos próprios na seção de limiares, **os do PERFIL vencem** — é a mesma precedência que o hook de orçamento já aplica.

### A cada arquivo alterado dentro da task

Este é o ponto que dá o efeito ao vivo. Recalcule os usados e regrave.

**Reuse a contagem que o hook de orçamento já faz.** Não invente uma segunda contagem: duas contagens divergem, e a barra passaria a mentir sobre o mesmo diff que o hook está julgando. Os critérios são os do `references/05-orcamento-e-colateral.md` — só código de produção, sem testes, sem documentação, sem `docs/legado/`.

### Ao trocar de task

Os usados voltam a zero; o teto permanece. `"0/3"`, `"0/80"`. A faixa não muda: ela é do trabalho, não da task.

### Ao concluir o trabalho

Os três campos voltam a `null`. Nada de deixar `alto` piscando na barra depois que o trabalho fechou.

### Fora do modo legado

Sem `docs/legado/PERFIL.md` não existe modo legado, e **o legadox não grava nada**. Os três campos permanecem `null` — que é como já estarão, porque ninguém os escreveu. Não crie o arquivo, não crie `.expx/`, não toque em nada.

---

## Regra de ruído na barra

**Em raio BAIXO o orçamento não vai para a barra.** Grave `raio` como `"baixo"` e os dois campos de orçamento como `null`.

Correção de rótulo não pode ter contador de orçamento piscando na tela. É a mesma regra de proporcionalidade que já governa a skill inteira — em BAIXO o legadox registra o raio e sai do caminho, e agora sai do caminho **também visualmente**. Nenhum hook de método roda em BAIXO; não faz sentido a barra sugerir que roda.

O `raio` continua sendo gravado em BAIXO. Saber que se está em modo legado é informação barata e útil; um contador de teto que ninguém vai encostar é ruído.

---

## Procedimento de gravação atômica

Ler, alterar o que é seu, gravar em temporário, renomear. O `mv` dentro do mesmo diretório é atômico: quem estiver lendo pega o arquivo velho inteiro ou o novo inteiro, nunca metade.

Com `jq`, que é o caminho normal:

```sh
# Pré-condição: .expx/ já existe. Se não existir, NÃO crie — apenas siga.
[ -d .expx ] || exit 0

TMP=".expx/estado.json.tmp.$$"

# O arquivo pode ainda não existir: partimos do objeto mínimo do contrato.
[ -f .expx/estado.json ] || printf '%s' '{"expx_estado":1}' > .expx/estado.json

jq  --arg raio "alto" \
    --arg arqs "2/3" \
    --arg lins "31/40" \
    '. + {
       expx_estado: 1,
       atualizado_em: (now | todate),
       raio: (if $raio == "" then null else $raio end),
       orcamento_arquivos: (if $arqs == "" then null else $arqs end),
       orcamento_linhas:  (if $lins == "" then null else $lins end)
     }' .expx/estado.json > "$TMP" && mv "$TMP" .expx/estado.json || rm -f "$TMP"
```

O que esse `jq` faz e por que:

- `. + { … }` preserva **todas** as chaves que já estavam lá e sobrescreve só as três suas. É a materialização da regra 5.
- `expx_estado: 1` e `atualizado_em` são do contrato e valem para qualquer escritor; reafirmá-los é barato e corrige arquivo antigo sem eles.
- O temporário leva `$$` no nome para não colidir com outra gravação em curso, e mora **no mesmo diretório** do destino — `mv` entre sistemas de arquivos diferentes não é atômico.
- `&& mv … || rm -f "$TMP"` garante que um `jq` que falhou não deixa lixo nem promove arquivo pela metade.

Para gravar `null`, passe string vazia no `--arg` correspondente. Para voltar os três a `null` no fim do trabalho, passe as três vazias.

**Sem `jq` instalado, não grave.** Manipular JSON de outra skill com `sed` é como o arquivo de outro dono é corrompido. Siga sem gravar, e registre a lacuna no rastro.

---

## Tolerância a falha

A barra **nunca** pode ser motivo de interrupção de trabalho. Em ordem de preferência:

- **`.expx/` não existe** — não crie. Siga sem gravar, sem erro e sem aviso. `.expx/` é criado por quem tem trabalho ali (o lock do trabalho, os modos dos hooks); um diretório criado só para a barra seria estado órfão.
- **A gravação falhou** — por permissão, disco cheio, `jq` ausente, JSON de terceiro corrompido. Registre no rastro (`docs/eventos/<trabalho_id>.jsonl`, `resultado: "aviso"`) e siga.
- **O arquivo existe mas não é JSON válido** — não tente consertar; não é seu. Registre no rastro e siga.

Em nenhum desses casos você avisa o usuário, pede confirmação, ou interrompe a task. O trabalho vale mais que a barra.

---

## Critério de saída

- [ ] Nenhum campo de outro dono foi alterado ou removido pela gravação.
- [ ] Os três campos usam os enums minúsculos e sem acento.
- [ ] Os dois campos de orçamento são string `"usados/teto"`, ou `null`.
- [ ] Em raio BAIXO, os dois campos de orçamento estão `null`.
- [ ] Fora do modo legado, nada foi gravado.
- [ ] A gravação passou por temporário e `mv`, nunca por redirecionamento direto no destino.
- [ ] Ao fim do trabalho, os três campos voltaram a `null`.
- [ ] Nenhum caminho absoluto foi escrito no arquivo.
