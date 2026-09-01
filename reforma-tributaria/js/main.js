// DATA TEMPORÁRIA DE DESENVOLVIMENTO.
// Substituir pela data oficial de encerramento da condição de venda.
const COUNTDOWN_TARGET = "2026-09-14T23:59:59-03:00";

(function initCountdowns() {
  // Elementos da barra de aviso superior
  const noticeDaysEl = document.getElementById("countdown-days");
  const noticeHoursEl = document.getElementById("countdown-hours");
  const noticeMinutesEl = document.getElementById("countdown-minutes");
  const noticeSecondsEl = document.getElementById("countdown-seconds");

  // Elementos do countdown da SECTION-07 (Oferta)
  const offerDaysEl = document.getElementById("offer-days");
  const offerHoursEl = document.getElementById("offer-hours");
  const offerMinutesEl = document.getElementById("offer-minutes");
  const offerSecondsEl = document.getElementById("offer-seconds");

  const hasNotice = Boolean(noticeDaysEl && noticeHoursEl && noticeMinutesEl && noticeSecondsEl);
  const hasOffer = Boolean(offerDaysEl && offerHoursEl && offerMinutesEl && offerSecondsEl);

  if (!hasNotice && !hasOffer) return;

  const targetTime = new Date(COUNTDOWN_TARGET).getTime();

  function padZero(num) {
    return String(num).padStart(2, "0");
  }

  function updateCountdowns() {
    const now = new Date().getTime();
    const distance = targetTime - now;

    if (distance <= 0) {
      if (hasNotice) {
        noticeDaysEl.textContent = "00d";
        noticeHoursEl.textContent = "00h";
        noticeMinutesEl.textContent = "00m";
        noticeSecondsEl.textContent = "00s";
      }
      if (hasOffer) {
        offerDaysEl.textContent = "00";
        offerHoursEl.textContent = "00";
        offerMinutesEl.textContent = "00";
        offerSecondsEl.textContent = "00";
      }
      return false; // Interrompe o intervalo ao expirar
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const dStr = padZero(days);
    const hStr = padZero(hours);
    const mStr = padZero(minutes);
    const sStr = padZero(seconds);

    if (hasNotice) {
      noticeDaysEl.textContent = `${dStr}d`;
      noticeHoursEl.textContent = `${hStr}h`;
      noticeMinutesEl.textContent = `${mStr}m`;
      noticeSecondsEl.textContent = `${sStr}s`;
    }

    if (hasOffer) {
      offerDaysEl.textContent = dStr;
      offerHoursEl.textContent = hStr;
      offerMinutesEl.textContent = mStr;
      offerSecondsEl.textContent = sStr;
    }

    return true;
  }

  // Execução imediata para evitar flicker ao carregar a página
  const isRunning = updateCountdowns();

  if (isRunning) {
    const timer = setInterval(() => {
      const active = updateCountdowns();
      if (!active) {
        clearInterval(timer);
      }
    }, 1000);
  }
})();

(function initHeaderScroll() {
  const header = document.getElementById("header");
  if (!header) return;

  function handleScroll() {
    if (window.scrollY > 0) {
      header.classList.add("header--scrolled");
    } else {
      header.classList.remove("header--scrolled");
    }
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();
})();

(function initStatsAnimation() {
  const statsSection = document.getElementById("prova-estatisticas");
  if (!statsSection) return;

  const numbers = statsSection.querySelectorAll(".stats__number");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function animateCounter(el) {
    const target = parseFloat(el.getAttribute("data-target"));
    const decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    const suffix = el.getAttribute("data-suffix") || "";
    const formatThousand = el.getAttribute("data-format-thousand") === "true";
    const duration = 1200; // 1.2s
    const startTime = performance.now();

    function updateCount(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing out cubic para parada suave e elegante
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = target * easeOut;

      let formattedNum = currentValue.toFixed(decimals);
      
      if (formatThousand) {
        // Formata 1958 para 1.958
        formattedNum = Math.floor(currentValue).toLocaleString("pt-BR");
      } else if (decimals > 0) {
        // Formata 32.4 para 32,4
        formattedNum = formattedNum.replace(".", ",");
      }

      el.textContent = `${formattedNum}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        // Garante valor final exato
        let finalNum = target.toFixed(decimals);
        if (formatThousand) {
          finalNum = Math.floor(target).toLocaleString("pt-BR");
        } else if (decimals > 0) {
          finalNum = finalNum.replace(".", ",");
        }
        el.textContent = `${finalNum}${suffix}`;
      }
    }

    requestAnimationFrame(updateCount);
  }

  function triggerStats() {
    statsSection.classList.add("stats--active");
    if (!prefersReducedMotion) {
      numbers.forEach((numEl) => animateCounter(numEl));
    }
  }

  if (prefersReducedMotion) {
    statsSection.classList.add("stats--active");
    return;
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            triggerStats();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );
    observer.observe(statsSection);
  } else {
    triggerStats();
  }
})();

(function initCurriculumExplorer() {
  const explorer = document.querySelector(".curriculum__explorer");
  if (!explorer) return;

  const tabs = explorer.querySelectorAll(".curriculum__tab");
  const triggers = explorer.querySelectorAll(".curriculum__trigger");
  const stagePanels = explorer.querySelectorAll(".curriculum__stage-panel");

  function setActiveTab(index, shouldFocus = false) {
    if (index < 0 || index >= tabs.length) return;

    tabs.forEach((tab, i) => {
      const trigger = tab.querySelector(".curriculum__trigger");
      const collapse = tab.querySelector(".curriculum__collapse");
      const panel = stagePanels[i];
      const isActive = i === index;

      if (isActive) {
        tab.classList.add("curriculum__tab--active");
        if (trigger) {
          trigger.setAttribute("aria-selected", "true");
          trigger.setAttribute("aria-expanded", "true");
          trigger.removeAttribute("tabindex");
          if (shouldFocus) trigger.focus();
        }
        if (collapse) collapse.removeAttribute("hidden");
        if (panel) {
          panel.classList.add("curriculum__stage-panel--active");
          panel.removeAttribute("hidden");
        }
      } else {
        tab.classList.remove("curriculum__tab--active");
        if (trigger) {
          trigger.setAttribute("aria-selected", "false");
          trigger.setAttribute("aria-expanded", "false");
          trigger.setAttribute("tabindex", "-1");
        }
        if (collapse) collapse.setAttribute("hidden", "");
        if (panel) {
          panel.classList.remove("curriculum__stage-panel--active");
          panel.setAttribute("hidden", "");
        }
      }
    });
  }

  // Toggle para mobile ou seleção direta no desktop
  triggers.forEach((trigger, index) => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      const tab = tabs[index];
      const isCurrentlyActive = tab.classList.contains("curriculum__tab--active");

      // No mobile, se já estiver aberto e o usuário clicar, permite fechar o accordion
      if (!isDesktop && isCurrentlyActive) {
        tab.classList.remove("curriculum__tab--active");
        trigger.setAttribute("aria-expanded", "false");
        const collapse = tab.querySelector(".curriculum__collapse");
        if (collapse) collapse.setAttribute("hidden", "");
      } else {
        setActiveTab(index, false);
      }
    });

    // Acessibilidade WAI-ARIA: Navegação por Teclado
    trigger.addEventListener("keydown", (e) => {
      let targetIndex = null;

      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        targetIndex = (index + 1) % tabs.length;
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        targetIndex = (index - 1 + tabs.length) % tabs.length;
      } else if (e.key === "Home") {
        e.preventDefault();
        targetIndex = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        targetIndex = tabs.length - 1;
      }

      if (targetIndex !== null) {
        setActiveTab(targetIndex, true);
      }
    });
  });
})();

(function initSpotlightGlow() {
  const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!isFinePointer || prefersReducedMotion) return;

  const cards = document.querySelectorAll(
    ".stats__card, .impacts__card, #formato-bonus .format-bonus__card, .offer__card"
  );
  if (!cards.length) return;

  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    });
  });
})();

(function initFloatingDock() {
  const dock = document.getElementById("floating-dock");
  const hero = document.getElementById("hero");
  const offer = document.getElementById("oferta");

  if (!dock) return;

  let isHeroVisible = true;
  let isOfferVisible = false;

  function updateDockVisibility() {
    if (!isHeroVisible && !isOfferVisible) {
      dock.classList.add("floating-dock--visible");
      dock.setAttribute("aria-hidden", "false");
    } else {
      dock.classList.remove("floating-dock--visible");
      dock.setAttribute("aria-hidden", "true");
    }
  }

  if ("IntersectionObserver" in window) {
    if (hero) {
      const heroObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isHeroVisible = entry.isIntersecting;
            updateDockVisibility();
          });
        },
        { threshold: 0.1 }
      );
      heroObserver.observe(hero);
    }

    if (offer) {
      const offerObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isOfferVisible = entry.isIntersecting;
            updateDockVisibility();
          });
        },
        { threshold: 0.15 }
      );
      offerObserver.observe(offer);
    }
  } else {
    window.addEventListener(
      "scroll",
      () => {
        const scrollY = window.scrollY || window.pageYOffset;
        if (scrollY > 500) {
          dock.classList.add("floating-dock--visible");
          dock.setAttribute("aria-hidden", "false");
        } else {
          dock.classList.remove("floating-dock--visible");
          dock.setAttribute("aria-hidden", "true");
        }
      },
      { passive: true }
    );
  }
})();



