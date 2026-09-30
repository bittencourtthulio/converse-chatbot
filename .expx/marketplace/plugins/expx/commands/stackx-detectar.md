---
description: Etapas 1 e 2 do stackx — varre o repositório em busca de evidência real e gera docs/stack/CONVENCOES.md e docs/stack/LACUNAS.md, perguntando diante de dialetos conflitantes.
---

Acione a skill **stackx** e execute as Etapas 1 e 2.

## Roteiro

1. **Etapa 1 — Detecção.** Siga `references/01-deteccao.md` **inteiro**, na ordem
   das 8 fontes. Produza o inventário no formato FATO / EVIDÊNCIA / FORÇA.
   Nenhum fato entra sem `caminho:linha`.

2. **Etapa 3 — Conflitos, antes de escrever.** Se houver conflito, siga
   `references/03-conflito-e-lacuna.md` e **pergunte**, apresentando todos de uma
   vez com contagem, localização e as três datas do histórico. Não escolha
   sozinho, nem por maioria.

3. **Etapa 2 — Escrita.** Siga `references/02-convencoes.md`, a partir de
   `assets/TEMPLATE-CONVENCOES.md`, gerando `docs/stack/CONVENCOES.md`.

4. **Lacunas.** Gere `docs/stack/LACUNAS.md` a partir de
   `assets/TEMPLATE-LACUNAS.md`, com o **impacto escrito como consequência**.

5. **Critério de saída.** Rode as verificações de `02-convencoes.md`:

```bash
grep -c 'Evidência:' docs/stack/CONVENCOES.md
grep -nE '/(Users|home|mnt|c:)/' docs/stack/CONVENCOES.md
grep -nE '(SECRET|PASSWORD|TOKEN|KEY)\s*=\s*\S' docs/stack/CONVENCOES.md
```

## Se já existe CONVENCOES.md

Pare. Isto é Etapa 5: use `/stackx-atualizar`. Não sobrescreva.

## Regras invioláveis nesta execução

1. Toda convenção aponta arquivo real com caminho e linha.
2. Sem evidência → **PROPOSTA**, marcada com o bloco literal, mais linha em
   LACUNAS.
3. Comando só entra se veio de manifesto, script, Makefile ou CI. Nunca inferido
   do nome do framework — alvo sem origem vira `— (LACUNA)`.
4. Conflito → pergunta. Sempre.
5. Nenhum segredo, credencial, host real ou dado de cliente no arquivo.
6. Nenhum caminho absoluto.
7. Se `docs/legado/PERFIL.md` existe, o cabeçalho traz o aviso de precedência.
8. Sem testes no repositório → a seção de testes sai **inteira** como PROPOSTA e
   como lacuna ALTA. Não invente convenção de teste.

## Segurança da varredura

Não execute migração, seed, build de produção, deploy nem qualquer script que
escreva em banco. Para confirmar um comando, rode no máximo os baratos e
não-destrutivos (type check, lint `--check`).

## Entrega

- Caminho dos dois arquivos gerados
- Resumo das seis seções, uma linha cada
- Lista das PROPOSTAS, com o lembrete de que não governam
- Lista das lacunas ALTAS
- Conflitos decididos e conflitos ainda em aberto
- Limitações da detecção (sem `.git`, lock ilegível, pacote não analisado)
