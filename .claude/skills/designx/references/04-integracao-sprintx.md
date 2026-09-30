# Integracao com sprintx

Pontos exatos onde designx modifica o comportamento da sprintx.

---

## F1 — Ingestao

1. Designx verifica se `docs/design-system/DESIGN-SYSTEM.md` existe.
2. Se nao existe → dispara cartografia (references/02-cartografia.md).
3. Le o DS e gera `docs/design-system/RESUMO.md` com:
   - Tokens disponiveis
   - Componentes prontos
   - Padroes de tela documentados
   - Tom estetico declarado
4. Sprintx carrega o RESUMO.md como contexto.

### Instrucao na skill

Adicionar ao SKILL.md da sprintx, na F1:

> Se designx esta ativo, verifique `docs/design-system/DESIGN-SYSTEM.md`.
> Se nao existe, rode a cartografia antes de prosseguir.
> Se existe, leia o `RESUMO.md` e carregue como contexto.

## F2 — Descoberta

Cada PROPOSTA de feature verifica se o DS ja resolve.

### Instrucao na skill

> Antes de propor UI nova, consulte RESUMO.md.
> Se o DS tem componente ou padrao que resolve, referencie-o em `design_refs`.

## F3 — Plano

Tasks que tocam UI carregam campos novos no frontmatter:

```yaml
tasks:
  - id: T-01.01
    titulo: Listagem de clientes
    design_refs: [padrao-lista, componente-busca]
    tom_estetico: denso-operacional
```

**Consulta o log de rotacao.** Antes de fixar `tom_estetico` e `design_refs`, o plano le `docs/design-system/LOG.md` (kind `design_log`, ver references/06-schema.md): as ultimas 3-5 entradas informam a escolha. O par (padrao, tom) nao pode repetir por 3 telas consecutivas — sem essa checagem, telas geradas em sequencia convergem para o mesmo fingerprint.

> Vale nos dois formatos de plano: `sprint-NN/tasks.md` com `kind: tasks` (tres arquivos) e
> com `kind: plano` (condensado, sprint de fase unica). Os campos sao da task,
> e a lista `tasks:` e identica nos dois — a designx nao precisa distinguir.

### Campos novos

| Campo | Tipo | Obrigatorio |
|---|---|---|
| `design_refs` | `string[]` | nao |
| `tom_estetico` | enum | nao |

### Campo no orquestrador

```yaml
orquestrador:
  design_system_detectado: <nome do DS>
  design_audit_necessario: true
  tom_estetico_global: denso-operacional
```

## F5 — Auditoria

`auditor-design` roda como gate adicional, junto com `auditor-plano`.

Se `design_audit_necessario: true` e o agente reprova, a sprint nao avanca.

### Instrucao na skill

> Se designx esta ativo e ha design_audit_necessario, rode o agente
> `auditor-design` apos o `auditor-plano`. Os dois vereditos precisam
> ser APROVADO para a F6 iniciar.

## F6 — Execucao

Implementador le RESUMO.md antes de escrever UI.

### Stamp de procedencia

Apos implementar, a primeira linha do CSS da tela (ou topo do arquivo de componente) recebe:

```css
/* designx · padrao: padrao-lista · tom: denso-operacional · refs: componente-busca · ds: <nome>@<versao> */
```

E anexa a entrada no `docs/design-system/LOG.md` (mais recente primeiro). O stamp e o registro do que foi escolhido; o auditor F5 verificara stamp vs. realidade.

### Auto-critica antes de declarar pronto (5 eixos, score 1-5)

| Eixo | Pergunta |
|---|---|
| Hierarquia | Primario/secundario/terciario legivel em 2 segundos? |
| Execucao | Detalhes (espessura, densidade, estados) no spec do DS? |
| Especificidade | Parece desta feature — ou uma tela generica que poderia ser qualquer uma? |
| Restricao | Tudo que esta ali ganha o lugar? |
| Variedade | O fingerprint difere da ultima tela no LOG? |

Score < 3 em qualquer eixo = revisar antes de declarar pronto. Duas passadas sao normais; tres indicam brief errado, nao design ruim.

### Instrucao na skill

> Antes de criar componente ou tela, leia `docs/design-system/RESUMO.md`.
> Copie de assets quando possivel. Nao reescreva do zero.
> Siga o tom_estetico declarado na task. Ao terminar, carimbe a tela
> (stamp designx) e anexe a entrada no LOG.md.
