import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useUser';

export function useAchievements() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['achievements', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: allAchievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('name');

      if (achievementsError) throw achievementsError;

      const { data: userAchievements, error: userAchievementsError } = await supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at')
        .eq('user_id', user.id);

      if (userAchievementsError) throw userAchievementsError;

      const unlockedIds = new Set((userAchievements || []).map((ua: any) => ua.achievement_id));

      return (allAchievements || []).map((a: any) => ({
        ...a,
        unlocked: unlockedIds.has(a.id),
        unlockedAt: (userAchievements || []).find((ua: any) => ua.achievement_id === a.id)?.unlocked_at,
      }));
    },
    enabled: !!user,
  });
}
