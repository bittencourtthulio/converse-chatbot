# Lacunas do perfil

> Substitua TODOS os marcadores `{{assim}}` ao acrescentar uma linha.
> Todo `NÃO DETERMINADO` do PERFIL.md tem uma linha correspondente aqui.
>
> Uma lacuna não é uma falha do mapeamento: é o mapeamento sendo honesto.
> Um PERFIL com dez afirmações verificadas e cinco lacunas é um bom PERFIL.
> Um PERFIL com quinze afirmações plausíveis e nenhuma lacuna é perigoso, porque o
> raio de impacto vai ser calculado em cima dele.

Atualizado em: {{AAAA-MM-DD}}

---

## Lacunas abertas

| # | Seção do PERFIL | O que falta | Por que não foi possível determinar | O que resolveria | Prioridade |
|---|---|---|---|---|---|
| L-01 | {{1 Stack | 2 Pontos de entrada | ... | 9 Limiares}} | {{o que não foi determinado}} | {{motivo: sem acesso, sem histórico, suíte não roda, área não mapeada}} | {{o que destravaria: acesso a X, resposta de Y, execução de Z}} | {{alta | média | baixa}} |

### Prioridade alta

Reserve para as lacunas que **travam trabalho**:

- **Quem valida uma zona de risco.** Sem ela, a Camada 11 não tem a quem endereçar, e o
  primeiro trabalho que tocar a zona vai precisar da resposta antes de planejar.
- **Comando de teste de um arquivo só.** Sem ele, a Camada 3 fica inviável na prática.
- **Área não mapeada que um trabalho vai tocar.** Precisa ser mapeada antes do raio.

---

## Consequência de cada lacuna no cálculo do raio

> Sinal não coletável conta como PIOR CASO (regra 3). Esta tabela deixa isso explícito,
> para que ninguém interprete lacuna como neutralidade.

| Lacuna | Sinal afetado | Como o raio a trata |
|---|---|---|
| {{L-NN}} | {{qual dos oito sinais}} | {{pior caso assumido: chamadores > 15 | cobertura ausente | zona tocada | migração sim | dado histórico sim}} |

---

## Lacunas fechadas

> Append-only, como o DIVIDA.md. Fechar uma lacuna é acrescentar uma linha aqui,
> não apagar a linha acima.

| # | Fechada em | Como foi resolvida | Quem respondeu |
|---|---|---|---|
| {{L-NN}} | {{AAAA-MM-DD}} | {{o que se descobriu, e onde isso entrou no PERFIL}} | {{quem}} |
