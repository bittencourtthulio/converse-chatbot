/**
 * O painel da tela Sistema (FT-11, PR-95): os cartões por assunto, a configuração como sim ou não,
 * a saúde item por item, e nenhum valor de segredo no HTML.
 */
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { PainelDoSistema } from '../src/componentes/PainelDoSistema.js'
import type { DadosDoSistema } from '../src/servicos/sistema.js'

const dados = (extra: Partial<DadosDoSistema> = {}): DadosDoSistema => ({
  saude: {
    status: 'ok',
    itens: [
      { nome: 'banco', situacao: 'ok', detalhe: 'O banco responde.' },
      { nome: 'disco', situacao: 'ok', detalhe: 'O diretório de dados aceita gravação.' },
      { nome: 'busca', situacao: 'ok', detalhe: 'O índice de busca existe.' },
      { nome: 'midia', situacao: 'ok', detalhe: 'ffmpeg e ffprobe respondem.' },
    ],
  },
  aplicacao: { versao: '1.2.3', node: 'v22.23.3', fuso: 'America/Sao_Paulo', atividadeSegundos: 2 * 3600 + 5 * 60 },
  esquema: { aplicadas: 10, esperadas: 10, ultima: '20261002000000_privacidade_e_auditoria' },
  dados: { bancoBytes: 2 * 1024 * 1024, storageBytes: 5 * 1024 * 1024, storageArquivos: 12, storageParcial: false },
  midia: { ffmpeg: true, ffprobe: true, versao: 'ffmpeg version 7.0' },
  fila: { pendentes: 1, processando: 2, erro: 1 },
  expurgo: { ativo: true, ultimaExecucaoEm: new Date('2026-05-05T10:00:00.000Z') },
  configuracao: {
    chaveDeCriptografiaDefinida: true,
    chaveDeCriptografiaValida: true,
    appUrlDefinida: true,
    appUrlHttps: true,
    openrouterConfigurado: true,
  },
  ultimoBackup: null,
  ...extra,
})

describe('PainelDoSistema', () => {
  it('mostra os cartões Aplicação, Dados, Vídeo e áudio, Segundo plano, Configuração e Backup com os valores', () => {
    const html = renderToStaticMarkup(<PainelDoSistema sistema={dados()} />)
    for (const titulo of ['Estado geral', 'Aplicação', 'Dados', 'Vídeo e áudio', 'Segundo plano', 'Configuração', 'Backup']) {
      expect(html, titulo).toContain(titulo)
    }
    expect(html).toContain('Tudo em ordem')
    expect(html).toContain('1.2.3')
    expect(html).toContain('v22.23.3')
    expect(html).toContain('America/Sao_Paulo')
    expect(html).toContain('2 h 5 min')
    expect(html).toContain('10 de 10')
    expect(html).toContain('20261002000000_privacidade_e_auditoria')
    expect(html).toContain('2,0 MB')
    expect(html).toContain('5,0 MB')
    expect(html).toContain('12 arquivos')
    expect(html).toContain('ffmpeg version 7.0')
    expect(html).toContain('1 pendente, 2 processando, 1 com erro')
    expect(html).toContain('Banco de dados')
    expect(html).toContain('Índice de busca')
  })

  it('a configuração aparece como Sim ou Não, sem nenhum valor', () => {
    const sim = renderToStaticMarkup(<PainelDoSistema sistema={dados()} />)
    expect(sim).toMatch(/Chave de criptografia[\s\S]*?Sim/)
    expect(sim).toMatch(/Endereço público com HTTPS[\s\S]*?Sim/)
    expect(sim).toMatch(/Chave do OpenRouter[\s\S]*?Sim/)
    const nao = renderToStaticMarkup(
      <PainelDoSistema
        sistema={dados({
          configuracao: { chaveDeCriptografiaDefinida: false, chaveDeCriptografiaValida: false, appUrlDefinida: false, appUrlHttps: false, openrouterConfigurado: false },
        })}
      />,
    )
    expect(nao).toMatch(/Chave de criptografia[\s\S]*?Não definida/)
    expect(nao).toMatch(/Endereço público com HTTPS[\s\S]*?Não/)
    expect(nao).toMatch(/Chave do OpenRouter[\s\S]*?Não/)
    const invalida = renderToStaticMarkup(
      <PainelDoSistema
        sistema={dados({
          configuracao: { chaveDeCriptografiaDefinida: true, chaveDeCriptografiaValida: false, appUrlDefinida: true, appUrlHttps: false, openrouterConfigurado: true },
        })}
      />,
    )
    expect(invalida).toMatch(/Chave de criptografia[\s\S]*?Definida, mas inválida/)
  })

  it('degradado e falha aparecem no estado geral e no item afetado, com a frase de cada item', () => {
    const degradado = renderToStaticMarkup(
      <PainelDoSistema
        sistema={dados({
          saude: {
            status: 'degradado',
            itens: [{ nome: 'midia', situacao: 'degradado', detalhe: 'ffmpeg ou ffprobe não responde: o vídeo e o áudio não são processados.' }],
          },
          midia: { ffmpeg: false, ffprobe: true, versao: null },
        })}
      />,
    )
    expect(degradado).toContain('Funcionando com limitações')
    expect(degradado).toContain('o vídeo e o áudio não são processados')
    expect(degradado).toMatch(/ffmpeg[\s\S]*?Não encontrado/)
    const falha = renderToStaticMarkup(
      <PainelDoSistema sistema={dados({ saude: { status: 'falha', itens: [{ nome: 'banco', situacao: 'falha', detalhe: 'O banco não respondeu.' }] } })} />,
    )
    expect(falha).toContain('Com falha')
    expect(falha).toContain('O banco não respondeu.')
  })

  it('backup sem arquivos mostra o estado vazio; arquivo do storage medido pela metade diz "ou mais"', () => {
    const html = renderToStaticMarkup(<PainelDoSistema sistema={dados({ dados: { bancoBytes: null, storageBytes: 1024, storageArquivos: 50000, storageParcial: true } })} />)
    expect(html).toContain('Nenhum backup ainda')
    expect(html).toContain('Indisponível')
    expect(html).toContain('50000 arquivos ou mais')
  })

  it('o último backup aparece com nome, data e tamanho quando existe', () => {
    const html = renderToStaticMarkup(
      <PainelDoSistema sistema={dados({ ultimoBackup: { nome: 'backup-20260505-100000.tar.gz', criadoEm: new Date('2026-05-05T10:00:00.000Z'), bytes: 3 * 1024 * 1024 } })} />,
    )
    expect(html).toContain('backup-20260505-100000.tar.gz')
    expect(html).toContain('3,0 MB')
    expect(html).not.toContain('Nenhum backup ainda')
  })

  it('o HTML nunca contém valor de segredo', () => {
    const html = renderToStaticMarkup(<PainelDoSistema sistema={dados()} />)
    for (const proibido of [process.env.ENCRYPTION_KEY!, process.env.JWT_SECRET!, 'sk-or', 'v1:']) expect(html).not.toContain(proibido)
  })
})
