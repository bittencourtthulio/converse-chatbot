---
description: Etapa 4 do stackx — verifica se um diff, branch ou pasta respeitou o docs/stack/CONVENCOES.md e devolve a tabela severidade / arquivo / convenção violada / correção sugerida. Aponta, não corrige.
---

Acione a skill **stackx** e execute a Etapa 4, seguindo
`references/04-aderencia.md`.

**Alvo:** `$ARGUMENTS` — diff, base de comparação, branch, pasta ou lista de
arquivos. Sem argumento, use o trabalho não commitado; se não houver, o diff
contra a base da branch atual.

## Roteiro

1. Confirme que `docs/stack/CONVENCOES.md` existe. Se não existir, **não
   improvise convenção**: diga que o portão não pode rodar e aponte
   `/stackx-detectar`.

2. **Leia o CONVENCOES.md inteiro antes de olhar o diff.** Verificar contra a
   memória do que "costuma ser convenção" é o erro clássico desta etapa.

3. Colete o alvo e classifique cada arquivo em **NOVO** ou **MODIFICADO**.

```bash
git diff --name-status <base>...HEAD
git diff --diff-filter=A --name-only <base>...HEAD
```

4. Verifique os **oito pontos** de `references/04-aderencia.md`: local e nome do
   teste; presença dos testes exigidos; padrão de erro; camadas e dependências
   proibidas; factory ou fixture; isolamento de banco; comando de teste
   executado; nomeação, log e configuração.

5. Aplique a precedência de projeto legado, se `docs/legado/PERFIL.md` existir.

6. Emita a tabela no formato de `assets/TEMPLATE-aderencia.md`.

## Regras

- **Aponta, não corrige.** Não edite nenhum arquivo. Nem para "só arrumar o
  nome".
- Ponto marcado **PROPOSTA** nunca passa de `AVISO`.
- CONFLITO EM ABERTO divergido → `AVISO`.
- Em projeto legado: divergência em arquivo **MODIFICADO** é `INFO`, nunca
  violação. **Nunca** sugira alinhar arquivo existente à convenção.
- Área sem convenção documentada → `INFO` e lacuna nova, não violação.
- Evidência do CONVENCOES.md apontando arquivo que sumiu → `INFO` e recomendação
  de `/stackx-atualizar`.
- Segredo hardcoded é `CRÍTICO` sempre, mesmo sem convenção que fale disso.

## Entrega

- A tabela `severidade | arquivo | convenção violada | correção sugerida`
- O veredito, dizendo explicitamente se a task pode fechar
- O comando de teste executado, confirmado e não presumido
- Sem achados: a tabela com "Nenhuma violação" e o veredito — o registro é a
  evidência da passagem pelo portão
