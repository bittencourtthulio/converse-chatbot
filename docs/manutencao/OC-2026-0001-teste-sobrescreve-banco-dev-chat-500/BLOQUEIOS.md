---
expx_schema: 1
expx_tool: runx
kind: bloqueios
trabalho_id: OC-2026-0001
atualizado_em: 2026-10-28
bloqueios:
  - id: B-01
    task: T-01.02
    aberto_em: 2026-10-28
    resolvido_em: 2026-10-28
    descricao: tests/ambiente-start.test.ts falha sem o fix tambem; o next start le o env do desenvolvedor e sobe com as variaveis presentes
---

# Bloqueios

B-01 | T-01.02 (e T-01.01, que depende da suíte verde) | `tests/ambiente-start.test.ts:46` ("start de produção sem configuração") falha com e sem o fix desta ocorrência. O teste remove `JWT_SECRET`, `DATABASE_URL` e `ENCRYPTION_KEY` do ambiente, mas o `next start` carrega sozinho o arquivo de ambiente do desenvolvedor e sobe normalmente, então o teste esperava uma falha que não acontece. É a mesma família do defeito desta ocorrência (teste herda o ambiente do desenvolvedor), mas por outro caminho e em outro arquivo, fora de `arquivos_impactados`. | Decisão do usuário: ampliar o escopo com uma nova decisão D-03 (passar as três variáveis como string vazia nesse teste, que o Next não sobrescreve) ou abrir uma ocorrência separada.

Evidência: suíte completa com o fix: 1 failed, 3120 passed, 9 skipped (271 arquivos, 808 s). Com as minhas mudanças guardadas: o mesmo teste falha (1 failed, 2 passed no arquivo). `prisma/dev.db` com o mesmo hash (`cdfe5899…`) antes e depois da suíte.

B-01 resolvido em 2026-10-28: o usuário escolheu ampliar o escopo (D-03); task T-01.03.
