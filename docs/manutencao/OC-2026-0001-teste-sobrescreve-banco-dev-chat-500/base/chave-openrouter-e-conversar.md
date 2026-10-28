# Chave do OpenRouter e o turno de /conversar

## O que é e onde vive

- `src/app/api/agentes/[id]/conversar/route.ts`: POST do turno de chat; qualquer erro vira `respostaDeErro` (`route.ts:57-59`).
- `src/servicos/chat.ts`: `responderMensagem`; lê a chave com `obterChaveDoOpenrouter()` (`chat.ts:140`).
- `src/servicos/integracoes.ts`: `obterChaveDoOpenrouter` decifra a coluna gravada (`integracoes.ts` ~linha 130-139).
- `src/lib/cripto.ts`: AES-256-GCM; chave errada ou dado alterado lança `segredo_ilegivel` com status 500 (`cripto.ts:20-26`, `cripto.ts:55-58`).

## Contrato de entrada

`POST /api/agentes/<id>/conversar`, corpo JSON com `mensagem` e `conversaId` opcional (`route.ts:19-27`).

## Contrato de saída

SSE em caso de sucesso. Erro de aplicação vira JSON com o status dele; erro inesperado vira 500 com "Código de referência" (`src/app/api/resposta-de-erro.ts`). Em `chat.ts:212-219`, erro 5xx é logado como `chat_erro` com `codigo`, `agenteId` e `conversaId` (sem conteúdo).

## Estrutura de dados

Tabela `configuracao_do_workspace` (`prisma/dev.db`): `id` (PK, padrão `'unica'`), `openrouterChaveCifrada` TEXT, `atualizadoEm`, `atualizadoPor`, `modeloDeTranscricao`, `retencaoDiasConversas`, `avisoDePrivacidadePadrao`, `avisoDePrivacidadePadraoUrl` (lido do `.schema` do banco).

Registro real hoje: `id=unica`, `openrouterChaveCifrada` com 93 caracteres e prefixo `v1:`, `atualizadoEm=2026-10-28T13:24:33.938+00:00`. Decifrado com a `ENCRYPTION_KEY` **de teste** (`tests/setup.ts`, `00112233…eeff`) dá um texto de 37 caracteres sem prefixo `sk-or-`, o valor `CHAVE_DO_OPENROUTER_DE_TESTE = 'chave-do-openrouter-de-teste-nao-real'` (`tests/apoio/instalacao.ts:16`).

Outros dados de `dev.db` hoje: um único agente, `cmvs5c0et001qxponjsyzjif0` ("Agente da instalação"); usuários `usuario11@teste.local` (admin) e `usuario12@teste.local`; auditoria com `usuario_criado` às 13:24:33, `restauracao` às 13:24:34 (origem `backup-20261028-132433.tar.gz`) e `backup_gerado` às 13:24:42 (origem `linha de comando`).

## Funções e trechos relevantes

```
const chave = await obterChaveDoOpenrouter()
if (!chave) throw erroSemChave()
```
`src/servicos/chat.ts:140-141`

```
} catch {
  // Chave errada e dado adulterado são indistinguíveis no GCM.
  throw segredoIlegivel('chave diferente ou dado alterado')
}
```
`src/lib/cripto.ts:55-58`

## Quem chama e quem é chamado

**Chamadores:** `route.ts:36` (painel); canais públicos usam o mesmo serviço (`src/servicos/chat.ts:131`).

**Dependências:** Prisma/SQLite, `cripto.decifrar`, OpenRouter.

## Testes existentes

`tests/` cobre cifra e decifra (`tests/cripto*.test.ts`, não relidos nesta investigação: NÃO DETERMINADO o nome exato) e o chat de teste. Nada cobre "banco de desenvolvimento adulterado por teste".

## Limites e regras de negócio conhecidas

`ENCRYPTION_KEY` só é lida quando um segredo é cifrado ou decifrado (`cripto.ts:1-3`); chave diferente da usada na gravação sempre dá `segredo_ilegivel`.

## Riscos para esta ocorrência

A correção não deve mexer em `cripto.ts` nem em `chat.ts`: o comportamento deles está correto (falha fechada com erro seguro).

## Fonte

`src/app/api/agentes/[id]/conversar/route.ts`, `src/servicos/chat.ts`, `src/servicos/chat-erros.ts`, `src/servicos/integracoes.ts`, `src/lib/cripto.ts`, `src/app/api/resposta-de-erro.ts`, `.next/dev/logs/next-development.log`, `prisma/dev.db` (somente leitura) — mapeado em 2026-10-28
