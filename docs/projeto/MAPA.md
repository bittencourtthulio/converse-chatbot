---
expx_schema: 1
expx_tool: buildx
kind: mapa
projeto_id: plataforma-chatbot-ia
atualizado_em: 2026-10-01
total_features: 14
pendentes: 0
em_andamento: 1
entregues: 13
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
| FT-08 | Base de conhecimento: vídeo | entregue | local (branch feat/conhecimento-em-video) |
| FT-09 | Histórico de conversas e painel | entregue | local (branch feat/historico-de-conversas) |
| FT-10 | Privacidade e auditoria | entregue | local (branch feat/privacidade-e-auditoria) |
| FT-11 | Operação e backup | entregue | local (branch feat/operacao-e-backup) |
| FT-12 | Sessão e acesso endurecidos | entregue | local (branch feat/sessao-e-acesso-endurecidos) |
| FT-13 | Robustez de mídia, upload e operação | em_andamento | local (branch feat/robustez-de-midia-e-operacao) |
| FT-14 | Design da referência e landing pública | entregue | local (branch feat/design-referencia-e-landing) |

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
**Status:** entregue
**Sprints:** 7 (31 tasks)
**Testes:** 2010 (suíte inteira)
**PR:** local (branch feat/conhecimento-em-video)

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
**Status:** entregue
**Sprints:** 6 (24 tasks)
**Testes:** 2251 (suíte inteira)
**PR:** local (branch feat/historico-de-conversas)

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
**Status:** entregue
**Sprints:** 7 (28 tasks)
**Testes:** 2544 (suíte inteira)
**PR:** local (branch feat/privacidade-e-auditoria)

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
**Status:** entregue
**Sprints:** 8 (38 tasks)
**Testes:** 2863 (suíte inteira)
**PR:** local (branch feat/operacao-e-backup)

---

### FT-12 — Sessão e acesso endurecidos

**Slug:** `sessao-e-acesso-endurecidos` → `docs/sessao-e-acesso-endurecidos/`
**Entrega:** o usuário que sai tem a sessão encerrada de fato, quem usa o sistema continua logado sem ser derrubado a cada 15 minutos, o login logo depois de trocar a senha funciona, e o excesso de tentativas de login e de leituras públicas é barrado, tudo provado por teste.
**Depende de:** [FT-11]
**Paralelizável:** false
**Origem:** recursao
**Premissas que realiza:** [PR-12, PR-16, PR-27, PR-31, PR-36, PR-56]
**Módulo disponível:** -
**Fatias candidatas:** -
**Status:** entregue
**Sprints:** 6 (26 tasks)
**Testes:** 2993 (suíte inteira)
**PR:** local (branch feat/sessao-e-acesso-endurecidos)

Vem do B6 (ciclo 2): `docs/projeto/validacao/premissas-01-34.md` (A-01, A-02, A-04, R-01 a R-03), `premissas-35-70.md` (achados 1 e 4) e `sistema-de-pe.md` (A-1). Premissas de segurança com evidência parcial não podem sair como pendência aceita.

---

### FT-13 — Robustez de mídia, upload e operação

**Slug:** `robustez-de-midia-e-operacao` → `docs/robustez-de-midia-e-operacao/`
**Entrega:** o usuário envia vídeo com trechos sem fala e documentos grandes sem derrubar a fonte nem o servidor, o operador só restaura um backup com o servidor parado mesmo em outro contêiner, e o que as premissas prometem de interface, correlação e proteção está provado por teste.
**Depende de:** [FT-12]
**Paralelizável:** false
**Origem:** recursao
**Premissas que realiza:** [PR-09, PR-19, PR-23, PR-26, PR-44, PR-45, PR-85, PR-93, PR-98]
**Módulo disponível:** -
**Fatias candidatas:** -
**Status:** em_andamento

Vem do B6 (ciclo 2): `premissas-71-100.md` (PR-93, PR-85, PR-98), `premissas-35-70.md` (PR-44, PR-45), `premissas-01-34.md` (A-03, R-03), `pedido-aceite-entregas.md` (A-03) e a lacuna 13 de `docs/stack/LACUNAS.md`.

---

### FT-14 — Design da referência e landing pública

**Slug:** `design-referencia-e-landing` → `docs/design/`
**Entrega:** o app inteiro, nos temas claro e escuro, segue a nova direção visual (zinc, primário quase preto, azul no acento, bordas finas, Geist e Inter locais), e quem não tem sessão vê em `/` uma landing pública em português do Brasil, sem cadastro e sem afirmação que o produto não cumpre, tudo provado por teste e por capturas de tela.
**Depende de:** [FT-12]
**Paralelizável:** false
**Origem:** descricao (pedido do usuário depois da entrega)
**Premissas que realiza:** [PR-113, PR-114]
**Módulo disponível:** -
**Fatias candidatas:** -
**Status:** entregue
**Testes:** 3127 (3118 passaram e 9 pulam sem ffmpeg ou rede) (suíte inteira)
**PR:** local (branch feat/design-referencia-e-landing)

Nasce da branch `feat/design-referencia-e-landing`, aberta a partir da pilha de features com a FT-13 pausada; por isso depende da FT-12 e não da FT-13. Detalhes em `docs/design/DECISOES.md` e `docs/design/VERIFICACAO.md`.

---

<!--
A FT-01 É SEMPRE A FUNDAÇÃO. Nenhuma feature de negócio recria o que o P-9 entrega:
acrescenta item à barra lateral, não uma segunda área de configurações.

O QUE O B6 CONFERE: toda premissa do PREMISSAS.md aparece em "premissas que realiza"
de alguma feature. Conferência do B3: PR-01 a PR-34 cobertas. PR-21 e PR-24 em FT-11;
PR-30 em FT-05; PR-16 em FT-01 (login), FT-06 e FT-07.
-->
