# Telas de Configurações, menu e chat público

## Contrato de entrada

Item de menu: lista única `GRUPOS_DE_MENU`, `somenteAdmin` esconde (a página confere no servidor) (`src/componentes/itens-de-menu.ts:46-83`). Guarda de admin no `layout.tsx` da pasta, acima do `loading.tsx` (`src/app/(sistema)/configuracoes/usuarios/layout.tsx:11-17`). Ações de servidor num arquivo só (`src/app/acoes.ts`). API pública: rotas sob `src/app/api/publico/agentes/[id]/` sem sessão, erro por `erroPublico`, `Origin` conferida por `origemEDaPlataforma` (`src/app/api/publico/resposta.ts:13-48`); a rota `conversa` só tem `GET` com `X-Visitante-Id` (`src/app/api/publico/agentes/[id]/conversa/route.ts:12-21`).

## Contrato de saída

`configuracaoPublica` devolve `avisoDePrivacidade {texto,url}` vindo de `ConfiguracaoDoChat` (`src/servicos/chat-publico-config.ts`, função `paraExibir`). O embed mostra o aviso em `ChatEmbutido.tsx` (`avisoDePrivacidade`) e tem cabeçalho com botões Nova conversa, Ampliar e Fechar (`src/componentes/ChatEmbutido.tsx:260-300`). O visitante e a conversa moram no `localStorage` por `criarGuardaDoVisitante` (`src/componentes/embed-logica.ts:70-117`).

## Limites e cotas

Aviso: até 300 caracteres e URL http/https até 500 (`src/servicos/chat-publico-config.ts:19-20`). Limites do chat público por IP e agente (`src/servicos/chat-publico-limites.ts`).

## Erros conhecidos e tratamento

`erroParaVisitante` só repassa 404, 413, 422 e limite; o resto vira frase única (`src/servicos/chat-publico.ts:97-101`). `POST` público recusa `Origin` que não seja a da plataforma (`src/app/api/publico/agentes/[id]/conversar/route.ts:39-45`); a regra para `DELETE` NÃO DOCUMENTADA (a decidir).

## Riscos para a nossa implementação

`DELETE` público sem corpo precisa do `visitanteId` no cabeçalho (não na URL, que vai ao log). O CORS do `config` só libera `GET, OPTIONS` (`src/app/api/publico/resposta.ts:25-29`). `tests/menu.test.ts` fixa a lista de itens do grupo Configurações (`tests/menu.test.ts:24-40`).

## Fonte

`src/componentes/itens-de-menu.ts`, `src/app/(sistema)/configuracoes/`, `src/app/api/publico/`, `src/componentes/ChatEmbutido.tsx`, `src/componentes/embed-logica.ts`, `tests/menu.test.ts` — acessado em 2026-10-01
