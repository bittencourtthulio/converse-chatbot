import { exigirUsuarioAdmin } from '@/lib/sessao-servidor'
import { listar } from '@/servicos/usuarios'
import { criarUsuario } from '@/app/acoes'
import { Formulario, Campo } from '@/componentes/Formulario'
import { LinhaDeUsuario } from '@/app/(sistema)/configuracoes/usuarios/LinhaDeUsuario'

/**
 * Cadastro de usuários (P-9, E-2). Só admin chega aqui: `exigirUsuarioAdmin`
 * verifica no servidor, e esconder o item do menu não é o controle.
 */
export default async function Usuarios() {
  const admin = await exigirUsuarioAdmin()
  const usuarios = await listar(admin)

  return (
    <>
      <h1 className="titulo-da-tela">Usuários</h1>
      <p className="subtitulo-da-tela">
        Quem tem acesso ao sistema, e com qual papel.
      </p>

      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Papel</th>
            <th>Situação</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <LinhaDeUsuario key={u.id} usuario={{ ...u, ehVoce: u.id === admin.id }} />
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: 32, fontSize: 15 }}>Novo usuário</h2>
      <Formulario acao={criarUsuario} rotulo="Criar usuário">
        <Campo nome="nome" rotulo="Nome" />
        <Campo nome="email" rotulo="E-mail" tipo="email" />
        <Campo nome="senha" rotulo="Senha provisória" tipo="password" />
        <label className="campo">
          <span>Papel</span>
          <select name="papel" defaultValue="usuario">
            <option value="usuario">Usuário</option>
            <option value="admin">Administrador</option>
          </select>
        </label>
      </Formulario>
    </>
  )
}
