# Verificação visual — aba Conhecimento (FT-04)

Feita em 2026-09-30 no Chrome da sessão (ferramenta de navegador), contra o servidor de produção (`next start`) com um banco e um `STORAGE_DIR` temporários, semeados com `prisma/seed.ts`, e as contas fictícias de demonstração. Nenhum segredo real entrou: os de execução (`JWT_SECRET`, `ENCRYPTION_KEY`) eram valores de teste passados em variável de ambiente.

## O que foi visto

| Verificação | Tema escuro | Tema claro |
|---|---|---|
| Aba Conhecimento: cartões de resumo (fontes, prontas, caracteres), "Adicionar ao conhecimento" com as opções Arquivos e Texto, zona de soltar com formatos e limite, lista de fontes | visto | visto |
| Upload real de três arquivos de uma vez pelo campo de arquivo (PDF com texto, PDF escaneado, CSV): cada um aparece na lista de envios como "Enviado", depois na lista de fontes | visto | não repetido |
| Status na lista: Pronto (verde), Erro (vermelho) com o motivo "Este PDF não tem texto selecionável (parece escaneado). OCR não é suportado." e o botão Reprocessar só nessa linha | visto | visto |
| Excluir com confirmação na própria linha ("Excluir “escaneado.pdf”?", Confirmar exclusão, Cancelar), sem janela do navegador; cancelado | visto | não repetido |
| "Ver conteúdo": cabeçalho da fonte, status e o trecho do CSV como texto ("Colunas: loja, produto, preço, estoque" e uma linha por registro) | não repetido | visto |
| Texto colado: aba Texto, título, contador "63 de 200.000", envio, mensagem "Texto adicionado" e a fonte nova como Pronto no topo da lista | não repetido | visto |
| Alternador de tema | claro e escuro alternados pelo botão do cabeçalho | |
| Sem rolagem horizontal da página a 1920 px | confirmado por script | |

## O que não foi possível ver

- **375 px:** a janela do navegador da sessão não reduz a largura (o redimensionamento devolve sucesso, mas a área de visualização continua em 1920 px), e a moldura de página em `iframe` não serve porque o sistema proíbe ser embutido (`X-Frame-Options: DENY`, PR-37). O que existe é a prova por teste de que as regras de 375 px estão no CSS (`tests/conhecimento-estilos.test.ts`: cartões em uma coluna, linha de fonte empilhada, alvos de 44 px). Soma-se à pendência PEND-07.
- **O spinner de "Processando":** os arquivos de teste são pequenos demais, a fila os processa em milissegundos e o polling de 2 s nunca pegou uma fonte em processamento. O rótulo, o spinner e o fim do polling têm teste (`tests/painel-de-conhecimento.test.tsx`, `tests/conhecimento-logica.test.ts`), mas não foram vistos.
- **Arrastar e soltar** com o mouse: o campo de arquivo foi acionado por script de upload da ferramenta; o evento de soltar não foi exercitado.
- **Ver conteúdo com mais de uma página de trechos:** só há paginação com mais de 20 trechos; a lógica tem teste.
- **Foco por teclado na zona de soltar** e leitura por leitor de tela: não exercitados; o rótulo do campo de arquivo foi conferido por script (o `label` liga ao campo, o campo é múltiplo e descrito pela lista de formatos).

## Achados

Nenhum defeito visual nos dois temas. Uma inconsistência pequena, sem correção: com a confirmação de exclusão aberta, a coluna do título estreita e o texto do erro quebra em mais linhas.
