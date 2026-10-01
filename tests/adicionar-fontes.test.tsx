import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { AdicionarFontes } from '@/componentes/AdicionarFontes'
import { ZonaDeArquivos } from '@/componentes/ZonaDeArquivos'
import { FormularioDeTexto, validarTextoColado } from '@/componentes/FormularioDeTexto'
import { interpretarRespostaDoEnvio } from '@/componentes/enviar-arquivo'
import { OPCOES_DE_FONTE } from '@/componentes/opcoes-de-fonte'

const LIMITE = 25 * 1024 * 1024
const VIDEO = { limiteDeVideoBytes: 500 * 1024 * 1024, limiteDeVideoMinutos: 180, modeloDeTranscricao: 'google/gemini-2.5-flash' }

describe('AdicionarFontes', () => {
  const html = renderToStaticMarkup(<AdicionarFontes agenteId="a1" limiteDeUploadBytes={LIMITE} {...VIDEO} aoAlterar={() => undefined} />)

  it('mostra as opções vindas de opcoes-de-fonte como abas, com Arquivos selecionada', () => {
    expect(html).toContain('role="tablist"')
    const abas = html.match(/role="tab"[^>]*>/g) ?? []
    expect(abas).toHaveLength(OPCOES_DE_FONTE.length)
    expect(html).toContain('Arquivos')
    expect(html).toContain('Texto')
    expect(html).toMatch(/role="tab"[^>]*aria-selected="true"[^>]*>[\s\S]*?Arquivos/)
    expect(html).toContain('role="tabpanel"')
  })

  it('o painel inicial é o de arquivos: zona de soltar com a lista de formatos e o limite em MB', () => {
    expect(html).toContain('type="file"')
    expect(html).toContain('multiple')
    for (const ext of ['.pdf', '.docx', '.txt', '.md', '.csv', '.html', '.json', '.srt', '.vtt']) {
      expect(html, ext).toContain(ext)
    }
    expect(html).toContain('25 MB')
    expect(html).toContain('10 arquivos')
  })
})

describe('ZonaDeArquivos', () => {
  const html = renderToStaticMarkup(<ZonaDeArquivos agenteId="a1" limiteDeUploadBytes={LIMITE} aoAlterar={() => undefined} />)

  it('tem um input de arquivo múltiplo ligado a um rótulo que cobre a zona, com descrição acessível', () => {
    const input = html.match(/<input[^>]*type="file"[^>]*>/)![0]
    expect(input).toContain('multiple')
    expect(input).toMatch(/accept="[^"]*\.pdf[^"]*\.docx/)
    const id = input.match(/id="([^"]+)"/)![1]!
    expect(html).toContain(`for="${id}"`)
    expect(input).toContain('aria-describedby')
    expect(html).toContain('Arraste arquivos aqui')
    expect(html).toContain('zona-de-soltar')
  })

  it('sem arquivos escolhidos não mostra lista de envios', () => {
    expect(html).not.toContain('aria-label="Arquivos enviados"')
  })
})

describe('FormularioDeTexto', () => {
  const html = renderToStaticMarkup(<FormularioDeTexto agenteId="a1" aoAlterar={() => undefined} />)

  it('tem título de até 120, área de texto e o contador de 0 de 200.000', () => {
    const campo = html.match(/<input[^>]*>/)![0]
    expect(campo).toContain('name="titulo"')
    expect(campo).toContain('maxLength="120"')
    expect(html).toContain('<textarea')
    expect(html).toContain('0 de 200.000')
    expect(html).toContain('aria-live="polite"')
    expect(html).toContain('Adicionar texto')
  })

  it('recusa título vazio, conteúdo vazio e conteúdo longo demais antes de enviar', () => {
    expect(validarTextoColado({ titulo: '', conteudo: 'x' })).toMatch(/título/i)
    expect(validarTextoColado({ titulo: '   ', conteudo: 'x' })).toMatch(/título/i)
    expect(validarTextoColado({ titulo: 'T', conteudo: '   ' })).toMatch(/texto/i)
    expect(validarTextoColado({ titulo: 'T', conteudo: 'a'.repeat(200_001) })).toMatch(/200\.000/)
    expect(validarTextoColado({ titulo: 'a'.repeat(121), conteudo: 'x' })).toMatch(/120/)
    expect(validarTextoColado({ titulo: 'Ok', conteudo: 'conteúdo' })).toBeNull()
  })
})

describe('interpretarRespostaDoEnvio', () => {
  it('202 com o arquivo aceito', () => {
    const corpo = JSON.stringify({ resultados: [{ nome: 'a.pdf', aceito: true, fonte: { id: 'x' } }] })
    expect(interpretarRespostaDoEnvio(202, corpo)).toEqual({ aceito: true })
  })

  it('422 com o motivo do arquivo recusado', () => {
    const corpo = JSON.stringify({ resultados: [{ nome: 'a.exe', aceito: false, codigo: 'formato_nao_aceito', motivo: 'Formato não aceito.' }] })
    expect(interpretarRespostaDoEnvio(422, corpo)).toEqual({ aceito: false, motivo: 'Formato não aceito.' })
  })

  it('erro do envio todo (413, 401, 404) usa a mensagem da API ou uma frase padrão', () => {
    expect(interpretarRespostaDoEnvio(413, JSON.stringify({ codigo: 'corpo_grande_demais', mensagem: 'O envio é maior que o limite permitido.' }))).toEqual({
      aceito: false,
      motivo: 'O envio é maior que o limite permitido.',
    })
    expect(interpretarRespostaDoEnvio(500, 'não é json')).toMatchObject({ aceito: false })
    expect(interpretarRespostaDoEnvio(401, JSON.stringify({ mensagem: 'Sessão inválida ou expirada.' }))).toEqual({
      aceito: false,
      motivo: 'Sessão inválida ou expirada.',
    })
  })
})
