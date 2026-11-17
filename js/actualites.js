/**
 * Actualités & Annonces Module
 * Portail ZS-PAS
 */

import { getSupabase, TABLES, CONTENT_STATUS, handleSupabaseError, formatResponse } from './supabase-config.js';
import { showToast, initScrollAnimations, formatDate } from './components.js';

// State
let announcements = [];
let currentPage = 1;
const PAGE_SIZE = 6;

// DOM Elements
let elements = {};

// Initialize Actualités Page
export async function initActualitesPage() {
  cacheElements();
  await loadAnnouncements();
  setupEventListeners();
  renderAnnouncements();
  initScrollAnimations();
}

// Cache DOM Elements
function cacheElements() {
  elements = {
    announcementsGrid: document.getElementById('announcements-grid'),
    loadMoreBtn: document.getElementById('load-more'),
    categoryFilter: document.getElementById('filter-category'),
    searchInput: document.getElementById('announcement-search')
  };
}

// Load Announcements from Supabase
async function loadAnnouncements() {
  const supabase = getSupabase();
  if (!supabase) {
    announcements = getMockAnnouncements();
    return;
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.announcements)
      .select(`
        *,
        author:profiles!author_id (full_name, role),
        validator:profiles!validated_by (full_name)
      `)
      .eq('status', CONTENT_STATUS.PUBLISHED)
      .order('published_at', { ascending: false })
      .limit(PAGE_SIZE);

    if (error) throw error;

    announcements = (data || []).map(a => ({
      ...a,
      author_name: a.author?.full_name || 'Bureau ZS-PAS',
      validator_name: a.validator?.full_name || 'Validateur'
    }));
  } catch (err) {
    console.error('Error loading announcements:', err);
    showToast('Erreur lors du chargement des actualités', 'error');
    announcements = getMockAnnouncements();
  }
}

// Mock Announcements
function getMockAnnouncements() {
  return [
    {
      id: '1',
      title: 'Campagne intégrée de vaccination pédiatrique : passage des agents relais aux Aguégués',
      content: 'Déploiement des pirogues médicalisées dans les arrondissements lacustres de Zoungamè et Avagbodji. Vérifiez les carnets de santé de vos enfants auprès des vaccinateurs assermentés.',
      excerpt: 'Déploiement des pirogues médicalisées dans les arrondissements lacustres de Zoungamè et Avagbodji...',
      category: 'campaign',
      image_url: null,
      document_url: 'https://example.com/campagne-pev-oct2026.pdf',
      document_name: 'Communiqué PEV Octobre 2026',
      author_name: 'Dr. Félicien HOUNDO',
      validator_name: 'Dr. Alphonse KOSSI',
      published_at: '2026-10-18T08:42:00Z',
      reference: 'COMM-PAS-2026-104',
      tags: ['vaccination', 'Aguégués', 'pédiatrie']
    },
    {
      id: '2',
      title: 'Opération de surveillance épidémiologique des maladies diarrhéiques à Sèmè-Podji',
      content: 'Renforcement des contrôles de potabilité des forages collectifs et distribution préventive d\'Aquatabs dans les quartiers littoraux d\'Ekpè et Agblangandan suite aux crues.',
      excerpt: 'Renforcement des contrôles de potabilité des forages collectifs et distribution préventive d\'Aquatabs...',
      category: 'alert',
      image_url: null,
      document_url: 'https://example.com/surveillance-diarrheique.pdf',
      document_name: 'Bulletin Épidémiologique',
      author_name: 'Équipe Épidémiologie',
      validator_name: 'Dr. Alphonse KOSSI',
      published_at: '2026-10-12T14:15:00Z',
      reference: 'COMM-PAS-2026-098',
      tags: ['épidémiologie', 'Sèmè-Podji', 'maladies diarrhéiques']
    },
    {
      id: '3',
      title: 'Mise en service du nouveau plateau d\'échographie au CSA Djègan-Kpèvi (Porto-Novo)',
      content: 'Dotation ministérielle complète pour améliorer le suivi prénatal précoce des femmes enceintes de la capitale. Les rendez-vous sont ouverts dès ce lundi.',
      excerpt: 'Dotation ministérielle complète pour améliorer le suivi prénatal précoce des femmes enceintes...',
      category: 'info',
      image_url: null,
      document_url: null,
      document_name: null,
      author_name: 'Chef de Centre Djègan-Kpèvi',
      validator_name: 'Dr. Alphonse KOSSI',
      published_at: '2026-10-05T11:05:00Z',
      reference: 'COMM-PAS-2026-091',
      tags: ['équipement', 'Porto-Novo', 'prénatal']
    },
    {
      id: '4',
      title: 'Calendrier de garde des pharmacies - Quinzaine du 15 au 31 Octobre 2026',
      content: 'Liste actualisée des pharmacies de garde pour la deuxième quinzaine d\'octobre. Disponible en téléchargement et affichée dans tous les centres de santé.',
      excerpt: 'Liste actualisée des pharmacies de garde pour la deuxième quinzaine d\'octobre...',
      category: 'schedule',
      image_url: null,
      document_url: 'https://example.com/garde-pharmacies-oct2026-q2.pdf',
      document_name: 'Calendrier Garde Pharmacies',
      author_name: 'Pharm. Reine DOSSOU',
      validator_name: 'Dr. Alphonse KOSSI',
      published_at: '2026-10-01T14:15:00Z',
      reference: 'COMM-PAS-2026-087',
      tags: ['pharmacie', 'garde', 'calendrier']
    },
    {
      id: '5',
      title: 'Campagne de déparasitage scolaire - Rentrée 2026-2027',
      content: 'Distribution d\'Albendazole et Praziquantel dans les écoles primaires publiques de la zone. Ciblage 45 000 élèves. Calendrier par arrondissement disponible.',
      excerpt: 'Distribution d\'Albendazole et Praziquantel dans les écoles primaires publiques...',
      category: 'campaign',
      image_url: null,
      document_url: 'https://example.com/deparasitage-scolaire-2026.pdf',
      document_name: 'Note de Service Déparasitage',
      author_name: 'Coordination PEV',
      validator_name: 'Dr. Alphonse KOSSI',
      published_at: '2026-09-28T09:30:00Z',
      reference: 'COMM-PAS-2026-082',
      tags: ['déparasitage', 'scolaire', 'albendazole']
    },
    {
      id: '6',
      title: 'Renforcement de la prise en charge du paludisme grave - Nouvelles recommandations',
      content: 'Mise à jour du protocole national: Artesunate IV en première intention pour le paludisme grave. Formation des personnels soignants programmée.',
      excerpt: 'Mise à jour du protocole national: Artesunate IV en première intention...',
      category: 'guideline',
      image_url: null,
      document_url: 'https://example.com/protocole-paludisme-2026.pdf',
      document_name: 'Protocole Paludisme Grave v2.1',
      author_name: 'Dr. Félicien HOUNDO',
      validator_name: 'Dr. Alphonse KOSSI',
      published_at: '2026-09-20T16:45:00Z',
      reference: 'COMM-PAS-2026-075',
      tags: ['paludisme', 'protocole', 'artesunate']
    }
  ];
}

// Setup Event Listeners
function setupEventListeners() {
  // Load more button
  if (elements.loadMoreBtn) {
    elements.loadMoreBtn.addEventListener('click', loadMoreAnnouncements);
  }

  // Category filter
  if (elements.categoryFilter) {
    elements.categoryFilter.addEventListener('change', () => {
      currentPage = 1;
      renderAnnouncements();
    });
  }

  // Search
  if (elements.searchInput) {
    elements.searchInput.addEventListener('input', debounce(() => {
      currentPage = 1;
      renderAnnouncements();
    }, 300));
  }
}

// Load More Announcements
async function loadMoreAnnouncements() {
  currentPage++;
  await loadAnnouncementsPage(currentPage);
  renderAnnouncements(true);
}

// Load Announcements for Specific Page
async function loadAnnouncementsPage(page) {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    const { data, error } = await supabase
      .from(TABLES.announcements)
      .select(`
        *,
        author:profiles!author_id (full_name, role),
        validator:profiles!validated_by (full_name)
      `)
      .eq('status', CONTENT_STATUS.PUBLISHED)
      .order('published_at', { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    if (error) throw error;

    const newAnnouncements = (data || []).map(a => ({
      ...a,
      author_name: a.author?.full_name || 'Bureau ZS-PAS',
      validator_name: a.validator?.full_name || 'Validateur'
    }));

    announcements = [...announcements, ...newAnnouncements];

    // Hide load more if no more results
    if (elements.loadMoreBtn && newAnnouncements.length < PAGE_SIZE) {
      elements.loadMoreBtn.style.display = 'none';
    }
  } catch (err) {
    console.error('Error loading more announcements:', err);
  }
}

// Render Announcements
function renderAnnouncements(append = false) {
  if (!elements.announcementsGrid) return;

  let filtered = announcements;

  // Category filter
  if (elements.categoryFilter?.value && elements.categoryFilter.value !== 'all') {
    filtered = filtered.filter(a => a.category === elements.categoryFilter.value);
  }

  // Search filter
  if (elements.searchInput?.value) {
    const query = elements.searchInput.value.toLowerCase().trim();
    filtered = filtered.filter(a =>
      a.title.toLowerCase().includes(query) ||
      a.content.toLowerCase().includes(query) ||
      a.tags?.some(t => t.toLowerCase().includes(query))
    );
  }

  if (filtered.length === 0) {
    elements.announcementsGrid.innerHTML = `
      <div class="col-span-full text-center py-space-xl">
        <span class="material-symbols-outlined text-4xl text-on-surface-variant mb-2 block">article</span>
        <h3 class="font-headline-sm text-headline-sm text-on-surface mb-2">Aucune actualité trouvée</h3>
        <p class="font-body-md text-body-md text-on-surface-variant">Essayez de modifier vos critères</p>
      </div>
    `;
    if (elements.loadMoreBtn) elements.loadMoreBtn.style.display = 'none';
    return;
  }

  const html = filtered.map(announcement => renderAnnouncementCard(announcement)).join('');

  if (append) {
    elements.announcementsGrid.innerHTML += html;
  } else {
    elements.announcementsGrid.innerHTML = html;
  }
}

// Render Announcement Card
function renderAnnouncementCard(announcement) {
  const categoryLabels = {
    'campaign': { label: 'Campagne', color: 'secondary', icon: 'campaign' },
    'alert': { label: 'Alerte', color: 'error', icon: 'warning' },
    'info': { label: 'Information', color: 'primary', icon: 'info' },
    'schedule': { label: 'Planning', color: 'tertiary', icon: 'calendar_month' },
    'guideline': { label: 'Directive', color: 'primary', icon: 'rule' }
  };

  const cat = categoryLabels[announcement.category] || categoryLabels['info'];

  return `
    <article class="bg-surface-container-lowest rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between" data-animate>
      <div class="space-y-3">
        <div class="flex items-center justify-between gap-2">
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-${cat.color}-container text-on-${cat.color}-container font-label-sm text-label-sm font-bold">
            <span class="material-symbols-outlined text-xs">${cat.icon}</span> ${cat.label}
          </span>
          <time class="font-label-sm text-label-sm text-on-surface-variant font-medium">${formatDate(announcement.published_at, { day: 'numeric', month: 'long', year: 'numeric' })}</time>
        </div>
        <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold hover:text-primary transition-colors leading-snug">${announcement.title}</h3>
        <p class="font-body-sm text-body-sm text-on-surface-variant line-clamp-3">${announcement.excerpt || announcement.content.substring(0, 200)}...</p>
      </div>
      <div class="mt-6 pt-4 border-t border-surface-container flex items-center justify-between">
        <span class="font-label-sm text-label-sm text-on-surface-variant">Réf: ${announcement.reference}</span>
        <div class="flex items-center gap-2">
          ${announcement.document_url ? `
            <a href="${announcement.document_url}" target="_blank" class="inline-flex items-center gap-1 text-primary font-label-md text-label-md font-bold hover:text-primary-container">
              <span>Télécharger le PDF</span>
              <span class="material-symbols-outlined text-sm">download</span>
            </a>
          ` : ''}
          <a href="actualite-detail.html?id=${announcement.id}" class="inline-flex items-center gap-1 text-primary font-label-md text-label-md font-bold hover:text-primary-container">
            <span>Lire la suite</span>
            <span class="material-symbols-outlined text-sm">arrow_forward</span>
          </a>
        </div>
      </div>
    </article>
  `;
}

// Get Announcement by ID
export async function getAnnouncementById(id) {
  const supabase = getSupabase();
  if (!supabase) {
    return announcements.find(a => a.id === id) || null;
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.announcements)
      .select(`
        *,
        author:profiles!author_id (full_name, role, email),
        validator:profiles!validated_by (full_name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error getting announcement:', err);
    return null;
  }
}

// Get Announcements by Category
export function getAnnouncementsByCategory(category) {
  return announcements.filter(a => a.category === category);
}

// Get Latest Announcements (for homepage)
export function getLatestAnnouncements(limit = 3) {
  return announcements.slice(0, limit);
}

// Debounce utility
function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Export
export const ACTUALITES = {
  init: initActualitesPage,
  loadAnnouncements,
  getAnnouncementById,
  getAnnouncementsByCategory,
  getLatestAnnouncements,
  CATEGORIES: {
    campaign: 'Campagne',
    alert: 'Alerte',
    info: 'Information',
    schedule: 'Planning',
    guideline: 'Directive'
  }
};