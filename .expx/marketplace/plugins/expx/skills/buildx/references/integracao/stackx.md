# Integração — stackx

O stackx descobre e formaliza as convenções técnicas reais de um repositório, com evidência (arquivo e linha) para cada regra. O buildx o usa no B2 — e ali ele funciona ao contrário.

## A inversão

O stackx normal **descobre**: varre o repositório, encontra como o projeto de fato faz as coisas, e grava cada regra com o arquivo e a linha que a provam. É uma ferramenta de arqueologia, e o rigor dela está em nunca afirmar o que não viu.

Num projeto que acabou de nascer não há nada a descobrir. O código que provaria a convenção é o código que ainda não foi escrito. Rodar o stackx normal aqui devolveria um documento vazio — corretamente vazio, e inútil.

Então o buildx **decide** e o stackx **registra**:

| | stackx normal | B2 do buildx |
|---|---|---|
| natureza | descritiva: o que o código faz | prescritiva: o que o código deve fazer |
| origem da regra | `src/arquivo.ts:42` | `decidido_pelo_buildx` |
| autoridade | o código | a decisão do B2, ancorada nos padrões da casa |
| quando revisar | a cada `stackx-atualizar` | **na primeira feature entregue** |

## Por que a marcação de origem importa tanto

O valor inteiro do stackx está em uma regra só: **nada entra sem evidência**. É isso que separa "as convenções deste projeto" de "o que alguém acha que deveria ser".

O B2 precisa quebrar essa regra — não há evidência a citar — e por isso a marcação `decidido_pelo_buildx` é obrigatória em cada regra, não uma nota geral no topo do arquivo. Quem ler o `CONVENCOES.md` na semana dois precisa distinguir, regra a regra, o que o projeto provou do que o buildx supôs.

Uma regra `decidido_pelo_buildx` lida como se fosse detectada faz o projeto acreditar que tem evidência onde só tem opinião — e é assim que uma convenção errada sobrevive por dois anos.

## O que o `CONVENCOES.md` do B2 cobre

O mínimo para a primeira sprint do sprintx ter onde se apoiar:

| Eixo | Decidido no B2 |
|---|---|
| onde mora o teste e como se chama | do padrão do framework escolhido (P-2) |
| como o banco é isolado entre testes | do banco escolhido (P-3) |
| comandos de teste, lint e build | os que o esqueleto instalou, e que comprovadamente rodam |
| camadas e quem pode chamar quem | as três camadas de P-1, com a direção das dependências |
| como erro é sinalizado | decidido, uniforme desde a primeira feature |
| como configuração é lida | L20: variável obrigatória ausente falha no start |

Os três comandos são o único item do B2 que **tem evidência real**: eles rodaram no esqueleto e passaram. Marque-os com a evidência, não com `decidido_pelo_buildx` — a distinção é o que mantém a marcação honesta.

## A revisão da primeira feature

O momento em que o projeto deixa de acreditar no buildx e passa a acreditar em si mesmo.

Depois da primeira feature entregue (B4, passo 7), existe código real. Aí:

1. rode o `stackx-detectar` normal — agora ele tem o que varrer
2. compare com o que o B2 decidiu
3. **regra confirmada pelo código** → converta `decidido_pelo_buildx` para a evidência real (arquivo e linha)
4. **regra contradita pelo código** → achado. Ou o código se ajusta à convenção, ou a convenção estava errada e é corrigida
5. **convenção que emergiu e o B2 não previu** → acrescente, com evidência

O passo 4 é uma decisão de verdade, e a regra é: **na dúvida, o código ganha.** Se a feature inteira foi planejada, auditada, testada e entregue de um jeito que contraria a convenção do B2, o mais provável é que a convenção estivesse errada — ela foi escrita antes de existir código, por um método que admite ter suposto.

Exceção: convenção que realiza premissa de segurança. Aí a convenção ganha e o código se ajusta, sempre.

## Os ciclos seguintes

Depois da primeira revisão, o stackx volta ao papel normal. O `stackx-check` pode entrar no B4 como verificação extra por feature, se for barato — ele aponta violação de convenção, não corrige, e o achado vira pendência `replanejamento` no B5.

Não é obrigatório: a `mergex-check` já cobre o essencial. Vale em projeto grande, onde a deriva entre features é maior.

## Comportamento sem stackx

Diferente do prodx, sprintx e mergex, **o stackx é opcional**. Sem ele, o buildx grava `docs/stack/CONVENCOES.md` diretamente no B2, no mesmo formato, e perde apenas a revisão automática da primeira feature — que passa a ser manual ou não acontece.

O buildx registra a ausência como premissa e segue. É a única das quatro camadas cuja falta degrada em vez de bloquear.
