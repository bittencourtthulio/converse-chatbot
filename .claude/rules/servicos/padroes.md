---
paths:
  - "src/servicos/**"
---
# Padrões dos serviços

- **Stream:** o serviço devolve `AsyncGenerator` de eventos tipados e não conhece HTTP (`src/servicos/chat.ts`). A rota converte em SSE.
- **Fila em segundo plano** (`fontes-fila.ts`): estado no banco, reivindicação atômica por `updateMany` condicional, concorrência injetável, `processarPendentes()` aguardável, singleton em `globalThis`, iniciada por `src/instrumentation.ts` (só runtime Node, import dinâmico). `acordar()` só age depois de `iniciar()`: o teste de serviço controla a fila.
- **Limitadores e exclusão mútua são em memória e por processo** (login, chat público, Telegram). Atrás de proxy exigem `TRUST_PROXY=1`.
- **Prompt fundamentado** (`chat-prompt.ts`): material da base como dado, marcador aleatório por requisição, higienizado; só a estrutura é testável, não o comportamento do modelo real.
- **Telegram:** o webhook responde 200 antes de atender (`after()` do Next 16); segredo comparado em tempo constante; reinício entre o 200 e a resposta perde a atualização.
- **Auditoria:** de melhor esforço para a maioria das ações; chave, usuário e exclusão de agente são transacionais. A trilha é somente-acréscimo só na aplicação.
- **Transcrição de mídia:** ffmpeg real em teste (`descreverComFfmpeg`, `EXIGIR_FFMPEG=1` no CI); trecho de 10 min sem fala pode derrubar a fonte.
