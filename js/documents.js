/**
 * Documents Publics Module
 * Portail ZS-PAS
 */

import { getSupabase, TABLES, handleSupabaseError } from './supabase-config.js';
import { showToast, initScrollAnimations, formatDate } from './components.js';

// Document Categories
export const DOCUMENT_CATEGORIES = {
  STRATEGIC: { key: 'strategic', label: 'Plans Stratégiques', icon: 'picture_as_pdf', color: 'secondary' },
  MEDICAL: { key: 'medical', label: 'Guides Médicaux & Protocoles', icon: 'calendar_month', color: 'primary' },
  ADMINISTRATIVE: { key: 'administrative', label: 'Formulaires & Démarches', icon: 'description', color: 'tertiary' },
  EPIDEMIOLOGICAL: { key: 'epidemiological', label: 'Bulletins Épidémiologiques', icon: 'analytics', color: 'error' },
  REGULATORY: { key: 'regulatory', label: 'Textes Réglementaires', icon: 'gavel', color: 'primary' },
  REPORTS: { key: 'reports', label: 'Rapports d\'Activité', icon: 'assessment', color: 'secondary' }
};

// State
let documents = [];
let currentCategory = 'all';

// DOM Elements
let elements = {};

// Initialize Documents Page
export async function initDocumentsPage() {
  cacheElements();
  await loadDocuments();
  setupEventListeners();
  renderDocuments();
  initScrollAnimations();
}

// Cache DOM Elements
function cacheElements() {
  elements = {
    categoryTabs: document.querySelectorAll('.document-category-tab'),
    documentsGrid: document.getElementById('documents-grid'),
    searchInput: document.getElementById('document-search')
  };
}

// Load Documents from Supabase
async function loadDocuments() {
  const supabase = getSupabase();
  if (!supabase) {
    documents = getMockDocuments();
    return;
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.documents)
      .select(`
        *,
        uploader:profiles!uploaded_by (full_name)
      `)
      .eq('is_public', true)
      .order('category')
      .order('display_order');

    if (error) throw error;

    documents = data || [];
  } catch (err) {
    console.error('Error loading documents:', err);
    showToast('Erreur lors du chargement des documents', 'error');
    documents = getMockDocuments();
  }
}

// Mock Documents
function getMockDocuments() {
  return [
    {
      id: '1',
      title: 'Plan de Développement Sanitaire (PDS) 2026-2030',
      description: 'Feuille de route quinquennale de la zone PAS définissant les axes stratégiques, objectifs et indicateurs de performance.',
      category: 'strategic',
      file_url: 'https://example.com/pds-2026-2030.pdf',
      file_size: '4.2 Mo',
      file_type: 'application/pdf',
      pages: 87,
      published_at: '2026-01-15',
      display_order: 1,
      is_featured: true,
      tags: ['planification', 'stratégie', '2026-2030']
    },
    {
      id: '2',
      title: 'Calendrier Vaccinal National Bénin 2026',
      description: 'Protocole vaccinal complet de la petite enfance et femmes enceintes selon les recommandations du Ministère de la Santé.',
      category: 'medical',
      file_url: 'https://example.com/calendrier-vaccinal-2026.pdf',
      file_size: '1.8 Mo',
      file_type: 'application/pdf',
      pages: 24,
      published_at: '2026-03-01',
      display_order: 1,
      is_featured: true,
      tags: ['vaccination', 'calendrier', 'PEV']
    },
    {
      id: '3',
      title: 'Formulaire de Demande d\'Agrément Structure Privée',
      description: 'Dossier de conformité pour l\'ouverture et l\'agrément des structures de soins privées (cliniques, cabinets, laboratoires).',
      category: 'administrative',
      file_url: 'https://example.com/demande-agrement-prive.pdf',
      file_size: '850 Ko',
      file_type: 'application/pdf',
      pages: 12,
      published_at: '2026-02-10',
      display_order: 1,
      is_featured: true,
      tags: ['agrément', 'privé', 'formulaire']
    },
    {
      id: '4',
      title: 'Bulletin Épidémiologique Hebdomadaire - Semaine 40',
      description: 'Situation épidémiologique de la semaine: paludisme, maladies diarrhéiques, rougeole, COVID-19, indicateurs de surveillance.',
      category: 'epidemiological',
      file_url: 'https://example.com/bulletin-epid-s40-2026.pdf',
      file_size: '2.1 Mo',
      file_type: 'application/pdf',
      pages: 8,
      published_at: '2026-10-07',
      display_order: 1,
      is_featured: false,
      tags: ['surveillance', 'hebdomadaire', 'semaine 40']
    },
    {
      id: '5',
      title: 'Guide de Prise en Charge du Paludisme Simple et Grave',
      description: 'Protocole national actualisé 2026: diagnostic, traitement de première ligne, référence, prévention chez la femme enceinte et l\'enfant.',
      category: 'medical',
      file_url: 'https://example.com/guide-paludisme-2026.pdf',
      file_size: '3.5 Mo',
      file_type: 'application/pdf',
      pages: 45,
      published_at: '2026-04-20',
      display_order: 2,
      is_featured: false,
      tags: ['paludisme', 'protocole', 'traitement']
    },
    {
      id: '6',
      title: 'Rapport Annuel d\'Activité ZS-PAS 2025',
      description: 'Bilan des activités sanitaires, indicateurs de performance, ressources humaines, infrastructure, finances, perspectives 2026.',
      category: 'reports',
      file_url: 'https://example.com/rapport-annuel-2025.pdf',
      file_size: '6.8 Mo',
      file_type: 'application/pdf',
      pages: 124,
      published_at: '2026-03-31',
      display_order: 1,
      is_featured: false,
      tags: ['rapport', 'annuel', '2025', 'bilan']
    },
    {
      id: '7',
      title: 'Arrêté Ministériel Organisation Zone Sanitaire',
      description: 'Texte officiel définissant la composition, les attributions et le fonctionnement de la Zone Sanitaire PAS.',
      category: 'regulatory',
      file_url: 'https://example.com/arrete-organisation-zs.pdf',
      file_size: '420 Ko',
      file_type: 'application/pdf',
      pages: 15,
      published_at: '2025-12-01',
      display_order: 1,
      is_featured: false,
      tags: ['réglementation', 'arrêté', 'organisation']
    },
    {
      id: '8',
      title: 'Guide de l\'Usager - Vos Droits & Démarches',
      description: 'Brochure d\'information pour les usagers: droits du patient, parcours de soins, numéros d\'urgence, réclamations, gratuité ciblée.',
      category: 'administrative',
      file_url: 'https://example.com/guide-usager-droits.pdf',
      file_size: '1.2 Mo',
      file_type: 'application/pdf',
      pages: 16,
      published_at: '2026-06-15',
      display_order: 2,
      is_featured: false,
      tags: ['usager', 'droits', 'guide', 'information']
    }
  ];
}

// Setup Event Listeners
function setupEventListeners() {
  // Category tabs
  elements.categoryTabs?.forEach(tab => {
    tab.addEventListener('click', () => {
      const category = tab.dataset.category;
      setActiveCategory(category);
    });
  });

  // Search
  if (elements.searchInput) {
    elements.searchInput.addEventListener('input', debounce(handleSearch, 300));
  }
}

// Set Active Category
function setActiveCategory(category) {
  currentCategory = category;

  elements.categoryTabs?.forEach(tab => {
    const isActive = tab.dataset.category === category;
    tab.classList.toggle('active', isActive);
    tab.classList.toggle('bg-primary', isActive);
    tab.classList.toggle('text-on-primary', isActive);
    tab.classList.toggle('shadow-sm', isActive);
    if (!isActive) {
      tab.classList.add('bg-surface-container', 'text-on-surface-variant');
      tab.classList.remove('bg-primary', 'text-on-primary', 'shadow-sm');
    }
  });

  renderDocuments();
}

// Handle Search
function handleSearch(e) {
  const query = e.target.value.toLowerCase().trim();
  renderDocuments(query);
}

// Render Documents
function renderDocuments(searchQuery = '') {
  if (!elements.documentsGrid) return;

  let filtered = documents;

  // Filter by category
  if (currentCategory !== 'all') {
    filtered = filtered.filter(d => d.category === currentCategory);
  }

  // Filter by search
  if (searchQuery) {
    filtered = filtered.filter(d =>
      d.title.toLowerCase().includes(searchQuery) ||
      d.description.toLowerCase().includes(searchQuery) ||
      d.tags?.some(t => t.toLowerCase().includes(searchQuery))
    );
  }

  if (filtered.length === 0) {
    elements.documentsGrid.innerHTML = `
      <div class="col-span-full text-center py-space-xl">
        <span class="material-symbols-outlined text-4xl text-on-surface-variant mb-2 block">description</span>
        <h3 class="font-headline-sm text-headline-sm text-on-surface mb-2">Aucun document trouvé</h3>
        <p class="font-body-md text-body-md text-on-surface-variant">Essayez de modifier votre recherche</p>
      </div>
    `;
    return;
  }

  // Group by category
  const categories = currentCategory === 'all'
    ? Object.values(DOCUMENT_CATEGORIES)
    : [DOCUMENT_CATEGORIES[currentCategory]];

  elements.documentsGrid.innerHTML = categories.map(cat => {
    const catDocs = filtered.filter(d => d.category === cat.key);
    if (catDocs.length === 0) return '';

    return `
      <div class="col-span-full" data-animate>
        <h3 class="font-headline-md text-headline-md text-on-surface mb-space-md flex items-center gap-2">
          <span class="material-symbols-outlined text-${cat.color}" style="font-size: 24px;">${cat.icon}</span>
          ${cat.label}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
          ${catDocs.map(doc => renderDocumentCard(doc, cat.color)).join('')}
        </div>
      </div>
    `;
  }).join('');
}

// Render Document Card
function renderDocumentCard(doc, categoryColor) {
  return `
    <article class="bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 flex items-start gap-4" data-animate>
      <div class="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0">
        <span class="material-symbols-outlined text-2xl">picture_as_pdf</span>
      </div>
      <div class="flex-1 min-w-0">
        <span class="font-label-sm text-label-sm text-${categoryColor} font-bold uppercase">${DOCUMENT_CATEGORIES[doc.category]?.label || doc.category}</span>
        <h4 class="font-label-lg text-label-lg font-bold text-on-surface truncate mt-0.5">${doc.title}</h4>
        <p class="font-body-sm text-body-sm text-on-surface-variant text-xs mt-1">${doc.description}</p>
        <div class="flex items-center gap-3 mt-2 text-xs text-on-surface-variant">
          <span class="flex items-center gap-1">
            <span class="material-symbols-outlined text-xs">description</span>
            ${doc.pages} pages
          </span>
          <span class="flex items-center gap-1">
            <span class="material-symbols-outlined text-xs">cloud_download</span>
            ${doc.file_size}
          </span>
          <span class="flex items-center gap-1">
            <span class="material-symbols-outlined text-xs">calendar_today</span>
            ${formatDate(doc.published_at, { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
        <a href="${doc.file_url}" target="_blank" class="inline-flex items-center gap-1 text-primary font-label-sm text-label-sm font-bold mt-3 hover:underline">
          <span>Télécharger le document</span>
          <span class="material-symbols-outlined text-xs">download</span>
        </a>
      </div>
    </article>
  `;
}

// Get Document by ID
export async function getDocumentById(id) {
  const supabase = getSupabase();
  if (!supabase) {
    return documents.find(d => d.id === id) || null;
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.documents)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error getting document:', err);
    return null;
  }
}

// Get Documents by Category
export function getDocumentsByCategory(category) {
  return documents.filter(d => d.category === category);
}

// Get Featured Documents
export function getFeaturedDocuments(limit = 3) {
  return documents.filter(d => d.is_featured).slice(0, limit);
}

// Track Download
export async function trackDownload(documentId) {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    await supabase.rpc('increment_document_download', { doc_id: documentId });
  } catch (err) {
    console.warn('Could not track download:', err);
  }
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
export const DOCUMENTS = {
  init: initDocumentsPage,
  loadDocuments,
  getDocumentById,
  getDocumentsByCategory,
  getFeaturedDocuments,
  trackDownload,
  CATEGORIES: DOCUMENT_CATEGORIES
};