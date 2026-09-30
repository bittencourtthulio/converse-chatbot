# Integração — legadox

A `legadox` é a camada de projetos legados: ela calcula o **raio de impacto** de uma mudança — o que mais pode quebrar quando se toca um ponto.

Esta é a integração de maior valor do memox, porque entrega à `legadox` uma informação que ela **hoje não tem por nenhum outro meio**.

## O que falta ao raio hoje

O raio é calculado sobre a estrutura: quem importa quem, quem chama o quê, o que compartilha tabela. Isso responde "o que **pode** quebrar" — a topologia do código.

O que a estrutura não sabe é **o que já quebrou**. Dois arquivos com raio estrutural idêntico não têm o mesmo risco se um deles já causou regressão duas vezes e o outro nunca falhou. Essa diferença não está no código; está nos artefatos, e é exatamente o que o memox indexa.

## Os dois sinais consumidos

```bash
python3 .claude/skills/memox/assets/memox.py arquivo "<caminho>" --formato json
```

Do JSON, o campo `sinais`:

| Sinal | Campo | Leitura |
|---|---|---|
| regressão | `regressoes` | lista, cada item com trabalho anterior, posterior, datas, evidência e os dois artefatos de origem |
| reprovação em QA | `reprovacoes_qa` | contagem; `detalhe_reprovacoes` traz trabalho, data e artefato |

Complementares, quando úteis ao cálculo: `trabalhos`, `ultimo_trabalho_em`, `zona_de_risco`, `divida`, `faixa_atencao_frequente`.

## Como entram no cálculo

Os dois sinais são **entrada do cálculo de raio**, ao lado dos sinais estruturais. A ponderação é decisão da `legadox`; o memox fornece o fato com proveniência e não opina sobre peso.

Duas propriedades que o consumidor precisa respeitar:

1. **`regressoes` já vem filtrado pelas três condições** da etapa 2 — vínculo por arquivo, ordem cronológica e causa comprovada. É evidência causal, não coincidência.
2. **`coincidencias_arquivo` NÃO é sinal de regressão.** Está no índice para ser auditável por um humano, não para entrar no cálculo. Tratá-la como regressão infla o raio de todo arquivo central do sistema e destrói o valor do sinal (regra 4).

Se a `legadox` quiser usar coincidências, que seja como sinal próprio, com nome próprio e peso próprio — nunca somado às regressões.

## Direção do fluxo

`legadox` **consome** do memox; não alimenta. A `legadox` produz `PERFIL.md` e `DIVIDA.md`, que o memox indexa como fonte — o ciclo se fecha pelos artefatos, como todo o resto do ecossistema, e não por chamada direta entre skills.

## Contrato de não interferência

- Sem o memox instalado, o raio é calculado como hoje, **apenas com os sinais estruturais**.
- Consulta falhando, a `legadox` segue com o que tem. O memox é aditivo.
- Arquivo sem histórico devolve vazio: isso significa "sem informação", **não** "arquivo seguro". Ausência de sinal não reduz raio.
- O memox não edita `PERFIL.md` nem `DIVIDA.md` (regra 9).

## Verificação

- [ ] O cálculo consome `regressoes` e `reprovacoes_qa`.
- [ ] `coincidencias_arquivo` não entra como regressão.
- [ ] Arquivo sem histórico não tem o raio reduzido.
- [ ] Sem o memox, o raio é o mesmo de antes.
- [ ] Todo sinal usado no relatório de raio cita o artefato de origem.
