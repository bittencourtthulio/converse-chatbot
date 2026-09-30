# Lacunas

Uma linha por lacuna: o que se procurou, onde, e o que se concluiu.

1. Comportamento do `unpdf` com PDF escaneado (sem camada de texto), cifrado ou corrompido: `NÃO DOCUMENTADO` no README (`npm view unpdf readme`); será provado com fixtures na task do adaptador de PDF. (extracao-bibliotecas)
2. Estrutura exata da árvore devolvida pelo `parse5` 8 e das exceções do `mammoth`: não lida; será conferida pelos testes do adaptador. (extracao-bibliotecas)
3. Compatibilidade do `unpdf` (PDF.js com worker embutido) e do `mammoth` com o bundler do Next 16 (`serverExternalPackages`): `NÃO DOCUMENTADO`; procurado nos READMEs e em `node_modules/next/dist/docs`; provar com `npm run build` e o teste de rota. (extracao-bibliotecas)
4. Tamanho máximo do corpo de uma requisição a Route Handler e consumo de memória de `request.formData()` no Next 16: `NÃO DOCUMENTADO` em `route.md`. (servicos-handlers-e-fila)
5. `register()` de `instrumentation.ts` chamado de novo em `next dev` (hot reload) ou durante `next build`: `NÃO DOCUMENTADO` no trecho lido de `instrumentation.md`. (servicos-handlers-e-fila)
6. Limite de tamanho de valor de texto do SQLite/better-sqlite3 relevante para `Trecho.texto`: `NÃO DOCUMENTADO`; não é problema com trechos de ~1000 caracteres. (banco-armazenamento-e-ambiente)
7. Exemplo de `input type=file` com arrastar-e-soltar no repositório: inexistente; procurado em `src/componentes`. (interface-do-agente-e-conhecimento)
8. Ferramentas de navegador para a verificação visual: disponibilidade `NÃO DOCUMENTADO` até a task de verificação. (interface-do-agente-e-conhecimento)
9. Contexto histórico do `memox` para os arquivos tocados: não consultado (índice em `.expx/memoria/`, não versionado); a ausência não é lacuna.
