-- Migration: Admin User Management Policies
-- Description: Allow admins to view and update all user profiles

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Admins can view all profiles
CREATE POLICY "profiles_select_admin"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'moderator')
  )
);

-- Admins can update any profile
CREATE POLICY "profiles_update_admin"
ON public.profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'moderator')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'moderator')
  )
);

-- ============================================================================
-- RPC FUNCTIONS
-- ============================================================================

-- Function to get all users with filtering
CREATE OR REPLACE FUNCTION public.get_all_users(
  p_role user_role DEFAULT NULL,
  p_search text DEFAULT NULL,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_result jsonb;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify admin/moderator status
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = v_user_id
    AND role IN ('admin', 'moderator')
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT jsonb_agg(
    jsonb_build_object(
      'id', p.id,
      'email', p.email,
      'name', p.name,
      'phone', p.phone,
      'role', p.role,
      'created_at', p.created_at,
      'listing_count', p.listing_count,
      'dealer_profile', (
        SELECT jsonb_build_object('business_name', dp.business_name)
        FROM public.dealer_profiles dp
        WHERE dp.id = p.id
      )
    )
    ORDER BY p.created_at DESC
  )
  INTO v_result
  FROM public.profiles p
  WHERE (p_role IS NULL OR p.role = p_role)
    AND (
      p_search IS NULL 
      OR p.email ILIKE '%' || p_search || '%' 
      OR p.name ILIKE '%' || p_search || '%'
    )
  LIMIT p_limit
  OFFSET p_offset;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

COMMENT ON FUNCTION public.get_all_users IS 'Admin only: Get paginated list of users with optional filtering';
