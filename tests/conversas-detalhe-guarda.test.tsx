/**
 * T-04.04 (FT-12, PR-12, PR-104, ressalva R-01 do B6): a página de detalhe da conversa chama
 * `exigirUsuario()` por conta própria, antes de ler a conversa, sem confiar no layout da pasta.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

const exigirUsuario = vi.fn()
const carregarConversa = vi.fn()

vi.mock('@/app/sessao-servidor', () => ({ exigirUsuario: () => exigirUsuario() }))
vi.mock('@/app/(sistema)/conversas/[id]/carregar-conversa', () => ({ carregarConversa: (id: string) => carregarConversa(id) }))

const { default: DetalheDaConversa } = await import('@/app/(sistema)/conversas/[id]/page')

const conversa = {
  id: 'c1',
  rotulo: 'Visitante 1',
  agenteId: 'a1',
  agenteNome: 'Agente',
  canal: 'widget',
  criadoEm: new Date('2026-10-01T10:00:00Z'),
  atualizadoEm: new Date('2026-10-01T10:05:00Z'),
  totalDeMensagens: 0,
  mensagens: [],
}

beforeEach(() => {
  exigirUsuario.mockReset()
  carregarConversa.mockReset()
})

describe('a página de detalhe da conversa se defende sozinha (integração)', () => {
  it('sem sessão a guarda interrompe a página e a conversa nem é lida', async () => {
    exigirUsuario.mockRejectedValue(new Error('NEXT_REDIRECT'))
    await expect(DetalheDaConversa({ params: Promise.resolve({ id: 'c1' }) })).rejects.toThrow('NEXT_REDIRECT')
    expect(exigirUsuario).toHaveBeenCalledTimes(1)
    expect(carregarConversa).not.toHaveBeenCalled()
  })

  it('com sessão a guarda roda antes da leitura e a página monta o detalhe', async () => {
    const ordem: string[] = []
    exigirUsuario.mockImplementation(async () => void ordem.push('guarda'))
    carregarConversa.mockImplementation(async () => {
      ordem.push('leitura')
      return conversa
    })
    const elemento = await DetalheDaConversa({ params: Promise.resolve({ id: 'c1' }) })
    expect(elemento).toBeTruthy()
    expect(ordem).toEqual(['guarda', 'leitura'])
    expect(carregarConversa).toHaveBeenCalledWith('c1')
  })
})
