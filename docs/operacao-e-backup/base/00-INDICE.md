---
expx_schema: 1
expx_tool: sprintx
kind: base_indice
trabalho_id: operacao-e-backup
origem_buildx: plataforma-chatbot-ia
feature_id: FT-11
atualizado_em: 2026-10-01
areas:
  - arquivo: log-e-erros.md
    titulo: Log, erro e correlacao hoje
    lacunas: 2
  - arquivo: ambiente-e-start.md
    titulo: Ambiente e start do servidor
    lacunas: 1
  - arquivo: banco-e-armazenamento.md
    titulo: Banco, FTS5 e armazenamento de arquivos
    lacunas: 2
  - arquivo: segundo-plano-e-auditoria.md
    titulo: Segundo plano, auditoria e pontos de contato
    lacunas: 0
  - arquivo: telas-menu-e-guardas.md
    titulo: Telas de Configuracoes, menu e guardas
    lacunas: 0
  - arquivo: testes-ci-e-docs.md
    titulo: Testes, CI e documentacao de projeto
    lacunas: 0
  - arquivo: conteiner-e-ferramentas.md
    titulo: Conteiner, tar, API de backup do SQLite e sinal do Next
    lacunas: 2
---

# Índice da base — operacao-e-backup

| Arquivo | Área | Resumo |
|---|---|---|
| `log-e-erros.md` | Log e erro | 22 `console.*` em `src/`, correlação de 4 bytes de `chat-erros`, sem páginas de erro de raiz |
| `ambiente-e-start.md` | Ambiente | getters lazy, `ENCRYPTION_KEY` lazy, `register()` com um `try` por tarefa |
| `banco-e-armazenamento.md` | Banco e disco | 11 tabelas, FTS5 por migration, layout do `storage/`, URL relativa ambígua |
| `segundo-plano-e-auditoria.md` | Segundo plano | fila sem `parar`, agendador do expurgo, 18 ações de auditoria |
| `telas-menu-e-guardas.md` | Telas | menu único, guarda de admin no layout, componentes de tela |
| `testes-ci-e-docs.md` | Testes | setup, `subirServidor`, citações de linha em `projeto.test.ts`, CI |
| `conteiner-e-ferramentas.md` | Externo | API de backup do `better-sqlite3`, `tar`, Docker local, `NEXT_MANUAL_SIG_HANDLE` |
