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

  var scope = (SCOPE_SELECTOR && document.querySelector(SCOPE_SELECTOR)) || document;

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

  var filled = false;

  function fillAll() {
    var forms = scope.querySelectorAll('form');
    if (forms.length) filled = true;
    forms.forEach(function (f) {
      fill(f);
      if (!f._attrBound) {
        f._attrBound = true;
        f.addEventListener('submit', function () { fill(f); }, true);
      }
    });
  }

  /**
   * Detecção de degradação — não deixa a falha ser silenciosa.
   *
   * O embed "developer" (.hs-form-html) injeta o formulário inline e tudo funciona.
   * Mas se a definição SSR falhar, o próprio embed troca a classe para .hs-form-frame
   * e cai para IFRAME de outra origem. Nesse caso nenhum querySelector daqui alcança
   * os campos, e as UTMs param de chegar ao HubSpot — exatamente a falha que esta
   * página teve por meses, sem nenhum sinal visível.
   */
  function verificarDegradacao() {
    if (filled) return;
    var alvo = scope === document ? document : scope;
    if (alvo.querySelector('iframe') && !alvo.querySelector('form')) {
      console.warn(
        '[utm-capture] O formulário HubSpot renderizou em IFRAME (fallback do embed). ' +
        'Os campos ocultos NÃO serão preenchidos por esta página. ' +
        'Verifique se o script carregado é o /forms/embed/developer/ e se o container ' +
        'usa a classe hs-form-html.'
      );
    }
  }

  new MutationObserver(fillAll).observe(scope === document ? document.body : scope,
    { childList: true, subtree: true });
  [300, 800, 1500, 3000, 5000].forEach(function (t) { setTimeout(fillAll, t); });
  setTimeout(verificarDegradacao, 6000);
})();
