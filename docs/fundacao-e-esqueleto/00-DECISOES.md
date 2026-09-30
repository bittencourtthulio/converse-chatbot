---
expx_schema: 1
expx_tool: sprintx
kind: decisoes
trabalho_id: fundacao-e-esqueleto
origem_buildx: plataforma-chatbot-ia
feature_id: FT-01
respondido_por: buildx
densidade: padrao
modo_construcao: autonomo
atualizado_em: 2026-09-30
decisoes:
  - id: D-00
    decisao: densidade padrao, construcao autonomo
    alternativa_descartada: null
    motivo: "respondido por buildx; PR-35 (densidade) e PROJETO.md secao Modo escolhido (autonomo total)"
    status: fechada
    bloqueante: false
  - id: D-01
    decisao: casca SaaS com barra lateral fixa, cabecalho com titulo, menu do usuario e alternador de tema, conteudo com largura maxima
    alternativa_descartada: casca de IDE com barra de atividade e barra de status
    motivo: "(HIPOTESE) PR-23 e briefing; base/interface-atual.md"
    status: fechada
    bloqueante: false
  - id: D-02
    decisao: itens do menu em lista unica em src/componentes/itens-de-menu.ts, com grupo, rotulo, rota, icone e somente_admin; icones SVG inline em src/componentes/Icones.tsx
    alternativa_descartada: itens escritos a mao em Navegacao.tsx
    motivo: "(HIPOTESE) PR-23 e briefing (features acrescentam item sem tocar no layout); mapa da FT-01 diz que features acrescentam item a barra lateral"
    status: fechada
    bloqueante: false
  - id: D-03
    decisao: tema resolvido por script inline antes da pintura (escolha salva, senao prefers-color-scheme), gravado em data-theme; alternador renderiza os dois icones e o CSS mostra o certo, sem depender de estado do cliente na primeira pintura
    alternativa_descartada: tema padrao escuro no servidor com rotulo do botao trocado apos hidratar
    motivo: "(HIPOTESE) PR-23 (claro e escuro, sem flash); base/interface-atual.md registra risco de divergencia na hidratacao"
    status: fechada
    bloqueante: false
  - id: D-04
    decisao: tokens semanticos novos em src/estilos/tokens.css (superficies, texto, borda, destaque indigo, estados, sombras, raios 8 a 12px, fonte de sistema com Inter na frente e fallback, sem baixar fonte); tema escuro por data-theme e por media query, claro como base; teste automatico de contraste 4,5:1 sobre o arquivo de tokens
    alternativa_descartada: manter os tokens do VS Code
    motivo: "(HIPOTESE) PR-23; P-6 invalidado no PREMISSAS.md; contraste verificavel evita reprovacao subjetiva"
    status: fechada
    bloqueante: false
  - id: D-05
    decisao: abaixo de 768px a barra lateral vira gaveta aberta por botao de menu no cabecalho, com fundo escurecido, fecha por Esc, clique fora ou ao navegar; alvos de toque de 44px; foco visivel por anel de contorno em toda a interface
    alternativa_descartada: classe gaveta-aberta do template, que nenhum componente aplicava
    motivo: "(HIPOTESE) PR-23; base/interface-atual.md registra gaveta sem gatilho"
    status: fechada
    bloqueante: false
  - id: D-06
    decisao: estados de toda tela do sistema: vazio (componente EstadoVazio), carregando (loading.tsx com esqueleto) e erro (error.tsx com botao Tentar de novo, sem detalhe tecnico)
    alternativa_descartada: estados so em cada tela
    motivo: "(HIPOTESE) PR-23 (tres estados em toda tela) e regra de design das instrucoes do B4; PR-21 (erro sem vazar detalhe)"
    status: fechada
    bloqueante: false
  - id: D-07
    decisao: painel mantem titulo Painel e subtitulo proprio, com corpo em estado vazio Ainda nao ha o que mostrar; o teste de rotas acompanha o novo texto
    alternativa_descartada: manter o paragrafo vazio do template
    motivo: "(HIPOTESE) briefing item 12 e MAPA.md FT-01 (painel preenchido pelas proximas features)"
    status: fechada
    bloqueante: false
  - id: D-08
    decisao: nome do produto em ambiente.nomeDoProduto lido de APP_NAME com padrao Converse (nunca obrigatoria), usado no logotipo, no title da pagina e no login
    alternativa_descartada: variavel obrigatoria
    motivo: "(HIPOTESE) PR-03; CONVENCOES.md secao Configuracao (ponto unico src/lib/ambiente.ts); build nao pode falhar sem a variavel (base/ambiente-e-configuracao.md)"
    status: fechada
    bloqueante: false
  - id: D-09
    decisao: modulo src/lib/limite-de-uso.ts com janela deslizante em memoria, fabrica criarLimitador com relogio injetavel e instancia padrao exportada como verificarLimite(chave, {max, janelaMs}) devolvendo {permitido, restante, reiniciaEmMs}; so registra a chamada quando permitida e apaga chaves vencidas
    alternativa_descartada: contador fixo por janela
    motivo: "(HIPOTESE) PR-16; CONVENCOES.md secao 3 (relogio injetado por parametro); reutilizado por FT-06 e FT-07"
    status: fechada
    bloqueante: false
  - id: D-10
    decisao: limite do login aplicado na acao autenticar por funcao exigirLimiteDeLogin no servico de autenticacao (5 por minuto por IP mais e-mail, 20 por minuto por IP), sem mudar a assinatura de entrar; erro 429 com mensagem em portugues; IP por src/lib/requisicao.ts (X-Forwarded-For so com TRUST_PROXY=1)
    alternativa_descartada: aplicar dentro de entrar, o que quebraria os testes existentes e a prova de rotas que faz varios logins
    motivo: "(HIPOTESE) PR-36 (valores e IP) criada nesta F2; base/autenticacao-e-sessao.md"
    status: fechada
    bloqueante: false
  - id: D-11
    decisao: cabecalhos de seguranca em next.config.ts para todas as rotas, conferidos em tests/rotas.test.ts com o servidor de producao
    alternativa_descartada: middleware por rota
    motivo: "(HIPOTESE) PR-37 criada nesta F2; base/testes-e-banco.md (servidor de producao ja sobe)"
    status: fechada
    bloqueante: false
  - id: D-12
    decisao: regra no-restricted-imports no eslint.config.mjs em tres blocos por pasta; a violacao encontrada (sessao-servidor em src/lib importando servicos e next) e corrigida movendo o arquivo para src/app/sessao-servidor.ts e atualizando os imports
    alternativa_descartada: abrir excecao na regra
    motivo: "(HIPOTESE) CONVENCOES.md secao 5 (src/lib nao importa src/servicos nem src/app); briefing manda ajustar o codigo, nao a regra; base/camadas-e-lint.md lacuna 2"
    status: fechada
    bloqueante: false
  - id: D-13
    decisao: script setup passa a ser prisma generate mais prisma migrate deploy mais db:seed; script db:push removido
    alternativa_descartada: manter db push
    motivo: "(HIPOTESE) CONVENCOES.md secao 4 (regra do setup) e PR-30"
    status: fechada
    bloqueante: false
  - id: D-14
    decisao: seed mantem as duas contas de demonstracao e a recusa em producao, agora coberta por teste; sem agente de exemplo (FT-02)
    alternativa_descartada: semear agente de exemplo agora
    motivo: "(HIPOTESE) PR-25 e MAPA.md (o agente vem com a FT-02); base/ambiente-e-configuracao.md"
    status: fechada
    bloqueante: false
  - id: D-15
    decisao: pipeline em .github/workflows/ci.yml com Node 22, npm ci, prisma generate, lint, tsc, build com DATABASE_URL e JWT_SECRET de CI, test e audit em nivel high; um teste confere a presenca desses passos
    alternativa_descartada: pipeline sem teste do proprio arquivo
    motivo: "(HIPOTESE) PR-26; CONVENCOES.md secao 2 (comandos)"
    status: fechada
    bloqueante: false
  - id: D-16
    decisao: README do projeto substitui o do template e cita as contas de demonstracao, os comandos e as tres camadas; instrucao de copiar o exemplo de ambiente e dirigida ao leitor
    alternativa_descartada: manter README do template
    motivo: "(HIPOTESE) briefing item 9; base/00-LACUNAS.md lacuna 6"
    status: fechada
    bloqueante: false
  - id: D-17
    decisao: verificacao da suite herdada em copia limpa do estado commitado fora do repositorio, e conversao das convencoes por stackx-detectar apos o codigo pronto
    alternativa_descartada: verificar so no diretorio de trabalho
    motivo: "(HIPOTESE) briefing itens 10 e 11; CONVENCOES.md (regra de conversao do B2)"
    status: fechada
    bloqueante: false
  - id: D-18
    decisao: verificacao visual em navegador tentada com as ferramentas de navegador da sessao, servidor iniciado com segredos inline; se indisponivel, registrada como nao feita
    alternativa_descartada: declarar verificado sem ver
    motivo: "(HIPOTESE) PR-23 (nao presumir acabamento) e regra de nao tocar no arquivo de segredos das instrucoes do B4"
    status: fechada
    bloqueante: false
---

# Decisões — fundacao-e-esqueleto

Todas respondidas pelo buildx (`respondido_por: buildx`), pelos quatro degraus: PROJETO.md, PREMISSAS.md, CONVENCOES.md e, sem resposta, premissa nova. Nenhuma regra de negócio ficou sem resposta; nenhum bloqueio.

## Densidade e forma de construção

**Densidade:** padrao
**Forma de construção:** autonomo

## Decisões

```
D-00 | densidade padrao, construcao autonomo | null | respondido por buildx; PR-35 e PROJETO.md (Modo escolhido)
D-01 | Casca SaaS: barra lateral fixa, cabeçalho com título, menu do usuário, alternador de tema, conteúdo com largura máxima | Casca de IDE | PR-23, briefing, base/interface-atual.md
D-02 | Itens do menu em lista única `src/componentes/itens-de-menu.ts`; ícones SVG em `src/componentes/Icones.tsx` | Itens escritos à mão em Navegacao.tsx | PR-23, briefing, MAPA.md
D-03 | Tema resolvido antes da pintura (escolha salva, senão preferência do sistema); os dois ícones renderizados e o CSS mostra o certo | Tema escuro padrão no servidor e rótulo trocado após hidratar | PR-23, base/interface-atual.md
D-04 | Tokens semânticos novos (índigo, slate, raios 8 a 12px, fonte de sistema com Inter na frente); teste automático de contraste 4,5:1 | Tokens do VS Code | PR-23
D-05 | Gaveta abaixo de 768px com botão de menu, Esc, clique fora e ao navegar; alvos de 44px; foco visível | Classe gaveta-aberta sem gatilho | PR-23, base/interface-atual.md
D-06 | Estados vazio (EstadoVazio), carregando (loading.tsx) e erro (error.tsx) para todo o sistema | Estados só por tela | PR-23, PR-21, regra de design do B4
D-07 | Painel com título e subtítulo próprios e corpo vazio "Ainda não há o que mostrar"; teste de rotas acompanha | Parágrafo vazio do template | briefing item 12, MAPA.md
D-08 | `ambiente.nomeDoProduto` lê APP_NAME, padrão Converse, nunca obrigatória; usada no logotipo, no title e no login | Variável obrigatória | PR-03, CONVENCOES (Configuração)
D-09 | `src/lib/limite-de-uso.ts`: janela deslizante, `criarLimitador` com relógio injetável, `verificarLimite(chave, {max, janelaMs})` devolve `{permitido, restante, reiniciaEmMs}` | Contador de janela fixa | PR-16, CONVENCOES seção 3
D-10 | `exigirLimiteDeLogin` no serviço de autenticação, chamado pela ação (5/min IP+e-mail, 20/min IP), IP por `src/lib/requisicao.ts`; `entrar` não muda | Limite dentro de `entrar` | PR-36 (nova)
D-11 | Cabeçalhos de segurança em next.config.ts, testados com servidor de produção | Middleware | PR-37 (nova)
D-12 | Regra no-restricted-imports em três blocos; `sessao-servidor` move de src/lib para src/app | Exceção na regra | CONVENCOES seção 5, base/camadas-e-lint.md
D-13 | `setup` = generate + migrate deploy + seed; `db:push` removido | Manter db push | CONVENCOES seção 4, PR-30
D-14 | Seed mantém duas contas e a recusa em produção, agora com teste; sem agente de exemplo | Agente de exemplo agora | PR-25, MAPA.md
D-15 | CI em .github/workflows/ci.yml, com teste que confere os passos | CI sem teste | PR-26, CONVENCOES seção 2
D-16 | README do projeto substitui o do template | Manter o do template | briefing item 9
D-17 | Suíte verificada em cópia limpa; convenções convertidas por stackx-detectar | Verificar só no diretório de trabalho | briefing itens 10 e 11
D-18 | Verificação visual tentada com ferramentas de navegador; se indisponível, registrada como não feita | Declarar verificado sem ver | PR-23
```

## Resumo do que foi assumido

Todas as decisões D-01 a D-18 foram fechadas sem resposta do usuário e por isso levam `(HIPOTESE)` no motivo do frontmatter, como manda o modo autônomo; cada uma cita PROJETO.md, PREMISSAS.md, CONVENCOES.md ou a base, e nenhuma decide regra de negócio. As três premissas novas (PR-35, PR-36, PR-37) estão em `docs/projeto/PREMISSAS.md` com origem `f2_autonoma`.

## Contradições com a base

`base/00-LACUNAS.md` lacuna 2: `src/lib/sessao-servidor.ts` viola a direção das camadas da convenção. Resolvida em D-12 movendo o arquivo.

## Pendências

Nenhuma pendência.
