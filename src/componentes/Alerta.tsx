import { Icone } from '@/componentes/Icones'

type Variante = 'info' | 'erro' | 'sucesso' | 'aviso'

const ICONES = { info: 'informacao', erro: 'alerta', sucesso: 'sucesso', aviso: 'alerta' } as const

/** Mensagem em linha. Erro é `alert` (interrompe o leitor de tela); o resto é `status`. */
export function Alerta({
  variante = 'info',
  children,
}: {
  variante?: Variante
  children: React.ReactNode
}) {
  const classe = variante === 'info' ? 'alerta' : `alerta alerta-${variante}`
  return (
    <div className={classe} role={variante === 'erro' ? 'alert' : 'status'}>
      <Icone nome={ICONES[variante]} tamanho={18} />
      <div>{children}</div>
    </div>
  )
}
