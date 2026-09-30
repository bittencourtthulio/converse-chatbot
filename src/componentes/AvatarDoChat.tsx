import { iniciaisDe } from '@/componentes/iniciais'

export const AVATARES_DO_CHAT = ['iniciais', 'chat', 'robo', 'estrela', 'fone'] as const
export type AvatarDoChatNome = (typeof AVATARES_DO_CHAT)[number]

export const ROTULO_DO_AVATAR: Record<AvatarDoChatNome, string> = {
  iniciais: 'Iniciais do nome',
  chat: 'Balão de conversa',
  robo: 'Robô',
  estrela: 'Estrela',
  fone: 'Fone de atendimento',
}

// Ícones de traço em SVG inline, como os de `Icones.tsx`: sem upload nem rede.
const FORMAS: Record<Exclude<AvatarDoChatNome, 'iniciais'>, React.ReactNode> = {
  chat: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />,
  robo: (
    <>
      <rect x="4" y="8" width="16" height="12" rx="3" />
      <path d="M12 8V4M9 13v1M15 13v1M9 17h6" />
      <circle cx="12" cy="3.5" r="1" />
    </>
  ),
  estrela: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z" />,
  fone: (
    <>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="2.5" y="14" width="4" height="6" rx="1.5" />
      <rect x="17.5" y="14" width="4" height="6" rx="1.5" />
      <path d="M20 20c0 1.5-2 2-5 2" />
    </>
  ),
}

/**
 * O avatar do chat (PR-55): iniciais do título ou um ícone predefinido, sem
 * upload. Decorativo: o título ao lado dá o nome acessível. A cor vem das
 * variáveis `--cor-do-agente` e `--cor-do-agente-fg` do contêiner.
 */
export function AvatarDoChat({
  avatar,
  titulo,
  tamanho = 36,
}: {
  avatar: AvatarDoChatNome
  titulo: string
  tamanho?: number
}) {
  return (
    <span
      className="avatar-do-chat"
      aria-hidden="true"
      style={{ width: tamanho, height: tamanho, fontSize: Math.round(tamanho * 0.4) }}
    >
      {avatar === 'iniciais' ? (
        iniciaisDe(titulo)
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={Math.round(tamanho * 0.56)}
          height={Math.round(tamanho * 0.56)}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {FORMAS[avatar]}
        </svg>
      )}
    </span>
  )
}
