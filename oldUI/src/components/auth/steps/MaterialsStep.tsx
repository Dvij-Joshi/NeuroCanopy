import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileText, X, Plus, Dumbbell, Bike, Music, Gamepad2, Coffee, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  subjectId: string; // Linked to subject
  file?: File; // Actual file object for upload
}

interface LifestyleActivity {
  id: string;
  name: string;
  icon: React.ElementType;
}

interface Subject {
  id: string;
  name: string;
  category: string;
}

interface MaterialsStepProps {
  data: {
    uploadedFiles: UploadedFile[];
    lifestyleActivities: string[];
    customActivity: string;
  };
  enrolledSubjects: Subject[];
  onChange: (data: Partial<MaterialsStepProps["data"]>) => void;
}

const lifestyleOptions: LifestyleActivity[] = [
  { id: "gym", name: "Gym", icon: Dumbbell },
  { id: "sports", name: "Sports", icon: Bike },
  { id: "music", name: "Music Practice", icon: Music },
  { id: "gaming", name: "Gaming", icon: Gamepad2 },
  { id: "coffee", name: "Social Time", icon: Coffee },
];

export const MaterialsStep = ({ data, enrolledSubjects, onChange }: MaterialsStepProps) => {
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleFileSelect = (subjectId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newFile: UploadedFile = {
        id: Date.now().toString(),
        name: file.name,
        type: "PDF", // We assume PDF or check file.type
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
        subjectId: subjectId,
        file: file
      };

      // Remove existing file for this subject if any
      const otherFiles = data.uploadedFiles.filter(f => f.subjectId !== subjectId);
      onChange({ uploadedFiles: [...otherFiles, newFile] });
    }
  };

  const removeFile = (subjectId: string) => {
    onChange({ uploadedFiles: data.uploadedFiles.filter((f) => f.subjectId !== subjectId) });
    if (fileInputRefs.current[subjectId]) {
      fileInputRefs.current[subjectId]!.value = "";
    }
  };

  const toggleActivity = (activityId: string) => {
    const isSelected = data.lifestyleActivities.includes(activityId);
    if (isSelected) {
      onChange({ lifestyleActivities: data.lifestyleActivities.filter((id) => id !== activityId) });
    } else {
      onChange({ lifestyleActivities: [...data.lifestyleActivities, activityId] });
    }
  };

  const addCustomActivity = () => {
    if (data.customActivity.trim()) {
      onChange({
        lifestyleActivities: [...data.lifestyleActivities, data.customActivity.trim()],
        customActivity: "",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Materials Upload */}
      <div className="space-y-6">
        <div>
          <h3 className="font-display text-lg font-semibold">Syllabus Upload</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Please upload the syllabus PDF for each of your enrolled subjects.
          </p>
        </div>

        <div className="space-y-4">
          {enrolledSubjects.map(subject => {
            const uploadedFile = data.uploadedFiles.find(f => f.subjectId === subject.id);

            return (
              <div key={subject.id} className="glass rounded-xl p-4 flex items-center justify-between gap-4 transition-all duration-200 border border-border/50 hover:border-primary/30">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                    uploadedFile ? "bg-emerald-500/20 text-emerald-500" : "bg-muted text-muted-foreground"
                  )}>
                    {uploadedFile ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="font-medium">{subject.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {uploadedFile ? uploadedFile.name : "Syllabus required"}
                    </div>
                  </div>
                </div>

                <div>
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    ref={el => fileInputRefs.current[subject.id] = el}
                    onChange={(e) => handleFileSelect(subject.id, e)}
                  />
                  {uploadedFile ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeFile(subject.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRefs.current[subject.id]?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload PDF
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lifestyle Anchors */}
      <div className="space-y-4">
        <div>
          <h3 className="font-display text-lg font-semibold">Lifestyle Anchors</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Activities we should protect in your schedule
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {lifestyleOptions.map((activity) => {
            const Icon = activity.icon;
            const isSelected = data.lifestyleActivities.includes(activity.id);

            return (
              <motion.button
                key={activity.id}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleActivity(activity.id)}
                className={cn(
                  "p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all duration-200",
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border/50 bg-card hover:border-primary/50"
                )}
              >
                <Icon className={cn("h-6 w-6", isSelected ? "text-primary" : "text-muted-foreground")} />
                <span className={cn("text-sm font-medium", isSelected && "text-primary")}>
                  {activity.name}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Custom Activity */}
        <div className="flex gap-2">
          <Input
            placeholder="Add custom activity..."
            value={data.customActivity}
            onChange={(e) => onChange({ customActivity: e.target.value })}
            className="h-12 bg-card border-border/50"
            onKeyDown={(e) => e.key === "Enter" && addCustomActivity()}
          />
          <Button
            type="button"
            variant="outline"
            className="h-12 px-4"
            onClick={addCustomActivity}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Custom Activities Display */}
        {data.lifestyleActivities.filter((a) => !lifestyleOptions.find((o) => o.id === a)).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.lifestyleActivities
              .filter((a) => !lifestyleOptions.find((o) => o.id === a))
              .map((activity) => (
                <motion.span
                  key={activity}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm"
                >
                  {activity}
                  <button
                    type="button"
                    onClick={() =>
                      onChange({ lifestyleActivities: data.lifestyleActivities.filter((a) => a !== activity) })
                    }
                    className="hover:bg-primary/30 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.span>
              ))}
          </div>
        )}
      </div>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-primary/5 border border-primary/20 rounded-xl p-4"
      >
        <p className="text-sm text-muted-foreground">
          🎯 These activities are <span className="text-foreground font-medium">protected time</span> —
          we'll schedule study sessions around them, not over them.
        </p>
      </motion.div>
    </motion.div>
  );
};
