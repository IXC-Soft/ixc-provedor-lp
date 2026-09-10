document.addEventListener('DOMContentLoaded', () => {
  // --- Header Scroll Effect ---
  const header = document.querySelector('header');
  const handleScroll = () => {
    if (window.scrollY > 20) {
      // Verifica se a seção atual exige header escuro ou claro (ex: seções escuras)
      const scrollPosition = window.scrollY;
      const darkSections = document.querySelectorAll('.dark-section, .final-cta-section');
      let isOverDarkSection = false;

      darkSections.forEach(section => {
        const top = section.offsetTop - 80;
        const bottom = top + section.offsetHeight;
        if (scrollPosition >= top && scrollPosition <= bottom) {
          isOverDarkSection = true;
        }
      });

      if (isOverDarkSection) {
        header.classList.add('scrolled-dark');
        header.classList.remove('scrolled');
      } else {
        header.classList.add('scrolled');
        header.classList.remove('scrolled-dark');
      }
    } else {
      header.classList.remove('scrolled', 'scrolled-dark');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  // Executa uma vez no início para checar estado inicial
  handleScroll();

  // --- Scroll to Top Button ---
  const scrollTopBtn = document.querySelector('.scroll-top-btn');
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // --- Smooth Anchor Scrolling Offset ---
  document.querySelectorAll('a[href^="#"]:not(.btn)').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // --- Lead Modal Handling ---
  const leadModal = document.getElementById('lead-modal');
  const closeBtn = document.getElementById('modal-close-btn');

  const openModal = () => {
    if (leadModal) {
      leadModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      leadModal.setAttribute('aria-hidden', 'false');
    }
  };

  const closeModal = () => {
    if (leadModal) {
      leadModal.classList.add('closing');
      setTimeout(() => {
        leadModal.classList.remove('active', 'closing');
        document.body.style.overflow = '';
        leadModal.setAttribute('aria-hidden', 'true');
      }, 300);
    }
  };

  // Selecionar todos os botões de CTA da landing page
  const ctaButtons = document.querySelectorAll('.btn');
  ctaButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  // Fechar ao clicar no overlay escuro (fora do modal)
  if (leadModal) {
    leadModal.addEventListener('click', (e) => {
      if (e.target === leadModal) {
        closeModal();
      }
    });
  }

  // Fechar ao pressionar a tecla ESC
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && leadModal && leadModal.classList.contains('active')) {
      closeModal();
    }
  });



  // --- Elements Horizontal Card Carousel (Section 3: Iluminar Fibra) ---
  const initElementsCarousel = () => {
    const track = document.querySelector('.elements-grid');
    const prevBtn = document.querySelector('.elements-carousel-arrow--prev');
    const nextBtn = document.querySelector('.elements-carousel-arrow--next');

    if (!track || !prevBtn || !nextBtn) return;

    const cards = track.querySelectorAll('.element-card');
    if (!cards.length) return;

    // Obtém a largura de rolagem dinâmica (largura do card + gap real)
    const getScrollDistance = () => {
      const firstCard = cards[0];
      const secondCard = cards[1];
      if (firstCard && secondCard) {
        // Distância exata entre os inícios de dois cards consecutivos (inclui gap)
        return secondCard.offsetLeft - firstCard.offsetLeft;
      }
      const trackStyle = window.getComputedStyle(track);
      const gap = parseFloat(trackStyle.gap) || 24;
      return (firstCard ? firstCard.offsetWidth : 300) + gap;
    };

    // Atualiza estados disabled e aria-disabled dos botões de seta
    const updateArrowsState = () => {
      const scrollLeft = track.scrollLeft;
      const clientWidth = track.clientWidth;
      const scrollWidth = track.scrollWidth;
      const tolerance = 6; // Tolerância para subpixels e arredondamentos

      const isAtStart = scrollLeft <= tolerance;
      const isAtEnd = scrollLeft + clientWidth >= scrollWidth - tolerance;

      prevBtn.disabled = isAtStart;
      prevBtn.setAttribute('aria-disabled', isAtStart ? 'true' : 'false');

      nextBtn.disabled = isAtEnd;
      nextBtn.setAttribute('aria-disabled', isAtEnd ? 'true' : 'false');
    };

    // Navegação suave considerando preferências de movimento reduzido
    const scrollByStep = (direction) => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const behavior = prefersReducedMotion ? 'auto' : 'smooth';
      const distance = getScrollDistance() * direction;

      track.scrollBy({
        left: distance,
        behavior: behavior
      });
    };

    nextBtn.addEventListener('click', () => scrollByStep(1));
    prevBtn.addEventListener('click', () => scrollByStep(-1));

    // Atualiza estado das setas em scroll e resize
    track.addEventListener('scroll', updateArrowsState, { passive: true });
    window.addEventListener('resize', updateArrowsState, { passive: true });

    // Acessibilidade por teclado: garantir que card focado via Tab esteja visível
    cards.forEach(card => {
      card.addEventListener('focusin', () => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        card.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'nearest',
          inline: 'nearest'
        });
      });
    });

    // --- Suporte a Mouse Drag Desktop (Pointer Events) ---
    let isPointerDown = false;
    let isDragging = false;
    let hasDragged = false;
    let dragStartX = 0;
    let dragStartScrollLeft = 0;
    const DRAG_THRESHOLD = 6; // Threshold em pixels para distinguir click de drag

    const onPointerDown = (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;

      isPointerDown = true;
      hasDragged = false;
      dragStartX = e.clientX;
      dragStartScrollLeft = track.scrollLeft;

      if (track.setPointerCapture) {
        try {
          track.setPointerCapture(e.pointerId);
        } catch (err) {
          // Fallback silencioso se falhar
        }
      }
    };

    const onPointerMove = (e) => {
      if (!isPointerDown || e.pointerType !== 'mouse') return;

      const deltaX = e.clientX - dragStartX;

      if (!isDragging && Math.abs(deltaX) > DRAG_THRESHOLD) {
        isDragging = true;
        hasDragged = true;
        track.classList.add('is-dragging');
      }

      if (isDragging) {
        track.scrollLeft = dragStartScrollLeft - deltaX;
      }
    };

    const onPointerUpOrCancel = (e) => {
      if (e.pointerType !== 'mouse') return;

      if (isPointerDown) {
        isPointerDown = false;

        if (isDragging) {
          isDragging = false;
          track.classList.remove('is-dragging');
          updateArrowsState();
        }

        if (track.releasePointerCapture && track.hasPointerCapture && track.hasPointerCapture(e.pointerId)) {
          try {
            track.releasePointerCapture(e.pointerId);
          } catch (err) {
            // Fallback silencioso
          }
        }
      }
    };

    track.addEventListener('pointerdown', onPointerDown);
    track.addEventListener('pointermove', onPointerMove);
    track.addEventListener('pointerup', onPointerUpOrCancel);
    track.addEventListener('pointercancel', onPointerUpOrCancel);

    // Evita ativação indevida de click/navegação apenas após drag real
    track.addEventListener('click', (e) => {
      if (hasDragged) {
        e.preventDefault();
        e.stopPropagation();
        hasDragged = false;
      }
    }, true);

    // Estado inicial
    updateArrowsState();
  };

  initElementsCarousel();

  // --- Seção 5: Features Accordion (Single-Open & Acessível) ---
  const initFeaturesAccordion = () => {
    const accordion = document.getElementById('featuresAccordion');
    if (!accordion) return;

    const items = accordion.querySelectorAll('[data-accordion-item]');
    if (!items.length) return;

    // Definição de estado inicial:
    // Faixa 1024px a 1279px: todos iniciam fechados
    // Demais faixas (Mobile <1024px, Desktop >=1280px): somente o primeiro item inicia aberto
    const is1024Breakpoint = window.matchMedia('(min-width: 1024px) and (max-width: 1279px)').matches;
    
    items.forEach((item, index) => {
      const trigger = item.querySelector('.accordion-trigger');
      if (is1024Breakpoint) {
        item.classList.remove('active');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      } else {
        if (index === 0) {
          item.classList.add('active');
          if (trigger) trigger.setAttribute('aria-expanded', 'true');
        } else {
          item.classList.remove('active');
          if (trigger) trigger.setAttribute('aria-expanded', 'false');
        }
      }
    });

    const toggleItem = (targetItem) => {
      const isCurrentlyActive = targetItem.classList.contains('active');

      // Comportamento Single-Open: fecha todos os outros itens
      items.forEach(item => {
        const trigger = item.querySelector('.accordion-trigger');
        item.classList.remove('active');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      });

      // Se o item clicado estava fechado, abre-o
      if (!isCurrentlyActive) {
        const targetTrigger = targetItem.querySelector('.accordion-trigger');
        targetItem.classList.add('active');
        if (targetTrigger) targetTrigger.setAttribute('aria-expanded', 'true');
      }
    };

    items.forEach(item => {
      const trigger = item.querySelector('.accordion-trigger');
      if (!trigger) return;

      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        toggleItem(item);
      });
    });
  };

  initFeaturesAccordion();
});

