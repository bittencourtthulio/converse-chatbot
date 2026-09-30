# Decisões tomadas na construção da skill

Ambiguidades encontradas durante a construção do stackx. Em cada uma foi
escolhida a opção mais conservadora, conforme instruído.

---

### D-01 — Onde o CONVENCOES.md é gravado
**Ambiguidade:** os prompts citam `docs/stack/CONVENCOES.md` sem dizer se o
caminho é configurável.
**Decisão:** caminho fixo `docs/stack/CONVENCOES.md`, com `docs/stack/LACUNAS.md`
ao lado.
**Por quê:** caminho fixo é o que permite às skills irmãs detectarem o arquivo
com um `test -f`. Caminho configurável exigiria um arquivo de configuração
próprio — mais superfície, sem ganho.

### D-02 — Numeração das seções do CONVENCOES.md
**Ambiguidade:** o prompt lista seis blocos obrigatórios sem numerá-los.
**Decisão:** numerados de §1 a §6, na ordem do prompt, e as referências cruzadas
(commands, integrações, exemplos) citam por número.
**Por quê:** "§4 isolamento de banco" é referência estável; "a seção de banco"
não é. Sem número, cada skill irmã inventaria seu próprio apelido.

### D-03 — Frontmatter dos documentos gerados
**Ambiguidade:** `expx-schema v1` é citado como contrato do ecossistema, sem
especificação dos campos.
**Decisão:** frontmatter mínimo — `expx-schema: v1`, `skill`, `documento`,
`gerado-em`, `commit-referencia`, `projeto-legado`.
**Por quê:** o mínimo que sustenta as Etapas 4 e 5 (saber contra qual versão
verificar e desde quando). Inventar campos além disso arriscaria conflitar com o
schema real das outras skills.

### D-04 — Ordem entre a Etapa 3 e a Etapa 2
**Ambiguidade:** as etapas são numeradas 1→5, mas o conflito (3) precisa ser
resolvido antes de escrever o arquivo (2).
**Decisão:** o fluxo do `/stackx-detectar` é 1 → 3 (conflitos) → 2 (escrita). A
numeração das etapas foi preservada como está no prompt.
**Por quê:** perguntar depois de escrever obrigaria a reescrever o arquivo. A
numeração é conceitual, não cronológica — renumerar quebraria a correspondência
com o prompt e com os nomes dos references.

### D-05 — Conflito não respondido
**Ambiguidade:** o prompt manda perguntar, mas não diz o que fazer se o usuário
não responder.
**Decisão:** o CONVENCOES.md é gravado com o bloco literal
`> **CONFLITO EM ABERTO**`, e o ponto entra em LACUNAS. A orientação para o
código novo é seguir o arquivo vizinho e registrar a escolha na task.
**Por quê:** é a opção que não decide nada. Adiar a geração inteira do arquivo
por um conflito pendente desperdiçaria todo o resto da detecção; escolher um
dialeto violaria a regra 4.

### D-06 — Peso de CONFLITO EM ABERTO na verificação de aderência
**Ambiguidade:** o prompt define o tratamento de PROPOSTA (`AVISO`, nunca
violação) mas não o de conflito em aberto.
**Decisão:** tratado como PROPOSTA — no máximo `AVISO`.
**Por quê:** é o conservador. Um ponto sem decisão não pode reprovar uma task,
sob pena de a skill punir o usuário por uma pergunta que ela mesma não teve
resposta.

### D-07 — Escala de severidade da Etapa 4
**Ambiguidade:** o prompt exige a coluna "severidade" sem definir os níveis.
**Decisão:** cinco níveis — `CRÍTICO`, `ALTO`, `MÉDIO`, `AVISO`, `INFO` — com
regra explícita de qual fecha a task.
**Por quê:** três níveis não separavam "quebra a suíte" de "viola convenção", nem
davam lugar ao `INFO` que o contexto legado exige. `AVISO` foi criado
especificamente para ser o teto da PROPOSTA, tornando a regra 3 mecânica em vez
de interpretativa.

### D-08 — Arquivo novo dentro de área tocada em projeto legado
**Ambiguidade:** a regra diz que o stackx governa "código novo em arquivo novo",
mas não resolve o arquivo novo criado **dentro** de uma área tocada.
**Decisão:** segue o dialeto local do PERFIL.md, não o CONVENCOES.md.
**Por quê:** é a leitura conservadora da precedência. Um teste novo em formato
diferente dos 40 vizinhos é ruído, e a alternativa criaria um terceiro dialeto
dentro do módulo — o oposto do propósito da skill.

### D-09 — Execução de comandos durante a detecção
**Ambiguidade:** a Etapa 1 manda encontrar "comandos que funcionam de verdade",
o que sugere verificação por execução.
**Decisão:** proibida a execução de migração, seed, build de produção, deploy e
qualquer script que escreva em banco. Permitidos apenas os baratos e
não-destrutivos (type check, lint `--check`), e mesmo assim opcionais.
**Por quê:** "funciona de verdade" está satisfeito pela evidência em manifesto,
Makefile ou CI. Uma skill de leitura que roda migração no repositório do usuário
é risco desproporcional ao ganho.

### D-10 — Precedência entre manifesto, arquivo de versão e CI
**Ambiguidade:** três fontes podem declarar a versão da linguagem, com valores
diferentes.
**Decisão:** `.nvmrc`/`.python-version`/`.tool-versions` vencem o manifesto; o CI
vence para "comando que funciona". A divergência em si é registrada como achado.
**Por quê:** vence o que a máquina realmente executa. E a divergência é
informação útil, não ruído a suprimir.

### D-11 — Versão exata × faixa do manifesto
**Ambiguidade:** o prompt exige versão "lida de manifesto", mas manifesto costuma
trazer faixa.
**Decisão:** registrar a versão resolvida no lock, com a faixa entre parênteses —
`15.7.1 (faixa ^15.2)`.
**Por quê:** os cartuchos são inúteis sem versão exata: várias travas descritas
neles existem numa versão e não na seguinte.

### D-12 — Monorepo com stacks diferentes por pacote
**Ambiguidade:** não coberto pelos prompts.
**Decisão:** não é conflito. Gera seções de identidade/comandos/testes **por
pacote**, e não pergunta.
**Por quê:** perguntar "qual adotar" entre dois pacotes que legitimamente usam
stacks diferentes seria uma pergunta sem resposta correta.

### D-13 — Cartuchos: quais engines, ORMs e runners cobrir
**Ambiguidade:** o prompt diz "por engine em uso no projeto", mas a skill é
genérica e não conhece o projeto de antemão.
**Decisão:** cobertos PostgreSQL, MySQL/MariaDB, SQLite e SQL Server; Prisma,
TypeORM, Sequelize, Django ORM, SQLAlchemy, Active Record e Eloquent, mais
GraphQL; Jest, Vitest, pytest, RSpec, Go, JUnit e runners de navegador. Cada
cartucho abre com uma seção transversal (mecanismo geral) e instrui a ler **só**
a seção em uso.
**Por quê:** a seção transversal é o que sustenta o caso não coberto — ela ensina
o mecanismo, não a lista. Cada arquivo ficou abaixo de 300 linhas, o que mantém a
leitura parcial viável.

### D-14 — Ano no LICENSE e titular do copyright
**Ambiguidade:** nenhum dos prompts informa titular.
**Decisão:** `Copyright (c) 2026 stackx`, licença MIT (declarada no README).
**Por quê:** conservador e sem afirmar autoria de pessoa ou empresa. Basta editar
a linha para atribuir.

### D-15 — Nomes fictícios nos exemplos
**Ambiguidade:** os exemplos precisam de um projeto plausível e de autores de
decisão.
**Decisão:** projeto `pedidos-api` (Node/Fastify/Prisma/PostgreSQL), decisões
assinadas por `ana`. Nenhum host, domínio, credencial ou valor de variável de
ambiente aparece — nem em `.env.example`, do qual só se leem chaves.
**Por quê:** regra 10. Um exemplo com valor de segredo, ainda que fictício,
ensina o formato errado.

### D-16 — Duas colunas de formatador nos comandos
**Ambiguidade:** o prompt pede "formatador" como um alvo só.
**Decisão:** duas linhas — verificar (`--check`) e aplicar.
**Por quê:** a auditoria precisa da forma que verifica sem escrever; a execução
precisa da que aplica. Uma linha só levaria uma das duas fases a inventar a
outra, contrariando a regra 5.

### D-17 — Idioma
**Ambiguidade:** o prompt exige o README em português e é silencioso sobre o
resto.
**Decisão:** tudo em português — skill, references, cartuchos, templates,
comandos e exemplos.
**Por quê:** consistência com o ecossistema (sprintx, runx, legadox) e com os
próprios prompts. Os marcadores literais (`PROPOSTA`, `CONFLITO EM ABERTO`,
`CRÍTICO`) ficam em português e são citados de forma idêntica em todos os
arquivos, para que grep funcione.

### D-18 — Repositório sem `.git`
**Ambiguidade:** a Etapa 3 depende do histórico para datar dialetos.
**Decisão:** a detecção prossegue; conflitos ficam "sem datação" e a pergunta vai
sem sugestão de ordem. A limitação é registrada no CONVENCOES.md.
**Por quê:** a falta de histórico degrada a qualidade da pergunta, mas não
justifica adotar o majoritário — que é justamente o erro que a datação evita.
