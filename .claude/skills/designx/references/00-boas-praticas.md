# Boas praticas de design — as 18 regras

Toda regra tem evidencia: o que acontece sem ela. Violar uma regra e violacao do metodo, nao preferencia de estilo.

Derivadas do cruzamento entre `saas-panel-design-system`, `frontend-design` (Anthropic), `designer-skills` (WCAG/QA) e metodo Expx.

---

## Regras de estrutura (bloqueio)

### B1 — Paginacao adaptativa, nunca fixa

**Bug sem ela:** Tela pela metade em monitor grande. Uma tabela com `PAGE_SIZE = 10` em tela de 1440px mostra 10 linhas e metade da tela branca.

**Deteccao:**
```bash
grep -rn "PAGE_SIZE\s*=\s*[0-9]" src --include=*.tsx
```

**Solucao:** `usePagination(items, { auto: true })` + `<ListCard ref availableHeight>`.

### B2 — Detalhe em modal com secoes, nunca drawer

**Bug sem ela:** Usuario nao consegue comparar registros. Drawer (Sheet) cobre a tela por cima, e nao mostra sidebar de secoes.

**Deteccao:**
```bash
grep -rln "components/ui/sheet" src --include=*.tsx
```

**Solucao:** `<DetailModal>` com sidebar de secoes. Sheet e legitimo apenas em paineis de configuracao e no sidebar principal.

### B3 — Sub-navegacao em rail, nunca tabs

**Bug sem ela:** Perda de contexto em painel denso. Tabs somem com a navegacao e o usuario perde onde esta.

**Deteccao:**
```bash
grep -rln "components/ui/tabs" src --include=*.tsx
```

**Solucao:** `<PageSubnav>` (left rail). Tabs sao legitimos apenas para sub-tabs dentro de um builder.

### B4 — Estado vazio dentro da tabela

**Bug sem ela:** Usuario fica preso sem saida. Um return antecipado esconde header, KPIs e filtros.

**Deteccao:** Inspecionar componentes de lista por `if (empty) return <EmptyState />`.

**Solucao:** Empty state dentro de `<TableBody>`:
```tsx
<TableRow>
  <TableCell colSpan={n} className="text-center py-8 text-muted-foreground">
    {search ? 'Nenhum item encontrado' : 'Nenhum item cadastrado ainda'}
  </TableCell>
</TableRow>
```

### B5 — Acao destrutiva = AlertDialog com nome

**Bug sem ela:** Delete acidental sem confirmacao. `window.confirm` nao nomeia o registro nem a consequencia.

**Deteccao:**
```bash
grep -rn "window.confirm" src --include=*.tsx
```

**Solucao:** `<AlertDialog>` nomeando o registro e a consequencia.

---

## Regras de estilo (alto)

### A1 — hex hardcoded = proibido

**Bug sem ela:** Dark mode inutilizavel. Cor hardcoded nao tem variante dark e mata toda a paleta.

**Deteccao:**
```bash
grep -rnE "#[0-9a-fA-F]{6}\b" src --include=*.tsx
```

**Solucao:** Usar tokens CSS ou o vocabulario fechado de cores de destaque.

### A2 — Vocabulario fechado de cores de destaque

**Bug sem ela:** Coesao visual perdida. Cores avulsas geram paleta infinita que ninguem consegue manter.

**Cores permitidas:** `emerald`, `sky`, `violet`, `amber`, `rose`, `primary`.

Light usa solid 50/600/700; dark usa /10 + 300/400. Nunca hex novo.

### A3 — Fonte de display nao-generica

**Bug sem ela:** Toda tela parece a mesma. Agentes de IA convergem para Inter, Roboto, Arial — resultado e uniformidade sem identidade.

**Deteccao:**
```bash
grep -rn "font-family.*Inter" src --include=*.tsx
```

**Solucao:** Escolher fonte com personalidade para titulos. Corpo pode ser generico. Este e o tell-zero; os outros nove padroes concretos de convergencia estao em `references/08-tells-ia.md`.

### A4 — Solid accent com variante dark

**Bug sem ela:** Cor desaparece em fundo escuro. Um verde com 31% de lightness some em fundo #1a1a2e.

**Deteccao:**
```bash
grep -rn "text-primary\b" src --include=*.tsx | grep -v "dark:"
```

**Solucao:** `dark:text-primary-glow` para accents solidos em dark mode.

### A5 — Loading/error/empty sempre cobertos

**Bug sem ela:** Tela quebrada sem feedback. Usuario clica e nada acontece.

**Solucao:** Toda lista tem: loading spinner, error com retry, empty message. Sem excecao.

### A6 — Contraste WCAG AA

**Bug sem ela:** Texto ilegivel para usuarios com baixa visao. `muted-foreground` sobre `muted` a 2:1 passa no olho do designer em monitor calibrado e falha em qualquer outro.

**Metrica:** 4.5:1 para texto normal, 3:1 para texto grande (18.66px bold ou 24px+). Aplica a pares foreground/background dos tokens, nos dois temas (light e dark).

**Deteccao:** Verificar os pares fg/bg dos tokens em `tokens.css` com calculadora de contraste (ex: script no build). Pares comuns que falham: `muted-foreground` sobre `muted`, accent 300 sobre fundo dark.

**Solucao:** Ajustar lightness do token ate passar; nunca escurecer ponto-a-ponto com hex.

### A7 — Focus ring visivel, nunca outline none sem substituto

**Bug sem ela:** Navegacao por teclado invisivel. Usuario que nao usa mouse "taba" pela pagina as cegas — foco some e a pagina parece travada.

**Deteccao:**
```bash
grep -rn "outline-none\|outline:\s*none" src --include=*.tsx | grep -v "ring"
```

**Solucao:** Todo interativo usa `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`. `outline-none` so com substituto `ring` junto.

### A8 — Alvo interativo minimo 36px com nome acessivel

**Bug sem ela:** Clique impreciso — botao de icone de 20px exige pontaria; e sem `aria-label`, screen reader anuncia "botao" sem dizer qual.

**Deteccao:** Inspecionar botoes so-icone: o elemento clicavel (nao o icone) tem `w-9 h-9` ou padding equivalente? Tem `aria-label` quando o texto esta ausente?

**Solucao:** Botao so-icone: `w-9 h-9` + `aria-label="Acao"`. Em tela touch, alvo minimo 44px. Menor que 24px e bloqueio de usabilidade, nao estilo.

### A9 — prefers-reduced-motion respeitado

**Bug sem ela:** Animacao causa desconforto vestibular (vertigem, nausea) em usuarios com `prefers-reduced-motion` ativo. Enfeite para alguns e barreira para outros.

**Deteccao:**
```bash
grep -rln "animate-\|transition-" src --include=*.tsx | grep -vL "motion-reduce"
```

**Solucao:** Animacoes de entrada e deslocamento guardadas com `motion-reduce:transition-none motion-reduce:animate-none` (ou media query global). Transicoes de cor/opacidade leves podem ficar.

---

## Regras de qualidade visual (medio)

### M1 — Tom estetico declarado por task

**Bug sem ela:** Mistura de estilos na mesma feature. Uma tela brutalista ao lado de uma editorial.

**Solucao:** Campo `tom_estetico` no frontmatter da task: `denso-operacional`, `editorial`, `minimalista-refinado`, `brutalista`.

### M2 — Animacao com proposito, nao enfeite

**Bug sem ela:** Ruido visual que cansa. Transicoes em tudo nao tem destaque em nada.

**Solucao:** Animacao so em: entrada de pagina (stagger), hover de interacao, feedback de acao. Nunca em scroll, nunca em carregamento decorativo.

**Idiomas (ver references/07-qa-checklist.md, secao 3):** silent success em vez de toast comemorativo; optimistic update + Undo em vez de confirmacao; tooltip hover 800ms / focus 0ms; um efeito por hover; overshoot so em interacao fisica; anima so `transform` e `opacity`.

### M3 — Densidade: controles h-9, rows ~52px

**Bug sem ela:** Painel parece landing page. Controles grandes desperdicam espaco em ferramenta que o usuario usa o dia todo.

**Metricas:**
- Controles (button, input, select): h-9 (36px)
- Table head: h-10 (40px)
- Table row: ~52px
- Card: rounded-xl, border, p-5
- Icones: w-4 h-4 em botoes, w-5 h-5 standalone

### M4 — Numeros comparaveis com tabular-nums

**Bug sem ela:** Coluna de valores baguncada. Numeros de largura variavel fazem a coluna "pular" a cada linha.

**Solucao:**
```css
.tabular-nums { font-variant-numeric: tabular-nums; }
```

Valores ausentes renderizam `—`, nunca `R$ 0,00` ou `0%`.
