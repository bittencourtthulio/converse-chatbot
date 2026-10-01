---
expx_schema: 1
expx_tool: sprintx
kind: auditoria
trabalho_id: robustez-de-midia-e-operacao
origem_buildx: plataforma-chatbot-ia
feature_id: FT-13
atualizado_em: 2026-10-01
---

# Auditoria — robustez-de-midia-e-operacao

Data: 2026-10-01. O agente `auditor-plano` não existe neste harness: a auditoria foi feita por um agente independente de leitura (sem ter visto o raciocínio da F3), que leu o plano e o código real citado.

## Primeira passada (VEREDITO: NÃO, plano regerado na F3)

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| ALTA | sprint-01/tasks.md (T-01.01) e tests/projeto.test.ts:863-881 | O teste de fechamento da FT-12 exige `em_andamento: 0`, `entregues: 12` e `pendencias_resolvidas: 6`; com o MAPA em `em_andamento: 1` a suíte já está vermelha antes de qualquer task, e quebra de novo no fechamento da FT-13 | a T-01.01 relaxa o bloco da FT-12 para um estado histórico estável e a T-06.03 troca as asserções pelas da FT-13 |
| MÉDIA | sprint-03/tasks.md (T-03.02) | a prova do 413 chunked não discrimina o `formData()` direto (corpo multipart válido também dá 413 no código antigo) | corpo com content-type multipart inválido: antigo 422, novo 413; prova de bytes só na T-03.01 |
| MÉDIA | sprint-02/tasks.md (T-02.03) | o áudio de 25 s gera um trecho só; o descarte do trecho só de marcadores nunca roda no ponta a ponta | caso em fontes-fila-video com mais de 1.100 caracteres seguidos de marcadores |
| MÉDIA | 00-DECISOES.md D-13 e D-14 | D-13 manda confiar no `x-correlacao` do cliente nas rotas fora do proxy (regressão do PR-93); D-14 diz cinco arquivos e lista seis | o helper sempre gera código novo e usa o contexto assíncrono; seis arquivos |
| MÉDIA | sprint-03/tasks.md (T-03.04) | a task não define como injetar o isolamento e o prazo na fila; os casos de PDF passam também com `extrairTexto` direto | opção `extrairIsolado` em `OpcoesDaFila` e espião que prova quais formatos passam pelo filho |
| MÉDIA | sprint-03 (T-03.05), ORQUESTRADOR e sprint-04 (T-04.01) | o ramo "filho inviável" não tem desfecho executável e a T-04.01 dependeria da T-03.05 | a T-03.05 conclui com o isolamento desligado por constante e a PEND-27 como `decisao_humana`; a T-04.01 depende da T-03.04 |
| MÉDIA | sprint-04/tasks.md (T-04.02) | cinco testes sobem `next start` por conta própria e o servidor deles grava `prisma/.servidor.lock` | limpeza global da trava por arquivo de setup dedicado |
| MÉDIA | sprint-04/tasks.md (T-04.05) | `DadosDoSistema` ganha `auditoria` e fixtures de `tests/backup-ui.test.tsx`, `sistema-pagina.test.tsx` e `sistema-estilos.test.ts` quebram | declarar os arquivos em `altera` |
| MÉDIA | sprint-01/tasks.md (T-01.01) e D-20 | D-20 diz `tests/setup.ts`; a task usa `tests/setup-rede.ts`; formas de `connect` e idempotência | alinhar a D-20, editar o `setupFiles` na mesma linha e cobrir `connect(port)`, `connect(path)` e `connect([opts])` |
| MÉDIA | sprint-06/tasks.md (T-06.01) | sem comando checável nem pré-requisitos declarados | verificação por CDP (`scrollWidth`), usuário descartável, Chrome próprio e servidor falso declarados |
| MÉDIA | sprint-05/tasks.md (T-05.02) e D-16 | o padrão pode reduzir o contraste real do texto e o critério é subjetivo | opacidade fixa por `color-mix`, teste que só permite `var(--canal-...-borda)` e `transparent` |
| BAIXA | D-05 vs briefing item 2 | o desvio do teto não chega ao ENTREGA | linha obrigatória em `desvios` na T-06.03 |
| BAIXA | sprint-02 (T-02.01) | `juntarPartes` já escreve o texto `[sem fala]`; só `trechoSoDeMarcadores` é novo | reformular objetivo e mutação |
| BAIXA | sprint-01 (T-01.03) | partes de silêncio idêntico colapsam no falso; a parte 1 não é muda no áudio | ruído distinto por parte; silêncio por índice |
| BAIXA | sprint-05 (T-05.01) | constante no topo de `log.ts` desloca citações | acrescentar no fim do arquivo |
| BAIXA | ORQUESTRADOR e depende_de | dependências artificiais | reduzir ao real |
| BAIXA | ORQUESTRADOR §4 e §7 | pré-requisitos externos do audit, ffmpeg e docker | declarar |
| BAIXA | sprint-06 (T-06.03) | cria/altera trocados e arquivos de pacote sem motivo | ajustar |
| BAIXA | base/restauracao-trava.md risco 4 | nenhuma task cobre que o backup não leva a trava | asserção na T-04.03 |
| BAIXA | sprint-03 (T-03.03, T-03.04) | processo `tsx` por documento deixa os testes de fila e rota mais lentos | medir e declarar os arquivos em `altera` |


## Segunda passada (agente independente, após a regeração do plano na F3)

Nenhuma ALTA. A ALTA da primeira passada (T-01.01 contra `tests/projeto.test.ts`) está endereçada. Achados MÉDIA que permanecem válidos, tratados na execução e declarados em `desvios` do `ENTREGA.md` quando mudarem arquivos:

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| MÉDIA | sprint-06/tasks.md (T-06.01) | o `tests/apoio/servir-falso.ts` não tem controle de `silencios` | a T-01.03 ou a T-06.01 declara o arquivo (ou um script novo em `tests/apoio/`) em `arquivos` |
| MÉDIA | sprint-03/tasks.md (T-03.05), D-28 | no ramo `EXTRACAO_ISOLADA_ATIVA = false` os testes dependentes falham; a constante nasce na T-03.03 | criar a constante `true` na T-03.03 e condicionar as asserções ao estado ou trocá-las pelo teste do estado desligado |
| MÉDIA | 00-DECISOES.md D-09, D-13, D-14, D-20 | o texto original ficou, com emenda em D-26 a D-29 | vale a emenda (D-26 a D-29 substituem o que contradizem); o executor segue a emenda |
| MÉDIA | sprint-05/tasks.md (T-05.01) | não há como forçar um 500 num `next start` | prova do código de referência por teste do helper com handler que lança |
| MÉDIA | sprint-01/tasks.md (T-01.01) | as asserções de `tests/projeto.test.ts:863-885` a relaxar são mais que as citadas | relaxar o bloco inteiro para estado histórico monotônico |
| MÉDIA | ORQUESTRADOR.md, depende_de | uma task bloqueada trava as dependentes | task bloqueada segue pelo ramo degradado registrado; T-06.02 não depende do sucesso da T-06.01 |
| MÉDIA | sprint-02/tasks.md (T-02.03) | tamanho de parte de 10 s no ponta a ponta | a opção `segundosPorParte` já existe em `OpcoesDaFila` (`src/servicos/fontes-fila.ts`) |

VEREDITO: SIM — o plano está pronto para execução autônoma.
