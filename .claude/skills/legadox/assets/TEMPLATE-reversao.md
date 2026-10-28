# Plano de reversão — {{trabalho_id}}

> Substitua TODOS os marcadores `{{assim}}`. Nenhum marcador pode sobreviver no arquivo final.
> O versionador desfaz código. Ele não desfaz nada do que o código já fez no mundo.
> Escrito no PLANEJAMENTO, junto com a task — nunca depois da execução.

Trabalho: {{trabalho_id}} — {{título do trabalho}}
Faixa do raio: {{MEDIO | ALTO}}
Classe da entrega como um todo (a pior entre as tasks): {{REVERSÍVEL | REVERSÍVEL COM PERDA | IRREVERSÍVEL}}

---

## Task {{id da task}} — {{título da task}}

REVERSÃO — classe: {{REVERSÍVEL | REVERSÍVEL COM PERDA | IRREVERSÍVEL}}

```
1. Código:            {{o que reverter, em que ordem; a cadeia de dependência entre tasks}}
2. Dado gravado:      {{qual tabela e coluna, como identificar os registros gravados pelo
                       código novo, e o que fazer com eles; ou "nenhum"}}
3. Migração:          {{qual migração, se a reversão está escrita E TESTADA, e o que
                       acontece com o dado na reversão; ou "nenhuma"}}
4. Flag:              {{nome exato, onde é definida, TODOS os pontos onde é lida com
                       caminho e linha, valor seguro, tempo até o efeito; ou "nenhuma"}}
5. Cache/índice:      {{o quê e o comando exato para invalidar; ou "nenhum"}}
6. Efeito externo:    {{o que já pode ter saído, em que volume, a partir de que momento
                       da execução; ou "nenhum"}}

Tempo estimado de reversão: {{minutos}}
Quem executa a reversão:    {{papel}}
Janela: {{até quando dá para reverter sem consequência adicional}}
```

{{Quando a classe for IRREVERSÍVEL, o bloco da task começa com:}}

### ATENÇÃO — TASK IRREVERSÍVEL
### Efeito que não se desfaz: {{qual}}
### Exige aprovação humana registrada antes da execução.

Aprovado por: {{nome ou papel}} em {{AAAA-MM-DD}}

---

{{Repita o bloco acima para cada task de raio MEDIO ou ALTO.}}

---

## Verificação antes de executar

- [ ] A reversão da migração foi EXECUTADA em ambiente de teste, não apenas escrita.
- [ ] A flag foi testada desligada, e o comportamento antigo voltou de fato.
- [ ] Os pontos de leitura da flag foram conferidos um a um contra o grep.
- [ ] O tempo estimado de reversão é realista para o pior horário.
- [ ] Os seis itens estão respondidos em toda task — "nenhum" é resposta válida; em branco não é.

---

## Plano de contenção

> Substitui o plano de reversão quando o efeito externo é inevitável — a task existe
> justamente para emitir, enviar ou transmitir.

Como parar o disparo no meio: {{procedimento}}
Como identificar o que já saiu: {{procedimento}}
Procedimento de correção junto ao destinatário: {{o que fazer com quem já recebeu}}
