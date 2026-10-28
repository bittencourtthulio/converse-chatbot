# Camada 1 — PERFIL DO PROJETO

Você está gerando ou atualizando `docs/legado/PERFIL.md`, o mapa que o projeto nunca teve. Este arquivo é o **gatilho do modo legado**: enquanto ele não existir, nada do legadox se aplica.

Roda uma vez, no início da adoção, e é atualizado sob demanda — quando o projeto ganha um módulo novo, quando uma zona de risco é descoberta, ou quando os limiares do raio se mostram mal calibrados.

## Delegue ao agente `cartografo`

Quando o agente `cartografo` estiver disponível, **delegue esta camada a ele** e siga com o resultado. Ele existe exatamente para isto.

O motivo é de contexto, não de capacidade: montar o PERFIL é leitura pesada — manifestos, migrações, grafo de chamadas, histórico do versionador. Feito no contexto principal, esse volume consome justamente o contexto que depois vai planejar o trabalho. O `cartografo` roda em contexto próprio e devolve só o resultado.

O roteiro abaixo é o que ele segue, e continua valendo integralmente quando não houver agente disponível.

## Pré-requisitos verificáveis

- Você tem o repositório em disco e consegue ler os manifestos de dependência.
- Você consegue rodar comandos de leitura no repositório (busca, histórico do versionador).

Se `docs/legado/PERFIL.md` já existir, você está em **atualização**, não em criação: leia o arquivo atual, preserve tudo que continua verdadeiro, e altere apenas as seções afetadas. Nunca regere o arquivo do zero por conveniência — os limiares e as zonas podem ter sido editados pelo time, e essa edição é decisão humana registrada.

## Regra dura deste reference

**Nada de invenção.** Toda afirmação do PERFIL vem de um arquivo lido ou de um comando executado. O que não for verificável no código vira a string literal `NÃO DETERMINADO` no PERFIL e ganha uma linha em `docs/legado/LACUNAS.md` dizendo o que falta e o que resolveria.

Um PERFIL com dez afirmações verificadas e cinco `NÃO DETERMINADO` é um bom PERFIL. Um PERFIL com quinze afirmações plausíveis e nenhuma lacuna é um documento perigoso, porque o raio de impacto vai ser calculado em cima dele.

---

## Passo 0 — Scaffold

Crie, se ainda não existirem:

```
docs/legado/
  PERFIL.md      de assets/TEMPLATE-PERFIL.md
  LACUNAS.md     de assets/TEMPLATE-LACUNAS.md
  DIVIDA.md      de assets/TEMPLATE-DIVIDA.md, nascendo vazio
  raio/          pasta vazia
  manual/        pasta vazia
  comparacao/    pasta vazia
```

Obtenha a data com `date +%Y-%m-%d` do sistema, nunca de memória.

---

## Passo 1 — Stack e versões reais

Leia dos manifestos, não presuma pela extensão dos arquivos.

Onde procurar, conforme o ecossistema encontrado:

```
package.json          Node — dependencies, devDependencies, engines, scripts
composer.json         PHP
*.csproj, *.sln       .NET — TargetFramework
pom.xml, build.gradle Java
requirements.txt, pyproject.toml, Pipfile   Python
Gemfile               Ruby
go.mod                Go
```

Registre também o que **trava** a versão: `.nvmrc`, `.tool-versions`, `runtime.txt`, `Dockerfile`, `docker-compose.yml`, e a imagem base usada em cada um.

Para cada item registre: nome, **versão exata declarada**, e o arquivo onde você leu. Se o manifesto declara faixa (`^4.2.0`) e existe lockfile, prefira a versão **resolvida** no lockfile e diga de qual arquivo veio.

Se um framework central não tiver versão determinável, isso é `NÃO DETERMINADO` e vai para `LACUNAS.md` — não escreva "provavelmente a 4".

---

## Passo 2 — Pontos de entrada

Tudo por onde o sistema é acionado de fora. Estes são os limites do mapa e é deles que a Camada 2 vai subir a cadeia de chamadores.

Categorias a cobrir, cada uma com o caminho do arquivo onde vive:

- **Rotas HTTP** — arquivo de rotas, controllers, anotações/decorators de rota.
- **Comandos de CLI** — comandos de console, scripts de manutenção, tarefas administrativas.
- **Jobs e crons** — agendadores, `crontab`, tabela de agendamento, jobs recorrentes.
- **Filas e workers** — consumidores de fila, handlers de mensagem, tópicos assinados.
- **Webhooks** — endpoints que recebem chamada de terceiro.
- **Integrações de saída** — para onde o sistema chama: gateway de pagamento, prefeitura, banco, ERP externo.

Como achar, sem depender de conhecer o framework:

```
grep -rn -E "route|Route|@Get|@Post|app\.(get|post|put|delete)" --include=* .
grep -rn -E "cron|schedule|Schedule|@Scheduled" .
grep -rn -E "queue|Queue|consumer|listen|subscribe" .
grep -rn -E "webhook|callback" .
```

Ajuste os padrões ao que a stack do Passo 1 revelou. Registre cada ponto de entrada com **caminho relativo do arquivo**, não só o nome da rota.

---

## Passo 3 — Camadas que de fato existem

Não escreva a arquitetura que o projeto deveria ter. Escreva a que ele tem.

Percorra a árvore de diretórios e nomeie as camadas **pelo que você encontrou**, com a pasta de cada uma. Exemplo de forma (não de conteúdo): se existe `app/Services/` com regra de negócio e também regra de negócio dentro de `app/Http/Controllers/`, o PERFIL diz as duas coisas — que existe uma camada de serviço e que ela não é respeitada em toda parte.

Para cada camada registre: nome, pasta, o que ela contém de fato, e se é seguida consistentemente ou não.

---

## Passo 4 — Comandos reais

Os comandos que o time roda, lidos de onde eles estão declarados: `scripts` do `package.json`, `Makefile`, `composer.json`, `Taskfile`, README, pipeline de CI.

Registre, cada um com a fonte:

| Comando | Onde ler |
|---|---|
| build | scripts do manifesto, Makefile, pipeline |
| teste | scripts do manifesto, config do runner de teste |
| teste de um arquivo só | documentação do runner encontrado |
| lint | scripts do manifesto, config do linter |
| execução local | README, docker-compose, scripts |
| migração de banco | scripts do manifesto, ferramenta de migração encontrada |

O comando de **teste de um arquivo só** é o mais importante para o resto do método: a Camada 3 vai rodar teste de caracterização isolado dezenas de vezes. Se não existir forma de rodar um teste isolado, isso é uma lacuna grave e precisa estar em `LACUNAS.md`.

Se o pipeline de CI existir, ele é a fonte mais confiável: é o comando que comprovadamente roda.

---

## Passo 5 — Cobertura de teste verdadeira

Cobertura **medida**, não alegada. Um `README` dizendo "temos boa cobertura" não é evidência.

1. Descubra o runner de teste pelo manifesto e pelos arquivos de configuração.
2. Rode a suíte com relatório de cobertura, se a ferramenta permitir.
3. Registre o número global **e**, principalmente, a cobertura por pasta — é a granularidade que o raio usa.

Se a suíte não roda (quebrada, dependência de ambiente, sem banco de teste), **registre isso como o achado que é**: "suíte não executável neste ambiente — motivo". Uma suíte que não roda é, para efeito de raio, cobertura ausente em toda parte, e isso empurra praticamente todo trabalho para MEDIO. Está correto que empurre.

Se não houver ferramenta de cobertura, faça a medida grosseira e diga que é grosseira: conte arquivos de teste por pasta contra arquivos de código por pasta, e registre o método usado.

---

## Passo 6 — Padrões conflitantes

**Seção obrigatória. Não pode ser resumida a "o projeto usa X".**

Em legado não existe "o padrão", existem vários, depositados em camadas por equipes diferentes ao longo dos anos. Quem mexe precisa saber qual dialeto vale **naquela pasta**, porque seguir o padrão global e errado é como se introduz inconsistência nova.

Para cada eixo abaixo, procure mais de uma forma no repositório e registre todas as que achar:

- acesso a dados: ORM, query builder, SQL cru, procedure
- tratamento de erro: exceção, código de retorno, retorno nulo silencioso
- validação: no controller, no serviço, no model, no banco
- injeção de dependência: container, instanciação direta, singleton estático, global
- data e hora: tipo usado, fuso, formato de persistência
- dinheiro: tipo usado — decimal, inteiro em centavos, float
- nomenclatura e idioma: nomes em português, em inglês, ou misturados
- estilo de teste: framework, forma de montar dado, uso de dublê

Registre cada dialeto no formato:

```
Eixo | Dialeto encontrado | Onde vive (pastas) | Segue este ao mexer ali
```

A última coluna é a que o agente vai obedecer. Quando duas formas convivem na mesma pasta, escolha a **mais recente por histórico do versionador** e diga que foi esse o critério.

O eixo **dinheiro** merece atenção especial em qualquer sistema com módulo financeiro ou fiscal: `float` para dinheiro é fonte clássica de divergência de centavo e precisa estar registrado, não corrigido (Camada 6).

---

## Passo 7 — Zonas de risco

Áreas onde errar não é bug, é processo: gera obrigação legal, prejuízo financeiro, ou trabalho manual para o time do cliente.

Procure ativamente por, no mínimo:

- financeiro: contas a pagar e receber, conciliação, fechamento
- fiscal: nota fiscal, imposto, apuração, obrigação acessória, SPED
- folha de pagamento e ponto
- autenticação, autorização e permissão
- integração bancária, boleto, PIX, gateway de pagamento
- dado histórico imutável: log de auditoria, movimentação já fechada, competência encerrada
- cálculo com efeito contratual: preço, comissão, multa, juros, reajuste
- LGPD e dado pessoal

Como procurar: grep pelos termos de negócio no idioma do projeto (nome de tabela, de service, de rota), e confira as pastas que os pontos de entrada do Passo 2 alcançam.

Cada zona encontrada declara, obrigatoriamente:

```
Zona: <nome>
Pastas e arquivos que a compõem: <lista de caminhos relativos>
Quem valida uma mudança aqui: <papel ou pessoa; NÃO DETERMINADO se não souber>
Perguntas obrigatórias adicionais: <as específicas desta zona, além das seis mínimas da Camada 11>
```

Se você não souber quem valida, escreva `NÃO DETERMINADO` e coloque em `LACUNAS.md`. Não invente um papel. Essa lacuna, especificamente, é a que o time precisa fechar primeiro, porque sem ela a Camada 11 não tem a quem endereçar.

---

## Passo 8 — Áreas suspeitas de código morto

Suspeita, não sentença. Sinais que levantam suspeita:

- arquivo sem alteração há muito tempo no histórico do versionador
- nenhuma referência ao símbolo em todo o repositório fora do próprio arquivo e dos testes
- rota comentada, recurso atrás de flag desligada há anos
- pasta com nome de sistema ou cliente que não existe mais

```
git log -1 --format=%ad -- <caminho>       última alteração do arquivo
git log --format=%ad -- <caminho> | wc -l  quantas alterações na vida
```

Registre como **suspeita**, com o sinal que a levantou. Confirmar de fato é trabalho da Camada 10, e mesmo confirmado **não autoriza remoção**: vira achado em `DIVIDA.md` (regra inviolável 10).

---

## Passo 9 — Limiares do raio de impacto

Copie os valores padrão da Camada 2 para dentro do PERFIL, na seção própria. A partir daí eles são **editáveis pelo time**, e o valor que vale é o do PERFIL, não o do SKILL.md.

Padrão a copiar:

```
BAIXO  até 3 chamadores, nenhuma zona de risco, sem migração, área com cobertura
MEDIO  4 a 15 chamadores, ou cobertura ausente, ou consumo por job ou relatório
ALTO   acima de 15 chamadores, ou zona de risco, ou migração, ou dado histórico

Orçamento por task:
BAIXO  até 5 arquivos, até 150 linhas
MEDIO  até 3 arquivos, até 80 linhas
ALTO   até 2 arquivos, até 40 linhas
```

Se o time editar, o PERFIL registra **quem editou e por quê**, em uma linha. Limiar alterado sem motivo registrado é como o rigor evapora silenciosamente ao longo de meses.

---

## Formato exato da saída

`docs/legado/PERFIL.md`, preenchido de `assets/TEMPLATE-PERFIL.md`, com todas as seções na ordem do template. Nenhuma seção é apagada por estar vazia: seção sem conteúdo recebe `NÃO DETERMINADO` ou `Nenhum encontrado`, que são afirmações diferentes e você deve escolher a correta.

`docs/legado/LACUNAS.md`, preenchido de `assets/TEMPLATE-LACUNAS.md`, com uma linha por lacuna: o que falta, por que não foi possível determinar, e o que resolveria.

## Critério de saída

- [ ] `docs/legado/PERFIL.md` existe e nenhuma das nove seções está ausente.
- [ ] Toda versão declarada cita o arquivo de onde foi lida.
- [ ] Todo ponto de entrada cita caminho relativo de arquivo.
- [ ] A seção de padrões conflitantes tem pelo menos uma linha por eixo investigado, e a coluna "segue este ao mexer ali" está preenchida em todas.
- [ ] Toda zona de risco declara pastas, validador e perguntas adicionais.
- [ ] A cobertura registrada é medida, ou está explicitamente marcada como estimativa grosseira com o método declarado.
- [ ] Os limiares do raio estão dentro do PERFIL.
- [ ] Nenhum caminho absoluto no arquivo.
- [ ] Todo `NÃO DETERMINADO` do PERFIL tem linha correspondente em `LACUNAS.md`.

## Quando o critério não é atendido

**A suíte não roda.** Não é bloqueio do PERFIL. Registre a suíte como não executável, com o motivo, e trate cobertura como ausente. Abra lacuna.

**Não há histórico de versionador** (repositório sem `.git`, ou importado sem histórico). Churn e idade viram `NÃO DETERMINADO`. Na Camada 2 esses sinais contarão como **pior caso** — é o comportamento correto e não deve ser contornado.

**Não é possível determinar quem valida uma zona de risco.** O PERFIL fica pronto assim mesmo, com `NÃO DETERMINADO`. Mas registre em `LACUNAS.md` com prioridade alta: o primeiro trabalho que tocar essa zona vai precisar dessa resposta antes de planejar, e é melhor descobrir agora do que no meio de um trabalho ALTO.

**O projeto é grande demais para mapear inteiro.** Mapeie por região e diga qual região está mapeada. Um PERFIL que cobre honestamente o módulo fiscal e declara o resto como não mapeado é útil; um PERFIL que finge cobrir tudo é pior do que nenhum. A área não mapeada entra em `LACUNAS.md`, e trabalho que a toque começa por mapeá-la.
