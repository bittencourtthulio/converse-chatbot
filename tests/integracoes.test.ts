import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { decifrar } from '@/lib/cripto'
import {
  estadoDoOpenrouter,
  salvarChaveDoOpenrouter,
  removerChaveDoOpenrouter,
  chaveDoOpenrouterConfigurada,
} from '@/servicos/integracoes'
import { criarAdmin, criarUsuario, limparBanco } from './ajuda'

const CHAVE = 'sk-or-v1-abcdef0123456789-a1b2'
const chaveDeTeste = process.env.ENCRYPTION_KEY

beforeEach(limparBanco)
afterEach(() => {
  process.env.ENCRYPTION_KEY = chaveDeTeste
})

describe('estado sem chave', () => {
  it('não configurada, sem máscara', async () => {
    const admin = await criarAdmin()
    expect(await estadoDoOpenrouter(admin)).toEqual({
      configurada: false,
      mascara: null,
      atualizadoEm: null,
      problema: null,
    })
  })

  it('não precisa de ENCRYPTION_KEY para dizer que não há chave', async () => {
    delete process.env.ENCRYPTION_KEY
    const admin = await criarAdmin()
    expect((await estadoDoOpenrouter(admin)).configurada).toBe(false)
  })
})

describe('salvar a chave', () => {
  it('grava texto que não contém a chave, nem parte dela', async () => {
    const admin = await criarAdmin()
    await salvarChaveDoOpenrouter(admin, { chave: CHAVE })
    const linha = await prisma.configuracaoDoWorkspace.findUniqueOrThrow({
      where: { id: 'unica' },
    })
    expect(linha.openrouterChaveCifrada).toBeTruthy()
    expect(linha.openrouterChaveCifrada).not.toContain('abcdef0123456789')
    expect(decifrar(linha.openrouterChaveCifrada!)).toBe(CHAVE)
    expect(linha.atualizadoPor).toBe(admin.id)
  })

  it('o estado devolve configurada, máscara e data, e nada da chave', async () => {
    const admin = await criarAdmin()
    const estado = await salvarChaveDoOpenrouter(admin, { chave: `  ${CHAVE}  ` })
    expect(estado.configurada).toBe(true)
    expect(estado.mascara).toBe('sk-or-…a1b2')
    expect(estado.atualizadoEm).toBeInstanceOf(Date)
    const bruto = JSON.stringify(await estadoDoOpenrouter(admin))
    expect(bruto).not.toContain('abcdef0123456789')
    expect(bruto).not.toContain('v1:')
    expect(Object.keys(estado).sort()).toEqual(['atualizadoEm', 'configurada', 'mascara', 'problema'])
  })

  it('duas gravações deixam uma linha só, com a chave nova', async () => {
    const admin = await criarAdmin()
    await salvarChaveDoOpenrouter(admin, { chave: CHAVE })
    const estado = await salvarChaveDoOpenrouter(admin, { chave: 'sk-or-v1-outra-chave-9999' })
    expect(await prisma.configuracaoDoWorkspace.count()).toBe(1)
    expect(estado.mascara).toBe('sk-or-…9999')
  })

  it('usuário comum recebe 403 e nada é gravado', async () => {
    const comum = await criarUsuario()
    await expect(salvarChaveDoOpenrouter(comum, { chave: CHAVE })).rejects.toMatchObject({
      status: 403,
    })
    expect(await prisma.configuracaoDoWorkspace.count()).toBe(0)
  })

  it.each([undefined, '', '   ', 'curta', 'tem espaço no meio da chave 123'])(
    'entrada %j recebe 422',
    async (chave) => {
      const admin = await criarAdmin()
      await expect(salvarChaveDoOpenrouter(admin, { chave })).rejects.toMatchObject({
        status: 422,
      })
    },
  )

  it('sem ENCRYPTION_KEY a gravação falha com erro claro e não grava', async () => {
    const admin = await criarAdmin()
    delete process.env.ENCRYPTION_KEY
    await expect(salvarChaveDoOpenrouter(admin, { chave: CHAVE })).rejects.toThrow(
      /ENCRYPTION_KEY/,
    )
    expect(await prisma.configuracaoDoWorkspace.count()).toBe(0)
  })

  it('a mensagem de erro de validação não repete a chave digitada', async () => {
    const admin = await criarAdmin()
    try {
      await salvarChaveDoOpenrouter(admin, { chave: 'tem espaço secreto-777' })
    } catch (erro) {
      expect((erro as Error).message).not.toContain('secreto-777')
    }
  })
})

describe('remover a chave', () => {
  it('volta a não configurada e apaga o texto cifrado', async () => {
    const admin = await criarAdmin()
    await salvarChaveDoOpenrouter(admin, { chave: CHAVE })
    const estado = await removerChaveDoOpenrouter(admin)
    expect(estado.configurada).toBe(false)
    expect(estado.mascara).toBeNull()
    const linha = await prisma.configuracaoDoWorkspace.findUnique({ where: { id: 'unica' } })
    expect(linha?.openrouterChaveCifrada ?? null).toBeNull()
  })

  it('usuário comum recebe 403', async () => {
    const admin = await criarAdmin()
    await salvarChaveDoOpenrouter(admin, { chave: CHAVE })
    const comum = await criarUsuario()
    await expect(removerChaveDoOpenrouter(comum)).rejects.toMatchObject({ status: 403 })
    expect((await estadoDoOpenrouter(admin)).configurada).toBe(true)
  })
})

describe('estado', () => {
  it('só admin lê o estado', async () => {
    const comum = await criarUsuario()
    await expect(estadoDoOpenrouter(comum)).rejects.toMatchObject({ status: 403 })
  })

  it('com a ENCRYPTION_KEY trocada, o estado avisa em vez de falhar', async () => {
    const admin = await criarAdmin()
    await salvarChaveDoOpenrouter(admin, { chave: CHAVE })
    process.env.ENCRYPTION_KEY = 'ff'.repeat(32)
    const estado = await estadoDoOpenrouter(admin)
    expect(estado.configurada).toBe(true)
    expect(estado.mascara).toBeNull()
    expect(estado.problema).toMatch(/cadastre.*de novo|não foi possível ler/i)
    expect(JSON.stringify(estado)).not.toContain('abcdef0123456789')
  })

  it('sem ENCRYPTION_KEY e com chave gravada, o estado avisa em vez de falhar', async () => {
    const admin = await criarAdmin()
    await salvarChaveDoOpenrouter(admin, { chave: CHAVE })
    delete process.env.ENCRYPTION_KEY
    const estado = await estadoDoOpenrouter(admin)
    expect(estado.configurada).toBe(true)
    expect(estado.problema).toMatch(/ENCRYPTION_KEY/)
  })
})

describe('chaveDoOpenrouterConfigurada', () => {
  it('diz se há chave gravada, sem decifrar nem devolver nada dela', async () => {
    const admin = await criarAdmin()
    expect(await chaveDoOpenrouterConfigurada()).toBe(false)
    await salvarChaveDoOpenrouter(admin, { chave: CHAVE })
    expect(await chaveDoOpenrouterConfigurada()).toBe(true)
    delete process.env.ENCRYPTION_KEY
    expect(await chaveDoOpenrouterConfigurada()).toBe(true)
    process.env.ENCRYPTION_KEY = chaveDeTeste
    await removerChaveDoOpenrouter(admin)
    expect(await chaveDoOpenrouterConfigurada()).toBe(false)
  })
})
