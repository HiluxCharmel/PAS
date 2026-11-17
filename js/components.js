/**
 * Shared Components - Header, Footer, Navigation
 * Portail ZS-PAS
 */

// Header HTML Template
export const HeaderComponent = `
<header class="fixed top-0 left-0 w-full z-50 bg-surface/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]" role="banner">
  <!-- Top Republican Bar -->
  <div class="h-1 bg-gradient-to-r from-secondary via-yellow-500 to-error w-full" aria-hidden="true"></div>
  <div class="bg-surface-container-low px-gutter">
    <div class="max-w-7xl mx-auto py-1 flex flex-wrap items-center justify-between gap-space-sm">
      <div class="flex items-center gap-space-sm">
        <span class="inline-block w-3 h-2 bg-secondary rounded-[1px]" aria-hidden="true"></span>
        <span class="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">République du Bénin • Ministère de la Santé • DDS Ouémé</span>
      </div>
      <div class="flex items-center gap-space-md">
        <span class="flex items-center gap-1 font-label-sm text-label-sm font-bold text-error">
          <span class="material-symbols-outlined text-sm" aria-hidden="true">emergency</span>
          SAMU Urgences : 112
        </span>
        <span class="text-outline-variant font-label-sm text-label-sm" aria-hidden="true">|</span>
        <span class="flex items-center gap-1 font-label-sm text-label-sm font-semibold text-secondary">
          <span class="material-symbols-outlined text-sm" aria-hidden="true">phone_in_talk</span>
          Numéro Vert Santé : 136
        </span>
      </div>
    </div>
  </div>

  <!-- Main Navigation -->
  <div class="h-20 max-w-7xl mx-auto px-gutter flex items-center justify-between gap-space-md">
    <div class="flex items-center gap-space-md">
      <a href="index.html" class="flex items-center gap-space-md" aria-label="Accueil Portail ZS-PAS">
        <img alt="Logo Officiel ZS-PAS Bénin" class="h-8 w-auto object-contain" src="assets/logo-zs-pas.svg"/>
        <div class="flex flex-col">
          <span class="font-headline-sm text-headline-sm text-primary font-bold tracking-tight">ZS-PAS</span>
          <span class="font-label-sm text-label-sm text-on-surface-variant leading-none hidden sm:inline">Porto-Novo • Aguégués • Sèmè-Podji</span>
        </div>
      </a>
    </div>

    <!-- Desktop Navigation -->
    <nav class="hidden xl:flex items-center gap-space-xs" aria-label="Navigation principale" data-active-classes="bg-primary-container text-on-primary font-bold rounded-lg">
      <a class="px-3 py-2 font-label-md text-label-md rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors" data-path="accueil" href="index.html">Accueil</a>
      <a class="px-3 py-2 font-label-md text-label-md rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors" data-path="centres-de-sante" href="centres.html">Nos centres de santé</a>
      <a class="px-3 py-2 font-label-md text-label-md rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors" data-path="nos-services" href="services.html">Nos services</a>
      <a class="px-3 py-2 font-label-md text-label-md rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors" data-path="rendez-vous-administratif" href="rendez-vous.html">Rendez-vous administratif</a>
      <a class="px-3 py-2 font-label-md text-label-md rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors" data-path="actualites-annonces" href="actualites.html">Actualités & Annonces</a>
      <a class="px-3 py-2 font-label-md text-label-md rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors" data-path="documents-publics" href="documents.html">Documents publics</a>
      <a class="px-3 py-2 font-label-md text-label-md rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors" data-path="contact-reclamations" href="contact.html">Contact & Réclamations</a>
    </nav>

    <!-- Actions -->
    <div class="flex items-center gap-space-sm">
      <a class="hidden md:inline-flex items-center justify-center px-4 py-2 font-label-md text-label-md font-semibold text-primary border border-primary/30 rounded-lg hover:bg-primary hover:text-on-primary transition-all" data-path="portail-agent-admin" href="admin/connexion.html">Espace Agent / Admin</a>

      <!-- Mobile Menu Toggle -->
      <button class="mobile-nav-toggle xl:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="mobile-menu">
        <span class="material-symbols-outlined text-xl" aria-hidden="true">menu</span>
      </button>
    </div>
  </div>
</header>

<!-- Mobile Navigation Overlay -->
<div class="nav-overlay xl:hidden" aria-hidden="true"></div>
<div class="nav-menu xl:hidden" id="mobile-menu" role="navigation" aria-label="Menu mobile">
  <div class="flex items-center justify-between mb-space-lg">
    <span class="font-headline-sm text-headline-sm text-primary font-bold">ZS-PAS</span>
    <button class="mobile-nav-close p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors" aria-label="Fermer le menu">
      <span class="material-symbols-outlined text-xl" aria-hidden="true">close</span>
    </button>
  </div>
  <nav class="flex flex-col gap-space-xs">
    <a class="px-4 py-3 font-label-md text-label-md rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors" data-path="accueil" href="index.html">Accueil</a>
    <a class="px-4 py-3 font-label-md text-label-md rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors" data-path="centres-de-sante" href="centres.html">Nos centres de santé</a>
    <a class="px-4 py-3 font-label-md text-label-md rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors" data-path="nos-services" href="services.html">Nos services</a>
    <a class="px-4 py-3 font-label-md text-label-md rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors" data-path="rendez-vous-administratif" href="rendez-vous.html">Rendez-vous administratif</a>
    <a class="px-4 py-3 font-label-md text-label-md rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors" data-path="actualites-annonces" href="actualites.html">Actualités & Annonces</a>
    <a class="px-4 py-3 font-label-md text-label-md rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors" data-path="documents-publics" href="documents.html">Documents publics</a>
    <a class="px-4 py-3 font-label-md text-label-md rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors" data-path="contact-reclamations" href="contact.html">Contact & Réclamations</a>
    <hr class="my-space-md border-outline-variant">
    <a class="px-4 py-3 font-label-md text-label-md font-semibold text-primary border border-primary/30 rounded-lg hover:bg-primary hover:text-on-primary transition-all text-center" data-path="portail-agent-admin" href="admin/connexion.html">Espace Agent / Admin</a>
  </nav>
</div>
`;

// Footer HTML Template
export const FooterComponent = `
<footer class="w-full bg-surface-container-lowest mt-space-xl shadow-[0_-1px_6px_rgba(0,0,0,0.03)]" role="contentinfo">
  <!-- Emergency Warning Bar -->
  <div class="bg-error-container text-on-error-container py-3 px-gutter">
    <div class="max-w-7xl mx-auto flex items-center justify-center gap-space-sm text-center font-label-md text-label-md">
      <span class="material-symbols-outlined text-error font-bold" aria-hidden="true">notification_important</span>
      <span><strong>Avertissement officiel :</strong> Ce portail ne remplace pas les services d'urgence médicale. En cas de détresse vitale, composez le 112 ou présentez-vous au centre de santé le plus proche.</span>
    </div>
  </div>

  <!-- Footer Grid -->
  <div class="max-w-7xl mx-auto px-gutter py-space-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-lg">
    <!-- Brand -->
    <div class="space-y-space-sm">
      <div class="flex items-center gap-space-sm">
        <span class="font-headline-sm text-headline-sm text-primary font-bold">Zone Sanitaire PAS</span>
      </div>
      <p class="font-body-sm text-body-sm text-on-surface-variant">Direction Départementale de la Santé de l'Ouémé. Coordination des soins primaires et de la santé communautaire pour Porto-Novo, Aguégués et Sèmè-Podji.</p>
      <div class="pt-2">
        <span class="inline-block px-3 py-1 font-label-sm text-label-sm rounded-full bg-surface-container text-primary font-semibold">Portail Républicain Accrédité</span>
      </div>
    </div>

    <!-- Address & Contact -->
    <div class="space-y-space-sm">
      <h4 class="font-headline-sm text-headline-sm text-on-surface">Siège & Coordonnées</h4>
      <p class="font-body-sm text-body-sm text-on-surface-variant">Bureau de Zone Sanitaire PAS<br/>Quartier Attakè, Porto-Novo<br/>Département de l'Ouémé, République du Bénin</p>
      <p class="font-body-sm text-body-sm text-on-surface-variant"><strong class="text-on-surface">Téléphone :</strong> (+229) 20 21 00 00<br/><strong class="text-on-surface">Email :</strong> contact@zs-pas.sante.gouv.bj</p>
    </div>

    <!-- Quick Links -->
    <div class="space-y-space-sm">
      <h4 class="font-headline-sm text-headline-sm text-on-surface">Accès Rapide</h4>
      <ul class="space-y-space-xs font-body-sm text-body-sm text-on-surface-variant">
        <li><a class="hover:text-primary transition-colors" data-path="centres-de-sante" href="centres.html">Centres de Santé et Maternités</a></li>
        <li><a class="hover:text-primary transition-colors" data-path="rendez-vous-administratif" href="rendez-vous.html">Demande d'Audience et CIP</a></li>
        <li><a class="hover:text-primary transition-colors" data-path="documents-publics" href="documents.html">Bulletins Épidémiologiques & Rapports</a></li>
        <li><a class="hover:text-primary transition-colors" data-path="actualites-annonces" href="actualites.html">Campagnes de Vaccination ZS-PAS</a></li>
      </ul>
    </div>

    <!-- Partners -->
    <div class="space-y-space-sm">
      <h4 class="font-headline-sm text-headline-sm text-on-surface">Portails Partenaires</h4>
      <ul class="space-y-space-xs font-body-sm text-body-sm text-on-surface-variant">
        <li>Ministère de la Santé du Bénin (MS)</li>
        <li>Agence Nationale de Protection Sociale (ANPS)</li>
        <li>Organisation Mondiale de la Santé (Bénin)</li>
        <li>Préfecture du Département de l'Ouémé</li>
      </ul>
    </div>
  </div>

  <!-- Copyright -->
  <div class="bg-surface-container py-space-md px-gutter">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-space-sm text-center md:text-left">
      <p class="font-label-sm text-label-sm text-on-surface-variant">© 2024 République du Bénin. Tous droits réservés. Zone Sanitaire Porto-Novo–Aguégués–Sèmè-Podji.</p>
      <div class="flex items-center gap-space-md font-label-sm text-label-sm text-on-surface-variant">
        <a class="hover:text-on-surface transition-colors" href="mentions-legales.html">Mentions Légales</a>
        <a class="hover:text-on-surface transition-colors" href="politique-confidentialite.html">Politique de Confidentialité</a>
        <a class="hover:text-on-surface transition-colors" href="plan-du-site.html">Plan du Site</a>
      </div>
    </div>
  </div>
</footer>
`;

// Initialize Components
export function initComponents() {
  // Insert header
  const headerPlaceholder = document.getElementById('header-placeholder');
  if (headerPlaceholder) {
    headerPlaceholder.innerHTML = HeaderComponent;
    initHeader();
  }

  // Insert footer
  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (footerPlaceholder) {
    footerPlaceholder.innerHTML = FooterComponent;
  }

  // Set active navigation link
  setActiveNavLink();
}

// Header Interactions
function initHeader() {
  // Mobile menu toggle
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const mobileClose = document.querySelector('.mobile-nav-close');
  const mobileMenu = document.getElementById('mobile-menu');
  const navOverlay = document.querySelector('.nav-overlay');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
      if (navOverlay) navOverlay.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }

  if (mobileClose && mobileMenu) {
    mobileClose.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      if (navOverlay) navOverlay.classList.remove('open');
      document.body.style.overflow = '';
      mobileToggle?.focus();
    });
  }

  if (navOverlay) {
    navOverlay.addEventListener('click', () => {
      mobileMenu?.classList.remove('open');
      navOverlay.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  // Close mobile menu on link click
  mobileMenu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      if (navOverlay) navOverlay.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Scroll header effect
  let lastScroll = 0;
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 100) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  }, { passive: true });
}

// Set Active Navigation Link
function setActiveNavLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const pathMap = {
    'index.html': 'accueil',
    'centres.html': 'centres-de-sante',
    'services.html': 'nos-services',
    'rendez-vous.html': 'rendez-vous-administratif',
    'actualites.html': 'actualites-annonces',
    'documents.html': 'documents-publics',
    'contact.html': 'contact-reclamations',
    'mentions-legales.html': 'mentions-legales',
    'politique-confidentialite.html': 'politique-confidentialite',
    'plan-du-site.html': 'plan-du-site'
  };

  const activePath = pathMap[currentPath] || 'accueil';

  document.querySelectorAll('[data-path]').forEach(link => {
    if (link.dataset.path === activePath) {
      link.setAttribute('aria-current', 'page');
      link.classList.add('bg-primary-container', 'text-on-primary', 'font-bold');
      link.classList.remove('text-on-surface-variant', 'hover:bg-surface-container-high', 'hover:text-on-surface');
    }
  });
}

// Toast Notification System
export function showToast(message, type = 'info', duration = 5000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');

  const icons = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info'
  };

  toast.innerHTML = `
    <span class="material-symbols-outlined" aria-hidden="true">${icons[type]}</span>
    <span class="font-body-sm text-body-sm">${message}</span>
    <button class="toast-close ml-auto p-1 text-on-surface-variant hover:text-on-surface" aria-label="Fermer">
      <span class="material-symbols-outlined" aria-hidden="true">close</span>
    </button>
  `;

  container.appendChild(toast);

  // Auto remove
  const timeout = setTimeout(() => removeToast(toast), duration);

  // Manual close
  toast.querySelector('.toast-close').addEventListener('click', () => {
    clearTimeout(timeout);
    removeToast(toast);
  });
}

function removeToast(toast) {
  toast.style.animation = 'slideIn 0.3s ease reverse';
  setTimeout(() => toast.remove(), 300);
}

// Modal System
export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    modal.querySelector('.modal-close')?.focus();
  }
}

export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// Initialize modal close handlers
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('modal-close')) {
    const modal = e.target.closest('.modal-overlay');
    if (modal) closeModal(modal.id);
  }
});

// Keyboard: Escape to close modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(modal => closeModal(modal.id));
    // Close mobile menu
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu?.classList.contains('open')) {
      mobileMenu.classList.remove('open');
      document.querySelector('.nav-overlay')?.classList.remove('open');
      document.body.style.overflow = '';
    }
  }
});

// Smooth scroll for anchor links
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (link) {
    const href = link.getAttribute('href');
    if (href !== '#') {
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        target.focus({ preventScroll: true });
      }
    }
  }
});

// Intersection Observer for animations
export function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
}

// Debounce utility
export function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Format date for French locale
export function formatDate(date, options = {}) {
  const defaultOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options
  };
  return new Date(date).toLocaleDateString('fr-FR', defaultOptions);
}

// Generate unique reference
export function generateReference(prefix = 'RDV') {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${random}`;
}

// Validate email
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validate phone (Benin format)
export function validatePhone(phone) {
  const re = /^[0-9]{8,10}$/;
  return re.test(phone.replace(/\s/g, ''));
}

// Sanitize HTML
export function sanitizeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}