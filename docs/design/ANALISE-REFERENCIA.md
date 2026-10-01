---
expx_schema: 1
expx_tool: buildx
kind: design_analise
projeto_id: plataforma-chatbot-ia
data: 2026-10-01
origem: pedido do usuário (analisar o design system do site de referência e aplicar)
---

# Análise do design da referência e plano para o Converse

Fonte: leitura do HTML e das folhas de estilo públicas do site de referência (chatbase.co) e de uma captura da página inicial (`docs/design/referencia-home.png`). **Estudamos o vocabulário visual; não copiamos marca, logotipo, textos, ilustrações nem números.** O Converse não usa o nome nem a identidade de terceiros (PR-03).

## O que a referência faz (observado)

**Tema.** Tema neutro no estilo shadcn/Tailwind v4, em escala zinc. Claro: fundo `#ffffff` (a página usa um off-white `#fafafa`), texto `#09090b`, texto suave `#71717b`, borda `#e4e4e7`, superfície suave `#f4f4f5`. Escuro: fundo `#09090b`, cartão `#18181b`, texto `#fafafa`, texto suave `#9f9fa9`, borda branca a 10%. **Primário quase preto** (`#09090b`; no escuro, `#e4e4e7`). Raio base `0.625rem` (10px). Acentos pontuais: azul `#2563eb` (`#60a5fa` no escuro), âmbar `#d97706`, rosa `#e60076`, verde nos interruptores.

**Tipografia.** Famílias Geist e Inter. Títulos grandes, peso médio, espaçamento entre letras apertado. O título principal mistura duas tintas (texto forte e texto suave) e uma palavra em itálico de traço editorial.

**Estrutura da página.** Conteúdo em coluna centralizada com **bordas verticais visíveis** nos dois lados. Seções separadas por linhas horizontais e um divisor em losango. Conteúdo organizado em **grade de células com linhas finas** e marcas "+" onde as células se encontram.

**Hero.** Texto à esquerda; à direita um **painel azul saturado com textura de losangos** que segura um **cartão de produto flutuante** (uma interface real em miniatura, com interruptores). Dois botões: um sólido quase preto, outro branco com borda fina.

**Recursos.** Três células com **cubos isométricos coloridos** sobre fundo claro quadriculado, título curto e descrição em texto suave.

**Botões e campos.** Altura de uns 40px, raio 8px, primário preto com texto claro, secundário branco com borda de 1px e sombra quase imperceptível. Sombras muito sutis em geral; a estrutura vem das bordas, não da sombra.

## O que muda no Converse

| Área | Antes (FT-01) | Depois |
|---|---|---|
| Primário | índigo `#4f46e5` | quase preto `#09090b` (claro) e `#fafafa` (escuro) |
| Acento | índigo | azul `#2563eb` (claro) e `#60a5fa` (escuro): links, foco, seleção |
| Neutros | slate | zinc, com a escala acima |
| Raio | 8–12px | 10px base, 8px em botões e campos, 14px em painéis grandes |
| Fontes | pilha do sistema | Geist (títulos e interface) e Inter (texto corrido), **servidas localmente**, sem baixar de rede |
| Estrutura | cartões com sombra | **bordas finas** como estrutura, sombra só em camadas flutuantes (menus, diálogos) |
| Escuro | já existe | mesma escala zinc, bordas brancas a 10% |

Os tokens continuam **semânticos** (PR-23): trocar a aparência não toca em componente, e `tests/tokens.test.ts` continua impondo "nenhuma cor literal fora de `tokens.css`" e o contraste de 4,5:1 nas duas variantes.

## Plano da landing page (pública, pt-BR)

Direção: **a ousadia fica no hero**; o resto é quieto e disciplinado.

- **Cor:** `#fafafa` página, `#ffffff` superfície, `#09090b` texto e botão primário, `#71717b` texto suave, `#e4e4e7` borda, `#2563eb` acento, e o painel do hero em um azul saturado próprio (`--marca-painel`, ~`#3340d4`) com textura de losangos em linhas finas.
- **Tipografia:** Geist para títulos e interface (peso 500, `letter-spacing` negativo), Inter no texto corrido. **Um único** toque editorial: no título do hero, a expressão-chave em serifa itálica (fonte local); em nenhum outro lugar.
- **Layout:** coluna de 1120px com bordas verticais; seções separadas por linha e divisor em losango; células em grade com "+" nas interseções **onde a grade é informação** (canais, tipos de conteúdo); alinhamento à esquerda.
- **Hero:** título em duas tintas, subtítulo curto, botões "Entrar" (sólido) e "Como funciona" (contorno). À direita, o painel azul com um **cartão de conversa em miniatura** montado em HTML e CSS: uma pergunta, a resposta do agente e as fontes citadas (o que o produto realmente faz).
- **Seções, só com o que o produto faz de verdade:** três canais (chat no site, Telegram, painel de testes); base de conhecimento (arquivos, textos, vídeos e links do YouTube); como funciona (três passos reais, por isso numerados: criar o agente, alimentar a base, publicar); segurança e privacidade (chaves cifradas, limites de uso, retenção e exclusão de dados, trilha de auditoria, backup); perguntas frequentes (`<details>`, sem JavaScript); rodapé.
- **Ilustrações:** cubos isométricos em SVG **desenhados para este projeto**, nas cores de acento do tema.
- **Conteúdo honesto:** **sem** depoimentos, logos de clientes, notas, contagens de usuários ou "confiado por". **Sem** cadastro público (PR-02): o botão principal leva ao login.
- **Movimento:** nenhum além de uma única entrada discreta do cartão do hero e das transições de hover/foco; respeita `prefers-reduced-motion`.
- **Piso de qualidade:** responsivo até 375px sem rolagem lateral, foco visível, contraste 4,5:1 nos dois temas, `<title>` e descrição, `lang="pt-BR"`, HTML semântico, nenhuma requisição a terceiros (fontes e imagens locais).
