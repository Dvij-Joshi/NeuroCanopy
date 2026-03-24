import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Calendar as CalendarIcon, Clock, Plus, ChevronLeft, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { getSchedule, addScheduleEvent, toggleScheduleCompletion, ScheduleEvent, getTimetable } from "@/lib/db";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Schedule = () => {
  const { user } = useAuth();
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // New Event Form
  const [newEvent, setNewEvent] = useState({
    title: "",
    category: "Study" as ScheduleEvent["category"],
    startTime: "", // HH:mm string from input
    endTime: ""    // HH:mm string from input
  });

  useEffect(() => {
    fetchSchedule();
  }, [user, date]); // Refetch when user OR DATE changes

  const fetchSchedule = async () => {
    if (!user) return;
    try {
      setLoading(true);

      // Fetch both ad-hoc events and returning timetable
      const [adhocEvents, timetableData] = await Promise.all([
        getSchedule(user.id),
        getTimetable(user.id)
      ]);

      // 1. Filter ad-hoc events for selected date
      // Note: getSchedule currently returns ALL events. Ideally we filter in DB.
      // For now, filter in JS.
      const selDateStr = date.toISOString().split('T')[0];
      const dayEvents = adhocEvents.filter(e => e.startTime.startsWith(selDateStr));

      // 2. Process Timetable for selected day
      const daysKey = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]; // Match JS getDay()
      const currentDayName = daysKey[date.getDay()];

      const recurringEvents: ScheduleEvent[] = (timetableData as any[] || [])
        .filter(t => t.day === currentDayName)
        .map(t => {
          // Construct ISO strings for start/end on THIS date
          const [sH, sM] = t.start_time.split(':').map(Number);
          const [eH, eM] = t.end_time.split(':').map(Number);

          const startDate = new Date(date);
          startDate.setHours(sH, sM, 0, 0);

          const endDate = new Date(date);
          endDate.setHours(eH, eM, 0, 0);

          let title = "Unknown";
          let category: ScheduleEvent["category"] = "Class";

          if (t.type === 'Break') {
            title = "Break";
            category = "Life";
          } else if (t.subjects) {
            title = t.subjects.name;
            // Map subject category if needed?
            category = "Class";
          }

          return {
            id: `recurring-${t.id}-${selDateStr}`, // unique ID for key
            title: title,
            category: category,
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString(),
            completed: false, // Timetable events are reset daily? Or should we track completion?
            // For now, assume not completed. To track completion of recurring events, we need a separate 'completions' table.
            recurrence: 'Weekly'
          };
        });

      // 3. Merge and Sort
      const allEvents = [...dayEvents, ...recurringEvents].sort((a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );

      setEvents(allEvents);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      toast.error("Failed to load schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async () => {
    if (!user || !newEvent.title || !newEvent.startTime || !newEvent.endTime) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const start = new Date(date);
      const [startH, startM] = newEvent.startTime.split(':').map(Number);
      start.setHours(startH, startM);

      const end = new Date(date);
      const [endH, endM] = newEvent.endTime.split(':').map(Number);
      end.setHours(endH, endM);

      await addScheduleEvent(user.id, {
        title: newEvent.title,
        category: newEvent.category,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        completed: false
      });

      toast.success("Event added");
      setIsAddDialogOpen(false);
      fetchSchedule();
      setNewEvent({ title: "", category: "Study", startTime: "", endTime: "" });
    } catch (error) {
      console.error("Error adding event:", error);
      toast.error("Failed to add event");
    }
  };

  const handleToggleComplete = async (event: ScheduleEvent) => {
    if (!user || !event.id) return;
    try {
      // Optimistic update
      setEvents(prev => prev.map(e => e.id === event.id ? { ...e, completed: !e.completed } : e));

      await toggleScheduleCompletion(user.id, event.id, event.completed);
    } catch (error) {
      console.error("Error toggling event:", error);
      toast.error("Failed to update event");
      fetchSchedule(); // Revert on error
    }
  };

  // Helper to format time from ISO string
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto h-[calc(100vh-theme(spacing.20))] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-2xl md:text-3xl font-display font-bold">Today's Schedule</h1>
            <p className="text-muted-foreground mt-1">
              {date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-2"
          >
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Event
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Event</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">Title</Label>
                    <Input id="title" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">Category</Label>
                    <Select onValueChange={(val: any) => setNewEvent({ ...newEvent, category: val })} defaultValue="Study">
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Class">Class</SelectItem>
                        <SelectItem value="Study">Study</SelectItem>
                        <SelectItem value="Exam">Exam</SelectItem>
                        <SelectItem value="Life">Life</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="start" className="text-right">Start</Label>
                    <Input id="start" type="time" value={newEvent.startTime} onChange={e => setNewEvent({ ...newEvent, startTime: e.target.value })} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="end" className="text-right">End</Label>
                    <Input id="end" type="time" value={newEvent.endTime} onChange={e => setNewEvent({ ...newEvent, endTime: e.target.value })} className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddEvent}>Add Event</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>

        {/* Calendar Strip (Visual only for now) */}
        <div className="flex items-center justify-between bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setDate(new Date(date.setDate(date.getDate() - 1)))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[-2, -1, 0, 1, 2, 3, 4].map((offset) => {
              const d = new Date();
              d.setDate(new Date().getDate() + offset);
              const isToday = offset === 0;
              return (
                <div
                  key={offset}
                  className={cn(
                    "flex flex-col items-center justify-center w-14 h-20 rounded-xl border transition-all cursor-pointer",
                    isToday ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105" : "bg-background/50 border-border/50 hover:bg-accent"
                  )}
                >
                  <span className="text-xs font-medium opacity-80">{d.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                  <span className="text-xl font-bold">{d.getDate()}</span>
                </div>
              );
            })}
          </div>
          <Button variant="ghost" size="icon" onClick={() => setDate(new Date(date.setDate(date.getDate() + 1)))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Timeline */}
        <div className="flex-1 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="text-center py-10">Loading schedule...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No events scheduled. Time to plan your success!</p>
            </div>
          ) : (
            <div className="space-y-6 relative">
              {/* Time Indicator Line - Visual only */}
              <div className="absolute left-[70px] top-0 bottom-0 w-px bg-border/50" />

              {events.map((event, index) => (
                <motion.div
                  key={event.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex gap-6 group"
                >
                  <div className="w-[60px] text-right pt-2 text-sm text-muted-foreground font-medium">
                    {formatTime(event.startTime)}
                  </div>

                  <div className={cn(
                    "flex-1 p-4 rounded-xl border transition-all hover:shadow-md",
                    event.completed ? "bg-secondary/30 border-border opacity-60" : "bg-card border-border/50",
                    event.category === 'Study' && !event.completed && "border-l-4 border-l-primary bg-primary/5",
                    event.category === 'Class' && !event.completed && "border-l-4 border-l-blue-500 bg-blue-500/5",
                    event.category === 'Exam' && !event.completed && "border-l-4 border-l-amber-500 bg-amber-500/5",
                  )}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={cn("font-semibold mb-1", event.completed && "line-through")}>
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(event.startTime)} - {formatTime(event.endTime)}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-background border border-border/50">
                            {event.category}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleComplete(event)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {event.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
export default Schedule;
