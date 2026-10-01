// Instala a trava contra rede real em todo arquivo de teste (FT-13, PR-26, PR-112). Vive em arquivo próprio
// para não deslocar as citações `tests/setup.ts:linha` de CONVENCOES.md e LACUNAS.md.
import { instalarTravaDeRede } from './apoio/trava-de-rede'

instalarTravaDeRede()
