import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
  description: string;
}

interface OnboardingProgressProps {
  steps: Step[];
  currentStep: number;
}

export const OnboardingProgress = ({ steps, currentStep }: OnboardingProgressProps) => {
  return (
    <div className="hidden lg:block w-80 shrink-0">
      <div className="sticky top-8 space-y-4">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "flex items-start gap-4 p-4 rounded-xl transition-all duration-300",
                isCurrent && "glass",
                !isCurrent && !isCompleted && "opacity-50"
              )}
            >
              {/* Step indicator */}
              <div
                className={cn(
                  "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-300",
                  isCompleted && "bg-primary text-primary-foreground",
                  isCurrent && "bg-primary/20 text-primary border-2 border-primary",
                  !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Check className="h-5 w-5" />
                  </motion.div>
                ) : (
                  step.id
                )}
              </div>

              {/* Step content */}
              <div className="flex-1 min-w-0">
                <h3
                  className={cn(
                    "font-medium text-sm",
                    isCurrent ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {step.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
