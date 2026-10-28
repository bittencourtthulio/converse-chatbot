# Camada 8 — ROTEIRO DE TESTE MANUAL

Você está escrevendo `docs/legado/manual/<trabalho_id>.md`: o roteiro que uma pessoa vai executar na interface, à mão, para validar o trabalho.

Indispensável porque as telas do legado não têm cobertura automática. O teste automatizado prova que a função calcula; só o roteiro manual prova que a tela mostra, que o relatório fecha e que o fluxo vizinho não quebrou.

Acionada em raio **MEDIO** e **ALTO**. Gerada ao fim da execução, quando você já sabe o que de fato mudou.

## Pré-requisitos verificáveis

- `docs/legado/raio/<trabalho_id>.md` existe, faixa MEDIO ou ALTO.
- As tasks foram executadas: você sabe o que mudou de verdade, não o que estava planejado.
- Você tem o Sinal 2 (telas e rotas) e o Sinal 3 (jobs, relatórios, integrações) do raio.

## Regra dura deste reference

**Escrito para uma pessoa que não conhece o código.** Nada de nome de função, de arquivo, de tabela ou de endpoint nos passos. Quem vai executar é analista de suporte, QA ou o próprio usuário do sistema. Se um passo só faz sentido para quem leu o diff, ele está errado.

E: **dado de teste sugerido nunca é dado real de cliente.**

---

## Passo 1 — Levantar o que precisa ser verificado

Três fontes, nesta ordem:

1. **O que mudou.** Cada comportamento alterado por uma task vira pelo menos um caso.
2. **Sinal 2 do raio — telas e rotas.** Cada tela que passa pelo código alterado vira caso ou, no mínimo, verificação de colateral.
3. **Sinal 3 do raio — jobs, relatórios, integrações.** Cada consumidor assíncrono vira verificação de colateral, e quando for possível acioná-lo manualmente, vira caso próprio.

---

## Passo 2 — Escrever os casos

Cada caso é numerado e traz **cinco seções, todas obrigatórias**:

```
## Caso <N> — <o que este caso prova, em uma linha>

**Pré-condição**
<Em que estado o sistema e o dado precisam estar antes de começar.
 Perfil de acesso necessário, cadastro que precisa existir, configuração
 ligada, período aberto, saldo disponível. Uma linha por condição.>

**Passos**
1. <o que clicar, o que digitar — um passo por linha>
2. <...>

**Resultado esperado**
<O que a pessoa deve ver na tela. Valor exato quando houver valor.
 "O total exibe R$ 1.234,56", não "o total é calculado corretamente".>

**O que observar de colateral**
<As telas, relatórios e fluxos vizinhos que usam a mesma função e
 precisam ser conferidos. Seção obrigatória — ver Passo 3.>

**Dado de teste sugerido**
<Dado sintético, com os valores que exercitam o caso. Nunca dado real
 de cliente: nem nome, nem documento, nem e-mail, nem valor de contrato.>
```

Sobre os **passos**: um por linha, na voz de quem opera. "Clique em Faturamento no menu lateral" e não "navegue até o módulo de faturamento". Se um passo tem condicional, quebre em dois casos.

Sobre o **resultado esperado**: observável na tela. Se o efeito só é visível no banco, o caso está mal escolhido — encontre onde ele aflora na interface, ou declare a verificação como consulta a um relatório existente e diga qual.

---

## Passo 3 — A seção de colateral

**Esta é a seção que quase todo roteiro esquece, e é a razão de a Camada 8 existir.**

Em legado, a mesma função alimenta a tela, o relatório do fim do mês, a exportação para o contador e a integração com o sistema do cliente. Testar só a tela alterada é testar um quarto do impacto.

Derive a seção diretamente dos sinais do raio. Para cada item, escreva **onde olhar e o que deve continuar igual**:

- **Telas vizinhas** — outras telas que exibem o mesmo dado. "A listagem de pedidos continua mostrando o mesmo total do detalhe."
- **Relatórios** — os que somam ou consolidam o dado alterado. "O relatório de faturamento do mês fecha com o mesmo total de antes para os pedidos antigos."
- **Jobs e rotinas** — o que roda de madrugada e toca o mesmo dado. Diga **quando** verificar: "conferir no dia seguinte à primeira execução noturna".
- **Integrações** — arquivo gerado, remessa, chamada a terceiro. "O arquivo de remessa continua com o mesmo layout e a mesma quantidade de linhas."
- **Dado antigo** — o comportamento sobre registros criados **antes** da mudança. Em legado é onde a regressão aparece: o novo funciona, o histórico quebra.

O último item merece um caso próprio sempre que a mudança tocar cálculo ou formato:

```
## Caso <N> — Registro antigo continua exibindo o valor de antes
Pré-condição: um registro criado antes desta entrega, com valor conhecido.
Passos: ...
Resultado esperado: o valor exibido é exatamente o mesmo de antes da entrega.
```

---

## Passo 4 — Ordenar e enquadrar

- Casos do caminho principal primeiro; bordas depois; colateral por último.
- No topo do roteiro, um bloco de **preparação única**: ambiente onde executar, perfil de acesso necessário, e o que precisa estar configurado. Não repita isso em cada caso.
- No fim, um bloco de **registro do resultado**, com espaço para quem executou, quando, e o que falhou.
- Se algum caso só puder ser executado em janela específica (fechamento de mês, virada de dia, após execução de job), diga isso no próprio caso, em destaque.

---

## Formato exato da saída

`docs/legado/manual/<trabalho_id>.md`, de `assets/TEMPLATE-teste-manual.md`:

1. cabeçalho: trabalho, faixa do raio, o que mudou em uma linha, data
2. preparação única
3. casos numerados, cada um com as cinco seções
4. bloco de registro do resultado

## Critério de saída

- [ ] Todo comportamento alterado tem pelo menos um caso.
- [ ] Toda tela do Sinal 2 aparece como caso ou como colateral.
- [ ] Todo consumidor do Sinal 3 aparece na seção de colateral, com quando verificar.
- [ ] Toda seção "o que observar de colateral" está preenchida — nenhuma vazia, nenhuma com "nada".
- [ ] Há um caso verificando o comportamento sobre dado antigo, quando a mudança tocar cálculo ou formato.
- [ ] Nenhum passo cita nome de função, arquivo, tabela ou endpoint.
- [ ] Todo resultado esperado é observável na tela e tem valor exato quando houver valor.
- [ ] Nenhum dado real de cliente no roteiro.
- [ ] Nenhum caminho absoluto.

## Quando o critério não é atendido

**A mudança não tem efeito visível na interface** (rotina de fundo, job, integração). O roteiro continua obrigatório, mas os casos mudam de forma: acionar a rotina pelo meio disponível ao operador (botão de reprocesso, agendamento manual, esperar a execução) e verificar o resultado onde ele aflora — um relatório, um arquivo gerado, uma listagem. Se nem isso existir, o caso passa a ser a verificação do log ou do arquivo de saída, e você diz exatamente onde encontrá-lo e o que procurar.

**Não é possível montar a pré-condição sem dado real.** Descreva a **forma** do dado necessário e como criá-lo pelo próprio sistema, passo a passo. Se a pré-condição exigir volume ou histórico impossível de criar à mão, declare isso e marque o caso como executável apenas em ambiente de homologação com base restaurada e anonimizada — nunca sugira usar produção.

**Você não sabe quais telas vizinhas consomem o dado.** Isso é lacuna do Sinal 2 do raio, não do roteiro. Volte ao raio e complete o levantamento. Se realmente não for determinável, escreva na seção de colateral: "não foi possível determinar todos os consumidores — verificar as telas do módulo <X> por amostragem", e registre a lacuna em `docs/legado/LACUNAS.md`.

**O roteiro ficou com dezenas de casos.** Sinal de que o trabalho era grande demais para uma entrega. Não corte casos para encurtar. Agrupe por área e marque quais são **bloqueantes** (se falhar, não sobe) e quais são de verificação posterior. Se nem assim couber, registre no fechamento que o tamanho do roteiro indica que o trabalho deveria ter sido dividido — informação útil para o próximo raio.
