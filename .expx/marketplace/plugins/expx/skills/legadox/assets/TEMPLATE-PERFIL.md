# Perfil do projeto — {{nome do projeto}}

> Substitua TODOS os marcadores `{{assim}}`. Nenhum marcador pode sobreviver no arquivo final.
> Regra dura: nada de invenção. O que não for verificável no código vira `NÃO DETERMINADO`
> e ganha uma linha em `docs/legado/LACUNAS.md`.
> A existência deste arquivo é o gatilho do modo legado.

Gerado em: {{AAAA-MM-DD}}
Atualizado em: {{AAAA-MM-DD}}
Região mapeada: {{o repositório inteiro | apenas os módulos X, Y — o resto está em LACUNAS.md}}

---

## 1. Stack e versões reais

> Lidas dos manifestos, nunca presumidas. Toda linha cita o arquivo de onde foi lida.

| Item | Versão | Lido de |
|---|---|---|
| {{linguagem/runtime}} | {{versão exata}} | {{caminho/relativo/manifesto}} |
| {{framework principal}} | {{versão exata}} | {{caminho/relativo/manifesto}} |
| {{banco de dados}} | {{versão exata}} | {{caminho/relativo/arquivo}} |
| {{dependência crítica}} | {{versão exata}} | {{caminho/relativo/lockfile}} |

Versão travada por: {{.nvmrc | .tool-versions | Dockerfile | nenhum arquivo trava — NÃO DETERMINADO}}

---

## 2. Pontos de entrada

> Tudo por onde o sistema é acionado de fora. Cada linha cita caminho relativo de arquivo.

### Rotas HTTP
- `{{caminho/relativo/arquivo.ext}}` — {{o que expõe}}

### Comandos de CLI
- `{{caminho/relativo/arquivo.ext}}` — {{o que faz}}

### Jobs e crons
- `{{caminho/relativo/arquivo.ext}}` — {{o que roda, com que frequência}}

### Filas e workers
- `{{caminho/relativo/arquivo.ext}}` — {{qual fila/tópico consome}}

### Webhooks recebidos
- `{{caminho/relativo/arquivo.ext}}` — {{de quem recebe}}

### Integrações de saída
- {{para quem o sistema chama}} — `{{caminho/relativo/arquivo.ext}}`

---

## 3. Camadas que de fato existem

> A arquitetura que o projeto TEM, não a que deveria ter.

| Camada | Pasta | O que contém de fato | Seguida consistentemente? |
|---|---|---|---|
| {{nome}} | `{{pasta/}}` | {{conteúdo real}} | {{sim | não — onde é violada}} |

---

## 4. Comandos reais

| Ação | Comando | Fonte |
|---|---|---|
| build | `{{comando}}` | {{onde foi lido}} |
| teste (suíte inteira) | `{{comando}}` | {{onde foi lido}} |
| teste de um arquivo só | `{{comando}}` | {{onde foi lido}} |
| lint | `{{comando}}` | {{onde foi lido}} |
| execução local | `{{comando}}` | {{onde foi lido}} |
| migração de banco | `{{comando}}` | {{onde foi lido}} |

---

## 5. Cobertura de teste verdadeira

Método de medição: {{ferramenta e comando usados | estimativa grosseira por contagem de arquivos — declare qual}}
Suíte executável neste ambiente: {{sim | não — motivo}}

Cobertura global: {{N}}%

| Pasta | Cobertura | Observação |
|---|---|---|
| `{{pasta/}}` | {{N}}% | {{o que isso significa para quem for mexer ali}} |

---

## 6. Padrões conflitantes

> SEÇÃO OBRIGATÓRIA. Em legado não existe "o padrão", existem vários.
> A última coluna é a que o agente vai obedecer ao mexer naquela pasta.

| Eixo | Dialeto encontrado | Onde vive | Segue este ao mexer ali |
|---|---|---|---|
| acesso a dados | {{dialeto}} | `{{pasta/}}` | {{sim | não — siga o dialeto X}} |
| tratamento de erro | {{dialeto}} | `{{pasta/}}` | {{...}} |
| validação | {{dialeto}} | `{{pasta/}}` | {{...}} |
| injeção de dependência | {{dialeto}} | `{{pasta/}}` | {{...}} |
| data e hora | {{tipo, fuso, formato}} | `{{pasta/}}` | {{...}} |
| dinheiro | {{tipo usado}} | `{{pasta/}}` | {{...}} |
| nomenclatura e idioma | {{dialeto}} | `{{pasta/}}` | {{...}} |
| estilo de teste | {{dialeto}} | `{{pasta/}}` | {{...}} |

Critério de desempate quando duas formas convivem na mesma pasta: {{a mais recente por histórico do versionador | outro critério declarado}}

---

## 7. Zonas de risco

> Áreas onde errar não é bug, é processo.
> Toda zona tocada por um trabalho dispara a Camada 11 e implica raio ALTO.

### Zona: {{nome da zona}}

Pastas e arquivos que a compõem:
- `{{pasta/ou/arquivo}}`

Quem valida uma mudança aqui: {{papel ou pessoa | NÃO DETERMINADO}}

Perguntas obrigatórias adicionais desta zona, além das seis mínimas da Camada 11:
1. {{pergunta específica desta zona}}
2. {{pergunta específica desta zona}}

{{Repita o bloco acima para cada zona encontrada.
  Zonas a procurar ativamente: financeiro, fiscal, folha de pagamento, autenticação e
  permissão, integração bancária ou de pagamento, dado histórico imutável, cálculo com
  efeito contratual, LGPD e dado pessoal.}}

---

## 8. Áreas suspeitas de código morto

> Suspeita, não sentença. Confirmar é trabalho da Camada 10, e confirmado NÃO autoriza remoção.

| Área | Sinal que levantou a suspeita | Última alteração |
|---|---|---|
| `{{caminho/relativo}}` | {{nenhuma referência fora do próprio arquivo | rota comentada | flag desligada}} | {{AAAA-MM-DD}} |

---

## 9. Limiares do raio de impacto

> Valores padrão da Camada 2, copiados para cá. A partir daqui são EDITÁVEIS pelo time,
> e o valor que vale é o deste arquivo, não o do SKILL.md.

### Faixas

```
BAIXO  até 3 chamadores, nenhuma zona de risco, sem migração,
       área com cobertura de teste existente, sem dado histórico afetado
MEDIO  4 a 15 chamadores, ou cobertura parcial ou ausente,
       ou consumo por job, cron, relatório ou integração
ALTO   acima de 15 chamadores, ou qualquer zona de risco tocada,
       ou migração de banco, ou dado histórico ou imutável afetado
```

### Orçamento de mudança por task

```
BAIXO  até 5 arquivos, até 150 linhas
MEDIO  até 3 arquivos, até 80 linhas
ALTO   até 2 arquivos, até 40 linhas
```

### Histórico de edição dos limiares

> Limiar alterado sem motivo registrado é como o rigor evapora ao longo dos meses.

| Data | Quem editou | O que mudou | Motivo |
|---|---|---|---|
| {{AAAA-MM-DD}} | {{quem}} | {{de X para Y}} | {{motivo}} |
