-- Migration: Storage Bucket Setup
-- Description: Configure storage buckets for vehicle photos with proper access policies

-- ============================================================================
-- CREATE STORAGE BUCKET
-- ============================================================================

-- Create bucket for vehicle photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-photos', 'vehicle-photos', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

-- Anyone can view vehicle photos (public read)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'vehicle-photos');

-- Authenticated users can upload photos to their own folder
CREATE POLICY "Users can upload own photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vehicle-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own photos
CREATE POLICY "Users can update own photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'vehicle-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'vehicle-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own photos
CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'vehicle-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================================
-- HELPER FUNCTIONS FOR STORAGE
-- ============================================================================

-- Function to get public URL for a file
CREATE OR REPLACE FUNCTION public.get_vehicle_photo_url(file_path text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN 'https://' || current_setting('app.settings.supabase_url') || 
         '/storage/v1/object/public/vehicle-photos/' || file_path;
END;
$$;

-- Function to delete vehicle photos when vehicle is deleted
CREATE OR REPLACE FUNCTION public.delete_vehicle_photos()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete all photos associated with the vehicle
  IF OLD.images IS NOT NULL THEN
    -- This would require storage API calls
    -- For now, we'll just log it
    RAISE NOTICE 'Vehicle % deleted, photos should be cleaned up: %', OLD.id, OLD.images;
  END IF;
  RETURN OLD;
END;
$$;

-- Trigger to clean up photos when vehicle is deleted
CREATE TRIGGER delete_vehicle_photos_trigger
BEFORE DELETE ON public.vehicles
FOR EACH ROW
EXECUTE FUNCTION public.delete_vehicle_photos();
