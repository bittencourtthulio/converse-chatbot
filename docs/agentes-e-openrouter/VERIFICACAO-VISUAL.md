# Verificação visual — FT-02

Data: 2026-09-30. Ferramenta: navegador Chrome da sessão (extensão). O app rodou em `next start` (build de produção), porta 3190, com banco descartável semeado, segredos por variável de ambiente inline e o OpenRouter simulado de `tests/apoio/openrouter-falso.ts` (nenhuma chamada à rede real). Login com a conta de demonstração fictícia da seed. Tudo o que subiu foi derrubado e o banco descartável apagado ao fim.

## O que foi visto

| Tela | Tema escuro | Tema claro | 375 px |
|---|---|---|---|
| `/agentes` (lista com o Assistente de exemplo) | visto, 1568 px | não visto isolado (a tela é a mesma dos tokens) | visto (quadro estático, sem JavaScript) |
| `/configuracoes/integracoes` sem chave | visto | visto | visto (quadro estático) |
| `/configuracoes/integracoes` com chave | não visto | visto: máscara `sk-or-…0000`, aviso de salva, "Testar conexão" com mensagem de sucesso do servidor simulado | visto o cartão com a máscara |
| `/agentes/<id>` (formulário e excluir) | não visto | visto: campos preenchidos, contador de instruções, seletor de modelo, temperatura, mensagem inicial; excluir abriu o bloco de confirmação na tela, com Cancelar e Confirmar exclusão | visto o cabeçalho, a aba e o cartão de excluir (quadro estático) |

## Achado e correção

O botão secundário de `<button>` aparecia sem borda ("Testar conexão", "Remover chave", "Excluir agente"): `button.secundario` (especificidade maior) perdia para a regra `.botao` que zera a borda. Vinha do FT-01 (o "Desativar" da tela de usuários tinha o mesmo defeito). Corrigido em `src/estilos/global.css` (`.secundario, button.secundario` e o mesmo para `.perigo`); a borda de `rgb(203, 213, 225)` foi conferida no navegador depois do novo build.

## Limitações declaradas (não vistas)

- A janela do navegador da sessão não reduz a largura real (o redimensionamento não mudou a viewport de 1920 px), e o cabeçalho `X-Frame-Options: DENY` (PR-37) impede enquadrar as páginas. Os quadros de 375 px foram montados a partir do HTML das páginas em `iframe srcdoc`, sem JavaScript: valem para a diagramação (sem rolagem horizontal, cabeçalho com gaveta, cartões e abas cabem), não para os formulários, que não entraram nesses quadros. É a mesma limitação da PEND-07 da FT-01, que segue aberta.
- O tema escuro de `/agentes/<id>` e de `/configuracoes/integracoes` com chave não foi visto; o contraste 4,5:1 dos tokens é provado por `tests/tokens.test.ts`.
- O clique de Testar conexão e a confirmação de exclusão foram exercitados; Cancelar e a exclusão de fato não foram clicados em navegador (a exclusão tem teste em `tests/acoes-de-agente.test.ts`).
