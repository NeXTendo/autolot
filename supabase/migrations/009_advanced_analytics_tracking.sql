-- Migration: Real-Time Analytics and Reach Tracking
-- Description: Tracking impressions and benchmarking data

-- 1. Table for tracking impressions (Reach)
CREATE TABLE IF NOT EXISTS public.vehicle_impressions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
    seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_impressions_seller_created ON public.vehicle_impressions(seller_id, created_at);

-- 2. RPC to track impressions safely (can be called from browse events)
CREATE OR REPLACE FUNCTION public.track_vehicle_impression(p_vehicle_id UUID, p_seller_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.vehicle_impressions (vehicle_id, seller_id)
    VALUES (p_vehicle_id, p_seller_id);
END;
$$;

-- 3. Update get_seller_analytics to include Reach and Benchmarks
CREATE OR REPLACE FUNCTION public.get_seller_analytics_v2(p_seller_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_views INT;
    v_new_leads INT;
    v_inventory_value DECIMAL(15, 2);
    v_conversion_rate DECIMAL(5, 2);
    v_monthly_reach INT;
    v_avg_response_time INT; -- in minutes
    v_market_avg_response INT;
    v_market_avg_velocity INT; -- days to sell
    v_user_velocity INT;
BEGIN
    -- Basic stats (Views, Leads, Value)
    SELECT COALESCE(SUM(views_count), 0) INTO v_total_views FROM public.vehicles WHERE seller_id = p_seller_id;
    SELECT COUNT(*) INTO v_new_leads FROM public.messages WHERE seller_id = p_seller_id AND status = 'new';
    SELECT COALESCE(SUM(price), 0) INTO v_inventory_value FROM public.vehicles WHERE seller_id = p_seller_id AND status = 'active';

    -- Strategic Reach (Impressions last 30 days)
    SELECT COUNT(*) INTO v_monthly_reach 
    FROM public.vehicle_impressions 
    WHERE seller_id = p_seller_id 
      AND created_at > NOW() - INTERVAL '30 days';

    -- User Metrics (Simulation of response time and velocity based on available data)
    -- In a real app, you'd calculate this from message timestamps vs status changes
    v_avg_response_time := 45; -- Placeholder for logic: AVG(replied_at - created_at)
    v_user_velocity := 14;     -- Placeholder for logic: AVG(sold_at - created_at)

    -- Market Benchmarks (Global averages)
    SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/86400)::INT, 30)
    INTO v_market_avg_velocity
    FROM public.vehicles
    WHERE status = 'sold';

    v_market_avg_response := 120;

    RETURN jsonb_build_object(
        'total_views', v_total_views,
        'new_leads', v_new_leads,
        'inventory_value', v_inventory_value,
        'conversion_rate', CASE WHEN v_total_views > 0 THEN ROUND((v_new_leads::DECIMAL / v_total_views::DECIMAL) * 100, 1) ELSE 0 END,
        'monthly_reach', v_monthly_reach,
        'user_metrics', jsonb_build_object(
            'response_time', v_avg_response_time,
            'sales_velocity', v_user_velocity
        ),
        'market_benchmarks', jsonb_build_object(
            'avg_response_time', v_market_avg_response,
            'avg_sales_velocity', v_market_avg_velocity
        )
    );
END;
$$;

-- 4. RPC for chart data (Last 7 days views)
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
                to_char(date_series, 'Mon') as name,
                (SELECT COUNT(*) FROM public.vehicle_impressions i WHERE i.seller_id = p_seller_id AND i.created_at::date = date_series::date) as views
            FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day') AS date_series
        ) d
    );
END;
$$;
