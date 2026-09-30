// Fixtures pequenas dos formatos aceitos na base de conhecimento (FT-04). O
// conteúdo é fictício (Loja Exemplo) e gerado por código, para nunca haver
// dado real: `npx tsx tests/apoio/gerar-fixtures.ts` grava os arquivos em
// tests/fixtures/, e tests/fixtures-fontes.test.ts confere que não divergem.

import { deflateRawSync } from 'node:zlib'

export const NOMES_DE_TEXTO = [
  'exemplo.txt',
  'exemplo.md',
  'exemplo.csv',
  'exemplo.html',
  'exemplo.json',
  'exemplo.srt',
  'exemplo.vtt',
] as const

export const NOMES_BINARIOS = ['exemplo.pdf', 'escaneado.pdf', 'exemplo.docx'] as const

const TXT = `Loja Exemplo

A Loja Exemplo vende material de escritório.

O horário de atendimento é de segunda a sexta, das 9h às 18h.

A política de troca permite devolver produtos em até 7 dias.
`

const MD = `# Loja Exemplo

## Política de troca

A troca é aceita em até 7 dias, com a nota fiscal.

- Produto sem uso
- Embalagem original
`

const CSV = `loja;produto;preço;estoque
Loja Exemplo;Caderno;12,90;40
Loja Exemplo;Caneta azul;2,50;300
Loja Exemplo;"Grampeador, médio";18,00;15
`

const HTML = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Loja Exemplo</title>
<style>body { color: red; }</style>
<script>window.segredo = "nao deve aparecer";</script>
</head>
<body>
<nav><a href="/">Início</a> <a href="/contato">Contato</a></nav>
<h1>Loja Exemplo</h1>
<p>A Loja Exemplo vende material de escritório.</p>
<h2>Horário</h2>
<p>Atendimento de segunda a sexta, das 9h às 18h.</p>
<ul><li>Caderno</li><li>Caneta azul</li></ul>
<noscript>Ative o JavaScript.</noscript>
<!-- comentário que não deve aparecer -->
</body>
</html>
`

const JSON_TEXTO = `${JSON.stringify(
  {
    loja: 'Loja Exemplo',
    horario: { abre: '09:00', fecha: '18:00' },
    produtos: [
      { nome: 'Caderno', preco: 12.9 },
      { nome: 'Caneta azul', preco: 2.5 },
    ],
  },
  null,
  2,
)}\n`

const SRT = `1
00:00:01,000 --> 00:00:04,000
Bem-vindo à Loja Exemplo.

2
00:00:04,500 --> 00:00:08,000
Hoje vamos falar da <i>política de troca</i>.

3
00:00:08,500 --> 00:00:12,000
A troca vale por sete dias.
`

const VTT = `WEBVTT

NOTE Legenda fictícia da Loja Exemplo

cue-1
00:00:01.000 --> 00:00:04.000
Bem-vindo à Loja Exemplo.

00:00:04.500 --> 00:00:08.000 align:start
Hoje vamos falar da <v Ana>política de troca</v>.

00:00:08.500 --> 00:00:12.000
A troca vale por sete dias.
`

// ---------- PDF ----------

/** PDF mínimo e válido de uma página. `conteudo` é o fluxo de desenho da página. */
function montarPdf(conteudo: string): Buffer {
  const objetos = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 200] /Contents 4 0 R ' +
      '/Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${Buffer.byteLength(conteudo, 'latin1')} >>\nstream\n${conteudo}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
  ]
  let saida = '%PDF-1.4\n'
  const posicoes: number[] = []
  objetos.forEach((corpo, i) => {
    posicoes.push(Buffer.byteLength(saida, 'latin1'))
    saida += `${i + 1} 0 obj\n${corpo}\nendobj\n`
  })
  const inicioDaTabela = Buffer.byteLength(saida, 'latin1')
  saida += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`
  for (const pos of posicoes) saida += `${String(pos).padStart(10, '0')} 00000 n \n`
  saida += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${inicioDaTabela}\n%%EOF\n`
  return Buffer.from(saida, 'latin1')
}

// ---------- ZIP (DOCX) ----------

const TABELA_CRC = (() => {
  const tabela = new Uint32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    tabela[n] = c >>> 0
  }
  return tabela
})()

function crc32(dados: Buffer): number {
  let c = 0xffffffff
  for (const byte of dados) c = TABELA_CRC[(c ^ byte) & 0xff]! ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

export interface EntradaDeZip {
  nome: string
  dados: Buffer
  /** Padrão: sem compressão. Com `true`, deflate (raw). */
  comprimir?: boolean
  /** Só para teste de arquivo adulterado: tamanho descompactado declarado no cabeçalho. */
  tamanhoDeclarado?: number
  /** Marca a entrada como cifrada (bit 0 do flag). */
  cifrada?: boolean
}

/** Monta um ZIP válido em memória. Serve ao DOCX e aos testes de arquivo perigoso. */
export function montarZip(entradas: EntradaDeZip[], deflate: (b: Buffer) => Buffer): Buffer {
  const locais: Buffer[] = []
  const centrais: Buffer[] = []
  let deslocamento = 0
  for (const entrada of entradas) {
    const nome = Buffer.from(entrada.nome, 'utf8')
    const gravado = entrada.comprimir ? deflate(entrada.dados) : entrada.dados
    const metodo = entrada.comprimir ? 8 : 0
    const flag = (entrada.cifrada ? 1 : 0) | 0x0800
    const crc = crc32(entrada.dados)
    const tamanho = entrada.tamanhoDeclarado ?? entrada.dados.length

    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt16LE(flag, 6)
    local.writeUInt16LE(metodo, 8)
    local.writeUInt32LE(crc, 14)
    local.writeUInt32LE(gravado.length, 18)
    local.writeUInt32LE(tamanho, 22)
    local.writeUInt16LE(nome.length, 26)
    locais.push(local, nome, gravado)

    const central = Buffer.alloc(46)
    central.writeUInt32LE(0x02014b50, 0)
    central.writeUInt16LE(20, 4)
    central.writeUInt16LE(20, 6)
    central.writeUInt16LE(flag, 8)
    central.writeUInt16LE(metodo, 10)
    central.writeUInt32LE(crc, 16)
    central.writeUInt32LE(gravado.length, 20)
    central.writeUInt32LE(tamanho, 24)
    central.writeUInt16LE(nome.length, 28)
    central.writeUInt32LE(deslocamento, 42)
    centrais.push(central, nome)
    deslocamento += local.length + nome.length + gravado.length
  }
  const tamanhoCentral = centrais.reduce((soma, b) => soma + b.length, 0)
  const fim = Buffer.alloc(22)
  fim.writeUInt32LE(0x06054b50, 0)
  fim.writeUInt16LE(entradas.length, 8)
  fim.writeUInt16LE(entradas.length, 10)
  fim.writeUInt32LE(tamanhoCentral, 12)
  fim.writeUInt32LE(deslocamento, 16)
  return Buffer.concat([...locais, ...centrais, fim])
}

const XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
const DOCUMENTO = `${XML}<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>` +
  '<w:p><w:r><w:t>Loja Exemplo</w:t></w:r></w:p>' +
  '<w:p><w:r><w:t>A política de troca permite devolver produtos em até 7 dias.</w:t></w:r></w:p>' +
  '</w:body></w:document>'

function montarDocx(): Buffer {
  return montarZip(
    [
      {
        nome: '[Content_Types].xml',
        dados: Buffer.from(
          `${XML}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
            '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
            '<Default Extension="xml" ContentType="application/xml"/>' +
            '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
            '</Types>',
        ),
      },
      {
        nome: '_rels/.rels',
        dados: Buffer.from(
          `${XML}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
            '</Relationships>',
        ),
      },
      { nome: 'word/document.xml', dados: Buffer.from(DOCUMENTO, 'utf8') },
    ],
    deflateRawSync,
  )
}

/** Todas as fixtures, pelo nome do arquivo em tests/fixtures/. */
export function gerarFixtures(): Record<string, Buffer> {
  return {
    'exemplo.txt': Buffer.from(TXT, 'utf8'),
    'exemplo.md': Buffer.from(MD, 'utf8'),
    'exemplo.csv': Buffer.from(CSV, 'utf8'),
    'exemplo.html': Buffer.from(HTML, 'utf8'),
    'exemplo.json': Buffer.from(JSON_TEXTO, 'utf8'),
    'exemplo.srt': Buffer.from(SRT, 'utf8'),
    'exemplo.vtt': Buffer.from(VTT, 'utf8'),
    // "escritório" em WinAnsi: \363 é "ó".
    'exemplo.pdf': montarPdf('BT /F1 12 Tf 20 150 Td (Loja Exemplo vende material de escrit\\363rio.) Tj ET'),
    // Página só com um retângulo: sem camada de texto, como um PDF escaneado.
    'escaneado.pdf': montarPdf('0.8 g 20 20 260 160 re f'),
    'exemplo.docx': montarDocx(),
  }
}
