/**
 * T-04.05 (FT-12, PR-12, PR-104): teste de arquitetura das guardas. Toda tela sob `src/app/(sistema)` e toda
 * rota sob `src/app/api` precisa de guarda PRÓPRIA (o layout não conta); as exceções públicas são uma lista
 * explícita e comentada. A verificação é provada com amostras: ela falha quando a guarda falta.
 */
import { describe, it, expect } from 'vitest'
import {
  FUNCOES_INTERNAS_SEM_ATOR,
  ROTAS_PUBLICAS,
  enumerarApresentacao,
  enumerarTelasERotas,
  importacoesInternasProibidas,
  nomesImportadosDeServicos,
  semComentarios,
  verificarGuardas,
  type Arquivo,
} from './apoio/guardas'

const pagina = (caminho: string, conteudo: string): Arquivo => ({ caminho: `src/app/(sistema)/${caminho}/page.tsx`, conteudo })
const rota = (caminho: string, conteudo: string): Arquivo => ({ caminho: `src/app/api/${caminho}/route.ts`, conteudo })
const COM_GUARDA = 'export default async function P() {\n  const u = await exigirUsuario()\n  return u\n}\n'

describe('a verificação falha sem a guarda (integração)', () => {
  it('página sem exigirUsuario nem exigirUsuarioAdmin', () => {
    const v = verificarGuardas([pagina('conversas/[id]', 'export default async function P() { return await carregar() }')], [])
    expect(v).toEqual([expect.stringContaining('src/app/(sistema)/conversas/[id]/page.tsx: a página não chama')])
  })

  it('tela de configurações com exigirUsuario mas sem exigirUsuarioAdmin', () => {
    const v = verificarGuardas([pagina('configuracoes/auditoria', COM_GUARDA)], [])
    expect(v).toEqual([expect.stringContaining('a tela de administração não chama exigirUsuarioAdmin()')])
  })

  it('rota sem usuarioAtual nem exigirSessao e fora da lista de públicas', () => {
    const v = verificarGuardas([rota('backups/[nome]', 'export async function GET() { return Response.json({}) }')], [])
    expect(v).toEqual([expect.stringContaining('a rota não usa usuarioAtual() nem exigirSessao()')])
  })

  it('guarda só mencionada em comentário não conta', () => {
    const codigo = '// exigirUsuario() fica no layout\n/* exigirUsuarioAdmin() */\nexport default async function P() { return 1 }'
    expect(semComentarios(codigo)).not.toContain('exigirUsuario')
    expect(verificarGuardas([pagina('perfil', codigo)], [])).toHaveLength(1)
  })

  it('exceção pública que deixou de existir falha, e exceção sem motivo também', () => {
    const v = verificarGuardas([], [{ caminho: 'src/app/api/antiga/route.ts', motivo: 'foi removida' }])
    expect(v).toEqual([expect.stringContaining('não existe mais')])
    const sem = verificarGuardas([rota('x', '')], [{ caminho: 'src/app/api/x/route.ts', motivo: '  ' }])
    expect(sem).toEqual([expect.stringContaining('não diz por que é pública')])
  })
})

describe('as guardas certas passam (funcional)', () => {
  it('página com exigirUsuario, tela de admin com exigirUsuarioAdmin, rota com guarda e rota pública listada', () => {
    const v = verificarGuardas(
      [
        pagina('perfil', COM_GUARDA),
        pagina('configuracoes/sistema', COM_GUARDA.replace('exigirUsuario()', 'exigirUsuarioAdmin()')),
        rota('conversas/[id]', 'const u = await exigirSessao()'),
        rota('agentes/[id]/conversar', 'const u = await usuarioAtual()'),
        rota('saude', 'export async function GET() {}'),
      ],
      [{ caminho: 'src/app/api/saude/route.ts', motivo: 'saúde pública' }],
    )
    expect(v).toEqual([])
  })
})

describe('a árvore real do repositório (integração)', () => {
  const arquivos = enumerarTelasERotas()

  it('enumera as telas e as rotas conhecidas (a varredura não está vazia nem cega)', () => {
    const caminhos = arquivos.map((a) => a.caminho)
    expect(arquivos.filter((a) => a.caminho.endsWith('/page.tsx')).length).toBeGreaterThanOrEqual(18)
    expect(arquivos.filter((a) => a.caminho.endsWith('/route.ts')).length).toBeGreaterThanOrEqual(18)
    for (const esperado of [
      'src/app/(sistema)/conversas/[id]/page.tsx',
      'src/app/(sistema)/configuracoes/auditoria/page.tsx',
      'src/app/api/backups/[nome]/route.ts',
      'src/app/api/publico/agentes/[id]/conversa/route.ts',
    ]) expect(caminhos).toContain(esperado)
  })

  it('toda tela e toda rota tem guarda própria, salvo a lista explícita de rotas públicas', () => {
    expect(verificarGuardas(arquivos)).toEqual([])
  })

  it('cada exceção pública tem motivo e a lista é exatamente a conhecida', () => {
    expect(ROTAS_PUBLICAS.map((e) => e.caminho).sort()).toEqual([
      'src/app/api/publico/agentes/[id]/config/route.ts',
      'src/app/api/publico/agentes/[id]/conversa/route.ts',
      'src/app/api/publico/agentes/[id]/conversar/route.ts',
      'src/app/api/saude/route.ts',
      'src/app/api/telegram/[agenteId]/webhook/route.ts',
    ])
    for (const e of ROTAS_PUBLICAS) expect(e.motivo.length).toBeGreaterThan(20)
  })
})

describe('funções internas sem ator (integração)', () => {
  it('a verificação aponta a apresentação que importa uma delas, também com "as" e junto de outras', () => {
    const codigo = "import { listar, obterChaveDoOpenrouter as chave, type X } from '@/servicos/integracoes'\nimport { ultimoBackup } from '@/servicos/backup'"
    expect(nomesImportadosDeServicos(codigo)).toEqual(['listar', 'obterChaveDoOpenrouter', 'X', 'ultimoBackup'])
    const v = importacoesInternasProibidas([{ caminho: 'src/app/x/page.tsx', conteudo: codigo }])
    expect(v).toEqual([expect.stringContaining('obterChaveDoOpenrouter'), expect.stringContaining('ultimoBackup')])
  })

  it('nome só mencionado em comentário, ou como campo de objeto, não conta', () => {
    const codigo = "// import { obterChaveDoOpenrouter } from '@/servicos/integracoes'\nconst { ultimoBackup } = sistema"
    expect(importacoesInternasProibidas([{ caminho: 'src/componentes/P.tsx', conteudo: codigo }])).toEqual([])
  })

  it('nenhum arquivo real de src/app ou src/componentes importa uma função interna sem ator', () => {
    const arquivos = enumerarApresentacao()
    expect(arquivos.length).toBeGreaterThan(100)
    expect(importacoesInternasProibidas(arquivos)).toEqual([])
    expect(FUNCOES_INTERNAS_SEM_ATOR).toHaveLength(4)
  })
})
