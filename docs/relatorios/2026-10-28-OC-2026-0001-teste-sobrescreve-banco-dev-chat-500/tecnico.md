---
expx_schema: 1
expx_tool: runx
kind: relatorio_tecnico
trabalho_id: OC-2026-0001
titulo: Teste sobrescreve o banco de desenvolvimento e o chat devolve 500
tipo_ocorrencia: bug
fechado_em: 2026-10-28
modulo_afetado: [testes, scripts-de-backup-e-restauracao]
arquivos_alterados: [tests/apoio/comando.ts, tests/backup-comando.test.ts, tests/ambiente-start.test.ts]
testes_adicionados: 1
---

# Relatório técnico — OC-2026-0001

## 1. Ocorrência e tipo

OC-2026-0001, `bug`. Fechada em 2026-10-28.

## 2. Sintoma relatado

`POST /api/agentes/<id>/conversar` com 500 e "Não foi possível concluir. Código de referência: 88769d8e". Esse código é de uma server action (`PrismaClientKnownRequestError`); o 500 do chat era a correlação `8ac33689` (`chat_erro`, `segredo_ilegivel`).

## 3. Base mapeada, em resumo

- `scripts/backup.ts`, `scripts/restore.ts`, `scripts/criar-admin.ts` começam com `import 'dotenv/config'`.
- `tests/apoio/comando.ts` (`rodarScript`) sobe esses scripts como filhos com ambiente mínimo e descartava variável `undefined`.
- `src/lib/cripto.ts:55-58` lança `segredo_ilegivel` (500) quando a chave de cifra não bate; `src/servicos/chat.ts:140` lê a chave do OpenRouter a cada turno.
- `src/lib/ambiente.ts` trata `''` como ausente em todos os caminhos relevantes (confirmado no QA).

## 4. Causa raiz

Dois testes passavam `DATABASE_URL: undefined`: `tests/backup-comando.test.ts` ("sem DATABASE_URL") e `tests/restauracao-comando.test.ts` (linha do "semBanco"). O filho não recebia a variável, o `dotenv/config` a preenchia com o arquivo de ambiente do desenvolvedor, e `backup` e `restore` rodavam de verdade contra `prisma/dev.db`. O `restore` aplicou um backup de fixture por cima do banco: a chave do OpenRouter passou a ser `chave-do-openrouter-de-teste-nao-real`, cifrada com a `ENCRYPTION_KEY` de teste (`00112233…`), que o servidor de desenvolvimento não decifra.

Prova: log do servidor (`.next/dev/logs/next-development.log`), `dev.db` com usuários `@teste.local`, auditorias `restauracao` e `backup_gerado` de origem "linha de comando", e a chave decifrando com a chave de teste. Reproduzido por teste: antes do fix o script lia uma isca e saía com 0.

## 5. Solução aplicada

`rodarScript` passa variável `undefined` ao filho como `''`; o `dotenv` não sobrescreve variável já definida. O mesmo vazamento existia em `tests/ambiente-start.test.ts` pelo `next start`, tratado igual com `vazioNoLugarDeAusente`.

## 6. Decisões

```
D-01 | Isolar o filho de rodarScript do arquivo de ambiente no helper | mexer em dotenv nos scripts | O defeito é do teste que promete isolamento; script de operação não muda
D-02 | Não mexer em cripto.ts nem em chat.ts | tornar o chat tolerante a segredo ilegível | Falhar fechado com erro seguro é o comportamento desejado
D-03 | Ampliar o escopo a tests/ambiente-start.test.ts | abrir ocorrência separada | Mesma família; o método não fecha task com suíte vermelha (B-01, autorizado pelo usuário)
```

## 7. Sprints, fases e tasks

sprint-01 / F-01.1: T-01.01 (teste de regressão), T-01.02 (fix no helper), T-01.03 (D-03). Todas concluídas em 2026-10-28, suíte verde. B-01 aberto e resolvido (a suíte tinha uma falha que existia antes do fix).

## 8. Arquivos alterados

- `tests/apoio/comando.ts`
- `tests/backup-comando.test.ts`
- `tests/ambiente-start.test.ts`

## 9. Testes adicionados

Regressão: "sem DATABASE_URL não lê um arquivo de ambiente: o banco que ele indicaria fica intacto" em `tests/backup-comando.test.ts`. Usa `DOTENV_CONFIG_PATH` com uma isca em diretório temporário. Falhou antes (saída 0) e passa depois. `tests/ambiente-start.test.ts` já estava vermelho antes e passou a 3/3.

Suíte final: 271 arquivos e 3121 testes passaram, 9 ignorados, 845,9 s; `tsc --noEmit` e `npm run lint` limpos; `shasum prisma/dev.db` igual antes e depois.

## 10. Risco residual

Achados BAIXA do QA: `tests/criar-admin.test.ts:69,76` não passam `ADMIN_SENHA`; testes de restauração não passam `ENCRYPTION_KEY`, `JWT_SECRET`, `BACKUP_MANTER`, `LOG_LEVEL`, `APP_URL`; testes que herdam o ambiente inteiro (`seed`, `conversar-rota`, `rotas`, `desligamento`). Nenhum toca o banco do desenvolvedor. Linha longa no JSDoc de `tests/apoio/comando.ts`.

## 11. O que observar em produção

Nada em produção: a mudança é só de testes. Deploy externo, não registrado. No desenvolvimento, conferir que `shasum prisma/dev.db` não muda ao rodar `npm test`.

## 12. Sugestões de novas ocorrências

1. Recuperar os dados de desenvolvimento perdidos: recadastrar usuário, agente e chave (ou `npm run db:seed`). Não existe cópia anterior.
2. `prisma.config.ts:14` cai em `file:./prisma/dev.db` quando `DATABASE_URL` falta; avaliar se deve falhar.
3. O helper `rodarScript` poderia ter um conjunto mínimo fixo de variáveis em vez de só descartar as ausentes.
4. A suíte leva cerca de 14 min porque roda um arquivo por vez sobre um único `prisma/test.db`: avaliar um banco por arquivo.
5. Os testes de `tests/criar-admin.test.ts` (achado BAIXA acima).
