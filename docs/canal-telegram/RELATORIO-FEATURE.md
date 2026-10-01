---
expx_schema: 1
expx_tool: buildx
kind: relatorio_feature
projeto_id: plataforma-chatbot-ia
feature_id: FT-07
trabalho_id: canal-telegram
status: entregue
sprints: 7
tasks: 20
testes_suite: 1730
data: 2026-09-30
---

# Relatório da FT-07 — Canal Telegram

Branch `feat/canal-telegram`, a partir de `feat/chat-embutido` (PRs empilhados). A FT-07 depende funcionalmente só da FT-05; a FT-06 (chat embutido) é irmã e a branch apenas empilha sobre ela para não gerar conflito nos arquivos compartilhados (`abas-do-agente.ts`, `ambiente.ts`, `.env.example`, `chat-publico-limites.ts`). PR local: descrição em `docs/entregas/canal-telegram/PR.md`, pacote de QA em `docs/entregas/canal-telegram/QA-PACOTE.md`.

## O que foi entregue

- Migration `20260930220000_canal_telegram` (só acrescenta): `canais_telegram` (1:1 com o agente, `botId` único, token cifrado, hash do segredo, `limiteDiario` 500, último erro, última mensagem) e `atualizacoes_telegram` (dedupe por `(canalId, updateId)`, purga de 7 dias).
- `src/lib/telegram.ts`: `getMe`, `setWebhook`, `deleteWebhook`, `getWebhookInfo`, `sendMessage` (divide acima de 4096, `retry_after` uma vez, sem `parse_mode`), `sendChatAction`; o token nunca aparece em erro, pilha, causa nem console (50 combinações testadas) e `redigirToken` redige num ponto só.
- `tests/apoio/telegram-falso.ts` (seis métodos, falhas e latência configuráveis, `dispararUpdate`) e `tests/apoio/servir-telegram-falso.ts` (processo avulso com porta de controle).
- `src/servicos/canal-telegram.ts`: conectar (exige `APP_URL` HTTPS, exceção só fora de produção), desconectar, pausar, retomar, estado, verificar, limite diário e `aoAlterarCanal` para a auditoria.
- `POST /api/telegram/[agenteId]/webhook`: segredo em tempo constante, 401 igual para tudo que não autentica, 200 rápido e atendimento em `after()`, dedupe, só texto de chat privado, `/start`, `/novo`, `/reiniciar`, resposta em texto puro com `[n]` e "Fontes:", limites (10 por minuto por chat, 60 por conversa, teto diário do canal), exclusão mútua por chat.
- Aba Canais com o cartão do Telegram (passo a passo, token em senha nunca devolvido, estados, aviso de `APP_URL`, Verificar, Pausar/Retomar, Desconectar com confirmação, limite diário, trocar token).
- Verificação no Chrome contra o Telegram simulado (`docs/canal-telegram/VERIFICACAO-VISUAL.md`).

## Como demonstrar

`npm run setup`, `npm run build`, `npm run start` com `APP_URL` HTTPS (túnel) e, sem o Telegram real, `npx tsx tests/apoio/servir-falso.ts` e `npx tsx tests/apoio/servir-telegram-falso.ts` com `OPENROUTER_BASE_URL` e `TELEGRAM_API_BASE` apontando para eles; entrar com o admin de demonstração, cadastrar a chave de teste, abrir o agente de exemplo, aba Canais, colar o token fictício e disparar updates por `curl`. Roteiro em `docs/entregas/canal-telegram/QA-PACOTE.md`.

## Verificação

1730 testes na suíte inteira (249 novos); `npx tsc --noEmit`, `npm run lint`, `npm run build` e `npm audit --audit-level=high` (0) verdes. Os testes de rota exigem `npm run build` antes.

## O que a próxima feature precisa saber

- **Conversas do canal `telegram` (FT-09).** `Conversa.canal = 'telegram'`, `Conversa.identificadorExterno` = `String(chat.id)` (id numérico do chat privado no Telegram), `criadoPorId` nulo, `titulo` = `Telegram: <nome público>` (`first_name` e `last_name`, até 60 caracteres; sem `@usuario` nem id, PR-18) ou `Telegram: contato`; mensagens em `Mensagem` (`papel` `user` ou `assistant`, `fontes` com o JSON completo). Um chat tem várias conversas: `/novo` abre outra; a mais recente (`atualizadoEm`) é a corrente. `listar({ agenteId, canal: 'telegram', identificadorExterno })` de `src/servicos/conversas.ts` filtra por chat. Desconectar o bot não apaga conversas.
- **O que o teto diário conta.** Mensagens `user` de conversas `canal = 'telegram'` do agente criadas desde a meia-noite do fuso do servidor, comparadas com `CanalTelegram.limiteDiario` (padrão 500, editável na aba Canais); conta tentativas, inclusive as que falharam no provedor; não soma o widget nem o painel (`exigirTetoDiario(agenteId, limite, agora, 'telegram')` em `src/servicos/chat-publico-limites.ts`). Os de 10 por minuto por chat e de 60 por conversa estão em `src/servicos/telegram-limites.ts`; o por minuto é em memória.
- **FT-10 (auditoria e privacidade).** `aoAlterarCanal(ouvinte)` em `src/servicos/canal-telegram.ts` recebe `{ acao: 'conectar' | 'desconectar' | 'pausar' | 'retomar' | 'limite', agenteId, usuarioId }`, nunca token, segredo ou conteúdo; registre o ouvinte na inicialização da auditoria. Dados pessoais do canal: `Conversa.identificadorExterno` (id do chat) e o nome público no `titulo`, mais o texto das mensagens; a exclusão de conversa e a retenção valem para o canal `telegram` como para os outros. Campos do canal: `tokenCifrado` (AES-256-GCM, depende da `ENCRYPTION_KEY`; trocar a chave obriga reconectar), `segredoDoWebhookHash`, `botId`, `botUsername`, `botNome`, `webhookUrl`, `ativo`, `conectadoEm`, `ultimoErro`, `ultimoErroEm`, `ultimaMensagemEm`, `limiteDiario`.
- **FT-11 (backup, deploy e URL pública).** O Telegram só entrega em HTTPS público: `APP_URL` precisa ser o endereço HTTPS do deploy e o `webhookUrl` gravado é `APP_URL` do momento da conexão (se o domínio mudar, use Verificar e reconecte o bot: o segredo em claro não é guardado). Backup do banco leva o token cifrado (só decifra com a mesma `ENCRYPTION_KEY`) e o hash do segredo; restaurar um banco antigo pode deixar o webhook do Telegram com um segredo que não confere: reconectar resolve. Tabela de dedupe é descartável. Em produção `TELEGRAM_PERMITIR_URL_NAO_HTTPS` é ignorada.
- Módulos novos: `src/lib/telegram.ts`, `src/lib/exclusao-mutua.ts`, `src/servicos/canal-telegram.ts`, `src/servicos/telegram-webhook.ts`, `src/servicos/telegram-atendimento.ts`, `src/servicos/telegram-limites.ts`, `src/app/api/telegram/[agenteId]/webhook/route.ts`, `src/app/(sistema)/agentes/[id]/canais/`, `src/componentes/CartaoTelegram.tsx`, `src/componentes/canais.ts`, `src/componentes/canais-logica.ts`, `tests/apoio/telegram-falso.ts`, `tests/apoio/servir-telegram-falso.ts`; `subirServidor` ganhou `capturarLogs` (`tests/apoio/servidor.ts`); `conversas.criar` ganhou `titulo` opcional.
- Variáveis: `TELEGRAM_API_BASE` (padrão `https://api.telegram.org`) e `TELEGRAM_PERMITIR_URL_NAO_HTTPS` (desligada por padrão, ignorada em produção), lidas só em `src/lib/ambiente.ts`; nenhuma dependência nova.

## Desvios do plano

- Sem desvio de escopo. Arquivos além da lista das tasks, declarados nelas no momento em que surgiram: `tests/apoio/servidor.ts` (T-05.01, `capturarLogs` para varrer o log do servidor), `tests/rotas.test.ts` e `tests/publicar-rota.test.ts` (T-06.01 e T-06.02, a contagem de abas passou de quatro para cinco), `src/componentes/CartaoTelegram.tsx` e `src/estilos/global.css` (T-07.01, achados da verificação no navegador).
- Em todas as tasks o teste foi escrito antes do código e rodou vermelho primeiro, exceto a T-01.01 (migration e teste na mesma passada: a prova de vermelho foi o `prisma migrate diff` e os testes só passando com o esquema novo) e a T-02.03 (o adaptador já tinha sido escrito para não vazar o token; a prova de que o teste discrimina foi uma mutação temporária que repassa a mensagem do erro original).
- A suíte inteira foi vermelha uma vez, no fechamento da sprint 06 (`tests/publicar-rota.test.ts` esperava quatro abas): corrigido e rodada de novo inteira.

## Premissas e pendências

Novas: PR-63 (modelo, dedupe e purga), PR-64 (adaptador, token fora do erro), PR-65 (conexão, HTTPS, segredo, ciclo de vida), PR-66 (webhook), PR-67 (escopo do atendimento), PR-68 (limites e exclusão mútua), PR-69 (aba Canais), PR-70 (variáveis e simulado). PR-07, PR-14 e PR-16 passam a realizadas também na FT-07. Sem pendência nova; a PEND-06 (credenciais e URL pública) e a PEND-07 (verificação em celular real) ganharam o Telegram e a aba Canais. Limites conhecidos em `docs/stack/LACUNAS.md` (18 a 21).
