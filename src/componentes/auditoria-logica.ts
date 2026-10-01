// A lógica da tela de Auditoria (FT-10, PR-19, PR-86), sem React nem banco: o rótulo e a frase
// em português de cada ação e dos seus detalhes, as opções do filtro e os links da paginação.
// A frase nunca repete valor sensível: os detalhes já chegam sem segredo, sem texto de conversa
// e sem identificador de visitante, e o e-mail só aparece onde o próprio registro o guardou
// (o rótulo de quem foi excluído).
import { ACOES, type AcaoDeAuditoria } from '@/servicos/auditoria-acoes'

const ROTULOS: Record<AcaoDeAuditoria, string> = {
  chave_openrouter_alterada: 'Chave do OpenRouter trocada',
  chave_openrouter_removida: 'Chave do OpenRouter removida',
  modelo_transcricao_alterado: 'Modelo de transcrição alterado',
  usuario_criado: 'Usuário criado',
  usuario_editado: 'Usuário editado',
  usuario_excluido: 'Usuário excluído',
  agente_excluido: 'Agente excluído',
  canal_conectado: 'Canal conectado',
  canal_desconectado: 'Canal desconectado',
  canal_pausado: 'Canal pausado',
  canal_retomado: 'Canal retomado',
  canal_limite_alterado: 'Limite do canal alterado',
  conversa_apagada: 'Conversa apagada',
  retencao_alterada: 'Retenção alterada',
  dados_do_titular_apagados: 'Dados do titular apagados',
  dados_do_titular_exportados: 'Dados do titular exportados',
  expurgo_automatico: 'Expurgo automático',
  restauracao: 'Restauração de dados',
}

/** O rótulo curto da ação; ação que o conjunto não conhece volta como veio. */
export function rotuloDaAcao(acao: string): string {
  return (ROTULOS as Record<string, string>)[acao] ?? acao
}

export interface OpcaoDeAcao {
  valor: string
  rotulo: string
}

/** As opções do filtro de ação: "Todas" e depois cada ação, em ordem alfabética de rótulo. */
export const OPCOES_DE_ACAO: OpcaoDeAcao[] = [
  { valor: '', rotulo: 'Todas as ações' },
  ...[...ACOES]
    .map((valor) => ({ valor: valor as string, rotulo: ROTULOS[valor] }))
    .sort((a, b) => a.rotulo.localeCompare(b.rotulo, 'pt-BR')),
]

export interface RegistroParaDescrever {
  acao: string
  alvoTipo: string
  alvoId: string | null
  /** O nome atual do alvo quando ele ainda existe (usuário), resolvido por quem lista. */
  alvoNome: string | null
  detalhes: Record<string, unknown>
}

const texto = (v: unknown): string | null => (typeof v === 'string' && v.trim() !== '' ? v : null)
const numero = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null)
const plural = (n: number, singular: string, mais: string) => `${n} ${n === 1 ? singular : mais}`

const CANAIS: Record<string, string> = { widget: 'chat embutido', telegram: 'Telegram', painel: 'painel' }
const canalDe = (v: unknown) => (typeof v === 'string' ? (CANAIS[v] ?? v) : null)
const PAPEIS: Record<string, string> = { admin: 'Administrador', usuario: 'Usuário' }
const papelDe = (v: unknown) => (typeof v === 'string' ? (PAPEIS[v] ?? v) : null)

function dias(v: unknown): string | null {
  if (v === null) return 'sem expurgo automático'
  const n = numero(v)
  return n === null ? null : `${n} dias`
}

function editadoDeUsuario(d: Record<string, unknown>, nome: string | null): string {
  const campos = Array.isArray(d.campos) ? d.campos.filter((c): c is string => typeof c === 'string') : []
  const alvo = nome ?? 'removido'
  const frases: string[] = []
  const cadastro = [campos.includes('nome') && 'o nome', campos.includes('email') && 'o e-mail'].filter((c): c is string => c !== false)
  if (cadastro.length > 0) frases.push(`Alterou ${cadastro.join(' e ')} do usuário ${alvo}.`)
  if (campos.includes('papel')) {
    const de = papelDe(d.papelAnterior)
    const para = papelDe(d.papelNovo)
    const quem = nome ?? 'um usuário removido'
    frases.push(`Alterou o papel de ${quem}${de && para ? ` de ${de} para ${para}` : ''}.`)
  }
  if (campos.includes('ativo')) frases.push(`${d.ativo === true ? 'Reativou' : 'Desativou'} o usuário ${alvo}.`)
  return frases.length > 0 ? frases.join(' ') : 'Alterou um usuário.'
}

function canalDoTelegram(verbo: string, d: Record<string, unknown>, preposicao: string): string {
  const agente = texto(d.agente)
  return `${verbo} o bot do Telegram ${preposicao} ${agente ? `agente "${agente}"` : 'um agente'}.`
}

/**
 * A frase da ação para a tabela, em português, a partir dos detalhes gravados. Quem fez a ação
 * e quando já vêm em colunas próprias. Detalhe ausente ou fora do formato não quebra a frase.
 */
export function descreverRegistro(r: RegistroParaDescrever): string {
  const d = r.detalhes
  switch (r.acao) {
    case 'chave_openrouter_alterada':
      return 'Trocou a chave do OpenRouter.'
    case 'chave_openrouter_removida':
      return 'Removeu a chave do OpenRouter.'
    case 'modelo_transcricao_alterado': {
      if (d.restaurado === true) return 'Restaurou o modelo de transcrição para o padrão.'
      const modelo = texto(d.modelo)
      return modelo ? `Alterou o modelo de transcrição para ${modelo}.` : 'Alterou o modelo de transcrição.'
    }
    case 'usuario_criado': {
      const papel = papelDe(d.papel)
      return `Criou o usuário ${r.alvoNome ?? 'removido'}${papel ? ` com o papel ${papel}` : ''}.`
    }
    case 'usuario_editado':
      return editadoDeUsuario(d, r.alvoNome)
    case 'usuario_excluido': {
      const rotulo = texto(d.rotulo)
      const base = `Excluiu definitivamente ${rotulo ? `o usuário ${rotulo}` : 'um usuário'}.`
      const n = numero(d.agentesTransferidos) ?? 0
      return n > 0 ? `${base} ${plural(n, 'agente passou', 'agentes passaram')} para quem excluiu.` : base
    }
    case 'agente_excluido': {
      const nome = texto(d.nome)
      if (!nome) return 'Excluiu um agente.'
      const conversas = numero(d.conversas)
      const fontes = numero(d.fontes)
      const resto =
        conversas !== null && fontes !== null
          ? ` (${plural(conversas, 'conversa', 'conversas')} e ${plural(fontes, 'fonte', 'fontes')} apagadas junto)`
          : ''
      return `Excluiu o agente "${nome}"${resto}.`
    }
    case 'canal_conectado':
      return canalDoTelegram('Conectou', d, 'ao')
    case 'canal_desconectado':
      return canalDoTelegram('Desconectou', d, 'do')
    case 'canal_pausado':
      return canalDoTelegram('Pausou', d, 'do')
    case 'canal_retomado':
      return canalDoTelegram('Retomou', d, 'do')
    case 'canal_limite_alterado': {
      const agente = texto(d.agente)
      return `Alterou o limite diário do bot do Telegram ${agente ? `do agente "${agente}"` : 'de um agente'}.`
    }
    case 'conversa_apagada': {
      const canal = canalDe(d.canal)
      const n = numero(d.mensagens)
      const mensagens = n !== null ? ` (${plural(n, 'mensagem', 'mensagens')})` : ''
      const onde = canal ? ` do ${canal}` : ''
      if (d.origem === 'visitante') return `O visitante apagou a própria conversa${onde}${mensagens}.`
      return `Apagou uma conversa${onde}${mensagens}.`
    }
    case 'retencao_alterada': {
      const de = dias(d.diasAnterior)
      const para = dias(d.diasNovo)
      return de && para ? `Alterou a retenção das conversas de ${de} para ${para}.` : 'Alterou a retenção das conversas.'
    }
    case 'dados_do_titular_apagados':
    case 'dados_do_titular_exportados': {
      const exportou = r.acao === 'dados_do_titular_exportados'
      const canal = canalDe(d.canal)
      const formato = texto(d.formato)?.toUpperCase()
      const c = numero(d.conversas)
      const m = numero(d.mensagens)
      const contagem = c !== null && m !== null ? `: ${plural(c, 'conversa', 'conversas')} e ${plural(m, 'mensagem', 'mensagens')}` : ''
      return `${exportou ? 'Exportou' : 'Apagou'} os dados de um titular${canal ? ` do ${canal}` : ''}${exportou && formato ? ` em ${formato}` : ''}${contagem}.`
    }
    case 'expurgo_automatico': {
      const c = numero(d.conversas) ?? 0
      const m = numero(d.mensagens) ?? 0
      const t = numero(d.atualizacoesDoTelegram) ?? 0
      const a = numero(d.registrosDeAuditoria) ?? 0
      const retencao = dias(d.retencaoDias)
      return (
        `O expurgo automático apagou ${plural(c, 'conversa', 'conversas')} (${plural(m, 'mensagem', 'mensagens')}), ` +
        `${plural(t, 'registro de controle do Telegram', 'registros de controle do Telegram')} e ` +
        `${plural(a, 'registro de auditoria antigo', 'registros de auditoria antigos')}.` +
        (retencao ? ` Retenção das conversas: ${retencao}.` : '')
      )
    }
    case 'restauracao': {
      const origem = texto(d.origem)
      return `Restaurou os dados a partir de um backup${origem ? ` (${origem})` : ''}.`
    }
    default:
      return `Ação registrada: ${r.acao}.`
  }
}

export interface FiltrosDaTela {
  acao?: string
  usuarioId?: string
  de?: string
  ate?: string
}

/** O `?acao=...&usuario=...&de=...&ate=...&pagina=N` dos links; só o que foi informado, e sem a página 1. */
export function montarQueryDaAuditoria(filtros: FiltrosDaTela, pagina: number): string {
  const p = new URLSearchParams()
  if (filtros.acao) p.set('acao', filtros.acao)
  if (filtros.usuarioId) p.set('usuario', filtros.usuarioId)
  if (filtros.de) p.set('de', filtros.de)
  if (filtros.ate) p.set('ate', filtros.ate)
  if (pagina > 1) p.set('pagina', String(pagina))
  const texto = p.toString()
  return texto === '' ? '' : `?${texto}`
}

/** O intervalo mostrado: `26 a 50 de 60 registros`. */
export function descricaoDaPaginaDeAuditoria(p: { pagina: number; tamanho: number; total: number }): string {
  if (p.total === 0) return 'Nenhum registro'
  const de = (p.pagina - 1) * p.tamanho + 1
  const ate = Math.min(p.total, p.pagina * p.tamanho)
  return `${de} a ${ate} de ${p.total} ${p.total === 1 ? 'registro' : 'registros'}`
}

export const CAMINHO_DA_AUDITORIA = '/configuracoes/auditoria'

/** O link de uma página da lista, mantendo os filtros. */
export function hrefDaPaginaDeAuditoria(filtros: FiltrosDaTela, pagina: number): string {
  return `${CAMINHO_DA_AUDITORIA}${montarQueryDaAuditoria(filtros, pagina)}`
}

type ParametrosDaUrl = Record<string, string | string[] | undefined>
const primeiro = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v[0] : v)

/** Os filtros e a página como vêm da URL (`acao`, `usuario`, `de`, `ate`, `pagina`); a validação é do serviço. */
export function entradaDosFiltrosDaAuditoria(p: ParametrosDaUrl): FiltrosDaTela & { pagina?: string } {
  const limpa = (v: string | undefined) => (v === undefined || v.trim() === '' ? undefined : v.trim())
  return {
    acao: limpa(primeiro(p.acao)),
    usuarioId: limpa(primeiro(p.usuario)),
    de: limpa(primeiro(p.de)),
    ate: limpa(primeiro(p.ate)),
    pagina: limpa(primeiro(p.pagina)),
  }
}
