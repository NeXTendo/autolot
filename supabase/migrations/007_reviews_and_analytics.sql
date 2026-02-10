-- Migration: Reviews and Analytics
-- Description: Add reviews table and views_count to vehicles

-- 1. Add views_count to vehicles
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS views_count INT DEFAULT 0;

-- 2. Create Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 4. Policies
-- Everyone can view reviews
CREATE POLICY "Public can view reviews"
ON public.reviews FOR SELECT
USING (true);

-- Authenticated users can write reviews (logic would usually involve verifying a transaction, but we'll allow all for now)
CREATE POLICY "Authenticated users can create reviews"
ON public.reviews FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Reviewers can update their own reviews
CREATE POLICY "Users can update own reviews"
ON public.reviews FOR UPDATE
USING (auth.uid() = reviewer_id);

-- 5. RPC to update views safely
CREATE OR REPLACE FUNCTION public.increment_vehicle_views(v_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.vehicles
    SET views_count = views_count + 1
    WHERE id = v_id;
END;
$$;
