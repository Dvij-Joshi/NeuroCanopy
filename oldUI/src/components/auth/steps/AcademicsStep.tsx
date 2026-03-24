import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Plus, X, AlertTriangle, Clock, BookOpen, ChevronDown, Check, Coffee } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- Time Helpers ---
const timeToMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const minutesToTime = (minutes: number) => {
  let m = minutes % (24 * 60);
  if (m < 0) m += 24 * 60;

  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
};
// --------------------

interface Subject {
  id: string;
  name: string;
  category: string;
  isNew?: boolean;
}

interface Tuition {
  id: string;
  subjectId: string;
  subjectName: string; // Store name for UI display
  time: string;
  drain: "low" | "high";
}

interface TimetableBlock {
  day: string;
  periodId: string;
  volume: number; // For visualization
  subjectId: string | null; // null = Free
}

interface Period {
  id: string;
  startTime: string;
  endTime: string;
  label: string; // "Lecture 1", "Break", etc.
  type?: 'Lecture' | 'Break';
}

interface AcademicsStepProps {
  data: {
    minAttendance: number;
    enforceAttendance: boolean;
    nextExamDate: string;
    tuitions: Tuition[];
    collegeStartTime: string;
    collegeEndTime: string;
    timetable: TimetableBlock[];
    enrolledSubjects: Subject[];
    periods: Period[];
  };
  onChange: (data: Partial<AcademicsStepProps["data"]>) => void;
}

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const AcademicsStep = ({ data, onChange }: AcademicsStepProps) => {
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [subjectSelectKey, setSubjectSelectKey] = useState(0); // Force reset Select

  // Initialize periods if empty
  useEffect(() => {
    if (!data.periods || data.periods.length === 0) {
      if (!data.collegeStartTime || !data.collegeEndTime) return;

      const slots: Period[] = [];
      let currentHour = parseInt(data.collegeStartTime.split(':')[0]);
      const endHour = parseInt(data.collegeEndTime.split(':')[0]);
      let currentMin = parseInt(data.collegeStartTime.split(':')[1] || "0");

      let count = 1;
      while (currentHour < endHour || (currentHour === endHour && currentMin < parseInt(data.collegeEndTime.split(':')[1] || "0"))) {
        const startStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;

        // Default 60 min slots
        let endH = currentHour + 1;
        let endM = currentMin;
        const endStr = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

        slots.push({
          id: Date.now().toString() + count,
          startTime: startStr,
          endTime: endStr,
          label: `Lecture ${count}`,
          type: 'Lecture'
        });

        currentHour++;
        count++;
      }
      if (slots.length > 0) {
        onChange({ periods: slots });
      }
    }
  }, [data.collegeStartTime, data.collegeEndTime]);

  /* REMOVED: Fetch subjects from Supabase - user only wants custom subjects 
  useEffect(() => {
    // ...
  }, []);
  */
  useEffect(() => {
    setLoadingSubjects(false);
  }, []);

  const handleAddEnrolledSubject = (subjectId: string) => {
    setSubjectSelectKey(prev => prev + 1); // Reset Select
    if (subjectId === "other") {
      setIsAddingSubject(true);
      return;
    }
    const subject = availableSubjects.find(s => s.id === subjectId);
    if (subject && !data.enrolledSubjects.some(s => s.id === subject.id)) {
      onChange({ enrolledSubjects: [...data.enrolledSubjects, subject] });
    }
  };

  const handleConfirmCustomSubject = async () => {
    if (!newSubjectName.trim()) return;

    // Create a local temporary subject
    const newSubject: Subject = {
      id: `temp-${Date.now()}`,
      name: newSubjectName.trim(),
      category: 'Extra',
      isNew: true
    };

    setAvailableSubjects([...availableSubjects, newSubject]);
    onChange({ enrolledSubjects: [...data.enrolledSubjects, newSubject] });
    setNewSubjectName("");
    setIsAddingSubject(false);
  };

  const addTuition = () => {
    const newTuition: Tuition = {
      id: Date.now().toString(),
      subjectId: "",
      subjectName: "",
      time: "",
      drain: "low",
    };
    onChange({ tuitions: [...data.tuitions, newTuition] });
  };

  const updateTuition = (id: string, updates: Partial<Tuition>) => {
    onChange({
      tuitions: data.tuitions.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    });
  };

  const removeTuition = (id: string) => {
    onChange({ tuitions: data.tuitions.filter((t) => t.id !== id) });
  };

  // Period Management
  const addPeriod = () => {
    const lastPeriod = data.periods && data.periods.length > 0 ? data.periods[data.periods.length - 1] : null;
    let newStart = data.collegeStartTime || "09:00";

    if (lastPeriod) {
      newStart = lastPeriod.endTime;
    }

    // Default 1 hour length
    const [h, m] = newStart.split(':').map(Number);
    let endH = (h + 1) % 24;
    let endM = m;
    const newEnd = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

    // Smart label generation
    const lecturesCount = (data.periods || []).filter(p => !p.type || p.type === 'Lecture').length;
    const nextLabel = `Lecture ${lecturesCount + 1}`;

    const newPeriod: Period = {
      id: Date.now().toString(),
      startTime: newStart,
      endTime: newEnd,
      label: nextLabel,
      type: 'Lecture'
    };

    onChange({ periods: [...(data.periods || []), newPeriod] });
  };

  const updatePeriod = (id: string, field: keyof Period, value: any) => {
    const periods = [...(data.periods || [])];
    const index = periods.findIndex(p => p.id === id);
    if (index === -1) return;

    // Update current period
    periods[index] = { ...periods[index], [field]: value };

    // Cascade Time Updates
    if (field === 'endTime' && index < periods.length - 1) {
      // Automatically update the start time of the next period
      periods[index + 1] = { ...periods[index + 1], startTime: value };
    }

    // Smart Label Update interaction with Type
    if (field === 'type') {
      if (value === 'Break') {
        periods[index].label = 'Break';
      } else if (value === 'Lecture' && periods[index].label === 'Break') {
        // Recalculate label? Or just set it to generic "Lecture" and let user fix?
        // Better: Find out which lecture number it is.
        // But that's complex since we are mid-update.
        // Simple fallback:
        periods[index].label = `Lecture`;
      }
    }

    onChange({ periods });
  };

  const removePeriod = (id: string) => {
    onChange({ periods: (data.periods || []).filter(p => p.id !== id) });
  };

  const handleGridClick = (day: string, periodId: string) => {
    // Check if slot exists
    const existingIndex = data.timetable.findIndex(t => t.day === day && t.periodId === periodId);
    let newTimetable = [...data.timetable];

    // Cycle through enrolled subjects + Free (null)
    // Order: Free -> Subject 1 -> Subject 2 ... -> Free

    let currentSubjectId = existingIndex >= 0 ? data.timetable[existingIndex].subjectId : null;
    let nextSubjectId: string | null = null;

    if (currentSubjectId === null) {
      // If free, pick first subject
      if (data.enrolledSubjects.length > 0) nextSubjectId = data.enrolledSubjects[0].id;
    } else {
      // Find current subject index
      const subIndex = data.enrolledSubjects.findIndex(s => s.id === currentSubjectId);
      if (subIndex >= 0 && subIndex < data.enrolledSubjects.length - 1) {
        nextSubjectId = data.enrolledSubjects[subIndex + 1].id;
      } else {
        nextSubjectId = null; // Back to free
      }
    }

    const block: TimetableBlock = {
      day,
      periodId: periodId,
      volume: 1,
      subjectId: nextSubjectId
    };

    if (existingIndex >= 0) {
      if (nextSubjectId === null) {
        // Remove if filtering empty blocks, or just update to null
        newTimetable[existingIndex] = block;
      } else {
        newTimetable[existingIndex] = block;
      }
    } else {
      newTimetable.push(block);
    }

    onChange({ timetable: newTimetable });
  };

  const getSlotSubject = (day: string, periodId: string) => {
    const block = data.timetable.find(t => t.day === day && t.periodId === periodId);
    if (!block || !block.subjectId) return null;
    return data.enrolledSubjects.find(s => s.id === block.subjectId);
  };

  // Handle College Start Time Change (Shift all periods)
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value;

    // If we have periods, shift them
    if (data.periods && data.periods.length > 0) {
      const currentStartMinutes = timeToMinutes(data.periods[0].startTime);
      const newStartMinutes = timeToMinutes(newStartTime);
      const diff = newStartMinutes - currentStartMinutes;

      if (diff !== 0) {
        const newPeriods = data.periods.map(p => ({
          ...p,
          startTime: minutesToTime(timeToMinutes(p.startTime) + diff),
          endTime: minutesToTime(timeToMinutes(p.endTime) + diff)
        }));
        onChange({ collegeStartTime: newStartTime, periods: newPeriods });
        return;
      }
    }

    onChange({ collegeStartTime: newStartTime });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* 1. College Details */}
      <div className="space-y-4">
        <div>
          <h3 className="font-display text-lg font-semibold">College Timings</h3>
          <p className="text-sm text-muted-foreground mt-1">When does your day start and end?</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Time</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="time"
                value={data.collegeStartTime}
                onChange={handleStartTimeChange}
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>End Time</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="time"
                value={data.collegeEndTime}
                onChange={(e) => onChange({ collegeEndTime: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 1.5 Period Configuration */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold">Time Slots (Periods)</h3>
            <p className="text-sm text-muted-foreground mt-1">Customize your lecture timings</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addPeriod}>
            <Plus className="h-4 w-4 mr-1" />
            Add Period
          </Button>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
          {(data.periods || []).map((period, index) => (
            <div key={period.id} className={cn(
              "flex items-center gap-2 p-3 rounded-lg border bg-card/50 transition-colors",
              period.type === 'Break' ? "border-amber-500/30 bg-amber-500/5" : "border-border/50"
            )}>
              <div className="flex flex-col items-center gap-1 mr-1">
                <span className="text-xs font-medium text-muted-foreground w-6 text-center">{index + 1}</span>
                <button
                  type="button"
                  onClick={() => updatePeriod(period.id, 'type', period.type === 'Break' ? 'Lecture' : 'Break')}
                  className={cn(
                    "p-1 rounded-md transition-colors",
                    period.type === 'Break' ? "text-amber-500 bg-amber-500/10" : "text-muted-foreground hover:bg-muted"
                  )}
                  title="Toggle Break"
                >
                  <Coffee className="h-3.5 w-3.5" />
                </button>
              </div>

              <Input
                value={period.label}
                onChange={(e) => updatePeriod(period.id, 'label', e.target.value)}
                className="h-8 text-sm flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 font-medium"
                placeholder="Label"
              />
              <div className="flex items-center gap-1">
                <Input
                  type="time"
                  value={period.startTime}
                  onChange={(e) => updatePeriod(period.id, 'startTime', e.target.value)}
                  className="h-8 w-24 text-xs font-mono"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="time"
                  value={period.endTime}
                  onChange={(e) => updatePeriod(period.id, 'endTime', e.target.value)}
                  className="h-8 w-24 text-xs font-mono"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => removePeriod(period.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {(!data.periods || data.periods.length === 0) && (
            <div className="text-center p-4 text-sm text-muted-foreground border border-dashed rounded-lg">
              No periods defined. Add one to start scheduling.
            </div>
          )}
        </div>
      </div>

      {/* 2. Enrolled Subjects */}
      <div className="space-y-4">
        <div>
          <h3 className="font-display text-lg font-semibold">Your Subjects</h3>
          <p className="text-sm text-muted-foreground mt-1">Add subjects you are studying this semester</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {data.enrolledSubjects.map(subject => (
            <div key={subject.id} className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium border border-primary/20">
              {subject.name}
              <button
                onClick={() => onChange({ enrolledSubjects: data.enrolledSubjects.filter(s => s.id !== subject.id) })}
                className="hover:text-primary/80"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Select key={subjectSelectKey} onValueChange={handleAddEnrolledSubject}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Add a subject..." />
            </SelectTrigger>
            <SelectContent>
              {availableSubjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
              <SelectItem value="other" className="font-medium text-primary">
                + Add Custom Subject
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isAddingSubject && (
          <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
            <Input
              placeholder="Enter subject name..."
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmCustomSubject();
                if (e.key === 'Escape') setIsAddingSubject(false);
              }}
            />
            <Button size="icon" onClick={handleConfirmCustomSubject}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setIsAddingSubject(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* 3. Timetable Grid */}
      <div className="space-y-4">
        <div>
          <h3 className="font-display text-lg font-semibold">Weekly Schedule</h3>
          <p className="text-sm text-muted-foreground mt-1">Click cells to toggle subjects (Free &rarr; Subject 1 &rarr; Subject 2...)</p>
        </div>

        <div className="glass rounded-xl p-4 overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="grid grid-cols-7 gap-1 mb-2">
              <div className="text-xs text-muted-foreground font-medium p-2"></div>
              {days.map((day) => (
                <div key={day} className="text-xs text-muted-foreground font-medium p-2 text-center uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            {(data.periods || []).map((period) => (
              <div key={period.id} className="grid grid-cols-7 gap-1 mb-1">
                <div className="text-[10px] text-muted-foreground p-1 flex flex-col items-end justify-center pr-2 leading-tight">
                  <span className={cn("font-medium", period.type === 'Break' ? "text-amber-500" : "text-foreground")}>
                    {period.startTime}
                  </span>
                  <span className="opacity-70">{period.endTime}</span>
                </div>

                {period.type === 'Break' ? (
                  <div className="col-span-6 flex items-center justify-center bg-amber-500/10 border border-amber-500/20 rounded-md">
                    <span className="text-xs font-medium text-amber-500 tracking-widest uppercase opacity-80">
                      {period.label || "Break"}
                    </span>
                  </div>
                ) : (
                  days.map((day) => {
                    const subject = getSlotSubject(day, period.id);
                    return (
                      <div
                        key={`${day}-${period.id}`}
                        onClick={() => handleGridClick(day, period.id)}
                        className={cn(
                          "h-12 rounded-md border text-[10px] font-medium flex items-center justify-center text-center cursor-pointer transition-all p-1 truncate select-none",
                          subject
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/30 border-transparent hover:border-primary/30 text-muted-foreground"
                        )}
                      >
                        {subject ? subject.name : "Free"}
                      </div>
                    );
                  })
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Tuitions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold">Tuitions / Extra Classes</h3>
            <p className="text-sm text-muted-foreground mt-1">Outside of college hours</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addTuition}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>

        {data.tuitions.length > 0 && (
          <div className="space-y-3">
            {data.tuitions.map((tuition) => (
              <motion.div
                key={tuition.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <Select
                    value={tuition.subjectId}
                    onValueChange={(val) => {
                      const sub = availableSubjects.find(s => s.id === val) || data.enrolledSubjects.find(s => s.id === val);
                      updateTuition(tuition.id, { subjectId: val, subjectName: sub?.name || "" });
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.enrolledSubjects.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                      {/* Also show all available subjects if they want to pick something else */}
                      {availableSubjects.filter(s => !data.enrolledSubjects.find(es => es.id === s.id)).map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Time (e.g., Mon 5PM)"
                    value={tuition.time}
                    onChange={(e) => updateTuition(tuition.id, { time: e.target.value })}
                    className="flex-1 h-10 bg-card border-border/50"
                  />

                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => updateTuition(tuition.id, { drain: "low" })}
                      className={cn(
                        "px-3 h-10 rounded-lg text-xs font-medium transition-colors",
                        tuition.drain === "low"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
                          : "bg-card border border-border/50 text-muted-foreground"
                      )}
                    >
                      Low
                    </button>
                    <button
                      type="button"
                      onClick={() => updateTuition(tuition.id, { drain: "high" })}
                      className={cn(
                        "px-3 h-10 rounded-lg text-xs font-medium transition-colors",
                        tuition.drain === "high"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/50"
                          : "bg-card border border-border/50 text-muted-foreground"
                      )}
                    >
                      High
                    </button>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => removeTuition(tuition.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Exam Date */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <h3 className="font-display text-lg font-semibold">Next Big Exam</h3>
        </div>

        <div className="glass rounded-xl p-6">
          <Label htmlFor="examDate" className="text-sm text-muted-foreground mb-2 block">
            14 days before this date, we'll switch to "Cram Mode"
          </Label>
          <Input
            id="examDate"
            type="date"
            value={data.nextExamDate}
            onChange={(e) => onChange({ nextExamDate: e.target.value })}
            className="h-12 bg-card border-border/50"
          />
        </div>
      </div>

      {/* Attendance Policy */}
      <div className="space-y-4">
        <div className="glass rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Minimum Attendance</Label>
            <div className="text-xl font-display font-bold text-primary">{data.minAttendance}%</div>
          </div>
          <Slider
            value={[data.minAttendance]}
            onValueChange={(value) => onChange({ minAttendance: value[0] })}
            max={100}
            min={50}
            step={5}
            className="w-full"
          />
        </div>
      </div>
    </motion.div>
  );
};
