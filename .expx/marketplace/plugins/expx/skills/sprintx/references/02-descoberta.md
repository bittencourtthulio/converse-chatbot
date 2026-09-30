# F2 — DESCOBERTA

Você está na F2 — a ÚNICA fase de todo o método em que você pergunta ao usuário, e nela você é OBRIGADO a perguntar. Nesta fase você não escreve plano e não escreve código.

Isso vale nos dois modos de construção (Passo 0). O modo `autonomo` muda **quanto** se pergunta — pesquisa primeiro, só pergunta o indecidível — nunca **se** esta fase pode perguntar: continua sendo a única do método inteiro.

## Pré-requisitos verificáveis

- `docs/sprintx/features/<slug>/base/` existe e tem pelo menos `00-INDICE.md`.
- `docs/sprintx/features/<slug>/00-DECISOES.md` não existe (ou existe com PENDENTEs a resolver — reexecução para resolvê-los).

Se `base/` não existe, a F1 não aconteceu: diga "Falta a F1 (ingestão). Vou executá-la primeiro." e execute `references/01-ingestao.md`.

## Passo 0 — Confirmar densidade e forma de construção

Antes de entrevistar, confirme (ou pergunte do zero, se a F1 não trouxe sugestão) estas duas coisas — sempre com o usuário, mesmo em modo autônomo, porque são a escolha que decide como o resto desta fase roda:

1. **Densidade**: `mvp` | `padrao` | `completo` | `profundo`. Quanto escopo entra nesta entrega.
2. **Forma de construção**: `entrevista` | `autonomo`.

Se o `BRIEFING.md` do prodx sugeriu os dois (Passo 1.1 da F1), apresente a sugestão e peça confirmação em uma linha — não refaça a pergunta do zero:

> "O prodx sugeriu densidade `padrao` e forma de construção `entrevista`. Confirma, ou ajusta algum dos dois?"

Sem sugestão prévia, pergunte diretamente, com opções concretas. Registre a resposta como a primeira decisão da fase, `D-00`, em `00-DECISOES.md`.

**O que cada densidade muda nos eixos do Passo 1:** não é sobre pular eixo — os sete eixos continuam obrigatórios em qualquer densidade (regra 10). O que muda é o quanto se aprofunda em cada um:

| Densidade | O que muda |
|---|---|
| `mvp` | Cada eixo cobre só o que impede o plano de travar. Observabilidade e resiliência ficam no mínimo que não é negligência (log de erro, sem métrica nova). |
| `padrao` | Cobertura normal dos sete eixos, sem ir atrás de casos extremos que não foram mencionados. |
| `completo` | Cobertura normal mais os casos de borda razoáveis de cada eixo (múltiplos ambientes, papéis de usuário, formatos de erro). |
| `profundo` | Cobertura completa mais explicitamente investigar consequências de segunda ordem (o que este eixo quebra em outra parte do sistema) antes de fechar a decisão. |

**O que a forma de construção muda:** é sobre COMO os sete eixos são preenchidos, não sobre pular a fase — a F2 continua obrigatória (regra 10) em qualquer modo.

- **`entrevista`** (padrão até aqui): siga o Passo 2 como descrito — blocos de até 5 perguntas, espera resposta, só então o próximo bloco.
- **`autonomo`**: para cada eixo, pesquise primeiro (código existente, `CONVENCOES.md`, base da F1, decisões anteriores em `docs/sprintx/`) e registre a decisão com a hipótese assumida e a evidência que a sustenta, sem parar para esperar resposta. Só vira pergunta ao usuário o que é **genuinamente indecidível sem ele** — tipicamente escopo de negócio (eixo 1) e definição de pronto (eixo 7), porque nenhuma leitura de código responde "o cliente ficaria satisfeito com isso". Tudo que foi assumido por hipótese entra em `00-DECISOES.md` marcado como tal (ver Passo 3) — nunca como se tivesse sido confirmado.

## Passo 1 — Preparar a entrevista

Releia `base/00-INDICE.md` e `base/00-LACUNAS.md`. Toda lacuna da F1 vira pergunta obrigatória.

Monte perguntas cobrindo, no mínimo, estes sete eixos:

1. **Escopo de negócio** — o que entra nesta entrega e o que explicitamente fica de fora; quem usa; qual problema resolve.
2. **Arquitetura** — onde a feature vive (módulo, serviço, camada); o que reutiliza; o que cria.
3. **Contrato de dados** — entidades, campos, formatos, migrações; o que persiste e onde.
4. **Estado e observabilidade** — o que precisa de log, métrica, auditoria; como saber que está funcionando em produção.
5. **Resiliência e política de erro** — o que fazer em falha parcial, timeout, retry; o que é erro fatal vs. degradação.
6. **Ambiente e segredos** — em que ambientes roda; quais variáveis/segredos existem e ONDE ficam (nunca o valor).
7. **Definição de pronto do usuário** — o que o usuário precisa ver funcionando para considerar entregue.

## Passo 2 — Preencher os eixos

O que fazer aqui depende da forma de construção decidida no Passo 0.

### Modo `entrevista`

- Blocos de NO MÁXIMO 5 perguntas. Envie um bloco, ESPERE a resposta, só então envie o próximo.
- Numere as perguntas (P-01, P-02, ...) para o usuário poder responder por número.
- Prefira perguntas com opções concretas ("A, B ou outro?") a perguntas abertas, quando a base permitir.
- **Se uma resposta contradiz a base, avise na hora e cite o arquivo**: "Atenção: isso contradiz `base/<arquivo>.md`, que afirma X (fonte: Y). Confirma mesmo assim?"
- Continue em novos blocos até os sete eixos estarem cobertos e as lacunas da F1 tratadas.

### Modo `autonomo`

- Para cada eixo, pesquise antes de decidir: código existente, `CONVENCOES.md`, arquivos da `base/`, `docs/sprintx/` de features anteriores. Prefira o que já é padrão no projeto a uma escolha nova.
- Decida e registre com a evidência que sustenta a decisão — não avance sem citar de onde veio (arquivo, convenção, decisão anterior).
- **Se a pesquisa não encontra base suficiente para decidir com segurança**, isso vira pergunta ao usuário mesmo em modo autônomo — autônomo não é "nunca perguntar", é "não parar em bloco de 5 esperando resposta quando dá para descobrir sozinho". A regra é: pesquisou e achou evidência → decide e registra; pesquisou e não achou → pergunta, no mesmo formato do modo entrevista, só para esse ponto.
- **Se o que a pesquisa acha contradiz a base da F1, avise mesmo assim**, exatamente como no modo entrevista — o registro da contradição não é dispensado pelo modo autônomo.
- Ao final, mostre um resumo do que foi assumido antes de seguir para o Passo 3, para o usuário poder corrigir antes de o plano nascer em cima de uma hipótese errada.

## Passo 3 — Registrar as decisões

Crie `docs/sprintx/features/<slug>/00-DECISOES.md` usando `assets/TEMPLATE-DECISOES.md`. Uma linha por decisão:

```
D-01 | decisão | alternativa descartada | motivo
```

- `D-00` é sempre a densidade e a forma de construção confirmadas no Passo 0.
- Toda resposta do usuário que fecha uma escolha vira uma linha D-NN.
- **No modo `autonomo`**, toda decisão fechada por pesquisa (sem o usuário responder) leva `(HIPOTESE)` no campo motivo, seguido da evidência: `D-04 | Fila existente para envio assincrono | Envio sincrono na request | (HIPOTESE) base/filas.md registra fila 'notificacoes' ja em uso para caso semelhante`. Uma decisão só perde o `(HIPOTESE)` quando o usuário a confirma explicitamente depois.
- O que o usuário não soube ou não quis decidir entra como PENDENTE, com o que cada pendência trava:

```
PENDENTE-01 | pergunta em aberto | trava: <o que não pode ser planejado sem isso>
```

- Todo PENDENTE é bloqueante por padrão. Só marque `(NÃO BLOQUEANTE)` se o usuário disser explicitamente que o plano pode seguir sem essa resposta, e registre o que acontece se a resposta vier diferente do assumido.

**Frontmatter (obrigatório).** `00-DECISOES.md` é arquivo de estado: grave-o com o
frontmatter `kind: decisoes` do contrato expx-schema v1, descrito em
`references/00-schema.md` — leia-o antes de gravar. Cada linha `D-NN` da prosa vira uma
entrada da lista `decisoes:` com `status: fechada`; cada `PENDENTE-NN` vira uma entrada
com `status: pendente`, `alternativa_descartada: null`, `motivo: null` e `bloqueante`
refletindo a regra (todo PENDENTE é `true` por padrão). YAML e prosa dizem a mesma coisa,
sempre. Reescreva `atualizado_em` a cada gravação.

## Proibições desta fase

- Não escreva plano, sprint, fase ou task.
- Não escreva código.
- Não decida no lugar do usuário: o que ele não respondeu é PENDENTE, não é palpite seu.
- **No modo `autonomo`**: pesquisar e assumir hipótese é permitido; o que é proibido é fazer isso sem avisar. Toda hipótese assumida precisa do marcador `(HIPOTESE)` e da evidência (regra do Passo 3); sem os dois, é palpite disfarçado de decisão.

## Critério de saída da fase

- [ ] Densidade e forma de construção confirmadas e registradas como `D-00`.
- [ ] Os sete eixos foram cobertos, no padrão do modo escolhido (perguntados e respondidos, ou pesquisados e registrados com evidência), ou marcados como PENDENTE.
- [ ] Toda lacuna da F1 foi tratada — perguntada (modo entrevista) ou pesquisada com evidência (modo autônomo).
- [ ] `00-DECISOES.md` existe, com pelo menos uma decisão D-NN, no formato exato.
- [ ] `00-DECISOES.md` tem frontmatter válido e a lista `decisoes:` cobre todas as linhas D-NN e PENDENTE-NN da prosa.
- [ ] Contradições com a base foram apontadas ao usuário no momento em que surgiram, em qualquer modo.
- [ ] No modo `autonomo`: toda decisão fechada sem resposta do usuário está marcada `(HIPOTESE)` com evidência, e o resumo de hipóteses foi mostrado ao usuário antes do fim da fase.

## Quando o critério não é atendido

Se o usuário parou de responder no meio, registre o que já foi decidido, marque o restante como PENDENTE e informe: a F3 vai bloquear enquanto houver PENDENTE bloqueante.

## Ao terminar

Anuncie: "F2 concluída. Densidade `<densidade>`, construção `<modo>`. N decisões e M pendências em `docs/sprintx/features/<slug>/00-DECISOES.md`." No modo `autonomo`, acrescente quantas decisões foram por hipótese: "K das N decisões foram assumidas por pesquisa, marcadas `(HIPOTESE)` — revise antes da F3 se quiser corrigir alguma." Se houver PENDENTE bloqueante, diga quais e avise que a F3 está travada por eles. Caso contrário, siga para a F3 lendo `references/03-plano.md`.

Grave `fase: f3` em `.expx/estado.json` (`references/09-estado.md`) ao passar para a F3. Se a F3 ficou travada por PENDENTE bloqueante, mantenha `fase: f2` — a barra mostra onde o trabalho está, não onde ele deveria estar.
