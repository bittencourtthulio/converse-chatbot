---
expx-schema: v1
skill: stackx
documento: convencoes
gerado-em: <AAAA-MM-DD>
commit-referencia: <hash curto>
projeto-legado: <sim|nao>
---

# Convenções técnicas — <nome do repositório>

<!-- Se projeto-legado: sim, mantenha o bloco abaixo. Senão, remova-o. -->
> **Projeto legado.** `docs/legado/PERFIL.md` está presente. Na área tocada
> descrita nele manda o padrão local. Este arquivo governa **apenas código novo,
> em arquivo novo, fora da área tocada**. Não alinhe arquivo existente a nada
> aqui.

<!-- Marcadores literais, use exatamente estas formas:
> **PROPOSTA** — sem evidência no repositório. Não governa: as skills irmãs
> tratam este ponto como decisão a levantar, não como regra.

> **CONFLITO EM ABERTO** — o repositório faz isto de duas formas. Ver
> `docs/stack/LACUNAS.md`. Enquanto não houver decisão, siga o padrão do
> arquivo vizinho e registre a escolha na task.
-->

## 1. Identidade técnica

| Item | Valor | Origem |
| ---- | ----- | ------ |
| Linguagem e versão | | |
| Runtime e versão | | |
| Gerenciador de pacotes | | |
| Framework principal e versão | | |

<!-- Versão exata do lock, com a faixa do manifesto entre parênteses.
     Ex.: 15.7.1 (faixa ^15.2) -->

**Evidência:** `<caminho:linha>`

---

## 2. Comandos que funcionam de verdade

<!-- Regra 5: alvo sem script, sem alvo de Makefile e sem linha de CI vira
     "— (LACUNA)". Nunca escreva o comando padrão do framework. -->

| Alvo | Comando | Origem |
| ---- | ------- | ------ |
| Suíte inteira | | |
| Um teste só | | |
| Com cobertura | | |
| Lint | | |
| Formatador (verificar) | | |
| Formatador (aplicar) | | |
| Type check | | |
| Build | | |
| Subir ambiente local | | |

<!-- "Um teste só": derive da invocação real do projeto e use um caminho que
     existe no repositório como exemplo. -->

**Evidência:** `<caminho:linha>`

---

## 3. Testes

| Item | Convenção |
| ---- | --------- |
| Onde o arquivo mora | |
| Nome do arquivo | |
| Nome do caso de teste | |
| Runner e versão | |
| Biblioteca de asserção | |
| Montagem de dado | <!-- factory / fixture literal / builder / nada --> |
| Marcação de teste lento ou de integração | |
| Paralelismo do runner | |

**Teste exemplar:** `<caminho>` — é a forma que o código novo deve copiar.

**Estrutura típica**

<!-- Descreva: aninhamento, Arranjo-Ação-Asserção, um ou vários asserts,
     setup em bloco ou dentro do caso. -->

**O que se mocka e o que fica real**

| Eixo | Tratamento | Evidência |
| ---- | ---------- | --------- |
| HTTP de saída | | |
| HTTP de entrada | | |
| Relógio | | |
| Sistema de arquivos | | |
| Fila / mensageria | | |
| Serviço externo | | |

**Evidência:** `<caminho:linha>`

---

## 4. Banco de dados em teste

| Item | Valor |
| ---- | ----- |
| Engine e versão exata | |
| ORM / camada de acesso e versão | |
| **Isolamento entre testes** | <!-- transação com rollback / truncate / banco por worker / container efêmero / em memória --> |
| Combinação isolamento × paralelismo | |
| Semeadura de dado de teste | |
| Onde vivem as migrações | |
| Comando de rodar migração | |
| Comando de reverter migração | |
| Migrações têm reversão declarada? | |

**Evidência:** `<caminho:linha>`

---

## 5. Estrutura e camadas

<!-- Use os nomes das pastas do repositório. Não traduza para vocabulário
     de arquitetura que o projeto não usa. -->

| Camada (nome no repositório) | Pasta | Pode importar de | Não importa de |
| ---------------------------- | ----- | ---------------- | -------------- |
| | | | |

**Força da evidência de dependência:** <!-- regra de lint (forte) / contagem de imports (declare os números) -->

**Onde entra código novo**

| Tipo | Pasta | Arquivo exemplar |
| ---- | ----- | ---------------- |
| Caso de uso | | |
| Adaptador | | |
| Controlador / handler | | |
| Componente de interface | | |
| Job / tarefa agendada | | |

**Violações existentes** <!-- direção rara contra muitas na oposta: é violação, não regra -->

**Evidência:** `<caminho:linha>`

---

## 6. Padrões de código com consequência

### Sinalização de erro
<!-- exceção / retorno tipado / objeto de resultado; hierarquia base; onde o
     erro vira resposta -->
**Evidência:** `<caminho:linha>`

### Validação de entrada
<!-- biblioteca de esquema ou manual; EM QUE CAMADA -->
**Evidência:** `<caminho:linha>`

### Log
<!-- biblioteca; estruturado ou string; correlação de requisição -->
**Nunca vai para o log:** <!-- campos redigidos. Sem redaction = lacuna de segurança -->
**Evidência:** `<caminho:linha>`

### Configuração e segredo
<!-- config centralizada com validação, ou acesso direto ao ambiente; de onde
     vem o segredo. NUNCA copie valores. -->
**Evidência:** `<caminho:linha>`

### Nomeação

| Elemento | Forma | Observação |
| -------- | ----- | ---------- |
| Arquivo | | <!-- pode diferir por camada; se consistente dentro de cada uma, documente por camada --> |
| Classe / tipo | | |
| Função / método | | |
| Variável de ambiente | | |

**Evidência:** `<caminho:linha>`

---

## Conflitos em aberto

<!-- Um bloco por conflito não resolvido, no formato de assets/TEMPLATE-conflito.md.
     Remova a seção se não houver nenhum. -->

## Decisões registradas

| Data | Quem decidiu | Ponto | Decisão | Dialeto abandonado |
| ---- | ------------ | ----- | ------- | ------------------ |

## Histórico de atualização

| Data | Commit | O que mudou |
| ---- | ------ | ----------- |

---

<!-- Lacunas: docs/stack/LACUNAS.md -->
<!-- Nenhum segredo, credencial, host real, nome de cliente ou dado pessoal
     neste arquivo. Nenhum caminho absoluto: tudo relativo à raiz. -->
