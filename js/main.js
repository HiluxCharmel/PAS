/**
 * Main Entry Point
 * Portail ZS-PAS - Initialisation globale
 */

import { initComponents, showToast } from './components.js';
import { initAuth } from './auth.js';

// Page detection and initialization
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize shared components (header, footer)
  initComponents();

  // Detect current page and initialize appropriate module
  const page = detectPage();
  await initializePage(page);

  // Global error handler
  window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    // Don't show toast for every error in production
  });

  // Global unhandled rejection handler
  window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled rejection:', e.reason);
  });
});

// Detect current page from URL or body data attribute
function detectPage() {
  // Check for data-page attribute on body
  const bodyPage = document.body.dataset.page;
  if (bodyPage) return bodyPage;

  // Fallback to URL path
  const path = window.location.pathname.split('/').pop() || 'index.html';
  const pageMap = {
    'index.html': 'accueil',
    'centres.html': 'centres',
    'services.html': 'services',
    'rendez-vous.html': 'rendez-vous',
    'actualites.html': 'actualites',
    'documents.html': 'documents',
    'contact.html': 'contact',
    'mentions-legales.html': 'mentions-legales',
    'politique-confidentialite.html': 'politique-confidentialite',
    'plan-du-site.html': 'plan-du-site',
    'actualite-detail.html': 'actualite-detail',
    'connexion.html': 'connexion',
    'tableau-de-bord.html': 'admin-dashboard',
    'centres.html': 'admin-centres',
    'services.html': 'admin-services',
    'actualites.html': 'admin-actualites',
    'documents.html': 'admin-documents',
    'rendez-vous.html': 'admin-rendez-vous',
    'contacts.html': 'admin-contacts'
  };

  // Check if in admin directory
  const isAdmin = window.location.pathname.includes('/admin/');

  if (isAdmin) {
    const adminPage = path.replace('.html', '');
    return `admin-${adminPage}`;
  }

  return pageMap[path] || 'accueil';
}

// Initialize page-specific functionality
async function initializePage(page) {
  // Dynamic imports for code splitting
  try {
    switch (page) {
      case 'accueil':
        await import('./accueil.js').then(m => m.default?.());
        break;

      case 'centres':
        const { CENTRES } = await import('./centres.js');
        await CENTRES.init();
        break;

      case 'services':
        const { SERVICES } = await import('./services.js');
        await SERVICES.init();
        break;

      case 'rendez-vous':
        const { RENDEZ_VOUS } = await import('./rendez-vous.js');
        await RENDEZ_VOUS.init();
        break;

      case 'actualites':
        const { ACTUALITES } = await import('./actualites.js');
        await ACTUALITES.init();
        break;

      case 'documents':
        const { DOCUMENTS } = await import('./documents.js');
        await DOCUMENTS.init();
        break;

      case 'contact':
        const { CONTACT } = await import('./contact.js');
        await CONTACT.init();
        break;

      case 'admin-dashboard':
      case 'admin-tableau-de-bord':
        const { ADMIN } = await import('./admin.js');
        await ADMIN.initPage('dashboard');
        break;

      case 'admin-centres':
        const { ADMIN: adminCentres } = await import('./admin.js');
        await adminCentres.initPage('centres');
        break;

      case 'admin-services':
        const { ADMIN: adminServices } = await import('./admin.js');
        await adminServices.initPage('services');
        break;

      case 'admin-actualites':
        const { ADMIN: adminActualites } = await import('./admin.js');
        await adminActualites.initPage('actualites');
        break;

      case 'admin-documents':
        const { ADMIN: adminDocuments } = await import('./admin.js');
        await adminDocuments.initPage('documents');
        break;

      case 'admin-rendez-vous':
        const { ADMIN: adminRdv } = await import('./admin.js');
        await adminRdv.initPage('rendez-vous');
        break;

      case 'admin-contacts':
        const { ADMIN: adminContacts } = await import('./admin.js');
        await adminContacts.initPage('contacts');
        break;

      case 'connexion':
        await initAuth();
        initLoginPage();
        break;

      default:
        console.log(`Page ${page} - no specific initialization needed`);
    }
  } catch (err) {
    console.error(`Error initializing page ${page}:`, err);
    showToast('Erreur lors du chargement de la page', 'error');
  }
}

// Login Page Initialization
function initLoginPage() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">refresh</span> Connexion...';
    submitBtn.disabled = true;

    try {
      const { AUTH } = await import('./auth.js');
      const result = await AUTH.signInWithEmail(email, password);

      if (result.success) {
        window.location.href = '/admin/tableau-de-bord.html';
      } else {
        showToast(result.error || 'Identifiants invalides', 'error');
      }
    } catch (err) {
      console.error('Login error:', err);
      showToast('Erreur de connexion', 'error');
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
}

// Export for testing
export { detectPage, initializePage };