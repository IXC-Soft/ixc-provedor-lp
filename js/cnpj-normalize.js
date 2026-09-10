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
 * FORMATO: máscara pontuada, 00.000.000/0000-00
 * ----------------------------------------------
 * Decisão do time em 2026-09-10: o campo deve inserir `.`, `/` e `-` conforme
 * a pessoa digita. A pontuação entra sozinha; ninguém precisa digitá-la, e
 * digitá-la também não atrapalha.
 *
 * Registrado para quem mexer aqui depois: os 28 contatos que já existiam em
 * `qual_seu_cnpj` estão majoritariamente SEM pontuação (17 de 20 amostrados,
 * como `55446008000178`). A partir daqui a propriedade passa a ter os dois
 * formatos. Se algum dia for preciso deduplicar ou cruzar com a Receita,
 * compare sempre `replace(/[^0-9A-Za-z]/g, '')` dos dois lados, nunca a string
 * crua.
 *
 * ⚠ Se o campo estiver marcado como NUMÉRICO no editor do HubSpot, a máscara
 * será recusada por ele e o lead se perde. O campo precisa estar como texto de
 * linha única, sem validação. Isso é configuração de portal, não tem conserto
 * pelo lado do site.
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

  /* Índice logo depois do n-ésimo caractere alfanumérico. */
  function posApos(s, n) {
    if (n <= 0) return 0;
    var c = 0;
    for (var i = 0; i < s.length; i++) {
      if (/[0-9A-Za-z]/.test(s.charAt(i))) {
        c++;
        if (c === n) return i + 1;
      }
    }
    return s.length;
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
    /* Sem nenhum dígito é recado, não documento. */
    if (!/\d/.test(limpo)) return false;

    /* Só dígitos, de qualquer tamanho: mascara desde a primeira tecla. Inclui
       o caso de quem digita a mais — o corte em 14 resolve depois. */
    if (/^[0-9]+$/.test(limpo)) return true;

    /* Formato exato do CNPJ alfanumérico: 14 posições terminando em 2 dígitos
       verificadores. Cobre a borda da raiz toda em letras, que tem só 2
       dígitos e não passaria pela proporção abaixo. */
    if (limpo.length === TAMANHO && /\d\d$/.test(limpo)) return true;

    /* Mais longo que um CNPJ e com letras no meio: é frase. */
    if (limpo.length > TAMANHO) return false;

    /* Sobra a mistura. Dígito em minoria indica texto com número solto
       ("nao tenho 2 cnpjs"), não documento. */
    var digitos = (limpo.match(/\d/g) || []).length;
    return digitos * 2 >= limpo.length;
  }

  /**
   * Insere a pontuação nas posições do CNPJ: 00.000.000/0000-00
   *
   * O separador entra ANTES do caractere seguinte, nunca sobrando pendurado no
   * fim. Digitar "12" mostra "12", não "12." — e apagar não deixa lixo para
   * trás. Máscara que pendura separador obriga a apagar duas vezes.
   */
  function formatar(limpo) {
    var out = '';
    for (var i = 0; i < limpo.length; i++) {
      if (i === 2 || i === 5) out += '.';
      else if (i === 8) out += '/';
      else if (i === 12) out += '-';
      out += limpo.charAt(i);
    }
    return out;
  }

  function normalizar(bruto) {
    var limpo = String(bruto).replace(/[^0-9A-Za-z]/g, '').toUpperCase();
    if (!limpo) return bruto;
    if (!ehTentativa(bruto, limpo)) return bruto;
    /* Corta em 14 ENQUANTO digita — é prevenção, não correção: a pessoa vê o
       campo parar e percebe o dedo pesado. Cortar depois, no envio, geraria um
       CNPJ plausível e errado, que é pior que um visivelmente errado. */
    return formatar(limpo.slice(0, TAMANHO));
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

    /* A máscara INSERE pontuação, então a posição do cursor muda de índice. O
       que se conserva é quantos caracteres ÚTEIS existem antes dele: recoloco o
       cursor depois do mesmo número de alfanuméricos no texto novo. Sem isto o
       cursor pula para o fim a cada separador inserido, e editar o meio do
       campo vira um exercício de paciência. */
    var validos = null;
    try { validos = contarValidos(antes.slice(0, el.selectionStart)); } catch (e) {}

    definirValor(el, depois);

    if (validos !== null) {
      try { el.setSelectionRange(posApos(depois, validos), posApos(depois, validos)); } catch (e) {}
    }
  }

  /* Captura: o listener do React roda no alvo, este roda antes, na descida. */
  document.addEventListener('input', tratar, true);
  document.addEventListener('change', tratar, true);
})();
