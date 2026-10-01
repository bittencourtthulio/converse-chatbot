# Upload de documento: teto do corpo sem Content-Length

## Contrato de entrada

`POST /api/agentes/[id]/fontes` exige `multipart/form-data`, recusa por `Content-Length` declarado acima do teto e então chama `request.formData()` (`src/app/api/agentes/[id]/fontes/route.ts:28-38`). O teto é `MAX_UPLOAD_MB` (padrão 25, `src/lib/ambiente.ts:213-214`) vezes 10 arquivos (`LIMITES.arquivosPorEnvio`, `src/lib/extracao/limites.ts:15`) mais 1 MB de folga (`route.ts:26`). `passaDoTeto` só olha o cabeçalho (`src/app/api/agentes/[id]/fontes/resposta.ts:37-40`); sem `Content-Length` (corpo `chunked`) devolve `false`.

## Contrato de saída

Depois do `formData()` a rota soma os tamanhos dos arquivos e devolve 413 `corpo_grande_demais` se passarem do teto (`route.ts:43-45`) — **depois** de o corpo inteiro já estar em memória. Sucesso: 202 com `{resultados}`, ou 422 se nenhum foi aceito (`:49-51`). `erroDeTamanho()` é `Response.json({codigo:'corpo_grande_demais', mensagem:'O envio é maior que o limite permitido.'}, 413)` (`resposta.ts:29-34`).

## Limites e cotas

Total `25 MB x 10 + 1 MB = 251 MB` no padrão (`route.ts:26`). A rota de vídeo já lê em stream e drena até 1 MB depois de recusar (`src/app/api/agentes/[id]/fontes/video/route.ts:11-33`); as rotas de texto (1 MB + 800 KB, `texto/route.ts:9`) e YouTube (8 KB, `youtube/route.ts:11`) usam `request.json()`/`request.text()` e conferem o tamanho real depois da leitura (`youtube/route.ts:21-23`).

## Erros conhecidos e tratamento

Achado 5 de `docs/projeto/validacao/premissas-35-70.md`: corpo `chunked` sem `Content-Length` é lido inteiro antes da checagem de tamanho. Exige sessão autenticada (`exigirSessao` roda primeiro, `route.ts:30`). Testes de upload existentes: `tests/fontes-rota-upload.test.ts`, `tests/fontes-rota.test.ts`, `tests/fontes-rota-formatos.test.ts`, `tests/fontes-rota-ciclo.test.ts` (servidor de produção).

## Riscos para a nossa implementação

(1) Trocar `request.formData()` por leitura própria do stream exige montar um `Request` ou `Response` a partir do buffer limitado para reaproveitar o parser de multipart do runtime (`new Response(buffer, {headers:{'content-type': ...}}).formData()`); o boundary do cabeçalho original precisa ir junto. (2) Ao passar do teto o stream precisa ser cancelado (`leitor.cancel()`), e a resposta 413 sai sem esperar o cliente terminar de enviar; com keep-alive, a conexão pode cair (o vídeo já aceita isso, `video/route.ts:11-18`). (3) A prova "memória não cresce sem limite" é por contagem de bytes lidos: o teste precisa de um corpo `chunked` maior que o teto contra `next start`, com `MAX_UPLOAD_MB` pequeno. (4) A folga do multipart é 1 MB no total hoje; a regra "teto + folga" deve reaproveitar o mesmo `tetoDoCorpo()`. (5) O proxy fica fora (matcher exclui estas rotas), então não há cópia de 10 MB do Next.

## Fonte

`src/app/api/agentes/[id]/fontes/route.ts`, `.../resposta.ts`, `.../video/route.ts`, `.../texto/route.ts`, `.../youtube/route.ts`, `src/lib/ambiente.ts`, `src/lib/extracao/limites.ts`, `docs/projeto/validacao/premissas-35-70.md` (achado 5), `tests/fontes-rota-upload.test.ts` — acessado em 2026-10-01
