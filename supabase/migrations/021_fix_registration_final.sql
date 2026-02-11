-- Migration: Final Harden Registration and Profile Sync
-- Description: Consolidates and hardens triggers for reliable user onboarding across all roles.

-- 1. Drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS trigger_sync_user_profiles ON public.profiles;

-- 2. Hardened handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

    -- Robust role extraction with double-wrapped validation
    BEGIN
        v_role := (new.raw_user_meta_data->>'role')::user_role;
    EXCEPTION WHEN OTHERS THEN
        v_role := 'registered'::user_role;
    END;
    
    -- Final safety check for null role
    IF v_role IS NULL THEN
        v_role := 'registered'::user_role;
    END IF;

    -- Consistent Profile Creation (Conflict safety is CRITICAL)
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

    RETURN new;
END;
$$;

-- 3. Hardened sync_user_profiles function
CREATE OR REPLACE FUNCTION public.sync_user_profiles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Handle Dealer role: Ensure entry exists in dealer_profiles
    IF NEW.role = 'dealer' THEN
        INSERT INTO public.dealer_profiles (id, business_name)
        VALUES (NEW.id, COALESCE(NEW.name, NEW.email))
        ON CONFLICT (id) DO UPDATE
        SET business_name = COALESCE(public.dealer_profiles.business_name, NEW.name);
    END IF;

    -- Handle Inspector role: Ensure entry exists in inspector_profiles
    IF NEW.role = 'inspector' THEN
        INSERT INTO public.inspector_profiles (id)
        VALUES (NEW.id)
        ON CONFLICT (id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$;

-- 4. Re-establish triggers
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER trigger_sync_user_profiles
    AFTER INSERT OR UPDATE OF role ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_user_profiles();

-- 5. Force sync for any existing users with missing role-specific profiles
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id, name, email, role FROM public.profiles WHERE role IN ('dealer', 'inspector')
    LOOP
        IF r.role = 'dealer' THEN
            INSERT INTO public.dealer_profiles (id, business_name)
            VALUES (r.id, COALESCE(r.name, r.email))
            ON CONFLICT (id) DO NOTHING;
        ELSIF r.role = 'inspector' THEN
            INSERT INTO public.inspector_profiles (id)
            VALUES (r.id)
            ON CONFLICT (id) DO NOTHING;
        END IF;
    END LOOP;
END $$;
