import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { OnboardingProgress } from "@/components/auth/OnboardingProgress";
import { IdentityStep } from "@/components/auth/steps/IdentityStep";
import { BioRhythmsStep } from "@/components/auth/steps/BioRhythmsStep";
import { AcademicsStep } from "@/components/auth/steps/AcademicsStep";
import { LogisticsStep } from "@/components/auth/steps/LogisticsStep";
import { MaterialsStep } from "@/components/auth/steps/MaterialsStep";
import { parseAndSaveSyllabus } from "@/utils/syllabusParser";

import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const steps = [
  { id: 1, title: "Account", description: "Create your login credentials" },
  { id: 2, title: "Identity & Cognitive", description: "Who you are & how you learn" },
  { id: 3, title: "Bio-Rhythms", description: "Sleep & daily overhead" },
  { id: 4, title: "Academics", description: "Schedule & exam dates" },
  { id: 5, title: "Logistics", description: "Living situation" },
  { id: 6, title: "Materials & Lifestyle", description: "Upload & activities" },
];

const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Step 1: Account
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: Identity & Cognitive
  const [identityData, setIdentityData] = useState({
    fullName: "",
    university: "",
    major: "",
    academicYear: "",
    chronotype: "",
    focusDuration: 45,
    learningStyle: "",
    avatarPreview: null as string | null,
  });

  // Step 3: Bio-Rhythms
  const [bioData, setBioData] = useState({
    wakeTime: "07:00",
    sleepTime: "23:00",
    choreBuffer: 30,
  });

  // Step 4: Academics
  const [academicsData, setAcademicsData] = useState<{
    minAttendance: number;
    enforceAttendance: boolean;
    nextExamDate: string;
    tuitions: { id: string; subjectId: string; subjectName: string; time: string; drain: "low" | "high" }[];
    collegeStartTime: string;
    collegeEndTime: string;
    timetable: { day: string; periodId: string; volume: number; subjectId: string | null }[];
    enrolledSubjects: { id: string; name: string; category: string; isNew?: boolean }[];
    periods: { id: string; startTime: string; endTime: string; label: string; type?: 'Lecture' | 'Break' }[];
  }>({
    minAttendance: 75,
    enforceAttendance: true,
    nextExamDate: "",
    tuitions: [],
    collegeStartTime: "09:00",
    collegeEndTime: "17:00",
    timetable: [],
    enrolledSubjects: [],
    periods: [],
  });

  // Step 5: Logistics
  const [logisticsData, setLogisticsData] = useState({
    livingSituation: "",
    commuteMinutes: 30,
    messTimings: {
      breakfast: "08:00",
      lunch: "13:00",
      dinner: "20:00",
    },
  });

  // Step 6: Materials & Lifestyle
  const [materialsData, setMaterialsData] = useState<{
    uploadedFiles: { id: string; name: string; type: string; size: string; subjectId: string; file?: File }[];
    lifestyleActivities: string[];
    customActivity: string;
  }>({
    uploadedFiles: [],
    lifestyleActivities: [],
    customActivity: "",
  });

  const validateStep = (step: number) => {
    switch (step) {
      case 1: // Account
        if (!email || !password || !confirmPassword) return false;
        if (password !== confirmPassword) {
          alert("Passwords do not match");
          return false;
        }
        if (password.length < 6) {
          alert("Password must be at least 6 characters");
          return false;
        }
        return true;
      case 2: // Identity
        if (!identityData.fullName || !identityData.university || !identityData.major || !identityData.academicYear) {
          alert("Please fill in all required fields (Name, University, Major, Year)");
          return false;
        }
        if (!identityData.chronotype) {
          alert("Please select your Chronotype");
          return false;
        }
        return true;
      case 3: // Bio-Rhythms
        if (!bioData.wakeTime || !bioData.sleepTime) {
          alert("Please set your wake and sleep times");
          return false;
        }
        return true;
      case 4: // Academics
        if (!academicsData.collegeStartTime || !academicsData.collegeEndTime) {
          alert("Please set college timings");
          return false;
        }
        if (academicsData.enrolledSubjects.length === 0) {
          alert("Please add at least one subject");
          return false;
        }
        return true;
      case 5: // Logistics
        if (!logisticsData.livingSituation) {
          alert("Please select your living situation");
          return false;
        }
        if (logisticsData.livingSituation === "hostel") {
          if (!logisticsData.messTimings.breakfast || !logisticsData.messTimings.lunch || !logisticsData.messTimings.dinner) {
            alert("Please set all mess timings");
            return false;
          }
        }
        return true;
      case 6: // Materials
        const uploadedSubjectIds = materialsData.uploadedFiles.map(f => f.subjectId);
        const missingSubjects = academicsData.enrolledSubjects.filter(s => !uploadedSubjectIds.includes(s.id));

        if (missingSubjects.length > 0) {
          alert(`Please upload syllabi for: ${missingSubjects.map(s => s.name).join(", ")}`);
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const [statusMessage, setStatusMessage] = useState("");

  const handleComplete = async () => {
    setIsLoading(true);
    setStatusMessage("Creating your account...");

    try {
      // 1. Prepare Data
      // Generate UUIDs for new custom subjects
      const newSubjects = academicsData.enrolledSubjects.filter(s => s.isNew);
      const subjectIdMap = new Map<string, string>(); // temp-id -> real-uuid

      const newSubjectsData = newSubjects.map(s => {
        const newId = self.crypto.randomUUID();
        subjectIdMap.set(s.id, newId);
        return {
          id: newId,
          name: s.name,
          category: s.category || 'Custom'
        };
      });

      // Update Tuitions with new IDs
      const updatedTuitions = academicsData.tuitions.map(t => {
        const realId = subjectIdMap.get(t.subjectId) || t.subjectId;
        return { ...t, subjectId: realId };
      });

      // Prepare Timetable Data
      const timetableData: any[] = [];
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

      // A. User-Defined Blocks
      if (academicsData.timetable.length > 0) {
        academicsData.timetable.forEach(block => {
          let finalSubjectId = block.subjectId;
          // Map temp ID to real ID if applicable
          if (finalSubjectId && subjectIdMap.has(finalSubjectId)) {
            finalSubjectId = subjectIdMap.get(finalSubjectId) || finalSubjectId;
          }

          // Locate period
          const period = academicsData.periods.find(p => p.id === block.periodId);
          if (period && finalSubjectId) {
            timetableData.push({
              day: block.day,
              start_time: period.startTime,
              end_time: period.endTime,
              subject_id: finalSubjectId,
              type: 'College'
            });
          }
        });
      }

      // B. Break Blocks
      academicsData.periods.filter(p => p.type === 'Break').forEach(period => {
        days.forEach(day => {
          timetableData.push({
            day: day,
            start_time: period.startTime,
            end_time: period.endTime,
            subject_id: null,
            type: 'Break'
          });
        });
      });

      // 2. Sign Up with ALL Data
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: identityData.fullName,
            university: identityData.university,
            major: identityData.major,
            academic_year: identityData.academicYear,
            chronotype: identityData.chronotype,
            focus_duration: identityData.focusDuration,
            wake_time: bioData.wakeTime,
            sleep_time: bioData.sleepTime,
            chore_buffer: bioData.choreBuffer,
            min_attendance: academicsData.minAttendance,
            enforce_attendance: academicsData.enforceAttendance,
            next_exam_date: academicsData.nextExamDate ? academicsData.nextExamDate : null,
            college_start_time: academicsData.collegeStartTime,
            college_end_time: academicsData.collegeEndTime,
            living_situation: logisticsData.livingSituation,
            commute_minutes: logisticsData.commuteMinutes,
            mess_timings: logisticsData.messTimings,
            tuitions: updatedTuitions,
            lifestyle_activities: materialsData.lifestyleActivities,
            new_subjects: newSubjectsData,
            timetable_data: timetableData
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Signup failed - no user returned");

      // **CRITICAL FIX:** Ensure the user is actually logged in before syllabus processing.
      // (Even if the DB trigger confirms the email instantly, signUp might not return a session
      // if project settings strictly enforce email confirmation flows).
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        console.warn("Auto-login sequence warning:", signInError.message);
      }

      const userId = authData.user.id;

      // Process Syllabi (if any were uploaded)
      if (materialsData.uploadedFiles.length > 0) {
        let count = 0;
        for (const fileData of materialsData.uploadedFiles) {
          if (fileData.file) {
            count++;
            const subject = academicsData.enrolledSubjects.find(s => s.id === fileData.subjectId);
            const subjectName = subject ? subject.name : "Unknown Subject";

            setStatusMessage(`Processing syllabus for ${subjectName} (${count}/${materialsData.uploadedFiles.length})...`);

            try {
              // Now uses the new recursive tree parser
              await parseAndSaveSyllabus(fileData.file, userId, subjectName);
            } catch (e) {
              console.error("Syllabus parsing failed", e);
              toast.error(`Syllabus for ${subjectName} failed to process.`);
            }
          }
        }
      }

      setStatusMessage("Finalizing setup...");
      toast.success("Welcome to Veda! Your setup is complete.");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Registration failed:", error);
      toast.error(error.message || "Registration failed");
    }
    setIsLoading(false);
    setStatusMessage("");
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="account"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-card border-border/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 bg-card border-border/50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 h-12 bg-card border-border/50"
                  required
                />
                {confirmPassword && password === confirmPassword && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                )}
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <IdentityStep
            data={identityData}
            onChange={(data) => setIdentityData({ ...identityData, ...data })}
          />
        );
      case 3:
        return (
          <BioRhythmsStep
            data={bioData}
            onChange={(data) => setBioData({ ...bioData, ...data })}
          />
        );
      case 4:
        return (
          <AcademicsStep
            data={academicsData}
            onChange={(data) => setAcademicsData({ ...academicsData, ...data })}
          />
        );
      case 5:
        return (
          <LogisticsStep
            data={logisticsData}
            onChange={(data) => setLogisticsData({ ...logisticsData, ...data })}
          />
        );
      case 6:
        return (
          <MaterialsStep
            data={materialsData}
            enrolledSubjects={academicsData.enrolledSubjects}
            onChange={(data) => setMaterialsData({ ...materialsData, ...data })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 gradient-mesh opacity-30" />
      <div className="absolute inset-0 grid-pattern opacity-10" />

      <div className="relative z-10 flex min-h-screen">
        {/* Left Side - Progress */}
        <div className="hidden lg:flex w-80 shrink-0 border-r border-border/50 p-8 flex-col">
          <Link to="/" className="flex items-center gap-3 mb-12">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary"
            >
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </motion.div>
            <span className="font-display text-xl font-semibold">NeuroCanopy</span>
          </Link>

          <OnboardingProgress steps={steps} currentStep={currentStep} />

          <div className="mt-auto">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:text-primary/80">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Mobile Header */}
          <div className="lg:hidden p-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Leaf className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-display font-semibold">NeuroCanopy</span>
              </Link>
              <div className="text-sm text-muted-foreground">
                Step {currentStep} of {steps.length}
              </div>
            </div>
            {/* Mobile Progress Bar */}
            <div className="mt-4 h-1 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12">
            <div className="max-w-2xl mx-auto">
              {/* Step Header */}
              <motion.div
                key={`header-${currentStep}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <h1 className="font-display text-2xl sm:text-3xl font-bold">
                  {steps[currentStep - 1].title}
                </h1>
                <p className="text-muted-foreground mt-2">
                  {steps[currentStep - 1].description}
                </p>
              </motion.div>

              {/* Step Content */}
              <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
            </div>
          </div>

          {/* Navigation Footer */}
          <div className="border-t border-border/50 p-4 sm:p-6">
            <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
              <Button
                variant="ghost"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>

              <div className="hidden sm:flex items-center gap-2">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={`w-2 h-2 rounded-full transition-colors ${step.id === currentStep
                      ? "bg-primary"
                      : step.id < currentStep
                        ? "bg-primary/50"
                        : "bg-muted"
                      }`}
                  />
                ))}
              </div>

              <Button
                variant="hero"
                onClick={nextStep}
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full"
                  />
                ) : currentStep === steps.length ? (
                  <>
                    Complete Setup
                    <Check className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Continue</span>
                    <span className="sm:hidden">Next</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
          {isLoading && statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center pb-4 text-sm text-primary animate-pulse"
            >
              {statusMessage}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
