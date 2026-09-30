---
description: Mostra o que se sabe sobre um arquivo - quais trabalhos o tocaram, quando, por que, e se ele ja causou regressao ou foi reprovado em QA.
---

Mostre o que o memox sabe sobre o caminho informado em `$ARGUMENTS`.

Execute, a partir da raiz do repositorio:

```bash
python3 .claude/skills/memox/assets/memox.py arquivo "$ARGUMENTS"
```

Regras ao apresentar o resultado:

- Toda linha ja vem com o caminho do artefato de origem. **Nao resuma a saida ao
  ponto de perder a proveniencia**: o valor da resposta e poder abrir o artefato.
- Se a saida vier vazia, o arquivo nao tem historico indexado. Diga isso em uma
  linha e pare. Nao invente contexto, nao especule sobre o arquivo.
- Se a saida disser que o numero de entradas passou do limite, **nao tente listar
  todas**: o teto existe justamente porque injetar dezenas de entradas e pior que
  nao injetar nada. Repasse a contagem e o caminho do indice.
- Se houver sinal de regressao, destaque-o: e o sinal que identifica o arquivo que
  "sempre volta". Diga qual trabalho anterior e qual posterior, com as datas.
- Nunca afirme que um trabalho causou o outro se o memox registrou apenas
  coincidencia de arquivo. Coincidencia e fato; causalidade exige a causa raiz do
  trabalho posterior apontar para arquivo alterado pelo anterior.

Se `$ARGUMENTS` estiver vazio, peca o caminho do arquivo.
