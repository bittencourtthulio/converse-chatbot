---
expx_schema: 1
expx_tool: sprintx
kind: orquestrador
trabalho_id: conhecimento-em-video
origem_buildx: plataforma-chatbot-ia
feature_id: FT-08
titulo: Base de conhecimento - video
tipo_trabalho: feature
tipo_ocorrencia: null
estagio: f6
status: concluido
criado_em: 2026-09-30
atualizado_em: 2026-10-01
concluido_em: 2026-10-01
sprints: ['sprint-01', 'sprint-02', 'sprint-03', 'sprint-04', 'sprint-05', 'sprint-06', 'sprint-07']
caminho_critico: ['T-01.01', 'T-01.02', 'T-01.03', 'T-01.04', 'T-01.05', 'T-02.01', 'T-02.02', 'T-02.03', 'T-02.04', 'T-03.01', 'T-03.02', 'T-03.03', 'T-03.04', 'T-04.01', 'T-04.02', 'T-04.03', 'T-04.04', 'T-04.05', 'T-05.01', 'T-05.02', 'T-05.03', 'T-05.04', 'T-05.05', 'T-05.06', 'T-06.01', 'T-06.02', 'T-06.03', 'T-06.04', 'T-07.01', 'T-07.02', 'T-07.03']
modulo_afetado: [apresentacao, aplicacao, infraestrutura, banco, testes, documentacao]
arquivos_alterados: [".env.example", ".github/workflows/ci.yml", ".gitignore", "README.md", "docs/conhecimento-em-video/00-AUDITORIA.md", "docs/conhecimento-em-video/00-BLOQUEIOS.md", "docs/conhecimento-em-video/00-DECISOES.md", "docs/conhecimento-em-video/BRIEFING-BUILDX.md", "docs/conhecimento-em-video/FECHAMENTO.md", "docs/conhecimento-em-video/ORQUESTRADOR.md", "docs/conhecimento-em-video/RELATORIO-FEATURE.md", "docs/conhecimento-em-video/VERIFICACAO-VISUAL.md", "docs/conhecimento-em-video/base/00-INDICE.md", "docs/conhecimento-em-video/base/00-LACUNAS.md", "docs/conhecimento-em-video/base/dados-ambiente-e-integracoes.md", "docs/conhecimento-em-video/base/fila-fontes-e-armazenamento.md", "docs/conhecimento-em-video/base/midia-ffmpeg.md", "docs/conhecimento-em-video/base/openrouter-audio.md", "docs/conhecimento-em-video/base/upload-testes-e-ci.md", "docs/conhecimento-em-video/base/youtube-legendas.md", "docs/conhecimento-em-video/sprint-01/fases.md", "docs/conhecimento-em-video/sprint-01/sprint.md", "docs/conhecimento-em-video/sprint-01/tasks.md", "docs/conhecimento-em-video/sprint-02/fases.md", "docs/conhecimento-em-video/sprint-02/sprint.md", "docs/conhecimento-em-video/sprint-02/tasks.md", "docs/conhecimento-em-video/sprint-03/fases.md", "docs/conhecimento-em-video/sprint-03/sprint.md", "docs/conhecimento-em-video/sprint-03/tasks.md", "docs/conhecimento-em-video/sprint-04/fases.md", "docs/conhecimento-em-video/sprint-04/sprint.md", "docs/conhecimento-em-video/sprint-04/tasks.md", "docs/conhecimento-em-video/sprint-05/fases.md", "docs/conhecimento-em-video/sprint-05/sprint.md", "docs/conhecimento-em-video/sprint-05/tasks.md", "docs/conhecimento-em-video/sprint-06/fases.md", "docs/conhecimento-em-video/sprint-06/sprint.md", "docs/conhecimento-em-video/sprint-06/tasks.md", "docs/conhecimento-em-video/sprint-07/fases.md", "docs/conhecimento-em-video/sprint-07/sprint.md", "docs/conhecimento-em-video/sprint-07/tasks.md", "docs/entregas/conhecimento-em-video/ATENCAO.md", "docs/entregas/conhecimento-em-video/ENTREGA.md", "docs/entregas/conhecimento-em-video/PR.md", "docs/entregas/conhecimento-em-video/QA-PACOTE.md", "docs/projeto/MAPA.md", "docs/projeto/PREMISSAS.md", "docs/projeto/PROJETO.md", "docs/projeto/RECURSAO.md", "docs/stack/CONVENCOES.md", "docs/stack/LACUNAS.md", "package-lock.json", "package.json", "prisma/migrations/20261001000000_conhecimento_em_video/migration.sql", "prisma/schema.prisma", "src/app/(sistema)/agentes/[id]/conhecimento/page.tsx", "src/app/(sistema)/configuracoes/integracoes/page.tsx", "src/app/acoes.ts", "src/app/api/agentes/[id]/fontes/video/route.ts", "src/app/api/agentes/[id]/fontes/youtube/route.ts", "src/componentes/AdicionarFontes.tsx", "src/componentes/FormularioDoYoutube.tsx", "src/componentes/Icones.tsx", "src/componentes/LinhaDeFonte.tsx", "src/componentes/ListaDeTrechos.tsx", "src/componentes/PainelDeConhecimento.tsx", "src/componentes/PainelDeVideo.tsx", "src/componentes/PainelDoModeloDeTranscricao.tsx", "src/componentes/ZonaDeVideo.tsx", "src/componentes/conhecimento-logica.ts", "src/componentes/enviar-video.ts", "src/componentes/fonte-da-tela.ts", "src/componentes/itens-de-menu.ts", "src/componentes/opcoes-de-fonte.ts", "src/componentes/video-logica.ts", "src/estilos/global.css", "src/lib/ambiente.ts", "src/lib/armazenamento.ts", "src/lib/midia-formatos.ts", "src/lib/midia.ts", "src/lib/openrouter.ts", "src/lib/youtube-url.ts", "src/lib/youtube.ts", "src/servicos/fontes-fila.ts", "src/servicos/fontes.ts", "src/servicos/integracoes.ts", "src/servicos/transcricao-de-midia.ts", "src/servicos/transcricao-marcadores.ts", "tests/adicionar-fontes.test.tsx", "tests/ambiente.test.ts", "tests/apoio-ffmpeg.test.ts", "tests/apoio/ffmpeg.ts", "tests/apoio/openrouter-falso.ts", "tests/apoio/servir-falso.ts", "tests/apoio/servir-youtube-falso.ts", "tests/apoio/youtube-falso.ts", "tests/armazenamento-segmentos.test.ts", "tests/armazenamento-stream.test.ts", "tests/conhecimento-estilos.test.ts", "tests/conhecimento-logica.test.ts", "tests/conhecimento-paginas.test.tsx", "tests/fontes-fila-video.test.ts", "tests/fontes-fila-youtube.test.ts", "tests/fontes-fila.test.ts", "tests/fontes-video-fim-a-fim.test.ts", "tests/fontes-video.test.ts", "tests/fontes-youtube.test.ts", "tests/integracoes-transcricao.test.ts", "tests/linha-de-fonte-video.test.tsx", "tests/midia-extracao.test.ts", "tests/midia-formatos.test.ts", "tests/midia-sonda.test.ts", "tests/openrouter-falso-audio.test.ts", "tests/openrouter-transcricao.test.ts", "tests/painel-de-conhecimento.test.tsx", "tests/painel-de-video.test.tsx", "tests/painel-modelo-transcricao.test.tsx", "tests/projeto.test.ts", "tests/transcricao-de-midia.test.ts", "tests/transcricao-marcadores.test.ts", "tests/video-logica.test.ts", "tests/video-modelo.test.ts", "tests/video-rota.test.ts", "tests/youtube-falso.test.ts", "tests/youtube-legenda.test.ts", "tests/youtube-pagina.test.ts", "tests/youtube-rota.test.ts", "tests/youtube-url.test.ts"]
palavras_chave: [video, transcricao, ffmpeg, youtube, openrouter, streaming, fila, conhecimento]
---

# Orquestrador — conhecimento-em-video

> Porta de entrada da execução. Só caminhos relativos à raiz do repositório; nunca o valor de um segredo.

Branch do trabalho: feat/conhecimento-em-video (base: feat/canal-telegram) — aberta em 2026-09-30 pela mergex

## 1. Objetivo

FT-08 do projeto `plataforma-chatbot-ia`: o usuário sobe um vídeo ou áudio, ou cola um link do YouTube, e a fala vira uma fonte da base que o agente passa a usar (PR-09). Entram os campos novos de `Fonte` e o modelo de transcrição, o upload em streaming, `src/lib/midia.ts` (ffmpeg), `transcreverAudio` no OpenRouter, a fila de vídeo com retomada por parte, `src/lib/youtube.ts` (legendas), a opção Vídeo na aba Conhecimento e o campo Modelo de transcrição em Integrações. Empilha na ponta da pilha (FT-07); depende funcionalmente só da FT-04 e da FT-02.

## 2. Mapa e ordem de leitura

1. Este arquivo (`ORQUESTRADOR.md`)
2. `00-DECISOES.md` — decisões D-00 a D-20 (todas respondidas pelo buildx)
3. `base/00-INDICE.md` — e os seis arquivos da base que ele lista
4. `BRIEFING-BUILDX.md` — escopo e não-objetivos
5. `sprint-01/` a `sprint-07/`, na ordem, cada uma com `sprint.md`, `fases.md` e `tasks.md`
6. `00-BLOQUEIOS.md` — bloqueios registrados durante a execução
7. `00-AUDITORIA.md` — achados da F5 (quando existir)
8. `../projeto/PREMISSAS.md` (PR-71 a PR-77 nasceram na F2) e `../stack/CONVENCOES.md`

## 3. Rota de execução

- Sprint 01 (capacidade de testar): F-01.1 (T-01.01 → T-01.02) → F-01.2 (T-01.03 → T-01.04 → T-01.05)
- Sprint 02: F-02.1 (T-02.01 → T-02.02) → F-02.2 (T-02.03 → T-02.04)
- Sprint 03: F-03.1 (T-03.01 → T-03.02) → F-03.2 (T-03.03 → T-03.04)
- Sprint 04: F-04.1 (T-04.01 → T-04.02 → T-04.03) → F-04.2 (T-04.04 → T-04.05)
- Sprint 05: F-05.1 (T-05.01 → T-05.02 → T-05.03) → F-05.2 (T-05.04 → T-05.05 → T-05.06)
- Sprint 06: F-06.1 (T-06.01 → T-06.02) → F-06.2 (T-06.03 → T-06.04)
- Sprint 07: F-07.1 (T-07.01 → T-07.02) → F-07.2 (T-07.03)

Nenhuma fase nem task foi declarada paralela (`paralelizavel: false` em todas): o executor faz tudo em sequência, na ordem acima.

**Caminho crítico:** T-01.01, T-01.02, T-01.03, T-01.04, T-01.05, T-02.01, T-02.02, T-02.03, T-02.04, T-03.01, T-03.02, T-03.03, T-03.04, T-04.01, T-04.02, T-04.03, T-04.04, T-04.05, T-05.01, T-05.02, T-05.03, T-05.04, T-05.05, T-05.06, T-06.01, T-06.02, T-06.03, T-06.04, T-07.01, T-07.02, T-07.03

## 4. Ferramentas

- **MCPs / SDKs:** nenhum além do padrão; ferramentas de navegador da sessão (Chrome, via ToolSearch) para a T-07.01, se disponíveis. Nenhuma dependência npm nova prevista; `ffmpeg` e `ffprobe` do sistema (não são pacote npm).
- **Testes:** `npm test` (uma task: `npx vitest run tests/<arquivo>.test.ts`); os testes de rota exigem `npm run build` antes. Nunca dois `vitest` ao mesmo tempo (compartilham `prisma/test.db`); `DATABASE_URL` não é exportada ao rodar testes. Testes com ffmpeg usam `describe.skipIf(!ffmpegDisponivel)` (o CI exige com `EXIGIR_FFMPEG=1`).
- **Lint:** `npm run lint`
- **Typecheck:** `npx tsc --noEmit`
- **Build:** `npm run build` (com `DATABASE_URL` e `JWT_SECRET` no ambiente do comando)
- **Auditoria de dependências:** `npm audit --audit-level=high` (deve dar 0)
- **Migrations:** `npx prisma migrate deploy` (nunca `db push`, PR-30); a migration nova é escrita à mão e só acrescenta.
- **Segredos:** `JWT_SECRET` e `ENCRYPTION_KEY` passados inline nos comandos; `tests/setup.ts` define os de teste. A chave do OpenRouter de teste é o valor fictício do simulado. NUNCA escreva valor real.
- **Convenção de suíte:** `suite: verde` só quando a suíte inteira rodou na task; subconjunto é `parcial`, com o subconjunto declarado.

## 5. Agentes

- **Implementador** — escreve primeiro os dois testes da task, vê ambos falharem, implementa até passarem.
- **Revisor de testes** — antes de aceitar o verde, responde: este teste falharia com uma implementação errada? Se não, o teste volta.
- **Auditor de aceite** — verifica de fato o `criterio_aceite` da task antes de permitir `status: concluida`.

**Agente único:** assume os três papéis em sequência dentro de cada task, nesta ordem, tratando cada papel como um portão — não avança ao papel seguinte sem fechar o anterior.

## 6. Regras de autonomia

1. Não pergunte nada; não peça autorização para nada.
2. O teste vem antes do código, sempre.
3. Task só é `concluida` com teste de integração E funcional passando e `criterio_aceite` verificado. Não existe "concluído com ressalva".
4. Dúvida nova ou pré-requisito faltando: registrar em `00-BLOQUEIOS.md` (`B-NN | task | bloqueio | o que destravaria`), marcar a task `bloqueada`, pular para a próxima paralelizável. Nunca parar e esperar.
5. Só rode em paralelo o que o plano declarou paralelizável; a execução nunca decide paralelismo.
6. Atualize `status` em `tasks.md` a cada transição; ao concluir, acrescente data e resultado da suíte.
7. Critério de saída de fase/sprint não atendido = não avança.
8. Arquivo tocado fora de `arquivos` da task entra na lista da task e em `desvios` do `ENTREGA.md` na hora (portão V9).

## 7. Definição de pronto global

- Subo um áudio ou vídeo gerado com ffmpeg, vejo a barra de envio e a etapa, e a fonte vira `pronto` com trechos que começam em `[00:00]` (D-18, `sprint-04` e `sprint-07`).
- Colo um link do YouTube simulado e a fonte vira `pronto`; host fora da lista de YouTube é recusado com 422 (D-09).
- A busca do agente acha um trecho da transcrição e outro do YouTube (`T-04.05`, `T-07.01`).
- Falha de uma parte deixa a fonte em `erro` com a parte indicada e Reprocessar retoma das partes que faltam (D-07, D-15).
- Admin edita o Modelo de transcrição em Configurações > Integrações (D-13).
- `npm test` (suíte inteira), `npx tsc --noEmit`, `npm run lint`, `npm run build` e `npm audit --audit-level=high` (0) verdes; o que não pôde ser visto (transcrição real, YouTube real, 375 px) registrado em `VERIFICACAO-VISUAL.md`.

## 8. Como retomar uma sessão interrompida

1. Leia este arquivo inteiro.
2. Leia o `status` de cada task em cada `sprint-NN/tasks.md`.
3. Leia `00-BLOQUEIOS.md`.
4. Continue da primeira task `pendente` ou `em_andamento` cujas dependências (`depende_de`) estão todas `concluida`. Ignore as `bloqueada` até que o bloqueio registrado seja resolvido.
