import { useState, useRef, useEffect, useCallback } from "react";

const API = "http://localhost:3001/api";

type Stage = "idle" | "recording" | "processing" | "result" | "error";

interface Report {
  question: string;
  transcript: string;
  pronunciation: number;
  fluency: number;
  completeness: number;
  accuracy: number;
  prosody: number;
  wpm: number;
  answerScore: number;
  confidence: "Low" | "Medium" | "High";
  feedback: string;
  strengths: string[];
  improvements: string[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function ScoreRing({ value, label, color }: { value: number; label: string; color: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="72" height="72" className="rotate-[-90deg]">
        <circle cx="36" cy="36" r={r} strokeWidth="5" stroke="#1e2a3a" fill="none" />
        <circle
          cx="36" cy="36" r={r} strokeWidth="5" fill="none"
          stroke={color} strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <span className="text-lg font-bold text-white -mt-[52px] mb-[28px]">{value}</span>
      <span className="text-[11px] text-slate-400 uppercase tracking-wider mt-1">{label}</span>
    </div>
  );
}

function ScoreBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-slate-400 text-xs w-28 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500"
          style={{ width: `${pct}%`, transition: "width 1.2s ease" }}
        />
      </div>
      <span className="text-white text-xs font-semibold w-8 text-right">{value}<span className="text-slate-500">/{max}</span></span>
    </div>
  );
}

function PulsingDot({ active }: { active: boolean }) {
  return (
    <span className="relative flex h-3 w-3">
      {active && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />}
      <span className={`relative inline-flex rounded-full h-3 w-3 ${active ? "bg-red-500" : "bg-slate-600"}`} />
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function DemoPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [question, setQuestion] = useState<string>("");
  const [topic, setTopic] = useState("data structures");
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Load question on mount
  useEffect(() => { fetchQuestion(); }, []);

  const fetchQuestion = useCallback(async () => {
    setStage("idle");
    setReport(null);
    setError("");
    setQuestion("");
    try {
      const r = await fetch(`${API}/question?topic=${encodeURIComponent(topic)}`);
      const data = await r.json();
      setQuestion(data.question);
    } catch {
      setError("Could not reach backend. Is it running on :3001?");
      setStage("error");
    }
  }, [topic]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
      };
      mr.start(100);
      mediaRef.current = mr;
      startTimeRef.current = Date.now();
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
      setStage("recording");
    } catch {
      setError("Microphone access denied.");
      setStage("error");
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setStage("processing");
  };

  // Submit when blob is ready
  useEffect(() => {
    if (stage === "processing" && audioBlob) {
      submitAudio(audioBlob);
    }
  }, [audioBlob, stage]);

  const submitAudio = async (blob: Blob) => {
    const duration = elapsed || 1;
    const form = new FormData();
    form.append("audio", blob, "recording.webm");
    form.append("question", question);
    form.append("duration", String(duration));

    try {
      const r = await fetch(`${API}/assess`, { method: "POST", body: form });
      if (!r.ok) throw new Error((await r.json()).error || "Server error");
      const data: Report = await r.json();
      setReport(data);
      setStage("result");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Assessment failed");
      setStage("error");
    }
  };

  const confidenceColor = {
    High: "text-emerald-400",
    Medium: "text-amber-400",
    Low: "text-red-400",
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-[#070d16] text-white font-sans">
      {/* Background gradient blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-indigo-400 text-sm font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            AI Interview Coach · Demo
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Speak. Assess. Improve.</h1>
          <p className="text-slate-400 mt-2 text-sm">Powered by Azure Speech AI + Groq LLaMA 3.3</p>
        </div>

        {/* Topic Picker */}
        <div className="flex gap-2 mb-6">
          <input
            className="flex-1 bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
            placeholder="Topic (e.g. data structures, OOP, networking...)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={stage === "recording" || stage === "processing"}
          />
          <button
            onClick={fetchQuestion}
            disabled={stage === "recording" || stage === "processing"}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-300 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ↺ New Q
          </button>
        </div>

        {/* Question Card */}
        <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-6 mb-6 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-widest text-indigo-400 font-semibold mb-3">Question</p>
          {question ? (
            <p className="text-lg text-white leading-relaxed">{question}</p>
          ) : (
            <div className="space-y-2 animate-pulse">
              <div className="h-4 bg-slate-800 rounded w-full" />
              <div className="h-4 bg-slate-800 rounded w-3/4" />
            </div>
          )}
        </div>

        {/* Controls */}
        {(stage === "idle" || stage === "error") && (
          <button
            onClick={startRecording}
            disabled={!question}
            className="w-full py-4 rounded-2xl font-semibold text-base bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-900/30"
          >
            🎙 Start Recording
          </button>
        )}

        {stage === "recording" && (
          <div className="flex flex-col items-center gap-5">
            <div className="flex items-center gap-3 bg-red-900/20 border border-red-500/30 rounded-2xl px-6 py-3">
              <PulsingDot active />
              <span className="text-red-300 font-mono text-base tracking-widest">{fmt(elapsed)}</span>
              <span className="text-red-400/60 text-sm">recording</span>
            </div>
            <button
              onClick={stopRecording}
              className="w-full py-4 rounded-2xl font-semibold text-base bg-red-600 hover:bg-red-500 transition shadow-lg shadow-red-900/30"
            >
              ⏹ Stop & Assess
            </button>
          </div>
        )}

        {stage === "processing" && (
          <div className="text-center py-10 space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
            <p className="text-slate-400">Analysing your answer…</p>
            <p className="text-slate-600 text-xs">Azure Speech · Groq LLaMA 3.3</p>
          </div>
        )}

        {stage === "error" && (
          <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm mb-4">
            {error}
          </div>
        )}

        {/* ── Report Card ─────────────────────────────────────────────────────── */}
        {stage === "result" && report && (
          <div className="space-y-5 animate-fadeIn">
            {/* Transcript */}
            <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-5 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Your Answer</p>
              <p className="text-slate-300 text-sm leading-relaxed italic">"{report.transcript}"</p>
            </div>

            {/* Score Rings */}
            <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-6 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-5">Speech Scores</p>
              <div className="grid grid-cols-4 gap-4">
                <ScoreRing value={report.pronunciation} label="Pronunciation" color="#6366f1" />
                <ScoreRing value={report.fluency} label="Fluency" color="#06b6d4" />
                <ScoreRing value={report.completeness} label="Completeness" color="#10b981" />
                <ScoreRing value={report.accuracy} label="Accuracy" color="#f59e0b" />
              </div>
            </div>

            {/* Meta Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-4 text-center backdrop-blur-sm">
                <p className="text-2xl font-bold text-white">{report.answerScore}<span className="text-slate-500 text-base">/10</span></p>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Answer Score</p>
              </div>
              <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-4 text-center backdrop-blur-sm">
                <p className={`text-2xl font-bold ${confidenceColor[report.confidence]}`}>{report.confidence}</p>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Confidence</p>
              </div>
              <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-4 text-center backdrop-blur-sm">
                <p className="text-2xl font-bold text-white">{report.wpm}<span className="text-slate-500 text-base"> wpm</span></p>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Pace</p>
              </div>
            </div>

            {/* Detail Bars */}
            <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-5 backdrop-blur-sm space-y-3">
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-4">Detail Breakdown</p>
              <ScoreBar value={report.pronunciation} max={100} label="Pronunciation" />
              <ScoreBar value={report.fluency} max={100} label="Fluency" />
              <ScoreBar value={report.completeness} max={100} label="Completeness" />
              <ScoreBar value={report.prosody} max={100} label="Prosody" />
              <ScoreBar value={report.answerScore} max={10} label="Answer Quality" />
            </div>

            {/* Groq Feedback */}
            <div className="bg-indigo-950/40 border border-indigo-500/20 rounded-2xl p-5 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-widest text-indigo-400 mb-3">Groq Feedback</p>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">{report.feedback}</p>

              {report.strengths?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-emerald-400 font-semibold mb-2">✓ Strengths</p>
                  <ul className="space-y-1">
                    {report.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-slate-400 flex gap-2">
                        <span className="text-emerald-500">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {report.improvements?.length > 0 && (
                <div>
                  <p className="text-xs text-amber-400 font-semibold mb-2">↑ To Improve</p>
                  <ul className="space-y-1">
                    {report.improvements.map((s, i) => (
                      <li key={i} className="text-sm text-slate-400 flex gap-2">
                        <span className="text-amber-500">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Try Again */}
            <div className="flex gap-3">
              <button
                onClick={startRecording}
                className="flex-1 py-3.5 rounded-2xl font-semibold text-sm bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 transition shadow-lg shadow-indigo-900/30"
              >
                🎙 Try Again
              </button>
              <button
                onClick={fetchQuestion}
                className="flex-1 py-3.5 rounded-2xl font-semibold text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700/50 transition"
              >
                ↺ New Question
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
