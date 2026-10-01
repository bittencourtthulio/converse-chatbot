# Dados do painel inicial e agregação em SQL (modo INTERNO)

## 1. Contrato de entrada

- Fontes de número existentes: `resumo(autor, agenteId)` em `src/servicos/fontes.ts:196` (total, prontas, em processamento, com erro e caracteres por agente; não agrega todos os agentes), `listar` de `src/servicos/agentes.ts:96` (todos os agentes), `Fonte.status` (`pendente|processando|pronto|erro`, `prisma/schema.prisma`), `Mensagem.criadoEm`, `Conversa.canal`.
- Chave do OpenRouter configurada: `src/servicos/integracoes.ts` (só o admin lê a máscara; a interface nunca vê a chave, PR-14). Chat publicado: `ConfiguracaoDoChat.ativo`. Canal conectado: `CanalTelegram.ativo`.
- Teto diário já usa "meia-noite do fuso do servidor" (`src/servicos/chat-publico-limites.ts`, `exigirTetoDiario`), precedente para o fuso do painel.

## 2. Contrato de saída

- A agregação pedida: mensagens por dia nos últimos 14 dias, conversas e mensagens dos últimos 7 dias com quebra por canal, fontes prontas e com erro, conversas recentes (5).

## 3. Limites e cotas

- Intervalo de 14 dias; sem paginação.

## 4. Erros conhecidos e tratamento

- Formato de armazenamento de `DateTime` no SQLite pelo adaptador `better-sqlite3` do Prisma 7: NÃO DOCUMENTADO nos arquivos do repositório; precisa ser provado por teste antes de escrever `strftime` (a F3 prevê uma task de teste de borda que descobre o formato real).

## 5. Riscos para a nossa implementação

- Agrupar por dia no fuso do servidor em SQLite exige modificador de fuso (`localtime`) que só vale no processo do servidor e se o instante estiver em formato que o `strftime` entende; o risco é agrupar em UTC sem perceber. Teste de virada de dia e de fuso (`TZ`) é obrigatório (briefing).
- Dias sem mensagem não existem no resultado do `GROUP BY`; o serviço preenche zero.
- A FT-11 (backup e saúde) deve considerar estas consultas: leem `mensagens` e `conversas` inteiras por intervalo; sem índice por `criadoEm` de mensagens além de `(conversaId, criadoEm)` (`prisma/schema.prisma:118`); com muitas mensagens a consulta de 14 dias faz varredura.
- Lista de primeiros passos: o passo da chave do OpenRouter só pode revelar o link a admin; para usuário comum o passo aparece sem link.

## 6. Fonte

`src/servicos/fontes.ts`, `src/servicos/agentes.ts`, `src/servicos/integracoes.ts`, `src/servicos/chat-publico-limites.ts`, `prisma/schema.prisma` (acesso em 2026-10-01).
