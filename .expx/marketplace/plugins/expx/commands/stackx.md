---
description: Roteador do stackx — sem CONVENCOES.md conduz à detecção; com ele, mostra o resumo das convenções, as lacunas e os pontos marcados PROPOSTA.
---

Acione a skill **stackx** e opere como roteador.

## 1. Diagnostique o estado

```bash
test -f docs/stack/CONVENCOES.md && echo "CONVENCOES: sim" || echo "CONVENCOES: nao"
test -f docs/stack/LACUNAS.md    && echo "LACUNAS: sim"    || echo "LACUNAS: nao"
test -f docs/legado/PERFIL.md    && echo "LEGADO: sim"     || echo "LEGADO: nao"
```

## 2A. Se `docs/stack/CONVENCOES.md` NÃO existe

Explique em duas linhas o que o stackx faz: lê o repositório real e escreve o
arquivo de convenções que as demais skills passam a obedecer.

Faça uma sondagem rápida para dizer o que há para detectar — manifestos, testes,
migrações, CI — sem varrer tudo.

Conduza para `/stackx-detectar`. Não gere o CONVENCOES.md aqui.

Se o repositório estiver vazio ou só com README, diga que não há evidência para
detectar e pare.

## 2B. Se `docs/stack/CONVENCOES.md` existe

Leia o arquivo inteiro e `docs/stack/LACUNAS.md`, e apresente:

**Resumo**
- Identidade técnica (§1) em uma linha
- Comandos de teste, lint e build (§2)
- Onde o teste mora e como se nomeia (§3)
- Isolamento de banco (§4)
- Camadas (§5), em uma linha
- Padrão de erro (§6)
- Gerado em / commit de referência

**Lacunas** — tabela ID · ponto · impacto, ALTAS primeiro.

**Pontos marcados PROPOSTA** — lista, com o lembrete de que **não governam**:
nas skills irmãs viram decisão a levantar, e em `/stackx-check` geram no máximo
aviso.

**Conflitos em aberto** — se houver, liste e ofereça resolvê-los agora pela
Etapa 3 (`references/03-conflito-e-lacuna.md`).

**Aviso de projeto legado** — se `docs/legado/PERFIL.md` existir, informe que na
área tocada manda o PERFIL.md e o stackx governa só código novo em arquivo novo.

**Sinal de desatualização** — verifique se as evidências ainda existem:

```bash
grep -oE '`[^`]+:[0-9]+`' docs/stack/CONVENCOES.md | tr -d '`' | cut -d: -f1 \
  | sort -u | while read f; do test -f "$f" || echo "SUMIU: $f"; done
```

Havendo evidência morta, ou muitos commits desde a geração, recomende
`/stackx-atualizar`.

**Próximos passos**

| Quero | Comando |
| ----- | ------- |
| Verificar se uma mudança respeitou as convenções | `/stackx-check` |
| Redetectar e ver o que mudou | `/stackx-atualizar` |
| Consultar risco de uma alteração de esquema | `/stackx-migracao <alteração>` |

## Regras

- Não gere nem edite `CONVENCOES.md` neste comando.
- Não resolva conflito sozinho.
- Não invente comando que não esteja no arquivo.
