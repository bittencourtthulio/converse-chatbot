# Dívida observada

> Substitua TODOS os marcadores `{{assim}}` ao acrescentar uma linha.
> Este arquivo é o destino da tentação. Registro, NUNCA correção.
> Nada aqui é corrigido dentro do trabalho que o descobriu: cada item tem raio próprio
> e merece seu próprio trabalho.
>
> ARQUIVO APPEND-ONLY. Nunca reescreva nem apague linhas. Um item resolvido ganha
> NOVA linha marcando a resolução e citando o trabalho que a fez.

Atualizado em: {{AAAA-MM-DD}}

---

## Achados

| Data | Arquivo:linha | O que foi visto | Por que incomoda | Risco de mexer | Trabalho de origem |
|---|---|---|---|---|---|
| {{AAAA-MM-DD}} | `{{caminho/relativo/arquivo.ext}}:{{linha}}` | {{factual, sem adjetivo: "consulta dentro de laço for", não "código ruim"}} | {{a consequência concreta: "N+1 em lista de até 5000 itens"}} | {{BAIXO | MEDIO | ALTO}} — {{o sinal que justifica}} | {{trabalho_id}} |

### Como preencher cada coluna

- **O que foi visto** — factual, sem adjetivo. Descreva o que está lá, não o que você acha disso.
- **Por que incomoda** — a consequência concreta e observável, não a ofensa estética.
- **Risco de mexer** — a faixa que um trabalho para corrigir isso provavelmente teria, com o
  sinal que a justifica. Ex.: "ALTO — zona fiscal".
- **Trabalho de origem** — o `trabalho_id` em que o achado apareceu, para rastrear.

---

## Código morto suspeito

> Camada 10. Suspeita de morto NÃO autoriza remoção (regra inviolável 10).
> Remover código morto em legado é mudança de raio próprio.

| Data | Arquivo | Evidência | Método de verificação | Trabalho de origem |
|---|---|---|---|---|
| {{AAAA-MM-DD}} | `{{caminho/relativo/arquivo.ext}}` | {{nenhum chamador fora dos testes | rota comentada | sem ocorrência em log nos últimos N dias}} | {{grep | análise estática | telemetria}} | {{trabalho_id}} |

---

## Resoluções

> Uma linha nova por item resolvido. A linha original permanece intocada acima.

| Data | Item resolvido (data + arquivo do achado original) | Trabalho que resolveu |
|---|---|---|
| {{AAAA-MM-DD}} | {{referência ao achado original}} | {{trabalho_id}} |

---

## Achados graves comunicados imediatamente

> Dado de cliente exposto, credencial no código, falha de segurança ativa não são dívida:
> são ocorrência nova e urgente. Registre aqui E comunique ao usuário na hora, sem
> corrigir por conta própria dentro do trabalho em andamento.

| Data | O que foi visto | Comunicado a | Ocorrência aberta |
|---|---|---|---|
| {{AAAA-MM-DD}} | {{o quê, sem expor o segredo em si}} | {{quem}} | {{id da ocorrência | pendente}} |
