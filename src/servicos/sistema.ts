// Os dados da tela Configurações > Sistema (FT-11, PR-95): o detalhe que o `GET /api/saude` público
// não mostra. Só o admin lê. Nunca devolve valor de segredo: a configuração sai como sim ou não
// (`ENCRYPTION_KEY` definida e válida, `APP_URL` com HTTPS, chave do OpenRouter configurada).
import { opendir, stat } from 'node:fs/promises'
import path from 'node:path'
import { ambiente } from '@/lib/ambiente'
import { migracoesDoApp, versaoDoApp } from '@/lib/versao'
import { prisma } from '@/lib/prisma'
import { exigirAdmin, type UsuarioAutenticado } from '@/servicos/autenticacao'
import { ultimoBackup as ultimoBackupDoDisco } from '@/servicos/backup'
import { obterAgendadorDoExpurgo } from '@/servicos/expurgo'
import { chaveDoOpenrouterConfigurada } from '@/servicos/integracoes'
import { sondarMidia, verificarSaude, type OpcoesDaSaude, type Saude } from '@/servicos/saude'

export interface DadosDoSistema {
  saude: Saude
  aplicacao: { versao: string; node: string; fuso: string; atividadeSegundos: number }
  esquema: { aplicadas: number; esperadas: number; ultima: string | null }
  dados: { bancoBytes: number | null; storageBytes: number; storageArquivos: number; storageParcial: boolean }
  midia: { ffmpeg: boolean; ffprobe: boolean; versao: string | null }
  fila: { pendentes: number; processando: number; erro: number }
  expurgo: { ativo: boolean; ultimaExecucaoEm: Date | null }
  configuracao: {
    chaveDeCriptografiaDefinida: boolean
    chaveDeCriptografiaValida: boolean
    appUrlDefinida: boolean
    appUrlHttps: boolean
    openrouterConfigurado: boolean
  }
  /** O backup mais recente em `BACKUP_DIR` (preenchido pelo serviço de backup); `null` se não há. */
  ultimoBackup: { nome: string; criadoEm: Date; bytes: number } | null
}

export interface OpcoesDoSistema extends OpcoesDaSaude {
  /** Só para teste: o agendador do expurgo. */
  expurgo?: { ativo: () => boolean; ultimaExecucaoEm: () => Date | null }
  /** Preenchido por `src/servicos/backup.ts` quando existe (evita ciclo de importação). */
  ultimoBackup?: () => Promise<DadosDoSistema['ultimoBackup']>
}

/** Teto de entradas da varredura do `storage/`: o disco pode ter milhões de arquivos. */
export const LIMITE_DE_ENTRADAS_DA_MEDICAO = 50_000

export interface MedidaDoDiretorio {
  bytes: number
  arquivos: number
  /** A varredura parou no teto: os números são um mínimo. */
  parcial: boolean
}

/** Soma o tamanho dos arquivos sob `dir`, sem seguir link simbolico. Pasta que não existe mede zero. */
export async function medirDiretorio(dir: string, opcoes: { limiteDeEntradas?: number } = {}): Promise<MedidaDoDiretorio> {
  const limite = opcoes.limiteDeEntradas ?? LIMITE_DE_ENTRADAS_DA_MEDICAO
  const medida: MedidaDoDiretorio = { bytes: 0, arquivos: 0, parcial: false }
  let vistas = 0
  async function visitar(pasta: string): Promise<void> {
    let handle
    try {
      handle = await opendir(pasta)
    } catch {
      return
    }
    for await (const entrada of handle) {
      if (medida.parcial) return
      vistas += 1
      if (vistas > limite) {
        medida.parcial = true
        return
      }
      const completo = path.join(pasta, entrada.name)
      if (entrada.isDirectory()) await visitar(completo)
      else if (entrada.isFile()) {
        try {
          medida.bytes += (await stat(completo)).size
          medida.arquivos += 1
        } catch {
          // O arquivo sumiu durante a varredura (a fila apaga temporários): não conta.
        }
      }
    }
  }
  await visitar(dir)
  return medida
}

async function migracoesAplicadas(): Promise<string[]> {
  try {
    const linhas = await prisma.$queryRaw<Array<{ migration_name: string }>>`
      SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL ORDER BY migration_name`
    return linhas.map((l) => l.migration_name)
  } catch {
    return []
  }
}

async function tamanhoDoBanco(): Promise<number | null> {
  try {
    return (await stat(ambiente.bancoArquivo)).size
  } catch {
    return null
  }
}

async function contagemDaFila(): Promise<DadosDoSistema['fila']> {
  const grupos = await prisma.fonte.groupBy({ by: ['status'], _count: { _all: true } })
  const de = (status: string) => grupos.find((g) => g.status === status)?._count._all ?? 0
  return { pendentes: de('pendente'), processando: de('processando'), erro: de('erro') }
}

/** Tudo o que a tela Sistema mostra, de uma vez. Só admin (403 para os outros). */
export async function obterSistema(autor: UsuarioAutenticado, opcoes: OpcoesDoSistema = {}): Promise<DadosDoSistema> {
  exigirAdmin(autor)
  const storageDir = opcoes.storageDir ?? ambiente.storageDir
  const [saude, midia, aplicadas, bancoBytes, storage, fila, openrouterConfigurado, ultimoBackup] = await Promise.all([
    verificarSaude({ ...opcoes, storageDir }),
    sondarMidia(opcoes),
    migracoesAplicadas(),
    tamanhoDoBanco(),
    medirDiretorio(storageDir),
    contagemDaFila(),
    chaveDoOpenrouterConfigurada().catch(() => false),
    (opcoes.ultimoBackup ?? ultimoBackupDoDisco)().catch(() => null),
  ])
  const expurgo = opcoes.expurgo ?? obterAgendadorDoExpurgo()
  const url = process.env.APP_URL?.trim() ?? ''
  return {
    saude,
    aplicacao: { versao: versaoDoApp(), node: process.version, fuso: ambiente.fusoHorario, atividadeSegundos: Math.max(1, Math.round(process.uptime())) },
    esquema: { aplicadas: aplicadas.length, esperadas: migracoesDoApp().length, ultima: aplicadas.at(-1) ?? null },
    dados: { bancoBytes, storageBytes: storage.bytes, storageArquivos: storage.arquivos, storageParcial: storage.parcial },
    midia: { ffmpeg: midia.ffmpeg, ffprobe: midia.ffprobe, versao: midia.versao },
    fila,
    expurgo: { ativo: expurgo.ativo(), ultimaExecucaoEm: expurgo.ultimaExecucaoEm() },
    configuracao: {
      chaveDeCriptografiaDefinida: Boolean(ambiente.chaveDeCriptografia),
      chaveDeCriptografiaValida: ambiente.chaveDeCriptografiaValida,
      appUrlDefinida: url !== '',
      appUrlHttps: url.toLowerCase().startsWith('https://'),
      openrouterConfigurado,
    },
    ultimoBackup,
  }
}
