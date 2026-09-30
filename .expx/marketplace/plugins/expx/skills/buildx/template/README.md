# O template do buildx

O esqueleto que todo projeto criado pelo buildx recebe no **B2**: um sistema
que sobe, testa e já traz o P-9 implementado — painel, cadastro de usuários,
perfil e troca de senha.

Não é um exemplo nem uma referência para copiar à mão. É o ponto de partida
literal: o B2 copia esta pasta para a raiz do projeto novo e segue dali.

## O que já vem pronto

| Camada | Conteúdo |
|---|---|
| Configuração | `package.json`, TypeScript estrito, ESLint, Vitest, `.env.example` |
| Banco | SQLite via Prisma, migration inicial versionada, seed de demonstração |
| Autenticação | e-mail e senha, hash bcrypt, sessão JWT em cookie `httpOnly`, papéis `admin` e `usuario` |
| Interface | tokens do VS Code (Dark+ e Light+), layout de regiões, alternador de tema |
| P-9 | painel `/`, `/configuracoes/usuarios`, `/perfil`, `/perfil/senha` |
| Testes | 61, cobrindo os serviços e as rotas com o servidor de pé |

## Como rodar

```bash
npm install
cp .env.example .env    # e preencha JWT_SECRET
npm run setup           # generate + migrate + seed
npm run dev
```

Contas de demonstração — fictícias, criadas pela seed, que **não roda em
produção**:

```
admin@exemplo.local     demo1234    administrador
usuario@exemplo.local   demo1234    usuário comum
```

## Os comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | sobe em desenvolvimento |
| `npm run build` | build de produção |
| `npm test` | a suíte inteira |
| `npm run lint` | ESLint |
| `npm run setup` | prepara o banco do zero |
| `npm run db:seed` | só a seed |

## O que este template não traz, de propósito

**Nenhuma entidade de domínio.** O modelo tem `Usuario` e nada mais. As
entidades do projeto nascem nas features do B4, planejadas pelo sprintx sob
TDD. Um template que já trouxesse "Cliente" ou "Produto" estaria decidindo o
negócio, e isso não é dele.

**Nenhum item extra na barra lateral.** A navegação tem Painel, Usuários e
Meu perfil. As features acrescentam os seus — não recriam a área de
Configurações.

**O painel vem vazio.** Título e subtítulo, e o corpo dizendo que ainda não
há o que mostrar. É o B4 que o preenche.

## As decisões que valem conhecer

**A troca de senha derruba as outras sessões.** O usuário tem
`sessoesValidasDesde`; a troca move esse instante para frente, e todo token
emitido antes deixa de valer. Quem trocou recebe um token novo e continua na
sessão. Sem isso, uma sessão sequestrada sobrevive à troca de senha — que é
justamente a ação que a vítima toma para se defender.

**O sistema nunca fica sem administrador.** Rebaixar ou desativar o último
admin ativo é recusado com 409. Admin desativado não conta como o outro.

**Desativar não apaga.** Um usuário apagado levaria junto o rastro do que
fez. A exclusão de verdade, quando o projeto precisar dela, é a feature de
LGPD, com o cuidado que ela exige.

**O controle de acesso é no servidor.** `exigirUsuarioAdmin` roda antes da
página; esconder o item do menu é conveniência, não controle. Há teste que
prova isso pedindo a rota com sessão de usuário comum.

**O e-mail é normalizado antes de validado.** `"  ALGUEM@X.LOCAL  "` é o
mesmo e-mail que `alguem@x.local`. Recusá-lo seria um defeito de
usabilidade disfarçado de validação.

## Manutenção

Este template é copiado para todo projeto novo. Se ele quebrar, todo projeto
nasce quebrado — por isso o `.github/workflows/template.yml` roda, a cada
mudança e toda segunda-feira: instala, migra, semeia, linta, checa tipos,
builda, testa e **audita as dependências**, falhando em vulnerabilidade
`high` ou acima.

Ao atualizar dependência: rode o ciclo inteiro numa cópia limpa antes de
commitar. O critério é o mesmo do B2 — instalar, build, teste, lint, e o
projeto sobe. Quatro verificações binárias; três não bastam.
