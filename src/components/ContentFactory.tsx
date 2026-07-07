import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Copy,
  Check,
  Send,
  Loader,
  Linkedin,
  Twitter,
  Mail,
  FileText,
  Megaphone,
  CheckCircle,
} from "lucide-react";
import { ContentFactoryOutput } from "../types";

export default function ContentFactory() {
  const [seedIdea, setSeedIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [outputs, setOutputs] = useState<ContentFactoryOutput | null>(null);
  const [activeTab, setActiveTab] = useState<keyof ContentFactoryOutput>("linkedin");

  // Refinement controls
  const [copied, setCopied] = useState(false);
  const [refinementText, setRefinementText] = useState("");
  const [refining, setRefining] = useState(false);

  const [editorContents, setEditorContents] = useState<ContentFactoryOutput>({
    linkedin: "",
    twitter: "",
    newsletter: "",
    executiveSummary: "",
    marketingPitch: "",
  });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seedIdea.trim()) return;

    setLoading(true);
    setOutputs(null);
    try {
      const res = await fetch("/api/intelligence/content-factory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seedIdea, selectedFormat: activeTab }),
      });

      if (res.ok) {
        const data = await res.json();
        setOutputs(data);
        setEditorContents(data);
      }
    } catch (error) {
      console.error("Content generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefineContent = async () => {
    if (!refinementText.trim() || !outputs) return;
    setRefining(true);
    try {
      const activeText = editorContents[activeTab];
      const res = await fetch("/api/intelligence/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              sender: "user",
              text: `Refine this content draft:\n"${activeText}"\n\nApply this command directly: "${refinementText}". Keep response strictly as the refined content block, matching the structure. No conversational preambles or greetings.`,
            },
          ],
          workspaceContext: {},
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setEditorContents((prev) => ({
          ...prev,
          [activeTab]: data.text,
        }));
        setRefinementText("");
      }
    } catch (e) {
      console.error("Refinement failed:", e);
    } finally {
      setRefining(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editorContents[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTabLabel = (tab: keyof ContentFactoryOutput) => {
    switch (tab) {
      case "linkedin":
        return { label: "LinkedIn Post", icon: <Linkedin className="w-3.5 h-3.5" /> };
      case "twitter":
        return { label: "Twitter Thread", icon: <Twitter className="w-3.5 h-3.5" /> };
      case "newsletter":
        return { label: "Editorial Newsletter", icon: <Mail className="w-3.5 h-3.5" /> };
      case "executiveSummary":
        return { label: "Executive Brief", icon: <FileText className="w-3.5 h-3.5" /> };
      case "marketingPitch":
        return { label: "Marketing Copy", icon: <Megaphone className="w-3.5 h-3.5" /> };
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div>
        <h2 className="font-sans font-extrabold text-2xl tracking-tight text-white flex items-center gap-2">
          AI Content Factory
        </h2>
        <p className="text-neutral-400 text-xs">
          Multi-vector cognitive distribution engine. Seed a single intellectual concept and multiply its surface reach.
        </p>
      </div>

      {/* Main Seed Creator */}
      <div className="rounded-2xl border border-white/5 glass-card p-6">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="font-mono text-[9px] text-white/40 uppercase tracking-[0.2em] block mb-2">
              Seed Conceptual Idea
            </label>
            <textarea
              required
              rows={3}
              value={seedIdea}
              onChange={(e) => setSeedIdea(e.target.value)}
              placeholder="e.g. Traditional software engineering is dead. We are moving towards declarative operating architectures where human intent is compiled directly to native binary by multi-modal reasoning lattices."
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !seedIdea.trim()}
              className="px-6 py-2.5 rounded-xl bg-white hover:bg-slate-200 text-black font-semibold text-xs tracking-tight transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-[0_4px_15px_rgba(255,255,255,0.1)] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" /> Synthesizing Distribution Lattices...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 animate-pulse" /> Multiply Strategic Concept
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Factory Workspace Matrix */}
      {outputs ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Format Selector Rails */}
          <div className="space-y-1.5 lg:col-span-1">
            <p className="font-mono text-[9px] text-white/30 uppercase tracking-[0.2em] pl-2 mb-3">
              Distribution Formats
            </p>
            {(Object.keys(editorContents) as Array<keyof ContentFactoryOutput>).map((key) => {
              const tabData = getTabLabel(key);
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`w-full text-left px-4 py-3 rounded-xl border flex items-center gap-3 transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "bg-white/5 border-white/10 text-blue-400 shadow-md"
                      : "bg-white/2 border-white/5 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tabData.icon}
                  <span className="font-sans font-semibold text-xs tracking-tight">{tabData.label}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Editor (Span 3) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="rounded-2xl border border-white/5 glass-card overflow-hidden">
              {/* Editor Header controls */}
              <div className="flex items-center justify-between border-b border-white/5 p-4 bg-[#020306]/40">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_#3b82f6]" />
                  LIVE GRAPH SPEC ENGINE
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-white/30 mr-2">
                    {editorContents[activeTab]?.length || 0} characters
                  </span>
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/5 text-[10.5px] font-mono text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3 h-3 text-blue-400" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copied" : "Copy to Clipboard"}
                  </button>
                </div>
              </div>

              {/* Editable Text Area */}
              <textarea
                value={editorContents[activeTab]}
                onChange={(e) => {
                  const updatedText = e.target.value;
                  setEditorContents((prev) => ({
                    ...prev,
                    [activeTab]: updatedText,
                  }));
                }}
                rows={12}
                className="w-full bg-transparent border-0 p-6 text-xs text-neutral-300 focus:outline-none leading-relaxed font-sans"
              />
            </div>

            {/* AI Refinement Box */}
            <div className="flex gap-3 bg-white/2 border border-white/5 rounded-xl p-3">
              <input
                type="text"
                value={refinementText}
                onChange={(e) => setRefinementText(e.target.value)}
                placeholder="e.g. Make the tone slightly more aggressive, or summarize into bullet points..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
              <button
                onClick={handleRefineContent}
                disabled={refining || !refinementText.trim()}
                className="px-4 py-2 bg-white hover:bg-slate-200 rounded-lg text-xs font-semibold text-black transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {refining ? (
                  <Loader className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    Refine Draft <Send className="w-3 h-3 text-blue-400" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-24 text-center border border-dashed border-white/5 rounded-2xl">
          <Sparkles className="w-8 h-8 text-white/10 mx-auto mb-3" />
          <p className="text-slate-500 text-xs font-sans">
            Awaiting seed vision. Supply your concept and activate strategic multiplier matrices.
          </p>
        </div>
      )}
    </div>
  );
}
