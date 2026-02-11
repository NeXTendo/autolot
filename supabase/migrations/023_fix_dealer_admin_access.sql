-- Migration: Fix Admin Access to Dealer Profiles
-- Description: Adds explicit SELECT policy for admins to view all dealer profiles

-- Add admin SELECT policy for dealer_profiles
CREATE POLICY "dealer_profiles_admin_select"
ON public.dealer_profiles
FOR SELECT
USING (public.is_admin());

COMMENT ON POLICY "dealer_profiles_admin_select" ON public.dealer_profiles IS 'Admins can view all dealer profiles for verification';
