---
expx-schema: v1
skill: stackx
documento: conflito
---

# Template — apresentação de conflito

Use um bloco destes por conflito. Apresente **todos** de uma vez, numerados.
Não pergunte um por mensagem.

**O stackx não escolhe sozinho.** Apontar o sinal do histórico é evidência e é
permitido; escrever "recomendo B" é escolha e não é.

---

### CONFLITO <n> — <o ponto em disputa>

| Dialeto | Arquivos | Onde | Nascido | Último novo | Último toque |
| ------- | -------- | ---- | ------- | ----------- | ------------ |
| A — <descrição> | <n> | `<glob>` | <AAAA-MM> | <AAAA-MM> | <AAAA-MM> |
| B — <descrição> | <n> | `<glob>` | <AAAA-MM> | <AAAA-MM> | <AAAA-MM> |

Exemplo A: `<caminho:linha>`
Exemplo B: `<caminho:linha>`

**Sinal do histórico:**
<!-- Fato observado, sem recomendação.
     Ex.: "o dialeto A não recebe arquivo novo há 19 meses; todos os arquivos
     criados nos últimos 6 meses seguem B."
     Sem .git: "não há datação disponível; a apresentação vai sem ordem
     sugerida." -->

**Observação sobre a configuração do runner:**
<!-- Opcional, e forte quando existe: "o padrão do dialeto B não é casado pelo
     testMatch do runner — esses testes não rodam." -->

**Qual adotar para código novo?**
```
(1) A — <descrição>
(2) B — <descrição>
(3) manter os dois, decidir por área
(4) adiar — fica como CONFLITO EM ABERTO
```

<!-- Só ofereça opções que existem no repositório. Nunca ofereça uma terceira
     forma que ninguém usa. -->

---

## Depois da resposta

**Decidido:** grave no CONVENCOES.md na forma:

```markdown
<frase afirmativa da convenção>

Decidido por <quem> em <AAAA-MM-DD>. Dialeto anterior: <descrição>, não replicar.
**Evidência:** `<caminho:linha>`
```

E acrescente a linha na tabela "Decisões registradas".

**Adiado:** grave no CONVENCOES.md o bloco literal:

```markdown
> **CONFLITO EM ABERTO** — o repositório faz isto de duas formas. Ver
> `docs/stack/LACUNAS.md`. Enquanto não houver decisão, siga o padrão do
> arquivo vizinho e registre a escolha na task.
```

E acrescente a linha em `docs/stack/LACUNAS.md`, seção "Conflitos em aberto".

## Lembretes

- Minoria < 10% **e** sem sinal de recência → é exceção, não conflito.
- Minoria pequena mas **recente** → é conflito.
- 45% × 55% → é conflito. Nunca resolva por maioria apertada.
- Camadas ou pacotes com padrões distintos, cada um consistente → não é
  conflito; documente por camada ou por pacote.
- Conflito não respondido é estado válido de entrega. Não resolva para "não
  deixar o arquivo incompleto".
