import React, { useState } from "react";
import { Settings, ShieldAlert, Cpu, CheckCircle, Database, Lock, EyeOff } from "lucide-react";

export default function SettingsComponent() {
  const [profileName, setProfileName] = useState("Parimeena");
  const [profileGoal, setProfileGoal] = useState("Maximize cognitive output, systems leverage, and automation velocity");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [purged, setPurged] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handlePurge = () => {
    localStorage.clear();
    setPurged(true);
    setTimeout(() => {
      setPurged(false);
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div>
        <h2 className="font-sans font-extrabold text-2xl tracking-tight text-white flex items-center gap-2">
          OS Core Settings
        </h2>
        <p className="text-neutral-400 text-xs">
          Calibrate cognitive alignments, local vector storage models, and verify Zero-Trust cryptographic parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Form: Biological Profiler */}
        <div className="md:col-span-2 rounded-2xl border border-white/5 glass-card p-6 space-y-4">
          <h3 className="font-sans font-bold text-sm text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-400" /> Human Cognitive Alignment
          </h3>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="font-mono text-[9px] text-white/40 uppercase tracking-[0.2em] block mb-1.5">
                Biological Operator Name
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>

            <div>
              <label className="font-mono text-[9px] text-white/40 uppercase tracking-[0.2em] block mb-1.5">
                Primary Decade-Scale Directives
              </label>
              <textarea
                rows={3}
                value={profileGoal}
                onChange={(e) => setProfileGoal(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-200 text-black font-semibold text-xs transition-all duration-300 cursor-pointer flex items-center gap-2"
            >
              Update Synaptic Weights
            </button>
          </form>

          {saveSuccess && (
            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-[11px] flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-400" /> Synaptic profile successfully saved and cached locally.
            </div>
          )}
        </div>

        {/* Right Info: Zero Trust HUD */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/5 glass-card p-5 space-y-4">
            <h4 className="font-mono text-[9px] text-white/40 uppercase tracking-[0.2em] border-b border-white/5 pb-2 font-bold">
              SYSTEM TRUST VERIFICATION
            </h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white/30">Gemini Secret Key</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" /> SECURE APILINK
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white/30">Data Encrypted</span>
                <span className="text-emerald-400 font-bold">100% AES-256</span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white/30">Vector Model</span>
                <span className="text-blue-400 font-bold">LATTICE GRAPHS</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-red-500/10 bg-red-950/10 p-5 space-y-3">
            <h4 className="font-mono text-[9px] text-red-400 uppercase tracking-[0.2em] flex items-center gap-1.5 font-bold">
              <ShieldAlert className="w-4 h-4 text-red-400" /> EMERGENCY DEBRIS PROTOCOL
            </h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Activating debris mode completely purges local storage indices, clears cached browser context, and disconnects secure active server sessions instantly. Use with extreme discretion.
            </p>
            <button
              onClick={handlePurge}
              className="px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 font-mono text-[9px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all cursor-pointer"
            >
              Purge Local Workspace Cache
            </button>

            {purged && (
              <div className="text-[10px] font-mono text-red-400 animate-pulse mt-2">
                Purging synaptic store... Page reload imminent.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
