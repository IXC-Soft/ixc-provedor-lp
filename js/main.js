'use strict';

let lenis;

function initLenis(isTouch) {
  if (isTouch) return;
  lenis = new Lenis({
    duration: 1.2,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
  });
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  // Exposto para o modal do HubSpot pausar o scroll suavizado enquanto está aberto.
  // Sem isso o Lenis captura o wheel e rola a página atrás em vez do formulário.
  window.lpLenis = lenis;
}

function initHeader() {
  const header = document.getElementById('siteHeader');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 80);
  }, { passive: true });
}

function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('headerNav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    const spans = toggle.querySelectorAll('span');
    if (isOpen) {
      gsap.to(spans[0], { y: 7,  rotation:  45, duration: 0.3, ease: 'power2.out' });
      gsap.to(spans[1], { opacity: 0,            duration: 0.2 });
      gsap.to(spans[2], { y: -7, rotation: -45, duration: 0.3, ease: 'power2.out' });
    } else {
      gsap.to(spans[0], { y: 0, rotation: 0, duration: 0.3, ease: 'power2.out' });
      gsap.to(spans[1], { opacity: 1,          duration: 0.2 });
      gsap.to(spans[2], { y: 0, rotation: 0, duration: 0.3, ease: 'power2.out' });
    }
  });

  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));

  document.addEventListener('click', e => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

function initAnchorLinks() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      lenis
        ? lenis.scrollTo(target, { offset: -80, duration: 1.4 })
        : target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

function initVideo() {
  const video = document.getElementById('heroVideo');
  if (!video) return;
  // src is declared natively; this is a fallback for browsers that block autoplay
  video.play().catch(() => {});
}

/* ── CTA do formulário: ligado ANTES do window.load ───────────────
   O window.load desta página leva ~18s em 4G lento (o vídeo do hero tem 1,9 MB).
   Enquanto os handlers ficavam dentro do load, clicar em "Solicitar demo" não
   fazia nada nesse intervalo inteiro — medido: modal não abria. Este script é
   `defer`, então roda com o DOM já completo: dá para ligar o modal aqui e o
   botão passa a funcionar assim que o HTML termina de ser lido.
   O download do script do HubSpot continua fora do caminho crítico — quem
   controla isso é o armPreload() em animations.js. */
window.LPAnimations.initHubspotModal();

window.addEventListener('load', () => {
  const loader = document.getElementById('pageLoader');
  if (loader) setTimeout(() => loader.classList.add('hidden'), 400);

  requestAnimationFrame(() => {
    const isTouch = window.matchMedia('(hover:none) and (pointer:coarse)').matches;

    initLenis(isTouch);
    initHeader();
    initMobileNav();
    initAnchorLinks();
    initVideo();

    const anim = window.LPAnimations;

    if (!isTouch) anim.initHeroParallax();

    function initBelowFold() {
      anim.initBelowFoldObservers();
      if (!isTouch) anim.initBentoMouseGlow();
      // initHubspotModal saiu daqui: agora roda no topo deste arquivo, antes do load.
    }

    'requestIdleCallback' in window
      ? requestIdleCallback(initBelowFold, { timeout: 2000 })
      : setTimeout(initBelowFold, 200);
  });

}, { once: true });
