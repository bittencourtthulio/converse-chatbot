// T-03.02 (FT-10, PR-88): a regra pura da confirmação de "Excluir definitivamente".
import { describe, it, expect } from 'vitest'
import {
  TEXTO_DA_EXCLUSAO,
  emailConfere,
  normalizarEmailDigitado,
  podeOferecerExclusao,
} from '@/componentes/excluir-usuario-logica'

describe('emailConfere (funcional)', () => {
  it('confere sem diferença de maiúsculas nem de espaços nas pontas', () => {
    expect(emailConfere('  MARIA@Empresa.com.br ', 'maria@empresa.com.br')).toBe(true)
    expect(emailConfere('maria@empresa.com.br', 'maria@empresa.com.br')).toBe(true)
  })

  it('recusa vazio, parcial e e-mail de outra pessoa', () => {
    expect(emailConfere('', 'maria@empresa.com.br')).toBe(false)
    expect(emailConfere('maria@empresa', 'maria@empresa.com.br')).toBe(false)
    expect(emailConfere('joao@empresa.com.br', 'maria@empresa.com.br')).toBe(false)
    expect(emailConfere('maria@empresa.com.br x', 'maria@empresa.com.br')).toBe(false)
  })

  it('normalizarEmailDigitado tira espaços e baixa a caixa', () => {
    expect(normalizarEmailDigitado('  A@B.com ')).toBe('a@b.com')
  })
})

describe('regras da tela (integração com os textos)', () => {
  it('a própria linha não oferece a ação', () => {
    expect(podeOferecerExclusao({ ehVoce: true })).toBe(false)
    expect(podeOferecerExclusao({ ehVoce: false })).toBe(true)
  })

  it('o texto diz que é irreversível, o que permanece e que desativar é a alternativa reversível', () => {
    expect(TEXTO_DA_EXCLUSAO.descricao).toMatch(/irrevers/i)
    expect(TEXTO_DA_EXCLUSAO.descricao).toMatch(/agentes/i)
    expect(TEXTO_DA_EXCLUSAO.descricao).toMatch(/conversas/i)
    expect(TEXTO_DA_EXCLUSAO.alternativa).toMatch(/Desativar/)
    expect(TEXTO_DA_EXCLUSAO.alternativa).toMatch(/desfeita/i)
  })
})
