/**
 * Centres de Santé Module
 * Portail ZS-PAS - Annuaire et Carte Interactive
 */

import { getSupabase, TABLES, FACILITY_TYPES, COMMUNES, handleSupabaseError, formatResponse } from './supabase-config.js';
import { showToast, debounce, initScrollAnimations } from './components.js';

// State
let facilities = [];
let filteredFacilities = [];
let map = null;
let markers = [];
let currentFilters = {
  search: '',
  commune: 'all',
  arrondissement: 'all',
  type: 'all',
  services: []
};

// DOM Elements
let elements = {};

// Initialize Centres Page
export async function initCentresPage() {
  cacheElements();
  await loadFacilities();
  initMap();
  setupEventListeners();
  renderFacilities();
  initScrollAnimations();
}

// Cache DOM Elements
function cacheElements() {
  elements = {
    searchInput: document.getElementById('facility-search'),
    communeFilter: document.getElementById('filter-commune'),
    arrondissementFilter: document.getElementById('filter-arrondissement'),
    typeButtons: document.querySelectorAll('.filter-type-btn'),
    serviceCheckboxes: document.querySelectorAll('.service-filter input[type="checkbox"]'),
    facilityList: document.getElementById('facility-list'),
    facilityCount: document.getElementById('facility-count'),
    counterTotal: document.getElementById('counter-total'),
    mapContainer: document.getElementById('map')
  };
}

// Load Facilities from Supabase
async function loadFacilities() {
  const supabase = getSupabase();
  if (!supabase) {
    // Fallback to mock data for demo
    facilities = getMockFacilities();
    return;
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.healthFacilities)
      .select(`
        *,
        facility_services (
          service:services (id, name, icon, category)
        )
      `)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    facilities = (data || []).map(f => ({
      ...f,
      services: f.facility_services?.map(fs => fs.service) || []
    }));
  } catch (err) {
    console.error('Error loading facilities:', err);
    showToast('Erreur lors du chargement des centres', 'error');
    facilities = getMockFacilities();
  }
}

// Mock Data for Demo
function getMockFacilities() {
  return [
    {
      id: '1',
      name: 'Hôpital de Zone de Porto-Novo / CHD-Ouémé',
      type: FACILITY_TYPES.HOSPITAL,
      commune: COMMUNES.PORTO_NOVO,
      arrondissement: 'Attakè',
      address: 'Quartier Attakè, Arrondissement 2, Porto-Novo',
      phone: '+229 20 21 23 45',
      email: 'chd@zs-pas.sante.gouv.bj',
      latitude: 6.4969,
      longitude: 2.6283,
      hours: '24h/24 - 7j/7',
      emergency: true,
      maternity: true,
      pharmacy: true,
      lab: true,
      imaging: true,
      blood_bank: true,
      neonatal: true,
      verified_at: '2026-10-15',
      fass_code: 'BJ-OU-PN-001',
      description: 'Hôpital de référence départemental avec plateau technique complet',
      services: [
        { id: '1', name: 'Urgences 24/7', icon: 'emergency', category: 'emergency' },
        { id: '2', name: 'Maternité Niveau 2', icon: 'pregnant_woman', category: 'maternity' },
        { id: '3', name: 'Bloc Néonatal', icon: 'child_care', category: 'pediatric' },
        { id: '4', name: 'Banque de Sang', icon: 'bloodtype', category: 'lab' },
        { id: '5', name: 'Laboratoire 24/7', icon: 'science', category: 'lab' },
        { id: '6', name: 'Imagerie Médicale', icon: 'radiology', category: 'imaging' },
        { id: '7', name: 'Pharmacie de Garde', icon: 'local_pharmacy', category: 'pharmacy' }
      ]
    },
    {
      id: '2',
      name: 'Centre de Santé d\'Arrondissement (CSA) de Sèmè-Podji',
      type: FACILITY_TYPES.CSA,
      commune: COMMUNES.SEME_PODJI,
      arrondissement: 'Podji',
      address: 'Carrefour Podji, Axe Inter-États Porto-Novo / Cotonou',
      phone: '+229 20 25 10 12',
      email: 'csa-semepodji@zs-pas.sante.gouv.bj',
      latitude: 6.3756,
      longitude: 2.6123,
      hours: 'Lun-Ven 7h-19h, Sam 8h-13h',
      emergency: false,
      maternity: true,
      pharmacy: true,
      lab: true,
      imaging: false,
      blood_bank: false,
      neonatal: false,
      verified_at: '2026-10-10',
      fass_code: 'BJ-OU-SP-014',
      description: 'Centre de santé d\'arrondissement avec maternité active',
      services: [
        { id: '2', name: 'Maternité', icon: 'pregnant_woman', category: 'maternity' },
        { id: '3', name: 'CPN & Planning Familial', icon: 'favorite', category: 'reproductive' },
        { id: '5', name: 'PEV / Vaccination', icon: 'vaccines', category: 'vaccination' },
        { id: '8', name: 'Dépistage Paludisme', icon: 'bug_report', category: 'screening' }
      ]
    },
    {
      id: '3',
      name: 'Centre de Santé Lacustre des Aguégués (Zoungamè)',
      type: FACILITY_TYPES.LACUSTRIAN,
      commune: COMMUNES.AGUEGUES,
      arrondissement: 'Zoungamè',
      address: 'Arrondissement de Zoungamè — Débarcadère principal',
      phone: '+229 20 28 01 02',
      email: 'csa-aguegues@zs-pas.sante.gouv.bj',
      latitude: 6.5667,
      longitude: 2.5333,
      hours: 'Lun-Ven 8h-17h',
      emergency: true,
      maternity: true,
      pharmacy: false,
      lab: true,
      imaging: false,
      blood_bank: false,
      neonatal: true,
      verified_at: '2026-10-12',
      fass_code: 'BJ-OU-AG-003',
      description: 'Centre de santé lacustre accessible par pirogue uniquement',
      services: [
        { id: '1', name: 'Accès Pirogue/Barque', icon: 'sailing', category: 'transport' },
        { id: '2', name: 'SONU (Soins Obstétricaux)', icon: 'pregnant_woman', category: 'emergency' },
        { id: '3', name: 'Barque-Ambulance', icon: 'local_shipping', category: 'transport' },
        { id: '8', name: 'Paludisme Pédiatrique', icon: 'bug_report', category: 'screening' }
      ]
    },
    {
      id: '4',
      name: 'Centre de Santé d\'Arrondissement (CSA) de Djassin',
      type: FACILITY_TYPES.CSA,
      commune: COMMUNES.PORTO_NOVO,
      arrondissement: 'Djassin',
      address: 'Quartier Djassin Daho, Porto-Novo',
      phone: '+229 20 22 41 80',
      email: 'csa-djassin@zs-pas.sante.gouv.bj',
      latitude: 6.5123,
      longitude: 2.6012,
      hours: 'Lun-Ven 7h-19h',
      emergency: false,
      maternity: false,
      pharmacy: false,
      lab: true,
      imaging: false,
      blood_bank: false,
      neonatal: false,
      verified_at: '2026-10-08',
      fass_code: 'BJ-OU-PN-008',
      description: 'Centre de santé d\'arrondissement spécialisé en santé maternelle et infantile',
      services: [
        { id: '3', name: 'CPN & Post-natale', icon: 'pregnant_woman', category: 'maternity' },
        { id: '4', name: 'Surveillance Nutritionnelle', icon: 'monitor_weight', category: 'nutrition' },
        { id: '5', name: 'Planning Familial', icon: 'favorite', category: 'reproductive' },
        { id: '6', name: 'Vaccination Routinière', icon: 'vaccines', category: 'vaccination' }
      ]
    }
  ];
}

// Initialize Leaflet Map
function initMap() {
  if (!elements.mapContainer) return;

  // Check if Leaflet is loaded
  if (typeof L === 'undefined') {
    console.warn('Leaflet not loaded. Map will not be initialized.');
    elements.mapContainer.innerHTML = `
      <div class="w-full h-[500px] bg-surface-container-low flex items-center justify-center">
        <div class="text-center p-4">
          <span class="material-symbols-outlined text-4xl text-on-surface-variant mb-2 block">map</span>
          <p class="font-body-md text-body-md text-on-surface-variant">Carte interactive (Leaflet non chargé)</p>
          <p class="font-body-sm text-body-sm text-on-surface-variant mt-1">Incluez Leaflet CSS/JS pour activer la carte</p>
        </div>
      </div>
    `;
    return;
  }

  // Initialize map centered on ZS-PAS
  map = L.map('map', {
    zoomControl: false,
    attributionControl: false
  }).setView([6.4969, 2.6283], 11);

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Custom zoom control
  L.control.zoom({ position: 'topright' }).addTo(map);

  // Add facility markers
  addFacilityMarkers();

  // Fit bounds to show all facilities
  if (markers.length > 0) {
    const group = new L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.1));
  }
}

// Add Facility Markers to Map
function addFacilityMarkers() {
  if (!map) return;

  // Clear existing markers
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  const typeIcons = {
    [FACILITY_TYPES.HOSPITAL]: { color: '#00288e', icon: 'local_hospital' },
    [FACILITY_TYPES.CSA]: { color: '#006c4a', icon: 'medical_services' },
    [FACILITY_TYPES.CSC]: { color: '#006c4a', icon: 'local_hospital' },
    [FACILITY_TYPES.MATERNITY]: { color: '#D97706', icon: 'pregnant_woman' },
    [FACILITY_TYPES.LACUSTRIAN]: { color: '#D97706', icon: 'sailing' },
    [FACILITY_TYPES.CONFESSIONAL]: { color: '#757684', icon: 'church' }
  };

  filteredFacilities.forEach(facility => {
    if (!facility.latitude || !facility.longitude) return;

    const typeInfo = typeIcons[facility.type] || typeIcons[FACILITY_TYPES.CSA];

    const marker = L.marker([facility.latitude, facility.longitude], {
      icon: L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="marker-pin" style="background: ${typeInfo.color}">
            <span class="material-symbols-outlined" style="font-size: 16px;">${typeInfo.icon}</span>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40]
      })
    }).addTo(map);

    marker.bindPopup(`
      <div class="p-2 min-w-[200px]">
        <h3 class="font-bold text-primary mb-1">${facility.name}</h3>
        <p class="text-sm text-gray-600 mb-2">${facility.address}</p>
        <div class="flex gap-2 mb-2">
          <a href="tel:${facility.phone}" class="btn btn-primary btn-sm">
            <span class="material-symbols-outlined text-sm">call</span> Appeler
          </a>
          <button class="btn btn-outline btn-sm get-directions" data-lat="${facility.latitude}" data-lng="${facility.longitude}">
            <span class="material-symbols-outlined text-sm">directions</span> Itinéraire
          </button>
        </div>
        <p class="text-xs text-gray-500">Code FASS: ${facility.fass_code}</p>
      </div>
    `);

    markers.push(marker);
  });

  // Handle direction buttons in popups
  map.on('popupopen', (e) => {
    const btn = e.popup._contentNode?.querySelector('.get-directions');
    if (btn) {
      btn.addEventListener('click', () => {
        const lat = btn.dataset.lat;
        const lng = btn.dataset.lng;
        openDirections(lat, lng);
      });
    }
  });
}

// Open Directions in External Map
function openDirections(lat, lng) {
  const url = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${lat}%2C${lng}`;
  window.open(url, '_blank');
}

// Setup Event Listeners
function setupEventListeners() {
  // Search input
  if (elements.searchInput) {
    elements.searchInput.addEventListener('input', debounce(handleSearch, 300));
  }

  // Commune filter
  if (elements.communeFilter) {
    elements.communeFilter.addEventListener('change', handleCommuneChange);
  }

  // Arrondissement filter
  if (elements.arrondissementFilter) {
    elements.arrondissementFilter.addEventListener('change', handleArrondissementChange);
  }

  // Type filter buttons
  elements.typeButtons?.forEach(btn => {
    btn.addEventListener('click', () => handleTypeFilter(btn.dataset.typeFilter));
  });

  // Service checkboxes
  elements.serviceCheckboxes?.forEach(cb => {
    cb.addEventListener('change', handleServiceFilter);
  });
}

// Handle Search
function handleSearch(e) {
  currentFilters.search = e.target.value.toLowerCase().trim();
  applyFilters();
}

// Handle Commune Change
function handleCommuneChange(e) {
  currentFilters.commune = e.target.value;
  updateArrondissementOptions(currentFilters.commune);
  applyFilters();
}

// Update Arrondissement Options based on Commune
function updateArrondissementOptions(commune) {
  if (!elements.arrondissementFilter) return;

  const arrondissements = {
    'all': [{ value: 'all', label: 'Tous les arrondissements' }],
    'porto-novo': [
      { value: 'all', label: 'Tous les arrondissements' },
      { value: 'attake', label: 'Attakè' },
      { value: 'djassin', label: 'Djassin' },
      { value: 'avrankou-gare', label: 'Avrankou-Gare' }
    ],
    'aguegues': [
      { value: 'all', label: 'Tous les arrondissements' },
      { value: 'avagbodji', label: 'Avagbodji' },
      { value: 'houedome', label: 'Houédomè' },
      { value: 'zoungame', label: 'Zoungamè' }
    ],
    'seme-podji': [
      { value: 'all', label: 'Tous les arrondissements' },
      { value: 'podji', label: 'Podji' },
      { value: 'djonou', label: 'Djonou' },
      { value: 'ekpe', label: 'Ekpè' },
      { value: 'agblangandan', label: 'Agblangandan' },
      { value: 'djeregbe', label: 'Djèrègbé' },
      { value: 'tohoue', label: 'Tohouè' }
    ]
  };

  const options = arrondissements[commune] || arrondissements['all'];
  elements.arrondissementFilter.innerHTML = options.map(opt =>
    `<option value="${opt.value}">${opt.label}</option>`
  ).join('');

  currentFilters.arrondissement = 'all';
}

// Handle Arrondissement Change
function handleArrondissementChange(e) {
  currentFilters.arrondissement = e.target.value;
  applyFilters();
}

// Handle Type Filter
function handleTypeFilter(type) {
  currentFilters.type = type;

  // Update active button
  elements.typeButtons?.forEach(btn => {
    const isActive = btn.dataset.typeFilter === type;
    btn.classList.toggle('active', isActive);
    btn.classList.toggle('bg-primary', isActive);
    btn.classList.toggle('text-on-primary', isActive);
    btn.classList.toggle('shadow-sm', isActive);
    if (!isActive) {
      btn.classList.add('bg-surface-container', 'text-on-surface-variant');
      btn.classList.remove('bg-primary', 'text-on-primary', 'shadow-sm');
    }
  });

  applyFilters();
}

// Handle Service Filter
function handleServiceFilter() {
  currentFilters.services = Array.from(elements.serviceCheckboxes || [])
    .filter(cb => cb.checked)
    .map(cb => cb.value);
  applyFilters();
}

// Apply All Filters
function applyFilters() {
  filteredFacilities = facilities.filter(facility => {
    // Search filter
    if (currentFilters.search) {
      const searchText = `${facility.name} ${facility.address} ${facility.commune} ${facility.arrondissement} ${facility.services.map(s => s.name).join(' ')}`.toLowerCase();
      if (!searchText.includes(currentFilters.search)) return false;
    }

    // Commune filter
    if (currentFilters.commune !== 'all' && facility.commune !== currentFilters.commune) return false;

    // Arrondissement filter
    if (currentFilters.arrondissement !== 'all' && facility.arrondissement !== currentFilters.arrondissement) return false;

    // Type filter
    if (currentFilters.type !== 'all' && facility.type !== currentFilters.type) return false;

    // Services filter
    if (currentFilters.services.length > 0) {
      const facilityServiceNames = facility.services.map(s => s.name);
      if (!currentFilters.services.every(s => facilityServiceNames.includes(s))) return false;
    }

    return true;
  });

  renderFacilities();
  updateMapMarkers();
  updateCounter();
}

// Update Map Markers
function updateMapMarkers() {
  if (!map) return;
  addFacilityMarkers();

  // Fit bounds to filtered facilities
  if (markers.length > 0) {
    const group = new L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.1));
  }
}

// Update Counter
function updateCounter() {
  if (elements.facilityCount) {
    elements.facilityCount.textContent = `Affichage de ${filteredFacilities.length} centre${filteredFacilities.length > 1 ? 's' : ''} sur ${facilities.length}`;
  }
  if (elements.counterTotal) {
    elements.counterTotal.textContent = facilities.length;
  }
}

// Render Facilities List
function renderFacilities() {
  if (!elements.facilityList) return;

  if (filteredFacilities.length === 0) {
    elements.facilityList.innerHTML = `
      <div class="col-span-full text-center py-space-xl">
        <span class="material-symbols-outlined text-4xl text-on-surface-variant mb-2 block">search_off</span>
        <h3 class="font-headline-sm text-headline-sm text-on-surface mb-2">Aucun centre trouvé</h3>
        <p class="font-body-md text-body-md text-on-surface-variant">Essayez de modifier vos critères de recherche</p>
      </div>
    `;
    return;
  }

  elements.facilityList.innerHTML = filteredFacilities.map(facility => renderFacilityCard(facility)).join('');

  // Add click handlers for call and direction buttons
  elements.facilityList.querySelectorAll('.call-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = btn.href;
    });
  });

  elements.facilityList.querySelectorAll('.direction-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const lat = btn.dataset.lat;
      const lng = btn.dataset.lng;
      openDirections(lat, lng);
    });
  });
}

// Render Single Facility Card
function renderFacilityCard(facility) {
  const typeLabels = {
    [FACILITY_TYPES.HOSPITAL]: 'Hôpital de Zone / CHD',
    [FACILITY_TYPES.CSA]: 'CSA',
    [FACILITY_TYPES.CSC]: 'CSC',
    [FACILITY_TYPES.MATERNITY]: 'Maternité',
    [FACILITY_TYPES.LACUSTRIAN]: 'Dispensaire Lacustre',
    [FACILITY_TYPES.CONFESSIONAL]: 'Centre Confessionnel'
  };

  const typeColors = {
    [FACILITY_TYPES.HOSPITAL]: 'border-primary bg-primary/5',
    [FACILITY_TYPES.CSA]: 'border-secondary bg-secondary/5',
    [FACILITY_TYPES.CSC]: 'border-secondary bg-secondary/5',
    [FACILITY_TYPES.MATERNITY]: 'border-tertiary-container bg-tertiary-fixed/20',
    [FACILITY_TYPES.LACUSTRIAN]: 'border-tertiary-container bg-tertiary-fixed/20',
    [FACILITY_TYPES.CONFESSIONAL]: 'border-outline-variant bg-surface-container'
  };

  const statusColor = facility.emergency ? 'secondary' : 'primary';
  const statusText = facility.emergency ? 'Garde 24h/24 Urgences' : 'Ouvert';

  return `
    <article class="facility-card relative bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md p-space-md md:p-space-lg transition-all border-l-4 ${typeColors[facility.type] || 'border-primary'}" data-animate>
      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-space-sm">
        <div class="space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-primary text-on-primary font-bold">${typeLabels[facility.type] || facility.type}</span>
            <span class="px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-surface-container-high text-on-surface-variant font-medium">Commune de ${formatCommune(facility.commune)}</span>
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-${statusColor}/15 text-${statusColor} font-semibold">
              <span class="w-1.5 h-1.5 rounded-full bg-${statusColor}"></span>
              ${statusText}
            </span>
          </div>
          <h2 class="font-headline-sm text-headline-sm text-on-surface pt-1">${facility.name}</h2>
          <p class="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1.5">
            <span class="material-symbols-outlined text-outline text-sm">pin_drop</span>
            ${facility.address}
          </p>
        </div>
        <div class="flex-shrink-0">
          <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container text-primary font-label-sm text-label-sm font-semibold">
            <span class="material-symbols-outlined text-sm text-primary">verified</span>
            Vérifié ZS-PAS • ${formatDate(facility.verified_at)}
          </span>
        </div>
      </div>
      <div class="mt-space-md grid grid-cols-1 sm:grid-cols-2 gap-space-sm bg-surface-container-low p-space-sm rounded-lg font-body-sm text-body-sm">
        <div>
          <span class="font-label-sm text-label-sm uppercase font-bold text-on-surface-variant block mb-1">Plateau Technique & Services</span>
          <ul class="text-on-surface space-y-0.5 text-xs">
            ${facility.services.slice(0, 4).map(s => `<li>• ${s.name}</li>`).join('')}
            ${facility.services.length > 4 ? `<li>• +${facility.services.length - 4} autres services</li>` : ''}
          </ul>
        </div>
        <div class="flex flex-col justify-between">
          <div>
            <span class="font-label-sm text-label-sm uppercase font-bold text-on-surface-variant block mb-1">Permanence Téléphonique</span>
            <a href="tel:${facility.phone}" class="font-headline-sm text-headline-sm text-primary font-bold tracking-tight call-btn">${facility.phone}</a>
            <span class="block text-xs text-on-surface-variant">Ligne directe</span>
          </div>
          ${facility.emergency ? `
            <div class="mt-2 text-xs text-on-surface-variant flex items-center gap-1">
              <span class="material-symbols-outlined text-secondary text-sm">check_circle</span>
              Médecin de garde présent sur site
            </div>
          ` : ''}
        </div>
      </div>
      <div class="mt-space-md flex flex-wrap items-center justify-between gap-space-sm pt-2">
        <div class="flex items-center gap-2">
          <a href="tel:${facility.phone}" class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold shadow-sm hover:bg-primary-container transition-all call-btn">
            <span class="material-symbols-outlined text-base">call</span>
            Appel direct
          </a>
          <button class="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container-high transition-all direction-btn" data-lat="${facility.latitude}" data-lng="${facility.longitude}">
            <span class="material-symbols-outlined text-base text-primary">directions</span>
            Itinéraire
          </button>
        </div>
        <span class="font-label-sm text-label-sm text-on-surface-variant">Code Structure FASS : ${facility.fass_code}</span>
      </div>
    </article>
  `;
}

// Format Commune Name
function formatCommune(commune) {
  const names = {
    'porto-novo': 'Porto-Novo',
    'aguegues': 'Aguégués',
    'seme-podji': 'Sèmè-Podji'
  };
  return names[commune] || commune;
}

// Format Date
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Get Facility by ID
export async function getFacilityById(id) {
  const supabase = getSupabase();
  if (!supabase) {
    return facilities.find(f => f.id === id) || null;
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.healthFacilities)
      .select(`
        *,
        facility_services (
          service:services (id, name, icon, category)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error getting facility:', err);
    return null;
  }
}

// Search Facilities (public API)
export async function searchFacilities(query, filters = {}) {
  const supabase = getSupabase();
  if (!supabase) {
    return facilities.filter(f => {
      const text = `${f.name} ${f.address} ${f.commune}`.toLowerCase();
      return text.includes(query.toLowerCase());
    });
  }

  try {
    let queryBuilder = supabase
      .from(TABLES.healthFacilities)
      .select(`
        *,
        facility_services (
          service:services (id, name, icon, category)
        )
      `)
      .eq('is_active', true);

    if (query) {
      queryBuilder = queryBuilder.ilike('name', `%${query}%`);
    }

    if (filters.commune) {
      queryBuilder = queryBuilder.eq('commune', filters.commune);
    }

    if (filters.type) {
      queryBuilder = queryBuilder.eq('type', filters.type);
    }

    const { data, error } = await queryBuilder.order('name');
    if (error) throw error;

    return (data || []).map(f => ({
      ...f,
      services: f.facility_services?.map(fs => fs.service) || []
    }));
  } catch (err) {
    console.error('Error searching facilities:', err);
    return [];
  }
}

// Export for use in other modules
export const CENTRES = {
  init: initCentresPage,
  loadFacilities,
  getFacilityById,
  searchFacilities,
  getFacilities: () => facilities,
  getFilteredFacilities: () => filteredFacilities,
  setFilters: (filters) => { currentFilters = { ...currentFilters, ...filters }; applyFilters(); }
};