-- Copy and run this script in your Supabase Dashboard SQL Editor (SQL Editor -> New Query -> Run)

-- 1. Create the custom Profiles table to store user settings from Registration
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  
  -- Identity/Cognitive
  energy_pattern TEXT,
  max_focus TEXT,
  
  -- Bio-Rhythms & Logistics
  living_status TEXT,
  daily_admin_buffer INTEGER,
  commute_duration INTEGER,
  chores_errands INTEGER,
  social_leisure INTEGER,
  
  -- Academics
  college_start TEXT,
  college_end TEXT,
  weekend_college_start TEXT,
  weekend_college_end TEXT,
  
  -- Arrays for grouped data
  subjects TEXT[],
  lifestyle_anchors TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Turn on Row Level Security (RLS) so only the owner can read/write their data
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING ( auth.uid() = id );

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK ( auth.uid() = id );

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING ( auth.uid() = id );

-- 4. Enable Realtime (optional, good for live updates on the dashboard)
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- 5. Auto-trigger: Automatically create a profile row when a user authenticates for the first time
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

CREATE TABLE IF NOT EXISTS public.viva_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    base_topic TEXT NOT NULL,
    difficulty TEXT,
    question TEXT NOT NULL,
    transcript TEXT,
    pronunciation NUMERIC,
    fluency NUMERIC,
    completeness NUMERIC,
    accuracy NUMERIC,
    prosody NUMERIC,
    wpm NUMERIC,
    answer_score NUMERIC,
    confidence TEXT,
    feedback TEXT,
    strengths JSONB,
    improvements JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.viva_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own viva sessions." ON public.viva_sessions FOR ALL USING (auth.uid() = user_id);
