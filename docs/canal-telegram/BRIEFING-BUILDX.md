---
expx_schema: 1
expx_tool: sprintx
kind: briefing
trabalho_id: canal-telegram
origem_buildx: plataforma-chatbot-ia
feature_id: FT-07
criado_em: 2026-09-30
atualizado_em: 2026-09-30
---

# Briefing do buildx — FT-07 Canal Telegram

## Problema

O usuário conecta o token de um bot do Telegram a um agente e passa a conversar com esse agente pelo aplicativo.

## Escopo

1. Modelo `CanalTelegram` 1:1 com o agente (`agenteId` único, cascata; `tokenCifrado`; `botId`, `botUsername`, `botNome`; `segredoDoWebhookHash` SHA-256, o segredo em claro só existe no momento da conexão; `ativo`; `webhookUrl`; `conectadoEm`; `ultimoErro`, `ultimoErroEm`; `ultimaMensagemEm`; `limiteDiario` padrão 500) e `AtualizacaoTelegram` (dedupe por `canalId` + `updateId` únicos; purga acima de 7 dias). Migration só acrescenta; `limparBanco` e exclusão do agente cobrem as tabelas.
2. Adaptador `src/lib/telegram.ts` (`TELEGRAM_API_BASE`, padrão `https://api.telegram.org`): `getMe`, `setWebhook`, `deleteWebhook`, `getWebhookInfo`, `sendMessage` (divide acima de 4096 caracteres), `sendChatAction`. O token nunca aparece em erro, log, pilha ou resposta. Timeout, `retry_after` do 429, erros em `ErroDeAplicacao` pt-BR.
3. Servidor simulado `tests/apoio/telegram-falso.ts`; nenhum teste usa a rede real.
4. Serviço `src/servicos/canal-telegram.ts`: conectar (exige `APP_URL` HTTPS; exceção `TELEGRAM_PERMITIR_URL_NAO_HTTPS=1`, ignorada em produção), desconectar, pausar/retomar, estado (com verificação por `getWebhookInfo`), reconexão gira o segredo; ponto de extensão simples para auditoria (FT-10).
5. Webhook `POST /api/telegram/[agenteId]/webhook`: segredo em tempo constante, 200 rápido e processamento posterior, dedupe por `update_id`, só texto de chat privado, `/start`, `/novo`, `/reiniciar`, resposta em texto puro com "digitando", `[n]` e linha "Fontes: …", limites (10/min por chat, 60 por conversa, teto diário do canal), título da conversa "Telegram: Nome".
6. Aba "Canais" no agente, lista de cartões extensível, cartão Telegram com passo a passo, estados e avisos de `APP_URL`.
7. Variáveis `TELEGRAM_API_BASE` e `TELEGRAM_PERMITIR_URL_NAO_HTTPS` em `src/lib/ambiente.ts`, `.env.example` e README.
8. Convenções, premissas novas e lacunas; verificação ponta a ponta com Chrome, app de produção, OpenRouter falso e Telegram falso.

## Não-objetivos

Chat embutido (FT-06, entregue, só empilha); vídeo (FT-08); histórico e leitura das conversas do canal (FT-09); retenção, exclusão de conversa e auditoria (FT-10); backup, saúde e URL pública definitiva (FT-11); grupos e canais do Telegram; mídia (foto, voz, documento); polling; vários bots por agente; transferência para humano.

## Critérios de aceite de negócio cobertos

- Conecto um bot do Telegram ao agente e converso com ele pelo aplicativo.
- A interface funciona no celular e nos temas claro e escuro.

## Premissas aplicáveis

PR-07, PR-14, PR-16 (realiza); PR-12, PR-13, PR-15, PR-18, PR-22, PR-23, PR-26, PR-28, PR-36, PR-39, PR-41, PR-42, PR-52, PR-53, PR-57 (`docs/projeto/PREMISSAS.md`).

## Convenções

`docs/stack/CONVENCOES.md`.
