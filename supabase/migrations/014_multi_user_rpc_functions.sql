-- Migration: Multi-User Role System - RPC Functions
-- Description: Type-safe RPC functions for role management, dealer operations, buyer features, and inspector workflows

-- ============================================================================
-- ROLE MANAGEMENT FUNCTIONS
-- ============================================================================

-- Get user's listing limit based on role
CREATE OR REPLACE FUNCTION public.get_user_listing_limit(p_user_id uuid DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_role user_role;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());
  
  IF v_user_id IS NULL THEN
    RETURN 0;
  END IF;

  SELECT role INTO v_role
  FROM public.profiles
  WHERE id = v_user_id;

  -- Dealers and dealer staff have unlimited listings
  IF v_role IN ('dealer', 'dealer_staff', 'admin', 'moderator') THEN
    RETURN 999999;
  -- Verified users get 5 listings
  ELSIF v_role = 'verified' THEN
    RETURN 5;
  -- Regular registered users get 5 listings
  ELSIF v_role = 'registered' THEN
    RETURN 5;
  -- Buyers, inspectors, guests get 0
  ELSE
    RETURN 0;
  END IF;
END;
$$;

-- Get user's current listing count
CREATE OR REPLACE FUNCTION public.get_user_listing_count(p_user_id uuid DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_count integer;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());
  
  IF v_user_id IS NULL THEN
    RETURN 0;
  END IF;

  SELECT listing_count INTO v_count
  FROM public.profiles
  WHERE id = v_user_id;

  RETURN COALESCE(v_count, 0);
END;
$$;

-- Check if user can create a listing
CREATE OR REPLACE FUNCTION public.can_create_listing()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_current_count integer;
  v_limit integer;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;

  v_current_count := get_user_listing_count(v_user_id);
  v_limit := get_user_listing_limit(v_user_id);

  RETURN v_current_count < v_limit;
END;
$$;

-- ============================================================================
-- DEALER MANAGEMENT FUNCTIONS
-- ============================================================================

-- Create dealer profile
CREATE OR REPLACE FUNCTION public.create_dealer_profile(business_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_dealer_profile jsonb;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Update user role to dealer
  UPDATE public.profiles
  SET role = 'dealer'
  WHERE id = v_user_id;

  -- Create dealer profile
  INSERT INTO public.dealer_profiles (
    id,
    business_name,
    business_description,
    business_address,
    business_phone,
    business_email,
    website_url
  )
  VALUES (
    v_user_id,
    business_data->>'business_name',
    business_data->>'business_description',
    business_data->>'business_address',
    business_data->>'business_phone',
    business_data->>'business_email',
    business_data->>'website_url'
  )
  RETURNING to_jsonb(dealer_profiles.*) INTO v_dealer_profile;

  RETURN v_dealer_profile;
END;
$$;

-- Update dealer profile
CREATE OR REPLACE FUNCTION public.update_dealer_profile(business_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_dealer_profile jsonb;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if user is a dealer
  IF NOT EXISTS (
    SELECT 1 FROM public.dealer_profiles
    WHERE id = v_user_id
  ) THEN
    RAISE EXCEPTION 'User is not a dealer';
  END IF;

  -- Update dealer profile
  UPDATE public.dealer_profiles
  SET
    business_name = COALESCE(business_data->>'business_name', business_name),
    business_description = COALESCE(business_data->>'business_description', business_description),
    business_address = COALESCE(business_data->>'business_address', business_address),
    business_phone = COALESCE(business_data->>'business_phone', business_phone),
    business_email = COALESCE(business_data->>'business_email', business_email),
    website_url = COALESCE(business_data->>'website_url', website_url),
    business_logo = COALESCE(business_data->>'business_logo', business_logo),
    updated_at = NOW()
  WHERE id = v_user_id
  RETURNING to_jsonb(dealer_profiles.*) INTO v_dealer_profile;

  RETURN v_dealer_profile;
END;
$$;

-- Get dealer profile with stats
CREATE OR REPLACE FUNCTION public.get_dealer_profile(p_dealer_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'profile', to_jsonb(dp.*),
    'stats', jsonb_build_object(
      'total_listings', (
        SELECT COUNT(*) FROM public.vehicles
        WHERE seller_id = p_dealer_id AND status = 'active'
      ),
      'total_sold', (
        SELECT COUNT(*) FROM public.vehicles
        WHERE seller_id = p_dealer_id AND status = 'sold'
      ),
      'staff_count', (
        SELECT COUNT(*) FROM public.dealer_staff
        WHERE dealer_id = p_dealer_id AND is_active = true
      )
    )
  )
  INTO v_result
  FROM public.dealer_profiles dp
  WHERE dp.id = p_dealer_id;

  RETURN v_result;
END;
$$;

-- Get all dealer listings
CREATE OR REPLACE FUNCTION public.get_dealer_listings(p_dealer_id uuid, p_status listing_status DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_agg(to_jsonb(v.*) ORDER BY v.created_at DESC)
  INTO v_result
  FROM public.vehicles v
  WHERE v.seller_id = p_dealer_id
    AND (p_status IS NULL OR v.status = p_status);

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

-- ============================================================================
-- DEALER STAFF FUNCTIONS
-- ============================================================================

-- Add staff member to dealer
CREATE OR REPLACE FUNCTION public.add_dealer_staff(
  p_staff_email text,
  p_permissions jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_dealer_id uuid;
  v_staff_id uuid;
  v_staff_record jsonb;
BEGIN
  v_dealer_id := auth.uid();
  
  IF v_dealer_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify caller is a dealer
  IF NOT EXISTS (
    SELECT 1 FROM public.dealer_profiles
    WHERE id = v_dealer_id
  ) THEN
    RAISE EXCEPTION 'Only dealers can add staff';
  END IF;

  -- Get staff user ID by email
  SELECT id INTO v_staff_id
  FROM public.profiles
  WHERE email = p_staff_email;

  IF v_staff_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', p_staff_email;
  END IF;

  -- Update staff user role
  UPDATE public.profiles
  SET role = 'dealer_staff',
      parent_dealer_id = v_dealer_id
  WHERE id = v_staff_id;

  -- Create staff relationship
  INSERT INTO public.dealer_staff (
    staff_id,
    dealer_id,
    role,
    can_post_listings,
    can_manage_leads,
    can_edit_dealer_settings,
    can_access_billing
  )
  VALUES (
    v_staff_id,
    v_dealer_id,
    COALESCE(p_permissions->>'role', 'sales_agent'),
    COALESCE((p_permissions->>'can_post_listings')::boolean, true),
    COALESCE((p_permissions->>'can_manage_leads')::boolean, true),
    COALESCE((p_permissions->>'can_edit_dealer_settings')::boolean, false),
    COALESCE((p_permissions->>'can_access_billing')::boolean, false)
  )
  ON CONFLICT (staff_id, dealer_id) DO UPDATE
  SET
    role = EXCLUDED.role,
    can_post_listings = EXCLUDED.can_post_listings,
    can_manage_leads = EXCLUDED.can_manage_leads,
    can_edit_dealer_settings = EXCLUDED.can_edit_dealer_settings,
    can_access_billing = EXCLUDED.can_access_billing,
    is_active = true,
    updated_at = NOW()
  RETURNING to_jsonb(dealer_staff.*) INTO v_staff_record;

  RETURN v_staff_record;
END;
$$;

-- Remove staff member
CREATE OR REPLACE FUNCTION public.remove_dealer_staff(p_staff_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_dealer_id uuid;
BEGIN
  v_dealer_id := auth.uid();
  
  IF v_dealer_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Deactivate staff relationship
  UPDATE public.dealer_staff
  SET is_active = false, updated_at = NOW()
  WHERE dealer_id = v_dealer_id AND staff_id = p_staff_id;

  -- Reset staff user role to registered
  UPDATE public.profiles
  SET role = 'registered',
      parent_dealer_id = NULL
  WHERE id = p_staff_id;

  RETURN true;
END;
$$;

-- Get dealer staff list
CREATE OR REPLACE FUNCTION public.get_dealer_staff(p_dealer_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_dealer_id uuid;
  v_result jsonb;
BEGIN
  v_dealer_id := COALESCE(p_dealer_id, auth.uid());
  
  IF v_dealer_id IS NULL THEN
    RAISE EXCEPTION 'Dealer ID required';
  END IF;

  SELECT jsonb_agg(
    jsonb_build_object(
      'staff', to_jsonb(ds.*),
      'profile', jsonb_build_object(
        'name', p.name,
        'email', p.email,
        'phone', p.phone
      )
    )
  )
  INTO v_result
  FROM public.dealer_staff ds
  JOIN public.profiles p ON ds.staff_id = p.id
  WHERE ds.dealer_id = v_dealer_id
    AND ds.is_active = true;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

-- ============================================================================
-- BUYER FUNCTIONS
-- ============================================================================

-- Save a listing
CREATE OR REPLACE FUNCTION public.save_listing(p_vehicle_id uuid, p_notes text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.saved_listings (user_id, vehicle_id, notes)
  VALUES (v_user_id, p_vehicle_id, p_notes)
  ON CONFLICT (user_id, vehicle_id) DO UPDATE
  SET notes = EXCLUDED.notes;

  RETURN true;
END;
$$;

-- Remove saved listing
CREATE OR REPLACE FUNCTION public.unsave_listing(p_vehicle_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  DELETE FROM public.saved_listings
  WHERE user_id = v_user_id AND vehicle_id = p_vehicle_id;

  RETURN true;
END;
$$;

-- Get saved listings with vehicle details
CREATE OR REPLACE FUNCTION public.get_saved_listings()
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

  SELECT jsonb_agg(
    jsonb_build_object(
      'saved_at', sl.created_at,
      'notes', sl.notes,
      'vehicle', to_jsonb(v.*)
    )
    ORDER BY sl.created_at DESC
  )
  INTO v_result
  FROM public.saved_listings sl
  JOIN public.vehicles v ON sl.vehicle_id = v.id
  WHERE sl.user_id = v_user_id
    AND v.status = 'active';

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

-- Set buyer preferences
CREATE OR REPLACE FUNCTION public.set_buyer_preferences(p_preferences jsonb)
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

  INSERT INTO public.buyer_preferences (
    user_id,
    alert_makes,
    alert_models,
    alert_min_price,
    alert_max_price,
    alert_min_year,
    alert_max_year,
    alert_body_types,
    alert_fuel_types,
    email_alerts_enabled,
    alert_frequency
  )
  VALUES (
    v_user_id,
    CASE WHEN p_preferences->'alert_makes' IS NOT NULL 
      THEN ARRAY(SELECT jsonb_array_elements_text(p_preferences->'alert_makes'))
      ELSE NULL END,
    CASE WHEN p_preferences->'alert_models' IS NOT NULL 
      THEN ARRAY(SELECT jsonb_array_elements_text(p_preferences->'alert_models'))
      ELSE NULL END,
    (p_preferences->>'alert_min_price')::numeric,
    (p_preferences->>'alert_max_price')::numeric,
    (p_preferences->>'alert_min_year')::integer,
    (p_preferences->>'alert_max_year')::integer,
    CASE WHEN p_preferences->'alert_body_types' IS NOT NULL 
      THEN ARRAY(SELECT jsonb_array_elements_text(p_preferences->'alert_body_types'))
      ELSE NULL END,
    CASE WHEN p_preferences->'alert_fuel_types' IS NOT NULL 
      THEN ARRAY(SELECT jsonb_array_elements_text(p_preferences->'alert_fuel_types'))
      ELSE NULL END,
    COALESCE((p_preferences->>'email_alerts_enabled')::boolean, true),
    COALESCE(p_preferences->>'alert_frequency', 'daily')
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    alert_makes = EXCLUDED.alert_makes,
    alert_models = EXCLUDED.alert_models,
    alert_min_price = EXCLUDED.alert_min_price,
    alert_max_price = EXCLUDED.alert_max_price,
    alert_min_year = EXCLUDED.alert_min_year,
    alert_max_year = EXCLUDED.alert_max_year,
    alert_body_types = EXCLUDED.alert_body_types,
    alert_fuel_types = EXCLUDED.alert_fuel_types,
    email_alerts_enabled = EXCLUDED.email_alerts_enabled,
    alert_frequency = EXCLUDED.alert_frequency,
    updated_at = NOW()
  RETURNING to_jsonb(buyer_preferences.*) INTO v_result;

  RETURN v_result;
END;
$$;

-- Get matching alerts for buyer
CREATE OR REPLACE FUNCTION public.get_buyer_alerts()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_preferences record;
  v_result jsonb;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get user preferences
  SELECT * INTO v_preferences
  FROM public.buyer_preferences
  WHERE user_id = v_user_id;

  IF v_preferences IS NULL THEN
    RETURN '[]'::jsonb;
  END IF;

  -- Find matching vehicles from last 7 days
  SELECT jsonb_agg(to_jsonb(v.*) ORDER BY v.created_at DESC)
  INTO v_result
  FROM public.vehicles v
  WHERE v.status = 'active'
    AND v.created_at > NOW() - INTERVAL '7 days'
    AND (v_preferences.alert_makes IS NULL OR v.make = ANY(v_preferences.alert_makes))
    AND (v_preferences.alert_models IS NULL OR v.model = ANY(v_preferences.alert_models))
    AND (v_preferences.alert_min_price IS NULL OR v.price >= v_preferences.alert_min_price)
    AND (v_preferences.alert_max_price IS NULL OR v.price <= v_preferences.alert_max_price)
    AND (v_preferences.alert_min_year IS NULL OR v.year >= v_preferences.alert_min_year)
    AND (v_preferences.alert_max_year IS NULL OR v.year <= v_preferences.alert_max_year)
    AND (v_preferences.alert_body_types IS NULL OR v.body_type = ANY(v_preferences.alert_body_types))
    AND (v_preferences.alert_fuel_types IS NULL OR v.fuel_type = ANY(v_preferences.alert_fuel_types));

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

-- ============================================================================
-- INSPECTOR FUNCTIONS
-- ============================================================================

-- Create inspector profile
CREATE OR REPLACE FUNCTION public.create_inspector_profile(p_inspector_data jsonb)
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

  -- Update user role
  UPDATE public.profiles
  SET role = 'inspector'
  WHERE id = v_user_id;

  -- Create inspector profile
  INSERT INTO public.inspector_profiles (
    id,
    certification_number,
    certification_authority,
    specializations,
    years_experience
  )
  VALUES (
    v_user_id,
    p_inspector_data->>'certification_number',
    p_inspector_data->>'certification_authority',
    CASE WHEN p_inspector_data->'specializations' IS NOT NULL 
      THEN ARRAY(SELECT jsonb_array_elements_text(p_inspector_data->'specializations'))
      ELSE NULL END,
    (p_inspector_data->>'years_experience')::integer
  )
  RETURNING to_jsonb(inspector_profiles.*) INTO v_result;

  RETURN v_result;
END;
$$;

-- Submit vehicle inspection
CREATE OR REPLACE FUNCTION public.submit_inspection(
  p_vehicle_id uuid,
  p_inspection_data jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_inspector_id uuid;
  v_result jsonb;
BEGIN
  v_inspector_id := auth.uid();
  
  IF v_inspector_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify inspector is verified and active
  IF NOT EXISTS (
    SELECT 1 FROM public.inspector_profiles
    WHERE id = v_inspector_id
      AND is_verified = true
      AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Inspector not verified or inactive';
  END IF;

  -- Create inspection record
  INSERT INTO public.vehicle_inspections (
    vehicle_id,
    inspector_id,
    overall_condition,
    mechanical_rating,
    exterior_rating,
    interior_rating,
    safety_rating,
    report_summary,
    issues_found,
    recommendations,
    estimated_repair_cost,
    is_public
  )
  VALUES (
    p_vehicle_id,
    v_inspector_id,
    p_inspection_data->>'overall_condition',
    (p_inspection_data->>'mechanical_rating')::integer,
    (p_inspection_data->>'exterior_rating')::integer,
    (p_inspection_data->>'interior_rating')::integer,
    (p_inspection_data->>'safety_rating')::integer,
    p_inspection_data->>'report_summary',
    CASE WHEN p_inspection_data->'issues_found' IS NOT NULL 
      THEN ARRAY(SELECT jsonb_array_elements_text(p_inspection_data->'issues_found'))
      ELSE NULL END,
    CASE WHEN p_inspection_data->'recommendations' IS NOT NULL 
      THEN ARRAY(SELECT jsonb_array_elements_text(p_inspection_data->'recommendations'))
      ELSE NULL END,
    (p_inspection_data->>'estimated_repair_cost')::numeric,
    COALESCE((p_inspection_data->>'is_public')::boolean, true)
  )
  RETURNING to_jsonb(vehicle_inspections.*) INTO v_result;

  -- Update inspector total count
  UPDATE public.inspector_profiles
  SET total_inspections = total_inspections + 1
  WHERE id = v_inspector_id;

  RETURN v_result;
END;
$$;

-- Get vehicle inspection
CREATE OR REPLACE FUNCTION public.get_vehicle_inspection(p_vehicle_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'inspection', to_jsonb(vi.*),
    'inspector', jsonb_build_object(
      'name', p.name,
      'certification', ip.certification_number,
      'total_inspections', ip.total_inspections
    )
  )
  INTO v_result
  FROM public.vehicle_inspections vi
  JOIN public.inspector_profiles ip ON vi.inspector_id = ip.id
  JOIN public.profiles p ON ip.id = p.id
  WHERE vi.vehicle_id = p_vehicle_id
    AND vi.is_public = true
  ORDER BY vi.created_at DESC
  LIMIT 1;

  RETURN v_result;
END;
$$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION public.get_user_listing_limit IS 'Returns listing limit based on user role';
COMMENT ON FUNCTION public.can_create_listing IS 'Checks if user can create another listing';
COMMENT ON FUNCTION public.create_dealer_profile IS 'Upgrades user to dealer and creates business profile';
COMMENT ON FUNCTION public.add_dealer_staff IS 'Adds staff member to dealer account';
COMMENT ON FUNCTION public.save_listing IS 'Saves vehicle to buyer watchlist';
COMMENT ON FUNCTION public.get_buyer_alerts IS 'Returns vehicles matching buyer preferences';
COMMENT ON FUNCTION public.submit_inspection IS 'Submits professional vehicle inspection report';
