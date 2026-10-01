# Testes, expurgo, banco e ambiente

## Contrato de entrada

Cada arquivo de teste usa um SQLite próprio criado por `prisma migrate deploy` (`tests/setup.ts:36-45`); `limparBanco()` esvazia as tabelas entre testes (`tests/ajuda.ts`) e precisará apagar a tabela nova de sessões revogadas. `criarUsuario({papel, ativo, senha, email})` cria o usuário real (`tests/ajuda.ts`). `tests/rotas.test.ts` sobe `next start` em produção na porta 3178 (`PORTA`, `esperarDePe`), com o OpenRouter simulado, e monta o cookie com `entrar()` (`tests/rotas.test.ts:14-95`); o teste exige `npm run build` anterior. Testes de ação simulam `@/app/sessao-servidor`, `next/navigation` e `next/cache` (`tests/telegram-acoes.test.ts:12-35`). `tests/apoio/servidor.ts` é o apoio de servidor de produção de outros testes.

## Contrato de saída

`executarExpurgo({agora, tamanhoDoLote})` apaga conversas vencidas, atualizações do Telegram e registros de auditoria e devolve contagens (`src/servicos/expurgo.ts:61-100`); só grava a auditoria `expurgo_automatico` quando algo foi apagado (`src/servicos/expurgo.ts:88-99`), com `detalhes` fixos. O agendador roda a cada 6 horas (`INTERVALO_DO_EXPURGO_MS`, `src/servicos/expurgo.ts:107-112`). Testes: `tests/expurgo.test.ts` e `tests/expurgo-agendador.test.ts`.

## Limites e cotas

`tests/migracoes.test.ts:14` falha em `DROP TABLE` ou `DROP COLUMN` sem marca; a migration nova só acrescenta. `tests/sistema.test.ts:52` e `src/lib/versao.ts` contam migrations, então a migration nova muda a conta "n de n". Variáveis opcionais numéricas são conferidas no start de produção por `INTEIROS_OPCIONAIS` (`src/lib/ambiente.ts`). `.env.example` documenta cada variável. Backup: o arquivo `.db` inteiro é copiado pela API de backup online (`src/lib/backup.ts`), então tabela nova entra sem alteração, mas `tests/restauracao-fim-a-fim.test.ts` e `tests/restauracao-comando.test.ts:142` inserem usuário com colunas explícitas (a coluna nova com padrão não os quebra).

## Erros conhecidos e tratamento

Máquina compartilhada: `database is locked` ou estouro de tempo por carga alheia não é falha do código. Nunca rodar dois `vitest` ao mesmo tempo. `DATABASE_URL` não deve ser exportada ao rodar `npm test` (só o `build` a precisa).

## Riscos para a nossa implementação

O servidor de produção do teste de ponta a ponta precisa de `JWT_TTL_SEGUNDOS` e `SESSAO_MAXIMA_HORAS` pequenos para provar a renovação sem esperar; como o processo é filho com `env` copiado, o teste passa os valores no `spawn`. O relógio do servidor de produção não é injetável de fora: a prova da renovação ponta a ponta usa TTL de poucos segundos, e a prova com relógio injetado é de serviço. A expiração de um JWT usa o relógio real do `jose`, então a renovação por serviço precisa usar um relógio próprio para decidir (`agora` por parâmetro) e o `jwtVerify` receber `currentDate` quando injetado.

## Fonte

`tests/setup.ts`, `tests/ajuda.ts`, `tests/rotas.test.ts`, `tests/telegram-acoes.test.ts`, `src/servicos/expurgo.ts`, `src/lib/ambiente.ts`, `tests/migracoes.test.ts` — acessado em 2026-10-01
