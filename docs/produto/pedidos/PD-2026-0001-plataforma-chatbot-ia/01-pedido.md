---
kind: pedido
schema: expx-schema-v1
pd_id: PD-2026-0001
titulo: Plataforma de chatbot com IA e base de conhecimento
data: 2026-09-30
origem: interno
autor: dono do projeto
canal: comando /buildx
classificacao: novo
gatilhos_disparados: [G1, G2, G8]
aguardando_resposta: false
densidade_sugerida: padrao
densidade_confirmada: false
modo_construcao_sugerido: autonomo
modo_construcao_confirmado: true
---

# PD-2026-0001 — Plataforma de chatbot com IA e base de conhecimento

## 1. Pedido original

> quero um chatbot com ia e integracao com o openrouter, telegram e chat embedado para colocar o script no meu projeto. ele precisa ter como eu subir arquivos e textos e videos para a base de conhecimento dele, interface amigavel e estilo saas padrao

**Quem pediu:** dono do projeto · **Canal:** /buildx · **Quando:** 2026-09-30

## 2. Solução pedida

Um chatbot com IA, integrado ao OpenRouter, ao Telegram e a um chat embutido por
script; com envio de arquivos, textos e vídeos para a base de conhecimento; interface
amigável no estilo de um SaaS padrão.

## 3. Problema por trás

Quem tem conteúdo próprio (documentos, textos, vídeos) não consegue hoje colocar um
assistente que responda com base nele em um site e no Telegram sem programar o
pipeline de IA inteiro. Precisa de uma ferramenta em que alimenta a base por tela,
escolhe o modelo e publica o assistente nos canais.

## 4. Motivação

NAO DETERMINADO. A descrição não diz se é uso interno, produto para clientes ou
vitrine. Registrado em `docs/produto/LACUNAS.md`.

## 5. Pergunta estruturante

> Se isso fosse resolvido de outro jeito, o cliente ficaria satisfeito?

**Resposta:** sim, com um limite.

A solução pedida ("um chatbot") é o artefato; o requisito é "responder a quem
pergunta, com base no conteúdo da empresa, em site e Telegram, sem código". O que o
usuário não abriria mão: o OpenRouter como provedor e o script de embutir.

## 6. Classificação

**novo** — projeto inteiro, sem sistema existente.

## 7. Densidade e forma de construção sugeridas

**Densidade sugerida:** padrao
**Confirmada por quem pediu?** nao — hipótese pelo porte descrito

**Forma de construção sugerida:** autonomo
**Confirmada por quem pediu?** sim — modo escolhido na pergunta única do buildx

## 8. Verificação de comportamento intencional

Não se aplica (classificação `novo`).

## 9. Perguntas em aberto

Quatro lacunas, todas em `docs/produto/LACUNAS.md`. Em modo autônomo nenhuma vira
pergunta ao usuário: cada uma virou premissa provisória e pendência `decisao_humana`.
