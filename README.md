# Converse

Plataforma de agentes de IA com base de conhecimento própria. Você cria agentes, escolhe o modelo de linguagem (via OpenRouter), alimenta a base com arquivos, textos e vídeos e publica o agente no Telegram e num chat embutido em qualquer site com um script.

O projeto é construído por features, na ordem de `docs/projeto/MAPA.md`. Hoje existem a fundação (login, papéis, painel, cadastro de usuários, perfil e troca de senha, num layout de SaaS com tema claro e escuro) e os agentes com a chave do OpenRouter. Conversa de teste, base de conhecimento e canais chegam nas próximas features. O nome "Converse" é provisório e se troca por `APP_NAME`.

## Pré-requisitos

- Node 22 ou superior e npm 10.

## Como rodar

1. Copie o exemplo de configuração: `cp .env.example .env`, e preencha `JWT_SECRET` e `ENCRYPTION_KEY` no `.env` com segredos seus (o comando para gerar cada um está no próprio arquivo de exemplo).
2. Instale as dependências: `npm install`.
3. Prepare o banco: `npm run setup` (gera o client do Prisma, aplica as migrations e cria as contas de demonstração).
4. Suba o servidor: `npm run dev` e abra `http://localhost:3000`.

## Contas de demonstração

Fictícias, criadas pela seed, que se recusa a rodar em produção.

| Papel | E-mail | Senha |
|---|---|---|
| Administrador | `admin@exemplo.local` | `demo1234` |
| Usuário | `usuario@exemplo.local` | `demo1234` |

Só o administrador cadastra outros usuários (Configurações, Usuários) e a chave do OpenRouter (Configurações, Integrações).

## Agentes e chave do OpenRouter

1. Como administrador, abra Configurações, Integrações, cole a chave da API do OpenRouter e salve. A chave é gravada criptografada (AES-256-GCM, com `ENCRYPTION_KEY`), a tela mostra só a máscara (`sk-or-…a1b2`) e ela nunca volta ao navegador. "Testar conexão" confere a chave no OpenRouter.
2. Qualquer usuário abre Agentes, cria um agente e escolhe as instruções, o modelo, a temperatura e a mensagem inicial. Sem a chave cadastrada o campo de modelo aceita texto livre (o modelo padrão é `openai/gpt-4o-mini`).
3. Os testes nunca chamam o OpenRouter de verdade: `tests/apoio/openrouter-falso.ts` sobe um servidor local que imita a API, e `OPENROUTER_BASE_URL` aponta para ele.

## Conversar com o agente (aba Testar)

1. Com a chave do OpenRouter cadastrada, abra Agentes, escolha um agente e vá à aba **Testar**. A mensagem inicial do agente é a primeira bolha; escreva no campo (Enter envia, Shift+Enter quebra a linha) e a resposta chega trecho a trecho. **Parar** interrompe a resposta; **Nova conversa** recomeça. Ao recarregar a página, a última conversa é retomada.
2. Quando o provedor falha (chave inválida, saldo, modelo indisponível, limite, prazo ou provedor fora do ar) a conversa mostra uma mensagem clara em português, sem o texto técnico do provedor. Para o visitante dos canais públicos (chat embutido e Telegram, próximas features) existe uma mensagem genérica separada, `mensagemParaVisitante`.
3. Por baixo, a aba chama `POST /api/agentes/[id]/conversar` (exige sessão) e lê a resposta em SSE (`trecho`, `fim`, `erro`). O turno é o serviço `responderMensagem` em `src/servicos/chat.ts`; as conversas ficam nas tabelas `conversas` e `mensagens`. Cada resposta usa até `MAX_TOKENS_RESPOSTA` tokens (padrão 1024).
4. Para conversar sem gastar crédito, `npx tsx tests/apoio/servir-falso.ts` sobe o OpenRouter simulado como processo avulso e imprime a `OPENROUTER_BASE_URL` e a chave de teste a cadastrar.

## Base de conhecimento (aba Conhecimento)

1. Em Agentes, escolha um agente e abra a aba **Conhecimento**. Em "Adicionar ao conhecimento", envie arquivos (arraste ou clique; vários de uma vez) ou cole um texto com um título. Aceitos: `.pdf`, `.docx`, `.txt`, `.md`, `.csv`, `.html`/`.htm`, `.json`, `.srt` e `.vtt`, até `MAX_UPLOAD_MB` (padrão 25) por arquivo e 10 por vez. O tipo é conferido pelo conteúdo, não só pela extensão; PDF escaneado (sem texto selecionável) é recusado, porque não há OCR.
2. Cada fonte aparece na lista e passa de **Na fila** a **Processando** e a **Pronto**, ou a **Erro** com o motivo (Reprocessar refaz a extração). A lista se atualiza sozinha a cada 2 segundos enquanto houver fonte pendente ou processando. **Ver conteúdo** mostra os trechos extraídos, de 20 em 20. Excluir pede confirmação na própria linha.
3. O original fica em `storage/` (ou em `STORAGE_DIR`), em `fontes/<agente>/<fonte>/original`: o nome enviado nunca entra em caminho, só no banco. Excluir a fonte ou o agente apaga os arquivos. O texto extraído é dividido em trechos de até 1000 caracteres (sobreposição de 150) nas tabelas `fontes` e `trechos`. A busca sobre eles é descrita em "Respostas com base no conhecimento", abaixo.
4. O processamento roda em segundo plano no próprio servidor (`src/servicos/fontes-fila.ts`, iniciado por `src/instrumentation.ts`), com estado no banco: ao reiniciar o servidor, a fonte que estava em `processando` volta a `pendente` e é retomada. É um processo só (uma instância).
5. As rotas (exigem sessão): `GET` e `POST` (multipart, campo `arquivos`) em `/api/agentes/[id]/fontes`, `POST /api/agentes/[id]/fontes/texto`, `DELETE /api/agentes/[id]/fontes/[fonteId]` e `POST /api/agentes/[id]/fontes/[fonteId]/reprocessar`. O corpo grande é recusado cedo por `Content-Length` (413); quando o cabeçalho falta (envio em pedaços) só o tamanho real, conferido depois de ler o corpo, barra o excesso.
6. A seed cria, no agente de exemplo, uma fonte de texto fictícia já processada.

## Respostas com base no conhecimento

1. O agente que tem ao menos uma fonte **Pronto** responde em **modo fundamentado**: a cada pergunta, `src/servicos/recuperacao.ts` busca os trechos mais relevantes da base do próprio agente (busca textual do SQLite, FTS5, ranking BM25, sem acento e sem caixa, até 6 trechos) e os põe na mensagem de sistema como material de consulta numerado (`[1]`, `[2]`...), dentro de um bloco com marcador aleatório por requisição. O conteúdo da base é tratado como dado: o prompt manda ignorar qualquer instrução escrita nele. Sem nenhuma fonte pronta, o agente se comporta como antes, só com as instruções e o modelo.
2. Quando a base não cobre a pergunta, o agente é instruído a dizer, no idioma de quem pergunta, que não encontrou a informação na base, em vez de inventar (saudações e conversa trivial seguem normais). O comportamento do modelo real diante dessa instrução não é testável sem chamar o provedor: os testes provam a estrutura do prompt contra o OpenRouter simulado.
3. Abaixo de cada resposta a aba **Testar** mostra as **Fontes**: as citadas (`[n]` no texto) como chips em destaque, as apenas consultadas numa seção recolhida, e o trecho usado expansível. Clicar em `[n]` no texto abre a fonte. O serviço emite o evento `fontes` (antes do `fim`) e grava o JSON em `mensagens.fontes`; ao recarregar a conversa, as fontes voltam.
4. Na aba **Conhecimento**, o cartão **Testar busca** mostra os trechos que o agente enxergaria para uma pergunta, com a fonte e a pontuação, sem gastar crédito (`POST /api/agentes/[id]/buscar`, exige sessão).
5. O índice é a tabela virtual `trechos_fts`, criada por SQL cru numa migration escrita à mão e mantida por gatilhos em `trechos`. Nunca rode `prisma db push` (apaga tabelas FTS5); use `npm run db:migrate`. Se o índice divergir (por exemplo, depois de um `VACUUM` ou de restaurar um backup), `reconstruirIndiceDeTrechos()` o reconstrói.

## Configuração

Toda variável é lida em um ponto só, `src/lib/ambiente.ts`. O que cada uma faz está no `.env.example`.

| Variável | Para quê | Obrigatória |
|---|---|---|
| `DATABASE_URL` | arquivo SQLite | sim |
| `JWT_SECRET` | assinatura da sessão | sim |
| `JWT_TTL_SEGUNDOS` | vida da sessão (padrão 900) | não |
| `APP_NAME` | nome do produto na interface (padrão Converse) | não |
| `TRUST_PROXY` | `1` atrás de proxy, para o limite de login usar `X-Forwarded-For` | não |
| `ENCRYPTION_KEY` | 32 bytes em hexadecimal ou base64; criptografa a chave do OpenRouter. Só é exigida ao gravar ou ler um segredo | para usar a chave do OpenRouter |
| `OPENROUTER_BASE_URL` | endereço da API do OpenRouter (padrão `https://openrouter.ai/api/v1`) | não |
| `APP_URL` | URL pública do sistema, enviada ao OpenRouter em `HTTP-Referer` (padrão `http://localhost:3000`) | não |
| `MAX_TOKENS_RESPOSTA` | teto de tokens da resposta do modelo em cada turno (padrão 1024) | não |
| `STORAGE_DIR` | pasta dos arquivos enviados à base de conhecimento (padrão `./storage`); entra no backup | não |
| `MAX_UPLOAD_MB` | tamanho máximo de cada arquivo enviado, em MB (padrão 25) | não |

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | build de produção (precisa de `DATABASE_URL` e `JWT_SECRET` no ambiente) |
| `npm run start` | servidor de produção (depois do build) |
| `npm run lint` | ESLint, inclusive a regra da direção das camadas |
| `npm test` | suíte inteira (Vitest); o teste de rotas sobe o servidor de produção e pede um `npm run build` antes |
| `npm run test:watch` | testes em modo observação |
| `npm run setup` | generate, migrations e seed |
| `npm run db:migrate` | aplica as migrations |
| `npm run db:seed` | cria as contas de demonstração |
| `npx tsc --noEmit` | checagem de tipos |
| `npm audit --audit-level=high` | auditoria de dependências |

A pipeline (`.github/workflows/ci.yml`) roda lint, tipos, build, testes e auditoria a cada mudança.

## Camadas

A dependência segue uma direção só, e o `npm run lint` a impõe.

| Camada | Pasta | Regra |
|---|---|---|
| Apresentação | `src/app`, `src/componentes`, `src/estilos` | chama `src/servicos`; não importa `src/lib/prisma` |
| Aplicação | `src/servicos` | casos de uso e validação com zod; não importa `next/*` nem a apresentação |
| Dados e infraestrutura | `src/lib` | Prisma, sessão, ambiente, limite de uso, criptografia de segredo e o adaptador do OpenRouter (`src/lib/openrouter.ts`), o armazenamento de arquivos (`src/lib/armazenamento.ts`) e a extração de texto (`src/lib/extracao/`); não importa serviços nem a apresentação |

Para acrescentar uma tela ao menu, edite só `src/componentes/itens-de-menu.ts`. As cores vivem em `src/estilos/tokens.css`; nenhum componente usa cor literal.
