/**
 * Accueil (Homepage) Module
 * Portail ZS-PAS
 */

import { CENTRES } from './centres.js';
import { ACTUALITES } from './actualites.js';
import { DOCUMENTS } from './documents.js';
import { SERVICES } from './services.js';
import { initScrollAnimations } from './components.js';

// Initialize Homepage
export default async function initAccueil() {
  await loadHomepageData();
  renderHeroStats();
  renderQuickAccess();
  renderLatestAnnouncements();
  renderFeaturedDocuments();
  initScrollAnimations();
  setupEventListeners();
}

// Load Data for Homepage
async function loadHomepageData() {
  await Promise.all([
    CENTRES.loadFacilities(),
    ACTUALITES.loadAnnouncements(),
    DOCUMENTS.loadDocuments(),
    SERVICES.loadServices()
  ]);
}

// Render Hero Stats
function renderHeroStats() {
  const stats = [
    { value: '3', label: 'Communes couvertes', desc: 'Porto-Novo, Aguégués, Sèmè-Podji', icon: 'map', color: 'secondary' },
    { value: '42', label: 'Centres de santé certifiés', desc: 'Formations sanitaires publiques & confessionnelles', icon: 'domain_add', color: 'secondary' },
    { value: '+680k', label: 'Habitants desservis', desc: 'Population cible en suivi épidémiologique', icon: 'groups', color: 'secondary' },
    { value: '1', label: 'Hôpital de Référence', desc: 'CHD Ouémé - Plateau technique de zone', icon: 'emergency', color: 'secondary' }
  ];

  const container = document.getElementById('hero-stats');
  if (!container) return;

  container.innerHTML = stats.map(stat => `
    <div class="p-6 rounded-xl bg-primary-container/40 backdrop-blur-sm shadow-inner flex flex-col justify-between" data-animate>
      <div class="flex items-center justify-between mb-4">
        <span class="material-symbols-outlined text-secondary-fixed text-3xl">${stat.icon}</span>
        <span class="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-on-primary/10 text-on-primary">${stat.label.split(' ')[0]}</span>
      </div>
      <div>
        <div class="font-display-hero text-display-hero font-extrabold text-on-primary leading-none mb-2">${stat.value}</div>
        <div class="font-headline-sm text-headline-sm font-semibold text-secondary-fixed mb-1">${stat.label}</div>
        <div class="font-body-sm text-body-sm text-primary-fixed leading-snug">${stat.desc}</div>
      </div>
    </div>
  `).join('');
}

// Render Quick Access Cards
function renderQuickAccess() {
  const cards = [
    {
      id: 'centres',
      title: 'Trouver un centre de santé',
      desc: 'Géolocalisation précise, itinéraires piétons ou fluviaux (Aguégués), horaires des consultations externes et contacts téléphoniques directs certifiés.',
      icon: 'near_me',
      color: 'primary',
      link: 'centres.html',
      linkText: 'Accéder à l\'annuaire cartographié'
    },
    {
      id: 'rendez-vous',
      title: 'Demande de rendez-vous administratif',
      desc: 'Audience auprès du Médecin Coordonnateur, dépôts de dossiers d\'agrément, visas de documents médicaux et réclamations. Traitement garanti sous 48h.',
      icon: 'edit_calendar',
      color: 'secondary',
      link: 'rendez-vous.html',
      linkText: 'Formuler une demande en ligne'
    },
    {
      id: 'garde',
      title: 'Pharmacies et centres de garde',
      desc: 'Dispositif de garde médicale opérationnel 24h/24 et 7j/7. Liste actualisée chaque vendredi à 16h des officines et maternités de veille.',
      icon: 'emergency_heat',
      color: 'error',
      link: 'actualites.html?category=schedule',
      linkText: 'Voir les gardes opérationnelles'
    }
  ];

  const container = document.getElementById('quick-access');
  if (!container) return;

  container.innerHTML = cards.map(card => `
    <a class="group relative flex flex-col justify-between p-6 bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden" href="${card.link}" data-animate>
      <div class="absolute top-0 left-0 w-1.5 h-full bg-${card.color}"></div>
      <div>
        <div class="w-12 h-12 rounded-xl bg-${card.color}-container flex items-center justify-center text-${card.color} mb-4 group-hover:scale-110 transition-transform">
          <span class="material-symbols-outlined text-2xl">${card.icon}</span>
        </div>
        <h2 class="font-headline-sm text-headline-sm text-on-surface mb-2 font-bold group-hover:text-${card.color} transition-colors">${card.title}</h2>
        <p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">${card.desc}</p>
      </div>
      <div class="mt-6 flex items-center gap-2 text-${card.color} font-label-md text-label-md font-bold">
        <span>${card.linkText}</span>
        <span class="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
      </div>
    </a>
  `).join('');
}

// Render Latest Announcements
function renderLatestAnnouncements() {
  const announcements = ACTUALITES.getLatestAnnouncements(3);
  const container = document.getElementById('latest-announcements');
  if (!container) return;

  const categoryLabels = {
    'campaign': { label: 'Campagne', color: 'secondary', icon: 'campaign' },
    'alert': { label: 'Alerte', color: 'error', icon: 'warning' },
    'info': { label: 'Information', color: 'primary', icon: 'info' },
    'schedule': { label: 'Planning', color: 'tertiary', icon: 'calendar_month' },
    'guideline': { label: 'Directive', color: 'primary', icon: 'rule' }
  };

  container.innerHTML = announcements.map(a => {
    const cat = categoryLabels[a.category] || categoryLabels['info'];
    return `
      <article class="bg-surface-container-lowest rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between" data-animate>
        <div class="space-y-3">
          <div class="flex items-center justify-between gap-2">
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-${cat.color}-container text-on-${cat.color}-container font-label-sm text-label-sm font-bold">
              <span class="material-symbols-outlined text-xs">${cat.icon}</span> ${cat.label}
            </span>
            <time class="font-label-sm text-label-sm text-on-surface-variant font-medium">${formatDate(a.published_at, { day: 'numeric', month: 'long', year: 'numeric' })}</time>
          </div>
          <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold hover:text-primary transition-colors leading-snug">${a.title}</h3>
          <p class="font-body-sm text-body-sm text-on-surface-variant line-clamp-3">${a.excerpt || a.content.substring(0, 200)}...</p>
        </div>
        <div class="mt-6 pt-4 border-t border-surface-container flex items-center justify-between">
          <span class="font-label-sm text-label-sm text-on-surface-variant">Réf: ${a.reference}</span>
          <a href="${a.document_url || `actualite-detail.html?id=${a.id}`}" class="inline-flex items-center gap-1 text-primary font-label-md text-label-md font-bold hover:text-primary-container">
            ${a.document_url ? '<span>Télécharger le PDF</span>' : '<span>Lire la suite</span>'}
            <span class="material-symbols-outlined text-sm">${a.document_url ? 'download' : 'arrow_forward'}</span>
          </a>
        </div>
      </article>
    `;
  }).join('');

  // Update "View all" link
  const viewAllLink = document.getElementById('view-all-announcements');
  if (viewAllLink) {
    viewAllLink.href = 'actualites.html';
  }
}

// Render Featured Documents
function renderFeaturedDocuments() {
  const documents = DOCUMENTS.getFeaturedDocuments(3);
  const container = document.getElementById('featured-documents');
  if (!container) return;

  const categoryIcons = {
    'strategic': 'picture_as_pdf',
    'medical': 'calendar_month',
    'administrative': 'description',
    'epidemiological': 'analytics',
    'regulatory': 'gavel',
    'reports': 'assessment'
  };

  const categoryColors = {
    'strategic': 'secondary',
    'medical': 'primary',
    'administrative': 'tertiary',
    'epidemiological': 'error',
    'regulatory': 'primary',
    'reports': 'secondary'
  };

  const categoryLabels = {
    'strategic': 'Plan Stratégique',
    'medical': 'Guide Médical',
    'administrative': 'Démarches Usagers',
    'epidemiological': 'Bulletin Épidémiologique',
    'regulatory': 'Texte Réglementaire',
    'reports': 'Rapport d\'Activité'
  };

  container.innerHTML = documents.map(doc => `
    <div class="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex items-start gap-4" data-animate>
      <div class="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0">
        <span class="material-symbols-outlined text-2xl">${categoryIcons[doc.category] || 'description'}</span>
      </div>
      <div class="flex-1 min-w-0">
        <span class="font-label-sm text-label-sm text-${categoryColors[doc.category] || 'primary'} font-bold uppercase">${categoryLabels[doc.category] || doc.category}</span>
        <h4 class="font-label-lg text-label-lg font-bold text-on-surface truncate mt-0.5">${doc.title}</h4>
        <p class="font-body-sm text-body-sm text-on-surface-variant text-xs mt-1">${doc.description}</p>
        <a href="${doc.file_url}" target="_blank" class="inline-flex items-center gap-1 text-primary font-label-sm text-label-sm font-bold mt-3 hover:underline">
          <span>Télécharger</span>
          <span class="material-symbols-outlined text-xs">download</span>
        </a>
      </div>
    </div>
  `).join('');
}

// Setup Event Listeners
function setupEventListeners() {
  // Hero search form
  const heroForm = document.getElementById('hero-search-form');
  if (heroForm) {
    heroForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(heroForm);
      const params = new URLSearchParams();
      params.set('commune', formData.get('commune'));
      params.set('arrondissement', formData.get('arrondissement'));
      params.set('type', formData.get('type'));
      window.location.href = `centres.html?${params.toString()}`;
    });
  }

  // Emergency warning dismiss (optional)
  const emergencyBanner = document.querySelector('.emergency-banner');
  if (emergencyBanner) {
    const dismissBtn = emergencyBanner.querySelector('[data-dismiss]');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        emergencyBanner.style.display = 'none';
        localStorage.setItem('emergency_banner_dismissed', Date.now().toString());
      });
    }
  }
}

// Format Date Helper
function formatDate(dateStr, options = {}) {
  if (!dateStr) return '';
  const defaultOptions = { day: 'numeric', month: 'long', year: 'numeric', ...options };
  return new Date(dateStr).toLocaleDateString('fr-FR', defaultOptions);
}

// Export for manual initialization
export { initAccueil, loadHomepageData, renderHeroStats, renderQuickAccess, renderLatestAnnouncements, renderFeaturedDocuments };