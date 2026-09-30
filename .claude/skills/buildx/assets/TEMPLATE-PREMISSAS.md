---
expx_schema: 1
expx_tool: buildx
kind: premissas
projeto_id: <slug-do-projeto>
atualizado_em: <AAAA-MM-DD>
total: <n>
por_origem:
  catalogo_lacunas: <n>
  briefing: <n>
  decisao_de_stack: <n>
  f2_autonoma: <n>
  recursao: <n>
---

# <titulo> — Premissas

Toda decisão tomada em nome do humano, com o que a invalidaria.

**Como revisar este arquivo em cinco minutos:** leia apenas o campo
**o que invalida** de cada premissa. Se aquilo é verdade no seu caso,
a premissa precisa da sua atenção. Se não é, siga em frente.

---

### PR-01 — <assunto em três palavras>

**Assunto:** <L-NN ou P-N do catálogo, ou o eixo da decisão>
**Decisão:** <o que foi decidido, em uma frase>
**Por quê:** <a razão, ancorada no tipo e no porte deste sistema —
nunca uma generalidade>
**O que invalida:** <o FATO VERIFICÁVEL que, se descoberto, derruba
esta decisão. "Se houver usuário fora do Brasil", "se o volume passar
de mil requisições por minuto". Nunca "se os requisitos mudarem".>
**Origem:** <catalogo_lacunas | briefing | decisao_de_stack | f2_autonoma | recursao>
**Etapa:** <b1 | b2 | b4 | b5>
**Provisória:** <true | false>
**Realizada em:** <FT-NN que implementa esta premissa, ou null se ainda não>

---

<!--
REGRAS DESTE ARQUIVO

1. Premissa é o que o BUILDX decidiu. O que o usuário pediu vai no
   PROJETO.md, não aqui. Confundir os dois esvazia o valor de auditoria.

2. O campo "o que invalida" nunca fica genérico. Ele é o que torna este
   arquivo revisável em vez de decorativo.

3. Premissa marcada "provisória: true" entra no relatório final, na
   seção do que o usuário precisa decidir.

4. O campo "realizada em" é conferido pelo B6: premissa sem FT-NN e sem
   estar dentro de uma feature é premissa órfã — documenta uma proteção
   que não existe.

5. Premissa de segurança sem código nunca sai como pendência aceita.
   Ou vira feature e roda outro ciclo, ou o veredito do B6 é reprovado.
-->
