/**
 * T-04.04 (FT-07): a exclusão mútua por chave em memória (PR-68): tarefas da
 * mesma chave rodam em ordem, uma de cada vez; chaves diferentes não esperam.
 */
import { describe, it, expect } from 'vitest'
import { criarExclusaoMutua } from '@/lib/exclusao-mutua'

const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms))

describe('criarExclusaoMutua', () => {
  it('a mesma chave roda em ordem e sem sobreposição, mesmo que a primeira seja a mais lenta', async () => {
    const trava = criarExclusaoMutua()
    const eventos: string[] = []
    const tarefa = (nome: string, ms: number) => async () => {
      eventos.push(`inicio ${nome}`)
      await dormir(ms)
      eventos.push(`fim ${nome}`)
      return nome
    }
    const resultados = await Promise.all([
      trava.executar('chat-1', tarefa('A', 60)),
      trava.executar('chat-1', tarefa('B', 5)),
      trava.executar('chat-1', tarefa('C', 5)),
    ])
    expect(resultados).toEqual(['A', 'B', 'C'])
    expect(eventos).toEqual(['inicio A', 'fim A', 'inicio B', 'fim B', 'inicio C', 'fim C'])
  })

  it('chaves diferentes rodam ao mesmo tempo', async () => {
    const trava = criarExclusaoMutua()
    const eventos: string[] = []
    const tarefa = (nome: string, ms: number) => async () => {
      eventos.push(`inicio ${nome}`)
      await dormir(ms)
      eventos.push(`fim ${nome}`)
    }
    await Promise.all([trava.executar('chat-1', tarefa('A', 60)), trava.executar('chat-2', tarefa('B', 5))])
    expect(eventos).toEqual(['inicio A', 'inicio B', 'fim B', 'fim A'])
  })

  it('uma tarefa que falha propaga o erro a quem a chamou e não trava a próxima da fila', async () => {
    const trava = criarExclusaoMutua()
    const falha = trava.executar('chat-1', async () => {
      await dormir(10)
      throw new Error('falhou')
    })
    const seguinte = trava.executar('chat-1', async () => 'ok')
    await expect(falha).rejects.toThrow('falhou')
    await expect(seguinte).resolves.toBe('ok')
  })

  it('não guarda chave depois que a fila esvazia', async () => {
    const trava = criarExclusaoMutua()
    await Promise.all([trava.executar('a', async () => 1), trava.executar('b', async () => 2), trava.executar('a', async () => 3)])
    await dormir(5)
    expect(trava.pendentes()).toBe(0)
  })

  it('devolve o valor da tarefa', async () => {
    const trava = criarExclusaoMutua()
    expect(await trava.executar('x', async () => 42)).toBe(42)
  })
})
