// npm run restore -- <arquivo.tar.gz> [--forcar] (FT-11, PR-20, PR-98): restaura o banco e os arquivos de um
// backup gerado por `npm run backup`. SÓ POR LINHA DE COMANDO, nunca pela interface: ela troca o banco sob
// um servidor de pé, derruba as sessões e exige parar a fila e o agendador, o que um clique no navegador não
// garante. Pare o servidor antes (o comando recusa se `/api/saude` responder em http://127.0.0.1:<PORT>,
// padrão 3000, salvo com --forcar).
//
// Ordem: valida o arquivo (manifest, SHA-256, integridade) e compara o esquema ANTES de tocar em qualquer
// coisa; guarda o estado de antes em BACKUP_DIR/pre-restauracao-<data>; troca o `storage/` e o banco; aplica
// `prisma migrate deploy` se o esquema do backup é mais antigo; reconstrói o índice FTS5; grava a auditoria
// `restauracao` (ator Sistema) no banco já restaurado; imprime o resumo.
// O expurgo automático é por processo e não roda durante este comando. Quem restaurar com o servidor de pé
// num desenho futuro precisa chamar obterAgendadorDoExpurgo().parar() antes e .iniciar() depois.
// Saída de comando de linha de comando: `console` é permitido aqui, como na seed.
import 'dotenv/config'
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'
import { ambiente } from '../src/lib/ambiente'
import { PADRAO_DO_NOME_DE_BACKUP } from '../src/lib/backup'
import { ErroDeAplicacao } from '../src/lib/erros'
import { camposDoErro, log } from '../src/lib/log'
import { compararEsquema, descartarBackupValidado, lerEValidarBackup, restaurarArquivos } from '../src/lib/restauracao'
import { migracoesDoApp } from '../src/lib/versao'

const USO = 'Uso: npm run restore -- <arquivo-de-backup.tar.gz> [--forcar]'

async function servidorResponde(url: string): Promise<boolean> {
  try {
    await fetch(url, { signal: AbortSignal.timeout(1500) })
    return true // qualquer resposta HTTP, até 503, é um servidor de pé
  } catch {
    return false
  }
}

/** `prisma migrate deploy` por processo filho, sem shell, contra o banco restaurado. */
function aplicarMigracoes(bancoArquivo: string): Promise<boolean> {
  const prisma = createRequire(path.join(process.cwd(), 'package.json')).resolve('prisma/build/index.js')
  return new Promise((resolver) => {
    const filho = spawn(process.execPath, [prisma, 'migrate', 'deploy'], {
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: `file:${bancoArquivo}` },
      stdio: ['ignore', 'ignore', 'ignore'],
    })
    filho.on('error', () => resolver(false))
    filho.on('exit', (codigo) => resolver(codigo === 0))
  })
}

async function principal(argumentos: string[]): Promise<number> {
  const forcar = argumentos.includes('--forcar')
  const urlDaOpcao = argumentos.find((a) => a.startsWith('--url-saude='))?.slice('--url-saude='.length)
  const posicionais = argumentos.filter((a) => !a.startsWith('--'))
  if (posicionais.length !== 1) {
    console.error(`Informe o arquivo de backup a restaurar.\n${USO}`)
    return 1
  }
  const arquivo = path.resolve(posicionais[0]!)
  const bancoArquivo = ambiente.bancoArquivo
  const storageDir = ambiente.storageDir
  const backupDir = ambiente.backupDir

  // 1. O servidor não pode estar de pé: ele teria o banco aberto e o expurgo e a fila rodando.
  const urlDaSaude = urlDaOpcao ?? `http://127.0.0.1:${process.env.PORT ?? '3000'}/api/saude`
  if (await servidorResponde(urlDaSaude)) {
    if (!forcar) {
      console.error(
        `O servidor está respondendo em ${urlDaSaude}.\n` +
          'Pare o servidor antes de restaurar (por exemplo, "docker compose stop app"), ou use --forcar por sua conta e risco.',
      )
      return 1
    }
    console.log('Aviso: --forcar com o servidor de pé. Ele pode estar com o banco antigo aberto: reinicie-o depois da restauração.')
  }

  // 2. Valida tudo e confere o esquema, sem tocar na instalação.
  console.log(`Validando ${path.basename(arquivo)}...`)
  const validado = await lerEValidarBackup(arquivo, { diretorioDeTrabalho: path.dirname(bancoArquivo) })
  const esquema = compararEsquema(validado.migracoes, migracoesDoApp())
  if (esquema === 'mais_novo' || esquema === 'divergente') {
    await descartarBackupValidado(validado, { removerPastaCriada: true })
    console.error(
      esquema === 'mais_novo'
        ? 'Este backup é de uma versão mais nova do sistema: tem migrations que esta versão não conhece. Atualize o sistema (a imagem ou o código) antes de restaurar.'
        : 'O esquema deste backup não é compatível com o desta versão (migrations fora de ordem ou faltando). A restauração foi recusada.',
    )
    return 1
  }

  // 3. A troca. O que falhar aqui devolve o `storage/` de antes e não toca no banco.
  let resultado
  try {
    resultado = await restaurarArquivos({ validado, bancoArquivo, storageDir, backupDir })
  } catch (erro) {
    await descartarBackupValidado(validado, { removerPastaCriada: true })
    throw erro
  }
  await descartarBackupValidado(validado)

  // 4. Esquema mais antigo: aplica as migrations que faltam.
  let migracoesAplicadas = 0
  if (esquema === 'mais_antigo') {
    migracoesAplicadas = migracoesDoApp().length - validado.migracoes.length
    if (!(await aplicarMigracoes(bancoArquivo))) {
      console.error(
        'Os dados foram restaurados, mas as migrations pendentes não puderam ser aplicadas. Rode "npm run db:migrate" e confira a saída' +
          (resultado.preRestauracao ? `; o estado de antes está em ${resultado.preRestauracao}.` : '.'),
      )
      return 1
    }
  }

  // 5. O índice FTS5 e a auditoria, no banco já restaurado (o Prisma só é carregado agora).
  const { prisma } = await import('../src/lib/prisma')
  try {
    const { reconstruirIndiceDeTrechos } = await import('../src/servicos/recuperacao')
    const { registrar } = await import('../src/servicos/auditoria')
    await reconstruirIndiceDeTrechos()
    const origem = PADRAO_DO_NOME_DE_BACKUP.test(path.basename(arquivo)) ? path.basename(arquivo) : 'arquivo de backup'
    await registrar({ ator: 'sistema', acao: 'restauracao', alvoTipo: 'sistema', detalhes: { origem, resultado: 'concluida' } })
  } finally {
    await prisma.$disconnect().catch(() => undefined)
  }

  // 6. O resumo.
  const m = validado.manifesto
  const tabelas = Object.entries(m.contagens)
    .filter(([, n]) => n > 0)
    .map(([nome, n]) => `${nome} ${n}`)
    .join(', ')
  console.log('')
  console.log('Restauração concluída.')
  console.log(`  Arquivo:            ${path.basename(arquivo)}`)
  console.log(`  Gerado em:          ${m.criadoEm} (versão do app ${m.versaoDoApp})`)
  console.log(`  Esquema:            ${esquema === 'igual' ? 'igual ao desta versão' : `${migracoesAplicadas} migration(s) aplicada(s) para chegar à desta versão`}`)
  console.log(`  Dados restaurados:  ${tabelas || 'nenhuma linha'}`)
  console.log(`  Arquivos:           ${m.partes.length - 1}`)
  console.log(`  Estado de antes:    ${resultado.preRestauracao ?? 'nenhum (instalação limpa)'}`)
  console.log('  Índice de busca:    reconstruído')
  console.log('  Auditoria:          registro "restauracao" gravado')
  console.log('')
  console.log('Próximos passos:')
  console.log('  1. Suba o servidor com a MESMA ENCRYPTION_KEY de quando o backup foi gerado: o backup não a contém,')
  console.log('     e sem ela as chaves cifradas do OpenRouter e do Telegram não decifram (cadastre-as de novo se perdeu a chave).')
  console.log('  2. Se usa o Telegram, abra a aba Canais do agente e use Verificar (reconecte o bot se o webhook não confere).')
  return 0
}

principal(process.argv.slice(2)).then(
  (codigo) => process.exit(codigo),
  (erro: unknown) => {
    if (erro instanceof ErroDeAplicacao) console.error(erro.message)
    else if (erro instanceof Error && erro.message.startsWith('Variável')) console.error(erro.message)
    else {
      log.erro('restauracao_comando_falhou', camposDoErro(erro))
      console.error('Não foi possível restaurar o backup.')
    }
    process.exit(1)
  },
)
