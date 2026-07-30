/**
 * Coleta própria da IXC — o lado do navegador.
 *
 * Este arquivo é servido da MESMA ORIGEM da página e não depende do GTM.
 * É de propósito: um bloqueador que derruba googletagmanager.com derruba o
 * pixel do navegador, mas não derruba este script nem o /api/collect. É daqui
 * que vem a resistência a bloqueador — se o disparo morasse dentro do GTM,
 * morreria junto com ele, e o server-side não serviria para nada.
 *
 * Carregar no <head>, ANTES do GTM:
 *     <script src="/js/collect.js"></script>
 *
 * Precisa vir antes porque é este arquivo que cria o `event_id`. O GTM lê o
 * mesmo id via window.IXC.eventId(), e é isso que faz o Meta desduplicar o par
 * Pixel + CAPI em vez de contar duas conversões.
 */
(function () {
  'use strict';

  var ENDPOINT = '/api/collect';
  var COOKIE_ATRIBUICAO = 'ixcprovedor_attribution';
  var CHAVE_CONSENT = 'ixcprovedor_cookie_consent';

  var IXC = (window.IXC = window.IXC || {});
  var ids = {};
  var jaEnviado = {};

  // ------------------------------------------------------------- event_id

  function novoId(nome) {
    var aleatorio;
    try {
      var buf = new Uint8Array(8);
      crypto.getRandomValues(buf);
      aleatorio = Array.prototype.map
        .call(buf, function (b) {
          return b.toString(16).padStart(2, '0');
        })
        .join('');
    } catch (e) {
      aleatorio = Math.random().toString(36).substring(2, 12);
    }
    return nome + '.' + Date.now().toString(36) + '.' + aleatorio;
  }

  /**
   * Um id estável por (nome do evento, carregamento de página).
   * O GTM chama esta mesma função, então navegador e servidor mandam o mesmo id.
   */
  IXC.eventId = function (nome) {
    nome = String(nome || 'evt');
    if (!ids[nome]) ids[nome] = novoId(nome);
    return ids[nome];
  };

  // ------------------------------------------------------- estado do visitante

  function consentimento() {
    var st = null;
    try {
      st = localStorage.getItem(CHAVE_CONSENT);
    } catch (e) {}
    var ok = st === 'granted' ? 'granted' : 'denied';
    return { analytics: ok, ad: ok };
  }

  function atribuicao() {
    try {
      var m = document.cookie.match(
        new RegExp('(?:^|;\\s*)' + COOKIE_ATRIBUICAO + '=([^;]+)')
      );
      if (!m) return {};
      return JSON.parse(decodeURIComponent(m[1])) || {};
    } catch (e) {
      return {};
    }
  }

  function clientId() {
    try {
      var m = document.cookie.match(/(?:^|;\s*)_ga=([^;]+)/);
      if (!m) return null;
      var p = decodeURIComponent(m[1]).split('.');
      return p.length >= 4 ? p[2] + '.' + p[3] : null;
    } catch (e) {
      return null;
    }
  }

  function cookie(nome) {
    try {
      var m = document.cookie.match(new RegExp('(?:^|;\\s*)' + nome + '=([^;]+)'));
      return m ? decodeURIComponent(m[1]) : null;
    } catch (e) {
      return null;
    }
  }

  function ls(chave) {
    try {
      var v = localStorage.getItem(chave);
      return v || null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Identidade do lead. Vai em claro para o NOSSO endpoint, na nossa origem, e
   * o hash SHA-256 acontece no Worker.
   *
   * Não hasheamos aqui de propósito: Google quer o telefone em E.164 com '+' e
   * o Meta quer só dígitos sem '+'. Hashear no navegador obrigaria a duplicar
   * essa regra em dois lugares, e um hash único derrubaria o match rate de um
   * dos lados — silenciosamente, porque a plataforma só informa "não casou".
   */
  function identidadeDoLead() {
    var email = ls('lead_email');
    var fone = ls('lead_phone');
    var nome = ls('lead_firstname');
    var sobrenome = ls('lead_lastname');
    if (!email && !fone) return null;
    return {
      email: email,
      phone: fone,
      first_name: nome,
      last_name: sobrenome,
      country: 'br'
    };
  }

  // ------------------------------------------------------------------ envio

  function enviar(nomeEvento, opcoes) {
    opcoes = opcoes || {};

    // Um envio por evento por página, salvo quando o chamador pede repetição
    // (o clique no WhatsApp pode acontecer mais de uma vez).
    if (!opcoes.repetivel) {
      if (jaEnviado[nomeEvento]) return;
      jaEnviado[nomeEvento] = true;
    }

    var payload = {
      event_name: nomeEvento,
      event_id: IXC.eventId(nomeEvento),
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      page: {
        location: window.location.href,
        referrer: document.referrer || null,
        title: document.title
      },
      consent: consentimento(),
      attribution: atribuicao(),
      identity: {
        client_id: clientId(),
        fbp: cookie('_fbp'),
        fbc: cookie('_fbc')
      },
      user_data: nomeEvento === 'generate_lead' ? identidadeDoLead() : null
    };

    var corpo = JSON.stringify(payload);

    // keepalive garante a entrega quando a página é descarregada em seguida —
    // o clique no WhatsApp abre outro aplicativo e mataria um fetch comum.
    try {
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: corpo,
        keepalive: true,
        credentials: 'same-origin'
      })['catch'](function () {
        /* silencioso: falha de coleta nunca quebra a página */
      });
    } catch (e) {
      try {
        navigator.sendBeacon(
          ENDPOINT,
          new Blob([corpo], { type: 'application/json' })
        );
      } catch (e2) {}
    }
  }

  IXC.enviar = enviar;

  // --------------------------------------------------------------- disparos

  function ehPaginaDeObrigado() {
    return /^\/obrigado\/?$/.test(window.location.pathname);
  }

  function iniciar() {
    enviar('page_view');

    if (ehPaginaDeObrigado()) {
      // A conversão. Espera um instante para o listener do formulário ter
      // gravado a identidade em localStorage antes de montar o payload.
      setTimeout(function () {
        enviar('generate_lead');
      }, 350);
    }

    // WhatsApp: captura na fase de bolha para não interferir na navegação.
    document.addEventListener(
      'click',
      function (ev) {
        var el = ev.target && ev.target.closest ? ev.target.closest('a[href]') : null;
        if (!el) return;
        var href = el.getAttribute('href') || '';
        if (/wa\.me|api\.whatsapp\.com/.test(href)) {
          enviar('whatsapp_click', { repetivel: true });
        }
      },
      true
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
