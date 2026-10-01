# Conversas, mensagens e o serviço atual (modo INTERNO)

## 1. Contrato de entrada

- Modelos `Conversa` e `Mensagem` em `prisma/schema.prisma:80-122` (linhas do arquivo na data de acesso): `Conversa` tem `id`, `agenteId` (cascata, `onDelete: Cascade`), `canal` (`painel`|`widget`|`telegram`), `identificadorExterno` (visitante ou chat), `titulo`, `criadoPorId` (nulo no widget e no Telegram; `onDelete: SetNull`), `criadoEm`, `atualizadoEm`; índice `@@index([agenteId, atualizadoEm])`. `Mensagem` tem `papel` (`user`|`assistant`), `conteudo`, `modelo`, `tokensEntrada`, `tokensSaida`, `fontes` (JSON em texto), `criadoEm`; `onDelete: Cascade` por `conversaId`; índice `@@index([conversaId, criadoEm])`.
- `src/servicos/conversas.ts`: `criar`, `obter(id, dono)` (404 se o dono não confere), `listar(filtro)` (um agente e um canal obrigatórios), `anexarMensagem` (grava e atualiza `atualizadoEm` em transação), `listarMensagens`, `apagar(id)` (`deleteMany`, 404 se zero) e `retomarDoPainel` (`src/servicos/conversas.ts:128-243`). Nenhuma função lista conversas de todos os agentes e canais: o histórico precisa de serviço novo.
- Nenhum índice em `Mensagem.conteudo`; o filtro `LIKE` do briefing percorre as mensagens (limite de 200 conversas casadas pedido no briefing).

## 2. Contrato de saída

- `ConversaVisivel` e `MensagemVisivel` (`src/servicos/conversas.ts:15-37`) devolvem o registro do Prisma com `Date` nos instantes.
- `Mensagem.fontes` é lido por `lerFontesGravadas(json)` (`src/servicos/fontes-da-resposta.ts:79`), que devolve lista vazia para JSON ausente ou inválido.

## 3. Limites e cotas

- Título da conversa: 60 caracteres (`LIMITE_DO_TITULO`, `src/servicos/conversas.ts:14`). Retomada do painel: 100 mensagens. Conversa do widget e do Telegram: 60 mensagens por conversa (`docs/stack/CONVENCOES.md`, seção de limites).
- Paginação, 25/100 por página, lote de 50 e 200 conversas casadas pelo texto: definidos pelo briefing da feature, não por código existente.

## 4. Erros conhecidos e tratamento

- `naoEncontrado` (404), `entradaInvalida` (422), `naoAutenticado` (401) em `src/lib/erros.ts:15-25`; erro inesperado nunca vaza pilha.
- SQLite: `database is locked` aparece sob carga alheia na máquina (instrução do laço), não é defeito do código.

## 5. Riscos para a nossa implementação

- N+1: listar conversas com contagem e última mensagem por conversa por consulta individual seria N+1; a consulta agregada precisa de SQL cru parametrizado (`prisma.$queryRaw`, regra de `docs/stack/CONVENCOES.md`, seção "Consulta SQL com texto do usuário").
- `LIKE` com texto do usuário: `%`, `_` e `\` precisam de escape e de cláusula `ESCAPE`; o SQLite faz `LIKE` sem distinguir maiúsculas só para ASCII (NÃO DOCUMENTADO neste repositório; a comprovar por teste).
- Apagar conversa de painel apaga também o que o usuário vê na aba Testar: a retomada do painel simplesmente não acha conversa (`retomarDoPainel` devolve `null`, `src/servicos/conversas.ts:218-221`).
- `limparBanco` em `tests/ajuda.ts:39-49` já apaga mensagens e conversas; nada a mudar.

## 6. Fonte

`prisma/schema.prisma`, `src/servicos/conversas.ts`, `src/servicos/fontes-da-resposta.ts`, `src/lib/erros.ts`, `docs/stack/CONVENCOES.md`, `tests/ajuda.ts` (acesso em 2026-10-01).
