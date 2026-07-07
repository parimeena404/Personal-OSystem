import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Cpu,
  Plus,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  History,
  Workflow,
  ArrowRight,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { AutomationWorkflow } from "../types";

interface AutomationCenterProps {
  workflows: AutomationWorkflow[];
  onAddWorkflow: (wf: AutomationWorkflow) => void;
  onToggleWorkflow: (id: string) => void;
  onDeleteWorkflow: (id: string) => void;
}

interface AuditLog {
  timestamp: string;
  workflowName: string;
  status: "success" | "warning";
  details: string;
}

export default function AutomationCenter({
  workflows,
  onAddWorkflow,
  onToggleWorkflow,
  onDeleteWorkflow,
}: AutomationCenterProps) {
  const [creating, setCreating] = useState(false);
  const [newWfName, setNewWfName] = useState("");
  const [selectedTrigger, setSelectedTrigger] = useState("When PDF is uploaded");
  const [selectedActions, setSelectedActions] = useState<string[]>([
    "Summarize PDF context",
    "Extract strategic insight",
  ]);

  // Pre-compiled security audit logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { timestamp: "07:35:10", workflowName: "Memory Ingest Pipeline", status: "success", details: "Analyzed 'Decentralized agent topology' note. 3 connections matched." },
    { timestamp: "06:12:04", workflowName: "PDF Cognitive Ingestion", status: "success", details: "Processed research block. Generated 1 revision flashcard." },
    { timestamp: "04:10:55", workflowName: "System Core Guard", status: "success", details: "Audit complete. Zero-Trust boundary verified. API keys safe server-side." },
  ]);

  const toggleActionCheckbox = (act: string) => {
    if (selectedActions.includes(act)) {
      setSelectedActions((prev) => prev.filter((a) => a !== act));
    } else {
      setSelectedActions((prev) => [...prev, act]);
    }
  };

  const handleCreateWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWfName.trim() || selectedActions.length === 0) return;

    const newWorkflow: AutomationWorkflow = {
      id: `wf_${Date.now()}`,
      name: newWfName,
      trigger: selectedTrigger,
      actions: [...selectedActions],
      active: true,
      lastExecuted: "Never",
    };

    onAddWorkflow(newWorkflow);

    // Append to audit logs
    setAuditLogs((prev) => [
      {
        timestamp: new Date().toLocaleTimeString(),
        workflowName: newWfName,
        status: "success",
        details: `Workflow generated with trigger '${selectedTrigger}'.`,
      },
      ...prev,
    ]);

    setNewWfName("");
    setCreating(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-sans font-extrabold text-2xl tracking-tight text-white flex items-center gap-2">
            Automation Engine
          </h2>
          <p className="text-neutral-400 text-xs">
            Dynamic pipeline automation. Run multi-stage AI reasoning sequences behind-the-scenes on workspace events.
          </p>
        </div>

        <button
          onClick={() => setCreating(!creating)}
          className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-200 text-black font-semibold text-xs tracking-tight transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-[0_4px_15px_rgba(255,255,255,0.1)]"
        >
          <Plus className="w-4 h-4" /> Assemble AI Pipeline
        </button>
      </div>

      {/* Assembly Canvas Drawer */}
      <AnimatePresence>
        {creating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-white/5 glass-card p-6 space-y-4">
              <h3 className="font-sans font-bold text-sm text-white flex items-center gap-2">
                <Workflow className="w-4 h-4 text-blue-400 animate-pulse" />
                Pipeline Sequencer Node
              </h3>

              <form onSubmit={handleCreateWorkflow} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="font-mono text-[9px] text-white/40 uppercase tracking-[0.2em] block mb-1.5">
                        Workflow Identifier Name
                      </label>
                      <input
                        type="text"
                        required
                        value={newWfName}
                        onChange={(e) => setNewWfName(e.target.value)}
                        placeholder="e.g. Transcribe Voice -> Add To Brain"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="font-mono text-[9px] text-white/40 uppercase tracking-[0.2em] block mb-1.5">
                        Trigger Condition
                      </label>
                      <select
                        value={selectedTrigger}
                        onChange={(e) => setSelectedTrigger(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                      >
                        <option value="When PDF uploaded" className="bg-[#020306]">When PDF is indexed</option>
                        <option value="When Voice note captured" className="bg-[#020306]">When Voice note is transcribed</option>
                        <option value="When Project milestone added" className="bg-[#020306]">When Project milestone added</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="font-mono text-[9px] text-white/40 uppercase tracking-[0.2em] block mb-1.5">
                      Sequential Execution Actions
                    </label>

                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {[
                        "Summarize PDF context",
                        "Extract strategic insight",
                        "Synthesize active study flashcard",
                        "Schedule spaced-revision recall quiz",
                        "Auto-link related graph nodes",
                      ].map((action, i) => {
                        const isChecked = selectedActions.includes(action);
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => toggleActionCheckbox(action)}
                            className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-all duration-300 cursor-pointer ${
                              isChecked
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                               : "bg-white/2 text-slate-400 border-white/5 hover:border-white/10"
                            }`}
                          >
                            <span>{action}</span>
                            <span className="font-mono text-[9px] text-white/20 uppercase">Stage {i + 1}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCreating(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-white hover:bg-slate-200 text-black font-semibold text-xs tracking-tight transition-all duration-300 cursor-pointer"
                  >
                    Generate Pipeline flow
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Pipeline Flows (Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <p className="font-mono text-[9px] text-white/30 uppercase tracking-[0.2em] pl-2">ACTIVE AI PIPELINES</p>

          <div className="space-y-3">
            {workflows.map((wf) => (
              <div
                key={wf.id}
                className="group p-5 rounded-2xl border border-white/5 glass-card hover:border-white/10 hover:bg-white/5 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <Cpu className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-sans font-bold text-sm text-white">{wf.name}</h4>
                      <p className="text-[10.5px] text-white/40 font-mono mt-0.5">Trigger: {wf.trigger}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onToggleWorkflow(wf.id)}
                      className="text-neutral-500 hover:text-white transition-colors cursor-pointer"
                    >
                      {wf.active ? (
                        <ToggleRight className="w-7 h-7 text-blue-400" />
                      ) : (
                        <ToggleLeft className="w-7 h-7 text-white/20" />
                      )}
                    </button>

                    <button
                      onClick={() => onDeleteWorkflow(wf.id)}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Visual workflow stages flowchart */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/5">
                  {wf.actions.map((act, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="px-3 py-1.5 rounded-lg bg-white/2 border border-white/5 text-[10.5px] text-slate-300 font-sans flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-blue-400/85" /> {act}
                      </div>
                      {index < wf.actions.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-white/20" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Security & Audit Logs (Span 1) */}
        <div className="lg:col-span-1 space-y-4">
          <p className="font-mono text-[9px] text-white/30 uppercase tracking-[0.2em] pl-2">ZERO-TRUST AUDIT MODULE</p>

          <div className="rounded-2xl border border-white/5 glass-card p-5 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 border-b border-white/5 pb-3 mb-1">
              <ShieldCheck className="w-5 h-5 animate-pulse" />
              <div className="text-left">
                <span className="font-sans font-bold text-xs text-white block leading-snug">ZTA Cryptography Active</span>
                <span className="font-mono text-[8px] text-emerald-500 uppercase tracking-widest">Boundary Verified</span>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {auditLogs.map((log, index) => (
                <div key={index} className="p-3 rounded-lg bg-white/2 border border-white/5 text-xs">
                  <div className="flex justify-between items-center text-[9px] font-mono mb-1">
                    <span className="text-white/30">{log.timestamp}</span>
                    <span className="text-blue-400 font-bold">{log.workflowName}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px] font-sans">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
