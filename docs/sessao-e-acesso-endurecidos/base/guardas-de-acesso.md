# Guardas de acesso em páginas, rotas e serviços

## Contrato de entrada

Guardas de apresentação: `exigirUsuario()` (redireciona a `/entrar`), `exigirUsuarioAdmin()` (redireciona a `/` se não for admin) em `src/app/sessao-servidor.ts:21-35`; rotas usam `usuarioAtual()` (`src/app/api/agentes/[id]/conversar/route.ts:31`) ou `exigirSessao()` (401 em JSON, `src/app/api/conversas/resposta.ts:16-19`). Guardas de serviço: `exigirAdmin(autor)` (`src/servicos/autenticacao.ts:117`).

## Contrato de saída

Páginas sob `src/app/(sistema)`: todas chamam `exigirUsuario()` ou `exigirUsuarioAdmin()` na própria página, exceto `conversas/[id]/page.tsx`, que lê a conversa via `carregarConversa(id)` sem guarda própria e confia no `layout.tsx` da pasta (`src/app/(sistema)/conversas/[id]/layout.tsx:15`, achado R-01). O `layout.tsx` do grupo `(sistema)` chama `exigirUsuario()` (`src/app/(sistema)/layout.tsx:11`), mas a documentação do Next desaconselha tratar layout como fronteira. As cinco pastas de `configuracoes/*` têm `exigirUsuarioAdmin` no layout e na página.

Serviços de admin que se defendem: `usuarios.listar/criar/editar` (`src/servicos/usuarios.ts:54,88,107`; `desativar` passa por `editar`; `excluirDefinitivamente` confere admin ativo no banco, linha 198-203), `integracoes.estadoDoOpenrouter/salvarChave/removerChave/testarConexao/salvarModeloDeTranscricao` (`src/servicos/integracoes.ts:74,82,111,163,223`), `privacidade.obterConfiguracaoDePrivacidade/salvarRetencao/salvarAvisoPadrao` (`src/servicos/privacidade.ts:106,127,156`), `titular.buscarTitular/exportarTitular/apagarDoTitular` (`src/servicos/titular.ts:108,171,254`), `sistema.obterSistema` (`src/servicos/sistema.ts:112`), `backup.gerarBackupAgora/listarBackups/caminhoDoBackup` (`src/servicos/backup.ts:51,77,106`). **Sem guarda de papel no serviço:** `auditoria.listar(entrada)` (`src/servicos/auditoria.ts:198`, achado R-02); chamado só por `src/app/(sistema)/configuracoes/auditoria/page.tsx:9,23` e por testes. Funções de serviço sem ator por desenho: `criarAdministradorInicial` (comando `scripts/criar-admin.ts`), `retencaoEfetivaDias` e `avisoPadraoDoWorkspace` (consumo interno e público), `estadoDoModeloDeTranscricao` (qualquer usuário autenticado, `integracoes.ts:211` confere `autor.id`), `verificarSaude` (público e mínimo), `obterChaveDoOpenrouter` (uso interno, nunca devolvido).

Rotas sob `src/app/api`: 19 `route.ts`. Públicas por desenho: `saude`, `publico/agentes/[id]/{conversar,config,conversa}` (limite de uso e origem), `telegram/[agenteId]/webhook` (segredo no cabeçalho). As demais exigem sessão via `usuarioAtual()` ou `exigirSessao()`; `backups/[nome]` e `titulares/exportar` também dependem de `exigirAdmin` no serviço.

## Limites e cotas

NÃO DOCUMENTADO qualquer teste que enumere telas e rotas e exija guarda própria; hoje a cobertura são testes pontuais (`tests/rotas.test.ts`, `tests/conversas-detalhe-rota.test.ts:49`, `tests/sistema-pagina.test.tsx:34-43`, `tests/backups-rota.test.ts:73`).

## Erros conhecidos e tratamento

Negação vem do servidor: 307 para `/` (usuário comum em tela de admin), 307 para `/entrar` (sem sessão), 401 JSON em rota de API, 403 do serviço (`naoAutorizado`).

## Riscos para a nossa implementação

Mudar a assinatura de `auditoria.listar` (receber o ator) exige ajustar a página e os testes que a chamam (`tests/auditoria.test.ts`, `tests/auditoria-ui.test.tsx`, `tests/auditoria-*.test.ts` que listam). Um teste de arquitetura por varredura de texto é frágil se a guarda estiver em helper; a lista de nomes de guarda aceitos precisa ser explícita. A mudança de convenção "guarda no layout" para "guarda no layout e na página" vale registrar em `docs/stack/CONVENCOES.md`.

## Fonte

`src/app/sessao-servidor.ts`, `src/app/(sistema)/**`, `src/app/api/**`, `src/servicos/*.ts`, `docs/projeto/validacao/premissas-01-34.md` (R-01, R-02) — acessado em 2026-10-01
