import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Building, Home, Car, Clock, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogisticsStepProps {
  data: {
    livingSituation: string;
    commuteMinutes: number;
    messTimings: {
      breakfast: string;
      lunch: string;
      dinner: string;
    };
  };
  onChange: (data: Partial<LogisticsStepProps["data"]>) => void;
}

const livingSituations = [
  { id: "hostel", label: "Hostel", icon: Building, description: "Living on campus" },
  { id: "dayscholar", label: "Day Scholar", icon: Home, description: "Living off campus" },
];

export const LogisticsStep = ({ data, onChange }: LogisticsStepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Living Situation */}
      <div className="space-y-4">
        <div>
          <h3 className="font-display text-lg font-semibold">Living Situation</h3>
          <p className="text-sm text-muted-foreground mt-1">
            This helps us understand your daily constraints
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {livingSituations.map((situation) => {
            const Icon = situation.icon;
            const isSelected = data.livingSituation === situation.id;

            return (
              <motion.button
                key={situation.id}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onChange({ livingSituation: situation.id })}
                className={cn(
                  "p-6 rounded-xl border-2 text-left transition-all duration-200",
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border/50 bg-card hover:border-primary/50"
                )}
              >
                <Icon className={cn("h-8 w-8 mb-3", isSelected ? "text-primary" : "text-muted-foreground")} />
                <div className="font-medium text-lg">{situation.label}</div>
                <div className="text-sm text-muted-foreground mt-1">{situation.description}</div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Conditional Content based on Living Situation */}
      {data.livingSituation === "hostel" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-primary" />
            <h3 className="font-display text-lg font-semibold">Mess Timings</h3>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {["breakfast", "lunch", "dinner"].map((meal) => (
              <div key={meal} className="glass rounded-xl p-4 space-y-3">
                <Label className="capitalize text-sm font-medium">{meal}</Label>
                <Input
                  type="time"
                  value={data.messTimings[meal as keyof typeof data.messTimings]}
                  onChange={(e) =>
                    onChange({
                      messTimings: { ...data.messTimings, [meal]: e.target.value },
                    })
                  }
                  className="h-12 bg-card border-border/50 text-center font-display font-semibold"
                />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {data.livingSituation === "dayscholar" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-4"
        >
          <div className="glass rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Car className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <Label className="text-base font-medium">Daily Commute Time</Label>
                <p className="text-xs text-muted-foreground">One-way travel time to college</p>
              </div>
              <div className="text-2xl font-display font-bold text-primary">
                {data.commuteMinutes} min
              </div>
            </div>

            <Slider
              value={[data.commuteMinutes]}
              onValueChange={(value) => onChange({ commuteMinutes: value[0] })}
              max={120}
              min={5}
              step={5}
              className="w-full"
            />

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5 min</span>
              <span>30 min</span>
              <span>60 min</span>
              <span>90 min</span>
              <span>120 min</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-primary/5 border border-primary/20 rounded-xl p-4"
      >
        <p className="text-sm text-muted-foreground">
          <Clock className="h-4 w-4 inline mr-2 text-primary" />
          {data.livingSituation === "hostel"
            ? "We'll block mess timings to ensure you never miss a meal during study sessions."
            : data.livingSituation === "dayscholar"
            ? "Your commute time will be factored into your daily schedule planning."
            : "Select your living situation to customize your schedule constraints."}
        </p>
      </motion.div>
    </motion.div>
  );
};
