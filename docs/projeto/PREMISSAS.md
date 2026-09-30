---
expx_schema: 1
expx_tool: buildx
kind: premissas
projeto_id: plataforma-chatbot-ia
atualizado_em: 2026-09-30
total: 62
por_origem:
  catalogo_lacunas: 27
  briefing: 0
  decisao_de_stack: 7
  f2_autonoma: 28
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
**Realizada em:** FT-01

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
**Realizada em:** FT-06

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

<!--
REGRAS DESTE ARQUIVO

1. Premissa é o que o BUILDX decidiu. O que o usuário pediu vai no PROJETO.md.
2. O campo "o que invalida" nunca fica genérico.
3. Premissa "provisória: true" entra no relatório final, na seção do que o usuário precisa decidir.
4. "Realizada em" é conferido pelo B6.
5. Premissa de segurança sem código nunca sai como pendência aceita.
-->
