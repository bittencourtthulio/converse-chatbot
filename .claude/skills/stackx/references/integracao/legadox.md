# Integração — legadox

O que muda quando `docs/stack/CONVENCOES.md` **e** `docs/legado/PERFIL.md`
existem ao mesmo tempo.

Este é o encontro mais delicado do ecossistema, porque as duas skills descrevem a
mesma coisa com propósitos opostos.

| Skill | Descreve | Propósito |
| ----- | -------- | --------- |
| stackx | o que **deve** ser seguido daqui pra frente | uniformizar o novo |
| legadox | o que **existe** hoje, incluindo dialetos conflitantes | conter o colateral |

---

## A regra de precedência — inegociável

```
Projeto novo   (sem PERFIL.md) → só o stackx governa.
Projeto legado (com PERFIL.md) → na ÁREA TOCADA manda o padrão local do
                                 PERFIL.md. O stackx governa APENAS código
                                 novo, em arquivo novo.
```

**Por que a regra existe:** sem ela, a IA "moderniza" arquivo antigo achando que
está obedecendo convenção. É exatamente o colateral que o legadox proíbe — e o
mais perigoso, porque vem com a justificativa de estar seguindo uma regra.

### Tabela de decisão, arquivo a arquivo

| Arquivo | Área | Quem manda |
| ------- | ---- | ---------- |
| Novo | fora de área tocada descrita no PERFIL.md | CONVENCOES.md |
| Novo | dentro de área tocada | **PERFIL.md** — o arquivo novo nasce no dialeto do vizinho |
| Existente, modificado | qualquer | **PERFIL.md**, sempre |
| Existente, não modificado | qualquer | ninguém — não se toca |

A segunda linha costuma surpreender e está certa: um arquivo novo no meio de um
módulo com dialeto próprio deve seguir **o módulo**, não o repositório. Um teste
novo em formato diferente dos 40 vizinhos é ruído, não melhoria.

**Empate ou dúvida sobre a fronteira da área tocada:** decide o PERFIL.md. Na
dúvida, o conservador é seguir o padrão local.

---

## Onde o stackx alimenta o legadox

### 1. Cálculo de raio de impacto

O cartucho `migracao-segura.md` é insumo direto do raio:

| Achado | Raio |
| ------ | ---- |
| Migração que reescreve tabela, ou lock exclusivo em tabela com tráfego | **ALTO** |
| Migração irreversível (`DROP COLUMN`, `DROP TABLE`, backfill destrutivo) | **ALTO** |
| Índice sem bloqueio, coluna nullable, constraint `NOT VALID` | MÉDIO |
| Alteração só de metadados em tabela pequena | BAIXO |

O CONVENCOES.md §5 (camadas e direção de dependência) alimenta a **superfície**
do raio: quem importa a camada tocada é quem pode quebrar.

### 2. Testes de caracterização

O legadox exige teste de caracterização antes de mexer. O CONVENCOES.md §3 e §4
dizem **como** escrevê-lo neste projeto — runner, local, forma, isolamento.

**Mas:** se a área tocada tem um dialeto de teste próprio descrito no PERFIL.md,
o teste de caracterização segue **esse** dialeto. Caracterização existe para
registrar o comportamento atual; escrevê-la em formato estranho ao módulo
dificulta a leitura de quem conhece o módulo.

### 3. Orçamento de mudança

O CONVENCOES.md ajuda a **cortar escopo**, nunca a expandi-lo:

- Alinhar arquivo existente à convenção **não entra** no orçamento. Nunca.
- Comando de verificação de §2 entra no orçamento como custo de execução.
- Se seguir a convenção num arquivo novo custar muito mais que seguir o padrão
  local, siga o padrão local e registre.

### 4. Plano de reversão

O cartucho de migração fornece a coluna "reverte?" por tipo de alteração, e o
tratamento para quando não reverte: backup verificado antes, janela combinada, e
caminho de "seguir para a frente" escrito **antes** de rodar.

---

## O que a integração NÃO autoriza

Lista explícita, porque cada item já foi feito com boa intenção:

1. **Não** refatore arquivo existente para alinhar à convenção.
2. **Não** renomeie arquivo, teste ou símbolo existente por causa de §6.
3. **Não** troque o padrão de erro de um módulo inteiro porque §6 diz outra coisa.
4. **Não** mova teste de lugar porque §3 diz outro local.
5. **Não** migre o módulo para o runner novo porque §3 registra outro runner.
6. **Não** trate divergência do arquivo existente como violação em `/stackx-check`
   — é `INFO`.
7. **Não** sugira nenhuma das coisas acima "para depois", dentro da entrega. Se
   valer a pena, é ocorrência própria, com seu próprio raio e orçamento.

---

## Quando o CONVENCOES.md contradiz o PERFIL.md

Isso não é erro: é a situação normal de um repositório legado, e o motivo de a
regra existir.

**O que fazer:**
1. Siga o PERFIL.md na área tocada.
2. Registre a contradição como `INFO` na tabela de aderência.
3. **Não** pergunte ao usuário. A precedência já respondeu.
4. Se a contradição for ampla e recorrente, registre uma linha em
   `docs/stack/LACUNAS.md` — "o CONVENCOES.md descreve o padrão de X, e a área Y
   segue outro; a convergência é decisão de projeto, fora do escopo desta
   entrega". Registrar não é propor migração.

**O caso inverso** — o PERFIL.md descreve um padrão que o CONVENCOES.md
desconhece porque a área é isolada — não é contradição. É informação que falta ao
stackx, e vira lacuna na próxima `/stackx-atualizar`.

---

## Ordem de leitura para o agente

Em projeto com os dois arquivos:

1. `docs/legado/PERFIL.md` — **primeiro**, sempre. Ele define a área tocada e o
   dialeto local, e sem isso você não sabe aplicar a precedência.
2. `docs/stack/CONVENCOES.md` — depois, para código novo fora da área tocada.
3. O cartucho relevante, se a mudança envolve migração, carga de dados ou teste
   com banco/tempo/rede.

Ler na ordem inversa é o erro que produz modernização acidental: você chega ao
código já convencido da convenção global.

---

## Resumo do contrato

1. Com PERFIL.md presente, ele vence na área tocada. Sempre.
2. O stackx governa apenas código novo, em arquivo novo, fora da área tocada.
3. Arquivo novo dentro de área tocada segue o dialeto do vizinho.
4. `/stackx-check` rebaixa a `INFO` toda divergência em arquivo modificado.
5. O cartucho de migração alimenta o raio: reescrita ou lock exclusivo = ALTO.
6. Nenhuma modernização entra no orçamento, nem como sugestão para depois.
7. Contradição entre os arquivos é resolvida pela precedência, não por pergunta.
