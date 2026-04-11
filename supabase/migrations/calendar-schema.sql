-- Ensure profiles has all required fields for Quantum Calendar
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS wake_time TIME,
ADD COLUMN IF NOT EXISTS sleep_time TIME,
ADD COLUMN IF NOT EXISTS college_start_time TIME,
ADD COLUMN IF NOT EXISTS college_end_time TIME,
ADD COLUMN IF NOT EXISTS mess_timings JSONB, -- { breakfast: "08:00", lunch: "13:00", dinner: "20:00" }
ADD COLUMN IF NOT EXISTS focus_duration NUMERIC DEFAULT 60,
ADD COLUMN IF NOT EXISTS commute_duration NUMERIC DEFAULT 30,
ADD COLUMN IF NOT EXISTS chronotype TEXT DEFAULT 'morning', -- 'morning' or 'night'
ADD COLUMN IF NOT EXISTS next_exam_date DATE,
ADD COLUMN IF NOT EXISTS lifestyle_activities JSONB; -- [{ activity: "Gym", time: "18:00" }]

-- Create schedule_events table (Step 6 & 7)
CREATE TABLE IF NOT EXISTS public.schedule_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('ROUTINE', 'FOCUS', 'VIVA', 'BREAK', 'ADMIN', 'LEISURE')),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS policies for schedule_events
ALTER TABLE public.schedule_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own schedule events." 
ON public.schedule_events FOR ALL 
USING (auth.uid() = user_id);
