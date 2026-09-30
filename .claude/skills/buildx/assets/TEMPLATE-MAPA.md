---
expx_schema: 1
expx_tool: buildx
kind: mapa
projeto_id: <slug-do-projeto>
atualizado_em: <AAAA-MM-DD>
total_features: <n>
pendentes: <n>
em_andamento: <n>
entregues: <n>
bloqueadas: <n>
---

# <titulo> — Mapa de features

Ordem de dependência. Nenhuma feature precede aquilo de que depende.

## Painel

| ID | Feature | Status | PR |
|---|---|---|---|
| FT-01 | <titulo> | <pendente \| em_andamento \| entregue \| bloqueada> | <#n \| —> |

---

### FT-01 — <titulo>

**Slug:** `<slug-da-feature>` → `docs/<slug-da-feature>/`
**Entrega:** <o que o usuário do sistema consegue fazer que não conseguia.
Verificável, sem adjetivo, numa frase.>
**Depende de:** <[FT-NN, ...] ou []>
**Paralelizável:** <true | false>
**Origem:** <descricao | premissa | recursao>
**Premissas que realiza:** <[PR-NN, ...] ou []>
**Módulo disponível:** <id do modulo | ->
**Fatias candidatas:** <slugs separados por virgula | ->
**Status:** <pendente | em_andamento | entregue | bloqueada>

<Se bloqueada:>
**Bloqueada por:** <o motivo exato — o que a mergex-check reprovou, o
achado da F5, ou o que a F6 não conseguiu resolver>
**Pendência:** <o item correspondente no RECURSAO.md>

<Se entregue:>
**PR:** <#numero>
**Sprints:** <n>
**Testes:** <n>

---

<!--
A FT-01 É SEMPRE A FUNDAÇÃO

Autenticação, modelo de usuário e papéis — porque toda outra feature vai
verificar quem está pedindo, e acrescentar autorização depois exige
revisar toda rota já escrita.

Junto com ela, e não em feature separada:

  P-5  usuário de demonstração — a conta com que se entra
  P-6  casca visual — barra de atividade, barra lateral, barra de status
       e alternância de tema, funcionando
  P-9  esqueleto de aplicação — painel inicial, Configurações > Usuários,
       Meu perfil e troca de senha, com os itens já na barra lateral

São o que torna a FT-01 demonstrável: uma tela de login com acabamento, uma
conta para entrar, um lugar aonde chegar depois de entrar, e como criar a
segunda conta sem abrir o banco à mão.

Nenhuma feature de negócio recria o que o P-9 entrega: ela acrescenta item
à barra lateral, não uma segunda área de configurações.

OS TRÊS TESTES DE UMA FEATURE

  Vertical     — atravessa apresentação, aplicação e dados?
  Enunciável   — cabe em "o usuário consegue ___ que antes não conseguia"?
  Demonstrável — dá para mostrar funcionando, sem explicar o que falta?

Falhou em um: não é feature. Junte com outra, ou é task dentro de uma.

O QUE O B6 CONFERE NESTE ARQUIVO

Toda premissa do PREMISSAS.md precisa aparecer em "premissas que realiza"
de alguma feature. Premissa órfã é a falha mais cara deste método: ela
documenta uma proteção que ninguém construiu.
-->
