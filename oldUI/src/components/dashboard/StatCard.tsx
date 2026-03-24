import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: any;
  trend?: string; // Simplifies trend to just a string
  variant?: "default" | "primary" | "secondary" | "success" | "warning";
  delay?: number;
}

const variantStyles = {
  default: "bg-card border-border/50",
  primary: "bg-primary/10 border-primary/30",
  success: "bg-emerald-500/10 border-emerald-500/30",
  warning: "bg-amber-500/10 border-amber-500/30",
  danger: "bg-rose-500/10 border-rose-500/30",
};

const iconStyles = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary/20 text-primary",
  success: "bg-emerald-500/20 text-emerald-500",
  warning: "bg-amber-500/20 text-amber-500",
  danger: "bg-rose-500/20 text-rose-500",
};

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  delay = 0,
}: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "rounded-2xl border p-5 backdrop-blur-sm",
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-bold font-display">{value}</h3>
            {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
          </div>
        </div>
        <div className={`p-2 rounded-xl bg-primary/10`}>
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          <span className="text-emerald-500 font-medium flex items-center">
            {trend}
          </span>
        </div>
      )}
    </motion.div >
  );
};
