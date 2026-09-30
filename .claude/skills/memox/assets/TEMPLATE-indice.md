# Estrutura de `.expx/memoria/indice.json`

Referência do formato do índice. **Este arquivo documenta; não é o índice.** O índice é gerado por `memox.py indexar` e nunca é escrito à mão (regra 1: toda entrada vem de um artefato real).

Um exemplo preenchido, gerado a partir de artefatos reais, está em `exemplos/indice.exemplo.json`.

## Esqueleto

```json
{
  "versao": 1,
  "gerado_em": "{{AAAA-MM-DD}}",
  "gerado_em_epoch": {{epoch}},
  "duracao_ms": {{N}},
  "raiz": ".",

  "totais": {
    "trabalhos": {{N}},
    "arquivos": {{N}},
    "modulos": {{N}},
    "regressoes": {{N}},
    "coincidencias": {{N}},
    "artefatos_contaminados": {{N}}
  },

  "trabalhos": {
    "{{TRABALHO-ID}}": {
      "trabalho_id": "{{TRABALHO-ID}}",
      "titulo": "{{titulo do trabalho}}",
      "tipo": "{{bug|melhoria-ui|melhoria-ux|novo-relatorio|regra-de-calculo|campo-novo|outro}}",
      "tipo_trabalho": "{{feature|ocorrencia}}",
      "ferramenta": "{{runx|sprintx|mergex|legadox}}",
      "data": "{{AAAA-MM-DD}}",
      "modulos": ["{{modulo}}"],
      "arquivos_alterados": ["{{caminho/relativo.ts}}"],
      "arquivos_impactados": ["{{caminho/relativo.ts}}"],
      "causa": "{{causa em uma linha}}",
      "modo": "{{causa_raiz|analise_impacto}}",
      "comprovada": {{true|false|null}},
      "risco_residual": "{{risco residual em uma linha}}",
      "decisoes": [
        {
          "id": "D-01",
          "decisao": "{{o que foi decidido}}",
          "alternativa_descartada": "{{o que foi descartado}}",
          "motivo": "{{por que}}",
          "status": "{{fechada|pendente}}",
          "origem": "{{caminho/do/artefato.md}}"
        }
      ],
      "lacunas": [{ "lacuna": "{{o que a documentacao nao respondia}}", "origem": "{{caminho}}" }],
      "qa": {
        "veredito": "{{aprovado|reprovado}}",
        "executado_em": "{{AAAA-MM-DD}}",
        "achados": [{ "severidade": "{{alta|media|baixa}}", "arquivo": "{{caminho}}", "problema": "{{qual}}" }],
        "origem": "{{caminho/QA.md}}"
      },
      "entrega": {
        "branch": "{{nome-da-branch}}",
        "commits": ["{{sha}}"],
        "faixa_atencao": { "{{caminho}}": "{{alta|media|baixa}}" },
        "origem": "{{caminho/ENTREGA.md}}"
      },
      "resumo": "{{resumo em uma linha}}",
      "fontes": ["{{todo artefato de onde este trabalho foi lido}}"]
    }
  },

  "por_arquivo": {
    "{{caminho/relativo.ts}}": [
      {
        "trabalho_id": "{{TRABALHO-ID}}",
        "titulo": "{{titulo}}",
        "data": "{{AAAA-MM-DD}}",
        "tipo": "{{tipo}}",
        "ferramenta": "{{runx|sprintx}}",
        "causa": "{{causa em uma linha}}",
        "papel": "{{alterado|impactado}}",
        "artefato": "{{caminho onde ler o detalhe}}"
      }
    ]
  },

  "por_modulo": { "{{modulo}}": [ "{{mesma forma de por_arquivo, papel: modulo}}" ] },
  "por_decisao": { "{{modulo}}": [ "{{decisao, com origem e trabalho_id}}" ] },
  "por_termo": { "{{termo}}": ["{{TRABALHO-ID}}"] },

  "sinais": {
    "arquivo": {
      "{{caminho/relativo.ts}}": {
        "trabalhos": {{N}},
        "ultimo_trabalho_em": "{{AAAA-MM-DD}}",
        "reprovacoes_qa": {{N}},
        "detalhe_reprovacoes": [{ "trabalho_id": "{{ID}}", "executado_em": "{{data}}", "origem": "{{caminho}}" }],
        "regressoes": [ "{{itens do bloco regressoes}}" ],
        "zona_de_risco": { "motivo": "{{motivo}}", "origem": "docs/legado/PERFIL.md" },
        "divida": { "descricao": "{{qual}}", "risco": "{{alto|medio|baixo}}", "origem": "docs/legado/DIVIDA.md" },
        "faixa_atencao_frequente": "{{alta|media|baixa}}"
      }
    },
    "modulo": {
      "{{modulo}}": {
        "trabalhos": {{N}},
        "ultimo_trabalho_em": "{{AAAA-MM-DD}}",
        "reprovacoes_qa": {{N}},
        "regressoes": [ "{{itens do bloco regressoes}}" ],
        "arquivos": ["{{caminhos do modulo}}"]
      }
    }
  },

  "regressoes": [
    {
      "arquivos": ["{{caminho em comum}}"],
      "trabalho_anterior": "{{ID do que alterou}}",
      "data_anterior": "{{AAAA-MM-DD}}",
      "trabalho_posterior": "{{ID do que apontou}}",
      "data_posterior": "{{AAAA-MM-DD}}",
      "evidencia": "{{a frase que descreve o vinculo}}",
      "origem_causa": "{{caminho do 01-CAUSA-RAIZ.md do posterior}}",
      "origem_alteracao": "{{caminho do tecnico.md do anterior}}"
    }
  ],

  "coincidencias_arquivo": [
    {
      "arquivos": ["{{caminho em comum}}"],
      "trabalhos": ["{{ID-A}}", "{{ID-B}}"],
      "motivo": "{{por que NAO foi promovido a regressao}}"
    }
  ],

  "linha_do_tempo": [
    { "trabalho_id": "{{ID}}", "data": "{{AAAA-MM-DD}}", "tipo": "{{tipo}}",
      "modulo": "{{modulo}}", "resumo": "{{resumo}}", "pasta": "{{pasta}}",
      "origem": "docs/relatorios/INDICE.md" }
  ],

  "artefatos_contaminados": { "{{caminho}}": ["{{chave_api|token_github|cpf|...}}"] },
  "fora_do_indice": [ { "artefato": "{{caminho}}", "motivo": "{{por que nao entrou}}" } ],
  "config": { "{{copia da config vigente}}": null }
}
```

## Invariantes

Valem para todo índice gerado. Um índice que viole qualquer uma está errado:

1. **Toda entrada aponta para um artefato real**, com caminho e data (regra 1). Sem `artefato`/`origem`, a entrada não deveria existir.
2. **Todo caminho é relativo à raiz do projeto.** Caminho absoluto é violação da regra transversal.
3. **`regressoes` e `coincidencias_arquivo` são disjuntos.** Um par está em uma ou em outra, nunca nas duas.
4. **Todo item de `regressoes` tem `origem_causa` e `origem_alteracao`** — sem os dois, é acusação sem prova.
5. **Todo item de `coincidencias_arquivo` tem `motivo`** dizendo por que não é regressão.
6. **Nenhum segredo literal.** Trecho detectado vira `[redigido pelo memox]` e o caminho vai para `artefatos_contaminados` (regra 7).
7. **O índice é descartável.** Apagar `.expx/memoria/` e reconstruir produz o mesmo resultado (regra 2).
8. `papel` distingue `alterado` (veio de `arquivos_alterados`) de `impactado` (veio de `arquivos_impactados`). A distinção sustenta o sinal de regressão.
