
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetch tenant (organization) information by ID
 * @param id Tenant/organization ID
 * @returns Tenant information including premium status
 */
export async function getTenant(id: string) {
  const { data, error } = await supabase
    .from('organizations')
    .select('id, name, has_premium, settings')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching tenant:', error);
    return null;
  }
  
  return data;
}

/**
 * Update organization's premium status
 * @param id Organization ID
 * @param hasPremium New premium status value
 * @returns Success status
 */
export async function updatePremiumStatus(id: string, hasPremium: boolean) {
  const { error } = await supabase
    .from('organizations')
    .update({ has_premium: hasPremium })
    .eq('id', id);

  return !error;
}

/**
 * Update organization's name
 * @param id Organization ID
 * @param name New organization name
 * @returns Success status
 */
export async function updateOrgName(id: string, name: string) {
  const { error } = await supabase
    .from('organizations')
    .update({ name })
    .eq('id', id);

  return !error;
}

/**
 * Update user profile information
 * @param userId User ID
 * @param profileData User profile data
 * @returns Success status
 */
export async function updateUserProfile(userId: string, profileData: { name: string, email: string }) {
  const { error } = await supabase
    .from('profiles')
    .update({ name: profileData.name })
    .eq('id', userId);
  
  return !error;
}

/**
 * Fetch team members for a specific organization
 * @param organizationId Organization ID
 * @returns Array of team member profiles
 */
export async function getTeamMembers(organizationId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, name, role')
    .eq('organization_id', organizationId);
    
  if (error) {
    console.error('Error fetching team members:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Update team member's role
 * @param userId User ID
 * @param newRole New role value
 * @returns Success status
 */
export async function updateUserRole(userId: string, newRole: string) {
  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId);
  
  return !error;
}

/**
 * Remove user from organization
 * @param userId User ID
 * @returns Success status
 */
export async function removeUserFromOrg(userId: string) {
  const { error } = await supabase
    .from('profiles')
    .update({ organization_id: null })
    .eq('id', userId);
  
  return !error;
}

/**
 * Create an invitation to join an organization
 * @param organizationId Organization ID
 * @param email Invitee email
 * @param role Assigned role
 * @param invitedBy User ID who sent the invitation
 * @returns Success status and invitation data
 */
export async function createInvitation(organizationId: string, email: string, role: string, invitedBy: string) {
  const { data, error } = await supabase
    .from('invitations')
    .insert({
      organization_id: organizationId,
      email,
      role,
      invited_by: invitedBy
    })
    .select();
  
  return { success: !error, data };
}

/**
 * Check if an email has a pending invitation
 * @param email Email to check
 * @returns Invitation data if found
 */
export async function checkInvitation(email: string) {
  const { data, error } = await supabase
    .from('invitations')
    .select('id, organization_id, role, email')
    .eq('email', email)
    .eq('status', 'Pending')
    .maybeSingle();
    
  if (error) {
    console.error('Error checking invitation:', error);
    return null;
  }
  
  return data;
}

/**
 * Accept an invitation
 * @param invitationId Invitation ID
 * @param userId User ID accepting the invitation
 * @returns Success status
 */
export async function acceptInvitation(invitationId: string, userId: string) {
  const { data: invitation, error: fetchError } = await supabase
    .from('invitations')
    .select('organization_id, role')
    .eq('id', invitationId)
    .single();
  
  if (fetchError || !invitation) {
    console.error('Error fetching invitation:', fetchError);
    return false;
  }
  
  // Update profile with organization and role
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      organization_id: invitation.organization_id,
      role: invitation.role
    })
    .eq('id', userId);
  
  if (updateError) {
    console.error('Error updating profile:', updateError);
    return false;
  }
  
  // Update invitation status
  const { error: statusError } = await supabase
    .from('invitations')
    .update({ status: 'Accepted' })
    .eq('id', invitationId);
  
  return !statusError;
}
