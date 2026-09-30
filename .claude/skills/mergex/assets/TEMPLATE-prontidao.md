# TEMPLATE — saída do portão de prontidão (E2)

A saída do portão é para a tela e para o campo `portao` do `ENTREGA.md`.
Substitua todos os marcadores `{{assim}}`. As dez linhas da tabela aparecem
SEMPRE, mesmo as `n/a`. Apague este cabeçalho ao usar.

---

```
mergex E2 — PORTÃO DE PRONTIDÃO
Trabalho: {{trabalho_id}}   Branch: {{branch}}   Data: {{AAAA-MM-DD}}

RESULTADO: {{PRONTO | BLOQUEADO}}
```

| # | Verificação | Resultado |
|---|---|---|
| V1 | Tasks concluídas | {{OK / FALHA / AVISO / n/a}} |
| V2 | Suíte verde por task | {{...}} |
| V3 | Dois testes por task | {{...}} |
| V4 | Teste de regressão na primeira task (bug da runx) | {{...}} |
| V5 | QA da runx aprovado | {{...}} |
| V6 | Auditoria da sprintx aprovada | {{...}} |
| V7 | Bloqueio aberto no escopo entregue | {{...}} |
| V8 | Modo legado: raio, caracterização, reversão, orçamento, aprovação | {{...}} |
| V9 | Arquivo alterado fora da lista declarada | {{...}} |
| V10 | Segredo, credencial ou dado real de cliente | {{...}} |

## O que falta

{{um bloco por FALHA, nesta forma}}

```
{{V2}} — FALHA: {{o que falhou}}
  {{o item nomeado: id e título da task, ou o arquivo}}
  Onde corrigir: {{caminho relativo do arquivo a corrigir}}
  O que fazer: {{a ação concreta}}
```

## Avisos

{{o que não barra, mas o revisor precisa saber: fonte ausente, convenção
divergente, bloqueio fora do escopo entregue}}

---

**PRONTO** → `portao: pronto` no ENTREGA.md, segue para o E3.
**BLOQUEADO** → `portao: bloqueado`, o fluxo da mergex ENCERRA. Nada é
desfeito, nada é descartado, nada é maquiado.
