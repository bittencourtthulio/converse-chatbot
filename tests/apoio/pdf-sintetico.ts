/**
 * PDF com `n` páginas de texto ("Pagina 1", "Pagina 2"...), montado em memória (FT-13, PR-45, PR-107): para
 * provar o limite de páginas sem fixture binária. Com 501 páginas passa do limite de 500.
 */
export function gerarPdf(n: number): Buffer {
  const filhos = Array.from({ length: n }, (_, i) => `${3 + i * 2} 0 R`).join(' ')
  const objetos = ['<< /Type /Catalog /Pages 2 0 R >>', `<< /Type /Pages /Kids [${filhos}] /Count ${n} >>`]
  for (let i = 0; i < n; i += 1) {
    const conteudo = `BT /F1 12 Tf 20 100 Td (Pagina ${i + 1}) Tj ET`
    objetos.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] /Contents ${4 + i * 2} 0 R /Resources << /Font << /F1 ${3 + n * 2} 0 R >> >> >>`)
    objetos.push(`<< /Length ${conteudo.length} >>\nstream\n${conteudo}\nendstream`)
  }
  objetos.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')
  let saida = '%PDF-1.4\n'
  const posicoes: number[] = []
  objetos.forEach((o, i) => {
    posicoes.push(saida.length)
    saida += `${i + 1} 0 obj\n${o}\nendobj\n`
  })
  const xref = saida.length
  saida += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`
  for (const p of posicoes) saida += `${String(p).padStart(10, '0')} 00000 n \n`
  saida += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return Buffer.from(saida, 'latin1')
}
