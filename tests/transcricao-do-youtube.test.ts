import { beforeEach, describe, expect, it, vi } from 'vitest'
import { stat } from 'node:fs/promises'
import { ErroDeAplicacao } from '@/lib/erros'
import { criarArmazenamento } from '@/lib/armazenamento'
import { ambiente } from '@/lib/ambiente'
import { recuperarTextoDoYoutube, type PedidoDoYoutube } from '@/servicos/transcricao-do-youtube'
import { inspecionarVideo, baixarAudioDoYoutube } from '@/lib/youtube-download'
import { baixarLegenda } from '@/lib/youtube'
import { obterChaveDoOpenrouter } from '@/servicos/integracoes'

vi.mock('@/lib/youtube-download', () => ({ inspecionarVideo: vi.fn(), baixarAudioDoYoutube: vi.fn() }))
vi.mock('@/lib/youtube', async (original) => ({ ...await original<typeof import('@/lib/youtube')>(), baixarLegenda: vi.fn() }))
vi.mock('@/servicos/integracoes', () => ({ obterChaveDoOpenrouter: vi.fn(), modeloDeTranscricaoEfetivo: vi.fn(async () => 'modelo/audio') }))

const video = { id: 'abcdefghijk', titulo: 'Aula', duracaoSegundos: 30, aoVivo: false, faixas: [] }
const falha = () => new ErroDeAplicacao('Legenda indisponível', 422, 'sem_legendas')
function pedido(): PedidoDoYoutube {
  return {
    url: 'https://youtu.be/abcdefghijk', fonte: { id: 'fonte', agenteId: 'agente' },
    armazenamento: criarArmazenamento(ambiente.storageDir), aoAndar: vi.fn(), fonteExiste: vi.fn(async () => true),
    transcrever: vi.fn(async () => ({ texto: '[00:00] Minha aula.', duracaoSegundos: 30 })),
  }
}
beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(inspecionarVideo).mockResolvedValue({ ...video })
  vi.mocked(obterChaveDoOpenrouter).mockResolvedValue('chave-de-teste')
  vi.mocked(baixarAudioDoYoutube).mockResolvedValue(undefined)
  vi.mocked(baixarLegenda).mockRejectedValue(falha())
})

describe('recuperação de texto do YouTube', () => {
  it('sem legenda baixa áudio, usa o transcritor existente e apaga o temporário', async () => {
    const p = pedido()
    expect(await recuperarTextoDoYoutube(p)).toEqual({ texto: '[00:00] Minha aula.', titulo: 'Aula', duracaoSegundos: 30 })
    const chamada = vi.mocked(p.transcrever!).mock.calls[0]![0]
    expect(chamada).toMatchObject({ chave: 'chave-de-teste', modelo: 'modelo/audio', armazenamento: p.armazenamento })
    expect(chamada.caminhoOriginal).toMatch(/converse-youtube-.+\/audio$/)
    await expect(stat(chamada.caminhoOriginal!)).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('recupera legenda por yt-dlp sem buscar chave nem consumir IA', async () => {
    vi.mocked(inspecionarVideo).mockResolvedValue({ ...video, faixas: [{ idioma: 'pt', automatica: true, nome: 'Português', baseUrl: 'https://www.youtube.com/api/timedtext' }] })
    vi.mocked(baixarLegenda).mockResolvedValue([{ inicio: 0, duracao: 4, texto: 'Legenda recuperada.' }])
    const p = pedido()
    expect((await recuperarTextoDoYoutube(p)).texto).toContain('Legenda recuperada.')
    expect(p.transcrever).not.toHaveBeenCalled()
    expect(obterChaveDoOpenrouter).not.toHaveBeenCalled()
    expect(baixarAudioDoYoutube).not.toHaveBeenCalled()
  })

  it('legenda vazia ou inacessível também permite transcrever', async () => {
    vi.mocked(inspecionarVideo).mockResolvedValue({ ...video, faixas: [{ idioma: 'en', automatica: false, nome: 'English', baseUrl: 'https://www.youtube.com/api/timedtext' }] })
    const p = pedido()
    await recuperarTextoDoYoutube(p)
    expect(p.transcrever).toHaveBeenCalledOnce()
  })

  it('sem chave explica a configuração necessária e não baixa áudio', async () => {
    vi.mocked(obterChaveDoOpenrouter).mockResolvedValue(null)
    await expect(recuperarTextoDoYoutube(pedido())).rejects.toMatchObject({ codigo: 'youtube_transcricao_sem_chave' })
    expect(baixarAudioDoYoutube).not.toHaveBeenCalled()
  })

  it('apaga temporários mesmo quando download falha', async () => {
    vi.mocked(baixarAudioDoYoutube).mockRejectedValue(new ErroDeAplicacao('Falha de download', 502, 'youtube_download_falhou'))
    const p = pedido()
    await expect(recuperarTextoDoYoutube(p)).rejects.toMatchObject({ codigo: 'youtube_download_falhou' })
    const destino = vi.mocked(baixarAudioDoYoutube).mock.calls[0]![1]
    await expect(stat(destino.replace(/\/audio$/, ''))).rejects.toMatchObject({ code: 'ENOENT' })
    expect(p.transcrever).not.toHaveBeenCalled()
  })

  it('mantém segmentos de transcrição para retomada após falha', async () => {
    const p = pedido()
    p.transcrever = vi.fn(async (p) => {
      await p.armazenamento.gravarSegmento('agente', 'fonte', 0, 'Parte concluída')
      throw new ErroDeAplicacao('Falha na parte 2', 502, 'provedor_indisponivel')
    })
    await expect(recuperarTextoDoYoutube(p)).rejects.toMatchObject({ codigo: 'provedor_indisponivel' })
    expect(await p.armazenamento.lerSegmento('agente', 'fonte', 0)).toBe('Parte concluída')
    const caminho = vi.mocked(p.transcrever).mock.calls[0]![0].caminhoOriginal!
    await expect(stat(caminho.replace(/\/audio$/, ''))).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('URL inválida e fonte excluída impedem acesso à rede e IA', async () => {
    await expect(recuperarTextoDoYoutube({ ...pedido(), url: 'https://evil.com/watch?v=abcdefghijk' })).rejects.toMatchObject({ codigo: 'url_invalida' })
    await expect(recuperarTextoDoYoutube({ ...pedido(), fonteExiste: async () => false })).rejects.toMatchObject({ codigo: 'fonte_excluida' })
    expect(inspecionarVideo).not.toHaveBeenCalled()
  })

  it('fonte excluída durante download não gera transcrição paga', async () => {
    const p = pedido()
    p.fonteExiste = vi.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(true).mockResolvedValueOnce(false)
    await expect(recuperarTextoDoYoutube(p)).rejects.toMatchObject({ codigo: 'fonte_excluida' })
    expect(p.transcrever).not.toHaveBeenCalled()
  })
})
