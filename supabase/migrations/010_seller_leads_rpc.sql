-- Migration: Seller Leads RPC
-- Description: Function to fetch inquiries for a seller's vehicles with joined details

CREATE OR REPLACE FUNCTION public.get_seller_leads(p_seller_id UUID)
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
            m.id,
            m.message,
            m.status,
            m.created_at,
            m.dealer_notes,
            jsonb_build_object(
                'id', p.id,
                'name', p.name,
                'email', p.email,
                'phone', p.phone
            ) as buyer,
            jsonb_build_object(
                'id', v.id,
                'make', v.make,
                'model', v.model,
                'year', v.year,
                'price', v.price,
                'image', v.images[1]
            ) as vehicle
        FROM public.messages m
        JOIN public.profiles p ON m.user_id = p.id
        JOIN public.vehicles v ON m.vehicle_id = v.id
        WHERE m.seller_id = p_seller_id
        ORDER BY m.created_at DESC
    ) r;

    RETURN COALESCE(result, '[]'::jsonb);
END;
$$;
