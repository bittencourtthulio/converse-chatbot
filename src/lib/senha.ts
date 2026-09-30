import bcrypt from 'bcryptjs'

// Custo 10: o padrão do bcrypt. Subir isso encarece o login e os testes
// sem ganho prático para o porte que este template atende.
const CUSTO = 10

export async function hashDeSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, CUSTO)
}

export async function senhaConfere(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash)
}
