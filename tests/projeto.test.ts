/**
 * Confere os arquivos de projeto que não são código mas que quebram a
 * instalação de quem chega: scripts, exemplo de ambiente, pipeline e README.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const raiz = process.cwd()
const ler = (arquivo: string) => readFileSync(path.join(raiz, arquivo), 'utf8')
const pacote = JSON.parse(ler('package.json')) as {
  scripts: Record<string, string>
}

describe('scripts do package.json', () => {
  it('o setup aplica as migrations versionadas, não db push', () => {
    expect(pacote.scripts.setup).toBe(
      'prisma generate && prisma migrate deploy && npm run db:seed',
    )
    expect(pacote.scripts['db:push']).toBeUndefined()
    expect(JSON.stringify(pacote.scripts)).not.toContain('db push')
  })
})

describe('exemplo de ambiente', () => {
  const exemplo = ler('.env.example')
  const valorDe = (chave: string): string | undefined => {
    const linha = exemplo
      .split('\n')
      .find((l) => l.startsWith(`${chave}=`))
    return linha?.slice(chave.length + 1).replace(/^"|"$/g, '')
  }

  it('documenta o nome do produto e a confiança no proxy', () => {
    expect(valorDe('APP_NAME')).toBeDefined()
    expect(valorDe('TRUST_PROXY')).toBeDefined()
    expect(exemplo).toContain('APP_NAME')
    expect(exemplo).toContain('TRUST_PROXY')
  })

  it('não traz segredo real', () => {
    expect(valorDe('JWT_SECRET')).toBe('')
    expect(valorDe('ENCRYPTION_KEY')).toBe('')
  })

  it('documenta o endereço do OpenRouter e a URL pública, sem valor secreto', () => {
    expect(exemplo).toContain('OPENROUTER_BASE_URL')
    expect(exemplo).toContain('APP_URL')
    // Copiar o exemplo sem editar não pode fixar a URL pública em localhost (FT-06, PR-62).
    expect(exemplo).toMatch(/^APP_URL=""/m)
    expect(exemplo).not.toMatch(/sk-or-/)
  })

  it('documenta o limite de tokens da resposta, sem valor secreto', () => {
    expect(exemplo).toContain('MAX_TOKENS_RESPOSTA')
    expect(valorDe('MAX_TOKENS_RESPOSTA')).toBe('1024')
  })

  it('documenta o diretório de arquivos e o limite de upload', () => {
    expect(valorDe('STORAGE_DIR')).toBe('./storage')
    expect(valorDe('MAX_UPLOAD_MB')).toBe('25')
  })

  it('documenta a chave de criptografia e como gerá-la', () => {
    expect(exemplo).toContain('ENCRYPTION_KEY')
    expect(exemplo).toMatch(/randomBytes\(32\)/)
  })
})

describe('pipeline de verificação', () => {
  const ci = ler('.github/workflows/ci.yml')

  it('usa Node 22', () => {
    expect(ci).toMatch(/node-version:\s*['"]?22['"]?/)
  })

  it('roda os passos de verificação na ordem do PR-26', () => {
    const passos = [
      'npm ci',
      'npx prisma generate',
      'npm run lint',
      'npx tsc --noEmit',
      'npm run build',
      'npm test',
      'npm audit --audit-level=high',
    ]
    let posicao = -1
    for (const passo of passos) {
      const onde = ci.indexOf(passo, posicao + 1)
      expect(onde, `passo ausente ou fora de ordem: ${passo}`).toBeGreaterThan(posicao)
      posicao = onde
    }
  })

  it('o build recebe DATABASE_URL e JWT_SECRET de CI, sem segredo do repositório', () => {
    expect(ci).toMatch(/DATABASE_URL:\s*file:/)
    expect(ci).toMatch(/JWT_SECRET:\s*\S+/)
    expect(ci).not.toContain('secrets.')
  })
})

describe('README do projeto', () => {
  const readme = ler('README.md')

  it('diz como rodar, com Node 22 e as contas de demonstração', () => {
    expect(readme).toContain('Node 22')
    expect(readme).toContain('cp .env.example .env')
    expect(readme).toContain('JWT_SECRET')
    for (const comando of ['npm install', 'npm run setup', 'npm run dev']) {
      expect(readme, comando).toContain(comando)
    }
    expect(readme).toContain('admin@exemplo.local')
    expect(readme).toContain('usuario@exemplo.local')
  })

  it('documenta cada script do package.json', () => {
    for (const nome of Object.keys(pacote.scripts)) {
      const comando = nome === 'test' ? 'npm test' : `npm run ${nome}`
      expect(readme, comando).toContain(comando)
    }
  })

  it('descreve as três camadas e as variáveis de ambiente', () => {
    for (const pasta of ['src/app', 'src/servicos', 'src/lib']) {
      expect(readme, pasta).toContain(pasta)
    }
    for (const variavel of [
      'APP_NAME',
      'TRUST_PROXY',
      'DATABASE_URL',
      'ENCRYPTION_KEY',
      'OPENROUTER_BASE_URL',
      'APP_URL',
      'MAX_TOKENS_RESPOSTA',
      'STORAGE_DIR',
      'MAX_UPLOAD_MB',
    ]) {
      expect(readme, variavel).toContain(variavel)
    }
  })

  it('explica a aba Testar e a conversa em tempo real', () => {
    expect(readme).toContain('Testar')
    expect(readme).toContain('/api/agentes/[id]/conversar')
    expect(readme).toContain('Nova conversa')
  })

  it('explica a aba Conhecimento: formatos, limites, status, armazenamento e a fila', () => {
    expect(readme).toContain('Conhecimento')
    for (const ext of ['.pdf', '.docx', '.csv', '.html', '.json', '.srt', '.vtt']) expect(readme, ext).toContain(ext)
    expect(readme).toContain('/api/agentes/[id]/fontes')
    expect(readme).toContain('storage/')
    expect(readme).toContain('src/instrumentation.ts')
    expect(readme).toContain('processando')
    expect(readme).toMatch(/Content-Length/)
    expect(readme).toMatch(/OCR/)
  })

  it('explica as respostas com a base: busca FTS5, fontes, [n], Testar busca e o limite do modelo (FT-05)', () => {
    expect(readme).toContain('FTS5')
    expect(readme).toContain('BM25')
    expect(readme).toContain('Testar busca')
    expect(readme).toContain('/api/agentes/[id]/buscar')
    expect(readme).toContain('src/servicos/recuperacao.ts')
    expect(readme).toMatch(/\[n\]/)
    expect(readme).toMatch(/evento `fontes`/)
    expect(readme).toMatch(/modo fundamentado/)
    expect(readme).toMatch(/não encontrou/)
    expect(readme).not.toContain('a busca sobre eles é da próxima feature')
  })

  it('explica como cadastrar a chave do OpenRouter e criar agentes', () => {
    expect(readme).toContain('Configurações, Integrações')
    expect(readme).toContain('Agentes')
    expect(readme).toContain('tests/apoio/openrouter-falso.ts')
  })

  it('é o README do Converse, não o do template', () => {
    expect(readme).toContain('Converse')
    expect(readme).not.toMatch(/template do buildx/i)
  })
})

describe('convenções da busca textual (FT-05, PR-30)', () => {
  const convencoes = ler('docs/stack/CONVENCOES.md')
  const lacunas = ler('docs/stack/LACUNAS.md')

  // Cada citação `arquivo:linha` do CONVENCOES.md precisa apontar para a linha certa.
  const CITACOES: Array<[string, RegExp]> = [
    ['prisma/migrations/20260930190000_busca_fts5/migration.sql:10', /CREATE VIRTUAL TABLE "trechos_fts" USING fts5/],
    ['prisma/migrations/20260930190000_busca_fts5/migration.sql:19', /CREATE TRIGGER "trechos_fts_ai"/],
    ['src/servicos/recuperacao.ts:76', /prisma\.\$queryRaw</],
    ['src/servicos/recuperacao.ts:126', /export async function reconstruirIndiceDeTrechos/],
    ['src/servicos/recuperacao-termos.ts:66', /export function montarExpressaoMatch/],
    ['src/servicos/chat.ts:106', /async function materialDaBase/],
  ]

  it.each(CITACOES)('%s existe e contém o que o CONVENCOES.md diz', (citacao, esperado) => {
    expect(convencoes).toContain(citacao)
    const [arquivo, linha] = citacao.split(':')
    expect(ler(arquivo!).split('\n')[Number(linha) - 1]).toMatch(esperado)
  })

  it('registra a regra "texto do usuário nunca concatenado em SQL" e o SQL cru só para FTS5', () => {
    expect(convencoes).toMatch(/texto do usuário nunca é concatenado em SQL/i)
    expect(convencoes).toMatch(/\$queryRaw/)
    expect(convencoes).toMatch(/SQL cru só para FTS5/)
    expect(convencoes).not.toContain('SQL cru só para FTS5 (ainda não existe)')
  })

  it('as lacunas registram migrate dev com tabela virtual, o modelo real não testável e o rowid', () => {
    expect(lacunas).toMatch(/migrate dev/)
    expect(lacunas).toMatch(/modelo real/i)
    expect(lacunas).toMatch(/rowid/)
  })
})

describe('convenções do chat embutido (FT-06)', () => {
  const convencoes = ler('docs/stack/CONVENCOES.md')
  const lacunas = ler('docs/stack/LACUNAS.md')
  const readme = ler('README.md')

  // Cada citação `arquivo:linha` nova do CONVENCOES.md precisa apontar para a linha certa.
  const CITACOES: Array<[string, RegExp]> = [
    ['src/app/api/publico/agentes/[id]/conversar/route.ts:35', /export async function POST/],
    ['src/app/api/publico/agentes/[id]/config/route.ts:12', /export async function GET/],
    ['src/servicos/chat-publico.ts:115', /export async function\* conversarComoVisitante/],
    ['src/servicos/chat-publico.ts:84', /export function erroParaVisitante/],
    ['src/servicos/chat-publico-limites.ts:32', /export function exigirLimiteDeIp/],
    ['src/servicos/chat-publico-limites.ts:75', /export async function exigirTetoDiario/],
    ['src/proxy.ts:12', /export async function proxy/],
    ['src/proxy.ts:28', /export const config/],
    ['next.config.ts:18', /naoEmoldurar/],
    ['next.config.ts:25', /embed/],
    ['src/lib/dominios-permitidos.ts:109', /export function cabecalhoFrameAncestors/],
    ['src/widget/widget.js:233', /e\.origin !== origem/],
    ['src/app/widget.js/route.ts:12', /export function GET/],
    ['src/componentes/embed-logica.ts:64', /export function criarGuardaDoVisitante/],
    ['src/lib/ambiente.ts:66', /get appUrlPublica/],
    ['src/lib/ambiente.ts:81', /get maxTokensDaResposta/],
    ['src/lib/ambiente.ts:88', /get storageDir/],
    ['src/lib/ambiente.ts:95', /get maxUploadBytes/],
    ['src/app/eventos-sse.ts:15', /export type MapeadorDeErro/],
    ['src/app/eventos-sse.ts:38', /export function fluxoDeEventos/],
  ]

  it.each(CITACOES)('%s existe e contém o que o CONVENCOES.md diz', (citacao, esperado) => {
    expect(convencoes).toContain(citacao)
    const [arquivo, linha] = citacao.split(':')
    expect(ler(arquivo!).split('\n')[Number(linha) - 1]).toMatch(esperado)
  })

  it('registra a rota pública sem sessão, o proxy.ts com CSP por agente e a exceção de cor do script', () => {
    expect(convencoes).toMatch(/Rota pública, sem sessão/)
    expect(convencoes).toMatch(/frame-ancestors/)
    expect(convencoes).toMatch(/`src\/proxy\.ts`/)
    expect(convencoes).toMatch(/Exceção declarada à regra de cor literal/)
    expect(convencoes).toMatch(/`appUrlPublica`/)
    expect(convencoes).not.toContain('a FT-06 sobrescreve o `X-Frame-Options`')
  })

  it('as lacunas registram o que a FT-06 resolveu e o que ficou (375 px, proxy sem cache, limite em memória)', () => {
    expect(lacunas).toMatch(/Resolvidas na FT-06/)
    expect(lacunas).toMatch(/375 px/)
    expect(lacunas).toMatch(/proxy\.ts/)
    expect(lacunas).toMatch(/npm run build/)
  })

  it('o README explica a aba Publicar, o trecho, os domínios, os limites e o site de teste', () => {
    expect(readme).toContain('Publicar')
    expect(readme).toContain('/widget.js')
    expect(readme).toContain('data-agent')
    expect(readme).toContain('frame-ancestors')
    expect(readme).toContain('Retry-After')
    expect(readme).toContain('src/proxy.ts')
    expect(readme).toContain('tests/apoio/servir-site-de-teste.ts')
    expect(readme).toMatch(/TRUST_PROXY=1/)
  })
})
