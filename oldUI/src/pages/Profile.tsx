import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Mail,
  GraduationCap,
  Calendar,
  Award,
  Target,
  TrendingUp,
  Clock,
  BookOpen,
  Brain,
  Star,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const mockAchievements = [
  { id: "1", name: "First Steps", required_logic: "Complete 1 viva", unlocked: true },
  { id: "2", name: "Study Streak", required_logic: "7 day streak", unlocked: true },
  { id: "3", name: "Knowledge Master", required_logic: "100 concepts", unlocked: true },
  { id: "4", name: "Viva Champion", required_logic: "Score 95%+", unlocked: false },
  { id: "5", name: "Marathon Runner", required_logic: "30 day streak", unlocked: false },
  { id: "6", name: "Top Scholar", required_logic: "Level 20", unlocked: false },
];

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data) {
          setProfileData({
            profile: {
              fullName: data.full_name,
              university: data.university,
              major: data.major,
              academicYear: data.academic_year,
              avatarUrl: data.avatar_url,
              email: data.email
            },
            gamification: data.gamification || { level: 1, current_xp: 0, streak: { current: 0, best: 0 } },
            cognitive_profile: {
              chronotype: data.chronotype,
              focusDuration: data.focus_duration
            },
            academics_config: {
              nextExamDate: data.next_exam_date
            }
          });
        } else {
          // Fallback: use auth metadata if profile row not found yet
          setProfileData({
            profile: {
              fullName: user.user_metadata?.full_name ?? "User",
              university: user.user_metadata?.university ?? "",
              major: user.user_metadata?.major ?? "",
              academicYear: user.user_metadata?.academic_year ?? "",
              avatarUrl: null,
              email: user.email
            },
            gamification: { level: 1, current_xp: 0, streak: { current: 0, best: 0 } },
            cognitive_profile: { chronotype: null, focusDuration: null },
            academics_config: { nextExamDate: null }
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, authLoading]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profileData) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <h2 className="text-xl">Profile not found</h2>
        </div>
      </DashboardLayout>
    );
  }

  const { profile, gamification, cognitive_profile, academics_config } = profileData;

  const stats = [
    { label: "Study Hours", value: `${profileData.total_study_hours ?? 0}`, icon: Clock, trend: "Tracked automatically" },
    { label: "Concepts Mastered", value: `${gamification?.concepts_mastered ?? 0}`, icon: Brain, trend: "From Knowledge Tree" },
    { label: "Viva Sessions", value: `${gamification?.viva_count ?? 0}`, icon: Star, trend: `${gamification?.viva_avg_score ?? 0}% avg score` },
    { label: "Current Streak", value: `${gamification?.streak?.current ?? 0} days`, icon: TrendingUp, trend: `Best: ${gamification?.streak?.best ?? 0} days` },
  ];

  const getInitials = (name: string) => {
    return name ? name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "??";
  };

  const unlockedCount = mockAchievements.filter(a => a.unlocked).length;

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-display font-bold">Profile</h1>
          <p className="text-muted-foreground mt-1">View and manage your account</p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6"
            >
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.avatarUrl} />
                  <AvatarFallback className="text-2xl">{getInitials(profile?.fullName)}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-display font-bold">{profile?.fullName}</h2>
                      <p className="text-muted-foreground">{profile?.major}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href="/settings">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </a>
                    </Button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{profile?.university}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span>{profile?.academicYear}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>ELO: {1450}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>{cognitive_profile?.chronotype}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-display font-bold mt-1">{stat.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
                      </div>
                      <div className="rounded-lg bg-primary/20 p-2">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-lg">Achievements</h3>
                <Badge variant="outline">
                  {unlockedCount}/{mockAchievements.length} Unlocked
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {mockAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className={cn(
                      "rounded-xl border p-4 text-center transition-all",
                      achievement.unlocked
                        ? "border-primary/30 bg-primary/5"
                        : "border-border/50 bg-muted/30 opacity-50"
                    )}
                  >
                    <span className="text-3xl">🏆</span>
                    <h4 className="font-medium text-sm mt-2">{achievement.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{achievement.required_logic}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Level Progress */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6"
            >
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/50 text-2xl font-bold text-primary-foreground mb-2">
                  {gamification?.level || 1}
                </div>
                <h3 className="font-display font-semibold">Level {gamification?.level || 1}</h3>
                <p className="text-sm text-muted-foreground">Knowledge Explorer</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Next Level</span>
                  <span className="font-medium">{gamification?.current_xp || 0} / 3000 XP</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((gamification?.current_xp || 0) / 3000) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {3000 - (gamification?.current_xp || 0)} XP to Level {(gamification?.level || 1) + 1}
                </p>
              </div>
            </motion.div>

            {/* Learning Goals */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6"
            >
              <h3 className="font-display font-semibold mb-4">Learning Goals</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Daily Study Goal</span>
                    <span className="font-medium">4 hrs</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: "75%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Weekly Reviews</span>
                    <span className="font-medium">25</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: "60%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Monthly Vivas</span>
                    <span className="font-medium">10</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-amber-500" style={{ width: "80%" }} />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <Button variant="outline" className="w-full justify-start">
                <Award className="h-4 w-4 mr-2" />
                View All Achievements
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/settings">
                  <Target className="h-4 w-4 mr-2" />
                  Set New Goals
                </a>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
