import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, GraduationCap, BookOpen, Calendar, Sun, Moon, Clock, Camera, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface IdentityStepProps {
  data: {
    fullName: string;
    university: string;
    major: string;
    academicYear: string;
    chronotype: string;
    focusDuration: number;

    avatarPreview: string | null;
  };
  onChange: (data: Partial<IdentityStepProps["data"]>) => void;
}

const chronotypes = [
  { id: "early", label: "Early Bird", icon: Sun, description: "Peak energy in mornings" },
  { id: "standard", label: "Standard", icon: Clock, description: "Balanced throughout day" },
  { id: "night", label: "Night Owl", icon: Moon, description: "Peak energy at night" },
];

const focusDurations = [
  { value: 25, label: "25 min", description: "Pomodoro" },
  { value: 45, label: "45 min", description: "Standard" },
  { value: 90, label: "90 min", description: "Deep Work" },
];



const academicYears = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Graduate"];

export const IdentityStep = ({ data, onChange }: IdentityStepProps) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ avatarPreview: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Basic Info */}
      <div className="space-y-6">
        <h3 className="font-display text-lg font-semibold">Basic Information</h3>

        {/* Avatar Upload */}
        <div className="flex flex-col items-center justify-center gap-4 mb-8">
          <div className="relative group">
            <div className={cn(
              "w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-border flex items-center justify-center bg-card transition-all duration-200",
              "group-hover:border-primary group-hover:bg-primary/5",
              data.avatarPreview && "border-solid border-primary"
            )}>
              {data.avatarPreview ? (
                <img
                  src={data.avatarPreview}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-1 text-muted-foreground group-hover:text-primary transition-colors">
                  <Camera className="w-6 h-6" />
                  <span className="text-[10px] font-medium">Upload</span>
                </div>
              )}
            </div>

            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-primary-foreground shadow-lg cursor-pointer hover:bg-primary/90 transition-colors"
            >
              <Upload className="w-3 h-3" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Upload a profile picture<br />
            (Optional)
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="fullName"
                placeholder="John Doe"
                value={data.fullName}
                onChange={(e) => onChange({ fullName: e.target.value })}
                className="pl-10 h-12 bg-card border-border/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="university">University</Label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="university"
                placeholder="MIT, Stanford, etc."
                value={data.university}
                onChange={(e) => onChange({ university: e.target.value })}
                className="pl-10 h-12 bg-card border-border/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="major">Major</Label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="major"
                placeholder="Computer Science"
                value={data.major}
                onChange={(e) => onChange({ major: e.target.value })}
                className="pl-10 h-12 bg-card border-border/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="academicYear">Academic Year</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <select
                id="academicYear"
                value={data.academicYear}
                onChange={(e) => onChange({ academicYear: e.target.value })}
                className="w-full h-12 pl-10 pr-4 bg-card border border-border/50 rounded-lg text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors appearance-none"
              >
                <option value="">Select year</option>
                {academicYears.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Chronotype */}
      <div className="space-y-4">
        <div>
          <h3 className="font-display text-lg font-semibold">Your Energy Pattern</h3>
          <p className="text-sm text-muted-foreground mt-1">When do you feel most productive?</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {chronotypes.map((type) => {
            const Icon = type.icon;
            const isSelected = data.chronotype === type.id;

            return (
              <motion.button
                key={type.id}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onChange({ chronotype: type.id })}
                className={cn(
                  "p-4 rounded-xl border-2 text-left transition-all duration-200",
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border/50 bg-card hover:border-primary/50"
                )}
              >
                <Icon className={cn("h-6 w-6 mb-2", isSelected ? "text-primary" : "text-muted-foreground")} />
                <div className="font-medium text-sm">{type.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{type.description}</div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Focus Duration */}
      <div className="space-y-4">
        <div>
          <h3 className="font-display text-lg font-semibold">Max Focus Duration</h3>
          <p className="text-sm text-muted-foreground mt-1">How long can you study without a break?</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {focusDurations.map((duration) => {
            const isSelected = data.focusDuration === duration.value;

            return (
              <motion.button
                key={duration.value}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onChange({ focusDuration: duration.value })}
                className={cn(
                  "p-4 rounded-xl border-2 text-center transition-all duration-200",
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border/50 bg-card hover:border-primary/50"
                )}
              >
                <div className={cn("text-2xl font-display font-bold", isSelected ? "text-primary" : "text-foreground")}>
                  {duration.label}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{duration.description}</div>
              </motion.button>
            );
          })}
        </div>
      </div>

    </motion.div>
  );
};
