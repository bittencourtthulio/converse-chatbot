---
expx_schema: 1
expx_tool: sprintx
kind: briefing
trabalho_id: historico-de-conversas
origem_buildx: plataforma-chatbot-ia
feature_id: FT-09
criado_em: 2026-10-01
atualizado_em: 2026-10-01
---

# Briefing do buildx — FT-09 Histórico de conversas e painel

## Problema

O usuário lê as conversas de todos os canais, filtra por agente e canal, vê as fontes de cada resposta, apaga uma conversa e vê no painel inicial os números de agentes, fontes e mensagens.

## Escopo

1. Serviço `src/servicos/historico.ts` (aplicação): `listarConversas({agenteId?, canal?, texto?, de?, ate?, pagina, tamanho})` com paginação por página (25 por padrão, máximo 100), itens (`id`, agente, canal, rótulo do interlocutor, nº de mensagens, última atividade, prévia de 120 caracteres da última mensagem) e total; filtro por texto com `LIKE` escapando `%`, `_` e `\` sobre `Mensagem.conteudo` (máx. 200 conversas casadas, sem FTS novo); ordenação por atividade mais recente; sem N+1, com teste que prove o número de consultas; `obterConversa(id)` com todas as mensagens em ordem e fontes por `lerFontesGravadas`; `apagarConversa(id)` e `apagarConversas(ids[])` (máx. 50, em transação, cascata, só o que existe, devolve contagem); ponto de extensão `aoApagarConversa(ouvinte)` com `{conversaId, agenteId, canal, usuarioId, quantidadeDeMensagens}` (nunca o conteúdo); `exportarConversaTexto(id)`. Rótulo do interlocutor mascara dado pessoal (widget = "Visitante " + 6 primeiros caracteres do `visitanteId`; telegram = `titulo`; painel = nome do usuário). Qualquer usuário autenticado acessa tudo (PR-12), verificação no servidor.
2. Rotas finas: telas `/conversas` e `/conversas/[id]`; `DELETE /api/conversas/[id]`, `POST /api/conversas/apagar` (lote) e `GET /api/conversas/[id]/exportar` (`.txt`, `Content-Disposition` seguro, nome sem dado pessoal). Sessão obrigatória; 401/404/422.
3. UI Conversas (item de menu abaixo de Agentes): lista com filtros (agente, canal com badges por token, texto, período), paginação, seleção e ações em lote com confirmação na tela, linha clicável; detalhe com transcrição em bolhas (renderizador seguro, nunca `dangerouslySetInnerHTML`), horário, fontes (componente da FT-05), metadados do canal, Exportar, Apagar, link para o agente; estados vazio, carregando e erro; 375px; tokens; dois temas.
4. Painel inicial (E-1) preenchido: números (agentes, fontes prontas e com erro, conversas e mensagens em 7 dias, quebra por canal), gráfico de mensagens por dia em 14 dias acessível (SVG/CSS, tabela equivalente), conversas recentes, alerta de fontes com erro, lista de primeiros passos que se oculta quando completa. Serviço `src/servicos/painel.ts` com agregação SQL parametrizada, fuso do servidor, dias vazios preenchidos.
5. Seed (PR-25): duas conversas fictícias no agente de exemplo (painel e widget) com fontes plausíveis.
6. Premissas novas, lacunas e convenções; testes que contam itens de menu atualizados.
7. Verificação no navegador com os três canais.

## Não-objetivos

Retenção automática, exclusão de usuário, aviso de privacidade e auditoria persistida (FT-10: o ponto de extensão `aoApagarConversa` só é oferecido, nada é gravado); contêiner, backup e saúde (FT-11); chat embutido (FT-06), Telegram (FT-07) e vídeo (FT-08), já entregues; busca semântica ou FTS de conversas; transferência para atendente humano; novos canais; edição de conversa.

## Critérios de aceite de negócio cobertos

- Entro com a conta de demonstração, chego a um painel e a um menu de agentes.
- Leio as conversas dos visitantes e do Telegram, e apago uma conversa.
- O agente responde com base no que subi e mostra de quais fontes tirou a resposta (visível no histórico).
- A interface funciona no celular e nos temas claro e escuro.

## Premissas aplicáveis

PR-18 (realiza a parte de apagar conversa; retenção, exclusão de usuário e aviso são da FT-10); PR-12, PR-13, PR-23, PR-25, PR-26, PR-27, PR-43, PR-44, PR-53 (`docs/projeto/PREMISSAS.md`).

## Convenções

`docs/stack/CONVENCOES.md`.
