---
expx_schema: 1
expx_tool: runx
kind: ocorrencia
trabalho_id: OC-2026-0001
titulo: Teste sobrescreve o banco de desenvolvimento e o chat devolve 500
tipo_ocorrencia: bug
recebido_em: 2026-10-28
origem: relato colado na sessao
tem_reproducao: false
modulo_afetado: [chat, scripts-de-backup-e-restauracao, testes]
atualizado_em: 2026-10-28
---

# OC-2026-0001 — Teste sobrescreve o banco de desenvolvimento e o chat devolve 500

## Identificação

| Campo | Valor |
|---|---|
| identificador | OC-2026-0001 (gerado: `docs/manutencao/` e `docs/relatorios/` não existiam) |
| titulo | Teste sobrescreve o banco de desenvolvimento e o chat devolve 500 |
| tipo | bug |
| aberta em | 2026-10-28 |

O relato descreve só o sintoma (500 no chat). O título já reflete a causa achada no E1.

## Relato original do cliente

> Não foi possível concluir. Código de referência: 88769d8e. :3000/api/agentes/cmvs4xow9001q0wonvwrxyblv/conversar:1  Failed to load resource: the server responded with a status of 500 (Internal Server Error)

## Passos de reprodução

NÃO DETERMINADO. Não vieram passos; a investigação usou o log do servidor de desenvolvimento e o estado do banco como evidência (ver `01-CAUSA-RAIZ.md`).

Observação: o código `88769d8e` do relato NÃO é o do 500 do `/conversar`. No log, `88769d8e` é um `PrismaClientKnownRequestError` numa server action (`erro_inesperado_na_acao`); o 500 do `/conversar` é a correlação `8ac33689` (`chat_erro`, código `segredo_ilegivel`).

## Ambiente, versão e dados relevantes

- **Ambiente:** desenvolvimento local, `next dev` na porta 3000 (Next 16.3.8), SQLite em `prisma/dev.db`.
- **Versão:** branch `feat/design-referencia-e-landing`, HEAD `6142849`.
- **Usuário/perfil:** NÃO DETERMINADO.
- **Dados envolvidos:** agente `cmvs4xow9001q0wonvwrxyblv`; correlações `88769d8e` e `8ac33689`.
- **Evidências anexadas:** `.next/dev/logs/next-development.log` (linhas 4 e 5).
