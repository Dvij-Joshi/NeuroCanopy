import { motion } from "framer-motion";
import { 
  Mic, 
  TreeDeciduous, 
  Brain, 
  Calendar, 
  MessageSquare, 
  FileText,
  Zap,
  Shield
} from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "Voice Viva Engine",
    description: "AI interviews you in real-time, forcing deep recall under pressure. Build exam reflexes, not just knowledge.",
    gradient: "from-rose-500/20 to-orange-500/20",
    iconColor: "text-rose-400",
  },
  {
    icon: TreeDeciduous,
    title: "Living Knowledge Tree",
    description: "See your entire syllabus as a visual DAG. Red nodes need attention. Green means you're safe.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-400",
  },
  {
    icon: Brain,
    title: "Memory Decay Tracking",
    description: "Using Ebbinghaus curves, we predict when you'll forget concepts and alert you before exams.",
    gradient: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-400",
  },
  {
    icon: Calendar,
    title: "Quantum Planner",
    description: "AI finds gaps in your schedule and auto-fills them with exactly what you need to study.",
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-400",
  },
  {
    icon: MessageSquare,
    title: "NeuroChat Tutor",
    description: "Context-aware AI that knows exactly where you are in your learning journey.",
    gradient: "from-amber-500/20 to-yellow-500/20",
    iconColor: "text-amber-400",
  },
  {
    icon: FileText,
    title: "Smart Parsing",
    description: "Drop your syllabus PDF and watch the tree grow automatically. No manual card creation.",
    gradient: "from-indigo-500/20 to-violet-500/20",
    iconColor: "text-indigo-400",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export const FeaturesSection = () => {
  return (
    <section id="features" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-mesh opacity-50" />
      
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Powerful Features
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Everything You Need to{" "}
            <span className="text-gradient-primary">Actually Learn</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Built from real student pain points. Every feature solves a real problem 
            that traditional LMS platforms ignore.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group relative"
            >
              <div className="h-full rounded-2xl glass p-8 transition-all duration-300 hover:shadow-elevated">
                {/* Gradient background on hover */}
                <div 
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} 
                />
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`inline-flex p-3 rounded-xl bg-secondary mb-6 ${feature.iconColor}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>

                  {/* Content */}
                  <h3 className="font-display text-xl font-semibold mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            { value: "< 300ms", label: "Voice Response Time" },
            { value: "95%", label: "Retention Improvement" },
            { value: "50+", label: "Universities Using" },
            { value: "4.9★", label: "Student Rating" },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-6 rounded-2xl glass">
              <div className="font-display text-2xl sm:text-3xl font-bold text-gradient-primary mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
