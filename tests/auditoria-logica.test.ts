// T-06.02 (FT-10, PR-19, PR-86): o texto, em português, que a tela de Auditoria mostra para cada
// ação e seus detalhes, e as opções e os links dos filtros. Módulo puro.
import { describe, it, expect } from 'vitest'
import { ACOES } from '@/servicos/auditoria-acoes'
import {
  OPCOES_DE_ACAO,
  descreverRegistro,
  montarQueryDaAuditoria,
  rotuloDaAcao,
} from '@/componentes/auditoria-logica'

const base = { alvoTipo: 'usuario', alvoId: 'u1', alvoNome: null as string | null, detalhes: {} as Record<string, unknown> }
const reg = (acao: string, detalhes: Record<string, unknown> = {}, extra: Partial<typeof base> = {}) => ({ ...base, ...extra, acao, detalhes })

describe('rótulos (funcional)', () => {
  it('toda ação do conjunto fechado tem rótulo curto e uma descrição que não fica vazia', () => {
    for (const acao of ACOES) {
      expect(rotuloDaAcao(acao), acao).not.toBe(acao)
      expect(rotuloDaAcao(acao).length, acao).toBeGreaterThan(3)
      expect(descreverRegistro(reg(acao)).length, acao).toBeGreaterThan(5)
    }
  })

  it('o select de ações lista todas, em ordem de rótulo, e a primeira opção é "Todas"', () => {
    expect(OPCOES_DE_ACAO[0]).toEqual({ valor: '', rotulo: 'Todas as ações' })
    expect(OPCOES_DE_ACAO.slice(1).map((o) => o.valor).sort()).toEqual([...ACOES].sort())
    const rotulos = OPCOES_DE_ACAO.slice(1).map((o) => o.rotulo)
    expect([...rotulos].sort((a, b) => a.localeCompare(b, 'pt-BR'))).toEqual(rotulos)
  })

  it('ação desconhecida cai no texto da própria ação, sem lançar', () => {
    expect(rotuloDaAcao('acao_nova')).toBe('acao_nova')
    expect(descreverRegistro(reg('acao_nova'))).toContain('acao_nova')
  })
})

describe('descreverRegistro (funcional: frases em português sem dado sensível)', () => {
  it('usuario_editado com o papel devolve a frase com o nome, o papel anterior e o novo, sem e-mail', () => {
    const t = descreverRegistro(reg('usuario_editado', { campos: ['papel'], papelAnterior: 'usuario', papelNovo: 'admin' }, { alvoNome: 'Maria' }))
    expect(t).toBe('Alterou o papel de Maria de Usuário para Administrador.')
    expect(t).not.toMatch(/@/)
  })

  it('usuario_editado combina desativação e campos de cadastro, e trata usuário removido', () => {
    expect(descreverRegistro(reg('usuario_editado', { campos: ['ativo'], ativo: false }, { alvoNome: 'Maria' }))).toBe('Desativou o usuário Maria.')
    expect(descreverRegistro(reg('usuario_editado', { campos: ['ativo'], ativo: true }, { alvoNome: 'Maria' }))).toBe('Reativou o usuário Maria.')
    expect(descreverRegistro(reg('usuario_editado', { campos: ['nome', 'email'] }, { alvoNome: 'Maria' }))).toBe('Alterou o nome e o e-mail do usuário Maria.')
    expect(descreverRegistro(reg('usuario_editado', { campos: ['papel', 'ativo'], papelAnterior: 'admin', papelNovo: 'usuario', ativo: false }, { alvoNome: null }))).toBe(
      'Alterou o papel de um usuário removido de Administrador para Usuário. Desativou o usuário removido.',
    )
  })

  it('usuario_criado e usuario_excluido', () => {
    expect(descreverRegistro(reg('usuario_criado', { papel: 'admin' }, { alvoNome: 'Maria' }))).toBe('Criou o usuário Maria com o papel Administrador.')
    expect(descreverRegistro(reg('usuario_excluido', { rotulo: 'João <joao@x.com>', papel: 'usuario', agentesTransferidos: 2 }))).toBe(
      'Excluiu definitivamente o usuário João <joao@x.com>. 2 agentes passaram para quem excluiu.',
    )
    expect(descreverRegistro(reg('usuario_excluido', { rotulo: 'João <joao@x.com>', agentesTransferidos: 1 }))).toContain('1 agente passou')
    expect(descreverRegistro(reg('usuario_excluido', { rotulo: 'João <joao@x.com>', agentesTransferidos: 0 }))).toBe('Excluiu definitivamente o usuário João <joao@x.com>.')
  })

  it('a chave do OpenRouter nunca mostra valor', () => {
    expect(descreverRegistro(reg('chave_openrouter_alterada'))).toBe('Trocou a chave do OpenRouter.')
    expect(descreverRegistro(reg('chave_openrouter_removida'))).toBe('Removeu a chave do OpenRouter.')
  })

  it('modelo de transcrição, agente excluído e canais', () => {
    expect(descreverRegistro(reg('modelo_transcricao_alterado', { modelo: 'google/gemini-2.5-pro', restaurado: false }))).toBe('Alterou o modelo de transcrição para google/gemini-2.5-pro.')
    expect(descreverRegistro(reg('modelo_transcricao_alterado', { modelo: null, restaurado: true }))).toBe('Restaurou o modelo de transcrição para o padrão.')
    expect(descreverRegistro(reg('agente_excluido', { nome: 'Loja', conversas: 2, fontes: 1 }))).toBe('Excluiu o agente "Loja" (2 conversas e 1 fonte apagadas junto).')
    expect(descreverRegistro(reg('canal_conectado', { agente: 'Loja' }))).toBe('Conectou o bot do Telegram ao agente "Loja".')
    expect(descreverRegistro(reg('canal_desconectado', { agente: 'Loja' }))).toBe('Desconectou o bot do Telegram do agente "Loja".')
    expect(descreverRegistro(reg('canal_pausado', { agente: 'Loja' }))).toBe('Pausou o bot do Telegram do agente "Loja".')
    expect(descreverRegistro(reg('canal_retomado', { agente: 'Loja' }))).toBe('Retomou o bot do Telegram do agente "Loja".')
    expect(descreverRegistro(reg('canal_limite_alterado', { agente: 'Loja' }))).toBe('Alterou o limite diário do bot do Telegram do agente "Loja".')
  })

  it('conversa apagada informa a contagem de mensagens e quem pediu, sem texto', () => {
    expect(descreverRegistro(reg('conversa_apagada', { canal: 'widget', mensagens: 4 }))).toBe('Apagou uma conversa do chat embutido (4 mensagens).')
    expect(descreverRegistro(reg('conversa_apagada', { canal: 'telegram', mensagens: 1 }))).toBe('Apagou uma conversa do Telegram (1 mensagem).')
    expect(descreverRegistro(reg('conversa_apagada', { canal: 'widget', mensagens: 4, origem: 'visitante' }))).toBe('O visitante apagou a própria conversa do chat embutido (4 mensagens).')
  })

  it('retenção, titular e expurgo', () => {
    expect(descreverRegistro(reg('retencao_alterada', { diasAnterior: 90, diasNovo: 30 }))).toBe('Alterou a retenção das conversas de 90 dias para 30 dias.')
    expect(descreverRegistro(reg('retencao_alterada', { diasAnterior: 30, diasNovo: null }))).toBe('Alterou a retenção das conversas de 30 dias para sem expurgo automático.')
    expect(descreverRegistro(reg('dados_do_titular_apagados', { canal: 'widget', conversas: 2, mensagens: 5 }))).toBe('Apagou os dados de um titular do chat embutido: 2 conversas e 5 mensagens.')
    expect(descreverRegistro(reg('dados_do_titular_exportados', { canal: 'telegram', conversas: 1, mensagens: 2, formato: 'json' }))).toBe('Exportou os dados de um titular do Telegram em JSON: 1 conversa e 2 mensagens.')
    expect(descreverRegistro(reg('expurgo_automatico', { conversas: 3, mensagens: 7, atualizacoesDoTelegram: 1, registrosDeAuditoria: 2, retencaoDias: 90 }))).toBe(
      'O expurgo automático apagou 3 conversas (7 mensagens), 1 registro de controle do Telegram e 2 registros de auditoria antigos. Retenção das conversas: 90 dias.',
    )
    expect(descreverRegistro(reg('restauracao', { origem: 'arquivo de backup' }))).toBe('Restaurou os dados a partir de um backup (arquivo de backup).')
  })

  it('detalhe ausente ou fora do formato não quebra a frase', () => {
    expect(descreverRegistro(reg('agente_excluido', { nome: 42 as unknown as string }))).toBe('Excluiu um agente.')
    expect(descreverRegistro(reg('retencao_alterada', {}))).toBe('Alterou a retenção das conversas.')
    expect(descreverRegistro(reg('conversa_apagada', {}))).toBe('Apagou uma conversa.')
  })
})

describe('montarQueryDaAuditoria (funcional)', () => {
  it('monta os parâmetros só com o que foi informado e omite a página 1', () => {
    expect(montarQueryDaAuditoria({}, 1)).toBe('')
    expect(montarQueryDaAuditoria({ acao: 'usuario_criado', usuarioId: '', de: '2026-01-01', ate: '' }, 1)).toBe('?acao=usuario_criado&de=2026-01-01')
    expect(montarQueryDaAuditoria({ acao: 'usuario_criado' }, 3)).toBe('?acao=usuario_criado&pagina=3')
    expect(montarQueryDaAuditoria({}, 2)).toBe('?pagina=2')
  })

  it('codifica valores com caracteres especiais', () => {
    expect(montarQueryDaAuditoria({ usuarioId: 'a b&c' }, 1)).toBe('?usuario=a+b%26c')
  })
})
