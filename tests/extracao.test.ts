import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { ErroDeAplicacao } from '@/lib/erros'
import { extrairTexto, validarConteudo } from '@/lib/extracao'
import type { Formato } from '@/lib/extracao/formatos'

const fixture = (nome: string) => readFileSync(path.resolve(process.cwd(), 'tests/fixtures', nome))

const NOVE: Array<[Formato, string, string]> = [
  ['pdf', 'exemplo.pdf', 'Loja Exemplo vende material de escritório'],
  ['docx', 'exemplo.docx', 'política de troca'],
  ['txt', 'exemplo.txt', 'horário de atendimento'],
  ['md', 'exemplo.md', 'Política de troca'],
  ['csv', 'exemplo.csv', 'produto: Caderno'],
  ['html', 'exemplo.html', 'Atendimento de segunda a sexta'],
  ['json', 'exemplo.json', 'horario.abre: 09:00'],
  ['srt', 'exemplo.srt', 'A troca vale por sete dias'],
  ['vtt', 'exemplo.vtt', 'A troca vale por sete dias'],
]

describe('extrairTexto', () => {
  for (const [formato, nome, trecho] of NOVE) {
    it(`extrai a fixture ${nome} (${formato})`, async () => {
      const texto = await extrairTexto({ formato, bytes: fixture(nome) })
      expect(texto).toContain(trecho)
    })
  }

  async function erroDe(promessa: Promise<unknown>): Promise<ErroDeAplicacao> {
    try {
      await promessa
    } catch (e) {
      expect(e).toBeInstanceOf(ErroDeAplicacao)
      return e as ErroDeAplicacao
    }
    throw new Error('devia ter lançado')
  }

  it('texto acima de 5 milhões de caracteres vira erro claro', async () => {
    const erro = await erroDe(
      extrairTexto(
        { formato: 'txt', bytes: Buffer.from('a') },
        { extratores: { txt: () => 'a'.repeat(5_000_001) } },
      ),
    )
    expect(erro.message).toMatch(/5 milhões de caracteres/)
    expect(erro.codigo).toBe('texto_grande_demais')
    await expect(
      extrairTexto({ formato: 'txt', bytes: Buffer.from('a') }, { extratores: { txt: () => 'a'.repeat(5_000_000) } }),
    ).resolves.toHaveLength(5_000_000)
  })

  it('resultado só com espaços vira erro de arquivo sem texto', async () => {
    const erro = await erroDe(extrairTexto({ formato: 'txt', bytes: Buffer.from('   \n\n  ') }))
    expect(erro.message).toMatch(/não tem texto|Nenhum texto/)
    expect(erro.codigo).toBe('extracao_vazia')
  })

  it('extração que passa do prazo vira erro de tempo esgotado', async () => {
    const lento = () => new Promise<string>((resolver) => setTimeout(() => resolver('tarde'), 300))
    const erro = await erroDe(
      extrairTexto({ formato: 'txt', bytes: Buffer.from('a') }, { prazoMs: 30, extratores: { txt: lento } }),
    )
    expect(erro.message).toMatch(/demorou demais/)
    expect(erro.codigo).toBe('extracao_demorou')
  })

  it('exceção qualquer vira frase genérica, sem a mensagem original', async () => {
    const erro = await erroDe(
      extrairTexto(
        { formato: 'txt', bytes: Buffer.from('a') },
        { extratores: { txt: () => { throw new Error('ENOENT /var/segredo/arquivo') } } },
      ),
    )
    expect(erro.message).not.toMatch(/ENOENT|segredo|\//)
    expect(erro.codigo).toBe('extracao_falhou')
  })

  it('erro de aplicação de um adaptador passa como está', async () => {
    const erro = await erroDe(extrairTexto({ formato: 'pdf', bytes: fixture('escaneado.pdf') }))
    expect(erro.codigo).toBe('pdf_sem_texto')
  })
})

describe('validarConteudo', () => {
  it('aceita as nove fixtures', () => {
    for (const [formato, nome] of NOVE) expect(() => validarConteudo(formato, fixture(nome)), nome).not.toThrow()
  })

  it('recusa conteúdo que não bate com a extensão', () => {
    expect(() => validarConteudo('pdf', Buffer.from('texto'))).toThrow(ErroDeAplicacao)
    expect(() => validarConteudo('docx', Buffer.from('texto'))).toThrow(ErroDeAplicacao)
    expect(() => validarConteudo('txt', Buffer.from([1, 0, 2]))).toThrow(ErroDeAplicacao)
    expect(() => validarConteudo('json', Buffer.from('{'))).toThrow(ErroDeAplicacao)
  })
})

describe('isolamento da camada', () => {
  it('src/lib/extracao não importa next/* nem src/servicos nem usa rede', () => {
    const pasta = path.resolve(process.cwd(), 'src/lib/extracao')
    for (const nome of ['index.ts', 'pdf.ts', 'docx.ts', 'html.ts', 'csv.ts', 'json.ts', 'zip.ts', 'conteudo.ts']) {
      const fonte = readFileSync(path.join(pasta, nome), 'utf8')
      expect(fonte, nome).not.toMatch(/from 'next|@\/servicos|@\/app|fetch\(|node:http/)
    }
  })
})
