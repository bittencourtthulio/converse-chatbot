---
expx_schema: 1
expx_tool: sprintx
kind: base_indice
trabalho_id: sessao-e-acesso-endurecidos
origem_buildx: plataforma-chatbot-ia
feature_id: FT-12
atualizado_em: 2026-10-01
areas:
  - arquivo: sessao-e-cookie.md
    titulo: Sessao por JWT e cookie hoje
    lacunas: 1
  - arquivo: troca-de-senha-e-versao.md
    titulo: Troca de senha e invalidacao de outras sessoes
    lacunas: 0
  - arquivo: limites-de-uso.md
    titulo: Limites de uso: login e leitura publica
    lacunas: 1
  - arquivo: proxy-e-renovacao.md
    titulo: Proxy do Next 16, cookies e onde reemitir a sessao
    lacunas: 2
  - arquivo: guardas-de-acesso.md
    titulo: Guardas em paginas, rotas e servicos
    lacunas: 1
  - arquivo: testes-expurgo-e-ambiente.md
    titulo: Testes, expurgo, banco e ambiente
    lacunas: 0
---

# Índice da base — sessao-e-acesso-endurecidos

| Arquivo | Área | Resumo |
|---|---|---|
| `sessao-e-cookie.md` | Sessao por JWT e cookie hoje | `jti` ausente, sem renovacao, cookie sem teste, `sair` so apaga o cookie |
| `troca-de-senha-e-versao.md` | Troca de senha e invalidacao de outras sessoes | corte `agora + 1 s` derruba login no mesmo segundo (A-1) |
| `limites-de-uso.md` | Limites de uso: login e leitura publica | `autenticar` sem teste do limite; GET da conversa sem limite; relogio por referencia |
| `proxy-e-renovacao.md` | Proxy do Next 16, cookies e onde reemitir a sessao | proxy pode gravar cookie na resposta; matcher exclui upload |
| `guardas-de-acesso.md` | Guardas em paginas, rotas e servicos | `conversas/[id]/page.tsx` e `auditoria.listar` sem guarda propria; sem teste de arquitetura |
| `testes-expurgo-e-ambiente.md` | Testes, expurgo, banco e ambiente | banco por arquivo, `rotas.test.ts` com servidor de producao, expurgo com relogio injetavel |
