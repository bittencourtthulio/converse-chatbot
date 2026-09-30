---
expx_schema: 1
expx_tool: sprintx
kind: briefing
trabalho_id: chat-embutido
origem_buildx: plataforma-chatbot-ia
feature_id: FT-06
criado_em: 2026-09-30
atualizado_em: 2026-09-30
---

# Briefing do buildx — FT-06 Chat embutido por script

## Problema

O usuário copia um script de uma linha, cola em um site, e um visitante anônimo conversa com o agente por um botão flutuante, dentro dos domínios e dos limites de uso definidos.

## Escopo

1. Configuração do chat por agente (migration só acrescenta colunas ou tabela com padrão): `ativo` (padrão false), `titulo`, `cor` (hex validada), `posicao` (`direita|esquerda`), `avatar` (ícone predefinido ou iniciais, sem upload), aviso de privacidade (texto até 300 e URL http/https opcional), `dominiosPermitidos` (hosts normalizados, vazia = qualquer), `limiteDiario` (padrão 500, 1 a 100000), sugestões (até 3). Validação zod no serviço; qualquer usuário autenticado edita (PR-12).
2. API pública em `src/app/api/publico/agentes/[id]/`: `GET config` (só campos visuais; 404 idêntico para inexistente e inativo; CORS pela lista de domínios; `OPTIONS`) e `POST conversar` (sem sessão; `{visitanteId, conversaId?, mensagem}`; SSE `trecho`, `fontes`, `fim`, `erro`; erro ao visitante sempre por `mensagemParaVisitante`). Limites (PR-16): por IP e agente 10/min, por IP 30/min, por conversa 60 mensagens, teto diário por agente contado no banco; 429 com `Retry-After`. Retomada da conversa do visitante (`GET conversa`).
3. Script `widget.js` servido por rota: JavaScript puro, Shadow DOM, botão flutuante, iframe preguiçoso, abrir/fechar, Esc, foco, `postMessage` com `event.origin` estrito, idempotente, silencioso com agente inativo. Testes com happy-dom.
4. Página do iframe `/embed/[id]` fora do grupo `(sistema)`: chat compacto, `visitanteId` em `localStorage` com try/catch, `Content-Security-Policy: frame-ancestors` dinâmico por agente (substitui o `X-Frame-Options: DENY` só nessa rota), aviso de privacidade, fontes como chips.
5. Aba "Publicar" no agente: formulário, pré-visualização ao vivo, bloco "Código para incorporar" com copiar, avisos. `APP_URL` opcional. Agente de exemplo da seed com o chat publicado.
6. Convenções: primeiro handler público sem sessão, primeiro CSP dinâmico e `proxy.ts`.
7. Verificação de ponta a ponta no navegador, se houver ferramenta.

## Não-objetivos

Telegram (FT-07); vídeo (FT-08); histórico, lista e leitura das conversas dos visitantes e painel de números (FT-09); retenção, exclusão de conversa e auditoria (FT-10); backup e saúde (FT-11); upload de avatar; transferência para humano; domínio próprio para o widget.

## Critérios de aceite de negócio cobertos

- Copio um trecho de script, colo no meu site e o chat aparece e responde.
- A interface funciona no celular e nos temas claro e escuro.

## Premissas aplicáveis

PR-08, PR-16, PR-17 (realiza); parte do PR-18 (aviso de privacidade no chat); PR-12, PR-13, PR-15, PR-22, PR-23, PR-26, PR-28, PR-36, PR-37, PR-41, PR-42, PR-43, PR-53 (`docs/projeto/PREMISSAS.md`).

## Convenções

`docs/stack/CONVENCOES.md`.
