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

  // --- Mobile Navigation Menu ---
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileNavClose = document.querySelector('.mobile-nav-close');
  const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
  const mobileNavDrawer = document.querySelector('.mobile-nav-drawer');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-links a');

  const openMobileNav = () => {
    mobileNavOverlay.classList.add('active');
    mobileNavDrawer.classList.add('active');
    document.body.style.overflow = 'hidden'; // Impede o scroll do body quando aberto
  };

  const closeMobileNav = () => {
    mobileNavOverlay.classList.remove('active');
    mobileNavDrawer.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (menuToggle) menuToggle.addEventListener('click', openMobileNav);
  if (mobileNavClose) mobileNavClose.addEventListener('click', closeMobileNav);
  if (mobileNavOverlay) mobileNavOverlay.addEventListener('click', closeMobileNav);

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileNav();
    });
  });

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

  // --- SVG Network Interaction ---
  // Mapa do Hero: Iluminar fibra ao passar o mouse nas conexões/cabo ou CTOs
  const mapNodes = document.querySelectorAll('.map-node');
  const mapLines = document.querySelectorAll('.map-line');
  const infoToast = document.getElementById('map-toast');
  const infoToastText = document.getElementById('map-toast-text');

  mapNodes.forEach(node => {
    node.addEventListener('mouseenter', (e) => {
      const type = node.getAttribute('data-type') || 'Elemento';
      const name = node.getAttribute('data-name') || 'Equipamento';
      const status = node.getAttribute('data-status') || 'Operacional';
      
      // Iluminar as linhas conectadas a este nó
      const nodeId = node.getAttribute('id');
      mapLines.forEach(line => {
        if (line.getAttribute('data-connected-to')?.includes(nodeId)) {
          line.style.stroke = '#00BDD2';
          line.style.strokeWidth = '3px';
          line.style.filter = 'drop-shadow(0 0 6px rgba(0, 189, 210, 0.8))';
        }
      });

      if (infoToast && infoToastText) {
        infoToastText.innerHTML = `<strong>${type}:</strong> ${name} <span style="color: ${status === 'Alerta' ? '#FF5F57' : '#00BDD2'}">(${status})</span>`;
        infoToast.style.opacity = '1';
        infoToast.style.transform = 'translateY(0)';
      }
    });

    node.addEventListener('mouseleave', () => {
      const nodeId = node.getAttribute('id');
      mapLines.forEach(line => {
        if (line.getAttribute('data-connected-to')?.includes(nodeId)) {
          line.style.stroke = '';
          line.style.strokeWidth = '';
          line.style.filter = '';
        }
      });

      if (infoToast) {
        infoToast.style.opacity = '0';
        infoToast.style.transform = 'translateY(10px)';
      }
    });
  });

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
      // Fecha a navegação mobile se estiver aberta para não conflitar
      if (mobileNavOverlay && mobileNavOverlay.classList.contains('active')) {
        mobileNavOverlay.classList.remove('active');
        mobileNavDrawer.classList.remove('active');
      }
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
        // Só restaura o scroll se a navegação mobile também não estiver ativa
        if (!mobileNavDrawer || !mobileNavDrawer.classList.contains('active')) {
          document.body.style.overflow = '';
        }
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

  // --- Window Showcase Carousel ---
  const carousel = document.querySelector('.window-carousel');
  if (carousel) {
    const items = carousel.querySelectorAll('.window-carousel-item');
    let currentIndex = 0;
    const intervalTime = 4000; // 4 segundos
    let carouselInterval;

    const showSlide = (index) => {
      items.forEach((item, i) => {
        if (i === index) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    };

    const nextSlide = () => {
      currentIndex = (currentIndex + 1) % items.length;
      showSlide(currentIndex);
    };

    const startCarousel = () => {
      // Respeita preferência por redução de movimento
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReducedMotion) {
        carouselInterval = setInterval(nextSlide, intervalTime);
      }
    };

    const stopCarousel = () => {
      if (carouselInterval) {
        clearInterval(carouselInterval);
      }
    };

    // Inicializa o carrossel se tiver múltiplos itens
    if (items.length > 1) {
      startCarousel();

      // Pausa sob hover ou foco para melhor UX
      carousel.addEventListener('mouseenter', stopCarousel);
      carousel.addEventListener('mouseleave', startCarousel);
      carousel.addEventListener('focusin', stopCarousel);
      carousel.addEventListener('focusout', startCarousel);
    }
  }
});


