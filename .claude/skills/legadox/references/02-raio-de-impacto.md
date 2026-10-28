# Camada 2 — RAIO DE IMPACTO

Você está calculando o raio de impacto de um trabalho, antes de qualquer plano existir. O resultado é `docs/legado/raio/<trabalho_id>.md` e é ele que decide quais camadas do legadox são acionadas.

Esta é a peça central do método. Ela existe para substituir o "peça permissão por intuição" por evidência coletada, e para manter o trabalho de baixo risco leve. Um raio calculado com rigor é o que permite que a maioria dos trabalhos passe direto, sem camada extra nenhuma.

## Delegue ao agente `avaliador-de-raio`

Quando o agente `avaliador-de-raio` estiver disponível, **delegue esta camada a ele** e siga com a faixa que ele devolver.

O motivo aqui não é contexto, é **independência**. O cálculo do raio governa todas as outras camadas, e quem vai implementar tem interesse no resultado: raio alto significa caracterização, orçamento menor, plano de reversão e roteiro manual — mais trabalho. O `avaliador-de-raio` coleta os sinais sem ter esse interesse.

O roteiro abaixo é o que ele segue, e continua valendo integralmente quando não houver agente disponível.

## Pré-requisitos verificáveis

- `docs/legado/PERFIL.md` existe. Sem ele não há modo legado nem limiares para aplicar (regra 1).
- Você sabe o `<trabalho_id>`: o `<slug-da-feature>` da sprintx ou o `<OC-ID>-<slug>` da runx.
- Você tem o **conjunto de arquivos alvo** — os que o trabalho pretende tocar.

Se o conjunto de arquivos alvo ainda não estiver claro, ele vem da ingestão da skill irmã: F1 na sprintx, E1 na runx. O raio é calculado **depois** de saber o que será tocado e **antes** de planejar como tocar.

Se `docs/legado/raio/<trabalho_id>.md` já existir, leia-o. Recalcule apenas se o conjunto de arquivos alvo mudou; nesse caso, sobrescreva e registre na seção de histórico do arquivo que houve recálculo e por quê.

## Regra dura deste reference

**A faixa nunca é escolhida por sensação.** Ela é o resultado da aplicação dos limiares do PERFIL sobre os sinais coletados. Se você se pegar pensando "isso parece simples, deve ser BAIXO", pare: colete os sinais e deixe a tabela decidir.

**Sinal não coletável conta como pior caso**, e o arquivo do raio registra qual sinal foi assumido como pior caso e por quê. Isso é deliberado: a ignorância sobre um sistema legado é risco, não neutralidade.

---

## Passo 1 — Fixar o conjunto de arquivos alvo

Liste os arquivos que o trabalho vai tocar, com caminho relativo. Esta lista trava o escopo do cálculo.

Se durante o trabalho a lista crescer, **o raio é recalculado**. Um trabalho que começa em um arquivo e termina em nove não é o mesmo trabalho, e a faixa pode ter mudado. Recalcular é barato; descobrir tarde que o raio era ALTO não é.

---

## Passo 2 — Coletar os sinais

Cada sinal tem um método de coleta declarado no arquivo do raio: o comando que você rodou ou o arquivo que você leu. "Analisei o código" não é método de coleta.

### Sinal 1 — Chamadores diretos e indiretos

**Diretos:** para cada símbolo público dos arquivos alvo (função, classe, método, endpoint, constante exportada), busque todas as referências no repositório.

```
grep -rn "<nomeDoSimbolo>" --include=<extensoes do projeto> . | grep -v "<arquivo alvo>"
```

Se o projeto tiver ferramenta de análise estática ou LSP disponível, prefira-a ao grep e diga qual usou. Grep é o piso, não o teto.

**Indiretos:** para cada chamador direto encontrado, suba **um nível** e conte quem chama aquele chamador. Pare de subir quando chegar a um ponto de entrada declarado no PERFIL (rota, comando, job, handler) — o ponto de entrada é fronteira do mapa.

Conte **chamadores distintos**, não ocorrências: dez chamadas dentro do mesmo arquivo são um chamador. Não conte arquivos de teste como chamadores — eles entram no Sinal 4.

Cuidados que mudam a contagem:

- **Nome genérico.** Um método chamado `calcular` vai dar centenas de falsos positivos. Refine pelo receptor (`->calcular`, `Servico::calcular`) e conte só o que de fato aponta para o alvo. Registre que refinou.
- **Chamada dinâmica.** Nome de método montado em string, container que resolve por convenção, reflexão, chamada por rota configurada em banco. Se a stack permite isso e você não consegue descartar, o sinal é **não coletável com confiança** → pior caso.
- **Herança e interface.** Se o símbolo alvo é sobrescrito ou implementa contrato, conte também os chamadores do contrato.

### Sinal 2 — Telas e rotas que dependem

Partindo dos chamadores, identifique quais alcançam interface do usuário: controller que renderiza tela, endpoint consumido por front, componente de UI.

Liste **nome da tela ou rota + caminho do arquivo**. Esta lista alimenta a Camada 8 depois: cada tela aqui vira caso, ou pelo menos verificação de colateral, no roteiro manual.

### Sinal 3 — Jobs, crons, relatórios e integrações que consomem

O consumo assíncrono é a fonte clássica do "funcionou na tela e quebrou o faturamento na virada do mês". Consulte a seção de pontos de entrada do PERFIL e cruze com os chamadores.

Procure especificamente:

- job ou cron que chama o alvo, direta ou indiretamente
- relatório que lê o dado que o alvo grava
- exportação, arquivo gerado, remessa
- integração de saída que envia o dado a terceiro
- webhook ou fila que dispara a partir do alvo

Consumo por job ou relatório é, sozinho, motivo suficiente para MEDIO.

### Sinal 4 — Cobertura de teste existente na área

Consulte a cobertura por pasta registrada no PERFIL. Se disponível, meça diretamente a cobertura dos arquivos alvo com a ferramenta do projeto.

Registre uma de três respostas, sem meio-termo:

- **existente** — há teste que exercita o comportamento a ser alterado, e você o localizou pelo caminho
- **parcial** — há teste no arquivo, mas não cobrindo o comportamento alvo
- **ausente** — não há teste, ou a suíte não é executável

Para o limiar de BAIXO, apenas **existente** conta como cobertura. `parcial` e `ausente` empurram para MEDIO.

### Sinal 5 — Zona de risco tocada

Cruze o caminho de cada arquivo alvo com as pastas declaradas nas zonas de risco do PERFIL.

Match de pasta é o piso. Verifique também se o arquivo alvo, mesmo fora da pasta da zona, **grava ou lê dado da zona** — um helper genérico usado pelo cálculo fiscal toca a zona fiscal ainda que more em `utils/`.

Zona tocada ⇒ ALTO, e dispara a Camada 11 antes de qualquer planejamento (regra 8).

### Sinal 6 — Churn e idade

```
git log --format=%ad --date=short -- <arquivo> | wc -l   quantas alterações na vida
git log -1 --format=%ad --date=short -- <arquivo>        última alteração
git log -1 --format=%ad --date=short --diff-filter=A -- <arquivo>   criação
```

Interprete assim, e registre a leitura:

- **churn alto e recente** — área viva, provavelmente conhecida por alguém do time; risco de conflito, não de esquecimento
- **churn baixo e antigo** — área congelada: ninguém lembra como funciona, provavelmente sem teste, e a chance de efeito colateral desconhecido é maior
- **churn alto e antigo** (muitas alterações, nenhuma recente) — área que já foi disputada e hoje está parada; olhe o histórico à procura de correções repetidas no mesmo ponto, que costumam indicar comportamento sutil

Churn não move faixa sozinho nos limiares padrão. Ele é sinal **qualitativo**: entra no arquivo do raio e informa o ponto de costura (Camada 4) e o roteiro manual (Camada 8). Sem histórico disponível, `NÃO DETERMINADO`.

### Sinal 7 — Migração de banco envolvida

Responda sim se o trabalho: cria, altera ou remove tabela, coluna, índice, constraint ou enum; ou faz backfill de dado existente.

Migração ⇒ ALTO. Migração é o exemplo mais puro de efeito que o versionador não desfaz, e é por isso que ela puxa junto a Camada 7.

### Sinal 8 — Dado histórico ou imutável

Responda sim se o dado que o trabalho grava ou reinterpreta é: registro de competência já encerrada, movimentação contábil, log de auditoria, documento fiscal emitido, valor que já foi comunicado ao cliente ou a um terceiro.

O teste decisivo: **alguém já tomou uma decisão baseada nesse dado?** Se sim, mudar como ele é gravado ou interpretado muda o passado. É ALTO.

---

## Passo 3 — Classificar

Aplique os limiares **do PERFIL** (não os do SKILL.md — o PERFIL é editável e vence).

```
BAIXO   todos verdadeiros:
        chamadores <= 3
        E nenhuma zona de risco tocada
        E sem migração de banco
        E cobertura = existente
        E sem dado histórico afetado

MEDIO   qualquer um:
        chamadores entre 4 e 15
        OU cobertura parcial ou ausente
        OU consumo por job, cron, relatório ou integração

ALTO    qualquer um:
        chamadores > 15
        OU qualquer zona de risco tocada
        OU migração de banco
        OU dado histórico ou imutável afetado
```

Regras de desempate:

1. A faixa é a **maior** que qualquer sinal justificar. Um trabalho com 2 chamadores que toca a zona fiscal é ALTO.
2. Empate ou dúvida entre duas faixas: vale a maior.
3. Sinal marcado como não coletável: conta como **pior caso** para aquele sinal — chamadores viram "acima de 15", cobertura vira "ausente", zona vira "tocada" se o arquivo estiver perto de uma, migração e dado histórico viram "sim" se você não conseguir descartar.

O arquivo do raio registra, para cada sinal, o valor **e** se foi coletado ou assumido.

---

## Passo 4 — Declarar o que a faixa aciona

Copie para o arquivo do raio a lista das camadas acionadas, marcada. Essa lista é o contrato que a skill irmã vai cumprir e que a auditoria (F5 da sprintx / E4 da runx) vai conferir.

**BAIXO** — nenhuma camada extra. Registre o raio, marque explicitamente "nenhuma camada adicional acionada", e devolva o fluxo à sprintx ou à runx sem interferência. A Camada 6 (proibição de colateral) e a Camada 10 (prova de código vivo) continuam valendo, porque não são etapas: são uma proibição e uma verificação que a ingestão já faz.

**MEDIO** — caracterização (3), ponto de costura (4), orçamento de 3 arquivos e 80 linhas (5), reversão (7), roteiro manual (8), plano aprovado antes de qualquer código. Perguntas da zona (11) apenas se alguma zona for tocada — o que normalmente já teria puxado para ALTO.

**ALTO** — tudo do MEDIO, com orçamento de 2 arquivos e 40 linhas, mais: perguntas da zona (11) respondidas **antes** de planejar, comparação com dado real (9), feature flag ou chave de desligamento, e **aprovação humana explícita e registrada** (regra 9).

Independentemente da faixa: **toda mudança de cálculo ou de regra de negócio aciona a Camada 9.**

---

## Passo 5 — Prova de código vivo (Camada 10)

Antes de fechar o raio, confirme que os arquivos alvo estão vivos. É barato aqui, porque você já levantou os chamadores no Sinal 1.

- **Vivo:** existe cadeia de chamadores que chega a um ponto de entrada do PERFIL.
- **Suspeito de morto:** nenhum chamador fora dos próprios testes, ou a única cadeia passa por rota comentada ou flag desligada.

Quando houver log ou telemetria acessível, confirme por ali: o trecho aparece em log de produção? Registre a fonte da evidência.

Se a evidência apontar código morto: **não remova** (regra 10). Registre o achado em `docs/legado/DIVIDA.md` e continue o trabalho pedido. Remover código morto em legado é mudança com raio próprio e merece seu próprio trabalho.

Se o alvo estiver morto **e** o trabalho pedido for justamente alterá-lo, diga isso ao usuário em uma linha: o trabalho pode ser desnecessário. Registre e siga o que o usuário decidir.

---

## Passo 6 — Gravar a faixa na barra de status

Fechado o raio, registre a faixa no `.expx/estado.json`, que é o arquivo que a barra de status do terminal lê. O procedimento completo está em `references/12-estado.md`; o resumo do que gravar aqui é:

| Faixa | `raio` | `orcamento_arquivos` | `orcamento_linhas` |
|---|---|---|---|
| BAIXO | `"baixo"` | `null` | `null` |
| MEDIO | `"medio"` | `"0/3"` | `"0/80"` |
| ALTO | `"alto"` | `"0/2"` | `"0/40"` |

Os usados nascem em zero e o teto é o da faixa — ou o do `PERFIL.md`, quando ele declarar tetos próprios. Em **BAIXO os dois campos de orçamento vão `null`**: em raio baixo o legadox sai do caminho, inclusive visualmente, e contador de teto que ninguém vai encostar é ruído na tela.

Três coisas que esta gravação **não** é:

- Não é decisão. O arquivo é derivado e somente exibição; nenhuma camada o lê para decidir nada. A faixa que vale continua sendo a de `docs/legado/raio/<trabalho_id>.md`.
- Não é obrigatória. Se `.expx/` não existir, não crie: siga sem gravar, sem erro e sem aviso. Se a gravação falhar, registre no rastro e siga. A barra nunca interrompe trabalho.
- Não é sua sozinha. O `estado.json` é compartilhado; escreva **apenas** os seus três campos, preservando os das outras skills.

Fora do modo legado — sem `docs/legado/PERFIL.md` — nada disso acontece, porque nem raio há.

---

## Formato exato da saída

`docs/legado/raio/<trabalho_id>.md`, preenchido de `assets/TEMPLATE-raio.md`, contendo:

1. identificação do trabalho e data do cálculo
2. conjunto de arquivos alvo
3. os oito sinais, cada um com valor, método de coleta, e se foi coletado ou assumido como pior caso
4. a faixa resultante e **a justificativa em uma linha citando o sinal que a determinou**
5. a lista de camadas acionadas
6. a prova de código vivo
7. o registro de aprovação humana, quando ALTO

## Critério de saída

- [ ] O arquivo existe em `docs/legado/raio/<trabalho_id>.md`.
- [ ] Os oito sinais estão preenchidos; nenhum em branco.
- [ ] Todo sinal tem método de coleta declarado, ou está marcado como pior caso assumido com o motivo.
- [ ] A faixa cita qual sinal a determinou.
- [ ] A lista de camadas acionadas corresponde à faixa.
- [ ] A prova de código vivo está registrada.
- [ ] Em ALTO: o campo de aprovação humana existe, mesmo que ainda pendente.
- [ ] Nenhum caminho absoluto no arquivo.
- [ ] A faixa foi gravada em `.expx/estado.json`, ou a gravação foi dispensada porque `.expx/` não existe.

## Quando o critério não é atendido

**Não dá para contar chamadores com confiança** (chamada dinâmica, container por convenção, rota em banco). Marque o sinal como não coletável, assuma pior caso, escreva no arquivo qual mecanismo impediu a contagem. Não estime "uns 5".

**O PERFIL não tem cobertura por pasta.** Meça agora só para os arquivos alvo, se conseguir. Se não conseguir, cobertura é `ausente` — e o trabalho vai para MEDIO no mínimo. Isso é o comportamento correto: código sem cobertura conhecida não é código de baixo risco.

**A faixa deu ALTO e o usuário discorda.** Você não rebaixa a faixa. O caminho legítimo é um destes dois, e ambos ficam registrados: o usuário **edita os limiares no PERFIL**, com motivo, e você recalcula; ou o usuário **reduz o escopo** do trabalho, e você recalcula sobre o conjunto menor de arquivos. Recalcular sobre escopo menor é a saída saudável e frequente — quebrar um trabalho ALTO em um MEDIO e um ALTO menor costuma ser exatamente o que o método deveria provocar.

**O trabalho é urgente e a faixa é ALTO.** Urgência não muda a faixa. O que a urgência pode fazer é a aprovação humana (regra 9) ser dada na hora, por escrito, com o risco declarado. Registre quem aprovou, quando, e o que foi dito sobre o risco. Aprovação verbal não registrada não conta como aprovação.
