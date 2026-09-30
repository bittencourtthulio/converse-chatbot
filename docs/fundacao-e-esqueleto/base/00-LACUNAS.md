# Lacunas

Uma linha por lacuna: o que se procurou, onde, e o que se concluiu.

1. Regra de lint de direção de camadas: procurada em `eslint.config.mjs` (só reexporta `eslint-config-next`); não existe. (camadas-e-lint)
2. Violação atual das camadas: `src/lib/sessao-servidor.ts` (camada lib) importa `@/servicos/autenticacao`; a convenção diz que `src/lib` não importa de `@/servicos`. Vira decisão na F2. (camadas-e-lint)
3. `APP_NAME`: procurado em `src/` e `.env.example`; não existe (o título `Converse` está fixo em `src/app/layout.tsx:5`). (ambiente-e-configuracao)
4. Cabeçalhos de segurança: procurados em `next.config.ts`; não existem. (ambiente-e-configuracao)
5. Pipeline de CI: procurado em `.github/`; a pasta não existe. (ambiente-e-configuracao)
6. README do projeto: o `README.md` atual é o do template do buildx e não descreve o produto. (ambiente-e-configuracao)
7. Limite de tentativas de login: procurado em `src/servicos/autenticacao.ts` e `src/app/acoes.ts`; não existe. (autenticacao-e-sessao)
8. Interface: `setup` ainda usa `db push` em `package.json:16` (o teste já usa `migrate deploy`); e a verificação visual em navegador não tem registro, com disponibilidade da ferramenta de navegador `NÃO DOCUMENTADO`. (interface-atual)
