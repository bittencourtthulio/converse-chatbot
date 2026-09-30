# Etapa 5 — Atualização

Convenção envelhece: o projeto troca de runner, adota outro ORM, muda a
estrutura. Esta etapa redetecta e apresenta um **DIFF** entre o CONVENCOES.md
atual e o que o repositório mostra hoje.

**A regra que governa esta etapa: nunca sobrescreve em silêncio.** Mudança de
convenção é decisão, e decisão é confirmada pelo usuário antes de gravar.

## Pré-requisitos verificáveis

```bash
test -f docs/stack/CONVENCOES.md || echo "NÃO EXISTE — isto é Etapa 1+2, não Etapa 5"
git rev-parse --short HEAD                       # commit de agora
grep -iE '^(commit|gerado)' docs/stack/CONVENCOES.md   # commit de referência do arquivo
```

- [ ] `docs/stack/CONVENCOES.md` existe.
- [ ] Você anotou o commit de referência do arquivo e o commit atual.
- [ ] O arquivo está versionado e sem alteração não commitada, **ou** você
      avisou o usuário de que há edição manual pendente que o diff vai mostrar.

Quanto mudou desde a última geração:

```bash
git diff --stat <commit-de-referência>...HEAD | tail -1
git diff --name-only <commit-de-referência>...HEAD | grep -cE 'test|spec'
```

## Passo a passo

1. **Redetecte do zero.** Rode `01-deteccao.md` inteiro. Não parta do
   CONVENCOES.md atual: ele é a hipótese a testar, não a base. Partir dele faz
   você confirmar o que já está escrito e perder exatamente o que mudou.
2. **Confirme a evidência antiga.** Para cada afirmação do arquivo atual,
   verifique se os arquivos citados ainda existem e ainda exemplificam aquilo.
   Evidência quebrada é o sinal mais barato de convenção morta.
   ```bash
   grep -oE '`[^`]+:[0-9]+`' docs/stack/CONVENCOES.md | tr -d '`' | cut -d: -f1 \
     | sort -u | while read f; do test -f "$f" || echo "SUMIU: $f"; done
   ```
3. **Compare fato a fato**, classificando cada um nas cinco categorias abaixo.
4. **Apresente o diff** e espere confirmação.
5. **Grave só o confirmado**, preservando as decisões humanas anteriores.

## As cinco categorias do diff

| Categoria | O que é | Precisa de confirmação? |
| --------- | ------- | ----------------------- |
| **INALTERADO** | Convenção segue valendo, evidência viva | Não — nem entra no diff apresentado |
| **EVIDÊNCIA MOVIDA** | Mesma convenção, arquivo citado renomeado/movido | **Não** — atualize o caminho direto e liste no rodapé |
| **MUDOU** | O repositório passou a fazer diferente | **Sim** |
| **NOVO** | Ponto que era LACUNA/PROPOSTA e agora tem evidência | **Sim** — é a promoção mais valiosa desta etapa |
| **PERDIDO** | Convenção sem nenhum arquivo que a exemplifique hoje | **Sim** |

Casos que merecem atenção porque parecem simples e não são:

- **PROPOSTA que ganhou evidência.** Deixa de ser proposta e passa a governar.
  Isso muda o comportamento de `/stackx-check` (vira violação onde antes era
  aviso) e das skills irmãs (deixa de ser decisão a levantar). Diga isso ao
  apresentar.
- **CONFLITO resolvido pelo usuário que reapareceu.** O repositório voltou a ter
  os dois dialetos depois da decisão. **Não** reabra a pergunta como se fosse
  nova: mostre a decisão anterior, com autor e data, e os arquivos novos que a
  contrariam. É informação de aderência, não de convenção.
- **CONFLITO novo.** Trate pela Etapa 3, com a pergunta completa.
- **Convenção decidida por humano que o código abandonou.** A decisão humana
  **não** cai sozinha. Mostre: "decidido X em <data>, mas os 12 arquivos dos
  últimos 3 meses fazem Y". Pergunte se a decisão mudou ou se isso é violação
  acumulada. São coisas muito diferentes e só o usuário sabe qual é.

## Formato exato da saída

```markdown
## Diff de convenções — <hoje>

CONVENCOES.md gerado em 2025-03-04 (commit a1b2c3d) · HEAD hoje: f9e8d7c
Desde então: 214 arquivos alterados, 63 deles de teste.

### MUDOU (3) — precisa de confirmação

**§3 Testes · runner**
- atual:  Jest 29.7.0 — `jest.config.ts:1`
+ hoje:   Vitest 2.1.4 — `vitest.config.ts:1`, `package.json:14`
  Base: 58 de 63 arquivos de teste importam de `vitest`; `jest.config.ts` ainda
  existe mas nenhum script o invoca.
  → Adotar Vitest como convenção?  (s/n)

**§4 Banco em teste · isolamento**
- atual:  truncate no `afterEach` — `tests/setup.ts:22`
+ hoje:   transação com rollback — `tests/setup.ts:18`, `tests/db.ts:31`
  → Adotar?  (s/n)

### NOVO (1) — era PROPOSTA, agora tem evidência

**§6 Validação de entrada**
  antes:  PROPOSTA, sem evidência
  hoje:   zod na borda HTTP — `src/http/schemas/*.ts` (14 arquivos)
  Efeito: passa a governar. `/stackx-check` deixa de avisar e passa a violar.
  → Promover a convenção?  (s/n)

### PERDIDO (1)

**§5 Camadas · `src/gateways/`**
  A pasta não existe mais; o conteúdo migrou para `src/infra/http/`.
  → Reescrever a seção com a estrutura de hoje?  (s/n)

### EVIDÊNCIA MOVIDA (4) — atualizadas sem confirmação
  `src/users/create.test.ts` → `src/users/create-user.test.ts`
  ... (3 outras)

### DECISÃO HUMANA CONTRARIADA (1) — não é mudança de convenção
  §3 local do teste: decidido "pasta espelhada" por thulio em 2025-03-04.
  9 arquivos criados desde então estão co-localizados.
  Isto é aderência, não convenção. Rodar `/stackx-check` nesses arquivos?
```

## Gravação

Só depois da confirmação, e preservando o que é humano:

- Mantenha as decisões de conflito com autor e data originais.
- Mantenha as PROPOSTAS que continuam sem evidência.
- Registre no rodapé do CONVENCOES.md o histórico de atualização:
  `Atualizado em <data> (commit <hash>): §3 runner Jest→Vitest, §6 validação promovida de PROPOSTA`.
- Reescreva `docs/stack/LACUNAS.md` inteiro: lacuna fechada sai, lacuna nova
  entra.
- Se o arquivo for versionado, deixe a alteração no working tree para o usuário
  revisar no commit. Não commite.

## Critério de saída

- [ ] A detecção foi refeita do zero, não incrementada sobre o arquivo atual.
- [ ] Toda evidência citada no arquivo antigo foi verificada como viva ou morta.
- [ ] Nada em MUDOU / NOVO / PERDIDO foi gravado sem confirmação.
- [ ] Decisões humanas anteriores foram preservadas com autor e data.
- [ ] Conflito novo foi tratado pela Etapa 3, com pergunta completa.
- [ ] LACUNAS foi reescrito.
- [ ] O rodapé de histórico foi atualizado.

## Quando o critério não é atendido

| Situação | O que fazer |
| -------- | ----------- |
| Usuário confirma parte e recusa parte | Grave só o confirmado. O recusado continua como está e vira nota de divergência conhecida no rodapé. |
| Usuário não responde | Não grave nada. Entregue o diff como relatório. O CONVENCOES.md continua válido. |
| Diff enorme (o repositório é outro projeto) | Não tente reconciliar linha a linha. Diga isso e ofereça regenerar do zero, preservando apenas as decisões de conflito e as PROPOSTAS. |
| O arquivo foi editado à mão desde a geração | Respeite a edição: ela é decisão humana. Mostre-a no diff como tal e não a desfaça. |
| Projeto virou legado desde a última geração | Adicione o aviso de precedência no cabeçalho e reprocesse a Etapa 4 sob a nova regra. |
