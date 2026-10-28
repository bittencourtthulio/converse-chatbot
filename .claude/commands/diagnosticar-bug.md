---
description: Diagnostica um defeito até a causa raiz, sem alterar código.
---

Atue como o **orquestrador** e investigue (somente leitura): $ARGUMENTS

1. Reproduza ou localize o defeito: leia o caminho do código (tela/rota → serviço → `src/lib`/banco) e rode os testes existentes que o cobrem.
2. Delegue a leitura ao agente do domínio provável, sem editar.
3. Prove a causa raiz com evidência (arquivo:linha, saída de teste ou de log). Se não houver prova, diga que é hipótese.
4. Entregue: causa raiz, domínio dono, teste de regressão que deveria existir e o conserto proposto. **Não edite nada.**

Para o fluxo completo de ocorrência (investigação, plano, fix, QA e relatório), use `/runx`.

**Uso:** `/diagnosticar-bug <descrição ou sintoma>`
**Agentes:** orquestrador, agente do domínio provável.
