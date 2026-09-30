import next from 'eslint-config-next'

// Direção das camadas (docs/stack/CONVENCOES.md, seção 5):
// apresentação (src/app, src/componentes) -> aplicação (src/servicos) -> dados e infraestrutura (src/lib).

const camadas = [
  {
    files: ['src/servicos/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['next', 'next/*'],
              message: 'Regra das camadas: serviços não importam next/* (a aplicação não conhece o framework).',
            },
            {
              group: ['@/app', '@/app/*', '@/componentes', '@/componentes/*'],
              message: 'Regra das camadas: serviços não importam a apresentação (@/app, @/componentes).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/lib/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/servicos', '@/servicos/*'],
              message: 'Regra das camadas: src/lib (dados e infraestrutura) não importa serviços.',
            },
            {
              group: ['@/app', '@/app/*', '@/componentes', '@/componentes/*'],
              message: 'Regra das camadas: src/lib não importa a apresentação.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/app/**/*.{ts,tsx}', 'src/componentes/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/lib/prisma', '@/gerado', '@/gerado/*'],
              message: 'Regra das camadas: a apresentação acessa dados só por src/servicos, nunca pelo Prisma.',
            },
          ],
        },
      ],
    },
  },
]

const configuracao = [
  { ignores: ['.next/**', 'node_modules/**', 'src/gerado/**'] },
  ...next,
  ...camadas,
]

export default configuracao
