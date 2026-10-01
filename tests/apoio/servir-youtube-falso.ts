/**
 * Sobe o YouTube simulado como processo avulso, para colar um link na aba
 * Conhecimento e ver a fila ler as legendas sem falar com o YouTube real (FT-08,
 * roteiro de QA e verificação no navegador):
 *
 *   npx tsx tests/apoio/servir-youtube-falso.ts
 *   YOUTUBE_BASE=<url impressa> npm run start
 *
 * Links de teste (a URL do usuário só serve para extrair o id; o servidor lê
 * sempre a base configurada):
 *   https://www.youtube.com/watch?v=abcdefghijk   legendas em inglês (manual) e português (automática)
 *   https://www.youtube.com/watch?v=garantia001   legenda em português (manual), sobre a garantia
 *   https://www.youtube.com/watch?v=semlegenda1   vídeo sem legendas (a fonte deve ficar em erro)
 *
 * Ctrl+C encerra.
 */
import { ID_COM_LEGENDAS, ID_SEM_LEGENDAS, iniciarYoutubeFalso } from './youtube-falso'

const ID_GARANTIA = 'garantia001'
const falso = await iniciarYoutubeFalso()
falso.configurar({
  videos: {
    [ID_COM_LEGENDAS]: {
      titulo: 'Aula de exemplo',
      duracaoSegundos: 75,
      faixas: [
        {
          idioma: 'en',
          nome: 'English',
          falas: [
            { inicio: 0, duracao: 4, texto: 'Welcome to the lesson.' },
            { inicio: 4, duracao: 6, texto: "Today we talk about how it's done." },
            { inicio: 70, duracao: 5, texto: 'Thanks for watching.' },
          ],
        },
        { idioma: 'pt', automatica: true, nome: 'Portuguese (auto-generated)', falas: [{ inicio: 0, duracao: 4, texto: 'Bem-vindo à aula.' }] },
      ],
    },
    [ID_GARANTIA]: {
      titulo: 'Como funciona a garantia dos produtos',
      duracaoSegundos: 130,
      faixas: [
        {
          idioma: 'pt',
          nome: 'Português',
          falas: [
            { inicio: 0, duracao: 6, texto: 'Neste vídeo explicamos como funciona a garantia dos produtos.' },
            { inicio: 6, duracao: 8, texto: 'A garantia cobre defeitos de fabricação por doze meses a partir da compra.' },
            { inicio: 65, duracao: 8, texto: 'Para acionar a garantia, envie a nota fiscal e uma foto do defeito ao suporte.' },
            { inicio: 125, duracao: 5, texto: 'O reparo é feito em até quinze dias úteis.' },
          ],
        },
      ],
    },
    [ID_SEM_LEGENDAS]: { titulo: 'Vídeo sem legendas', duracaoSegundos: 30, faixas: [] },
  },
})
console.log(`YOUTUBE_BASE=${falso.url}`)
console.log(`Links de teste: watch?v=${ID_COM_LEGENDAS} (en manual, pt automática), watch?v=${ID_GARANTIA} (pt manual), watch?v=${ID_SEM_LEGENDAS} (sem legendas)`)
setInterval(() => undefined, 1 << 30)
