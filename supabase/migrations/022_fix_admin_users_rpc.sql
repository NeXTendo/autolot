-- Migration: Hardened Admin User Management RPC
-- Description: Fixes authorization, search path, and pagination for get_all_users function.

CREATE OR REPLACE FUNCTION public.get_all_users(
  p_role user_role DEFAULT NULL,
  p_search text DEFAULT NULL,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  -- Verify admin status using the robust helper
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  SELECT jsonb_agg(listing_row)
  INTO v_result
  FROM (
    SELECT 
      p.id,
      p.email,
      p.name,
      p.phone,
      p.role,
      p.created_at,
      p.listing_count,
      (
        SELECT jsonb_build_object('business_name', dp.business_name)
        FROM public.dealer_profiles dp
        WHERE dp.id = p.id
      ) as dealer_profile
    FROM public.profiles p
    WHERE (p_role IS NULL OR p.role = p_role)
      AND (
        p_search IS NULL 
        OR p.email ILIKE '%' || p_search || '%' 
        OR p.name ILIKE '%' || p_search || '%'
      )
    ORDER BY p.created_at DESC
    LIMIT p_limit
    OFFSET p_offset
  ) AS listing_row;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

COMMENT ON FUNCTION public.get_all_users IS 'Admin only: Get paginated list of users with robust auth and fixed pagination.';
