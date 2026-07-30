document.addEventListener('DOMContentLoaded', () => {
    // 1. STICKY HEADER
    const header = document.querySelector('.header');

    const handleScroll = () => {
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    };
    window.addEventListener('scroll', handleScroll);
    if (header) {
        handleScroll(); // Executar uma vez no carregamento caso a página já esteja rolada
    }

    // 2. MENU MOBILE RESPONSIVO
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu && header) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            header.classList.toggle('menu-open');
            // Mudar ícone do menu burguer para fechar (se houver ícone de classe)
            const icon = navToggle.querySelector('i');
            if (icon) {
                if (navMenu.classList.contains('open')) {
                    icon.className = 'ph ph-x';
                } else {
                    icon.className = 'ph ph-list';
                }
            }
        });

        // Fechar menu ao clicar em algum link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                header.classList.remove('menu-open');
                const icon = navToggle.querySelector('i');
                if (icon) icon.className = 'ph ph-list';
            });
        });
    }

    // 3. LEAD CAPTURE MODAL LOGIC
    const modal = document.getElementById('lead-modal');
    const modalClose = document.getElementById('lead-modal-close');
    const modalOverlay = document.querySelector('.lead-modal-overlay');

    if (modal && modalClose) {
        // Encontrar todos os botões que abrem o modal (CTAs) na Landing Page
        // Evitamos botões em obrigado.html garantindo que o modal exista na página
        const ctaButtons = document.querySelectorAll('.btn-cta-animado, [href="#cta-final"]');

        const openModal = (e) => {
            e.preventDefault();
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden'; // Evita rolagem da página de fundo
        };

        const closeModal = () => {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = ''; // Restaura rolagem
        };

        ctaButtons.forEach(button => {
            button.addEventListener('click', openModal);
        });

        modalClose.addEventListener('click', closeModal);
        if (modalOverlay) {
            modalOverlay.addEventListener('click', closeModal);
        }

        // Fechar ao pressionar a tecla Esc
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
    }
});
