import { motion } from "framer-motion";
import { CheckCircle, Brain, Mic, BookOpen, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data - will be replaced with real data later
const mockActivities = [
  { id: "1", type: "review", title: "Reviewed Quantum Mechanics", time: "2 hours ago", icon: Brain },
  { id: "2", type: "viva", title: "Completed Physics Viva", time: "4 hours ago", score: "92%", icon: Mic },
  { id: "3", type: "study", title: "Studied Organic Chemistry", time: "Yesterday", icon: BookOpen },
  { id: "4", type: "completed", title: "Mastered Calculus", time: "2 days ago", icon: CheckCircle },
];

const iconStyles = {
  review: "bg-primary/20 text-primary",
  viva: "bg-purple-500/20 text-purple-500",
  study: "bg-blue-500/20 text-blue-500",
  completed: "bg-emerald-500/20 text-emerald-500",
};

export const RecentActivity = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-lg">Recent Activity</h3>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Last 7 days
        </span>
      </div>

      <div className="space-y-3">
        {mockActivities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.6 + index * 0.05 }}
              className="flex items-center gap-3 py-2"
            >
              <div
                className={cn(
                  "rounded-lg p-2",
                  iconStyles[activity.type as keyof typeof iconStyles]
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{activity.title}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
              {activity.score && (
                <span className="text-sm font-medium text-emerald-500">
                  {activity.score}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
