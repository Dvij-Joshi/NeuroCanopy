import { motion } from "framer-motion";
import { Flame, TrendingUp } from "lucide-react";

const weekDays = ["M", "T", "W", "T", "F", "S", "S"];

// Mock data - will be replaced with real data later
const mockStreak = {
  current_streak: 5,
  best_streak: 14,
};

export const StudyStreak = () => {
  const streak = mockStreak.current_streak;
  const streakData = weekDays.map((_, index) => index < Math.min(streak, 7));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-orange-500/20 p-3">
            <Flame className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current Streak</p>
            <p className="text-2xl font-display font-bold">{mockStreak.current_streak} Days</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 text-emerald-500">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">Best: {mockStreak.best_streak}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        {weekDays.map((day, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
              className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                streakData[index]
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {streakData[index] ? (
                <Flame className="h-4 w-4" />
              ) : (
                <span className="text-xs">—</span>
              )}
            </motion.div>
            <span className="text-xs text-muted-foreground">{day}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
