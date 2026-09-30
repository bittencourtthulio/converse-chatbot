---
expx_schema: 1
expx_tool: buildx
kind: relatorio
projeto_id: <slug-do-projeto>
data: <AAAA-MM-DD>
modo: <autonomo | briefing>
features_entregues: <n>
features_bloqueadas: <n>
prs_abertos: <n>
pendencias_declaradas: <n>
premissas_registradas: <n>
ciclos_recursao: <n>
veredito_validacao: <aprovado | aprovado_com_pendencia | reprovado>
---

# <titulo>

<Uma frase dizendo o que o sistema faz. Escrita para quem não acompanhou
nada — porque foi exatamente isso que aconteceu.>

**<n> features entregues · <n> PRs abertos · <n> pendências · <n> premissas**

---

## 1. O que você precisa decidir

<Primeiro de tudo. As pendências `decisao_humana` — o que o buildx não
decidiu porque não podia: regra de negócio não declarada, escolha com
consequência comercial, premissa provisória que precisa de confirmação.>

### <assunto>

**A decisão:** <em uma frase>
**As opções:** <as alternativas reais, com o efeito de cada uma>
**O que fiz enquanto isso:** <a decisão provisória, e onde ela está no código>
**Se mudar:** <o que custa>

<Se não houver nenhuma: "Nada. Todas as decisões couberam nas premissas
registradas abaixo.">

---

## 2. O que você precisa providenciar

<As pendências `recurso_externo`. O que falta e não está na máquina.>

| O que falta | O que destrava | Estado atual |
|---|---|---|
| <credencial, acesso, conta, domínio> | <o que passa a funcionar> | <normalmente: construído e não conectado> |

<Se não houver: "Nada.">

---

## 3. O que foi decidido por você

<As premissas. Ordem: segurança primeiro, depois stack, depois o resto.>

**Como revisar isto em cinco minutos:** leia só a coluna *o que invalida*.
Se aquilo é verdade no seu caso, a premissa merece sua atenção. Se não é,
siga em frente.

| # | Decisão | O que invalida |
|---|---|---|
| PR-NN | <o que foi decidido> | <o fato que derruba> |

<Premissas marcadas provisórias aparecem também na seção 1.>

---

## 4. O que ficou pronto

| Feature | O que você consegue fazer | PR | Testes |
|---|---|---|---|
| <titulo> | <a entrega, na linguagem de quem usa> | <#n> | <n> |

<Cada PR está aberto, com a suíte verde e a descrição montada. O pacote de
teste manual de cada feature está em `docs/<slug>/` — é o caminho para
conferir sem abrir o editor.>

---

## 5. O que não ficou

| Feature | Por quê | O que existe |
|---|---|---|
| <titulo> | <motivo> | <o que foi construído antes de parar> |

<Se não houver: "Nada. Todas as features do mapa foram entregues.">

---

## 6. Como rodar

```bash
<instalar dependências>
<rodar migrations>
<rodar a seed de demonstração>
<subir>
```

**Entre com o usuário de demonstração:**

```
e-mail: <o e-mail fictício da seed>
senha:  <a senha fictícia da seed>
```

<Credenciais fictícias, criadas pela seed, para uso local. A seed de
demonstração não roda em produção.>

O sistema abre em `<endereço>`. O tema acompanha a preferência do seu
sistema e pode ser alternado na interface.

**O que já está lá, sem você ter pedido** (padrão P-9):

| Onde | O que dá para fazer |
|---|---|
| Painel | a tela inicial, onde o login desemboca |
| Configurações → Usuários | cadastrar, editar, desativar e dar papel a quem entra — só `admin` vê |
| Meu perfil | trocar o próprio nome e e-mail |
| Meu perfil → Senha | trocar a própria senha, exigindo a atual |

É por aí que você cria a sua conta de verdade e para de usar a de
demonstração.

---

## 7. O que fazer agora

1. **Revise as decisões da seção 1**, se houver. São o que pode ter sido
   decidido diferente do que você faria.
2. **Confira as premissas da seção 3** pelo campo *o que invalida*.
3. **Revise os PRs e faça o merge.** Eles estão abertos, verdes e descritos
   — mas **integrar código é decisão sua**, e é a última rede antes de
   produção. Não fiz merge de nada, e não vou fazer.

---

## Onde está tudo

| Arquivo | Conteúdo |
|---|---|
| `docs/projeto/PROJETO.md` | o escopo completo, com sua descrição original |
| `docs/projeto/PREMISSAS.md` | toda decisão tomada em seu nome |
| `docs/projeto/MAPA.md` | as features e o estado de cada uma |
| `docs/projeto/RECURSAO.md` | as pendências, classificadas |
| `docs/projeto/VALIDACAO.md` | a conferência item a item |
| `docs/stack/CONVENCOES.md` | as convenções técnicas do projeto |
| `docs/<slug>/` | o plano, as decisões e o QA de cada feature |

O método Expx está instalado neste projeto. Daqui em diante: `/sprintx`
para feature nova, `/runx` para defeito, `/mergex` para entregar.

---

<!--
A ORDEM DESTE RELATÓRIO É DELIBERADA.

O que exige ação vem antes do que foi feito. Um relatório que abre com
onze features entregues e esconde na página três que a regra de cálculo
foi chutada é desonesto na estrutura, mesmo dizendo tudo.
-->
