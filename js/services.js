/**
 * Services Module
 * Portail ZS-PAS - Nos Services
 */

import { getSupabase, TABLES, handleSupabaseError, formatResponse } from './supabase-config.js';
import { showToast, initScrollAnimations } from './components.js';

// Service Categories
export const SERVICE_CATEGORIES = {
  MATERNAL: { key: 'maternal', label: 'Santé Maternelle & Infantile', icon: 'pregnant_woman', color: 'secondary' },
  VACCINATION: { key: 'vaccination', label: 'Vaccination & Prévention', icon: 'vaccines', color: 'primary' },
  EMERGENCY: { key: 'emergency', label: 'Urgences & Soins Critiques', icon: 'emergency', color: 'error' },
  PRIMARY: { key: 'primary', label: 'Soins de Santé Primaires', icon: 'medical_services', color: 'tertiary' },
  COMMUNITY: { key: 'community', label: 'Santé Communautaire', icon: 'groups', color: 'secondary' },
  PHARMACY: { key: 'pharmacy', label: 'Pharmacie & Médicaments', icon: 'local_pharmacy', color: 'primary' },
  LAB: { key: 'lab', label: 'Laboratoire & Diagnostic', icon: 'science', color: 'tertiary' },
  ADMIN: { key: 'admin', label: 'Services Administratifs', icon: 'badge', color: 'primary' }
};

// State
let services = [];
let currentCategory = 'all';

// DOM Elements
let elements = {};

// Initialize Services Page
export async function initServicesPage() {
  cacheElements();
  await loadServices();
  setupEventListeners();
  renderServices();
  initScrollAnimations();
}

// Cache DOM Elements
function cacheElements() {
  elements = {
    categoryTabs: document.querySelectorAll('.service-category-tab'),
    serviceGrid: document.getElementById('service-grid'),
    serviceSearch: document.getElementById('service-search')
  };
}

// Load Services from Supabase
async function loadServices() {
  const supabase = getSupabase();
  if (!supabase) {
    services = getMockServices();
    return;
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.services)
      .select('*')
      .eq('is_active', true)
      .order('category')
      .order('display_order');

    if (error) throw error;

    services = data || [];
  } catch (err) {
    console.error('Error loading services:', err);
    showToast('Erreur lors du chargement des services', 'error');
    services = getMockServices();
  }
}

// Mock Services Data
function getMockServices() {
  return [
    // Santé Maternelle & Infantile
    { id: '1', name: 'Accouchements & Soins Obstétricaux', description: 'Prise en charge complète de la grossesse à l\'accouchement, césarienne gratuite, soins néonatals.', category: 'maternal', icon: 'pregnant_woman', display_order: 1, is_free: true, target_group: 'Femmes enceintes' },
    { id: '2', name: 'Consultations Prénatales (CPN)', description: 'Suivi de grossesse mensuel, dépistage des risques, supplémentation en fer/acide folique.', category: 'maternal', icon: 'monitor_heart', display_order: 2, is_free: true, target_group: 'Femmes enceintes' },
    { id: '3', name: 'Planning Familial', description: 'Conseil, méthodes contraceptives modernes, insertion DIU/implant, suivi.', category: 'maternal', icon: 'favorite', display_order: 3, is_free: true, target_group: 'Femmes en âge de procréer' },
    { id: '4', name: 'Soins Néonatals & Pédiatrie', description: 'Suivi du nouveau-né, vaccination, dépistage malnutrition, prise en charge IMCI.', category: 'maternal', icon: 'child_care', display_order: 4, is_free: true, target_group: 'Enfants 0-5 ans' },

    // Vaccination & Prévention
    { id: '5', name: 'Programme Élargi de Vaccination (PEV)', description: 'Vaccins gratuits selon calendrier national: BCG, DTP, Hépatite B, Rougeole, Fièvre jaune, HPV.', category: 'vaccination', icon: 'vaccines', display_order: 1, is_free: true, target_group: 'Enfants 0-23 mois, Filles 9-14 ans' },
    { id: '6', name: 'Vaccination Antigrippale Saisonnière', description: 'Campagnes annuelles pour personnes âgées, personnels soignants, pathologies chroniques.', category: 'vaccination', icon: 'healing', display_order: 2, is_free: true, target_group: 'Personnes à risque' },
    { id: '7', name: 'Dépistage & Prévention Maladies', description: 'Dépistage HTA, Diabète, Cancer du col (VIA/VILI), IST/VIH, nutrition.', category: 'vaccination', icon: 'biotech', display_order: 3, is_free: false, target_group: 'Population générale' },

    // Urgences & Soins Critiques
    { id: '8', name: 'Service d\'Accueil des Urgences (SAU)', description: 'Prise en charge 24h/24, triage, stabilisation, orientation vers services spécialisés.', category: 'emergency', icon: 'emergency', display_order: 1, is_free: false, target_group: 'Tous' },
    { id: '9', name: 'Réanimation & Soins Intensifs', description: 'Surveillance continue, ventilation, hémodynamie, dialyse (CHD Ouémé uniquement).', category: 'emergency', icon: 'monitor_heart', display_order: 2, is_free: false, target_group: 'Patients critiques' },
    { id: '10', name: 'Évacuation & Transfert Sanitaire', description: 'Ambulance terrestre, barque-ambulance lacustre (Aguégués), coordination SAMU 112.', category: 'emergency', icon: 'local_shipping', display_order: 3, is_free: true, target_group: 'Urgences vitales' },

    // Soins de Santé Primaires
    { id: '11', name: 'Consultations Médicales Générales', description: 'Médecine générale, pathologies courantes, prescription, certificats médicaux.', category: 'primary', icon: 'medical_services', display_order: 1, is_free: false, target_group: 'Population générale' },
    { id: '12', name: 'Soins Infirmiers & Pansements', description: 'Injections, perfusions, pansements complexes, cathétérisme, sonde vésicale.', category: 'primary', icon: 'healing', display_order: 2, is_free: false, target_group: 'Patients sur prescription' },
    { id: '13', name: 'Santé Mentale & Psychosociale', description: 'Consultation psychologique, prise en charge troubles mentaux, soutien psychosocial.', category: 'primary', icon: 'psychology', display_order: 3, is_free: true, target_group: 'Population générale' },

    // Santé Communautaire
    { id: '14', name: 'Agents de Santé Communautaires (ASC)', description: 'Visites à domicile, éducation sanitaire, dépistage communautaire, référence.', category: 'community', icon: 'groups', display_order: 1, is_free: true, target_group: 'Communautés rurales/lacustres' },
    { id: '15', name: 'Nutrition & Alimentation', description: 'Dépistage malnutrition aiguë, prise en charge CRENAS/CRENT, conseil nutritionnel.', category: 'community', icon: 'restaurant', display_order: 2, is_free: true, target_group: 'Enfants <5 ans, Femmes enceintes/allaitantes' },
    { id: '16', name: 'Eau, Hygiène & Assainissement (EHA)', description: 'Promotion hygiène, traitement eau (Aquatabs), latrines, lutte anti-vectorielle.', category: 'community', icon: 'water_drop', display_order: 3, is_free: true, target_group: 'Ménages zones à risque' },

    // Pharmacie & Médicaments
    { id: '17', name: 'Pharmacie de Garde', description: 'Disponibilité médicaments essentiels 24h/24, liste garde hebdomadaire publiée.', category: 'pharmacy', icon: 'local_pharmacy', display_order: 1, is_free: false, target_group: 'Population générale' },
    { id: '18', name: 'Dispensation Médicaments Essentiels', description: 'Médicaments génériques de qualité, liste nationale, gratuité ciblée (ACT, SP, Fer/Folique).', category: 'pharmacy', icon: 'medication', display_order: 2, is_free: false, target_group: 'Patients sur prescription' },

    // Laboratoire & Diagnostic
    { id: '19', name: 'Biologie Médicale', description: 'Hémogramme, biochimie, sérologie, parasitologie, bactériologie, groupe sanguin.', category: 'lab', icon: 'science', display_order: 1, is_free: false, target_group: 'Patients sur prescription' },
    { id: '20', name: 'Imagerie Médicale', description: 'Radiographie, échographie, scanner (CHD Ouémé), mammographie.', category: 'lab', icon: 'radiology', display_order: 2, is_free: false, target_group: 'Patients sur prescription' },

    // Services Administratifs
    { id: '21', name: 'Délivrance Certificats & Attestations', description: 'Certificats médicaux, attestations de vaccination, certificats d\'aptitude, visas.', category: 'admin', icon: 'badge', display_order: 1, is_free: false, target_group: 'Usagers, Administrations' },
    { id: '22', name: 'Agrément & Autorisation Structures', description: 'Dossiers d\'agrément privé, renouvellement, inspection, conformité normes MS.', category: 'admin', icon: 'assignment', display_order: 2, is_free: false, target_group: 'Promoteurs structures privées' },
    { id: '23', name: 'Recrutement & Gestion RH', description: 'Concours, affectations, formations continues, évaluation performances.', category: 'admin', icon: 'people', display_order: 3, is_free: false, target_group: 'Personnel de santé' }
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
  if (elements.serviceSearch) {
    elements.serviceSearch.addEventListener('input', debounce(handleSearch, 300));
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

  renderServices();
}

// Handle Search
function handleSearch(e) {
  const query = e.target.value.toLowerCase().trim();
  renderServices(query);
}

// Render Services
function renderServices(searchQuery = '') {
  if (!elements.serviceGrid) return;

  let filtered = services;

  // Filter by category
  if (currentCategory !== 'all') {
    filtered = filtered.filter(s => s.category === currentCategory);
  }

  // Filter by search
  if (searchQuery) {
    filtered = filtered.filter(s =>
      s.name.toLowerCase().includes(searchQuery) ||
      s.description.toLowerCase().includes(searchQuery) ||
      s.target_group.toLowerCase().includes(searchQuery)
    );
  }

  if (filtered.length === 0) {
    elements.serviceGrid.innerHTML = `
      <div class="col-span-full text-center py-space-xl">
        <span class="material-symbols-outlined text-4xl text-on-surface-variant mb-2 block">search_off</span>
        <h3 class="font-headline-sm text-headline-sm text-on-surface mb-2">Aucun service trouvé</h3>
        <p class="font-body-md text-body-md text-on-surface-variant">Essayez de modifier votre recherche</p>
      </div>
    `;
    return;
  }

  // Group by category for display
  const categories = currentCategory === 'all'
    ? Object.values(SERVICE_CATEGORIES)
    : [SERVICE_CATEGORIES[currentCategory]];

  elements.serviceGrid.innerHTML = categories.map(cat => {
    const catServices = filtered.filter(s => s.category === cat.key);
    if (catServices.length === 0) return '';

    return `
      <div class="col-span-full" data-animate>
        <h3 class="font-headline-md text-headline-md text-on-surface mb-space-md flex items-center gap-2">
          <span class="material-symbols-outlined text-${cat.color}" style="font-size: 24px;">${cat.icon}</span>
          ${cat.label}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
          ${catServices.map(service => renderServiceCard(service, cat.color)).join('')}
        </div>
      </div>
    `;
  }).join('');
}

// Render Service Card
function renderServiceCard(service, categoryColor) {
  return `
    <article class="bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md p-space-lg transition-all border border-surface-container-high" data-animate>
      <div class="flex items-start gap-space-md mb-space-md">
        <div class="w-12 h-12 rounded-xl bg-${categoryColor}-fixed flex items-center justify-center text-${categoryColor} shrink-0">
          <span class="material-symbols-outlined text-2xl">${service.icon}</span>
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="font-headline-sm text-headline-sm text-on-surface font-bold truncate">${service.name}</h4>
          <div class="flex items-center gap-2 mt-1">
            ${service.is_free ? '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-label-sm text-label-sm font-bold"><span class="material-symbols-outlined text-xs">verified</span> Gratuit</span>' : ''}
            <span class="font-label-sm text-label-sm text-on-surface-variant">${service.target_group}</span>
          </div>
        </div>
      </div>
      <p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">${service.description}</p>
      ${service.is_free ? `
        <div class="mt-space-md pt-space-md border-t border-surface-container">
          <p class="font-label-sm text-label-sm text-secondary font-bold flex items-center gap-1">
            <span class="material-symbols-outlined text-xs">info</span>
            Service gratuit dans les formations sanitaires publiques accréditées
          </p>
        </div>
      ` : ''}
    </article>
  `;
}

// Debounce utility
function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Get Service by ID
export async function getServiceById(id) {
  const supabase = getSupabase();
  if (!supabase) {
    return services.find(s => s.id === id) || null;
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.services)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error getting service:', err);
    return null;
  }
}

// Get Services by Category
export function getServicesByCategory(category) {
  return services.filter(s => s.category === category);
}

// Get All Services
export function getAllServices() {
  return services;
}

// Export
export const SERVICES = {
  init: initServicesPage,
  loadServices,
  getServiceById,
  getServicesByCategory,
  getAllServices,
  CATEGORIES: SERVICE_CATEGORIES
};