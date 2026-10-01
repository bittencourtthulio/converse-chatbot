/*
 * Converse: script do chat embutido (FT-06, PR-08, PR-60).
 *
 * Uso, na página do cliente, antes de </body>:
 *   <script src="https://SEU-CONVERSE/widget.js" data-agent="ID-DO-AGENTE" async></script>
 * Opcionais: data-position="direita|esquerda" e data-color="#rrggbb" sobrescrevem
 * a configuração do agente.
 *
 * JavaScript puro (ES2017), sem dependência. Escrito à mão e servido como está
 * pela rota /widget.js. Roda em site de terceiro e por isso NÃO lê os tokens do
 * sistema: as poucas cores neutras abaixo (fundo do painel, sombra, texto do botão
 * por luminância) são literais deste arquivo, exceção declarada em
 * docs/stack/CONVENCOES.md.
 *
 * O que faz: acha o próprio <script>, busca a configuração visual do agente (se
 * for 404 ou falhar, não mostra nada e não escreve no console do site), monta o
 * botão flutuante e o painel dentro de Shadow DOM (o estilo do site não entra e o
 * nosso não sai), e só carrega o iframe de {origem}/embed/{id} ao abrir pela
 * primeira vez. Fecha por clique, por Esc e por mensagem do iframe; fala com o
 * iframe por postMessage conferindo event.origin e event.source. Não deixa global
 * além de window.Converse (abrir, fechar) e é idempotente.
 */
(function () {
  'use strict';

  var ID_VALIDO = /^[A-Za-z0-9_-]{1,64}$/;
  var COR_HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  var ORIGEM_DAS_MENSAGENS = 'converse';
  var LARGURA_DO_CELULAR = 480;

  // ---- cor ------------------------------------------------------------------

  function normalizarCor(valor) {
    if (typeof valor !== 'string') return null;
    var t = valor.trim().toLowerCase();
    if (!COR_HEX.test(t)) return null;
    if (t.length === 4) return '#' + t[1] + t[1] + t[2] + t[2] + t[3] + t[3];
    return t;
  }

  function canal(valor) {
    var c = valor / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }

  function luminancia(hex) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
  }

  function contraste(a, b) {
    var la = luminancia(a);
    var lb = luminancia(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }

  /** O texto de maior contraste sobre a cor: preto ou branco (mesma regra de src/lib/cor.ts). */
  function textoSobre(cor) {
    return contraste(cor, '#000000') >= contraste(cor, '#ffffff') ? '#000000' : '#ffffff';
  }

  // ---- o próprio script ------------------------------------------------------

  function acharOScript() {
    if (document.currentScript) return document.currentScript;
    var candidatos = document.querySelectorAll('script[data-agent]');
    for (var i = candidatos.length - 1; i >= 0; i -= 1) {
      if (/\/widget\.js(\?|#|$)/.test(candidatos[i].getAttribute('src') || '')) return candidatos[i];
    }
    return null;
  }

  var script = acharOScript();
  if (!script) return;
  var agenteId = script.getAttribute('data-agent');
  if (!agenteId || !ID_VALIDO.test(agenteId)) return;

  var origem;
  try {
    origem = new URL(script.src).origin;
  } catch (e) {
    return;
  }
  if (!/^https?:\/\//.test(origem)) return;

  // ---- idempotência e API ----------------------------------------------------

  var host = document.createElement('div');
  host.setAttribute('data-converse-agente', agenteId);

  function jaMontado() {
    var marcas = document.querySelectorAll('[data-converse-agente]');
    for (var i = 0; i < marcas.length; i += 1) {
      if (marcas[i].getAttribute('data-converse-agente') === agenteId) return true;
    }
    return false;
  }

  function registrar(id, controle) {
    var api = window.Converse;
    if (!api || typeof api !== 'object') {
      api = {};
      window.Converse = api;
    }
    if (!api.__controles) {
      Object.defineProperty(api, '__controles', { value: {}, enumerable: false });
    }
    api.__controles[id] = controle;
    function alvo(id2) {
      var cs = api.__controles;
      // Com id, só o widget desse agente; sem id, o primeiro montado.
      if (id2) return cs[id2] || null;
      var chaves = Object.keys(cs);
      return chaves.length > 0 ? cs[chaves[0]] : null;
    }
    if (typeof api.abrir !== 'function') {
      api.abrir = function (id2) {
        var c = alvo(id2);
        if (c) c.abrir();
      };
    }
    if (typeof api.fechar !== 'function') {
      api.fechar = function (id2) {
        var c = alvo(id2);
        if (c) c.fechar();
      };
    }
  }

  // ---- montagem --------------------------------------------------------------

  function montar(config) {
    var cor = normalizarCor(script.getAttribute('data-color')) || normalizarCor(config.cor) || '#2563eb';
    var posAttr = script.getAttribute('data-position');
    var posicao = posAttr === 'esquerda' || posAttr === 'direita' ? posAttr : config.posicao === 'esquerda' ? 'esquerda' : 'direita';
    var titulo = typeof config.titulo === 'string' && config.titulo ? config.titulo : 'Chat';
    var lado = posicao === 'esquerda' ? 'left' : 'right';
    var texto = textoSobre(cor);

    var raiz = host.attachShadow({ mode: 'open' });
    var estilo = document.createElement('style');
    estilo.textContent =
      ':host{all:initial}' +
      '*{box-sizing:border-box}' +
      '.lancador{position:fixed;bottom:20px;' + lado + ':20px;width:56px;height:56px;padding:0;border:0;border-radius:50%;' +
      'background:' + cor + ';color:' + texto + ';cursor:pointer;display:flex;align-items:center;justify-content:center;' +
      'box-shadow:0 4px 14px rgba(0,0,0,.28);z-index:2147483000;transition:transform .15s ease}' +
      '.lancador:hover{transform:scale(1.06)}' +
      '.lancador:focus-visible{outline:3px solid ' + texto + ';outline-offset:-6px;box-shadow:0 0 0 3px ' + cor + ',0 0 0 6px #ffffff}' +
      '.lancador svg{width:26px;height:26px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}' +
      '.painel{position:fixed;bottom:88px;' + lado + ':20px;width:380px;max-width:calc(100vw - 40px);height:min(640px,calc(100vh - 108px));' +
      'background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.3);z-index:2147483001;' +
      'visibility:hidden;opacity:0;transform:translateY(8px);transition:opacity .18s ease,transform .18s ease,visibility .18s}' +
      '.painel.aberto{visibility:visible;opacity:1;transform:none}' +
      '.painel.ampliado{width:min(720px,calc(100vw - 40px));height:calc(100vh - 108px)}' +
      '.painel iframe{display:block;width:100%;height:100%;border:0;background:#ffffff}' +
      '@media (max-width:' + LARGURA_DO_CELULAR + 'px){' +
      '.painel,.painel.ampliado{inset:0;bottom:0;width:100%;max-width:none;height:100%;border-radius:0}' +
      '.lancador.aberto{display:none}}' +
      '@media (prefers-reduced-motion:reduce){*{transition:none!important}}';
    raiz.appendChild(estilo);

    var botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'lancador';
    botao.setAttribute('aria-label', 'Abrir o chat: ' + titulo);
    botao.setAttribute('aria-expanded', 'false');
    botao.setAttribute('aria-controls', 'converse-painel');
    var ICONE_ABRIR = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/></svg>';
    var ICONE_FECHAR = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M18 6 6 18M6 6l12 12"/></svg>';
    botao.innerHTML = ICONE_ABRIR;
    raiz.appendChild(botao);

    var painel = document.createElement('div');
    painel.id = 'converse-painel';
    painel.className = 'painel';
    painel.setAttribute('role', 'dialog');
    painel.setAttribute('aria-label', titulo);
    painel.setAttribute('aria-modal', 'false');
    raiz.appendChild(painel);

    var iframe = null;
    var aberto = false;

    function abrir() {
      if (aberto) return;
      aberto = true;
      if (!iframe) {
        // Só agora o iframe existe: quem nunca abre o chat não baixa a página dele.
        iframe = document.createElement('iframe');
        iframe.title = titulo;
        iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox');
        iframe.src = origem + '/embed/' + encodeURIComponent(agenteId);
        painel.appendChild(iframe);
      }
      painel.classList.add('aberto');
      botao.classList.add('aberto');
      botao.setAttribute('aria-expanded', 'true');
      botao.setAttribute('aria-label', 'Fechar o chat: ' + titulo);
      botao.innerHTML = ICONE_FECHAR;
      setTimeout(function () {
        if (aberto && iframe) iframe.focus();
      }, 0);
    }

    function fechar() {
      if (!aberto) return;
      aberto = false;
      painel.classList.remove('aberto');
      botao.classList.remove('aberto');
      botao.setAttribute('aria-expanded', 'false');
      botao.setAttribute('aria-label', 'Abrir o chat: ' + titulo);
      botao.innerHTML = ICONE_ABRIR;
      botao.focus();
    }

    botao.addEventListener('click', function () {
      if (aberto) fechar();
      else abrir();
    });

    // Esc fecha, de qualquer ponto da página do cliente.
    document.addEventListener('keydown', function (e) {
      if (aberto && (e.key === 'Escape' || e.key === 'Esc')) fechar();
    });

    // O iframe fala por postMessage. Só vale mensagem da origem da plataforma E
    // vinda do iframe deste widget; qualquer outra janela é ignorada.
    window.addEventListener('message', function (e) {
      if (e.origin !== origem) return;
      // contentWindow nulo (iframe removido) nunca casa com um source ausente.
      if (!iframe || !iframe.contentWindow || e.source !== iframe.contentWindow) return;
      var d = e.data;
      if (!d || typeof d !== 'object' || d.origem !== ORIGEM_DAS_MENSAGENS) return;
      if (d.tipo === 'fechar') fechar();
      else if (d.tipo === 'redimensionar' && typeof d.expandido === 'boolean') {
        if (window.innerWidth > LARGURA_DO_CELULAR) painel.classList.toggle('ampliado', d.expandido);
      }
    });

    registrar(agenteId, { abrir: abrir, fechar: fechar });
  }

  function iniciar() {
    // Um widget por agente por página. A marca vai no DOM antes de a configuração
    // chegar: um segundo <script> executado nesse meio-tempo já a encontra.
    if (jaMontado()) return;
    (document.body || document.documentElement).appendChild(host);
    var url = origem + '/api/publico/agentes/' + encodeURIComponent(agenteId) + '/config';
    try {
      fetch(url, { credentials: 'omit' })
        .then(function (r) {
          if (!r.ok) throw new Error('indisponivel');
          return r.json();
        })
        .then(function (config) {
          if (!config || config.ativo !== true) throw new Error('indisponivel');
          montar(config);
        })
        .catch(function () {
          // Agente inativo, inexistente ou rede fora: some sem ruído no site.
          if (host.parentNode) host.parentNode.removeChild(host);
        });
    } catch (e) {
      if (host.parentNode) host.parentNode.removeChild(host);
    }
  }

  if (document.readyState === 'loading' && !document.body) {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
