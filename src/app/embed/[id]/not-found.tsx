/**
 * Agente inexistente ou com o chat inativo: a mesma mensagem neutra nos dois
 * casos, sem nome, sem instrução, sem nada que diga qual dos dois é.
 */
export default function ChatIndisponivel() {
  return (
    <main className="embed embed-indisponivel">
      <div className="embed-indisponivel-corpo">
        <h1>Chat indisponível</h1>
        <p>Este assistente não está disponível no momento.</p>
      </div>
    </main>
  )
}
