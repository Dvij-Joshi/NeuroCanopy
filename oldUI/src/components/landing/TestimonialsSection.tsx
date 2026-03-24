import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    quote: "I went from freezing up in exams to answering questions before the professor finished asking. The Viva Arena changed everything.",
    author: "Sarah Chen",
    role: "Computer Science, MIT",
    avatar: "🎓",
    rating: 5,
  },
  {
    quote: "Finally, an app that actually knows when I'm about to forget something. My retention went from 60% to 95% before midterms.",
    author: "Marcus Rodriguez",
    role: "Pre-Med, Stanford",
    avatar: "🧬",
    rating: 5,
  },
  {
    quote: "The Quantum Planner found 3 hours of study time I didn't know I had. It's like having a personal academic coach.",
    author: "Priya Patel",
    role: "Engineering, IIT Delhi",
    avatar: "⚙️",
    rating: 5,
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 gradient-mesh opacity-30" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Loved by <span className="text-gradient-primary">Students</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of students who've transformed their learning journey.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <div className="h-full rounded-2xl glass p-8 transition-all duration-300 hover:shadow-elevated">
                {/* Quote Icon */}
                <Quote className="h-8 w-8 text-primary/40 mb-6" />

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-foreground mb-8 leading-relaxed">
                  "{testimonial.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
