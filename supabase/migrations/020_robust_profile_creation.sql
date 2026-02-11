-- Migration: Robust Profile Creation and Metadata Sync
-- Description: Ensures handle_new_user is resilient to missing metadata and handles concurrent creation/updates.

-- 1. Improved handle_new_user with fallbacks and conflict safety
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    v_full_name TEXT;
    v_role user_role;
    v_email_prefix TEXT;
BEGIN
    -- Extract full name from metadata, fallback to email prefix if missing
    v_full_name := COALESCE(new.raw_user_meta_data->>'full_name', '');
    
    IF v_full_name = '' THEN
        v_email_prefix := split_part(new.email, '@', 1);
        v_full_name := COALESCE(v_email_prefix, 'User');
    END IF;

    -- Extract and validate role
    BEGIN
        v_role := (new.raw_user_meta_data->>'role')::user_role;
    EXCEPTION WHEN OTHERS THEN
        v_role := 'registered'::user_role;
    END;

    -- Insert or Update profile (Conflict safety for retries/email confirmation flow)
    INSERT INTO public.profiles (id, name, email, role)
    VALUES (
        new.id, 
        v_full_name, 
        new.email,
        v_role
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        updated_at = NOW();

    -- Ensure secondary profiles are created (Triggers trigger_sync_user_profiles)
    -- This handles the secondary tables dealer_profiles/inspector_profiles
    
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Repair Sync Function for Secondary Profiles (Robustness)
-- This ensures that even if called multiple times, it doesn't fail but maintains the record
CREATE OR REPLACE FUNCTION public.sync_user_profiles()
RETURNS trigger AS $$
BEGIN
    -- Handle Dealer role
    IF NEW.role = 'dealer' THEN
        INSERT INTO public.dealer_profiles (id, business_name)
        VALUES (NEW.id, COALESCE(NEW.name, NEW.email))
        ON CONFLICT (id) DO UPDATE
        SET business_name = COALESCE(public.dealer_profiles.business_name, NEW.name);
    END IF;

    -- Handle Inspector role
    IF NEW.role = 'inspector' THEN
        INSERT INTO public.inspector_profiles (id)
        VALUES (NEW.id)
        ON CONFLICT (id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Retroactive Fix for any orphaned profiles
-- Update existing profile names if they are empty
UPDATE public.profiles
SET name = split_part(email, '@', 1)
WHERE name IS NULL OR name = '';
