---
description: Monta a descrição do pull request, sobe a branch e abre o PR — etapas E4, E6 e E7 da mergex. Costura os artefatos já existentes na descrição da entrega, empurra a branch e abre o pull request pela ferramenta do serviço de hospedagem quando ela existir. Use ao pedir para abrir PR, subir o trabalho, empurrar a branch, mandar para revisão ou preparar a descrição da entrega.
---

Acione a skill `mergex` e execute **as etapas E4, E6 e E7**, nesta ordem.

Trabalho: $ARGUMENTS

## Pré-requisito

O portão de prontidão (E2) precisa ter devolvido `PRONTO`. Se ainda não rodou, rode-o antes (`references/02-prontidao.md`). **Portão bloqueado encerra: nada sobe.**

O pacote de QA (E5) precisa existir antes do push. Se não existir, rode o E5 antes (`references/05-pacote-qa.md`).

## O que fazer

1. **E4** — `references/04-descricao-pr.md`. Monte a descrição a partir dos artefatos existentes, na ordem definida, e grave `docs/entregas/<trabalho_id>/PR.md` com `assets/TEMPLATE-PR.md`. A descrição **cabe em uma tela**; seção sem insumo é **omitida**, nunca preenchida com texto genérico. A lista de arquivos alterados vai em destaque no topo, completa.
2. **E6** — `references/06-push.md`. Suba a branch. Nunca forçado, nunca na principal. Se o remoto tiver commits que a branch local não tem, **pare e avise** em vez de reconciliar.
3. **E7** — `references/07-abertura-pr.md`. Detecte a ferramenta do serviço **antes de tentar**. Abra como rascunho quando o pacote de QA ainda não foi aprovado; como pronto para revisão quando já foi.

## Regras

- Nada na descrição é inventado: todo conteúdo vem de artefato existente.
- **Ferramenta de PR ausente não é erro**: a descrição já está em `PR.md`, informe que o push foi feito e que basta abrir o PR manualmente. **Nunca peça credencial, nunca configure autenticação.**
- Ao terminar, atualize `ENTREGA.md` (E8) e **não sugira o merge nem `/mergex-revisar`**.
