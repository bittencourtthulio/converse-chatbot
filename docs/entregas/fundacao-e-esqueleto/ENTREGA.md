---
expx_schema: 1
expx_tool: sprintx
kind: entrega
trabalho_id: fundacao-e-esqueleto
entregue_por: mergex
titulo: Fundacao e esqueleto de aplicacao
tipo_trabalho: feature
tipo_ocorrencia: null
estado: aberto
versionado: true
branch: feat/fundacao-e-esqueleto
branch_base: main
commits: []
modulo_afetado: []
arquivos_alterados: []
faixa_atencao: []
raio: null
atencao:
  olho_obrigatorio: 0
  leitura_rapida: 0
  dispensavel: 0
portao: null
desvios: ["src/app/(sistema)/configuracoes/usuarios/layout.tsx", "src/app/(sistema)/configuracoes/usuarios/loading.tsx", "src/componentes/FormularioDeLogin.tsx", "src/componentes/iniciais.ts", "tests/iniciais.test.ts", "src/componentes/Navegacao.tsx (removido)"]
push_feito: false
pr_url: null
pr_estado: null
criado_em: 2026-09-30
atualizado_em: 2026-09-30
entregue_em: null
origem_buildx: plataforma-chatbot-ia
feature_id: FT-01
---

# Entrega — Fundação e esqueleto de aplicação

Trabalho aberto na branch `feat/fundacao-e-esqueleto`, a partir de `main`.

## Estado da entrega

- Portão de prontidão: a refazer após declarar os desvios
- Push: não feito (não há remoto configurado)
- Pull request: não aberto

## Avisos

- Branch base determinada pela terceira regra do E0 (principal atual), pois não há remoto nem convenção de versionamento declarada.
- Convenção de nome `feat/<slug>` vem do pedido do buildx e vence o padrão `feature/<slug>` da mergex.
- `docs/fundacao-e-esqueleto/ORQUESTRADOR.md` ainda não existe (F4 do sprintx não rodou): a linha da branch será acrescentada lá na F4.
- `.expx/estado.json` não existe: nada gravado.

## Desvios reais do plano (declarados nas tasks que os criaram)

| Arquivo | Task | Por quê |
|---|---|---|
| `src/app/(sistema)/configuracoes/usuarios/layout.tsx` | T-04.02 | A guarda de admin precisou subir acima do `loading.tsx`: com o carregamento no nível do sistema, o redirecionamento de quem não é admin virava um 200 com redirecionamento no navegador, e o teste de rotas (307) acusou. Testado em `tests/rotas.test.ts`. |
| `src/app/(sistema)/configuracoes/usuarios/loading.tsx` | T-04.01, T-04.02 | Nasceu em `(sistema)` e foi movido para a pasta de usuários, pelo mesmo motivo. |
| `src/componentes/FormularioDeLogin.tsx` | T-04.02 | O React limpa o formulário depois da ação; sem ele o e-mail digitado sumia no erro de login. |
| `src/componentes/iniciais.ts`, `tests/iniciais.test.ts` | T-03.03 | Função pura das iniciais do usuário para o menu, testada à parte. |
| `src/componentes/Navegacao.tsx` | T-03.03 | Removido: os itens passaram para `itens-de-menu.ts` e a barra lateral para `BarraLateral.tsx`. |

Arquivos do laço do buildx (`.gitignore`, `docs/projeto/MAPA.md`, `PREMISSAS.md`, `RECURSAO.md`) estão declarados na T-05.04.
