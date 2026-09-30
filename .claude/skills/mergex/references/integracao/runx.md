# Integração — runx

A `runx` trata ocorrências de produção, em cinco estágios: E1 INVESTIGAÇÃO → E2 PLANO → E3 FIX → E4 QA → E5 RELATÓRIO.

**Atenção à colisão de nomes.** As duas skills numeram estágios com `E`. Neste documento:

- **E1..E5 da runx** = os estágios dela (investigação, plano, fix, QA, relatório);
- **E0..E9 da mergex** = as etapas desta skill.

Sempre diga de qual skill é o estágio.

## Os pontos de acionamento

| Momento na runx | Etapa da mergex | O que acontece |
|---|---|---|
| Início do **E3 da runx** (fix), antes da primeira task | **E0 ABERTURA** | Cria `fix/<OC-ID>-<slug>` ou `chore/<OC-ID>-<slug>`, registra no `ORQUESTRADOR.md` e cria `docs/entregas/<OC-ID>-<slug>/ENTREGA.md` |
| Ao fechar **cada** task | **E1 COMMIT** | Um commit por task |
| **Entre o E4 e o E5 da runx** | **E2 → E8** | Portão, classificação, descrição do PR, pacote de QA, push, abertura do PR, registro |

### Por que a entrega fica entre o E4 e o E5 da runx

O **E4 da runx é o QA**: valida a entrega contra o plano e o escopo, e grava `QA.md` com `VEREDITO: APROVADO` ou `REPROVADO`.

O **E5 da runx é o relatório**: grava o relatório técnico e o relatório de uso, atualiza o `INDICE.md` e **fecha a ocorrência**.

A mergex entra no meio porque:

- o portão (E2 da mergex) precisa do veredito do QA — QA reprovado barra a entrega;
- o E5 da runx **só roda depois da entrega aceita**, porque é ele que fecha a ocorrência. **A mergex entrega; a runx fecha** (regra 19).

Fechar a ocorrência antes de a entrega existir registraria como resolvido algo que ainda não chegou ao repositório.

### O nome da branch depende do tipo da ocorrência

| `tipo` da ocorrência | Prefixo |
|---|---|
| `bug` | `fix/` |
| `melhoria-ui`, `melhoria-ux`, `novo-relatorio`, `regra-de-calculo`, `campo-novo`, `outro` | `chore/` |

Sempre `<prefixo><OC-ID>-<slug>`, com o `<OC-ID>` e o `<slug>` que a runx já usa — não gere novos. Convenção do repositório ou da stackx vence (regra 14).

### O teste de regressão

Em ocorrência `tipo: bug`, a primeira task da primeira fase tem `teste_regressao`: o teste que reproduz o problema e falha antes do fix.

Isso aparece em três etapas da mergex:

- **E1:** a mensagem de commit da primeira task cita o teste de regressão **primeiro**, no campo `Testes:` — é ele que prova que o defeito existia.
- **E2:** a verificação V4 barra se a primeira task de um bug não tiver `teste_regressao` preenchido.
- **E4:** a seção "O que foi testado" diz **o que o teste de regressão reproduzia**. É a prova, para o revisor, de que o defeito era real e sumiu.

### QA reprovado

`QA.md` com `VEREDITO: REPROVADO` faz o portão (E2 da mergex) devolver `BLOQUEADO` na verificação V5, listando os achados ALTA. Cada um precisa voltar ao E3 da runx.

`QA.md` ausente, quando o fluxo já deveria tê-lo produzido, também barra: a entrega estaria pulando o QA.

## O que a mergex consome da runx

| Artefato | Onde | Usado em |
|---|---|---|
| `ORQUESTRADOR.md` | `docs/manutencao/<OC-ID>-<slug>/` | E0 (registro da branch), E4 (título), E2 (comando de teste) |
| `00-OCORRENCIA.md` | idem | E4 (origem: identificador, tipo e **o relato do cliente em uma linha**, preservado, não reescrito) |
| `01-CAUSA-RAIZ.md` | idem | E4 (seção 4: causa raiz ou análise de impacto, resumida com link) |
| `sprint-NN/tasks.md` | idem | E1, E2, E3 |
| `BLOQUEIOS.md` | idem | E2 (V7) |
| `QA.md` | idem | E2 (V5 — veredito), E4 (seção 9), E5 (**o roteiro de teste manual, completo**) |
| Relatório de uso | `docs/relatorios/<data>-<OC-ID>-<slug>/uso.md` | E5 (apontado no pacote de QA como o texto que o suporte devolve ao cliente) |

O `trabalho_id` da mergex é o **mesmo `<OC-ID>-<slug>`** da runx.

## O relatório de uso, no pacote de QA

O pacote de QA (E5 da mergex) termina apontando o relatório de uso: o texto que o suporte devolve ao cliente **depois** da aprovação.

Ele é produzido pelo **E5 da runx**, que roda depois. Se ainda não existe, aponte o caminho onde vai ficar e diga que ainda não existe. **A mergex nunca escreve o relatório de uso** — não é dela (regra 7 e regra 19).

## O que a mergex NÃO faz com a runx

- Não fecha a ocorrência. Quem fecha é o E5 da runx.
- Não escreve em `docs/relatorios/`. Aquela árvore é da runx.
- Não altera `00-OCORRENCIA.md`, `01-CAUSA-RAIZ.md` nem `QA.md`. A única escrita em artefato da runx é **uma linha** no `ORQUESTRADOR.md` registrando a branch (E0).
- Não corrige achado de QA. Isso volta ao E3 da runx.

## Se a mergex não estiver instalada

O E3 da runx roda como antes: implementa sob TDD, marca os status, e segue para o E4 e o E5. Nada quebra. **A ausência da mergex nunca quebra o fluxo da runx.**
