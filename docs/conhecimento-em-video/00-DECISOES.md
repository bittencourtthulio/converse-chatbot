---
expx_schema: 1
expx_tool: sprintx
kind: decisoes
trabalho_id: conhecimento-em-video
origem_buildx: plataforma-chatbot-ia
feature_id: FT-08
respondido_por: buildx
densidade: padrao
modo_construcao: autonomo
atualizado_em: 2026-09-30
decisoes:
  - id: D-00
    decisao: "densidade padrao, construcao autonomo"
    alternativa_descartada: "densidade mvp ou profundo"
    motivo: "respondido por buildx; PR-35 e PROJETO.md (modo autonomo total)"
    status: fechada
    bloqueante: false
  - id: D-01
    decisao: "campos novos em Fonte (progresso Int?, etapa String?, duracaoSegundos Int?, urlOrigem String?) e modeloDeTranscricao String? em ConfiguracaoDoWorkspace, por uma migration que so acrescenta; tipos video e youtube ja reservados; audio puro tambem usa tipo video"
    alternativa_descartada: "tabela nova para jobs de midia; tipo audio separado"
    motivo: "(HIPOTESE) PR-76; CONVENCOES secao 4 (migracao so acrescenta); base/dados-ambiente-e-integracoes.md"
    status: fechada
    bloqueante: false
  - id: D-02
    decisao: "modelo de transcricao resolvido por: banco, depois OPENROUTER_MODELO_TRANSCRICAO, depois constante MODELO_DE_TRANSCRICAO_PADRAO (google/gemini-2.5-flash); campo livre validado, so admin altera; qualquer usuario so le o modelo em uso"
    alternativa_descartada: "lista de modelos filtrada por audio; modelo por agente"
    motivo: "(HIPOTESE) PR-73; base/openrouter-audio.md (lista nao informa modalidade, lacuna 4); PR-12"
    status: fechada
    bloqueante: false
  - id: D-03
    decisao: "upload em streaming por POST /api/agentes/[id]/fontes/video?nome= com corpo bruto escrito em original.parcial e renomeado, contagem de bytes, 413 por Content-Length e por contagem, assinatura real dos primeiros bytes, 415 e 422; arquivo antes da linha; falha apaga o diretorio"
    alternativa_descartada: "request.formData(); validar so extensao"
    motivo: "(HIPOTESE) PR-71; PR-10, PR-13, PR-47; base/fila-fontes-e-armazenamento.md (formData carrega tudo em memoria)"
    status: fechada
    bloqueante: false
  - id: D-04
    decisao: "Armazenamento ganha gravarDeStream (stream, teto, conferencia dos primeiros bytes), caminho absoluto interno do original, diretorios audio e segmentos dentro da pasta da fonte, e limpeza; ids continuam de alfabeto fechado"
    alternativa_descartada: "gravar o corpo inteiro em memoria; caminho vindo do nome do arquivo"
    motivo: "(HIPOTESE) PR-47 e PR-71; CONVENCOES secao 5 (armazenamento so com ids gerados); base/fila-fontes-e-armazenamento.md"
    status: fechada
    bloqueante: false
  - id: D-05
    decisao: "midia.ts: sondar, extrairAudio, dividirEmSegmentos e verificarMidia por spawn sem shell, prazos por processo, saida de erro com teto e nunca mostrada, binario ausente com a mensagem do briefing; MP3 mono 16 kHz 32 kbps; segmentos de 600 s sem reencodar; limite MAX_VIDEO_MINUTOS"
    alternativa_descartada: "um unico ffmpeg que extrai e divide; shell com string de comando"
    motivo: "(HIPOTESE) PR-72; base/midia-ffmpeg.md (comandos provados numa senoide de 25 s)"
    status: fechada
    bloqueante: false
  - id: D-06
    decisao: "transcreverAudio em src/lib/openrouter.ts, sem stream, prazo total 5 min por parte, instrucao fixa, transcricao_vazia como erro, retry de ate 2 vezes so no transitorio"
    alternativa_descartada: "stream; resumir a fala; repetir erro de chave ou saldo"
    motivo: "(HIPOTESE) PR-73; PR-22 e PR-38; base/openrouter-audio.md (prazo de 30 s da conversa nao basta)"
    status: fechada
    bloqueante: false
  - id: D-07
    decisao: "fila com duas raias (leve: texto, arquivo e youtube com concorrencia 2; midia: video com concorrencia 1) no mesmo trabalhador generalizado por tipos; andamento por updateMany condicional a processando; parciais em segmentos/NN.txt; junta com marcador de tempo; limpa audio e segmentos ao concluir e mantem o original; falha de parte vira erro com a parte e mantem segmentos; excluir fonte para as partes seguintes"
    alternativa_descartada: "concorrencia unica; nova fila para video; apagar parciais no erro"
    motivo: "(HIPOTESE) PR-74; PR-48; base/fila-fontes-e-armazenamento.md (concorrencia unica e processar le o original inteiro)"
    status: fechada
    bloqueante: false
  - id: D-08
    decisao: "a transcricao de midia vive em src/servicos/transcricao-de-midia.ts (usa midia.ts e openrouter.ts), chamada por fontes-fila.ts; a fila entrega o texto ao mesmo normalizarTexto, dividirEmTrechos e gravarResultado; progresso nunca volta atras"
    alternativa_descartada: "logica de midia dentro do fontes-fila.ts"
    motivo: "(HIPOTESE) CONVENCOES secao 5 (servico atras de lib); PR-74"
    status: fechada
    bloqueante: false
  - id: D-09
    decisao: "YouTube em src/lib/youtube.ts: id por 4 formas de URL, pagina em YOUTUBE_BASE, faixas por preferencia, json3 e XML, SSRF por host fixo, baseUrl so de *.youtube.com, um redirect, prazo 15 s, teto 3 MB e 5 MB; a fila do tipo youtube busca as legendas, sem original em disco; titulo do video substitui o provisorio; marcador a cada cerca de 60 s; sem legendas erro claro"
    alternativa_descartada: "API oficial; baixar o video e transcrever; seguir qualquer URL de legenda"
    motivo: "(HIPOTESE) PR-75; PR-09; base/youtube-legendas.md (mecanismo nao oficial, lacunas 1 e 2)"
    status: fechada
    bloqueante: false
  - id: D-10
    decisao: "a fragilidade do YouTube e a ausencia de formato oficial viram lacuna de convencao e premissa (PR-75), com teste contra servidor simulado e fixture"
    alternativa_descartada: "tratar como detalhe sem registro"
    motivo: "(HIPOTESE) briefing item 6; base/00-LACUNAS.md itens 1 e 2"
    status: fechada
    bloqueante: false
  - id: D-11
    decisao: "handlers finos: video e youtube em src/app/api/agentes/[id]/fontes/{video,youtube}/route.ts reutilizando exigirSessao e erroEmJson; servico em src/servicos/fontes.ts (adicionarVideo, adicionarYoutube) com zod; visaoDaFonte ganha os quatro campos"
    alternativa_descartada: "logica no handler"
    motivo: "(HIPOTESE) PR-76; CONVENCOES secao 5 (handler fino); PR-49"
    status: fechada
    bloqueante: false
  - id: D-12
    decisao: "UI: opcao Video em opcoes-de-fonte.ts e painel com duas abas internas (ZonaDeVideo e FormularioDoYoutube), logica pura em video-logica.ts, envio por XMLHttpRequest com corpo bruto, um arquivo por vez, aviso de creditos com o modelo em uso; LinhaDeFonte com progresso, etapa, duracao e link de origem; ListaDeTrechos com duracao; icone novo video"
    alternativa_descartada: "fetch com stream sem progresso; varios videos de uma vez"
    motivo: "(HIPOTESE) PR-76 e PR-49; CONVENCOES secao 5 (opcao de fonte em lista unica; tela sem navegador em modulo puro); base/dados-ambiente-e-integracoes.md"
    status: fechada
    bloqueante: false
  - id: D-13
    decisao: "Configuracoes > Integrações ganha o painel Modelo de transcricao (admin) com padrao visivel, salvar e restaurar o padrao, por acao de servidor em acoes.ts; servico em integracoes.ts"
    alternativa_descartada: "pagina nova de configuracao"
    motivo: "(HIPOTESE) PR-73 e PR-12; CONVENCOES secao 5 (acao em acoes.ts, guarda admin)"
    status: fechada
    bloqueante: false
  - id: D-14
    decisao: "observabilidade: um evento JSON transcricao_falhou (fonteId, agenteId, parte, codigo) sem conteudo de audio ou texto, alem do fonte_falhou existente; etapa e progresso sao o estado visivel; sem metrica nova"
    alternativa_descartada: "gravar texto transcrito no log"
    motivo: "(HIPOTESE) PR-21 e PR-48; CONVENCOES secao 6 (log nunca com conteudo)"
    status: fechada
    bloqueante: false
  - id: D-15
    decisao: "resiliencia: ffmpeg ausente, sem audio, duracao acima do limite e arquivo corrompido terminam em erro claro e nao repetem; falha transitoria do provedor repete ate 2 vezes por parte; reinicio devolve a pendente e retoma pelos segmentos; excluir durante o trabalho interrompe sem gastar mais credito"
    alternativa_descartada: "tentar para sempre; descartar parciais"
    motivo: "(HIPOTESE) PR-74 e PR-22; PR-48"
    status: fechada
    bloqueante: false
  - id: D-16
    decisao: "ambiente: MAX_VIDEO_MB, MAX_VIDEO_MINUTOS, FFMPEG_PATH, FFPROBE_PATH, OPENROUTER_MODELO_TRANSCRICAO e YOUTUBE_BASE so em ambiente.ts, documentadas no .env.example e README; EXIGIR_FFMPEG lida so pelo apoio de teste; CI instala ffmpeg e liga EXIGIR_FFMPEG=1; nenhum segredo novo"
    alternativa_descartada: "ler process.env em midia.ts"
    motivo: "(HIPOTESE) PR-77; CONVENCOES secao 6 (configuracao so em ambiente.ts); PR-26"
    status: fechada
    bloqueante: false
  - id: D-17
    decisao: "testes: simulado do OpenRouter reconhece input_audio com transcricao por parte, falha e latencia; simulado do YouTube com paginas e legendas de fixture; midia gerada por lavfi; testes com ffmpeg com skipIf localmente e falha no CI; teste de stream contra next start; nenhum teste na rede real; limite de 500 MB provado com limite baixo"
    alternativa_descartada: "mock de modulo; arquivo de video em fixture binaria"
    motivo: "(HIPOTESE) PR-77; CONVENCOES secao 3 (HTTP de saida simulado); base/upload-testes-e-ci.md (lacuna 6)"
    status: fechada
    bloqueante: false
  - id: D-18
    decisao: "pronto do usuario: sobe um audio ou video gerado com ffmpeg, ve a barra de envio e a etapa, a fonte vira pronto, cola um link do YouTube simulado, e a busca do agente acha o trecho; o que nao pode ser visto (transcricao real, YouTube real, 375 px) fica registrado"
    alternativa_descartada: "exigir transcricao real na entrega"
    motivo: "PROJETO.md (criterios: subo um video e vejo passar de processando para pronto; o agente responde com base no que subi); briefing item 9"
    status: fechada
    bloqueante: false
  - id: D-19
    decisao: "lacunas da F1 tratadas: 1 e 2 (YouTube) por fixture e PR-75; 3 e 4 (modelos de audio) por modelo livre com padrao; 5 (resposta vazia) por transcricao_vazia; 6 (corpo em stream no next start) por teste de producao; 7 (versao do ffmpeg) por instalacao do pacote sem fixar versao; 8 sem memox"
    alternativa_descartada: "deixar lacuna sem tratamento"
    motivo: "(HIPOTESE) base/00-LACUNAS.md; PR-71 a PR-75"
    status: fechada
    bloqueante: false
  - id: D-20
    decisao: "FT-11 recebe: verificarMidia() para o health check, ffmpeg como dependencia do conteiner, pasta de cada fonte com original, original.parcial (lixo de upload interrompido), audio/ (temporario) e segmentos/ (parciais), que o backup pode ignorar e a limpeza pode apagar; limpeza de orfaos no boot fica como lacuna"
    alternativa_descartada: "implementar backup ou saude nesta feature"
    motivo: "(HIPOTESE) MAPA.md (FT-11 e nao-objetivos do briefing); PR-20 e PR-21"
    status: fechada
    bloqueante: false
---

# Decisões — conhecimento-em-video

> Respondidas por buildx (modo autônomo total): cada decisão cita a fonte (PROJETO.md, PREMISSAS.md, CONVENCOES.md ou a premissa nova PR-71 a PR-77 criada nesta F2). Nenhuma regra de negócio ficou sem resposta; sem pendência.

## Densidade e forma de construção

**Densidade:** padrao
**Forma de construção:** autonomo (respondido por buildx; o usuário escolheu o modo autônomo total)

## Decisões

```
D-00 | densidade padrao, construcao autonomo | densidade mvp ou profundo | respondido por buildx; PR-35 e PROJETO.md (modo autonomo total)
D-01 | campos novos em Fonte (progresso Int?, etapa String?, duracaoSegundos Int?, urlOrigem String?) e modeloDeTranscricao String? em ConfiguracaoDoWorkspace, por uma migration que so acrescenta; tipos video e youtube ja reservados; audio puro tambem usa tipo video | tabela nova para jobs de midia; tipo audio separado | (HIPOTESE) PR-76; CONVENCOES secao 4 (migracao so acrescenta); base/dados-ambiente-e-integracoes.md
D-02 | modelo de transcricao resolvido por: banco, depois OPENROUTER_MODELO_TRANSCRICAO, depois constante MODELO_DE_TRANSCRICAO_PADRAO (google/gemini-2.5-flash); campo livre validado, so admin altera; qualquer usuario so le o modelo em uso | lista de modelos filtrada por audio; modelo por agente | (HIPOTESE) PR-73; base/openrouter-audio.md (lista nao informa modalidade, lacuna 4); PR-12
D-03 | upload em streaming por POST /api/agentes/[id]/fontes/video?nome= com corpo bruto escrito em original.parcial e renomeado, contagem de bytes, 413 por Content-Length e por contagem, assinatura real dos primeiros bytes, 415 e 422; arquivo antes da linha; falha apaga o diretorio | request.formData(); validar so extensao | (HIPOTESE) PR-71; PR-10, PR-13, PR-47; base/fila-fontes-e-armazenamento.md (formData carrega tudo em memoria)
D-04 | Armazenamento ganha gravarDeStream (stream, teto, conferencia dos primeiros bytes), caminho absoluto interno do original, diretorios audio e segmentos dentro da pasta da fonte, e limpeza; ids continuam de alfabeto fechado | gravar o corpo inteiro em memoria; caminho vindo do nome do arquivo | (HIPOTESE) PR-47 e PR-71; CONVENCOES secao 5 (armazenamento so com ids gerados); base/fila-fontes-e-armazenamento.md
D-05 | midia.ts: sondar, extrairAudio, dividirEmSegmentos e verificarMidia por spawn sem shell, prazos por processo, saida de erro com teto e nunca mostrada, binario ausente com a mensagem do briefing; MP3 mono 16 kHz 32 kbps; segmentos de 600 s sem reencodar; limite MAX_VIDEO_MINUTOS | um unico ffmpeg que extrai e divide; shell com string de comando | (HIPOTESE) PR-72; base/midia-ffmpeg.md (comandos provados numa senoide de 25 s)
D-06 | transcreverAudio em src/lib/openrouter.ts, sem stream, prazo total 5 min por parte, instrucao fixa, transcricao_vazia como erro, retry de ate 2 vezes so no transitorio | stream; resumir a fala; repetir erro de chave ou saldo | (HIPOTESE) PR-73; PR-22 e PR-38; base/openrouter-audio.md (prazo de 30 s da conversa nao basta)
D-07 | fila com duas raias (leve: texto, arquivo e youtube com concorrencia 2; midia: video com concorrencia 1) no mesmo trabalhador generalizado por tipos; andamento por updateMany condicional a processando; parciais em segmentos/NN.txt; junta com marcador de tempo; limpa audio e segmentos ao concluir e mantem o original; falha de parte vira erro com a parte e mantem segmentos; excluir fonte para as partes seguintes | concorrencia unica; nova fila para video; apagar parciais no erro | (HIPOTESE) PR-74; PR-48; base/fila-fontes-e-armazenamento.md (concorrencia unica e processar le o original inteiro)
D-08 | a transcricao de midia vive em src/servicos/transcricao-de-midia.ts (usa midia.ts e openrouter.ts), chamada por fontes-fila.ts; a fila entrega o texto ao mesmo normalizarTexto, dividirEmTrechos e gravarResultado; progresso nunca volta atras | logica de midia dentro do fontes-fila.ts | (HIPOTESE) CONVENCOES secao 5 (servico atras de lib); PR-74
D-09 | YouTube em src/lib/youtube.ts: id por 4 formas de URL, pagina em YOUTUBE_BASE, faixas por preferencia, json3 e XML, SSRF por host fixo, baseUrl so de *.youtube.com, um redirect, prazo 15 s, teto 3 MB e 5 MB; a fila do tipo youtube busca as legendas, sem original em disco; titulo do video substitui o provisorio; marcador a cada cerca de 60 s; sem legendas erro claro | API oficial; baixar o video e transcrever; seguir qualquer URL de legenda | (HIPOTESE) PR-75; PR-09; base/youtube-legendas.md (mecanismo nao oficial, lacunas 1 e 2)
D-10 | a fragilidade do YouTube e a ausencia de formato oficial viram lacuna de convencao e premissa (PR-75), com teste contra servidor simulado e fixture | tratar como detalhe sem registro | (HIPOTESE) briefing item 6; base/00-LACUNAS.md itens 1 e 2
D-11 | handlers finos: video e youtube em src/app/api/agentes/[id]/fontes/{video,youtube}/route.ts reutilizando exigirSessao e erroEmJson; servico em src/servicos/fontes.ts (adicionarVideo, adicionarYoutube) com zod; visaoDaFonte ganha os quatro campos | logica no handler | (HIPOTESE) PR-76; CONVENCOES secao 5 (handler fino); PR-49
D-12 | UI: opcao Video em opcoes-de-fonte.ts e painel com duas abas internas (ZonaDeVideo e FormularioDoYoutube), logica pura em video-logica.ts, envio por XMLHttpRequest com corpo bruto, um arquivo por vez, aviso de creditos com o modelo em uso; LinhaDeFonte com progresso, etapa, duracao e link de origem; ListaDeTrechos com duracao; icone novo video | fetch com stream sem progresso; varios videos de uma vez | (HIPOTESE) PR-76 e PR-49; CONVENCOES secao 5 (opcao de fonte em lista unica; tela sem navegador em modulo puro); base/dados-ambiente-e-integracoes.md
D-13 | Configuracoes > Integrações ganha o painel Modelo de transcricao (admin) com padrao visivel, salvar e restaurar o padrao, por acao de servidor em acoes.ts; servico em integracoes.ts | pagina nova de configuracao | (HIPOTESE) PR-73 e PR-12; CONVENCOES secao 5 (acao em acoes.ts, guarda admin)
D-14 | observabilidade: um evento JSON transcricao_falhou (fonteId, agenteId, parte, codigo) sem conteudo de audio ou texto, alem do fonte_falhou existente; etapa e progresso sao o estado visivel; sem metrica nova | gravar texto transcrito no log | (HIPOTESE) PR-21 e PR-48; CONVENCOES secao 6 (log nunca com conteudo)
D-15 | resiliencia: ffmpeg ausente, sem audio, duracao acima do limite e arquivo corrompido terminam em erro claro e nao repetem; falha transitoria do provedor repete ate 2 vezes por parte; reinicio devolve a pendente e retoma pelos segmentos; excluir durante o trabalho interrompe sem gastar mais credito | tentar para sempre; descartar parciais | (HIPOTESE) PR-74 e PR-22; PR-48
D-16 | ambiente: MAX_VIDEO_MB, MAX_VIDEO_MINUTOS, FFMPEG_PATH, FFPROBE_PATH, OPENROUTER_MODELO_TRANSCRICAO e YOUTUBE_BASE so em ambiente.ts, documentadas no .env.example e README; EXIGIR_FFMPEG lida so pelo apoio de teste; CI instala ffmpeg e liga EXIGIR_FFMPEG=1; nenhum segredo novo | ler process.env em midia.ts | (HIPOTESE) PR-77; CONVENCOES secao 6 (configuracao so em ambiente.ts); PR-26
D-17 | testes: simulado do OpenRouter reconhece input_audio com transcricao por parte, falha e latencia; simulado do YouTube com paginas e legendas de fixture; midia gerada por lavfi; testes com ffmpeg com skipIf localmente e falha no CI; teste de stream contra next start; nenhum teste na rede real; limite de 500 MB provado com limite baixo | mock de modulo; arquivo de video em fixture binaria | (HIPOTESE) PR-77; CONVENCOES secao 3 (HTTP de saida simulado); base/upload-testes-e-ci.md (lacuna 6)
D-18 | pronto do usuario: sobe um audio ou video gerado com ffmpeg, ve a barra de envio e a etapa, a fonte vira pronto, cola um link do YouTube simulado, e a busca do agente acha o trecho; o que nao pode ser visto (transcricao real, YouTube real, 375 px) fica registrado | exigir transcricao real na entrega | PROJETO.md (criterios: subo um video e vejo passar de processando para pronto; o agente responde com base no que subi); briefing item 9
D-19 | lacunas da F1 tratadas: 1 e 2 (YouTube) por fixture e PR-75; 3 e 4 (modelos de audio) por modelo livre com padrao; 5 (resposta vazia) por transcricao_vazia; 6 (corpo em stream no next start) por teste de producao; 7 (versao do ffmpeg) por instalacao do pacote sem fixar versao; 8 sem memox | deixar lacuna sem tratamento | (HIPOTESE) base/00-LACUNAS.md; PR-71 a PR-75
D-20 | FT-11 recebe: verificarMidia() para o health check, ffmpeg como dependencia do conteiner, pasta de cada fonte com original, original.parcial (lixo de upload interrompido), audio/ (temporario) e segmentos/ (parciais), que o backup pode ignorar e a limpeza pode apagar; limpeza de orfaos no boot fica como lacuna | implementar backup ou saude nesta feature | (HIPOTESE) MAPA.md (FT-11 e nao-objetivos do briefing); PR-20 e PR-21
```

## Respostas por eixo

1. Escopo de negócio: briefing e PROJETO.md; D-18 e a fronteira com FT-09 a FT-11 em D-20.
2. Arquitetura: D-03, D-04, D-05, D-06, D-07, D-08, D-09, D-11, D-12.
3. Contrato de dados: D-01, D-02.
4. Estado e observabilidade: D-07, D-14, D-20.
5. Resiliência: D-03, D-05, D-06, D-07, D-15.
6. Ambiente e segredos: D-02, D-13, D-16 (nenhum segredo novo; a chave do OpenRouter é a da PR-14).
7. Definição de pronto: D-18.

## Premissas novas (todas `f2_autonoma`, etapa b4)

PR-71 upload em streaming; PR-72 pipeline de áudio e segmentos de 10 minutos; PR-73 transcrição e modelo configurável; PR-74 fila de vídeo (concorrência 1, retomada por parte); PR-75 YouTube por legendas e fragilidade; PR-76 contrato HTTP e tela; PR-77 ambiente e simulados. Registradas em `docs/projeto/PREMISSAS.md`.

## Contradições com a base

Nenhuma. A lacuna 6 da F1 (corpo em stream no `next start`) e a 1 (formato real do YouTube) seguem como risco conhecido, tratadas por teste e por fixture.

## Pendências

Nenhuma pendência.
