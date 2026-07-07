import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp,
  AlertTriangle,
  Zap,
  BookOpen,
  Compass,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { ExecutiveInsight } from "../types";

interface DashboardProps {
  projectsCount: number;
  openTasksCount: number;
  notesCount: number;
  onCommitTask: (taskTitle: string) => void;
}

export default function ExecutiveDashboard({
  projectsCount,
  openTasksCount,
  notesCount,
  onCommitTask,
}: DashboardProps) {
  const [insights, setInsights] = useState<ExecutiveInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [decisionInput, setDecisionInput] = useState("");
  const [decisionCritique, setDecisionCritique] = useState("");
  const [critiquing, setCritiquing] = useState(false);

  // Core fallback insights to keep UX pristine immediately, while server resolves
  const fallbackInsights: ExecutiveInsight = {
    highRoiTask: "Organize project priorities and refine task list",
    roiExplanation: "Structuring your active goals will help clear cognitive overhead and keep your roadmap moving smoothly.",
    greatestRisk: "Losing track of important reminders due to scattered notes.",
    bottleneck: "Unlinked research notes and missing checklist steps in your active projects.",
    learningRecommendation: "Explore productive workflow design, spaced repetition revision, and prompt engineering.",
    careerOpportunity: "Maximize personal output by standardizing your daily system routine.",
    decisionRecommendation: "Archive older, completed projects to keep your main dashboard clean.",
    weeklyGoalProgress: 72,
  };

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/intelligence/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectsCount, openTasksCount, notesCount }),
      });
      if (res.ok) {
        const data = await res.json();
        setInsights(data);
      } else {
        setInsights(fallbackInsights);
      }
    } catch (e) {
      console.warn("Server connection failed, utilizing localized memory brain.");
      setInsights(fallbackInsights);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [projectsCount, openTasksCount, notesCount]);

  const handleDecisionCritique = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionInput.trim()) return;
    setCritiquing(true);
    try {
      const res = await fetch("/api/intelligence/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              sender: "user",
              text: `Act as a brutal, elite executive strategist and performance psychologist. Analyze this proposed decision I am struggling with: "${decisionInput}". Critique the weaknesses, blind spots, cognitive biases, and provide a single high-impact recommendation. Keep it within 3 concise bullet points. No conversational filler.`,
            },
          ],
          workspaceContext: { projectsCount, openTasksCount, notesCount },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDecisionCritique(data.text);
      } else {
        setDecisionCritique("Decision analysis fallback:\n- Break down the choice into small, daily milestones.\n- Prioritize clarity over rapid progress.\n- Standardize your daily routine to stay balanced.");
      }
    } catch (err) {
      setDecisionCritique("Decision analysis fallback:\n- Focus on small, sequential steps.\n- Organize priorities first to clear overhead.\n- Keep track of decisions on your project board.");
    } finally {
      setCritiquing(false);
    }
  };

  const current = insights || fallbackInsights;

  return (
    <div className="space-y-6 relative z-10 max-w-6xl mx-auto pb-10">
      {/* Top Welcome Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-sans font-extrabold text-2xl md:text-3xl tracking-tight text-white flex items-center gap-3">
            Dashboard Insights
            <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-[0.2em] animate-pulse">
              Live AI Suggestions
            </span>
          </h2>
          <p className="text-neutral-400 text-sm mt-1">
            Active Workspace Overview: {projectsCount} projects, {openTasksCount} pending tasks, {notesCount} saved notes.
          </p>
        </div>

        <button
          onClick={fetchInsights}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl border border-white/5 bg-white/3 text-xs font-mono text-slate-300 hover:text-white hover:border-white/10 transition-all duration-300 cursor-pointer flex items-center gap-2"
        >
          <Sparkles className={`w-3.5 h-3.5 text-blue-400 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Refreshing..." : "Refresh Insights"}
        </button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Priority Leverage Node (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Action Hub Card */}
          <div className="relative overflow-hidden rounded-2xl border border-white/5 glass-card p-6">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                <Zap className="w-6 h-6 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-[10px] text-blue-400 uppercase tracking-[0.2em] font-bold">SUGGESTED NEXT ACTION</p>
                <h3 className="font-sans font-bold text-lg md:text-xl text-white mt-1 tracking-tight">
                  {current.highRoiTask}
                </h3>
                <p className="text-neutral-300 text-sm mt-2.5 leading-relaxed">
                  {current.roiExplanation}
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={() => onCommitTask(current.highRoiTask)}
                    className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-200 text-black font-semibold text-xs tracking-tight transition-all duration-300 flex items-center gap-1.5 cursor-pointer shadow-[0_4px_20px_rgba(255,255,255,0.1)]"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Commit to Task Board
                  </button>
                  <div className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 font-mono text-[11px] text-slate-300">
                    Recommended Impact: <span className="text-blue-400 font-bold font-sans">High</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tactical Risk Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Risk Card */}
            <div className="rounded-2xl border border-red-500/10 bg-red-500/5 backdrop-blur-md p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3.5">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span className="font-mono text-[10px] text-red-400 uppercase tracking-[0.2em] font-bold">POTENTIAL WORKLOAD RISK</span>
                </div>
                <p className="font-sans font-semibold text-white tracking-tight text-sm leading-snug">
                  {current.greatestRisk}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-red-500/10 flex items-center justify-between">
                <span className="text-slate-500 font-mono text-[10px]">Severity: Moderate</span>
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              </div>
            </div>

            {/* Bottleneck Card */}
            <div className="rounded-2xl border border-amber-500/10 bg-amber-500/5 backdrop-blur-md p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="font-mono text-[10px] text-amber-400 uppercase tracking-[0.2em] font-bold">CURRENT WORKSPACE BOTTLENECK</span>
                </div>
                <p className="font-sans font-semibold text-white tracking-tight text-sm leading-snug">
                  {current.bottleneck}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-amber-500/10">
                <span className="text-slate-500 font-mono text-[10px] flex items-center gap-1">
                  AI Tip: Link related notes to find patterns
                </span>
              </div>
            </div>
          </div>

          {/* Strategic Vectors Block */}
          <div className="rounded-2xl border border-white/5 glass-card p-6 space-y-4">
            <h4 className="font-mono text-[10px] text-white/30 uppercase tracking-[0.2em]">Growth & Learning Suggestions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/2 border border-white/5 flex gap-3">
                <BookOpen className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-sans font-semibold text-white text-xs">Recommended Learning</h5>
                  <p className="text-neutral-300 text-xs mt-1 leading-relaxed">{current.learningRecommendation}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/2 border border-white/5 flex gap-3">
                <Compass className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-sans font-semibold text-white text-xs">Strategic Career Tips</h5>
                  <p className="text-neutral-300 text-xs mt-1 leading-relaxed">{current.careerOpportunity}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Decision Critique & Metrics System (Span 1) */}
        <div className="space-y-6">
          {/* Tactical Strain / Progress Meter */}
          <div className="rounded-2xl border border-white/5 glass-card p-6">
            <h4 className="font-mono text-[10px] text-white/30 uppercase tracking-[0.2em] mb-4">WORKSPACE STATUS SUMMARY</h4>
            <div className="flex items-center justify-between mb-2">
              <span className="font-sans text-xs text-slate-400">Workload Efficiency</span>
              <span className="font-mono text-sm font-semibold text-white">{current.weeklyGoalProgress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden relative">
              <motion.div
                className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-indigo-500 to-blue-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${current.weeklyGoalProgress}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </div>
            <p className="font-sans text-[10.5px] text-neutral-400 mt-3 leading-relaxed">
              Your active workspace is running smoothly. Connect your unlinked research notes to find patterns!
            </p>
          </div>

          {/* Dynamic Pending Decision Resolver */}
          <div className="rounded-2xl border border-white/5 glass-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <h4 className="font-mono text-[10px] text-white/60 uppercase tracking-[0.2em]">AI DECISION ASSISTANT</h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal mb-4">
                Struggling with a decision? Enter it below and the AI will analyze potential blindspots and suggest balanced recommendations.
              </p>

              <form onSubmit={handleDecisionCritique} className="space-y-3">
                <textarea
                  value={decisionInput}
                  onChange={(e) => setDecisionInput(e.target.value)}
                  placeholder="e.g., Should I focus on learning a new skill or build a portfolio project first?"
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                />

                <button
                  type="submit"
                  disabled={critiquing || !decisionInput.trim()}
                  className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer disabled:opacity-50"
                >
                  {critiquing ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                      Deconstructing Bias...
                    </>
                  ) : (
                    <>
                      Challenge Assumptions <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Critique Output Display */}
            <AnimatePresence>
              {decisionCritique && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 p-4 rounded-xl bg-black/40 border border-white/5 font-sans text-xs text-slate-300 leading-relaxed whitespace-pre-line"
                >
                  <p className="font-mono text-[9px] text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-1 font-bold">
                    <Sparkles className="w-3 h-3" /> Tactical Breakdown
                  </p>
                  {decisionCritique}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
