# Dados, segredo cifrado e ambiente (modo INTERNO)

## 1. Contrato de entrada

- Prisma: `Agente` (`prisma/schema.prisma:62`) tem relação 1:1 `chat ConfiguracaoDoChat?` com `onDelete: Cascade` (`schema.prisma:151-168`); `Conversa.canal` é texto e já prevê `"telegram"` (`schema.prisma:84`).
- Migrations: só acrescentam (`tests/migracoes.test.ts:14`); a última é `prisma/migrations/20260930210000_configuracao_do_chat`. `tests/setup.ts:31-37` roda `prisma migrate deploy`.
- `limparBanco` (`tests/ajuda.ts:39-47`) apaga tabelas em ordem; as novas tabelas devem entrar nele antes de `agente`.
- Cripto: `cifrar`/`decifrar`/`mascararSegredo` em `src/lib/cripto.ts:44,56,81`; chave só lida ao usar (`cripto.ts:29`). Padrão de segredo: `src/servicos/integracoes.ts:69-85` (cifra ao salvar, devolve só máscara).
- Ambiente: variáveis só em `src/lib/ambiente.ts` (`ambiente.ts:25-101`); `ehProducao` em `ambiente.ts:98`; `appUrlPublica` (sem padrão, valida http/https, `ambiente.ts:66`); `.env.example` documenta cada uma.
- Exclusão de agente: `src/servicos/agentes.ts:149-160` (`deleteMany`, cascata no banco).

## 2. Contrato de saída

- Serviço de segredo devolve máscara e nunca o cifrado. `mascararSegredo` mostra `6 primeiros…4 últimos` para segredo com 12 ou mais caracteres (`cripto.ts:81-86`); para o token do Telegram isso mostraria os 6 primeiros dígitos (o `botId`, que é público no `getMe`): aceitável, mas a F2 decide mostrar só o `@usuario` do bot (PR-14).

## 3. Limites e cotas

- `ENCRYPTION_KEY` de 32 bytes obrigatória só ao cifrar (`cripto.ts:29-41`). Sem ela, conectar o bot dá erro `configuracao_invalida` claro.
- SQLite: `agenteId` único garante 1:1; `(canalId, updateId)` único serve ao dedupe.

## 4. Erros conhecidos e tratamento

- `ErroDeAplicacao` (`src/lib/erros.ts:4`); `mensagemSemSegredo` em `src/app/acoes.ts:41-45` registra só o nome do erro inesperado (a ser reusada pelas ações do canal).
- `updateId` do Telegram é inteiro de até 32 bits+ ; guardar como `Int` no SQLite do Prisma é suficiente? `NÃO DOCUMENTADO` (a fonte não dá o teto); usar `BigInt`/texto na modelagem é a escolha segura (F2/F3).

## 5. Riscos para a nossa implementação

- Trocar `ENCRYPTION_KEY` invalida o token gravado (PR-39): a tela precisa dizer "reconecte".
- `NODE_ENV=production` no servidor de teste de rotas (`tests/apoio/servidor.ts:21`): a exceção `TELEGRAM_PERMITIR_URL_NAO_HTTPS` seria ignorada em produção; a verificação ponta a ponta com URL local HTTP precisa de outro caminho (túnel simulado ou `APP_URL` HTTPS de fachada apontando para o falso, já que o `setWebhook` é simulado e nunca chama o app). Decisão da F2.
- `APP_URL` hoje é opcional (`.env.example`); a FT-07 passa a exigi-la para conectar.

## 6. Fonte

`prisma/schema.prisma`, `prisma/migrations/`, `tests/ajuda.ts`, `tests/setup.ts`, `tests/migracoes.test.ts`, `src/lib/cripto.ts`, `src/lib/ambiente.ts`, `src/servicos/integracoes.ts`, `src/servicos/agentes.ts`, `src/app/acoes.ts`, `.env.example`, acesso em 2026-09-30.
