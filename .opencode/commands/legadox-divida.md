---
name: legadox-divida
description: "legadox Camada 6 — consulta e acrescenta ao inventário de dívida observada, sem corrigir nada"
argument-hint: "[achado a registrar, ou vazio para consultar o inventário]"
---

Invoque a skill `legadox` e siga `references/05-orcamento-e-colateral.md`, parte da Camada 6.

Achado: $ARGUMENTS

**Se `$ARGUMENTS` estiver vazio:** mostre o inventário de `docs/legado/DIVIDA.md` — quantos achados, agrupados por risco de mexer e por área, com os de risco ALTO primeiro. Aponte também os achados de código morto suspeito e os achados graves ainda sem ocorrência aberta.

**Se `$ARGUMENTS` trouxer um achado:** acrescente uma linha a `docs/legado/DIVIDA.md`, de `assets/TEMPLATE-DIVIDA.md`, preenchendo as seis colunas. Obtenha a data com `date +%Y-%m-%d`, nunca de memória.

Ao preencher:

- **o que foi visto** — factual, sem adjetivo: "consulta dentro de laço for", não "código ruim"
- **por que incomoda** — a consequência concreta: "N+1 em lista de até 5000 itens"
- **risco de mexer** — a faixa que um trabalho para corrigir isso provavelmente teria, com o sinal que a justifica
- **trabalho de origem** — o `trabalho_id` em que o achado apareceu

Regras duras deste comando:

- **Registro, nunca correção** (regra 5). Este comando não altera código de produção em hipótese alguma. Se o usuário pedir para corrigir junto, explique que a correção tem raio próprio e merece seu próprio trabalho.
- `DIVIDA.md` é **append-only**: nunca reescreva nem apague linhas. Um item resolvido ganha nova linha na seção de resoluções, citando o trabalho que o resolveu.
- **Achado grave** — dado de cliente exposto, credencial no código, falha de segurança ativa — não é dívida: registre na seção própria **e** comunique ao usuário imediatamente, sem corrigir por conta própria.
