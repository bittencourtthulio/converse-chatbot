---
description: Leva o trabalho já implementado até o repositório e até o revisor — roda o fluxo automático completo da mergex a partir do estado atual, verificando a prontidão, classificando o que exige olho humano, montando a descrição do pull request e o pacote do QA, subindo a branch e abrindo o PR. Use ao terminar uma feature ou uma ocorrência, ao pedir para entregar, versionar, subir o trabalho, abrir PR ou passar para o QA.
---

Acione a skill `mergex` e execute o **fluxo automático completo** a partir do estado atual do trabalho.

Trabalho: $ARGUMENTS

Se nenhum trabalho for informado, descubra qual é inspecionando o disco: a branch ativa, `docs/entregas/`, e as pastas de trabalho da sprintx (`docs/<slug>/`) e da runx (`docs/manutencao/<OC-ID>-<slug>/`). Se houver mais de um trabalho em aberto e não for possível determinar qual, liste os candidatos com o estado de cada um e peça que o usuário escolha.

## O que executar

Descubra em que ponto o trabalho está e siga daí:

| Estado | Rode |
|---|---|
| O trabalho vai começar, sem branch própria | **E0** (`references/00-abertura.md`) e devolva o controle para a skill de origem executar as tasks |
| Há task concluída sem commit | **E1** (`references/01-commits.md`) para cada uma, na ordem em que fecharam |
| A execução terminou | **E2 → E8**, nesta ordem |

O fluxo do fim (E2 a E8):

1. **E2** `references/02-prontidao.md` — portão de prontidão. **`BLOQUEADO` encerra tudo aqui**: não classifique, não monte PR, não suba nada.
2. **E3** `references/03-atencao-humana.md` — classificação nas três faixas.
3. **E4** `references/04-descricao-pr.md` — descrição do pull request.
4. **E5** `references/05-pacote-qa.md` — pacote para o QA.
5. **E6** `references/06-push.md` — push da branch.
6. **E7** `references/07-abertura-pr.md` — abertura do pull request.
7. **E8** `references/08-registro.md` — registro da entrega.

Leia o reference da etapa atual antes de agir, e somente o dela.

## Regras

- Execute de ponta a ponta, sem perguntar e sem pedir autorização.
- Nada na entrega é inventado: todo conteúdo vem de artefato existente. Insumo ausente vira aviso do que falta.
- Nunca push forçado, nunca na branch principal, nunca reescrever histórico enviado.
- Ferramenta de abertura de PR ausente não é erro: grave a descrição em `PR.md` e informe. Nunca peça credencial.
- Repositório sem versionador não é erro: siga sem as etapas de versionamento.
- **Ao terminar, NÃO sugira o merge e NÃO sugira `/mergex-revisar`.** A revisão e a integração são manuais e só rodam quando o desenvolvedor as chama pelo nome.
