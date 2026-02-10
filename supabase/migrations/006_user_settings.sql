-- Migration: User Settings Table
-- Description: Store user preferences and settings

-- Create user settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  settings JSONB NOT NULL DEFAULT '{
    "currency": "USD",
    "theme": "dark",
    "language": "en",
    "measurementUnit": "km",
    "notifications": {
      "email": true,
      "priceDrops": true,
      "newListings": false
    },
    "privacy": {
      "showEmail": false,
      "showPhone": false
    }
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Users can only view their own settings
CREATE POLICY "user_settings_select_own"
ON public.user_settings
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own settings
CREATE POLICY "user_settings_insert_own"
ON public.user_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own settings
CREATE POLICY "user_settings_update_own"
ON public.user_settings
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id 
ON public.user_settings(user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- RPC function to get or create user settings
CREATE OR REPLACE FUNCTION public.get_user_settings()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
  user_settings jsonb;
BEGIN
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get settings or create default
  SELECT settings INTO user_settings
  FROM public.user_settings
  WHERE user_id = user_id;

  IF user_settings IS NULL THEN
    -- Create default settings
    INSERT INTO public.user_settings (user_id)
    VALUES (user_id)
    RETURNING settings INTO user_settings;
  END IF;

  RETURN user_settings;
END;
$$;

-- RPC function to update user settings
CREATE OR REPLACE FUNCTION public.update_user_settings(new_settings jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
  updated_settings jsonb;
BEGIN
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Upsert settings
  INSERT INTO public.user_settings (user_id, settings)
  VALUES (user_id, new_settings)
  ON CONFLICT (user_id)
  DO UPDATE SET 
    settings = new_settings,
    updated_at = NOW()
  RETURNING settings INTO updated_settings;

  RETURN updated_settings;
END;
$$;
