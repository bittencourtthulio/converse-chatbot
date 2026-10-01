/**
 * A imagem de verdade (FT-11, PR-24, PR-99): constrói a imagem, sobe o conteúdo com o docker-compose.yml
 * (volume nomeado), confere a saúde, o ffmpeg, o usuário não-root, o administrador e a seed de demonstração
 * (só aqui, na verificação), a persistência depois de `down` e `up`, o backup e a restauração POR DENTRO do
 * contêiner, a recusa de restaurar com o servidor de pé e o desligamento limpo no `docker stop`; ao fim
 * remove os contêineres, o volume e a imagem de teste.
 *
 * Só roda com `VERIFICAR_CONTEINER=1` (precisa de Docker e de rede; leva alguns minutos). Segredos
 * descartáveis, gerados na hora e passados inline pelo ambiente do comando: nenhum arquivo os guarda. Tudo
 * leva um nome de projeto e um rótulo próprios: nunca toca em contêiner, volume ou imagem de outro projeto.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { execFile } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const ATIVO = process.env.VERIFICAR_CONTEINER === '1'
const ID = 'ft11'
const PROJETO = 'converse-ft11-teste'
const IMAGEM = 'converse-teste:ft11'
const SENHA_DO_ADMIN = `Senha-${randomBytes(6).toString('hex')}`

let pasta = ''
let override = ''
let base = ''

interface Saida {
  codigo: number
  stdout: string
  stderr: string
}

/** Roda `docker ...` sem shell. O ambiente leva só o PATH e as variáveis do compose desta verificação. */
function docker(args: string[], extra: Record<string, string> = {}, prazoMs = 120_000): Promise<Saida> {
  return new Promise((resolver) => {
    const ambienteDoComando: Record<string, string> = {
      PATH: process.env.PATH ?? '',
      HOME: process.env.HOME ?? '',
      DOCKER_CONFIG: process.env.DOCKER_CONFIG ?? '',
      DOCKER_HOST: process.env.DOCKER_HOST ?? '',
      DOCKER_CONTEXT: process.env.DOCKER_CONTEXT ?? '',
      IMAGEM_DA_VERIFICACAO: IMAGEM,
      ID_DA_VERIFICACAO: ID,
      JWT_SECRET_DA_VERIFICACAO: SEGREDOS.jwt,
      ENCRYPTION_KEY_DA_VERIFICACAO: SEGREDOS.chave,
      PORTA: '0',
      ...extra,
    }
    for (const k of Object.keys(ambienteDoComando)) if (ambienteDoComando[k] === '') delete ambienteDoComando[k]
    execFile('docker', args, { cwd: process.cwd(), env: ambienteDoComando as unknown as NodeJS.ProcessEnv, timeout: prazoMs, maxBuffer: 64 * 1024 * 1024 }, (erro, stdout, stderr) => {
      const codigo = erro ? (typeof (erro as NodeJS.ErrnoException & { code?: unknown }).code === 'number' ? ((erro as unknown as { code: number }).code) : 1) : 0
      resolver({ codigo, stdout: String(stdout), stderr: String(stderr) })
    })
  })
}

const SEGREDOS = { jwt: randomBytes(32).toString('hex'), chave: randomBytes(32).toString('hex') }

const compose = (args: string[], extra: Record<string, string> = {}, prazoMs = 180_000) =>
  docker(['compose', '-f', base, '-f', override, '-p', PROJETO, ...args], extra, prazoMs)
const noConteiner = (args: string[], extra: Record<string, string> = {}, prazoMs = 120_000) => compose(['exec', '-T', ...args], extra, prazoMs)

const descricao = (r: Saida) => `\n--- stdout ---\n${r.stdout.slice(-1500)}\n--- stderr ---\n${r.stderr.slice(-1500)}`

async function esperarSaudavel(prazoMs = 180_000): Promise<string> {
  const fim = Date.now() + prazoMs
  let ultimo = ''
  while (Date.now() < fim) {
    const cid = (await compose(['ps', '-q', 'app'])).stdout.trim()
    if (cid) {
      const estado = (await docker(['inspect', '--format', '{{.State.Health.Status}} {{.State.Status}}', cid])).stdout.trim()
      ultimo = estado
      if (estado.startsWith('healthy')) return cid
      if (estado.endsWith('exited')) throw new Error(`o contêiner saiu antes de ficar saudável: ${(await compose(['logs', '--no-log-prefix', '--tail', '40', 'app'])).stdout}`)
    }
    await new Promise((r) => setTimeout(r, 2_000))
  }
  throw new Error(`o contêiner não ficou saudável a tempo (último estado: ${ultimo})`)
}

async function portaPublicada(): Promise<number> {
  const r = await compose(['port', 'app', '3000'])
  const m = /:(\d+)\s*$/.exec(r.stdout.trim())
  if (!m) throw new Error(`não achei a porta publicada: ${r.stdout}${r.stderr}`)
  return Number(m[1])
}

const entrarNoConteiner = (email: string, senha: string) =>
  noConteiner(
    [
      '-e',
      `E=${email}`,
      '-e',
      `S=${senha}`,
      'app',
      'node_modules/.bin/tsx',
      '-e',
      "import { entrar } from './src/servicos/autenticacao'; entrar({ email: process.env.E, senha: process.env.S }).then(() => console.log('ENTROU'), () => { console.log('RECUSADO'); process.exit(1) }).then(() => process.exit(0))",
    ],
    {},
    60_000,
  )

describe.skipIf(!ATIVO)('a imagem e o contêiner de verdade (VERIFICAR_CONTEINER=1)', () => {
  let nomeDoBackup = ''

  beforeAll(() => {
    pasta = mkdtempSync(path.join(os.tmpdir(), 'converse-conteiner-'))
    base = path.join(process.cwd(), 'docker-compose.yml')
    override = path.join(pasta, 'verificacao.yml')
    // Só referências: os valores vêm inline pelo ambiente de cada comando.
    writeFileSync(
      override,
      [
        'services:',
        '  app:',
        '    image: ${IMAGEM_DA_VERIFICACAO}',
        '    environment:',
        '      JWT_SECRET: ${JWT_SECRET_DA_VERIFICACAO}',
        '      ENCRYPTION_KEY: ${ENCRYPTION_KEY_DA_VERIFICACAO}',
        '      APP_URL: https://verificacao.exemplo.invalid',
        '    labels:',
        '      com.converse.verificacao: ${ID_DA_VERIFICACAO}',
        '',
      ].join('\n'),
    )
  })

  afterAll(async () => {
    // Remove só o que esta verificação criou: o projeto (contêiner, rede, volume) e a imagem.
    await compose(['down', '-v', '--remove-orphans'], {}, 180_000)
    await docker(['rmi', '-f', IMAGEM])
    rmSync(pasta, { recursive: true, force: true })
  }, 300_000)

  it('a imagem constrói, sem publicar nada', async () => {
    const r = await compose(['build'], {}, 1_500_000)
    expect(r.codigo, descricao(r)).toBe(0)
    const imagem = await docker(['image', 'inspect', IMAGEM, '--format', '{{.Config.User}}|{{.Config.Healthcheck.Test}}'])
    expect(imagem.codigo, descricao(imagem)).toBe(0)
    expect(imagem.stdout).toContain('/api/saude')
  }, 1_600_000)

  it('sobe com o volume, fica saudável e GET /api/saude responde 200 com {status:"ok"} (ffmpeg presente)', async () => {
    const r = await compose(['up', '-d'])
    expect(r.codigo, descricao(r)).toBe(0)
    await esperarSaudavel()
    const porta = await portaPublicada()
    const resposta = await fetch(`http://127.0.0.1:${porta}/api/saude`)
    expect(resposta.status).toBe(200)
    expect(await resposta.json()).toEqual({ status: 'ok' })
    expect(resposta.headers.get('x-correlacao')).toMatch(/^[0-9a-f]{8}$/)
    expect((await fetch(`http://127.0.0.1:${porta}/entrar`)).status).toBe(200)
    expect((await fetch(`http://127.0.0.1:${porta}/widget.js`)).status).toBe(200)
  }, 400_000)

  it('o ffmpeg e o ffprobe respondem dentro do contêiner e o processo não é root', async () => {
    const ffmpeg = await noConteiner(['app', 'ffmpeg', '-version'])
    expect(ffmpeg.stdout.split('\n')[0]).toMatch(/^ffmpeg version/)
    const ffprobe = await noConteiner(['app', 'ffprobe', '-version'])
    expect(ffprobe.stdout.split('\n')[0]).toMatch(/^ffprobe version/)
    const uid = await noConteiner(['app', 'id', '-u'])
    expect(uid.stdout.trim()).not.toBe('0')
    const gravavel = await noConteiner(['app', 'sh', '-c', 'touch /data/.prova && rm /data/.prova && echo OK'])
    expect(gravavel.stdout.trim()).toBe('OK')
    const tz = await noConteiner(['app', 'sh', '-c', 'echo $TZ && date +%Z'])
    expect(tz.stdout).toContain('America/Sao_Paulo')
  }, 120_000)

  it('o primeiro administrador criado por admin:criar entra, e a seed de demonstração (só aqui) também', async () => {
    const criar = await noConteiner(['-e', `ADMIN_SENHA=${SENHA_DO_ADMIN}`, 'app', 'npm', 'run', 'admin:criar', '--', 'admin@verificacao.local', 'Admin da verificação'])
    expect(criar.codigo, descricao(criar)).toBe(0)
    expect(criar.stdout + criar.stderr).not.toContain(SENHA_DO_ADMIN)
    expect((await entrarNoConteiner('admin@verificacao.local', SENHA_DO_ADMIN)).stdout).toContain('ENTROU')
    expect((await entrarNoConteiner('admin@verificacao.local', 'senha-errada-123')).stdout).toContain('RECUSADO')

    // A seed recusa produção; só a verificação a roda, com NODE_ENV de desenvolvimento.
    const recusada = await noConteiner(['app', 'node_modules/.bin/tsx', 'prisma/seed.ts'])
    expect(recusada.codigo).not.toBe(0)
    const seed = await noConteiner(['-e', 'NODE_ENV=development', 'app', 'node_modules/.bin/tsx', 'prisma/seed.ts'])
    expect(seed.codigo, descricao(seed)).toBe(0)
    expect((await entrarNoConteiner('admin@exemplo.local', 'demo1234')).stdout).toContain('ENTROU')
  }, 240_000)

  it('a tela Sistema é protegida no contêiner: sem sessão redireciona ao login', async () => {
    const porta = await portaPublicada()
    const sem = await fetch(`http://127.0.0.1:${porta}/configuracoes/sistema`, { redirect: 'manual' })
    expect(sem.status).toBe(307)
    expect(sem.headers.get('location')).toContain('/entrar')
  }, 60_000)

  it('os dados sobrevivem a docker compose down e up (o volume nomeado persiste)', async () => {
    const down = await compose(['down'])
    expect(down.codigo, descricao(down)).toBe(0)
    const ps = await compose(['ps', '-q', 'app'])
    expect(ps.stdout.trim()).toBe('')
    const volume = await docker(['volume', 'ls', '-q', '--filter', `name=${PROJETO}_dados`])
    expect(volume.stdout.trim()).not.toBe('')

    const up = await compose(['up', '-d'])
    expect(up.codigo, descricao(up)).toBe(0)
    await esperarSaudavel()
    expect((await entrarNoConteiner('admin@verificacao.local', SENHA_DO_ADMIN)).stdout).toContain('ENTROU')
    expect((await entrarNoConteiner('usuario@exemplo.local', 'demo1234')).stdout).toContain('ENTROU')
  }, 400_000)

  it('npm run backup funciona dentro do contêiner e grava o arquivo 0600 em /data/backups', async () => {
    const r = await noConteiner(['app', 'npm', 'run', 'backup'])
    expect(r.codigo, descricao(r)).toBe(0)
    const m = /Backup gerado: \/data\/backups\/(backup-\d{8}-\d{6}(?:-\d+)?\.tar\.gz)/.exec(r.stdout)
    expect(m, descricao(r)).not.toBeNull()
    nomeDoBackup = m![1]!
    const ls = await noConteiner(['app', 'sh', '-c', `stat -c '%a %n' /data/backups/${nomeDoBackup}`])
    expect(ls.stdout.trim()).toBe(`600 /data/backups/${nomeDoBackup}`)
    expect(r.stdout).toContain('ENCRYPTION_KEY')
  }, 180_000)

  it('restaurar com o servidor de pé é recusado; com o servidor parado, restaura e os dados voltam', async () => {
    // Um dado a mais depois do backup: o usuário de demonstração é desativado e a restauração o devolve.
    const alterar = await noConteiner([
      'app',
      'node_modules/.bin/tsx',
      '-e',
      "import { prisma } from './src/lib/prisma'; prisma.usuario.deleteMany({ where: { email: 'usuario@exemplo.local' } }).then(() => process.exit(0))",
    ])
    expect(alterar.codigo, descricao(alterar)).toBe(0)
    expect((await entrarNoConteiner('usuario@exemplo.local', 'demo1234')).stdout).toContain('RECUSADO')

    const recusada = await noConteiner(['app', 'npm', 'run', 'restore', '--', `/data/backups/${nomeDoBackup}`])
    expect(recusada.codigo).not.toBe(0)
    expect(recusada.stderr).toMatch(/Pare o servidor/)

    const parar = await compose(['stop', '-t', '30', 'app'])
    expect(parar.codigo, descricao(parar)).toBe(0)
    const restaurar = await compose(['run', '--rm', '-T', 'app', 'npm', 'run', 'restore', '--', `/data/backups/${nomeDoBackup}`], {}, 240_000)
    expect(restaurar.codigo, descricao(restaurar)).toBe(0)
    expect(restaurar.stdout).toContain('Restauração concluída')
    expect(restaurar.stdout).toMatch(/pre-restauracao-/)

    const iniciar = await compose(['start', 'app'])
    expect(iniciar.codigo, descricao(iniciar)).toBe(0)
    await esperarSaudavel()
    expect((await entrarNoConteiner('usuario@exemplo.local', 'demo1234')).stdout).toContain('ENTROU')
    expect((await entrarNoConteiner('admin@verificacao.local', SENHA_DO_ADMIN)).stdout).toContain('ENTROU')
  }, 600_000)

  it('docker stop desliga com calma: código de saída 0 e a linha desligamento_concluido no log', async () => {
    const cid = (await compose(['ps', '-q', 'app'])).stdout.trim()
    const inicio = Date.now()
    const parar = await compose(['stop', '-t', '30', 'app'])
    expect(parar.codigo, descricao(parar)).toBe(0)
    expect(Date.now() - inicio).toBeLessThan(28_000)
    const saida = await docker(['inspect', '--format', '{{.State.ExitCode}}', cid])
    expect(saida.stdout.trim()).toBe('0')
    const log = (await compose(['logs', '--no-log-prefix', 'app'])).stdout
    expect(log).toContain('"msg":"desligamento_iniciado"')
    expect(log).toContain('"msg":"desligamento_concluido"')
    // O log do contêiner não tem pilha nem segredo.
    expect(log).not.toMatch(/\n\s+at\s/)
    expect(log).not.toContain(SEGREDOS.jwt)
    expect(log).not.toContain(SEGREDOS.chave)
    expect(log).not.toContain(SENHA_DO_ADMIN)
  }, 120_000)
})

describe.skipIf(ATIVO)('a imagem e o contêiner de verdade (pulado sem VERIFICAR_CONTEINER=1)', () => {
  it('fica pulado na suíte padrão: precisa de Docker e de rede', () => {
    expect(ATIVO).toBe(false)
  })
})
