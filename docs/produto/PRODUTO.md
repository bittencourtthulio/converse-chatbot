---
kind: produto
schema: expx-schema-v1
produto: Converse
criado_em: 2026-09-30
atualizado_em: 2026-09-30
modelo_negocio: instalacao_por_cliente
signatario: buildx (modo autonomo)
signatario_provisorio: true
tem_perfil_legadox: false
lacunas_abertas: 4
---

# Produto — Converse

> Nome provisório do produto, definido pelo buildx (PR-03). É configurável por `APP_NAME`.
> Este arquivo foi montado a partir da descrição do usuário, sem sistema existente (prodx em modo greenfield).

## 1. O que o produto é

Plataforma para criar agentes de atendimento com IA que respondem a partir da
base de conhecimento da própria empresa. A equipe cria um agente, escolhe o modelo
de linguagem (via OpenRouter), alimenta a base com arquivos, textos e vídeos e
publica o agente em três lugares: um chat embutido em qualquer site por um script,
um bot do Telegram e o painel de testes. Serve a quem quer atender clientes e
visitantes sem montar um pipeline de IA do zero.

## 2. O que o produto deliberadamente NÃO é

- Não é um marketplace nem um serviço multi-conta com cadastro público, planos e cobrança (PR-02).
- Não é uma central de atendimento humano: não há fila de tickets, transferência para atendente nem SLA.
- Não treina nem faz ajuste fino de modelo: o agente responde por recuperação de trechos da base e instruções, com o modelo escolhido no OpenRouter.
- Não analisa imagens de vídeo: o vídeo entra na base como transcrição de fala (PR-09).
- Não é um site institucional: a interface é de ferramenta de trabalho.

## 3. Cliente que paga e usuário que usa

| | Quem | Observação |
|---|---|---|
| Paga | a empresa que instala a plataforma e paga o uso do OpenRouter | a fatura de IA é da empresa, não de quem conversa |
| Usa (painel) | equipe interna que configura agentes e alimenta a base | |
| Usa (chat) | visitante do site e usuário do Telegram, anônimos | não têm conta na plataforma |

O visitante anônimo aciona custo de IA que a empresa paga. Por isso limites de uso
e controle de domínio existem desde a primeira versão (PR-16).

## 4. Perfis de usuário

| Perfil | O que faz no sistema |
|--------|---------------------|
| admin | tudo do usuário, mais: usuários, chave do OpenRouter, privacidade, sistema |
| usuario | cria e configura agentes, alimenta a base, conecta canais, lê conversas |
| visitante | conversa com um agente publicado, sem login |

## 5. Modelo de negócio

instalacao_por_cliente

Uma instalação, um workspace. Pedido que serve a um cliente só é decisão de
instalação, não de produto multi-cliente.

## 6. Objetivos de negócio vigentes

| Objetivo | Horizonte |
|----------|-----------|
| Ter um agente respondendo com base em documentos próprios, publicado em um site | primeira entrega |
| Atender também pelo Telegram com o mesmo agente | primeira entrega |
| Alimentar a base com arquivo, texto e vídeo sem ajuda de desenvolvedor | primeira entrega |

## 7. Restrições que não se negociam

| Restrição | Natureza | Origem |
|-----------|----------|--------|
| Dados pessoais de visitantes tratados conforme a LGPD | regulatoria | Lei 13.709/2018 |
| Chave do OpenRouter e token do Telegram nunca expostos ao navegador nem ao repositório | tecnica | PR-14 |
| O script embutido não pode depender do framework do site que o hospeda | tecnica | pedido original |

## 8. Quem decide

**Signatário:** buildx (modo autonomo)
**Provisório:** sim

Falta confirmar com o dono do projeto: o modelo de negócio (instalação própria
versus serviço com várias contas, PR-02) e o nome do produto (PR-03). Enquanto
isso, todos os vereditos saem provisórios.

## 9. Zonas de risco

sem PERFIL.md do legadox (projeto novo, sem legado).

| Zona | Por que é risco |
|------|-----------------|
| Endpoint público de chat | qualquer pessoa aciona custo de IA |
| Credenciais de terceiros (OpenRouter, Telegram) | vazamento gera custo e permite se passar pelo bot |
| Conversas de visitantes | dado pessoal em texto livre |

## 10. Mapa de funcionalidades existentes

Produto novo: nenhuma funcionalidade existe. O mapa vira o `MAPA.md` do buildx.
