---
expx-schema: v1
skill: stackx
documento: aderencia
---

# Template — verificação de aderência

**Aponta, não corrige.** Nenhum arquivo é editado nesta verificação.

---

## Verificação de aderência — <alvo>

CONVENCOES.md: `docs/stack/CONVENCOES.md` (gerado em <data>, commit <hash>)
Contexto: <projeto novo | projeto legado — PERFIL.md ativo na área `<caminho>`>
Alvo: <diff `base...HEAD` | branch | pasta>
Arquivos no alvo: <n> (<n> novos, <n> modificados)

| Severidade | Arquivo | Convenção violada | Correção sugerida |
| ---------- | ------- | ----------------- | ----------------- |
| | `<caminho:linha>` | <§n — texto da convenção> | |

**Veredito:** <n> CRÍTICO, <n> ALTO, <n> MÉDIO, <n> AVISO, <n> INFO — a task
**<pode|não pode>** fechar.

**Comando de teste executado:** `<comando>` <✓ conforme §2 | ✗ divergente de §2 | não executado>

<!-- Sem achados: mantenha a tabela com uma linha "Nenhuma violação" e escreva o
     veredito. O registro é a evidência da passagem pelo portão. -->

---

## Severidade

| Severidade | Quando | Fecha a task? |
| ---------- | ------ | ------------- |
| `CRÍTICO` | Quebra a suíte, vaza segredo, viola dependência proibida, teste que nunca roda | **Não** |
| `ALTO` | Viola convenção com evidência forte (UNÂNIME) | **Não** |
| `MÉDIO` | Viola convenção com evidência mais fraca (MAJORITÁRIO, ÚNICO CASO) | Sim, com registro |
| `AVISO` | Diverge de **PROPOSTA** ou de CONFLITO EM ABERTO; comando parcial | Sim |
| `INFO` | Contexto legado: divergência em arquivo MODIFICADO | Sim |

**PROPOSTA nunca passa de `AVISO`.**

## Os oito pontos verificados

1. Local e nome de arquivo de teste — nome que o `testMatch` não casa é `CRÍTICO`
2. Presença dos testes exigidos — dois por task
3. Uso do padrão de erro
4. Camadas e dependências proibidas — dependência proibida introduzida é `CRÍTICO`
5. Factory ou fixture conforme a convenção
6. Isolamento de banco conforme a convenção — teste que suja o banco é `CRÍTICO`
7. Comando de teste efetivamente executado — nenhum comando é `CRÍTICO`
8. Nomeação, log e configuração — segredo hardcoded é sempre `CRÍTICO`

## Precedência em projeto legado

| Arquivo | Quem manda |
| ------- | ---------- |
| NOVO, fora de área tocada | CONVENCOES.md |
| NOVO, dentro de área tocada | PERFIL.md |
| MODIFICADO | **PERFIL.md sempre** — divergência é `INFO`, nunca violação |

Nunca sugira alinhar arquivo existente à convenção.
