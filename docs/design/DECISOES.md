---
expx_schema: 1
expx_tool: buildx
kind: design_decisoes
projeto_id: plataforma-chatbot-ia
data: 2026-10-01
feature: FT-14
---

# Decisões de design da FT-14

Parte do briefing é `ANALISE-REFERENCIA.md`. Estudamos o vocabulário visual da referência; marca, logotipo, textos, ilustrações e números dela não foram copiados, e a landing não tem depoimento, logo de cliente, nota, contagem de usuários nem "confiado por".

## Tokens (`src/estilos/tokens.css`)

Os nomes semânticos foram mantidos, então nenhum componente mudou de lógica.

| Token | Antes | Depois (claro / escuro) |
|---|---|---|
| `--bg-app`, `--bg-surface`, `--bg-subtle` | slate | `#fafafa`, `#ffffff`, `#f4f4f5` / `#09090b`, `#18181b`, `#1f1f23` |
| `--fg-default`, `--fg-muted` | slate | `#09090b`, `#52525b` / `#fafafa`, `#a1a1aa` |
| `--border` | `#e2e8f0` | `#e4e4e7` / branco a 10% |
| `--accent` (primário) | índigo | `#09090b` / `#fafafa`, com `--accent-fg` de contraste |
| `--accent-text`, `--border-focus` | índigo | azul `#2563eb` / `#60a5fa` (link, foco, seleção) |
| `--bg-selected`, `--accent-soft` | índigo claro | zinc (`#f4f4f5` / `#27272a`); o item de menu ativo agora é texto forte sobre zinc |
| `--raio-cartao` | 12px | 10px; novo `--raio-painel` 14px; `--raio-controle` 8px |
| sombras | sutis em cartões | `--sombra-sm` só no botão secundário; `--sombra-md/lg` só em camada flutuante (menu, cartão do hero) |
| `--font-ui` | pilha de sistema | Geist; novos `--font-texto` (Inter) e `--font-editorial` (serifa itálica) |
| canais e gráfico | índigo e verde-água | zinc e azul (`--canal-*`, `--grafico-*`) |

Tokens novos, todos em `tokens.css`: `--selecao-bg`, `--marca-painel` (`#3340d4` claro, `#2530a8` escuro), `--marca-painel-linha`, `--marca-painel-fg`, `--marca-cubo-topo/esq/dir`, `--grade-linha`, `--grade-ponto`, `--raio-painel`, `--font-texto`, `--font-editorial`. `--border-input` ficou em `#8b8b94` (3:1 contra o fundo, exigência de contraste de componente). O texto sobre a cor do usuário (`--fg-em-cor-*`) não mudou.

Aparência de componentes (`global.css`): cartões, tabelas, alertas e bolhas por borda fina (sem sombra); botão primário sólido quase preto com peso 500; secundário branco com borda e sombra quase imperceptível; foco azul de 2px; login com motivo de grade de linhas finas que some nas bordas; a seleção de texto usa `--selecao-bg`.

**Chat embutido.** A cor do agente continua escolha do usuário. A amostra padrão e o `COR_PADRAO` passaram de índigo para o azul do acento (`#2563eb`); as amostras ganharam "Zinco" no lugar de "Grafite" e o índigo seguiu na lista. O aviso de baixo contraste agora mede contra `#ffffff` e `#18181b` (o fundo escuro novo). O serviço sempre grava a cor ao salvar, então o `DEFAULT '#4f46e5'` da migration antiga, imutável, nunca chega ao usuário; agentes já salvos mantêm a cor deles. O `widget.js` usa o mesmo azul como reserva.

## Fontes

Geist (`geist@1.7.2`, arquivo variável), Inter (`@fontsource-variable/inter@5.3.0`, latino variável) e Instrument Serif (`@fontsource/instrument-serif@5.3.0`, só o itálico), todas por `next/font/local` apontando para o pacote em `node_modules` (`src/app/fontes.ts`). O Next copia os arquivos para o build: nada de rede em build nem em execução. A serifa não é pré-carregada (`preload: false`) e só o `.lp-editorial` a usa. `npm audit --audit-level=high` continua em 0.

## Landing (`/inicio`, mostrada em `/` sem sessão)

- **Hero** é o único lugar ousado: título grande em duas tintas com **uma** expressão em serifa itálica azul ("já sabe."), painel azul de losangos em linha fina que sangra até a borda da coluna, e um cartão de conversa em miniatura (HTML e CSS) que invade o painel pela esquerda: pergunta, resposta com marcadores `[1]` e `[2]` e as fontes citadas. O cartão se declara "Exemplo ilustrativo" porque o texto da conversa é inventado para a demonstração. Única animação: a entrada do cartão (600ms), desligada em `prefers-reduced-motion`.
- **Resto quieto:** coluna de 1120px com bordas verticais, linhas finas, divisor em losango entre blocos, títulos em duas tintas sem serifa. Os "+" existem só nas grades de canais e de tipos de conteúdo. Os passos são numerados porque são uma sequência real; as demais listas não são.
- **Conteúdo conferido no código e no README:** canais (script do chat com cor, posição e domínios; bot do Telegram por token; aba Testar com fontes); fontes (PDF, DOCX, TXT, Markdown, CSV, HTML, JSON, SRT e VTT, texto colado, vídeo e áudio por transcrição, link do YouTube por legendas); segurança (chaves e token cifrados com AES-256-GCM, limites por minuto e por dia e de login, retenção de 90 dias por padrão, exclusão por conversa, titular e usuário, trilha de auditoria sem texto de conversa, backup). O FAQ diz com franqueza que um modelo pode errar e que as perguntas seguem para o OpenRouter.
- **Ilustração:** cubos isométricos desenhados para o projeto em SVG (`CuboIsometrico.tsx`), três arranjos (um, par, pilha), nas cores `--marca-cubo-*`, sobre uma treliça de losangos feita de gradientes CSS; `aria-hidden`.
- **Sem JavaScript próprio:** componente de servidor; FAQ em `<details>`; a landing não tem o alternador de tema (segue a preferência do sistema ou a escolha salva, lida pelo script do layout raiz).
- **Descartado:** cartões de métrica, depoimentos, logos, planos, "Comece grátis", gradientes decorativos e movimento em cada seção.

## Roteamento de `/`

`src/proxy.ts` (que já roda em toda requisição) reescreve `/` para `/inicio` quando **não há cookie de sessão**; com cookie, `/` segue para o painel. Escolhi olhar a presença do cookie, não a validade, por três motivos: a landing não depende de banco, o painel continua com a guarda própria (`exigirUsuario`, inclusive para token adulterado ou revogado, que vai ao login como antes) e não há segunda fonte de verdade sobre sessão. As duas páginas saem com `Cache-Control: private, no-cache, no-store` (cabeçalho do Next para páginas dinâmicas), então cache nenhum mistura uma com a outra; tentei acrescentar `Vary: Cookie` no proxy, mas o Next o sobrescreve em respostas reescritas. `/inicio` responde direto a qualquer pessoa (não redireciona quem tem sessão). A rota fica fora de `(sistema)` e do teste de guardas, de propósito.

## Testes ajustados, um por um

1. `tests/tokens.test.ts`: "declara a fonte de sistema com Inter na frente" virou "Geist na interface e Inter no texto, locais" (a aparência mudou); "raios de 8 a 12px" virou a geometria nova (8, 10 e 14px); incluídos o primário quase preto/branco, o azul, a borda e os tokens da landing nos dois temas; novos pares de contraste (seleção, azul sobre zinc, texto sobre o painel da marca). O contraste 4,5:1 e a regra de nenhuma cor literal continuam iguais.
2. `tests/cor.test.ts`: "o padrão é o índigo do sistema, o mesmo da migration" virou "o padrão é o azul do acento" (o `COR_PADRAO` mudou; a comparação com a migration saiu porque o serviço sempre grava a cor).
3. `tests/rotas.test.ts`: `/` saiu da lista "sem sessão manda para o login" (agora responde 200 com a landing). Novos casos: landing em `/` e `/inicio`, sem vazamento de dado, sem host externo no HTML e nas folhas de estilo servidas, fonte `.woff2` do próprio servidor, cabeçalhos de segurança, `Cache-Control: no-store`, e com sessão `/` continua painel. O teste do token adulterado (307 para o login) segue valendo sem mudança.
4. `tests/projeto.test.ts`: as citações `arquivo:linha` do CONVENCOES.md que apontam para `src/proxy.ts` (duas), `tokens.css` (uma) e `global.css` (uma) foram atualizadas para as linhas novas, porque o conteúdo citado só andou de lugar. O CONVENCOES.md recebeu os mesmos números.
5. Novos arquivos: `tests/landing.test.tsx` (estrutura, âncoras, destinos dos botões, uma só serifa, ausência de afirmações proibidas e de host externo, só um `@keyframes`, `prefers-reduced-motion`) e `tests/fontes-locais.test.ts` (versões fixas, arquivos presentes, só `next/font/local`, nenhum host de fonte em `src`, serifa usada em um só lugar).

## Riscos e pontos de atenção

- A landing afirma "90 dias" de retenção por padrão e o texto dos limites sem números: se o padrão mudar no código, o texto precisa mudar junto.
- O exemplo do cartão do hero (política de reembolso) é ilustrativo e está rotulado; não é política de ninguém.
- O PDF e a mídia da FT-13 (pausada) não alteram nada aqui; a lista de formatos da landing é a do README.
