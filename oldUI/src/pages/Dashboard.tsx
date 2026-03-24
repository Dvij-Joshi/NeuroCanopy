import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  Brain,
  Clock,
  Target,
  Zap,
  BookOpen,
  Calendar,
  Trophy,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getCourses, getVivaSessions } from "@/lib/db";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    conceptsMastered: 0,
    totalStudyHours: 0,
    averageVivaScore: 0,
    vivaSessionsCount: 0,
    currentStreak: 0,
  });
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false); // To track if we should show empty state vs 0 stats

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        setLoading(true);

        // 1. Fetch User Profile for Streak & Stats
        const { data: userData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        // 2. Fetch Courses to count "Concepts Mastered" (e.g. completed chapters or derived)
        // For V1, let's sum 'completedChapters'
        const courses = await getCourses(user.id);
        const totalCompletedChapters = courses.reduce((acc, course) => acc + (course.completedChapters || 0), 0);
        const hasCourses = courses.length > 0;

        // 3. Fetch Viva Sessions for Average Score
        const vivas = await getVivaSessions(user.id);
        const totalScore = vivas.reduce((acc, viva) => acc + (viva.score || 0), 0);
        const avgScore = vivas.length > 0 ? Math.round(totalScore / vivas.length) : 0;

        setStats({
          conceptsMastered: totalCompletedChapters, // Simplified proxy for "Concepts"
          totalStudyHours: userData?.total_study_hours || 0, // Assuming column exists
          averageVivaScore: avgScore,
          vivaSessionsCount: vivas.length,
          currentStreak: userData?.gamification?.streak?.current || 0,
        });

        setHasData(hasCourses || vivas.length > 0 || !!userData);
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-3xl md:text-4xl font-display font-bold">
              Good Morning, <span className="text-gradient-primary">{user?.user_metadata?.full_name?.split(" ")[0] || "Scholar"}</span>
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Ready to expand your neural network today?
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden md:flex gap-3"
          >
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Schedule
            </Button>
            <Button variant="hero" className="gap-2">
              <Zap className="h-4 w-4" />
              Quick Start
            </Button>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Concepts Mastered"
            value={stats.conceptsMastered.toString()}
            icon={Brain}
            trend="+12 this week"
            delay={0.1}
          />
          <StatCard
            title="Study Hours"
            value={stats.totalStudyHours.toFixed(1)}
            icon={Clock}
            trend="+4.5 vs last week"
            delay={0.2}
          />
          <StatCard
            title="Avg Viva Score"
            value={`${stats.averageVivaScore}%`}
            icon={Target}
            trend="Top 5% of class"
            delay={0.3}
          />
          <StatCard
            title="Current Streak"
            value={`${stats.currentStreak} Days`}
            icon={Zap}
            trend="Keep it up!"
            delay={0.4}
          />
        </div>

        {/* Main Content Area */}
        <div className="grid lg:grid-cols-[1fr_350px] gap-6">
          <div className="space-y-6">
            {/* Recent Activity / Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-display font-bold">Focus Areas</h2>
                </div>
                <Button variant="ghost" size="sm" className="text-muted-foreground">View All</Button>
              </div>

              {!hasData ? (
                <div className="text-center py-10 text-muted-foreground">
                  <p>No study data yet. Start by adding a course in the Syllabus!</p>
                  <Button variant="outline" className="mt-4" asChild>
                    <a href="/syllabus">Go to Syllabus</a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Placeholder for Focus Areas - would be dynamic in next iteration */}
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50 hover:border-primary/50 transition-colors group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className={`h-2 w-2 rounded-full ${i === 1 ? 'bg-red-500' : i === 2 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        <div>
                          <h3 className="font-semibold group-hover:text-primary transition-colors">Quantum Mechanics - Wave Functions</h3>
                          <p className="text-xs text-muted-foreground">Physics • Last reviewed 2 days ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{60 + i * 10}% Retention</div>
                          <div className="text-xs text-muted-foreground">High Decay</div>
                        </div>
                        <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          <div className="space-y-6">
            {/* Weekly Goal - Simplified */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="h-5 w-5 text-primary" />
                <h3 className="font-display font-bold">Weekly Goal</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>12 / 20 hours</span>
                  <span className="text-primary">60%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "60%" }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
