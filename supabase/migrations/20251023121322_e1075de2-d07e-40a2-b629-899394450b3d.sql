-- Create matches table to store uploaded match data
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  game_type TEXT NOT NULL,
  match_date TIMESTAMPTZ,
  file_name TEXT NOT NULL,
  raw_data JSONB NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'analyzed', 'failed'))
);

-- Enable RLS
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for matches
CREATE POLICY "Users can view their own matches"
  ON public.matches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own matches"
  ON public.matches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own matches"
  ON public.matches FOR DELETE
  USING (auth.uid() = user_id);

-- Create analytics table to store AI-generated insights
CREATE TABLE IF NOT EXISTS public.analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  ai_summary TEXT,
  key_mistakes JSONB,
  improvement_tips JSONB,
  strategic_plan JSONB,
  performance_score NUMERIC(3,1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analytics
CREATE POLICY "Users can view their own analytics"
  ON public.analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics"
  ON public.analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create profiles table for user data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  role TEXT DEFAULT 'player' CHECK (role IN ('player', 'analyst')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Profiles are publicly viewable"
  ON public.profiles FOR SELECT
  USING (true);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for match files
INSERT INTO storage.buckets (id, name, public)
VALUES ('match-files', 'match-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload their own match files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'match-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own match files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'match-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own match files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'match-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS matches_user_id_idx ON public.matches(user_id);
CREATE INDEX IF NOT EXISTS matches_uploaded_at_idx ON public.matches(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS analytics_match_id_idx ON public.analytics(match_id);
CREATE INDEX IF NOT EXISTS analytics_user_id_idx ON public.analytics(user_id);