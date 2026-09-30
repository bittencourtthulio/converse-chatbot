---
expx_schema: 1
expx_tool: buildx
kind: validacao
projeto_id: <slug-do-projeto>
data: <AAAA-MM-DD>
veredito: <aprovado | aprovado_com_pendencia | reprovado>
itens_conferidos: <n>
itens_atendidos: <n>
itens_parciais: <n>
itens_nao_atendidos: <n>
itens_descartados: <n>
sobe_em_maquina_limpa: <true | false>
premissas_de_seguranca_sem_codigo: <n>
---

# <titulo> — Validação

Conferência do construído contra o `PROJETO.md`. **Confere, não conserta.**

## Veredito

**<APROVADO | APROVADO COM PENDÊNCIA | REPROVADO>**

<Três linhas de justificativa. Se reprovado, a primeira linha diz o quê.>

---

## O sistema de pé

<A verificação que nenhum artefato prova. Numa cópia limpa:>

| Verificação | Resultado |
|---|---|
| dependências instalam | <ok \| falhou: motivo> |
| migrations rodam do zero | <ok \| falhou: motivo> |
| seed de demonstração roda | <ok \| falhou: motivo> |
| o projeto sobe | <ok \| falhou: motivo> |
| usuário de demonstração entra | <ok \| falhou: motivo> |
| as duas variantes de tema alternam e ficam completas | <ok \| falhou: motivo> |
| funciona em largura de celular | <ok \| falhou: motivo> |

<Qualquer falha aqui é nao_atendido de peso alto. Um sistema que não sobe
numa máquina limpa não está entregue, por mais verde que esteja a suíte.>

---

## Conferência — o que foi pedido

| Item | Conclusão | Evidência |
|---|---|---|
| <item do PROJETO.md> | <atendido \| parcial \| nao_atendido \| descartado> | <arquivo + teste, ou o que falta> |

## Conferência — o que foi descoberto

| Item | Premissa | Conclusão | Evidência |
|---|---|---|---|
| <lacuna que virou requisito> | <PR-NN> | <conclusão> | <arquivo + teste> |

## Conferência — critérios de aceite de negócio

| Critério | Conclusão | Evidência |
|---|---|---|
| <critério> | <conclusão> | <o teste que o cobre> |

## Conferência — premissas

<A mais importante do B6, e a mais fácil de pular por parecer burocrática.
Premissa de segurança registrada que nunca virou código documenta uma
proteção que não existe — e alguém vai confiar nela.>

| Premissa | Feature | Conclusão | Evidência |
|---|---|---|---|
| <PR-NN> | <FT-NN> | <conclusão> | <o código que a realiza + o teste que prova que a proteção funciona> |

## Conferência — features

| ID | PR | Suíte | mergex-check | Conclusão |
|---|---|---|---|---|
| FT-NN | <#n \| —> | <verde \| vermelha> | <pronto \| bloqueado> | <conclusão> |

---

## Itens não atendidos

| Item | Por quê | Destino |
|---|---|---|
| <item> | <motivo> | <feature nova no B3 \| pendência declarada> |

---

<!--
O QUE CONTA COMO EVIDÊNCIA

  funcionalidade  → o arquivo que implementa E o teste que verifica.
                    Código sem teste é PARCIAL, nunca atendido.
  premissa de     → o código que a realiza, e o teste que prova que a
  segurança         proteção funciona. Verificação de permissão sem teste
                    que tente violá-la não é evidência.
  feature         → PR aberto, suíte verde, mergex-check PRONTO.
  interface       → as duas variantes completas, os tres estados de tela
                    tratados, responsivo, e nenhuma cor literal em componente.
                    Aqui vale abrir a aplicacao e olhar.

O QUE NUNCA CONTA

  o MAPA.md dizer "entregue"
  a task estar "concluida"
  o plano prever a coisa
  o nome de um arquivo sugerir o conteúdo

A REGRA QUE NÃO SE DOBRA

Nenhuma premissa de segurança sem código sai como aprovado_com_pendencia.
Ou vira feature e roda outro ciclo, ou o veredito é reprovado e o relatório
abre com isso. Autenticação, autorização, validação de entrada e proteção
de segredo não têm versão parcial aceitável.
-->
