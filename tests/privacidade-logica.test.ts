// T-06.04 (FT-10, PR-18, PR-89, PR-91): a lógica pura da tela de Privacidade e o texto fixo do
// painel "Dados pessoais tratados".
import { describe, it, expect } from 'vitest'
import {
  BASE_LEGAL,
  DADOS_POR_CANAL,
  descreverRetencao,
  modoInicialDaRetencao,
  retencaoPodeSalvar,
  textosDoPainelDeDados,
} from '@/componentes/privacidade-logica'

describe('retenção na tela (funcional)', () => {
  it('o modo inicial vem da configuração: dias ou sem expurgo', () => {
    expect(modoInicialDaRetencao(90)).toBe('dias')
    expect(modoInicialDaRetencao(null)).toBe('sem_expurgo')
  })

  it('descreve a retenção em português', () => {
    expect(descreverRetencao(30)).toBe('30 dias')
    expect(descreverRetencao(1)).toBe('1 dia')
    expect(descreverRetencao(null)).toBe('sem expurgo automático: as conversas ficam guardadas até alguém apagá-las')
  })

  it('dias de 7 a 3650 podem ser salvos, fora disso não', () => {
    for (const dias of ['7', '90', '3650', ' 30 ']) expect(retencaoPodeSalvar({ modo: 'dias', dias, confirmouRisco: false }), dias).toBe(true)
    for (const dias of ['6', '3651', '', 'abc', '1,5', '-3']) expect(retencaoPodeSalvar({ modo: 'dias', dias, confirmouRisco: false }), dias).toBe(false)
  })

  it('sem expurgo só pode ser salvo depois de marcar que entende o risco', () => {
    expect(retencaoPodeSalvar({ modo: 'sem_expurgo', dias: '', confirmouRisco: false })).toBe(false)
    expect(retencaoPodeSalvar({ modo: 'sem_expurgo', dias: '', confirmouRisco: true })).toBe(true)
  })
})

describe('painel de dados pessoais tratados (funcional: texto fixo e correto)', () => {
  it('lista os campos de cada canal: visitante, Telegram e painel', () => {
    const canais = DADOS_POR_CANAL.map((c) => c.canal)
    expect(canais).toEqual(['Chat embutido', 'Telegram', 'Painel'])
    const widget = DADOS_POR_CANAL[0]!.campos.join(' ')
    expect(widget).toMatch(/identificador anônimo do visitante/i)
    expect(widget).toMatch(/texto das mensagens/i)
    expect(widget).toMatch(/fontes citadas/i)
    const telegram = DADOS_POR_CANAL[1]!.campos.join(' ')
    expect(telegram).toMatch(/identificador do chat/i)
    expect(telegram).toMatch(/nome público/i)
    expect(telegram).toMatch(/texto das mensagens/i)
  })

  it('traz finalidade, onde ficam e quem acessa, e a retenção atual', () => {
    const t = textosDoPainelDeDados(30)
    expect(t.finalidade).toMatch(/atendimento/i)
    expect(t.ondeFicam).toMatch(/banco de dados/i)
    expect(t.ondeFicam).toMatch(/OpenRouter/)
    expect(t.quemAcessa).toMatch(/equipe/i)
    expect(t.retencao).toContain('30 dias')
    expect(textosDoPainelDeDados(null).retencao).toMatch(/sem expurgo automático/)
  })

  it('a base legal é "legítimo interesse, a confirmar pela empresa", sem afirmar parecer', () => {
    expect(BASE_LEGAL).toBe('Legítimo interesse, a confirmar pela empresa.')
    const tudo = JSON.stringify([DADOS_POR_CANAL, textosDoPainelDeDados(90), BASE_LEGAL]).toLowerCase()
    expect(tudo).not.toContain('parecer')
    expect(tudo).not.toContain('conforme a lgpd')
  })
})
