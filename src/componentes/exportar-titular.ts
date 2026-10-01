'use client'


// O download da exportação do titular (FT-10, PR-90): POST em JSON para a rota do admin (o
// identificador vai no corpo, nunca na URL) e o arquivo devolvido vira um download pelo
// navegador. Mora em `src/componentes` porque é o único ponto que usa `fetch` e o DOM.
import { nomeDoArquivoDoCabecalho } from '@/componentes/privacidade-logica'

export type FormatoDeExportacao = 'json' | 'txt'
export type ResultadoDaExportacao = { ok: true } | { ok: false; mensagem: string }

export async function exportarTitularNoNavegador(
  criterio: { canal: string; identificador: string },
  formato: FormatoDeExportacao,
): Promise<ResultadoDaExportacao> {
  try {
    const resposta = await fetch('/api/titulares/exportar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...criterio, formato }),
    })
    if (!resposta.ok) {
      const corpo: unknown = await resposta.json().catch(() => null)
      const mensagem = typeof (corpo as { mensagem?: unknown } | null)?.mensagem === 'string' ? (corpo as { mensagem: string }).mensagem : null
      return { ok: false, mensagem: mensagem ?? 'Não foi possível gerar o arquivo. Tente de novo.' }
    }
    const url = URL.createObjectURL(await resposta.blob())
    const link = document.createElement('a')
    link.href = url
    link.download = nomeDoArquivoDoCabecalho(resposta.headers.get('content-disposition'))
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    return { ok: true }
  } catch {
    return { ok: false, mensagem: 'Não foi possível baixar o arquivo. Verifique a conexão e tente de novo.' }
  }
}
