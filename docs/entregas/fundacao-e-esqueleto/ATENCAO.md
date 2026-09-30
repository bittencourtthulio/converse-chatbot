---
expx_schema: 1
expx_tool: sprintx
kind: atencao
trabalho_id: fundacao-e-esqueleto
origem_buildx: plataforma-chatbot-ia
feature_id: FT-01
raio: null
olho_obrigatorio: 8
leitura_rapida: 33
dispensavel: 43
atualizado_em: 2026-09-30
---

# Atenção humana — fundacao-e-esqueleto

Sem modo legado e sem raio calculado: a classificação vem do tipo de arquivo. Segurança de acesso, limite de uso e cabeçalhos ficam em OLHO OBRIGATÓRIO; interface e configuração em LEITURA RÁPIDA; testes, estilos e documentos em DISPENSÁVEL, porque a suíte de 184 testes os exerce.

### OLHO OBRIGATÓRIO — ler linha a linha

- `eslint.config.mjs` — regra da direção das camadas; provada por tests/camadas.test.ts
- `next.config.ts` — cabeçalhos de segurança de toda resposta; coberto por tests/rotas.test.ts
- `src/app/(sistema)/configuracoes/usuarios/layout.tsx` — guarda de admin acima do carregamento (307 de verdade); coberto por tests/rotas.test.ts
- `src/app/acoes.ts` — ação de login chama o limite antes de autenticar; ação de troca de senha e admin intactas
- `src/app/sessao-servidor.ts` — movido de src/lib; guarda de sessão e de admin no servidor
- `src/lib/limite-de-uso.ts` — módulo de segurança reutilizado depois por chat público e Telegram; testes em tests/limite-de-uso.test.ts
- `src/lib/requisicao.ts` — decide em que IP confiar (X-Forwarded-For só com TRUST_PROXY=1); testes em tests/requisicao.test.ts
- `src/servicos/autenticacao.ts` — limite de tentativas de login: chave por IP e e-mail, 429 com mensagem; testes em tests/limite-de-login.test.ts

### LEITURA RÁPIDA — conferir intenção, não implementação

- `.env.example` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `.github/workflows/ci.yml` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `package.json` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/app/(sistema)/configuracoes/usuarios/LinhaDeUsuario.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/app/(sistema)/configuracoes/usuarios/loading.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/app/(sistema)/configuracoes/usuarios/page.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/app/(sistema)/error.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/app/(sistema)/layout.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/app/(sistema)/page.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/app/(sistema)/perfil/page.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/app/(sistema)/perfil/senha/page.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/app/entrar/page.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/app/layout.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/componentes/Alerta.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/componentes/AlternadorDeTema.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/componentes/Badge.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/componentes/BarraLateral.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/componentes/Cabecalho.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/componentes/CabecalhoDaPagina.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/componentes/CascaDoSistema.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/componentes/Esqueleto.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/componentes/EstadoVazio.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/componentes/Formulario.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/componentes/FormularioDeLogin.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/componentes/Icones.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/componentes/Logotipo.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/componentes/MenuDoUsuario.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/componentes/Navegacao.tsx` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/componentes/iniciais.ts` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/componentes/itens-de-menu.ts` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/lib/ambiente.ts` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `src/lib/erros.ts` — interface, configuração ou serviço já coberto por teste de rota ou de componente
- `vitest.config.ts` — interface, configuração ou serviço já coberto por teste de rota ou de componente

### DISPENSÁVEL — a máquina já provou

- `.gitignore` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `README.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/entregas/fundacao-e-esqueleto/ENTREGA.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/00-AUDITORIA.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/00-BLOQUEIOS.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/00-DECISOES.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/BRIEFING-BUILDX.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/FECHAMENTO.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/ORQUESTRADOR.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/VERIFICACAO-COPIA-LIMPA.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/VERIFICACAO-VISUAL.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/base/00-INDICE.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/base/00-LACUNAS.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/base/ambiente-e-configuracao.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/base/autenticacao-e-sessao.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/base/camadas-e-lint.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/base/interface-atual.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/base/testes-e-banco.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/sprint-01/tasks.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/sprint-02/tasks.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/sprint-03/tasks.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/sprint-04/tasks.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/fundacao-e-esqueleto/sprint-05/tasks.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/projeto/MAPA.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/projeto/PREMISSAS.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/projeto/PROJETO.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/projeto/RECURSAO.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/stack/CONVENCOES.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `docs/stack/LACUNAS.md` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `src/estilos/global.css` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `src/estilos/tokens.css` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `tests/ambiente.test.ts` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `tests/camadas.test.ts` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `tests/componentes.test.tsx` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `tests/iniciais.test.ts` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `tests/limite-de-login.test.ts` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `tests/limite-de-uso.test.ts` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `tests/menu.test.ts` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `tests/projeto.test.ts` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `tests/requisicao.test.ts` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `tests/rotas.test.ts` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `tests/seed.test.ts` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem
- `tests/tokens.test.ts` — teste, estilo ou documento; a suíte, o teste de tokens e o lint o exercem

