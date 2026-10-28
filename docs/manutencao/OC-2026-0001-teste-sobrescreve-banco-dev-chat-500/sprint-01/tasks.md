---
expx_schema: 1
expx_tool: runx
kind: tasks
trabalho_id: OC-2026-0001
sprint_id: sprint-01
atualizado_em: 2026-10-28
tasks:
  - id: T-01.01
    titulo: Teste que reproduz o script lendo um env de isca
    fase: F-01.1
    status: concluida
    objetivo: Provar que DATABASE_URL indefinido no teste nao pode ser preenchido por um arquivo de env
    arquivos:
      cria: []
      altera: [tests/backup-comando.test.ts]
    teste_regressao: rodarScript backup com DATABASE_URL indefinido e DOTENV_CONFIG_PATH apontando a um env de isca com banco sentinela temporario deve sair com codigo diferente de zero e hoje sai com 0 gravando no sentinela
    teste_integracao: O processo filho real de scripts/backup.ts roda contra o env de isca em diretorio temporario, sem tocar prisma/dev.db
    teste_funcional: Com DATABASE_URL indefinido, codigo de saida diferente de 0, stderr contem DATABASE_URL e o banco sentinela nao ganha registro de auditoria
    criterio_aceite: O novo teste falha antes do fix (codigo de saida 0) e passa depois (codigo diferente de 0, stderr com DATABASE_URL)
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: verde
  - id: T-01.02
    titulo: rodarScript passa a bloquear a leitura do env
    fase: F-01.1
    status: concluida
    objetivo: Variavel que o teste deixa indefinida vai ao filho como string vazia, que o dotenv nao sobrescreve
    arquivos:
      cria: []
      altera: [tests/apoio/comando.ts]
    teste_regressao: null
    teste_integracao: Os testes de backup-comando, restauracao-comando, restauracao-recusas, restauracao-fim-a-fim e criar-admin seguem verdes com o helper alterado
    teste_funcional: rodarScript com DATABASE_URL indefinido faz o filho falhar com DATABASE_URL no stderr mesmo com env de isca disponivel
    criterio_aceite: T-01.01 passa, npm test termina com 0 failed e o hash de prisma/dev.db e igual antes e depois da suite
    depende_de: [T-01.01]
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: verde
  - id: T-01.03
    titulo: Teste de start de producao nao herda o env do desenvolvedor
    fase: F-01.1
    status: concluida
    objetivo: Variavel ausente vai vazia ao next start, que nao sobrescreve variavel definida
    arquivos:
      cria: []
      altera: [tests/ambiente-start.test.ts]
    teste_regressao: null
    teste_integracao: O next start real sem JWT_SECRET, DATABASE_URL e ENCRYPTION_KEY termina com codigo diferente de 0 e cita os tres nomes, mesmo com env do desenvolvedor presente
    teste_funcional: tests/ambiente-start.test.ts inteiro passa com 3 de 3
    criterio_aceite: ambiente-start 3 de 3 verde, npm test com 0 failed e hash de prisma/dev.db igual antes e depois
    depende_de: [T-01.02]
    paralelizavel: false
    concluida_em: 2026-10-28
    suite: verde
---

# Tasks — Sprint 01

## T-01.01 — Teste que reproduz o script lendo um env de isca

- **Objetivo:** fixar o defeito. O teste cria, em diretório temporário, um arquivo de env com `DATABASE_URL=file:<tmp>/sentinela.db` e passa `DOTENV_CONFIG_PATH` (variável que o `dotenv` honra) ao `rodarScript`, deixando `DATABASE_URL` indefinido. Isso simula o env do desenvolvedor sem tocá-lo.
- **Arquivos:** altera `tests/backup-comando.test.ts`.
- **teste_regressao:** hoje o filho lê a isca e sai com 0; deve sair com código diferente de 0.
- **teste_integracao / teste_funcional / criterio_aceite:** ver YAML.
- **Depende de:** nada. **Paralelizável:** não.

## T-01.02 — rodarScript passa a bloquear a leitura do env

- **Objetivo:** em `rodarScript`, valor `undefined` vira `''` no ambiente do filho (`tests/apoio/comando.ts:27`). O `dotenv` não sobrescreve variável já definida, e `ambiente.bancoArquivo` trata `''` como ausente (`src/lib/ambiente.ts:283-284`). O comentário do helper (`:15-17`) passa a dizer isso.
- **Arquivos:** altera `tests/apoio/comando.ts`.
- **Depende de:** T-01.01. **Paralelizável:** não.

## T-01.03 — Teste de start de produção não herda o env do desenvolvedor

- **Objetivo:** (D-03) em `tests/ambiente-start.test.ts`, variável ausente vai vazia ao `next start`. O teste já estava vermelho antes do fix (B-01), então ele é o seu próprio teste de regressão: vermelho antes, verde depois.
- **Arquivos:** altera `tests/ambiente-start.test.ts`. **Depende de:** T-01.02.

## Execução (E3)

- T-01.01 concluída em 2026-10-28: teste visto falhar (saída 0, leu a isca) e passar após o fix. Suíte verde.
- T-01.02 concluída em 2026-10-28: fix em `tests/apoio/comando.ts`. Suíte verde.
- T-01.03 concluída em 2026-10-28: `tests/ambiente-start.test.ts` 3/3 (D-03). Suíte verde.
- Suíte inteira: 271 arquivos passaram, 3121 testes passaram, 9 ignorados, 845,9 s. `tsc --noEmit` e `npm run lint` sem erro. `shasum prisma/dev.db` = `cdfe5899…` antes e depois.
