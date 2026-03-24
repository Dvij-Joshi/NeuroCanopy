import { motion } from "framer-motion";
import { Zap, Brain, Calendar, Mic, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const actions = [
  {
    title: "Start Pruning",
    description: "Review decaying concepts",
    icon: Zap,
    href: "/knowledge-tree",
    variant: "primary" as const,
  },
  {
    title: "Practice Viva",
    description: "AI-powered mock exam",
    icon: Mic,
    href: "/viva",
    variant: "secondary" as const,
  },
  {
    title: "Study Session",
    description: "Follow today's schedule",
    icon: Calendar,
    href: "/schedule",
    variant: "secondary" as const,
  },
  {
    title: "Explore Tree",
    description: "View knowledge map",
    icon: Brain,
    href: "/knowledge-tree",
    variant: "secondary" as const,
  },
];

const variantStyles = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-card border border-border/50 hover:bg-accent/50",
};

export const QuickActions = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6"
    >
      <h3 className="font-display font-semibold text-lg mb-4">Quick Actions</h3>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
            >
              <Link
                to={action.href}
                className={cn(
                  "flex flex-col gap-2 p-4 rounded-xl transition-all duration-200 group",
                  variantStyles[action.variant]
                )}
              >
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5" />
                  <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </div>
                <div>
                  <p className="font-medium text-sm">{action.title}</p>
                  <p
                    className={cn(
                      "text-xs",
                      action.variant === "primary"
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground"
                    )}
                  >
                    {action.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
