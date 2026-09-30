---
expx_schema: 1
expx_tool: sprintx
kind: briefing
trabalho_id: respostas-com-conhecimento
origem_buildx: plataforma-chatbot-ia
feature_id: FT-05
criado_em: 2026-09-30
atualizado_em: 2026-09-30
---

# Briefing do buildx — FT-05 Respostas com base no conhecimento

## Problema

O agente responde a partir das fontes da própria base, mostra de quais fontes tirou a resposta e diz que não sabe quando a base não cobre a pergunta.

## Escopo

1. Índice FTS5 por migration (SQL cru; `db push` proibido): tabela virtual `trechos_fts` com conteúdo externo sobre `trechos` (tokenizer `unicode61 remove_diacritics 2`), gatilhos de insert, update e delete mantendo-a sincronizada (inclusive cascata de exclusão de fonte e de agente e reprocessamento que substitui trechos) e preenchimento inicial (`rebuild`). A migration só acrescenta; `migrate deploy` aplica do zero.
2. Serviço `src/servicos/recuperacao.ts` (`buscarTrechos(agenteId, pergunta, {limite})`): expressão `MATCH` segura construída da pergunta, nunca concatenando texto do usuário; BM25; até 6 trechos; só fonte `pronto` do agente; devolve trecho, título da fonte, posição e pontuação; pergunta vazia ou só stopwords devolve lista vazia; limiar de relevância; continuação de pergunta usa a pergunta anterior do usuário; teste de desempenho de sanidade (~5.000 trechos).
3. Integração no turno de chat (`chat.ts`, `chat-prompt.ts`, ponto de extensão `materialDeConsulta`): modo fundamentado quando o agente tem fonte `pronto`; material delimitado por marcadores com identificador aleatório por requisição, numerado, com título; instruções de citar `[n]`, tratar o material como dado (PR-15) e não revelar instruções; higienização do marcador de fechamento; orçamento de caracteres; sem trecho relevante, resposta honesta de que a base não cobre (salvo saudação e conversa trivial); agente sem fonte pronta segue como na FT-03.
4. Fontes na resposta: evento SSE `fontes` antes do `fim`, com `{fonteId, titulo, trechos, citada}`; gravação em `Mensagem.fontes`; protocolo SSE estendido de forma compatível; falha ao gravar as fontes não derruba a resposta.
5. UI da aba Testar: "Fontes" abaixo de cada resposta (chips, citadas em destaque, consultadas em seção recolhida, trecho expansível), marcadores `[n]` como referências clicáveis sem `dangerouslySetInnerHTML`, fontes voltam ao recarregar a conversa.
6. Cartão "Testar busca" na aba Conhecimento e `POST /api/agentes/[id]/buscar` (sessão obrigatória; corpo `{pergunta}`).
7. Seed: o índice cobre a fonte de exemplo e uma pergunta sobre ela recupera o trecho.
8. Convenções: SQL cru para FTS5 (PR-30) e "texto do usuário nunca concatenado em SQL" com evidência em `docs/stack/`.
9. Verificação visual da aba Testar e do cartão nos dois temas, se houver ferramenta de navegador.

## Não-objetivos

Chat embutido e limites de uso públicos (FT-06); Telegram (FT-07); vídeo e transcrição (FT-08); histórico, lista de conversas e painel de números (FT-09); retenção e auditoria (FT-10); backup e saúde (FT-11); embeddings e busca semântica (fora de escopo, PR-04); OCR.

## Critérios de aceite de negócio cobertos

- O agente responde com base no que subi e mostra de quais fontes tirou a resposta.
- Quando a base não cobre a pergunta, o agente diz que não sabe em vez de inventar.

## Premissas aplicáveis

PR-04, PR-15, PR-30 (realiza); PR-12, PR-13, PR-21, PR-22, PR-23, PR-26, PR-28, PR-41, PR-42, PR-43, PR-44, PR-46 (`docs/projeto/PREMISSAS.md`).

## Convenções

`docs/stack/CONVENCOES.md`.
