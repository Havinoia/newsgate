-- Create news_source table
CREATE TABLE IF NOT EXISTS public.news_source (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    icon_url TEXT
);

-- Create news_article table
CREATE TABLE IF NOT EXISTS public.news_article (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content TEXT,
    source_url TEXT UNIQUE NOT NULL,
    image_url TEXT,
    category TEXT,
    source_id UUID REFERENCES public.news_source(id),
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sentiment_score INTEGER
);

-- Setup Row Level Security (RLS)
-- For public read access (if you want frontend to read directly from Supabase without auth)
ALTER TABLE public.news_source ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_article ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users on news_source"
ON public.news_source FOR SELECT
TO public
USING (true);

CREATE POLICY "Enable read access for all users on news_article"
ON public.news_article FOR SELECT
TO public
USING (true);
