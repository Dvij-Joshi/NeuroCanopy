import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useUser';

export interface Material {
  id: string;
  user_id: string;
  course_id: string;
  file_url: string;
  type: 'Syllabus' | 'Past_Paper' | 'Notes' | 'Timetable';
}

export function useMaterials(courseId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['materials', user?.id, courseId],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('materials')
        .select('*, courses(*)')
        .eq('user_id', user.id);

      if (courseId) {
        query = query.eq('course_id', courseId);
      }

      const { data, error } = await query.order('type');

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useUploadMaterial() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      file,
      courseId,
      type,
    }: {
      file: File;
      courseId: string;
      type: Material['type'];
    }) => {
      if (!user) throw new Error('Not authenticated');

      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('materials')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('materials')
        .getPublicUrl(filePath);

      const { data, error } = await supabase
        .from('materials')
        .insert({
          user_id: user.id,
          course_id: courseId,
          file_url: urlData.publicUrl,
          type,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });
}
