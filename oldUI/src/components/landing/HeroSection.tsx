import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { KnowledgeTree } from "./KnowledgeTree";
import { useRef } from "react";

export const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // Parallax effects based on scroll
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  // Spring config for ultra-smooth UI motion
  const springConfig = { stiffness: 100, damping: 20, mass: 1 };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      }
    }
  };

  // Masked reveal variant for text
  const textRevealVariants = {
    hidden: { y: "100%", opacity: 0, rotateX: 20 },
    visible: {
      y: "0%",
      opacity: 1,
      rotateX: 0,
      transition: {
        type: "spring",
        ...springConfig,
        duration: 0.8
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        ...springConfig
      }
    }
  };

  return (
    <section ref={containerRef} className="relative min-h-[110vh] overflow-hidden pt-32 pb-32 flex items-center">
      {/* Background Effects */}
      <div className="absolute inset-0 gradient-mesh opacity-80" />
      <div className="absolute inset-0 grid-pattern opacity-20" />

      {/* Animated glow orb - refined */}
      <motion.div
        className="absolute top-0 right-[-10%] w-[800px] h-[800px] rounded-full bg-primary/5 blur-[100px]"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />

      <motion.div style={{ y: y1 }} className="absolute z-0 top-1/3 -left-20 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px]" />
      <motion.div style={{ y: y2 }} className="absolute z-0 bottom-1/4 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[80px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <motion.div
          className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Column - Content */}
          <div className="text-center lg:text-left relative z-10">
            {/* Badge */}
            <motion.div variants={itemVariants} className="flex justify-center lg:justify-start mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 shadow-lg shadow-primary/5 hover:scale-105 transition-transform cursor-default">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-sm font-medium text-foreground/80">
                  Powered by AI Agents
                </span>
              </div>
            </motion.div>

            {/* Heading - Split for Masked Reveal */}
            <div className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-8">
              <div className="overflow-hidden">
                <motion.div variants={textRevealVariants}>
                  Stop Studying
                </motion.div>
              </div>
              <div className="overflow-hidden">
                <motion.div variants={textRevealVariants} className="text-gradient-primary">
                  Blindly.
                </motion.div>
              </div>
              <div className="overflow-hidden pt-2">
                <motion.div variants={textRevealVariants} className="text-muted-foreground text-4xl sm:text-5xl lg:text-6xl">
                  See the Tree.
                </motion.div>
              </div>
            </div>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed font-light"
            >
              The world's first <strong className="text-foreground font-semibold">Context-Aware LMS</strong> that
              adapts to your real life, tracks memory decay, and personalizes your path to mastery.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button variant="hero" size="xl" className="group shadow-2xl shadow-primary/25 hover:shadow-primary/40 transition-all duration-500 hover:-translate-y-1">
                Start Growing Your Tree
                <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="hero-outline" size="xl" className="group backdrop-blur-sm hover:bg-white/5 disabled:opacity-50">
                <Play className="h-5 w-5 mr-2 group-hover:fill-current transition-all" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              variants={itemVariants}
              className="mt-14 flex items-center gap-4 justify-center lg:justify-start opacity-80"
            >
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -5, zIndex: 10 }}
                    className="w-12 h-12 rounded-full border-[3px] border-background bg-secondary flex items-center justify-center text-base shadow-sm cursor-pointer"
                  >
                    <span className="select-none">{["🎓", "📚", "🧠", "⚡"][i - 1]}</span>
                  </motion.div>
                ))}
              </div>
              <div className="text-sm">
                <div className="font-bold text-foreground text-lg">2,400+</div>
                <div className="text-muted-foreground">students creating legacy</div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Knowledge Tree Visualization - Floating 3D */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateX: 10, rotateY: -10 }}
            animate={{
              opacity: 1,
              scale: 1,
              rotateX: 0,
              rotateY: 0,
              transition: {
                type: "spring",
                stiffness: 50,
                damping: 20,
                delay: 0.4
              }
            }}
            className="relative perspective-1000 group dark"
          >
            <motion.div
              style={{ rotateY: useTransform(scrollY, [0, 500], [0, 10]) }}
              className="relative aspect-square max-w-lg mx-auto transition-transform duration-500 ease-out"
            >
              {/* Glassmorphic container */}
              <div className="absolute inset-0 rounded-[2.5rem] glass shadow-2xl overflow-hidden border border-white/10 group-hover:border-primary/20 transition-colors duration-500 bg-black/40">
                {/* Inner glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50 mixing-blend-overlay" />

                <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />

                <div className="absolute inset-6">
                  <KnowledgeTree />
                </div>
              </div>

              {/* Floating labels with smooth spring entrance */}
              {[
                { text: "Needs Review", color: "bg-rose-500", pos: "top-1/4 -right-8", delay: 1.2 },
                { text: "Mastered", color: "bg-emerald-500", pos: "top-2/3 -left-8", delay: 1.4 },
                { text: "Decaying Soon", color: "bg-amber-500", pos: "-bottom-6 left-1/2 -translate-x-1/2", delay: 1.6 }
              ].map((label, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: label.delay,
                    type: "spring",
                    stiffness: 120,
                    damping: 12
                  }}
                  className={`absolute ${label.pos} glass-subtle rounded-xl px-4 py-2 shadow-xl backdrop-blur-xl border border-white/20`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${label.color} animate-pulse`} />
                    <span className="text-sm font-medium text-white/90">{label.text}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
