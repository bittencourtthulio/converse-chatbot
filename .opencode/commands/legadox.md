---
name: legadox
description: legadox — verifica o modo legado, conduz para a criação do PERFIL.md se faltar, e mostra o que falta no trabalho atual
argument-hint: "[trabalho: slug da feature, OC-ID da ocorrência, ou descrição do que será alterado]"
---

Invoque a skill `legadox` e siga-a integralmente. Este é o roteador.

Trabalho: $ARGUMENTS

## Passo 1 — O gatilho

Verifique se `docs/legado/PERFIL.md` existe.

**Se NÃO existir:** o modo legado está desligado e nada do legadox se aplica (regra 1). Diga isso em uma linha, explique que o PERFIL.md é o mapa que liga a camada, e **conduza para a criação**: execute a Camada 1 seguindo `references/01-perfil.md`, como faria `/legadox-perfil`. Não calcule raio, não invoque camada nenhuma antes de o PERFIL existir.

**Se existir:** anuncie "modo legado ativo" e siga para o Passo 2.

## Passo 2 — Estado do modo legado

Mostre, em bloco curto:

- data de geração e de última atualização do `PERFIL.md`
- quantas zonas de risco estão declaradas, nomeando-as
- quantas lacunas abertas há em `docs/legado/LACUNAS.md`, e quais são de prioridade alta
- quantos achados há em `docs/legado/DIVIDA.md`
- os limiares vigentes da seção 9 do PERFIL, se tiverem sido editados em relação ao padrão

## Passo 3 — O trabalho atual

Se `$ARGUMENTS` identificar um trabalho, ou se houver trabalho em andamento em `docs/<slug>/` (sprintx) ou `docs/manutencao/<OC-ID>-<slug>/` (runx), mostre o que falta:

| Verificação | Como detectar |
|---|---|
| Raio calculado | `docs/legado/raio/<trabalho_id>.md` existe |
| Faixa resultante | a faixa escrita no arquivo do raio |
| Camadas acionadas | a lista declarada no arquivo do raio |
| Perguntas da zona respondidas | seção de zona preenchida no arquivo do raio |
| Aprovação humana | seção de aprovação preenchida, quando ALTO |
| Caracterização | a suíte de caracterização existe e passa |
| Roteiro manual | `docs/legado/manual/<trabalho_id>.md` existe |
| Comparação com dado real | `docs/legado/comparacao/<trabalho_id>.md` existe, quando ALTO |

Para cada item pendente, diga qual comando o resolve. Não execute nenhum deles sem o usuário pedir — este comando informa o estado, não avança o trabalho.

Se `$ARGUMENTS` estiver vazio e não houver trabalho em andamento, mostre apenas o Passo 2 e liste os comandos disponíveis.
