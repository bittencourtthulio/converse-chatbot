import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../src/gerado/prisma/client.js'
import { hashDeSenha } from '../src/lib/senha.js'
import { criarArmazenamento } from '../src/lib/armazenamento.js'
import { dividirEmTrechos } from '../src/servicos/trechos.js'

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

// Fonte de exemplo da base (FT-04, PR-25): texto fictício curto, já processado
// pelo mesmo divisor do serviço, sem rodar a fila. Id fixo para a seed ser
// idempotente; não é recriada se já existe (edição de alguém vale).
const FONTE_DE_EXEMPLO = {
  id: 'fonte-de-exemplo',
  titulo: 'Política de troca e horário da Loja Exemplo',
  texto: [
    'A Loja Exemplo é uma loja fictícia de material de escritório, usada só para demonstrar o sistema.',
    'Horário de atendimento: de segunda a sexta, das 9h às 18h, e aos sábados, das 9h às 13h. Não abrimos aos domingos e feriados.',
    'Política de troca: o cliente pode trocar ou devolver qualquer produto em até 7 dias corridos depois da compra, desde que o produto esteja sem uso, na embalagem original e acompanhado da nota fiscal. Produtos personalizados não podem ser trocados, exceto em caso de defeito de fabricação.',
    'Em caso de defeito, a troca vale por 90 dias. O cliente escolhe entre um produto novo igual, outro de valor equivalente ou a devolução do valor pago, que volta pelo mesmo meio de pagamento em até 10 dias úteis.',
    'Entrega: pedidos acima de R$ 150,00 têm frete grátis para a capital. Nas demais cidades o frete é calculado no carrinho, e o prazo padrão é de 3 a 7 dias úteis depois da confirmação do pagamento.',
    'Formas de pagamento: cartão de crédito em até 6 parcelas sem juros, cartão de débito, Pix com 5% de desconto e boleto bancário com vencimento em 3 dias.',
    'Produtos mais procurados: cadernos universitários de 10 matérias, canetas esferográficas azul, preta e vermelha, grampeadores de mesa, pastas com elástico e post-its coloridos. Para pedidos em grande quantidade para empresas, o atendimento prepara um orçamento em até 1 dia útil.',
  ].join('\n\n'),
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

  if (!(await prisma.fonte.findUnique({ where: { id: FONTE_DE_EXEMPLO.id } }))) {
    const bytes = Buffer.from(FONTE_DE_EXEMPLO.texto, 'utf8')
    const caminho = await criarArmazenamento(process.env.STORAGE_DIR ?? './storage').gravar(
      AGENTE_DE_EXEMPLO.id,
      FONTE_DE_EXEMPLO.id,
      bytes,
    )
    const trechos = dividirEmTrechos(FONTE_DE_EXEMPLO.texto)
    await prisma.$transaction([
      prisma.fonte.create({
        data: {
          id: FONTE_DE_EXEMPLO.id,
          agenteId: AGENTE_DE_EXEMPLO.id,
          tipo: 'texto',
          titulo: FONTE_DE_EXEMPLO.titulo,
          tipoMime: 'text/plain',
          tamanhoBytes: bytes.length,
          caminhoArquivo: caminho,
          status: 'pronto',
          totalTrechos: trechos.length,
          caracteres: FONTE_DE_EXEMPLO.texto.length,
          processadoEm: new Date(),
          criadoPorId: admin.id,
        },
      }),
      prisma.trecho.createMany({
        data: trechos.map((texto, indice) => ({
          fonteId: FONTE_DE_EXEMPLO.id,
          agenteId: AGENTE_DE_EXEMPLO.id,
          indice,
          texto,
          caracteres: texto.length,
        })),
      }),
    ])
  }

  console.log('Seed de demonstração aplicada:')
  for (const conta of DEMONSTRACAO) {
    console.log(`  ${conta.papel.padEnd(8)} ${conta.email}  senha: ${conta.senha}`)
  }
  console.log(`  agente   ${AGENTE_DE_EXEMPLO.nome} (sem chave do OpenRouter)`)
  console.log(`  fonte    ${FONTE_DE_EXEMPLO.titulo} (já processada)`)
}

semear()
  .then(() => prisma.$disconnect())
  .catch(async (erro) => {
    console.error(erro)
    await prisma.$disconnect()
    process.exit(1)
  })
