# TEMPLATE — pacote para o QA (E5)

Grave em `docs/entregas/<trabalho_id>/QA-PACOTE.md`. Substitua todos os
marcadores `{{assim}}`.

CRITÉRIO DE QUALIDADE: quem executa este arquivo NÃO abre código. Sem nome de
arquivo, função, classe, tabela, coluna ou endpoint no corpo. Sem jargão de
método (task, sprint, fase, raio, caracterização, portão, faixa). Sem dado real
de cliente. Sem credencial. Apague este cabeçalho ao gravar.

---

# Pacote de QA — {{título do trabalho, em linguagem de produto}}

## 1. O que mudou

{{duas ou três frases sobre o que a pessoa que usa o sistema vai ver de
diferente. Nada técnico.}}

## 2. Roteiro de teste

{{o roteiro completo, não resumido e não linkado — o QA trabalha dentro
deste arquivo}}

### Caso {{n}} — {{título do caso}}

**O que fazer:**
1. {{passo em linguagem de tela: onde clicar, o que preencher, o que enviar}}

**O que deve acontecer:**
{{resultado observável: um número na tela, uma linha no relatório, uma mensagem}}

**O que indicaria falha:**
{{o que ver que significa que não funcionou}}

## 3. O que observar de colateral

{{telas, relatórios e fluxos vizinhos que podem ter sido afetados sem estar no
roteiro, em linguagem de navegação}}

- {{onde ir e o que conferir, e por que aquilo pode ter sido afetado}}

## 4. Dado de teste sugerido

{{descreva o dado pelas características que importam, com valores FICTÍCIOS.
Nunca dado real de cliente, nem em exemplo, nem em anexo.}}

- {{característica do dado necessária para o caso}}

{{quando o cenário for difícil de montar, diga como chegar a ele pela interface}}

## 5. Ambiente e estado inicial

**Onde testar:** {{ambiente e como acessar. NUNCA credencial aqui — diga com
quem obtê-la ou onde ela está guardada.}}

**O que precisa existir antes:** {{cadastro, configuração, permissão, dado prévio}}

**O que precisa estar ligado:** {{integração, serviço externo, job}}

## 6. Critério de aprovação

**APROVADO quando:** {{objetivo e binário, sem adjetivo}}

**REPROVADO quando:** {{objetivo e binário}}

## 7. O que NÃO faz parte desta entrega

{{o que ficou de fora do escopo, para não ser reprovado por isso — e para não
passar como resolvido}}

---

{{só em trabalho da runx:}}
Depois da aprovação, o texto que o suporte devolve ao cliente é o relatório de
uso, em [{{caminho relativo}}]({{caminho relativo}}).
{{diga explicitamente se ele ainda não existe — quem o escreve é o E5 da runx,
que roda depois da entrega aceita}}
