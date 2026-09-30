import { describe, it, expect } from 'vitest'
import { iniciaisDe } from '@/componentes/iniciais'

describe('iniciais do nome', () => {
  it('usa a primeira e a última palavra', () => {
    expect(iniciaisDe('Ana Maria Souza')).toBe('AS')
    expect(iniciaisDe('  admin   de rota ')).toBe('AR')
  })
  it('uma palavra dá uma letra e vazio dá interrogação', () => {
    expect(iniciaisDe('Ana')).toBe('A')
    expect(iniciaisDe('   ')).toBe('?')
  })
})
