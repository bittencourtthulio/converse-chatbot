# Lacunas

Uma linha por lacuna: o que se procurou, onde, e o que se concluiu.

1. Formato exato do corpo de `GET /api/v1/key`: a página de limites lista campos (`limit_remaining`, `is_free_tier`, `free_model_daily_requests`), mas o esquema completo e o comportamento de `/auth/key` (rota citada no briefing) não estão na documentação lida; a rota documentada é `/key`. Procurado em `https://openrouter.ai/docs/api-reference/limits.md`. (openrouter-api)
2. Limites de taxa por minuto de chave paga: `NÃO DOCUMENTADO` nas páginas lidas (só o limite de modelos gratuitos: 20 por minuto). (openrouter-api)
3. Tamanho máximo de `messages` e de `max_tokens` por modelo: varia por modelo (`context_length` em `/models`); sem teto global documentado. (openrouter-api)
4. Testes que leiam o SQL das migrations (lacuna 9 de `docs/stack/LACUNAS.md`): não existem; a pasta `prisma/migrations/` tem uma migration só. (banco-e-migrations)
5. Teste de componente que renderize página de servidor com Prisma: `tests/componentes.test.tsx` só renderiza componentes de apresentação; páginas do App Router são cobertas por `tests/rotas.test.ts` (servidor de produção). (interface-e-menu)
6. Ferramentas de navegador (Chrome) para a verificação visual: disponibilidade `NÃO DOCUMENTADO` até a T de verificação. (interface-e-menu)
