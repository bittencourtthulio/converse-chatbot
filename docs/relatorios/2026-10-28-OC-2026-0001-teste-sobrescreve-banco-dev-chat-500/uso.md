---
expx_schema: 1
expx_tool: runx
kind: relatorio_uso
trabalho_id: OC-2026-0001
titulo: Conversa com o agente falhava depois de rodar as verificações do sistema
tipo_ocorrencia: bug
fechado_em: 2026-10-28
modulo_afetado: [conversa com o agente]
---

# O que aconteceu e o que mudou

## O que estava acontecendo

A conversa com o agente mostrava a mensagem "Não foi possível concluir". Isso acontecia depois de rodar as verificações automáticas do sistema.

Essas verificações usavam, sem querer, os mesmos dados que você usa no dia a dia. Elas trocaram os seus dados por dados de exemplo. A chave de acesso ao serviço de respostas foi uma das coisas trocadas. Por isso o agente deixou de responder.

## O que muda a partir de agora

As verificações automáticas passam a usar só dados próprios, separados dos seus. Elas não mexem mais no que você cadastrou.

## Se é preciso fazer algo diferente

Não é preciso fazer nada diferente no uso do dia a dia.

## Se é preciso refazer alguma coisa que ficou errada no período

Sim. Os dados que existiam antes foram perdidos e não há cópia deles.

1. Entre com um usuário administrador.
2. Cadastre de novo a chave do serviço de respostas, em Configurações, na aba Integrações.
3. Crie de novo os agentes e as fontes de conhecimento que você usava.
4. Convide de novo as pessoas que tinham acesso.

Depois disso, a conversa volta a funcionar.
