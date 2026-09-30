import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import {
  deveContinuarPolling,
  formatarCaracteres,
  formatarData,
  formatarTamanho,
  iconeDoTipo,
  rotuloDoStatus,
  validarArquivoNoNavegador,
} from '@/componentes/conhecimento-logica'
import { OPCOES_DE_FONTE } from '@/componentes/opcoes-de-fonte'
import { EXTENSOES_ACEITAS } from '@/lib/extracao/formatos'

const MB = 1024 * 1024

describe('validação no navegador, antes de enviar', () => {
  it('aceita extensão da lista e tamanho até o limite, sem diferenciar caixa', () => {
    expect(validarArquivoNoNavegador('Manual.PDF', 2 * MB, 25 * MB)).toEqual({ ok: true })
    expect(validarArquivoNoNavegador('a.htm', 1, 25 * MB)).toEqual({ ok: true })
    expect(validarArquivoNoNavegador('a.txt', 25 * MB, 25 * MB)).toEqual({ ok: true })
  })

  it('recusa extensão fora da lista, vazio e acima do limite, com motivo em português', () => {
    const fora = validarArquivoNoNavegador('a.exe', 10, 25 * MB)
    expect(fora).toMatchObject({ ok: false })
    expect((fora as { motivo: string }).motivo).toContain('.pdf')
    expect(validarArquivoNoNavegador('a.txt', 0, 25 * MB)).toEqual({ ok: false, motivo: 'O arquivo está vazio.' })
    const grande = validarArquivoNoNavegador('a.txt', 26 * MB, 25 * MB)
    expect((grande as { motivo: string }).motivo).toMatch(/26 MB.*25 MB/)
  })

  it('usa a mesma lista de extensões do servidor', () => {
    for (const ext of EXTENSOES_ACEITAS) expect(validarArquivoNoNavegador(`a${ext}`, 1, MB).ok, ext).toBe(true)
  })
})

describe('formatadores', () => {
  it('formatarTamanho', () => {
    expect(formatarTamanho(0)).toBe('0 B')
    expect(formatarTamanho(900)).toBe('900 B')
    expect(formatarTamanho(1536)).toBe('1,5 KB')
    expect(formatarTamanho(1024)).toBe('1 KB')
    expect(formatarTamanho(5 * MB)).toBe('5 MB')
    expect(formatarTamanho(2.25 * MB)).toBe('2,3 MB')
    expect(formatarTamanho(3 * 1024 * MB)).toBe('3 GB')
  })

  it('formatarData usa o fuso de São Paulo, igual no servidor e no navegador', () => {
    // 2026-09-30 15:00 UTC = 12:00 em São Paulo (UTC-3).
    const texto = formatarData(new Date('2026-09-30T15:00:00.000Z'))
    expect(texto).toMatch(/^30\/09\/2026.*12:00$/)
    expect(formatarData('2026-09-30T15:00:00.000Z')).toBe(texto)
    expect(formatarData(null)).toBe('—')
  })

  it('formatarCaracteres separa milhares', () => {
    expect(formatarCaracteres(1234567)).toBe('1.234.567')
    expect(formatarCaracteres(0)).toBe('0')
  })
})

describe('status e polling', () => {
  it('cada status tem rótulo, variante e spinner só em processando', () => {
    expect(rotuloDoStatus('pendente')).toMatchObject({ rotulo: 'Na fila', variante: 'neutro', girando: false })
    expect(rotuloDoStatus('processando')).toMatchObject({ rotulo: 'Processando', variante: 'acento', girando: true })
    expect(rotuloDoStatus('pronto')).toMatchObject({ rotulo: 'Pronto', variante: 'sucesso', girando: false })
    expect(rotuloDoStatus('erro')).toMatchObject({ rotulo: 'Erro', variante: 'perigo', girando: false })
    expect(rotuloDoStatus('qualquer')).toMatchObject({ rotulo: 'Desconhecido', variante: 'neutro' })
  })

  it('deveContinuarPolling é verdadeiro só com fonte pendente ou processando', () => {
    expect(deveContinuarPolling([])).toBe(false)
    expect(deveContinuarPolling([{ status: 'pronto' }, { status: 'erro' }])).toBe(false)
    expect(deveContinuarPolling([{ status: 'pronto' }, { status: 'pendente' }])).toBe(true)
    expect(deveContinuarPolling([{ status: 'processando' }])).toBe(true)
  })

  it('o ícone do tipo', () => {
    expect(iconeDoTipo('texto')).toBe('texto')
    expect(iconeDoTipo('arquivo')).toBe('arquivo')
    expect(iconeDoTipo('video')).toBe('arquivo')
  })
})

describe('opções de adicionar (extensível para a FT-08)', () => {
  it('traz Arquivos e Texto, com id único, rótulo, ícone e descrição', () => {
    expect(OPCOES_DE_FONTE.map((o) => o.id)).toEqual(['arquivos', 'texto'])
    expect(new Set(OPCOES_DE_FONTE.map((o) => o.id)).size).toBe(OPCOES_DE_FONTE.length)
    for (const o of OPCOES_DE_FONTE) {
      expect(o.rotulo).toBeTruthy()
      expect(o.descricao).toBeTruthy()
      expect(o.icone).toBeTruthy()
    }
  })
})

describe('isolamento', () => {
  it('os módulos puros não tocam o DOM, o Prisma nem a rede', () => {
    for (const nome of ['conhecimento-logica.ts', 'estado-dos-envios.ts', 'opcoes-de-fonte.ts']) {
      const fonte = readFileSync(path.resolve(process.cwd(), 'src/componentes', nome), 'utf8')
      expect(fonte, nome).not.toMatch(/document\.|window\.|fetch\(|XMLHttpRequest|@\/lib\/prisma|'use client'/)
    }
  })
})
