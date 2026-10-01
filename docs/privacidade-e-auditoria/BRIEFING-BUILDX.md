---
expx_schema: 1
expx_tool: sprintx
kind: briefing
trabalho_id: privacidade-e-auditoria
origem_buildx: plataforma-chatbot-ia
feature_id: FT-10
criado_em: 2026-10-01
atualizado_em: 2026-10-01
---

# Briefing do buildx — FT-10 Privacidade e auditoria

## Problema

O admin define por quantos dias as conversas ficam guardadas, exclui definitivamente um usuário da equipe e consulta o registro de quem alterou chave, usuários, agentes e canais.

## Escopo

1. **Trilha de auditoria** (`RegistroDeAuditoria`: id, `quando`, `usuarioId` com `SET NULL`, `usuarioRotulo` (snapshot "Nome <e-mail>"), `acao` de conjunto fechado validado por zod, `alvoTipo`, `alvoId` opcional, `detalhes` JSON curto sem segredo, sem conteúdo de conversa e sem identificador de visitante; índices por `quando` e por `acao`). Serviço `src/servicos/auditoria.ts` com `registrar(evento)` e `listar({acao?, usuarioId?, de?, ate?, pagina, tamanho})`. Somente-acréscimo: nenhuma função, ação ou rota atualiza ou apaga registro (só o expurgo por idade); teste que prove a ausência de rota de remoção. Cobertura: ligando `aoAlterarCanal` e `aoApagarConversa` e por chamada direta nos demais serviços (chave do OpenRouter alterada/removida, modelo de transcrição, usuário criado/editado/excluído, agente excluído, retenção alterada, dados do titular apagados/exportados, expurgo automático, restauração como ponto de chamada para a FT-11). Falha de gravação: mesma transação para chave, usuário e exclusão; para o restante, gravação imediata com erro no log sem derrubar a ação.
2. **Exclusão definitiva de usuário** (admin): `excluirDefinitivamente(id, adminId)` em `src/servicos/usuarios.ts`; recusa excluir a si mesmo e o último admin ativo (409); desfaz vínculos; agentes e conversas permanecem; sessões do usuário deixam de valer; UI em Configurações > Usuários com confirmação na própria tela exigindo digitar o e-mail.
3. **Retenção e expurgo** (PR-18): `ConfiguracaoDoWorkspace.retencaoDiasConversas` (padrão 90, faixa 7 a 3650, "sem expurgo automático" como opção explícita com aviso de risco); tarefa em segundo plano `src/servicos/expurgo.ts` iniciada por `src/instrumentation.ts` (1 minuto após a subida e a cada 6 horas), em lotes, que também purga atualizações antigas do Telegram e registros de auditoria com mais de 365 dias (`AUDITORIA_RETENCAO_DIAS`), registra `expurgo_automatico` só com contagens; relógio injetável; idempotente; falha não derruba o servidor.
4. **Direitos do titular**: (a) admin em Configurações > Privacidade busca por canal + identificador, apaga todas as conversas do titular (avisando `aoApagarConversa`, registrando `dados_do_titular_apagados`) e exporta em JSON e TXT (registrando `dados_do_titular_exportados`); (b) o visitante do chat embutido ganha "Apagar minha conversa" no `/embed/[id]` e a API pública `DELETE /api/publico/agentes/[id]/conversa`, que só apaga as conversas dele; (c) `/start` do Telegram anexa o aviso de privacidade padrão do workspace.
5. **Aviso de privacidade padrão do workspace** (texto até 300 e URL http/https opcional) como valor inicial do aviso do chat embutido e no `/start`; painel somente leitura "Dados pessoais tratados" com a base legal "legítimo interesse, a confirmar pela empresa".
6. **Telas** (admin, guarda no servidor em `layout.tsx`): `/configuracoes/privacidade` e `/configuracoes/auditoria` (filtros, paginação, detalhes legíveis, estados, cartões em tela estreita); itens no grupo Configurações visíveis só para admin.
7. **Ambiente e documentação**: variáveis novas só em `src/lib/ambiente.ts`, `.env.example` e README (seção "Privacidade e auditoria"); premissas novas; lacunas e convenções com `arquivo:linha`; testes que contam itens de menu atualizados.
8. **Verificação no navegador** de cada ação aparecendo na auditoria, do expurgo contra dados semeados, do "Apagar minha conversa" e da exportação, nos dois temas e a 375px.

## Não-objetivos

Contêiner, saúde, backup e restauração (FT-11: aqui só existe o tipo `restauracao` e o ponto de chamada); log estruturado e correlação (FT-11, PR-21); chat embutido (FT-06), Telegram (FT-07), vídeo (FT-08) e histórico (FT-09), já entregues, exceto os pontos de contato listados; trilha de auditoria de leitura (descartada no PROJETO.md); multiempresa (PR-02); parecer jurídico sobre a base legal; edição ou remoção manual de registros de auditoria; notificação ao titular.

## Critérios de aceite de negócio cobertos

- Leio as conversas dos visitantes e do Telegram, e apago uma conversa.
- Um administrador cadastra outro usuário, e essa pessoa entra e troca a própria senha (a exclusão definitiva completa o ciclo de vida do usuário).
- A interface funciona no celular e nos temas claro e escuro.

## Premissas aplicáveis

PR-18 e PR-19 (realiza); PR-12, PR-13, PR-14, PR-16, PR-23, PR-26, PR-27, PR-78, PR-80 (`docs/projeto/PREMISSAS.md`).

## Convenções

`docs/stack/CONVENCOES.md`.
