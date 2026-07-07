import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Layers,
  Clock,
  AlertOctagon,
  CheckCircle2,
  Circle,
  Play,
  FileSpreadsheet,
  Plus,
  Loader,
  TrendingDown,
  BookOpen,
} from "lucide-react";
import { Project, Task } from "../types";

interface ProjectBoardProps {
  projects: Project[];
  onAddProject: (project: Project) => void;
  onUpdateTaskStatus: (projectId: string, taskId: string, status: Task["status"]) => void;
}

export default function ProjectBoard({ projects, onAddProject, onUpdateTaskStatus }: ProjectBoardProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || "");
  const [creatingProject, setCreatingProject] = useState(false);

  // New project forms
  const [newProjName, setNewProjName] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [loading, setLoading] = useState(false);

  // Documentation Generation Drawer
  const [docLoading, setDocLoading] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState("");

  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim() || !newProjDesc.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/intelligence/project-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProjName, description: newProjDesc }),
      });

      if (res.ok) {
        const data = await res.json();
        const newProject: Project = {
          id: `proj_${Date.now()}`,
          name: newProjName,
          description: newProjDesc,
          progress: 0,
          timeline: data.timeline,
          riskRating: data.riskRating as any,
          aiReport: data.aiReport,
          tasks: data.tasks.map((t: any, index: number) => ({
            id: `task_${Date.now()}_${index}`,
            title: t.title,
            status: "todo",
            priority: t.priority,
            estimatedHours: t.estimatedHours,
            aiRiskText: t.aiRiskText,
          })),
        };
        onAddProject(newProject);
        setSelectedProjectId(newProject.id);
        setNewProjName("");
        setNewProjDesc("");
        setCreatingProject(false);
      }
    } catch (error) {
      console.error("Failed to plan project with AI:", error);
      // Fallback local model
      const fallbackProject: Project = {
        id: `proj_${Date.now()}`,
        name: newProjName,
        description: newProjDesc,
        progress: 0,
        timeline: "4 weeks",
        riskRating: "medium",
        tasks: [
          { id: `t1_${Date.now()}`, title: "Initialize architecture repo structures", status: "todo", priority: "high", estimatedHours: 8 },
          { id: `t2_${Date.now()}`, title: "Establish interface contracts", status: "todo", priority: "medium", estimatedHours: 12 },
        ],
      };
      onAddProject(fallbackProject);
      setSelectedProjectId(fallbackProject.id);
      setCreatingProject(false);
    } finally {
      setLoading(false);
    }
  };

  const generateSprintDoc = async () => {
    if (!activeProject) return;
    setDocLoading(true);
    setGeneratedDoc("");
    try {
      const res = await fetch("/api/intelligence/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              sender: "user",
              text: `Act as a Principal Software Architect. Draft a professional technical API and module documentation brief for this active sprint project:
                Project Name: "${activeProject.name}"
                Project Description: "${activeProject.description}"
                Active Tasks: ${JSON.stringify(activeProject.tasks.map((t) => t.title))}

                Include a clear architectural flowchart draft, a set of recommended tech stack components, and database table outlines. Style it beautifully with structured headings and professional layout logic.`,
            },
          ],
          workspaceContext: {},
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedDoc(data.text);
      } else {
        setGeneratedDoc("Failed to generate documentation package.");
      }
    } catch (e) {
      setGeneratedDoc("Cognitive stream offline. Connect operational API link.");
    } finally {
      setDocLoading(false);
    }
  };

  const getRiskColor = (rating: Project["riskRating"]) => {
    switch (rating) {
      case "critical":
        return "text-red-400 bg-red-950/40 border-red-500/20";
      case "medium":
        return "text-amber-400 bg-amber-950/40 border-amber-500/20";
      default:
        return "text-emerald-400 bg-emerald-950/40 border-emerald-500/20";
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-sans font-extrabold text-2xl tracking-tight text-white flex items-center gap-2">
            AI Project Architect
          </h2>
          <p className="text-neutral-400 text-xs">
            Dynamic strategic planning. AI explodes high-level product dreams into structured, risk-quantified task roadmaps.
          </p>
        </div>

        <button
          onClick={() => setCreatingProject(!creatingProject)}
          className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-200 text-black font-semibold text-xs tracking-tight transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-[0_4px_15px_rgba(255,255,255,0.1)]"
        >
          <Plus className="w-4 h-4" /> Synthesize Product Roadmap
        </button>
      </div>

      {/* Synthesis Panel Drawer */}
      <AnimatePresence>
        {creatingProject && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-white/5 glass-card p-6 space-y-4">
              <h3 className="font-sans font-bold text-sm text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400 animate-pulse" />
                Product Vision Decomposition
              </h3>

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="font-mono text-[9px] text-white/40 uppercase tracking-[0.2em] block mb-1.5">
                      Roadmap Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newProjName}
                      onChange={(e) => setNewProjName(e.target.value)}
                      placeholder="e.g. Autonomous Trading Pipeline"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="font-mono text-[9px] text-white/40 uppercase tracking-[0.2em] block mb-1.5">
                      System Scope / Business Logic Goals
                    </label>
                    <input
                      type="text"
                      required
                      value={newProjDesc}
                      onChange={(e) => setNewProjDesc(e.target.value)}
                      placeholder="e.g. Pull ticker feeds, run sentiment models on social vectors, and execute limit triggers automatically."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setCreatingProject(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 rounded-xl bg-white hover:bg-slate-200 text-black font-semibold text-xs tracking-tight transition-all duration-300 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-3.5 h-3.5 animate-spin" />
                        Analyzing system architecture...
                      </>
                    ) : (
                      <>Decompose Vision</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Product Rails */}
        <div className="space-y-3">
          <p className="font-mono text-[9px] text-white/30 uppercase tracking-[0.2em] pl-2">ACTIVE ROADMAPS</p>
          <div className="space-y-1.5">
            {projects.map((p) => {
              const isActive = p.id === selectedProjectId;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedProjectId(p.id);
                    setGeneratedDoc("");
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? "bg-white/5 border-white/10 shadow-[0_4px_15px_rgba(255,255,255,0.05)]"
                      : "bg-white/2 border-white/5 hover:border-white/10"
                  }`}
                >
                  <div>
                    <h4 className={`font-sans font-bold text-xs tracking-tight transition-colors ${isActive ? "text-blue-400" : "text-white"}`}>
                      {p.name}
                    </h4>
                    <p className="text-white/40 text-[10.5px] truncate mt-1 leading-normal">
                      {p.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="w-24 h-1.5 rounded-full bg-white/5 overflow-hidden relative">
                      <div className="absolute left-0 top-0 bottom-0 bg-blue-400" style={{ width: `${p.progress}%` }} />
                    </div>
                    <span className="font-mono text-[9px] text-white/40">{p.progress}% Completed</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Active Workspace Matrix (Span 3) */}
        {activeProject ? (
          <div className="lg:col-span-3 space-y-6">
            {/* Active Project Metadata Header */}
            <div className="rounded-2xl border border-white/5 glass-card p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1 md:col-span-2">
                <h3 className="font-sans font-extrabold text-xl text-white tracking-tight">{activeProject.name}</h3>
                <p className="text-neutral-400 text-xs leading-relaxed">{activeProject.description}</p>
              </div>

              <div className="flex flex-col justify-between items-end md:border-l border-white/5 md:pl-6">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="font-mono text-[9px] text-white/30">EST. SCHEDULE</span>
                    <span className="font-sans font-bold text-xs text-white flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-blue-400" /> {activeProject.timeline || "In Development"}
                    </span>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="font-mono text-[9px] text-white/30">RISK RATING</span>
                    <span className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded border mt-0.5 ${getRiskColor(activeProject.riskRating)}`}>
                      {activeProject.riskRating}
                    </span>
                  </div>
                </div>

                <div className="mt-4 w-full flex justify-end">
                  <button
                    onClick={generateSprintDoc}
                    disabled={docLoading}
                    className="px-3.5 py-1.5 rounded-lg border border-white/10 bg-white/5 text-[10.5px] font-mono text-slate-300 hover:text-white hover:border-white/20 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    {docLoading ? (
                      <>
                        <Loader className="w-3 h-3 animate-spin" /> Compiling Specs...
                      </>
                    ) : (
                      <>
                        <FileSpreadsheet className="w-3.5 h-3.5" /> Sprint Spec Sheet
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* AI Architectural Insight Section */}
            {activeProject.aiReport && (
              <div className="p-5 rounded-2xl border border-indigo-500/10 bg-indigo-500/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                <h4 className="font-mono text-[9px] text-indigo-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-1 font-bold">
                  <BookOpen className="w-3.5 h-3.5" /> AI SYSTEM DESIGN ANALYTICS
                </h4>
                <p className="text-neutral-300 text-xs leading-relaxed font-sans">{activeProject.aiReport}</p>
              </div>
            )}

            {/* Generated Documentation Panel */}
            <AnimatePresence>
              {generatedDoc && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="p-5 rounded-2xl border border-white/5 bg-[#020306]/80 backdrop-blur-md text-slate-200"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                    <span className="font-mono text-xs text-blue-400 flex items-center gap-1 font-bold">
                      <FileSpreadsheet className="w-4 h-4" /> COMPILED TECH SPECS
                    </span>
                    <button
                      onClick={() => setGeneratedDoc("")}
                      className="font-mono text-[9px] text-white/30 hover:text-white cursor-pointer"
                    >
                      CLEAR TERMINAL
                    </button>
                  </div>
                  <pre className="font-mono text-[11px] leading-relaxed whitespace-pre-wrap overflow-auto max-h-96">
                    {generatedDoc}
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sprint Task Board Grid */}
            <div className="space-y-3">
              <h4 className="font-mono text-[10px] text-white/30 uppercase tracking-[0.2em]">ROADMAP EXECUTION SPRINT</h4>

              <div className="space-y-2">
                {activeProject.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl border border-white/5 glass-card hover:border-white/10 hover:bg-white/5 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <button
                        onClick={() => {
                          const nextStatus =
                            task.status === "todo"
                              ? "progress"
                              : task.status === "progress"
                              ? "completed"
                              : "todo";
                          onUpdateTaskStatus(activeProject.id, task.id, nextStatus);
                        }}
                        className="mt-0.5 text-slate-500 hover:text-blue-400 cursor-pointer"
                      >
                        {task.status === "completed" ? (
                          <CheckCircle2 className="w-4.5 h-4.5 text-blue-400" />
                        ) : task.status === "progress" ? (
                          <Play className="w-4.5 h-4.5 text-indigo-400 fill-indigo-500/20" />
                        ) : (
                          <Circle className="w-4.5 h-4.5 text-white/20" />
                        )}
                      </button>

                      <div className="space-y-1">
                        <span className={`font-sans text-xs font-semibold leading-snug ${task.status === "completed" ? "line-through text-slate-500" : "text-white"}`}>
                          {task.title}
                        </span>
                        {task.aiRiskText && (
                          <p className="text-[10.5px] text-amber-400/90 leading-relaxed font-sans flex items-start gap-1">
                            <AlertOctagon className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                            {task.aiRiskText}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 justify-end flex-shrink-0">
                      <span className="font-mono text-[9px] text-white/40 px-2 py-0.5 rounded bg-white/2 border border-white/5">
                        {task.estimatedHours} hrs
                      </span>

                      <span className={`font-mono text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${
                        task.priority === "high"
                          ? "text-red-400 bg-red-500/10 border-red-500/20"
                          : task.priority === "medium"
                          ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                          : "text-slate-400 bg-white/5 border-white/5"
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-3 h-96 flex items-center justify-center border border-dashed border-white/5 rounded-2xl">
            <span className="text-slate-500 font-sans text-xs">No active roadmaps detected. Initiate decomposition.</span>
          </div>
        )}
      </div>
    </div>
  );
}
