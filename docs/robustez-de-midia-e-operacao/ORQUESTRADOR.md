---
expx_schema: 1
expx_tool: sprintx
kind: orquestrador
trabalho_id: robustez-de-midia-e-operacao
origem_buildx: plataforma-chatbot-ia
feature_id: FT-13
titulo: Robustez de midia, upload e operacao
tipo_trabalho: feature
tipo_ocorrencia: null
estagio: f4
status: em_andamento
criado_em: 2026-10-01
atualizado_em: 2026-10-01
concluido_em: null
sprints: [sprint-01, sprint-02, sprint-03, sprint-04, sprint-05, sprint-06]
caminho_critico: ["F-01.1", "F-01.2", "F-02.1", "F-02.2", "F-03.1", "F-03.2", "F-04.1", "F-04.2", "F-05.1", "F-05.2", "F-06.1", "F-06.2"]
modulo_afetado: ["apresentacao", "aplicacao", "infraestrutura", "testes", "documentacao"]
arquivos_alterados: []
palavras_chave: [video, upload, extracao, restauracao, trava, correlacao, auditoria, tema]
---

# Orquestrador — robustez-de-midia-e-operacao

> Porta de entrada da execução. Escrito para quem abriu o repositório agora e não sabe nada. Só caminhos relativos; nunca o valor de um segredo.

Branch do trabalho: feat/robustez-de-midia-e-operacao (base: feat/sessao-e-acesso-endurecidos) — aberta em 2026-10-01 pela mergex

## 1. Objetivo

O usuário envia vídeo com trechos sem fala (o trecho vira `[sem fala]` e a fonte só falha sem nenhuma fala) e documentos grandes (corpo lido em stream com teto, extração de PDF, DOCX e HTML em processo encerrável) sem derrubar a fonte nem o servidor; o operador só restaura um backup com o servidor parado, mesmo em outro contêiner (trava `.servidor.lock` com batimento); e o que as premissas prometem de interface (padrão de canal, aviso de exclusão, alternador de tema), de correlação (`X-Correlacao` nas rotas de upload), de proteção (auditoria fecha o start em produção, trava de rede nos testes) está provado por teste. Realiza PR-09, PR-19, PR-23, PR-26, PR-44, PR-45, PR-85, PR-93 e PR-98 (FT-13 do `docs/projeto/MAPA.md`) e cria as premissas PR-105 a PR-112. Resolve PEND-18 a PEND-27 e PEND-30.

## 2. Mapa e ordem de leitura

1. Este arquivo (`ORQUESTRADOR.md`)
2. `00-DECISOES.md` — decisões que governam o plano (D-00 a D-29; premissas novas PR-105 a PR-112 em `docs/projeto/PREMISSAS.md`)
3. `BRIEFING-BUILDX.md` e `base/00-INDICE.md` — e os arquivos da base que ele lista
4. `sprint-01/` (trava de rede, teste do embed, apoios de áudio, PDF e corpo chunked), `sprint-02/` (vídeo sem fala), `sprint-03/` (teto em stream e extração isolada), `sprint-04/` (trava do servidor, restauração, auditoria), `sprint-05/` (correlação e interface), `sprint-06/` (verificação, documentos, fechamento); em cada uma: `sprint.md` → `fases.md` → `tasks.md`
5. `00-BLOQUEIOS.md` — bloqueios registrados durante a execução
6. `00-AUDITORIA.md` — achados MÉDIA/BAIXA que permanecem válidos
7. `MUTACOES.md` — a mutação temporária que prova cada correção (criado na T-01.01)

Entrega da mergex: `docs/entregas/robustez-de-midia-e-operacao/ENTREGA.md`.

## 3. Rota de execução

Tudo é sequencial; nenhuma fase nem task foi declarada paralelizável (o banco de teste é um arquivo só e a suíte roda sem paralelismo).

- Sprint 01: F-01.1 → F-01.2
- Sprint 02: F-02.1 → F-02.2
- Sprint 03: F-03.1 → F-03.2
- Sprint 04: F-04.1 → F-04.2
- Sprint 05: F-05.1 → F-05.2
- Sprint 06: F-06.1 → F-06.2

**Caminho crítico:** todas as fases, na ordem acima. 24 tasks.

## 4. Ferramentas

- **Linguagem e frameworks:** TypeScript, Next 16 (App Router, `src/proxy.ts`), React 19, Prisma 7 com SQLite, Vitest 4 com happy-dom; camadas `src/app` → `src/servicos` → `src/lib` (`docs/stack/CONVENCOES.md`).
- **MCPs / SDKs:** nenhum além do padrão; a verificação no navegador usa a extensão do Chrome ou, se ela não conectar, um Chrome próprio sem janela com `--user-data-dir` novo e `--remote-debugging-port=0` (porta livre), confirmando que o alvo é a aba própria e a URL é a do servidor local antes de interagir; serviços externos são simulados (`tests/apoio/openrouter-falso.ts`).
- **Testes:** `npm test` (suíte inteira, exige `npm run build` antes dos testes de rota); um arquivo: `npx vitest run tests/<arquivo>.test.ts`. Nunca dois ao mesmo tempo. Não exportar `DATABASE_URL` ao rodar os testes (só o `build` a precisa). Portas dos servidores de produção dos testes novos: 3253 (`tests/fontes-rota-chunked.test.ts`), 3254 (`tests/fontes-rota-pdf-isolado.test.ts`), 3255 (`tests/trava-do-servidor-producao.test.ts`) e uma própria em `tests/fontes-correlacao.test.ts` (3256).
- **Build antes dos testes de servidor:** os testes que sobem `next start` usam o `.next` que existir; rode `npm run build` depois da última mudança em `src/` e antes deles. Uma suíte inteira só vale como `verde` com um build posterior à última mudança em `src/`.
- **Citações de linha:** `tests/projeto.test.ts` confere citações `arquivo:linha` de `docs/stack/CONVENCOES.md` e `LACUNAS.md`; toda task que altera `src/` reajusta as citações nos três arquivos (declarados em `arquivos.altera`).
- **Lint:** `npm run lint`
- **Typecheck:** `npx tsc --noEmit`
- **Build:** `npm run build` (precisa de `DATABASE_URL` e `JWT_SECRET` no ambiente); auditoria de dependências: `npm audit --audit-level=high`.
- **Segredos:** `JWT_SECRET` e `ENCRYPTION_KEY` ficam no arquivo local de ambiente (que o agente não toca), passados inline ao build e ao servidor de verificação (valores descartáveis) e definidos em `tests/setup.ts` nos testes. NUNCA escreva o valor. Esta feature não cria variável de ambiente.
- **Pré-requisitos externos:** rede para `npm audit --audit-level=high` (se falhar por dependência de terceiros alheia à feature, registrar e tratar como risco, sem `npm audit fix --force`); `ffmpeg` e `ffprobe` na máquina de teste; Docker só para o teste opt-in de contêiner (`VERIFICAR_CONTEINER=1`), que não é necessário porque o Dockerfile não muda.
- **Processos:** guarde o PID de cada servidor ou navegador que VOCÊ inicia (`$!`) e encerre só esse PID; nunca `pkill`, `killall` nem `kill` por padrão de nome.

## 5. Agentes

- **Implementador** — escreve primeiro os dois testes da task, vê ambos falharem, implementa até passarem. Quando a correção já existe e só falta a prova, o "vermelho" vem da mutação temporária, registrada em `MUTACOES.md`.
- **Revisor de testes** — antes de aceitar o verde, responde: este teste falharia com uma implementação errada? Se não, o teste volta.
- **Auditor de aceite** — verifica de fato o `criterio_aceite` da task antes de permitir `status: concluida`.

**Agente único:** assume os três papéis em sequência dentro de cada task, nesta ordem, tratando cada papel como um portão.

## 6. Regras de autonomia

1. Não pergunte nada; não peça autorização para nada.
2. O teste vem antes do código, sempre.
3. Task só é `concluida` com teste de integração E funcional passando e `criterio_aceite` verificado. Não existe "concluído com ressalva".
4. Dúvida nova ou pré-requisito faltando: registrar em `00-BLOQUEIOS.md` (`B-NN | task | bloqueio | o que destravaria`), marcar a task `bloqueada`, pular para a próxima paralelizável. Nunca parar e esperar.
5. Só rode em paralelo o que o plano declarou paralelizável; a execução nunca decide paralelismo.
6. Atualize `status` em `tasks.md` a cada transição; ao concluir, acrescente data e resultado da suíte (`parcial` quando rodou subconjunto, `verde` só quando a suíte inteira rodou; nunca reescreva `parcial` para `verde` sem rodar, PEND-10). Task que mexe em código compartilhado fecha com a suíte inteira.
7. Critério de saída de fase/sprint não atendido = não avança.
8. Máquina compartilhada: `database is locked` ou estouro de tempo com carga alheia se resolve esperando, não culpando o código; não mate processo que você não iniciou.
9. Desvio real do plano (arquivo novo que a task não previu) entra em `arquivos` da task que o criou e em `desvios` do `ENTREGA.md` no momento em que acontece.

## 7. Definição de pronto global

- Trecho sem fala vira `[sem fala]` e a fonte só falha sem nenhuma fala, provado com áudio gerado pelo ffmpeg; o marcador não é indexado sozinho.
- Corpo de upload de documento sem `Content-Length` é recusado com 413 ao passar do teto, com a leitura cancelada (contagem de bytes provada); a extração de PDF, DOCX e HTML roda em processo encerrável no prazo e o PDF de 501 páginas é recusado, ou o motivo da inviabilidade está registrado e a PEND-27 é `decisao_humana`.
- `npm run restore` recusa com batimento fresco em `.servidor.lock` (outro host), aceita `--forcar`, ignora trava velha; o servidor remove a trava ao desligar; nenhum teste deixa trava para trás.
- As rotas `api/agentes/[id]/fontes...` devolvem `X-Correlacao` em toda resposta; a badge de canal tem padrão; o aviso de exclusão cita o que mais é apagado; o alternador de tema tem teste de comportamento; a trava de rede protege a suíte; a auditoria derruba o start em produção e aparece como `degradado` e como "Trilha de auditoria: inativa" fora dela; `tests/embed-pagina.test.ts` passa 30 vezes seguidas.
- Cada correção tem a mutação registrada em `MUTACOES.md`; `npx tsc --noEmit`, `npm run lint`, `npm run build`, a suíte inteira e `npm audit --audit-level=high` (0) verdes; verificação no navegador registrada; MAPA, PREMISSAS (PR-105 a PR-112) e RECURSAO (PEND-18 a PEND-27 resolvidas e PEND-30) fechados.

## 8. Como retomar uma sessão interrompida

1. Leia este arquivo inteiro.
2. Leia o `status` de cada task em cada `sprint-NN/tasks.md`.
3. Leia `00-BLOQUEIOS.md`.
4. Continue da primeira task `pendente` ou `em_andamento` cujas dependências (`depende_de`) estão todas `concluida`. Ignore as `bloqueada` até que o bloqueio registrado seja resolvido.
