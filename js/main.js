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

function initVideo(isTouch) {
  if (isTouch) return;
  const video = document.getElementById('heroVideo');
  if (!video) return;
  const source = video.querySelector('source[data-src]');
  if (!source) return;
  source.src = source.dataset.src;
  video.load();
  video.play().catch(() => {});
}

window.addEventListener('load', () => {
  const loader = document.getElementById('pageLoader');
  if (loader) setTimeout(() => loader.classList.add('hidden'), 400);

  requestAnimationFrame(() => {
    const isTouch = window.matchMedia('(hover:none) and (pointer:coarse)').matches;

    initLenis(isTouch);
    initHeader();
    initMobileNav();
    initAnchorLinks();
    initVideo(isTouch);

    const anim = window.LPAnimations;

    if (!isTouch) anim.initHeroParallax();

    function initBelowFold() {
      anim.initBelowFoldObservers();
      if (!isTouch) anim.initBentoMouseGlow();
      anim.initHubspotModal();
    }

    'requestIdleCallback' in window
      ? requestIdleCallback(initBelowFold, { timeout: 2000 })
      : setTimeout(initBelowFold, 200);
  });

}, { once: true });
