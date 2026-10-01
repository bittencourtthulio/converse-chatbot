/**
 * Semeia dados fictícios para a verificação manual da FT-10 (privacidade e auditoria), no banco
 * apontado por `DATABASE_URL`:
 *
 *   DATABASE_URL=file:./prisma/dev.db npx tsx tests/apoio/semear-privacidade.ts
 *
 * Cria conversas antigas (para o expurgo apagar) e recentes (para ficar) nos três canais, dois
 * visitantes com prefixo igual (para a desambiguação do titular) e dois usuários da equipe
 * (um para excluir, dono de um agente). Só dado fictício e nenhum segredo; roda depois de
 * `npm run setup` (usa o agente e os usuários da seed). Recusa produção e é repetível: apaga
 * o que ela mesma semeou antes de semear de novo.
 */
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../../src/gerado/prisma/client.js'
import { hashDeSenha } from '../../src/lib/senha.js'

if (process.env.NODE_ENV === 'production') throw new Error('Esta semeadura é só para desenvolvimento e verificação.')
const url = process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL ausente.')
const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) })

const AGENTE_ID = 'agente-de-exemplo'
const DIA = 24 * 3600 * 1000
const agora = Date.now()
const antes = (dias: number) => new Date(agora - dias * DIA)

export const VISITANTE_ANTIGO = 'visitantebeta0001antigo00000001'
export const VISITANTE_PAR_A = 'visitantealfa0001recente0000001'
export const VISITANTE_PAR_B = 'visitantealfa0002recente0000002'
const CHAT_DO_TELEGRAM = '777000111'

async function conversa(canal: 'widget' | 'telegram', identificador: string, diasAtras: number, titulo: string | null, perguntas: string[]) {
  const quando = antes(diasAtras)
  await prisma.conversa.create({
    data: {
      agenteId: AGENTE_ID,
      canal,
      identificadorExterno: identificador,
      titulo,
      criadoEm: quando,
      atualizadoEm: quando,
      mensagens: {
        create: perguntas.flatMap((p, i) => [
          { papel: 'user', conteudo: p, criadoEm: new Date(quando.getTime() + i * 2000) },
          { papel: 'assistant', conteudo: `Resposta fictícia à pergunta ${i + 1}.`, criadoEm: new Date(quando.getTime() + i * 2000 + 1000) },
        ]),
      },
    },
  })
}

async function main() {
  if (!(await prisma.agente.findUnique({ where: { id: AGENTE_ID } }))) throw new Error('Rode `npm run setup` antes: falta o agente de exemplo da seed.')

  // Repetível: remove só o que esta semeadura criou.
  await prisma.conversa.deleteMany({ where: { identificadorExterno: { in: [VISITANTE_ANTIGO, VISITANTE_PAR_A, VISITANTE_PAR_B, CHAT_DO_TELEGRAM] } } })
  await prisma.agente.deleteMany({ where: { id: 'agente-da-pessoa-para-excluir' } })
  await prisma.usuario.deleteMany({ where: { email: { in: ['para.excluir@exemplo.local', 'colega@exemplo.local'] } } })

  await conversa('widget', VISITANTE_ANTIGO, 120, null, ['Qual o horário de atendimento? (conversa antiga fictícia)', 'Obrigado!'])
  await conversa('telegram', CHAT_DO_TELEGRAM, 100, 'Telegram: Joana Exemplo', ['Quero trocar um produto (conversa antiga fictícia)'])
  await conversa('widget', VISITANTE_PAR_A, 10, null, ['Como faço uma troca? (conversa recente fictícia)'])
  await conversa('widget', VISITANTE_PAR_B, 3, null, ['Vocês aceitam Pix? (conversa recente fictícia)'])

  const senhaHash = await hashDeSenha('demo1234')
  const paraExcluir = await prisma.usuario.create({ data: { nome: 'Pessoa Para Excluir', email: 'para.excluir@exemplo.local', senhaHash, papel: 'usuario' } })
  await prisma.usuario.create({ data: { nome: 'Colega de Equipe', email: 'colega@exemplo.local', senhaHash, papel: 'usuario' } })
  await prisma.agente.create({ data: { id: 'agente-da-pessoa-para-excluir', nome: 'Agente criado por quem vai sair', modelo: 'openai/gpt-4o-mini', criadoPorId: paraExcluir.id } })
  console.log('Semeado: 4 conversas (2 antigas), 2 usuários e 1 agente de exemplo para a verificação.')
}

main()
  .catch((erro) => {
    console.error(erro instanceof Error ? erro.message : erro)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
