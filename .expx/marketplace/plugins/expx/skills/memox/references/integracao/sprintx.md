# Integração — sprintx

A `sprintx` planeja features novas, em seis fases (F1 a F6). O memox entra em duas delas.

## F1 — Ingestão

A F1 monta a base de conhecimento da feature: mapeia os recursos que serão tocados e registra as lacunas.

**Consulta**: para cada arquivo e módulo que a base identifica como área da feature.

```bash
python3 .claude/skills/memox/assets/memox.py arquivo "<caminho>"
python3 .claude/skills/memox/assets/memox.py modulo "<modulo>"
```

**O que fazer com o resultado**: o histórico entra na base como contexto, com o caminho do artefato de origem. Um arquivo com regressão registrada ou reprovação em QA vira **lacuna a investigar** na F1, não um item pronto — a base é onde se registra o que ainda não se sabe.

**Por que na F1**: é onde a feature ainda é maleável. Descobrir na F1 que o módulo já teve três regressões muda o desenho; descobrir na F6 muda o cronograma.

## F3 — Plano

A F3 gera sprints, fases e tasks, e é onde os arquivos que serão tocados ficam declarados.

**Consulta**: sobre a lista consolidada de arquivos que o plano pretende tocar, antes de fechar as tasks.

**O que fazer com o resultado**:

| Sinal | Efeito no plano |
|---|---|
| regressão registrada | task de teste que cubra o caminho que regrediu; risco declarado na sprint |
| reprovação em QA | critério de aceite mais estrito no ponto que reprovou |
| decisão já tomada sobre o módulo | **não replaneje a alternativa já descartada** sem justificar por que agora é diferente |
| dívida registrada | risco declarado; a dívida não vira escopo de brinde |
| zona de risco | risco declarado na sprint |

O caso mais valioso é o da decisão descartada: a `sprintx` registra em `00-DECISOES.md` cada decisão com sua alternativa descartada e o motivo. Replanejar a alternativa já descartada, sem saber que foi descartada, é o desperdício mais caro e mais silencioso que o ecossistema comete.

## Contrato de não interferência

- O memox **não altera** o plano. Ele entrega contexto; quem decide é a `sprintx`.
- Nenhum artefato da `sprintx` é editado pelo memox (regra 9).
- **Sem o memox instalado, a F1 e a F3 rodam exatamente como hoje.** A consulta é aditiva: falhou, não existe, ou devolveu vazio, a fase segue.
- O memox não cria lacuna nem risco por conta própria: ele fornece o fato com proveniência, e a `sprintx` decide se vira lacuna, risco ou nada.

## Verificação

- [ ] F1 consulta o memox para cada área da base.
- [ ] F3 consulta antes de fechar as tasks.
- [ ] Todo achado incorporado cita o artefato de origem.
- [ ] Sem o memox, as duas fases produzem o mesmo resultado de antes.
- [ ] Nenhum artefato da `sprintx` alterado pelo memox.
