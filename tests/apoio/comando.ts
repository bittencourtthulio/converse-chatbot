// Roda um script de `scripts/` (backup, restore, criar-admin) como processo filho, com o ambiente
// que o teste monta (banco, STORAGE_DIR e BACKUP_DIR próprios): é assim que o operador os roda.
import { spawn } from 'node:child_process'
import path from 'node:path'

export interface SaidaDoComando {
  codigo: number | null
  stdout: string
  stderr: string
}

const TSX = path.join(process.cwd(), 'node_modules', 'tsx', 'dist', 'cli.mjs')

/**
 * Executa `scripts/<script>.ts` com `tsx`. O ambiente do teste NÃO é herdado por inteiro: o filho
 * recebe só o PATH, o HOME e o que o teste passar, para nenhum teste tocar o banco do desenvolvedor
 * por esquecimento; variável passada como `undefined` chega vazia, nunca preenchida pelo ambiente dele. `entrada` vai para a entrada padrão do processo.
 */
export function rodarScript(
  script: string,
  variaveis: Record<string, string | undefined>,
  args: string[] = [],
  opcoes: { entrada?: string; prazoMs?: number } = {},
): Promise<SaidaDoComando> {
  return new Promise((resolver, rejeitar) => {
    const ambienteDoFilho: Record<string, string> = { PATH: process.env.PATH ?? '', HOME: process.env.HOME ?? '' }
    // `undefined` vai como texto vazio: os scripts carregam o arquivo de ambiente do desenvolvedor com
    // `dotenv/config`, que não sobrescreve variável já definida. Sem isso, "sem DATABASE_URL" lia o banco dele.
    for (const [k, v] of Object.entries(variaveis)) ambienteDoFilho[k] = v ?? ''
    const filho = spawn(process.execPath, [TSX, path.join('scripts', `${script}.ts`), ...args], {
      cwd: process.cwd(),
      env: ambienteDoFilho as unknown as NodeJS.ProcessEnv,
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    filho.stdout.on('data', (p: Buffer) => void (stdout += p.toString('utf8')))
    filho.stderr.on('data', (p: Buffer) => void (stderr += p.toString('utf8')))
    const relogio = setTimeout(() => {
      filho.kill('SIGKILL')
      rejeitar(new Error(`O script ${script} não terminou a tempo.`))
    }, opcoes.prazoMs ?? 60_000)
    filho.on('error', rejeitar)
    filho.on('exit', (codigo) => {
      clearTimeout(relogio)
      resolver({ codigo, stdout, stderr })
    })
    filho.stdin.end(opcoes.entrada ?? '')
  })
}
