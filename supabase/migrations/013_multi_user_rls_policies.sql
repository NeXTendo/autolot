-- Migration: Multi-User Role System - RLS Policies
-- Description: Row Level Security policies for dealer, buyer, inspector, and premium upgrade tables

-- ============================================================================
-- DEALER PROFILES POLICIES
-- ============================================================================

-- Anyone can view dealer profiles
CREATE POLICY "dealer_profiles_select_all"
ON public.dealer_profiles
FOR SELECT
USING (true);

-- Dealers can update their own profile
CREATE POLICY "dealer_profiles_update_own"
ON public.dealer_profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can update any dealer profile (for verification)
CREATE POLICY "dealer_profiles_admin_update"
ON public.dealer_profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'moderator')
  )
);

-- Authenticated users can create dealer profile
CREATE POLICY "dealer_profiles_insert_own"
ON public.dealer_profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- ============================================================================
-- DEALER STAFF POLICIES
-- ============================================================================

-- Dealer can view their own staff
CREATE POLICY "dealer_staff_select_dealer"
ON public.dealer_staff
FOR SELECT
USING (
  dealer_id IN (
    SELECT id FROM public.dealer_profiles
    WHERE id = auth.uid()
  )
  OR staff_id = auth.uid()
);

-- Dealer can insert staff members
CREATE POLICY "dealer_staff_insert_dealer"
ON public.dealer_staff
FOR INSERT
WITH CHECK (
  dealer_id IN (
    SELECT id FROM public.dealer_profiles
    WHERE id = auth.uid()
  )
);

-- Dealer can update staff permissions
CREATE POLICY "dealer_staff_update_dealer"
ON public.dealer_staff
FOR UPDATE
USING (
  dealer_id IN (
    SELECT id FROM public.dealer_profiles
    WHERE id = auth.uid()
  )
)
WITH CHECK (
  dealer_id IN (
    SELECT id FROM public.dealer_profiles
    WHERE id = auth.uid()
  )
);

-- Dealer can remove staff members
CREATE POLICY "dealer_staff_delete_dealer"
ON public.dealer_staff
FOR DELETE
USING (
  dealer_id IN (
    SELECT id FROM public.dealer_profiles
    WHERE id = auth.uid()
  )
);

-- Admins have full access
CREATE POLICY "dealer_staff_admin_all"
ON public.dealer_staff
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'moderator')
  )
);

-- ============================================================================
-- BUYER PREFERENCES POLICIES
-- ============================================================================

-- Users can only view their own preferences
CREATE POLICY "buyer_preferences_select_own"
ON public.buyer_preferences
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "buyer_preferences_insert_own"
ON public.buyer_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "buyer_preferences_update_own"
ON public.buyer_preferences
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own preferences
CREATE POLICY "buyer_preferences_delete_own"
ON public.buyer_preferences
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- SAVED LISTINGS POLICIES
-- ============================================================================

-- Users can only view their own saved listings
CREATE POLICY "saved_listings_select_own"
ON public.saved_listings
FOR SELECT
USING (auth.uid() = user_id);

-- Users can save listings
CREATE POLICY "saved_listings_insert_own"
ON public.saved_listings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their notes on saved listings
CREATE POLICY "saved_listings_update_own"
ON public.saved_listings
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can remove saved listings
CREATE POLICY "saved_listings_delete_own"
ON public.saved_listings
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- INSPECTOR PROFILES POLICIES
-- ============================================================================

-- Anyone can view verified inspector profiles
CREATE POLICY "inspector_profiles_select_verified"
ON public.inspector_profiles
FOR SELECT
USING (is_verified = true OR auth.uid() = id);

-- Inspectors can update their own profile
CREATE POLICY "inspector_profiles_update_own"
ON public.inspector_profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can verify inspectors and update profiles
CREATE POLICY "inspector_profiles_admin_all"
ON public.inspector_profiles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'moderator')
  )
);

-- Authenticated users can create inspector profile
CREATE POLICY "inspector_profiles_insert_own"
ON public.inspector_profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- ============================================================================
-- VEHICLE INSPECTIONS POLICIES
-- ============================================================================

-- Anyone can view public inspections
CREATE POLICY "vehicle_inspections_select_public"
ON public.vehicle_inspections
FOR SELECT
USING (
  is_public = true 
  OR inspector_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.vehicles
    WHERE vehicles.id = vehicle_inspections.vehicle_id
    AND vehicles.seller_id = auth.uid()
  )
);

-- Verified inspectors can create inspections
CREATE POLICY "vehicle_inspections_insert_inspector"
ON public.vehicle_inspections
FOR INSERT
WITH CHECK (
  inspector_id IN (
    SELECT id FROM public.inspector_profiles
    WHERE id = auth.uid()
    AND is_verified = true
    AND is_active = true
  )
);

-- Inspectors can update their own inspections
CREATE POLICY "vehicle_inspections_update_own"
ON public.vehicle_inspections
FOR UPDATE
USING (auth.uid() = inspector_id)
WITH CHECK (auth.uid() = inspector_id);

-- Admins have full access
CREATE POLICY "vehicle_inspections_admin_all"
ON public.vehicle_inspections
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'moderator')
  )
);

-- ============================================================================
-- PREMIUM UPGRADES POLICIES
-- ============================================================================

-- Users can view their own upgrades
CREATE POLICY "premium_upgrades_select_own"
ON public.premium_upgrades
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create upgrades (will be validated by payment system)
CREATE POLICY "premium_upgrades_insert_own"
ON public.premium_upgrades
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own upgrades (for auto-renew settings)
CREATE POLICY "premium_upgrades_update_own"
ON public.premium_upgrades
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins have full access to manage upgrades
CREATE POLICY "premium_upgrades_admin_all"
ON public.premium_upgrades
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'moderator')
  )
);

-- ============================================================================
-- ENHANCED VEHICLE POLICIES FOR DEALER STAFF
-- ============================================================================

-- Drop existing insert policy to replace it
DROP POLICY IF EXISTS "vehicles_insert_own" ON public.vehicles;

-- Allow dealers and dealer staff to create listings
CREATE POLICY "vehicles_insert_own_or_dealer_staff"
ON public.vehicles
FOR INSERT
WITH CHECK (
  auth.uid() = seller_id
  OR EXISTS (
    -- Dealer staff can post on behalf of dealer
    SELECT 1 FROM public.dealer_staff
    WHERE dealer_staff.staff_id = auth.uid()
    AND dealer_staff.dealer_id = seller_id
    AND dealer_staff.can_post_listings = true
    AND dealer_staff.is_active = true
  )
);

-- Drop existing update policy to replace it
DROP POLICY IF EXISTS "vehicles_update_own" ON public.vehicles;

-- Allow dealers and dealer staff to update listings
CREATE POLICY "vehicles_update_own_or_dealer_staff"
ON public.vehicles
FOR UPDATE
USING (
  auth.uid() = seller_id
  OR EXISTS (
    SELECT 1 FROM public.dealer_staff
    WHERE dealer_staff.staff_id = auth.uid()
    AND dealer_staff.dealer_id = seller_id
    AND dealer_staff.can_post_listings = true
    AND dealer_staff.is_active = true
  )
)
WITH CHECK (
  auth.uid() = seller_id
  OR EXISTS (
    SELECT 1 FROM public.dealer_staff
    WHERE dealer_staff.staff_id = auth.uid()
    AND dealer_staff.dealer_id = seller_id
    AND dealer_staff.can_post_listings = true
    AND dealer_staff.is_active = true
  )
);

-- ============================================================================
-- ENHANCED MESSAGE POLICIES FOR DEALER STAFF
-- ============================================================================

-- Drop existing message update policy to replace it
DROP POLICY IF EXISTS "messages_update_seller" ON public.messages;

-- Allow dealers and dealer staff to update messages
CREATE POLICY "messages_update_seller_or_staff"
ON public.messages
FOR UPDATE
USING (
  auth.uid() = seller_id
  OR EXISTS (
    SELECT 1 FROM public.dealer_staff
    WHERE dealer_staff.staff_id = auth.uid()
    AND dealer_staff.dealer_id = seller_id
    AND dealer_staff.can_manage_leads = true
    AND dealer_staff.is_active = true
  )
)
WITH CHECK (
  auth.uid() = seller_id
  OR EXISTS (
    SELECT 1 FROM public.dealer_staff
    WHERE dealer_staff.staff_id = auth.uid()
    AND dealer_staff.dealer_id = seller_id
    AND dealer_staff.can_manage_leads = true
    AND dealer_staff.is_active = true
  )
);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "dealer_profiles_select_all" ON public.dealer_profiles IS 'Anyone can view dealer profiles';
COMMENT ON POLICY "dealer_staff_select_dealer" ON public.dealer_staff IS 'Dealers can view their staff, staff can view their own record';
COMMENT ON POLICY "buyer_preferences_select_own" ON public.buyer_preferences IS 'Users can only access their own preferences';
COMMENT ON POLICY "saved_listings_select_own" ON public.saved_listings IS 'Users can only access their own saved listings';
COMMENT ON POLICY "inspector_profiles_select_verified" ON public.inspector_profiles IS 'Only verified inspectors are publicly visible';
COMMENT ON POLICY "vehicle_inspections_select_public" ON public.vehicle_inspections IS 'Public inspections visible to all, private to inspector and vehicle owner';
COMMENT ON POLICY "vehicles_insert_own_or_dealer_staff" ON public.vehicles IS 'Dealers and authorized staff can create listings';
