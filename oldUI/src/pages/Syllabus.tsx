import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Plus, Search, BookOpen, MoreVertical, Layers, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { getCourses, addCourse, Course } from "@/lib/db";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const Syllabus = () => {
  const { user, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // New Course Form State
  const [newCourse, setNewCourse] = useState({
    title: "",
    code: "",
    professor: "",
    credits: 3,
    totalChapters: 10,
    color: "#3b82f6"
  });

  useEffect(() => {
    if (authLoading) return; // wait for auth session to resolve
    fetchCourses();
  }, [user, authLoading]);

  const fetchCourses = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const fetchedCourses = await getCourses(user.id);
      setCourses(fetchedCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async () => {
    if (!user) return;
    try {
      await addCourse(user.id, {
        ...newCourse,
        completedChapters: 0,
      });
      toast.success("Course added successfully");
      setIsAddDialogOpen(false);
      fetchCourses(); // Refresh list
      // Reset form
      setNewCourse({
        title: "",
        code: "",
        professor: "",
        credits: 3,
        totalChapters: 10,
        color: "#3b82f6"
      });
    } catch (error) {
      console.error("Error adding course:", error);
      toast.error("Failed to add course");
    }
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto h-[calc(100vh-theme(spacing.20))] flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-2xl md:text-3xl font-display font-bold">Syllabus</h1>
            <p className="text-muted-foreground mt-1">Manage your courses and learning path</p>
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
                  Add Course
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Course</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">Title</Label>
                    <Input id="title" value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="code" className="text-right">Code</Label>
                    <Input id="code" value={newCourse.code} onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })} className="col-span-3" placeholder="e.g. CS101" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="prof" className="text-right">Professor</Label>
                    <Input id="prof" value={newCourse.professor} onChange={(e) => setNewCourse({ ...newCourse, professor: e.target.value })} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="credits" className="text-right">Credits</Label>
                    <Input id="credits" type="number" value={newCourse.credits} onChange={(e) => setNewCourse({ ...newCourse, credits: parseInt(e.target.value) })} className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddCourse}>Save Course</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-[400px_1fr] gap-6 flex-1 min-h-0">
          {/* Course List */}
          <div className="flex flex-col gap-4 min-h-0 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/50"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {loading && <div className="text-center p-4">Loading courses...</div>}
              {!loading && filteredCourses.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                  <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  No courses found
                </div>
              )}
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedCourse(course)}
                  className={cn(
                    "p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02]",
                    selectedCourse?.id === course.id
                      ? "bg-primary/10 border-primary shadow-sm"
                      : "bg-background/40 border-border/50 hover:bg-accent/50"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div
                      className="text-xs font-semibold px-2 py-1 rounded-md"
                      style={{ backgroundColor: `${course.color}20`, color: course.color }}
                    >
                      {course.code}
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm mb-1 line-clamp-1">{course.title}</h3>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{course.professor}</span>
                    <span>{Math.round((course.completedChapters / course.totalChapters) * 100)}%</span>
                  </div>
                  <div className="h-1 mt-3 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(course.completedChapters / course.totalChapters) * 100}%`,
                        backgroundColor: course.color,
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Course Detail View */}
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 min-h-0 overflow-y-auto custom-scrollbar relative">
            <AnimatePresence mode="wait">
              {selectedCourse ? (
                <motion.div
                  key={selectedCourse.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant="secondary"
                          style={{ backgroundColor: `${selectedCourse.color}20`, color: selectedCourse.color }}
                        >
                          {selectedCourse.code}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{selectedCourse.credits} Credits</span>
                      </div>
                      <h2 className="text-3xl font-display font-bold">{selectedCourse.title}</h2>
                      <div className="flex items-center gap-2 text-muted-foreground mt-2">
                        <GraduationCap className="h-4 w-4" />
                        <span>{selectedCourse.professor}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* placeholder for nodes/syllabus tree - will implement next step */}
                  <div className="p-8 border border-dashed border-border rounded-xl text-center">
                    <Layers className="h-10 w-10 mx-auto text-muted-foreground mb-3 opacity-50" />
                    <p className="text-muted-foreground">Syllabus content & knowledge tree integration coming soon.</p>
                    <Button variant="link" className="mt-2">View Knowledge Tree</Button>
                  </div>

                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground"
                >
                  <div className="h-20 w-20 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                    <BookOpen className="h-10 w-10 opacity-50" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Select a course</h3>
                  <p className="max-w-xs mx-auto">
                    Choose a course from the list to view its syllabus, schedule, and resources.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Syllabus;
