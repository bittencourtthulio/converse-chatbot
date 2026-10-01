/**
 * T-06.03 (FT-08): a linha de fonte mostra o ícone de vídeo, a barra de
 * progresso com a etapa, a duração e o link de origem do YouTube; "Ver
 * conteúdo" mostra a duração e destaca o marcador de tempo de cada trecho
 * (PR-76). Renderização sem navegador.
 */
import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { LinhaDeFonte } from '@/componentes/LinhaDeFonte'
import { ListaDeTrechos } from '@/componentes/ListaDeTrechos'
import { iconeDoTipo } from '@/componentes/conhecimento-logica'
import type { FonteDaTela } from '@/componentes/fonte-da-tela'
import { separarMarcador } from '@/componentes/video-logica'
import type { PaginaDeTrechos } from '@/servicos/fontes'

const base: FonteDaTela = {
  id: 'f1',
  agenteId: 'a1',
  tipo: 'video',
  titulo: 'Aula de reembolso.mp4',
  nomeOriginal: 'Aula de reembolso.mp4',
  tipoMime: 'video/mp4',
  tamanhoBytes: 120 * 1024 * 1024,
  status: 'pronto',
  mensagemErro: null,
  totalTrechos: 3,
  caracteres: 2100,
  criadoEm: '2026-09-30T15:00:00.000Z',
  atualizadoEm: '2026-09-30T15:00:00.000Z',
  processadoEm: '2026-09-30T15:01:00.000Z',
  progresso: null,
  etapa: null,
  duracaoSegundos: 3725,
  urlOrigem: null,
}
const fonte = (extra: Partial<FonteDaTela> = {}): FonteDaTela => ({ ...base, ...extra })
const linha = (f: FonteDaTela) => renderToStaticMarkup(<LinhaDeFonte fonte={f} aoMudar={() => undefined} aoExcluir={() => undefined} />)

describe('ícone do tipo', () => {
  it('vídeo e YouTube usam o ícone de vídeo; texto e arquivo seguem como antes', () => {
    expect(iconeDoTipo('video')).toBe('video')
    expect(iconeDoTipo('youtube')).toBe('video')
    expect(iconeDoTipo('texto')).toBe('texto')
    expect(iconeDoTipo('arquivo')).toBe('arquivo')
  })
})

describe('LinhaDeFonte de vídeo', () => {
  it('em processamento mostra a barra com valor, a etapa com percentual, a duração e o spinner', () => {
    const html = linha(fonte({ status: 'processando', etapa: 'Transcrevendo parte 2 de 5', progresso: 45 }))
    expect(html).toMatch(/<progress[^>]*max="100"[^>]*value="45"/)
    expect(html).toMatch(/aria-label="Processando Aula de reembolso\.mp4"/)
    expect(html).toContain('Transcrevendo parte 2 de 5 · 45%')
    expect(html).toContain('1h 02min')
    expect(html).toContain('spinner')
    expect(html).toContain('120 MB')
  })

  it('na fila ou pronto não mostra barra; só a etapa quando há etapa sem percentual', () => {
    expect(linha(fonte({ status: 'pendente' }))).not.toContain('<progress')
    expect(linha(fonte({ status: 'pronto' }))).not.toContain('<progress')
    const semPercentual = linha(fonte({ status: 'processando', etapa: 'Extraindo áudio', progresso: null }))
    expect(semPercentual).toContain('Extraindo áudio')
    expect(semPercentual).not.toContain('<progress')
  })

  it('em erro mostra o motivo com Reprocessar e Excluir e sem barra', () => {
    const html = linha(fonte({ status: 'erro', mensagemErro: 'Falha na parte 2 de 3: Saldo insuficiente no OpenRouter.', etapa: 'Transcrevendo parte 2 de 3', progresso: 50 }))
    expect(html).toContain('Falha na parte 2 de 3')
    expect(html).toContain('Reprocessar')
    expect(html).toContain('Excluir')
    expect(html).not.toContain('<progress')
  })
})

describe('LinhaDeFonte do YouTube', () => {
  const youtube = fonte({
    tipo: 'youtube',
    titulo: 'Aula de exemplo',
    tamanhoBytes: 0,
    urlOrigem: 'https://www.youtube.com/watch?v=abcdefghijk',
    duracaoSegundos: 75,
    nomeOriginal: null,
    tipoMime: null,
  })

  it('mostra o link de origem com rel noopener noreferrer, a duração e "YouTube" em vez de 0 B', () => {
    const html = linha(youtube)
    expect(html).toMatch(/<a[^>]*href="https:\/\/www\.youtube\.com\/watch\?v=abcdefghijk"[^>]*>/)
    const ancora = html.match(/<a[^>]*youtube\.com[^>]*>/)![0]
    expect(ancora).toContain('rel="noopener noreferrer"')
    expect(ancora).toContain('target="_blank"')
    expect(html).toContain('Abrir no YouTube')
    expect(html).toContain('1min 15s')
    expect(html).not.toContain('0 B')
  })

  it('uma urlOrigem que não é do YouTube nunca vira link', () => {
    for (const urlOrigem of ['javascript:alert(1)', 'https://evil.com/watch?v=abcdefghijk', 'data:text/html,x']) {
      const html = linha({ ...youtube, urlOrigem })
      expect(html, urlOrigem).not.toContain('Abrir no YouTube')
      expect(html, urlOrigem).not.toMatch(/href="(javascript|data|https:\/\/evil)/)
    }
  })

  it('o título do vídeo entra como texto, nunca como HTML', () => {
    const html = linha({ ...youtube, titulo: '<img src=x onerror=alert(1)>' })
    expect(html).not.toContain('<img')
    expect(html).toContain('&lt;img')
  })
})

describe('separarMarcador', () => {
  it('separa o marcador do começo do texto, em MM:SS e H:MM:SS', () => {
    expect(separarMarcador('[00:00] Olá a todos.')).toEqual({ marcador: '[00:00]', resto: ' Olá a todos.' })
    expect(separarMarcador('[1:02:05] depois')).toEqual({ marcador: '[1:02:05]', resto: ' depois' })
    expect(separarMarcador('sem marcador [00:10] no meio')).toEqual({ marcador: null, resto: 'sem marcador [00:10] no meio' })
    expect(separarMarcador('[abc] nada')).toEqual({ marcador: null, resto: '[abc] nada' })
  })
})

describe('Ver conteúdo de um vídeo', () => {
  const pagina = (extra: Partial<PaginaDeTrechos['fonte']> = {}): PaginaDeTrechos => ({
    fonte: {
      ...base,
      criadoEm: new Date('2026-09-30T15:00:00Z'),
      atualizadoEm: new Date('2026-09-30T15:00:00Z'),
      processadoEm: new Date('2026-09-30T15:01:00Z'),
      ...extra,
    },
    trechos: [
      { id: 't0', indice: 0, texto: '[00:00] Primeira fala da aula.', caracteres: 30 },
      { id: 't1', indice: 1, texto: 'continuação do trecho sem marcador', caracteres: 34 },
      { id: 't2', indice: 2, texto: '[10:00] Segunda parte da aula.', caracteres: 30 },
    ],
    pagina: 1,
    porPagina: 20,
    totalPaginas: 1,
    totalTrechos: 3,
  })

  it('mostra a duração e destaca o marcador de tempo de cada trecho, mantendo o texto', () => {
    const html = renderToStaticMarkup(<ListaDeTrechos dados={pagina()} voltarPara="/agentes/a1/conhecimento" />)
    expect(html).toContain('1h 02min')
    expect(html).toMatch(/<strong class="trecho-marcador">\[00:00\]<\/strong>/)
    expect(html).toMatch(/<strong class="trecho-marcador">\[10:00\]<\/strong>/)
    expect(html).toContain('Primeira fala da aula.')
    expect(html).toContain('continuação do trecho sem marcador')
    expect((html.match(/trecho-marcador/g) ?? []).length).toBe(2)
  })

  it('uma fonte do YouTube mostra o link de origem; texto de arquivo não ganha marcador nem duração', () => {
    const yt = renderToStaticMarkup(
      <ListaDeTrechos
        dados={pagina({ tipo: 'youtube', urlOrigem: 'https://youtu.be/abcdefghijk', duracaoSegundos: 75 })}
        voltarPara="/agentes/a1/conhecimento"
      />,
    )
    expect(yt).toContain('Abrir no YouTube')
    const arquivo = renderToStaticMarkup(
      <ListaDeTrechos dados={pagina({ tipo: 'arquivo', duracaoSegundos: null })} voltarPara="/agentes/a1/conhecimento" />,
    )
    expect(arquivo).not.toContain('1h 02min')
  })
})
