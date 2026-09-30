---
expx_schema: 1
expx_tool: sprintx
kind: briefing
trabalho_id: agentes-e-openrouter
origem_buildx: plataforma-chatbot-ia
feature_id: FT-02
criado_em: 2026-09-30
atualizado_em: 2026-09-30
---

# Briefing do buildx — FT-02 Agentes e chave do OpenRouter

## Problema

O admin cadastra a chave do OpenRouter, e qualquer usuário cria, edita e exclui agentes escolhendo instruções, modelo, temperatura e mensagem inicial.

## Escopo

1. Cripto de segredo `src/lib/cripto.ts` (AES-256-GCM, `ENCRYPTION_KEY`, formato versionado, IV aleatório, adulteração e chave errada detectadas; `ENCRYPTION_KEY` validada só ao gravar ou ler segredo). Documentar no `.env.example`.
2. Tabela singleton de configuração do workspace (`openrouterChaveCifrada`, `atualizadoEm`, `atualizadoPor`); migration só acrescenta.
3. Adaptador `src/lib/openrouter.ts`: `OPENROUTER_BASE_URL`, cabeçalhos `HTTP-Referer` e `X-Title`, `listarModelos` (cache curto e lista de reserva), `verificarChave`, `conversar` (SSE em `AsyncIterable`, parser SSE testado, timeout, cancelamento); erros do provedor viram `ErroDeAplicacao` em pt-BR sem vazar corpo bruto.
4. Servidor simulado reutilizável `tests/apoio/openrouter-falso.ts` (nenhum teste chama a rede real).
5. Tela Configurações > Integrações (`/configuracoes/integracoes`, só admin): salvar, testar conexão, máscara, remover; chave nunca volta ao navegador.
6. Modelo `Agente` e serviço `src/servicos/agentes.ts` (zod; listar, obter, criar, editar, excluir; qualquer usuário autenticado).
7. Telas `/agentes`, `/agentes/novo`, `/agentes/[id]` com `AbasDoAgente` extensível e layout compartilhado; seletor de modelo por `listarModelos`, texto livre sem chave; item de menu "Agentes".
8. Seed com agente de exemplo (PR-25).
9. Convenções: converter regras com evidência; lacuna 9 (teste do SQL das migrations).
10. Verificação visual, se houver ferramentas de navegador.

## Não-objetivos

Conversa de teste e uso de `conversar` numa tela (FT-03); base de conhecimento (FT-04, FT-08); respostas com conhecimento (FT-05); chat embutido (FT-06); Telegram e seu token cifrado (FT-07); histórico e números do painel (FT-09); auditoria de troca de chave e exclusão de agente (FT-10); contêiner, saúde e backup (FT-11).

## Critérios de aceite de negócio cobertos

- Entro com a conta de demonstração, chego a um painel e a um menu de agentes.
- Crio um agente e escolho o modelo do OpenRouter (a conversa em si é FT-03).

## Premissas aplicáveis

PR-01, PR-06, PR-14 (realiza); PR-12, PR-13, PR-21, PR-22, PR-23, PR-25, PR-26, PR-28, PR-30 (`docs/projeto/PREMISSAS.md`).

## Convenções

`docs/stack/CONVENCOES.md`.
