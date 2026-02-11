-- Migration: Multi-User Role System - Core Schema
-- Description: Extends user roles and creates tables for dealers, staff, buyers, inspectors, and premium upgrades

-- ============================================================================
-- EXTEND USER ROLE ENUM
-- ============================================================================

-- Add new roles to existing enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'buyer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'dealer_staff';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'inspector';

-- ============================================================================
-- EXTEND PROFILES TABLE
-- ============================================================================

-- Add listing count tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS listing_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS parent_dealer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Create index for dealer staff lookups
CREATE INDEX IF NOT EXISTS idx_profiles_parent_dealer ON public.profiles(parent_dealer_id);

-- ============================================================================
-- DEALER PROFILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.dealer_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    business_logo TEXT,
    business_description TEXT,
    business_address TEXT,
    business_phone TEXT,
    business_email TEXT,
    website_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES public.profiles(id),
    total_sales INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.dealer_profiles ENABLE ROW LEVEL SECURITY;

-- Create index for verified dealers
CREATE INDEX IF NOT EXISTS idx_dealer_profiles_verified ON public.dealer_profiles(is_verified);

-- ============================================================================
-- DEALER STAFF TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.dealer_staff (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    staff_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    dealer_id UUID REFERENCES public.dealer_profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'sales_agent' CHECK (role IN ('sales_agent', 'manager')),
    can_post_listings BOOLEAN DEFAULT TRUE,
    can_manage_leads BOOLEAN DEFAULT TRUE,
    can_edit_dealer_settings BOOLEAN DEFAULT FALSE,
    can_access_billing BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(staff_id, dealer_id)
);

-- Enable RLS
ALTER TABLE public.dealer_staff ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_dealer_staff_dealer ON public.dealer_staff(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_staff_staff ON public.dealer_staff(staff_id);

-- ============================================================================
-- BUYER PREFERENCES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.buyer_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    alert_makes TEXT[],
    alert_models TEXT[],
    alert_min_price NUMERIC,
    alert_max_price NUMERIC,
    alert_min_year INTEGER,
    alert_max_year INTEGER,
    alert_body_types TEXT[],
    alert_fuel_types TEXT[],
    email_alerts_enabled BOOLEAN DEFAULT TRUE,
    push_alerts_enabled BOOLEAN DEFAULT FALSE,
    alert_frequency TEXT DEFAULT 'daily' CHECK (alert_frequency IN ('instant', 'daily', 'weekly')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.buyer_preferences ENABLE ROW LEVEL SECURITY;

-- Create index
CREATE INDEX IF NOT EXISTS idx_buyer_preferences_user ON public.buyer_preferences(user_id);

-- ============================================================================
-- SAVED LISTINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.saved_listings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, vehicle_id)
);

-- Enable RLS
ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_saved_listings_user ON public.saved_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_listings_vehicle ON public.saved_listings(vehicle_id);

-- ============================================================================
-- INSPECTOR PROFILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.inspector_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    certification_number TEXT,
    certification_authority TEXT,
    specializations TEXT[],
    years_experience INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES public.profiles(id),
    total_inspections INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.inspector_profiles ENABLE ROW LEVEL SECURITY;

-- Create index
CREATE INDEX IF NOT EXISTS idx_inspector_profiles_active ON public.inspector_profiles(is_active, is_verified);

-- ============================================================================
-- VEHICLE INSPECTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.vehicle_inspections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
    inspector_id UUID REFERENCES public.inspector_profiles(id) NOT NULL,
    inspection_date TIMESTAMPTZ DEFAULT NOW(),
    overall_condition TEXT,
    mechanical_rating INTEGER CHECK (mechanical_rating BETWEEN 1 AND 10),
    exterior_rating INTEGER CHECK (exterior_rating BETWEEN 1 AND 10),
    interior_rating INTEGER CHECK (interior_rating BETWEEN 1 AND 10),
    safety_rating INTEGER CHECK (safety_rating BETWEEN 1 AND 10),
    report_url TEXT,
    report_summary TEXT,
    issues_found TEXT[],
    recommendations TEXT[],
    estimated_repair_cost NUMERIC,
    is_verified BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.vehicle_inspections ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_vehicle ON public.vehicle_inspections(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_inspector ON public.vehicle_inspections(inspector_id);

-- ============================================================================
-- PREMIUM UPGRADES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.premium_upgrades (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    upgrade_type TEXT NOT NULL CHECK (upgrade_type IN ('featured', 'premium', 'spotlight', 'homepage_banner')),
    price_paid NUMERIC,
    payment_reference TEXT,
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    auto_renew BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.premium_upgrades ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_premium_upgrades_user ON public.premium_upgrades(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_upgrades_vehicle ON public.premium_upgrades(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_premium_upgrades_active ON public.premium_upgrades(is_active, expires_at);

-- ============================================================================
-- TRIGGERS FOR LISTING COUNT
-- ============================================================================

-- Function to update listing count
CREATE OR REPLACE FUNCTION update_listing_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.profiles
        SET listing_count = listing_count + 1
        WHERE id = NEW.seller_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.profiles
        SET listing_count = GREATEST(listing_count - 1, 0)
        WHERE id = OLD.seller_id;
    ELSIF TG_OP = 'UPDATE' THEN
        -- If status changed to/from active
        IF OLD.status = 'active' AND NEW.status != 'active' THEN
            UPDATE public.profiles
            SET listing_count = GREATEST(listing_count - 1, 0)
            WHERE id = OLD.seller_id;
        ELSIF OLD.status != 'active' AND NEW.status = 'active' THEN
            UPDATE public.profiles
            SET listing_count = listing_count + 1
            WHERE id = NEW.seller_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_listing_count ON public.vehicles;
CREATE TRIGGER trigger_update_listing_count
    AFTER INSERT OR UPDATE OR DELETE ON public.vehicles
    FOR EACH ROW
    EXECUTE FUNCTION update_listing_count();

-- ============================================================================
-- INITIALIZE LISTING COUNTS FOR EXISTING USERS
-- ============================================================================

UPDATE public.profiles
SET listing_count = (
    SELECT COUNT(*)
    FROM public.vehicles
    WHERE vehicles.seller_id = profiles.id
    AND vehicles.status = 'active'
)
WHERE listing_count = 0;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.dealer_profiles IS 'Business information for dealer accounts';
COMMENT ON TABLE public.dealer_staff IS 'Staff members associated with dealer accounts';
COMMENT ON TABLE public.buyer_preferences IS 'Buyer search alerts and notification preferences';
COMMENT ON TABLE public.saved_listings IS 'Vehicles saved/favorited by buyers';
COMMENT ON TABLE public.inspector_profiles IS 'Certified vehicle inspector information';
COMMENT ON TABLE public.vehicle_inspections IS 'Professional vehicle inspection reports';
COMMENT ON TABLE public.premium_upgrades IS 'Paid listing upgrades and featured placements';
