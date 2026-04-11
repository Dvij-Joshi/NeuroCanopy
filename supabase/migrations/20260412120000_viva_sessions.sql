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

CREATE POLICY "Users can manage their own viva sessions."
ON public.viva_sessions FOR ALL
USING (auth.uid() = user_id);