import { describe, it, expect, beforeEach, afterAll, afterEach, vi } from 'vitest'
import { chmodSync, existsSync } from 'node:fs'
import path from 'node:path'
import { prisma } from '@/lib/prisma'
import { ambiente } from '@/lib/ambiente'
import { obterFila } from '@/servicos/fontes-fila'
import { excluir, obter, reprocessar } from '@/servicos/fontes'
import { criarUsuario, limparBanco } from './ajuda'
import { criarAgenteDeTeste, criarFonteDeTeste } from './apoio/fontes'

let autor: Awaited<ReturnType<typeof criarUsuario>>
let agenteId: string
const pastaDaFonte = (aid: string, fid: string) => path.join(ambiente.storageDir, 'fontes', aid, fid)

beforeEach(async () => {
  await limparBanco()
  autor = await criarUsuario()
  agenteId = (await criarAgenteDeTeste()).agente.id
})
afterEach(() => {
  vi.restoreAllMocks()
  const fontes = path.join(ambiente.storageDir, 'fontes')
  if (existsSync(fontes)) chmodSync(fontes, 0o700)
})
afterAll(limparBanco)

describe('excluir', () => {
  it('remove a linha, os trechos e o diretório da fonte, e só dela', async () => {
    const a = await criarFonteDeTeste({ agenteId, status: 'pronto' })
    const b = await criarFonteDeTeste({ agenteId, status: 'pronto' })
    await prisma.trecho.createMany({
      data: [a, b].map((f) => ({ fonteId: f.id, agenteId, indice: 0, texto: 't', caracteres: 1 })),
    })

    await excluir(autor, agenteId, a.id)

    expect(await prisma.fonte.findUnique({ where: { id: a.id } })).toBeNull()
    expect(await prisma.trecho.count({ where: { fonteId: a.id } })).toBe(0)
    expect(existsSync(pastaDaFonte(agenteId, a.id))).toBe(false)
    expect(existsSync(pastaDaFonte(agenteId, b.id))).toBe(true)
    expect(await prisma.trecho.count({ where: { fonteId: b.id } })).toBe(1)
  })

  it('fonte inexistente ou de outro agente é 404 e nada é apagado', async () => {
    const outro = (await criarAgenteDeTeste('Outro')).agente.id
    const minha = await criarFonteDeTeste({ agenteId })
    await expect(excluir(autor, agenteId, 'nao-existe')).rejects.toMatchObject({ status: 404 })
    await expect(excluir(autor, outro, minha.id)).rejects.toMatchObject({ status: 404 })
    expect(existsSync(pastaDaFonte(agenteId, minha.id))).toBe(true)
    await expect(excluir(null as never, agenteId, minha.id)).rejects.toMatchObject({ status: 401 })
  })

  it('se apagar o arquivo falhar, a linha some mesmo assim e o erro vai para o log', async () => {
    const fonte = await criarFonteDeTeste({ agenteId })
    chmodSync(path.join(ambiente.storageDir, 'fontes', agenteId), 0o500)
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    await expect(excluir(autor, agenteId, fonte.id)).resolves.toBeUndefined()
    chmodSync(path.join(ambiente.storageDir, 'fontes', agenteId), 0o700)
    expect(await prisma.fonte.count()).toBe(0)
    expect(JSON.parse(String(log.mock.calls[0]![0]))).toMatchObject({ msg: 'armazenamento_falhou', fonteId: fonte.id })
  })
})

describe('reprocessar', () => {
  it('fonte em erro volta a pendente, e depois da fila fica pronta com os trechos novos', async () => {
    const fonte = await criarFonteDeTeste({
      agenteId,
      status: 'erro',
      bytes: Buffer.from('Agora o arquivo está certo.'),
    })
    await prisma.fonte.update({ where: { id: fonte.id }, data: { mensagemErro: 'Falhou antes.' } })
    await prisma.trecho.create({ data: { fonteId: fonte.id, agenteId, indice: 0, texto: 'lixo antigo', caracteres: 11 } })

    const devolvida = await reprocessar(autor, agenteId, fonte.id)
    expect(devolvida).toMatchObject({ id: fonte.id, status: 'pendente', mensagemErro: null })
    expect(devolvida).not.toHaveProperty('caminhoArquivo')

    await obterFila().processarPendentes()

    const depois = await obter(autor, agenteId, fonte.id)
    expect(depois.status).toBe('pronto')
    const trechos = await prisma.trecho.findMany({ where: { fonteId: fonte.id } })
    expect(trechos.map((t) => t.texto)).toEqual(['Agora o arquivo está certo.'])
  })

  it('fonte pronta, pendente ou processando lança 409 e não muda nada', async () => {
    for (const status of ['pronto', 'pendente', 'processando']) {
      const f = await criarFonteDeTeste({ agenteId, status })
      await expect(reprocessar(autor, agenteId, f.id), status).rejects.toMatchObject({
        status: 409,
        message: /erro/,
      })
      expect((await prisma.fonte.findUniqueOrThrow({ where: { id: f.id } })).status).toBe(status)
    }
  })

  it('fonte inexistente ou de outro agente é 404; sem autor é 401', async () => {
    const outro = (await criarAgenteDeTeste('Outro')).agente.id
    const f = await criarFonteDeTeste({ agenteId, status: 'erro' })
    await expect(reprocessar(autor, agenteId, 'nao-existe')).rejects.toMatchObject({ status: 404 })
    await expect(reprocessar(autor, outro, f.id)).rejects.toMatchObject({ status: 404 })
    await expect(reprocessar(null as never, agenteId, f.id)).rejects.toMatchObject({ status: 401 })
    expect((await prisma.fonte.findUniqueOrThrow({ where: { id: f.id } })).status).toBe('erro')
  })
})
