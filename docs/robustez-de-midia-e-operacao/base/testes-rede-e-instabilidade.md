# Testes: trava contra rede real e teste instável

## Contrato de entrada

`vitest.config.ts` define `setupFiles: ['tests/setup.ts']`, `fileParallelism: false`, `testTimeout: 30_000`, `hookTimeout: 180_000` (`vitest.config.ts:6-14`). `tests/setup.ts` fixa `DATABASE_URL`, `JWT_SECRET`, `ENCRYPTION_KEY`, `STORAGE_DIR` e `BACKUP_DIR` temporários e aplica as migrations em `beforeAll` (`tests/setup.ts:11-48`). Os simulados de rede são servidores HTTP locais: `tests/apoio/openrouter-falso.ts`, `telegram-falso.ts`, `youtube-falso.ts` (URL base por variável de ambiente).

## Contrato de saída

Nenhuma trava global: nada impede `fetch('https://api.openrouter.ai')` num teste (A-03 de `premissas-01-34.md`, PR-26). `tests/embed-pagina.test.ts:84-88` proíbe `4321` (o `limiteDiario` do agente, `:42`) no HTML do embed; o 404 traz o "Código de referência" com 8 hexadecimais aleatórios que pode conter `4321` (lacuna 50 de `docs/stack/LACUNAS.md`, PEND-30).

## Limites e cotas

Probabilidade: 5 posições possíveis de `4321` num código de 8 hexadecimais, cada uma com 1/65536; o relato é uma falha em 14 execuções da suíte inteira (`docs/stack/LACUNAS.md`, lacuna 50). Servidores de `next start` dos testes usam portas fixas (3194, 3250 a 3252...; `tests/apoio/servidor.ts`).

## Erros conhecidos e tratamento

Rede de saída em Node: `fetch` (undici) e `http`/`https` abrem sockets com `net.Socket.prototype.connect`; `net.connect` e `tls.connect` também. Um teste que sobe `next start` roda o servidor em outro processo, fora do alcance do `setup` do vitest (o servidor fala com o simulado local por `OPENROUTER_BASE_URL`).

## Riscos para a nossa implementação

(1) Bloquear só `fetch` deixa `http.request` de fora; bloquear `net.Socket.prototype.connect` cobre `http`, `https`, `net` e o `fetch` do Node (NÃO DOCUMENTADO neste repositório; a F6 prova com teste). (2) Loopback precisa seguir funcionando: `localhost`, `127.0.0.0/8`, `::1` (e `0.0.0.0`/`::` como destino local); socket de domínio Unix também. (3) Algum teste existente pode tocar a rede sem querer (resolução de DNS de um host real): a suíte inteira mostra. (4) A lista de permissões vazia e comentada precisa ser um valor exportado, testado. (5) Para o teste instável, o `4321` precisa sair do alcance do acaso: afirmar com borda de palavra, ou remover os 8 hexadecimais do HTML antes de procurar; o laço de 30 execuções prova a estabilidade.

## Fonte

`vitest.config.ts`, `tests/setup.ts`, `tests/apoio/servidor.ts`, `tests/embed-pagina.test.ts`, `docs/projeto/validacao/premissas-01-34.md` (A-03), `docs/stack/LACUNAS.md` (lacuna 50) — acessado em 2026-10-01
