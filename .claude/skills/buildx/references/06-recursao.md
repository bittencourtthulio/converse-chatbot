# B5 — Recursão

Varrer tudo que ficou pelo caminho no B4, classificar cada pendência, e devolver ao laço o que a máquina ainda consegue resolver.

Entrada: `MAPA.md`, os `00-BLOQUEIOS.md` de todas as features, os achados da F5 e os relatórios da `mergex-check`. Saída: `docs/projeto/RECURSAO.md` atualizado, e possivelmente features novas no `MAPA.md`.

O B5 é o que separa "rodou até o fim" de "entregou". Sem ele o buildx produziria um repositório com nove features prontas e três bloqueadas, e chamaria isso de terminado.

## Passo 1 — A varredura

Colete de todas as fontes, sem filtrar nada ainda:

| Fonte | O que colher |
|---|---|
| `MAPA.md` | toda feature `bloqueada`, com o motivo |
| `docs/<slug>/00-BLOQUEIOS.md` | toda dúvida que a F6 registrou e pulou |
| `docs/<slug>/00-AUDITORIA.md` | todo achado alto que mandou voltar à F3 |
| relatório da `mergex-check` | toda verificação que devolveu BLOQUEADO |
| `PREMISSAS.md` | toda premissa marcada provisória |
| `RECURSAO.md` do ciclo anterior | toda pendência que continua aberta |

Consulte o `memox`, se instalado: uma pendência que já apareceu em ciclo anterior e voltou não é a mesma pendência — é sinal de que a tentativa anterior não resolveu, e repetir a mesma correção vai falhar igual.

## Passo 2 — A classificação

Cada pendência recebe exatamente uma classe. É a classificação que decide o destino, e ela é a única decisão real do B5.

### `trabalho_novo` — vira feature

A pendência descreve algo que ninguém construiu e que a máquina sabe construir.

Exemplos: a exclusão de conta pela LGPD não coube em nenhuma feature; a rota de saúde ficou de fora; uma tela não tratou o estado de erro.

**Destino:** feature nova no `MAPA.md`, com `origem: recursao`, e volta ao B4.

### `replanejamento` — a feature volta à F3

A feature existe, foi planejada, e o plano é que estava errado. Costuma vir de achado alto da F5, ou de `mergex-check` reprovando cobertura.

**Destino:** apague o plano da feature (`sprint-*/`, `ORQUESTRADOR.md`, `00-AUDITORIA.md`), preserve a base e as decisões da F1 e F2, e devolva a feature ao B4 — a máquina de estados do sprintx a encontra na F3.

**Teto próprio:** uma feature replanejada **duas vezes** e reprovada de novo não volta uma terceira. Vira `decisao_humana`. Um plano que a auditoria reprova três vezes tem um problema que replanejar não resolve.

### `decisao_humana` — fica para o relatório

A pendência exige alguém decidir algo que o buildx não pode decidir: regra de negócio não declarada, escolha com consequência comercial, premissa provisória que precisa de confirmação, conflito entre o que o usuário pediu e o que a premissa assumiu.

**Destino:** `RECURSAO.md`, e daí para o relatório final. **Nunca vira feature**, nunca é resolvida por chute.

Cada uma registra: qual é a decisão, quais são as opções, o que o buildx fez provisoriamente enquanto isso, e o que muda em cada opção.

### `recurso_externo` — fica para o relatório

Falta algo que não está na máquina: credencial de um serviço, acesso a um sistema, chave de API, domínio, conta em nuvem.

**Destino:** `RECURSAO.md` e relatório final, com **o que exatamente é preciso providenciar** e o que passa a funcionar quando providenciado.

O buildx nunca inventa credencial, nunca põe valor de exemplo em lugar de segredo, e nunca marca como pronto o que depende de algo que não tem.

## Passo 3 — O teto de ciclos

O ciclo B4 → B5 repete enquanto houver pendência `trabalho_novo` ou `replanejamento`. Sem teto, isso é um laço infinito com custo real.

**Teto padrão: 3 ciclos.** Declarado no frontmatter do `RECURSAO.md` desde o primeiro.

O ciclo 1 é o B4 original. Cada retorno ao B4 incrementa. Atingido o teto:

- toda pendência ainda aberta é reclassificada como `decisao_humana`, com a nota de que atingiu o teto
- o buildx segue para o B6 com o que existe
- o relatório final declara tudo, sem eufemismo

**Por que 3.** O ciclo 2 resolve o que o B3 recortou mal — é o mais produtivo. O ciclo 3 resolve o que o ciclo 2 criou. Do quarto em diante, o que sobra normalmente não é falta de trabalho, é falta de decisão: continuar gasta muito e resolve pouco.

### O detector de laço em falso

Independente do teto, pare uma linha de trabalho quando:

- a mesma pendência, com a mesma descrição, aparece em **dois ciclos seguidos**
- uma feature entra em `bloqueada` **duas vezes** pelo mesmo motivo
- o ciclo inteiro não converteu nenhuma pendência em entrega

Nos três casos, reclassifique para `decisao_humana` imediatamente, sem esperar o teto. Repetir o que não funcionou é a forma mais cara de não resolver nada.

## Passo 4 — Devolver ao laço

Se sobrou pendência `trabalho_novo` ou `replanejamento` e o teto não foi atingido:

1. acrescente as features novas ao `MAPA.md`, na posição correta de dependência — feature de recursão respeita a ordenação do B3 como qualquer outra
2. devolva as features de replanejamento ao estado `pendente`
3. incremente `ciclo_atual` no `RECURSAO.md`
4. volte ao B4

Se não sobrou nada resolvível, ou o teto foi atingido: siga para o B6.

## Critério de saída do B5

- toda pendência coletada tem exatamente uma classe
- nenhuma pendência `trabalho_novo` ou `replanejamento` continua aberta, ou o teto foi atingido
- toda `decisao_humana` registra: a decisão, as opções, o provisório adotado, o efeito de cada opção
- todo `recurso_externo` registra o que providenciar e o que destrava
- `RECURSAO.md` com frontmatter válido e os contadores certos

## Erros que esta etapa comete

- **Classificar `decisao_humana` como `trabalho_novo`.** É o erro caro: o buildx decide regra de negócio no lugar do usuário e constrói, com esmero, a coisa errada.
- **Classificar `trabalho_novo` como `decisao_humana`.** O erro preguiçoso: joga para o humano o que a máquina resolveria, e esvazia a promessa do modo autônomo.
- **Ignorar o teto por otimismo.** "Mais um ciclo e sai" é como se gasta o orçamento inteiro sem entregar.
- **Perder pendência que a `mergex-check` reprovou.** A verificação bloqueada é pendência como qualquer outra; feature sem PR não é feature entregue.
- **Deixar premissa provisória fora do relatório.** Ela é exatamente o que o humano precisa revisar, e é a mais fácil de esquecer porque não quebrou nada.
