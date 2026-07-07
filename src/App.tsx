import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, Activity, Wifi, ShieldAlert, Cpu } from "lucide-react";
import Sidebar from "./components/Sidebar";
import ExecutiveDashboard from "./components/ExecutiveDashboard";
import SecondBrain from "./components/SecondBrain";
import ProjectBoard from "./components/ProjectBoard";
import ContentFactory from "./components/ContentFactory";
import AutomationCenter from "./components/AutomationCenter";
import KnowledgeGraph from "./components/KnowledgeGraph";
import SettingsComponent from "./components/Settings";
import VoiceCore from "./components/VoiceCore";
import { ModuleId, MemoryNode, Project, AutomationWorkflow, Task } from "./types";

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>("dashboard");
  const [voiceActive, setVoiceActive] = useState(false);
  const [time, setTime] = useState("");

  // Global Context State managed centrally for ease of use and workspace synchronization
  const [memories, setMemories] = useState<MemoryNode[]>([
    {
      id: "mem_1",
      title: "Smart focus scheduling concept",
      category: "idea",
      content: "A simple goal planner that suggests high-focus times based on your current project workload and productivity levels.",
      createdAt: "Jul 7",
      connections: ["mem_2"],
      tags: ["productivity", "scheduling"],
    },
    {
      id: "mem_2",
      title: "Note relationship specification",
      category: "pdf",
      content: "A technical overview of how we automatically discover connections between notes inside the workspace for a clean second brain.",
      createdAt: "Jul 6",
      connections: ["mem_1"],
      tags: ["architecture", "notes-organization"],
    },
    {
      id: "mem_3",
      title: "Secure workspace integrations guidelines",
      category: "web",
      content: "Guidelines explaining how to connect external APIs securely on the server side without exposing keys to the browser.",
      createdAt: "Jul 5",
      connections: [],
      tags: ["security", "api"],
    },
  ]);

  const [projects, setProjects] = useState<Project[]>([
    {
      id: "proj_1",
      name: "Daily Focus Scheduling Assistant",
      description: "An interactive planner designed to schedule your daily focus sessions, reduce cognitive clutter, and track productivity.",
      progress: 33,
      timeline: "4 weeks",
      riskRating: "medium",
      aiReport: "This planning model calculates task priority scores dynamically to ensure you work on the most high-value goals first.",
      tasks: [
        { id: "task_1_1", title: "Set up local browser database storage", status: "completed", priority: "high", estimatedHours: 8, aiRiskText: "Warning: clearing your browser history will clear unsaved notes." },
        { id: "task_1_2", title: "Develop task priority scoring algorithms", status: "progress", priority: "medium", estimatedHours: 12, aiRiskText: "Need to handle incomplete task state edge cases elegantly." },
        { id: "task_1_3", title: "Design clean message handling pipelines", status: "todo", priority: "high", estimatedHours: 15, aiRiskText: "Ensure robust client-server secure request validation." },
      ],
    },
  ]);

  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([
    {
      id: "wf_1",
      name: "Note Processing Automation",
      trigger: "When new note added",
      actions: ["Summarize imported text", "Highlight key takeaways", "Generate helpful Q&A flashcards"],
      active: true,
      lastExecuted: "Jul 7 07:35",
    },
  ]);

  // Real-time HUD clock update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Centralized State Mutation Handlers
  const handleAddMemory = (memory: Partial<MemoryNode>) => {
    setMemories((prev) => [memory as MemoryNode, ...prev]);
  };

  const handleLinkMemories = (idA: string, idB: string) => {
    setMemories((prev) =>
      prev.map((m) => {
        if (m.id === idA && !m.connections.includes(idB)) {
          return { ...m, connections: [...m.connections, idB] };
        }
        if (m.id === idB && !m.connections.includes(idA)) {
          return { ...m, connections: [...m.connections, idA] };
        }
        return m;
      })
    );
  };

  const handleAddProject = (project: Project) => {
    setProjects((prev) => [project, ...prev]);
  };

  const handleUpdateTaskStatus = (projectId: string, taskId: string, status: Task["status"]) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;

        const updatedTasks = proj.tasks.map((task) => {
          if (task.id === taskId) {
            return { ...task, status };
          }
          return task;
        });

        const completedCount = updatedTasks.filter((t) => t.status === "completed").length;
        const calculatedProgress = Math.round((completedCount / updatedTasks.length) * 100);

        return {
          ...proj,
          tasks: updatedTasks,
          progress: calculatedProgress,
        };
      })
    );
  };

  const handleAddWorkflow = (wf: AutomationWorkflow) => {
    setWorkflows((prev) => [wf, ...prev]);
  };

  const handleToggleWorkflow = (id: string) => {
    setWorkflows((prev) =>
      prev.map((wf) => (wf.id === id ? { ...wf, active: !wf.active } : wf))
    );
  };

  const handleDeleteWorkflow = (id: string) => {
    setWorkflows((prev) => prev.filter((wf) => wf.id !== id));
  };

  const handleCommitTask = (taskTitle: string) => {
    if (projects.length === 0) return;
    const firstProjId = projects[0].id;

    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== firstProjId) return proj;
        const newTask: Task = {
          id: `task_committed_${Date.now()}`,
          title: taskTitle,
          status: "todo",
          priority: "high",
          estimatedHours: 6,
          aiRiskText: "Committed via Dashboard insights recommendation.",
        };
        const updatedTasks = [...proj.tasks, newTask];
        const completedCount = updatedTasks.filter((t) => t.status === "completed").length;
        return {
          ...proj,
          tasks: updatedTasks,
          progress: Math.round((completedCount / updatedTasks.length) * 100),
        };
      })
    );
  };

  // Renders correct active module screen
  const renderActiveModule = () => {
    switch (activeModule) {
      case "dashboard":
        return (
          <ExecutiveDashboard
            projectsCount={projects.length}
            openTasksCount={projects.reduce((acc, p) => acc + p.tasks.filter((t) => t.status !== "completed").length, 0)}
            notesCount={memories.length}
            onCommitTask={handleCommitTask}
          />
        );
      case "brain":
        return (
          <SecondBrain
            memories={memories}
            onAddMemory={handleAddMemory}
            onLinkMemories={handleLinkMemories}
          />
        );
      case "projects":
        return (
          <ProjectBoard
            projects={projects}
            onAddProject={handleAddProject}
            onUpdateTaskStatus={handleUpdateTaskStatus}
          />
        );
      case "factory":
        return <ContentFactory />;
      case "automation":
        return (
          <AutomationCenter
            workflows={workflows}
            onAddWorkflow={handleAddWorkflow}
            onToggleWorkflow={handleToggleWorkflow}
            onDeleteWorkflow={handleDeleteWorkflow}
          />
        );
      case "graph":
        return <KnowledgeGraph memories={memories} />;
      case "settings":
        return <SettingsComponent />;
      default:
        return <div className="text-center text-white py-12 text-xs">Module under construction.</div>;
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#020306] font-sans text-slate-200 flex select-none relative">
      {/* Absolute Dynamic Holographic Backdrop Lights */}
      <div className="absolute inset-0 neural-glow pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Sidebar navigation */}
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        voiceActive={voiceActive}
        setVoiceActive={setVoiceActive}
      />

      {/* Main Container Area */}
      <div className="flex-1 h-full flex flex-col overflow-hidden relative z-10">
        {/* Dynamic Space Top HUD Stat Rail */}
        <header className="h-16 px-8 border-b border-white/5 glass-card flex items-center justify-between relative z-10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
              <span className="font-mono text-[10.5px] uppercase tracking-widest text-blue-400 font-bold">AI Systems Connected</span>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-white/30" />
              <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest">AI INDEXER STATUS: ACTIVE & STABLE</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-white/60">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>{time} UTC</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-emerald-400">
              <Wifi className="w-3.5 h-3.5" /> SECURE LINK
            </div>
          </div>
        </header>

        {/* Dynamic Active Screens Layer */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full"
            >
              {renderActiveModule()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Immersive System Status Footer */}
        <footer className="h-8 px-8 flex items-center justify-between text-[9px] uppercase tracking-[0.2em] text-white/20 relative z-10 glass-card border-t border-white/5">
          <div className="flex items-center space-x-4">
            <span>Workspace Session: Active</span>
            <span className="w-px h-2 bg-white/10"></span>
            <span>API Latency: Normal</span>
            <span className="w-px h-2 bg-white/10"></span>
            <span>Storage: Secure Local Sandbox</span>
          </div>
          <div className="font-mono text-[9px]">
            (C) PERSONAL OS // LOCAL SECURE ENCRYPTION
          </div>
        </footer>
      </div>

      {/* Voice Consciousness Holographic Panel Overlay */}
      <VoiceCore
        active={voiceActive}
        onClose={() => setVoiceActive(false)}
        workspaceContext={{
          memoriesCount: memories.length,
          projectsCount: projects.length,
          tasks: projects.map((p) => p.name),
        }}
      />
    </div>
  );
}
