import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  level: number;
  current_xp: number;
  next_level_xp: number;
  elo_rating: number;
  total_study_hours: number;
  concepts_mastered: number;
  viva_sessions_count: number;
  average_viva_score: number;
  current_streak: number;
  best_streak: number;
  punishment_end_time: string | null;
  is_social_media_blocked: boolean;
  daily_study_goal_hours: number;
  decay_alerts_enabled: boolean;
  review_algorithm: 'SM-2' | 'Anki' | 'Linear';
  major: string | null;
  university: string | null;
  academic_year: string | null;
  weekly_reviews_goal: number;
  monthly_vivas_goal: number;
  chronotype: 'Early_Bird' | 'Night_Owl' | 'Standard';
  wake_time: string;
  sleep_time: string;
  min_attendance_percent: number;
  daily_chore_buffer_minutes: number;
  daily_commute_minutes: number;
  focus_duration_minutes: number;
  learning_style: 'Visual' | 'Text' | 'Active';
  next_exam_date: string | null;
  whitelisted_apps: string[] | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}

export function useProfile() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async (): Promise<Profile | null> => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates as any)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
