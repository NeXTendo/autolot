-- Migration: Fix Multi-Role Registration and Sync
-- Description: Improve handle_new_user and add profile sync triggers

-- 1. Update handle_new_user to capture role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.email,
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'registered'::user_role)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create profile sync function to handle secondary profiles
CREATE OR REPLACE FUNCTION public.sync_user_profiles()
RETURNS trigger AS $$
BEGIN
    -- Handle Dealer role
    IF NEW.role = 'dealer' THEN
        INSERT INTO public.dealer_profiles (id, business_name)
        VALUES (NEW.id, COALESCE(NEW.name, NEW.email))
        ON CONFLICT (id) DO NOTHING;
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

-- 3. Create trigger for profile synchronization
DROP TRIGGER IF EXISTS trigger_sync_user_profiles ON public.profiles;
CREATE TRIGGER trigger_sync_user_profiles
    AFTER INSERT OR UPDATE OF role ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_user_profiles();

-- 4. Retroactively create profiles for existing users if role matches
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
