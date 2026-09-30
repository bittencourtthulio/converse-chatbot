import type { NextConfig } from 'next'

// Cabeçalhos de segurança em toda resposta (PR-37).
const cabecalhosDeSeguranca = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value:
      'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  },
]

// O X-Frame-Options: DENY vale para tudo, menos /embed (FT-06, PR-59): a página do
// iframe é emoldurada de propósito, e quem decide por quem é o `frame-ancestors`
// que o `src/proxy.ts` define conforme os domínios do agente. Caminho que só
// começa com a palavra (`/embedded`) continua negado.
const naoEmoldurar = [{ key: 'X-Frame-Options', value: 'DENY' }]

const config: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      { source: '/:path*', headers: cabecalhosDeSeguranca },
      { source: '/((?!embed$|embed/).*)', headers: naoEmoldurar },
    ]
  },
}

export default config
