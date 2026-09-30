# Lacunas

Uma linha por lacuna: o que se procurou, onde, e o que se concluiu.

1. Se os gatilhos de `DELETE` do SQLite disparam nas linhas apagadas por `ON DELETE CASCADE`: `NÃO DOCUMENTADO` no repositório; será provado por teste (exclusão de fonte e de agente). (fts5-e-migration)
2. Comportamento do `prisma migrate dev` diante de tabela virtual FTS5 e tabelas de sombra: `NÃO DOCUMENTADO` no repositório; a migration é escrita à mão e provada por `migrate deploy` do zero. (fts5-e-migration)
3. Se `VACUUM` renumera o `rowid` de `trechos` (tabela sem `INTEGER PRIMARY KEY`) e quebra o conteúdo externo: não verificado; vira premissa com `rebuild` como remédio. (fts5-e-migration)
4. Tamanho máximo da expressão `MATCH` e desempenho com ~5.000 trechos: sem número documentado; o teste de sanidade mede. (fts5-e-migration)
5. Lista de stopwords em português: não existe no repositório; procurada em `src/` e `package.json`; será uma constante própria, sem dependência nova. (turno-de-chat-e-sse)
6. Ferramentas de navegador para a verificação visual: disponibilidade `NÃO DOCUMENTADO` até a task de verificação. (interface-testar-e-conhecimento)
7. Contexto histórico do `memox`: não consultado; a ausência não é lacuna.
