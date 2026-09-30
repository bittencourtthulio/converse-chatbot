---
description: B3 isolada do buildx — mostra ou regera o MAPA.md, a decomposição do projeto em features com ordem de dependência.
---

Use a skill `buildx`, etapa B3. Leia `references/04-decomposicao.md` antes de agir.

## Se o MAPA.md não existe

Verifique os pré-requisitos: `docs/projeto/PROJETO.md` e `PREMISSAS.md` (B1) e `docs/stack/CONVENCOES.md` (B2). Faltando algum, diga qual etapa está pendente e execute-a em vez de decompor no vazio.

Com tudo no lugar, execute o B3 e grave o `MAPA.md`.

## Se o MAPA.md existe

Mostre-o, com o estado de cada feature e o grafo de dependências.

**Regerar um mapa com features já entregues é destrutivo.** Só refaça se o usuário pedir explicitamente, e preserve `status`, PR e `feature_id` de tudo que já está `entregue` — o plano e o código daquelas features existem, e reescrever o mapa não os apaga, só os desconecta.

## Verificações que este comando roda sempre

| Verificação | Por quê |
|---|---|
| toda feature passa nos três testes (vertical, enunciável, demonstrável) | corte em camadas não é feature |
| `FT-01` é a fundação, com usuário de demonstração e casca visual | senão a primeira entrega não é demonstrável |
| o grafo de `depende_de` não tem ciclo | e nenhuma feature precede sua dependência |
| **toda premissa do `PREMISSAS.md` está coberta** | premissa órfã documenta proteção que não existe |
| todo item de "o que foi pedido" está coberto | e nada de "fora de escopo" virou feature |
| entre 5 e 20 features | fora disso, o recorte precisa de revisão |

Aponte o que falhar. Não conserte em silêncio: diga o que está errado e o que a correção implica.
