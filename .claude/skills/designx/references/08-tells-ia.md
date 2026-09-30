# Tells de IA — os padroes que denunciam UI gerada

Dez padroes nomeados que o auditor-design procura. Cada um tem nome, por que le como gerado por IA, o fix e a deteccao. Ver um e suspeita; ver dois na mesma tela e confirmacao.

Diferente das 18 boas praticas (principios), os tells sao **padroes especificos de convergencia** — todo LLM emitira sem intervir. Adaptado do Hallmark (MIT), filtrado para o contexto Expx.

**Severidade:** alto em telas de apresentacao (`minimalista-refinado`, `editorial`); medio em painel interno (`denso-operacional`) — exceto T9 e T10, que sao alto em qualquer contexto.

---

## T1 — Hero com gradiente roxo

Gradiente purple-to-blue (ou cyan-to-magenta) em fundo de hero, geralmente com texto branco centrado. A estetica IA mais reconhecida que existe.

**Fix:** um accent solido. Sem gradiente de fundo em hero. Calor vem de tint nos neutros, nao de gradiente.

**Deteccao:**
```bash
grep -rnE "gradient.*(purple|violet|indigo|fuchsia)" src --include=*.tsx
```

## T2 — Headline com gradiente

`background-clip: text` com linear-gradient (roxo-rosa, azul-ciano). Denuncia "gerado por IA" mais rapido que quase tudo.

**Fix:** ink solido. Vida no titulo vem de peso, itálico ou display face — nunca de preenchimento gradiente.

**Deteccao:**
```bash
grep -rnE "bg-clip-text|background-clip:\s*text" src --include=*.tsx
```

## T3 — Grid de 3 colunas iguais

Tres colunas identicas, cada uma com icone acima de titulo de duas linhas acima de corpo de tres linhas. Todo LLM emite isso.

**Fix:** quebre o grid. Varie larguras. Misture alturas. Tire um card e use espaco negativo. Ico inline, nao acima. Ou abandone os cards e use ritmo tipografico.

**Deteccao:** `grep -rn "grid-cols-3" src` como pista; confirmar icone-acima-titulo por inspecao.

## T4 — Card dentro de card

Container com borda contendo cards. Ou card contendo card contendo "micro-card". Aninhamento visual sem razao semantica.

**Fix:** uma camada de contencao so. Geralmente a externa e a errada.

**Deteccao:** inspecao — `<Card>` aninhado em `<Card>`, `border` dentro de `border`.

## T5 — Card com faixa lateral

Borda grossa colorida em uma aresta (esquerda geralmente, 4-6px, roxo ou verde). Muito reconhecivel; muito SaaS-IA-2018.

**Fix:** hairline em volta inteira, ou sem borda, ou pequeno quadrado de accent ao lado do titulo. Nunca faixa grossa assimetrica.

**Deteccao:**
```bash
grep -rnE "border-l-[4-8]|border-r-[4-8]" src --include=*.tsx
```

## T6 — Hero centrado full-viewport

`min-height: 100vh`, tudo centrado, uma frase curta, um CTA grande. A landing page default de todo LLM.

**Fix:** hero com a altura do conteudo. Vies a esquerda ou direita. Mais do que uma frase nele.

**Deteccao:**
```bash
grep -rnE "min-h-screen|min-h-\[100vh\]" src --include=*.tsx
```

## T7 — Aurora blobs

Esferas 3D genericas ou circulos coloridos borrados (`blur-3xl rounded-full`) flutuando atras do hero, "para dar profundidade". Sem papel semantico.

**Fix:** corte. O hero nao precisa de profundidade; precisa de ancora tipografica.

**Deteccao:**
```bash
grep -rnE "blur-3xl.*rounded-full|rounded-full.*blur-3xl" src --include=*.tsx
```

## T8 — Emoji como icone

Glifo de emoji (✨ 🚀 ⚡ 🔥 🎯 ✅) como icone de card de feature, passo ou pilar. E misturar duas bibliotecas de icones na mesma tela.

**Fix:** uma biblioteca so (Lucide, Phosphor, Heroicons), SVG proprio, ou drop do icone e lideranca tipografica.

**Deteccao:**
```bash
grep -rnE "✨|🚀|⚡|🔥|🎯|✅" src --include=*.tsx
```

## T9 — transition-all e hover-scale uniforme

`transition-all` em vez de propriedades especificas; `hover:scale-105` aplicado em varios elementos nao relacionados ao mesmo tempo.

**Fix:** transicione só as propriedades que mudam. Hover com um efeito unico (cor OU translate 1px OU borda — nunca dois+).

**Deteccao:**
```bash
grep -rn "transition-all" src --include=*.tsx
grep -rn "hover:scale-105" src --include=*.tsx
```

## T10 — Nome placeholder e cliche

"Acme", "Nexus", "Jane Doe", "John Smith", "Lorem ipsum" em UI entregue. Nomes de preenchimento genericos denunciam geracao sem revisao.

**Fix:** conteudo real do dominio. Se o dominio nao existe ainda, nome plausivel do nicho, nunca cliche de template.

**Deteccao:**
```bash
grep -rniE "acme|nexus|jane doe|john smith|lorem ipsum" src --include=*.tsx
```

---

## Relacao com as 18 regras

| Tell | Regra-irma | Diferenca |
|---|---|---|
| T1, T7 | A2 (vocabulario fechado) | A2 e o principio; T1/T7 sao os padroes concretos |
| T2 | A4 (accent com variante dark) | T2 e o abuso de accent mais grave |
| T3, T4 | B3 (rail, nao tabs) por analogia | estrutura default vs estrutura com proposito |
| T9 | M2 (animacao com proposito) | M2 e o criterio; T9 e a preguica mecanica |
| — | A3 (display nao-generica) | Inter-everywhere e o tell-zero, ja coberto como regra |

## O auditor e os tells

No veredito, tells aparecem como achados de severidade alto (ou medio em painel interno) com o nome do tell: `T3 — grid de 3 colunas iguais`. Dois tells na mesma tela = confirmacao de geracao sem revisao; o veredito e REPROVADO mesmo sem violacao de bloqueio.
