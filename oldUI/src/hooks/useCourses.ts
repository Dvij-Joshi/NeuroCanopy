import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useUser';

export interface Course {
  id: string;
  user_id: string;
  title: string;
  code: string;
  professor_name: string | null;
  credits: number;
  color_hex: string;
  icon_url: string | null;
  total_chapters: number;
  completed_chapters: number;
}

export interface Node {
  id: string;
  course_id: string;
  parent_id: string | null;
  title: string;
  status: 'Mastered' | 'Learning' | 'Weak' | 'New';
  difficulty_level: number;
  decay_prediction_date: string | null;
  estimated_hours: number;
}

export function useCourses() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['courses', user?.id],
    queryFn: async (): Promise<Course[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('user_id', user.id)
        .order('title');

      if (error) throw error;
      return (data || []) as Course[];
    },
    enabled: !!user,
  });
}

export function useAllNodes() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['all-nodes', user?.id],
    queryFn: async (): Promise<(Node & { courses: Course })[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('nodes')
        .select('*, courses!inner(*)')
        .eq('courses.user_id', user.id);

      if (error) throw error;
      return (data || []) as (Node & { courses: Course })[];
    },
    enabled: !!user,
  });
}

export function useUpdateNode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Node> }) => {
      const { data, error } = await supabase
        .from('nodes')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-nodes'] });
    },
  });
}
