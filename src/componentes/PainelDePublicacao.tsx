'use client'

import { useState } from 'react'
import { Alerta } from '@/componentes/Alerta'
import { CodigoParaIncorporar } from '@/componentes/CodigoParaIncorporar'
import { FormularioDoChat, type ConfiguracaoDoFormulario } from '@/componentes/FormularioDoChat'
import { PreviaDoChat } from '@/componentes/PreviaDoChat'
import type { ConfiguracaoDoEmbed } from '@/componentes/ChatEmbutido'
import type { AcaoDeFormulario } from '@/componentes/Formulario'
import type { AvisoDaPublicacao } from '@/componentes/publicar-logica'

/**
 * A aba Publicar inteira: o formulário, a prévia que acompanha o que se digita, o
 * código para incorporar e os avisos. Só liga as peças; cada uma tem a sua lógica.
 */
export function PainelDePublicacao({
  acao,
  agente,
  configuracao,
  versao,
  snippet,
  avisos,
}: {
  acao: AcaoDeFormulario
  agente: { id: string; nome: string }
  configuracao: ConfiguracaoDoFormulario
  versao: string
  snippet: string
  avisos: AvisoDaPublicacao[]
}) {
  const [rascunho, setRascunho] = useState<Partial<ConfiguracaoDoEmbed> | undefined>(undefined)
  return (
    <div className="publicar-grade">
      <div className="pilha">
        {avisos.length > 0 && (
          <div className="avisos-da-publicacao">
            {avisos.map((a) => (
              <Alerta key={a.texto} variante={a.tipo}>
                {a.texto}
              </Alerta>
            ))}
          </div>
        )}
        <section className="cartao" aria-label="Configuração do chat embutido">
          <div className="cartao-corpo">
            <FormularioDoChat acao={acao} agente={agente} configuracao={configuracao} aoMudar={setRascunho} />
          </div>
        </section>
      </div>
      <div className="publicar-lateral">
        <CodigoParaIncorporar snippet={snippet} />
        <PreviaDoChat agenteId={agente.id} versao={versao} rascunho={rascunho} />
      </div>
    </div>
  )
}
