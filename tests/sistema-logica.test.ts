/** A lógica pura da tela Sistema (FT-11): bytes, atividade, situação, sim ou não e a fila em português. */
import { describe, expect, it } from 'vitest'
import {
  descreverFila,
  formatarAtividade,
  formatarBytes,
  formatarDataHora,
  rotuloDoItemDeSaude,
  simOuNao,
  situacaoEmTexto,
} from '../src/componentes/sistema-logica.js'

describe('formatarBytes', () => {
  it('usa a unidade certa, vírgula decimal e uma casa', () => {
    expect(formatarBytes(0)).toBe('0 B')
    expect(formatarBytes(1023)).toBe('1023 B')
    expect(formatarBytes(1024)).toBe('1,0 KB')
    expect(formatarBytes(1536)).toBe('1,5 KB')
    expect(formatarBytes(5 * 1024 * 1024)).toBe('5,0 MB')
    expect(formatarBytes(3.25 * 1024 ** 3)).toBe('3,3 GB')
  })

  it('null é "Indisponível"', () => {
    expect(formatarBytes(null)).toBe('Indisponível')
  })
})

describe('formatarAtividade', () => {
  it('mostra os dois maiores componentes', () => {
    expect(formatarAtividade(45)).toBe('45 s')
    expect(formatarAtividade(60)).toBe('1 min')
    expect(formatarAtividade(125)).toBe('2 min 5 s')
    expect(formatarAtividade(3600)).toBe('1 h')
    expect(formatarAtividade(2 * 3600 + 5 * 60 + 9)).toBe('2 h 5 min')
    expect(formatarAtividade(3 * 86400 + 4 * 3600 + 59)).toBe('3 dias 4 h')
    expect(formatarAtividade(86400)).toBe('1 dia')
  })
})

describe('situação, sim ou não e fila', () => {
  it('traduz os três estados e as variantes do selo', () => {
    expect(situacaoEmTexto('ok')).toEqual({ rotulo: 'Tudo em ordem', variante: 'sucesso' })
    expect(situacaoEmTexto('degradado')).toEqual({ rotulo: 'Funcionando com limitações', variante: 'aviso' })
    expect(situacaoEmTexto('falha')).toEqual({ rotulo: 'Com falha', variante: 'perigo' })
  })

  it('simOuNao', () => {
    expect(simOuNao(true)).toBe('Sim')
    expect(simOuNao(false)).toBe('Não')
  })

  it('rotulo do item de saúde', () => {
    expect(rotuloDoItemDeSaude('banco')).toBe('Banco de dados')
    expect(rotuloDoItemDeSaude('disco')).toBe('Disco (dados e arquivos)')
    expect(rotuloDoItemDeSaude('busca')).toBe('Índice de busca')
    expect(rotuloDoItemDeSaude('midia')).toBe('Vídeo e áudio (ffmpeg)')
  })

  it('descreve a fila com singular e plural, e diz quando está vazia', () => {
    expect(descreverFila({ pendentes: 0, processando: 0, erro: 0 })).toBe('Fila vazia')
    expect(descreverFila({ pendentes: 1, processando: 2, erro: 1 })).toBe('1 pendente, 2 processando, 1 com erro')
    expect(descreverFila({ pendentes: 3, processando: 0, erro: 0 })).toBe('3 pendentes')
  })
})

describe('formatarDataHora', () => {
  it('data e hora em português e o texto de ausência quando é nulo', () => {
    const texto = formatarDataHora(new Date('2026-03-10T15:30:00.000Z'), 'nunca')
    expect(texto).toMatch(/^\d{2}\/\d{2}\/\d{4}.*\d{2}:\d{2}/)
    expect(formatarDataHora(null, 'Ainda não rodou')).toBe('Ainda não rodou')
  })
})
