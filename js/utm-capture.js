/**
 * Captura de UTMs / click IDs → campos ocultos do formulário HubSpot (embed React).
 * O form é injetado em #hsFormContainer quando o modal "Agende sua demonstração" abre;
 * o MutationObserver persiste e preenche assim que o form aparece (mesmo tarde).
 *
 * PRÉ-REQUISITO no HubSpot: o formulário (2415bdc0-...) precisa ter os campos ocultos
 * com nome igual às chaves abaixo (aceita também o prefixo "var_", normalizado).
 */
(function () {
  var KEYS = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'gclid', 'fbclid', 'ad_id',
    'gads_keyword', 'gads_ad_id', 'gads_campaign'
  ];
  var COOKIE = 'ixcprovedor_attribution';
  var COOKIE_DAYS = 30;
  var SCOPE_SELECTOR = '#hsFormContainer';

  /* Resolvido só quando o DOM existe. Antes era resolvido na carga, o que
     quebrava se o arquivo fosse colado inline no <head>: `#hsFormContainer`
     ainda não existe, o escopo caía para `document`, e `observe(document.body)`
     estourava porque o body também não existe ainda. */
  var scope = null;

  function aoCarregar(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else { fn(); }
  }

  function readCookie() {
    var m = document.cookie.match(new RegExp('(?:^|; )' + COOKIE + '=([^;]*)'));
    if (!m) return {};
    try { return JSON.parse(decodeURIComponent(m[1])); } catch (e) { return {}; }
  }
  function writeCookie(obj) {
    var d = new Date(); d.setTime(d.getTime() + COOKIE_DAYS * 864e5);
    document.cookie = COOKIE + '=' + encodeURIComponent(JSON.stringify(obj)) +
      ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
  }

  var params = new URLSearchParams(window.location.search);
  var stored = readCookie();
  var data = {};
  KEYS.forEach(function (k) {
    var v = params.get(k);
    if (v) { data[k] = v; } else if (stored[k]) { data[k] = stored[k]; }
  });
  if (Object.keys(data).length) writeCookie(data);

  function fieldKey(name) {
    if (!name) return name;
    var k = name.indexOf('/') !== -1 ? name.split('/').pop() : name;
    return k.replace(/^var_/, '');
  }

  function setNativeValue(el, value) {
    var proto = el.tagName === 'TEXTAREA'
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
    var setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
    setter.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function fill(form) {
    if (!Object.keys(data).length) return;
    form.querySelectorAll('input,select,textarea').forEach(function (el) {
      var k = fieldKey(el.name);
      if (k && data[k] && el.value !== data[k]) setNativeValue(el, data[k]);
    });
  }

  function fillAll() {
    if (!scope) return;
    scope.querySelectorAll('form').forEach(function (f) {
      fill(f);
      if (!f._attrBound) {
        f._attrBound = true;
        f.addEventListener('submit', function () { fill(f); }, true);
      }
    });
  }

  aoCarregar(function () {
    scope = (SCOPE_SELECTOR && document.querySelector(SCOPE_SELECTOR)) || document.body;
    if (!scope) return;
    /* O formulário é injetado tarde, e de novo se o modal reabrir. */
    new MutationObserver(fillAll).observe(scope, { childList: true, subtree: true });
    [300, 800, 1500, 3000, 5000].forEach(function (t) { setTimeout(fillAll, t); });
  });
})();
