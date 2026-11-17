/**
 * Authentication Module
 * Portail ZS-PAS
 */

import { getSupabase, ROLES, TABLES, handleSupabaseError, logAuditEvent } from './supabase-config.js';
import { showToast } from './components.js';

// Auth State
let currentUser = null;
let currentProfile = null;
let authListeners = [];

// Initialize Auth
export async function initAuth() {
  const supabase = getSupabase();
  if (!supabase) return null;

  // Get initial session
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    await loadUserProfile(session.user.id);
  }

  // Listen for auth changes
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      await loadUserProfile(session.user.id);
      await logAuditEvent('user_login', { provider: session.user.app_metadata?.provider || 'email' });
      showToast('Connexion réussie', 'success');
    } else if (event === 'SIGNED_OUT') {
      currentUser = null;
      currentProfile = null;
      notifyAuthListeners(null);
      await logAuditEvent('user_logout');
    } else if (event === 'TOKEN_REFRESHED' && session?.user) {
      await loadUserProfile(session.user.id);
    }
  });

  return currentUser;
}

// Load User Profile
async function loadUserProfile(userId) {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    const { data, error } = await supabase
      .from(TABLES.profiles)
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading profile:', error);
      return;
    }

    currentUser = { id: userId };
    currentProfile = data;
    notifyAuthListeners(currentProfile);
  } catch (err) {
    console.error('Error in loadUserProfile:', err);
  }
}

// Notify Listeners
function notifyAuthListeners(profile) {
  authListeners.forEach(listener => listener(profile));
}

// Subscribe to Auth Changes
export function onAuthChange(callback) {
  authListeners.push(callback);
  // Return unsubscribe function
  return () => {
    authListeners = authListeners.filter(l => l !== callback);
  };
}

// Get Current User
export function getCurrentUser() {
  return currentUser;
}

// Get Current Profile
export function getCurrentProfile() {
  return currentProfile;
}

// Check if User is Authenticated
export function isAuthenticated() {
  return !!currentUser;
}

// Check User Role
export function hasRole(...roles) {
  if (!currentProfile) return false;
  return roles.includes(currentProfile.role);
}

// Check if User is Admin
export function isAdmin() {
  return hasRole(ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN);
}

// Check if User is Validator
export function isValidator() {
  return hasRole(ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN, ROLES.VALIDATOR);
}

// Check if User is Reader
export function isReader() {
  return hasRole(ROLES.SUPER_ADMIN, ROLES.MAIN_ADMIN, ROLES.VALIDATOR, ROLES.READER);
}

// Get User Permissions
export function getPermissions() {
  if (!currentProfile) return [];

  const rolePermissions = {
    [ROLES.SUPER_ADMIN]: ['all'],
    [ROLES.MAIN_ADMIN]: [
      'manage_facilities',
      'manage_services',
      'manage_announcements',
      'manage_documents',
      'view_appointments',
      'manage_appointments',
      'view_contacts',
      'manage_contacts',
      'view_audit_logs',
      'manage_users'
    ],
    [ROLES.VALIDATOR]: [
      'view_facilities',
      'view_services',
      'validate_announcements',
      'validate_documents',
      'view_appointments',
      'view_contacts',
      'view_audit_logs'
    ],
    [ROLES.READER]: [
      'view_facilities',
      'view_services',
      'view_announcements',
      'view_documents',
      'view_appointments',
      'view_contacts'
    ]
  };

  return rolePermissions[currentProfile.role] || [];
}

// Check Permission
export function hasPermission(permission) {
  const permissions = getPermissions();
  return permissions.includes('all') || permissions.includes(permission);
}

// Sign In with Email
export async function signInWithEmail(email, password) {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: 'Supabase non initialisé' };

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return { success: false, error: handleSupabaseError(error, 'signInWithEmail') };
  }

  return { success: true, data };
}

// Sign Out
export async function signOut() {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: 'Supabase non initialisé' };

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: handleSupabaseError(error, 'signOut') };
  }

  return { success: true };
}

// Reset Password
export async function resetPassword(email) {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: 'Supabase non initialisé' };

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/admin/reset-password.html`
  });

  if (error) {
    return { success: false, error: handleSupabaseError(error, 'resetPassword') };
  }

  return { success: true };
}

// Update Password
export async function updatePassword(newPassword) {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: 'Supabase non initialisé' };

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    return { success: false, error: handleSupabaseError(error, 'updatePassword') };
  }

  return { success: true };
}

// Create User (Admin only)
export async function createUser(email, password, role, metadata = {}) {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: 'Supabase non initialisé' };

  if (!hasPermission('manage_users')) {
    return { success: false, error: ERROR_MESSAGES.FORBIDDEN };
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role, ...metadata }
  });

  if (error) {
    return { success: false, error: handleSupabaseError(error, 'createUser') };
  }

  // Create profile
  if (data.user) {
    const { error: profileError } = await supabase
      .from(TABLES.profiles)
      .insert({
        id: data.user.id,
        email,
        role,
        full_name: metadata.full_name || '',
        created_by: currentUser?.id
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
    }
  }

  await logAuditEvent('user_created', { email, role });
  return { success: true, data };
}

// Update User Role (Super Admin only)
export async function updateUserRole(userId, newRole) {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: 'Supabase non initialisé' };

  if (!hasRole(ROLES.SUPER_ADMIN)) {
    return { success: false, error: ERROR_MESSAGES.FORBIDDEN };
  }

  const { error } = await supabase
    .from(TABLES.profiles)
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    return { success: false, error: handleSupabaseError(error, 'updateUserRole') };
  }

  await logAuditEvent('user_role_updated', { user_id: userId, new_role: newRole });
  return { success: true };
}

// Get All Users (Admin only)
export async function getAllUsers() {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: 'Supabase non initialisé', data: [] };

  if (!hasPermission('manage_users')) {
    return { success: false, error: ERROR_MESSAGES.FORBIDDEN, data: [] };
  }

  const { data, error } = await supabase
    .from(TABLES.profiles)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, error: handleSupabaseError(error, 'getAllUsers'), data: [] };
  }

  return { success: true, data: data || [] };
}

// Require Auth (for protected pages)
export async function requireAuth(redirectTo = '/admin/connexion.html') {
  if (!isAuthenticated()) {
    const supabase = getSupabase();
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = redirectTo;
        return false;
      }
    } else {
      window.location.href = redirectTo;
      return false;
    }
  }
  return true;
}

// Require Role
export function requireRole(...roles) {
  if (!hasRole(...roles)) {
    showToast('Accès refusé. Droits insuffisants.', 'error');
    window.location.href = '/admin/tableau-de-bord.html';
    return false;
  }
  return true;
}

// Require Permission
export function requirePermission(permission) {
  if (!hasPermission(permission)) {
    showToast('Accès refusé. Permission manquante.', 'error');
    window.location.href = '/admin/tableau-de-bord.html';
    return false;
  }
  return true;
}

// Export for use in other modules
export const AUTH = {
  init: initAuth,
  getCurrentUser,
  getCurrentProfile,
  isAuthenticated,
  hasRole,
  isAdmin,
  isValidator,
  isReader,
  getPermissions,
  hasPermission,
  signInWithEmail,
  signOut,
  resetPassword,
  updatePassword,
  createUser,
  updateUserRole,
  getAllUsers,
  requireAuth,
  requireRole,
  requirePermission,
  onAuthChange
};