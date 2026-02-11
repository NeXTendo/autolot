-- Migration: Advanced Performance Tracking
-- Description: Tracking seller profile clicks and identifying high-potential assets

-- 1. Table for tracking seller profile impressions
CREATE TABLE IF NOT EXISTS public.profile_impressions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    viewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Optional: track who viewed
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profile_impressions_seller_created ON public.profile_impressions(seller_id, created_at);

-- 2. RPC to track profile impressions safely
CREATE OR REPLACE FUNCTION public.track_profile_impression(p_seller_id UUID, p_viewer_id UUID DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profile_impressions (seller_id, viewer_id)
    VALUES (p_seller_id, p_viewer_id);
END;
$$;

-- 3. RPC to identify high-potential assets
-- Definition: Cars with high view counts but low lead counts, normalized by days active
CREATE OR REPLACE FUNCTION public.get_high_potential_assets(p_seller_id UUID, p_limit INT DEFAULT 4)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_agg(r)
    INTO result
    FROM (
        SELECT 
            v.id,
            v.make,
            v.model,
            v.year,
            v.price,
            v.images[1] as image,
            v.views_count as total_views,
            (SELECT COUNT(*) FROM public.messages m WHERE m.vehicle_id = v.id) as lead_count,
            -- Engagement score: views / (leads + 1) * normalization factor
            -- We want items where views are high but leads are low (room for optimization/high potential)
            ROUND((v.views_count::DECIMAL / (GREATEST((SELECT COUNT(*) FROM public.messages m WHERE m.vehicle_id = v.id), 0) + 1)), 1) as interest_score
        FROM public.vehicles v
        WHERE v.seller_id = p_seller_id 
          AND v.status = 'active'
        ORDER BY interest_score DESC, v.views_count DESC
        LIMIT p_limit
    ) r;

    RETURN COALESCE(result, '[]'::jsonb);
END;
$$;
