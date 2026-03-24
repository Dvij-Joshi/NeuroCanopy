import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useUser';
import { format, startOfDay, endOfDay } from 'date-fns';

export interface Schedule {
  id: string;
  user_id: string;
  title: string;
  start_time: string;
  end_time: string;
  category: 'Study' | 'Class' | 'Hostel' | 'Tuition' | 'Exam' | 'Gym' | 'Other';
  source: 'Manual' | 'WhatsApp' | 'PDF_Parse';
  course_id: string | null;
  completed: boolean;
}

export interface WeeklyTemplate {
  id: string;
  user_id: string;
  title: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  category: 'Study' | 'Class' | 'Hostel' | 'Tuition' | 'Exam' | 'Gym' | 'Other';
  energy_cost: 'Low' | 'Medium' | 'High';
}

export function useMergedSchedule(date: Date) {
  const { user } = useAuth();
  const dayOfWeek = date.getDay();

  return useQuery({
    queryKey: ['merged-schedule', user?.id, format(date, 'yyyy-MM-dd')],
    queryFn: async () => {
      if (!user) return [];

      const startOfDayStr = startOfDay(date).toISOString();
      const endOfDayStr = endOfDay(date).toISOString();

      const [schedulesResult, templatesResult] = await Promise.all([
        supabase
          .from('schedules')
          .select('*, courses(*)')
          .eq('user_id', user.id)
          .gte('start_time', startOfDayStr)
          .lte('start_time', endOfDayStr)
          .order('start_time'),
        supabase
          .from('weekly_templates')
          .select('*')
          .eq('user_id', user.id)
          .eq('day_of_week', dayOfWeek)
          .order('start_time'),
      ]);

      if (schedulesResult.error) throw schedulesResult.error;
      if (templatesResult.error) throw templatesResult.error;

      const schedules = (schedulesResult.data || []).map((s: any) => ({
        ...s,
        isTemplate: false,
        displayTime: format(new Date(s.start_time), 'HH:mm'),
      }));

      const templates = (templatesResult.data || []).map((t: any) => ({
        id: t.id,
        title: t.title,
        category: t.category,
        start_time: t.start_time,
        end_time: t.end_time,
        completed: false,
        isTemplate: true,
        displayTime: t.start_time,
        energy_cost: t.energy_cost,
      }));

      return [...schedules, ...templates].sort((a, b) => 
        a.displayTime.localeCompare(b.displayTime)
      );
    },
    enabled: !!user,
  });
}

export function useAddSchedule() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (schedule: Omit<Schedule, 'id' | 'user_id'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('schedules')
        .insert({ ...schedule, user_id: user.id } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merged-schedule'] });
    },
  });
}

export function useToggleScheduleComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { data, error } = await supabase
        .from('schedules')
        .update({ completed } as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merged-schedule'] });
    },
  });
}
