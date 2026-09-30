---
description: Retoma um projeto do buildx interrompido, a partir do estado em disco — detecta a etapa, a feature em andamento, e continua sem repetir trabalho.
---

Use a skill `buildx`.

Uma execução do buildx é longa e pode ser interrompida a qualquer momento. Todo o estado está em disco: este comando o lê e continua.

## 1. Detecte a etapa

| Estado do disco | Etapa |
|---|---|
| `docs/projeto/PROJETO.md` não existe | B1 — peça a descrição do projeto |
| `PROJETO.md` existe, `docs/stack/CONVENCOES.md` não | B2 |
| `CONVENCOES.md` existe, `MAPA.md` não | B3 |
| há feature `pendente` ou `em_andamento` no `MAPA.md` | B4 |
| todas `entregue` ou `bloqueada`, recursão desatualizada | B5 |
| sem pendência resolvível, `VALIDACAO.md` não existe | B6 |
| `VALIDACAO.md` com `veredito: aprovado` | concluído |

## 2. Se havia feature em andamento

Não recomece a feature. A máquina de estados do sprintx detecta a fase pelo disco de `docs/<slug>/` — invoque a skill e ela continua de onde parou.

Verifique antes: a branch da feature existe? Se `mergex-abrir` rodou mas o resto não, a branch está lá e não deve ser reaberta.

## 3. Confirme o modo

Leia `modo` no frontmatter do `PROJETO.md` e siga o que está gravado. **Não pergunte de novo** — a pergunta única já foi feita, e refazê-la é violar a regra 1 por um detalhe de sessão.

## 4. Relate onde parou, e siga

Uma linha dizendo o que encontrou e o que vai fazer. Depois continue até o fim, sem perguntar mais nada.

```
Retomando <projeto> na etapa B4, feature FT-05 (sprint 2 de 3). Modo autônomo.
```
