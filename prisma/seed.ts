import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../src/gerado/prisma/client.js'
import { hashDeSenha } from '../src/lib/senha.js'

const url = process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL ausente. Veja o .env.example.')

const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) })

// Credenciais fictícias, para uso local. A seed nunca roda em produção:
// o guarda abaixo é o que garante isso.
const DEMONSTRACAO = [
  {
    nome: 'Administradora de demonstração',
    email: 'admin@exemplo.local',
    senha: 'demo1234',
    papel: 'admin',
  },
  {
    nome: 'Usuário de demonstração',
    email: 'usuario@exemplo.local',
    senha: 'demo1234',
    papel: 'usuario',
  },
]

// Agente de exemplo (PR-25): sem chave do OpenRouter, ele só mostra o aviso de
// configuração. Id fixo para a seed ser idempotente.
const AGENTE_DE_EXEMPLO = {
  id: 'agente-de-exemplo',
  nome: 'Assistente de exemplo',
  modelo: 'openai/gpt-4o-mini',
  temperatura: 0.7,
  instrucoes:
    'Você é o assistente de atendimento da Loja Exemplo, uma loja fictícia de material de escritório. ' +
    'Responda sempre em português do Brasil, de forma cordial e objetiva. ' +
    'Quando não souber uma informação, diga que vai encaminhar o pedido à equipe em vez de inventar.',
  mensagemInicial: 'Olá! Sou o assistente da Loja Exemplo. Como posso ajudar?',
}

async function semear() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'A seed de demonstração não roda em produção. ' +
        'Ela cria contas com senha conhecida.',
    )
  }

  for (const conta of DEMONSTRACAO) {
    await prisma.usuario.upsert({
      where: { email: conta.email },
      update: {},
      create: {
        nome: conta.nome,
        email: conta.email,
        senhaHash: await hashDeSenha(conta.senha),
        papel: conta.papel,
      },
    })
  }

  const admin = await prisma.usuario.findUniqueOrThrow({
    where: { email: DEMONSTRACAO[0]!.email },
  })
  await prisma.agente.upsert({
    where: { id: AGENTE_DE_EXEMPLO.id },
    update: {},
    create: { ...AGENTE_DE_EXEMPLO, criadoPorId: admin.id },
  })

  console.log('Seed de demonstração aplicada:')
  for (const conta of DEMONSTRACAO) {
    console.log(`  ${conta.papel.padEnd(8)} ${conta.email}  senha: ${conta.senha}`)
  }
  console.log(`  agente   ${AGENTE_DE_EXEMPLO.nome} (sem chave do OpenRouter)`)
}

semear()
  .then(() => prisma.$disconnect())
  .catch(async (erro) => {
    console.error(erro)
    await prisma.$disconnect()
    process.exit(1)
  })
