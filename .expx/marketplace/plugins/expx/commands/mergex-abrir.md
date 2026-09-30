---
description: Abre a branch do trabalho antes da primeira linha de código — etapa E0 da mergex, isolada. Use ao começar a implementar uma feature ou uma ocorrência, ao iniciar a execução de um plano, ou quando pedirem para criar a branch do trabalho, versionar o que vai ser feito ou preparar o repositório para receber a implementação.
---

Acione a skill `mergex` e execute **apenas a etapa E0 (abertura)**, seguindo `references/00-abertura.md`.

Trabalho: $ARGUMENTS

Se nenhum trabalho for informado, descubra qual é pelo disco: `docs/<slug>/ORQUESTRADOR.md` (sprintx) ou `docs/manutencao/<OC-ID>-<slug>/ORQUESTRADOR.md` (runx).

## O que fazer

1. Detectar se o repositório usa versionamento. Sem versionador: registre e siga sem erro.
2. Verificar se há alteração não commitada pendente. **Se houver, PARE e avise** — nunca crie nem troque branch por cima de trabalho não salvo.
3. Determinar a branch base: convenção declarada na stackx, senão a detectada no repositório, senão a principal atual.
4. Criar a branch do trabalho (`feature/<slug>`, `fix/<OC-ID>-<slug>` ou `chore/<OC-ID>-<slug>`; convenção do repositório vence). **Se a branch já existir, retome nela** — não crie outra.
5. Registrar a branch no `ORQUESTRADOR.md` e criar `docs/entregas/<trabalho_id>/ENTREGA.md` com `estado: aberto`.

Ao terminar, devolva uma linha com o nome da branch e a base, e devolva o controle: quem executa as tasks é a skill de origem.
