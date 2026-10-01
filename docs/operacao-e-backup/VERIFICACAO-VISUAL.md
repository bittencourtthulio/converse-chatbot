# Verificação no navegador — FT-11 operacao-e-backup

Verificação feita num Chrome próprio, aberto com diretório de perfil novo e `--remote-debugging-port=0`, com o alvo confirmado antes de cada ação e controlado por CDP. Dois servidores de produção (`next start`) em portas livres, com banco, `storage` e `BACKUP_DIR` temporários só desta verificação e segredos descartáveis passados inline. Um dos servidores usava um banco deliberadamente quebrado (tabelas `mensagens` e `conversas` removidas) para exercitar a página de erro. O Chrome e os servidores foram encerrados ao fim.

## O que foi visto

- Tela Sistema (Configurações > Sistema) nos temas claro e escuro, a 1280 px e a 375 px: estado geral e as quatro sondas (banco, disco, índice de busca, ffmpeg) em "Tudo em ordem", versão do app, 10 de 10 migrations aplicadas, tempo de atividade, Node, fuso, tamanho do banco e dos arquivos, fila de fontes, expurgo, configuração (chave de criptografia, endereço HTTPS, chave do OpenRouter) e o aviso de que o backup não contém a `ENCRYPTION_KEY`. Sem rolagem lateral a 375 px.
- Gerar backup agora: o arquivo `backup-AAAAMMDD-HHMMSS.tar.gz` apareceu na lista com data e tamanho, o download pelo navegador teve o mesmo SHA-256 do arquivo no disco e a ação apareceu na tela de Auditoria com a frase de backup gerado.
- Página de erro (banco quebrado) e 404, nos dois temas e nas duas larguras: ambas mostram o "Código de referência"; o código da página de erro (digest) foi encontrado na linha estruturada do log do servidor; nenhuma pilha vazou na página.
- A orientação de restauração (somente por linha de comando, com o servidor parado) aparece na tela.

## Defeitos achados

Nenhum defeito visual ou funcional. `src/estilos/global.css` não precisou de alteração nesta task.

## O que não foi visto

- Telefone real, leitor de tela e outros navegadores além do Chrome.
- O contêiner pelo navegador: o contêiner foi verificado por teste automatizado (ver `VERIFICACAO-CONTEINER.md`), e a tela foi vista no servidor de produção fora do contêiner.
- Contêiner em arquitetura diferente da máquina de desenvolvimento (arm64).
- Restauração pelo navegador, que por decisão não existe: é só por linha de comando e tem teste próprio (PR-20).
