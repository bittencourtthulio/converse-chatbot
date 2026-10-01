/**
 * Os arquivos de contêiner (FT-11, PR-24, PR-99), conferidos sem Docker: o Dockerfile (imagem base, ffmpeg,
 * usuário não-root, volume, healthcheck, entrypoint), o entrypoint (migrations antes do servidor, `exec`), o
 * compose (volume nomeado, reinício, healthcheck, proxy, desligamento) e o .dockerignore (sem segredo, banco
 * nem dado). A execução de verdade da imagem é `tests/conteiner-imagem.test.ts`.
 */
import { describe, expect, it } from 'vitest'
import { execFileSync, spawnSync } from 'node:child_process'
import { readFileSync, statSync } from 'node:fs'
import path from 'node:path'

const ler = (arquivo: string) => readFileSync(path.join(process.cwd(), arquivo), 'utf8')
const dockerfile = ler('Dockerfile')
const entrypoint = ler('docker-entrypoint.sh')
const compose = ler('docker-compose.yml')
const ignore = ler('.dockerignore')

/** O Dockerfile sem comentários nem linhas em branco, com as continuações com barra invertida juntadas. */
const instrucoes = dockerfile
  .replace(/\\\n/g, ' ')
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l !== '' && !l.startsWith('#'))

describe('Dockerfile', () => {
  it('usa node:22-bookworm-slim em três estágios (dependências, construção e final)', () => {
    const froms = instrucoes.filter((l) => l.startsWith('FROM '))
    expect(froms).toEqual([
      'FROM node:22-bookworm-slim AS dependencias',
      'FROM dependencias AS construcao',
      'FROM node:22-bookworm-slim AS final',
    ])
  })

  it('instala o ffmpeg (que traz o ffprobe) e o tzdata na imagem final', () => {
    const final = instrucoes.slice(instrucoes.findIndex((l) => l.startsWith('FROM node:22-bookworm-slim AS final')))
    const apt = final.find((l) => l.includes('apt-get install'))!
    expect(apt).toMatch(/\bffmpeg\b/)
    expect(apt).toMatch(/\btzdata\b/)
    expect(apt).toContain('--no-install-recommends')
  })

  it('gera o cliente do Prisma e constrói com o next build, e poda as dependências de desenvolvimento', () => {
    expect(instrucoes.some((l) => l === 'RUN npx prisma generate')).toBe(true)
    const construir = instrucoes.find((l) => l.includes('npm run build'))!
    expect(construir).toContain('npm prune --omit=dev')
    expect(instrucoes.some((l) => l.startsWith('COPY src ./src'))).toBe(true) // inclui src/widget/widget.js
    expect(instrucoes.some((l) => l.startsWith('COPY scripts ./scripts'))).toBe(true)
  })

  it('roda como o usuário não-root node, com /data como volume e as variáveis de caminho dentro dele', () => {
    expect(instrucoes).toContain('USER node')
    expect(instrucoes).toContain('VOLUME ["/data"]')
    const env = instrucoes.find((l) => l.startsWith('ENV NODE_ENV=production'))!
    for (const par of ['DATABASE_URL=file:/data/app.db', 'STORAGE_DIR=/data/storage', 'BACKUP_DIR=/data/backups', 'TZ=America/Sao_Paulo', 'NEXT_MANUAL_SIG_HANDLE=1', 'PORT=3000']) {
      expect(env, par).toContain(par)
    }
    // /data pertence ao usuário que roda o servidor.
    expect(instrucoes.some((l) => l.includes('chown node:node /data'))).toBe(true)
    // O USER vem depois de toda a instalação (nada de root no fim) e antes do ENTRYPOINT.
    expect(instrucoes.indexOf('USER node')).toBeLessThan(instrucoes.findIndex((l) => l.startsWith('ENTRYPOINT')))
  })

  it('tem HEALTHCHECK em /api/saude e o entrypoint docker-entrypoint.sh com o comando servidor', () => {
    const hc = instrucoes.find((l) => l.startsWith('HEALTHCHECK'))!
    expect(hc).toContain('/api/saude')
    expect(hc).toContain('--start-period')
    expect(instrucoes).toContain('ENTRYPOINT ["docker-entrypoint.sh"]')
    expect(instrucoes).toContain('CMD ["servidor"]')
  })

  it('não leva segredo: só valores descartáveis no build e nenhuma ENCRYPTION_KEY', () => {
    expect(dockerfile).not.toMatch(/ENCRYPTION_KEY\s*=/)
    const comJwt = instrucoes.filter((l) => l.includes('JWT_SECRET'))
    expect(comJwt).toHaveLength(1)
    expect(comJwt[0]).toContain('descartavel')
    expect(dockerfile).not.toMatch(/ADD\s+https?:/)
  })
})

describe('docker-entrypoint.sh', () => {
  it('aplica as migrations antes de executar o servidor com exec, e executa qualquer outro comando direto', () => {
    expect(entrypoint.startsWith('#!/bin/sh')).toBe(true)
    expect(entrypoint).toContain('set -e')
    const migrar = entrypoint.indexOf('prisma/build/index.js migrate deploy')
    const servir = entrypoint.indexOf('exec node node_modules/next/dist/bin/next start')
    expect(migrar).toBeGreaterThan(0)
    expect(servir).toBeGreaterThan(migrar)
    expect(entrypoint).toMatch(/-H 0\.0\.0\.0/)
    expect(entrypoint).toMatch(/\*\)\s+exec "\$@"/)
    expect(entrypoint).toContain('DATABASE_URL')
  })

  it('tem sintaxe válida de shell POSIX', () => {
    const r = spawnSync('sh', ['-n', path.join(process.cwd(), 'docker-entrypoint.sh')])
    expect(r.status, r.stderr.toString()).toBe(0)
  })

  it('o Dockerfile o torna executável e ele não está versionado como dado de ambiente', () => {
    expect(instrucoes.some((l) => l.includes('chmod +x /usr/local/bin/docker-entrypoint.sh'))).toBe(true)
    expect(statSync(path.join(process.cwd(), 'docker-entrypoint.sh')).size).toBeGreaterThan(100)
  })
})

describe('docker-compose.yml', () => {
  it('tem o serviço com volume nomeado, reinício, init, proxy, fuso e desligamento calmo', () => {
    expect(compose).toMatch(/restart:\s*unless-stopped/)
    expect(compose).toMatch(/init:\s*true/)
    expect(compose).toMatch(/- dados:\/data/)
    expect(compose).toMatch(/^volumes:\s*\n\s+dados:/m)
    expect(compose).toContain('TRUST_PROXY: "1"')
    expect(compose).toMatch(/TZ:\s*\$\{TZ:-America\/Sao_Paulo\}/)
    expect(compose).toMatch(/stop_grace_period:\s*30s/)
  })

  it('lê o arquivo de ambiente do operador sem exigi-lo e só publica a porta no endereço local, para o proxy HTTPS', () => {
    expect(compose).toMatch(/env_file:\s*\n\s+- path: \.env\s*\n\s+required: false/)
    expect(compose).toContain('"127.0.0.1:${PORTA:-3000}:3000"')
  })

  it('tem healthcheck em /api/saude', () => {
    expect(compose).toMatch(/healthcheck:/)
    expect(compose).toContain('/api/saude')
    expect(compose).toMatch(/start_period:\s*60s/)
  })

  it('não traz segredo nem valor de chave', () => {
    expect(compose).not.toMatch(/JWT_SECRET\s*:|ENCRYPTION_KEY\s*:|ADMIN_SENHA\s*:/)
  })

  it('o docker compose config valida o arquivo (pulado sem Docker)', () => {
    const tem = spawnSync('docker', ['compose', 'version'], { stdio: 'ignore' }).status === 0
    if (!tem) return
    const saida = execFileSync('docker', ['compose', '-f', 'docker-compose.yml', 'config', '--format', 'json'], {
      cwd: process.cwd(),
      env: { PATH: process.env.PATH ?? '', HOME: process.env.HOME ?? '', DOCKER_CONFIG: process.env.DOCKER_CONFIG ?? '' },
      encoding: 'utf8',
    })
    const config = JSON.parse(saida) as { services: { app: { restart: string; init: boolean; stop_grace_period: string; volumes: Array<{ source: string; target: string }> } }; volumes: Record<string, unknown> }
    expect(config.services.app.restart).toBe('unless-stopped')
    expect(config.services.app.init).toBe(true)
    expect(config.services.app.volumes).toEqual([expect.objectContaining({ source: 'dados', target: '/data' })])
    expect(Object.keys(config.volumes)).toEqual(['dados'])
  }, 60_000)
})

describe('.dockerignore', () => {
  const linhas = ignore.split('\n').map((l) => l.trim()).filter((l) => l !== '' && !l.startsWith('#'))

  it('deixa de fora o arquivo de segredos, o banco, o storage, os backups, as dependências e o build', () => {
    for (const padrao of ['.env', '.env.*', '*.db', 'storage', 'backups', 'node_modules', '.next', '.git', 'tests', 'docs']) {
      expect(linhas, padrao).toContain(padrao)
    }
    expect(linhas).toContain('!.env.example')
  })
})
