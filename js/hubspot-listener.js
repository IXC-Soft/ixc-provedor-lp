/**
 * IXC — captura de identidade do lead no formulário HubSpot.
 * ─────────────────────────────────────────────────────────────────────────
 * Grava e-mail, telefone, nome e sobrenome em localStorage. As variáveis
 * `👥 LEAD — *` do GTM leem daqui, e alimentam o Advanced Matching do Meta e o
 * Enhanced Conversions do Google na página de obrigado.
 *
 * POR QUE ISTO SAIU DO GTM
 * ------------------------
 * Isto era uma tag de HTML personalizado (`245 · 🧩 7.1 [HS] Listener`). A API
 * do Tag Manager **recusa escrita em HTML personalizado** — testado em
 * 2026-08-10: a mesma credencial, na mesma workspace, editou uma tag de template
 * sem problema e recebeu `404 Not Found` três vezes na de HTML, inclusive com
 * payload mínimo. Custom HTML injeta JS arbitrário no site; é razoável que a
 * plataforma trate diferente.
 *
 * Aqui, o código vive no repositório: versionado, revisável em diff, e corrigível
 * sem depender de alguém colar texto num painel.
 *
 * O DEFEITO QUE ISTO CORRIGE
 * --------------------------
 * A versão anterior capturava **apenas no evento `submit`**. O embed v4 do
 * HubSpot (React) costuma enviar por `fetch` **sem disparar `submit` nativo** —
 * então nada era gravado, e o Gerenciador de Eventos do Meta reportava
 * **cobertura ZERO** de e-mail e telefone, com o Advanced Matching
 * aparentemente configurado.
 *
 * Falha silenciosa: a tag disparava, o Preview mostrava sucesso, o parâmetro ia
 * vazio. Cobertura zero — e não parcial — foi o que denunciou.
 *
 * DIVISÃO DE RESPONSABILIDADE, DE PROPÓSITO
 * -----------------------------------------
 * Este arquivo **NÃO** empurra `hubspot_form_submit` para o dataLayer. Esse push
 * continua na tag do GTM, que faz isso corretamente. Se os dois empurrassem, o
 * evento de formulário contaria em dobro.
 *
 *   este arquivo  → identidade (o que estava quebrado)
 *   tag do GTM    → dataLayer.push (o que já funcionava)
 *
 * Carregar com `defer`, antes de `</` + `body>`. Não precisa ser síncrono: só
 * precisa existir antes de a pessoa terminar de digitar.
 * ───────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var MAP = {
    email: 'lead_email',
    firstname: 'lead_firstname',
    lastname: 'lead_lastname',
    name: 'lead_firstname',
    nome: 'lead_firstname',
    sobrenome: 'lead_lastname',
    phone: 'lead_phone',
    mobilephone: 'lead_phone',
    telefone: 'lead_phone',
    celular: 'lead_phone'
  };

  /* O input do HubSpot vem como "0-1/email" ou com prefixo "var_". */
  function chave(nome) {
    if (!nome) return '';
    var k = nome.indexOf('/') !== -1 ? nome.split('/').pop() : nome;
    return k.replace(/^var_/, '').toLowerCase();
  }

  /* Em shadow DOM o ev.target vem retargetado para o host e os campos ficam
     inalcançáveis. composedPath() devolve o elemento de verdade. */
  function alvo(ev) {
    var p = typeof ev.composedPath === 'function' ? ev.composedPath() : null;
    return (p && p.length) ? p[0] : ev.target;
  }

  /* Descobre o destino do campo. Por nome quando existe; por TIPO quando não.
     Medido em navegador em 2026-08-10: o componente de telefone do HubSpot v4
     renderiza um <input type="tel"> VISÍVEL e SEM atributo `name` — o nome
     `0-1/phone` vive num campo espelho. Casar só por nome deixava o telefone de
     fora, e era por isso que ele nunca chegava ao Advanced Matching do Meta. */
  function destino(el) {
    var porNome = MAP[chave(el.name)];
    if (porNome) return porNome;
    if (el.type === 'tel') return 'lead_phone';
    if (el.type === 'email') return 'lead_email';
    return null;
  }

  function gravar(el) {
    if (!el || !el.value) return;
    var d = destino(el);
    if (!d) return;
    try { localStorage.setItem(d, String(el.value)); } catch (e) {}
  }

  /* ── 1. Caminho principal: grava enquanto a pessoa digita ────────────────
     É o único que não depende de COMO o formulário é enviado. Quando o envio
     acontecer — por submit, por fetch, por qualquer via — o valor já está lá. */
  document.addEventListener('input', function (ev) { gravar(alvo(ev)); }, true);
  document.addEventListener('change', function (ev) { gravar(alvo(ev)); }, true);

  /* ── 2. Submit: redundância, para embeds que disparam submit nativo ────── */
  document.addEventListener('submit', function (ev) {
    var f = alvo(ev);
    if (!f || !f.querySelectorAll) f = ev.target;
    if (!f || !f.querySelectorAll) return;
    var campos = f.querySelectorAll('input,select,textarea');
    for (var i = 0; i < campos.length; i++) gravar(campos[i]);
  }, true);

  /* ── 3. Iframe: o embed clássico manda os valores por postMessage ───────
     Sem push de dataLayer aqui — ver a divisão de responsabilidade acima. */
  window.addEventListener('message', function (ev) {
    var d = ev.data;
    if (!d || d.type !== 'hsFormCallback' || d.eventName !== 'onFormSubmitted') return;
    try {
      var valores = (d.data && d.data.submissionValues) || {};
      for (var k in valores) {
        var destino = MAP[chave(k)];
        if (destino && valores[k]) {
          try { localStorage.setItem(destino, String(valores[k])); } catch (e) {}
        }
      }
    } catch (e) {}
  });
})();
