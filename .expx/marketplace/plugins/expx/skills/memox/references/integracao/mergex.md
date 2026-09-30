# Integração — mergex

A `mergex` versiona, entrega e revisa pull requests. Entre outras coisas, ela **classifica a faixa de atenção** de uma entrega: quanto de revisão humana aquele conjunto de mudanças exige.

## O que o memox acrescenta

A classificação hoje olha para a mudança: quantos arquivos, quantas linhas, que tipo de código, se toca migração ou dado sensível. Isso descreve o **tamanho e a natureza** do diff.

O que o diff não conta é o **passado do arquivo**. Uma mudança de três linhas num arquivo que já causou duas regressões merece mais olhos que uma mudança de trinta linhas num arquivo que nunca falhou. O tamanho do diff não sabe disso; o índice sabe.

## A regra

**Arquivo com histórico de regressão sobe de faixa.**

```bash
python3 .claude/skills/memox/assets/memox.py arquivo "<caminho>" --formato json
```

Para cada arquivo do diff, do campo `sinais`:

| Sinal | Efeito na faixa |
|---|---|
| `regressoes` não vazio | **sobe de faixa** |
| `reprovacoes_qa` alto | sobe de faixa |
| `zona_de_risco` presente | sobe de faixa |
| `divida` com risco alto | material para a nota de revisão |
| nenhum sinal | **faixa inalterada** |

Quanto sobe, e qual o teto, é decisão da `mergex`. O memox fornece o fato; a política é dela.

**A faixa nunca desce por causa do memox.** Ausência de histórico é ausência de informação, não atestado de segurança: um arquivo novo não tem histórico e nem por isso é seguro. O memox só acrescenta motivo para olhar mais.

## Justificativa na revisão

Ao subir a faixa, a `mergex` deve dizer **por quê**, com o artefato:

```
Faixa elevada para alta: src/frete/calculo.ts ja causou regressao.
  OC-2026-0100 (2026-05-10) alterou o arquivo;
  OC-2026-0142 (2026-08-29) teve causa raiz comprovada apontando para ele.
  ver: docs/manutencao/OC-2026-0142-arredondamento/01-CAUSA-RAIZ.md
```

Sem a justificativa, a subida de faixa vira burocracia inexplicada, e quem revisa aprende a ignorá-la. Com ela, o revisor sabe **onde** olhar, que é o ponto inteiro.

## Direção do fluxo

`mergex` **consome** do memox e **alimenta** o memox pelos artefatos: `docs/entregas/*/ENTREGA.md` é fonte indexada, de onde sai o sinal `faixa_atencao_frequente`. Um arquivo que entra repetidamente em entregas de faixa alta acumula esse histórico — e o ciclo se fecha pelos artefatos, não por chamada direta.

## Contrato de não interferência

- Sem o memox instalado, a classificação é a de hoje.
- Consulta falhando, a `mergex` classifica com o que tem.
- O memox não bloqueia PR, não aprova, não reprova: ele informa.
- Nenhum artefato da `mergex` é editado pelo memox (regra 9).

## Verificação

- [ ] A classificação consulta o memox para cada arquivo do diff.
- [ ] Arquivo com regressão sobe de faixa.
- [ ] A faixa nunca desce por ausência de sinal.
- [ ] Toda subida de faixa cita trabalho, data e artefato.
- [ ] Sem o memox, a classificação é a mesma de antes.
