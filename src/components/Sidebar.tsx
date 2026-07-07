import { motion } from "motion/react";
import {
  LayoutDashboard,
  Brain,
  Layers,
  Sparkles,
  Cpu,
  Share2,
  Settings as SettingsIcon,
  Mic,
} from "lucide-react";
import { ModuleId, ModuleInfo } from "../types";

interface SidebarProps {
  activeModule: ModuleId;
  setActiveModule: (id: ModuleId) => void;
  voiceActive: boolean;
  setVoiceActive: (active: boolean) => void;
}

const MODULES: ModuleInfo[] = [
  { id: 'dashboard', label: 'Dashboard Insights', description: 'Get personalized suggestions and view project stats', iconName: 'LayoutDashboard' },
  { id: 'brain', label: 'My Notes & Ideas', description: 'Store memories, research, and general notes', iconName: 'Brain' },
  { id: 'projects', label: 'Project & Task Planner', description: 'Plan projects and generate task roadmaps with AI', iconName: 'Layers' },
  { id: 'factory', label: 'AI Content Generator', description: 'Turn a single idea into drafts for different channels', iconName: 'Sparkles' },
  { id: 'automation', label: 'Automation Workflows', description: 'Configure triggers and multi-step AI pipelines', iconName: 'Cpu' },
  { id: 'graph', label: 'Knowledge Graph Map', description: 'Interactive visual map of how your notes connect', iconName: 'Share2' },
  { id: 'settings', label: 'Workspace Settings', description: 'Configure your name, goals, and clear data', iconName: 'Settings' },
];

export default function Sidebar({ activeModule, setActiveModule, voiceActive, setVoiceActive }: SidebarProps) {
  const getIcon = (name: string, active: boolean) => {
    const color = active ? "text-blue-400" : "text-neutral-500 group-hover:text-slate-300";
    const className = `w-5 h-5 transition-colors duration-200 ${color}`;
    switch (name) {
      case 'LayoutDashboard': return <LayoutDashboard className={className} />;
      case 'Brain': return <Brain className={className} />;
      case 'Layers': return <Layers className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'Cpu': return <Cpu className={className} />;
      case 'Share2': return <Share2 className={className} />;
      case 'Settings': return <SettingsIcon className={className} />;
      default: return <LayoutDashboard className={className} />;
    }
  };

  return (
    <div className="w-80 h-full border-r border-white/5 glass-card flex flex-col justify-between p-6 relative select-none">
      {/* Dynamic Grid Background Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.04),transparent_50%)] pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-10">
          <div className="relative">
            <div className="w-8 h-8 flex items-center justify-center bg-white rounded-lg">
              <div className="w-4 h-4 bg-black rounded-sm transform rotate-45"></div>
            </div>
            <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-400 border border-[#020306] rounded-full animate-pulse" />
          </div>
          <div>
            <h1 className="font-sans font-bold tracking-tight text-lg text-white">Personal OS</h1>
            <p className="font-mono text-[9px] text-blue-400 font-bold uppercase tracking-[0.2em] leading-none">AI Sync Active</p>
          </div>
        </div>

        {/* Modules Section */}
        <div className="space-y-1.5">
          <p className="font-mono text-[10px] text-white/30 uppercase tracking-[0.2em] mb-4 pl-3">Workspace Modules</p>
          {MODULES.map((mod) => {
            const isActive = activeModule === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => setActiveModule(mod.id)}
                className="group relative w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 text-left cursor-pointer overflow-hidden"
              >
                {/* Active Indicator Slide */}
                {isActive && (
                  <motion.div
                    layoutId="active-module-bg"
                    className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                {/* Left Glowing bar */}
                {isActive && (
                  <motion.div
                    layoutId="active-module-bar"
                    className="absolute left-0 top-3 bottom-3 w-1 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-r-md"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                <div className="relative z-10 flex items-center justify-center">
                  {getIcon(mod.iconName, isActive)}
                </div>

                <div className="relative z-10 flex-1 min-w-0">
                  <div className={`font-sans text-[13px] font-medium transition-colors duration-200 ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                    {mod.label}
                  </div>
                  <div className="font-sans text-[10.5px] text-white/40 truncate mt-0.5 group-hover:text-white/60 transition-colors">
                    {mod.description}
                  </div>
                </div>

                {/* Dynamic mini action bubble */}
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.6)] z-10" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Voice Core Controller */}
      <div className="relative z-10 mt-6 pt-6 border-t border-white/5">
        <button
          onClick={() => setVoiceActive(!voiceActive)}
          className={`w-full group relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-500 cursor-pointer overflow-hidden ${
            voiceActive
              ? "bg-blue-500/10 border-blue-500/30 shadow-[0_0_25px_rgba(59,130,246,0.08)]"
              : "bg-white/2 border-white/5 hover:border-white/10"
          }`}
        >
          {voiceActive && (
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.12),transparent_70%)] animate-pulse" />
          )}

          <div className="flex items-center gap-3 relative z-10">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
              voiceActive ? "bg-blue-500 text-black shadow-[0_0_15px_rgba(59,130,246,0.6)]" : "bg-white/5 text-slate-400"
            }`}>
              <Mic className={`w-4.5 h-4.5 ${voiceActive ? "animate-bounce" : ""}`} />
            </div>
            <div className="text-left">
              <div className="font-sans text-xs font-semibold text-white tracking-tight">
                {voiceActive ? "VOICE ASSISTANT LIVE" : "AI VOICE ASSISTANT"}
              </div>
              <div className="font-mono text-[9px] text-white/40 mt-0.5 uppercase tracking-wider">
                {voiceActive ? "Listening in real-time" : "Click to start voice chat"}
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <div className={`w-2.5 h-2.5 rounded-full ${voiceActive ? "bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.6)] animate-pulse" : "bg-white/20"}`} />
          </div>
        </button>
      </div>
    </div>
  );
}
