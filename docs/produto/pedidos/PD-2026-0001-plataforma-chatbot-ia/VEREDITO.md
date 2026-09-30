---
kind: veredito
schema: expx-schema-v1
pd_id: PD-2026-0001
titulo: Plataforma de chatbot com IA e base de conhecimento
data: 2026-09-30
veredito: fazer
via: avaliacao
gatilhos_disparados: [G1, G2, G8]
aprovado_por: buildx (modo autonomo)
aprovado_em: 2026-09-30
provisorio: true
trabalho_gerado: sprintx:plataforma-chatbot-ia
recorrencia: 0
---

# PD-2026-0001 — Veredito

## Recomendação

**FAZER**

## Raciocínio

1. O problema (atender com base no conteúdo próprio, em site e Telegram, sem programar) não tem solução pronta na casa.
2. Existe versão dez vezes menor que já entrega valor: um agente com arquivos e textos, publicado como chat embutido.
3. O risco principal é custo de IA acionado por visitante anônimo, que se resolve com limites de uso, não com recusa.

## Evidência principal

`docs/produto/pedidos/PD-2026-0001-plataforma-chatbot-ia/02-existencia.md`: repositório
sem código de aplicação.

## O que muda a recomendação

Se o dono quiser vender contas a terceiros (várias empresas isoladas, cadastro público
e cobrança), o veredito para este escopo deixa de valer.

## Escopo mínimo aprovado

Um agente, com um modelo do OpenRouter, que responde com base em arquivos e textos
enviados, publicado como chat embutido por script.

## Assinatura

Auto-assinado pelo buildx. Este veredito é provisório: no modo autônomo o buildx
assume a assinatura que a regra R1 do prodx reservaria a uma pessoa.

**Deve assinar:** buildx (modo autonomo) (provisório)

| Campo | Valor |
|-------|-------|
| Aprovado por | buildx (modo autonomo) |
| Aprovado em | 2026-09-30 |

**Divergência registrada:** nenhuma.

## Comunicação

**Texto ao cliente:** nao se aplica
**Enviado por:** nao se aplica
