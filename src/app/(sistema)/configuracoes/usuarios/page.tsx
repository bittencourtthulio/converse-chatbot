import { exigirUsuarioAdmin } from '@/app/sessao-servidor'
import { listar } from '@/servicos/usuarios'
import { criarUsuario } from '@/app/acoes'
import { CabecalhoDaPagina } from '@/componentes/CabecalhoDaPagina'
import { EstadoVazio } from '@/componentes/EstadoVazio'
import { Formulario, Campo } from '@/componentes/Formulario'
import { LinhaDeUsuario } from '@/app/(sistema)/configuracoes/usuarios/LinhaDeUsuario'

/**
 * Cadastro de usuários (P-9, E-2). Só admin chega aqui: `exigirUsuarioAdmin`
 * verifica no servidor (no layout da pasta e de novo aqui), e esconder o item
 * do menu não é o controle.
 */
export default async function Usuarios() {
  const admin = await exigirUsuarioAdmin()
  const usuarios = await listar(admin)

  return (
    <div className="pilha">
      <CabecalhoDaPagina
        titulo="Usuários"
        subtitulo="Quem tem acesso ao sistema, e com qual papel."
      />

      <section className="cartao" aria-label="Lista de usuários">
        {usuarios.length === 0 ? (
          <EstadoVazio
            icone="usuarios"
            titulo="Nenhum usuário cadastrado"
            descricao="Use o formulário abaixo para cadastrar o primeiro."
          />
        ) : (
          <div className="tabela-envoltorio">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Papel</th>
                  <th>Situação</th>
                  <th>
                    <span className="somente-leitor">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <LinhaDeUsuario key={u.id} usuario={{ ...u, ehVoce: u.id === admin.id }} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="cartao cartao-estreito" aria-labelledby="novo-usuario">
        <div className="cartao-corpo">
          <h2 className="secao-titulo" id="novo-usuario">
            Novo usuário
          </h2>
          <Formulario acao={criarUsuario} rotulo="Criar usuário">
            <Campo nome="nome" rotulo="Nome" autoComplete="off" />
            <Campo nome="email" rotulo="E-mail" tipo="email" autoComplete="off" />
            <Campo nome="senha" rotulo="Senha provisória" tipo="password" />
            <label className="campo">
              <span>Papel</span>
              <select name="papel" defaultValue="usuario">
                <option value="usuario">Usuário</option>
                <option value="admin">Administrador</option>
              </select>
            </label>
          </Formulario>
        </div>
      </section>
    </div>
  )
}
