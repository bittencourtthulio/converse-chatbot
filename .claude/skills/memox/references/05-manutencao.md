# Etapa 5 — MANUTENÇÃO

O índice é reconstruído **do zero** quando os artefatos mudam. Não há atualização incremental na v1.

## Por que sempre do zero

Reconstruir é barato — 186 ms para 200 trabalhos, 400 artefatos — e elimina **a classe inteira** de bug de índice dessincronizado: entrada órfã apontando para artefato apagado, contagem que não bate, sinal calculado sobre estado intermediário, arquivo renomeado que aparece nos dois caminhos.

Atualização incremental trocaria essa garantia por uma economia de milissegundos, e pagaria com a categoria de bug mais difícil de perceber: o índice que responde com confiança um dado que não corresponde mais ao disco. A reconstrução total é o que permite confiar no índice sem auditá-lo.

## Os dois gatilhos

### Por comando

```bash
/memox-indexar
```

Sempre disponível, sempre integral. Use após importar artefatos de outro projeto, após corrigir um artefato à mão, ou sempre que houver dúvida sobre o índice — na dúvida, reconstrua: é barato e é seguro (regra 2).

### Por hook, ao fechar um trabalho

`memox-reindexar.sh`, hook **Stop**:

```json
{
  "hooks": {
    "Stop": [
      { "hooks": [{ "type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/memox-reindexar.sh" }] }
    ]
  }
}
```

O hook confere as marcas de tempo dos artefatos contra `.expx/memoria/ultima-indexacao` e **só reconstrói se algum artefato mudou**. Nada mudou, nada roda.

A checagem é rasa e barata (~23 ms para 400 artefatos): compara `mtime` dos nomes conhecidos (`tecnico.md`, `INDICE.md`, `01-CAUSA-RAIZ.md`, `00-DECISOES.md`, `QA.md`, `ENTREGA.md`, `DIVIDA.md`, `PERFIL.md`, `00-LACUNAS.md`, `ORQUESTRADOR.md`) até quatro níveis. Note que isto decide apenas **se** reconstrói — a reconstrução, quando ocorre, é sempre integral.

A reconstrução roda **assíncrona**, desacoplada do processo do hook: encerrar a sessão não espera pelo índice. O hook sai com **0 sempre**.

O E5 da `runx` dispara isso naturalmente ao gravar os relatórios e o `INDICE.md`. Ver `references/integracao/runx.md`.

## Correção de conhecimento errado

**O memox não guarda conhecimento próprio, então não há o que corrigir nele.**

Artefato errado se corrige no artefato, e o índice reflete na próxima reconstrução. Isso é uma vantagem deliberada sobre um acervo próprio, que degradaria: um acervo acumula sua própria versão dos fatos, que envelhece em silêncio e precisa de um processo de curadoria só dela.

Fluxo, quando alguém aponta um erro na resposta do memox:

1. Abra o artefato indicado na linha `ver:`.
2. Confirme: o erro está no artefato, ou na leitura que o índice fez dele?
3. **Erro no artefato** — corrija pela skill dona do artefato (`runx`/`sprintx`). O memox nunca edita artefato (regra 9).
4. **Erro na leitura** — é bug do memox. Reconstrua; persistindo, corrija a extração e registre em `DECISOES-DA-SKILL.md`.
5. Reconstrua o índice.

Nunca "corrija" editando `indice.json`: a correção some na próxima reconstrução e cria uma entrada sem artefato de origem, violando a regra 1.

## O índice não é versionado (regra 8)

`.expx/memoria/` entra no `.gitignore` — o motor acrescenta a linha na primeira indexação. **Os artefatos é que são commitados**; o índice é derivado deles e reconstruível a qualquer momento por qualquer clone.

Versionar o índice traria conflito de merge em arquivo gerado, revisão de diff sem valor, e o risco de alguém confiar numa versão commitada mais velha que os artefatos.

## Configuração

`.expx/memoria/config.json`, criado na primeira indexação:

| Chave | Padrão | Efeito |
|---|---|---|
| `max_entradas_recentes` | `3` | entradas recentes por alvo |
| `teto_entradas` | `8` | acima disso, informa contagem em vez de listar |
| `sempre_incluir` | `["regressao","reprovacao_qa","zona_de_risco"]` | sinais que furam o limite de recência |
| `fontes` | ver template | onde procurar cada tipo de artefato |
| `ignorar` | `[".git","node_modules",...]` | diretórios não varridos |

Config inválida não derruba a consulta: o motor cai nos padrões e segue (falha aberta).

## Critério de saída

- [ ] `ultima-indexacao` mais nova que todos os artefatos.
- [ ] `precisa_reindexar` devolve `false` logo após uma indexação.
- [ ] `precisa_reindexar` devolve `true` após tocar um artefato.
- [ ] `.expx/memoria/` no `.gitignore`.
- [ ] Hook Stop sai com 0 e não bloqueia o encerramento.

## Quando falha

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| Índice não atualiza ao fechar trabalho | hook Stop não registrado em `settings.json` | registre-o, ou rode `/memox-indexar` manualmente |
| `precisa_reindexar` sempre `true` | outro processo reescrevendo artefatos, ou relógio do sistema inconsistente | confira `ultima-indexacao`; reconstrua |
| Índice sumiu | `.expx/` apagado, clone novo | esperado e inofensivo: reconstrua (regra 2) |
| Consulta mostra trabalho já apagado | índice mais velho que o disco | reconstrua; a reconstrução total não deixa entrada órfã |
| `.gitignore` não recebeu a linha | arquivo somente-leitura, ou permissão | acrescente `.expx/memoria/` à mão (regra 8) |
| Índice grande demais | centenas de trabalhos com muitos arquivos | esperado; a consulta continua em milissegundos porque é lookup, não varredura |
