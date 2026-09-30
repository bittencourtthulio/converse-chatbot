# QA checklist de design

Checklist materializado do E4 (runx) e do F5 (sprintx). O veredito de design e independente do veredito funcional — os dois precisam ser APROVADO.

QA contra a especificacao do DS, nao contra memoria. Teste com conteudo real, nao lorem ipsum.

---

## Quando usar

- runx E4 — quando `tipo_ocorrencia` e `melhoria-ui` ou `melhoria-ux`
- sprintx F5 — gate do auditor-design em tasks que tocam UI
- Sob demanda — revisao manual antes de entregar

## 1. Precisao visual

- [ ] Cores batem com tokens (nenhum hex hardcoded) — A1
- [ ] Tipografia segue a escala declarada no DS
- [ ] Espacamento e dimensoes seguem a densidade do tom (M3)
- [ ] Raio, sombra e opacidade conforme o DS
- [ ] Icones no tamanho e cor certos (w-4 em botao, w-5 standalone)

Deteccao:
```bash
grep -rnE "#[0-9a-fA-F]{6}\b" src --include=*.tsx
```

## 2. Estados do componente — 8, nao 5

Todo elemento interativo em producao tem **oito estados**. A maioria da UI gerada estiliza dois (default, hover) e esquece o resto — e e ali que a interface quebra.

| Estado | Quando | Tratamento |
|---|---|---|
| Default | Em repouso | Estilo base |
| Hover | Ponteiro sobre (so `@media (hover: hover)`) | Mudanca pequena: cor, 1px translate, borda |
| Focus | Teclado ou foco programatico | Ring visivel, `:focus-visible` — instantaneo, sem fade |
| Active/Pressed | Durante o clique | Pressionado: mais escuro, `translate(0 1px)` |
| Disabled | Nao interativo | Opacidade 0.5 + `cursor: not-allowed` + `aria-disabled` |
| Loading | Processando | Spinner/progresso inline, label legivel |
| Error | Falhou | Borda vermelha, mensagem, `aria-invalid` |
| Success | Concluido | Confirmacao discreta, auto-dismiss |

Falta qualquer um em elemento de producao = elemento inacabado. Os tres ultimos cobrem o A5 de listas (loading/error/empty).

## 3. Idiomas de microinteracao

Gosto codificado — o que separa UI revisada de UI emitida:

- [ ] **Silent success:** acao cujo efeito o usuario ja ve nao ganha toast comemorativo. Toast e para falha e efeito invisivel.
- [ ] **Optimistic update + Undo** em vez de dialogo de confirmacao para acoes reversiveis.
- [ ] **Tooltip:** hover atrasa 800ms; focus mostra em 0ms — nunca iguais.
- [ ] **Overshoot/bounce** (`cubic-bezier(0.34, 1.56, ...)`) so em interacao fisica (drag). Nunca em estado de UI.
- [ ] **Um efeito por hover** — cor OU translate OU borda. Nunca dois no mesmo elemento.
- [ ] **Anima so `transform` e `opacity`** — nunca width/height/top/left/margin/padding.
- [ ] **Focus ring instantaneo** — usuario de teclado precisa do indicador imediato; fade no focus e a11y violada.

## 4. Layout

- [ ] Alinhamento com o grid do DS
- [ ] Comportamento responsivo nos breakpoints declarados
- [ ] Conteudo reflow sem overflow/clipping inesperado
- [ ] Larguras min/max respeitadas
- [ ] Paginacao adaptativa, nao fixa (B1)

## 5. Conteudo

- [ ] Conteudo real cabe no layout (sem lorem ipsum em producao)
- [ ] Truncacao funciona onde especificado
- [ ] Numeros comparaveis com `tabular-nums` (M4)
- [ ] Valor ausente renderiza `—`, nunca `0,00`
- [ ] Mensagens de erro corretas e especificas

## 6. Acessibilidade

- [ ] Contraste WCAG AA nos pares fg/bg dos tokens, light e dark (A6)
- [ ] Focus indicators visiveis em todo interativo (A7)
- [ ] Alvos interativos >= 36px; botoes so-icone com `aria-label` (A8)
- [ ] Ordem de tabulacao logica
- [ ] `prefers-reduced-motion` respeitado (A9)
- [ ] Roles/ARIA corretos em componentes compostos (dialog, select, tabs)

## 7. Teclado

- [ ] Toda acao alcancavel por teclado
- [ ] `Esc` fecha modal/popover; foco volta ao trigger
- [ ] Foco preso dentro de modal (focus trap)
- [ ] Atalhos nao conflitam com navegador

## Saida

Cada item reprovado segue o formato Observacao → Problema → Fix (ver `references/03-auditoria.md`). O veredito final:

- **APROVADO** — zero bloqueios, avisos registrados
- **REPROVADO** — qualquer bloqueio (B1-B5) ou regra alto (A1-A9) violada
