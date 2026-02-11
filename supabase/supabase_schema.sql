-- AutoLot Supabase PostgreSQL Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Custom Types (Enums)
CREATE TYPE user_role AS ENUM ('guest', 'registered', 'verified', 'dealer', 'moderator', 'admin');
CREATE TYPE vehicle_condition AS ENUM ('Excellent', 'Very Good', 'Good', 'Fair', 'Poor');
CREATE TYPE title_status AS ENUM ('Clean', 'Salvage', 'Rebuilt');
CREATE TYPE accident_history AS ENUM ('None', 'Minor', 'Moderate', 'Major');
CREATE TYPE listing_status AS ENUM ('active', 'pending', 'sold', 'archived');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'negotiating', 'sold', 'lost');
CREATE TYPE content_status AS ENUM ('draft', 'published');

-- 2. Profiles Table (Linked to Supabase Auth)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    role user_role DEFAULT 'registered',
    reputation_score INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Vehicles Table
CREATE TABLE public.vehicles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INT NOT NULL,
    trim TEXT,
    price DECIMAL(12, 2) NOT NULL,
    mileage INT NOT NULL,
    "condition" vehicle_condition DEFAULT 'Good',
    body_type TEXT,
    fuel_type TEXT,
    transmission TEXT,
    drivetrain TEXT,
    exterior_color TEXT,
    interior_color TEXT,
    vin TEXT UNIQUE,
    images TEXT[], -- Array of image URLs (Supabase Storage)
    description TEXT,
    features TEXT[], -- Array of features
    title_status title_status DEFAULT 'Clean',
    accidents accident_history DEFAULT 'None',
    contact_method TEXT DEFAULT 'In-built Messenger',
    pricing_strategy TEXT DEFAULT 'Negotiable',
    show_phone BOOLEAN DEFAULT FALSE,
    seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status listing_status DEFAULT 'active',
    is_featured BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Messages (Leads)
CREATE TABLE public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Sender
    message TEXT NOT NULL,
    status lead_status DEFAULT 'new',
    dealer_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Car Stories
CREATE TABLE public.car_stories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    status content_status DEFAULT 'published',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Watchlist
CREATE TABLE public.watchlists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, vehicle_id)
);

-- 7. RLS (Row Level Security) Settings
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;

-- 8. Functions & Triggers
-- Automatically handle profil creation on Auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
