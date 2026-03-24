import { motion } from "framer-motion";
import { Shield, Check, Youtube, MessageCircle, BookOpen, Brain, Globe, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface DigitalRulesStepProps {
  data: {
    whitelistedApps: string[];
  };
  onChange: (data: Partial<DigitalRulesStepProps["data"]>) => void;
}

const apps = [
  { id: "youtube", label: "YouTube", icon: Youtube, description: "Educational videos" },
  { id: "chatgpt", label: "ChatGPT", icon: Brain, description: "AI assistance" },
  { id: "wikipedia", label: "Wikipedia", icon: Globe, description: "Research" },
  { id: "whatsapp", label: "WhatsApp Class Group", icon: MessageCircle, description: "Class coordination" },
  { id: "notion", label: "Notion", icon: FileText, description: "Notes & docs" },
  { id: "stackoverflow", label: "Stack Overflow", icon: BookOpen, description: "Coding help" },
];

export const DigitalRulesStep = ({ data, onChange }: DigitalRulesStepProps) => {
  const toggleApp = (appId: string) => {
    const isSelected = data.whitelistedApps.includes(appId);
    if (isSelected) {
      onChange({ whitelistedApps: data.whitelistedApps.filter((id) => id !== appId) });
    } else {
      onChange({ whitelistedApps: [...data.whitelistedApps, appId] });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="glass rounded-xl p-6 flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold">Study Mode Whitelist</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Select apps that are ALLOWED during study sessions. All other apps will trigger focus reminders.
          </p>
        </div>
      </div>

      {/* App Selection */}
      <div className="space-y-4">
        <Label className="text-sm font-medium text-muted-foreground">
          Select allowed distractions
        </Label>

        <div className="grid sm:grid-cols-2 gap-3">
          {apps.map((app) => {
            const Icon = app.icon;
            const isSelected = data.whitelistedApps.includes(app.id);

            return (
              <motion.button
                key={app.id}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleApp(app.id)}
                className={cn(
                  "p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-4",
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border/50 bg-card hover:border-primary/50"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  {isSelected ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn("font-medium", isSelected && "text-primary")}>{app.label}</div>
                  <div className="text-xs text-muted-foreground truncate">{app.description}</div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected Summary */}
      {data.whitelistedApps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/5 border border-primary/20 rounded-xl p-4"
        >
          <p className="text-sm">
            <span className="font-medium text-foreground">{data.whitelistedApps.length} app(s) whitelisted:</span>{" "}
            <span className="text-muted-foreground">
              {apps
                .filter((app) => data.whitelistedApps.includes(app.id))
                .map((app) => app.label)
                .join(", ")}
            </span>
          </p>
        </motion.div>
      )}

      {/* Warning */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4"
      >
        <p className="text-sm text-amber-200">
          ⚠️ <span className="font-medium">Pro tip:</span> The fewer apps you whitelist, the more focused your study sessions will be. Only select what's truly necessary for learning.
        </p>
      </motion.div>
    </motion.div>
  );
};

// Label component inline for this step
const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
);
