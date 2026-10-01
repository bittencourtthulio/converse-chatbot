---
expx_schema: 1
expx_tool: sprintx
kind: entrega
trabalho_id: operacao-e-backup
origem_buildx: plataforma-chatbot-ia
feature_id: FT-11
entregue_por: mergex
titulo: Operação e backup
tipo_trabalho: feature
tipo_ocorrencia: null
estado: aberto
versionado: true
branch: feat/operacao-e-backup
branch_base: feat/privacidade-e-auditoria
commits: []
modulo_afetado: []
arquivos_alterados: []
faixa_atencao: []
raio: null
atencao: []
portao: null
desvios:
  - "T-01.02: teste e instalação de teste gravados juntos (sem vermelho observado)"
  - "T-01.03: citações de linha de src/lib/ambiente.ts refeitas em tests/projeto.test.ts e docs/stack/CONVENCOES.md"
  - "T-02.01: o proxy truncava o corpo de upload em 10 MB (a suíte inteira achou, tests/video-rota); o matcher de src/proxy.ts passou a excluir api/agentes/[id]/fontes"
  - "T-05.02: link simbólico pendente no storage quebrava o follow do tar; corrigido com um espelho de links por arquivo listado"
  - "T-05.06: o .gitignore ignorava backups/ em qualquer nível e escondia src/app/api/backups; passou a /backups/"
  - "T-06.02: duas restaurações no mesmo segundo colidiam no nome de pre-restauracao; ganhou sufixo numérico. A troca entre volumes (EXDEV) só tem o caminho de cópia, não exercitado"
  - "T-07.01: o desligamento usa NEXT_MANUAL_SIG_HANDLE=1 e register() instala o tratamento de SIGTERM"
  - "T-07.03: prisma e tsx passaram de devDependencies para dependencies, porque a imagem de produção os executa"
  - "T-08.03: global.css estava declarado e não precisou de alteração (a verificação no navegador não achou defeito)"
  - "As tasks de prova e as que só criaram arquivos de teste novos ficaram com suite parcial; a suíte inteira rodou ao fim de cada sprint e no fechamento"
push_feito: false
pr_url: null
pr_estado: null
criado_em: 2026-10-01
atualizado_em: 2026-10-01
entregue_em: null
---

# Entrega — FT-11 Operação e backup

Branch aberta em 2026-10-01 a partir de `feat/privacidade-e-auditoria` (PRs empilhados; base determinada pelo pedido do buildx, sem remoto configurado).

Critério do campo `suite` por task: `parcial` quando rodou um subconjunto dos testes; `verde` só quando a suíte inteira (`npm test`) rodou. A suíte inteira roda ao fechar cada task que mexe em código compartilhado e ao fim de cada sprint.
