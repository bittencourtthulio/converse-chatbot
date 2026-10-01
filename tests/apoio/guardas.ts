// Apoio do teste de arquitetura das guardas (FT-12, T-04.05, PR-104): enumera as telas e as rotas e confere,
// por texto, que cada uma tem guarda PRÓPRIA. O `layout.tsx` não conta como fronteira (a documentação do Next
// desaconselha confiar nele); a guarda precisa estar no arquivo da página ou da rota. A verificação é uma
// função pura, testada com amostras que provam que ela falha sem a guarda.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

export interface Arquivo {
  /** Relativo à raiz do repositório, com `/`. */
  caminho: string
  conteudo: string
}

export interface ExcecaoPublica {
  caminho: string
  /** Por que esta rota pode responder sem sessão, e o que a protege no lugar dela. */
  motivo: string
}

/**
 * As rotas que respondem SEM sessão por desenho (PR-56, PR-57, PR-66, PR-95). Lista fechada: rota nova sem sessão
 * precisa entrar aqui com o motivo, o que obriga uma decisão consciente na revisão. Uma entrada que deixa de
 * existir também falha (a lista não pode apodrecer).
 */
export const ROTAS_PUBLICAS: ExcecaoPublica[] = [
  { caminho: 'src/app/api/saude/route.ts', motivo: 'saúde mínima para o orquestrador e o HEALTHCHECK: só {status}, sem detalhe (PR-95)' },
  { caminho: 'src/app/api/publico/agentes/[id]/config/route.ts', motivo: 'configuração visual do chat embutido: só campos públicos, inativo igual a inexistente (PR-56)' },
  { caminho: 'src/app/api/publico/agentes/[id]/conversar/route.ts', motivo: 'chat do visitante anônimo: limite de uso por IP e agente, teto diário e Origin da plataforma (PR-56, PR-57)' },
  { caminho: 'src/app/api/publico/agentes/[id]/conversa/route.ts', motivo: 'retomada e exclusão da conversa do visitante pelo id opaco dele, com limite de uso (PR-56, PR-90)' },
  { caminho: 'src/app/api/telegram/[agenteId]/webhook/route.ts', motivo: 'webhook de terceiro: quem autentica é o segredo no cabeçalho, comparado em tempo constante (PR-66)' },
]

/** Tira os comentários: guarda só mencionada num comentário não conta. */
export function semComentarios(codigo: string): string {
  return codigo.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
}

const GUARDA_DE_PAGINA = /\bexigirUsuario(Admin)?\(/
const GUARDA_DE_ADMIN = /\bexigirUsuarioAdmin\(/
const GUARDA_DE_ROTA = /\b(usuarioAtual|exigirSessao)\(/

const ehPagina = (c: string) => c.startsWith('src/app/(sistema)/') && c.endsWith('/page.tsx')
const ehRota = (c: string) => c.startsWith('src/app/api/') && c.endsWith('/route.ts')

/** As violações, uma frase cada; lista vazia quando toda tela e rota tem a guarda certa. */
export function verificarGuardas(arquivos: Arquivo[], excecoes: ExcecaoPublica[] = ROTAS_PUBLICAS): string[] {
  const violacoes: string[] = []
  const publicas = new Set(excecoes.map((e) => e.caminho))
  const existentes = new Set(arquivos.map((a) => a.caminho))

  for (const e of excecoes) {
    if (!existentes.has(e.caminho)) violacoes.push(`a exceção pública ${e.caminho} não existe mais: tire-a da lista`)
    if (!e.motivo.trim()) violacoes.push(`a exceção pública ${e.caminho} não diz por que é pública`)
  }

  for (const { caminho, conteudo } of arquivos) {
    const codigo = semComentarios(conteudo)
    if (ehPagina(caminho)) {
      if (!GUARDA_DE_PAGINA.test(codigo)) violacoes.push(`${caminho}: a página não chama exigirUsuario() nem exigirUsuarioAdmin() por conta própria`)
      else if (caminho.includes('/configuracoes/') && !GUARDA_DE_ADMIN.test(codigo)) {
        violacoes.push(`${caminho}: a tela de administração não chama exigirUsuarioAdmin() por conta própria`)
      }
    } else if (ehRota(caminho)) {
      if (publicas.has(caminho)) continue
      if (!GUARDA_DE_ROTA.test(codigo)) violacoes.push(`${caminho}: a rota não usa usuarioAtual() nem exigirSessao() e não está na lista de rotas públicas`)
    }
  }
  return violacoes
}

function percorrer(dir: string, aceita: (caminho: string) => boolean, raiz: string, saida: string[]): void {
  for (const nome of readdirSync(dir)) {
    const completo = path.join(dir, nome)
    if (statSync(completo).isDirectory()) percorrer(completo, aceita, raiz, saida)
    else {
      const relativo = path.relative(raiz, completo).split(path.sep).join('/')
      if (aceita(relativo)) saida.push(relativo)
    }
  }
}

/** Todas as páginas de `src/app/(sistema)` e todas as rotas de `src/app/api` do repositório em `raiz`. */
export function enumerarTelasERotas(raiz: string = process.cwd()): Arquivo[] {
  const caminhos: string[] = []
  percorrer(path.join(raiz, 'src/app/(sistema)'), ehPagina, raiz, caminhos)
  percorrer(path.join(raiz, 'src/app/api'), ehRota, raiz, caminhos)
  return caminhos.sort().map((caminho) => ({ caminho, conteudo: readFileSync(path.join(raiz, caminho), 'utf8') }))
}

/**
 * Funções de serviço SEM ator (devolvem a chave decifrada, listam o disco ou criam o primeiro administrador):
 * só são seguras porque ficam dentro dos serviços, que conferem o papel antes de chamá-las. Nenhuma tela, rota,
 * ação ou componente pode importá-las (FT-12, PR-104; ver VARREDURA-DE-GUARDAS.md).
 */
export const FUNCOES_INTERNAS_SEM_ATOR = ['obterChaveDoOpenrouter', 'listarBackupsDoDisco', 'ultimoBackup', 'criarAdministradorInicial']

/** Os nomes importados de `@/servicos/...` por um arquivo (o nome de origem, antes de `as`). */
export function nomesImportadosDeServicos(conteudo: string): string[] {
  const nomes: string[] = []
  const codigo = semComentarios(conteudo)
  for (const m of codigo.matchAll(/import\s*(?:type\s*)?\{([^}]*)\}\s*from\s*['"]@\/servicos\/[^'"]+['"]/g)) {
    for (const parte of m[1]!.split(',')) {
      const nome = parte.replace(/^\s*type\s+/, '').split(/\s+as\s+/)[0]!.trim()
      if (nome) nomes.push(nome)
    }
  }
  return nomes
}

/** Arquivos da apresentação que importam uma função interna sem ator. */
export function importacoesInternasProibidas(arquivos: Arquivo[]): string[] {
  const violacoes: string[] = []
  for (const { caminho, conteudo } of arquivos) {
    for (const nome of nomesImportadosDeServicos(conteudo)) {
      if (FUNCOES_INTERNAS_SEM_ATOR.includes(nome)) violacoes.push(`${caminho}: a apresentação importa ${nome}, função interna sem ator`)
    }
  }
  return violacoes
}

/** Todos os `.ts` e `.tsx` da apresentação (`src/app` e `src/componentes`). */
export function enumerarApresentacao(raiz: string = process.cwd()): Arquivo[] {
  const caminhos: string[] = []
  const aceita = (c: string) => /\.tsx?$/.test(c)
  percorrer(path.join(raiz, 'src/app'), aceita, raiz, caminhos)
  percorrer(path.join(raiz, 'src/componentes'), aceita, raiz, caminhos)
  return caminhos.sort().map((caminho) => ({ caminho, conteudo: readFileSync(path.join(raiz, caminho), 'utf8') }))
}
