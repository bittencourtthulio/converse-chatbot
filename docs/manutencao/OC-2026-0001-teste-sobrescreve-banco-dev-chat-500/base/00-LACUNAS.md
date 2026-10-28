# Lacunas

Nenhuma é bloqueante para o plano.

1. **Conteúdo do `.env`** (scripts-e-testes-de-comando). NÃO DETERMINADO se `DATABASE_URL` aponta para `prisma/dev.db`: o hook de segurança da sessão bloqueou qualquer comando que toque o `.env`. Impacto: a ligação "script carregou o `.env` e escreveu no `dev.db`" é inferida pelo código (`import 'dotenv/config'`) e pelas linhas de auditoria `restauracao` e `backup_gerado` com origem `linha de comando` dentro do `dev.db`. O plano deve provar a correção com um teste que não dependa de ler o `.env`.
2. **Qual teste exato escreveu** (scripts-e-testes-de-comando). NÃO DETERMINADO entre `tests/backup-comando.test.ts:78` e `tests/restauracao-comando.test.ts:210`; os dois têm o mesmo defeito e entram no escopo. Os dados de fixture (`usuario11`, `usuario12`) vêm de `gerarBackupDeTeste`/`semearInstalacao`, que são do segundo.
3. **Linha do tempo no servidor** (chave-openrouter-e-conversar). NÃO DETERMINADO por que o `chat_erro` das 13:25:01 ainda achou o agente `cmvs4xow9001q0wonvwrxyblv`, que não existe no `dev.db` de hoje, e por que a ação `88769d8e` falhou com `PrismaClientKnownRequestError`. Hipótese: o servidor manteve o arquivo antigo aberto durante a troca do arquivo. Impacto: nenhum no conserto; fica como observação.
4. **Dados de desenvolvimento perdidos** (chave-openrouter-e-conversar). NÃO DETERMINADO se existe cópia anterior: não há `./backups` nem `pre-restauracao-*` (a pasta de backups do teste é temporária). Impacto: a recuperação do `dev.db` é decisão do usuário e fica fora do escopo do fix.
