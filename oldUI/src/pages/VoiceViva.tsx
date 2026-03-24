import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Mic,
  MicOff,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  Clock,
  Star,
  BookOpen,
  Volume2,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { getCourses, getVivaSessions, saveVivaSession, Course, VivaSession } from "@/lib/db";
import { toast } from "sonner";

const sampleQuestions = [
  "Explain the core concept of this subject.",
  "How does this relate to real-world applications?",
  "Describe the process in detail.",
  "What are the key limitations of this theory?",
];

const VoiceViva = () => {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [vivaStarted, setVivaStarted] = useState(false);

  // Data State
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<VivaSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Viva Timer
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [fetchedCourses, fetchedSessions] = await Promise.all([
        getCourses(user.id),
        getVivaSessions(user.id)
      ]);
      setCourses(fetchedCourses);
      setSessions(fetchedSessions);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load viva data");
    } finally {
      setLoading(false);
    }
  };

  const handleStartViva = () => {
    setVivaStarted(true);
    setSessionStartTime(Date.now());
    setIsRecording(false);
    setCurrentQuestion(0);
  };

  const handleEndViva = async () => {
    if (!user || !selectedCourseId || !sessionStartTime) return;

    const durationSeconds = Math.round((Date.now() - sessionStartTime) / 1000);
    const randomScore = Math.floor(Math.random() * (100 - 70 + 1)) + 70; // Simulating AI score 70-100

    try {
      await saveVivaSession(user.id, {
        courseId: selectedCourseId,
        score: randomScore,
        durationSeconds: durationSeconds,
        createdAt: new Date().toISOString() // DB ignores this mostly but required by type
      });

      toast.success(`Session completed! Score: ${randomScore}%`);
      setVivaStarted(false);
      setSessionStartTime(null);
      fetchData(); // Refresh stats
    } catch (error) {
      console.error("Error saving session:", error);
      toast.error("Failed to save session result");
    }
  };

  // Stats Calculation
  const totalSessions = sessions.length;
  const averageScore = totalSessions > 0
    ? Math.round(sessions.reduce((acc, s) => acc + s.score, 0) / totalSessions)
    : 0;
  const totalTimeMinutes = Math.round(sessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60);

  // Determine "Best Subject"
  const courseScores: Record<string, { total: number, count: number }> = {};
  sessions.forEach(s => {
    if (!courseScores[s.courseId]) courseScores[s.courseId] = { total: 0, count: 0 };
    courseScores[s.courseId].total += s.score;
    courseScores[s.courseId].count += 1;
  });
  let bestSubject = "N/A";
  let maxAvg = -1;
  Object.entries(courseScores).forEach(([cId, data]) => {
    const avg = data.total / data.count;
    if (avg > maxAvg) {
      maxAvg = avg;
      const c = courses.find(c => c.id === cId);
      if (c) bestSubject = c.title;
    }
  });


  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
  };

  // Helper to format date relative
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  const getCourseTitle = (id: string) => courses.find(c => c.id === id)?.title || "Unknown Course";

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto h-[calc(100vh-theme(spacing.20))] flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 shrink-0"
        >
          <h1 className="text-2xl md:text-3xl font-display font-bold">Voice Viva</h1>
          <p className="text-muted-foreground mt-1">AI-powered oral examination practice</p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_350px] gap-6 flex-1 min-h-0">
          {/* Main Viva Area */}
          <div className="space-y-6 flex flex-col h-full overflow-y-auto custom-scrollbar pr-2">
            {!vivaStarted ? (
              /* Course Selection */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6"
              >
                <h2 className="font-display font-semibold text-lg mb-4">Select a Course</h2>
                {loading ? (
                  <div>Loading courses...</div>
                ) : courses.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl">
                    No courses found. Go to Syllabus to add one!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {courses.map((course) => (
                      <button
                        key={course.id}
                        onClick={() => setSelectedCourseId(course.id!)}
                        className={cn(
                          "rounded-xl border p-4 text-left transition-all",
                          selectedCourseId === course.id
                            ? "border-primary bg-primary/10"
                            : "border-border/50 bg-background/50 hover:bg-accent/50"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium truncate pr-2">{course.title}</h3>
                          {selectedCourseId === course.id && (
                            <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{course.code}</span>
                          <span>•</span>
                          <span>{course.credits} Credits</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <div className="mt-6 flex items-center gap-3">
                  <Button
                    variant="hero"
                    className="flex-1"
                    disabled={!selectedCourseId}
                    onClick={handleStartViva}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Viva Session
                  </Button>
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ) : (
              /* Active Viva Session */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 flex flex-col justify-between min-h-[500px]"
              >
                <div>
                  {/* Question Display */}
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                        Question {currentQuestion + 1}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{selectedCourse?.title}</span>
                    </div>
                    <p className="text-lg md:text-xl font-medium leading-relaxed">
                      {sampleQuestions[currentQuestion % sampleQuestions.length]}
                    </p>
                  </div>

                  {/* AI Orb Visualizer */}
                  <div className="relative flex items-center justify-center py-8">
                    <motion.div
                      animate={isRecording ? pulseAnimation : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="relative"
                    >
                      {/* Outer rings */}
                      {isRecording && (
                        <>
                          <motion.div
                            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 rounded-full border-2 border-primary"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                            className="absolute inset-0 rounded-full border border-primary"
                          />
                        </>
                      )}

                      {/* Main orb */}
                      <div
                        className={cn(
                          "h-32 w-32 rounded-full flex items-center justify-center transition-all duration-300",
                          isRecording
                            ? "bg-gradient-to-br from-primary to-primary/50 glow-primary"
                            : "bg-gradient-to-br from-muted to-muted/50"
                        )}
                      >
                        {isRecording ? (
                          <Mic className="h-12 w-12 text-primary-foreground" />
                        ) : (
                          <MicOff className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>
                    </motion.div>
                  </div>
                </div>

                <div>
                  {/* Controls */}
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-full"
                      onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    >
                      <RotateCcw className="h-5 w-5" />
                    </Button>

                    <Button
                      variant={isRecording ? "destructive" : "hero"}
                      size="lg"
                      className="h-14 w-14 rounded-full p-0"
                      onClick={() => setIsRecording(!isRecording)}
                    >
                      {isRecording ? (
                        <Pause className="h-6 w-6" />
                      ) : (
                        <Mic className="h-6 w-6" />
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-full"
                      onClick={() => setCurrentQuestion(currentQuestion + 1)}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Status */}
                  <div className="mt-2 text-center mb-6">
                    <p className="text-sm text-muted-foreground">
                      {isRecording ? "Listening... Speak your answer" : "Tap microphone to record answer"}
                    </p>
                  </div>

                  {/* End Session */}
                  <div className="pt-6 border-t border-border/50 flex justify-center">
                    <Button variant="outline" onClick={handleEndViva}>
                      End Session & Save
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6"
            >
              <h3 className="font-display font-semibold mb-4">Tips for Success</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/20 p-2">
                    <Volume2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Speak Clearly</p>
                    <p className="text-xs text-muted-foreground">Enunciate your words for better recognition</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/20 p-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Be Thorough</p>
                    <p className="text-xs text-muted-foreground">Cover all key points in your answer</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/20 p-2">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Pace Yourself</p>
                    <p className="text-xs text-muted-foreground">Take your time to formulate responses</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 flex flex-col h-full min-h-0">
            {/* Recent Sessions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 flex flex-col max-h-[50%]"
            >
              <h3 className="font-display font-semibold mb-4 shrink-0">Recent Sessions</h3>
              <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-1">
                {sessions.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-4">No sessions yet.</div>
                )}
                {sessions.map((session, index) => (
                  <motion.div
                    key={session.id || index}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="rounded-xl border border-border/50 bg-background/50 p-3"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{getCourseTitle(session.courseId)}</p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round(session.durationSeconds / 60)} min
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        <span className="text-sm font-medium">{session.score}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{formatDate(session.createdAt)}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shrink-0"
            >
              <h3 className="font-display font-semibold mb-4">Your Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Sessions</span>
                  <span className="font-medium">{totalSessions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Average Score</span>
                  <span className="font-medium text-emerald-500">{averageScore}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Best Subject</span>
                  <span className="font-medium truncate ml-2 max-w-[150px] text-right" title={bestSubject}>{bestSubject}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Practice Time</span>
                  <span className="font-medium">{totalTimeMinutes} min</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VoiceViva;
