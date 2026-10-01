// Trabalhador de extração que TRAVA de propósito (FT-13, PR-107): grava o próprio pid no arquivo recebido em
// argv[2] e queima CPU num laço síncrono que nenhum Promise.race interrompe. Só um SIGKILL de fora o encerra.
import { writeFileSync } from 'node:fs'

writeFileSync(process.argv[2], String(process.pid))
for (;;) {
  // laço de CPU sem fim
}
