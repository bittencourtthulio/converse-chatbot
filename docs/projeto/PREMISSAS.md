---
expx_schema: 1
expx_tool: buildx
kind: premissas
projeto_id: plataforma-chatbot-ia
atualizado_em: 2026-09-30
total: 34
por_origem:
  catalogo_lacunas: 27
  briefing: 0
  decisao_de_stack: 7
  f2_autonoma: 0
  recursao: 0
---

# Plataforma de chatbot com IA e base de conhecimento — Premissas

Toda decisão tomada em nome do humano, com o que a invalidaria.

**Como revisar este arquivo em cinco minutos:** leia apenas o campo
**O que invalida** de cada premissa. Se aquilo é verdade no seu caso, a premissa
precisa da sua atenção. Se não é, siga em frente.

As premissas PR-01 a PR-11 interpretam o pedido e estão marcadas `Provisória: true`:
entram no relatório final como o que o usuário precisa confirmar.

---

### PR-01 — Vários agentes por instalação

**Assunto:** interpretação do pedido
**Decisão:** o sistema gerencia vários agentes, cada um com instruções, modelo, base de conhecimento e canais próprios.
**Por quê:** "estilo SaaS padrão" para chatbot com base de conhecimento significa um painel de agentes; um agente único obrigaria reescrever o modelo de dados quando o segundo aparecesse.
**O que invalida:** se o uso for um único chatbot fixo, sem previsão de um segundo.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** true
**Realizada em:** FT-02

---

### PR-02 — Uma instalação, um workspace

**Assunto:** interpretação do pedido (modelo de negócio)
**Decisão:** cada instalação atende uma empresa; usuários são criados por um admin, sem cadastro público, planos ou cobrança.
**Por quê:** multi-conta com isolamento e cobrança é um sistema diferente; a descrição não pede venda de contas e o modo autônomo escolhe a leitura mais reversível para cima.
**O que invalida:** se o dono quiser vender contas a terceiros com dados isolados e cobrança.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** true
**Realizada em:** FT-01

---

### PR-03 — Nome provisório do produto

**Assunto:** interpretação do pedido
**Decisão:** o produto se chama "Converse" na interface, configurável por `APP_NAME`.
**Por quê:** a interface precisa de um nome e a descrição não traz um; o diretório do projeto cita uma marca de terceiro, que não deve aparecer na interface.
**O que invalida:** se o dono já tiver um nome e uma identidade de marca.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** true
**Realizada em:** FT-01

---

### PR-04 — Recuperação por busca textual

**Assunto:** interpretação do pedido (como o agente encontra trechos)
**Decisão:** a base é dividida em trechos e indexada por busca textual do SQLite (FTS5, ranking BM25, sem acento e sem caixa); sem embeddings vetoriais.
**Por quê:** funciona sem serviço nem chave adicional, dentro do banco que o projeto já tem; para uma base de dezenas de documentos a revocação é suficiente.
**O que invalida:** se a base passar de cerca de 100 mil trechos, ou se as perguntas usarem vocabulário muito diferente do dos documentos (busca por sentido).
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** true
**Realizada em:** FT-05

---

### PR-05 — Processamento em segundo plano no próprio servidor

**Assunto:** interpretação do pedido (volume)
**Decisão:** extração de texto, divisão em trechos e transcrição rodam em segundo plano no mesmo processo, com estado gravado no banco; sem fila externa. Uma fonte interrompida por reinício volta a `pendente` na subida.
**Por quê:** dependência mínima; a instalação é de uma empresa e um processo (PR-02, PR-24).
**O que invalida:** se rodar em mais de uma instância do servidor, ou se o volume simultâneo de uploads passar de algumas dezenas.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** true
**Realizada em:** FT-04

---

### PR-06 — OpenRouter como único provedor

**Assunto:** interpretação do pedido (P-02)
**Decisão:** uma chave do OpenRouter por workspace, configurada por um admin; cada agente escolhe seu modelo entre os que o OpenRouter lista. Sem outros provedores.
**Por quê:** o pedido nomeia o OpenRouter; chave por agente multiplicaria a superfície de segredo sem pedido.
**O que invalida:** se o dono quiser chave por agente, por cliente, ou outro provedor direto.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** true
**Realizada em:** FT-02

---

### PR-07 — Telegram por webhook, um bot por agente

**Assunto:** interpretação do pedido (P-03)
**Decisão:** cada agente pode ter um bot do Telegram, ligado pelo token do BotFather e atendido por webhook. Sem polling.
**Por quê:** webhook é o modelo suportado para servidor sem processo dedicado; um bot por agente mantém instruções e base separadas.
**O que invalida:** se o servidor não tiver URL pública HTTPS (então só por túnel), ou se um bot precisar alternar entre agentes.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** true
**Realizada em:** FT-07

---

### PR-08 — Chat embutido por script e iframe

**Assunto:** interpretação do pedido (P-04)
**Decisão:** um script de uma linha (`<script src=".../widget.js" data-agent="...">`) injeta um botão flutuante que abre o chat em um iframe da própria plataforma. Personalizável: cor, título, mensagem inicial, avatar e posição. Sem dependência do framework do site.
**Por quê:** o iframe isola o estilo e o código do site hospedeiro e é o que o pedido descreve ("colocar o script no meu projeto").
**O que invalida:** se o site hospedeiro proibir iframe (política própria de CSP) ou se o chat precisar ler o conteúdo da página.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** true
**Realizada em:** FT-06

---

### PR-09 — Vídeo entra como transcrição

**Assunto:** interpretação do pedido (P-07)
**Decisão:** vídeo (e áudio) enviado é convertido em áudio com ffmpeg e transcrito por um modelo com entrada de áudio do OpenRouter; link do YouTube entra pelas legendas do vídeo. O texto da fala vira fonte como as outras. Sem análise das imagens.
**Por quê:** é o que responde "subir vídeos para a base" sem serviço extra; a fala carrega o conteúdo informativo de aulas e apresentações.
**O que invalida:** se o conteúdo relevante estiver só nas imagens (tela, gráficos), ou se o servidor não puder ter ffmpeg instalado.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** true
**Realizada em:** FT-08

---

### PR-10 — Formatos e limites de arquivo

**Assunto:** interpretação do pedido (P-05)
**Decisão:** aceitos PDF com texto, DOCX, TXT, MD, CSV, HTML, JSON, SRT e VTT; até 25 MB por arquivo de documento e 500 MB por vídeo (`MAX_UPLOAD_MB` e `MAX_VIDEO_MB`); PDF escaneado sem texto é recusado com mensagem clara, sem OCR.
**Por quê:** cobre o conteúdo típico de base de conhecimento; limites protegem a memória do servidor.
**O que invalida:** se a base dependa de PDF escaneado ou de planilhas XLSX.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** true
**Realizada em:** FT-04

---

### PR-11 — Arquivos em disco local

**Assunto:** interpretação do pedido (onde guardar o que foi enviado)
**Decisão:** o arquivo original e o áudio extraído ficam em `storage/`, fora do versionador, e entram no backup.
**Por quê:** é o par do SQLite local (dependência mínima).
**O que invalida:** se o deploy for em plataforma sem disco persistente (função serverless), ou se o volume passar de algumas dezenas de GB.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** true
**Realizada em:** FT-04

---

### PR-12 — Papéis e acesso

**Assunto:** L2 — autorização
**Decisão:** `admin` gerencia usuários, chave do OpenRouter, privacidade e sistema; `usuario` cria agentes, alimenta a base, conecta canais e lê conversas. Verificação sempre no servidor.
**Por quê:** a chave do OpenRouter gera custo e a gestão de usuários muda quem entra; o resto é trabalho diário da equipe.
**O que invalida:** se houver equipes que não devam ver os agentes umas das outras.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** false
**Realizada em:** FT-01

---

### PR-13 — Validação de entrada e de upload

**Assunto:** L5 — injeção e entrada
**Decisão:** toda entrada é validada no servidor por esquema; upload confere extensão, tipo de conteúdo e tamanho; nome de arquivo nunca vira caminho; consulta sempre parametrizada.
**Por quê:** o sistema recebe arquivos e texto livre de anônimos; nome de arquivo e conteúdo são vetor de ataque.
**O que invalida:** nada verificável: é piso, não decisão de produto.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** false
**Realizada em:** FT-01

---

### PR-14 — Segredos criptografados

**Assunto:** L6 — segredo
**Decisão:** chave do OpenRouter e token do Telegram ficam criptografados em repouso (AES-256-GCM, chave em `ENCRYPTION_KEY`), aparecem mascarados na tela e nunca voltam ao navegador depois de gravados. `.env` fora do versionador.
**Por quê:** credencial de terceiros gera custo e permite se passar pelo bot; backup do banco não pode carregar segredo em claro.
**O que invalida:** se a instalação usar cofre de segredos gerenciado que substitua o campo no banco.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** false
**Realizada em:** FT-02

---

### PR-15 — Conteúdo recuperado é dado, não instrução

**Assunto:** L5 — entrada (injeção de prompt)
**Decisão:** trechos da base vão ao modelo delimitados e marcados como material de consulta; o prompt de sistema manda ignorar instruções contidas neles. Sem trecho relevante, o agente diz que não encontrou a resposta, em vez de inventar. Fontes usadas aparecem na resposta.
**Por quê:** a base vem de arquivos e vídeos de terceiros e pode conter texto que tenta comandar o modelo.
**O que invalida:** se a base for exclusivamente conteúdo escrito pela própria equipe e o agente puder responder de conhecimento geral.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** false
**Realizada em:** FT-05

---

### PR-16 — Limites de uso do endpoint público

**Assunto:** L8 — rate limit
**Decisão:** o chat embutido e o Telegram têm limite por IP (ou por chat) e por agente, teto diário de mensagens por agente configurável, tamanho máximo de mensagem e `max_tokens` por resposta. Rotas de login também têm limite.
**Por quê:** visitante anônimo aciona custo de IA que a empresa paga; sem limite, um script derruba o saldo.
**O que invalida:** se o chat só for exposto dentro de uma rede fechada.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** false
**Realizada em:** FT-06

---

### PR-17 — Domínios permitidos no embed

**Assunto:** L7 — transporte e origem
**Decisão:** cada agente pode listar os domínios em que o chat pode ser embutido; a página do iframe responde com `Content-Security-Policy: frame-ancestors` conforme a lista, e a API pública confere `Origin`. Lista vazia libera qualquer domínio.
**Por quê:** sem isso, qualquer site pode colocar o chat da empresa e gastar o saldo dela.
**O que invalida:** se a empresa quiser o chat aberto em qualquer site por decisão.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** false
**Realizada em:** FT-06

---

### PR-18 — Dado pessoal de visitantes (LGPD)

**Assunto:** L10, L11, L13 — dado pessoal, LGPD e retenção
**Decisão:** conversas guardam texto livre, identificador anônimo do visitante e, no Telegram, o nome público e o id do chat. Retenção de 90 dias por padrão (configurável por admin) com expurgo automático; apagar uma conversa apaga suas mensagens; admin exclui definitivamente um usuário da equipe. Aviso de privacidade configurável no chat.
**Por quê:** texto livre de anônimos contém dado pessoal por natureza; a base legal é o legítimo interesse de atendimento, a confirmar pela empresa.
**O que invalida:** se a empresa atender titulares de dados de saúde ou de crianças, ou se a base legal for outra.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** false
**Realizada em:** FT-10

---

### PR-19 — Auditoria de ações críticas

**Assunto:** L12 — auditoria
**Decisão:** registram-se quem fez o quê e quando em: troca de chave do OpenRouter, criação, desativação e mudança de papel de usuário, exclusão de agente, conexão e desconexão de canal, alteração de retenção e restauração de dados.
**Por quê:** essas ações mudam custo, acesso ou dado de terceiros, e sem trilha ninguém responde "quem mexeu".
**O que invalida:** se a instalação for de uma única pessoa.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** false
**Realizada em:** FT-10

---

### PR-20 — Backup com restauração testada

**Assunto:** L14 — backup
**Decisão:** comando de backup consistente do banco e do `storage/` em um único arquivo, comando de restauração, e um teste automatizado que restaura numa instalação limpa e confere os dados.
**Por quê:** a base de conhecimento é trabalho manual difícil de refazer, e backup nunca restaurado é hipótese.
**O que invalida:** se a hospedagem já fizer snapshot do volume com restauração testada.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** false
**Realizada em:** FT-11

---

### PR-21 — Operação: log, erro, saúde e configuração

**Assunto:** L16, L17, L18, L19, L20 — operação
**Decisão:** log estruturado em JSON sem dado pessoal nem segredo; erro devolve identificador de correlação sem rastro de pilha; `/api/saude` confere banco e disco; variável obrigatória ausente derruba o start, não a produção; métrica e rastreamento distribuído ficam de fora.
**Por quê:** falha de IA e de webhook acontece longe de quem opera; sem log e sem correlação a causa não se acha.
**O que invalida:** se a hospedagem exigir formato de log específico.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** false
**Realizada em:** FT-11

---

### PR-22 — Falha do provedor de IA

**Assunto:** L17 — erro (integração externa)
**Decisão:** chamada ao OpenRouter com timeout e resposta em streaming; erro do provedor (chave inválida, saldo, modelo indisponível, limite) vira mensagem clara ao operador no painel e mensagem genérica ao visitante, sem detalhe técnico.
**Por quê:** o provedor falha por motivos que só a empresa resolve (saldo, chave) e o visitante não deve ver isso.
**O que invalida:** se a empresa quiser fallback automático para outro modelo.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** false
**Realizada em:** FT-03

---

### PR-23 — Design SaaS padrão

**Assunto:** L26–L30, P-6 invalidado, P-7
**Decisão:** o usuário pediu "estilo SaaS padrão", o que invalida o design system do VS Code (P-6). A interface usa layout de SaaS (barra lateral com logotipo, cabeçalho, cartões, tabelas, botões de ação primária), sobre tokens semânticos em variáveis CSS, com tema claro e escuro, estados vazio, carregando e erro em toda tela, gaveta abaixo de 768px, alvos de toque de 44px, contraste 4,5:1 e foco visível. A skill `frontend-design`, disponível na sessão, conduz o acabamento dentro desse vocabulário.
**Por quê:** o pedido indica a identidade visual; os tokens semânticos do template permitem trocar aparência sem tocar em componente.
**O que invalida:** se o dono indicar um design system ou marca própria.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** false
**Realizada em:** FT-01

---

### PR-24 — Deploy por contêiner com volume persistente

**Assunto:** L21 — deploy
**Decisão:** entrega com `Dockerfile` e `docker-compose.yml` que sobem o sistema com ffmpeg incluso e volume persistente para o banco e `storage/`, atrás de HTTPS. Não roda em função serverless.
**Por quê:** SQLite em arquivo, disco local e processamento em segundo plano pedem um processo de longa duração; o script embutido e o webhook do Telegram exigem URL pública HTTPS.
**O que invalida:** se o dono quiser hospedar em plataforma serverless (Vercel), o que exigiria trocar banco e armazenamento.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** true
**Realizada em:** FT-11

---

### PR-25 — Demonstração

**Assunto:** P-5, L25 — semente de dados
**Decisão:** a seed cria contas de demonstração (do template) e um agente de exemplo com uma base fictícia curta, sem chave do OpenRouter; nunca roda em produção.
**Por quê:** sem conta e sem dado, o sistema é indistinguível de um quebrado; sem chave, o agente de exemplo mostra o aviso de configuração, não uma resposta inventada.
**O que invalida:** nada.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** false
**Realizada em:** FT-01

---

### PR-26 — Verificação, TDD e dependências

**Assunto:** L22, L23, L24, L9 — qualidade
**Decisão:** TDD do sprintx; testes nunca chamam a rede real (o OpenRouter e o Telegram são simulados por servidor local de teste); lint, tipos, build, testes e auditoria de dependências (falha em `high`) rodam em pipeline a cada mudança.
**Por quê:** teste que depende de provedor pago é lento, caro e instável.
**O que invalida:** nada.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** false
**Realizada em:** FT-01

---

### PR-27 — Autenticação e esqueleto de aplicação

**Assunto:** L1, L3, L4, L15, L32, L33, L34 e P-9
**Decisão:** e-mail e senha, sessão por JWT em cookie `httpOnly`, painel inicial, cadastro de usuários, perfil e troca de senha, migrations versionadas, tudo herdado do template do buildx.
**Por quê:** é a moldura de qualquer sistema com login (P-9).
**O que invalida:** se o dono quiser login por conta Google ou SSO.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** false
**Realizada em:** FT-01

---

### PR-28 — Três camadas

**Assunto:** P-1 — arquitetura
**Decisão:** apresentação (`src/app`, `src/componentes`), aplicação (`src/servicos`) e dados e infraestrutura (`src/lib`), com direção de dependência registrada no `CONVENCOES.md`.
**Por quê:** é o desenho que o sprintx recorta em tasks e que permite teste funcional sem interface.
**O que invalida:** se o dono pedir outra arquitetura.
**Origem:** decisao_de_stack
**Etapa:** b2
**Provisória:** false
**Realizada em:** FT-01

---

### PR-29 — Next.js com TypeScript

**Assunto:** P-2 — stack
**Decisão:** Next.js 16, App Router, React 19, TypeScript estrito, servido por processo Node de longa duração (`next start`).
**Por quê:** cobre as três camadas num projeto e num deploy; o template já traz e passa.
**O que invalida:** se o dono pedir outra linguagem ou framework.
**Origem:** decisao_de_stack
**Etapa:** b2
**Provisória:** false
**Realizada em:** FT-01

---

### PR-30 — SQLite, Prisma e FTS5

**Assunto:** P-3 — banco
**Decisão:** SQLite em arquivo com Prisma 7 e migrations versionadas; tabelas virtuais FTS5 criadas por SQL cru dentro de migrations; `db push` proibido depois da FT-02.
**Por quê:** dependência mínima para execução autônoma, e o FTS5 dá a busca textual do PR-04 sem serviço.
**O que invalida:** se a escrita concorrente de vários processos for necessária ou o volume passar do que o SQLite atende.
**Origem:** decisao_de_stack
**Etapa:** b2
**Provisória:** false
**Realizada em:** FT-05

---

### PR-31 — Autenticação própria

**Assunto:** P-4 — autenticação
**Decisão:** e-mail e senha com bcrypt, sessão JWT em cookie `httpOnly`, invalidação de sessões na troca de senha.
**Por quê:** sem provedor externo nem credencial que o buildx não tem.
**O que invalida:** se o dono pedir SSO ou login social.
**Origem:** decisao_de_stack
**Etapa:** b2
**Provisória:** false
**Realizada em:** FT-01

---

### PR-32 — Suíte Expx instalada

**Assunto:** P-8 — suíte Expx
**Decisão:** o projeto já tinha a suíte Expx instalada e o lock íntegro (`.expx/expx-lock.json`, `.claude/`, `.opencode/`); foi versionada no primeiro commit, sem reinstalar.
**Por quê:** o B4 invoca sprintx e mergex feature a feature, e o memox só vale desde o primeiro commit.
**O que invalida:** nada.
**Origem:** decisao_de_stack
**Etapa:** b2
**Provisória:** false
**Realizada em:** FT-01

---

### PR-33 — Template do buildx com dependências corrigidas

**Assunto:** P-10 — esqueleto vindo de template
**Decisão:** o esqueleto foi copiado do template; a auditoria do B2 achou 3 vulnerabilidades `high` transitivas (`mysql2`, `fast-uri`, `brace-expansion`) que não existiam quando o template foi versionado, e o projeto as corrigiu com `overrides` e `npm audit fix`.
**Por quê:** a auditoria é portão, não aviso (P-10). O defeito é do template da skill e deve ser corrigido lá; esta premissa registra o desvio.
**O que invalida:** se o template da skill for atualizado com as mesmas correções.
**Origem:** decisao_de_stack
**Etapa:** b2
**Provisória:** false
**Realizada em:** FT-01

---

### PR-34 — Skill frontend-design

**Assunto:** P-7 — design conduzido por skill
**Decisão:** a skill `frontend-design` já estava disponível na sessão; foi usada onde disponível, sem instalar nada no projeto.
**Por quê:** a competência de design mora numa skill própria; instalar seria desnecessário.
**O que invalida:** se a skill não estiver disponível em quem continuar o projeto; então vale o `PR-23` aplicado à mão.
**Origem:** decisao_de_stack
**Etapa:** b2
**Provisória:** false
**Realizada em:** FT-01

---

<!--
REGRAS DESTE ARQUIVO

1. Premissa é o que o BUILDX decidiu. O que o usuário pediu vai no PROJETO.md.
2. O campo "o que invalida" nunca fica genérico.
3. Premissa "provisória: true" entra no relatório final, na seção do que o usuário precisa decidir.
4. "Realizada em" é conferido pelo B6.
5. Premissa de segurança sem código nunca sai como pendência aceita.
-->
