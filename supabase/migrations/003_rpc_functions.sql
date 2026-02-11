-- Migration: RPC Functions for CRUD Operations
-- Description: Type-safe RPC functions to bypass TypeScript errors and ensure data validation

-- ============================================================================
-- VEHICLE CRUD FUNCTIONS
-- ============================================================================

-- Create a new vehicle listing
CREATE OR REPLACE FUNCTION public.create_vehicle(vehicle_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_vehicle jsonb;
  user_id uuid;
  user_email text;
  profile_exists boolean;
BEGIN
  -- Get authenticated user
  user_id := auth.uid();
  
  RAISE NOTICE 'create_vehicle called with user_id: %', user_id;
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get user email from auth.users
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = user_id;

  RAISE NOTICE 'User email: %', user_email;

  -- Check if profile exists
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = user_id) INTO profile_exists;
  
  RAISE NOTICE 'Profile exists: %', profile_exists;

  -- Create profile if it doesn't exist
  IF NOT profile_exists THEN
    RAISE NOTICE 'Creating profile for user: %', user_id;
    INSERT INTO public.profiles (id, name, email)
    VALUES (user_id, COALESCE(user_email, 'User'), user_email)
    ON CONFLICT (id) DO NOTHING;
    RAISE NOTICE 'Profile created successfully';
  END IF;

  -- Validate required fields
  IF vehicle_data->>'make' IS NULL OR vehicle_data->>'model' IS NULL THEN
    RAISE EXCEPTION 'Make and model are required';
  END IF;

  IF (vehicle_data->>'price')::numeric <= 0 THEN
    RAISE EXCEPTION 'Price must be greater than 0';
  END IF;

  IF (vehicle_data->>'mileage')::integer < 0 THEN
    RAISE EXCEPTION 'Mileage cannot be negative';
  END IF;

  RAISE NOTICE 'Inserting vehicle: make=%, model=%, year=%', 
    vehicle_data->>'make', vehicle_data->>'model', vehicle_data->>'year';

  -- Insert vehicle
  INSERT INTO public.vehicles (
    make, model, year, trim, price, mileage,
    condition, body_type, fuel_type, transmission, drivetrain,
    exterior_color, interior_color, vin, images, description, features,
    title_status, accidents, contact_method, pricing_strategy, show_phone,
    is_premium, seller_id
  )
  VALUES (
    vehicle_data->>'make',
    vehicle_data->>'model',
    (vehicle_data->>'year')::integer,
    vehicle_data->>'trim',
    (vehicle_data->>'price')::numeric,
    (vehicle_data->>'mileage')::integer,
    (vehicle_data->>'condition')::vehicle_condition,
    vehicle_data->>'body_type',
    vehicle_data->>'fuel_type',
    vehicle_data->>'transmission',
    vehicle_data->>'drivetrain',
    vehicle_data->>'exterior_color',
    vehicle_data->>'interior_color',
    vehicle_data->>'vin',
    CASE 
      WHEN vehicle_data->'images' IS NOT NULL AND jsonb_typeof(vehicle_data->'images') = 'array'
      THEN ARRAY(SELECT jsonb_array_elements_text(vehicle_data->'images'))
      ELSE ARRAY[]::text[]
    END,
    vehicle_data->>'description',
    CASE 
      WHEN vehicle_data->'features' IS NOT NULL AND jsonb_typeof(vehicle_data->'features') = 'array'
      THEN ARRAY(SELECT jsonb_array_elements_text(vehicle_data->'features'))
      ELSE ARRAY[]::text[]
    END,
    COALESCE((vehicle_data->>'title_status')::title_status, 'Clean'),
    COALESCE((vehicle_data->>'accidents')::accident_history, 'None'),
    COALESCE(vehicle_data->>'contact_method', 'In-built Messenger'),
    COALESCE(vehicle_data->>'pricing_strategy', 'Negotiable'),
    COALESCE((vehicle_data->>'show_phone')::boolean, false),
    COALESCE((vehicle_data->>'is_premium')::boolean, false),
    user_id
  )
  RETURNING to_jsonb(vehicles.*) INTO new_vehicle;

  RAISE NOTICE 'Vehicle created successfully with id: %', new_vehicle->>'id';

  RETURN new_vehicle;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in create_vehicle: % - %', SQLERRM, SQLSTATE;
    RAISE;
END;
$$;

-- Update an existing vehicle listing
CREATE OR REPLACE FUNCTION public.update_vehicle(vehicle_id uuid, vehicle_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_vehicle jsonb;
  user_id uuid;
BEGIN
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check ownership
  IF NOT EXISTS (
    SELECT 1 FROM public.vehicles 
    WHERE id = vehicle_id AND seller_id = user_id
  ) THEN
    RAISE EXCEPTION 'Not authorized to update this vehicle';
  END IF;

  -- Update vehicle
  UPDATE public.vehicles
  SET
    make = COALESCE(vehicle_data->>'make', make),
    model = COALESCE(vehicle_data->>'model', model),
    year = COALESCE((vehicle_data->>'year')::integer, year),
    trim = COALESCE(vehicle_data->>'trim', trim),
    price = COALESCE((vehicle_data->>'price')::numeric, price),
    mileage = COALESCE((vehicle_data->>'mileage')::integer, mileage),
    condition = COALESCE((vehicle_data->>'condition')::vehicle_condition, condition),
    body_type = COALESCE(vehicle_data->>'body_type', body_type),
    fuel_type = COALESCE(vehicle_data->>'fuel_type', fuel_type),
    transmission = COALESCE(vehicle_data->>'transmission', transmission),
    drivetrain = COALESCE(vehicle_data->>'drivetrain', drivetrain),
    exterior_color = COALESCE(vehicle_data->>'exterior_color', exterior_color),
    interior_color = COALESCE(vehicle_data->>'interior_color', interior_color),
    description = COALESCE(vehicle_data->>'description', description),
    features = CASE 
      WHEN vehicle_data->'features' IS NOT NULL AND jsonb_typeof(vehicle_data->'features') = 'array'
      THEN ARRAY(SELECT jsonb_array_elements_text(vehicle_data->'features'))
      ELSE features
    END,
    pricing_strategy = COALESCE(vehicle_data->>'pricing_strategy', pricing_strategy),
    status = COALESCE((vehicle_data->>'status')::listing_status, status),
    is_premium = COALESCE((vehicle_data->>'is_premium')::boolean, is_premium),
    updated_at = NOW()
  WHERE id = vehicle_id
  RETURNING to_jsonb(vehicles.*) INTO updated_vehicle;

  RETURN updated_vehicle;
END;
$$;

-- Delete (archive) a vehicle listing
CREATE OR REPLACE FUNCTION public.delete_vehicle(vehicle_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
BEGIN
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check ownership
  IF NOT EXISTS (
    SELECT 1 FROM public.vehicles 
    WHERE id = vehicle_id AND seller_id = user_id
  ) THEN
    RAISE EXCEPTION 'Not authorized to delete this vehicle';
  END IF;

  -- Soft delete by archiving
  UPDATE public.vehicles
  SET status = 'archived', updated_at = NOW()
  WHERE id = vehicle_id;

  RETURN true;
END;
$$;

-- Get all vehicles for a user
CREATE OR REPLACE FUNCTION public.get_user_vehicles(target_user_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
  result jsonb;
BEGIN
  user_id := COALESCE(target_user_id, auth.uid());
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User ID required';
  END IF;

  SELECT jsonb_agg(
    jsonb_build_object(
      'vehicle', to_jsonb(v.*),
      'message_count', (
        SELECT COUNT(*) FROM public.messages 
        WHERE vehicle_id = v.id
      )
    )
  )
  INTO result
  FROM public.vehicles v
  WHERE v.seller_id = user_id
  ORDER BY v.created_at DESC;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- ============================================================================
-- WATCHLIST FUNCTIONS
-- ============================================================================

-- Add vehicle to watchlist
CREATE OR REPLACE FUNCTION public.add_to_watchlist(vehicle_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
BEGIN
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Insert if not exists
  INSERT INTO public.watchlists (user_id, vehicle_id)
  VALUES (user_id, vehicle_id)
  ON CONFLICT (user_id, vehicle_id) DO NOTHING;

  RETURN true;
END;
$$;

-- Remove vehicle from watchlist
CREATE OR REPLACE FUNCTION public.remove_from_watchlist(vehicle_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
BEGIN
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  DELETE FROM public.watchlists
  WHERE user_id = user_id AND vehicle_id = vehicle_id;

  RETURN true;
END;
$$;

-- ============================================================================
-- MESSAGE FUNCTIONS
-- ============================================================================

-- Send a message about a vehicle
CREATE OR REPLACE FUNCTION public.send_message(vehicle_id uuid, message_text text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
  seller_id uuid;
  new_message jsonb;
BEGIN
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get seller_id from vehicle
  SELECT v.seller_id INTO seller_id
  FROM public.vehicles v
  WHERE v.id = vehicle_id;

  IF seller_id IS NULL THEN
    RAISE EXCEPTION 'Vehicle not found';
  END IF;

  -- Insert message
  INSERT INTO public.messages (seller_id, vehicle_id, user_id, message)
  VALUES (seller_id, vehicle_id, user_id, message_text)
  RETURNING to_jsonb(messages.*) INTO new_message;

  RETURN new_message;
END;
$$;

-- ============================================================================
-- SEARCH FUNCTION
-- ============================================================================

-- Advanced vehicle search with filters
-- Step 1: Drop function to allow parameter name changes
DROP FUNCTION IF EXISTS public.search_vehicles(text,text,numeric,numeric,integer,integer,vehicle_condition,text,text,text,text,integer,integer,integer,integer);

-- Step 2: Create function with prefixed parameters
CREATE OR REPLACE FUNCTION public.search_vehicles(
  p_query text DEFAULT NULL,
  p_search_make text DEFAULT NULL,
  p_search_model text DEFAULT NULL,
  p_min_price numeric DEFAULT NULL,
  p_max_price numeric DEFAULT NULL,
  p_min_year integer DEFAULT NULL,
  p_max_year integer DEFAULT NULL,
  p_search_condition vehicle_condition DEFAULT NULL,
  p_body_type text DEFAULT NULL,
  p_fuel_type text DEFAULT NULL,
  p_transmission text DEFAULT NULL,
  p_drivetrain text DEFAULT NULL,
  p_min_mileage integer DEFAULT NULL,
  p_max_mileage integer DEFAULT NULL,
  p_is_premium boolean DEFAULT NULL,
  p_sort_by text DEFAULT 'created_at',
  p_sort_order text DEFAULT 'desc',
  p_page_limit integer DEFAULT 20,
  p_page_offset integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  total_count integer;
  v_sort_col text;
BEGIN
  -- Get total count first
  SELECT COUNT(*)
  INTO total_count
  FROM public.vehicles v
  WHERE v.status = 'active'
    AND (p_query IS NULL OR (
      v.make ILIKE '%' || p_query || '%' OR 
      v.model ILIKE '%' || p_query || '%' OR 
      v.trim ILIKE '%' || p_query || '%' OR
      (v.make || ' ' || v.model) ILIKE '%' || p_query || '%'
    ))
    AND (p_search_make IS NULL OR v.make ILIKE '%' || p_search_make || '%')
    AND (p_search_model IS NULL OR v.model ILIKE '%' || p_search_model || '%')
    AND (p_min_price IS NULL OR v.price >= p_min_price)
    AND (p_max_price IS NULL OR v.price <= p_max_price)
    AND (p_min_year IS NULL OR v.year >= p_min_year)
    AND (p_max_year IS NULL OR v.year <= p_max_year)
    AND (p_search_condition IS NULL OR v.condition = p_search_condition)
    AND (p_body_type IS NULL OR v.body_type = p_body_type)
    AND (p_fuel_type IS NULL OR v.fuel_type = p_fuel_type)
    AND (p_transmission IS NULL OR v.transmission = p_transmission)
    AND (p_drivetrain IS NULL OR v.drivetrain = p_drivetrain)
    AND (p_min_mileage IS NULL OR v.mileage >= p_min_mileage)
    AND (p_max_mileage IS NULL OR v.mileage <= p_max_mileage)
    AND (p_is_premium IS NULL OR v.is_premium = p_is_premium);

  -- Get paginated results with dynamic sorting
  -- We use a CTE to ensure the join with profiles doesn't break the sorting order
  SELECT jsonb_build_object(
    'vehicles', COALESCE(jsonb_agg(
      to_jsonb(v_out.*) || jsonb_build_object(
        'seller', jsonb_build_object(
          'name', COALESCE(p.name, 'Global Seller'),
          'is_verified', COALESCE(p.is_verified, false)
        )
      )
      -- Preserve sorting in aggregation
      ORDER BY 
        v_out.is_premium DESC,
        CASE WHEN p_sort_by = 'price' AND p_sort_order = 'asc' THEN v_out.price END ASC,
        CASE WHEN p_sort_by = 'price' AND p_sort_order = 'desc' THEN v_out.price END DESC,
        CASE WHEN p_sort_by = 'year' AND p_sort_order = 'asc' THEN v_out.year END ASC,
        CASE WHEN p_sort_by = 'year' AND p_sort_order = 'desc' THEN v_out.year END DESC,
        CASE WHEN p_sort_by = 'mileage' AND p_sort_order = 'asc' THEN v_out.mileage END ASC,
        CASE WHEN p_sort_by = 'mileage' AND p_sort_order = 'desc' THEN v_out.mileage END DESC,
        CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'asc' THEN v_out.created_at END ASC,
        CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'desc' THEN v_out.created_at END DESC,
        v_out.created_at DESC
    ), '[]'::jsonb),
    'total', total_count
  )
  INTO result
  FROM (
    SELECT v.*
    FROM public.vehicles v
    WHERE v.status = 'active'
      AND (p_query IS NULL OR (
        v.make ILIKE '%' || p_query || '%' OR 
        v.model ILIKE '%' || p_query || '%' OR 
        v.trim ILIKE '%' || p_query || '%' OR
        (v.make || ' ' || v.model) ILIKE '%' || p_query || '%'
      ))
      AND (p_search_make IS NULL OR v.make ILIKE '%' || p_search_make || '%')
      AND (p_search_model IS NULL OR v.model ILIKE '%' || p_search_model || '%')
      AND (p_min_price IS NULL OR v.price >= p_min_price)
      AND (p_max_price IS NULL OR v.price <= p_max_price)
      AND (p_min_year IS NULL OR v.year >= p_min_year)
      AND (p_max_year IS NULL OR v.year <= p_max_year)
      AND (p_search_condition IS NULL OR v.condition = p_search_condition)
      AND (p_body_type IS NULL OR v.body_type = p_body_type)
      AND (p_fuel_type IS NULL OR v.fuel_type = p_fuel_type)
      AND (p_transmission IS NULL OR v.transmission = p_transmission)
      AND (p_drivetrain IS NULL OR v.drivetrain = p_drivetrain)
      AND (p_min_mileage IS NULL OR v.mileage >= p_min_mileage)
      AND (p_max_mileage IS NULL OR v.mileage <= p_max_mileage)
      AND (p_is_premium IS NULL OR v.is_premium = p_is_premium)
    ORDER BY
      v.is_premium DESC,
      CASE WHEN p_sort_by = 'price' AND p_sort_order = 'asc' THEN price END ASC,
      CASE WHEN p_sort_by = 'price' AND p_sort_order = 'desc' THEN price END DESC,
      CASE WHEN p_sort_by = 'year' AND p_sort_order = 'asc' THEN year END ASC,
      CASE WHEN p_sort_by = 'year' AND p_sort_order = 'desc' THEN year END DESC,
      CASE WHEN p_sort_by = 'mileage' AND p_sort_order = 'asc' THEN mileage END ASC,
      CASE WHEN p_sort_by = 'mileage' AND p_sort_order = 'desc' THEN mileage END DESC,
      CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'asc' THEN created_at END ASC,
      CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'desc' THEN created_at END DESC,
      v.created_at DESC
    LIMIT p_page_limit
    OFFSET p_page_offset
  ) v_out
  LEFT JOIN public.profiles p ON v_out.seller_id = p.id;

  RETURN result;
END;
$$;

-- Get list of makes that have active listings
CREATE OR REPLACE FUNCTION public.get_active_makes()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_agg(r)
  INTO result
  FROM (
    SELECT 
      make,
      count(*) as vehicle_count
    FROM public.vehicles
    WHERE status = 'active'
    GROUP BY make
    ORDER BY make ASC
  ) r;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- Record a view for a vehicle
CREATE OR REPLACE FUNCTION public.record_vehicle_view(p_vehicle_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.vehicles
  SET view_count = view_count + 1
  WHERE id = p_vehicle_id;
END;
$$;

-- Get trending makes based on view counts
CREATE OR REPLACE FUNCTION public.get_trending_makes(p_limit integer DEFAULT 5)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_agg(make)
  INTO result
  FROM (
    SELECT 
      make,
      sum(view_count) as total_views
    FROM public.vehicles
    WHERE status = 'active'
    GROUP BY make
    ORDER BY total_views DESC
    LIMIT p_limit
  ) r;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- Get real-time search suggestions
CREATE OR REPLACE FUNCTION public.get_search_suggestions(p_query text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_makes jsonb;
  v_models jsonb;
  v_listings jsonb;
BEGIN
  -- 1. Matching Makes
  SELECT jsonb_agg(DISTINCT make)
  INTO v_makes
  FROM public.vehicles
  WHERE status = 'active' AND make ILIKE p_query || '%'
  LIMIT 3;

  -- 2. Matching Models
  SELECT jsonb_agg(DISTINCT model)
  INTO v_models
  FROM public.vehicles
  WHERE status = 'active' AND model ILIKE p_query || '%'
  LIMIT 3;

  -- 3. Top Matches (as distinctive strings)
  SELECT jsonb_agg(DISTINCT (year || ' ' || make || ' ' || model))
  INTO v_listings
  FROM public.vehicles
  WHERE status = 'active' 
    AND (
      make ILIKE '%' || p_query || '%' OR 
      model ILIKE '%' || p_query || '%' OR
      (make || ' ' || model) ILIKE '%' || p_query || '%'
    )
  LIMIT 5;

  RETURN jsonb_build_object(
    'makes', COALESCE(v_makes, '[]'::jsonb),
    'models', COALESCE(v_models, '[]'::jsonb),
    'listings', COALESCE(v_listings, '[]'::jsonb)
  );
END;
$$;
