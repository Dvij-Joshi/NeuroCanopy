import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Keyboard,
  HelpCircle,
  LogOut,
  Moon,
  Sun,
  ChevronRight,
  Vibrate,
  Clock,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

const appearanceOptions = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Globe },
];

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState("dark");
  const [loading, setLoading] = useState(true);

  // Initial empty state matching structure
  const [formData, setFormData] = useState({
    profile: {
      fullName: "",
      major: "",
      university: "",
      academicYear: "",
    },
    bio_rhythms: {
      chronotype: "Standard",
      wake_time: "07:00",
      sleep_time: "23:00",
    },
    cognitive_profile: {
      focus_duration_mins: 25,
      learning_style: "Visual",
      review_algorithm: "SM-2", // Assuming we add this to schema or handle as extra
    },
    academics_config: { // Assuming fields for goals exist or mapping them
    },
    settings: { // Local UI settings or mapped from DB
      daily_study_goal_hours: 4,
      daily_commute_minutes: 30,
      decay_alerts_enabled: true
    }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data) {
          // Map Supabase columns to formData structure
          setFormData({
            profile: {
              fullName: data.full_name || "",
              major: data.major || "",
              university: data.university || "",
              academicYear: data.academic_year || "",
            },
            bio_rhythms: {
              chronotype: data.chronotype || "Standard",
              wake_time: data.wake_time || "07:00",
              sleep_time: data.sleep_time || "23:00",
            },
            cognitive_profile: {
              focus_duration_mins: data.focus_duration || 25,
              learning_style: data.learning_style || "Visual",
              review_algorithm: "SM-2",
            },
            academics_config: {
              // If we had more config columns
            },
            settings: {
              daily_study_goal_hours: data.total_study_hours || 4, // Using total_study_hours as a proxy for goal or creating new column
              daily_commute_minutes: data.commute_minutes || 30,
              decay_alerts_enabled: true
            }
          });
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    try {
      const updates = {
        full_name: formData.profile.fullName,
        major: formData.profile.major,
        university: formData.profile.university,
        academic_year: formData.profile.academicYear,
        chronotype: formData.bio_rhythms.chronotype,
        wake_time: formData.bio_rhythms.wake_time,
        sleep_time: formData.bio_rhythms.sleep_time,
        focus_duration: formData.cognitive_profile.focus_duration_mins,
        learning_style: formData.cognitive_profile.learning_style,
        commute_minutes: formData.settings.daily_commute_minutes,
        // We might want to save total_study_hours if it's treated as goal? Or add a goal column.
        // For now, let's just update the profile fields.
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      toast.success("Settings saved successfully!");
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to save settings");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
          </div>
          <Button variant="hero" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </motion.div>

        <div className="space-y-6">
          {/* Identity Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
          >
            <div className="flex items-center gap-3 p-4 border-b border-border/50">
              <div className="rounded-lg bg-primary/20 p-2">
                <User className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-display font-semibold">Identity</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.profile.fullName}
                    onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, fullName: e.target.value } })}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="major">Major</Label>
                  <Input
                    id="major"
                    value={formData.profile.major}
                    onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, major: e.target.value } })}
                    placeholder="e.g., Computer Science"
                  />
                </div>
                <div>
                  <Label htmlFor="university">University</Label>
                  <Input
                    id="university"
                    value={formData.profile.university}
                    onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, university: e.target.value } })}
                    placeholder="e.g., Stanford University"
                  />
                </div>
                <div>
                  <Label htmlFor="academic_year">Academic Year</Label>
                  <Select
                    value={formData.profile.academicYear}
                    onValueChange={(value) => setFormData({ ...formData, profile: { ...formData.profile, academicYear: value } })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Freshman">Freshman</SelectItem>
                      <SelectItem value="Sophomore">Sophomore</SelectItem>
                      <SelectItem value="Junior">Junior</SelectItem>
                      <SelectItem value="Senior">Senior</SelectItem>
                      <SelectItem value="Graduate">Graduate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bio-Rhythms Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
          >
            <div className="flex items-center gap-3 p-4 border-b border-border/50">
              <div className="rounded-lg bg-primary/20 p-2">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-display font-semibold">Bio-Rhythms</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Chronotype</Label>
                  <Select
                    value={formData.bio_rhythms.chronotype}
                    onValueChange={(value: any) => setFormData({ ...formData, bio_rhythms: { ...formData.bio_rhythms, chronotype: value } })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Early_Bird">Early Bird 🌅</SelectItem>
                      <SelectItem value="Night_Owl">Night Owl 🦉</SelectItem>
                      <SelectItem value="Standard">Standard ☀️</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="wake_time">Wake Time</Label>
                  <Input
                    id="wake_time"
                    type="time"
                    value={formData.bio_rhythms.wake_time}
                    onChange={(e) => setFormData({ ...formData, bio_rhythms: { ...formData.bio_rhythms, wake_time: e.target.value } })}
                  />
                </div>
                <div>
                  <Label htmlFor="sleep_time">Sleep Time</Label>
                  <Input
                    id="sleep_time"
                    type="time"
                    value={formData.bio_rhythms.sleep_time}
                    onChange={(e) => setFormData({ ...formData, bio_rhythms: { ...formData.bio_rhythms, sleep_time: e.target.value } })}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Cognitive Preferences Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
          >
            <div className="flex items-center gap-3 p-4 border-b border-border/50">
              <div className="rounded-lg bg-primary/20 p-2">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-display font-semibold">Cognitive Preferences</h2>
            </div>
            <div className="p-4 space-y-6">
              <div>
                <Label>Focus Duration: {formData.cognitive_profile.focus_duration_mins} minutes</Label>
                <Slider
                  value={[formData.cognitive_profile.focus_duration_mins]}
                  onValueChange={(value) => setFormData({ ...formData, cognitive_profile: { ...formData.cognitive_profile, focus_duration_mins: value[0] } })}
                  max={120}
                  min={15}
                  step={5}
                  className="mt-2"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Learning Style</Label>
                  <Select
                    value={formData.cognitive_profile.learning_style}
                    onValueChange={(value: any) => setFormData({ ...formData, cognitive_profile: { ...formData.cognitive_profile, learning_style: value } })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Visual">Visual 👁️</SelectItem>
                      <SelectItem value="Text">Text 📖</SelectItem>
                      <SelectItem value="Active">Active 🏃</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Review Algorithm - mocked for now */}
              </div>
            </div>
          </motion.div>

          {/* Appearance Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
          >
            <div className="flex items-center gap-3 p-4 border-b border-border/50">
              <div className="rounded-lg bg-primary/20 p-2">
                <Palette className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-display font-semibold">Appearance</h2>
            </div>
            <div className="p-4">
              <p className="text-sm text-muted-foreground mb-4">Choose your preferred theme</p>
              <div className="grid grid-cols-3 gap-3">
                {appearanceOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setTheme(option.id)}
                      className={cn(
                        "rounded-xl border p-4 text-center transition-all",
                        theme === option.id
                          ? "border-primary bg-primary/10"
                          : "border-border/50 hover:bg-accent/50"
                      )}
                    >
                      <Icon className="h-5 w-5 mx-auto mb-2" />
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Notifications Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
          >
            <div className="flex items-center gap-3 p-4 border-b border-border/50">
              <div className="rounded-lg bg-primary/20 p-2">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-display font-semibold">Notifications</h2>
            </div>
            <div className="divide-y divide-border/50">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Vibrate className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Decay Alerts</p>
                    <p className="text-sm text-muted-foreground">When knowledge starts fading</p>
                  </div>
                </div>
                <Switch
                  checked={formData.settings.decay_alerts_enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, settings: { ...formData.settings, decay_alerts_enabled: checked } })}
                />
              </div>
            </div>
          </motion.div>

          {/* Study Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
          >
            <div className="flex items-center gap-3 p-4 border-b border-border/50">
              <div className="rounded-lg bg-primary/20 p-2">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-display font-semibold">Study Preferences</h2>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <Label>Daily Study Goal: {formData.settings.daily_study_goal_hours} hours</Label>
                <Slider
                  value={[formData.settings.daily_study_goal_hours]}
                  onValueChange={(value) => setFormData({ ...formData, settings: { ...formData.settings, daily_study_goal_hours: value[0] } })}
                  max={12}
                  min={1}
                  step={0.5}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Daily Commute: {formData.settings.daily_commute_minutes} minutes</Label>
                <Slider
                  value={[formData.settings.daily_commute_minutes]}
                  onValueChange={(value) => setFormData({ ...formData, settings: { ...formData.settings, daily_commute_minutes: value[0] } })}
                  max={180}
                  min={0}
                  step={5}
                  className="mt-2"
                />
              </div>
            </div>
          </motion.div>

          {/* More Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
          >
            <div className="divide-y divide-border/50">
              <button className="w-full flex items-center gap-3 p-4 hover:bg-accent/30 transition-colors text-left">
                <Keyboard className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">Keyboard Shortcuts</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
              <button className="w-full flex items-center gap-3 p-4 hover:bg-accent/30 transition-colors text-left">
                <HelpCircle className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">Help & Support</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </motion.div>

          {/* Sign Out */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button variant="outline" className="w-full text-destructive hover:text-destructive" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </motion.div>

          {/* Version */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="text-center text-xs text-muted-foreground"
          >
            NeuroCanopy v1.0.0 • Made with 🧠 for students
          </motion.p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
