// npm run admin:criar -- <e-mail> <nome> (FT-11, PR-100): cria o primeiro administrador de uma instalação limpa.
// A seed de demonstração nunca roda em produção (PR-25), então sem este comando ninguém entraria no sistema.
//   docker compose run --rm -e ADMIN_SENHA='...' app npm run admin:criar -- admin@suaempresa.com.br "Seu nome"
// A senha (8 caracteres ou mais) vem de ADMIN_SENHA ou da entrada padrão (echo 'senha' | npm run admin:criar -- ...),
// NUNCA de argumento (apareceria no histórico do shell e na lista de processos) e nunca é impressa nem gravada em log.
// Saída de comando de linha de comando: `console` é permitido aqui, como na seed.
import 'dotenv/config'
import { ErroDeAplicacao } from '../src/lib/erros'
import { camposDoErro, log } from '../src/lib/log'

const USO = 'Uso: npm run admin:criar -- <e-mail> <nome>   (a senha vem de ADMIN_SENHA ou da entrada padrão)'

async function lerEntradaPadrao(): Promise<string> {
  if (process.stdin.isTTY) return ''
  const partes: Buffer[] = []
  for await (const parte of process.stdin) partes.push(Buffer.from(parte as Buffer))
  return Buffer.concat(partes).toString('utf8').replace(/[\r\n]+$/, '')
}

async function principal(argumentos: string[]): Promise<number> {
  if (argumentos.some((a) => /^(-s|--senha|--password)(=|$)/i.test(a))) {
    console.error('Este comando não aceita a senha como argumento: ela ficaria no histórico do shell e na lista de processos.')
    console.error('Passe a senha em ADMIN_SENHA ou pela entrada padrão.')
    return 1
  }
  const [email, ...resto] = argumentos
  const nome = resto.join(' ').trim()
  if (!email || nome === '') {
    console.error(USO)
    return 1
  }
  const senha = process.env.ADMIN_SENHA && process.env.ADMIN_SENHA !== '' ? process.env.ADMIN_SENHA : await lerEntradaPadrao()
  if (senha === '') {
    console.error('Informe a senha em ADMIN_SENHA ou pela entrada padrão.')
    console.error(USO)
    return 1
  }

  // Importado aqui: o Prisma lê DATABASE_URL ao ser carregado e a falta dela vira uma mensagem clara.
  const { prisma } = await import('../src/lib/prisma')
  try {
    const { criarAdministradorInicial } = await import('../src/servicos/usuarios')
    const criado = await criarAdministradorInicial({ nome, email, senha })
    console.log(`Administrador criado: ${criado.email} (${criado.nome}).`)
    console.log('Entre no sistema com este e-mail e a senha informada, e troque a senha em Meu perfil.')
    return 0
  } finally {
    await prisma.$disconnect().catch(() => undefined)
  }
}

principal(process.argv.slice(2)).then(
  (codigo) => process.exit(codigo),
  (erro: unknown) => {
    if (erro instanceof ErroDeAplicacao) console.error(erro.message)
    else if (erro instanceof Error && erro.message.startsWith('Variável')) console.error(erro.message)
    else {
      log.erro('admin_criar_falhou', camposDoErro(erro))
      console.error('Não foi possível criar o administrador.')
    }
    process.exit(1)
  },
)
