/**
 * Rendez-vous Administratif Module
 * Portail ZS-PAS - Demande de rendez-vous simple (traitement manuel)
 */

import { getSupabase, TABLES, APPOINTMENT_STATUS, handleSupabaseError, formatResponse, generateReference } from './supabase-config.js';
import { showToast, validateEmail, validatePhone, formatDate, debounce } from './components.js';

// Appointment Services/Departments
export const APPOINTMENT_SERVICES = [
  { value: 'coordination', label: 'Coordination de zone sanitaire (Médecin Coordonnateur)' },
  { value: 'epidemiologie', label: 'Surveillance épidémiologique et riposte' },
  { value: 'rh', label: 'Direction des Ressources Humaines & Recrutements' },
  { value: 'finances', label: 'Affaires Financières, Facturation & Marchés' },
  { value: 'communaute', label: 'Santé communautaire & Mobilisation sociale' }
];

export const APPOINTMENT_MOTIFS = [
  { value: 'depot', label: 'Dépôt de dossier officiel ou agrément' },
  { value: 'attestation', label: 'Attestation ou certificat administratif de stage / exercice' },
  { value: 'audience', label: 'Audience institutionnelle ou partenariat technique' },
  { value: 'signalement', label: 'Signalement logistique ou approvisionnement intrants' }
];

export const APPOINTMENT_MODES = [
  { value: 'presentiel', label: 'Présentiel', desc: 'Au siège du Bureau de Zone (Attakè, Porto-Novo)', icon: 'location_city' },
  { value: 'telephonique', label: 'Entretien téléphonique', desc: 'Rappel officiel par le responsable de service', icon: 'phone_forwarded' }
];

export const APPOINTMENT_CRENEAUX = [
  { value: 'matin', label: 'Matinée (08h00 – 11h00)' },
  { value: 'midi', label: 'Mi-journée (11h00 – 14h00)' },
  { value: 'apres-midi', label: 'Après-midi (14h00 – 17h00)' }
];

// DOM Elements
let elements = {};

// Initialize Rendez-vous Page
export async function initRendezVousPage() {
  cacheElements();
  setupEventListeners();
  setMinDate();
}

// Cache DOM Elements
function cacheElements() {
  elements = {
    form: document.getElementById('rdv-form'),
    confirmationCard: document.getElementById('confirmation-card'),
    genRef: document.getElementById('gen-ref'),
    dateInput: document.getElementById('date_rdv'),
    suiviInput: document.getElementById('suivi_ref'),
    statusResult: document.getElementById('status-result'),
    checkStatusBtn: document.querySelector('button[onclick="checkStatus()"]')
  };
}

// Set Minimum Date (tomorrow, business days only)
function setMinDate() {
  if (!elements.dateInput) return;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  // Skip weekends
  while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
    tomorrow.setDate(tomorrow.getDate() + 1);
  }

  elements.dateInput.min = tomorrow.toISOString().split('T')[0];
}

// Setup Event Listeners
function setupEventListeners() {
  // Form submission
  if (elements.form) {
    elements.form.addEventListener('submit', handleFormSubmit);
  }

  // Status check
  if (elements.suiviInput) {
    elements.suiviInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') checkStatus();
    });
  }

  // Date validation - skip weekends
  if (elements.dateInput) {
    elements.dateInput.addEventListener('change', validateBusinessDay);
  }
}

// Validate Business Day
function validateBusinessDay(e) {
  const date = new Date(e.target.value);
  const day = date.getDay();

  if (day === 0 || day === 6) {
    showToast('Les rendez-vous ne sont possibles que les jours ouvrables (Lundi-Vendredi)', 'warning');
    e.target.value = '';
  }
}

// Handle Form Submit
async function handleFormSubmit(e) {
  e.preventDefault();

  const formData = new FormData(elements.form);
  const data = Object.fromEntries(formData);

  // Validate
  const validation = validateAppointmentData(data);
  if (!validation.valid) {
    showToast(validation.message, 'error');
    return;
  }

  // Show loading
  const submitBtn = elements.form.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">refresh</span> Envoi en cours...';
  submitBtn.disabled = true;

  try {
    const result = await createAppointment(data);

    if (result.success) {
      // Show confirmation
      const ref = result.data.reference || generateReference('RDV');
      if (elements.genRef) elements.genRef.textContent = ref;
      if (elements.confirmationCard) elements.confirmationCard.classList.remove('hidden');
      if (elements.confirmationCard) elements.confirmationCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      elements.form.reset();

      showToast('Votre demande a été enregistrée avec succès', 'success');
    } else {
      showToast(result.error || 'Erreur lors de l\'enregistrement', 'error');
    }
  } catch (err) {
    console.error('Error submitting appointment:', err);
    showToast('Erreur technique. Veuillez réessayer.', 'error');
  } finally {
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}

// Validate Appointment Data
function validateAppointmentData(data) {
  // Required fields
  const required = ['nom', 'prenom', 'telephone', 'service', 'motif', 'mode', 'date_rdv', 'creneau', 'consentement'];
  for (const field of required) {
    if (!data[field] || !data[field].toString().trim()) {
      return { valid: false, message: `Le champ ${getFieldLabel(field)} est obligatoire` };
    }
  }

  // Validate email if provided
  if (data.email && !validateEmail(data.email)) {
    return { valid: false, message: 'Adresse email invalide' };
  }

  // Validate phone
  if (!validatePhone(data.telephone)) {
    return { valid: false, message: 'Numéro de téléphone invalide (format: 97 00 00 00)' };
  }

  // Validate date is business day
  const date = new Date(data.date_rdv);
  if (date.getDay() === 0 || date.getDay() === 6) {
    return { valid: false, message: 'La date doit être un jour ouvrable (Lundi-Vendredi)' };
  }

  // Validate complement length
  if (data.complement && data.complement.length > 300) {
    return { valid: false, message: 'Le message complémentaire ne doit pas dépasser 300 caractères' };
  }

  return { valid: true };
}

function getFieldLabel(field) {
  const labels = {
    nom: 'Nom',
    prenom: 'Prénom(s)',
    telephone: 'Téléphone',
    email: 'Email',
    service: 'Service ciblé',
    motif: 'Motif',
    mode: 'Format souhaité',
    date_rdv: 'Date souhaitée',
    creneau: 'Créneau',
    consentement: 'Consentement'
  };
  return labels[field] || field;
}

// Create Appointment in Supabase
async function createAppointment(data) {
  const supabase = getSupabase();

  if (!supabase) {
    // Demo mode - simulate success
    return formatResponse({
      reference: generateReference('RDV'),
      status: APPOINTMENT_STATUS.NEW,
      created_at: new Date().toISOString()
    });
  }

  try {
    const reference = generateReference('RDV');

    const { data: result, error } = await supabase
      .from(TABLES.appointments)
      .insert({
        reference,
        nom: data.nom.toUpperCase(),
        prenom: data.prenom,
        telephone: data.telephone.replace(/\s/g, ''),
        email: data.email || null,
        commune: data.commune || null,
        arrondissement: data.arrondissement || null,
        service: data.service,
        motif: data.motif,
        mode: data.mode,
        date_souhaitee: data.date_rdv,
        creneau: data.creneau,
        complement: data.complement || null,
        consentement: true,
        status: APPOINTMENT_STATUS.NEW
      })
      .select()
      .single();

    if (error) throw error;

    return formatResponse({ ...result, reference });
  } catch (err) {
    return formatResponse(null, err);
  }
}

// Check Appointment Status
export async function checkStatus() {
  if (!elements.suiviInput || !elements.statusResult) return;

  const ref = elements.suiviInput.value.trim().toUpperCase();
  elements.statusResult.classList.remove('hidden');

  if (!ref) {
    elements.statusResult.innerHTML = '<span class="text-error font-semibold">Veuillez renseigner un identifiant valide.</span>';
    return;
  }

  if (!ref.includes('RDV-PAS')) {
    elements.statusResult.innerHTML = `<span class="text-on-surface-variant">Aucun dossier trouvé pour le numéro <strong>${ref}</strong>. Veuillez vérifier votre référence ou contacter le 20 21 00 00.</span>`;
    return;
  }

  elements.statusResult.innerHTML = '<div class="flex items-center gap-2"><span class="material-symbols-outlined animate-spin">refresh</span> Recherche en cours...</div>';

  const supabase = getSupabase();

  if (!supabase) {
    // Demo mode
    setTimeout(() => {
      elements.statusResult.innerHTML = `
        <div class="space-y-1">
          <span class="inline-flex items-center gap-1 font-semibold text-secondary">
            <span class="material-symbols-outlined text-sm">hourglass_top</span> En cours d'instruction
          </span>
          <p class="text-xs text-on-surface-variant">Dossier reçu et validé administrativement. En attente de calage de l'agenda avec le Médecin Coordonnateur.</p>
        </div>
      `;
    }, 500);
    return;
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.appointments)
      .select('*')
      .eq('reference', ref)
      .single();

    if (error || !data) {
      elements.statusResult.innerHTML = `<span class="text-on-surface-variant">Aucun dossier trouvé pour le numéro <strong>${ref}</strong>. Veuillez vérifier votre référence ou contacter le 20 21 00 00.</span>`;
      return;
    }

    renderStatusResult(data);
  } catch (err) {
    console.error('Error checking status:', err);
    elements.statusResult.innerHTML = '<span class="text-error">Erreur lors de la recherche. Veuillez réessayer.</span>';
  }
}

// Render Status Result
function renderStatusResult(appointment) {
  const statusLabels = {
    [APPOINTMENT_STATUS.NEW]: { label: 'Nouvelle demande', color: 'error', icon: 'fiber_new' },
    [APPOINTMENT_STATUS.IN_PROGRESS]: { label: 'En cours d\'instruction', color: 'primary', icon: 'hourglass_top' },
    [APPOINTMENT_STATUS.CONFIRMED]: { label: 'Confirmé', color: 'secondary', icon: 'check_circle' },
    [APPOINTMENT_STATUS.RESCHEDULE]: { label: 'À reprogrammer', color: 'tertiary', icon: 'schedule' },
    [APPOINTMENT_STATUS.REFUSED]: { label: 'Refusé', color: 'error', icon: 'cancel' },
    [APPOINTMENT_STATUS.CANCELLED]: { label: 'Annulé', color: 'outline', icon: 'close' },
    [APPOINTMENT_STATUS.COMPLETED]: { label: 'Terminé', color: 'secondary', icon: 'task_alt' },
    [APPOINTMENT_STATUS.ARCHIVED]: { label: 'Archivé', color: 'outline', icon: 'archive' }
  };

  const status = statusLabels[appointment.status] || statusLabels[APPOINTMENT_STATUS.NEW];

  let html = `
    <div class="space-y-2">
      <div class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-${status.color}-container text-on-${status.color}-container">
        <span class="material-symbols-outlined text-xs">${status.icon}</span>
        ${status.label}
      </div>
      <p class="text-xs text-on-surface-variant">Référence: <strong>${appointment.reference}</strong></p>
      <p class="text-xs text-on-surface-variant">Service: ${getServiceLabel(appointment.service)}</p>
      <p class="text-xs text-on-surface-variant">Date souhaitée: ${formatDate(appointment.date_souhaitee)} (${getCreneauLabel(appointment.creneau)})</p>
  `;

  if (appointment.status === APPOINTMENT_STATUS.CONFIRMED && appointment.confirmed_date) {
    html += `<p class="text-xs text-secondary font-semibold">✓ Rendez-vous confirmé pour le ${formatDate(appointment.confirmed_date)} à ${appointment.confirmed_time}</p>`;
  } else if (appointment.status === APPOINTMENT_STATUS.IN_PROGRESS) {
    html += `<p class="text-xs text-on-surface-variant">Dossier reçu et validé administrativement. En attente de calage de l'agenda.</p>`;
  }

  html += '</div>';
  elements.statusResult.innerHTML = html;
}

function getServiceLabel(value) {
  const s = APPOINTMENT_SERVICES.find(x => x.value === value);
  return s ? s.label : value;
}

function getCreneauLabel(value) {
  const c = APPOINTMENT_CRENEAUX.find(x => x.value === value);
  return c ? c.label : value;
}

// Get Appointment by Reference (for admin)
export async function getAppointmentByReference(reference) {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from(TABLES.appointments)
      .select('*')
      .eq('reference', reference)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error getting appointment:', err);
    return null;
  }
}

// Get Appointments (for admin with filters)
export async function getAppointments(filters = {}, page = 1, pageSize = 20) {
  const supabase = getSupabase();
  if (!supabase) return { data: [], count: 0 };

  try {
    let query = supabase
      .from(TABLES.appointments)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.commune) query = query.eq('commune', filters.commune);
    if (filters.date_from) query = query.gte('date_souhaitee', filters.date_from);
    if (filters.date_to) query = query.lte('date_souhaitee', filters.date_to);
    if (filters.search) query = query.ilike('nom', `%${filters.search}%`);

    query = query.range((page - 1) * pageSize, page * pageSize - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return { data: data || [], count: count || 0 };
  } catch (err) {
    console.error('Error getting appointments:', err);
    return { data: [], count: 0 };
  }
}

// Update Appointment Status (admin)
export async function updateAppointmentStatus(id, status, notes = null) {
  const supabase = getSupabase();
  if (!supabase) return formatResponse(null, new Error('Supabase non initialisé'));

  try {
    const updateData = { status, updated_at: new Date().toISOString() };
    if (notes) updateData.admin_notes = notes;

    const { data, error } = await supabase
      .from(TABLES.appointments)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return formatResponse(data);
  } catch (err) {
    return formatResponse(null, err);
  }
}

// Export
export const RENDEZ_VOUS = {
  init: initRendezVousPage,
  checkStatus,
  createAppointment,
  getAppointmentByReference,
  getAppointments,
  updateAppointmentStatus,
  SERVICES: APPOINTMENT_SERVICES,
  MOTIFS: APPOINTMENT_MOTIFS,
  MODES: APPOINTMENT_MODES,
  CRENEAUX: APPOINTMENT_CRENEAUX,
  STATUSES: APPOINTMENT_STATUS
};