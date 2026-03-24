import { motion } from "framer-motion";
import { Calendar, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const exams = [
  {
    id: 1,
    subject: "Advanced Physics",
    date: "Jan 15, 2026",
    daysLeft: 11,
    readiness: 78,
    status: "on-track",
  },
  {
    id: 2,
    subject: "Organic Chemistry",
    date: "Jan 18, 2026",
    daysLeft: 14,
    readiness: 45,
    status: "at-risk",
  },
  {
    id: 3,
    subject: "Calculus II",
    date: "Jan 22, 2026",
    daysLeft: 18,
    readiness: 92,
    status: "ready",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "ready":
      return "text-emerald-500 bg-emerald-500/10";
    case "on-track":
      return "text-primary bg-primary/10";
    case "at-risk":
      return "text-amber-500 bg-amber-500/10";
    default:
      return "text-muted-foreground bg-muted";
  }
};

const getProgressColor = (readiness: number) => {
  if (readiness >= 80) return "bg-emerald-500";
  if (readiness >= 60) return "bg-primary";
  return "bg-amber-500";
};

export const UpcomingExams = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-semibold text-lg">Upcoming Exams</h3>
          <p className="text-sm text-muted-foreground">
            Your exam readiness overview
          </p>
        </div>
        <Button variant="ghost" size="sm">
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {exams.map((exam, index) => (
          <motion.div
            key={exam.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
            className="rounded-xl border border-border/50 bg-background/50 p-4 hover:bg-accent/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium">{exam.subject}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {exam.date}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {exam.daysLeft} days left
                  </span>
                </div>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                  getStatusColor(exam.status)
                )}
              >
                {exam.status === "at-risk" ? (
                  <AlertTriangle className="h-3 w-3" />
                ) : (
                  <CheckCircle className="h-3 w-3" />
                )}
                {exam.status.replace("-", " ")}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Readiness</span>
                <span className="font-medium">{exam.readiness}%</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${exam.readiness}%` }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                  className={cn("h-full rounded-full", getProgressColor(exam.readiness))}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
