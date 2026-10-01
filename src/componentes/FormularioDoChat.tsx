'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Alerta } from '@/componentes/Alerta'
import { AVATARES_DO_CHAT, AvatarDoChat, ROTULO_DO_AVATAR, type AvatarDoChatNome } from '@/componentes/AvatarDoChat'
import { Formulario, type AcaoDeFormulario } from '@/componentes/Formulario'
import { rascunhoDoFormulario } from '@/componentes/publicar-logica'
import type { ConfiguracaoDoEmbed } from '@/componentes/ChatEmbutido'
import {
  AMOSTRAS_DE_COR,
  COR_PADRAO,
  avisoDeBaixoContraste,
  corDoTextoSobre,
  normalizarCor,
} from '@/lib/cor'
import { LIMITE_DE_DOMINIOS, normalizarLista } from '@/lib/dominios-permitidos'

/** Os limites do serviço de configuração, que o cliente não importa (tem Prisma). */
const LIMITE_DO_TITULO = 60
const LIMITE_DO_AVISO = 300
const MAXIMO_DE_SUGESTOES = 3

/** O que a tela precisa da configuração gravada. */
export interface ConfiguracaoDoFormulario {
  ativo: boolean
  titulo: string
  cor: string
  posicao: 'direita' | 'esquerda'
  avatar: AvatarDoChatNome
  avisoDePrivacidade: string
  avisoDePrivacidadeUrl: string
  dominiosPermitidos: string[]
  limiteDiario: number
  sugestoes: string[]
}

function Contador({ atual, limite }: { atual: number; limite: number }) {
  return (
    <span aria-live="polite">
      {atual} de {limite} caracteres
    </span>
  )
}

/**
 * A cor do chat: amostras predefinidas, seletor do navegador e o campo de texto
 * (que é o que vai no envio). Avisa quando a cor quase some contra o fundo do chat
 * e mostra o texto de maior contraste que o botão vai usar.
 */
function CampoDeCor({ cor, aoMudar }: { cor: string; aoMudar: (cor: string) => void }) {
  const valida = normalizarCor(cor)
  const aviso = valida ? avisoDeBaixoContraste(valida) : null
  return (
    <fieldset className="campo campo-grupo">
      <legend>Cor do chat</legend>
      <div className="amostras" role="group" aria-label="Cores sugeridas">
        {AMOSTRAS_DE_COR.map((a) => (
          <button
            key={a.hex}
            type="button"
            className="amostra"
            style={{ background: a.hex }}
            aria-label={a.nome}
            aria-pressed={valida === a.hex}
            title={a.nome}
            onClick={() => aoMudar(a.hex)}
          />
        ))}
      </div>
      <div className="linha campo-de-cor-linha">
        <input
          type="color"
          className="seletor-de-cor"
          aria-label="Escolher outra cor"
          value={valida ?? COR_PADRAO}
          onChange={(e) => aoMudar(e.target.value)}
        />
        <label className="campo campo-curto">
          <span className="somente-leitor">Cor em hexadecimal</span>
          <input
            type="text"
            name="cor"
            value={cor}
            onChange={(e) => aoMudar(e.target.value)}
            maxLength={7}
            required
            spellCheck={false}
            autoComplete="off"
            aria-invalid={valida ? undefined : true}
            aria-describedby="ajuda-da-cor"
          />
        </label>
        {valida && (
          <span className="amostra-do-botao" style={{ background: valida, color: `var(${corDoTextoSobre(valida).token})` }}>
            Texto do botão
          </span>
        )}
      </div>
      <span className="campo-ajuda" id="ajuda-da-cor">
        Use o formato #rrggbb. O texto sobre a cor (claro ou escuro) é escolhido sozinho para ficar legível.
      </span>
      {!valida && <Alerta variante="erro">Escolha uma cor em hexadecimal, no formato #rrggbb.</Alerta>}
      {aviso && <Alerta variante="aviso">{aviso}</Alerta>}
    </fieldset>
  )
}

/**
 * Formulário do chat embutido (PR-55), na aba Publicar. Sem `aoMudar` é só um
 * formulário; com ele, cada alteração devolve o rascunho (ainda não salvo) para
 * a prévia ao vivo.
 */
export function FormularioDoChat({
  acao,
  agente,
  configuracao,
  aoMudar,
}: {
  acao: AcaoDeFormulario
  agente: { id: string; nome: string }
  configuracao: ConfiguracaoDoFormulario
  aoMudar?: (rascunho: Partial<ConfiguracaoDoEmbed>) => void
}) {
  const [cor, setCor] = useState(configuracao.cor)
  const [aviso, setAviso] = useState(configuracao.avisoDePrivacidade)
  const [dominios, setDominios] = useState(configuracao.dominiosPermitidos.join('\n'))
  const [sugestoes, setSugestoes] = useState(configuracao.sugestoes.join('\n'))
  const raiz = useRef<HTMLDivElement>(null)
  const idDoTitulo = useId()

  const lista = normalizarLista(dominios.split(/[\r\n,]+/))
  const quantasSugestoes = sugestoes.split(/\r?\n/).filter((s) => s.trim() !== '').length

  function avisarMudanca() {
    const form = raiz.current?.closest('form')
    if (!form || !aoMudar) return
    const dados = new FormData(form)
    // A cor controlada pode estar à frente do que o navegador já escreveu no campo.
    dados.set('cor', cor)
    aoMudar(rascunhoDoFormulario(dados, agente.nome))
  }

  // Trocar a cor por amostra ou seletor não dispara `input` no formulário: avisa aqui.
  useEffect(avisarMudanca, [cor]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Formulario acao={acao} rotulo="Salvar configuração do chat">
      <div ref={raiz} className="formulario" onInput={avisarMudanca} onChange={avisarMudanca}>
        <input type="hidden" name="id" value={agente.id} />

        <label className="campo-chave">
          <input type="checkbox" name="ativo" defaultChecked={configuracao.ativo} role="switch" />
          <span>
            <strong>Publicar chat</strong>
            <span className="campo-ajuda">
              Desligado, o botão não aparece no seu site e a página do chat responde como indisponível.
            </span>
          </span>
        </label>

        <label className="campo">
          <span>Título do chat</span>
          <input
            id={idDoTitulo}
            type="text"
            name="titulo"
            defaultValue={configuracao.titulo}
            maxLength={LIMITE_DO_TITULO}
            placeholder={agente.nome}
            autoComplete="off"
          />
          <span className="campo-ajuda">Aparece no cabeçalho do chat. Vazio, vale o nome do agente.</span>
        </label>

        <CampoDeCor cor={cor} aoMudar={setCor} />

        <fieldset className="campo campo-grupo">
          <legend>Posição do botão</legend>
          <div className="campo-radios">
            {(['direita', 'esquerda'] as const).map((p) => (
              <label key={p} className="campo-radio">
                <input type="radio" name="posicao" value={p} defaultChecked={configuracao.posicao === p} />
                <span>{p === 'direita' ? 'Canto direito' : 'Canto esquerdo'}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="campo campo-grupo">
          <legend>Avatar</legend>
          <div className="campo-radios">
            {AVATARES_DO_CHAT.map((a) => (
              <label key={a} className="campo-radio campo-avatar">
                <input type="radio" name="avatar" value={a} defaultChecked={configuracao.avatar === a} />
                <span className="campo-avatar-corpo" style={{ background: normalizarCor(cor) ?? COR_PADRAO }}>
                  <span style={{ color: `var(${corDoTextoSobre(normalizarCor(cor) ?? COR_PADRAO).token})` }}>
                    <AvatarDoChat avatar={a} titulo={configuracao.titulo || agente.nome} tamanho={32} />
                  </span>
                </span>
                <span className="somente-leitor">{ROTULO_DO_AVATAR[a]}</span>
              </label>
            ))}
          </div>
          <span className="campo-ajuda">Um ícone pronto ou as iniciais do título. Não há envio de imagem.</span>
        </fieldset>

        <label className="campo">
          <span>Perguntas sugeridas</span>
          <textarea
            name="sugestoes"
            rows={3}
            value={sugestoes}
            onChange={(e) => setSugestoes(e.target.value)}
            placeholder={'Qual o horário de atendimento?\nComo faço uma troca?'}
            aria-describedby="ajuda-das-sugestoes"
          />
          <span className="campo-ajuda" id="ajuda-das-sugestoes">
            Uma pergunta por linha, até {MAXIMO_DE_SUGESTOES}, de até 80 caracteres. Aparecem como botões antes da
            primeira mensagem. {quantasSugestoes} de {MAXIMO_DE_SUGESTOES} perguntas.
          </span>
        </label>

        <label className="campo">
          <span>Aviso de privacidade</span>
          <textarea
            name="avisoDePrivacidade"
            rows={3}
            maxLength={LIMITE_DO_AVISO}
            value={aviso}
            onChange={(e) => setAviso(e.target.value)}
            placeholder="As conversas são guardadas para melhorar o atendimento."
            aria-describedby="ajuda-do-aviso"
          />
          <span className="campo-ajuda" id="ajuda-do-aviso">
            Texto curto mostrado no rodapé do chat. Em branco, vale o aviso padrão do workspace (Configurações &gt; Privacidade). <Contador atual={aviso.length} limite={LIMITE_DO_AVISO} />
          </span>
        </label>

        <label className="campo">
          <span>Link do aviso de privacidade</span>
          <input
            type="url"
            name="avisoDePrivacidadeUrl"
            defaultValue={configuracao.avisoDePrivacidadeUrl}
            maxLength={500}
            placeholder="https://seusite.com.br/privacidade"
            autoComplete="off"
          />
          <span className="campo-ajuda">Opcional, http ou https. Precisa do texto do aviso.</span>
        </label>

        <label className="campo">
          <span>Domínios permitidos</span>
          <textarea
            name="dominiosPermitidos"
            rows={3}
            value={dominios}
            onChange={(e) => setDominios(e.target.value)}
            placeholder={'seusite.com.br\n*.seusite.com.br'}
            aria-describedby="ajuda-dos-dominios"
            aria-invalid={lista.invalidas.length > 0 || lista.excedeu ? true : undefined}
          />
          <span className="campo-ajuda" id="ajuda-dos-dominios">
            Um por linha. Exemplos: <code>seusite.com.br</code>, <code>*.seusite.com.br</code> (qualquer subdomínio,
            não o domínio puro) e <code>localhost:3000</code>. Só esses sites podem mostrar o chat. Vazio libera
            qualquer site. Até {LIMITE_DE_DOMINIOS} domínios.
          </span>
          {lista.invalidas.length > 0 && (
            <span className="campo-ajuda campo-erro" role="alert">
              Domínio inválido: {lista.invalidas.join(', ')}.
            </span>
          )}
          {lista.excedeu && (
            <span className="campo-ajuda campo-erro" role="alert">
              Informe até {LIMITE_DE_DOMINIOS} domínios.
            </span>
          )}
        </label>

        <label className="campo campo-curto">
          <span>Limite diário de mensagens</span>
          <input
            type="number"
            name="limiteDiario"
            defaultValue={configuracao.limiteDiario}
            min={1}
            max={100000}
            step={1}
            required
            inputMode="numeric"
          />
          <span className="campo-ajuda">
            Mensagens de visitantes por dia, somando todos. Passou disso, o chat pede para voltar amanhã. De 1 a
            100.000.
          </span>
        </label>
      </div>
    </Formulario>
  )
}
