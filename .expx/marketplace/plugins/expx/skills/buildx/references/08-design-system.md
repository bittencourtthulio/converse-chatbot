# O design system padrão — VS Code

Consultado no B2 (ao montar o esqueleto) e no B4 (em toda task de interface). Só se aplica quando o usuário **não** indicou design system; se indicou, o dele vence sem discussão e este arquivo não é lido.

Regra que governa o arquivo inteiro: **nomes semânticos, nunca valores literais no componente.** O token diz o papel (`button-background`), não a cor (`#0078d4`). É isso que faz o par claro/escuro funcionar sem duplicar componente, e é o que mantém uma decisão de aparência tomada pela máquina revisável depois.

---

## Os tokens

Definidos uma vez, como variáveis CSS, na raiz. Dark+ é o tema base do VS Code; Light+ é o par.

```css
:root {
  /* superfícies — do fundo mais profundo à mais elevada */
  --bg-app:            #1e1e1e;  /* editor: a área de conteúdo */
  --bg-sidebar:        #252526;  /* barra lateral, painéis */
  --bg-activitybar:    #333333;  /* barra de atividade, a mais escura */
  --bg-input:          #3c3c3c;  /* campos de entrada */
  --bg-hover:          #2a2d2e;  /* linha de lista sob o cursor */
  --bg-active:         #04395e;  /* linha de lista selecionada */
  --bg-badge:          #4d4d4d;

  /* texto */
  --fg-default:        #cccccc;  /* o texto normal — NÃO é branco puro */
  --fg-muted:          #9d9d9d;  /* secundário, legendas, placeholders */
  --fg-disabled:       #6b6b6b;
  --fg-link:           #3794ff;
  --fg-on-accent:      #ffffff;  /* sobre botão primário */

  /* bordas e separadores */
  --border:            #3c3c3c;  /* separador entre painéis */
  --border-input:      #3c3c3c;
  --border-focus:      #007fd4;  /* o anel de foco — 1px, sólido */

  /* ação primária */
  --accent:            #0e639c;
  --accent-hover:      #1177bb;
  --accent-fg:         #ffffff;

  /* ação secundária */
  --secondary:         #3a3d41;
  --secondary-hover:   #45494e;
  --secondary-fg:      #cccccc;

  /* estado */
  --danger:            #f14c4c;
  --warning:           #cca700;
  --success:           #89d185;
  --info:              #3794ff;
  --danger-bg:         #5a1d1d;
  --warning-bg:        #5a4a00;
  --success-bg:        #144212;

  /* barra de status — a cor de identidade do VS Code */
  --statusbar-bg:      #007acc;
  --statusbar-fg:      #ffffff;
}

:root[data-theme="light"] {
  --bg-app:            #ffffff;
  --bg-sidebar:        #f3f3f3;
  --bg-activitybar:    #2c2c2c;  /* permanece escura no tema claro */
  --bg-input:          #ffffff;
  --bg-hover:          #e8e8e8;
  --bg-active:         #e4e6f1;
  --bg-badge:          #c4c4c4;

  --fg-default:        #3b3b3b;  /* NÃO é preto puro */
  --fg-muted:          #616161;
  --fg-disabled:       #a0a0a0;
  --fg-link:           #005fb8;
  --fg-on-accent:      #ffffff;

  --border:            #e5e5e5;
  --border-input:      #cecece;
  --border-focus:      #005fb8;

  --accent:            #005fb8;
  --accent-hover:      #0258a8;
  --accent-fg:         #ffffff;

  --secondary:         #e4e6f1;
  --secondary-hover:   #cccedb;
  --secondary-fg:      #3b3b3b;

  --danger:            #e51400;
  --warning:           #8f6800;  /* escurecido do #bf8803 do VS Code, por contraste */
  --success:           #1a7f37;
  --info:              #005fb8;
  --danger-bg:         #fddede;
  --warning-bg:        #fdf6d3;
  --success-bg:        #dff6dd;

  --statusbar-bg:      #005fb8;
  --statusbar-fg:      #ffffff;
}
```

### Três coisas que são erro fácil aqui

**Texto não é preto nem branco puro.** `#cccccc` no escuro, `#3b3b3b` no claro. Contraste máximo cansa a vista em tela de trabalho, e é a diferença mais visível entre uma interface que parece VS Code e uma que parece um rascunho.

**A barra de atividade permanece escura nos dois temas.** No Light+ ela é `#2c2c2c`. Clareá-la junto com o resto quebra a hierarquia visual que dá a identidade.

**A ordem das superfícies não é decorativa.** Barra de atividade → barra lateral → editor, do mais escuro ao mais claro no tema escuro, e o inverso no claro. É ela que diz o que é navegação e o que é conteúdo, sem precisar de borda.

**O amarelo do tema claro foi escurecido de propósito.** O `#bf8803` do VS Code dá 3.12:1 sobre branco — abaixo do 4.5:1 que este mesmo arquivo exige na seção de acessibilidade. Aqui ele é `#8f6800`, que passa sobre o fundo do conteúdo (5.06:1) e sobre o da barra lateral (4.56:1).

É a única divergência deliberada em relação ao tema original, e a razão é que o VS Code usa aquele amarelo em ícone pequeno com forma própria, não em texto corrido. Quando os dois critérios colidem, **acessibilidade ganha de fidelidade**.

## O tema

Três estados, e o terceiro é o padrão:

| Estado | Como | O que faz |
|---|---|---|
| escuro explícito | `data-theme="dark"` na raiz | ignora o sistema |
| claro explícito | `data-theme="light"` na raiz | ignora o sistema |
| **sistema** (padrão) | nenhum atributo | segue `prefers-color-scheme` |

Para o estado "sistema" funcionar, os tokens do claro precisam existir em **dois** seletores. Extraia-os para uma classe própria e aplique nos dois lugares, em vez de duplicar a lista:

```css
/* escolha manual pelo claro */
:root[data-theme="light"] { /* os tokens do claro */ }

/* sem escolha manual: segue o sistema */
@media (prefers-color-scheme: light) {
  :root:not([data-theme="dark"]) { /* os mesmos tokens do claro */ }
}
```

A ordem importa: o bloco de mídia vem **depois** do `[data-theme="light"]`, mas a especificidade de `:root[data-theme="dark"]` ganha dele — por isso a escolha manual pelo escuro vence o sistema claro. Duplicar a lista à mão é onde essa parte costuma quebrar: um token acrescentado só no primeiro bloco some quando o usuário está em "sistema".

A escolha manual persiste no navegador daquele usuário. A alternância fica no canto inferior direito, na barra de status — que é onde o VS Code a coloca.

Nenhum token pode ter sua **única** definição dentro de um bloco de mídia ou de `[data-theme]`. O escuro é a base em `:root`; o claro sobrescreve. Um token definido só no claro some no escuro, e o componente herda transparente.

## Tipografia

```css
--font-ui:   -apple-system, BlinkMacSystemFont, "Segoe UI", "Ubuntu",
             "Droid Sans", sans-serif;
--font-mono: "SF Mono", Monaco, Menlo, "Cascadia Code", "Roboto Mono",
             Consolas, "Courier New", monospace;
```

A fonte da interface é **a do sistema**, não uma web font. O VS Code faz isso deliberadamente: a interface pertence ao sistema operacional, não à aplicação. Também elimina o salto de layout e a requisição de rede que uma web font traz.

| Uso | Tamanho | Peso |
|---|---|---|
| corpo, rótulo, item de lista | 13px | 400 |
| secundário, legenda, ajuda | 12px | 400 |
| título de painel, cabeçalho de seção | 11px | 600, `letter-spacing: .5px`, **caixa alta** |
| título de página | 20px | 600 |
| dado tabular, id, código, valor monetário | 12px | 400, `--font-mono` |

13px de base parece pequeno diante do 16px da web. É deliberado: densidade é a característica de uma interface de ferramenta, e subir para 16px descaracteriza o sistema inteiro. Altura de linha 1.4 no corpo, 1.35 em listas densas.

O título de seção em 11px maiúsculo é a assinatura visual mais reconhecível do VS Code. Vale usá-lo onde ele cabe.

## Espaçamento

Grade de 4px. Nada fora dela.

```css
--space-1: 4px;   --space-2: 8px;   --space-3: 12px;
--space-4: 16px;  --space-5: 24px;  --space-6: 32px;
```

Alturas fixas, que dão o ritmo da interface:

| Elemento | Altura |
|---|---|
| barra de título | 35px |
| item de lista, linha de árvore | 22px |
| campo de entrada, botão | 26px |
| aba | 35px |
| barra de status | 22px |
| largura da barra de atividade | 48px |
| largura da barra lateral | 300px, redimensionável, mínimo 170px |

Raio de borda: **2px**. Só isso, em tudo. Cantos arredondados de 8px ou mais pertencem a outra família visual e destroem a identidade num só componente.

## A estrutura de layout

```
┌────┬──────────────┬─────────────────────────────────┐
│    │              │  abas                           │
│ A  │   barra      ├─────────────────────────────────┤
│ C  │   lateral    │                                 │
│ T  │              │   conteúdo                      │
│ I  │   300px      │                                 │
│ V  │              │                                 │
│ 48 │              ├─────────────────────────────────┤
│    │              │  painel (opcional)              │
├────┴──────────────┴─────────────────────────────────┤
│  barra de status                             22px   │
└─────────────────────────────────────────────────────┘
```

| Região | Papel na aplicação |
|---|---|
| **barra de atividade** | as áreas principais do sistema — ícone + rótulo acessível. Uma por grande função. Ativa: barra de 2px na borda esquerda, ícone em `--fg-default` |
| **barra lateral** | navegação dentro da área ativa: lista, árvore, filtros. Título em 11px maiúsculo |
| **abas** | os itens abertos, quando a aplicação tem esse conceito. Não force onde não faz sentido |
| **conteúdo** | a tela em si |
| **painel** | resultado secundário — log, saída, detalhe. Retrátil, não obrigatório |
| **barra de status** | contexto e estado global: quem está logado, ambiente, contadores, alternância de tema. **Fundo `--statusbar-bg`, sempre** |

A barra de status com fundo azul é a peça mais reconhecível do VS Code. Ela não é decoração: é onde vai o estado global que não pertence a nenhuma tela.

### A navegação que já nasce montada

As regiões são vazias no B2; o que as preenche vem da `FT-01`. E parte disso é fixo, independentemente do que o sistema faz — é o esqueleto de aplicação do P-9:

```
barra lateral
  Painel                 →  /
  Configurações
    Usuários             →  /configuracoes/usuarios
    Meu perfil           →  /perfil
```

| Item | Quem vê | Observação |
|---|---|---|
| Painel | todo usuário autenticado | é a rota onde o login desemboca; tem título e subtítulo próprios, e as features do B4 preenchem o corpo |
| Usuários | apenas `admin` | some da navegação para quem não é `admin` — e a rota nega no servidor, não só na interface (L2) |
| Meu perfil | todo usuário autenticado | dá acesso à edição de nome e e-mail, e à troca de senha |

A barra de status já mostra quem está logado (P-6), e o nome ali leva ao **Meu perfil** — é o caminho que o usuário procura primeiro.

Feature do B4 **acrescenta** item a essa barra lateral; nunca recria a área de Configurações nem substitui o Painel por uma tela de listagem.

### No celular

Abaixo de 768px a estrutura colapsa, e essa é a única adaptação:

- barra de atividade e barra lateral viram uma gaveta, aberta por um botão no cabeçalho
- o conteúdo ocupa a largura inteira
- a barra de status permanece, com menos itens
- alvos de toque sobem para 44px de altura; a densidade de 22px é para ponteiro

## Componentes

**Botão primário** — `--accent`, texto `--accent-fg`, 26px de altura, raio 2px, sem sombra. Hover troca para `--accent-hover`. Sem transição de cor, ou no máximo 100ms: o VS Code responde imediatamente.

**Botão secundário** — `--secondary` / `--secondary-fg`. Mesma geometria.

**Campo de entrada** — fundo `--bg-input`, borda 1px `--border-input`, 26px. Em foco a borda vira `--border-focus`, 1px sólido. **Nunca use `box-shadow` como anel de foco** — o VS Code usa borda, e a sombra é de outra linguagem visual.

**Lista e tabela** — linha de 22px, sem zebra. Hover `--bg-hover`, selecionada `--bg-active`. Cabeçalho de tabela em 11px maiúsculo, com borda inferior. Dado numérico ou identificador em `--font-mono`, alinhado à direita quando é número.

**Notificação** — canto inferior direito, fundo `--bg-sidebar`, borda 1px, ícone de severidade à esquerda em `--danger` / `--warning` / `--info`. Erro não desaparece sozinho; sucesso desaparece.

**Diálogo modal** — centralizado no topo, largura máxima 600px, fundo `--bg-sidebar`, sobreposição escura atrás. Ações no rodapé, primária à direita.

**Estados de tela** — os três são obrigatórios em qualquer tela que busque dado:

| Estado | Como |
|---|---|
| vazio | ícone discreto, uma frase em `--fg-muted`, e a ação que resolve |
| carregando | esqueleto na forma do conteúdo, não um giro centralizado |
| erro | a mensagem em `--danger`, o que fazer, e um botão de tentar de novo |

## Acessibilidade

Não é seção separada do design: é parte de cada componente.

- contraste mínimo 4.5:1 para texto **nas duas variantes** — os tokens acima já atendem; combinações novas precisam ser verificadas
- foco visível em tudo que recebe teclado, com a borda `--border-focus` — nunca `outline: none` sem substituto
- todo ícone sozinho tem rótulo acessível; a barra de atividade é toda de ícones
- ordem de tabulação segue a ordem visual
- cor nunca é o único portador de informação: erro tem ícone e texto, não só vermelho

## Como isto entra no projeto

**No B2**, junto do esqueleto: os tokens das duas variantes num arquivo de estilo global, o alternador de tema, e o componente de layout com as seis regiões — vazias. Nenhuma tela ainda; isto é casca.

**No B4**, em toda task de interface: os componentes vão sendo construídos sobre os tokens. A `FT-01` entrega a casca preenchida — login, barra de status com o usuário, alternância funcionando, e a navegação do P-9 com Painel, Usuários e Meu perfil —, e é isso que a torna demonstrável.

**No `CONVENCOES.md`**, uma regra que o `stackx-check` verifica depois: *nenhum valor de cor literal em componente; toda cor vem de um token.* É a regra que impede o sistema de derivar feature a feature.

## Erros que este padrão comete

- **Aplicar a estética de ferramenta onde ela é errada.** Site institucional, página de marketing e produto voltado ao consumidor final não querem parecer um editor de código. O padrão é para aplicação de trabalho — se o `PROJETO.md` descrever outra coisa, registre a exceção e escolha outro caminho.
- **Copiar as cores e perder a estrutura.** A hierarquia de superfícies e as alturas fixas carregam mais identidade que a paleta. Uma interface com os tokens certos e espaçamento de 16px em tudo não parece VS Code.
- **Subir a fonte para 16px "porque 13 é pequeno".** Descaracteriza o sistema inteiro. Se o público exigir texto maior, isso é uma decisão de acessibilidade a registrar como premissa, não um ajuste silencioso.
- **Arredondar os cantos.** 2px. Um componente com 8px destoa de todos os outros.
