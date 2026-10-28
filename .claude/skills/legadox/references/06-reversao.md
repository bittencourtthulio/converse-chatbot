# Camada 7 — PLANO DE REVERSÃO POR TASK

Você está declarando **como se desfaz** cada task de raio MEDIO ou ALTO, antes de executá-la.

E não basta "reverter o commit". O versionador desfaz código; ele não desfaz nada do que o código já fez no mundo.

## Pré-requisitos verificáveis

- `docs/legado/raio/<trabalho_id>.md` existe, faixa MEDIO ou ALTO.
- O ponto de costura da task está declarado (Camada 4) — ele determina o que precisa ser revertido.

O plano de reversão é escrito **no planejamento**, junto com a task, não depois da execução. Reversão pensada depois é reversão que não existe quando é necessária, que é sempre às onze da noite.

## Regra dura deste reference

Se algum efeito da task for **irreversível**, isso é declarado em letras grandes na task e obriga aprovação humana, **independentemente do raio**. Uma task BAIXO que dispara e-mail para 8 mil clientes é irreversível, e o raio baixo não a torna segura.

---

## Passo 1 — Inventariar os efeitos da task

Percorra a lista e responda cada item com o efeito concreto, ou `nenhum`. Não pule item respondendo de memória: verifique no código da task.

### 1. Código

O que reverter, e a ordem. Se a task depende de outra já aplicada, a ordem de reversão é a inversa da aplicação — declare a cadeia.

### 2. Dado já gravado no formato novo

**O item mais esquecido, e o que mais dói.** Enquanto o código novo rodou, ele gravou. Reverter o código deixa esse dado lá, agora lido por código antigo que não o entende.

Declare: qual tabela e coluna, como identificar os registros gravados pelo código novo (marcador, faixa de data, versão, flag), e o que fazer com eles — converter de volta, marcar para reprocesso, ou aceitar e por quê.

Se **não houver como identificar** os registros afetados, isso é efeito irreversível na prática. Diga isso.

### 3. Migração de banco aplicada

Migração para frente quase nunca é simétrica.

Declare: qual migração, se existe reversão escrita e **testada**, e o que acontece com o dado na reversão. `DROP COLUMN` na reversão apaga dado que o código novo gravou — se for o caso, é irreversível e precisa estar escrito assim.

Migração aditiva (coluna nova, nullable, sem backfill) costuma ser reversível de fato. Migração que altera tipo, renomeia, remove ou faz backfill quase nunca é.

### 4. Flag a desligar, e onde ela é lida

Em raio ALTO a flag é obrigatória. Declare: nome exato da flag, onde é definida, **todos os pontos onde é lida** (caminho e linha), qual é o valor seguro, e quanto tempo leva para o desligamento fazer efeito — imediato, próximo deploy, próximo ciclo de cache.

Uma flag lida em cinco lugares e desligada em quatro é pior do que não ter flag.

### 5. Cache ou índice a invalidar

Cache de aplicação, cache de consulta, cache de página, CDN, índice de busca, view materializada, tabela de resumo pré-calculada.

Declare: o quê, e o comando ou passo exato para invalidar. Cache com dado calculado pela regra nova sobrevive à reversão do código e continua servindo o valor novo.

### 6. Efeito externo já disparado

Mensagem enviada, e-mail, SMS, notificação push; arquivo gerado, remessa, exportação, relatório baixado; webhook disparado; chamada a API de terceiro; documento fiscal emitido; lançamento contábil; cobrança, boleto, PIX.

Estes são, por natureza, **irreversíveis**. Declare quais podem ocorrer, em que volume, e a partir de que momento da execução. Isso determina a janela: o que precisa ser desfeito **antes** que o efeito externo aconteça.

---

## Passo 2 — Classificar a reversibilidade da task

Uma das três, e apenas uma:

| Classe | Significado |
|---|---|
| **REVERSÍVEL** | reverter o código e executar os passos declarados restaura o estado anterior por completo |
| **REVERSÍVEL COM PERDA** | o estado anterior é restaurável, mas algo se perde ou exige reprocesso — declare exatamente o quê |
| **IRREVERSÍVEL** | há efeito que não se desfaz. **Obriga aprovação humana, seja qual for o raio.** |

Na dúvida entre duas classes, vale a pior.

---

## Passo 3 — Escrever o plano na task

Formato fixo, dentro do bloco da task no plano da skill irmã:

```
REVERSÃO — classe: <REVERSÍVEL | REVERSÍVEL COM PERDA | IRREVERSÍVEL>

1. Código:            <o que reverter, em que ordem>
2. Dado gravado:      <como identificar e o que fazer; ou "nenhum">
3. Migração:          <qual, reversão testada?, o que acontece com o dado; ou "nenhuma">
4. Flag:              <nome, onde é lida, valor seguro, tempo até efeito; ou "nenhuma">
5. Cache/índice:      <o quê e como invalidar; ou "nenhum">
6. Efeito externo:    <o que já pode ter saído; ou "nenhum">

Tempo estimado de reversão: <minutos>
Quem executa a reversão:    <papel>
Janela: <até quando dá para reverter sem consequência adicional>
```

Quando a classe for IRREVERSÍVEL, o bloco começa com esta linha, em destaque:

```
### ATENÇÃO — TASK IRREVERSÍVEL
### Efeito que não se desfaz: <qual>
### Exige aprovação humana registrada antes da execução.
```

---

## Passo 4 — Verificar antes de executar a task

- [ ] A reversão da migração foi **executada** em ambiente de teste, não apenas escrita.
- [ ] A flag foi testada desligada, e o comportamento antigo voltou de fato.
- [ ] Os pontos de leitura da flag foram conferidos um a um contra o grep.
- [ ] O tempo estimado de reversão é realista para o pior horário.

Uma reversão nunca testada é uma hipótese.

---

## Formato exato da saída

O bloco do Passo 3 dentro de cada task de raio MEDIO ou ALTO no plano da skill irmã, e consolidado em `docs/legado/raio/<trabalho_id>.md` na seção de reversão, preenchido de `assets/TEMPLATE-reversao.md`.

## Critério de saída

- [ ] Toda task MEDIO ou ALTO tem bloco de reversão com os seis itens respondidos — `nenhum` é resposta válida; em branco não é.
- [ ] A classe de reversibilidade está declarada.
- [ ] Toda task IRREVERSÍVEL traz o bloco de atenção e a aprovação humana registrada.
- [ ] Reversão de migração testada, quando houver migração.
- [ ] Flag com todos os pontos de leitura listados, quando houver flag.
- [ ] Nenhum caminho absoluto.

## Quando o critério não é atendido

**Não há como identificar os registros gravados pelo código novo.** Duas saídas, nesta ordem de preferência: acrescentar um marcador (coluna de versão, flag no registro, carimbo de tempo) **como parte da task**, o que torna a reversão possível; ou classificar como IRREVERSÍVEL e escalar. A primeira costuma custar poucas linhas e vale quase sempre a pena.

**A migração não tem reversão possível** (`DROP` de coluna com dado). Classe IRREVERSÍVEL, aprovação humana obrigatória. Alternativa que frequentemente resolve: dividir em duas tasks e duas entregas — primeiro parar de escrever na coluna, depois, em trabalho separado e mais tarde, removê-la. Proponha isso antes de escalar.

**O efeito externo é inevitável** (a task existe justamente para emitir a nota, enviar a remessa). Classe IRREVERSÍVEL. O plano de reversão passa a ser **plano de contenção**: como parar o disparo no meio, como identificar o que já saiu, e qual é o procedimento de correção junto ao destinatário. Escreva isso no lugar da reversão, com o mesmo nível de detalhe.

**A task é BAIXO e a reversão parece desnecessária.** A Camada 7 não se aplica em BAIXO — exceto se algum efeito for irreversível. Rode o Passo 1 mentalmente; se qualquer item de 2 a 6 tiver resposta diferente de `nenhum`, escreva o bloco mesmo em BAIXO.
