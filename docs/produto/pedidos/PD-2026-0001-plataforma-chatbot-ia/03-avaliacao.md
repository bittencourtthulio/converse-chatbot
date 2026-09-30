---
kind: avaliacao
schema: expx-schema-v1
pd_id: PD-2026-0001
data: 2026-09-30
dentro_do_escopo: sim
beneficiario: todos
serve_objetivo: sim
custo_de_nao_fazer: processo_manual
tem_solucao_fora_do_software: true
recorrencia: 0
---

# PD-2026-0001 — Avaliação

## 1. Está dentro do que o produto é?

**sim**

O pedido define o produto. Nenhuma das negativas do `PRODUTO.md` o contradiz.

## 2. Quem se beneficia?

**todos** — equipe que opera e visitantes que perguntam.

| Opção | Custo | Consequência |
|-------|-------|--------------|
| Virar customização | baixo | instalação para uma empresa só |
| Virar produto multi-conta | alto | cadastro público, isolamento de dados, cobrança |
| Recusar | zero | sem entrega |

O buildx assumiu a primeira (PR-02), por ser a menos irreversível de desfazer para
cima. É decisão de produto a confirmar pelo dono.

## 3. Qual objetivo de negócio isso serve?

Todos os três do `PRODUTO.md` (agente com base própria, Telegram, alimentar a base).

## 4. Qual o custo de NÃO fazer?

**processo manual** — atendimento repetitivo feito por gente. Volume não informado.

## 5. Existe solução fora do software?

**sim**, e por isso a decisão de construir precisa ser consciente.

| Alternativa | Resolve? | Por quê |
|-------------|----------|---------|
| Serviço SaaS pronto de chatbot com base de conhecimento | sim, em parte | mensalidade, dados fora da casa, sem OpenRouter |
| Treinamento da equipe | não | não escala |
| Ajuste de processo | não | não cobre o site nem o Telegram |

O pedido escolhe construir: fica registrado que existe alternativa comprada.

## 6. Escopo mínimo

**A versão dez vezes menor:** um agente, com um modelo do OpenRouter, que responde
com base em arquivos e textos enviados, publicado como chat embutido por script.

**O que ela deliberadamente deixa de fora:** Telegram, vídeo, histórico consultável,
privacidade avançada, backup. Todos continuam no mapa, depois do mínimo.

**Se o escopo mínimo for igual ao pedido:** não é. Existe versão menor.

## 7. Recorrência

**recorrencia:** 0

Nenhum pedido anterior.

## Achados destacados

- Custo de IA acionado por visitante anônimo: exige limite de uso desde o início (PR-16).
- Vídeo e Telegram são pedidos explícitos, mas não pertencem ao mínimo que já entrega valor.
- O script embutido só funciona em produção com URL pública HTTPS (PR-24).

## O que muda a recomendação

Se o dono quiser vender contas a terceiros, muda o modelo de dados inteiro
(isolamento por conta, cadastro público, cobrança) e a decisão deixa de ser `fazer`
com este escopo.
