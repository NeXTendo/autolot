-- Migration: Security Enhancements
-- Description: Add constraints, indexes, rate limiting, and audit trails

-- ============================================================================
-- DATA VALIDATION CONSTRAINTS
-- ============================================================================

-- Price must be positive and reasonable
ALTER TABLE public.vehicles
ADD CONSTRAINT vehicles_price_check 
CHECK (price > 0 AND price < 10000000);

-- Year must be reasonable
ALTER TABLE public.vehicles
ADD CONSTRAINT vehicles_year_check 
CHECK (year >= 1980 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1);

-- Mileage must be non-negative
ALTER TABLE public.vehicles
ADD CONSTRAINT vehicles_mileage_check 
CHECK (mileage >= 0);

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Vehicles indexes
CREATE INDEX IF NOT EXISTS idx_vehicles_seller ON public.vehicles(seller_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON public.vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_make_model ON public.vehicles(make, model);
CREATE INDEX IF NOT EXISTS idx_vehicles_price ON public.vehicles(price);
CREATE INDEX IF NOT EXISTS idx_vehicles_year ON public.vehicles(year);
CREATE INDEX IF NOT EXISTS idx_vehicles_created ON public.vehicles(created_at DESC);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_vehicle ON public.messages(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_messages_seller ON public.messages(seller_id);
CREATE INDEX IF NOT EXISTS idx_messages_user ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON public.messages(status);

-- Watchlists indexes
CREATE INDEX IF NOT EXISTS idx_watchlists_user ON public.watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlists_vehicle ON public.watchlists(vehicle_id);

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ============================================================================
-- RATE LIMITING
-- ============================================================================

-- Table to track user actions for rate limiting
CREATE TABLE IF NOT EXISTS public.user_action_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_action_log_user_action 
ON public.user_action_log(user_id, action_type, created_at);

-- Function to check rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  action TEXT,
  max_actions INTEGER,
  time_window INTERVAL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
  action_count integer;
BEGIN
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Count recent actions
  SELECT COUNT(*)
  INTO action_count
  FROM public.user_action_log
  WHERE user_id = user_id
    AND action_type = action
    AND created_at > NOW() - time_window;

  IF action_count >= max_actions THEN
    RAISE EXCEPTION 'Rate limit exceeded for action: %. Please try again later.', action;
  END IF;

  -- Log this action
  INSERT INTO public.user_action_log (user_id, action_type)
  VALUES (user_id, action);

  RETURN true;
END;
$$;

-- ============================================================================
-- AUDIT TRAIL
-- ============================================================================

-- Table to track vehicle changes
CREATE TABLE IF NOT EXISTS public.vehicle_audit_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_audit_log_vehicle 
ON public.vehicle_audit_log(vehicle_id, created_at DESC);

-- Function to log vehicle changes
CREATE OR REPLACE FUNCTION public.log_vehicle_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.vehicle_audit_log (vehicle_id, user_id, action, old_data, new_data)
    VALUES (NEW.id, auth.uid(), 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.vehicle_audit_log (vehicle_id, user_id, action, new_data)
    VALUES (NEW.id, auth.uid(), 'INSERT', to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.vehicle_audit_log (vehicle_id, user_id, action, old_data)
    VALUES (OLD.id, auth.uid(), 'DELETE', to_jsonb(OLD));
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger for vehicle audit log
CREATE TRIGGER vehicle_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.vehicles
FOR EACH ROW
EXECUTE FUNCTION public.log_vehicle_change();

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_vehicles_updated_at
BEFORE UPDATE ON public.vehicles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_car_stories_updated_at
BEFORE UPDATE ON public.car_stories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- ============================================================================
-- CLEANUP FUNCTIONS
-- ============================================================================

-- Function to clean up old action logs (run periodically)
CREATE OR REPLACE FUNCTION public.cleanup_old_action_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.user_action_log
  WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$;

-- Function to clean up archived vehicles (run periodically)
CREATE OR REPLACE FUNCTION public.cleanup_archived_vehicles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.vehicles
  WHERE status = 'archived'
    AND updated_at < NOW() - INTERVAL '90 days';
END;
$$;
