-- Create articles table for custom stories
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  category TEXT DEFAULT 'Editorial',
  author_id UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  read_time_minutes INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Public can read published articles') THEN
  ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Public can read published articles" 
  ON public.articles FOR SELECT 
  USING (status = 'published');
END IF;

-- RPC to get latest editorial articles
CREATE OR REPLACE FUNCTION public.get_latest_articles(p_limit integer DEFAULT 6, p_category text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_agg(r)
  INTO result
  FROM (
    SELECT 
      a.*,
      p.name as author_name,
      p.avatar_url as author_avatar
    FROM public.articles a
    LEFT JOIN public.profiles p ON a.author_id = p.id
    WHERE a.status = 'published'
      AND (p_category IS NULL OR a.category = p_category)
    ORDER BY a.created_at DESC
    LIMIT p_limit
  ) r;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- Seed with high-quality diverse stories
DELETE FROM public.articles WHERE slug IN (
  'ev-luxury-renaissance', 'classic-car-restoration-digital', 'nurburgring-chronicles',
  'porsche-911-st-review', 'future-of-solid-state-batteries', 'v12-engines-heritage',
  'bmw-m5-touring-2025', 'audi-quattro-rally-history', 'mercedes-eqs-tech-deep-dive',
  'ferrari-f40-market-watch'
);

INSERT INTO public.articles (title, slug, excerpt, content, featured_image, read_time_minutes, category)
VALUES 
('The Silent Renaissance: How EV Luxury is Redefining Comfort', 'ev-luxury-renaissance', 'Exploring the intersection of high-tier craftsmanship and electric powertrain silent performance.', '...', 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=2071', 6, 'Editorial'),
('Classic Car Restoration in the Digital Age', 'classic-car-restoration-digital', 'How 3D printing and modern CAD are saving the heritage of automotive history.', '...', 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=2070', 8, 'History'),
('Nürburgring Chronicles: Behind the Scenes of Record Attempts', 'nurburgring-chronicles', 'What it really takes for manufacturers to shave milliseconds off the Green Hell.', '...', 'https://images.unsplash.com/photo-1541139522100-348633c70669?auto=format&fit=crop&q=80&w=2070', 10, 'Performance'),
('Review: The Porsche 911 S/T is Pure Driving Nirvana', 'porsche-911-st-review', 'Combining the GT3 RS engine with a manual gearbox and no wings. Is this the best 911 ever?', '...', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=2070', 7, 'Review'),
('Solid State: The Battery Tech That Changes Everything', 'future-of-solid-state-batteries', 'Toyota and Samsung are racing to deliver 1000km range and 10-minute charging.', '...', 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=2072', 5, 'Tech'),
('Requiem for the V12: A Legacy of Fire and Sound', 'v12-engines-heritage', 'As emission laws tighten, we look back at the most iconic twelve-cylinder engines in history.', '...', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=2070', 12, 'History'),
('First Look: The 2025 BMW M5 Touring Returns', 'bmw-m5-touring-2025', 'The practical monster is back with a hybrid V8 and over 700 horsepower.', '...', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=2070', 4, 'Review'),
('Spirit of Rally: The Legend of the Audi Quattro', 'audi-quattro-rally-history', 'How one all-wheel drive system changed the face of motorsport forever.', '...', 'https://images.unsplash.com/photo-1542228229-7d8bc956c981?auto=format&fit=crop&q=80&w=2070', 9, 'History'),
('Inside the MBUX Hyperscreen: Future of Cockpit Design', 'mercedes-eqs-tech-deep-dive', 'Diving deep into the AI-driven interface of the modern Mercedes luxury lineup.', '...', 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=2070', 6, 'Tech'),
('Market Watch: Why the Ferrari F40 is a $3M Asset', 'ferrari-f40-market-watch', 'Tracking the explosive growth of analog supercars in the high-end collector market.', '...', 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&q=80&w=2070', 8, 'Performance');
