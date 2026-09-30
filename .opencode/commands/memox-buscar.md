---
description: Busca textual na memoria do projeto - procura um termo nos titulos, causas e resumos dos trabalhos ja fechados.
---

Busque o termo informado em `$ARGUMENTS` na memoria do projeto.

Execute, a partir da raiz do repositorio:

```bash
python3 .claude/skills/memox/assets/memox.py buscar "$ARGUMENTS"
```

A busca e textual simples sobre titulo, causa e resumo dos trabalhos indexados.
**Nao e busca semantica**: nao encontra sinonimo nem parafrase. Se o termo nao
retornar nada, sugira ao usuario tentar outra palavra — a que apareceria no titulo
ou na descricao da causa — ou consultar por arquivo (`/memox-arquivo`) ou por
modulo (`/memox-modulo`), que sao os cortes mais precisos.

Regras ao apresentar o resultado:

- Cada linha aponta o artefato de origem. Mantenha o caminho.
- Saida vazia = nenhum trabalho casou com o termo. Diga em uma linha e pare; nao
  invente resultado aproximado nem tente adivinhar o que o usuario quis dizer.
- Acima do teto de ruido, repasse a contagem em vez de listar tudo.

Se `$ARGUMENTS` estiver vazio, peca o termo a buscar.
