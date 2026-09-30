# Cartucho 3 — Teste instável por runner

> **Confirme o runner e a versão exata em `docs/stack/CONVENCOES.md` §3, e a
> estratégia de isolamento de banco em §4, antes de aplicar.** Defaults de
> paralelismo e de isolamento mudaram entre versões maiores de vários runners
> citados aqui — a recomendação certa para a versão errada cria o problema que
> pretendia evitar.

**Leia só a seção do seu runner.** As duas primeiras valem para todos.

---

## As seis fontes, e por que cada uma engana

Teste instável ("flaky") é teste cujo resultado depende de algo que ninguém
declarou. O sintoma é sempre o mesmo — passa sozinho, falha em conjunto, ou
vice-versa — e a causa está sempre em uma destas seis:

### 1. Estado global entre casos
Módulo com estado no nível do arquivo, singleton, cache, variável de ambiente
mutada, registro de container de injeção, relógio mockado que não foi restaurado,
`console` espionado.

**Por que engana:** o teste que **causa** o vazamento passa. Quem falha é o
seguinte — ou um de outro arquivo. Você depura o teste errado. Quando a ordem
muda, o culpado aparente muda junto, o que faz parecer que o problema "anda".

**Sinal diagnóstico:** falha some ao rodar o arquivo isolado.

### 2. Paralelismo sem isolamento de banco
Dois casos escrevendo na mesma tabela ao mesmo tempo. Um trunca enquanto o outro
lê.

**Por que engana:** depende do escalonamento da máquina. Passa 20 vezes local em
4 workers, falha no CI com 8. Aumentar o número de workers para "ir mais rápido"
é o gatilho mais comum de uma suíte que era estável virar instável de um dia para
o outro.

**A combinação que decide** — cruze o isolamento (§4) com o paralelismo (§3):

| Isolamento | Paralelismo por processo | Paralelismo por thread |
| ---------- | ------------------------ | ---------------------- |
| Transação com rollback | Seguro — cada processo, sua conexão e sua transação | **Perigoso** se a conexão for compartilhada entre threads |
| Truncate | **Inseguro sem banco por worker** — um trunca o dado do outro | **Inseguro** |
| Banco por worker | Seguro | Seguro se a escolha do banco for por thread |
| Container efêmero por arquivo | Seguro, e lento | Seguro |
| Em memória por caso | Seguro | Seguro |

**Truncate + paralelismo sem banco por worker é a combinação mais comum de suíte
instável que existe.** Se a detecção encontrou exatamente isso, registre como
achado, mesmo que a suíte esteja passando hoje: ela falha quando a máquina do CI
mudar de tamanho.

### 3. Dependência de relógio
`Date.now()`, `now()`, `sleep` como sincronização, expiração de token, `TTL`.

**Por que engana:** falha só perto da virada de dia/mês/ano, ou quando a máquina
está lenta e o intervalo medido estoura. `sleep(100)` para "esperar o async"
funciona na sua máquina e falha no CI carregado — e a correção instintiva
(aumentar para 500) só torna a suíte mais lenta e adia a falha.

**Correção real:** relógio injetado ou fake; espera por **condição**, nunca por
tempo.

### 4. Dependência de ordem de execução
Um teste depende de dado criado por outro; ou de que outro **não** tenha rodado.

**Por que engana:** o runner pode ordenar por tempo de execução anterior, por
sharding, ou aleatoriamente. Passa por meses até o CI mudar de estratégia.

**Diagnóstico direto:** rode a suíte em ordem aleatória. Se a taxa de falha muda,
há acoplamento por ordem. Vários runners suportam isso nativamente
(`--random-order`, `--shuffle`, `sequence.shuffle`); ligar essa opção
permanentemente é o que impede o acoplamento de nascer.

### 5. Fuso e localidade
Data formatada com o fuso da máquina, `toLocaleString`, ordenação de strings
dependente de locale, semana começando em domingo ou segunda.

**Por que engana:** desenvolvedor em UTC-3, CI em UTC. O teste de "ontem" falha
entre 21h e meia-noite. **Fixe `TZ` e o locale na configuração do runner** — não
no teste — e escolha um fuso **diferente de UTC** para o CI, porque um teste
errado sobre fuso passa em UTC.

### 6. Rede
Chamada real a serviço externo, DNS, porta fixa, container que ainda não subiu.

**Por que engana:** falha em rajadas que parecem aleatórias mas são o serviço do
outro lado. **Porta fixa** falha só quando algo mais está usando a porta — o
famoso "só falha na máquina do fulano". Use porta efêmera, e espere pelo
health check, não por um `sleep`.

---

## Como investigar, sem chutar

Ordem que converge rápido:

1. **Rode o arquivo isolado.** Passa? → estado global ou ordem (1 ou 4).
2. **Rode com um worker só.** Passa? → paralelismo (2).
3. **Rode em ordem aleatória, várias vezes.** Muda a taxa? → ordem (4).
4. **Rode com `TZ` diferente e com data do sistema alterada.** → relógio ou
   fuso (3 ou 5).
5. **Rode sem rede.** Falha diferente? → rede (6).
6. **Repita o teste N vezes em sequência.** Um teste que falha no ciclo 40 de 100
   é vazamento acumulativo (conexões, arquivos, listeners), não aleatoriedade.

**Nunca "corrija" com retry.** Retry esconde o defeito e o move para produção,
onde não há retry. Se o time usa retry no CI, ele precisa de registro do que foi
retentado — sem isso, a suíte apodrece sem que ninguém veja.

**Quarentena vale mais que retry:** um teste isolado e visível em lista é dívida
declarada; um teste com retry é dívida oculta.

---

## Jest

- **Isolamento por arquivo, paralelismo por processo.** Estado global vaza dentro
  do arquivo, não entre arquivos. Um teste que falha ao rodar com outros arquivos
  é banco ou recurso externo, não módulo.
- **`resetModules`, `restoreMocks`, `clearMocks`, `resetMocks` são falsos por
  padrão.** Mock não restaurado é a fonte número um de vazamento aqui. Ligue os
  quatro na config, não caso a caso.
- **Timers falsos não restaurados** quebram tudo que vem depois no arquivo.
- **`--runInBand`** para diagnóstico de paralelismo. Se resolve, é (2).
- **`--detectOpenHandles`** para o teste que "trava" — handle aberto costuma ser
  conexão de banco não fechada, e é a mesma causa que faz a suíte engasgar no
  ciclo 40.
- **`testEnvironment` errado** (`node` × `jsdom`) muda `Date`, `URL` e timers.
- **Banco por worker:** `JEST_WORKER_ID` é a variável para derivar o nome do
  banco.

## Vitest

- **Padrão: threads, não processos.** Isso é o oposto do Jest, e a consequência é
  grande: estado de módulo **pode** ser compartilhado dependendo de
  `isolate`/`pool`. Uma suíte migrada de Jest herda testes que assumiam
  isolamento por processo — a migração parece limpa e a instabilidade aparece
  semanas depois.
- **`isolate: false`** é a otimização de velocidade que mais cria flaky.
- **`pool: 'forks'`** restaura o modelo de processos quando há estado global
  incontornável.
- **`globals: false`** por padrão: teste migrado que usa `describe` sem importar
  falha de forma confusa.
- **`sequence.shuffle`** para diagnosticar ordem.
- **Banco por worker:** `VITEST_POOL_ID`.

## pytest

- **Escopo de fixture é a fonte principal.** `scope="session"` ou `"module"` numa
  fixture que muda estado compartilha esse estado entre testes — e o efeito
  depende da ordem em que o pytest resolve as fixtures, que não é a ordem do
  arquivo.
- **`autouse=True`** aplica em lugares que você não previu.
- **`pytest-xdist` distribui por worker**, e cada worker é um processo com sua
  própria sessão: fixture de sessão roda **uma vez por worker**, não uma vez.
  Quem escreveu contando com "uma vez" tem corrida de criação de esquema.
  `--dist loadfile` mantém o arquivo no mesmo worker e resolve boa parte.
- **`monkeypatch`** desfaz sozinho; `os.environ[...] = ...` direto **não**.
- **`-p no:randomly`** para isolar o efeito de ordem quando `pytest-randomly`
  está instalado — e note que ele também reseta seed de `random` por teste, o que
  muda o comportamento de código que sorteia.

## RSpec

- **`before(:all)`/`let!` com efeito colateral** vaza entre exemplos: `before(:all)`
  não roda dentro da transação de teste, então o dado criado ali **sobrevive ao
  rollback** e contamina a suíte inteira.
- **`config.order = :random`** com seed registrado — reproduza a falha com o mesmo
  seed antes de "corrigir".
- **`use_transactional_fixtures`** não cobre teste de sistema com driver em outro
  processo (a transação não é visível para a outra conexão) — daí o
  `DatabaseCleaner` com truncate nesses casos, e daí a necessidade de banco por
  worker se houver paralelismo.
- **Mock de constante e `stub_const`** precisam de escopo; fora dele, vazam.

## Go

- **`t.Parallel()` só tem efeito dentro do mesmo pacote**; pacotes já rodam em
  paralelo por padrão. Um teste que grava em arquivo de caminho fixo colide entre
  **pacotes**, e a causa fica invisível quem só olha um pacote.
- **Variável de laço capturada em subteste paralelo** é o bug clássico em versões
  anteriores à mudança de semântica de escopo; em código antigo, ainda está lá.
- **Cache de teste** (`-count=1` para desligar) faz um teste "passar" sem rodar —
  ao investigar flaky, sempre desligue o cache, ou você mede nada.
- **`TestMain`** compartilhado é o ponto de vazamento de recurso do pacote.

## JUnit

- **Instância por método é o padrão**, mas campo `static` vaza sempre.
- **`@TestInstance(PER_CLASS)`** troca o padrão e cria vazamento onde antes não
  havia.
- **Execução paralela** é opt-in por propriedade; ao ligar, `@ResourceLock` e
  `@Execution` passam a importar, e testes que assumiam serialidade quebram em
  massa.
- **`@DirtiesContext`** no Spring recria o contexto — caro, e sua ausência onde
  era necessário vaza bean modificado entre classes.

## Playwright / Cypress e testes de navegador

- **Espera por tempo é o defeito estrutural.** Espere por estado (elemento
  visível, resposta recebida), nunca por milissegundos.
- **Animação em curso** faz o clique acertar a posição antiga do elemento.
  Desligue animação no ambiente de teste.
- **Paralelismo compartilhando usuário de login** é corrida garantida: um teste
  desloga o outro. Usuário por worker.
- **Estado de armazenamento do navegador** que sobrevive entre testes.
- **Retry embutido do runner** mascara flaky por padrão — configure para
  **reportar** o retry, não só para tolerá-lo.

---

## Checklist de configuração antifrágil

- [ ] Mocks e timers restaurados automaticamente pela config, não caso a caso.
- [ ] `TZ` e locale fixados na config, e o CI usa fuso diferente de UTC.
- [ ] Ordem aleatória ligada, com seed registrado na saída.
- [ ] Isolamento de banco compatível com o modelo de paralelismo (ver a tabela).
- [ ] Nenhuma porta fixa; nenhum `sleep` como sincronização.
- [ ] Nenhuma chamada de rede real fora dos testes marcados como de integração.
- [ ] Sem retry silencioso: retry é registrado ou o teste vai para quarentena.
- [ ] Fixture/setup de escopo amplo não muda estado compartilhado.
