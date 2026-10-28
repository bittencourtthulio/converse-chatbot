---
name: legadox-perfil
description: "legadox Camada 1 — gera ou atualiza docs/legado/PERFIL.md, o mapa do projeto e o gatilho do modo legado"
argument-hint: "[opcional: módulo ou pasta a mapear, quando o projeto for grande demais para mapear inteiro]"
---

Invoque a skill `legadox` e execute a Camada 1 seguindo `references/01-perfil.md`.

Alvo: $ARGUMENTS (se vazio, mapeie o repositório inteiro).

Este comando produz `docs/legado/PERFIL.md` e `docs/legado/LACUNAS.md`, e cria o scaffold de `docs/legado/`.

Se `docs/legado/PERFIL.md` já existir, você está em **atualização**, não em criação: leia o arquivo atual, preserve tudo que continua verdadeiro e altere apenas as seções afetadas. Nunca regere do zero — os limiares da seção 9 e as zonas de risco podem ter sido editados pelo time, e essa edição é decisão humana registrada.

Lembre-se da regra dura desta camada: **nada de invenção**. Toda afirmação vem de um arquivo lido ou de um comando executado. O que não for verificável vira `NÃO DETERMINADO` e ganha linha em `LACUNAS.md`. Um PERFIL com lacunas honestas é melhor que um PERFIL plausível, porque o raio de impacto será calculado em cima dele.

Ao terminar, mostre ao usuário: as zonas de risco encontradas, as lacunas de prioridade alta, e os limiares que ficaram valendo.
