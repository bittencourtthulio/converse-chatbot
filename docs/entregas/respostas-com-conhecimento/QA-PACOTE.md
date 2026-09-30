---
expx_schema: 1
expx_tool: sprintx
kind: qa_pacote
trabalho_id: respostas-com-conhecimento
origem_buildx: plataforma-chatbot-ia
feature_id: FT-05
casos: 10
atualizado_em: 2026-09-30
---

# Pacote de QA — Respostas com base no conhecimento (FT-05)

## 1. O que mudou

O agente que tem ao menos uma fonte "Pronto" na aba "Conhecimento" passa a responder a partir dessas fontes. Na aba "Testar", abaixo de cada resposta aparece "Fontes": as fontes citadas em destaque, as apenas consultadas numa seção recolhida, e o trecho usado ao tocar na fonte. Os números `[1]`, `[2]` no texto da resposta viram pequenos botões que abrem a fonte. Quando a base não cobre a pergunta, o agente é instruído a dizer que não encontrou a informação, em vez de inventar. Na aba "Conhecimento" há um cartão novo, "Testar busca", que mostra os trechos que o agente enxergaria para uma pergunta, sem gastar crédito. Agente sem nenhuma fonte pronta continua como antes.

## 2. Roteiro de teste manual

Os casos partem de uma instalação preparada como na seção 5, com o servidor simulado do OpenRouter (a resposta dele é sempre a mesma frase sobre troca em sete dias, citando `[1]`: o que se confere aqui é a tela e o que é enviado, não a qualidade da resposta). Use uma das contas de demonstração criadas pela instalação (e-mail e senha no README).

**Caso 1 — Testar busca com resultado**
1. Entre, abra "Agentes", o "Assistente de exemplo", aba "Conhecimento".
2. Desça até o cartão "Testar busca". Escreva "Qual o prazo de troca?" e toque em "Buscar" (ou Enter).
- Deve acontecer: aparece, por um instante, "Buscando na base…"; depois uma lista com o trecho da fonte "Política de troca e horário da Loja Exemplo", com "Trecho N · pontuação" ao lado do título e o texto do trecho.
- Falha se: não aparece nada, aparece erro, ou o texto mostrado não é da fonte.

**Caso 2 — Testar busca sem resultado, vazio e erro**
1. Busque "Qual a capital da Austrália?". Depois busque só "Olá".
2. Toque em "Buscar" com o campo vazio.
3. Com o servidor parado ou sem internet local, busque algo.
- Deve acontecer: nos dois primeiros, o estado "Nenhum trecho encontrado", explicando que o agente responderia que não encontrou; campo vazio mostra "Escreva uma pergunta." em faixa vermelha; com o servidor fora, uma faixa vermelha de erro em português.
- Falha se: "Olá" traz trechos, o campo vazio envia a busca, ou aparece texto técnico.

**Caso 3 — Busca ignora acento e caixa**
1. Busque "POLITICA DE TROCA" e depois "horário de atendimento".
- Deve acontecer: os dois acham o trecho da fonte de exemplo.
- Falha se: um deles não acha por causa do acento ou das maiúsculas.

**Caso 4 — Resposta com fontes na aba Testar**
1. Cadastre a chave de teste do OpenRouter simulado em Configurações, Integrações (seção 5). Abra a aba "Testar" do "Assistente de exemplo" e pergunte "Qual o prazo de troca?".
- Deve acontecer: a resposta chega aos poucos; no texto, `[1]` aparece como um pequeno botão; abaixo, "Fontes" com um chip da fonte "Política de troca e horário da Loja Exemplo" (com `[1]`, e mais números se houver), em destaque.
- Falha se: os colchetes aparecem como texto comum, não há "Fontes", ou o chip não é um botão.

**Caso 5 — Abrir o trecho e a seção recolhida**
1. No caso anterior, toque no chip da fonte. Depois toque em um `[1]` do texto.
2. Antes do caso 4, adicione na aba "Conhecimento" um texto "Garantia dos produtos" com a palavra "troca" (por exemplo, "A garantia cobre defeitos por 12 meses e a troca por defeito é gratuita"), espere ficar "Pronto" e repita a pergunta.
- Deve acontecer: tocar no chip abre e fecha os trechos usados ("Trecho 1 · [1]" com o texto resumido); tocar em `[1]` abre o trecho e leva o foco ao chip; a segunda fonte aparece em "Consultada, sem citação (1)", recolhida, e abre ao tocar.
- Falha se: o trecho não abre, o foco some, ou a fonte não citada aparece em destaque.

**Caso 6 — Recarregar a conversa**
1. Recarregue a página da aba "Testar".
- Deve acontecer: a conversa volta com as mesmas referências `[1]` e as mesmas fontes abaixo da resposta.
- Falha se: as fontes somem ao recarregar. Toque em "Nova conversa": tudo zera.

**Caso 7 — Pergunta fora da base e saudação (estrutura do prompt)**
1. Pergunte "Qual a capital da Austrália?" e depois "Olá!".
- Deve acontecer: as respostas chegam (o simulado responde sempre a mesma frase) e **não** aparecem "Fontes" abaixo delas.
- Falha se: aparecem fontes inventadas. Observação: que o modelo real diga "não encontrei" só se confere com o provedor de verdade (seção 7).

**Caso 8 — Agente sem fonte pronta**
1. Crie um agente novo (Agentes, Novo agente), sem adicionar fontes, e converse com ele na aba "Testar".
- Deve acontecer: responde como antes desta entrega, sem "Fontes" e sem mudança de comportamento.
- Falha se: aparece erro, ou o agente se recusa a responder por "não ter base".

**Caso 9 — Sem sessão e agente inexistente**
1. Saia do sistema e, sem entrar, tente o "Testar busca" (a aba já exige login). Entre e abra um agente que não existe.
- Deve acontecer: sem login, a tela de entrada; agente inexistente, a página "não encontrado".
- Falha se: a busca funciona sem login.

**Caso 10 — Temas claro e escuro e celular**
1. Alterne entre o tema claro e o escuro e confira a aba "Testar" com fontes e o cartão "Testar busca".
2. Repita num celular (ou com a janela a cerca de 375 pixels).
- Deve acontecer: textos legíveis nos dois temas, chips e referências com contraste, o campo e o botão de "Testar busca" empilhados no celular, botões com tamanho confortável para o toque, sem rolagem horizontal.
- Falha se: texto ilegível, chip cortado, rolagem para o lado.

## 3. O que observar de colateral

- Aba "Conhecimento": envio de arquivos, colar texto, excluir e "Ver conteúdo" continuam iguais; excluir uma fonte a tira também da busca.
- Aba "Testar": enviar, Parar, Nova conversa e erros do provedor continuam iguais.
- Outro agente: a busca de um agente nunca mostra trechos de outro.
- Uma fonte em "Erro" ou ainda "Na fila" não aparece no "Testar busca" nem nas respostas.
- Esta lista foi feita a partir dos arquivos alterados, sem análise de impacto formal; pode estar incompleta.

## 4. Dado de teste sugerido

Tudo fictício, da "Loja Exemplo": a fonte de exemplo semeada (política de troca, horário, entrega e pagamento) e o texto "Garantia dos produtos" do caso 5. Perguntas úteis: "Qual o prazo de troca?", "horário de atendimento", "frete grátis", "POLITICA DE TROCA", "Qual a capital da Austrália?" (fora da base) e "Olá" (saudação).

## 5. Ambiente e estado inicial

- **Onde testar:** instalação local, sem internet e sem gastar crédito.
- **Preparação:** `npm install`; copiar o exemplo de configuração para o arquivo de configuração local e preencher `JWT_SECRET` e `ENCRYPTION_KEY` (como no exemplo); `npm run setup`; `npm run build`. Em um terminal, `npx tsx tests/apoio/servir-falso.ts` (imprime a `OPENROUTER_BASE_URL` e a chave de teste); em outro, subir o sistema com essa `OPENROUTER_BASE_URL` (`npm run start`). Em Configurações, Integrações, cadastrar a chave de teste impressa. Observação: o simulado padrão responde com uma frase de exemplo sem `[1]`; para ver as fontes "citadas" use um simulado cuja resposta traga `[1]` (o roteiro de verificação visual em `docs/respostas-com-conhecimento/VERIFICACAO-VISUAL.md` descreve o que foi usado). Com o simulado padrão, as fontes aparecem como "consultadas" (seção recolhida) e os casos 4 e 5 se conferem por essa seção.
- **Estado inicial:** contas de demonstração e o agente "Assistente de exemplo" com uma fonte pronta.
- **O que precisa estar ligado:** o sistema e o simulado do OpenRouter.

## 6. Critério objetivo de aprovação e de reprovação

APROVADO quando: os 10 casos passam; o "Testar busca" acha o trecho certo com e sem acento e devolve vazio para "Olá" e para pergunta fora da base (casos 1 a 3); as Fontes aparecem abaixo das respostas de um agente com base, abrem o trecho e voltam ao recarregar (casos 4 a 6); um agente sem fonte pronta não mostra Fontes (casos 7 e 8); nada é buscado sem login (caso 9).

REPROVADO quando: qualquer caso falha, uma fonte de um agente aparece em outro, um texto técnico ou caminho do servidor aparece na tela, a busca funciona sem login, ou a página rola para o lado no celular.

## 7. O que NÃO faz parte desta entrega

- Conferir que o modelo de verdade cita `[n]`, trata o conteúdo da base como dado (ignora "ignore as instruções anteriores" escrito dentro de um arquivo) e diz que não encontrou a informação: só a estrutura do prompt é provada nos testes; o comportamento do modelo real depende do provedor e da chave.
- Busca por sentido (embeddings), OCR e edição do texto das fontes: fora do escopo.
- Chat embutido no site e Telegram: entregas próprias (herdam este comportamento).
- Histórico e lista de conversas de todos os canais: entrega própria.
- Verificação visual a 375 pixels reais, do tema claro da aba "Testar" com fontes e da leitura por leitor de tela: não puderam ser vistas na verificação do desenvolvimento; vale conferi-las no caso 10.
