import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, Send, X, Sparkles, Globe, ArrowUpRight, HelpCircle, Volume2, Loader } from "lucide-react";
import { ChatMessage } from "../types";

interface VoiceCoreProps {
  active: boolean;
  onClose: () => void;
  workspaceContext: any;
}

export default function VoiceCore({ active, onClose, workspaceContext }: VoiceCoreProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "init", sender: "assistant", text: "Systems online. Voice conscious link active. How can I assist your operations today?", timestamp: "08:00" },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [sources, setSources] = useState<{ title: string; uri: string }[]>([]);

  const waveCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  // Neural Particle Frequency Simulation on Canvas
  useEffect(() => {
    if (!active) return;
    const canvas = waveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const renderWave = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Render futuristic glowing particle sine-waves
      ctx.strokeStyle = "rgba(59, 130, 246, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      const waveCount = 3;
      for (let wave = 0; wave < waveCount; wave++) {
        ctx.beginPath();
        const waveOffset = wave * 45;
        const amplitude = loading ? 40 : 15; // Pulse higher when AI is processing/thinking

        for (let x = 0; x < w; x++) {
          const angle = (x / w) * Math.PI * 2 * 2 + phase + waveOffset;
          const y = h / 2 + Math.sin(angle) * amplitude * Math.sin(phase * 0.5);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = wave === 0 ? "rgba(59,130,246,0.6)" : wave === 1 ? "rgba(139,92,246,0.4)" : "rgba(16,185,129,0.2)";
        ctx.stroke();
      }

      phase += loading ? 0.15 : 0.05;
      animId = requestAnimationFrame(renderWave);
    };

    renderWave();
    return () => cancelAnimationFrame(animId);
  }, [active, loading]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: "user",
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);
    setSources([]);

    try {
      const res = await fetch("/api/intelligence/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          workspaceContext,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: ChatMessage = {
          id: `msg_ai_${Date.now()}`,
          sender: "assistant",
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, aiMsg]);
        if (data.sources) {
          setSources(data.sources);
        }

        // Futuristic Text-To-Speech execution if not muted
        if (!isMuted && typeof window !== "undefined") {
          const SpeechSynthesis = window.speechSynthesis;
          if (SpeechSynthesis) {
            SpeechSynthesis.cancel();
            // Clean text of markdown before speech
            const cleanText = data.text.replace(/[*#`_\-]/g, "");
            const utterance = new SpeechSynthesisUtterance(cleanText.substring(0, 160));
            utterance.rate = 1.05;
            utterance.pitch = 1.0;
            SpeechSynthesis.speak(utterance);
          }
        }
      } else {
        throw new Error("Chat link failed");
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: "assistant",
          text: "Systems offline. Please ensure the server has an active internet link and valid GEMINI_API_KEY.",
          timestamp: "Error",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!active) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl h-[85vh] rounded-3xl border border-white/5 bg-[#020306] flex flex-col overflow-hidden shadow-[0_10px_50px_rgba(0,0,0,0.8)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/2">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
              <div>
                <h3 className="font-sans font-extrabold text-sm text-white tracking-tight">VOICE LINK CONSCIOUSNESS</h3>
                <p className="font-mono text-[9px] text-white/30 uppercase tracking-[0.2em]">
                  Neural link sync rate: 100%
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isMuted ? "border-white/5 text-white/20 bg-white/1" : "border-blue-500/20 text-blue-400 bg-blue-500/10"
                }`}
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Core Body Container */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left Column: Wave Simulation & Sources HUD */}
            <div className="w-full md:w-2/5 border-r border-white/5 p-6 flex flex-col justify-between bg-[#020306]">
              <div className="space-y-4">
                <span className="font-mono text-[9px] text-white/30 uppercase tracking-[0.2em] font-bold">COG BIOLOGICAL SPECTRUM</span>
                <div className="rounded-2xl border border-white/5 bg-black/40 p-4 h-40 flex flex-col items-center justify-center relative overflow-hidden">
                  <canvas ref={waveCanvasRef} width={300} height={120} className="w-full" />
                  <span className="absolute bottom-2.5 font-mono text-[9px] text-blue-400/80 uppercase tracking-widest font-bold">
                    {loading ? "AI DECONSTRUCTING INTENT..." : "GROUNDING RADAR CALIBRATED"}
                  </span>
                </div>
              </div>

              {/* Grounded Web Search HUD */}
              <div className="flex-1 mt-6 flex flex-col justify-end">
                <div className="space-y-2">
                  <span className="font-mono text-[9px] text-white/30 uppercase tracking-[0.2em] flex items-center gap-1 font-bold">
                    <Globe className="w-3 h-3 text-blue-400" /> Grounded Search Verification HUD
                  </span>

                  {sources.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {sources.map((src, i) => (
                        <a
                          key={i}
                          href={src.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-xl bg-white/2 border border-white/5 hover:border-blue-500/35 transition-all duration-300 block text-xs"
                        >
                          <div className="flex items-center justify-between text-[11px] font-semibold text-white">
                            <span className="truncate">{src.title}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                          </div>
                          <span className="text-[10px] text-white/30 font-mono block truncate mt-1">{src.uri}</span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-white/5 bg-white/1 text-center text-slate-500 text-[11px]">
                      Ask questions referencing live web events. Verified dynamic URLs will populate here dynamically.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Conversational Logs */}
            <div className="flex-1 flex flex-col h-full bg-[#020306]/20 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => {
                  const isAI = msg.sender === "assistant";
                  return (
                    <div key={msg.id} className={`flex ${isAI ? "justify-start" : "justify-end"}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed font-sans ${
                        isAI
                          ? "bg-white/5 border border-white/10 text-slate-200"
                          : "bg-white text-black font-semibold shadow-md"
                      }`}>
                        <div className="flex justify-between items-center mb-1 text-[9px] font-mono opacity-60">
                          <span>{isAI ? "CONSCIOUSNESS CORE" : "BIOLOGICAL HUMAN"}</span>
                          <span>{msg.timestamp}</span>
                        </div>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  );
                })}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white/3 border border-white/5 rounded-2xl px-4 py-3 text-xs text-slate-500 flex items-center gap-2">
                      <Loader className="w-3.5 h-3.5 animate-spin text-blue-400" /> Synaptic pipeline grounding...
                    </div>
                  </div>
                )}
                <div ref={messageEndRef} />
              </div>

              {/* Input Command Form */}
              <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-[#020306] flex gap-3">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Communicate intent or query live vectors..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading || !inputText.trim()}
                  className="p-3 rounded-xl bg-white hover:bg-slate-200 text-black transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
