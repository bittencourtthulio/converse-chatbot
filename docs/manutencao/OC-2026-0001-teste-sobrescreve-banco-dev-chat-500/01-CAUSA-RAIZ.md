---
expx_schema: 1
expx_tool: runx
kind: causa_raiz
trabalho_id: OC-2026-0001
modo: causa_raiz
comprovada: true
evidencia: log
arquivos_impactados: [tests/apoio/comando.ts, tests/backup-comando.test.ts, tests/restauracao-comando.test.ts, tests/ambiente-start.test.ts]
decisoes:
  - id: D-01
    decisao: Isolar o filho de rodarScript do .env do desenvolvedor no proprio helper de teste
    alternativa_descartada: Trocar import dotenv/config nos scripts por carga condicional
    motivo: O defeito e do teste que promete isolamento e nao cumpre; script de operacao real nao muda
  - id: D-02
    decisao: Nao mexer em cripto.ts nem em chat.ts
    alternativa_descartada: Tornar o chat tolerante a segredo ilegivel
    motivo: Falhar fechado com erro seguro e o comportamento desejado (PR-14)
  - id: D-03
    decisao: Ampliar o escopo ao teste ambiente-start, passando variavel ausente como texto vazio ao next start
    alternativa_descartada: Abrir ocorrencia separada e fechar esta com a suite vermelha
    motivo: Mesma familia do defeito, correcao de uma linha, e o metodo nao fecha task com suite vermelha (B-01, autorizado pelo usuario)
atualizado_em: 2026-10-28
---

# Causa raiz — OC-2026-0001 Teste sobrescreve o banco de desenvolvimento e o chat devolve 500

STATUS: COMPROVADO

## Comportamento atual

O `POST /api/agentes/<id>/conversar` devolve 500 porque a chave do OpenRouter gravada em `prisma/dev.db` não decifra com a `ENCRYPTION_KEY` do servidor (`src/lib/cripto.ts:55-58` → `segredo_ilegivel`, status 500). A linha de `configuracao_do_workspace` não é a do desenvolvedor: é a fixture de teste (ver prova).

## Comportamento esperado

Teste automatizado nunca toca `prisma/dev.db`. O chat do desenvolvimento segue com a chave que o usuário cadastrou.

## A prova

**Log do servidor** (`.next/dev/logs/next-development.log`, linhas 4 e 5):

```
{"msg":"chat_erro","correlacao":"8ac33689","codigo":"segredo_ilegivel","agenteId":"cmvs4xow9001q0wonvwrxyblv","conversaId":null}
{"msg":"erro_inesperado_na_acao","correlacao":"88769d8e","erro":"PrismaClientKnownRequestError"}
```

**Estado do banco** (leitura somente, `prisma/dev.db`): a chave gravada decifra com a chave de TESTE (`tests/setup.ts`, `00112233…eeff`) e vale `chave-do-openrouter-de-teste-nao-real` (`tests/apoio/instalacao.ts:16`); usuários `usuario11@teste.local` e `usuario12@teste.local`; auditoria `restauracao` (13:24:34, origem `backup-20261028-132433.tar.gz`) e `backup_gerado` (13:24:42, origem `linha de comando`). Nenhuma dessas linhas é criada por uso normal: são o que `restore` e `backup` gravam quando rodam.

**Mecanismo no código:**

```
const r = await rodarScript('backup', variaveis({ DATABASE_URL: undefined }))
```
`tests/backup-comando.test.ts:78`; idem `tests/restauracao-comando.test.ts:210`.

`rodarScript` descarta variável `undefined` (`tests/apoio/comando.ts:30-31`) e sobe `scripts/<script>.ts`, que começa com `import 'dotenv/config'` (`scripts/backup.ts:7`, `scripts/restore.ts:14`). O `dotenv` preenche `DATABASE_URL` com o `.env` do desenvolvedor, o script deixa de falhar com "DATABASE_URL ausente" e roda de verdade: o `restore` do teste de `:210` restaura o backup da fixture por cima de `dev.db`, e o `backup` de `:78` grava auditoria nele. A chave de teste passa a ser a única que o `dev.db` guarda; o servidor, com a `ENCRYPTION_KEY` do `.env`, não a decifra, e o chat dá 500. O mesmo defeito explica o agente e os usuários sumidos.

## Arquivos e módulos impactados

> Esta lista TRAVA o escopo.

- `tests/apoio/comando.ts` — `rodarScript` passa a impedir que o filho leia o `.env` do desenvolvedor.
- `tests/backup-comando.test.ts` — teste de regressão e ajuste do caso `DATABASE_URL: undefined` (linha 78).
- `tests/restauracao-comando.test.ts` — idem para a linha 210.
- `tests/ambiente-start.test.ts` — (D-03) `next start` carrega o env do desenvolvedor; variável ausente passa a ir vazia.

Fora do escopo (sugestões de nova ocorrência): restaurar os dados de desenvolvimento perdidos; revisar `prisma.config.ts:14`, que também cai em `dev.db` sem a variável.

## Opções de solução consideradas

| Opção | Trade-off |
|---|---|
| A. `rodarScript` define `DOTENV_CONFIG_PATH` para um arquivo inexistente em todo filho | Protege todos os testes atuais e futuros num ponto só; o helper já promete esse isolamento |
| B. Só trocar `undefined` por `''` nos dois testes | Mínimo, mas o próximo teste esquecido repete o dano |
| C. Os scripts ignoram `.env` quando `NODE_ENV=test` | Muda comando de operação real por causa de teste |

## Decisões

```
D-01 | Isolar o filho de rodarScript do .env no helper (opção A) | opção C, mexer em dotenv nos scripts | O defeito é do teste que promete isolamento e não cumpre; script de operação não muda
D-02 | Não mexer em cripto.ts nem em chat.ts | tornar o chat tolerante a segredo ilegível | Falhar fechado com erro seguro é o comportamento desejado
D-03 | Ampliar o escopo a tests/ambiente-start.test.ts (variável ausente vai vazia ao next start) | abrir ocorrência separada | Mesma família do defeito; o método não fecha task com suíte vermelha (B-01)
```

## Como isso será testado

- **Regressão (falha antes):** um teste que roda `backup` por `rodarScript` com `DATABASE_URL` indefinido e um `.env` de isca no diretório de trabalho do filho, com banco sentinela dentro de um diretório temporário, e exige falha com `DATABASE_URL` no stderr e o sentinela intacto. Hoje o filho lê a isca e escreve no sentinela. O E2 define como injetar a isca sem tocar o `.env` real (por exemplo, `cwd` configurável no helper).
- **Integração:** os dois testes existentes (`:78`, `:210`) seguem verdes, agora sem `.env` envolvido.
- **Funcional:** `npm test` inteiro e, ao fim, `prisma/dev.db` com `mtime` e hash inalterados.
- Recomendação de segurança para a execução: rodar a suíte com `prisma/dev.db` copiado antes e comparado depois.
