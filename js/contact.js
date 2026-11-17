/**
 * Contact & Réclamations Module
 * Portail ZS-PAS
 */

import { getSupabase, TABLES, handleSupabaseError, formatResponse } from './supabase-config.js';
import { showToast, validateEmail, validatePhone, debounce } from './components.js';

// Contact Types
export const CONTACT_TYPES = [
  { value: 'information', label: 'Demande d\'information', icon: 'info' },
  { value: 'suggestion', label: 'Suggestion / Proposition', icon: 'lightbulb' },
  { value: 'reclamation', label: 'Réclamation / Insatisfaction', icon: 'report_problem' },
  { value: 'partenariat', label: 'Proposition de partenariat', icon: 'handshake' },
  { value: 'autre', label: 'Autre', icon: 'help' }
];

// Contact Subjects by Type
export const CONTACT_SUBJECTS = {
  information: [
    { value: 'horaires', label: 'Horaires d\'ouverture des centres' },
    { value: 'services', label: 'Services disponibles' },
    { value: 'documents', label: 'Documents et formulaires' },
    { value: 'autre', label: 'Autre information' }
  ],
  suggestion: [
    { value: 'amelioration', label: 'Amélioration des services' },
    { value: 'nouveau_service', label: 'Nouveau service à proposer' },
    { value: 'organisation', label: 'Organisation / Accueil' },
    { value: 'autre', label: 'Autre suggestion' }
  ],
  reclamation: [
    { value: 'accueil', label: 'Qualité de l\'accueil' },
    { value: 'delai', label: 'Délai de prise en charge' },
    { value: 'proprete', label: 'Propreté / Hygiène des locaux' },
    { value: 'personnel', label: 'Comportement du personnel' },
    { value: 'disponibilite', label: 'Disponibilité médicaments / Intrants' },
    { value: 'autre', label: 'Autre réclamation' }
  ],
  partenariat: [
    { value: 'technique', label: 'Partenariat technique' },
    { value: 'financier', label: 'Partenariat financier' },
    { value: 'formation', label: 'Formation / Renforcement capacités' },
    { value: 'recherche', label: 'Recherche / Études' },
    { value: 'autre', label: 'Autre partenariat' }
  ],
  autre: [
    { value: 'autre', label: 'Autre sujet' }
  ]
};

// DOM Elements
let elements = {};

// Initialize Contact Page
export async function initContactPage() {
  cacheElements();
  setupEventListeners();
  loadPageContent();
}

// Cache DOM Elements
function cacheElements() {
  elements = {
    form: document.getElementById('contact-form'),
    typeSelect: document.getElementById('contact-type'),
    subjectSelect: document.getElementById('contact-subject'),
    submitBtn: document.querySelector('#contact-form button[type="submit"]'),
    successMessage: document.getElementById('contact-success')
  };
}

// Load Page Content (FAQ, etc.)
async function loadPageContent() {
  // Could load FAQ from Supabase
  renderFAQ();
}

// Setup Event Listeners
function setupEventListeners() {
  // Type change -> update subjects
  if (elements.typeSelect) {
    elements.typeSelect.addEventListener('change', updateSubjectOptions);
  }

  // Form submission
  if (elements.form) {
    elements.form.addEventListener('submit', handleFormSubmit);
  }
}

// Update Subject Options based on Type
function updateSubjectOptions(e) {
  if (!elements.subjectSelect) return;

  const type = e.target.value;
  const subjects = CONTACT_SUBJECTS[type] || CONTACT_SUBJECTS.autre;

  elements.subjectSelect.innerHTML = `
    <option value="">Sélectionnez un sujet</option>
    ${subjects.map(s => `<option value="${s.value}">${s.label}</option>`).join('')}
  `;
  elements.subjectSelect.disabled = !type;
}

// Handle Form Submit
async function handleFormSubmit(e) {
  e.preventDefault();

  const formData = new FormData(elements.form);
  const data = Object.fromEntries(formData);

  // Validate
  const validation = validateContactData(data);
  if (!validation.valid) {
    showToast(validation.message, 'error');
    return;
  }

  // Show loading
  const originalText = elements.submitBtn.innerHTML;
  elements.submitBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">refresh</span> Envoi en cours...';
  elements.submitBtn.disabled = true;

  try {
    const result = await createContactRequest(data);

    if (result.success) {
      elements.form.reset();
      updateSubjectOptions({ target: { value: '' } });
      if (elements.successMessage) elements.successMessage.classList.remove('hidden');
      showToast('Votre message a été envoyé avec succès. Nous vous répondrons sous 48h.', 'success');
    } else {
      showToast(result.error || 'Erreur lors de l\'envoi', 'error');
    }
  } catch (err) {
    console.error('Error submitting contact:', err);
    showToast('Erreur technique. Veuillez réessayer.', 'error');
  } finally {
    elements.submitBtn.innerHTML = originalText;
    elements.submitBtn.disabled = false;
  }
}

// Validate Contact Data
function validateContactData(data) {
  const required = ['type', 'subject', 'nom', 'prenom', 'telephone', 'message', 'consentement'];
  for (const field of required) {
    if (!data[field] || !data[field].toString().trim()) {
      return { valid: false, message: `Le champ ${getFieldLabel(field)} est obligatoire` };
    }
  }

  if (data.email && !validateEmail(data.email)) {
    return { valid: false, message: 'Adresse email invalide' };
  }

  if (!validatePhone(data.telephone)) {
    return { valid: false, message: 'Numéro de téléphone invalide (format: 97 00 00 00)' };
  }

  if (data.message.length > 1000) {
    return { valid: false, message: 'Le message ne doit pas dépasser 1000 caractères' };
  }

  return { valid: true };
}

function getFieldLabel(field) {
  const labels = {
    type: 'Type de demande',
    subject: 'Sujet',
    nom: 'Nom',
    prenom: 'Prénom(s)',
    telephone: 'Téléphone',
    email: 'Email',
    message: 'Message',
    consentement: 'Consentement'
  };
  return labels[field] || field;
}

// Create Contact Request in Supabase
async function createContactRequest(data) {
  const supabase = getSupabase();

  if (!supabase) {
    // Demo mode
    return formatResponse({ reference: `CTC-${Date.now()}`, status: 'new' });
  }

  try {
    const { data: result, error } = await supabase
      .from(TABLES.contactRequests)
      .insert({
        type: data.type,
        subject: data.subject,
        nom: data.nom.toUpperCase(),
        prenom: data.prenom,
        telephone: data.telephone.replace(/\s/g, ''),
        email: data.email || null,
        commune: data.commune || null,
        message: data.message,
        consentement: true,
        status: 'nouveau'
      })
      .select()
      .single();

    if (error) throw error;
    return formatResponse(result);
  } catch (err) {
    return formatResponse(null, err);
  }
}

// Get Contact Requests (admin)
export async function getContactRequests(filters = {}, page = 1, pageSize = 20) {
  const supabase = getSupabase();
  if (!supabase) return { data: [], count: 0 };

  try {
    let query = supabase
      .from(TABLES.contactRequests)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.type) query = query.eq('type', filters.type);
    if (filters.commune) query = query.eq('commune', filters.commune);
    if (filters.search) query = query.ilike('nom', `%${filters.search}%`);

    query = query.range((page - 1) * pageSize, page * pageSize - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return { data: data || [], count: count || 0 };
  } catch (err) {
    console.error('Error getting contact requests:', err);
    return { data: [], count: 0 };
  }
}

// Update Contact Status (admin)
export async function updateContactStatus(id, status, response = null) {
  const supabase = getSupabase();
  if (!supabase) return formatResponse(null, new Error('Supabase non initialisé'));

  try {
    const updateData = { status, updated_at: new Date().toISOString() };
    if (response) updateData.admin_response = response;

    const { data, error } = await supabase
      .from(TABLES.contactRequests)
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

// Render FAQ
function renderFAQ() {
  const faqContainer = document.getElementById('faq-container');
  if (!faqContainer) return;

  const faqs = [
    {
      q: 'Quels sont les horaires d\'ouverture du Bureau de Zone ?',
      a: 'Le Bureau de Zone est ouvert du Lundi au Vendredi de 08h00 à 12h30 et de 14h00 à 17h30. Fermé les jours fériés.'
    },
    {
      q: 'Comment obtenir un certificat médical d\'aptitude ?',
      a: 'Vous devez prendre un rendez-vous administratif via le formulaire en ligne ou en appelant le 20 21 00 00. Présentez-vous avec votre pièce d\'identité et le cas échéant votre dossier médical.'
    },
    {
      q: 'Où trouver la liste des pharmacies de garde ?',
      a: 'La liste est publiée chaque vendredi sur le portail (rubrique Actualités), affichée dans tous les centres de santé, et disponible au 136 (Numéro Vert Santé).'
    },
    {
      q: 'Comment signaler un problème dans un centre de santé ?',
      a: 'Utilisez le formulaire de contact en sélectionnant "Réclamation". Votre signalement sera transmis au Chef de Centre concerné et au Bureau de Zone pour suivi.'
    },
    {
      q: 'Les soins sont-ils gratuits dans les centres publics ?',
      a: 'Oui, plusieurs programmes sont entièrement gratuits : césarienne, paludisme < 5 ans, vaccination PEV, planning familial, dépistage VIH, tuberculose, et consultation prénatale.'
    },
    {
      q: 'Comment déposer un dossier d\'agrément pour une structure privée ?',
      a: 'Téléchargez le formulaire dans la rubrique Documents, complétez-le et déposez-le au Bureau de Zone (Attakè) ou envoyez-le par email à contact@zs-pas.sante.gouv.bj.'
    }
  ];

  faqContainer.innerHTML = faqs.map((faq, index) => `
    <details class="accordion-item bg-surface-container-lowest rounded-xl border border-surface-container-high overflow-hidden" data-animate>
      <summary class="accordion-header w-full flex items-center justify-between p-space-md cursor-pointer list-none">
        <span class="font-label-lg text-label-lg font-semibold text-on-surface">${faq.q}</span>
        <span class="material-symbols-outlined text-on-surface-variant accordion-icon">expand_more</span>
      </summary>
      <div class="accordion-content px-space-md pb-space-md text-on-surface-variant font-body-md text-body-md leading-relaxed">${faq.a}</div>
    </details>
  `).join('');

  // Initialize accordion
  faqContainer.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion-item');
      const isOpen = item.hasAttribute('open');

      // Close all others
      faqContainer.querySelectorAll('.accordion-item').forEach(other => {
        if (other !== item) other.removeAttribute('open');
      });

      // Toggle current
      if (!isOpen) item.setAttribute('open', '');
      else item.removeAttribute('open');
    });
  });
}

// Export
export const CONTACT = {
  init: initContactPage,
  createContactRequest,
  getContactRequests,
  updateContactStatus,
  TYPES: CONTACT_TYPES,
  SUBJECTS: CONTACT_SUBJECTS
};