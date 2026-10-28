// A lista única de itens da barra lateral. Uma feature nova acrescenta seu
// item AQUI e mais nada: a barra lateral, a gaveta do celular e o título do
// cabeçalho leem este arquivo. Não se cria uma segunda área de Configurações.

/** Nomes aceitos por `<Icone nome=... />` (src/componentes/Icones.tsx). */
export type NomeDeIcone =
  | 'painel'
  | 'usuarios'
  | 'perfil'
  | 'menu'
  | 'fechar'
  | 'sol'
  | 'lua'
  | 'sair'
  | 'caixa-vazia'
  | 'alerta'
  | 'sucesso'
  | 'informacao'
  | 'conversa'
  | 'integracoes'
  | 'agentes'
  | 'enviar'
  | 'parar'
  | 'arquivo'
  | 'texto'
  | 'lixeira'
  | 'upload'
  | 'relogio'
  | 'atualizar'
  | 'voltar' | 'video' | 'sistema'

export interface ItemDeMenu {
  rotulo: string
  href: string
  icone: NomeDeIcone
  /** Só admin vê. Esconder não é controle de acesso: a página confere no servidor. */
  somenteAdmin?: boolean
}

export interface GrupoDeMenu {
  /** `null` = grupo sem título, no topo. */
  titulo: string | null
  itens: ItemDeMenu[]
}

export const GRUPOS_DE_MENU: GrupoDeMenu[] = [
  {
    titulo: null,
    itens: [
      { rotulo: 'Painel', href: '/', icone: 'painel' },
      { rotulo: 'Agentes', href: '/agentes', icone: 'agentes' },
      { rotulo: 'Conversas', href: '/conversas', icone: 'conversa' },
    ],
  },
  {
    titulo: 'Configurações',
    itens: [
      {
        rotulo: 'Usuários',
        href: '/configuracoes/usuarios',
        icone: 'usuarios',
        somenteAdmin: true,
      },
      {
        rotulo: 'Integrações',
        href: '/configuracoes/integracoes',
        icone: 'integracoes',
        somenteAdmin: true,
      },
      {
        rotulo: 'Consumo de IA',
        href: '/configuracoes/consumo-ia',
        icone: 'painel',
        somenteAdmin: true,
      },
      {
        rotulo: 'Privacidade',
        href: '/configuracoes/privacidade',
        icone: 'informacao',
        somenteAdmin: true,
      },
      {
        rotulo: 'Auditoria',
        href: '/configuracoes/auditoria',
        icone: 'relogio',
        somenteAdmin: true,
      },
      {
        rotulo: 'Sistema',
        href: '/configuracoes/sistema',
        icone: 'sistema',
        somenteAdmin: true,
      },
      { rotulo: 'Meu perfil', href: '/perfil', icone: 'perfil' },
    ],
  },
]

/** Rotas que existem mas não têm item de menu: herdam o título do pai. */
const ROTAS_FORA_DO_MENU: Array<{ href: string; titulo: string; pai: string }> = [
  { href: '/perfil/senha', titulo: 'Trocar senha', pai: '/perfil' },
  { href: '/agentes/novo', titulo: 'Novo agente', pai: '/agentes' },
]

export function gruposVisiveis(ehAdmin: boolean): GrupoDeMenu[] {
  return GRUPOS_DE_MENU.map((g) => ({
    ...g,
    itens: g.itens.filter((i) => !i.somenteAdmin || ehAdmin),
  })).filter((g) => g.itens.length > 0)
}

export function itensVisiveis(ehAdmin: boolean): ItemDeMenu[] {
  return gruposVisiveis(ehAdmin).flatMap((g) => g.itens)
}

/** Grupo e item da rota, para o título do cabeçalho. Vazio se desconhecida. */
export function migalhasDaRota(caminho: string): string[] {
  for (const grupo of GRUPOS_DE_MENU) {
    const item = grupo.itens.find((i) => i.href === caminho)
    if (item) return grupo.titulo ? [grupo.titulo, item.rotulo] : [item.rotulo]
  }
  const extra = ROTAS_FORA_DO_MENU.find((r) => r.href === caminho)
  if (extra) return [...migalhasDaRota(extra.pai), extra.titulo]
  // Página de detalhe (`/agentes/<id>` e as abas dele): herda o título do item.
  for (const grupo of GRUPOS_DE_MENU) {
    const item = grupo.itens.find((i) => i.href !== '/' && caminho.startsWith(`${i.href}/`))
    if (item) return grupo.titulo ? [grupo.titulo, item.rotulo] : [item.rotulo]
  }
  return []
}

/** O item de `href` está ativo em `caminho`? A raiz só casa com a raiz. */
export function rotaEstaAtiva(caminho: string, href: string): boolean {
  if (href === '/') return caminho === '/'
  return caminho === href || caminho.startsWith(`${href}/`)
}
