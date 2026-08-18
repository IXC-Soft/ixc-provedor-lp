/**
 * IXC — camada de consentimento. ZERO CONFIGURAÇÃO.
 * ─────────────────────────────────────────────────────────────────────────
 * Colar/carregar SÍNCRONO no <head>, ANTES do snippet do GTM. Nada a ajustar:
 * sem cor, sem chave, sem parâmetro. Se um dia precisar decidir alguma coisa
 * para instalar, deixou de ser padrão e virou configuração.
 *
 *   carregar com uma tag script simples apontando para /js/ixc-tracking.js,
 *   e só então o snippet do GTM.
 *
 * NUNCA escreva a sequência de fechamento de script neste arquivo, nem dentro
 * de comentário: ele também é colado inline em LPs de terceiros, e o parser de
 * HTML encerra o bloco na primeira ocorrência — quebra a página inteira, sem
 * dó e sem erro que aponte para cá.
 *
 * SEM `defer` e SEM `async`, de propósito: `gtag('consent','default')` só tem
 * efeito se chegar ANTES do container carregar. Com defer o GTM sobe primeiro,
 * a tag dispara, aparece como "disparou" no Preview e não produz efeito
 * nenhum — o erro mais caro desta lista, porque não deixa rastro.
 *
 * O BANNER é neutro de propósito: barra escura, tipografia herdada da página
 * (`font: inherit`). Não pede decisão de marca para ser instalado. Quem quiser
 * marcar sobrescreve `#cookie-banner` no CSS da LP — opcional, nunca requisito.
 *
 * A CHAVE é fixa. `localStorage` já é isolado por origem: páginas do mesmo
 * domínio compartilham automaticamente (quem aceitou numa não é perguntado na
 * outra) e domínios diferentes não se enxergam, mesmo com o nome igual. Não há
 * nada a configurar.
 *
 * ÚNICO comportamento condicional, e ele é automático: o banner só aparece se
 * ainda não houver escolha registrada. Na página de obrigado o visitante já
 * respondeu na anterior, então nada aparece — sem precisar de flag.
 * ───────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var KEY = 'ixcprovedor_cookie_consent';
  var POLITICA = 'https://ixcsoft.com/politica-de-privacidade/';

  function guardado() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  /* ── 1. Consent Mode v2 do Google — padrão NEGADO ───────────────────────
     Não pode ser tag de container: precisa existir antes do GTM carregar.
     E "não declarado" não é "negado" — sem isto o GTM não retém tag nenhuma. */
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function () { window.dataLayer.push(arguments); };
  }
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  });

  /* ── 2. Consentimento do HubSpot ────────────────────────────────────────
     API própria do HubSpot, sem relação nenhuma com o Consent Mode do Google.
     São dois sistemas separados: precisa dos dois. */
  window._hsp = window._hsp || [];

  function aplicar(status) {
    var ok = status === 'granted';
    gtag('consent', 'update', {
      ad_storage: ok ? 'granted' : 'denied',
      ad_user_data: ok ? 'granted' : 'denied',
      ad_personalization: ok ? 'granted' : 'denied',
      analytics_storage: ok ? 'granted' : 'denied'
    });
    window._hsp.push(['setHubSpotConsent',
      { analytics: ok, advertisement: ok, functionality: ok }]);
    window.dataLayer.push({ event: 'cookie_consent', cookie_consent_status: status });
  }

  /* Reaplica a escolha já registrada. Sem isto, quem já decidiu volta como
     indeciso e as tags ficam retidas em toda visita seguinte. */
  var escolha = guardado();
  if (escolha) {
    aplicar(escolha);
  } else {
    window._hsp.push(['setHubSpotConsent',
      { analytics: false, advertisement: false, functionality: false }]);
  }

  /* Exposto para o banner e para um link "gerenciar cookies" no rodapé. */
  window.setCookieConsent = function (status) {
    try { localStorage.setItem(KEY, status); } catch (e) {}
    aplicar(status);
    var el = document.getElementById('cookie-banner');
    if (el) el.classList.remove('is-visible');
  };

  /* ── 3. Banner ────────────────────────────────────────────────────────── */
  if (escolha) return;

  function montar() {
    if (document.getElementById('cookie-banner')) return;

    var css = document.createElement('style');
    css.textContent =
      '#cookie-banner{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;' +
      'background:#0f1115;border-top:1px solid rgba(255,255,255,.14);' +
      'box-shadow:0 -8px 30px -18px rgba(0,0,0,.8);transform:translateY(110%);' +
      'transition:transform .4s ease;font:inherit}' +
      '#cookie-banner.is-visible{transform:translateY(0)}' +
      '#cookie-banner .ci{max-width:1200px;margin:0 auto;padding:20px 24px;display:flex;' +
      'flex-direction:column;gap:16px;align-items:flex-start}' +
      '#cookie-banner p{margin:0;color:#e6e6e6;font-size:14px;line-height:1.55;font-family:inherit}' +
      '#cookie-banner a{color:#fff;text-decoration:underline}' +
      '#cookie-banner .ca{display:flex;gap:12px;flex-wrap:wrap;width:100%}' +
      '#cookie-banner button{font:inherit;font-size:14px;font-weight:700;border-radius:999px;' +
      'padding:11px 26px;cursor:pointer;border:1px solid transparent;transition:opacity .2s ease}' +
      '#cookie-banner .ok{background:#fff;color:#0f1115}' +
      '#cookie-banner .ok:hover{opacity:.88}' +
      '#cookie-banner .no{background:transparent;color:#e6e6e6;border-color:rgba(255,255,255,.28)}' +
      '#cookie-banner .no:hover{background:rgba(255,255,255,.08)}' +
      '#cookie-banner button:focus-visible{outline:2px solid #fff;outline-offset:2px}' +
      '@media(min-width:768px){#cookie-banner .ci{flex-direction:row;align-items:center;' +
      'justify-content:space-between;gap:32px}#cookie-banner .ca{width:auto;flex-shrink:0}}';
    document.head.appendChild(css);

    var el = document.createElement('div');
    el.id = 'cookie-banner';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-label', 'Aviso de cookies');
    el.innerHTML =
      '<div class="ci"><p>Utilizamos cookies para melhorar sua experiência, analisar o tráfego e ' +
      'personalizar conteúdo. Ao continuar navegando, você concorda com nossa ' +
      '<a href="' + POLITICA + '" target="_blank" rel="noopener">Política de Privacidade</a>.</p>' +
      '<div class="ca"><button type="button" class="no">Rejeitar</button>' +
      '<button type="button" class="ok">Aceitar cookies</button></div></div>';
    document.body.appendChild(el);

    el.querySelector('.ok').addEventListener('click', function () { setCookieConsent('granted'); });
    el.querySelector('.no').addEventListener('click', function () { setCookieConsent('denied'); });
    setTimeout(function () { el.classList.add('is-visible'); }, 600);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', montar);
  } else {
    montar();
  }
})();
