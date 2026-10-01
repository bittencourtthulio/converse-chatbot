# Lacunas

Uma linha por lacuna: o que se procurou, onde, e o que se concluiu.

1. Formato de armazenamento de `DateTime` no SQLite com o adaptador `better-sqlite3` do Prisma 7 (inteiro em milissegundos ou texto ISO): procurado em `prisma/schema.prisma`, `src/lib/prisma.ts` e nas migrations; `NÃO DOCUMENTADO`. Será provado por teste na task de agregação do painel. (painel-e-agregacao)
2. Sensibilidade a maiúsculas e acentos do `LIKE` do SQLite sobre texto em português: nada no repositório a afirma; `NÃO DOCUMENTADO`. A busca por texto será provada por teste e a limitação (ASCII apenas, sem acento) registrada como premissa. (conversas-e-modelo)
3. Método de contar consultas ao banco em teste: nenhum teste do repositório conta consultas (`tests/recuperacao-desempenho.test.ts` mede busca, não conta); `NÃO DOCUMENTADO`. (seed-testes-e-ci)
4. Token de cor para série de gráfico e para badge de canal: não existe em `src/estilos/tokens.css`; a F3 decide criar. (telas-menu-e-componentes)
