/**
 * IXC — normalização do campo CNPJ do formulário HubSpot.
 * ─────────────────────────────────────────────────────────────────────────
 * REGRA QUE GOVERNA ESTE ARQUIVO: nunca bloquear o envio.
 *
 * O objetivo é não perder contato. Um CNPJ malformado é um problema de dado;
 * um formulário que recusa o envio é um lead perdido. Sempre que houver dúvida
 * entre "corrigir" e "deixar passar", este arquivo deixa passar.
 *
 * POR QUE NORMALIZAR ENQUANTO DIGITA, E NÃO NO SUBMIT
 * ---------------------------------------------------
 * O embed v4 do HubSpot (React) costuma enviar por `fetch` SEM disparar
 * `submit` nativo — está documentado em js/hubspot-listener.js, medido em
 * 2026-08-10. Um `addEventListener('submit')` simplesmente não roda em boa
 * parte dos envios. Normalizando a cada tecla, o valor já está canônico quando
 * o envio acontecer, por qualquer via.
 *
 * POR QUE LISTENER DELEGADO NO document, E NÃO querySelector
 * -----------------------------------------------------------
 * Os campos do embed v4 podem viver em shadow DOM, onde `querySelectorAll` do
 * documento não alcança e `ev.target` vem retargetado para o host.
 * `composedPath()[0]` devolve o input de verdade. Mesmo motivo, mesma solução
 * do hubspot-listener.js.
 *
 * FORMATO CANÔNICO: alfanumérico, sem pontuação, caixa alta
 * ----------------------------------------------------------
 * Escolhido a partir dos dados que já existem no portal (28 contatos com
 * `qual_seu_cnpj` em 2026-09-10): 17 de 20 amostrados já estão sem pontuação,
 * como `55446008000178`. Só um estava formatado. Gravar formatado agora criaria
 * um segundo padrão na mesma propriedade e quebraria qualquer deduplicação.
 *
 * Sem pontuação também é o formato mais compatível com validação de formulário:
 * se o campo estiver marcado como numérico no editor do HubSpot, `51.183.908/`
 * seria recusado — e o lead, perdido.
 *
 * CNPJ ALFANUMÉRICO
 * -----------------
 * Desde julho/2026 o CNPJ novo aceita LETRAS nas 12 primeiras posições (as 2
 * últimas seguem numéricas). Por isso este arquivo preserva letras em vez de
 * filtrar `\D`. Um filtro de dígitos — o reflexo natural de quem escreve máscara
 * de CNPJ — apagaria o documento inteiro desses contatos.
 * ───────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var TAMANHO = 14;

  /* O input do HubSpot vem como "0-1/qual_seu_cnpj" ou com prefixo "var_". */
  function chave(nome) {
    if (!nome) return '';
    var k = nome.indexOf('/') !== -1 ? nome.split('/').pop() : nome;
    return k.replace(/^var_/, '').toLowerCase();
  }

  /* Em shadow DOM o ev.target vem retargetado para o host. */
  function alvo(ev) {
    var p = typeof ev.composedPath === 'function' ? ev.composedPath() : null;
    return (p && p.length) ? p[0] : ev.target;
  }

  function rotulo(el) {
    var txt = '';
    try {
      txt += (el.getAttribute('aria-label') || '') + ' ';
      txt += (el.placeholder || '') + ' ';
      if (el.id) {
        var raiz = el.getRootNode ? el.getRootNode() : document;
        var lb = raiz.querySelector && raiz.querySelector('label[for="' + el.id + '"]');
        if (lb) txt += (lb.textContent || '') + ' ';
      }
      var pai = el.closest && el.closest('label');
      if (pai) txt += (pai.textContent || '');
    } catch (e) {}
    return txt;
  }

  function ehCampoCnpj(el) {
    if (!el || el.tagName !== 'INPUT') return false;
    if (el.type === 'checkbox' || el.type === 'radio') return false;
    if (/cnpj/i.test(chave(el.name))) return true;
    return /cnpj/i.test(rotulo(el));
  }

  function contarValidos(s) {
    var m = s.match(/[0-9A-Za-z]/g);
    return m ? m.length : 0;
  }

  /**
   * Decide se o texto é uma TENTATIVA de CNPJ.
   *
   * Se não for, o valor é devolvido intacto. É isto que preserva respostas como
   * "Me liga pelo whats" e "Entre em contato" — que existem de verdade no
   * portal e são leads reais. Higienizar esse texto o transformaria em
   * "MELIGAPELOWHAT", que não ajuda ninguém e ainda destrói o recado.
   */
  function ehTentativa(bruto, limpo) {
    var digitos = (bruto.match(/\d/g) || []).length;
    if (digitos >= 8) return true;
    /* Borda do CNPJ alfanumérico: raiz toda em letras deixa só os 2 dígitos
       verificadores. Poucos dígitos, mas o formato é inconfundível. */
    return limpo.length === TAMANHO && /\d\d$/.test(limpo);
  }

  function normalizar(bruto) {
    var limpo = String(bruto).replace(/[^0-9A-Za-z]/g, '').toUpperCase();
    if (!limpo) return bruto;
    if (!ehTentativa(bruto, limpo)) return bruto;
    /* Corta em 14 ENQUANTO digita — é prevenção, não correção: a pessoa vê o
       campo parar e percebe o dedo pesado. Cortar depois, no envio, geraria um
       CNPJ plausível e errado, que é pior que um visivelmente errado. */
    return limpo.slice(0, TAMANHO);
  }

  /* React ignora `el.value = x`: o setter da instância é substituído pelo dele.
     Chamar o setter do prototype e disparar input/change é o que faz o estado
     interno do React acompanhar. Mesmo mecanismo do js/utm-capture.js. */
  function definirValor(el, valor) {
    var proto = window.HTMLInputElement.prototype;
    var setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
    setter.call(el, valor);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /**
   * `type="number"` apagaria o CNPJ alfanumérico (letras não são digitáveis) e
   * come zero à esquerda. Trocar para texto é seguro: o valor não muda, só o
   * que o campo passa a aceitar. Se o React reescrever o atributo no próximo
   * render, ficamos como estávamos — daí o try/catch e nenhuma insistência.
   */
  function garantirTexto(el) {
    if (el.type !== 'number') return;
    try {
      el.type = 'text';
      el.inputMode = 'numeric';
    } catch (e) {}
  }

  function tratar(ev) {
    var el = alvo(ev);
    if (!ehCampoCnpj(el)) return;

    garantirTexto(el);

    var antes = el.value;
    var depois = normalizar(antes);
    if (depois === antes) return;

    /* Só removemos caracteres, nunca inserimos — então contar alfanuméricos
       antes do cursor basta para devolvê-lo ao lugar certo. Sem isto o cursor
       pula para o fim a cada pontuação digitada e editar o meio do campo vira
       um exercício de paciência. */
    var validos = null;
    try { validos = contarValidos(antes.slice(0, el.selectionStart)); } catch (e) {}

    definirValor(el, depois);

    if (validos !== null) {
      var pos = 0, contados = 0;
      while (pos < depois.length && contados < validos) { pos++; contados++; }
      try { el.setSelectionRange(pos, pos); } catch (e) {}
    }
  }

  /* Captura: o listener do React roda no alvo, este roda antes, na descida. */
  document.addEventListener('input', tratar, true);
  document.addEventListener('change', tratar, true);
})();
