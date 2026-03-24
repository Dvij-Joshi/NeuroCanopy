import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import * as d3 from "d3";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ZoomIn, ZoomOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getAllNodes, getCourses, KnowledgeNode, Course } from "@/lib/db";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TreeNode {
  id: string;
  name: string;
  status: "Mastered" | "Learning" | "Weak" | "New";
  retention: number;
  children?: TreeNode[];
  val?: number; // for d3
}

const KnowledgeTreePage = () => {
  const { user } = useAuth();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const [fetchedNodes, fetchedCourses] = await Promise.all([
          getAllNodes(user.uid),
          getCourses(user.uid)
        ]);

        // Temporary fix if nodes are empty to show something
        setNodes(fetchedNodes);
        setCourses(fetchedCourses);
      } catch (error) {
        console.error("Error fetching knowledge tree:", error);
        toast.error("Failed to load knowledge tree");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Transform flat nodes/courses into a tree structure for D3
  // Root -> Courses -> Nodes
  const buildTreeData = (): TreeNode | null => {
    // If we have no data yet and are loading, return null
    if (loading && !courses.length) return null;

    const root: TreeNode = {
      id: "root",
      name: "Knowledge Base",
      status: "Mastered",
      retention: 100,
      children: []
    };

    if (!courses.length && !nodes.length) {
      // Return dummy if empty to prevent crash
      return {
        ...root, children: [
          { id: "d1", name: "No Data", status: "New", retention: 0, val: 10 }
        ]
      };
    }

    // Group nodes by course
    courses.forEach(course => {
      const courseNodes = nodes.filter(n => n.courseId === course.id);
      const courseNode: TreeNode = {
        id: course.id || "unknown",
        name: course.title,
        status: "Learning", // Aggregate status could be calculated
        retention: 100,
        children: courseNodes.map(n => ({
          id: n.id || "unknown",
          name: n.title,
          status: n.status,
          retention: n.retention,
          val: n.estimatedHours || 1
        }))
      };
      root.children?.push(courseNode);
    });

    return root;
  };

  useEffect(() => {
    if (loading || !svgRef.current || !containerRef.current) return;

    const data = buildTreeData();
    if (!data) return;

    // Clear previous
    d3.select(svgRef.current).selectAll("*").remove();

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .style("font", "10px sans-serif");

    // Create a color scale based on status
    const color = (status: string) => {
      switch (status) {
        case "Mastered": return "#10b981"; // emerald-500
        case "Learning": return "#3b82f6"; // blue-500
        case "Weak": return "#f59e0b"; // amber-500
        default: return "#ef4444"; // red-500 or gray
      }
    };

    const root = d3.hierarchy(data)
      .sum(d => d.val || 1)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const pack = d3.pack()
      .size([width, height])
      .padding(3);

    const packedRoot = pack(root);

    const node = svg.selectAll("g")
      .data(packedRoot.descendants())
      .join("g")
      .attr("transform", d => `translate(${d.x},${d.y})`);

    node.append("circle")
      .attr("r", d => d.r)
      .attr("fill", d => color((d.data as TreeNode).status || "New"))
      .attr("fill-opacity", d => d.children ? 0.1 : 0.6)
      .attr("stroke", d => d.children ? color((d.data as TreeNode).status || "New") : "none")
      .transition().duration(1000)
      .attr("r", d => d.r); // Simple animation

    node.append("text")
      .attr("dy", d => d.children ? -d.r - 5 : 0)
      .style("text-anchor", "middle")
      .style("fill", "white")
      .style("font-size", d => d.children ? "12px" : "10px")
      .text(d => (d.data as TreeNode).name.substring(0, d.r / 3)) // Truncate based on radius
      .style("pointer-events", "none");

  }, [loading, nodes, courses]); // Re-run when data loads

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-theme(spacing.16))] relative flex flex-col">
        {/* Overlay Header */}
        <div className="absolute top-6 left-6 z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card/30 backdrop-blur-md p-4 rounded-xl border border-border/20"
          >
            <h1 className="text-2xl md:text-3xl font-display font-bold">Knowledge Tree</h1>
            <p className="text-muted-foreground mt-1">Visualize your neural mastery</p>
          </motion.div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-6 left-6 z-10">
          <div className="bg-card/30 backdrop-blur-md p-4 rounded-xl border border-border/20 flex gap-4">
            {["Mastered", "Learning", "Weak", "New"].map(status => (
              <div key={status} className="flex items-center gap-2">
                <div className={cn("w-3 h-3 rounded-full",
                  status === "Mastered" ? "bg-emerald-500" :
                    status === "Learning" ? "bg-blue-500" :
                      status === "Weak" ? "bg-amber-500" : "bg-red-500"
                )} />
                <span className="text-xs text-muted-foreground">{status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
          <Button size="icon" variant="outline" className="bg-card/30 backdrop-blur">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" className="bg-card/30 backdrop-blur">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" className="bg-card/30 backdrop-blur">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* D3 Graph Container */}
        <div ref={containerRef} className="flex-1 w-full h-full bg-gradient-to-b from-background to-secondary/10 overflow-hidden cursor-move">
          {loading && <div className="absolute inset-0 flex items-center justify-center pointer-events-none">Loading Neural Map...</div>}
          <svg ref={svgRef} className="w-full h-full" style={{ width: '100%', height: '100%' }}></svg>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default KnowledgeTreePage;
