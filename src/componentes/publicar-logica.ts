// A lógica da aba Publicar (FT-06, PR-62), sem React nem rede: a origem e o
// trecho de código para incorporar, o rascunho do formulário que alimenta a
// prévia ao vivo, os avisos que evitam os tropeços conhecidos e o "copiar" com
// reserva para navegador sem `navigator.clipboard`.
import { normalizarCor } from '@/lib/cor'
import type { ConfiguracaoDoEmbed } from '@/componentes/ChatEmbutido'

const HOST_VALIDO = /^[a-z0-9.-]+(:\d{1,5})?$/i
const HOST_LOCAL = /^(localhost|127\.0\.0\.1|\[::1\]|[a-z0-9-]+\.local)(:\d{1,5})?$/i

export interface EntradaDaOrigem {
  /** `APP_URL`, já sem barra final; vence sempre. */
  appUrlPublica?: string
  /** Cabeçalho `Host` da requisição da aba Publicar. */
  host?: string | null
  /** `X-Forwarded-Proto`; só vale com `TRUST_PROXY=1`. */
  protocoloEncaminhado?: string | null
  confiarNoProxy: boolean
}

export const ORIGEM_DE_RESERVA = 'http://localhost:3000'

/**
 * A origem que vai no `src` do trecho: `APP_URL` quando definida; senão a da
 * requisição (host e protocolo). Host com caractere estranho é descartado, para
 * o trecho copiado nunca carregar texto injetado por cabeçalho.
 */
export function origemDoSnippet(e: EntradaDaOrigem): string {
  if (e.appUrlPublica) return e.appUrlPublica
  const host = e.host?.trim()
  if (!host || !HOST_VALIDO.test(host)) return ORIGEM_DE_RESERVA
  const encaminhado = e.protocoloEncaminhado?.split(',')[0]?.trim().toLowerCase()
  const protocolo =
    e.confiarNoProxy && (encaminhado === 'http' || encaminhado === 'https')
      ? encaminhado
      : HOST_LOCAL.test(host)
        ? 'http'
        : 'https'
  return `${protocolo}://${host}`
}

/** O trecho de uma linha que o usuário cola no site. */
export function montarSnippet(origem: string, agenteId: string): string {
  return `<script src="${origem}/widget.js" data-agent="${agenteId}" async></script>`
}

interface LeitorDeCampos {
  get(nome: string): FormDataEntryValue | null
}

const texto = (d: LeitorDeCampos, nome: string): string => {
  const v = d.get(nome)
  return typeof v === 'string' ? v : ''
}

/**
 * O que a prévia precisa do formulário ainda não salvo. Campo em branco ou
 * inválido fica de fora (a prévia mantém o que já tinha); o título vazio vale o
 * nome do agente, como no chat publicado.
 */
export function rascunhoDoFormulario(d: LeitorDeCampos, nomeDoAgente: string): Partial<ConfiguracaoDoEmbed> {
  const r: Partial<ConfiguracaoDoEmbed> = {}
  r.titulo = texto(d, 'titulo').trim() || nomeDoAgente
  const cor = normalizarCor(texto(d, 'cor'))
  if (cor) r.cor = cor
  const posicao = texto(d, 'posicao')
  if (posicao === 'direita' || posicao === 'esquerda') r.posicao = posicao
  const avatar = texto(d, 'avatar')
  if (['iniciais', 'chat', 'robo', 'estrela', 'fone'].includes(avatar)) r.avatar = avatar as ConfiguracaoDoEmbed['avatar']
  const aviso = texto(d, 'avisoDePrivacidade').trim()
  if (aviso === '') r.avisoDePrivacidade = null
  else {
    const url = texto(d, 'avisoDePrivacidadeUrl').trim()
    r.avisoDePrivacidade = { texto: aviso, url: /^https?:\/\//i.test(url) ? url : null }
  }
  r.sugestoes = texto(d, 'sugestoes')
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s !== '')
    .slice(0, 3)
  return r
}

export interface AvisoDaPublicacao {
  tipo: 'info' | 'aviso'
  texto: string
}

export interface EntradaDosAvisos {
  ativo: boolean
  temChave: boolean
  fontesProntas: number
  confiarNoProxy: boolean
  origem: string
}

/** Os avisos da aba Publicar, na ordem de importância (PR-22, PR-36, PR-52, PR-57, PR-62). */
export function avisosDaPublicacao(e: EntradaDosAvisos): AvisoDaPublicacao[] {
  const avisos: AvisoDaPublicacao[] = []
  if (!e.ativo) {
    avisos.push({
      tipo: 'info',
      texto: 'O chat está desligado: quem abrir o seu site não vê o botão. Ligue "Publicar chat" e salve para publicar.',
    })
  }
  if (!e.temChave) {
    avisos.push({
      tipo: 'aviso',
      texto:
        'O OpenRouter ainda não foi configurado: o visitante vê só a mensagem genérica "Não consegui responder agora". Um administrador cadastra a chave em Configurações > Integrações.',
    })
  }
  if (e.fontesProntas === 0) {
    avisos.push({
      tipo: 'info',
      texto: 'Este agente ainda não tem fonte pronta na base: ele responde só com as instruções e o conhecimento geral do modelo.',
    })
  }
  if (!e.confiarNoProxy) {
    avisos.push({
      tipo: 'aviso',
      texto:
        'O sistema não sabe o IP de cada visitante (TRUST_PROXY está desligado): todos dividem o mesmo limite de 10 mensagens por minuto. Atrás de um proxy, defina TRUST_PROXY=1.',
    })
  }
  if (e.origem.startsWith('http://') && !/^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(e.origem)) {
    avisos.push({
      tipo: 'aviso',
      texto: 'O endereço do trecho é http. Em produção use HTTPS: sites com HTTPS bloqueiam o script e o chat por http.',
    })
  }
  return avisos
}

export type ResultadoDoCopiar = 'copiado' | 'selecionado' | 'falhou'

/**
 * Copia o texto. Sem `navigator.clipboard` (página sem HTTPS, navegador antigo)
 * ou se a cópia for negada, `selecionar` marca o texto para a pessoa copiar com
 * o teclado; se nem isso der, `falhou`.
 */
export async function copiarTexto(
  conteudo: string,
  clipboard: { writeText(t: string): Promise<void> } | undefined | null,
  selecionar: () => boolean,
): Promise<ResultadoDoCopiar> {
  if (clipboard && typeof clipboard.writeText === 'function') {
    try {
      await clipboard.writeText(conteudo)
      return 'copiado'
    } catch {
      // cai na reserva
    }
  }
  try {
    return selecionar() ? 'selecionado' : 'falhou'
  } catch {
    return 'falhou'
  }
}
