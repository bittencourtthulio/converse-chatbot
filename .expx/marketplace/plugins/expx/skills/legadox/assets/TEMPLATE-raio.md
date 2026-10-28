# Raio de impacto — {{trabalho_id}}

> Substitua TODOS os marcadores `{{assim}}`. Nenhum marcador pode sobreviver no arquivo final.
> A faixa NUNCA é escolhida por sensação: ela é o resultado dos sinais.
> Sinal não coletável conta como PIOR CASO, e isso fica registrado abaixo.

Trabalho: {{trabalho_id}} — {{título do trabalho}}
Skill irmã: {{sprintx | runx}}
Calculado em: {{AAAA-MM-DD}}
Limiares aplicados: `docs/legado/PERFIL.md`, seção 9

---

## Conjunto de arquivos alvo

> Esta lista trava o escopo do cálculo. Se ela crescer durante o trabalho, o raio é recalculado.

- `{{caminho/relativo/arquivo.ext}}` — {{o que muda nele}}

---

## Sinais coletados

| # | Sinal | Valor | Método de coleta | Coletado ou assumido |
|---|---|---|---|---|
| 1 | Chamadores diretos e indiretos | {{N}} | {{comando ou ferramenta usada}} | {{coletado | PIOR CASO — motivo}} |
| 2 | Telas e rotas que dependem | {{N}} | {{método}} | {{coletado | PIOR CASO — motivo}} |
| 3 | Jobs, crons, relatórios, integrações | {{N}} | {{método}} | {{coletado | PIOR CASO — motivo}} |
| 4 | Cobertura de teste na área | {{existente | parcial | ausente}} | {{método}} | {{coletado | PIOR CASO — motivo}} |
| 5 | Zona de risco tocada | {{nome da zona | nenhuma}} | {{método}} | {{coletado | PIOR CASO — motivo}} |
| 6 | Churn e idade | {{N alterações, última em AAAA-MM-DD}} | {{comando do versionador}} | {{coletado | NÃO DETERMINADO}} |
| 7 | Migração de banco envolvida | {{sim | não}} | {{método}} | {{coletado | PIOR CASO — motivo}} |
| 8 | Dado histórico ou imutável afetado | {{sim | não}} | {{método}} | {{coletado | PIOR CASO — motivo}} |

### Detalhamento dos chamadores (Sinal 1)

| Chamador | Caminho | Direto ou indireto |
|---|---|---|
| {{nome}} | `{{caminho/relativo/arquivo.ext}}:{{linha}}` | {{direto | indireto}} |

### Telas e rotas (Sinal 2) — alimenta o roteiro manual da Camada 8

- {{nome da tela ou rota}} — `{{caminho/relativo/arquivo.ext}}`

### Consumo assíncrono (Sinal 3) — alimenta a seção de colateral da Camada 8

- {{job, cron, relatório ou integração}} — `{{caminho/relativo/arquivo.ext}}` — {{quando roda}}

### Leitura do churn (Sinal 6)

{{área viva | área congelada | área já disputada e hoje parada — e o que isso informa sobre o risco}}

---

## FAIXA: {{BAIXO | MEDIO | ALTO}}

Determinada por: {{o sinal que determinou a faixa, em uma linha. Ex.: "Sinal 5 — zona fiscal tocada"}}

---

## Camadas acionadas

| Camada | Acionada | Onde vive o artefato |
|---|---|---|
| 2 Raio de impacto | sim | este arquivo |
| 6 Proibição de melhoria colateral | sim | `docs/legado/DIVIDA.md` |
| 10 Prova de código vivo | sim | seção abaixo |
| 3 Testes de caracterização | {{sim | não}} | {{suíte de caracterização do projeto | —}} |
| 4 Ponto de costura | {{sim | não}} | {{seção abaixo | —}} |
| 5 Orçamento de mudança | {{N arquivos, M linhas}} | {{plano da skill irmã}} |
| 7 Plano de reversão | {{sim | não}} | {{seção abaixo | —}} |
| 8 Roteiro de teste manual | {{sim | não}} | {{docs/legado/manual/<trabalho_id>.md | —}} |
| 9 Comparação com dado real | {{sim | não}} | {{docs/legado/comparacao/<trabalho_id>.md | —}} |
| 11 Perguntas obrigatórias da zona | {{sim | não}} | {{seção abaixo | —}} |
| Feature flag ou chave de desligamento | {{sim | não}} | {{nome da flag | —}} |
| Aprovação humana explícita | {{sim | não}} | {{seção abaixo | —}} |

{{Em BAIXO, escreva aqui, literalmente: "Nenhuma camada adicional acionada. O fluxo da
  skill irmã segue sem alteração." E apague as seções que não se aplicam.}}

---

## Prova de código vivo (Camada 10)

| Alvo | Resultado | Evidência | Método |
|---|---|---|---|
| `{{caminho/relativo/arquivo.ext}}` | {{VIVO | SUSPEITO DE MORTO | INCONCLUSIVO}} | {{cadeia até o ponto de entrada, ou consulta a log}} | {{grep | análise estática | telemetria}} |

{{Suspeita de morto NÃO autoriza remoção: registre em DIVIDA.md e siga o trabalho pedido.}}

---

## Zona de risco e perguntas obrigatórias (Camada 11)

> Preencha apenas se o Sinal 5 indicou zona tocada. Sem estas respostas, o plano não é gerado.

Zona tocada: {{nome da zona}}
Validador (do PERFIL.md): {{quem}}
Perguntas respondidas em: {{AAAA-MM-DD}} por: {{quem respondeu}}

1. Quem valida esta mudança antes de ir para produção: {{resposta}}
2. Existe impacto fiscal, contratual ou regulatório: {{resposta}}
3. Existe dado histórico que muda de interpretação: {{resposta}}
4. É preciso avisar cliente, e com quanta antecedência: {{resposta}}
5. Existe janela de manutenção obrigatória: {{resposta}}
6. Existe processo manual do time que depende do comportamento atual: {{resposta}}

Perguntas específicas desta zona:
- {{pergunta}}: {{resposta}}

Restrições que estas respostas impõem ao plano:
- {{restrição}}

---

## Ponto de costura (Camada 4)

> Preencha em MEDIO e ALTO.

Ponto de costura escolhido: `{{caminho/relativo/arquivo.ext}}:{{linha}}` — {{o que é}}
Por que ali: {{contenção, alcance, cobertura}}
O que isola: {{o que fica dentro da intervenção}}
O que NÃO cobre: {{chamadores ou caminhos que continuam com o comportamento antigo, e por que é aceitável}}

Alternativas descartadas:
- {{candidato}} — {{motivo do descarte}}
- {{candidato}} — {{motivo do descarte}}

---

## Caracterização (Camada 3)

> Preencha em MEDIO e ALTO. Detalhe em `assets/TEMPLATE-caracterizacao.md`.

Casos congelados: {{N}}
Onde vivem: `{{pasta/ou/padrão/dos/arquivos}}`
Comportamentos surpreendentes observados:
- {{o que o sistema faz e ninguém esperava}}

---

## Reversão consolidada (Camada 7)

> Preencha em MEDIO e ALTO. Detalhe por task em `assets/TEMPLATE-reversao.md`.

Classe da entrega como um todo (a pior entre as tasks): {{REVERSÍVEL | REVERSÍVEL COM PERDA | IRREVERSÍVEL}}
Efeitos que não se desfazem: {{lista | nenhum}}

---

## Aprovação humana (regra 9)

> Obrigatória em raio ALTO e em qualquer task IRREVERSÍVEL, seja qual for a faixa.

Aprovado por: {{nome ou papel}}
Data: {{AAAA-MM-DD}}
O que foi aprovado: {{o escopo exato, em uma linha}}
Riscos declarados no momento da aprovação:
- {{risco}}

{{Enquanto pendente, escreva: "PENDENTE — o trabalho não avança para o plano sem esta aprovação."}}

---

## Histórico de recálculo

| Data | Motivo do recálculo | Faixa anterior | Faixa nova |
|---|---|---|---|
| {{AAAA-MM-DD}} | {{o conjunto de arquivos alvo mudou: ...}} | {{faixa}} | {{faixa}} |
