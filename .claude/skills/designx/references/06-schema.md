# Schema designx — kinds e campos novos

Extensao ao contrato `expx-schema` v1 para a camada designx.

---

## expx_tool — valor novo

`sprintx` · `runx` · `buildx` · **`designx`**

`designx` e aceito apenas para os kinds `design_system`, `design_audit`, `design_debt` e `design_log`.

## ferramenta no rastro — valor novo

Adicionar **`designx`** a lista existente.

## Eventos novos no rastro

| Evento | Quem grava |
|---|---|
| `design_system_cartografado` | hook `designx-cartografa` |
| `design_audit_executado` | agente `auditor-design` |
| `design_violacao_detectada` | hook `designx-audit` |
| `design_debt_registrado` | agente `auditor-design` (abertura/atualizacao de item no DIVIDA.md) |
| `design_log_anexado` | implementador (F6/E3 apos carimbar a tela) |

---

## Kind: `design_system`

Arquivo: `docs/design-system/DESIGN-SYSTEM.md`

```yaml
---
expx_schema: 1
expx_tool: designx
kind: design_system
nome: saas-panel-design-system
versao: 1.2.0
origem: usuario
stack: [react, tailwind, shadcn-ui]
tokens: docs/design-system/tokens.css
componentes: docs/design-system/componentes/
padroes: docs/design-system/padroes/
auditavel: true
consistente: true
drift_detectado: 0
criado_em: 2026-08-30
atualizado_em: 2026-08-30
---
```

### Campos

| Campo | Obrigatorio | Tipo | Descricao |
|---|---|---|---|
| `nome` | sim | string | Identificador do DS |
| `versao` | sim | string | Versao semantica |
| `origem` | sim | enum | `usuario` · `skill_instalada` · `cartografia_automatica` |
| `stack` | sim | string[] | Frameworks visuais |
| `tokens` | nao | string | Caminho relativo para tokens CSS |
| `componentes` | nao | string | Caminho relativo para componentes |
| `padroes` | nao | string | Caminho relativo para padroes de tela |
| `exports` | nao | string[] | Formatos exportados: `tokens.css`, `tailwind-theme`, `dtcg`, `shadcn` |
| `auditavel` | sim | boolean | Se true, designx audita contra este DS |
| `consistente` | sim | boolean | Se true, sem drift detectado |
| `drift_detectado` | sim | number | Inconsistencias encontradas |

### Secoes opcionais do corpo

**`## Exports`** — quando o DS precisa ser portatil entre ferramentas, o corpo carrega os formatos lado a lado: `tokens.css` (canonico), Tailwind `@theme`, DTCG `tokens.json`, variaveis shadcn/ui. O `tokens.css` e a fonte da verdade; os demais sao derivados e regenerados.

**`## Provenance`** — de onde o sistema veio: origem (`usuario` / `cartografia_automatica` / `referencia_usuario`), data, e — quando `referencia_usuario` — a fonte (URL ou "imagem") e nota de confianca. Design system sem historia e design system sem dono.

---

## Kind: `design_audit`

Arquivo: `docs/design-system/AUDIT.md`

```yaml
---
expx_schema: 1
expx_tool: designx
kind: design_audit
trabalho_id: exportacao-csv-relatorios
auditado_em: 2026-08-30
veredito: aprovado
violacoes: 0
avisos: 2
adocao_tokens: 0.87
regra_mais_frequente: token_nao_utilizado
escopo: src/components/relatorios/
---
```

### Campos

| Campo | Obrigatorio | Tipo | Descricao |
|---|---|---|---|
| `trabalho_id` | nao | string/null | null para auditoria geral do projeto |
| `veredito` | sim | enum | `aprovado` · `reprovado` |
| `violacoes` | sim | number | Bloqueios encontrados |
| `avisos` | sim | number | Achados medio/baixo |
| `adocao_tokens` | sim | number | Fracao (0-1) de propriedades visuais usando tokens em vez de valor bruto |
| `regra_mais_frequente` | sim | string | Regra mais violada |
| `escopo` | sim | string | Diretorios ou arquivos auditados |

`adocao_tokens` e comparavel entre auditorias: numero de usos de token / (usos de token + valores brutos) nas categorias cor e espacamento. Tendencia importa mais que o valor absoluto.

---

## Kind: `design_debt`

Arquivo: `docs/design-system/DIVIDA.md` — registro vivo da divida de design. Cada drift nao corrigido vira um item; auditorias subsequentes atualizam status, nao recriam o registro.

```yaml
---
expx_schema: 1
expx_tool: designx
kind: design_debt
criado_em: 2026-08-30
atualizado_em: 2026-09-07
itens_abertos: 4
---
```

### Itens do registro (corpo do arquivo)

```markdown
## DIV-001 — Sheet usado como detalhe de registro

- severidade: alto
- categoria: visual | estrutural | acessibilidade | documentacao | implementacao
- frequencia: 7 telas
- esforco: baixo | medio | alto
- prioridade: 14.0    # severidade_peso x frequencia / esforco_peso
- status: aberto | em_progresso | resolvido | diferido
- evidencia: src/pages/clientes/index.tsx:42
```

### Regras

- **Prioridade = Severidade x Frequencia / Esforco.** Pesos: severidade bloqueio=4, alto=3, medio=2, baixo=1; esforco baixo=1, medio=2, alto=4. Maior prioridade = mais dano por unidade de esforco — resolve primeiro.
- **Quick wins** (esforco baixo + frequencia alta) entram na proxima sprint. **Estruturais** viram task propria com `design_refs`. **Write-offs** (baixo trafego + redesign planejado) ficam `diferido` com justificativa.
- O registro e revisado a cada auditoria; itens resolvidos sao marcados, nunca apagados.

---

## Kind: `design_log`

Arquivo: `docs/design-system/LOG.md` — registro de rotacao das telas geradas. Uma entrada por tela carimbada (F6 sprintx / E3 runx), mais recente primeiro. E o que impede que telas consecutivas geradas pelo metodo saiam com o mesmo fingerprint.

```yaml
---
expx_schema: 1
expx_tool: designx
kind: design_log
criado_em: 2026-09-07
entradas: 12
---
```

### Entradas (corpo do arquivo)

```markdown
- 2026-09-07 · exportacao-csv/T-02.01 · padrao-lista · denso-operacional · refs: componente-busca
- 2026-09-06 · onboarding/T-01.03 · padrao-form-multi · editorial · refs: padrao-form
```

### Regras de rotacao

- O F3 consulta as ultimas 3-5 entradas antes de fixar `tom_estetico` e `design_refs`.
- O par (padrao, tom) nao pode repetir por **3 entradas consecutivas** — repetido e `variedade_repetida` (medio).
- Manter as ultimas 20 entradas; as mais antigas saem.
- Tela corrigida pelo runx atualiza a entrada existente em vez de criar outra.

---

## Campos novos opcionais em kinds existentes

> **Os dois formatos de plano.** Os campos de task abaixo vivem dentro de um item da lista
> `tasks:`, e essa lista existe nos dois kinds que a sprintx e a runx usam para gravar plano:
> `tasks` (formato de tres arquivos) e `plano` (formato condensado, uma sprint de fase unica
> num arquivo so). Como os campos sao da TASK e nao do arquivo, valem igual nos dois — nada
> muda para a designx alem de saber que o kind pode ser um ou outro.

| Campo | Kind | Tipo | Descricao |
|---|---|---|---|
| `design_refs` | `tasks` / `plano` | `string[]` | Componentes/padroes do DS referenciados |
| `tom_estetico` | `tasks` / `plano` | enum | Intencao visual da task |
| `design_deps` | `orquestrador` | `string[]` | Tasks que dependem de design system |
| `violacao_design` | `relatorio_tecnico` | boolean | Se a ocorrencia era violacao de design |
| `padrao_violado` | `relatorio_tecnico` | string | Qual padrao do DS foi violado |

### Valores de `tom_estetico`

| Valor | Significado |
|---|---|
| `denso-operacional` | Painel SaaS, controles h-9, borders |
| `editorial` | Conteudo longo, tipografia expressiva |
| `minimalista-refinado` | Espaco generoso, poucos elementos |
| `brutalista` | Raw, function over form |

---

## Violasoes novas no painel

| Violacao | Severidade | Descricao |
|---|---|---|
| `design_system_ausente` | aviso | Trabalho toca UI mas nao ha DS |
| `token_hardcoded` | alto | Cor/spacing hardcoded em vez de variavel |
| `componente_nao_padronizado` | alto | UI criada do zero quando DS tem componente |
| `padrao_ignorado` | medio | Tela sem seguir padrao do DS |
| `tom_estetico_inconsistente` | medio | Tom diferente do global |
| `design_refs_ausente` | baixo | Task toca UI sem declarar refs |
| `tell_ia_detectado` | alto | Um dos 10 tells nomeados (ver references/08-tells-ia.md) |
| `stamp_mentiroso` | alto | Stamp da tela nao corresponde ao que a tela e |
| `stamp_ausente` | medio | Tela gerada pelo metodo sem stamp de procedencia |
| `variedade_repetida` | medio | Mesmo par (tom, padrao) em 3+ telas consecutivas do LOG |
