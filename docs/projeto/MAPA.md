---
expx_schema: 1
expx_tool: buildx
kind: mapa
projeto_id: plataforma-chatbot-ia
atualizado_em: 2026-09-30
total_features: 11
pendentes: 3
em_andamento: 1
entregues: 7
bloqueadas: 0
---

# Plataforma de chatbot com IA e base de conhecimento — Mapa de features

Ordem de dependência. Nenhuma feature precede aquilo de que depende. As seis primeiras
formam o escopo mínimo (agente com OpenRouter, base de arquivos e textos, respostas com
a base, chat embutido); as cinco seguintes completam o pedido e as premissas.

Como não há merge automático (regra 8 do buildx), cada branch de feature nasce da branch
da feature de que depende (PRs empilhados).

## Painel

| ID | Feature | Status | PR |
|---|---|---|---|
| FT-01 | Fundação e esqueleto de aplicação | entregue | local (branch feat/fundacao-e-esqueleto) |
| FT-02 | Agentes e chave do OpenRouter | entregue | local (branch feat/agentes-e-openrouter) |
| FT-03 | Conversa de teste com o agente | entregue | local (branch feat/conversa-de-teste) |
| FT-04 | Base de conhecimento: arquivos e textos | entregue | local (branch feat/conhecimento-arquivos-e-texto) |
| FT-05 | Respostas com base no conhecimento | entregue | local (branch feat/respostas-com-conhecimento) |
| FT-06 | Chat embutido por script | entregue | local (branch feat/chat-embutido) |
| FT-07 | Canal Telegram | entregue | local (branch feat/canal-telegram) |
| FT-08 | Base de conhecimento: vídeo | em_andamento | — |
| FT-09 | Histórico de conversas e painel | pendente | — |
| FT-10 | Privacidade e auditoria | pendente | — |
| FT-11 | Operação e backup | pendente | — |

---

### FT-01 — Fundação e esqueleto de aplicação

**Slug:** `fundacao-e-esqueleto` → `docs/fundacao-e-esqueleto/`
**Entrega:** o usuário entra com e-mail e senha numa interface no estilo de um SaaS, chega ao painel inicial e, pela área de Configurações, um admin cadastra outra conta que entra e troca a própria senha.
**Depende de:** []
**Paralelizável:** false
**Origem:** template
**Premissas que realiza:** [PR-02, PR-03, PR-12, PR-13, PR-16, PR-23, PR-25, PR-26, PR-27, PR-28, PR-29, PR-31, PR-32, PR-33, PR-34]
**Módulo disponível:** -
**Fatias candidatas:** -
**Status:** entregue
**Sprints:** 5 (21 tasks)
**Testes:** 184 (suíte inteira)
**PR:** local (branch feat/fundacao-e-esqueleto)

Trabalho: adaptar o template (nome, layout e tokens SaaS no lugar do VS Code, tema claro e escuro, tela de login), semear demonstração, limite de tentativas de login (PR-16, parte de login), regra de lint para a direção das camadas, pipeline de CI, `README`, verificar a suíte herdada e converter as convenções (`stackx-detectar`).

---

### FT-02 — Agentes e chave do OpenRouter

**Slug:** `agentes-e-openrouter` → `docs/agentes-e-openrouter/`
**Entrega:** o admin cadastra a chave do OpenRouter, e qualquer usuário cria, edita e exclui agentes escolhendo instruções, modelo, temperatura e mensagem inicial.
**Depende de:** [FT-01]
**Paralelizável:** false
**Origem:** descricao
**Premissas que realiza:** [PR-01, PR-06, PR-14]
**Módulo disponível:** -
**Fatias candidatas:** -
**Status:** entregue
**Sprints:** 6 (26 tasks)
**Testes:** 398 (suíte inteira)
**PR:** local (branch feat/agentes-e-openrouter)

---

### FT-03 — Conversa de teste com o agente

**Slug:** `conversa-de-teste` → `docs/conversa-de-teste/`
**Entrega:** o usuário conversa com um agente no painel e vê a resposta do modelo chegando em tempo real, com mensagem clara quando o provedor falha.
**Depende de:** [FT-02]
**Paralelizável:** false
**Origem:** descricao
**Premissas que realiza:** [PR-22]
**Módulo disponível:** -
**Fatias candidatas:** -
**Status:** entregue
**Sprints:** 7 (17 tasks)
**Testes:** 573 (suíte inteira)
**PR:** local (branch feat/conversa-de-teste)

---

### FT-04 — Base de conhecimento: arquivos e textos

**Slug:** `conhecimento-arquivos-e-texto` → `docs/conhecimento-arquivos-e-texto/`
**Entrega:** o usuário sobe arquivos (PDF, Word, texto, planilha CSV, HTML, JSON, legendas) e cola textos na base de um agente e acompanha cada fonte de "processando" até "pronto" ou o motivo do erro.
**Depende de:** [FT-02]
**Paralelizável:** false
**Origem:** descricao
**Premissas que realiza:** [PR-05, PR-10, PR-11, PR-13]
**Módulo disponível:** -
**Fatias candidatas:** -
**Status:** entregue
**Sprints:** 7 (37 tasks)
**Testes:** 891 (suíte inteira)
**PR:** local (branch feat/conhecimento-arquivos-e-texto)

---

### FT-05 — Respostas com base no conhecimento

**Slug:** `respostas-com-conhecimento` → `docs/respostas-com-conhecimento/`
**Entrega:** o agente responde a partir das fontes da própria base, mostra de quais fontes tirou a resposta e diz que não sabe quando a base não cobre a pergunta.
**Depende de:** [FT-03, FT-04]
**Paralelizável:** false
**Origem:** descricao
**Premissas que realiza:** [PR-04, PR-15, PR-30]
**Módulo disponível:** -
**Fatias candidatas:** -
**Status:** entregue
**Sprints:** 6 (22 tasks)
**Testes:** 1065 (suíte inteira)
**PR:** local (branch feat/respostas-com-conhecimento)

---

### FT-06 — Chat embutido por script

**Slug:** `chat-embutido` → `docs/chat-embutido/`
**Entrega:** o usuário copia um script de uma linha, cola em um site, e um visitante anônimo conversa com o agente por um botão flutuante, dentro dos domínios e dos limites de uso definidos.
**Depende de:** [FT-05]
**Paralelizável:** false
**Origem:** descricao
**Premissas que realiza:** [PR-08, PR-16, PR-17]
**Módulo disponível:** -
**Fatias candidatas:** -
**Status:** entregue
**Sprints:** 7 (28 tasks)
**Testes:** 1481 (suíte inteira)
**PR:** local (branch feat/chat-embutido)

---

### FT-07 — Canal Telegram

**Slug:** `canal-telegram` → `docs/canal-telegram/`
**Entrega:** o usuário conecta o token de um bot do Telegram a um agente e passa a conversar com esse agente pelo aplicativo.
**Depende de:** [FT-05]
**Paralelizável:** false
**Origem:** descricao
**Premissas que realiza:** [PR-07, PR-14, PR-16]
**Módulo disponível:** -
**Fatias candidatas:** -
**Status:** entregue
**Sprints:** 7 (20 tasks)
**Testes:** 1730 (suíte inteira)
**PR:** local (branch feat/canal-telegram)

---

### FT-08 — Base de conhecimento: vídeo

**Slug:** `conhecimento-em-video` → `docs/conhecimento-em-video/`
**Entrega:** o usuário sobe um vídeo ou áudio, ou cola um link do YouTube, e a fala vira uma fonte da base que o agente passa a usar.
**Depende de:** [FT-04]
**Paralelizável:** false
**Origem:** descricao
**Premissas que realiza:** [PR-09]
**Módulo disponível:** -
**Fatias candidatas:** -
**Status:** em_andamento

---

### FT-09 — Histórico de conversas e painel

**Slug:** `historico-de-conversas` → `docs/historico-de-conversas/`
**Entrega:** o usuário lê as conversas de todos os canais, filtra por agente e canal, vê as fontes de cada resposta, apaga uma conversa e vê no painel inicial os números de agentes, fontes e mensagens.
**Depende de:** [FT-06, FT-07]
**Paralelizável:** false
**Origem:** premissa
**Premissas que realiza:** [PR-18]
**Módulo disponível:** -
**Fatias candidatas:** -
**Status:** pendente

---

### FT-10 — Privacidade e auditoria

**Slug:** `privacidade-e-auditoria` → `docs/privacidade-e-auditoria/`
**Entrega:** o admin define por quantos dias as conversas ficam guardadas, exclui definitivamente um usuário da equipe e consulta o registro de quem alterou chave, usuários, agentes e canais.
**Depende de:** [FT-09]
**Paralelizável:** false
**Origem:** premissa
**Premissas que realiza:** [PR-18, PR-19]
**Módulo disponível:** -
**Fatias candidatas:** -
**Status:** pendente

---

### FT-11 — Operação e backup

**Slug:** `operacao-e-backup` → `docs/operacao-e-backup/`
**Entrega:** o operador sobe o sistema por contêiner numa máquina limpa, vê o estado de saúde numa tela de Configurações e gera e restaura um backup do banco e dos arquivos.
**Depende de:** [FT-10]
**Paralelizável:** false
**Origem:** premissa
**Premissas que realiza:** [PR-20, PR-21, PR-24]
**Módulo disponível:** -
**Fatias candidatas:** -
**Status:** pendente

---

<!--
A FT-01 É SEMPRE A FUNDAÇÃO. Nenhuma feature de negócio recria o que o P-9 entrega:
acrescenta item à barra lateral, não uma segunda área de configurações.

O QUE O B6 CONFERE: toda premissa do PREMISSAS.md aparece em "premissas que realiza"
de alguma feature. Conferência do B3: PR-01 a PR-34 cobertas. PR-21 e PR-24 em FT-11;
PR-30 em FT-05; PR-16 em FT-01 (login), FT-06 e FT-07.
-->
