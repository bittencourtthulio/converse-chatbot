import next from 'eslint-config-next'

const configuracao = [
  { ignores: ['.next/**', 'node_modules/**', 'src/gerado/**'] },
  ...next,
]

export default configuracao
