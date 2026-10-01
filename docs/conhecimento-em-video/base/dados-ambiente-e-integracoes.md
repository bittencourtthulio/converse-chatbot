# Dados, ambiente, integrações e tela de configuração (modo INTERNO)

## 1. Contrato de entrada

- Schema: `Fonte` com `tipo` (`arquivo|texto|video|youtube`), `status`, `mensagemErro`, `caminhoArquivo`, `tamanhoBytes Int`, `totalTrechos`, `caracteres` (`prisma/schema.prisma`, modelo `Fonte`); `ConfiguracaoDoWorkspace` singleton `id "unica"` com `openrouterChaveCifrada` e `atualizadoPor` (modelo `ConfiguracaoDoWorkspace`). Faltam `progresso`, `etapa`, `duracaoSegundos`, `urlOrigem` e `modeloDeTranscricao`.
- Migrations só acrescentam; `tests/migracoes.test.ts:11` falha em `DROP TABLE|COLUMN` sem a marca. Banco de teste por `prisma migrate deploy` (`tests/setup.ts:36-40`).
- Ambiente: `inteiroComPadrao` (`src/lib/ambiente.ts:17`), `storageDir` (`:88`), `maxUploadBytes` (`:95`), `telegramPermitirUrlNaoHttps` ignorada em produção (`:117-120`). Variáveis novas entram aqui, em `.env.example` e README.
- Integrações: `salvarChaveDoOpenrouter` (admin), `obterChaveDoOpenrouter` (decifra) e `chaveDoOpenrouterConfigurada` (`src/servicos/integracoes.ts`); a tela `src/app/(sistema)/configuracoes/integracoes/page.tsx` usa ações de servidor `src/app/acoes.ts:172-209` e o componente `PainelDaChaveOpenrouter`.
- Interface: `OPCOES_DE_FONTE` (`src/componentes/opcoes-de-fonte.ts:14`), `PAINEIS` (`AdicionarFontes.tsx:17`), `LinhaDeFonte`, `iconeDoTipo` (só texto ou arquivo, `conhecimento-logica.ts:97`), `ListaDeTrechos`, `deveContinuarPolling` e polling de 2 s (`PainelDeConhecimento.tsx`). Ícones são SVG inline por nome (`NomeDeIcone` em `itens-de-menu.ts`).

## 2. Contrato de saída

- A tela de fontes mostra tamanho, data, selo de status, motivo do erro e ações; não há barra de processamento nem duração; a barra de envio usa `<progress>` (`ZonaDeArquivos.tsx`) e `enviarArquivo` com `XMLHttpRequest` (`src/componentes/enviar-arquivo.ts:27-42`).
- Trechos: `Trecho{indice, texto, caracteres}`, página de 20; o marcador de tempo `[00:00]` no começo do texto da parte viaja dentro do texto do trecho (nenhuma coluna nova de tempo prevista).
- Índice FTS5 por gatilhos de insert/delete/update em `trechos` (migration `20260930190000_busca_fts5`): nada a fazer para video.

## 3. Limites e cotas

- Texto extraído máximo 5 milhões de caracteres (`LIMITES.caracteresExtraidos`); 3 horas de fala em português cabem folgadamente (ordem de 150 mil a 200 mil caracteres: estimativa NÃO DOCUMENTADA).
- Nome do modelo: sem limite no schema; `src/servicos/agentes.ts` tem validação do modelo do agente (limites em PR-40).

## 4. Erros conhecidos e tratamento

- Segredo: ação de segredo usa `mensagemSemSegredo` (`src/app/acoes.ts`); a chave nunca vai ao navegador (PR-14, PR-39).
- A tela de integrações depende de `exigirUsuarioAdmin` no layout e na página.

## 5. Riscos para a nossa implementação

- O modelo de transcrição por workspace pode ser lido por qualquer usuário no momento do envio (aviso de custo), mas só o admin o altera (`exigirAdmin`).
- Testes de `LinhaDeFonte` ou `iconeDoTipo` existentes devem continuar verdes (`tests/` de componentes: `componentes.test.tsx`, `conhecimento-logica` etc.); `opcoes-de-fonte` tem teste próprio que conta opções (a conferir na F6).
- `tests/apoio/fontes.ts` já aceita `tipo` `video` e `youtube` (`OpcoesDeFonte`).
- A seed (`prisma/seed.ts`) não precisa de vídeo.

## 6. Fonte

`prisma/schema.prisma`, `src/lib/ambiente.ts`, `src/servicos/integracoes.ts`, `src/app/acoes.ts`, `src/componentes/*` citados, `tests/setup.ts`, `tests/migracoes.test.ts`, lidos em 2026-09-30.
