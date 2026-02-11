-- Migration: Dealer Assets Storage and Onboarding
-- Description: Create bucket for dealer assets and set RLS policies

-- 1. Create bucket for dealer assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('dealer-assets', 'dealer-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies
CREATE POLICY "Public Access Dealer Assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'dealer-assets');

CREATE POLICY "Dealers can upload own assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'dealer-assets' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Dealers can update own assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'dealer-assets' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'dealer-assets' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Dealers can delete own assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'dealer-assets' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. RLS Policies for dealer_profiles
-- Allow users to see all dealer profiles (public info)
DROP POLICY IF EXISTS "Dealer profiles are public" ON public.dealer_profiles;
CREATE POLICY "Dealer profiles are public"
ON public.dealer_profiles FOR SELECT
USING (true);

-- Allow dealers to update their own profile
DROP POLICY IF EXISTS "Dealers can update own profile" ON public.dealer_profiles;
CREATE POLICY "Dealers can update own profile"
ON public.dealer_profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. Helper function to get dealer logo URL
CREATE OR REPLACE FUNCTION public.get_dealer_logo_url(file_path text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN 'https://' || current_setting('app.settings.supabase_url') || 
         '/storage/v1/object/public/dealer-assets/' || file_path;
END;
$$;
