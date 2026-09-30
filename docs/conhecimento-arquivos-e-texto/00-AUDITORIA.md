# Auditoria — conhecimento-arquivos-e-texto

Data: 2026-09-30

Auditoria feita pelo próprio executor (não há agente auditor neste harness), sem editar o plano durante a auditoria.

**Rodada 1:** 7 sprints, 37 tasks, todas com `teste_integracao`, `teste_funcional` e `criterio_aceite` preenchidos; sem ciclo em `depende_de` (conferido por script); a sprint-01 entrega a capacidade de testar (ambiente, dependências, fixtures), sem regra de negócio; nenhuma task depende de decisão humana; cada D-NN cita fonte.

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| ALTA | sprint-03/fases.md | A fase F-03.2 declara `paralela_com: [F-03.1]`, mas T-03.04, T-03.05 e T-03.06 dependem de T-03.02, T-03.07 de T-03.01 e T-03.08 de T-03.03 (todas de F-03.1): paralelismo falso (item 5) | Regerar o plano na F3 com F-03.1 e F-03.2 sequenciais (`paralelizavel: false`, `paralela_com: []`) e a rota do ORQUESTRADOR ajustada |
| MÉDIA | sprint-04/tasks.md | Nada prova que a fila só liga na subida do servidor de produção e não em outro momento (lacuna 5 da base: `register()` em build e em hot reload) | Em T-05.04 exigir que o servidor de produção, ao subir com uma fonte pendente no banco, a leve a pronto sem requisição alguma |
| MÉDIA | sprint-05/tasks.md | O corpo sem `Content-Length` (chunked) só é barrado pelo teto por arquivo do serviço, não por um teto de corpo (lacuna 4 da base) | Aceitar: T-04.04 já recusa arquivo acima de `MAX_UPLOAD_MB` e o handler confere o tamanho real depois de ler; registrar como limite conhecido no README |
| BAIXA | sprint-01/tasks.md | T-01.02 depende de T-01.01 sem necessidade real | Manter: é só a ordem de instalação |
| BAIXA | sprint-03/tasks.md | O teste de zip bomb precisa gerar dados muito compressíveis sem estourar a memória do teste | Gerar com `deflateRawSync` de buffer de zeros em pedaços e um teto baixo injetado para o teste |
| BAIXA | sprint-06/tasks.md | Sem jsdom, arrastar-e-soltar, foco e polling só são exercitados por módulos puros e pela verificação visual (base/interface-do-agente-e-conhecimento.md) | Cobrir a lógica em T-06.02 e o resto em T-07.02, declarando o que não for visto |

VEREDITO: NÃO — o plano não está pronto para execução autônoma.
