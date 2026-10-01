---
expx_schema: 1
expx_tool: buildx
kind: recursao
projeto_id: plataforma-chatbot-ia
atualizado_em: 2026-10-01
ciclo_atual: 1
teto_ciclos: 3
pendencias_abertas: 7
pendencias_resolvidas: 0
---

# Plataforma de chatbot com IA e base de conhecimento — Recursão

Tudo que ficou pelo caminho, classificado. O ciclo B4 → B5 repete enquanto
houver pendência resolvível, até o teto.

## Ciclos

| Ciclo | Pendências entraram | Viraram feature | Replanejadas | Ficaram para o humano |
|---|---|---|---|---|
| 1 | 7 (6 até o B3, 1 na FT-01) | 0 | 0 | 7 |

---

## Aberto — o que exige decisão humana

### PEND-01 — Modelo de negócio: instalação própria ou serviço com várias contas

**Classe:** `decisao_humana`
**Origem:** B1 (PR-02)
**A decisão:** o sistema serve a uma empresa por instalação, ou vende contas isoladas a terceiros?
**As opções:** (a) instalação própria, o que está construído; (b) multi-conta com cadastro público, isolamento de dados por conta, planos e cobrança, o que exige mudar o modelo de dados inteiro.
**O que o buildx fez enquanto isso:** um workspace por instalação; usuários criados por um admin.
**Reversibilidade:** ir de (a) para (b) é uma reescrita do modelo de dados e das rotas; por isso é a primeira coisa a confirmar.

### PEND-02 — Nome e identidade do produto

**Classe:** `decisao_humana`
**Origem:** B1 (PR-03)
**A decisão:** qual o nome do produto e a identidade visual (logotipo, cor de marca)?
**As opções:** manter "Converse" com a paleta padrão, ou informar nome e marca.
**O que o buildx fez enquanto isso:** nome "Converse" configurável por `APP_NAME`; cor de destaque padrão em tokens.
**Reversibilidade:** baixo custo: nome em variável de ambiente e cor em um arquivo de tokens.

### PEND-03 — Confirmar as interpretações do pedido

**Classe:** `decisao_humana`
**Origem:** B1 (PR-01, PR-04, PR-05, PR-06, PR-07, PR-08, PR-09, PR-10, PR-11, PR-24)
**A decisão:** confirmar que o pedido significa: vários agentes; busca por texto (sem embeddings); vídeo como transcrição da fala (sem análise de imagem); PDF com texto (sem OCR); OpenRouter com uma chave por instalação; Telegram por webhook; hospedagem em contêiner com disco persistente (não serverless).
**As opções:** confirmar, ou pedir a alternativa de cada item (ver "O que invalida" em cada premissa).
**O que o buildx fez enquanto isso:** construiu a leitura mais simples de cada uma, marcada `Provisória: true` no `PREMISSAS.md`.
**Reversibilidade:** varia; embeddings e OCR entram como features novas sem quebrar o que existe; hospedagem serverless exige trocar banco e armazenamento.

---

## Aberto — o que exige recurso externo

### PEND-04 — Arquivo `.env` local não foi criado

**Classe:** `recurso_externo`
**Origem:** B2
**O que falta:** uma pessoa copiar `.env.example` para `.env` e preencher os segredos (`JWT_SECRET` e, conforme as features, `ENCRYPTION_KEY`). Um hook de segurança do ambiente do usuário bloqueia qualquer comando do agente que toque `.env`, por isso o buildx não o criou nem contornou o bloqueio.
**O que destrava:** rodar `npm run dev` e `npm run start` diretamente. Os testes e o build não dependem dele: recebem os segredos por variável inline ou definem os próprios.
**Estado atual:** código completo e testado; o `.env.example` documenta cada variável.

### PEND-05 — Repositório remoto inexistente: PRs não puderam ser abertos

**Classe:** `recurso_externo`
**Origem:** B2 (`git remote -v` vazio)
**O que falta:** um repositório remoto (`origin`) e `gh auth`. Criar repositório na conta do usuário e publicar código é ação externa que o buildx não faz sem autorização.
**O que destrava:** `git push` das branches de feature e abertura dos PRs; a descrição de cada PR está pronta em `docs/<slug>/PR.md`.
**Estado atual:** uma branch local por feature, empilhadas na ordem do mapa, cada uma verde. Nenhum merge foi feito (regra 8).

### PEND-06 — Credenciais e URL pública que só o usuário tem

**Classe:** `recurso_externo`
**Origem:** B1
**O que falta:** chave do OpenRouter (com saldo), token de um bot do Telegram (BotFather), e uma URL pública HTTPS para o servidor (o script embutido e o webhook do Telegram só funcionam com ela). Para vídeo, `ffmpeg` e `ffprobe` no servidor (o contêiner da FT-11 os incluirá). **A transcrição real de vídeo e áudio (FT-08) exige uma chave do OpenRouter com saldo e um modelo com entrada de áudio** (`google/gemini-2.5-flash` por padrão, trocável em Configurações > Integrações), e o link do YouTube depende de acesso do servidor ao YouTube e do formato da página, que não é documentado (`docs/stack/LACUNAS.md`, lacuna 11).
**O que destrava:** respostas reais de IA, o canal Telegram funcionando e o chat em sites de verdade.
**Estado atual:** tudo construído e testado contra servidores simulados de OpenRouter, Telegram e YouTube (o canal Telegram, FT-07, e o vídeo, FT-08, foram exercitados de ponta a ponta contra os simulados, `docs/canal-telegram/VERIFICACAO-VISUAL.md` e `docs/conhecimento-em-video/VERIFICACAO-VISUAL.md`); nenhuma chamada real foi feita. Para conectar o bot de verdade: token do BotFather e `APP_URL` HTTPS público (em desenvolvimento, um túnel).

### PEND-07 — Verificação visual em celular real e dos fluxos interativos

**Classe:** `recurso_externo`
**Origem:** B4, FT-01 (`docs/fundacao-e-esqueleto/VERIFICACAO-VISUAL.md`), FT-02 (`docs/agentes-e-openrouter/VERIFICACAO-VISUAL.md`), FT-03 (`docs/conversa-de-teste/VERIFICACAO-VISUAL.md`), FT-04 (`docs/conhecimento-arquivos-e-texto/VERIFICACAO-VISUAL.md`) FT-05 (`docs/respostas-com-conhecimento/VERIFICACAO-VISUAL.md`) FT-06 (`docs/chat-embutido/VERIFICACAO-VISUAL.md`) FT-07 (`docs/canal-telegram/VERIFICACAO-VISUAL.md`) FT-08 (`docs/conhecimento-em-video/VERIFICACAO-VISUAL.md`) e FT-09 (`docs/historico-de-conversas/VERIFICACAO-VISUAL.md`)
**O que falta:** abrir o sistema (e, desde a FT-02, os formulários de agente e da chave do OpenRouter; desde a FT-03, a aba Testar, com o botão Parar por clique, a rolagem automática e o contador de caracteres; desde a FT-04, a aba Conhecimento, com o arrastar-e-soltar, o spinner de "Processando", o foco por teclado na zona de soltar e as regras de 375 px; desde a FT-05, as Fontes e as referências `[n]` na aba Testar, o tema claro com fontes, a seção recolhida das fontes consultadas e o cartão "Testar busca" a 375 px; desde a FT-06, o botão e o painel do `widget.js` em tela cheia abaixo de 480 px, o tema claro do chat embutido e da aba Publicar e o botão Copiar código; desde a FT-07, o cartão do Telegram da aba Canais a 375 px, o aviso de `APP_URL` sem HTTPS e o selo "Com erro"; desde a FT-08, a aba Vídeo, a barra de progresso do envio, a lista com etapa e o campo Modelo de transcrição, que só foram vistos com a largura do navegador emulada em 375 px; desde a FT-09, a lista de Conversas em cartões, o detalhe com fontes, o apagar em lote com confirmação e o painel com o gráfico, vistos num Chrome sem janela com 375 px emulados, sem celular real nem leitor de tela) num celular ou com a janela do navegador realmente a 375px e acionar o menu do usuário, a gaveta, o alternador de tema e a mensagem de excesso de tentativas de login. A janela do navegador da sessão não reduziu a largura, e os quadros de 375px foram feitos sem JavaScript.
**O que destrava:** confirmação visual completa; o comportamento tem teste automatizado, o que falta é o olho.
**Estado atual:** contraste 4,5:1 e ausência de cor literal provados por `tests/tokens.test.ts`; rotas e cabeçalhos por `tests/rotas.test.ts`.

---

## Resolvido nos ciclos

| ID | Assunto | Classe | Ciclo | Como resolveu |
|---|---|---|---|---|

---

<!--
AS QUATRO CLASSES

  trabalho_novo    → vira feature nova no MAPA.md, volta ao B4
  replanejamento   → a feature volta à F3 do sprintx (teto próprio: 2 voltas)
  decisao_humana   → fica aqui, vai para o relatório. NUNCA vira feature
  recurso_externo  → fica aqui, vai para o relatório

O TETO: padrão 3 ciclos. Atingido o teto, toda pendência aberta vira
decisao_humana e o buildx segue para o B6.
-->
