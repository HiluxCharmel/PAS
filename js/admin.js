/**
 * Admin Dashboard Module
 * Portail ZS-PAS - Espace Administration
 */

import { getSupabase, TABLES, ROLES, CONTENT_STATUS, APPOINTMENT_STATUS, handleSupabaseError, formatResponse, logAuditEvent } from './supabase-config.js';
import { AUTH, initAuth, requireAuth, requireRole, requirePermission, hasPermission } from './auth.js';
import { showToast, initScrollAnimations, formatDate, generateReference, debounce } from './components.js';
import { CENTRES } from './centres.js';
import { SERVICES } from './services.js';
import { ACTUALITES } from './actualites.js';
import { DOCUMENTS } from './documents.js';
import { RENDEZ_VOUS } from './rendez-vous.js';
import { CONTACT } from './contact.js';

// State
let currentTab = 'dashboard';
let dashboardData = {
  pendingAppointments: 0,
  pendingContent: 0,
  facilitiesToAudit: 0,
  unreadContacts: 0,
  totalVisits: 0
};

// DOM Elements
let elements = {};

// Initialize Admin
export async function initAdmin() {
  // Check auth
  const authenticated = await requireAuth('/admin/connexion.html');
  if (!authenticated) return;

  await initAuth();
  cacheElements();
  setupEventListeners();
  await loadDashboardData();
  renderDashboard();
  initScrollAnimations();
}

// Initialize Specific Admin Page
export async function initAdminPage(page) {
  const authenticated = await requireAuth('/admin/connexion.html');
  if (!authenticated) return;

  await initAuth();

  switch (page) {
    case 'centres':
      await initAdminCentres();
      break;
    case 'services':
      await initAdminServices();
      break;
    case 'actualites':
      await initAdminActualites();
      break;
    case 'documents':
      await initAdminDocuments();
      break;
    case 'rendez-vous':
      await initAdminRendezVous();
      break;
    case 'contacts':
      await initAdminContacts();
      break;
    default:
      await initAdmin();
  }
}

// Cache DOM Elements
function cacheElements() {
  elements = {
    sidebar: document.querySelector('.admin-sidebar'),
    sidebarToggle: document.querySelector('.mobile-sidebar-toggle'),
    sidebarOverlay: document.querySelector('.sidebar-overlay'),
    navItems: document.querySelectorAll('.admin-nav-item'),
    tabContents: document.querySelectorAll('.admin-tab-content'),
    // Dashboard
    statsCards: document.querySelectorAll('.kpi-card'),
    // Tables
    announcementsTable: document.getElementById('announcements-table'),
    appointmentsTable: document.getElementById('appointments-table'),
    contactsTable: document.getElementById('contacts-table'),
    facilitiesTable: document.getElementById('facilities-table'),
    // Forms
    facilityForm: document.getElementById('facility-form'),
    serviceForm: document.getElementById('service-form'),
    announcementForm: document.getElementById('announcement-form'),
    documentForm: document.getElementById('document-form')
  };
}

// Setup Event Listeners
function setupEventListeners() {
  // Sidebar navigation
  elements.navItems?.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = item.dataset.path?.replace('portail-agent-admin', 'dashboard') || 'dashboard';
      switchTab(tab);
    });
  });

  // Mobile sidebar toggle
  if (elements.sidebarToggle && elements.sidebar) {
    elements.sidebarToggle.addEventListener('click', () => {
      elements.sidebar.classList.toggle('open');
      elements.sidebarOverlay?.classList.toggle('open');
    });
  }

  if (elements.sidebarOverlay) {
    elements.sidebarOverlay.addEventListener('click', () => {
      elements.sidebar?.classList.remove('open');
      elements.sidebarOverlay.classList.remove('open');
    });
  }

  // Table action buttons (delegated)
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;

    switch (action) {
      case 'approve-announcement':
        await approveAnnouncement(id);
        break;
      case 'reject-announcement':
        await rejectAnnouncement(id);
        break;
      case 'confirm-appointment':
        await confirmAppointment(id);
        break;
      case 'reschedule-appointment':
        await rescheduleAppointment(id);
        break;
      case 'archive-appointment':
        await archiveAppointment(id);
        break;
      case 'respond-contact':
        await respondContact(id);
        break;
      case 'edit-facility':
        await editFacility(id);
        break;
      case 'delete-facility':
        await deleteFacility(id);
        break;
    }
  });

  // Forms
  if (elements.facilityForm) {
    elements.facilityForm.addEventListener('submit', handleFacilityFormSubmit);
  }
  if (elements.serviceForm) {
    elements.serviceForm.addEventListener('submit', handleServiceFormSubmit);
  }
  if (elements.announcementForm) {
    elements.announcementForm.addEventListener('submit', handleAnnouncementFormSubmit);
  }
  if (elements.documentForm) {
    elements.documentForm.addEventListener('submit', handleDocumentFormSubmit);
  }
}

// Switch Tab
function switchTab(tab) {
  currentTab = tab;

  // Update nav
  elements.navItems?.forEach(item => {
    const itemTab = item.dataset.path?.replace('portail-agent-admin', 'dashboard') || 'dashboard';
    item.classList.toggle('active', itemTab === tab);
  });

  // Update content
  elements.tabContents?.forEach(content => {
    content.classList.toggle('hidden', content.id !== `tab-${tab}`);
  });

  // Load tab data
  loadTabData(tab);
}

// Load Tab Data
async function loadTabData(tab) {
  switch (tab) {
    case 'dashboard':
      await loadDashboardData();
      renderDashboard();
      break;
    case 'gestion-rendez-vous':
      await loadAdminAppointments();
      break;
    case 'registre-reclamations':
      await loadAdminContacts();
      break;
    case 'transmission-epidemiologique':
      // Load epidemiological data
      break;
  }
}

// Load Dashboard Data
async function loadDashboardData() {
  const supabase = getSupabase();
  if (!supabase) {
    dashboardData = {
      pendingAppointments: 14,
      pendingContent: 3,
      facilitiesToAudit: 5,
      unreadContacts: 8,
      totalVisits: 18420
    };
    return;
  }

  try {
    const [appointments, announcements, facilities, contacts] = await Promise.all([
      supabase.from(TABLES.appointments).select('id', { count: 'exact' }).in('status', [APPOINTMENT_STATUS.NEW, APPOINTMENT_STATUS.IN_PROGRESS]),
      supabase.from(TABLES.announcements).select('id', { count: 'exact' }).eq('status', CONTENT_STATUS.SUBMITTED),
      supabase.from(TABLES.healthFacilities).select('id', { count: 'exact' }).eq('needs_audit', true),
      supabase.from(TABLES.contactRequests).select('id', { count: 'exact' }).eq('status', 'nouveau')
    ]);

    dashboardData = {
      pendingAppointments: appointments.count || 0,
      pendingContent: announcements.count || 0,
      facilitiesToAudit: facilities.count || 0,
      unreadContacts: contacts.count || 0,
      totalVisits: 18420 // From analytics
    };
  } catch (err) {
    console.error('Error loading dashboard data:', err);
  }
}

// Render Dashboard
function renderDashboard() {
  // Update KPI cards
  const statElements = {
    'pendingAppointments': dashboardData.pendingAppointments,
    'pendingContent': dashboardData.pendingContent,
    'facilitiesToAudit': dashboardData.facilitiesToAudit,
    'unreadContacts': dashboardData.unreadContacts,
    'totalVisits': dashboardData.totalVisits.toLocaleString()
  };

  Object.entries(statElements).forEach(([key, value]) => {
    const el = document.getElementById(`stat-${key}`);
    if (el) el.textContent = value;
  });
}

// Load Admin Appointments
async function loadAdminAppointments() {
  const result = await RENDEZ_VOUS.getAppointments({}, 1, 50);
  renderAppointmentsTable(result.data);
}

// Render Appointments Table
function renderAppointmentsTable(appointments) {
  if (!elements.appointmentsTable) return;

  const tbody = elements.appointmentsTable.querySelector('tbody');
  if (!tbody) return;

  tbody.innerHTML = appointments.map(appt => `
    <tr class="hover:bg-surface-container-low/50 transition-colors">
      <td class="py-4 px-space-md">
        <span class="font-mono font-bold text-primary font-label-md text-label-md">${appt.reference}</span>
      </td>
      <td class="py-4 px-space-md">
        <div class="flex flex-col">
          <span class="font-label-md text-label-md font-bold text-on-surface">${appt.nom} ${appt.prenom}</span>
          <span class="font-label-sm text-label-sm text-on-surface-variant">Tel: ${formatPhone(appt.telephone)}</span>
        </div>
      </td>
      <td class="py-4 px-space-md">
        <span class="font-label-md text-label-md text-on-surface font-semibold">${formatCommune(appt.commune)}</span>
        ${appt.arrondissement ? `<span class="block text-xs text-on-surface-variant">${appt.arrondissement}</span>` : ''}
      </td>
      <td class="py-4 px-space-md">
        <span class="font-body-sm text-body-sm font-medium text-on-surface">${getMotifLabel(appt.motif)}</span>
        ${appt.complement ? `<span class="block text-xs text-on-surface-variant">${appt.complement}</span>` : ''}
      </td>
      <td class="py-4 px-space-md">
        <span class="font-label-md text-label-md font-bold text-on-surface">${formatDate(appt.date_souhaitee)}</span>
        <span class="block text-xs text-on-surface-variant">${getCreneauLabel(appt.creneau)}</span>
      </td>
      <td class="py-4 px-space-md">
        ${renderStatusBadge(appt.status)}
      </td>
      <td class="py-4 px-space-md text-right">
        <div class="inline-flex items-center gap-1.5">
          ${appt.status === APPOINTMENT_STATUS.NEW || appt.status === APPOINTMENT_STATUS.IN_PROGRESS ? `
            <button class="px-3 py-1.5 rounded-lg bg-secondary text-on-secondary font-label-sm text-label-sm font-bold hover:bg-on-secondary-container transition-colors" data-action="confirm-appointment" data-id="${appt.id}">Confirmer RDV</button>
            <button class="px-2.5 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm font-semibold hover:bg-surface-container-high transition-colors" data-action="reschedule-appointment" data-id="${appt.id}">Reprogrammer</button>
          ` : ''}
          <button class="p-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-error transition-colors" data-action="archive-appointment" data-id="${appt.id}" title="Archiver">
            <span class="material-symbols-outlined text-base">archive</span>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Load Admin Contacts
async function loadAdminContacts() {
  const result = await CONTACT.getContactRequests({}, 1, 50);
  renderContactsTable(result.data);
}

// Render Contacts Table
function renderContactsTable(contacts) {
  if (!elements.contactsTable) return;

  const tbody = elements.contactsTable.querySelector('tbody');
  if (!tbody) return;

  tbody.innerHTML = contacts.map(contact => `
    <tr class="hover:bg-surface-container-low/50 transition-colors">
      <td class="py-4 px-space-md">${contact.created_at ? formatDate(contact.created_at, { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</td>
      <td class="py-4 px-space-md">
        <span class="font-label-md text-label-md font-bold text-on-surface">${contact.nom} ${contact.prenom}</span>
        <span class="block text-xs text-on-surface-variant">${formatPhone(contact.telephone)}</span>
      </td>
      <td class="py-4 px-space-md">${getContactTypeLabel(contact.type)}</td>
      <td class="py-4 px-space-md">${getContactSubjectLabel(contact.type, contact.subject)}</td>
      <td class="py-4 px-space-md">${renderContactStatusBadge(contact.status)}</td>
      <td class="py-4 px-space-md text-right">
        <button class="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-bold hover:bg-primary-container transition-colors" data-action="respond-contact" data-id="${contact.id}">
          ${contact.status === 'nouveau' ? 'Traiter' : 'Voir réponse'}
        </button>
      </td>
    </tr>
  `).join('');
}

// Load Admin Facilities
async function initAdminCentres() {
  cacheElements();
  setupEventListeners();
  const facilities = await CENTRES.getFacilities();
  renderFacilitiesTable(facilities);
}

// Render Facilities Table
function renderFacilitiesTable(facilities) {
  if (!elements.facilitiesTable) return;

  const tbody = elements.facilitiesTable.querySelector('tbody');
  if (!tbody) return;

  tbody.innerHTML = facilities.map(f => `
    <tr class="hover:bg-surface-container-low/50 transition-colors">
      <td class="py-4 px-space-md">${f.name}</td>
      <td class="py-4 px-space-md">${getFacilityTypeLabel(f.type)}</td>
      <td class="py-4 px-space-md">${formatCommune(f.commune)}</td>
      <td class="py-4 px-space-md">${f.phone}</td>
      <td class="py-4 px-space-md">${renderStatusBadge(f.is_active ? 'active' : 'inactive')}</td>
      <td class="py-4 px-space-md text-right">
        <button class="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-bold hover:bg-primary-container transition-colors" data-action="edit-facility" data-id="${f.id}">Modifier</button>
        <button class="p-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-error transition-colors" data-action="delete-facility" data-id="${f.id}" title="Supprimer">
          <span class="material-symbols-outlined text-base">delete</span>
        </button>
      </td>
    </tr>
  `).join('');
}

// Form Handlers
async function handleFacilityFormSubmit(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);

  const supabase = getSupabase();
  if (!supabase) return showToast('Mode démo - non sauvegardé', 'info');

  try {
    const { error } = await supabase
      .from(TABLES.healthFacilities)
      .upsert(data);

    if (error) throw error;
    showToast('Centre sauvegardé', 'success');
    initAdminCentres();
  } catch (err) {
    showToast('Erreur: ' + handleSupabaseError(err), 'error');
  }
}

async function handleServiceFormSubmit(e) {
  e.preventDefault();
  showToast('Service sauvegardé (mode démo)', 'info');
}

async function handleAnnouncementFormSubmit(e) {
  e.preventDefault();
  showToast('Annonce sauvegardée (mode démo)', 'info');
}

async function handleDocumentFormSubmit(e) {
  e.preventDefault();
  showToast('Document sauvegardé (mode démo)', 'info');
}

// Action Handlers
async function approveAnnouncement(id) {
  const supabase = getSupabase();
  if (!supabase) return showToast('Approuvé (mode démo)', 'success');

  try {
    const { error } = await supabase
      .from(TABLES.announcements)
      .update({ status: CONTENT_STATUS.PUBLISHED, published_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    await logAuditEvent('announcement_approved', { id });
    showToast('Annonce approuvée et publiée', 'success');
    loadAdminActualites();
  } catch (err) {
    showToast('Erreur: ' + handleSupabaseError(err), 'error');
  }
}

async function rejectAnnouncement(id) {
  const reason = prompt('Motif du refus (optionnel):');
  const supabase = getSupabase();
  if (!supabase) return showToast('Refusé (mode démo)', 'info');

  try {
    const { error } = await supabase
      .from(TABLES.announcements)
      .update({ status: CONTENT_STATUS.REJECTED, rejection_reason: reason })
      .eq('id', id);

    if (error) throw error;
    await logAuditEvent('announcement_rejected', { id, reason });
    showToast('Annonce refusée', 'success');
    loadAdminActualites();
  } catch (err) {
    showToast('Erreur: ' + handleSupabaseError(err), 'error');
  }
}

async function confirmAppointment(id) {
  const date = prompt('Date confirmée (YYYY-MM-DD):');
  const time = prompt('Heure confirmée (HH:MM):');

  if (!date || !time) return;

  const result = await RENDEZ_VOUS.updateAppointmentStatus(id, APPOINTMENT_STATUS.CONFIRMED, { confirmed_date: date, confirmed_time: time });

  if (result.success) {
    await logAuditEvent('appointment_confirmed', { id, date, time });
    showToast('Rendez-vous confirmé', 'success');
    loadAdminAppointments();
  } else {
    showToast('Erreur: ' + result.error, 'error');
  }
}

async function rescheduleAppointment(id) {
  const date = prompt('Nouvelle date (YYYY-MM-DD):');
  const time = prompt('Nouvelle heure (HH:MM):');

  if (!date || !time) return;

  const result = await RENDEZ_VOUS.updateAppointmentStatus(id, APPOINTMENT_STATUS.RESCHEDULE, { new_date: date, new_time: time });

  if (result.success) {
    await logAuditEvent('appointment_rescheduled', { id, date, time });
    showToast('Rendez-vous reprogrammé', 'success');
    loadAdminAppointments();
  } else {
    showToast('Erreur: ' + result.error, 'error');
  }
}

async function archiveAppointment(id) {
  if (!confirm('Archiver ce rendez-vous ?')) return;

  const result = await RENDEZ_VOUS.updateAppointmentStatus(id, APPOINTMENT_STATUS.ARCHIVED);

  if (result.success) {
    await logAuditEvent('appointment_archived', { id });
    showToast('Rendez-vous archivé', 'success');
    loadAdminAppointments();
  } else {
    showToast('Erreur: ' + result.error, 'error');
  }
}

async function respondContact(id) {
  const response = prompt('Votre réponse:');
  if (!response) return;

  const result = await CONTACT.updateContactStatus(id, 'traite', response);

  if (result.success) {
    await logAuditEvent('contact_responded', { id });
    showToast('Réponse envoyée', 'success');
    loadAdminContacts();
  } else {
    showToast('Erreur: ' + result.error, 'error');
  }
}

async function editFacility(id) {
  showToast('Édition du centre (à implémenter)', 'info');
}

async function deleteFacility(id) {
  if (!confirm('Supprimer ce centre ? Cette action est irréversible.')) return;

  const supabase = getSupabase();
  if (!supabase) return showToast('Supprimé (mode démo)', 'success');

  try {
    const { error } = await supabase
      .from(TABLES.healthFacilities)
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
    await logAuditEvent('facility_deleted', { id });
    showToast('Centre désactivé', 'success');
    initAdminCentres();
  } catch (err) {
    showToast('Erreur: ' + handleSupabaseError(err), 'error');
  }
}

// Load Admin Actualités
async function initAdminActualites() {
  cacheElements();
  setupEventListeners();
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    const { data, error } = await supabase
      .from(TABLES.announcements)
      .select(`
        *,
        author:profiles!author_id (full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    renderAnnouncementsAdminTable(data || []);
  } catch (err) {
    console.error('Error loading announcements:', err);
  }
}

function renderAnnouncementsAdminTable(announcements) {
  if (!elements.announcementsTable) return;

  const tbody = elements.announcementsTable.querySelector('tbody');
  if (!tbody) return;

  tbody.innerHTML = announcements.map(a => `
    <tr class="hover:bg-surface-container-low/50 transition-colors">
      <td class="py-4 px-space-md">
        <div class="flex flex-col">
          <span class="font-label-lg text-label-lg font-bold text-on-surface">${a.title}</span>
          <span class="font-label-sm text-label-sm text-on-surface-variant mt-0.5">${a.excerpt?.substring(0, 100)}...</span>
        </div>
      </td>
      <td class="py-4 px-space-md">
        <div class="flex flex-col">
          <span class="font-label-md text-label-md font-semibold text-on-surface">${a.author?.full_name || 'Anonyme'}</span>
          <span class="font-label-sm text-label-sm text-on-surface-variant">${getContentStatusLabel(a.status)}</span>
        </div>
      </td>
      <td class="py-4 px-space-md">${formatDate(a.created_at)}</td>
      <td class="py-4 px-space-md">${renderContentStatusBadge(a.status)}</td>
      <td class="py-4 px-space-md text-right">
        <div class="inline-flex items-center gap-space-xs">
          <button class="p-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors" title="Aperçu">
            <span class="material-symbols-outlined text-lg">visibility</span>
          </button>
          ${a.status === CONTENT_STATUS.SUBMITTED ? `
            <button class="px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface font-label-sm text-label-sm font-bold hover:bg-surface-variant transition-colors" data-action="reject-announcement" data-id="${a.id}">
              <span class="material-symbols-outlined text-base">edit_note</span>
              Modifications
            </button>
            <button class="px-3 py-1.5 rounded-lg bg-secondary text-on-secondary font-label-sm text-label-sm font-bold hover:bg-on-secondary-container transition-colors" data-action="approve-announcement" data-id="${a.id}">
              <span class="material-symbols-outlined text-base">publish</span>
              Approuver & Publier
            </button>
          ` : a.status === CONTENT_STATUS.DRAFT ? `
            <button class="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary font-label-sm text-label-sm font-bold hover:bg-primary transition-colors">
              <span class="material-symbols-outlined text-base">forward</span>
              Soumettre au comité
            </button>
          ` : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

// Helper Functions
function formatPhone(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 8) return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
  return phone;
}

function formatCommune(commune) {
  const names = {
    'porto-novo': 'Porto-Novo',
    'aguegues': 'Aguégués',
    'seme-podji': 'Sèmè-Podji'
  };
  return names[commune] || commune;
}

function getMotifLabel(value) {
  const m = RENDEZ_VOUS.MOTIFS?.find(x => x.value === value);
  return m ? m.label : value;
}

function getCreneauLabel(value) {
  const c = RENDEZ_VOUS.CRENEAUX?.find(x => x.value === value);
  return c ? c.label : value;
}

function getFacilityTypeLabel(type) {
  const labels = {
    'csa': 'CSA',
    'csc': 'CSC',
    'maternite': 'Maternité',
    'hopital': 'Hôpital Zone',
    'lacustre': 'Dispensaire Lacustre',
    'confessionnel': 'Centre Confessionnel'
  };
  return labels[type] || type;
}

function getContactTypeLabel(type) {
  const t = CONTACT.TYPES?.find(x => x.value === type);
  return t ? t.label : type;
}

function getContactSubjectLabel(type, subject) {
  const subjects = CONTACT.SUBJECTS[type] || [];
  const s = subjects.find(x => x.value === subject);
  return s ? s.label : subject;
}

function getContentStatusLabel(status) {
  const labels = {
    'brouillon': 'Brouillon',
    'soumis_pour_validation': 'Soumis pour validation',
    'valide': 'Validé',
    'refuse': 'Refusé',
    'publie': 'Publié',
    'archive': 'Archivé'
  };
  return labels[status] || status;
}

function renderStatusBadge(status) {
  const statusMap = {
    'nouvelle_demande': { label: 'Nouvelle demande', color: 'error', icon: 'fiber_new' },
    'en_cours_traitement': { label: 'En cours d\'instruction', color: 'primary', icon: 'hourglass_top' },
    'confirmee': { label: 'Confirmé', color: 'secondary', icon: 'check_circle' },
    'a_reprogrammer': { label: 'À reprogrammer', color: 'tertiary', icon: 'schedule' },
    'refusee': { label: 'Refusé', color: 'error', icon: 'cancel' },
    'annulee': { label: 'Annulé', color: 'outline', icon: 'close' },
    'terminee': { label: 'Terminé', color: 'secondary', icon: 'task_alt' },
    'archivee': { label: 'Archivé', color: 'outline', icon: 'archive' },
    'active': { label: 'Actif', color: 'secondary', icon: 'check_circle' },
    'inactive': { label: 'Inactif', color: 'error', icon: 'cancel' }
  };
  const s = statusMap[status] || statusMap['nouvelle_demande'];
  return `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-${s.color}-container text-on-${s.color}-container"><span class="material-symbols-outlined text-xs">${s.icon}</span> ${s.label}</span>`;
}

function renderContactStatusBadge(status) {
  const statusMap = {
    'nouveau': { label: 'Nouveau', color: 'error', icon: 'mark_email_unread' },
    'en_cours': { label: 'En cours', color: 'primary', icon: 'hourglass_top' },
    'traite': { label: 'Traité', color: 'secondary', icon: 'check_circle' },
    'archive': { label: 'Archivé', color: 'outline', icon: 'archive' }
  };
  const s = statusMap[status] || statusMap['nouveau'];
  return `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-${s.color}-container text-on-${s.color}-container"><span class="material-symbols-outlined text-xs">${s.icon}</span> ${s.label}</span>`;
}

function renderContentStatusBadge(status) {
  const statusMap = {
    'brouillon': { label: 'Brouillon', color: 'outline', icon: 'edit' },
    'soumis_pour_validation': { label: 'Soumis pour validation', color: 'tertiary', icon: 'hourglass_top' },
    'valide': { label: 'Validé', color: 'secondary', icon: 'check_circle' },
    'refuse': { label: 'Refusé', color: 'error', icon: 'cancel' },
    'publie': { label: 'Publié', color: 'primary', icon: 'publish' },
    'archive': { label: 'Archivé', color: 'outline', icon: 'archive' }
  };
  const s = statusMap[status] || statusMap['brouillon'];
  return `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-${s.color}-container text-on-${s.color}-container"><span class="material-symbols-outlined text-xs">${s.icon}</span> ${s.label}</span>`;
}

// Export
export const ADMIN = {
  init: initAdmin,
  initPage: initAdminPage,
  loadDashboardData,
  renderDashboard,
  switchTab
};