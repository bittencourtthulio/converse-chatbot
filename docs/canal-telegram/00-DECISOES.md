---
expx_schema: 1
expx_tool: sprintx
kind: decisoes
trabalho_id: canal-telegram
origem_buildx: plataforma-chatbot-ia
feature_id: FT-07
respondido_por: buildx
densidade: padrao
modo_construcao: autonomo
atualizado_em: 2026-09-30
decisoes:
  - id: D-00
    decisao: "densidade padrao, construcao autonomo"
    alternativa_descartada: "densidade mvp ou profundo"
    motivo: "respondido por buildx; PR-35 e PROJETO.md (Modo escolhido)"
    status: fechada
    bloqueante: false
  - id: D-01
    decisao: "modelos CanalTelegram e AtualizacaoTelegram por migration que so acrescenta; updateId como texto; botId unico; dedupe por insert-primeiro; purga de 7 dias oportunista"
    alternativa_descartada: "dedupe por leitura previa; inteiro para update_id"
    motivo: "(HIPOTESE) PR-63; base/dados-segredo-e-ambiente.md (update_id sem teto documentado; migrations so acrescentam)"
    status: fechada
    bloqueante: false
  - id: D-02
    decisao: "adaptador src/lib/telegram.ts com TELEGRAM_API_BASE, erros por texto fixo, redacao do token em ponto unico, prazo de 10 s, retry_after respeitado uma vez, divisao em 4096"
    alternativa_descartada: "repassar description do Telegram ao usuario"
    motivo: "(HIPOTESE) PR-64; PR-14 e PR-22; base/telegram-bot-api.md (token na URL)"
    status: fechada
    bloqueante: false
  - id: D-03
    decisao: "conectar valida formato, getMe, segredo de 32 bytes em hex, setWebhook com allowed_updates message, grava cifrado e hash; exige APP_URL HTTPS; excecao TELEGRAM_PERMITIR_URL_NAO_HTTPS fora de producao"
    alternativa_descartada: "gravar segredo em claro; aceitar HTTP"
    motivo: "(HIPOTESE) PR-65; PR-14; base/telegram-bot-api.md (secret_token 1-256 [A-Za-z0-9_-], webhook HTTPS)"
    status: fechada
    bloqueante: false
  - id: D-04
    decisao: "pausar mantem o webhook e ignora updates com 200; desconectar tenta deleteWebhook e apaga canal, token, segredo; historico mantido; botId duplicado recusado; reconectar gira o segredo"
    alternativa_descartada: "pausar com deleteWebhook (impossivel retomar sem o segredo em claro)"
    motivo: "(HIPOTESE) PR-65; PR-18 (conversas mantidas)"
    status: fechada
    bloqueante: false
  - id: D-05
    decisao: "servico src/servicos/canal-telegram.ts (conectar, desconectar, pausar, retomar, estado, verificar, definirLimiteDiario, aoAlterarCanal) e src/servicos/telegram-webhook.ts (autenticar e processar update); qualquer usuario autenticado gerencia"
    alternativa_descartada: "logica no handler; so admin"
    motivo: "(HIPOTESE) PR-65; PR-12; CONVENCOES secao 5 (handler fino, servico sem next)"
    status: fechada
    bloqueante: false
  - id: D-06
    decisao: "webhook: segredo em tempo constante contra hash; canal inexistente ou segredo errado dao 401 igual; pausado 200 mudo; corpo ate 64 KB; resposta 200 e processamento em after() com captura de erro"
    alternativa_descartada: "404 para canal inexistente (revela existencia)"
    motivo: "(HIPOTESE) PR-66; base/rotas-painel-e-testes.md (after.md); briefing item 5"
    status: fechada
    bloqueante: false
  - id: D-07
    decisao: "so texto de chat privado; grupos, canais e edited_message ignorados; mensagem nao textual recebe aviso; /start usa mensagemInicial; /novo e /reiniciar abrem conversa vazia"
    alternativa_descartada: "atender grupos"
    motivo: "(HIPOTESE) PR-67; briefing item 5 (grupos ignorados, registrar como premissa)"
    status: fechada
    bloqueante: false
  - id: D-08
    decisao: "resposta em texto puro sem parse_mode, [n] mantidos e linha 'Fontes: ...' so com titulos citados; falha do provedor responde mensagemParaVisitante; indicador digitando renovado a cada 4 s durante a geracao"
    alternativa_descartada: "parse_mode Markdown"
    motivo: "(HIPOTESE) PR-67; PR-22 e PR-42 (mensagemParaVisitante); base/turno-e-limites.md (evento fontes)"
    status: fechada
    bloqueante: false
  - id: D-09
    decisao: "conversa criada pelo servico do canal com titulo 'Telegram: Nome' (conversas.criar ganha titulo opcional) e passada a responderMensagem por conversaId; so o nome publico e gravado"
    alternativa_descartada: "titulo da primeira mensagem"
    motivo: "(HIPOTESE) PR-67; PR-18; base/turno-e-limites.md (criar so deriva titulo da primeira mensagem)"
    status: fechada
    bloqueante: false
  - id: D-10
    decisao: "limites: 10/min por chat (criarLimitador), 60 por conversa, teto diario contado no banco com exigirTetoDiario parametrizado por canal; resposta amigavel; exclusao mutua por chat em memoria"
    alternativa_descartada: "limite so por IP"
    motivo: "(HIPOTESE) PR-68; PR-16, PR-57; base/turno-e-limites.md (limites presos ao widget)"
    status: fechada
    bloqueante: false
  - id: D-11
    decisao: "aba Canais com lista de cartoes extensivel e cartao Telegram; token nunca devolvido; aviso e Conectar desabilitado sem APP_URL HTTPS; acoes por Server Actions"
    alternativa_descartada: "rota de API para as acoes"
    motivo: "(HIPOTESE) PR-69; PR-14, PR-23; CONVENCOES secao 5 (aba do agente, acao de formulario)"
    status: fechada
    bloqueante: false
  - id: D-12
    decisao: "variaveis TELEGRAM_API_BASE e TELEGRAM_PERMITIR_URL_NAO_HTTPS em ambiente.ts, .env.example e README; simulado tests/apoio/telegram-falso.ts com dispararUpdate; verificacao de producao com APP_URL HTTPS de fachada"
    alternativa_descartada: "chamar o Telegram real em teste"
    motivo: "(HIPOTESE) PR-70; PR-26; CONVENCOES secao 3 (HTTP de saida simulado)"
    status: fechada
    bloqueante: false
  - id: D-13
    decisao: "a FT-07 nao depende funcionalmente da FT-06; a branch empilha sobre feat/chat-embutido so para evitar conflito em abas-do-agente.ts, ambiente.ts, .env.example, next.config.ts, proxy.ts e chat-publico*"
    alternativa_descartada: "base feat/respostas-com-conhecimento"
    motivo: "pedido do laco B4; MAPA.md (Depende de [FT-05]); registrado no ENTREGA.md"
    status: fechada
    bloqueante: false
---

# Decisões — canal-telegram

Respondidas pelo buildx em modo autônomo, na ordem PROJETO.md, PREMISSAS.md, CONVENCOES.md e, sem resposta, premissa nova (PR-63 a PR-70, `origem: f2_autonoma`). Nenhuma regra de negócio ficou sem resposta: nenhum bloqueio.

Decisões D-01 a D-13 estão no frontmatter, uma por linha. Pontos de interface: o limite diário padrão (500) e a mensagem de excesso seguem o chat embutido (PR-57) para a empresa ter um só critério.
