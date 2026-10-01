---
expx_schema: 1
expx_tool: sprintx
kind: base_indice
trabalho_id: robustez-de-midia-e-operacao
origem_buildx: plataforma-chatbot-ia
feature_id: FT-13
atualizado_em: 2026-10-01
areas:
  - arquivo: midia-sem-fala.md
    titulo: Transcricao de video: trecho sem fala
    lacunas: 1
  - arquivo: upload-e-teto.md
    titulo: Upload de documento: teto do corpo sem Content-Length
    lacunas: 1
  - arquivo: extracao-isolada.md
    titulo: Extracao de texto: prazo que nao interrompe CPU e limite de paginas
    lacunas: 2
  - arquivo: restauracao-trava.md
    titulo: Restauracao: servidor de pe em outro conteiner
    lacunas: 1
  - arquivo: correlacao-nos-uploads.md
    titulo: Correlacao nas rotas de upload
    lacunas: 0
  - arquivo: interface-canal-exclusao-tema.md
    titulo: Interface: badge de canal, aviso de exclusao e alternador de tema
    lacunas: 2
  - arquivo: auditoria-e-saude.md
    titulo: Auditoria que nao sobe calada: saude e tela Sistema
    lacunas: 1
  - arquivo: testes-rede-e-instabilidade.md
    titulo: Testes: trava contra rede real e teste instavel
    lacunas: 0
---

# Índice da base — robustez-de-midia-e-operacao

| Arquivo | Área | Resumo |
|---|---|---|
| `midia-sem-fala.md` | Transcrição de vídeo: trecho sem fala | `transcricao_vazia` é transitório e, esgotadas as repetições, derruba a fonte (lacuna 13); `juntarPartes` ignora parte vazia |
| `upload-e-teto.md` | Upload de documento: teto do corpo sem `Content-Length` | `request.formData()` lê o corpo inteiro antes de conferir o tamanho; o vídeo já lê em stream |
| `extracao-isolada.md` | Extração de texto: prazo e limite de páginas | `Promise.race` não interrompe CPU; limite de páginas vem depois de abrir; `tsx` na imagem permite processo filho |
| `restauracao-trava.md` | Restauração: servidor de pé em outro contêiner | a recusa só vê `127.0.0.1:PORT`; desligamento limpo existe em `instrumentation.ts` |
| `correlacao-nos-uploads.md` | Correlação nas rotas de upload | o `matcher` exclui `api/agentes/[id]/fontes...`; só o erro devolve `X-Correlacao` |
| `interface-canal-exclusao-tema.md` | Badge, exclusão do agente e alternador | sem padrão na badge; aviso sem cascata; alternador sem teste e sem `aria-pressed` |
| `auditoria-e-saude.md` | Auditoria que não sobe calada | falha de `ligarAuditoria` só gera log; saúde e Sistema não mostram |
| `testes-rede-e-instabilidade.md` | Trava de rede e teste instável | sem trava global; `4321` colide com o código de referência aleatório |
