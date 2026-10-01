---
expx_schema: 1
expx_tool: sprintx
kind: varredura
trabalho_id: sessao-e-acesso-endurecidos
origem_buildx: plataforma-chatbot-ia
feature_id: FT-12
atualizado_em: 2026-10-01
---

# Varredura das guardas de acesso (FT-12, PEND-16, PR-12, PR-104)

Feita em 2026-10-01 lendo cada função exportada dos serviços e cada tela e rota de administração. O resultado é verificado de novo, a cada execução da suíte, por `tests/guardas-arquitetura.test.ts` (telas e rotas) e pelos testes de serviço citados abaixo.

## Telas (`src/app/(sistema)`)

| Tela | Guarda própria | Resultado |
|---|---|---|
| `configuracoes/{usuarios,integracoes,privacidade,auditoria,sistema}/page.tsx` | `exigirUsuarioAdmin()` na página (e no `layout.tsx` da pasta, acima do `loading.tsx`) | já se defendiam |
| `(painel)`, `agentes/**`, `perfil`, `perfil/senha`, `conversas/(lista)` | `exigirUsuario()` na página | já se defendiam |
| `conversas/[id]/page.tsx` | nenhuma: confiava no `layout.tsx` (ressalva R-01 do B6) | **corrigido** na T-04.04: a página chama `exigirUsuario()` antes de ler a conversa (`tests/conversas-detalhe-guarda.test.tsx`) |

## Rotas (`src/app/api`)

18 rotas. As 13 que exigem sessão usam `usuarioAtual()` ou `exigirSessao()`; `backups/[nome]` e `titulares/exportar` ainda dependem de `exigirAdmin` no serviço. Públicas por desenho, com a proteção que as substitui (lista explícita em `tests/apoio/guardas.ts`): `saude` (só `{status}`), `publico/agentes/[id]/config` (só campos visuais), `.../conversar` (limite por IP e agente, teto diário, `Origin` da plataforma), `.../conversa` (GET com limite por IP e agente desde a T-04.02, DELETE com limite e `Origin`) e o webhook do Telegram (segredo no cabeçalho, comparado em tempo constante).

## Serviços de administração

| Serviço | Função exportada | Guarda no serviço | Resultado |
|---|---|---|---|
| `usuarios` | `listar`, `criar`, `editar` (`desativar` passa por `editar`) | `exigirAdmin(autor)` | já se defendiam |
| `usuarios` | `excluirDefinitivamente` | confere no banco que quem pede é admin ativo | já se defendia |
| `usuarios` | `criarAdministradorInicial` | nenhuma, por desenho: só o comando `scripts/criar-admin.ts` a chama (sem sessão, na instalação) | aceito; o teste de arquitetura garante que nada de `src/app` ou `src/componentes` a importa |
| `integracoes` | `estadoDoOpenrouter`, `salvarChaveDoOpenrouter`, `removerChaveDoOpenrouter`, `testarConexaoDoOpenrouter`, `salvarModeloDeTranscricao` | `exigirAdmin(autor)` | já se defendiam |
| `integracoes` | `estadoDoModeloDeTranscricao` | exige só usuário autenticado (`autor.id`): o modelo em uso é informação da aba Vídeo, de qualquer usuário | aceito |
| `integracoes` | `chaveDoOpenrouterConfigurada` | nenhuma: devolve só sim ou não, usada pelas telas de qualquer usuário | aceito |
| `integracoes` | `obterChaveDoOpenrouter` | nenhuma: devolve a chave decifrada, uso interno dos serviços (`chat`, `agentes`, `fontes-fila` e a própria `integracoes`) | aceito; o teste de arquitetura garante que `src/app` e `src/componentes` não a importam |
| `privacidade` | `obterConfiguracaoDePrivacidade`, `salvarRetencao`, `salvarAvisoPadrao` | `exigirAdmin(autor)` | já se defendiam |
| `privacidade` | `retencaoEfetivaDias`, `avisoPadraoDoWorkspace` | nenhuma: leitura interna do expurgo e dos canais, sem dado pessoal | aceito |
| `titular` | `buscarTitular`, `exportarTitular`, `apagarDoTitular` | `exigirAdmin(autor)` | já se defendiam |
| `sistema` | `obterSistema` | `exigirAdmin(autor)` | já se defendia |
| `backup` | `gerarBackupAgora` (admin ou `'sistema'`), `listarBackups`, `caminhoDoBackup` | `exigirAdmin(autor)` (o comando passa `'sistema'`) | já se defendiam |
| `backup` | `listarBackupsDoDisco`, `ultimoBackup` | nenhuma: helpers internos que só `listarBackups` e `obterSistema` (ambos de admin) chamam | aceito; o teste de arquitetura garante que a apresentação não os importa |
| `auditoria` | `listar` | **nenhuma** (ressalva R-02 do B6) | **corrigido** na T-04.03: recebe o ator, 401 sem ator, 403 para usuário comum, antes de validar o filtro (`tests/auditoria-guarda.test.ts`) |
| `auditoria` | `registrar`, `registrarMelhorEsforco`, `purgarAnterioresA`, `aguardarGravacoesPendentes` | nenhuma: escrita interna da trilha, chamada pelos serviços e pelo expurgo | aceito: nenhuma é acessível por rota ou ação |

## O que ficou

Funções internas sem ator (chave decifrada, helpers de backup, administrador inicial) são protegidas por **não serem importáveis pela apresentação**, e isso agora é um teste (`tests/guardas-arquitetura.test.ts`, "funções internas sem ator"), não um acordo.
