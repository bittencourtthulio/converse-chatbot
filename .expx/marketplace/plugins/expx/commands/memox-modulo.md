---
description: Mostra o que se sabe sobre um modulo ou area - historico de trabalhos, decisoes ja tomadas com suas alternativas descartadas, regressoes e reprovacoes.
---

Mostre o que o memox sabe sobre o modulo ou area informada em `$ARGUMENTS`.

Execute, a partir da raiz do repositorio:

```bash
python3 .claude/skills/memox/assets/memox.py modulo "$ARGUMENTS"
```

Regras ao apresentar o resultado:

- Preserve a proveniencia de cada linha: trabalho, data e caminho do artefato.
- As decisoes vem com a alternativa descartada e o motivo. Esse par e o mais util
  da consulta por modulo: evita rediscutir do zero uma escolha ja fechada. Se o
  usuario estiver prestes a adotar a alternativa que ja foi descartada, aponte isso
  explicitamente, com o artefato onde a decisao esta registrada.
- Saida vazia significa que o modulo nao tem historico indexado. Diga em uma linha
  e pare.
- Acima do teto de ruido, repasse a contagem em vez de listar tudo.
- Se o nome casar com mais de um modulo, o memox lista os candidatos: peca ao
  usuario para escolher em vez de adivinhar.

Se `$ARGUMENTS` estiver vazio, peca o nome do modulo.
