---
expx_schema: 1
expx_tool: sprintx
kind: fechamento
trabalho_id: chat-embutido
origem_buildx: plataforma-chatbot-ia
feature_id: FT-06
titulo: Chat embutido por script
tipo_trabalho: feature
fechado_em: 2026-09-30
modulo_afetado: [apresentacao, aplicacao, infraestrutura, banco, testes, documentacao]
arquivos_alterados: [".env.example", ".gitignore", "README.md", "docs/chat-embutido/00-AUDITORIA.md", "docs/chat-embutido/00-BLOQUEIOS.md", "docs/chat-embutido/00-DECISOES.md", "docs/chat-embutido/BRIEFING-BUILDX.md", "docs/chat-embutido/FECHAMENTO.md", "docs/chat-embutido/ORQUESTRADOR.md", "docs/chat-embutido/RELATORIO-FEATURE.md", "docs/chat-embutido/VERIFICACAO-VISUAL.md", "docs/chat-embutido/base/00-INDICE.md", "docs/chat-embutido/base/00-LACUNAS.md", "docs/chat-embutido/base/api-publica-e-limites.md", "docs/chat-embutido/base/configuracao-e-painel.md", "docs/chat-embutido/base/embed-e-csp.md", "docs/chat-embutido/base/widget-e-script.md", "docs/chat-embutido/sprint-01/fases.md", "docs/chat-embutido/sprint-01/sprint.md", "docs/chat-embutido/sprint-01/tasks.md", "docs/chat-embutido/sprint-02/fases.md", "docs/chat-embutido/sprint-02/sprint.md", "docs/chat-embutido/sprint-02/tasks.md", "docs/chat-embutido/sprint-03/fases.md", "docs/chat-embutido/sprint-03/sprint.md", "docs/chat-embutido/sprint-03/tasks.md", "docs/chat-embutido/sprint-04/fases.md", "docs/chat-embutido/sprint-04/sprint.md", "docs/chat-embutido/sprint-04/tasks.md", "docs/chat-embutido/sprint-05/fases.md", "docs/chat-embutido/sprint-05/sprint.md", "docs/chat-embutido/sprint-05/tasks.md", "docs/chat-embutido/sprint-06/fases.md", "docs/chat-embutido/sprint-06/sprint.md", "docs/chat-embutido/sprint-06/tasks.md", "docs/chat-embutido/sprint-07/fases.md", "docs/chat-embutido/sprint-07/sprint.md", "docs/chat-embutido/sprint-07/tasks.md", "docs/entregas/chat-embutido/ATENCAO.md", "docs/entregas/chat-embutido/ENTREGA.md", "docs/entregas/chat-embutido/PR.md", "docs/entregas/chat-embutido/QA-PACOTE.md", "docs/projeto/MAPA.md", "docs/projeto/PREMISSAS.md", "docs/projeto/PROJETO.md", "docs/projeto/RECURSAO.md", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "next.config.ts", "package-lock.json", "package.json", "prisma/migrations/20260930210000_configuracao_do_chat/migration.sql", "prisma/schema.prisma", "prisma/seed.ts", "src/app/(sistema)/agentes/[id]/publicar/loading.tsx", "src/app/(sistema)/agentes/[id]/publicar/page.tsx", "src/app/acoes.ts", "src/app/api/publico/agentes/[id]/config/route.ts", "src/app/api/publico/agentes/[id]/conversa/route.ts", "src/app/api/publico/agentes/[id]/conversar/route.ts", "src/app/api/publico/resposta.ts", "src/app/embed/[id]/not-found.tsx", "src/app/embed/[id]/page.tsx", "src/app/eventos-sse.ts", "src/app/widget.js/route.ts", "src/componentes/AvatarDoChat.tsx", "src/componentes/ChatEmbutido.tsx", "src/componentes/CodigoParaIncorporar.tsx", "src/componentes/FormularioDoChat.tsx", "src/componentes/PainelDePublicacao.tsx", "src/componentes/PreviaDoChat.tsx", "src/componentes/abas-do-agente.ts", "src/componentes/embed-logica.ts", "src/componentes/embed-mensagens.ts", "src/componentes/publicar-logica.ts", "src/estilos/global.css", "src/estilos/tokens.css", "src/lib/ambiente.ts", "src/lib/cor.ts", "src/lib/dominios-permitidos.ts", "src/proxy.ts", "src/servicos/chat-publico-config.ts", "src/servicos/chat-publico-limites.ts", "src/servicos/chat-publico.ts", "src/widget/widget.js", "tests/abas-do-agente.test.tsx", "tests/ajuda.ts", "tests/ambiente-dom.test.ts", "tests/ambiente.test.ts", "tests/apoio/dom.ts", "tests/apoio/publico.ts", "tests/apoio/servir-site-de-teste.ts", "tests/chat-embutido-ui.test.tsx", "tests/chat-publico-config-publica.test.ts", "tests/chat-publico-config.test.ts", "tests/chat-publico-limites.test.ts", "tests/chat-publico.test.ts", "tests/configuracao-do-chat-modelo.test.ts", "tests/cor.test.ts", "tests/dominios-permitidos.test.ts", "tests/embed-cabecalhos.test.ts", "tests/embed-logica.test.ts", "tests/embed-mensagens.test.ts", "tests/embed-pagina.test.ts", "tests/eventos-sse.test.ts", "tests/projeto.test.ts", "tests/publicar-acao.test.ts", "tests/publicar-logica.test.ts", "tests/publicar-rota.test.ts", "tests/publicar-ui.test.tsx", "tests/publico-config-rota.test.ts", "tests/publico-conversa-rota.test.ts", "tests/publico-conversar-rota.test.ts", "tests/rotas.test.ts", "tests/seed.test.ts", "tests/widget-interacao.test.ts", "tests/widget-montagem.test.ts", "tests/widget-rota.test.ts"]
palavras_chave: [widget, iframe, embed, cors, frame-ancestors, limite, visitante, proxy]
resumo: O usuário copia um script de uma linha na aba Publicar, cola em um site e um visitante anônimo conversa com o agente por um botão flutuante, só nos domínios permitidos e dentro dos limites de uso.
decisao_principal: "D-09 e D-05: o frame-ancestors da página do iframe é dinâmico por agente, definido por src/proxy.ts, e a restrição de domínio vale por frame-ancestors e pelo CORS do config, não pela Origin do POST (a chamada parte do iframe, da própria plataforma)"
risco_residual: O widget não foi visto a 375 px nem em site com HTTPS ou CSP própria; o limite por minuto é em memória e sem TRUST_PROXY=1 os visitantes dividem um IP; o proxy.ts consulta o banco a cada carregamento de /embed; o comportamento do modelo real diante do prompt continua não testável; os testes de rota usam o .next que existir (rodar npm run build antes).
testes_adicionados: 416
---

# Fechamento — chat-embutido

## O que foi entregue

Configuração do chat por agente (tabela própria), API pública sem sessão (config, conversar em SSE, conversa), limites de uso com teto diário, `widget.js` em Shadow DOM, página `/embed/[id]` com `frame-ancestors` dinâmico, aba Publicar com prévia ao vivo e código para incorporar, e o agente de exemplo da seed já publicado.

## Decisão principal

O `frame-ancestors` depende do agente e a página do App Router não define cabeçalho de resposta: o `src/proxy.ts` (Next 16, runtime Node) o define conforme a lista de domínios (vazia libera qualquer site; inativo, inexistente ou falha, só `'self'`), e o `X-Frame-Options: DENY` sai só de `/embed`. Como a chamada de chat parte do iframe, a restrição de domínio é garantida pelo navegador (`frame-ancestors`) e pelo CORS do `config`; o POST só barra `Origin` de navegador vinda de outro site.

## Risco residual

Widget não visto a 375 px nem em site com HTTPS ou CSP própria; limite por minuto em memória; consulta ao banco por carregamento do iframe; modelo real não testável; testes de rota dependem de `npm run build`.

## Onde isto mexeu

Apresentação (`src/app/api/publico`, `src/app/embed`, `src/app/widget.js`, `src/app/(sistema)/agentes/[id]/publicar`, `src/componentes`, `src/estilos`), aplicação (`src/servicos/chat-publico*.ts`), infraestrutura (`src/proxy.ts`, `src/lib/cor.ts`, `src/lib/dominios-permitidos.ts`, `src/lib/ambiente.ts`, `next.config.ts`, `src/widget/widget.js`), banco (uma migration aditiva), testes e documentação. Dependência nova: `happy-dom` (devDependência, versão fixa).
