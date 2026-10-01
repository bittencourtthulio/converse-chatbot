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

  it('documenta as variáveis do Telegram, sem ligar a exceção de HTTP por padrão', () => {
    expect(exemplo).toContain('TELEGRAM_API_BASE')
    expect(valorDe('TELEGRAM_API_BASE')).toBe('https://api.telegram.org')
    expect(exemplo).toContain('TELEGRAM_PERMITIR_URL_NAO_HTTPS')
    expect(valorDe('TELEGRAM_PERMITIR_URL_NAO_HTTPS')).toBe('')
  })

  it('documenta o limite de tokens da resposta, sem valor secreto', () => {
    expect(exemplo).toContain('MAX_TOKENS_RESPOSTA')
    expect(valorDe('MAX_TOKENS_RESPOSTA')).toBe('1024')
  })

  it('documenta o diretório de arquivos e o limite de upload', () => {
    expect(valorDe('STORAGE_DIR')).toBe('./storage')
    expect(valorDe('MAX_UPLOAD_MB')).toBe('25')
  })

  it('documenta as seis variáveis do vídeo e do YouTube (FT-08)', () => {
    expect(valorDe('MAX_VIDEO_MB')).toBe('500')
    expect(valorDe('MAX_VIDEO_MINUTOS')).toBe('180')
    expect(valorDe('FFMPEG_PATH')).toBe('ffmpeg')
    expect(valorDe('FFPROBE_PATH')).toBe('ffprobe')
    expect(exemplo).toContain('OPENROUTER_MODELO_TRANSCRICAO')
    expect(valorDe('YOUTUBE_BASE')).toBe('https://www.youtube.com')
    expect(exemplo).toMatch(/ffmpeg/i)
  })

  it('documenta a retenção dos registros de auditoria (FT-10), sem valor secreto', () => {
    expect(exemplo).toContain('AUDITORIA_RETENCAO_DIAS')
    expect(valorDe('AUDITORIA_RETENCAO_DIAS')).toBe('365')
  })

  it('documenta a chave de criptografia e como gerá-la', () => {
    expect(exemplo).toContain('ENCRYPTION_KEY')
    expect(exemplo).toMatch(/randomBytes\(32\)/)
  })
})

describe('pipeline de verificação', () => {
  const ci = ler('.github/workflows/ci.yml')

  it('instala o ffmpeg e exige a presença dele nos testes de vídeo (FT-08)', () => {
    expect(ci).toContain('sudo apt-get install -y ffmpeg')
    expect(ci).toMatch(/EXIGIR_FFMPEG: '1'/)
    expect(ci.indexOf('apt-get install -y ffmpeg')).toBeLessThan(ci.indexOf('npm test'))
  })

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

describe('convenções do canal Telegram (FT-07)', () => {
  const convencoes = ler('docs/stack/CONVENCOES.md')
  const lacunas = ler('docs/stack/LACUNAS.md')
  const readme = ler('README.md')

  // Cada citação `arquivo:linha` nova do CONVENCOES.md precisa apontar para a linha certa.
  const CITACOES: Array<[string, RegExp]> = [
    ['src/lib/telegram.ts:107', /export async function chamar/],
    ['src/lib/telegram.ts:44', /export function erroDoTelegram/],
    ['src/lib/telegram.ts:23', /export function redigirToken/],
    ['src/lib/telegram.ts:222', /export function dividirTexto/],
    ['src/lib/telegram.ts:241', /async function enviarPedaco/],
    ['src/servicos/canal-telegram.ts:177', /export async function conectar/],
    ['src/servicos/canal-telegram.ts:93', /export function origemDoWebhook/],
    ['src/servicos/canal-telegram.ts:38', /export function aoAlterarCanal/],
    ['src/servicos/telegram-webhook.ts:29', /export async function autenticarWebhook/],
    ['src/servicos/telegram-webhook.ts:38', /timingSafeEqual\(esperado/],
    ['src/servicos/telegram-webhook.ts:95', /export async function registrarAtualizacao/],
    ['src/servicos/telegram-webhook.ts:156', /export async function tratarWebhook/],
    ['src/app/api/telegram/[agenteId]/webhook/route.ts:21', /after\(depois\)/],
    ['src/lib/exclusao-mutua.ts:13', /export function criarExclusaoMutua/],
    ['src/servicos/telegram-atendimento.ts:105', /export async function atenderUpdate/],
    ['src/servicos/telegram-atendimento.ts:197', /async function responderAoChat/],
    ['src/servicos/telegram-limites.ts:22', /export function permitirMensagemDoChat/],
    ['src/servicos/telegram-limites.ts:36', /export async function frasePorLimiteDoBanco/],
    ['tests/apoio/telegram-falso.ts:91', /export async function iniciarTelegramFalso/],
    ['tests/apoio/servidor.ts:31', /logs: \(\) => saida/],
    ['src/componentes/canais.ts:13', /export const CANAIS_DO_AGENTE/],
    ['src/componentes/canais-logica.ts:72', /export function visaoDoCartaoTelegram/],
    ['src/lib/ambiente.ts:99', /get telegramApiBase/],
    ['src/lib/ambiente.ts:107', /get telegramPermitirUrlNaoHttps/],
  ]

  it.each(CITACOES)('%s existe e contém o que o CONVENCOES.md diz', (citacao, esperado) => {
    expect(convencoes).toContain(citacao)
    const [arquivo, linha] = citacao.split(':')
    expect(ler(arquivo!).split('\n')[Number(linha) - 1]).toMatch(esperado)
  })

  it('registra o webhook de terceiro com segredo, o token na URL com redação, o atendimento pós-resposta e o simulado', () => {
    expect(convencoes).toMatch(/Webhook de terceiro/)
    expect(convencoes).toMatch(/X-Telegram-Bot-Api-Secret-Token/)
    expect(convencoes).toMatch(/Segredo na URL do provedor/)
    expect(convencoes).toMatch(/redigirToken/)
    expect(convencoes).toMatch(/`after\(\)`/)
    expect(convencoes).toMatch(/Exclusão mútua por chave/)
    expect(convencoes).toMatch(/TELEGRAM_API_BASE/)
    expect(convencoes).toMatch(/TELEGRAM_PERMITIR_URL_NAO_HTTPS/)
    expect(convencoes).not.toContain('Telegram e YouTube seguem `decidido_pelo_buildx`')
  })

  it('as lacunas registram o que a FT-07 resolveu e o que ficou (Telegram real, perda no reinício, 375 px)', () => {
    expect(lacunas).toMatch(/Resolvidas na FT-07/)
    expect(lacunas).toMatch(/Telegram real/)
    expect(lacunas).toMatch(/PEND-06/)
    expect(lacunas).toMatch(/reinício/)
    expect(lacunas).toMatch(/375 px/)
  })

  it('o README explica a aba Canais, o passo a passo, o webhook HTTPS com túnel, os limites e o simulado', () => {
    expect(readme).toContain('Canais')
    expect(readme).toContain('@BotFather')
    expect(readme).toContain('/api/telegram/[agenteId]/webhook')
    expect(readme).toMatch(/túnel/)
    expect(readme).toContain('X-Telegram-Bot-Api-Secret-Token')
    expect(readme).toContain('tests/apoio/servir-telegram-falso.ts')
    expect(readme).toMatch(/\/novo/)
    for (const variavel of ['TELEGRAM_API_BASE', 'TELEGRAM_PERMITIR_URL_NAO_HTTPS']) expect(readme, variavel).toContain(variavel)
  })
})

describe('convenções do vídeo (FT-08)', () => {
  const convencoes = ler('docs/stack/CONVENCOES.md')
  const lacunas = ler('docs/stack/LACUNAS.md')
  const readme = ler('README.md')

  // Cada citação `arquivo:linha` nova do CONVENCOES.md precisa apontar para a linha certa.
  const CITACOES: Array<[string, RegExp]> = [
    ['src/app/api/agentes/[id]/fontes/video/route.ts:35', /export async function POST/],
    ['src/app/api/agentes/[id]/fontes/youtube/route.ts:13', /export async function POST/],
    ['src/servicos/fontes.ts:375', /export async function adicionarVideo/],
    ['src/lib/armazenamento.ts:56', /async gravarDeStream/],
    ['src/lib/midia-formatos.ts:49', /export function conferirAssinaturaDeMidia/],
    ['src/componentes/enviar-video.ts:12', /export function enviarVideo/],
    ['src/lib/midia.ts:50', /export function executar/],
    ['src/lib/midia.ts:93', /export function exigirCaminhoInterno/],
    ['src/lib/midia.ts:107', /export async function verificarMidia/],
    ['src/lib/midia.ts:141', /export async function sondar/],
    ['src/lib/midia.ts:183', /export async function extrairAudio/],
    ['src/servicos/fontes-fila.ts:57', /const TIPOS_DE_MIDIA/],
    ['src/servicos/fontes-fila.ts:70', /export function criarFila/],
    ['src/servicos/fontes-fila.ts:141', /async function processarVideo/],
    ['src/servicos/fontes-fila.ts:241', /async function trabalhador/],
    ['src/servicos/fontes-fila.ts:321', /export function obterFila/],
    ['src/servicos/transcricao-de-midia.ts:30', /export interface DependenciasDeMidia/],
    ['src/servicos/transcricao-de-midia.ts:80', /export async function transcreverMidia/],
    ['src/servicos/transcricao-marcadores.ts:11', /export function formatarMarcador/],
    ['src/lib/openrouter.ts:220', /export async function transcreverAudio/],
    ['src/servicos/integracoes.ts:71', /export async function estadoDoOpenrouter/],
    ['src/servicos/integracoes.ts:206', /export async function modeloDeTranscricaoEfetivo/],
    ['src/servicos/integracoes.ts:219', /export async function salvarModeloDeTranscricao/],
    ['src/lib/ambiente.ts:115', /get maxVideoBytes/],
    ['src/lib/ambiente.ts:146', /get youtubeBase/],
    ['src/lib/ambiente.ts:156', /export const MODELO_DE_TRANSCRICAO_PADRAO/],
    ['src/lib/youtube.ts:54', /export function destinoPermitido/],
    ['src/lib/youtube.ts:75', /async function lerComLimite/],
    ['src/lib/youtube.ts:224', /export function escolherFaixa/],
    ['src/lib/youtube.ts:298', /export async function baixarLegenda/],
    ['src/lib/youtube.ts:331', /export async function obterLegendas/],
    ['src/componentes/AdicionarFontes.tsx:21', /const PAINEIS/],
    ['src/app/acoes.ts:47', /console\.error\(erro\)/],
    ['tests/apoio/ffmpeg.ts:40', /export function descreverComFfmpeg/],
    ['tests/apoio/youtube-falso.ts:116', /export async function iniciarYoutubeFalso/],
    ['tests/apoio/openrouter-falso.ts:111', /function extrairAudio/],
    ['tests/apoio/openrouter-falso.ts:125', /export async function iniciarOpenRouterFalso/],
  ]

  it.each(CITACOES)('%s existe e contém o que o CONVENCOES.md diz', (citacao, esperado) => {
    expect(convencoes).toContain(citacao)
    const [arquivo, linha] = citacao.split(':')
    expect(ler(arquivo!).split('\n')[Number(linha) - 1]).toMatch(esperado)
  })

  it('registra as regras do vídeo: upload em stream, processo sem shell, fila de duas raias, transcrição e YouTube com SSRF', () => {
    expect(convencoes).toMatch(/Upload de arquivo grande em stream/)
    expect(convencoes).toMatch(/nunca `request\.formData\(\)`/)
    expect(convencoes).toMatch(/Processo externo sem shell/)
    expect(convencoes).toMatch(/`shell: false`/)
    expect(convencoes).toMatch(/duas raias/)
    expect(convencoes).toMatch(/segmentos\/NN\.txt/)
    expect(convencoes).toMatch(/Transcrição de áudio pelo provedor/)
    expect(convencoes).toMatch(/Leitura de site de terceiro sem API/)
    expect(convencoes).toMatch(/destinoPermitido/)
    expect(convencoes).toMatch(/EXIGIR_FFMPEG/)
    for (const variavel of ['MAX_VIDEO_MB', 'MAX_VIDEO_MINUTOS', 'FFMPEG_PATH', 'FFPROBE_PATH', 'OPENROUTER_MODELO_TRANSCRICAO', 'YOUTUBE_BASE']) {
      expect(convencoes, variavel).toContain(variavel)
    }
    expect(convencoes).not.toContain('a FT-08 acrescenta vídeo nos dois')
  })

  it('as lacunas registram a fragilidade do YouTube, o modelo sem áudio, a parte sem fala, os restos em disco e a falta de cota', () => {
    expect(lacunas).toMatch(/fragilidade do YouTube/)
    expect(lacunas).toMatch(/não há API oficial/)
    expect(lacunas).toMatch(/modalidade de áudio/)
    expect(lacunas).toMatch(/sem fala/)
    expect(lacunas).toMatch(/original\.parcial/)
    expect(lacunas).toMatch(/cota de créditos/)
  })

  it('o README explica o vídeo: formatos, limites, ffmpeg, créditos, retomada por parte, YouTube e as variáveis', () => {
    expect(readme).toContain('Vídeo, áudio e YouTube')
    for (const ext of ['.mp4', '.mov', '.webm', '.mkv', '.mp3', '.wav', '.flac']) expect(readme, ext).toContain(ext)
    expect(readme).toMatch(/ffmpeg/)
    expect(readme).toMatch(/consome créditos do OpenRouter/)
    expect(readme).toContain('/api/agentes/[id]/fontes/video')
    expect(readme).toContain('/api/agentes/[id]/fontes/youtube')
    expect(readme).toContain('segmentos/NN.txt')
    expect(readme).toContain('tests/apoio/servir-youtube-falso.ts')
    expect(readme).toMatch(/Fragilidade assumida/)
    expect(readme).toContain('EXIGIR_FFMPEG=1')
    for (const variavel of ['MAX_VIDEO_MB', 'MAX_VIDEO_MINUTOS', 'FFMPEG_PATH', 'FFPROBE_PATH', 'OPENROUTER_MODELO_TRANSCRICAO', 'YOUTUBE_BASE']) {
      expect(readme, variavel).toContain(variavel)
    }
  })
})

describe('convenções do histórico de conversas e do painel (FT-09)', () => {
  const convencoes = ler('docs/stack/CONVENCOES.md')
  const lacunas = ler('docs/stack/LACUNAS.md')
  const readme = ler('README.md')

  const CITACOES: Array<[string, RegExp]> = [
    ['src/servicos/historico.ts:93', /export async function listarConversas/],
    ['src/servicos/historico.ts:59', /function condicoes/],
    ['src/servicos/historico.ts:79', /function universo/],
    ['src/servicos/historico.ts:260', /export function aoApagarConversa/],
    ['src/servicos/historico.ts:293', /export async function apagarConversas/],
    ['src/servicos/historico-logica.ts:29', /export function rotuloDoInterlocutor/],
    ['src/servicos/historico-logica.ts:56', /export function escaparLike/],
    ['src/servicos/historico-logica.ts:116', /export function lerFiltros/],
    ['src/servicos/historico-logica.ts:141', /export function instanteParaSql/],
    ['src/servicos/painel.ts:48', /export async function numerosDoPainel/],
    ['src/servicos/painel.ts:85', /export async function serieDeMensagens/],
    ['src/servicos/painel.ts:150', /export async function primeirosPassos/],
    ['src/servicos/painel.ts:176', /export async function obterPainel/],
    ['src/componentes/conversas-logica.ts:128', /export function reduzirLote/],
    ['src/componentes/GraficoDeMensagens.tsx:22', /export function GraficoDeMensagens/],
    ['src/app/api/conversas/[id]/route.ts:8', /export async function DELETE/],
    ['src/app/api/conversas/[id]/exportar/route.ts:9', /export async function GET/],
    ['src/app/(sistema)/conversas/[id]/carregar-conversa.ts:10', /export const carregarConversa/],
    ['src/estilos/tokens.css:64', /--canal-painel-bg/],
    ['tests/apoio/contador-de-consultas.ts:15', /export function criarClienteContador/],
    ['tests/apoio/contador-de-consultas.ts:29', /export async function contarConsultas/],
  ]

  it.each(CITACOES)('%s existe e contém o que o CONVENCOES.md diz', (citacao, esperado) => {
    expect(convencoes).toContain(citacao)
    const [arquivo, linha] = citacao.split(':')
    expect(ler(arquivo!).split('\n')[Number(linha) - 1]).toMatch(esperado)
  })

  it('registra as regras: sem N+1, LIKE escapado, DateTime e dia local, rótulo mascarado, apagar com ouvinte, rotas, loading e painel', () => {
    expect(convencoes).toMatch(/Listagem sem N\+1 \(FT-09\)/)
    expect(convencoes).toMatch(/Busca por texto com LIKE escapado/)
    expect(convencoes).toMatch(/DateTime no SQLite e dia local/)
    expect(convencoes).toMatch(/Interlocutor mascarado/)
    expect(convencoes).toMatch(/aoApagarConversa/)
    expect(convencoes).toMatch(/Rotas de conversas/)
    expect(convencoes).toMatch(/`loading\.tsx` e `notFound` em rota com `\[id\]`/)
    expect(convencoes).toMatch(/Painel inicial e gráfico acessível/)
    expect(convencoes).toMatch(/\| 2026-10-01 \| FT-09 \|/)
  })

  it('as lacunas registram o LIKE em ASCII, o fuso do servidor, a varredura de mensagens, a exclusão por visitante e o que não foi visto', () => {
    expect(lacunas).toMatch(/FT-09, novas/)
    expect(lacunas).toMatch(/ignora maiúsculas só em ASCII/)
    expect(lacunas).toMatch(/fuso é o do servidor/)
    expect(lacunas).toMatch(/sem índice próprio/)
    expect(lacunas).toMatch(/exclusão por `identificadorExterno`/)
    expect(lacunas).toMatch(/`widget\.js` não foi repetido/)
  })

  it('o README explica a tela de Conversas, o mascaramento, o apagar em lote, a exportação e o painel', () => {
    expect(readme).toContain('Conversas e painel inicial')
    expect(readme).toContain('/api/conversas/apagar')
    expect(readme).toContain('/api/conversas/[id]/exportar')
    expect(readme).toContain('aoApagarConversa')
    expect(readme).toMatch(/mascarado/)
    expect(readme).toMatch(/mensagens por dia nos últimos 14 dias/)
    expect(readme).toMatch(/fuso do servidor/)
  })
})
