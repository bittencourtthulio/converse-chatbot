---
expx_schema: 1
expx_tool: buildx
kind: projeto
projeto_id: plataforma-chatbot-ia
titulo: Plataforma de chatbot com IA e base de conhecimento
modo: autonomo
criado_em: 2026-09-30
atualizado_em: 2026-09-30
etapa: b4
total_features: 11
features_entregues: 1
features_bloqueadas: 0
ciclos_recursao: 0
---

# Plataforma de chatbot com IA e base de conhecimento — Projeto

## Descrição original

> quero um chatbot com ia e integracao com o openrouter, telegram e chat embedado para colocar o script no meu projeto. ele precisa ter como eu subir arquivos e textos e videos para a base de conhecimento dele, interface amigavel e estilo saas padrao

Modo escolhido na pergunta única: **autônomo total**.

## O problema

Quem tem conteúdo próprio (documentos, textos, vídeos) não consegue colocar um
assistente que responda com base nele, em um site e no Telegram, sem programar o
pipeline de IA inteiro. Precisa alimentar a base por tela, escolher o modelo de
linguagem e publicar o assistente nos canais. A solução pedida ("um chatbot") é o
artefato; o requisito é atender com base no conteúdo próprio, sem código.

## O que foi pedido

- P-01 Um chatbot com IA que responde perguntas em linguagem natural.
- P-02 O modelo de linguagem é acessado pelo OpenRouter.
- P-03 O chatbot atende por um bot do Telegram.
- P-04 O chatbot atende por um chat embutido em site, colocado com um script.
- P-05 É possível subir arquivos para a base de conhecimento do chatbot.
- P-06 É possível subir textos para a base de conhecimento do chatbot.
- P-07 É possível subir vídeos para a base de conhecimento do chatbot.
- P-08 A interface é amigável.
- P-09 A interface segue o estilo de um SaaS padrão.

## O que foi descoberto

Interpretações do pedido (marcadas provisórias em `PREMISSAS.md`, viram pendência
`decisao_humana` no `RECURSAO.md`):

| Eixo | Requisito | Premissa |
|---|---|---|
| Interpretação | vários agentes por instalação, cada um com instruções, modelo e base própria | PR-01 |
| Interpretação | uma instalação, um workspace; sem cadastro público, planos ou cobrança | PR-02 |
| Interpretação | nome provisório "Converse", trocável por configuração | PR-03 |
| Interpretação | recuperação de trechos por busca textual (FTS5) | PR-04 |
| Interpretação | processamento de fontes em segundo plano dentro do próprio servidor | PR-05 |
| Interpretação | OpenRouter é o único provedor; chave única do workspace, modelo por agente | PR-06 |
| Interpretação | Telegram: um bot por agente, por webhook | PR-07 |
| Interpretação | chat embutido por script e iframe, com personalização básica | PR-08 |
| Interpretação | vídeo entra como transcrição de fala | PR-09 |
| Interpretação | formatos de arquivo aceitos e limites, sem OCR | PR-10 |
| Interpretação | arquivos guardados em disco local | PR-11 |
| L2 | papéis admin e usuário, verificados no servidor | PR-12 |
| L5 | toda entrada validada no servidor, inclusive tipo real e tamanho do upload | PR-13 |
| L6 | chave do OpenRouter e token do Telegram criptografados em repouso e nunca devolvidos ao navegador | PR-14 |
| L5, L17 | conteúdo recuperado tratado como dado, não como instrução; resposta honesta quando a base não cobre | PR-15 |
| L8 | limite de uso do endpoint público de chat e teto diário por agente | PR-16 |
| L7 | embed só em domínios permitidos; CORS e `frame-ancestors` coerentes | PR-17 |
| L10, L11, L13 | dado pessoal de visitante com retenção, exclusão de conversa e exclusão de conta | PR-18 |
| L12 | trilha de auditoria de ações críticas | PR-19 |
| L14 | backup e procedimento de restauração testado | PR-20 |
| L16, L17, L18, L19, L20 | log estruturado, erro com correlação, saúde, configuração validada no start | PR-21 |
| L17 | falha do provedor de IA tratada com mensagem clara e sem vazar detalhe | PR-22 |
| L26–L30 | design SaaS padrão sobre tokens semânticos, tema claro e escuro, três estados, responsivo, acessível | PR-23 |
| L21 | deploy reprodutível por contêiner com volume persistente; URL pública HTTPS | PR-24 |
| L25 | usuário e dados de demonstração | PR-25 |
| L22, L23, L24, L9 | TDD, lint, pipeline de verificação, auditoria de dependências | PR-26 |
| L1, L3, L4, L15, L32, L33, L34 | autenticação, painel inicial, cadastro de usuários, perfil e troca de senha | PR-27 |

## Considerado e descartado

| Eixo | Por que não se aplica |
|---|---|
| L31 Internacionalização | Interface só em português do Brasil; textos centralizados para facilitar depois. O agente responde no idioma de quem pergunta, por instrução, sem tradução da interface. |
| L19 Métrica e rastreamento distribuído | Desproporcional ao porte: um processo, um banco. Fica o mínimo: erro visível e log consultável (PR-21). |
| Trilha de auditoria de leitura | Desproporcional: registram-se só ações que alteram credencial, usuário, agente e canal (PR-19), não cada consulta. |

## Escopo mínimo

Um agente, com um modelo do OpenRouter, que responde com base em arquivos e textos
enviados, publicado como chat embutido por script. Vem antes de tudo: fundação,
agentes com OpenRouter, conversa de teste, arquivos e textos, respostas com a base e
o chat embutido. Telegram, vídeo, histórico, privacidade e operação vêm depois, na
ordem do mapa, e continuam no escopo.

## Critérios de aceite do ponto de vista do negócio

- Entro com a conta de demonstração, chego a um painel e a um menu de agentes.
- Crio um agente, escolho o modelo do OpenRouter e converso com ele no painel.
- Subo um arquivo (PDF, Word, texto), um texto colado e um vídeo, e vejo cada um passar de "processando" para "pronto".
- O agente responde com base no que subi e mostra de quais fontes tirou a resposta.
- Quando a base não cobre a pergunta, o agente diz que não sabe em vez de inventar.
- Copio um trecho de script, colo no meu site e o chat aparece e responde.
- Conecto um bot do Telegram ao agente e converso com ele pelo aplicativo.
- Leio as conversas dos visitantes e do Telegram, e apago uma conversa.
- Um administrador cadastra outro usuário, e essa pessoa entra e troca a própria senha.
- A interface funciona no celular e nos temas claro e escuro.
- Restauro um backup em uma instalação limpa e os dados voltam.

## Fora de escopo

- Cadastro público de contas, planos, cobrança e isolamento entre várias empresas (PR-02).
- Transferência para atendente humano, fila de tickets e SLA.
- Outros canais além do site e do Telegram (WhatsApp, Instagram, e-mail).
- Ajuste fino ou treinamento de modelo.
- Análise visual de imagens de vídeo e OCR de PDF escaneado.
- Busca semântica por embeddings vetoriais (PR-04).
- Voz, chamada telefônica e domínio próprio para o widget.
- Tradução da interface.

## Origem

**Veredito:** `docs/produto/pedidos/PD-2026-0001-plataforma-chatbot-ia/VEREDITO.md`
**Assinado por:** buildx (modo autonomo)
**Modo:** autonomo
