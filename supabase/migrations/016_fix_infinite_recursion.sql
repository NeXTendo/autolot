-- Migration: Fix Infinite Recursion in RLS Policies
-- Description: Create a security definer function to check admin status and avoid RLS loops

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user is admin/moderator (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public -- prevent search_path injection
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'moderator')
  );
END;
$$;

-- Function to check if user is dealer (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_dealer()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.dealer_profiles
    WHERE id = auth.uid()
  );
END;
$$;

-- ============================================================================
-- FIX PROFILES POLICIES
-- ============================================================================

-- Drop the recursive policies from 015
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;

-- Re-create `profiles_update_admin` using the safe function
-- (We don't need `profiles_select_admin` because `profiles_select_policy` is public)
CREATE POLICY "profiles_update_admin"
ON public.profiles
FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================================================
-- FIX VEHICLE POLICIES
-- ============================================================================

-- Drop potentially recursive admin policy
DROP POLICY IF EXISTS "vehicles_admin_all" ON public.vehicles;

-- Re-create using safe function
CREATE POLICY "vehicles_admin_all"
ON public.vehicles
FOR ALL
USING (is_admin());

-- ============================================================================
-- FIX INSPECTOR POLICIES
-- ============================================================================

-- Drop potentially recursive admin policy
DROP POLICY IF EXISTS "inspector_profiles_admin_all" ON public.inspector_profiles;
DROP POLICY IF EXISTS "vehicle_inspections_admin_all" ON public.vehicle_inspections;

-- Re-create using safe function
CREATE POLICY "inspector_profiles_admin_all"
ON public.inspector_profiles
FOR ALL
USING (is_admin());

CREATE POLICY "vehicle_inspections_admin_all"
ON public.vehicle_inspections
FOR ALL
USING (is_admin());

-- ============================================================================
-- FIX DEALER POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "dealer_profiles_admin_update" ON public.dealer_profiles;
DROP POLICY IF EXISTS "dealer_staff_admin_all" ON public.dealer_staff;

CREATE POLICY "dealer_profiles_admin_update"
ON public.dealer_profiles
FOR UPDATE
USING (is_admin());

CREATE POLICY "dealer_staff_admin_all"
ON public.dealer_staff
FOR ALL
USING (is_admin());

-- ============================================================================
-- FIX PREMIUM UPGRADES POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "premium_upgrades_admin_all" ON public.premium_upgrades;

CREATE POLICY "premium_upgrades_admin_all"
ON public.premium_upgrades
FOR ALL
USING (is_admin());

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION public.is_admin IS 'Checks if current user is admin/moderator safely bypassing RLS';
