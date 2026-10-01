---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: operacao-e-backup
origem_buildx: plataforma-chatbot-ia
feature_id: FT-11
sprint_id: sprint-06
atualizado_em: 2026-10-01
titulo: "Restauracao e o teste que a prova"
status: nao_iniciado
criterio_saida: "npm run restore restaura numa instalacao limpa e o teste fim a fim confere os dados linha a linha, a busca FTS, o arquivo, a auditoria e a chave cifrada; os casos negativos recusam sem efeito"
fases: ["F-06.1", "F-06.2"]
riscos: ["a troca de banco e storage precisa de desfazer se falhar no meio", "o teste fim a fim roda o comando como processo filho com banco proprio e nao pode tocar prisma/dev.db", "diretorio sem permissao nao se testa como root"]
---

# Sprint 06 — Restauracao e o teste que a prova

## Objetivo

Entrega a biblioteca de restauracao, o comando que so existe por linha de comando e a prova automatizada da PR-20.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-06.1 | Biblioteca de restauracao | nenhuma |
| F-06.2 | Comando e prova | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

npm run restore restaura numa instalacao limpa e o teste fim a fim confere os dados linha a linha, a busca FTS, o arquivo, a auditoria e a chave cifrada; os casos negativos recusam sem efeito.

## Riscos conhecidos

- a troca de banco e storage precisa de desfazer se falhar no meio
- o teste fim a fim roda o comando como processo filho com banco proprio e nao pode tocar prisma/dev.db
- diretorio sem permissao nao se testa como root
