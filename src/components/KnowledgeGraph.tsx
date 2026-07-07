import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Share2, Info, Search, HelpCircle, Eye, Calendar, Tag } from "lucide-react";
import { MemoryNode } from "../types";

interface KnowledgeGraphProps {
  memories: MemoryNode[];
}

interface PhysicsNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  title: string;
  category: string;
  content: string;
}

export default function KnowledgeGraph({ memories }: KnowledgeGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<MemoryNode | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [timeIndex, setTimeIndex] = useState(100); // Timeline filter percentage

  const nodesRef = useRef<PhysicsNode[]>([]);
  const isDraggingRef = useRef<string | null>(null);

  // Initialize node physics states and colors based on categories
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;

    const getCatColor = (cat: string) => {
      switch (cat) {
        case "pdf": return "#10b981"; // Emerald
        case "web": return "#3b82f6"; // Blue
        case "voice": return "#8b5cf6"; // Purple
        case "idea": return "#f59e0b"; // Amber
        default: return "#f8fafc"; // Slate
      }
    };

    // Merge or recreate nodes while maintaining position if they already exist
    const currentNodes = nodesRef.current;
    const nextNodes = memories.map((mem) => {
      const existing = currentNodes.find((n) => n.id === mem.id);
      if (existing) {
        existing.title = mem.title;
        existing.content = mem.content;
        return existing;
      }
      return {
        id: mem.id,
        x: width / 2 + (Math.random() - 0.5) * 200,
        y: height / 2 + (Math.random() - 0.5) * 200,
        vx: 0,
        vy: 0,
        radius: 14,
        color: getCatColor(mem.category),
        title: mem.title,
        category: mem.category,
        content: mem.content,
      };
    });

    nodesRef.current = nextNodes;
  }, [memories]);

  // Main high-performance Physics & Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const runSimulation = () => {
      const width = canvas.width;
      const height = canvas.height;

      const nodes = nodesRef.current;

      // 1. Calculate Multi-Node Repulsion Forces
      for (let i = 0; i < nodes.length; i++) {
        const nodeA = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeB = nodes[j];
          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;

          if (distance < 180) {
            const force = (180 - distance) * 0.015;
            const fx = (dx / distance) * force;
            const fy = (dy / distance) * force;

            nodeA.vx -= fx;
            nodeA.vy -= fy;
            nodeB.vx += fx;
            nodeB.vy += fy;
          }
        }
      }

      // 2. Calculate Bidirectional Linking Spring Forces
      memories.forEach((mem) => {
        const nodeA = nodes.find((n) => n.id === mem.id);
        if (!nodeA) return;

        mem.connections.forEach((connId) => {
          const nodeB = nodes.find((n) => n.id === connId);
          if (!nodeB) return;

          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;

          const targetDistance = 100;
          const k = 0.01; // Stiffness constant
          const force = (distance - targetDistance) * k;

          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;

          nodeA.vx += fx;
          nodeA.vy += fy;
          nodeB.vx -= fx;
          nodeB.vy -= fy;
        });
      });

      // 3. Central Gravity & Friction Dampening
      nodes.forEach((node) => {
        const dx = width / 2 - node.x;
        const dy = height / 2 - node.y;
        node.vx += dx * 0.0015;
        node.vy += dy * 0.0015;

        // Apply friction
        node.vx *= 0.85;
        node.vy *= 0.85;

        // Update positions if not actively dragged
        if (isDraggingRef.current !== node.id) {
          node.x += node.vx;
          node.y += node.vy;
        }

        // Boundary restraints
        node.x = Math.max(node.radius, Math.min(width - node.radius, node.x));
        node.y = Math.max(node.radius, Math.min(height - node.radius, node.y));
      });

      // 4. Render Layout Background
      ctx.clearRect(0, 0, width, height);

      // Render connection lines
      memories.forEach((mem) => {
        const nodeA = nodes.find((n) => n.id === mem.id);
        if (!nodeA) return;

        mem.connections.forEach((connId) => {
          const nodeB = nodes.find((n) => n.id === connId);
          if (!nodeB) return;

          // Check if connection is highlighted
          const isHighlighted =
            selectedNode && (selectedNode.id === mem.id || selectedNode.id === connId);

          ctx.beginPath();
          ctx.moveTo(nodeA.x, nodeA.y);
          ctx.lineTo(nodeB.x, nodeB.y);
          ctx.strokeStyle = isHighlighted ? "rgba(34,211,238,0.7)" : "rgba(38,38,38,0.3)";
          ctx.lineWidth = isHighlighted ? 2 : 1;
          ctx.stroke();
        });
      });

      // Render semantic node circles
      nodes.forEach((node) => {
        // Evaluate dynamic filter criteria (Search or Timeline)
        const matchesSearch =
          !searchTerm ||
          node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          node.content.toLowerCase().includes(searchTerm.toLowerCase());

        const opacity = matchesSearch ? 1 : 0.2;

        const isSelected = selectedNode?.id === node.id;

        // Outer glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + (isSelected ? 6 : 4), 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? "rgba(34,211,238,0.15)" : `${node.color}11`;
        ctx.fill();

        // Node center circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius - 2, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? "#ffffff" : node.color;
        ctx.globalAlpha = opacity;
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Semantic labeling texts
        ctx.font = "bold 9px monospace";
        ctx.fillStyle = isSelected ? "#22d3ee" : "#d4d4d4";
        ctx.textAlign = "center";
        ctx.fillText(
          node.title.length > 18 ? node.title.substring(0, 16) + ".." : node.title,
          node.x,
          node.y + node.radius + 14
        );
      });

      animationId = requestAnimationFrame(runSimulation);
    };

    animationId = requestAnimationFrame(runSimulation);
    return () => cancelAnimationFrame(animationId);
  }, [memories, selectedNode, searchTerm, timeIndex]);

  // Handle Dragging / Clicks on Canvas
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Detect click hits
    const nodes = nodesRef.current;
    let clickedNode: PhysicsNode | null = null;

    for (const node of nodes) {
      const dx = x - node.x;
      const dy = y - node.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < node.radius + 15) {
        clickedNode = node;
        break;
      }
    }

    if (clickedNode) {
      isDraggingRef.current = clickedNode.id;
      const memMatch = memories.find((m) => m.id === clickedNode!.id);
      if (memMatch) {
        setSelectedNode(memMatch);
      }
    } else {
      setSelectedNode(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dragNode = nodesRef.current.find((n) => n.id === isDraggingRef.current);
    if (dragNode) {
      dragNode.x = x;
      dragNode.y = y;
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = null;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-sans font-extrabold text-2xl tracking-tight text-white flex items-center gap-2">
            Semantic Knowledge Graph
          </h2>
          <p className="text-neutral-400 text-xs">
            Dynamic coordinate physics model mapping semantic relation pathways of your second brain in O(1) latency.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Graph Canvas Panel (Span 3) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-2xl border border-white/5 glass-card overflow-hidden relative">
            {/* Dynamic Search / Controls */}
            <div className="absolute top-4 left-4 right-4 z-20 flex gap-4 pointer-events-auto">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter semantic coordinate matches..."
                  className="w-full bg-[#020306]/80 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>

              {/* Informative category chips */}
              <div className="hidden md:flex gap-1.5 items-center px-4 rounded-xl bg-[#020306]/60 border border-white/5 text-[10px] font-mono text-slate-300">
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> PDF</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Web</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> Voice</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Ideas</div>
              </div>
            </div>

            {/* Canvas Element */}
            <canvas
              ref={canvasRef}
              width={800}
              height={450}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="w-full h-auto cursor-grab active:cursor-grabbing bg-[radial-gradient(#222_1px,transparent_1px)] [background-size:20px_20px]"
            />

            {/* Help Overlay bottom left */}
            <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 text-[10px] font-mono text-white/30 bg-[#020306]/80 px-3 py-1.5 rounded-lg border border-white/5">
              <HelpCircle className="w-3.5 h-3.5 text-blue-400" /> Drag nodes to balance topology constraints.
            </div>
          </div>

          {/* Chronological Slider */}
          <div className="rounded-xl border border-white/5 bg-white/2 p-4">
            <div className="flex justify-between text-xs font-mono text-slate-400 mb-2">
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-blue-400" /> Chronological Timeline Filter</span>
              <span>All Node Coordinates (100%)</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={timeIndex}
              onChange={(e) => setTimeIndex(Number(e.target.value))}
              className="w-full accent-blue-400 cursor-pointer h-1 rounded-lg bg-white/10 appearance-none"
            />
          </div>
        </div>

        {/* Selected Semantic Inspector Panel (Span 1) */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedNode ? (
              <motion.div
                key={selectedNode.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="rounded-2xl border border-white/5 glass-card p-5 h-full flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 font-bold">
                      {selectedNode.category}
                    </span>
                    <span className="text-white/30 font-mono text-[10px]">{selectedNode.createdAt}</span>
                  </div>

                  <div>
                    <h3 className="font-sans font-bold text-white text-base tracking-tight">{selectedNode.title}</h3>
                    <p className="text-neutral-300 text-xs mt-2.5 leading-relaxed font-sans max-h-48 overflow-y-auto pr-1">
                      {selectedNode.content}
                    </p>
                  </div>

                  {selectedNode.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {selectedNode.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-slate-300"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-white/5 pt-4 mt-6">
                  <span className="font-mono text-[9px] text-white/30 uppercase tracking-[0.2em] block mb-2 font-bold">
                    Bidirectional Connections
                  </span>
                  {selectedNode.connections.length > 0 ? (
                    <div className="space-y-1.5">
                      {selectedNode.connections.map((connId) => {
                        const connNode = memories.find((m) => m.id === connId);
                        return (
                          <div
                            key={connId}
                            className="p-2.5 rounded-lg bg-white/2 border border-white/5 text-xs text-slate-300 font-sans truncate"
                          >
                            {connNode ? connNode.title : `Node: ${connId}`}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-white/30 font-mono text-[10px] italic">No spatial connections configured.</p>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="h-full rounded-2xl border border-white/5 border-dashed p-6 flex flex-col items-center justify-center text-center text-slate-500">
                <Share2 className="w-8 h-8 text-white/10 mb-2" />
                <span className="font-sans text-xs">Click any node to inspect semantic connection paths and timeline indexing data.</span>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
