import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // O teste de rotas sobe o servidor de produção e espera por ele.
    testTimeout: 30_000,
    hookTimeout: 180_000,
    setupFiles: ['tests/setup.ts'],
    // O banco de teste é um arquivo só, e cada teste limpa o que criou.
    // Rodar em paralelo sobre o mesmo arquivo produz falha intermitente.
    fileParallelism: false,
  },
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
})
