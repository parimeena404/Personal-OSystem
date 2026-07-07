import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Plus,
  FileText,
  Bookmark,
  Mic,
  MicOff,
  Lightbulb,
  Sparkles,
  Link2,
  Tag,
  Loader,
  BrainCircuit,
  Eye,
  Settings,
  Flame,
} from "lucide-react";
import { MemoryNode } from "../types";

interface SecondBrainProps {
  memories: MemoryNode[];
  onAddMemory: (memory: Partial<MemoryNode>) => void;
  onLinkMemories: (idA: string, idB: string) => void;
}

export default function SecondBrain({ memories, onAddMemory, onLinkMemories }: SecondBrainProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [addingMemory, setAddingMemory] = useState(false);

  // New note form state
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<MemoryNode["category"]>("note");

  // Voice recording simulation or active Web Speech
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Semantic analysis / pipeline states
  const [semanticLoading, setSemanticLoading] = useState(false);
  const [pipelineOutput, setPipelineOutput] = useState<any>(null);
  const [connectionInsight, setConnectionInsight] = useState("");

  const startVoiceRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Web Speech API is not supported in this browser. Simulating voice cognitive stream.");
      setIsRecording(true);
      setTimeout(() => {
        setNewContent((prev) => prev + " Futuristic Personal Operating System architectures utilize distributed LLM agents.");
        setIsRecording(false);
      }, 3000);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onstart = () => {
      setIsRecording(true);
    };

    rec.onresult = (event: any) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        }
      }
      if (finalTranscript) {
        setNewContent((prev) => prev + finalTranscript);
      }
    };

    rec.onerror = () => {
      setIsRecording(false);
    };

    rec.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = rec;
    rec.start();
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setSemanticLoading(true);
    setPipelineOutput(null);
    setConnectionInsight("");

    try {
      // 1. Trigger Graph Connect server API to find semantic links and tags
      const graphRes = await fetch("/api/intelligence/graph-connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          existingNotes: memories,
          newNote: { title: newTitle, content: newContent },
        }),
      });

      let derivedConnections: string[] = [];
      let derivedTags: string[] = ["brain-index"];

      if (graphRes.ok) {
        const graphData = await graphRes.json();
        derivedConnections = graphData.suggestedConnections || [];
        derivedTags = graphData.derivedTags || ["general-memory"];
        setConnectionInsight(graphData.insightReason || "");
      }

      // 2. Trigger Automation execution server API to auto-compile flashcards and summarize
      const autoRes = await fetch("/api/intelligence/automation-execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowName: "Memory Ingest Pipeline",
          payload: `${newTitle}: ${newContent}`,
        }),
      });

      if (autoRes.ok) {
        const autoData = await autoRes.json();
        setPipelineOutput(autoData);
      }

      // 3. Add to memories list
      const addedId = `mem_${Date.now()}`;
      onAddMemory({
        id: addedId,
        title: newTitle,
        category: newCategory,
        content: newContent,
        createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        connections: derivedConnections,
        tags: derivedTags,
      });

      // Reset form if successful
      setNewTitle("");
      setNewContent("");
      setAddingMemory(false);
    } catch (err) {
      console.error("Semantic analysis failed:", err);
      // Fallback local memory creation
      onAddMemory({
        id: `mem_${Date.now()}`,
        title: newTitle,
        category: newCategory,
        content: newContent,
        createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        connections: [],
        tags: ["local-ingest"],
      });
      setAddingMemory(false);
    } finally {
      setSemanticLoading(false);
    }
  };

  const filteredMemories = memories.filter((mem) => {
    const matchesSearch =
      mem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mem.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mem.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || mem.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (cat: MemoryNode["category"]) => {
    switch (cat) {
      case "pdf":
        return <FileText className="w-4 h-4 text-emerald-400" />;
      case "web":
        return <Bookmark className="w-4 h-4 text-sky-400" />;
      case "voice":
        return <Mic className="w-4 h-4 text-red-400" />;
      case "idea":
        return <Lightbulb className="w-4 h-4 text-amber-400" />;
      default:
        return <FileText className="w-4 h-4 text-neutral-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header and Add Trigger */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-sans font-extrabold text-2xl tracking-tight text-white flex items-center gap-2">
            Second Brain Memory Store
          </h2>
          <p className="text-neutral-400 text-xs">
            Dynamic storage indexing. {memories.length} biological artifacts cached and semantically cross-linked.
          </p>
        </div>

        <button
          onClick={() => setAddingMemory(!addingMemory)}
          className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-200 text-black font-semibold text-xs tracking-tight transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-[0_4px_15px_rgba(255,255,255,0.1)]"
        >
          <Plus className="w-4 h-4" /> Index New Memory
        </button>
      </div>

      {/* Semantic Pipeline Drawer */}
      <AnimatePresence>
        {addingMemory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-white/5 glass-card p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-sans font-bold text-sm text-white flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-blue-400 animate-pulse" />
                  Synaptic Index Ingester Pipeline
                </h3>
                <span className="font-mono text-[9px] text-white/30 uppercase tracking-[0.2em]">
                  AI Grounding: ON
                </span>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="font-mono text-[9px] text-white/40 uppercase tracking-[0.2em] block mb-1.5">
                      Memory Headline
                    </label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Decentralized agent scheduling network topology"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="font-mono text-[9px] text-white/40 uppercase tracking-[0.2em] block mb-1.5">
                      Category Node Type
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(["note", "pdf", "web", "idea"] as const).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setNewCategory(cat)}
                          className={`py-2 rounded-xl border text-[10px] font-mono capitalize transition-all duration-300 cursor-pointer ${
                            newCategory === cat
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                              : "bg-white/2 text-slate-400 border-white/5 hover:border-white/10"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-mono text-[9px] text-white/40 uppercase tracking-[0.2em]">
                        Memory Content
                      </label>
                      <button
                        type="button"
                        onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-mono border transition-all duration-300 ${
                          isRecording
                            ? "bg-red-500/10 text-red-400 border-red-500/30 animate-pulse"
                            : "bg-white/5 text-slate-400 border-white/5 hover:text-white"
                        }`}
                      >
                        {isRecording ? <MicOff className="w-3 h-3 text-red-500" /> : <Mic className="w-3 h-3 text-blue-400" />}
                        {isRecording ? "Stop Capture" : "Capture Voice"}
                      </button>
                    </div>
                    <textarea
                      required
                      rows={5}
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="Input memory context, research quotes, transcripts, or notes..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={semanticLoading}
                    className="w-full py-3 rounded-xl bg-white hover:bg-slate-200 text-black font-semibold text-xs tracking-tight transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_15px_rgba(255,255,255,0.1)]"
                  >
                    {semanticLoading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" /> Running Dynamic Cog Pipelines...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Synthesize and Link Memory
                      </>
                    )}
                  </button>
                </div>

                {/* Cognitive Pipeline Results Pane */}
                <div className="rounded-xl border border-white/10 bg-white/2 p-4 flex flex-col justify-between">
                  <div>
                    <h4 className="font-mono text-[9px] text-white/40 uppercase tracking-[0.2em] mb-3">
                      AUTOMATED PIPELINE REVISION PREVIEWS
                    </h4>
                    {semanticLoading ? (
                      <div className="h-48 flex flex-col items-center justify-center space-y-3">
                        <div className="w-8 h-8 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                        <span className="font-mono text-[10px] text-white/40">Executing cognitive automation vectors...</span>
                      </div>
                    ) : pipelineOutput ? (
                      <div className="space-y-4">
                        <div className="p-3.5 rounded-lg bg-blue-500/5 border border-blue-500/10">
                          <h5 className="font-mono text-[9px] text-blue-400 uppercase tracking-widest mb-1">
                            Dynamic Synthesis Summary
                          </h5>
                          <p className="text-neutral-300 text-xs leading-relaxed">{pipelineOutput.summary}</p>
                        </div>

                        <div>
                          <h5 className="font-mono text-[9px] text-indigo-400 uppercase tracking-widest mb-2">
                            Synthesized Study Flashcard
                          </h5>
                          <div className="p-3 rounded-lg bg-white/2 border border-white/5 text-xs">
                            <span className="font-semibold text-neutral-400">Q:</span> {pipelineOutput.flashcards[0]?.front}
                            <div className="mt-1.5 pt-1.5 border-t border-white/5 text-blue-300">
                              <span className="font-semibold text-neutral-400">A:</span> {pipelineOutput.flashcards[0]?.back}
                            </div>
                          </div>
                        </div>

                        {connectionInsight && (
                          <div className="p-3 rounded-lg bg-white/2 border border-white/5 text-xs">
                            <span className="font-mono text-[9px] text-amber-400 uppercase block mb-1">
                              Semantic Discovery
                            </span>
                            <p className="text-neutral-300 italic leading-relaxed">{connectionInsight}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-48 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/5 rounded-xl">
                        <BrainCircuit className="w-8 h-8 text-white/10 mb-2" />
                        <p className="text-[11px] text-slate-400">
                          Submit a memory to test the pipeline. The system will auto-summarize, suggest semantic tags, auto-map graph relationships, and schedule spaced cognitive revision dates.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-white/5 pt-3 mt-4 flex items-center justify-between text-[10px] font-mono text-white/30">
                    <span>INDEX MODE: VECTOR LATTICE</span>
                    {pipelineOutput && (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Flame className="w-3 h-3 animate-pulse" /> SPACING ACTIVE
                      </span>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Search and Grid */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Query memory lattice... (e.g. 'Startup ideas' or 'Kubernetes architectures')"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          <div className="flex gap-1.5 bg-white/2 border border-white/10 p-1 rounded-xl">
            {["all", "note", "pdf", "web", "idea"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-[10.5px] font-mono capitalize transition-all duration-300 cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredMemories.map((mem) => (
              <motion.div
                key={mem.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group rounded-2xl border border-white/5 glass-card hover:border-white/10 hover:bg-white/5 transition-all duration-300 p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(mem.category)}
                      <span className="font-mono text-[9px] text-white/30 uppercase tracking-[0.2em] font-bold">
                        {mem.category}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-white/30">{mem.createdAt}</span>
                  </div>

                  <h4 className="font-sans font-bold text-white text-sm group-hover:text-blue-400 transition-colors tracking-tight line-clamp-1">
                    {mem.title}
                  </h4>
                  <p className="text-neutral-300 text-xs mt-2 leading-relaxed line-clamp-3">
                    {mem.content}
                  </p>
                </div>

                <div className="mt-4 pt-3.5 border-t border-white/5 flex items-center justify-between">
                  <div className="flex gap-1">
                    {mem.tags.slice(0, 2).map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-slate-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {mem.connections.length > 0 && (
                    <div className="flex items-center gap-1 font-mono text-[9px] text-blue-400 font-bold">
                      <Link2 className="w-3 h-3" /> {mem.connections.length} links
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredMemories.length === 0 && (
          <div className="py-20 text-center border border-dashed border-neutral-900 rounded-2xl">
            <p className="text-neutral-500 text-xs font-sans">No indexed memory nodes found matching query.</p>
          </div>
        )}
      </div>
    </div>
  );
}
