/**
 * Supabase Configuration
 * Portail ZS-PAS
 *
 * IMPORTANT: Replace with your actual Supabase credentials
 * Never commit real credentials to version control!
 */

// Supabase Client Configuration
export const SUPABASE_CONFIG = {
  // REPLACE THESE WITH YOUR ACTUAL VALUES
  url: 'https://your-project-ref.supabase.co',
  anonKey: 'your-anon-key-here',

  // Optional: Custom headers
  headers: {
    'X-Client-Info': 'zs-pas-portal/1.0.0'
  }
};

// Database Table Names
export const TABLES = {
  profiles: 'profiles',
  healthFacilities: 'health_facilities',
  services: 'services',
  facilityServices: 'facility_services',
  announcements: 'announcements',
  documents: 'documents',
  appointments: 'appointments',
  contactRequests: 'contact_requests',
  auditLogs: 'audit_logs',
  siteSettings: 'site_settings'
};

// User Roles
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  MAIN_ADMIN: 'main_admin',
  VALIDATOR: 'validator',
  READER: 'reader'
};

// Appointment Statuses
export const APPOINTMENT_STATUS = {
  NEW: 'nouvelle_demande',
  IN_PROGRESS: 'en_cours_traitement',
  CONFIRMED: 'confirmee',
  RESCHEDULE: 'a_reprogrammer',
  REFUSED: 'refusee',
  CANCELLED: 'annulee',
  COMPLETED: 'terminee',
  ARCHIVED: 'archivee'
};

// Content Statuses
export const CONTENT_STATUS = {
  DRAFT: 'brouillon',
  SUBMITTED: 'soumis_pour_validation',
  APPROVED: 'valide',
  REJECTED: 'refuse',
  PUBLISHED: 'publie',
  UPDATED: 'mis_a_jour',
  ARCHIVED: 'archive'
};

// Facility Types
export const FACILITY_TYPES = {
  CSA: 'csa',
  CSC: 'csc',
  MATERNITY: 'maternite',
  CONFESSIONAL: 'confessionnel',
  HOSPITAL: 'hopital',
  LACUSTRIAN: 'lacustre'
};

// Communes
export const COMMUNES = {
  PORTO_NOVO: 'porto-novo',
  AGUEGUES: 'aguegues',
  SEME_PODJI: 'seme-podji'
};

// Storage Buckets
export const STORAGE_BUCKETS = {
  DOCUMENTS: 'public-documents',
  IMAGES: 'facility-images',
  AVATARS: 'user-avatars'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK: 'Erreur de connexion. Veuillez vérifier votre connexion internet.',
  UNAUTHORIZED: 'Session expirée. Veuillez vous reconnecter.',
  FORBIDDEN: 'Vous n\'avez pas les droits nécessaires pour cette action.',
  NOT_FOUND: 'Ressource introuvable.',
  VALIDATION: 'Données invalides. Veuillez vérifier le formulaire.',
  SERVER: 'Erreur serveur. Veuillez réessayer plus tard.',
  RLS: 'Violation de la politique de sécurité. Accès refusé.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  APPOINTMENT_CREATED: 'Votre demande de rendez-vous a été enregistrée avec succès.',
  APPOINTMENT_UPDATED: 'Le rendez-vous a été mis à jour.',
  CONTACT_SENT: 'Votre message a été envoyé. Nous vous répondrons sous 48h.',
  CONTENT_PUBLISHED: 'Le contenu a été publié.',
  CONTENT_SAVED: 'Les modifications ont été enregistrées.',
  SETTINGS_SAVED: 'Les paramètres ont été mis à jour.'
};

// Validation Rules
export const VALIDATION = {
  NAME_MIN: 2,
  NAME_MAX: 100,
  MESSAGE_MAX: 1000,
  COMPLEMENT_MAX: 300,
  PHONE_PATTERN: /^[0-9]{8,10}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50
};

// Cache Keys
export const CACHE_KEYS = {
  FACILITIES: 'zs_pas_facilities',
  SERVICES: 'zs_pas_services',
  ANNOUNCEMENTS: 'zs_pas_announcements',
  DOCUMENTS: 'zs_pas_documents',
  SETTINGS: 'zs_pas_settings'
};

// Feature Flags
export const FEATURES = {
  MAP_ENABLED: true,
  APPOINTMENTS_ENABLED: true,
  CONTACT_FORM_ENABLED: true,
  DOCUMENTS_ENABLED: true,
  ANNOUNCEMENTS_ENABLED: true,
  AUDIT_LOG_ENABLED: true
};

// API Endpoints (for Edge Functions)
export const EDGE_FUNCTIONS = {
  SEND_SMS: 'send-sms',
  SEND_EMAIL: 'send-email',
  GENERATE_PDF: 'generate-pdf',
  EXPORT_DATA: 'export-data'
};

// Initialize Supabase Client (to be called after loading supabase.js from CDN)
export function createSupabaseClient() {
  if (typeof window !== 'undefined' && window.supabase) {
    return window.supabase.createClient(
      SUPABASE_CONFIG.url,
      SUPABASE_CONFIG.anonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        },
        global: {
          headers: SUPABASE_CONFIG.headers
        }
      }
    );
  }
  console.warn('Supabase not loaded. Make sure to include supabase.js from CDN.');
  return null;
}

// Export singleton instance (initialized on first use)
let supabaseInstance = null;

export function getSupabase() {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient();
  }
  return supabaseInstance;
}

// Helper: Handle Supabase Errors
export function handleSupabaseError(error, context = '') {
  console.error(`[Supabase Error]${context ? ` ${context}` : ''}:`, error);

  // Map common error codes to user-friendly messages
  if (error?.code === 'PGRST301') return ERROR_MESSAGES.RLS;
  if (error?.code === '42501') return ERROR_MESSAGES.FORBIDDEN;
  if (error?.message?.includes('JWT')) return ERROR_MESSAGES.UNAUTHORIZED;
  if (error?.message?.includes('network') || error?.message?.includes('fetch')) return ERROR_MESSAGES.NETWORK;

  return error?.message || ERROR_MESSAGES.SERVER;
}

// Helper: Format Supabase Response
export function formatResponse(data, error) {
  if (error) {
    return { success: false, error: handleSupabaseError(error), data: null };
  }
  return { success: true, data, error: null };
}

// Helper: Log Audit Event
export async function logAuditEvent(action, details = {}) {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from(TABLES.auditLogs).insert({
      user_id: user?.id || null,
      action,
      details,
      ip_address: null, // Will be set by Edge Function or RLS
      user_agent: navigator.userAgent
    });
  } catch (err) {
    console.warn('Failed to log audit event:', err);
  }
}