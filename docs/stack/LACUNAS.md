---
expx-schema: v1
skill: stackx
documento: lacunas
gerado-em: 2026-09-30
---

# Lacunas de convenção

| # | Lacuna | Impacto | Como resolver |
| - | ------ | ------- | ------------- |
| 1 | sem formatador (Prettier ou similar) | estilo depende do ESLint | decidir na FT-01 se entra; não bloqueia |
| 2 | sem cobertura de teste | nenhum número de cobertura | opcional, não bloqueia |
| 3 | sem reversão de migração | erro de migração se corrige avançando | mitigado pelo backup (PR-20, FT-11) |
| 4 | direção das camadas sem regra de lint | violação só aparece em revisão | regra `no-restricted-imports` na FT-01 |
