---
expx_schema: 1
expx_tool: sprintx
kind: fechamento
trabalho_id: fundacao-e-esqueleto
origem_buildx: plataforma-chatbot-ia
feature_id: FT-01
titulo: Fundacao e esqueleto de aplicacao
tipo_trabalho: feature
fechado_em: 2026-09-30
modulo_afetado: [apresentacao, aplicacao, infraestrutura, testes, pipeline, documentacao]
arquivos_alterados: [.env.example, .github/workflows/ci.yml, .gitignore, README.md, docs/projeto/MAPA.md, docs/projeto/PREMISSAS.md, docs/stack/CONVENCOES.md, docs/stack/LACUNAS.md, eslint.config.mjs, next.config.ts, package.json, src/app/(sistema)/configuracoes/usuarios/LinhaDeUsuario.tsx, src/app/(sistema)/configuracoes/usuarios/layout.tsx, src/app/(sistema)/configuracoes/usuarios/loading.tsx, src/app/(sistema)/configuracoes/usuarios/page.tsx, src/app/(sistema)/error.tsx, src/app/(sistema)/layout.tsx, src/app/(sistema)/page.tsx, src/app/(sistema)/perfil/page.tsx, src/app/(sistema)/perfil/senha/page.tsx, src/app/acoes.ts, src/app/entrar/page.tsx, src/app/layout.tsx, src/app/sessao-servidor.ts, src/componentes/Alerta.tsx, src/componentes/AlternadorDeTema.tsx, src/componentes/Badge.tsx, src/componentes/BarraLateral.tsx, src/componentes/Cabecalho.tsx, src/componentes/CabecalhoDaPagina.tsx, src/componentes/CascaDoSistema.tsx, src/componentes/Esqueleto.tsx, src/componentes/EstadoVazio.tsx, src/componentes/Formulario.tsx, src/componentes/FormularioDeLogin.tsx, src/componentes/Icones.tsx, src/componentes/Logotipo.tsx, src/componentes/MenuDoUsuario.tsx, src/componentes/Navegacao.tsx, src/componentes/iniciais.ts, src/componentes/itens-de-menu.ts, src/estilos/global.css, src/estilos/tokens.css, src/lib/ambiente.ts, src/lib/erros.ts, src/lib/limite-de-uso.ts, src/lib/requisicao.ts, src/servicos/autenticacao.ts, tests/ambiente.test.ts, tests/camadas.test.ts, tests/componentes.test.tsx, tests/iniciais.test.ts, tests/limite-de-login.test.ts, tests/limite-de-uso.test.ts, tests/menu.test.ts, tests/projeto.test.ts, tests/requisicao.test.ts, tests/rotas.test.ts, tests/seed.test.ts, tests/tokens.test.ts, vitest.config.ts]
palavras_chave: [saas, tokens, tema, login, limite-de-uso, cabecalhos, camadas, ci]
resumo: O sistema entra num layout de SaaS com tema claro e escuro, limita tentativas de login, envia cabecalhos de seguranca e impoe a direcao das camadas por lint.
decisao_principal: "D-09: modulo src/lib/limite-de-uso.ts com janela deslizante e relogio injetavel, reutilizavel pelo chat publico e pelo Telegram"
risco_residual: O limite de uso vale por processo e em memoria; a verificacao visual a 375px foi feita sem JavaScript nos quadros, e o menu do usuario e a mensagem de excesso de login nao foram acionados em navegador.
testes_adicionados: 123
---

# Fechamento — fundacao-e-esqueleto

## O que foi entregue

O esqueleto herdado do template ganhou cara de SaaS (barra lateral, cabeçalho, menu do usuário, gaveta no celular, temas claro e escuro sem piscar), nome do produto por `APP_NAME`, limite de tentativas de login sobre um módulo de limite de uso reutilizável, cabeçalhos de segurança, regra de lint da direção das camadas, pipeline de CI, README, seed verificada e convenções convertidas em evidência.

## Decisão principal

D-09: o limite de uso mora em `src/lib/limite-de-uso.ts` (janela deslizante, `criarLimitador` com relógio injetável, `verificarLimite(chave, {max, janelaMs})`), e as features do chat público e do Telegram apenas o reutilizam.

## Risco residual

O limite vale por processo e em memória (PR-36); com mais de uma instância deixa de ser global. A verificação visual a 375px usou quadros sem JavaScript, e o menu do usuário e a mensagem de excesso de tentativas de login não foram acionados em navegador (têm teste automatizado, não visual).

## Onde isto mexeu

Camadas de apresentação (`src/app`, `src/componentes`, `src/estilos`), aplicação (`src/servicos/autenticacao.ts`), infraestrutura (`src/lib`), testes, pipeline (`.github`), configuração (`eslint.config.mjs`, `next.config.ts`, `package.json`) e documentação (`README.md`, `docs/stack`, `docs/projeto`).
