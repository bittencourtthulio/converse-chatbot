# Integração — runx

A `runx` trata ocorrências de manutenção, em cinco estágios (E1 a E5). O memox entra no primeiro e no último — consumindo no E1, alimentando no E5.

## E1 — Investigação

O E1 monta a base, classifica o tipo e produz `01-CAUSA-RAIZ.md`, com `arquivos_impactados` — a lista que trava o escopo.

**Consulta**: sobre cada arquivo de `arquivos_impactados`, assim que a lista existir.

```bash
python3 .claude/skills/memox/assets/memox.py arquivo "<caminho>" --formato json
```

**O que fazer com o resultado**:

| Sinal | Efeito na investigação |
|---|---|
| regressão registrada apontando para este arquivo | **verifique se a ocorrência atual é outra recaída do mesmo ponto**; o artefato do trabalho anterior é leitura obrigatória |
| trabalho anterior com causa raiz no mesmo arquivo | a causa anterior é hipótese de partida — a ser comprovada como qualquer outra, nunca copiada |
| reprovação em QA no arquivo | o ponto que reprovou entra na reprodução |
| decisão registrada sobre o módulo | confira se a correção pretendida não reverte uma decisão consciente |
| dívida ou zona de risco | material para o risco residual do relatório técnico |

**A regra que não pode ser quebrada**: o histórico é ponto de partida, não conclusão. A regra 2 da `runx` continua valendo inteira — bug não avança do E1 sem **causa raiz comprovada**, com evidência própria desta ocorrência. Nenhuma quantidade de histórico substitui a prova. Um arquivo que regrediu três vezes é um bom lugar para procurar, não uma causa comprovada.

O valor real aqui é de tempo: quem lembra do primeiro bug resolve o segundo em vinte minutos. O memox faz o time inteiro lembrar.

## E5 — Relatório

O E5 grava os dois relatórios, atualiza `docs/relatorios/INDICE.md` e encerra a ocorrência.

**Ação**: disparar a reindexação ao fechar.

```bash
python3 .claude/skills/memox/assets/memox.py indexar
```

O hook Stop (`memox-reindexar.sh`) já detecta os artefatos novos e reconstrói sozinho. O disparo explícito no E5 existe para quem não instalou o hook, e para deixar o índice pronto imediatamente após o fechamento — a ocorrência recém-fechada é a que tem mais chance de ser consultada em seguida.

Só depois do E5 o trabalho entra na memória: é o estágio que produz o relatório técnico com `arquivos_alterados`, sem o qual não há o que indexar. **Ocorrência aberta não é memória** — é trabalho em andamento.

## Contrato de não interferência

- O memox **não edita** nada em `docs/manutencao/` (regra 9), o que preserva a regra 12 da `runx`.
- Consulta falhando ou devolvendo vazio, o E1 segue como hoje.
- **Sem o memox instalado, os cinco estágios rodam exatamente como hoje.**
- O memox não classifica tipo, não comprova causa, não decide escopo.

## Verificação

- [ ] E1 consulta o memox para cada arquivo de `arquivos_impactados`.
- [ ] Todo achado incorporado à investigação cita o artefato de origem.
- [ ] Causa raiz continua exigindo evidência própria, mesmo com histórico.
- [ ] E5 dispara a reindexação após gravar os relatórios.
- [ ] Sem o memox, os estágios produzem o mesmo resultado de antes.
