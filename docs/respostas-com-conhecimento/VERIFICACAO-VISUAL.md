# Verificação visual — aba Testar com fontes e cartão Testar busca (FT-05)

Feita em 2026-09-30 no Chrome da sessão (ferramenta de navegador), contra o servidor de produção (`next start`) com banco e `STORAGE_DIR` temporários, semeados com `prisma/seed.ts`, e as contas fictícias de demonstração. O OpenRouter foi o servidor simulado local (`tests/apoio/openrouter-falso.ts`, iniciado por um script avulso fora do repositório que faz a resposta citar `[1]`), com a chave de teste. Nenhum segredo real entrou: `JWT_SECRET` e `ENCRYPTION_KEY` eram valores de teste passados em variável de ambiente.

## O que foi visto

| Verificação | Tema escuro | Tema claro |
|---|---|---|
| Cartão "Testar busca" na aba Conhecimento: título, texto de apoio, campo "Pergunta" rotulado, botão Buscar, resultado com o trecho da fonte de exemplo, o título da fonte e "Trecho 1 · pontuação < 0,01" | visto | visto |
| Busca pelo Enter no campo, estado de resultado | visto | visto |
| Aba Testar: pergunta "Qual o prazo de troca?" com resposta em stream; as referências `[1]` no texto viram pequenos botões destacados; abaixo, "Fontes" com o chip da fonte citada (ícone, título, `[1] [3]`) e a seção recolhida "Consultada, sem citação (1)" | visto | não repetido |
| Clicar em `[1]` abre o trecho da fonte abaixo do chip ("Trecho 1 · [1]" com o texto) e o chip ganha o anel de foco | visto | não repetido |
| Recarregar a página: a conversa retomada volta com as referências e as fontes | visto | não repetido |
| Segunda fonte criada pela API (texto "Garantia dos produtos") processada pela fila e consultada junto, aparecendo como "consultada, sem citação" | visto | |

## O que não foi possível ver

- **375 px:** a janela do navegador da sessão não reduz a largura (o redimensionamento devolve sucesso, mas a área de visualização continua em 1512 px). As regras de 375 px estão no CSS (`.busca-formulario` em coluna abaixo de 480 px, alvos de 44 px nos chips e no resumo abaixo de 768 px) e provadas apenas por tokens e markup. Soma-se à pendência PEND-07.
- **Tema claro da aba Testar com fontes:** o tema claro foi visto no cartão Testar busca; na aba Testar as cores vêm dos mesmos tokens, mas o quadro claro com fontes não foi repetido.
- **Expandir a seção recolhida "Consultada, sem citação"** com o mouse e a leitura por leitor de tela: não exercitados.
- **Comportamento do modelo real:** o simulado devolve texto fixo; que o modelo cite `[n]`, trate o material como dado e diga que não encontrou a informação não é verificável sem o provedor (limite conhecido).

## Achados

1. Corrigido: com o trecho expandido o chip da fonte ficava centralizado na linha; `align-self: flex-start` no `.chip-de-fonte` (`src/estilos/global.css`). Rebuild e revisto.
2. Sem correção: a pontuação BM25 de uma base pequena é minúscula e aparece como "< 0,01" em todos os trechos, o que não ajuda a comparar; a ordenação está certa, só o número é pouco informativo em bases pequenas.
3. Sem correção: o chip de uma fonte citada lista os números de todos os trechos consultados dela (`[1] [3]`), mesmo que o modelo tenha citado só o `[1]`; a citação é por fonte (PR-53).
