# B6 — Validação

Conferir, item a item, o que foi construído contra o que o B1 disse que seria construído. E então falar com o usuário pela primeira vez desde a pergunta única.

Entrada: `PROJETO.md`, `PREMISSAS.md`, `MAPA.md`, `RECURSAO.md`, e o repositório. Saídas: `docs/projeto/VALIDACAO.md` e `docs/projeto/RELATORIO.md`.

O B6 fecha o arco: o prodx que abriu o projeto volta, agora como auditor. É o mesmo movimento da F5 do sprintx e do `mergex-check` — **quem valida não é quem construiu**, e o valor da conferência vem exatamente daí.

## A regra que governa a etapa

**O B6 confere, não conserta.** Nada de código é escrito aqui. Item não atendido vira feature nova (volta ao B3) ou pendência declarada — nunca um remendo de última hora.

E confere contra **evidência no repositório**, não contra artefato. Um `MAPA.md` dizendo `entregue` não é prova de que a feature existe; o PR aberto com a suíte verde é. Artefato que afirma sem evidência é a falha que este método inteiro existe para evitar.

## Passo 1 — Montar a lista de conferência

Cada item vira uma linha verificável, de três fontes:

| Fonte | Vira |
|---|---|
| `PROJETO.md`, "o que foi pedido" | um item por linha da seção |
| `PROJETO.md`, "o que foi descoberto" | um item por lacuna que virou requisito |
| `PROJETO.md`, critérios de aceite de negócio | um item por critério |
| `PREMISSAS.md` | um item por premissa, exceto as de estilo puro |
| `MAPA.md` | um item por feature |

A conferência das premissas é a mais importante do B6, e a mais fácil de pular por parecer burocrática. Uma premissa de segurança registrada que nunca virou código é a pior falha possível deste método: ela documenta uma proteção que não existe, e alguém vai confiar nela.

## Passo 2 — Conferir cada item

Para cada linha, o buildx procura a evidência e registra uma de quatro conclusões.

| Conclusão | Significa | O que exige |
|---|---|---|
| `atendido` | existe no código, com teste que o cobre | caminho do arquivo e do teste |
| `parcial` | existe, mas incompleto ou sem teste | o que existe e o que falta |
| `nao_atendido` | não existe | por que — feature bloqueada, pendência, esquecimento |
| `descartado` | o B1 registrou como não aplicável | a linha de "considerado e descartado" |

**O que conta como evidência:**

- **funcionalidade** → o arquivo que a implementa **e** o teste que a verifica. Código sem teste é `parcial`, nunca `atendido`.
- **premissa de segurança** → o código que a realiza, e o teste que prova que a proteção funciona. Uma verificação de permissão sem teste que tente violá-la não é evidência.
- **feature** → PR aberto, suíte verde, `mergex-check` PRONTO.
- **premissa de interface** → as duas variantes de tema completas, os três estados de tela tratados, responsivo, e os componentes sobre os tokens do design system — nenhuma cor literal. Aqui vale abrir a aplicação e olhar.

**Nunca aceite como evidência:** o `MAPA.md` dizer `entregue`; a task estar `concluida`; o plano prever a coisa; o nome de um arquivo sugerir o conteúdo.

## Passo 3 — Verificar o sistema de pé

O que o usuário vai fazer no primeiro minuto, e que nenhum artefato prova:

1. numa cópia limpa: instalar, migrar, semear, subir
2. entrar com o usuário de demonstração (P-5), com as credenciais que o relatório vai documentar
3. **cair no painel inicial**, com título e subtítulo próprios (P-9, E-1)
4. **cadastrar um segundo usuário** pela área de Configurações → Usuários, e entrar com ele (P-9, E-2)
5. **editar o próprio nome e e-mail** em Meu perfil (P-9, E-3)
6. **trocar a própria senha**, exigindo a atual, e entrar de novo com a nova (P-9, E-4)
7. alternar as duas variantes de tema pela barra de status, e conferir que ambas ficam completas
8. percorrer a entrega principal de cada feature
9. abrir em largura de celular

Qualquer um que falhe é `nao_atendido` de peso alto. Um sistema que não sobe numa máquina limpa não está entregue, por mais verde que esteja a suíte — e o usuário de demonstração existe justamente para tornar essa verificação possível em trinta segundos.

Os passos 3 a 6 são o **esqueleto de aplicação do P-9**, e não dependem do que o sistema faz: valem para um gestor de contratos e para uma agenda de clínica igualmente. Um sistema em que o segundo usuário só nasce por `INSERT`, ou em que ninguém troca a própria senha, é `nao_atendido` mesmo com todas as features de negócio verdes. Verifique também que **Usuários some da navegação para quem não é `admin`** e que a rota nega no servidor, não apenas na interface (L2).

## Passo 4 — O veredito

| Veredito | Quando |
|---|---|
| `aprovado` | todo item `atendido` ou `descartado`; nenhum `parcial` ou `nao_atendido` |
| `aprovado_com_pendencia` | há `parcial` ou `nao_atendido`, **todos declarados** no `RECURSAO.md`, e nenhum é premissa de segurança |
| `reprovado` | há item não atendido **não declarado**, ou uma premissa de segurança sem código, ou o sistema não sobe |

**Reprovado não é o fim.** Item reprovado e resolvível volta ao B3 como feature nova, e a cadeia roda outro ciclo — respeitando o teto do B5. Reprovado com o teto atingido: o relatório final declara, em primeiro lugar, o que está reprovado.

A regra que não se dobra: **nenhuma premissa de segurança sem código pode sair como `aprovado_com_pendencia`.** Ou vira feature e roda outro ciclo, ou o veredito é `reprovado` e o relatório abre com isso. Autenticação, autorização, validação de entrada e proteção de segredo não têm versão parcial aceitável.

Grave o `VALIDACAO.md` com `assets/TEMPLATE-VALIDACAO.md`.

## Passo 4.a — Candidatas a módulo novo

Para cada feature entregue que integrou um terceiro e tinha `modulo_disponivel: -`, registre-a como **candidata a extração** e ofereça `/modulex-extrair`.

**O buildx é o melhor gatilho de extração da suíte inteira.** Ele acabou de construir um sistema com o plano, o QA e o relatório de entrega ainda na mão — que são exatamente as fontes das 14 seções do `MODULO.md`. Seis meses depois esse material está frio e a extração custa dez vezes mais.

É a metade "escrita" do ciclo do `modulex`, e é a que sempre falta: sem ela o catálogo só é lido, envelhece e apodrece.

Dois limites, e os dois são duros:

- **Ofereça, não execute.** A extração publica conhecimento entre clientes e exige sanitização — nenhum token, domínio de cliente ou telefone real. Isso não roda em modo autônomo.
- **Feature que ainda não rodou em produção não vira módulo, vira exemplo.** O que dá valor ao módulo são as cicatrizes, e código que não rodou não tem nenhuma. Registre a candidatura e diga que falta produção.

Encontrando divergência entre um módulo injetado e a realidade — endpoint que mudou, erro novo, armadilha que não estava lá — dispare `/modulex-verificar` sobre **aquele campo**, nunca uma verificação completa.

**Sem `modulex`, ou com o catálogo não alcançável:** pule este passo. O projeto está entregue do mesmo jeito.

## Passo 5 — O relatório final

A primeira coisa que o usuário lê desde a pergunta única. Ele fechou os olhos no começo; isto é o que ele encontra ao abrir.

Escrito para quem **não acompanhou nada**. Ordem deliberada — o que exige ação vem antes do que foi feito:

```
1. O QUE VOCÊ PRECISA DECIDIR     as pendências decisao_humana
2. O QUE VOCÊ PRECISA PROVIDENCIAR as pendências recurso_externo
3. O QUE FOI DECIDIDO POR VOCÊ     as premissas, com o que invalida cada uma
4. O QUE FICOU PRONTO              features entregues, com os PRs
5. O QUE NÃO FICOU                 pendências, com o porquê
5.a CANDIDATAS A MÓDULO            o que deveria virar módulo do catálogo
6. COMO RODAR                      instalar, subir, entrar com o usuário demo
7. O QUE FAZER AGORA               revisar os PRs e fazer merge
```

Três decisões de forma que importam:

**As pendências vêm primeiro.** Um relatório que abre com onze features entregues e esconde na página três que a regra de cálculo foi chutada é desonesto na estrutura, mesmo dizendo tudo.

**As premissas vêm com o `o_que_invalida`.** É o que permite revisar vinte e três decisões em cinco minutos: o humano lê o que invalidaria cada uma e só pensa nas que se aplicam ao caso dele.

**O merge é pedido explicitamente.** O relatório termina dizendo que os PRs estão abertos, verdes e descritos, e que **fazer merge é decisão de gente**. O buildx não faz, não oferece e não sugere que faria.

Use `assets/TEMPLATE-RELATORIO.md`.

## Critério de saída do B6

- `VALIDACAO.md` existe, com todo item conferido e evidência em cada `atendido`
- toda premissa do `PREMISSAS.md` foi conferida
- o sistema sobe numa cópia limpa e o usuário de demonstração entra
- o esqueleto do P-9 responde: painel inicial, cadastro de usuários, edição de perfil e troca de senha, com a navegação da barra lateral
- nenhuma premissa de segurança está sem código
- `RELATORIO.md` existe, na ordem acima, com credenciais de demonstração documentadas
- `PROJETO.md` com `etapa: concluido`

## Erros que esta etapa comete

- **Conferir artefato em vez de código.** O `MAPA.md` diz o que o B4 achou que fez; o repositório diz o que existe. Só o segundo é evidência.
- **Aceitar código sem teste como atendido.** É `parcial`. A distinção parece pedante até a primeira regressão em produção.
- **Pular a verificação do sistema de pé.** É a única que pega o que suíte verde não pega: migration que não roda do zero, seed quebrada, build que só funciona na máquina onde foi feito.
- **Deixar premissa de segurança passar como pendência.** A regra existe porque a pressão para fechar é maior no fim, e é exatamente aí que ela não pode ceder.
- **Escrever o relatório na ordem do trabalho.** A ordem do trabalho serve a quem construiu; a ordem do relatório serve a quem vai decidir.
- **Consertar no B6.** Quem confere não conserta — no momento em que o buildx conserta, ele deixa de conferir.
