-- Migration: Fix Analytics Tracking and Data Flow
-- Description: Unifies view counting and impression tracking, fixes column naming, and improves chart labels.

-- 1. Create a unified tracking function
-- This handles both the total view counter and the time-series impressions in one call
CREATE OR REPLACE FUNCTION public.track_vehicle_engagement(p_vehicle_id UUID, p_seller_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Increment the total views count (Fixes the view_count vs views_count mismatch)
    UPDATE public.vehicles
    SET views_count = COALESCE(views_count, 0) + 1
    WHERE id = p_vehicle_id;

    -- Record the time-stamped impression for reach and charts
    INSERT INTO public.vehicle_impressions (vehicle_id, seller_id)
    VALUES (p_vehicle_id, p_seller_id);
END;
$$;

-- 2. Fix the broken record_vehicle_view (legacy support or fallback)
CREATE OR REPLACE FUNCTION public.record_vehicle_view(p_vehicle_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.vehicles
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = p_vehicle_id;
END;
$$;

-- 3. Improve chart data labels (Fixes "Feb Feb Feb" issue)
CREATE OR REPLACE FUNCTION public.get_seller_chart_data(p_seller_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN (
        SELECT jsonb_agg(d)
        FROM (
            SELECT 
                to_char(date_series, 'DD Mon') as name, -- Changed from 'Mon' to 'DD Mon'
                (SELECT COUNT(*) FROM public.vehicle_impressions i WHERE i.seller_id = p_seller_id AND i.created_at::date = date_series::date) as views
            FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day') AS date_series
        ) d
    );
END;
$$;
