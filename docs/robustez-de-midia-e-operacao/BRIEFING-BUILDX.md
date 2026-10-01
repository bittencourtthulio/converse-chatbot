---
expx_schema: 1
expx_tool: sprintx
kind: briefing
trabalho_id: robustez-de-midia-e-operacao
origem_buildx: plataforma-chatbot-ia
feature_id: FT-13
criado_em: 2026-10-01
atualizado_em: 2026-10-01
---

# Briefing do buildx — FT-13 Robustez de mídia, upload e operação

## Problema

O usuário envia vídeo com trechos sem fala e documentos grandes sem derrubar a fonte nem o servidor, o operador só restaura um backup com o servidor parado mesmo em outro contêiner, e o que as premissas prometem de interface, correlação e proteção está provado por teste.

Origem: achados do B6 (ciclo 2) em `docs/projeto/validacao/premissas-71-100.md` (PR-85, PR-93, PR-98), `premissas-35-70.md` (PR-44, PR-45), `premissas-01-34.md` (A-03, R-03), `pedido-aceite-entregas.md` (A-03) e a lacuna 13 de `docs/stack/LACUNAS.md`; pendências PEND-18 a PEND-27 e PEND-30 de `docs/projeto/RECURSAO.md`. Cada correção precisa de um teste que **falhe** quando ela é removida (mutação temporária, registrada no `ENTREGA.md`, como a FT-12 fez em `docs/sessao-e-acesso-endurecidos/MUTACOES.md`).

## Escopo

1. **Trecho de vídeo sem fala não derruba a fonte (PEND-18, PR-09, lacuna 13):** segmento vazio vira marcador de tempo seguido de `[sem fala]`; a fonte só falha se nenhum segmento tiver fala (`Não encontrei fala neste áudio.`); segmentos já transcritos continuam reaproveitados na retomada; chunking/FTS não trata o marcador como conteúdo relevante (decisão testada). Teste de ponta a ponta com áudio gerado pelo ffmpeg com trecho mudo.
2. **Teto de upload de documento sem `Content-Length` (PEND-19, PR-45):** leitura do corpo em stream com contagem de bytes, abortando acima de `MAX_UPLOAD_MB` mais a folga do multipart, 413 inclusive para corpo `chunked`; o parse do multipart parte do buffer já limitado. Testes de upload existentes continuam verdes.
3. **Extração interrompível e limite de páginas do PDF (PEND-27, PR-45):** extração pesada em worker/processo encerrável ao estourar o prazo; contagem de páginas conferida antes do trabalho pesado; se inviável, risco residual registrado com evidência (PEND-27 vira `decisao_humana`).
4. **Restauração vê servidor de pé em outro contêiner (PEND-20, PR-98):** arquivo de trava com batimento (`.servidor.lock`: `{pid, host, iniciadoEm, batimentoEm}`, a cada 10 s, removido no `SIGTERM`) no diretório de dados; `npm run restore` recusa com batimento mais novo que 30 s, salvo `--forcar`; trava velha é ignorada com aviso; relógio e diretório injetáveis; README e teste fim a fim atualizados.
5. **Correlação nas rotas de upload (PEND-21, PR-93):** os handlers de `api/agentes/[id]/fontes...` devolvem `X-Correlacao` no sucesso e no erro (helper compartilhado com o proxy).
6. **Distinção de canal além da cor (PEND-22, PR-85):** padrão não dependente de cor (só por tokens, sem cor literal) na badge de canal e no gráfico do painel quando separa canais; teste do mapeamento canal para padrão.
7. **Aviso de exclusão do agente (PEND-23, PR-44):** `BotaoExcluirAgente` avisa que conversas, mensagens, base de conhecimento, fontes e arquivos, canal Telegram e configuração do chat embutido também são apagados, de forma irreversível, com contagens quando disponíveis.
8. **Teste do alternador de tema (PEND-24, PR-23):** comportamento do `AlternadorDeTema` com happy-dom (alternância, persistência com `try/catch`, preferência do sistema, script anti-flash, `aria-pressed`, `data-theme`).
9. **Trava contra rede real nos testes (PEND-25, PR-26):** `fetch`, `http`/`https` e `net.connect` bloqueados para host não loopback, lista de permissões vazia; teste do bloqueio e do loopback.
10. **Auditoria que não sobe calada (PEND-26, PR-19):** em produção, falha em `ligarAuditoria()` derruba o start; fora de produção, `degradado` em `/api/saude` e "Trilha de auditoria: ativa/inativa" em Configurações > Sistema.
11. **Teste instável (PEND-30):** `tests/embed-pagina.test.ts` estabilizado e provado em laço.
12. **Premissas e documentos:** premissas novas (`Origem: recursao`, `Etapa: b5`), lacunas convertidas, `RECURSAO.md` e `MAPA.md` fechados.
13. **Verificação** em navegador próprio (porta livre, alvo confirmado) e registro do que não pôde ser visto.

## Não-objetivos

Confiança no IP atrás de proxy (PEND-11) e risco de injeção de prompt (decisão humana); cookie roubado e segundo fator (PEND-31); onde hospedar e cópia externa de backup (PEND-09); chave e credenciais reais (PEND-06); OCR e embeddings; sessão, cookie e guardas (FT-12); novas telas além do que a verificação precisar; alterar o comportamento de FT-01 a FT-12 fora dos pontos de contato listados.

## Critérios de aceite de negócio cobertos

- Subo um arquivo (PDF, Word, texto) e um vídeo e vejo cada um passar de "processando" para "pronto" (agora com trecho mudo e arquivo grande).
- Restauro um backup em uma instalação limpa e os dados voltam (agora com recusa se houver servidor de pé, inclusive em outro contêiner).
- A interface funciona no celular e nos temas claro e escuro (alternador provado).
- (Qualidade) premissas PR-19, PR-23, PR-26, PR-44, PR-45, PR-85, PR-93 e PR-98 provadas por teste.

## Premissas aplicáveis

PR-09, PR-19, PR-23, PR-26, PR-44, PR-45, PR-85, PR-93 e PR-98 (realiza); PR-05, PR-10, PR-13, PR-20, PR-21, PR-24, PR-96, PR-101 a PR-104 (`docs/projeto/PREMISSAS.md`).

## Convenções

`docs/stack/CONVENCOES.md`.
