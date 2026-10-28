# Roteiro de teste manual — {{trabalho_id}}

> Substitua TODOS os marcadores `{{assim}}`. Nenhum marcador pode sobreviver no arquivo final.
> Escrito para uma pessoa que NÃO conhece o código: nada de nome de função, arquivo,
> tabela ou endpoint nos passos.
> O dado de teste sugerido NUNCA é dado real de cliente.

Trabalho: {{trabalho_id}} — {{título do trabalho}}
Faixa do raio: {{MEDIO | ALTO}}
O que mudou, em uma linha: {{o que o sistema passa a fazer diferente}}
Gerado em: {{AAAA-MM-DD}}

---

## Preparação única

> Vale para todos os casos. Não repita isso em cada caso.

Ambiente onde executar: {{homologação | ambiente de teste — nunca produção}}
Perfil de acesso necessário: {{qual}}
Configuração que precisa estar ligada: {{qual, ou "nenhuma"}}
Antes de começar, confirme que: {{pré-condição global}}

---

## Caso 1 — {{o que este caso prova, em uma linha}}

**Pré-condição**
- {{em que estado o sistema e o dado precisam estar, uma linha por condição}}

**Passos**
1. {{o que clicar, o que digitar — um passo por linha}}
2. {{...}}

**Resultado esperado**
{{O que a pessoa deve ver na tela. Valor exato quando houver valor:
  "O total exibe R$ 1.234,56", não "o total é calculado corretamente".}}

**O que observar de colateral**
> Seção OBRIGATÓRIA. É a que quase todo roteiro esquece.
- Telas vizinhas: {{onde olhar e o que deve continuar igual}}
- Relatórios: {{qual relatório, e o que deve continuar fechando}}
- Jobs e rotinas: {{o que verificar e QUANDO — ex.: no dia seguinte à execução noturna}}
- Integrações: {{arquivo gerado, remessa, chamada a terceiro — o que deve continuar igual}}
- Dado antigo: {{o que registros criados ANTES da entrega devem continuar exibindo}}

**Dado de teste sugerido**
{{Dado sintético com os valores que exercitam o caso. Nunca nome, documento, e-mail
  ou valor de contrato de cliente real.}}

Bloqueante: {{sim — se falhar, não sobe | não — verificação posterior}}
Janela: {{executável a qualquer momento | apenas em fechamento de mês | após execução do job}}

---

{{Repita o bloco acima para cada caso. Ordem: caminho principal primeiro, bordas depois,
  colateral por último.}}

---

## Caso {{N}} — Registro antigo continua exibindo o valor de antes

> Caso obrigatório sempre que a mudança tocar cálculo ou formato.
> Em legado é onde a regressão aparece: o novo funciona, o histórico quebra.

**Pré-condição**
- Um registro criado antes desta entrega, com valor conhecido: {{qual}}

**Passos**
1. {{como chegar até ele}}

**Resultado esperado**
O valor exibido é exatamente o mesmo de antes da entrega: {{valor}}

**O que observar de colateral**
- {{onde mais esse registro antigo aparece}}

**Dado de teste sugerido**
{{registro sintético com data anterior à entrega}}

---

## Registro do resultado

| Caso | Executado por | Data | Resultado | Observação |
|---|---|---|---|---|
| 1 | {{quem}} | {{AAAA-MM-DD}} | {{passou | falhou}} | {{o que aconteceu}} |
