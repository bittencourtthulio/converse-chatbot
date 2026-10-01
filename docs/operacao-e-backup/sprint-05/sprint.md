---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: operacao-e-backup
origem_buildx: plataforma-chatbot-ia
feature_id: FT-11
sprint_id: sprint-05
atualizado_em: 2026-10-01
titulo: "Backup consistente em um arquivo"
status: nao_iniciado
criterio_saida: "npm run backup e o botao Gerar backup agora criam um .tar.gz 0600 com manifest e SHA-256, a auditoria backup_gerado aparece, e o download so serve arquivos do BACKUP_DIR"
fases: ["F-05.1", "F-05.2", "F-05.3"]
riscos: ["a API de backup online precisa preservar o rowid (provado na T-01.01)", "arquivos do storage podem aparecer ou sumir durante o backup (so entram os listados no manifesto)", "download de arquivo grande por stream"]
---

# Sprint 05 — Backup consistente em um arquivo

## Objetivo

Entrega a biblioteca de backup, o servico, a auditoria, o comando, a rota de download e a parte da tela que gera e lista.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-05.1 | Biblioteca de backup | nenhuma |
| F-05.2 | Servico, auditoria e comando | nenhuma |
| F-05.3 | Download e tela | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

npm run backup e o botao Gerar backup agora criam um .tar.gz 0600 com manifest e SHA-256, a auditoria backup_gerado aparece, e o download so serve arquivos do BACKUP_DIR.

## Riscos conhecidos

- a API de backup online precisa preservar o rowid (provado na T-01.01)
- arquivos do storage podem aparecer ou sumir durante o backup (so entram os listados no manifesto)
- download de arquivo grande por stream
