---
expx_schema: 1
expx_tool: buildx
kind: premissas
projeto_id: plataforma-chatbot-ia
atualizado_em: 2026-10-01
total: 114
por_origem:
  catalogo_lacunas: 29
  briefing: 0
  decisao_de_stack: 7
  f2_autonoma: 66
  recursao: 12
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
**Realizada em:** FT-04, FT-08

---

### PR-11 — Arquivos em disco local

**Assunto:** interpretação do pedido (onde guardar o que foi enviado)
**Decisão:** o arquivo original e o áudio extraído ficam em `storage/`, fora do versionador, e entram no backup.
**Por quê:** é o par do SQLite local (dependência mínima).
**O que invalida:** se o deploy for em plataforma sem disco persistente (função serverless), ou se o volume passar de algumas dezenas de GB.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** true
**Realizada em:** FT-04, FT-08

---

### PR-12 — Papéis e acesso

**Assunto:** L2 — autorização
**Decisão:** `admin` gerencia usuários, chave do OpenRouter, privacidade e sistema; `usuario` cria agentes, alimenta a base, conecta canais e lê conversas. Verificação sempre no servidor.
**Por quê:** a chave do OpenRouter gera custo e a gestão de usuários muda quem entra; o resto é trabalho diário da equipe.
**O que invalida:** se houver equipes que não devam ver os agentes umas das outras.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** false
**Realizada em:** FT-01, FT-12

---

### PR-13 — Validação de entrada e de upload

**Assunto:** L5 — injeção e entrada
**Decisão:** toda entrada é validada no servidor por esquema; upload confere extensão, tipo de conteúdo e tamanho; nome de arquivo nunca vira caminho; consulta sempre parametrizada.
**Por quê:** o sistema recebe arquivos e texto livre de anônimos; nome de arquivo e conteúdo são vetor de ataque.
**O que invalida:** nada verificável: é piso, não decisão de produto.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** false
**Realizada em:** FT-01, FT-04

---

### PR-14 — Segredos criptografados

**Assunto:** L6 — segredo
**Decisão:** chave do OpenRouter e token do Telegram ficam criptografados em repouso (AES-256-GCM, chave em `ENCRYPTION_KEY`), aparecem mascarados na tela e nunca voltam ao navegador depois de gravados. `.env` fora do versionador.
**Por quê:** credencial de terceiros gera custo e permite se passar pelo bot; backup do banco não pode carregar segredo em claro.
**O que invalida:** se a instalação usar cofre de segredos gerenciado que substitua o campo no banco.
**Origem:** catalogo_lacunas
**Etapa:** b1
**Provisória:** false
**Realizada em:** FT-02, FT-07

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
**Realizada em:** FT-06, FT-07, FT-12

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
**Realizada em:** FT-09 (apagar conversa), FT-10 (retenção, exclusão de usuário e aviso)

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
**Realizada em:** FT-01, FT-04, FT-06, FT-09

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
**Realizada em:** FT-01, FT-09, FT-12

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
**Realizada em:** FT-01, FT-12

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

### PR-35 — Densidade padrão das features

**Assunto:** F2 da FT-01 — densidade do planejamento
**Decisão:** toda feature é planejada com densidade `padrao` e forma de construção `autonomo` (os sete eixos da F2 cobertos, sem ir atrás de caso extremo que ninguém mencionou).
**Por quê:** nenhum artefato do projeto fixa a densidade; `padrao` é a cobertura normal, e o projeto já está em modo autônomo total (`docs/projeto/PROJETO.md`, "Modo escolhido").
**O que invalida:** se o dono pedir cobertura mínima (`mvp`) ou aprofundada (`profundo`) em alguma feature.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-01

---

### PR-36 — Limites de tentativa de login e endereço do cliente

**Assunto:** F2 da FT-01 — PR-16, parte do login
**Decisão:** o login aceita 5 tentativas por minuto por combinação IP mais e-mail e 20 por minuto por IP, contando toda tentativa (certa ou errada), em memória do processo, com janela deslizante; passado o limite, a tela mostra "Muitas tentativas. Tente de novo em N segundos." O IP vem do primeiro valor de `X-Forwarded-For` só quando `TRUST_PROXY=1`; sem isso é o valor fixo `desconhecido`.
**Por quê:** o PR-16 manda limitar o login sem dar números; estes são valores usuais para tela de equipe pequena. Confiar em `X-Forwarded-For` sem proxy permite forjar o IP e fugir do limite; com proxy e sem confiar, todos dividiriam um IP só.
**O que invalida:** se rodar em mais de um processo (o limite deixa de ser global, ver PR-05) ou se a equipe legítima passar de 20 tentativas por minuto atrás de um mesmo IP.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-01, FT-12

---

### PR-37 — Cabeçalhos de segurança sem política de conteúdo

**Assunto:** F2 da FT-01 — L7 transporte e origem
**Decisão:** toda resposta leva `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY` e `Permissions-Policy` negando câmera, microfone, geolocalização, pagamento e USB. A `Content-Security-Policy` fica para a FT-06, junto do `frame-ancestors` (PR-17), que também sobrescreve o `X-Frame-Options` na rota do chat.
**Por quê:** os quatro cabeçalhos não quebram nada hoje; uma CSP escrita antes das telas existirem tende a ser frouxa ou a quebrar o Next.
**O que invalida:** se a instalação exigir CSP desde já.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-01

---

### PR-38 — Parâmetros do adaptador do OpenRouter

**Assunto:** F2 da FT-02 — PR-06 e PR-22, números que a premissa não dá
**Decisão:** o adaptador (`src/lib/openrouter.ts`) lê `OPENROUTER_BASE_URL` (padrão `https://openrouter.ai/api/v1`) e `APP_URL` (padrão `http://localhost:3000`, enviada em `HTTP-Referer`); `X-Title` leva o nome do produto (`APP_NAME`). Chamadas curtas (lista de modelos, verificação de chave) têm timeout de 15 s; a conversa em stream tem 30 s até o primeiro byte e 120 s no total, e o chamador pode cancelar por `AbortSignal`. A lista de modelos fica em cache em memória por 5 minutos; se a chamada falha, devolve uma lista de reserva embutida (poucos modelos comuns) com a marca `reserva: true`, para o seletor não quebrar. O modelo padrão de um agente novo é `openai/gpt-4o-mini`. Erro do provedor vira `ErroDeAplicacao` em português (401 chave inválida, 402 saldo, 400/404 modelo, 429 limite, 5xx indisponível, tempo esgotado) sem repassar o corpo do provedor.
**Por quê:** o PR-22 manda timeout e mensagem clara sem dar números; a lista de modelos é grande e pública, então cache curto evita chamada a cada abertura de tela, e a reserva mantém o cadastro de agente possível com o provedor fora do ar.
**O que invalida:** se o provedor exigir prazos maiores para modelos de raciocínio lento (primeiro byte acima de 30 s), ou se a empresa quiser fixar o modelo padrão em outro.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-02

---

### PR-39 — Formato do segredo cifrado e da máscara

**Assunto:** F2 da FT-02 — PR-14
**Decisão:** o segredo é gravado como texto `v1:<iv>:<etiqueta>:<cifrado>` (base64url), AES-256-GCM, IV aleatório de 12 bytes por gravação; `ENCRYPTION_KEY` são 32 bytes em hexadecimal (64 caracteres) ou base64, validada só quando um segredo é gravado ou lido (ausente ou inválida lança erro claro; o resto do sistema segue de pé). A tela mostra só a máscara: os 6 primeiros caracteres, reticências e os 4 últimos (`sk-or-…a1b2`), calculada na gravação a partir da chave em claro e nunca da chave cifrada devolvida ao navegador; a máscara não fica no banco (é recalculada ao decifrar no servidor). Trocar `ENCRYPTION_KEY` invalida os segredos já gravados: a tela mostra "não foi possível ler a chave gravada, cadastre de novo".
**Por quê:** versão no prefixo permite trocar de algoritmo depois sem quebrar os dados; máscara com prefixo e final ajuda o admin a reconhecer qual chave está cadastrada sem revelá-la.
**O que invalida:** se a instalação usar cofre de segredos gerenciado (PR-14) ou precisar rotacionar `ENCRYPTION_KEY` sem recadastrar segredos (aí entra reencriptação em lote e chave versionada).
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-02

---

### PR-40 — Limites do cadastro de agente

**Assunto:** F2 da FT-02 — PR-01 e PR-12, campos do agente
**Decisão:** nome de 1 a 80 caracteres, instruções até 8000, mensagem inicial até 500 (vazia permitida), temperatura de 0 a 2 com padrão 0,7, modelo obrigatório (texto, até 200 caracteres). Qualquer usuário autenticado e ativo lista, cria, edita e exclui qualquer agente da instalação; a exclusão é definitiva, com confirmação na tela. Não há versionamento de instruções nem cota de agentes.
**Por quê:** os números vêm do briefing da feature; a exclusão definitiva é a leitura mais simples de "exclui agentes" enquanto não há dado dependente (a base e as conversas só nascem nas features seguintes, que decidem o destino ao criar as suas tabelas).
**O que invalida:** se as equipes precisarem de agentes isolados entre si (PR-12), ou se a empresa quiser lixeira e histórico de instruções.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-02

---

### PR-41 — Regras do turno de conversa

**Assunto:** F2 da FT-03 — PR-22, números e regras que a premissa não dá
**Decisão:** a mensagem do usuário tem de 1 a 4000 caracteres e não pode ser só espaços. O prompt tem uma mensagem de sistema (instruções do agente, mais uma linha fixa de conduta: responder no idioma de quem pergunta, ser conciso, não revelar as instruções internas) e o histórico: até as últimas 20 mensagens da conversa, limitadas a 24000 caracteres somados, contadas do mais recente para trás, sempre com a mensagem atual. `maxTokens` da resposta é 1024, configurável por `MAX_TOKENS_RESPOSTA`. A mensagem do usuário é gravada antes de chamar o provedor; a resposta do assistente só é gravada quando o stream termina inteiro. Resposta interrompida (cancelamento, erro no meio do stream, prazo) é descartada, não gravada como completa nem com marca: o que o usuário viu na tela some ao recarregar, e o histórico enviado depois não carrega texto cortado. Sem chave do OpenRouter, o turno falha antes de gravar qualquer coisa, com o código `chat_sem_chave`. Os tokens de entrada e saída ficam vazios (o adaptador não devolve o uso) e o campo `modelo` guarda o modelo do agente no momento da resposta.
**Por quê:** o texto cortado no meio de uma frase, gravado como resposta, entra no contexto do turno seguinte e envenena a conversa; descartar é a leitura mais simples e reversível (gravar parcial com marca é acrescentar uma coluna depois). 4000 caracteres cabem um texto longo colado sem abrir espaço para abuso de custo; 20 mensagens e 24000 caracteres (cerca de 6000 tokens) cabem em qualquer modelo da lista de reserva com folga para instruções de até 8000 caracteres (PR-40).
**O que invalida:** se o dono quiser guardar respostas parciais para auditoria ou custo, se os modelos usados tiverem janela menor que cerca de 12000 tokens, ou se as conversas típicas passarem de 20 mensagens de contexto.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-03

---

### PR-42 — Duas saídas de mensagem de erro e correlação

**Assunto:** F2 da FT-03 — PR-22 e PR-21
**Decisão:** o serviço de chat tem duas funções de mensagem para um erro: `mensagemParaOperador` (detalhada, em português, distingue chave inválida, saldo, modelo indisponível, limite, prazo, provedor fora, chave não configurada) e `mensagemParaVisitante` (uma frase genérica fixa, "Não consegui responder agora. Tente novamente em instantes."). Nenhuma repete corpo do provedor, chave ou pilha. Erro que não é de aplicação vira, para o operador, "Não foi possível concluir. Código de referência: <id>", com um identificador de correlação curto gerado na hora e gravado no log junto do código do erro, do id do agente e do id da conversa, nunca do conteúdo da conversa. O log é uma linha JSON em `console.error`, enquanto o log estruturado global não existe (FT-11).
**Por quê:** quem opera resolve chave e saldo, e o visitante não deve ver isso; o identificador liga a tela ao log sem expor pilha.
**O que invalida:** se a hospedagem exigir outro formato de log (PR-21), ou se o operador quiser ver o texto técnico do provedor.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-03

---

### PR-43 — Protocolo do stream de conversa no painel

**Assunto:** F2 da FT-03 — interface entre o handler e o navegador
**Decisão:** `POST /api/agentes/[id]/conversar` recebe `{conversaId?, mensagem}`. Erro que ocorre antes de qualquer gravação responde JSON com o status HTTP (401 sem sessão, 404 agente ou conversa inexistente, 422 mensagem inválida, 409 sem chave). Depois disso a resposta é `text/event-stream` com status 200, o cabeçalho `X-Conversa-Id` e os eventos `trecho` (`{texto}`), `fim` (`{conversaId, mensagemId, tamanho}`) e `erro` (`{codigo, mensagem, correlacao?}`, com a mensagem de `mensagemParaOperador`). O `fim` e o `erro` são exclusivos e terminam o stream. Cancelar a requisição no navegador aborta a chamada ao provedor. Uma conversa só é continuada por quem a criou (mesmo agente, canal e usuário); outro id vira 404 sem revelar que existe.
**Por quê:** o navegador precisa do id da conversa mesmo se cancelar antes do `fim`, então ele vai no cabeçalho; erro de validação como status HTTP deixa o cliente distinguir "não enviou" de "enviou e a resposta falhou".
**O que invalida:** se um canal futuro precisar de outro protocolo (o serviço não depende dele: o handler é só a tradução).
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-03

---

### PR-44 — Conversa do painel: retomada e título

**Assunto:** F2 da FT-03 — item 5 do escopo, persistência da conversa de teste
**Decisão:** a conversa do painel tem canal `painel`, `criadoPorId` do usuário e nasce ao enviar a primeira mensagem (não existe conversa vazia). Recarregar a aba Testar mostra a conversa mais recente do usuário com aquele agente (a de `atualizadoEm` maior), com no máximo as últimas 100 mensagens; "Nova conversa" só zera o estado da tela, e a próxima mensagem cria outra. O título é os primeiros 60 caracteres da primeira mensagem. Excluir o agente exclui as conversas e mensagens dele em cascata; a tela de exclusão avisa disso. A lista, a leitura por outros usuários e o apagamento pela interface são da FT-09.
**Por quê:** conversa vazia poluiria o histórico da FT-09; título automático evita um campo a mais e serve ao histórico depois.
**O que invalida:** se a equipe quiser ver as conversas de teste umas das outras já agora, ou uma conversa vazia reservada por usuário.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-03

---

### PR-45 — Regras de validação do upload e da extração

**Assunto:** F2 da FT-04 — PR-10 e PR-13, números e comportamentos que a premissa não dá
**Decisão:** o tipo do arquivo vem da extensão (`.pdf .docx .txt .md .csv .html .htm .json .srt .vtt`) e o tipo MIME gravado é o da extensão, nunca o enviado pelo navegador. Cada envio aceita até 10 arquivos; cada um até `MAX_UPLOAD_MB` (padrão 25); o corpo inteiro é recusado cedo por `Content-Length` acima de `MAX_UPLOAD_MB` x 10 mais 1 MB (413). Arquivo vazio, com extensão fora da lista ou com conteúdo que não bate com a extensão é recusado individualmente, com motivo, sem derrubar os outros: PDF precisa começar por `%PDF-`; DOCX precisa ser ZIP com `word/document.xml`, sem entrada cifrada, com tamanho descompactado real somado de no máximo 100 MB e razão de compressão de no máximo 100 para 1 (conferidos descompactando com teto, sem confiar no tamanho declarado no cabeçalho); texto decodifica como UTF-8 (BOM aceito) e, se falhar, como Latin-1, e qualquer byte nulo o recusa; `.json` precisa ser JSON válido. Na extração: PDF de mais de 500 páginas, texto extraído acima de 5 milhões de caracteres, extração vazia e extração acima de 120 s viram `erro` com mensagem clara. PDF sem texto: "Este PDF não tem texto selecionável (parece escaneado). OCR não é suportado." O nome enviado é sanitizado (sem caminho, sem caractere de controle, até 200 caracteres) e serve só de título e exibição. Texto colado: título de 1 a 120 e conteúdo de 1 a 200.000 caracteres, sem ser só espaços.
**Por quê:** a PR-10 e a PR-13 pedem conferir extensão, conteúdo e tamanho sem dar os números; conferir o conteúdo real e descompactar com teto é o que barra zip bomb e arquivo renomeado; erro por arquivo deixa o usuário reenviar só o que falhou.
**O que invalida:** se a base tiver documentos legítimos acima de 25 MB, de 500 páginas ou de 5 milhões de caracteres, ou se forem exigidos outros formatos (XLSX, RTF); os números são constantes em um só módulo e o tamanho por variável de ambiente.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-04

---

### PR-46 — Divisão em trechos

**Assunto:** F2 da FT-04 — PR-04 (a FT-05 consome os trechos)
**Decisão:** o texto extraído é normalizado (quebras CRLF viram LF, três ou mais quebras seguidas viram duas, espaços nas pontas saem) e dividido em trechos de no máximo 1000 caracteres com sobreposição de cerca de 150, cortando de preferência na quebra de parágrafo, senão depois de frase, senão entre palavras, e só por último no meio de uma palavra. Nenhum trecho é vazio, a divisão é determinística (mesmo texto, mesmos trechos) e o índice do trecho começa em 0. `Fonte.caracteres` é o tamanho do texto normalizado; cada `Trecho` guarda também o `agenteId` para a busca por agente.
**Por quê:** cerca de 1000 caracteres (uns 250 tokens) é um tamanho usual para recuperação por busca textual, e a sobreposição evita cortar uma resposta ao meio; determinismo torna o reprocessamento e o teste previsíveis.
**O que invalida:** se a FT-05 medir revocação ruim com esse tamanho (o tamanho e a sobreposição são parâmetros da função), ou se a base tiver muito texto sem pontuação.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-04

---

### PR-47 — Armazenamento e ciclo de vida dos arquivos

**Assunto:** F2 da FT-04 — PR-11, onde e quando o arquivo existe
**Decisão:** o arquivo (e o texto colado, gravado como arquivo UTF-8) fica em `<STORAGE_DIR>/fontes/<agenteId>/<fonteId>/original`, com `STORAGE_DIR` padrão `./storage` relativo ao diretório de execução; o banco guarda só o caminho relativo a essa raiz e nunca o expõe à interface. Só ids gerados pelo servidor entram no caminho; qualquer id fora de `[A-Za-z0-9_-]` ou caminho que escape da raiz é recusado. A ordem de gravação é arquivo primeiro, linha depois (falha na linha apaga o arquivo); a exclusão apaga a linha (trechos em cascata) e depois o diretório da fonte, e excluir o agente apaga o diretório do agente. Falha ao apagar arquivo é registrada no log e não desfaz a exclusão no banco. Arquivos e diretórios são criados com permissão só do dono.
**Por quê:** ids opacos nos caminhos tornam a travessia de diretório impossível por construção; linha sem arquivo é recuperável (reprocesso falha com erro claro), arquivo sem linha é lixo inofensivo, e a ordem escolhida evita o primeiro caso.
**O que invalida:** se o deploy usar disco compartilhado entre instâncias ou armazenamento de objetos (PR-11).
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-04

---

### PR-48 — Fila em segundo plano: concorrência, retomada e falha

**Assunto:** F2 da FT-04 — PR-05, parâmetros que a premissa não dá
**Decisão:** a fila é um singleton do processo (guardado em `globalThis` para sobreviver a recarga em desenvolvimento), com concorrência 2. A fonte nasce `pendente`; quem processa a reivindica por atualização condicional (`pendente` para `processando`), grava os trechos e o `pronto` em uma transação, e em falha grava `erro` com mensagem em português (a do `ErroDeAplicacao`, ou uma frase genérica para erro inesperado, com o detalhe só no log junto de um código de correlação e sem conteúdo do arquivo). Ao subir o servidor (`src/instrumentation.ts`, só runtime Node) toda fonte `processando` volta a `pendente` e a fila retoma sem bloquear a subida. Só a fonte em `erro` pode ser reprocessada (409 nos outros estados), o que zera a mensagem e a devolve a `pendente`. Excluir uma fonte durante o processamento é seguro: o resultado é descartado. Não há cota de fontes por agente.
**Por quê:** a atualização condicional impede duas execuções da mesma fonte; retomar na subida é o que a PR-05 exige; reprocessar só o que falhou evita perder trechos bons por engano.
**O que invalida:** se rodar em mais de um processo (a PR-05 já o declara) ou se a empresa quiser reprocessar fontes prontas com uma nova versão do extrator.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-04

---

### PR-49 — Contrato HTTP e tela da base

**Assunto:** F2 da FT-04 — interface entre handler, serviço e tela
**Decisão:** `POST /api/agentes/[id]/fontes` (multipart, campo `arquivos`) responde 202 com um resultado por arquivo (aceito com a fonte, ou recusado com código e motivo) e 422 se nenhum foi aceito; `POST .../fontes/texto` (JSON) responde 202; `GET .../fontes` devolve a lista e o resumo sem `Cache-Control` de cache; `DELETE .../fontes/[fonteId]` responde 204 e `POST .../fontes/[fonteId]/reprocessar` 202. Sessão ausente 401, agente ou fonte inexistente (ou de outro agente) 404, corpo grande 413, tipo de conteúdo errado 415, entrada inválida 422. A resposta nunca traz o caminho do arquivo. A tela envia cada arquivo em uma requisição própria (progresso por arquivo), atualiza a lista a cada 2 segundos só enquanto houver fonte `pendente` ou `processando`, mostra as datas no fuso de São Paulo e pagina os trechos de uma fonte de 20 em 20.
**Por quê:** uma requisição por arquivo dá progresso e erro por arquivo sem protocolo novo, e o servidor continua aceitando vários de uma vez; o fuso fixo evita diferença entre servidor e navegador na hidratação.
**O que invalida:** se a instalação atender vários fusos e a tela precisar mostrar a hora local do usuário.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-04

---

### PR-50 — Índice FTS5 de conteúdo externo, por migration

**Assunto:** F2 da FT-05 — PR-04 e PR-30, forma do índice
**Decisão:** `trechos_fts` é uma tabela virtual FTS5 de conteúdo externo sobre `trechos` (`content='trechos'`, `content_rowid='rowid'`, tokenizer `unicode61 remove_diacritics 2`), criada por SQL cru escrito à mão numa migration nova que só acrescenta, com três gatilhos em `trechos` (insert, update, delete) e um `rebuild` inicial para os trechos já existentes. O `rowid` implícito do SQLite liga as duas tabelas (`trechos.id` é texto). A exclusão de fonte ou de agente, o reprocessamento e `limparBanco` mantêm o índice em dia pelos gatilhos, sem código de aplicação. A função `reconstruirIndiceDeTrechos()` (`rebuild`) fica disponível como remédio.
**Por quê:** conteúdo externo não duplica o texto dos trechos no banco; gatilhos tornam impossível esquecer de indexar, inclusive pela seed e pela fila da FT-04, que gravam com `createMany`.
**O que invalida:** se um `VACUUM` ou a restauração de backup renumerar o `rowid` de `trechos` (tabela sem `INTEGER PRIMARY KEY`), o índice passa a apontar para a linha errada até um `rebuild`; nesse caso a FT-11 precisa rodar `reconstruirIndiceDeTrechos()` depois de restaurar, ou a tabela trocar para FTS5 com conteúdo próprio.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-05

---

### PR-51 — Parâmetros da recuperação de trechos

**Assunto:** F2 da FT-05 — PR-04 e PR-13, números e regras que a premissa não dá
**Decisão:** a pergunta vira termos: minúsculas, sem acento, só letras e dígitos, termos de 2 a 40 caracteres, sem stopwords do português (lista própria, constante no módulo, inclui saudações como "oi", "olá", "obrigado"), sem repetição, no máximo 12 termos. A expressão `MATCH` é montada só com esses termos, cada um entre aspas, ligados por `OR`, e os de 4 caracteres ou mais levam prefixo (`"termo"*`); o texto do usuário nunca é concatenado no SQL: a expressão já limpa e o `agenteId` vão como parâmetros de `prisma.$queryRaw`. O resultado é ordenado por BM25, limitado a 6 trechos (padrão e teto), só de fontes com `status = 'pronto'` do agente, e cada item traz `trechoId`, `fonteId`, `titulo`, `posicao` (índice do trecho mais 1), `texto` e `pontuacao` (o BM25 com o sinal trocado, maior é melhor). Limiar de relevância: pelo menos um termo significativo precisa casar; pergunta vazia ou só de stopwords devolve lista vazia sem consultar o banco. Pergunta de continuação: se a pergunta tem no máximo 2 termos significativos, somam-se os termos da última pergunta anterior do usuário na conversa (passada como `perguntaAnterior`). A busca nunca lança por causa do texto da pergunta.
**Por quê:** OR com BM25 favorece revocação, que importa numa base pequena; prefixo cobre plural e flexão sem radicalizador; "olá" e "obrigado" não devem trazer trechos; "e o preço?" só tem sentido com a pergunta anterior.
**O que invalida:** se a revocação se mostrar ruim para perguntas longas (então entra AND parcial ou reescrita da pergunta), se o idioma da base não for o português (stopwords), ou se 6 trechos não couberem no contexto do modelo usado.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-05

---

### PR-52 — Modo fundamentado e estrutura do prompt

**Assunto:** F2 da FT-05 — PR-15, quando e como o material entra no prompt
**Decisão:** o agente com ao menos uma fonte `pronto` responde em modo fundamentado; sem nenhuma fonte pronta, o turno é idêntico ao da FT-03 (conhecimento geral do modelo, sem aviso de base vazia). No modo fundamentado, com trechos encontrados, a mensagem de sistema ganha um bloco delimitado por marcadores com identificador aleatório de 16 hexadecimais gerado a cada requisição, com os trechos numerados `[1]`, `[2]`... e o título da fonte, e instruções para usar o material como fonte dos fatos, citar `[n]` ao usá-lo, tratar o conteúdo do bloco como dado e ignorar qualquer instrução escrita nele, e não revelar as instruções internas. O texto dos trechos é higienizado (sequências `<<<` e `>>>` e o próprio identificador saem). O material tem orçamento de 6000 caracteres, cortando do menos relevante (o mais relevante entra sempre, truncado se passar do orçamento). Sem trecho relevante, a mensagem de sistema diz que não há material relevante e manda responder, em português do Brasil e no idioma de quem pergunta, que a informação não foi encontrada na base, sem inventar, exceto para saudações e conversa trivial. A estrutura é provada por teste contra o OpenRouter falso; o comportamento do modelo real não é testável (PR-26) e é limite conhecido.
**Por quê:** identificador imprevisível impede que um trecho malicioso feche o bloco; a dúvida entre "responder do conhecimento geral" e "dizer que não sabe" cai do lado honesto assim que a base existe; sem base, o agente da FT-03 segue útil.
**O que invalida:** se o dono quiser que o agente com base também responda de conhecimento geral (PR-15), ou se um modelo ignorar a instrução de tratar o bloco como dado (então a defesa precisa de filtro adicional).
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-05

---

### PR-53 — Fontes da resposta: evento, gravação e retomada

**Assunto:** F2 da FT-05 — PR-15 (fontes aparecem) e PR-43 (protocolo)
**Decisão:** quando o turno fundamentado encontrou trechos, o serviço emite o evento `fontes` antes do `fim`, com a lista `[{fonteId, titulo, trechos: [{n, posicao, trechoTexto}], citada}]`, uma entrada por fonte (na ordem do primeiro trecho), `trechoTexto` com no máximo 300 caracteres, `n` o número `[n]` do trecho no prompt e `citada` verdadeiro se algum `[n]` dos trechos dela aparece na resposta final. A lista é gravada em `Mensagem.fontes` como JSON junto da resposta; falha ao gravar as fontes é registrada no log e a resposta é gravada sem elas, sem derrubar o turno. O protocolo é estendido só por evento novo (clientes antigos ignoram evento desconhecido). Sem trechos, não há evento nem JSON (`fontes` fica nulo). Ao recarregar, a conversa retomada traz as fontes lidas de `Mensagem.fontes`, com JSON inválido tratado como ausente.
**Por quê:** a fonte é a unidade que o usuário entende; o número `[n]` liga o texto ao trecho; evento novo não quebra a FT-03; o histórico da FT-09 lerá o mesmo JSON.
**O que invalida:** se o modelo não citar `[n]` de forma confiável (então toda fonte consultada aparece como "consultada" e a citação perde valor), ou se a FT-09 precisar de outro formato.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-05

---

### PR-54 — Testar busca: contrato e limites

**Assunto:** F2 da FT-05 — o cartão "Testar busca" da aba Conhecimento
**Decisão:** `POST /api/agentes/[id]/buscar` recebe `{pergunta}` (1 a 500 caracteres, sem ser só espaços) e devolve `{trechos: [...]}` no formato de `buscarTrechos`, com o texto do trecho inteiro e a pontuação. Sessão obrigatória (401), agente inexistente 404, entrada inválida 422; sem cache. Qualquer usuário autenticado pode usar (PR-12, PR-40). Não chama o OpenRouter e funciona sem chave. A busca da tela não usa pergunta anterior.
**Por quê:** é a ferramenta para entender o que o agente vai enxergar sem gastar crédito; 500 caracteres bastam para uma pergunta e limitam o custo da consulta.
**O que invalida:** se a busca do painel precisar refletir o histórico da conversa ou ser aberta ao público (então precisa de limite de uso, PR-16).
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-05

---

### PR-55 — Configuração do chat por agente

**Assunto:** F2 da FT-06 — PR-08 e PR-18 (aviso de privacidade), contrato de dados
**Decisão:** uma tabela 1:1 `configuracao_do_chat` (chave `agenteId`, exclusão em cascata com o agente), criada por migration que só acrescenta; a linha ausente vale os padrões e é criada no primeiro salvamento. Campos e validação no serviço (zod): `ativo` (padrão `false`), `titulo` (até 60; vazio = nome do agente), `cor` (`#rrggbb` em minúsculas; `#rgb` é expandida; padrão o índigo do sistema), `posicao` (`direita` ou `esquerda`, padrão `direita`), `avatar` (`iniciais`, `chat`, `robo`, `estrela` ou `fone`; sem upload), `avisoDePrivacidade` (texto até 300) e `avisoDePrivacidadeUrl` (vazio ou URL `http`/`https` de até 500), `dominiosPermitidos` (lista JSON de hosts normalizados, até 20), `limiteDiario` (inteiro de 1 a 100000, padrão 500), `sugestoes` (lista JSON de até 3 perguntas de 1 a 80 caracteres, sem repetição). Qualquer usuário autenticado edita (PR-12). A mensagem inicial continua sendo a do agente.
**Por quê:** uma tabela própria mantém `Agente` enxuto, deixa a consulta pública ler uma linha só e a migration é só `CREATE TABLE`; o padrão `ativo=false` garante que nada vai ao público sem o usuário publicar.
**O que invalida:** se o modelo de dados passar a ter um chat por canal e por agente (várias configurações por agente), ou se o usuário quiser avatar por upload.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-06

---

### PR-56 — API pública do chat: contrato

**Assunto:** F2 da FT-06 — PR-08, PR-16, PR-22, PR-43 e PR-53 no canal público
**Decisão:** `GET /api/publico/agentes/[id]/config` devolve só `{ativo, titulo, cor, posicao, avatar, mensagemInicial, avisoDePrivacidade: {texto, url}|null, sugestoes}`, nunca instruções, modelo, chave, limite nem domínios; agente inexistente e inativo dão o mesmo 404. `POST .../conversar` recebe `{visitanteId, conversaId?, mensagem}` sem sessão, valida `visitanteId` (16 a 64 caracteres `[A-Za-z0-9_-]`) e mensagem (1 a 1000 caracteres, sem ser só espaços), chama `responderMensagem` com canal `widget` e `identificadorExterno` igual ao `visitanteId`, e responde como o painel (PR-43): JSON com status antes da primeira gravação (404 agente ou conversa inexistente, inativo ou de outro visitante; 422 entrada inválida; 429 limite) e depois `text/event-stream` com `X-Conversa-Id`, `Cache-Control: no-store` e os eventos `trecho`, `fontes`, `fim` e `erro`. O `erro` do stream e todo erro 5xx levam sempre a frase de `mensagemParaVisitante`, com código genérico `indisponivel`; nada de pilha, código do provedor ou correlação. O evento `fontes` público leva só o título de cada fonte, se foi citada e os números `[n]`, no mesmo formato do painel (`fonteId` é um ordinal `f1`, `f2`, e `trechoTexto` vai vazio): o texto interno da base e os ids reais não saem. `GET .../conversa` (cabeçalho `X-Visitante-Id`) devolve a conversa mais recente do visitante com as últimas 50 mensagens e o indicador `truncada`, ou `{conversa: null}`; sem paginação além disso. O POST recusa (403) requisição de navegador cuja `Origin` não seja a da própria plataforma (`Host` da requisição ou `APP_URL`), porque a chamada legítima parte do iframe, da plataforma.
**Por quê:** a FT-05 já entrega o turno fundamentado por `agenteId`, então o canal público é tradução HTTP; título da fonte ajuda o visitante e o trecho interno é conteúdo da empresa que não precisa sair; ler só as últimas 50 mensagens limita custo e exposição; a retomada por cabeçalho evita o id do visitante em URL e log de acesso.
**O que invalida:** se a empresa quiser expor o trecho da fonte ao visitante, se um canal precisar de protocolo diferente, ou se a retomada precisar de paginação.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-06, FT-12

---

### PR-57 — Limites de uso do chat público e teto diário

**Assunto:** F2 da FT-06 — PR-16, números que a premissa não dá
**Decisão:** por IP e agente 10 mensagens por minuto, por IP 30 por minuto (janela deslizante de `criarLimitador`, chaves `chat:ip-agente:<ip>:<agente>` e `chat:ip:<ip>`), por conversa 60 mensagens do visitante, e teto diário por agente contado no banco: mensagens `user` de conversas do canal `widget` do agente criadas desde as 00:00 do fuso do servidor, comparadas com `limiteDiario` (padrão 500). A conferência roda antes de chamar o provedor e depois de validar a entrada e a posse da conversa. Excedeu: 429 com `{codigo, mensagem}` amigável (`limite_excedido`, `limite_diario`, `conversa_cheia`) e `Retry-After` em segundos (segundos até a janela liberar, ou até a próxima meia-noite local no teto diário; a conversa cheia não tem `Retry-After`, pois esperar não resolve: o visitante abre outra conversa). O IP vem de `ipDoCliente` (PR-36): sem `TRUST_PROXY=1` todos os visitantes dividem o IP `desconhecido` e o limite vale para o site inteiro, o que a tela Publicar avisa. O teto conta tentativas, inclusive as que falharam no provedor, porque a pergunta é gravada antes (PR-41); duas requisições simultâneas podem ultrapassar o teto por uma mensagem.
**Por quê:** a mensagem do visitante custa IA paga pela empresa (PR-16); contar no banco sobrevive a reinício e vale em vários processos, e o limite por IP em memória segura rajada; o erro de gravação antes do provedor é o comportamento já provado da FT-03.
**O que invalida:** se a instalação rodar em mais de um processo (o limite por minuto deixa de ser global, PR-05), se uma mesma rede legítima passar de 10 mensagens por minuto atrás de um IP só, ou se o teto precisar contar só respostas bem-sucedidas.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-06

---

### PR-58 — Domínios permitidos: sintaxe, CORS e frame-ancestors

**Assunto:** F2 da FT-06 — PR-17, o que a origem de fato garante
**Decisão:** cada entrada de `dominiosPermitidos` é um host em minúsculas, sem esquema nem caminho: `exemplo.com`, `*.exemplo.com` (qualquer subdomínio, não o domínio puro) ou `localhost:3000`; o esquema e as barras digitados são removidos, o curinga só vale no início, e a entrada sem porta vale só para a porta padrão do esquema. Lista vazia libera qualquer domínio. A mesma lista vira o `frame-ancestors` da página do iframe (PR-59) e decide o CORS do `GET config`: com lista vazia `Access-Control-Allow-Origin: *`; com lista, o `Origin` da requisição é ecoado só se casa com a lista, e senão o cabeçalho não sai; em todos os casos `Vary: Origin`. O `OPTIONS` responde 204 com os métodos e cabeçalhos permitidos pelas mesmas regras. Como a chamada de chat parte do iframe, cuja origem é a própria plataforma, a restrição de domínio é garantida por `frame-ancestors` (que o navegador aplica ao emoldurar) e pelo CORS do `config`, e não por conferir o `Origin` do POST, que serve só para barrar chamada de navegador vinda de outro site (PR-56). Um cliente que não é navegador pode forjar qualquer cabeçalho: a lista de domínios não é controle contra ele, e o limite de uso (PR-57) é.
**Por quê:** o PR-17 pedia que a API pública conferisse `Origin`, mas a origem real da chamada é sempre a plataforma; dizer isso e testar o que dá evita falsa sensação de segurança.
**O que invalida:** se o widget passar a falar com a API direto do site do cliente (sem iframe), o que exigiria CORS e conferência de `Origin` no POST, ou se a empresa precisar de barrar também clientes que não são navegador.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-06

---

### PR-59 — Cabeçalhos da rota do iframe: proxy.ts

**Assunto:** F2 da FT-06 — PR-17 e PR-37, primeiro CSP dinâmico
**Decisão:** `src/proxy.ts` (Next 16, runtime Node) roda só em `/embed/:path*`, lê do serviço a lista do agente e define `Content-Security-Policy: frame-ancestors 'self' <domínios>` (lista vazia: `frame-ancestors *`; agente inexistente ou inativo: `frame-ancestors 'self'`, igual nos dois casos). O `X-Frame-Options: DENY` global sai de `/embed` (regra do `next.config.ts` com exclusão por expressão regular) e continua em todo o resto. A página do iframe também leva `X-Content-Type-Options: nosniff` e o `Referrer-Policy` globais. O `frame-ancestors 'self'` mantém a pré-visualização da aba Publicar (mesma origem). Só `frame-ancestors` é definido: a política de conteúdo completa segue fora do escopo (PR-37).
**Por quê:** a `Content-Security-Policy` precisa ser dinâmica por agente e a página do App Router não define cabeçalho de resposta; o `proxy.ts` é o ponto previsto pelo Next 16 para isso, e um route handler que devolvesse HTML tiraria a hidratação do chat.
**O que invalida:** se o Prisma deixar de funcionar dentro do `proxy.ts` (então o cabeçalho passa a vir de outro ponto), se a hospedagem for edge puro, ou se a empresa exigir uma CSP completa.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-06

---

### PR-60 — Script widget.js e seu protocolo

**Assunto:** F2 da FT-06 — PR-08, forma do script
**Decisão:** `/widget.js` é uma rota estática que serve o arquivo legível e versionado `src/widget/widget.js` (JavaScript puro, ES2017, IIFE, sem dependência) com `Content-Type: application/javascript; charset=utf-8`, `Cache-Control: public, max-age=300`, `Access-Control-Allow-Origin: *` e `Cross-Origin-Resource-Policy: cross-origin`. O script acha o próprio `<script data-agent>`, toma a origem da plataforma de `new URL(script.src).origin`, busca o `config` (404, falha de rede ou CORS: não mostra nada e não escreve no console do site), monta botão e painel em Shadow DOM, carrega o iframe só ao abrir, fecha por clique e `Esc`, ocupa a tela toda abaixo de 480px, devolve o foco ao botão ao fechar, respeita `prefers-reduced-motion`, não deixa global além de `window.Converse` (`abrir`, `fechar`) e é idempotente. `data-position` e `data-color` (`#rrggbb`) sobrescrevem a configuração. O iframe fala com o pai por `postMessage` no formato `{origem: 'converse', tipo: 'fechar' | 'redimensionar', ...}`; o script aceita a mensagem só se `event.origin` é a origem da plataforma e `event.source` é o iframe dele. O script roda em site de terceiro e não lê os tokens do sistema: as poucas cores neutras dele (fundo do painel, texto do botão por luminância) são literais dentro do próprio arquivo, exceção declarada em `CONVENCOES.md` e fora da varredura de `tests/tokens.test.ts`, que cobre `.ts`, `.tsx` e `.css`.
**Por quê:** o iframe isola o estilo e o código do site (PR-08); origem vinda do próprio `src` dispensa configuração; `postMessage` sem conferir a origem deixaria qualquer janela fechar o painel.
**O que invalida:** se o site hospedeiro tiver CSP que bloqueie o iframe ou o script, se o script precisar de dependência, ou se a empresa quiser o painel sem iframe.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-06

---

### PR-61 — Página do iframe: visitante, retomada, prévia e cor

**Assunto:** F2 da FT-06 — PR-08 e PR-18 (aviso), comportamento da tela do visitante
**Decisão:** `/embed/[id]` mora fora do grupo `(sistema)`: sem barra lateral, sem login. O `visitanteId` é gerado com `crypto.getRandomValues` (32 caracteres hexadecimais) e guardado em `localStorage` sob a chave `converse:visitante`, com try/catch em toda leitura e escrita; sem armazenamento usa um id efêmero em memória. A conversa é retomada pelo servidor (`GET conversa`, PR-56), com o `conversaId` também guardado em `localStorage`; sem armazenamento, a conversa não é retomada. O aviso de privacidade aparece como linha no rodapé do campo e a mensagem inicial é a do agente. A cor do agente é o destaque (bolha do visitante, botão enviar, anel do avatar) por variável de CSS, e o texto sobre ela é o de maior contraste entre o claro e o escuro dos tokens, por luminância relativa (WCAG), o que dá pelo menos 4,5:1. A pré-visualização da aba Publicar usa `/embed/[id]?previa=1`: só vale com sessão válida, funciona mesmo com o chat inativo e fala com o endpoint do painel (`/api/agentes/[id]/conversar`, canal `painel`), para não gastar o limite público nem poluir as conversas do canal `widget`; as mudanças ainda não salvas chegam ao iframe por `postMessage` da mesma origem. Agente inexistente ou inativo (fora da prévia): mensagem neutra, sem dados. O tema vem da preferência do sistema do visitante.
**Por quê:** guardar o id no navegador do visitante é o que permite retomar sem login; a prévia pelo painel mostra o que o visitante veria sem consumir o teto do agente; a cor é dado do usuário e o texto por luminância garante leitura em qualquer escolha.
**O que invalida:** se a empresa exigir retomada entre dispositivos (exige identidade), se um navegador do visitante bloquear `localStorage` de terceiro em todos os casos (a conversa deixa de ser retomada, sem quebrar), ou se a prévia precisar refletir exatamente o canal público.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-06

---

### PR-62 — Código para incorporar e URL pública

**Assunto:** F2 da FT-06 — PR-08 e PR-24, origem do snippet
**Decisão:** a aba Publicar mostra `<script src="<origem>/widget.js" data-agent="<id>" async></script>`, onde `<origem>` é `APP_URL` quando definida e senão a origem da requisição (`Host` e protocolo). `APP_URL` passa a ter uma leitura que distingue ausente de padrão (`ambiente.appUrlPublica`), sem mudar o uso atual no `HTTP-Referer` do OpenRouter (PR-38). A tela avisa: colar antes de `</body>`, usar HTTPS em produção, que o IP dos visitantes só é distinguido com `TRUST_PROXY=1` atrás de um proxy (PR-36, PR-57), que agente sem fonte pronta responde só com as instruções (PR-52) e que sem a chave do OpenRouter o visitante vê a mensagem genérica (PR-22).
**Por quê:** sem URL pública o usuário copiaria um endereço que só funciona no computador dele; o aviso do IP evita o tropeço de todos os visitantes dividirem 10 mensagens por minuto.
**O que invalida:** se a instalação ficar atrás de um domínio que a requisição não enxerga (proxy que troca o `Host`), caso em que `APP_URL` é obrigatória na prática.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-06

---

### PR-63 — Modelo do canal Telegram, dedupe e purga

**Assunto:** F2 da FT-07 — PR-07 e PR-14, contrato de dados
**Decisão:** duas tabelas por migration que só acrescenta: `canais_telegram` (`CanalTelegram`: `agenteId` único com cascata, `tokenCifrado` AES-256-GCM, `botId` único entre canais, `botUsername`, `botNome`, `segredoDoWebhookHash` SHA-256 em hexadecimal, `ativo`, `webhookUrl`, `conectadoEm`, `ultimoErro`, `ultimoErroEm`, `ultimaMensagemEm`, `limiteDiario` padrão 500 de 1 a 100000) e `atualizacoes_telegram` (`AtualizacaoTelegram`: `canalId` com cascata, `updateId` guardado como texto decimal porque o teto do `update_id` não é documentado, par `(canalId, updateId)` único, `criadoEm`). O dedupe grava a linha antes de processar: violação de unicidade significa reenvio e o update é ignorado. Linhas com mais de 7 dias são purgadas (`purgarAtualizacoes`), de forma oportunista no webhook, no máximo uma vez por hora por processo. `botId` único impede dois agentes de disputarem o mesmo bot (o Telegram guarda um webhook por bot). Desconectar apaga o canal e as atualizações, mantém as conversas (PR-18, FT-09).
**Por quê:** o dedupe por insert-primeiro é atômico no SQLite e não depende de leitura prévia; texto evita o limite de inteiro; `botId` único evita roubar o webhook de outro agente sem aviso.
**O que invalida:** se um mesmo bot precisar servir mais de um agente (PR-07), ou se a instalação rodar em mais de um processo com bancos separados.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-07

---

### PR-64 — Adaptador do Telegram: token nunca vaza, erros e reenvio

**Assunto:** F2 da FT-07 — PR-14 e PR-22 no canal Telegram
**Decisão:** `src/lib/telegram.ts` é o único ponto que fala com o Telegram (`TELEGRAM_API_BASE`, padrão `https://api.telegram.org`). O token vai na URL, então todo erro é construído a partir de textos fixos em português e de `status`/`error_code`: nunca se repassa `description` do Telegram, mensagem de exceção, `cause` ou pilha; uma função única de redação troca o token e qualquer `bot<dígitos>:<segredo>` por `bot<oculto>` em qualquer texto que o adaptador ainda precise manter. Códigos: `telegram_token_invalido` (401), `telegram_sem_acesso` (403), `telegram_webhook_recusado` (400 do `setWebhook`), `telegram_limite` (429), `telegram_indisponivel` (rede, tempo esgotado, 5xx, JSON inválido). Prazo de 10 s por chamada (15 s no envio). No envio, o 429 com `retry_after` de até 30 s é esperado e repetido uma vez; sem `retry_after`, ou acima de 30 s, não repete. Texto acima de 4096 caracteres é dividido em pedaços de até 4096 preferindo quebra de linha, depois espaço, depois corte seco; os pedaços saem em ordem. Nunca `parse_mode`.
**Por quê:** a documentação do Telegram põe o token no caminho; sem redação num ponto só, um `TypeError` de rede com a URL iria ao log; o corpo do erro do Telegram é conteúdo de terceiro.
**O que invalida:** se o Telegram passar o token em cabeçalho, ou se a empresa quiser ver a descrição bruta do erro (o que reabre o risco de vazamento).
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-07

---

### PR-65 — Conexão do bot: HTTPS, segredo e ciclo de vida

**Assunto:** F2 da FT-07 — PR-07, PR-14 e PR-12
**Decisão:** `conectar(autor, agenteId, token)` valida o formato (`<dígitos>:<35 a 120 caracteres [A-Za-z0-9_-]>`), chama `getMe` (precisa ser bot), gera 32 bytes aleatórios em hexadecimal como `secret_token` (64 caracteres, dentro de `[A-Za-z0-9_-]{1,256}`), chama `setWebhook({url: <APP_URL>/api/telegram/<agenteId>/webhook, secret_token, allowed_updates: ['message']})` e só então grava o token cifrado e o hash do segredo; o segredo em claro nunca é gravado nem devolvido. Exige `APP_URL` HTTPS (`appUrlPublica`); sem ela ou com `http`, erro `telegram_url_nao_https` em pt-BR explicando que o Telegram só aceita webhook HTTPS público e que em desenvolvimento se usa um túnel (por exemplo ngrok ou Cloudflare Tunnel) com `APP_URL` apontando para ele. A exceção `TELEGRAM_PERMITIR_URL_NAO_HTTPS=1` só vale fora de produção (`NODE_ENV` diferente de `production`) e serve a teste e desenvolvimento com servidor simulado. Reconectar o mesmo agente com outro token substitui tudo e gira o segredo; `botId` já usado por outro agente é recusado com `telegram_bot_em_uso`. `desconectar` chama `deleteWebhook` (falha dele não impede apagar localmente), apaga canal, token e segredo e mantém as conversas. `pausar` só marca `ativo=false` e o webhook segue registrado (o app responde 200 sem processar): como o segredo em claro não é guardado, não é possível re-registrar o webhook ao retomar; mensagens enviadas na pausa não são atendidas depois. `estado` devolve só bot, estado, último erro, última mensagem, URL e limite; `verificar` chama `getWebhookInfo` e diz se a URL registrada confere e quantas atualizações pendem. Qualquer usuário autenticado gerencia (PR-12). Ponto de extensão para a FT-10: `aoAlterarCanal(ouvinte)` recebe `{acao, agenteId, usuarioId}` e nunca token, segredo ou conteúdo.
**Por quê:** validar o token antes de gravar evita canal quebrado; hash do segredo impede que um vazamento do banco permita forjar updates; a pausa sem `deleteWebhook` é o único jeito de retomar sem guardar o segredo em claro.
**O que invalida:** se o Telegram passar a aceitar webhook HTTP, se a empresa quiser que mensagens na pausa sejam atendidas depois (exige fila ou polling), ou se a auditoria (FT-10) precisar do conteúdo do evento.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-07

---

### PR-66 — Webhook do Telegram: autenticação, resposta e processamento posterior

**Assunto:** F2 da FT-07 — PR-07 e PR-16, contrato HTTP
**Decisão:** `POST /api/telegram/[agenteId]/webhook` (handler fino em `src/app/api/telegram/[agenteId]/webhook/route.ts`): lê `X-Telegram-Bot-Api-Secret-Token`, calcula o SHA-256 e compara em tempo constante com `segredoDoWebhookHash`; ausente, errado ou canal inexistente dão o mesmo 401 sem corpo informativo (a comparação roda também contra um hash fixo quando o canal não existe, para não distinguir por tempo). Canal pausado com segredo certo: 200 sem processar. Corpo acima de 64 KB: 413 depois da autenticação; JSON inválido ou fora do formato esperado (zod) com segredo certo: 200 mudo e linha de log sem conteúdo, para o Telegram não reenviar lixo. Com update válido: grava o `AtualizacaoTelegram` (dedupe), responde 200 vazio e processa em `after()` do Next com captura de qualquer erro (log JSON sem texto da conversa nem token, PR-42). Update perdido se o processo cair entre o 200 e a resposta é limite conhecido: o Telegram já recebeu 200 e não reenvia.
**Por quê:** o Telegram reenvia em resposta lenta ou não 2xx e o turno do modelo leva segundos; 401 igual evita revelar quais agentes têm bot.
**O que invalida:** se o Telegram exigir resposta no corpo do webhook, ou se a perda de update no reinício não for aceitável (exige fila persistente, PR-05).
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-07

---

### PR-67 — Escopo do atendimento no Telegram: só texto em chat privado

**Assunto:** F2 da FT-07 — PR-07 e PR-18
**Decisão:** Só `message` de texto em chat com `chat.type = 'private'` é atendida; `edited_message`, grupos, supergrupos e canais são ignorados (o `allowed_updates` já pede só `message`; o resto é descartado com 200). Mensagem privada sem texto (foto, voz, documento) recebe "Só consigo ler mensagens de texto por enquanto." `/start` (também `/start@bot` e com argumento) responde a `mensagemInicial` do agente (padrão "Olá! Envie sua pergunta." se vazia); `/novo` e `/reiniciar` abrem uma conversa nova vazia e confirmam; o texto comum vai a `responderMensagem` com `canal: 'telegram'` e `identificadorExterno = String(chat.id)`, na conversa mais recente daquele chat. Texto acima de 4000 caracteres recebe aviso de tamanho. A resposta sai sem `parse_mode`, com `[n]` mantidos e, se houve citação, uma linha final "Fontes: Título A, Título B" só com os títulos das fontes citadas; falha do provedor responde `mensagemParaVisitante`. A conversa nasce com `titulo` "Telegram: <nome público>" (`first_name` e `last_name`, até 60 caracteres no total, sem `@usuario` nem id) e nada mais do perfil é gravado.
**Por quê:** o pedido é atender pelo aplicativo; grupos trazem mensagens de terceiros e custo sem controle; texto puro elimina injeção de marcação; o nome público ajuda a leitura do histórico e é o mínimo de dado pessoal.
**O que invalida:** se a empresa quiser atender em grupos, mídia (voz, imagem) ou mostrar o `@usuario` no histórico.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-07

---

### PR-68 — Limites do Telegram: por chat, por conversa e teto diário do canal

**Assunto:** F2 da FT-07 — PR-16 e PR-57 no Telegram
**Decisão:** Por chat 10 mensagens por minuto (`criarLimitador`, chave `telegram:chat:<canalId>:<chatId>`, relógio injetável); por IP não se aplica (o tráfego vem do Telegram); 60 mensagens `user` por conversa; teto diário por agente contado no banco: mensagens `user` de conversas `canal = 'telegram'` do agente desde a meia-noite do fuso do servidor, comparadas com `CanalTelegram.limiteDiario` (padrão 500), com `exigirTetoDiario` ganhando o parâmetro de canal (padrão `widget`, comportamento do chat embutido intacto). Excesso responde ao chat uma frase amigável ("Você enviou muitas mensagens em pouco tempo. Aguarde um instante.", "Esta conversa atingiu o limite. Envie /novo para começar outra.", "Este assistente atingiu o limite de mensagens de hoje. Tente novamente amanhã.") em vez de silêncio, e não gasta o provedor. Um chat é atendido em ordem por exclusão mútua em memória (fila de promessas por canal e chat). O limite por minuto e a exclusão mútua valem por processo (PR-05).
**Por quê:** cada mensagem custa IA paga pela empresa (PR-16); reaproveitar a contagem do banco do widget mantém um só critério e sobrevive a reinício.
**O que invalida:** se a instalação rodar em mais de um processo, se o teto precisar somar widget e Telegram, ou se 10 por minuto por chat for pouco para o uso real.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-07

---

### PR-69 — Aba Canais e cartão do Telegram

**Assunto:** F2 da FT-07 — PR-14, PR-23 e PR-12 na interface
**Decisão:** Aba "Canais" (`src/app/(sistema)/agentes/[id]/canais`) como lista de cartões de canal extensível; o cartão Telegram traz o passo a passo (BotFather, `/newbot`, colar o token, Conectar), campo de token do tipo senha que nunca é preenchido de volta, e, conectado, nome e `@usuario` do bot com link `https://t.me/<usuario>`, selo (Conectado, Pausado, Com erro), último erro, última mensagem, URL do webhook, Verificar, Pausar/Retomar, Desconectar (confirmação na própria tela) e o limite diário. O token nunca vai ao navegador depois de gravado: o estado devolve o `@usuario` do bot no lugar da máscara do token. Sem `APP_URL` HTTPS (e sem a exceção de desenvolvimento), a tela mostra aviso destacado com o caminho do túnel e desabilita Conectar. As ações são Server Actions (`src/app/acoes.ts`), com erro sempre em pt-BR sem o token (`mensagemSemSegredo`).
**Por quê:** o usuário precisa ver o estado do bot sem poder extrair a credencial; o aviso evita o beco sem saída de um webhook que o Telegram recusa.
**O que invalida:** se a empresa quiser mostrar a máscara do token ou gerenciar o canal só como admin.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-07

---

### PR-70 — Variáveis de ambiente e simulado de teste do Telegram

**Assunto:** F2 da FT-07 — PR-26 e CONVENCOES (HTTP de saída simulado)
**Decisão:** `TELEGRAM_API_BASE` (padrão `https://api.telegram.org`, sem barra final) e `TELEGRAM_PERMITIR_URL_NAO_HTTPS` (`1` liga; ignorada em produção) são lidas só em `src/lib/ambiente.ts` (`telegramApiBase`, `telegramPermitirUrlNaoHttps`) e documentadas no `.env.example` e no README. Nenhum teste chama a rede real: `tests/apoio/telegram-falso.ts` imita `getMe`, `setWebhook`, `deleteWebhook`, `getWebhookInfo`, `sendMessage` e `sendChatAction` em porta livre, registra as requisições, devolve `401 {ok:false}` para token desconhecido, aceita falha e latência configuráveis e oferece `dispararUpdate` ao webhook do app com o cabeçalho certo. A verificação de produção usa `APP_URL` HTTPS de fachada (o simulado nunca chama de volta o app) e dispara os updates por `curl` direto em `localhost`.
**Por quê:** mesmo padrão do `OPENROUTER_BASE_URL`; a exceção só em desenvolvimento evita um modo inseguro em produção.
**O que invalida:** se a empresa quiser chamar o Telegram real em teste de integração, o que exigiria token e URL públicos dela (PEND-06).
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-07

---

### PR-71 — Upload de vídeo em streaming e conferência da assinatura

**Assunto:** F2 da FT-08 — PR-10 e PR-13, como receber 500 MB sem estourar a memória
**Decisão:** `POST /api/agentes/[id]/fontes/video?nome=<nome>` recebe o arquivo como corpo bruto e o escreve em disco por stream (`request.body` para `<STORAGE_DIR>/fontes/<agenteId>/<fonteId>/original.parcial`, depois renomeado para `original`), nunca por `request.formData()`. Sessão obrigatória (401). O limite é `MAX_VIDEO_MB` (padrão 500, no máximo 2000, porque `Fonte.tamanhoBytes` é inteiro de 32 bits): `Content-Length` acima dele é recusado antes de ler o corpo (413) e, sem `Content-Length` confiável, a contagem de bytes aborta o stream ao passar do limite (413) e apaga o parcial. Extensões aceitas: `.mp4 .mov .m4v .webm .mkv .avi .mp3 .wav .m4a .ogg .aac .flac`; os primeiros bytes têm de bater com a extensão (`ftyp` no deslocamento 4 para mp4, mov, m4v e m4a; EBML `1A 45 DF A3` para webm e mkv; `ID3` ou sincronismo MPEG `FF Ex` para mp3 e aac; `RIFF....WAVE` para wav e `RIFF....AVI ` para avi; `OggS`; `fLaC`; `FF F1`/`FF F9` ADTS também vale para aac). Extensão fora da lista ou assinatura incoerente dão 415 (`formato_nao_aceito`, `assinatura_incoerente`); arquivo vazio, 422 (`arquivo_vazio`); nome ausente ou só espaços, 422. O nome enviado é sanitizado (`sanitizarNome`), serve só de título e exibição e nunca entra em caminho (PR-13). O arquivo é gravado antes da linha (PR-47) e qualquer falha apaga o diretório da fonte. A fonte nasce `pendente`, tipo `video` (também para áudio puro).
**Por quê:** stream em disco com contagem de bytes mantém a memória constante; a assinatura real barra arquivo renomeado; o limite de 2000 MB nasce do tipo do campo.
**O que invalida:** se o deploy tiver proxy que limite o corpo abaixo de 500 MB (o operador baixa `MAX_VIDEO_MB`), se vídeos acima de 2 GB forem necessários (exige `BigInt` e outra migration) ou se faltar suporte a corpo em stream no servidor de produção (a task prova isso por teste contra `next start`).
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-08

---

### PR-72 — Pipeline de áudio com ffmpeg e segmentos de 10 minutos

**Assunto:** F2 da FT-08 — PR-09, ffmpeg no servidor
**Decisão:** `src/lib/midia.ts` chama `ffprobe` e `ffmpeg` por `spawn` com vetor de argumentos e sem shell, só com caminhos internos gerados pelo servidor. Os binários vêm de `FFMPEG_PATH` e `FFPROBE_PATH` (padrão `ffmpeg` e `ffprobe` no `PATH`). `sondar` devolve a duração e se há faixa de áudio; sem áudio é erro claro e duração acima de `MAX_VIDEO_MINUTOS` (padrão 180) também. `extrairAudio` gera MP3 mono, 16 kHz, 32 kbps e `dividirEmSegmentos` corta em partes de 10 minutos (600 s) sem reencodar. Cada processo tem prazo (sonda 30 s, extração 30 min, divisão 5 min) e a saída de erro é lida com teto e nunca mostrada ao usuário. Binário ausente vira `Não encontrei o ffmpeg neste servidor. Instale o ffmpeg ou use a imagem de contêiner do projeto.` `verificarMidia()` informa se os dois binários respondem, para o health check da FT-11. Os temporários (`audio/` na pasta da fonte) são apagados ao fim, com sucesso ou erro. Os testes geram a mídia com `lavfi` e usam `describe.skipIf(!ffmpegDisponivel)` localmente; o CI instala ffmpeg e define `EXIGIR_FFMPEG=1`, que faz a ausência falhar.
**Por quê:** MP3 de 32 kbps mono perde pouco para fala e mantém cada parte em cerca de 2,4 MB; dez minutos mantém a transcrição por parte curta e permite retomar sem pagar de novo; a sonda evita gastar crédito com arquivo sem áudio.
**O que invalida:** se o servidor não puder ter ffmpeg (PR-09 já o declara), se a transcrição exigir áudio de maior qualidade (música, ruído) ou se o modelo escolhido recusar partes de 10 minutos.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-08

---

### PR-73 — Transcrição por parte e modelo de transcrição configurável

**Assunto:** F2 da FT-08 — PR-06, PR-09, PR-14 e PR-22 aplicados ao áudio
**Decisão:** `transcreverAudio({chave, modelo, audioBase64, formato, sinal})` em `src/lib/openrouter.ts` envia `chat/completions` sem stream, com uma parte de texto fixa (transcrever fielmente a fala no idioma falado, sem resumo e sem comentários, devolver só o texto) e uma parte `input_audio` com o MP3 em base64. Prazo total de 5 minutos por parte, cancelável por `sinal`; erros pelo `erroDoProvedor` (`provedor_*`); resposta sem texto vira `transcricao_vazia` (502). O modelo vem, nesta ordem, de `ConfiguracaoDoWorkspace.modeloDeTranscricao` (só o admin altera, em Configurações > Integrações), da variável `OPENROUTER_MODELO_TRANSCRICAO` e da constante `MODELO_DE_TRANSCRICAO_PADRAO` (`google/gemini-2.5-flash`, exemplo da documentação do OpenRouter). O campo é texto livre (1 a 100 caracteres, `A-Za-z0-9._:/-`): o adaptador não sabe quais modelos aceitam áudio. Falha transitória (`provedor_indisponivel`, `provedor_tempo_esgotado`, `provedor_limite`, `transcricao_vazia`) é repetida até 2 vezes por parte, com espera curta injetável; chave inválida, sem saldo ou modelo inválido não são repetidos. A tela avisa que a transcrição consome créditos do OpenRouter e mostra o modelo em uso.
**Por quê:** a lista de modelos do OpenRouter não informa modalidade de áudio, então a escolha é do admin com um padrão que a documentação cita; repetir só o transitório evita gastar crédito à toa.
**O que invalida:** se o OpenRouter passar a expor a modalidade na lista de modelos (o seletor poderia filtrar), se o modelo padrão deixar de existir ou se for exigida estimativa de custo antes de transcrever.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-08

---

### PR-74 — Fila de vídeo: concorrência 1, andamento e retomada por parte

**Assunto:** F2 da FT-08 — PR-05 e PR-48 estendidos ao trabalho pesado
**Decisão:** A fila ganha duas raias: a leve (texto, arquivo e YouTube, concorrência 2) e a de mídia (`video`, concorrência 1), que rodam ao mesmo tempo sem uma bloquear a outra. A fonte de vídeo grava `etapa` e `progresso` no banco a cada passo (`Verificando o arquivo`, `Extraindo áudio`, `Dividindo em partes`, `Transcrevendo parte N de M`, `Montando o texto`), por atualização condicional ao status `processando`. O texto de cada parte é gravado em `<STORAGE_DIR>/fontes/<agenteId>/<fonteId>/segmentos/NN.txt` (NN com dois dígitos, base 0) logo que volta do modelo; ao reprocessar ou retomar depois de um reinício, a parte que já tem arquivo não é transcrita de novo. Ao concluir, o áudio extraído e os segmentos são apagados, o original é mantido, as partes são juntas com o marcador de tempo no começo de cada uma (`[00:00]`, `[10:00]`, `[1:00:00]` a partir de uma hora) e o texto segue para o mesmo `normalizarTexto`, `dividirEmTrechos` e gravação de trechos (e o índice FTS5 pelos gatilhos). Falha de uma parte grava `erro` com `Falha na parte N de M: <mensagem>` e mantém os segmentos já feitos; Reprocessar volta a `pendente` e retoma das partes que faltam. Fonte excluída durante o trabalho para a transcrição das partes seguintes (a linha é conferida antes de cada parte). `etapa` e `progresso` voltam a nulo no `pronto`; `duracaoSegundos` fica.
**Por quê:** a fila de 2 raias evita que um vídeo longo trave texto e arquivos e que dois vídeos disputem CPU e crédito; gravar a parte em disco é o que faz a retomada barata.
**O que invalida:** se rodar em mais de um processo (PR-05), se a máquina aguentar mais de um ffmpeg ao mesmo tempo ou se o transcritor passar a cobrar tão pouco que repetir tudo compense a complexidade.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-08

---

### PR-75 — YouTube por legendas e sua fragilidade

**Assunto:** F2 da FT-08 — PR-09, link do YouTube
**Decisão:** `src/lib/youtube.ts` extrai o id de `youtube.com/watch?v=`, `youtu.be/`, `/shorts/` e `/embed/` (11 caracteres de `A-Za-z0-9_-`); lê a página `watch?v=<id>` em `YOUTUBE_BASE` (padrão `https://www.youtube.com`), acha `ytInitialPlayerResponse` e dele `videoDetails.title` e `captionTracks`; escolhe a faixa (manual em português, depois manual em inglês, depois a primeira manual, depois automática, nesta ordem de idioma) e baixa o texto com `fmt=json3`, aceitando também XML. SSRF: a URL do usuário só serve para extrair o id e precisa ter host `youtube.com`, `www.youtube.com`, `m.youtube.com` ou `youtu.be` (outro host é 422); o servidor nunca conecta ao host da URL do usuário, só à base configurada; a `baseUrl` da legenda só é seguida se o host for `*.youtube.com` (ou o host da base configurada) e a conexão use o mesmo esquema; no máximo uma volta de redirect, com o host conferido de novo; prazo de 15 s por requisição e teto de 3 MB para a página e 5 MB para a legenda, lidos em stream. Sem faixa: `Este vídeo não tem legendas disponíveis. Baixe o vídeo e envie o arquivo para transcrever.` O texto ganha um marcador `[MM:SS]` a cada cerca de 60 s de vídeo. O título do vídeo substitui o título provisório da fonte, se o usuário não deu um. Não usa a API oficial nem baixa o vídeo, e não consome créditos. **Fragilidade assumida:** o YouTube muda o formato da página e das legendas sem aviso e pode bloquear o servidor; o recurso pode quebrar sem mudança de código. Os testes usam o servidor simulado `tests/apoio/youtube-falso.ts` com páginas e legendas de fixture; nenhum teste fala com o YouTube real.
**Por quê:** a API oficial exige chave e autorização do dono do vídeo para baixar legenda; ler a página é o único caminho sem credencial. O host fixo e o id extraído eliminam a requisição a destino arbitrário.
**O que invalida:** se o formato da página mudar (o erro vira `Não foi possível ler as legendas deste vídeo`), se o YouTube bloquear o IP do servidor, se a política de uso do YouTube proibir a leitura automatizada ou se a empresa preferir a API oficial com credencial própria.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-08

---

### PR-76 — Contrato HTTP e tela do vídeo

**Assunto:** F2 da FT-08 — interface entre handler, serviço e tela
**Decisão:** `POST .../fontes/video?nome=` responde 202 com `{fonte}`; `POST .../fontes/youtube` (JSON `{url}`, zod) responde 202 com `{fonte}`. Erros no formato `{codigo, mensagem}`: 401, 404 (agente), 413, 415, 422. `FonteVisivel` ganha `progresso`, `etapa`, `duracaoSegundos` e `urlOrigem`, nunca o caminho. A aba Conhecimento ganha a opção Vídeo com duas abas internas, "Enviar arquivo" (zona de soltar, um arquivo por vez, tipos e limite visíveis, barra de progresso real do envio por `XMLHttpRequest` com o corpo bruto, aviso de créditos e modelo em uso) e "Link do YouTube" (campo com validação imediata e nota de que usa as legendas). A lista mostra ícone de vídeo, barra de progresso e etapa enquanto processa, duração, link de origem do YouTube (só http ou https de host do YouTube, `rel="noopener noreferrer"`), erro, Reprocessar e Excluir; "Ver conteúdo" mostra os trechos com os marcadores de tempo e a duração. Configurações > Integrações ganha o campo Modelo de transcrição (admin). O polling de 2 s já existente atualiza `etapa` e `progresso`.
**Por quê:** reaproveita o contrato e a tela da FT-04 (PR-49) e acrescenta só o que é de vídeo.
**O que invalida:** se a empresa quiser enviar vários vídeos de uma vez ou retomar um upload interrompido (upload em partes, outra feature).
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-08

---

### PR-77 — Variáveis de ambiente e simulados da FT-08

**Assunto:** F2 da FT-08 — PR-26 e CONVENCOES (configuração só em `ambiente.ts`, HTTP de saída simulado)
**Decisão:** `MAX_VIDEO_MB` (500), `MAX_VIDEO_MINUTOS` (180), `FFMPEG_PATH` (`ffmpeg`), `FFPROBE_PATH` (`ffprobe`), `OPENROUTER_MODELO_TRANSCRICAO` e `YOUTUBE_BASE` (`https://www.youtube.com`, sem barra final, só para o simulado de teste) são lidas só em `src/lib/ambiente.ts` e documentadas no `.env.example` e no README; as numéricas exigem inteiro positivo. Nenhum teste chama a rede real: `tests/apoio/openrouter-falso.ts` passa a reconhecer `input_audio` e devolver transcrição configurável por parte, falha e latência por parte, sem quebrar os testes existentes; `tests/apoio/youtube-falso.ts` serve a página e as legendas de fixture. A verificação de produção aponta `OPENROUTER_BASE_URL` e `YOUTUBE_BASE` para os simulados (a base do YouTube não depende de `NODE_ENV`, como `OPENROUTER_BASE_URL`).
**Por quê:** mesmo padrão das variáveis de URL base das features anteriores (PR-70).
**O que invalida:** se a empresa chamar o YouTube ou o OpenRouter reais em teste de integração (exige credencial e rede dela, PEND-06).
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-08

---

### PR-78 — Rótulo mascarado do interlocutor no histórico

**Assunto:** F2 da FT-09 — PR-18 (dado pessoal) e PR-12
**Decisão:** o histórico mostra o interlocutor por um rótulo que mascara dado pessoal: widget = "Visitante " mais os 6 primeiros caracteres do `visitanteId`; telegram = o `titulo` da conversa ("Telegram: Nome", nunca `@usuario` nem id do chat); painel = nome do usuário, ou "Usuário removido" quando o usuário não existe mais. O `identificadorExterno` completo não chega à interface, ao nome do arquivo exportado nem ao ouvinte `aoApagarConversa`. Qualquer usuário autenticado lê e apaga todas as conversas (PR-12), verificado no servidor.
**Por quê:** o histórico é visível a toda a equipe e o texto livre já pode ter dado pessoal; mostrar só o necessário para distinguir interlocutores reduz a exposição, sem a FT-10.
**O que invalida:** se a empresa exigir que só admin leia conversas, ou que o identificador completo apareça para atendimento.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-09

---

### PR-79 — Busca por texto do histórico: LIKE limitado

**Assunto:** F2 da FT-09 — PR-13, PR-30 e CONVENCOES (texto do usuário nunca concatenado em SQL)
**Decisão:** o filtro de texto usa `LIKE ... ESCAPE '\'` parametrizado sobre `Mensagem.conteudo`, com `%`, `_` e `\` do usuário escapados; o texto tem no máximo 200 caracteres; no máximo 200 conversas casadas entram no resultado; sem FTS novo nem índice novo. O `LIKE` do SQLite ignora maiúsculas só em ASCII (letras acentuadas diferenciam), e isso fica registrado como limite conhecido.
**Por quê:** mantém o escopo (PR-04 reserva o FTS5 às fontes) e evita migration pesada; 200 casadas cobrem o uso de um workspace pequeno.
**O que invalida:** se o volume passar de dezenas de milhares de mensagens (a varredura fica lenta) ou se a busca insensível a acento for requisito.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-09

---

### PR-80 — Apagar em lote e ponto de extensão da auditoria

**Assunto:** F2 da FT-09 — PR-18 (parte de apagar conversa) e PR-19
**Decisão:** `apagarConversa` e `apagarConversas` (no máximo 50 ids por pedido, uma transação, cascata nas mensagens, só apaga o que existe e devolve a contagem) emitem `aoApagarConversa` com `{conversaId, agenteId, canal, usuarioId, quantidadeDeMensagens}`, nunca o conteúdo nem o identificador externo; nada é gravado em auditoria nesta feature (a FT-10 registra o ouvinte). Confirmação de apagar é na própria tela, sem `window.confirm`. A retenção automática, a exclusão de usuário e o aviso de privacidade seguem sendo da FT-10.
**Por quê:** o mesmo padrão de `aoAlterarCanal` (FT-07) deixa a auditoria ligável sem acoplar as features; o limite de 50 protege a transação e a tela.
**O que invalida:** se a empresa quiser apagar por filtro inteiro (todas as conversas de um agente) ou desfazer a exclusão.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-09

---

### PR-81 — Painel inicial: números, gráfico e fuso do servidor

**Assunto:** F2 da FT-09 — PR-27 (painel inicial) e PR-23 (acessibilidade)
**Decisão:** o painel mostra agentes, fontes prontas e com erro, conversas (com ao menos uma mensagem na janela) e mensagens dos últimos 7 dias, de hoje e dos 6 dias locais anteriores, com quebra por canal, mensagens por dia nos últimos 14 dias e as 5 conversas mais recentes. A agregação é SQL parametrizado (`$queryRaw`) no serviço `src/servicos/painel.ts`; o dia é o do fuso do servidor (mesma convenção do teto diário, PR-57); dias sem mensagem entram com zero. O gráfico é SVG com `role="img"` e rótulo, mais tabela equivalente para leitor de tela, e distingue séries por texto e forma, nunca só por cor.
**Por quê:** o teto diário já usa a meia-noite do servidor; manter um só fuso evita números que não batem entre telas.
**O que invalida:** se a empresa atender em fuso diferente do servidor ou quiser períodos escolhidos pelo usuário.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-09

---

### PR-82 — Lista de primeiros passos do painel

**Assunto:** F2 da FT-09 — PR-25 (demonstração) e PR-14 (chave nunca vai ao navegador)
**Decisão:** o painel mostra uma lista de primeiros passos (chave do OpenRouter configurada, primeiro agente criado, primeira fonte pronta, chat publicado ou canal conectado) que se oculta sozinha quando todos estão feitos; o passo da chave só leva ao link de Integrações para admin (para usuário comum aparece sem link), e a tela nunca recebe a chave nem a máscara, só um booleano.
**Por quê:** orienta quem chega a uma instalação vazia sem criar tela de onboarding à parte.
**O que invalida:** se a empresa preferir um assistente de configuração em tela própria.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-09

---

### PR-83 — Exportação de conversa em texto e contrato HTTP do histórico

**Assunto:** F2 da FT-09 — PR-13 e PR-18
**Decisão:** `GET /api/conversas/[id]/exportar` devolve `text/plain; charset=utf-8` com `Content-Disposition: attachment` de nome fixo `conversa-<id>.txt` (id interno da conversa, nunca rótulo, nome ou identificador externo), `Cache-Control: no-store` e `nosniff`; o texto leva agente, canal, rótulo mascarado, horários e mensagens, sem fontes em trecho. `DELETE /api/conversas/[id]` e `POST /api/conversas/apagar` exigem sessão (401), id inexistente é 404 e lote vazio, acima de 50 ou com id inválido é 422.
**Por quê:** nome sem dado pessoal evita vazar o interlocutor por nome de arquivo; o contrato espelha os handlers já existentes.
**O que invalida:** se a empresa precisar de exportação em CSV ou JSON, ou de exportação em massa.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-09

---

### PR-84 — Conversas fictícias da seed

**Assunto:** F2 da FT-09 — PR-25
**Decisão:** a seed acrescenta ao agente de exemplo duas conversas fictícias com id fixo (uma do painel, do usuário de demonstração, outra do widget com `visitanteId` fictício), com mensagens e fontes que citam a fonte de exemplo; só cria se não existirem (idempotente); continua recusando `NODE_ENV=production`; nenhum dado real.
**Por quê:** sem conversa as telas novas nasceriam vazias no roteiro do QA.
**O que invalida:** nada.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-09

---

### PR-85 — Tokens de canal e de série do gráfico

**Assunto:** F2 da FT-09 — PR-23 (tokens semânticos, nenhuma cor literal)
**Decisão:** as cores das badges de canal (painel, widget, telegram) e das séries do gráfico entram como tokens novos em `src/estilos/tokens.css`, nos três blocos (claro e dois escuros idênticos), com contraste de 4,5:1 conferido por `tests/tokens.test.ts`; a diferença entre canais é também por texto e padrão (rótulo e hachura), nunca só cor.
**Por quê:** o conjunto atual de tokens não tem série categórica; criar token mantém a regra de nenhum valor literal em componente.
**O que invalida:** se a identidade visual da marca (PEND-02) trocar a paleta: basta redefinir os tokens.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-09

---

### PR-86 — Trilha de auditoria somente-acréscimo e ligação dos ouvintes

**Assunto:** F2 da FT-10 — PR-19
**Decisão:** `RegistroDeAuditoria` (`id`, `quando`, `usuarioId` com `SET NULL`, `usuarioRotulo` "Nome <e-mail>" gravado na hora da ação, `acao` de conjunto fechado validado por zod, `alvoTipo`, `alvoId` opcional, `detalhes` JSON de até 1000 caracteres, índices em `quando` e `acao`). `detalhes` nunca leva segredo, máscara de chave, conteúdo de conversa nem identificador de visitante ou de chat; só nomes de campos, contagens e ids internos. O serviço só expõe `registrar` e `listar`; nenhuma rota ou ação apaga ou altera registro, e só o expurgo por idade (365 dias, `AUDITORIA_RETENCAO_DIAS`) remove linhas. `aoAlterarCanal` e `aoApagarConversa` são ligados por `ligarAuditoria()`, idempotente, chamada por `src/instrumentation.ts`; o conjunto de ouvintes dos dois serviços passa a viver em `globalThis` para valer mesmo que o Next carregue o módulo mais de uma vez.
**Por quê:** uma trilha que o admin não consegue editar é o que a torna confiável; e a recomendação de retenção curta de log limita o próprio dado pessoal que a trilha guarda (o rótulo do usuário).
**O que invalida:** se a empresa exigir guarda de auditoria por mais de um ano (aumente `AUDITORIA_RETENCAO_DIAS`) ou assinatura criptográfica dos registros (a trilha atual não prova inviolabilidade contra quem tem acesso ao arquivo do banco).
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-10

---

### PR-87 — Falha de gravação da auditoria: transação para o crítico, melhor esforço para o resto

**Assunto:** F2 da FT-10 — PR-19
**Decisão:** troca e remoção da chave do OpenRouter, criação, edição e exclusão de usuário e exclusão de agente gravam a auditoria na mesma transação da ação: se a auditoria falha, a ação não acontece. Modelo de transcrição, retenção, canal, conversa apagada, dados do titular e expurgo gravam logo depois da ação, e uma falha vira uma linha JSON de log (`evento: auditoria_falhou`, ação e erro, sem detalhes) sem derrubar a ação já confirmada.
**Por quê:** nas ações que mudam acesso, custo ou apagam dado de terceiros, agir sem deixar rastro é pior do que não agir; nas demais a ação já está confirmada e desfazê-la por causa do log seria pior.
**O que invalida:** se a empresa preferir que nenhuma ação dependa da auditoria (inverta para gravação imediata em todas) ou exigir transação em todas.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-10

---

### PR-88 — Exclusão definitiva de usuário preserva o conteúdo da empresa

**Assunto:** F2 da FT-10 — PR-18
**Decisão:** `excluirDefinitivamente(id, adminId)` só para admin, recusa excluir a si mesmo e o último admin ativo (409). Numa transação: os agentes criados pelo usuário passam ao admin que exclui (`Agente.criadoPorId` é obrigatório com chave estrangeira restritiva, e torná-lo anulável exigiria recriar a tabela `agentes` por migration destrutiva), `Conversa.criadoPorId` e `Fonte.criadoPorId` ficam nulos pela regra `SET NULL` já existente, `ConfiguracaoDoWorkspace.atualizadoPor` igual ao id vira nulo, o usuário é apagado e a auditoria `usuario_excluido` leva o rótulo dele. Agentes, conversas e fontes permanecem. A sessão do usuário deixa de valer porque `usuarioDaSessao` exige que a conta exista. A confirmação na tela exige digitar o e-mail do usuário.
**Por quê:** o conteúdo (agentes, base, conversas) é da empresa, não da pessoa; evita migration destrutiva no esquema de agentes e mantém todo agente com um responsável.
**O que invalida:** se a empresa quiser que o agente fique sem responsável (torne `criadoPorId` anulável por migration com a marca `-- destrutiva-autorizada` e backup antes) ou que a exclusão apague também o que o usuário criou.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-10

---

### PR-89 — Retenção das conversas e expurgo automático

**Assunto:** F2 da FT-10 — PR-18
**Decisão:** `ConfiguracaoDoWorkspace.retencaoDiasConversas` (inteiro, padrão 90, faixa de 7 a 3650; `null` significa "sem expurgo automático", escolha explícita do admin com aviso de risco). O expurgo apaga em lotes de 500 as conversas com `atualizadoEm` estritamente anterior a agora menos N dias (instante exato, em UTC, sem depender do `TZ`), com as mensagens em cascata; a conversa que está exatamente no limite fica. Roda 1 minuto depois da subida e a cada 6 horas, sem sobreposição, com relógio injetável. Também purga as atualizações do Telegram com mais de 7 dias (reaproveita `purgarAtualizacoes`) e os registros de auditoria com mais de 365 dias, mesmo com a retenção de conversas desligada. Registra `expurgo_automatico` só com contagens (conversas, mensagens, atualizações, registros de auditoria) e só quando algo foi apagado. A tarefa vale por processo (PR-05) e uma falha dela nunca derruba o servidor.
**Por quê:** 90 dias é a recomendação de retenção curta para dado pessoal de atendimento; o limite mínimo de 7 dias evita configuração que apaga conversa ativa; lotes de 500 mantêm cada transação curta no SQLite.
**O que invalida:** se a empresa tiver exigência de guarda maior que 3650 dias, ou se a regra de retenção for por agente ou por canal (hoje é uma só por workspace).
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-10

---

### PR-90 — Direitos do titular: admin e visitante

**Assunto:** F2 da FT-10 — PR-18
**Decisão:** O admin, em Configurações > Privacidade, busca por canal e identificador (widget: o id completo ou um prefixo de pelo menos 6 caracteres, e a busca lista os titulares casados com contagem de conversas e última atividade para desambiguar; Telegram: o id numérico do chat), vê o resumo, exporta (JSON e TXT, nome `titular-<canal>-<data>` sem o identificador, `no-store`, `nosniff`) e apaga todas as conversas do titular, o que avisa `aoApagarConversa` por conversa e grava `dados_do_titular_apagados` e `dados_do_titular_exportados` só com contagens. O visitante do chat embutido apaga a própria conversa por `DELETE /api/publico/agentes/[id]/conversa` com o id no cabeçalho `X-Visitante-Id`: só as conversas dele naquele agente, exige agente ativo, a `Origin` da plataforma (como o POST) e o limite de uso por IP e agente; depois limpa o estado local. A exclusão feita pelo visitante é auditada como `conversa_apagada` com `usuarioId` nulo e rótulo "Visitante (chat embutido)", sem o identificador dele.
**Por quê:** cumpre os direitos de acesso e eliminação do titular sem expor o identificador completo em tela de lista; o prefixo de 6 caracteres é o que a lista de conversas mostra (PR-78).
**O que invalida:** se a empresa exigir verificação de identidade do titular antes de entregar a exportação (o fluxo é do admin, que atende o pedido por fora), ou exportação por e-mail ao titular.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-10

---

### PR-91 — Aviso de privacidade padrão do workspace e painel de dados tratados

**Assunto:** F2 da FT-10 — PR-18
**Decisão:** `ConfiguracaoDoWorkspace` guarda `avisoDePrivacidadePadrao` (até 300 caracteres) e `avisoDePrivacidadePadraoUrl` (http ou https, até 500). O chat embutido usa o aviso do agente quando ele tem texto e, se não tem, o do workspace; o `/start` do Telegram anexa o aviso padrão (com a URL) à mensagem inicial quando configurado. A tela Privacidade traz o painel somente leitura "Dados pessoais tratados" com texto fixo (campos por canal, finalidade de atendimento, retenção atual lida da configuração, onde ficam e quem acessa) e a base legal escrita como "legítimo interesse, a confirmar pela empresa", sem afirmar parecer jurídico.
**Por quê:** o aviso precisa chegar ao titular em todos os canais e a base legal é decisão da empresa, não do sistema.
**O que invalida:** se a base legal for consentimento (o chat precisaria de aceite antes do primeiro envio) ou se o texto do painel precisar de revisão jurídica.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** true
**Realizada em:** FT-10

---

### PR-92 — Log estruturado, níveis e redação central

**Assunto:** F2 da FT-11 — PR-21
**Decisão:** `src/lib/log.ts` é o único ponto de saída do log do servidor. Cada evento é uma linha JSON com `nivel` (`debug`, `info`, `aviso`, `erro`), `quando` (ISO em UTC), `msg` (nome curto do evento, em minúsculas com sublinhado), `correlacao` (quando há) e os campos do evento. O nível mínimo vem de `LOG_LEVEL` (padrão `info`). A redação é central e por chave: valor de chave que contém senha, token, chave, `authorization`, `cookie`, `secret`, conteúdo ou texto de mensagem de conversa vira `[oculto]`, e-mail vira `a***@dominio`, e valor com cara de segredo (chave `sk-`, texto cifrado `v1:`, token de bot, JWT, `Bearer`) é ocultado mesmo em chave inocente; um `Error` sai só com o nome e o código, nunca a mensagem nem a pilha. Nenhum `console.*` existe em `src/` fora de `log.ts` (teste de arquitetura e regra de lint; `prisma/seed.ts`, `scripts/` e `tests/` são exceções declaradas, porque são saída de comando de linha de comando). Os testes que liam `evento` passam a ler `msg`.
**Por quê:** Evita que um segredo ou um texto de visitante chegue ao arquivo de log por descuido de quem escreve o evento: a proteção é do módulo, não da memória de cada autor.
**O que invalida:** se a hospedagem exigir outro formato de log (campo `severity`, `timestamp` numérico), ou se o operador quiser o texto técnico das mensagens de erro no log (o log mostra só o nome do erro).
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-11

---

### PR-93 — Correlação por requisição e código de referência

**Assunto:** F2 da FT-11 — PR-21 e PR-42
**Decisão:** Toda resposta do servidor sai com `X-Correlacao` (8 caracteres hexadecimais gerados no `src/proxy.ts`, que passa a cobrir todas as rotas menos `/_next/` e arquivos estáticos; o valor que o cliente mandar é ignorado). O código vai ao handler pelo cabeçalho de requisição `x-correlacao` e aos trabalhos em segundo plano por `AsyncLocalStorage` (`comCorrelacao`). Erro inesperado de rota de API e de ação de servidor devolve a mensagem genérica com "Código de referência: <correlação>", nunca a pilha; erro de página mostra o `digest` que o Next gera, e o hook `onRequestError` grava a linha `erro_na_requisicao` com o `digest`, a correlação, a rota e o nome do erro, de modo que o código mostrado na tela se acha no log. `error.tsx`, `global-error.tsx` e `not-found.tsx` existem na raiz de `src/app`, em estilo SaaS, com o código de referência. `gerarCorrelacao` de `chat-erros` passa a delegar para `src/lib/log.ts` (PR-42 mantido).
**Por quê:** O operador liga o que o usuário viu ao log sem expor pilha nem mensagem do erro (L17).
**O que invalida:** se o usuário precisar de um código único que valha em página e em API (hoje a página usa o `digest` do Next e a API usa a correlação, ambos na mesma linha de log).
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-11

---

### PR-94 — Configuração validada no start; produção exige as três variáveis

**Assunto:** F2 da FT-11 — PR-21, L20
**Decisão:** `validarAmbiente()` (`src/lib/ambiente.ts`), chamada por `src/instrumentation.ts` antes de qualquer tarefa, só age com `NODE_ENV=production`: `JWT_SECRET` (32 caracteres ou mais), `DATABASE_URL` e `ENCRYPTION_KEY` (32 bytes em hexadecimal ou base64, a mesma regra de `cripto.ts`) são obrigatórias e, se ausentes ou inválidas, derrubam o start com uma mensagem que lista os nomes (nunca os valores); variável opcional com formato inválido (inteiro, `LOG_LEVEL`) entra na mesma lista. `APP_URL` ausente ou sem HTTPS em produção gera só um aviso no log, porque o chat embutido e o Telegram dependem dela mas o sistema funciona sem. Em desenvolvimento e teste o comportamento lazy da `ENCRYPTION_KEY` continua: isto especializa a decisão D-02 da FT-02 (chave exigida só ao cifrar) apenas para produção, onde um servidor sem chave só falharia quando o admin salvasse a chave do OpenRouter.
**Por quê:** Uma instalação em produção sem `ENCRYPTION_KEY` deve falhar na subida, com mensagem clara, e não quando alguém usar o recurso.
**O que invalida:** se o operador quiser subir produção sem `ENCRYPTION_KEY` para usar só o chat sem OpenRouter ou Telegram (hoje isso é impossível: precisa definir a chave).
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-11

---

### PR-95 — Saúde: endpoint mínimo e tela de detalhe; degradado não é falha

**Assunto:** F2 da FT-11 — PR-21
**Decisão:** `GET /api/saude` é público, sem sessão, `Cache-Control: no-store`, e devolve só `{status}` com `ok`, `degradado` ou `falha`. HTTP 200 para `ok` e `degradado`, 503 para `falha`. Confere o banco (`SELECT 1` com prazo de 3 segundos), o diretório de dados gravável (grava e apaga um arquivo de prova em `STORAGE_DIR`) e a tabela FTS5 `trechos_fts`; qualquer um deles falho é `falha`. `ffmpeg` ou `ffprobe` ausente é `degradado` (só o vídeo deixa de funcionar); o resultado da sonda de mídia é guardado por 60 segundos para o endpoint público não poder ser usado para disparar processos em série. O detalhe (versões, tamanhos, fila, agendador, configuração) só existe na tela Configurações > Sistema, para admin. Métrica e rastreamento distribuído ficam de fora (PROJETO.md).
**Por quê:** O healthcheck do contêiner e do balanceador precisa de uma resposta barata e sem dado interno; o detalhe é do admin.
**O que invalida:** se o operador quiser que o `degradado` derrube o healthcheck do contêiner (hoje ele só reinicia em `falha`), ou métricas no formato Prometheus.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-11

---

### PR-96 — Formato e consistência do backup

**Assunto:** F2 da FT-11 — PR-20
**Decisão:** O backup é um único arquivo `backup-AAAAMMDD-HHMMSS.tar.gz` (UTC), gravado com permissão 0600 em `BACKUP_DIR` (padrão `./backups`), com `manifest.json` (formato, data, versão do app, migrations aplicadas, contagens por tabela e SHA-256 de cada parte), o banco em `banco/app.db` e os arquivos em `storage/`, sem temporários (`audio/`, `segmentos/`, `*.parcial`). O banco é copiado pela API de backup online do `better-sqlite3`, que copia páginas e preserva o `rowid` (o `VACUUM INTO` renumera o `rowid` de `trechos` e desalinha o índice FTS5; a cópia crua do arquivo em uso pode sair inconsistente), e a cópia é conferida por `PRAGMA integrity_check` antes de entrar no arquivo. A compactação usa o pacote `tar` (versão fixa) em processo, sem shell. A retenção `BACKUP_MANTER` (padrão 7) remove só os arquivos cujo nome segue o padrão acima. Dois backups ao mesmo tempo no mesmo processo são recusados (409). O backup pode ser gerado pela tela Sistema ou por `npm run backup`, que agenda por cron do sistema (documentado), sem agendador interno.
**Por quê:** O backup precisa ser restaurável: consistente, completo e verificável sem ser aberto.
**O que invalida:** se a hospedagem já fizer snapshot do volume com restauração testada (PR-20), ou se o `storage/` for grande a ponto de pedir backup incremental (hoje é sempre completo).
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-11

---

### PR-97 — O backup não contém a ENCRYPTION_KEY

**Assunto:** F2 da FT-11 — PR-14 e PR-20
**Decisão:** O arquivo de backup leva os segredos cifrados (chave do OpenRouter, tokens do Telegram) mas nunca a `ENCRYPTION_KEY`, e leva dado pessoal (conversas, e-mails, hashes de senha). Quem restaura precisa da mesma `ENCRYPTION_KEY` para as chaves cifradas voltarem a funcionar; sem ela o resto dos dados volta e o operador cadastra de novo a chave do OpenRouter e reconecta o Telegram. O README e a tela Sistema dizem isso com destaque, e o operador guarda a chave num cofre separado do backup.
**Por quê:** Guardar a chave junto do arquivo derrotaria a cifra em repouso (PR-14).
**O que invalida:** se o operador preferir um backup autossuficiente (nesse caso, a cifra do próprio backup com senha seria uma feature nova).
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-11

---

### PR-98 — Restauração só por linha de comando, com validação antes de tocar

**Assunto:** F2 da FT-11 — PR-20
**Decisão:** `npm run restore -- <arquivo>` é o único caminho de restauração; não há restauração pela interface porque ela troca o banco sob um servidor de pé, derruba as sessões e exige parar a fila e o agendador, o que um clique de navegador não garante. O comando valida o `manifest.json` e os SHA-256 de todas as partes numa extração em diretório temporário, recusa esquema mais novo que o do app (migration desconhecida) e arquivo adulterado, truncado ou sem manifesto, tudo antes de tocar na instalação; recusa rodar se `/api/saude` responder na URL local (`PORT`, padrão 3000), salvo `--forcar`; guarda o estado atual em `BACKUP_DIR/pre-restauracao-<data>` (cópia consistente do banco e o `storage/` anterior movido); troca banco e `storage/` por renomeação no mesmo volume, com desfazer se algo falhar no meio; aplica `prisma migrate deploy` se o backup for de esquema mais antigo; reconstrói o índice FTS5; e grava a auditoria `restauracao` (ator Sistema) no banco já restaurado. O expurgo é por processo e não roda durante o comando; quem restaurar com o servidor de pé num desenho futuro deve chamar `obterAgendadorDoExpurgo().parar()` antes e `.iniciar()` depois.
**Por quê:** Restaurar é a operação mais destrutiva do sistema: precisa de validação completa antes e de um caminho de volta depois.
**O que invalida:** se o operador exigir restaurar pela interface (seria uma feature nova com parada controlada do servidor).
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-11

---

### PR-99 — Contêiner: imagem, usuário, volume, sinal e ferramentas de produção

**Assunto:** F2 da FT-11 — PR-24
**Decisão:** A imagem usa `node:22-bookworm-slim` (Node 22 como o CI e o README, Debian com `ffmpeg` em pacote), multi-estágio (instala e constrói com as dependências de desenvolvimento, depois poda), roda como usuário não-root, instala o `ffmpeg` (que traz o `ffprobe`), guarda tudo em `/data` (`DATABASE_URL=file:/data/app.db`, `STORAGE_DIR=/data/storage`, `BACKUP_DIR=/data/backups`) e tem `HEALTHCHECK` em `/api/saude`. O entrypoint aplica `prisma migrate deploy` e executa `next start` com `NEXT_MANUAL_SIG_HANDLE=1`; `register()` instala o desligamento limpo de `SIGTERM` (para o agendador do expurgo, deixa a fila terminar o passo corrente com prazo, espera as gravações de auditoria e sai). O `prisma` (CLI) e o `tsx` passam de `devDependencies` para `dependencies` porque a imagem de produção os executa (migrations, backup, restauração, criação do administrador). `TZ` é configurável e o padrão da imagem é `America/Sao_Paulo`. O HTTPS é do proxy reverso do operador (exemplo Caddy no README), com `TRUST_PROXY=1`.
**Por quê:** O contêiner precisa subir numa máquina limpa, sobreviver a reinício com os dados no volume e parar sem perder gravações.
**O que invalida:** se o dono quiser hospedar em plataforma serverless (PR-24) ou usar outra imagem base (Alpine exigiria recompilar `better-sqlite3` para musl).
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** true
**Realizada em:** FT-11

---

### PR-100 — Primeiro administrador de uma instalação limpa

**Assunto:** F2 da FT-11 — PR-12, PR-25 e PR-24
**Decisão:** A seed de demonstração nunca roda em produção (PR-25), então uma instalação limpa em contêiner não teria como entrar. `npm run admin:criar -- <e-mail> <nome>` cria o primeiro administrador lendo a senha de `ADMIN_SENHA` (ambiente do comando, no mínimo 8 caracteres; nunca em argumento) ou da entrada padrão, recusa e-mail que já existe, nunca imprime a senha e grava a auditoria `usuario_criado` com ator Sistema. Só existe para esta lacuna operacional; os demais usuários continuam sendo criados pela tela Usuários.
**Por quê:** Sem um primeiro administrador, o operador sobe o contêiner e não consegue entrar nem ver a tela Sistema.
**O que invalida:** se o dono preferir criar o administrador por variável de ambiente no primeiro start ou por um assistente de instalação na interface.
**Origem:** f2_autonoma
**Etapa:** b4
**Provisória:** false
**Realizada em:** FT-11

---

### PR-101 — Sair revoga a sessão: identificador `jti` e tabela de revogados

**Assunto:** F2 da FT-12 — PR-27, PR-31 (L4, "logout invalida de fato"), achado A-04 do B6
**Decisão:** Todo token de sessão leva um identificador `jti` (UUID gerado no login). `sair` grava o `jti` na tabela `sessoes_revogadas` (`jti`, `usuarioId`, `revogadaEm`, `expiraEm`; migration que só acrescenta), com `expiraEm` igual ao fim máximo possível daquela sessão (início da sessão mais `SESSAO_MAXIMA_HORAS`), e a validação de sessão (`usuarioDaSessao`, usada pelas páginas, ações, rotas e pelo proxy) recusa o token cujo `jti` está na tabela. Só a sessão que saiu é revogada: as outras sessões do mesmo usuário continuam valendo. O token renovado (PR-102) mantém o mesmo `jti`, então revogar uma vez cobre o token roubado antes e depois de qualquer renovação. Token sem `jti` (emitido antes desta feature) é recusado: cada usuário entra de novo uma vez. O expurgo existente apaga as linhas com `expiraEm` no passado (a revogação já não tem o que proteger). Se a gravação da revogação falhar, o cookie é apagado mesmo assim e a falha vai ao log pelo nome do erro.
**Por quê:** O B6 achou que `sair` só apagava o cookie: um token copiado antes do logout continuava valendo até 15 minutos. Revogação por identificador é o mínimo que torna o logout real sem trocar a autenticação sem estado por sessão em banco.
**O que invalida:** se o dono preferir sessão guardada em banco (cada requisição consulta a sessão, não o token) ou se o sistema rodar em mais de um processo com bancos separados (a tabela é por banco, não por processo, então vale com um banco só).
**Origem:** recursao
**Etapa:** b5
**Provisória:** false
**Realizada em:** FT-12

---

### PR-102 — Renovação deslizante da sessão e limite absoluto de duração

**Assunto:** F2 da FT-12 — PR-27, PR-31 (L4, "expiração curta com refresh"), achado A-04 do B6
**Decisão:** A sessão dura `JWT_TTL_SEGUNDOS` (padrão 900) a partir da última emissão e é renovada por atividade: em requisição autenticada que passa pelo `src/proxy.ts`, se já passou a metade da vida do token, o proxy reemite o cookie (mesmo `jti`, mesma versão, mesmo início, `iat` e `exp` novos) na resposta. A sessão nunca passa de `SESSAO_MAXIMA_HORAS` (padrão 12, lida só em `src/lib/ambiente.ts`) contados do login: o `exp` do token renovado é o menor entre "agora mais o TTL" e "início mais o máximo", e a validação recusa o token cujo início mais o máximo já passou. A renovação só ocorre para token válido, não revogado e de versão corrente, e não ocorre em requisição de Server Action (POST a uma página, com ou sem o cabeçalho `next-action`; a que faz `sair` ou trocar a senha grava o próprio cookie), embora um POST a `/api` renove, nas rotas públicas (`/embed`, `/api/publico`, `/api/telegram`, `/api/saude`) nem nas rotas de upload, que ficam fora do `matcher` do proxy; o uso só por upload, portanto, não estende a sessão. Falha na renovação não derruba o usuário: o proxy segue sem reemitir e as guardas dos handlers continuam decidindo. O relógio é injetável (parâmetro `agora` em segundos) nas funções de serviço e de biblioteca.
**Por quê:** Derrubar quem usa o sistema a cada 15 minutos era o preço do TTL curto; renovar por atividade mantém o TTL curto para quem some e o limite absoluto impede que um cookie roubado e renovado dure para sempre. O proxy é o único ponto do Next 16, além de ações e rotas, que pode gravar cookie, e já roda em Node.
**O que invalida:** se o dono quiser sessões que sobrevivem ao fechamento do navegador por dias ("lembrar de mim"), ou se o hospedeiro não permitir que o proxy grave cookie.
**Origem:** recursao
**Etapa:** b5
**Provisória:** false
**Realizada em:** FT-12

---

### PR-103 — Contador de versão de sessão no lugar do corte por relógio

**Assunto:** F2 da FT-12 — PR-31 (troca de senha invalida outras sessões), achado A-1 do B6
**Decisão:** `Usuario.versaoDaSessao` (inteiro, padrão 0) substitui o corte `sessoesValidasDesde = agora + 1 s`. O token carrega a versão (`v`) do usuário no momento do login; `trocarSenha` incrementa a versão numa só atualização junto da senha nova e devolve um token já com a versão nova; `usuarioDaSessao` recusa o token cuja versão é menor que a do usuário. Não há comparação de relógio, então um login feito no mesmo segundo da troca vale. A coluna `sessoesValidasDesde` permanece no banco (migration só acrescenta, e o teste de restauração a usa), deixa de ser lida e de ser gravada pela troca de senha. Os usuários existentes ficam com a versão 0 pelo padrão da coluna.
**Por quê:** O corte em segundos tinha uma janela em que o login legítimo logo depois da troca era derrubado; um contador inteiro não tem ambiguidade nem depende do relógio do servidor.
**O que invalida:** se uma nova forma de derrubar sessões (por exemplo "encerrar todas as sessões" pelo admin) exigir granularidade por dispositivo; aí a versão passa a ser por sessão em tabela.
**Origem:** recursao
**Etapa:** b5
**Provisória:** false
**Realizada em:** FT-12

---

### PR-104 — Guarda própria em toda tela e rota, provada por teste de arquitetura

**Assunto:** F2 da FT-12 — PR-12 (papéis verificados no servidor), ressalvas R-01 e R-02 do B6
**Decisão:** Toda página sob `src/app/(sistema)` chama `exigirUsuario()` ou `exigirUsuarioAdmin()` na própria página (o `layout.tsx` também chama, mas não conta como fronteira); toda página de `configuracoes/` chama `exigirUsuarioAdmin()`; toda rota sob `src/app/api` usa `usuarioAtual()` ou `exigirSessao()`, exceto uma lista explícita e comentada de rotas públicas por desenho (`saude`, as três de `publico/agentes/[id]`, e o webhook do Telegram, autenticado por segredo). Um teste de arquitetura enumera os arquivos e falha se um novo não tiver guarda ou não estiver na lista de exceções, e falha se uma exceção listada deixar de existir. Todo serviço que só o admin deve usar confere o papel por conta própria: `auditoria.listar` passa a receber o ator e a exigir admin.
**Por quê:** O B6 encontrou uma tela e um serviço que confiavam no layout ou na página; a defesa em profundidade só vale se uma tela nova esquecida for pega pelo teste, não pela revisão.
**O que invalida:** se a convenção de guarda passar a ser um único ponto central (por exemplo, o proxy decidir o acesso por rota); o teste então muda de forma, não de objetivo.
**Origem:** recursao
**Etapa:** b5
**Provisória:** false
**Realizada em:** FT-12

---

### PR-105 — Trecho de vídeo sem fala vira o marcador `[sem fala]`

**Assunto:** F2 da FT-13 — PR-09, lacuna 13, PEND-18
**Decisão:** um trecho de 10 minutos que o modelo devolve vazio (depois de uma única repetição) é gravado como o segmento `[sem fala]` e a transcrição segue; no texto final ele aparece como `[MM:SS] [sem fala]`. A fonte só falha, com `Não encontrei fala neste áudio.` (422, `transcricao_vazia`), se nenhum segmento tiver fala. Segmentos já gravados (inclusive `[sem fala]`) são reaproveitados na retomada e não são pagos de novo. O trecho do índice de busca (FTS5) feito só de marcadores de tempo e de `[sem fala]` não é indexado; o trecho que mistura fala e marcador é indexado como está, o que é inofensivo.
**Por quê:** o OpenRouter e os modelos de áudio podem devolver vazio para música e silêncio; derrubar uma aula de duas horas por 10 minutos de silêncio gasta crédito e deixa o usuário sem saída; uma repetição cobre o vazio acidental sem pagar três chamadas por trecho mudo.
**O que invalida:** um trecho sem fala deve ser decidido pela pessoa (parar e perguntar), ou o texto do marcador deve ser outro idioma ou formato; ou um modelo real devolver texto como "[música]" para o silêncio (isso passa como fala, e só o vazio é tratado).
**Origem:** recursao
**Etapa:** b5
**Provisória:** false
**Realizada em:** FT-13

---

### PR-106 — Corpo do upload de documento lido em stream com contagem de bytes

**Assunto:** F2 da FT-13 — PR-45, PEND-19
**Decisão:** a rota de envio de documentos lê o corpo em stream, conta os bytes e cancela a leitura ao passar do teto (`MAX_UPLOAD_MB` x 10 arquivos mais 1 MB de folga do multipart, o mesmo teto de PR-45), devolvendo 413 mesmo para corpo `chunked` sem `Content-Length`; só então o multipart é lido a partir do buffer já limitado. O `Content-Length` declarado continua recusando antes de ler.
**Por quê:** só o parse integral do corpo (`request.formData()`) fazia o servidor guardar quanto o cliente mandasse antes de conferir; a contagem de bytes limita a memória ao teto declarado, e o buffer limitado preserva o parser de multipart do runtime.
**O que invalida:** o teto de memória por envio de documento precisar ser menor que 10 arquivos do tamanho máximo (o piso real de memória é o próprio teto, 251 MB no padrão); ou o envio precisar ir para o disco em stream como o vídeo (feature nova).
**Origem:** recursao
**Etapa:** b5
**Provisória:** false
**Realizada em:** FT-13

---

### PR-107 — Extração pesada em processo filho encerrável

**Assunto:** F2 da FT-13 — PR-45, PEND-27
**Decisão:** a extração de PDF, DOCX e HTML da fila roda num processo filho (`node --import tsx`, arquivo `src/lib/extracao/trabalhador.ts`, bytes por entrada padrão e texto por saída padrão) que é encerrado com SIGKILL ao estourar o prazo de 120 s (`extracao_demorou`, a fonte vira `erro` com mensagem clara), com memória limitada. O limite de 500 páginas é conferido pelo filho ao abrir o documento, antes de extrair o texto; o PDF acima do limite é recusado sem a extração. Formatos leves (texto, CSV, JSON, legendas) seguem no processo do servidor. Se o processo filho não puder ser iniciado, a fonte falha com `extracao_falhou`: não há volta silenciosa para o processo do servidor.
**Por quê:** `Promise.race` não interrompe CPU; só um processo separado pode ser morto de fora, e `worker_threads` dependeria de o Turbopack empacotar o arquivo do worker. O `tsx` já roda os scripts do projeto na imagem.
**O que invalida:** a imagem de produção sem o `tsx` (hoje está em `dependencies`) ou sem `src/`; o custo de partida do filho (centenas de milissegundos por documento) pesar; ou um PDF malicioso que trave a abertura antes de o filho conferir as páginas (o filho é encerrado no prazo, então o dano é o tempo do prazo).
**Origem:** recursao
**Etapa:** b5
**Provisória:** false
**Realizada em:** FT-13

---

### PR-108 — Trava com batimento do servidor, lida pela restauração

**Assunto:** F2 da FT-13 — PR-98, PEND-20
**Decisão:** o servidor grava `.servidor.lock` (`{pid, host, iniciadoEm, batimentoEm}`) no diretório do banco ao subir, regrava o `batimentoEm` a cada 10 s e o remove no desligamento limpo e ao sair do processo. `npm run restore` recusa quando o batimento é mais novo que 30 s, mesmo vindo de outro contêiner ou máquina que compartilhe o volume, salvo com `--forcar`; trava mais velha que 30 s é ignorada com aviso. Relógio e diretório são injetáveis. A trava não entra no backup.
**Por quê:** a recusa por `/api/saude` em 127.0.0.1 só enxergava o próprio contêiner; o diretório do banco é o único ponto que dois contêineres do mesmo volume compartilham, e gravar o horário no conteúdo evita depender do relógio de escrita do disco.
**O que invalida:** o servidor e o comando de restauração não compartilharem o mesmo diretório de dados (volumes separados), ou relógios de máquinas diferentes com mais de 30 s de diferença; ou o operador querer restaurar com o servidor de pé (continua exigindo `--forcar`).
**Origem:** recursao
**Etapa:** b5
**Provisória:** false
**Realizada em:** FT-13

---

### PR-109 — Rotas de upload devolvem `X-Correlacao` por conta própria

**Assunto:** F2 da FT-13 — PR-93, PEND-21
**Decisão:** as rotas `api/agentes/[id]/fontes...` seguem fora do `matcher` do `src/proxy.ts` (o proxy copiaria o corpo do upload em memória), e os próprios handlers devolvem o `X-Correlacao` em toda resposta (sucesso, erro, 401, 413, 415) pelo mesmo cabeçalho e formato de 8 hexadecimais do proxy, com a correlação da requisição dentro do tratamento de erro igual à do cabeçalho.
**Por quê:** o proxy gera o código para todas as outras rotas; as de upload ficavam sem código no sucesso, o que contrariava a premissa PR-93.
**O que invalida:** o Next permitir proxy sem copiar o corpo de upload (então voltam ao proxy); ou o usuário precisar de um código que valha também para o log de sucesso (hoje só o erro é logado).
**Origem:** recursao
**Etapa:** b5
**Provisória:** false
**Realizada em:** FT-13

---

### PR-110 — Canal distinguido por padrão além da cor

**Assunto:** F2 da FT-13 — PR-85, PEND-22
**Decisão:** a badge de canal ganha um padrão de fundo por canal, sem cor literal (só listras ou pontos feitos com os tokens `--canal-*-borda`): painel em diagonal, widget em pontos, Telegram em linhas horizontais; o mapeamento canal para padrão é uma função pura testada e o texto do rótulo continua. O gráfico do painel mostra uma série só (mensagens por dia), então não há o que distinguir nele hoje; quando separar canais, deve usar o mesmo mapeamento.
**Por quê:** PR-85 prometia rótulo e hachura; só o rótulo existia; o padrão torna o canal distinguível para quem não separa cores sem depender de nova cor.
**O que invalida:** a marca (PEND-02) trocar a paleta para algo em que o padrão atrapalhe o contraste do texto, ou o gráfico passar a separar canais sem usar o mapeamento.
**Origem:** recursao
**Etapa:** b5
**Provisória:** false
**Realizada em:** FT-13

---

### PR-111 — Auditoria desligada derruba o start em produção

**Assunto:** F2 da FT-13 — PR-19, PEND-26
**Decisão:** em produção, se `ligarAuditoria()` falhar a subida do servidor falha, com mensagem clara e sem dado sensível (só o nome do erro vai ao log); fora de produção o servidor sobe, o item `auditoria` da saúde fica `degradado` em `/api/saude` e a tela Configurações > Sistema mostra "Trilha de auditoria: inativa" ("ativa" quando ligada).
**Por quê:** falhar fechado em produção evita um servidor que altera chave, usuários e canais sem rastro e sem ninguém ver; fora de produção a falha visível na saúde basta e não impede o desenvolvimento.
**O que invalida:** o operador preferir subir sem trilha em produção (seria uma variável nova de opt-out) ou a auditoria deixar de ser exigida pela PR-19.
**Origem:** recursao
**Etapa:** b5
**Provisória:** false
**Realizada em:** FT-13

---

### PR-112 — Testes nunca abrem conexão com host que não seja loopback

**Assunto:** F2 da FT-13 — PR-26, PEND-25
**Decisão:** `tests/setup.ts` instala uma trava que bloqueia a conexão de saída (`fetch`, `http`/`https` e `net.connect`) para qualquer host que não seja loopback (`localhost`, `127.0.0.0/8`, `::1`), com mensagem clara; a lista de permissões é vazia por padrão e comentada. Servidores de teste em loopback continuam funcionando. A trava vale para o processo do vitest; o servidor `next start` dos testes é outro processo e só fala com os simulados locais.
**Por quê:** PR-26 diz que nenhum teste chama a rede real, mas só a disciplina garantia isso; a trava transforma a regra em falha de teste.
**O que invalida:** algum teste precisar de um serviço externo real (então entra na lista de permissões com justificativa), ou a trava atrapalhar a ferramenta de teste.
**Origem:** recursao
**Etapa:** b5
**Provisória:** false
**Realizada em:** FT-13

---

### PR-113 — Design da referência substitui o acabamento do PR-23

**Assunto:** pedido do usuário depois da entrega — FT-14
**Decisão:** o acabamento visual passa a seguir o vocabulário estudado no site de referência (escala zinc, primário quase preto, azul só em link, foco e seleção, bordas finas como estrutura, raio de 10px com 8px em controles e 14px em painéis grandes, sombra só em camada flutuante, Geist e Inter servidas localmente). Isso **substitui o acabamento** do PR-23 (índigo, sombras e fonte de sistema) **sem mudar a regra dele**: tokens semânticos em `tokens.css`, nenhuma cor literal fora dele, tema claro e escuro completos, contraste 4,5:1, alvos de 44px e foco visível. Estudou-se o vocabulário; marca, textos, ilustrações e números da referência não foram copiados (PR-03). A cor padrão do chat embutido passou do índigo para o azul do acento; agentes que já guardam outra cor a mantêm.
**Por quê:** o dono pediu a nova direção depois da entrega; como os tokens são semânticos, a troca não tocou na lógica dos componentes.
**O que invalida:** o dono indicar marca ou design system próprios, ou a referência mudar de licença de uso do que se estudou (nada foi copiado, então só vale para o vocabulário).
**Origem:** catalogo_lacunas (fecha a lacuna de identidade visual deixada pelo PR-23; o pedido veio do usuário e está no MAPA como origem `descricao`)
**Etapa:** pos-entrega
**Provisória:** false
**Realizada em:** FT-14

---

### PR-114 — Landing pública sem cadastro, só com o que o produto faz

**Assunto:** pedido do usuário depois da entrega — FT-14, PR-02
**Decisão:** `/` mostra uma landing pública em pt-BR a quem não tem cookie de sessão e o painel a quem tem (o `src/proxy.ts` reescreve `/` para `/inicio` sem cookie; a página também responde direto em `/inicio`). A landing é componente de servidor, não lê banco nem sessão, não faz requisição a terceiros e só afirma o que o código faz (canais, tipos de fonte, três passos, segurança, FAQ). **Não há cadastro público, planos, depoimentos, logos de clientes, notas nem contagens** (PR-02): o botão principal leva a `/entrar`. O cartão do hero é um exemplo ilustrativo e se declara assim.
**Por quê:** o pedido quer uma porta de entrada pública; o modelo continua sendo uma instalação por empresa com usuários criados por um administrador.
**O que invalida:** o dono querer vender contas (PR-02 cai junto e a landing ganharia cadastro e planos), ou um cache na frente do sistema ignorar `Cache-Control: no-store` e servir a landing a quem tem sessão.
**Origem:** catalogo_lacunas (fecha a lacuna de página pública deixada pelo PR-02; o pedido veio do usuário e está no MAPA como origem `descricao`)
**Etapa:** pos-entrega
**Provisória:** false
**Realizada em:** FT-14

---

<!--
REGRAS DESTE ARQUIVO

1. Premissa é o que o BUILDX decidiu. O que o usuário pediu vai no PROJETO.md.
2. O campo "o que invalida" nunca fica genérico.
3. Premissa "provisória: true" entra no relatório final, na seção do que o usuário precisa decidir.
4. "Realizada em" é conferido pelo B6.
5. Premissa de segurança sem código nunca sai como pendência aceita.
-->
