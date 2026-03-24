import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Moon, Sun, Clock } from "lucide-react";

interface BioRhythmsStepProps {
  data: {
    wakeTime: string;
    sleepTime: string;
    choreBuffer: number;
  };
  onChange: (data: Partial<BioRhythmsStepProps["data"]>) => void;
}

export const BioRhythmsStep = ({ data, onChange }: BioRhythmsStepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Sleep Anchors */}
      <div className="space-y-6">
        <div>
          <h3 className="font-display text-lg font-semibold">Sleep Schedule</h3>
          <p className="text-sm text-muted-foreground mt-1">
            We'll protect your sleep and schedule around your natural rhythm
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Wake Time */}
          <div className="glass rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Sun className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <Label className="text-base font-medium">Wake Up Time</Label>
                <p className="text-xs text-muted-foreground">When do you usually wake up?</p>
              </div>
            </div>
            <input
              type="time"
              value={data.wakeTime}
              onChange={(e) => onChange({ wakeTime: e.target.value })}
              className="w-full h-14 px-4 bg-card border border-border/50 rounded-xl text-2xl font-display font-semibold text-center focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          {/* Sleep Time */}
          <div className="glass rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <Moon className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <Label className="text-base font-medium">Bedtime</Label>
                <p className="text-xs text-muted-foreground">When do you usually go to sleep?</p>
              </div>
            </div>
            <input
              type="time"
              value={data.sleepTime}
              onChange={(e) => onChange({ sleepTime: e.target.value })}
              className="w-full h-14 px-4 bg-card border border-border/50 rounded-xl text-2xl font-display font-semibold text-center focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Life Admin Buffer */}
      <div className="glass rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <Label className="text-base font-medium">Daily Life Admin Buffer</Label>
            <p className="text-xs text-muted-foreground">
              Time for chores, calls, meals, and other daily overhead
            </p>
          </div>
          <div className="text-2xl font-display font-bold text-primary">
            {data.choreBuffer} min
          </div>
        </div>

        <Slider
          value={[data.choreBuffer]}
          onValueChange={(value) => onChange({ choreBuffer: value[0] })}
          max={90}
          min={0}
          step={15}
          className="w-full"
        />

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0 min</span>
          <span>30 min</span>
          <span>60 min</span>
          <span>90 min</span>
        </div>
      </div>

      {/* Sleep Quality Tip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-primary/5 border border-primary/20 rounded-xl p-4"
      >
        <p className="text-sm text-muted-foreground">
          💡 <span className="font-medium text-foreground">Pro tip:</span> Aim for 7-9 hours of sleep. 
          NeuroCanopy will never schedule study sessions during your sleep hours.
        </p>
      </motion.div>
    </motion.div>
  );
};
