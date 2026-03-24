import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useUser';

export function useVivaSessions(limit = 10) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['viva-sessions', user?.id, limit],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('viva_sessions')
        .select('*, courses(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useVivaStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['viva-stats', user?.id],
    queryFn: async () => {
      if (!user) return {
        totalSessions: 0,
        averageScore: 0,
        totalTime: 0,
        bestSubject: 'N/A',
        recentScores: [],
      };

      const { data, error } = await supabase
        .from('viva_sessions')
        .select('score, duration_seconds, created_at, courses(title)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;

      if (!data || data.length === 0) {
        return {
          totalSessions: 0,
          averageScore: 0,
          totalTime: 0,
          bestSubject: 'N/A',
          recentScores: [],
        };
      }

      const totalSessions = data.length;
      const averageScore = Math.round(data.reduce((acc, s: any) => acc + s.score, 0) / totalSessions);
      const totalTime = data.reduce((acc, s: any) => acc + s.duration_seconds, 0);

      const subjectScores: Record<string, { total: number; count: number }> = {};
      data.forEach((s: any) => {
        const title = s.courses?.title || 'Unknown';
        if (!subjectScores[title]) {
          subjectScores[title] = { total: 0, count: 0 };
        }
        subjectScores[title].total += s.score;
        subjectScores[title].count += 1;
      });

      let bestSubject = 'N/A';
      let bestAvg = 0;
      Object.entries(subjectScores).forEach(([subject, { total, count }]) => {
        const avg = total / count;
        if (avg > bestAvg) {
          bestAvg = avg;
          bestSubject = subject;
        }
      });

      return {
        totalSessions,
        averageScore,
        totalTime: Math.round(totalTime / 60),
        bestSubject,
        recentScores: data.map((s: any) => ({
          score: s.score,
          date: s.created_at,
          subject: s.courses?.title || 'Unknown',
        })),
      };
    },
    enabled: !!user,
  });
}
