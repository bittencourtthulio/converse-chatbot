---
expx_schema: 1
expx_tool: sprintx
kind: fechamento
trabalho_id: canal-telegram
origem_buildx: plataforma-chatbot-ia
feature_id: FT-07
titulo: Canal Telegram
tipo_trabalho: feature
fechado_em: 2026-09-30
modulo_afetado: [apresentacao, aplicacao, infraestrutura, banco, testes, documentacao]
arquivos_alterados: [".env.example", "README.md", "docs/canal-telegram/00-AUDITORIA.md", "docs/canal-telegram/00-BLOQUEIOS.md", "docs/canal-telegram/00-DECISOES.md", "docs/canal-telegram/BRIEFING-BUILDX.md", "docs/canal-telegram/FECHAMENTO.md", "docs/canal-telegram/ORQUESTRADOR.md", "docs/canal-telegram/RELATORIO-FEATURE.md", "docs/canal-telegram/VERIFICACAO-VISUAL.md", "docs/canal-telegram/base/00-INDICE.md", "docs/canal-telegram/base/00-LACUNAS.md", "docs/canal-telegram/base/dados-segredo-e-ambiente.md", "docs/canal-telegram/base/rotas-painel-e-testes.md", "docs/canal-telegram/base/telegram-bot-api.md", "docs/canal-telegram/base/turno-e-limites.md", "docs/canal-telegram/sprint-01/fases.md", "docs/canal-telegram/sprint-01/sprint.md", "docs/canal-telegram/sprint-01/tasks.md", "docs/canal-telegram/sprint-02/fases.md", "docs/canal-telegram/sprint-02/sprint.md", "docs/canal-telegram/sprint-02/tasks.md", "docs/canal-telegram/sprint-03/fases.md", "docs/canal-telegram/sprint-03/sprint.md", "docs/canal-telegram/sprint-03/tasks.md", "docs/canal-telegram/sprint-04/fases.md", "docs/canal-telegram/sprint-04/sprint.md", "docs/canal-telegram/sprint-04/tasks.md", "docs/canal-telegram/sprint-05/fases.md", "docs/canal-telegram/sprint-05/sprint.md", "docs/canal-telegram/sprint-05/tasks.md", "docs/canal-telegram/sprint-06/fases.md", "docs/canal-telegram/sprint-06/sprint.md", "docs/canal-telegram/sprint-06/tasks.md", "docs/canal-telegram/sprint-07/fases.md", "docs/canal-telegram/sprint-07/sprint.md", "docs/canal-telegram/sprint-07/tasks.md", "docs/entregas/canal-telegram/ATENCAO.md", "docs/entregas/canal-telegram/ENTREGA.md", "docs/entregas/canal-telegram/PR.md", "docs/entregas/canal-telegram/QA-PACOTE.md", "docs/projeto/MAPA.md", "docs/projeto/PREMISSAS.md", "docs/projeto/PROJETO.md", "docs/projeto/RECURSAO.md", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "prisma/migrations/20260930220000_canal_telegram/migration.sql", "prisma/schema.prisma", "src/app/(sistema)/agentes/[id]/canais/loading.tsx", "src/app/(sistema)/agentes/[id]/canais/page.tsx", "src/app/acoes.ts", "src/app/api/telegram/[agenteId]/webhook/route.ts", "src/componentes/CartaoTelegram.tsx", "src/componentes/abas-do-agente.ts", "src/componentes/canais-logica.ts", "src/componentes/canais.ts", "src/estilos/global.css", "src/lib/ambiente.ts", "src/lib/exclusao-mutua.ts", "src/lib/telegram.ts", "src/servicos/canal-telegram.ts", "src/servicos/chat-publico-limites.ts", "src/servicos/conversas.ts", "src/servicos/telegram-atendimento.ts", "src/servicos/telegram-limites.ts", "src/servicos/telegram-webhook.ts", "tests/abas-do-agente.test.tsx", "tests/ajuda.ts", "tests/ambiente.test.ts", "tests/apoio/servidor.ts", "tests/apoio/servir-telegram-falso.ts", "tests/apoio/telegram-falso.ts", "tests/canais-logica.test.ts", "tests/canais-ui.test.tsx", "tests/canal-telegram-ciclo.test.ts", "tests/canal-telegram-conectar.test.ts", "tests/canal-telegram-modelo.test.ts", "tests/chat-publico-limites.test.ts", "tests/conversas.test.ts", "tests/exclusao-mutua.test.ts", "tests/projeto.test.ts", "tests/publicar-rota.test.ts", "tests/rotas.test.ts", "tests/telegram-acoes.test.ts", "tests/telegram-comandos.test.ts", "tests/telegram-envio.test.ts", "tests/telegram-falso.test.ts", "tests/telegram-limites.test.ts", "tests/telegram-resposta.test.ts", "tests/telegram-token-nao-vaza.test.ts", "tests/telegram-webhook-base.test.ts", "tests/telegram-webhook-rota.test.ts", "tests/telegram.test.ts"]
palavras_chave: [telegram, webhook, bot, token, canal, dedupe, limite, segredo]
resumo: O usuário conecta o token de um bot do Telegram a um agente na aba Canais e passa a conversar com esse agente pelo aplicativo, por webhook, com token cifrado, segredo em hash, dedupe e limites.
decisao_principal: "D-06 e D-03: o webhook autentica pelo segredo em tempo constante contra o hash, responde 200 logo e atende em after(); o token vai na URL do Telegram, então o adaptador nunca repassa texto de erro e redige o token em ponto único"
risco_residual: O Telegram real nunca foi chamado (só o simulado); um reinício entre o 200 e a resposta perde aquela atualização e mensagens na pausa não são atendidas depois; limite por chat, exclusão mútua e purga são por processo; a aba Canais não foi vista a 375 px.
testes_adicionados: 249
---

# Fechamento — canal-telegram

## O que foi entregue

Tabelas `canais_telegram` e `atualizacoes_telegram`, o adaptador `src/lib/telegram.ts`, o simulado `tests/apoio/telegram-falso.ts`, o serviço do canal (conectar, desconectar, pausar, retomar, verificar, limite diário), o webhook `POST /api/telegram/[agenteId]/webhook`, o atendimento (comandos, resposta com fontes em texto puro, limites, exclusão mútua por chat) e a aba Canais com o cartão do Telegram.

## Decisão principal

O Telegram reenvia o update se a resposta demorar e o turno do modelo leva segundos: o webhook autentica, deduplica e responde 200, e o atendimento roda em `after()`. Como o token vai no caminho da URL do Telegram, o adaptador constrói todo erro de texto fixo e descarta o erro original; o segredo do webhook só existe em hash SHA-256.

## Risco residual

Telegram real nunca chamado; atualização perdida num reinício entre o 200 e a resposta; mensagens na pausa não atendidas depois; limites e exclusão mútua por processo; aba Canais não vista a 375 px.

## Onde isto mexeu

Apresentação (`src/app/api/telegram`, `src/app/(sistema)/agentes/[id]/canais`, `src/app/acoes.ts`, `src/componentes`, `src/estilos`), aplicação (`src/servicos/canal-telegram.ts`, `telegram-webhook.ts`, `telegram-atendimento.ts`, `telegram-limites.ts`), infraestrutura (`src/lib/telegram.ts`, `src/lib/exclusao-mutua.ts`, `src/lib/ambiente.ts`), banco (uma migration aditiva), testes e documentação. Nenhuma dependência nova.
