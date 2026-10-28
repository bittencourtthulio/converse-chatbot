# Restrições invioláveis

Cada regra traz o que quebra se for violada. Origem: `docs/stack/CONVENCOES.md`, `docs/stack/LACUNAS.md`, `eslint.config.mjs`, README.

- **Segredo nunca em claro nem em log.** A chave do OpenRouter e o token do Telegram ficam cifrados (AES-256-GCM, `src/lib/cripto.ts`); o serviço devolve só máscara. Log só por `src/lib/log.ts`, que redige. Violar vaza credencial de terceiro.
- **Arquivo de segredos reais não se lê nem se grava.** O modelo é `.env.example`. Os hooks bloqueiam.
- **Migração só acrescenta.** `DROP TABLE`/`DROP COLUMN` exigem `-- destrutiva-autorizada` na migration e autorização humana; `tests/migracoes.test.ts` falha sem a marca. Não existe reversão: o erro se corrige avançando, e o backup é a rede de segurança.
- **Nunca `prisma db push`, `migrate dev` ou `migrate reset`.** O `db push` apaga a tabela virtual FTS5 e o `migrate dev` com FTS5 não foi verificado. Só `npm run db:migrate` (`migrate deploy`). [[dados/fts5]]
- **SQL cru só para FTS5, sempre parametrizado.** Texto do usuário nunca é concatenado; a expressão `MATCH` só leva termos limpos entre aspas.
- **Camadas têm direção.** `src/app`/`src/componentes` → `src/servicos` → `src/lib`. Serviço não importa `next/*` nem a apresentação; `src/lib` não importa serviço; a apresentação não importa `@/lib/prisma` nem `@/gerado`. É erro de lint e `tests/camadas.test.ts` prova. [[convencoes-gerais]]
- **Teste nunca usa rede real.** OpenRouter, Telegram e YouTube têm servidores falsos em `tests/apoio/`, com URL base por variável de ambiente. Rede real em teste o torna instável e gasta crédito.
- **Texto do modelo e do visitante é dado, não HTML.** Nunca `dangerouslySetInnerHTML` (o único uso é o script constante do tema em `src/app/layout.tsx`); conteúdo da base entra no prompt como dado, em bloco com marcador aleatório.
- **Erro para o visitante é frase única.** Rota pública não repassa código do provedor, pilha nem corpo de erro. [[interface/rotas]]
- **Toda página e rota do sistema tem guarda de acesso.** Um teste de arquitetura falha se faltar. Rota pública não lê sessão nem cookie.
- **Um processo de longa duração.** SQLite em arquivo, disco local, fila em memória e limitadores por processo não funcionam em função serverless nem com várias instâncias sem decisão nova.
- **Nada de fonte, script ou folha externa.** Fontes e CSS são locais; nenhum host externo, nem no build nem na execução.
