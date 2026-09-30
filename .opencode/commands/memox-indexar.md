---
description: Reconstroi do zero o indice de memoria a partir dos artefatos do projeto (relatorios, causas raiz, decisoes, QA, entregas, divida).
---

Reconstrua o indice do memox do zero.

Execute, a partir da raiz do repositorio:

```bash
python3 .claude/skills/memox/assets/memox.py indexar
```

A reconstrucao e sempre integral: o indice e derivado e descartavel, e reconstruir
do zero elimina a classe inteira de bug de indice dessincronizado. Nao existe
atualizacao incremental na v1.

Depois de rodar, relate ao usuario:

- quantos trabalhos, arquivos e modulos entraram no indice;
- quantas regressoes comprovadas foram detectadas, e quantas relacoes ficaram
  registradas apenas como coincidencia de arquivo (sem evidencia causal);
- qualquer artefato contaminado por segredo, com o caminho;
- qualquer artefato que ficou fora do indice, com o motivo.

Se nao houver artefato nenhum, diga que o memox fica inativo ate a primeira
sprintx ou runx fechar um trabalho. Nao invente conteudo para o indice.
