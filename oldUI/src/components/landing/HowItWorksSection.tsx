import { motion } from "framer-motion";
import { Upload, GitBranch, Mic, TrendingUp } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Your Syllabus",
    description: "Drop your university PDF, paste a WhatsApp export, or manually enter topics. Our AI parses everything.",
  },
  {
    number: "02",
    icon: GitBranch,
    title: "Watch Your Tree Grow",
    description: "The Knowledge Tree automatically builds itself. Each node represents a concept with decay tracking.",
  },
  {
    number: "03",
    icon: Mic,
    title: "Enter the Viva Arena",
    description: "Practice with our AI interviewer. It adapts difficulty based on your Elo rating and targets weak spots.",
  },
  {
    number: "04",
    icon: TrendingUp,
    title: "Track & Conquer",
    description: "Watch your tree turn green as you master concepts. Get auto-scheduled reviews before exams.",
  },
];

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-secondary/30" />
      <div className="absolute inset-0 dot-pattern opacity-50" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            How It <span className="text-gradient-primary">Works</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From syllabus to mastery in four simple steps. No complex setup, 
            no manual flashcard creation.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative"
              >
                <div className="relative z-10 flex flex-col items-center text-center">
                  {/* Step number badge */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="mb-6 relative"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <step.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                      <span className="font-display text-xs font-bold text-primary-foreground">
                        {step.number}
                      </span>
                    </div>
                  </motion.div>

                  {/* Content */}
                  <h3 className="font-display text-xl font-semibold mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
