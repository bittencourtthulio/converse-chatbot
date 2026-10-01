/**
 * T-06.02 (FT-08): o painel Vídeo da aba Conhecimento, com as abas internas
 * "Enviar arquivo" e "Link do YouTube", a barra de progresso do envio e o aviso
 * de créditos. Renderização sem navegador (`renderToStaticMarkup`); a
 * interação fica em módulos puros (PR-76).
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { AdicionarFontes } from '@/componentes/AdicionarFontes'
import { FormularioDoYoutube } from '@/componentes/FormularioDoYoutube'
import { PainelDeVideo } from '@/componentes/PainelDeVideo'
import { ListaDeEnviosDeVideo } from '@/componentes/ZonaDeVideo'
import { OPCOES_DE_FONTE } from '@/componentes/opcoes-de-fonte'
import type { ItemDeEnvio } from '@/componentes/estado-dos-envios'

const MB = 1024 * 1024
const propsDoVideo = { limiteDeVideoBytes: 500 * MB, limiteDeVideoMinutos: 180, modeloDeTranscricao: 'google/gemini-2.5-flash' }

describe('opção Vídeo', () => {
  it('vem depois de Texto, com o ícone de vídeo e a descrição que fala de arquivo, áudio e YouTube', () => {
    expect(OPCOES_DE_FONTE.map((o) => o.id)).toEqual(['arquivos', 'texto', 'video'])
    const video = OPCOES_DE_FONTE[2]!
    expect(video).toMatchObject({ rotulo: 'Vídeo', icone: 'video' })
    expect(video.descricao).toMatch(/YouTube/)
    expect(video.descricao).toMatch(/áudio/)
  })

  it('AdicionarFontes mostra três abas, a terceira é Vídeo, e continua abrindo em Arquivos', () => {
    const html = renderToStaticMarkup(
      <AdicionarFontes agenteId="a1" limiteDeUploadBytes={25 * MB} {...propsDoVideo} aoAlterar={() => undefined} />,
    )
    const abas = html.match(/role="tab"[^>]*>/g) ?? []
    expect(abas).toHaveLength(3)
    expect(html).toMatch(/role="tab"[^>]*aria-selected="false"[^>]*>[\s\S]*?Vídeo/)
    expect(html).toMatch(/role="tab"[^>]*aria-selected="true"[^>]*>[\s\S]*?Arquivos/)
  })
})

describe('PainelDeVideo', () => {
  const html = renderToStaticMarkup(<PainelDeVideo agenteId="a1" {...propsDoVideo} aoAlterar={() => undefined} />)

  it('mostra as duas abas acessíveis, com Enviar arquivo selecionada e o painel ligado à aba', () => {
    expect(html).toContain('role="tablist"')
    const abas = html.match(/<button[^>]*role="tab"[^>]*>[\s\S]*?<\/button>/g) ?? []
    expect(abas).toHaveLength(2)
    expect(abas[0]).toMatch(/aria-selected="true"/)
    expect(abas[0]).toContain('Enviar arquivo')
    expect(abas[1]).toMatch(/aria-selected="false"/)
    expect(abas[1]).toContain('Link do YouTube')
    const controle = abas[0]!.match(/aria-controls="([^"]+)"/)![1]!
    expect(html).toContain(`id="${controle}"`)
    expect(html).toContain('role="tabpanel"')
  })

  it('a aba de arquivo mostra os tipos aceitos, o limite em MB e minutos, o aviso de créditos com o modelo e um input de arquivo', () => {
    const input = html.match(/<input[^>]*type="file"[^>]*>/)![0]
    expect(input).toMatch(/accept="[^"]*\.mp4[^"]*\.flac/)
    expect(input).toContain('aria-describedby')
    for (const ext of ['.mp4', '.mov', '.m4v', '.webm', '.mkv', '.avi', '.mp3', '.wav', '.m4a', '.ogg', '.aac', '.flac']) {
      expect(html, ext).toContain(ext)
    }
    expect(html).toContain('500 MB')
    expect(html).toContain('180 minutos')
    expect(html).toMatch(/créditos do OpenRouter/)
    expect(html).toContain('google/gemini-2.5-flash')
    expect(html).toContain('Arraste')
    expect(html).not.toContain('<progress')
  })
})

describe('ListaDeEnviosDeVideo', () => {
  const itens: ItemDeEnvio[] = [
    { id: '1', nome: 'aula-1.mp4', tamanho: 120 * MB, situacao: 'enviando', percentual: 42 },
    { id: '2', nome: 'aula-2.mov', tamanho: 10 * MB, situacao: 'aguardando', percentual: 0 },
    { id: '3', nome: 'nota.txt', tamanho: 10, situacao: 'recusado', percentual: 0, motivo: 'Formato não aceito.' },
    { id: '4', nome: 'aula-0.mp3', tamanho: 5 * MB, situacao: 'aceito', percentual: 100 },
  ]
  const html = renderToStaticMarkup(<ListaDeEnviosDeVideo itens={itens} aoCancelar={() => undefined} />)

  it('o item enviando mostra a barra de progresso com valor e o percentual, e o botão de cancelar', () => {
    expect(html).toMatch(/<progress[^>]*max="100"[^>]*value="42"/)
    expect(html).toMatch(/aria-label="Enviando aula-1\.mp4"/)
    expect(html).toContain('42%')
    expect(html).toMatch(/Cancelar envio/)
    expect((html.match(/<progress/g) ?? []).length).toBe(1)
  })

  it('aguardando, recusado com motivo e aceito aparecem com a situação em texto', () => {
    expect(html).toContain('Aguardando a vez')
    expect(html).toMatch(/role="alert"[^>]*>Formato não aceito\./)
    expect(html).toContain('Enviado')
    expect(html).toContain('120 MB')
  })
})

describe('FormularioDoYoutube', () => {
  it('mostra o campo de link, a nota de que usa as legendas e o botão', () => {
    const html = renderToStaticMarkup(<FormularioDoYoutube agenteId="a1" aoAlterar={() => undefined} />)
    const campo = html.match(/<input[^>]*>/)![0]
    expect(campo).toContain('type="url"')
    expect(campo).toContain('name="url"')
    expect(campo).toContain('aria-describedby')
    expect(html).toMatch(/legendas do vídeo/)
    expect(html).toMatch(/Adicionar vídeo/)
    expect(html).not.toContain('role="alert"')
  })

  it('um link inválido mostra o motivo já na renderização, e um válido não mostra erro', () => {
    const ruim = renderToStaticMarkup(<FormularioDoYoutube agenteId="a1" aoAlterar={() => undefined} urlInicial="https://evil.com/watch?v=abcdefghijk" />)
    expect(ruim).toMatch(/role="alert"[^>]*>[\s\S]*YouTube/)
    expect(ruim).toContain('aria-invalid="true"')
    const bom = renderToStaticMarkup(<FormularioDoYoutube agenteId="a1" aoAlterar={() => undefined} urlInicial="https://youtu.be/abcdefghijk" />)
    expect(bom).not.toContain('role="alert"')
    expect(bom).not.toContain('aria-invalid="true"')
  })
})

describe('estilo', () => {
  it('nenhum valor de cor literal nos componentes novos', () => {
    for (const nome of ['PainelDeVideo', 'ZonaDeVideo', 'FormularioDoYoutube']) {
      const fonte = readFileSync(`src/componentes/${nome}.tsx`, 'utf8')
      expect(fonte, nome).not.toMatch(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/)
    }
  })
})
