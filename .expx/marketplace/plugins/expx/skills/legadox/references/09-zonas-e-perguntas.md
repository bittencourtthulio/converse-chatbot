# Camadas 11 e 10 — ZONAS DE RISCO, PERGUNTAS OBRIGATÓRIAS E PROVA DE CÓDIGO VIVO

Este reference cobre a Camada 11 (perguntas obrigatórias por zona) e a Camada 10 (prova de que o código está vivo), que compartilham o mesmo momento: **antes de planejar**.

---

# Camada 11 — PERGUNTAS OBRIGATÓRIAS POR ZONA

Se o trabalho toca uma zona de risco declarada no `PERFIL.md`, um bloco de perguntas dispara **antes de qualquer planejamento**.

É o "pedir permissão" acionado **por regra, não por sorte**. A diferença importa: um agente que pergunta quando se sente inseguro pergunta pouco nos casos graves e demais nos triviais. Uma regra que dispara por zona pergunta sempre onde precisa e nunca onde não precisa.

## Pré-requisitos verificáveis

- `docs/legado/PERFIL.md` existe e tem zonas de risco declaradas.
- O raio (Camada 2) foi calculado e o Sinal 5 indica zona tocada.

Se o Sinal 5 indica zona tocada, esta camada é **obrigatória** e o plano não é gerado sem ela (regra 8).

## Regra dura deste reference

**Sem as respostas, o plano não é gerado.** Não existe "vou planejando enquanto a resposta não chega". O planejamento condiciona o escopo, e o escopo depende dessas respostas.

Esta é uma das poucas situações em que a IA **para e espera**. É deliberado: em zona de risco, seguir sem resposta é pior do que atrasar.

---

## Passo 1 — Identificar a zona e o validador

Do `PERFIL.md`, extraia para a zona tocada: nome, pastas que a compõem, **quem valida uma mudança ali**, e as perguntas adicionais específicas dela.

Se o validador estiver como `NÃO DETERMINADO`, a primeira pergunta passa a ser descobrir quem é — e ela é bloqueante como as demais.

---

## Passo 2 — Fazer as perguntas

As **seis perguntas mínimas**, ampliáveis pelas específicas da zona no `PERFIL.md`:

```
1. Quem valida esta mudança antes de ir para produção?
2. Existe impacto fiscal, contratual ou regulatório?
3. Existe dado histórico que muda de interpretação?
4. É preciso avisar cliente, e com quanta antecedência?
5. Existe janela de manutenção obrigatória?
6. Existe processo manual do time que depende do comportamento atual?
```

Faça-as **de uma vez**, em um bloco, com o contexto necessário para serem respondíveis: o que o trabalho pretende mudar, quais arquivos toca, qual zona foi identificada e por quê. Uma pergunta sem contexto recebe resposta genérica, e resposta genérica não protege ninguém.

Acrescente as perguntas específicas da zona declaradas no PERFIL. Exemplo de forma: uma zona fiscal costuma acrescentar perguntas sobre a competência afetada, sobre documento já transmitido e sobre obrigação acessória já entregue.

### O que fazer com cada resposta

| Resposta | Consequência |
|---|---|
| **1** — nome do validador | vira o aprovador da regra 9; a aprovação registrada precisa ser dele |
| **2** — sim | o trabalho tem prazo externo; ele entra no plano como restrição, não como observação |
| **3** — sim | Camada 9 obrigatória, e o roteiro manual precisa do caso de dado antigo |
| **4** — sim | a entrega tem antecedência mínima; o plano declara a data de corte |
| **5** — sim | a task de entrega declara a janela; nada sobe fora dela |
| **6** — sim | **frequentemente o achado mais importante.** Se o time do cliente tem planilha, conferência ou rotina que depende do comportamento atual, mudá-lo quebra o processo mesmo com o código correto. Isso pode mudar a solução inteira |

Uma resposta "não sei" é tratada como **sim** para efeito de rigor, e a lacuna é registrada.

---

## Passo 3 — Registrar

As respostas entram no registro de decisões do trabalho na skill irmã — `00-DECISOES.md` na sprintx, a seção de decisões de `01-CAUSA-RAIZ.md` na runx — e são referenciadas em `docs/legado/raio/<trabalho_id>.md`, na seção de zona de risco:

```
Zona tocada: <nome da zona>
Validador: <quem>
Perguntas respondidas em: <data>  por: <quem respondeu>

1. Quem valida: <resposta>
2. Impacto fiscal/contratual/regulatório: <resposta>
3. Dado histórico reinterpretado: <resposta>
4. Aviso a cliente: <resposta, com antecedência>
5. Janela de manutenção: <resposta>
6. Processo manual dependente: <resposta>
<perguntas específicas da zona e respostas>

Restrições que isso impõe ao plano: <lista>
```

---

## Passo 4 — Aprovação humana (regra 9)

Zona tocada implica raio ALTO, e ALTO obriga **aprovação humana explícita e registrada**. Registre no arquivo do raio:

```
APROVAÇÃO HUMANA
Aprovado por: <nome ou papel>
Data: <AAAA-MM-DD>
O que foi aprovado: <o escopo exato, em uma linha>
Riscos declarados no momento da aprovação: <lista>
```

Aprovação genérica ("pode seguir") não é aprovação registrada. O que se aprova é o escopo, com os riscos à vista. Se o escopo mudar depois, a aprovação precisa ser renovada.

## Critério de saída — Camada 11

- [ ] As seis perguntas mínimas foram feitas e respondidas.
- [ ] As perguntas específicas da zona, declaradas no PERFIL, foram feitas e respondidas.
- [ ] As respostas estão no registro de decisões da skill irmã e no arquivo do raio.
- [ ] As restrições que as respostas impõem estão traduzidas em itens do plano.
- [ ] A aprovação humana está registrada com nome, data, escopo e riscos.
- [ ] Nenhum "não sei" ficou sem virar lacuna registrada.

## Quando o critério não é atendido — Camada 11

**O usuário não sabe responder.** Descubra quem sabe e diga isso: "esta pergunta precisa do responsável por <zona>; o PERFIL indica <quem>". Enquanto não houver resposta, o plano não é gerado. Registre como bloqueio pelo mecanismo da skill irmã e siga com outro trabalho se houver.

**O usuário manda seguir sem responder.** Registre literalmente o pedido, registre que as perguntas ficaram sem resposta, e trate cada uma como **sim** (pior caso): a Camada 9 passa a ser obrigatória, o roteiro manual ganha os casos de dado antigo, e a aprovação humana precisa declarar explicitamente que se está aprovando sem as respostas. O rigor não cai; ele passa a ser exercido sobre uma decisão consciente do usuário, que fica escrita.

**A zona foi tocada por um arquivo aparentemente inofensivo** (um helper genérico em `utils/`). A zona é tocada do mesmo jeito. O que muda é que o escopo talvez deva ser reduzido: se o helper serve a cinco módulos e só um é da zona, avalie um ponto de costura que não altere o helper compartilhado. Isso frequentemente rebaixa o raio, e rebaixar por redução de escopo é legítimo.

---

# Camada 10 — PROVA DE QUE O CÓDIGO ESTÁ VIVO

Legado é cheio de código morto. Antes de gastar esforço mexendo num arquivo, confirme que ele é realmente chamado.

Vale em **todas as faixas** — não é etapa nova, é uma verificação que a coleta de chamadores (Sinal 1 do raio) já produz.

## Passo 1 — Grafo de chamadas, no mínimo

Partindo dos chamadores do Sinal 1, verifique se existe cadeia que chega a um **ponto de entrada declarado no PERFIL** — rota, comando, job, handler, webhook.

- Existe cadeia até um ponto de entrada → **vivo**.
- Nenhum chamador fora dos próprios testes → **suspeito de morto**.
- A única cadeia passa por rota comentada, flag desligada, ou ponto de entrada que o PERFIL não lista → **suspeito de morto**.

Cuidados: chamada dinâmica, resolução por container, rota configurada em banco e reflexão escondem chamadores reais. Se a stack permite isso e você não consegue descartar, o resultado é **inconclusivo**, e inconclusivo trata-se como vivo (o pior caso aqui é remover algo que está em uso).

## Passo 2 — Log ou telemetria, quando existir

Evidência muito mais forte que o grafo. Se houver log estruturado, APM, métrica ou telemetria acessível, verifique se o trecho aparece em execução recente.

Registre a fonte e o período consultado: "sem ocorrência no log de aplicação nos últimos 90 dias". Sem acesso, diga que não houve verificação por telemetria — não escreva que não é chamado.

## Passo 3 — Registrar

No arquivo do raio, seção de prova de código vivo:

```
Alvo: <caminho/relativo/arquivo.ext>
Resultado: <VIVO | SUSPEITO DE MORTO | INCONCLUSIVO>
Evidência: <cadeia de chamadores até o ponto de entrada, ou consulta a log/telemetria>
Método: <grep, análise estática, consulta a log — qual e como>
```

## Passo 4 — Suspeita de morto não autoriza remoção

**Regra inviolável 10.** Se a evidência apontar código morto:

1. **Não remova.**
2. Registre em `docs/legado/DIVIDA.md`, com a evidência e a classe de risco de remover.
3. Continue o trabalho que foi pedido.

Remover código morto em legado é mudança de raio próprio: o arquivo pode ser chamado por integração externa, por rotina anual que ainda não rodou, por script de outro time. Merece seu próprio trabalho, com seu próprio raio.

Se o alvo estiver suspeito de morto **e** o trabalho pedido for justamente alterá-lo, diga ao usuário em uma linha que o trabalho pode ser desnecessário, apresente a evidência, e siga o que ele decidir.

## Critério de saída — Camada 10

- [ ] Todo arquivo alvo tem resultado registrado: VIVO, SUSPEITO DE MORTO ou INCONCLUSIVO.
- [ ] O método de verificação está declarado.
- [ ] Suspeita de morto virou linha em `DIVIDA.md`, e nada foi removido.
- [ ] Inconclusivo foi tratado como vivo.

## Quando o critério não é atendido — Camada 10

**Não há como levantar chamadores** (stack com resolução inteiramente dinâmica). Resultado INCONCLUSIVO, tratado como vivo, e o Sinal 1 do raio conta como pior caso. Registre o mecanismo que impediu a análise.

**O código está claramente morto e atrapalha a task.** Ainda assim não remova. Se ele atrapalha de fato — por exemplo, a costura precisaria passar por ele — declare como achado da Camada 4 e escale. Contornar sem tocar é preferível; remover por conta própria, nunca.
