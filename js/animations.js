'use strict';

/* ── Hero parallax (desktop only) ────────────────────────────── */
function initHeroParallax() {
  const video = document.querySelector('.hero-video');
  if (!video) return;
  let rafId;
  window.addEventListener('scroll', () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      video.style.transform = `translateY(${window.scrollY * 0.08}px)`;
      rafId = null;
    });
  }, { passive: true });
}

/* ── Below fold: IntersectionObserver (assíncrono, sem forced reflow) ── */
function initBelowFoldObservers() {
  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      const el = entry.target;

      if (el.id === 'statsGrid') {
        gsap.to(gsap.utils.toArray('.metric-item'), {
          opacity: 1, y: 0, duration: 0.85, stagger: 0.16, ease: 'power3.out',
        });
        document.querySelectorAll('.stat-number[data-target]').forEach(num => {
          const target = parseInt(num.dataset.target, 10);
          const prefix = num.dataset.prefix || '';
          const proxy  = { val: 0 };
          const fmt    = v => target >= 1e6
            ? prefix + Math.round(v / 1e6) + 'M'
            : prefix + v.toLocaleString('pt-BR');
          gsap.to(proxy, { val: target, duration: 2.2, ease: 'power2.out',
            onUpdate() { num.textContent = fmt(Math.round(proxy.val)); } });
        });

      } else if (el.matches('.authority-content')) {
        gsap.from('.authority-content > *', { opacity: 0, y: 24, duration: 0.7, stagger: 0.14, ease: 'power3.out' });

      } else if (el.matches('.bento-header')) {
        gsap.from('.bento-header > *', { opacity: 0, y: 20, duration: 0.7, stagger: 0.12, ease: 'power3.out' });

      } else if (el.id === 'bentoGrid') {
        gsap.fromTo('[data-bento-card]',
          { opacity: 0, y: 44, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.72, stagger: { each: 0.11, from: 'start' }, ease: 'power3.out' }
        );

      } else if (el.id === 'manifesto') {
        const mainEl    = document.getElementById('manifestoMain');
        const supportEl = document.getElementById('manifestoSupport');
        if (!mainEl) return;
        mainEl.innerHTML = mainEl.textContent.trim().split(/\s+/)
          .map(w => `<span class="manifesto-word">${w}</span>`).join(' ');
        gsap.timeline()
          .fromTo('.manifesto-word', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.038, ease: 'power2.out' })
          .fromTo(supportEl, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' }, '-=0.15');

      } else if (el.id === 'goodbye') {
        gsap.timeline()
          .to('#goodbyeTitle',   { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
          .to('#goodbyeDesc',    { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4')
          .to('#goodbyeActions', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3');
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });

  ['#statsGrid', '.authority-content', '.bento-header', '#bentoGrid', '#manifesto', '#goodbye']
    .forEach(sel => {
      const el = document.querySelector(sel);
      if (el) io.observe(el);
    });
}

/* ── Bento mouse-glow (desktop only) ─────────────────────────── */
function initBentoMouseGlow() {
  document.querySelectorAll('.bento-card').forEach(card => {
    let rafId = null;
    card.addEventListener('mousemove', e => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', ((e.clientX - r.left) / r.width  * 100) + '%');
        card.style.setProperty('--mouse-y', ((e.clientY - r.top)  / r.height * 100) + '%');
        rafId = null;
      });
    });
    card.addEventListener('mouseleave', () => {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      card.style.removeProperty('--mouse-x');
      card.style.removeProperty('--mouse-y');
    });
  });
}

/* ── HubSpot modal ────────────────────────────────────────────── */
function initHubspotModal() {
  const overlay  = document.getElementById('hsModalOverlay');
  const modal    = document.getElementById('hsModal');
  const closeBtn = document.getElementById('hsModalClose');
  if (!overlay) return;

  let hsLoaded = false;
  function loadHubspot() {
    if (hsLoaded) return;
    hsLoaded = true;
    const s = document.createElement('script');
    // Embed INLINE ("developer"): renderiza no DOM desta pagina, o que permite ao
    // js/utm-capture.js preencher os campos ocultos de UTM. Com o iframe isso e
    // impossivel (cross-origin) e nenhuma UTM chega ao HubSpot.
    //
    // Este script tem fallback proprio: se a definicao SSR do formulario falhar,
    // ele troca a classe de hs-form-html para hs-form-frame e carrega o embed
    // classico. E por isso que as regras hs-* seguem em css/styles.css.
    s.src = 'https://js.hsforms.net/forms/embed/developer/50388221.js';
    document.head.appendChild(s);
  }

  function openModal() {
    loadHubspot();
    overlay.classList.add('is-open');
    gsap.to(overlay, { opacity: 1, duration: 0.3, ease: 'power2.out' });
    gsap.fromTo(modal, { scale: 0.92, opacity: 0, y: 16 }, { scale: 1, opacity: 1, y: 0, duration: 0.38, ease: 'back.out(1.4)' });
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    gsap.to(modal, { scale: 0.95, opacity: 0, y: 8, duration: 0.2, ease: 'power2.in' });
    gsap.to(overlay, { opacity: 0, duration: 0.28, ease: 'power2.in',
      onComplete() { overlay.classList.remove('is-open'); gsap.set(modal, { clearProps: 'all' }); } });
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-hs-modal]').forEach(btn =>
    btn.addEventListener('click', e => { e.preventDefault(); openModal(); })
  );
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal();
  });
}

window.LPAnimations = {
  initHeroParallax,
  initBelowFoldObservers,
  initBentoMouseGlow,
  initHubspotModal,
};
