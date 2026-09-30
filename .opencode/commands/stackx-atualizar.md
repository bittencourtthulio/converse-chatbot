---
description: Etapa 5 do stackx — redetecta o repositório e apresenta o diff entre o docs/stack/CONVENCOES.md atual e o que o código mostra hoje. Nunca sobrescreve em silêncio.
---

Acione a skill **stackx** e execute a Etapa 5, seguindo
`references/05-atualizacao.md`.

## Roteiro

1. Confirme que `docs/stack/CONVENCOES.md` existe. Se não existir, isto é
   `/stackx-detectar`, não atualização.

```bash
git rev-parse --short HEAD
grep -iE '^(commit|gerado)' docs/stack/CONVENCOES.md
git diff --stat <commit-de-referência>...HEAD | tail -1
```

2. **Redetecte do zero**, rodando `references/01-deteccao.md` inteiro. Não parta
   do arquivo atual: ele é a hipótese a testar. Partir dele faz você confirmar o
   que já está escrito e perder exatamente o que mudou.

3. Confirme se a evidência antiga ainda está viva:

```bash
grep -oE '`[^`]+:[0-9]+`' docs/stack/CONVENCOES.md | tr -d '`' | cut -d: -f1 \
  | sort -u | while read f; do test -f "$f" || echo "SUMIU: $f"; done
```

4. Classifique cada fato em **INALTERADO**, **EVIDÊNCIA MOVIDA**, **MUDOU**,
   **NOVO** (era PROPOSTA/lacuna e agora tem evidência) ou **PERDIDO**.

5. Apresente o diff e **espere confirmação**. Grave apenas o confirmado.

## Regras

- **Nunca sobrescreve em silêncio.** MUDOU, NOVO e PERDIDO exigem confirmação.
- EVIDÊNCIA MOVIDA (mesmo fato, arquivo renomeado) pode ser atualizada sem
  perguntar — liste as atualizações no rodapé.
- **PROPOSTA que ganhou evidência** passa a governar: diga isso ao apresentar,
  porque muda o comportamento de `/stackx-check` e das skills irmãs.
- **Conflito novo** → Etapa 3, com a pergunta completa.
- **Conflito já decidido que reapareceu** → não reabra a pergunta. Mostre a
  decisão anterior com autor e data, e os arquivos que a contrariam. É aderência,
  não convenção.
- **Decisão humana que o código abandonou** não cai sozinha: pergunte se a
  decisão mudou ou se é violação acumulada. São coisas diferentes.
- Preserve decisões anteriores com autor e data, e as PROPOSTAS que continuam sem
  evidência.
- Edição manual do arquivo é decisão humana: mostre no diff, não desfaça.
- Não commite. Deixe a alteração no working tree.

## Entrega

- O diff nas cinco categorias, MUDOU / NOVO / PERDIDO com pedido de confirmação
- O que foi gravado e o que não foi
- `docs/stack/LACUNAS.md` reescrito: lacuna fechada sai, lacuna nova entra
- Linha nova no rodapé "Histórico de atualização" do CONVENCOES.md
