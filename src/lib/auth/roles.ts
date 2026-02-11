// Role-based authentication and authorization helpers

import { createClient } from '@/lib/supabase/client';
import type { UserRole, Profile, DealerProfile } from '@/lib/types/roles';

/**
 * Get the current user's profile including role information
 */
export async function getCurrentUserProfile(): Promise<Profile | null> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
}

/**
 * Get the current user's role
 */
export async function getUserRole(): Promise<UserRole | null> {
  const profile = await getCurrentUserProfile();
  return profile?.role || null;
}

/**
 * Check if user has a specific role
 */
export async function hasRole(role: UserRole | UserRole[]): Promise<boolean> {
  const userRole = await getUserRole();
  if (!userRole) return false;

  if (Array.isArray(role)) {
    return role.includes(userRole);
  }

  return userRole === role;
}

/**
 * Check if user has admin privileges
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole(['admin', 'moderator']);
}

/**
 * Check if user is a dealer
 */
export async function isDealer(): Promise<boolean> {
  return hasRole('dealer');
}

/**
 * Check if user is dealer staff
 */
export async function isDealerStaff(): Promise<boolean> {
  return hasRole('dealer_staff');
}

/**
 * Check if user is an inspector
 */
export async function isInspector(): Promise<boolean> {
  return hasRole('inspector');
}

/**
 * Check if user can create listings
 */
export async function canCreateListing(): Promise<boolean> {
  const supabase = createClient();
  
  const { data, error } = await supabase.rpc('can_create_listing');
  
  if (error) {
    console.error('Error checking listing permission:', error);
    return false;
  }

  return data === true;
}

/**
 * Get user's listing limit
 */
export async function getUserListingLimit(): Promise<number> {
  const supabase = createClient();
  
  const { data, error } = await supabase.rpc('get_user_listing_limit');
  
  if (error) {
    console.error('Error getting listing limit:', error);
    return 0;
  }

  return data || 0;
}

/**
 * Get user's current listing count
 */
export async function getUserListingCount(): Promise<number> {
  const supabase = createClient();
  
  const { data, error } = await supabase.rpc('get_user_listing_count');
  
  if (error) {
    console.error('Error getting listing count:', error);
    return 0;
  }

  return data || 0;
}

/**
 * Get parent dealer profile if user is dealer staff
 */
export async function getParentDealer(): Promise<DealerProfile | null> {
  const profile = await getCurrentUserProfile();
  
  if (!profile?.parent_dealer_id) return null;

  const supabase = createClient();
  
  const { data } = await supabase
    .from('dealer_profiles')
    .select('*')
    .eq('id', profile.parent_dealer_id)
    .single();

  return data;
}

/**
 * Check if user has dealer staff permission
 */
export async function hasDealerStaffPermission(
  permission: 'can_post_listings' | 'can_manage_leads' | 'can_edit_dealer_settings' | 'can_access_billing'
): Promise<boolean> {
  const profile = await getCurrentUserProfile();
  
  if (!profile || profile.role !== 'dealer_staff') return false;

  const supabase = createClient();
  
  const { data } = await supabase
    .from('dealer_staff')
    .select('can_post_listings, can_manage_leads, can_edit_dealer_settings, can_access_billing')
    .eq('staff_id', profile.id)
    .eq('is_active', true)
    .single();

  if (!data) return false;

  return data[permission] === true;
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(): Promise<Profile> {
  const profile = await getCurrentUserProfile();
  
  if (!profile) {
    throw new Error('Authentication required');
  }

  return profile;
}

/**
 * Require specific role - throws if user doesn't have role
 */
export async function requireRole(role: UserRole | UserRole[]): Promise<Profile> {
  const profile = await requireAuth();
  
  const roles = Array.isArray(role) ? role : [role];
  
  if (!roles.includes(profile.role)) {
    throw new Error(`Required role: ${roles.join(' or ')}`);
  }

  return profile;
}

/**
 * Require admin - throws if not admin
 */
export async function requireAdmin(): Promise<Profile> {
  return requireRole(['admin', 'moderator']);
}

/**
 * Require dealer - throws if not dealer
 */
export async function requireDealer(): Promise<Profile> {
  return requireRole('dealer');
}

/**
 * Get user role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    guest: 'Guest',
    registered: 'Private Seller',
    verified: 'Verified Seller',
    dealer: 'Dealer',
    dealer_staff: 'Dealer Staff',
    buyer: 'Buyer',
    inspector: 'Inspector',
    moderator: 'Moderator',
    admin: 'Administrator',
  };

  return roleNames[role] || role;
}

/**
 * Get role badge color
 */
export function getRoleBadgeColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    guest: 'bg-gray-500',
    registered: 'bg-blue-500',
    verified: 'bg-green-500',
    dealer: 'bg-purple-500',
    dealer_staff: 'bg-indigo-500',
    buyer: 'bg-cyan-500',
    inspector: 'bg-orange-500',
    moderator: 'bg-yellow-500',
    admin: 'bg-red-500',
  };

  return colors[role] || 'bg-gray-500';
}
