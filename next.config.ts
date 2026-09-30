import type { NextConfig } from 'next'

// Cabeçalhos de segurança em toda resposta (PR-37). A Content-Security-Policy
// e o `frame-ancestors` do chat embutido chegam com a FT-06, que também
// sobrescreve o X-Frame-Options na rota do iframe.
const cabecalhosDeSeguranca = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  {
    key: 'Permissions-Policy',
    value:
      'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  },
]

const config: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: '/:path*', headers: cabecalhosDeSeguranca }]
  },
}

export default config
