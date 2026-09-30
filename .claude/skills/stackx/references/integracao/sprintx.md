# Integração — sprintx

O que muda no sprintx quando `docs/stack/CONVENCOES.md` existe.

**Regra de ativação:** se o arquivo não existe, o sprintx se comporta exatamente
como hoje. Nada abaixo vale. Nenhuma fase pede que o usuário rode o stackx antes;
no máximo registra a ausência como lacuna de contexto.

```bash
test -f docs/stack/CONVENCOES.md && echo "CONVENCOES ativo"
test -f docs/stack/LACUNAS.md   && echo "LACUNAS disponível"
```

---

## F1 — Base / ingestão

**Passa a:** ler `docs/stack/CONVENCOES.md` junto com a base de conhecimento da
feature, e `docs/stack/LACUNAS.md` logo em seguida.

**Registra na base:**
- identidade técnica e comandos reais (§1 e §2)
- o teste exemplar apontado em §3 — é o modelo de forma que as tasks vão copiar
- estratégia de isolamento de banco (§4)
- camadas e direção de dependência (§5)
- padrão de erro, validação e config (§6)
- **a lista de pontos marcados PROPOSTA** — separada, nomeada como tal
- **a lista de CONFLITOS EM ABERTO**

**O que não fazer:** copiar o CONVENCOES.md inteiro para dentro da base. Registre
o caminho e os pontos que a feature vai tocar. O arquivo é a fonte; a base
referencia.

---

## F2 — Descoberta

**Passa a:** transformar cada PROPOSTA e cada CONFLITO EM ABERTO **que a feature
toca** em pergunta de descoberta.

- PROPOSTA relevante → pergunta explícita, marcada como decisão técnica de
  projeto (não de produto).
- CONFLITO EM ABERTO relevante → apresente os dialetos com contagem e datas, como
  a Etapa 3 do stackx faz, e peça a decisão.
- PROPOSTA ou conflito que a feature **não** toca → não pergunte. Ruído.

**Registro:** a decisão vai para o registro de decisões da feature **e** deve ser
levada de volta ao CONVENCOES.md via `/stackx-atualizar` depois da entrega.

**O que não fazer:** tratar PROPOSTA como regra e seguir em frente sem perguntar.
É a violação mais provável desta integração.

---

## F3 — Plano de sprints, fases e tasks

Onde a integração dá o maior retorno. **Cada task passa a nascer com as
convenções embutidas, em vez de deixar a decisão para o executor.**

Cada task de código passa a declarar:

| Campo da task | Vem de |
| ------------- | ------ |
| Arquivo de código a criar | §5 — pasta da camada + convenção de nome |
| **Caminho exato** do arquivo de teste | §3 — local e nome |
| Forma do nome dos casos de teste | §3 — convenção de nomeação |
| Como montar dado de teste | §3 — factory, fixture ou literal |
| Isolamento de banco a usar | §4 |
| Padrão de erro a usar | §6 |
| Camadas que a task pode importar | §5 |
| Comando de teste da task | §2 |

Os **dois testes por task** (contrato do ecossistema) passam a ser escritos no
formato do exemplar de §3 — não num formato genérico.

**Verificação do plano:** nenhuma task pode declarar caminho de teste, padrão de
erro ou camada que contradiga o CONVENCOES.md sem uma justificativa escrita na
própria task. Se contradiz e não justifica, o plano está errado.

**Ponto PROPOSTA:** a task o declara como decisão pendente, não como regra. Se a
decisão não veio da F2, a task carrega a incerteza explicitamente.

---

## F4 — Orquestrador

**Passa a:** registrar no cabeçalho do `ORQUESTRADOR.md` o caminho e o commit de
referência do CONVENCOES.md usado, e a lista de PROPOSTAS que governaram
decisões da feature.

**Paralelismo:** duas tasks que tocam a mesma tabela em teste só podem ser
declaradas paralelas se a estratégia de isolamento de §4 suportar paralelismo
(ver a tabela do cartucho de teste instável). Isolamento por truncate sem banco
por worker **impede** paralelismo de tasks com banco — e essa é uma restrição
real que hoje passa despercebida.

---

## F5 — Auditoria

**Passa a:** rodar a verificação de aderência da Etapa 4 (`/stackx-check`) sobre
o diff da feature, e incluir a tabela resultante no relatório de auditoria.

**Veredito:**
- Qualquer `CRÍTICO` ou `ALTO` → a auditoria **não** aprova.
- `MÉDIO` → aprova com registro.
- `AVISO` (PROPOSTA divergida) → **não** reprova. No máximo nota.

**Além disso:** confere se cada task usou o comando de teste declarado em §2, e
não outro.

---

## F6 — Execução

**Passa a:** usar os comandos reais de §2 — teste, lint, formatador, type check —
em vez de inferir do framework.

- Antes de criar arquivo, conferir a pasta em §5 e o nome em §6.
- Antes de criar teste, conferir §3: caminho, nome, forma do caso, dado.
- Antes de escrever acesso a banco em teste, conferir §4.
- Comando ausente em §2 (marcado LACUNA) → **não invente**. Registre que o passo
  não pôde ser verificado e siga.

**Consulta aos cartuchos durante a execução:**

| Situação na task | Cartucho |
| ---------------- | -------- |
| A task cria ou altera migração | `migracao-segura.md`, seção da engine de §4 |
| A task adiciona consulta que carrega relação em lista | `orm-carga-de-dados.md`, seção do ORM de §4 |
| A task cria teste com banco, paralelismo, tempo ou rede | `teste-instavel.md`, seção do runner de §3 |

---

## Resumo do contrato

1. Sem `docs/stack/CONVENCOES.md`, nada muda.
2. F1 lê; F2 pergunta o que é PROPOSTA ou conflito; F3 embute nas tasks; F4
   registra e restringe paralelismo; F5 audita por aderência; F6 obedece.
3. PROPOSTA nunca governa: vira decisão na F2 e incerteza declarada na F3.
4. Comando não declarado em §2 não é inventado.
5. Decisão tomada na F2 volta ao CONVENCOES.md via `/stackx-atualizar`.
