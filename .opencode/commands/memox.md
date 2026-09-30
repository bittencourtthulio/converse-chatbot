---
description: Estado do indice de memoria do projeto - quantos trabalhos indexados, quando foi reconstruido, e o que ficou de fora e por que.
---

Mostre o estado do indice do memox para este projeto.

Execute, a partir da raiz do repositorio:

```bash
python3 .claude/skills/memox/assets/memox.py estado
```

Apresente a saida ao usuario como ela vem, e acrescente apenas o que for acionavel:

- Se o indice ainda nao existe, diga que basta rodar `/memox-indexar`.
- Se nao ha nenhum trabalho indexado, explique que o memox indexa artefatos ja
  fechados pelas outras camadas (sprintx, runx, legadox, mergex) e que um projeto
  sem trabalho fechado nao tem memoria ainda. Isso e o estado correto, nao uma falha.
- Se houver artefato reportado como CONTAMINADO, avise que o trecho com segredo foi
  omitido do indice (regra 7) e que o segredo continua no artefato em disco: quem
  cuida disso e uma ocorrencia de seguranca, nao o memox.
- Se houver artefato listado em "fora do indice", explique o motivo de cada um
  (tipicamente falta de frontmatter expx-schema v1).

Nao edite nenhum artefato. O memox so le.
