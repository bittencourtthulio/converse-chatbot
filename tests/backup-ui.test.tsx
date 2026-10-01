/**
 * A parte da tela Sistema que gera, lista e baixa backups (FT-11, PR-96, PR-97): o botão, a lista com
 * nome, data, tamanho e o link de download, o estado vazio e o aviso, em destaque, de que o backup
 * não contém a ENCRYPTION_KEY.
 */
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { GeradorDeBackup } from '../src/componentes/GeradorDeBackup.js'
import { ListaDeBackups } from '../src/componentes/ListaDeBackups.js'
import { PainelDoSistema } from '../src/componentes/PainelDoSistema.js'
import type { DadosDoSistema } from '../src/servicos/sistema.js'

const backups = [
  { nome: 'backup-20260505-102030.tar.gz', criadoEm: new Date('2026-05-05T10:20:30.000Z'), bytes: 3 * 1024 * 1024 },
  { nome: 'backup-20260101-000000.tar.gz', criadoEm: new Date('2026-01-01T00:00:00.000Z'), bytes: 900 },
]

const sistema = (extra: Partial<DadosDoSistema> = {}): DadosDoSistema => ({
  saude: { status: 'ok', itens: [] },
  aplicacao: { versao: '1.0.0', node: 'v22', fuso: 'UTC', atividadeSegundos: 10 },
  esquema: { aplicadas: 1, esperadas: 1, ultima: 'x' },
  dados: { bancoBytes: 1, storageBytes: 1, storageArquivos: 1, storageParcial: false },
  midia: { ffmpeg: true, ffprobe: true, versao: 'v' },
  fila: { pendentes: 0, processando: 0, erro: 0 },
  expurgo: { ativo: true, ultimaExecucaoEm: null },
  configuracao: { chaveDeCriptografiaDefinida: true, chaveDeCriptografiaValida: true, appUrlDefinida: true, appUrlHttps: true, openrouterConfigurado: false },
  ultimoBackup: null,
  ...extra,
})

describe('GeradorDeBackup', () => {
  it('mostra o botão Gerar backup agora, habilitado, e o que ele faz', () => {
    const html = renderToStaticMarkup(<GeradorDeBackup acao={async () => ({})} />)
    expect(html).toContain('Gerar backup agora')
    expect(html).toContain('type="submit"')
    expect(html).not.toContain('disabled')
    expect(html).toMatch(/banco.*arquivos/)
  })
})

describe('ListaDeBackups', () => {
  it('mostra nome, data, tamanho e o link de download de cada backup, do mais novo ao mais antigo', () => {
    const html = renderToStaticMarkup(<ListaDeBackups backups={backups} />)
    expect(html).toContain('backup-20260505-102030.tar.gz')
    expect(html).toContain('backup-20260101-000000.tar.gz')
    expect(html.indexOf('20260505')).toBeLessThan(html.indexOf('20260101'))
    expect(html).toContain('3,0 MB')
    expect(html).toContain('900 B')
    expect(html).toContain('href="/api/backups/backup-20260505-102030.tar.gz"')
    expect(html).toContain('download')
    expect(html).toContain('aria-label="Baixar backup-20260505-102030.tar.gz"')
    expect(html).toMatch(/\d{2}\/\d{2}\/\d{4}/)
  })

  it('sem backups mostra o estado vazio e nenhum link', () => {
    const html = renderToStaticMarkup(<ListaDeBackups backups={[]} />)
    expect(html).toContain('Nenhum backup ainda')
    expect(html).not.toContain('/api/backups/')
  })

  it('o nome é escapado e o link codifica o nome (nada de HTML do arquivo vira marcação)', () => {
    const html = renderToStaticMarkup(<ListaDeBackups backups={[{ nome: 'backup-<img src=x onerror=alert(1)>', criadoEm: new Date(0), bytes: 1 }]} />)
    expect(html).not.toContain('<img')
    expect(html).toContain('%3Cimg')
  })
})

describe('cartão Backup do painel', () => {
  it('traz o aviso em destaque de que o backup não contém a ENCRYPTION_KEY, o botão, a lista e a nota da restauração', () => {
    const html = renderToStaticMarkup(<PainelDoSistema sistema={sistema()} backups={backups} acaoGerarBackup={async () => ({})} />)
    expect(html).toContain('role="status"')
    expect(html).toMatch(/NÃO contém a ENCRYPTION_KEY|não contém a ENCRYPTION_KEY/)
    expect(html).toContain('Gerar backup agora')
    expect(html).toContain('backup-20260505-102030.tar.gz')
    expect(html).toContain('npm run restore')
    expect(html).toMatch(/só por linha de comando/)
  })

  it('sem a ação (leitura pura) não mostra o botão, e sem backups mostra o estado vazio', () => {
    const html = renderToStaticMarkup(<PainelDoSistema sistema={sistema()} />)
    expect(html).not.toContain('Gerar backup agora')
    expect(html).toContain('Nenhum backup ainda')
    expect(html).toContain('ENCRYPTION_KEY')
  })
})
