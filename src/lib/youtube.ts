// Legendas de vídeos do YouTube (FT-08, PR-75). NÃO há API oficial aqui: o
// mecanismo lê a página do vídeo e as legendas que ela aponta, o que o YouTube
// pode mudar sem aviso (fragilidade assumida, lacuna registrada). SSRF: a URL
// do usuário só serve para extrair o id e precisa ter host do YouTube; o
// servidor nunca conecta ao host que o usuário digitou, só à base configurada
// (`YOUTUBE_BASE`, padrão `https://www.youtube.com`).
import { ambiente } from '@/lib/ambiente'
import { ErroDeAplicacao } from '@/lib/erros'

const HOSTS_DE_URL = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'])
const ID_DO_VIDEO = /^[A-Za-z0-9_-]{11}$/

const urlInvalida = () =>
  new ErroDeAplicacao(
    'Informe o link de um vídeo do YouTube (youtube.com ou youtu.be), como https://www.youtube.com/watch?v=...',
    422,
    'url_invalida',
  )

/**
 * O id de 11 caracteres de um link de `youtube.com/watch?v=`, `youtu.be/`,
 * `/shorts/` ou `/embed/`. Outro host, outro esquema que não http ou https,
 * credencial ou porta na URL e id fora do formato são `url_invalida` (422).
 */
export function extrairIdDoYoutube(entrada: unknown): string {
  if (typeof entrada !== 'string' || entrada.trim() === '') throw urlInvalida()
  let url: URL
  try {
    url = new URL(entrada.trim())
  } catch {
    throw urlInvalida()
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw urlInvalida()
  if (url.username !== '' || url.password !== '' || url.port !== '') throw urlInvalida()
  const host = url.hostname.toLowerCase()
  if (!HOSTS_DE_URL.has(host)) throw urlInvalida()

  const partes = url.pathname.split('/').filter(Boolean)
  let candidato: string | null | undefined
  if (host === 'youtu.be') candidato = partes[0]
  else if (url.pathname === '/watch') candidato = url.searchParams.get('v')
  else if (partes.length >= 2 && (partes[0] === 'shorts' || partes[0] === 'embed')) candidato = partes[1]
  if (!candidato || !ID_DO_VIDEO.test(candidato)) throw urlInvalida()
  return candidato
}

/** A URL da página do vídeo na base configurada: única origem das requisições. */
export function urlDoVideo(id: string): string {
  return `${ambiente.youtubeBase}/watch?v=${encodeURIComponent(id)}`
}

/** O link que a tela mostra ao usuário: sempre o endereço oficial, mesmo com base de teste. */
export function urlDeOrigem(id: string): string {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`
}
