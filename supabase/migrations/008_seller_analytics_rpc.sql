-- Migration: Advanced Seller Analytics RPC
-- Description: Function to fetch aggregated analytics for a seller

CREATE OR REPLACE FUNCTION public.get_seller_analytics(p_seller_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_views INT;
    v_new_leads INT;
    v_inventory_value DECIMAL(15, 2);
    v_conversion_rate DECIMAL(5, 2);
    v_watchlist_count INT;
BEGIN
    -- 1. Get total views from vehicles
    SELECT COALESCE(SUM(views_count), 0)
    INTO v_total_views
    FROM public.vehicles
    WHERE seller_id = p_seller_id;

    -- 2. Get new leads from messages
    SELECT COUNT(*)
    INTO v_new_leads
    FROM public.messages
    WHERE seller_id = p_seller_id 
      AND status = 'new';

    -- 3. Get total inventory value
    SELECT COALESCE(SUM(price), 0)
    INTO v_inventory_value
    FROM public.vehicles
    WHERE seller_id = p_seller_id
      AND status = 'active';

    -- 4. Get watchlist count (popularity)
    SELECT COUNT(*)
    INTO v_watchlist_count
    FROM public.watchlists w
    INNER JOIN public.vehicles v ON w.vehicle_id = v.id
    WHERE v.seller_id = p_seller_id;

    -- 5. Calculate conversion rate (leads / views)
    -- Simple formula: conversion = (leads / views) * 100
    IF v_total_views > 0 THEN
        v_conversion_rate := (v_new_leads::DECIMAL / v_total_views::DECIMAL) * 100;
    ELSE
        v_conversion_rate := 0;
    END IF;

    RETURN jsonb_build_object(
        'total_views', v_total_views,
        'new_leads', v_new_leads,
        'inventory_value', v_inventory_value,
        'conversion_rate', ROUND(v_conversion_rate, 1),
        'watchlist_count', v_watchlist_count
    );
END;
$$;
