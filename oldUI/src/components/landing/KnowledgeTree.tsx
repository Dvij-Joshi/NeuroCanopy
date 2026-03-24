import { motion } from "framer-motion";

const nodes = [
  { id: 1, x: 50, y: 50, size: 16, status: "green", delay: 0 },
  { id: 2, x: 30, y: 35, size: 12, status: "green", delay: 0.1 },
  { id: 3, x: 70, y: 35, size: 12, status: "yellow", delay: 0.15 },
  { id: 4, x: 20, y: 20, size: 10, status: "green", delay: 0.2 },
  { id: 5, x: 40, y: 22, size: 10, status: "red", delay: 0.25 },
  { id: 6, x: 60, y: 20, size: 10, status: "yellow", delay: 0.3 },
  { id: 7, x: 80, y: 22, size: 10, status: "green", delay: 0.35 },
  { id: 8, x: 35, y: 65, size: 11, status: "green", delay: 0.4 },
  { id: 9, x: 65, y: 68, size: 11, status: "red", delay: 0.45 },
  { id: 10, x: 50, y: 80, size: 14, status: "yellow", delay: 0.5 },
];

const connections = [
  { from: 1, to: 2 },
  { from: 1, to: 3 },
  { from: 2, to: 4 },
  { from: 2, to: 5 },
  { from: 3, to: 6 },
  { from: 3, to: 7 },
  { from: 1, to: 8 },
  { from: 1, to: 9 },
  { from: 8, to: 10 },
  { from: 9, to: 10 },
];

const getNodeColor = (status: string) => {
  switch (status) {
    case "green":
      return { bg: "bg-emerald-500", glow: "shadow-emerald-500/50" };
    case "yellow":
      return { bg: "bg-amber-500", glow: "shadow-amber-500/50" };
    case "red":
      return { bg: "bg-rose-500", glow: "shadow-rose-500/50" };
    default:
      return { bg: "bg-primary", glow: "shadow-primary/50" };
  }
};

export const KnowledgeTree = () => {
  return (
    <div className="relative w-full h-full min-h-[400px]">
      {/* Connecting Lines SVG */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
        {connections.map((conn, i) => {
          const fromNode = nodes.find((n) => n.id === conn.from)!;
          const toNode = nodes.find((n) => n.id === conn.to)!;
          return (
            <motion.line
              key={i}
              x1={`${fromNode.x}%`}
              y1={`${fromNode.y}%`}
              x2={`${toNode.x}%`}
              y2={`${toNode.y}%`}
              stroke="hsl(var(--border))"
              strokeWidth="2"
              strokeOpacity="0.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 + i * 0.05 }}
            />
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.map((node) => {
        const colors = getNodeColor(node.status);
        return (
          <motion.div
            key={node.id}
            className={`absolute ${colors.bg} rounded-full shadow-lg ${colors.glow}`}
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              width: node.size * 2,
              height: node.size * 2,
              transform: "translate(-50%, -50%)",
              zIndex: 1,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: node.delay,
            }}
            whileHover={{
              scale: 1.3,
              boxShadow: `0 0 30px hsl(var(--primary) / 0.5)`,
            }}
          >
            {/* Pulse ring for red nodes */}
            {node.status === "red" && (
              <motion.div
                className="absolute inset-0 rounded-full bg-rose-500"
                animate={{
                  scale: [1, 1.8],
                  opacity: [0.5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};
