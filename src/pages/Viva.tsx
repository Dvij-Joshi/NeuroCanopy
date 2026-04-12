import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Play, Square, Award, RefreshCcw, Calendar, ChevronRight, X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { markVivaComplete } from '../lib/scheduleGenerator';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + "/api";
type Stage = "idle" | "custom_setup" | "fetching" | "ready" | "recording" | "processing" | "result" | "error";

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

export default function Viva() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const queryEventId = searchParams.get('eventId');
  const queryTopicId = searchParams.get('topicId');
  const queryTopicTitle = searchParams.get('topicTitle');

  const [activeEventId, setActiveEventId] = useState<string | null>(queryEventId);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(queryTopicId);

  const [stage, setStage] = useState<Stage>("idle");
  const [topic, setTopic] = useState(queryTopicTitle || '');
  const [difficulty, setDifficulty] = useState("Medium");
  const [question, setQuestion] = useState("");
  const [error, setError] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  
  const [userId, setUserId] = useState<string | null>(null);
  const [upcomingVivas, setUpcomingVivas] = useState<any[]>([]);
  const [lastSession, setLastSession] = useState<any | null>(null);

  const [elapsed, setElapsed] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Audio visualization refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const volumeBarRef = useRef<HTMLDivElement | null>(null);

  // Automatically start fetching if query params present
  useEffect(() => {
    if (queryTopicTitle) {
      setTopic(queryTopicTitle);
      fetchQuestion(queryTopicTitle, difficulty);
    }
  }, [queryTopicTitle]);

  // Load User, upcoming vivas, last session
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        fetchDashboardData(user.id);
      }
    });
  }, []);

  const fetchDashboardData = async (uid: string) => {
    // 1. Fetch upcoming scheduled vivas
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0).toISOString();
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).toISOString();
    
    const { data: upcoming } = await supabase
      .from('schedule_events')
      .select('*')
      .eq('user_id', uid)
      .in('category', ['FOCUS', 'VIVA'])
      .eq('completed', false)
      .gte('start_time', startOfDay)
      .lte('start_time', endOfDay)
      .order('start_time', { ascending: true })
      .limit(8);
    
    if (upcoming) setUpcomingVivas(upcoming);

    // 2. Fetch last viva session details safely
    const { data: lastItem, error } = await supabase
      .from('viva_sessions')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.warn("Failed to fetch last viva:", error);
    }
    
    if (lastItem) setLastSession(lastItem);
  };

  const fetchQuestion = async (targetTopic: string, diff: string) => {
    setStage("fetching");
    setReport(null);
    setError("");
    setQuestion("");
    try {
      const r = await fetch(`${API}/question?topic=${encodeURIComponent(targetTopic)}&difficulty=${encodeURIComponent(diff)}`);
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Failed to generate question");
      setQuestion(data.question);
      setStage("ready");
    } catch (err: any) {
      setError("Failed to fetch question: " + err.message);
      setStage("error");
    }
  };

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
      
      // Setup Audio Visualizer
      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
        const average = sum / bufferLength;
        // Map average (0-255) to percentage (0-100), scale up for visibility
        const volumeScore = Math.min(100, Math.floor((average / 255) * 100 * 2.5)); 
        
        if (volumeBarRef.current) {
          volumeBarRef.current.style.height = `${Math.max(5, volumeScore)}%`;
        }
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      startTimeRef.current = Date.now();
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
      setStage("recording");
    } catch {
      setError("Microphone access denied. Please allow microphone permissions.");
      setStage("error");
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
    setStage("processing");
  };

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
      if (!r.ok) throw new Error((await r.json()).error || "Assessment failed");
      const data: Report = await r.json();
      setReport(data);
      setStage("result");
      
      // Save result to Supabase
      if (userId) {
         saveSessionAndCompleteEvent(data);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Assessment failed");
      setStage("error");
    }
  };

  const saveSessionAndCompleteEvent = async (data: Report) => {
    try {
      const { error: insertError } = await supabase.from('viva_sessions').insert([{
        user_id: userId,
        base_topic: topic || "Custom Viva",
        difficulty: difficulty || "Medium",
        question: data.question || question || "Recorded Audio",
        transcript: data.transcript || "",
        pronunciation: Number(data.pronunciation) || 0,
        fluency: Number(data.fluency) || 0,
        completeness: Number(data.completeness) || 0,
        accuracy: Number(data.accuracy) || 0,
        prosody: Number(data.prosody) || 0,
        wpm: Number(data.wpm) || 0,
        answer_score: Number(data.answerScore) || 5,
        confidence: data.confidence || "Medium",
        feedback: data.feedback || "Audio properly recorded and evaluated.",
        strengths: Array.isArray(data.strengths) ? data.strengths : [],
        improvements: Array.isArray(data.improvements) ? data.improvements : []
      }]);
      
      if (insertError) {
        console.error("Supabase viva_sessions Insert Error:", insertError);
          setError("DATABASE ERROR: " + insertError.message + " (Hint: Missing columns in viva_sessions table! Run the alter.sql script in Supabase.)");
      }

      // Mark the scheduled event complete if we have an active tracking ID
      if (activeEventId) {
        await markVivaComplete(activeEventId, activeTopicId, data.answerScore);
        setActiveEventId(null);
        setActiveTopicId(null);
      }
        
      // Fetch latest dashboard data AFTER marking complete
      await fetchDashboardData(userId!);
    } catch (err) {
      console.error("Failed to save to database:", err);
    }
  };

  const handleCustomVivaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    fetchQuestion(topic, difficulty);
  };

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  function getGradeScore(score: number) {
    if (score >= 9) return 'A+';
    if (score >= 8) return 'A';
    if (score >= 7) return 'B+';
    if (score >= 6) return 'B';
    if (score >= 5) return 'C';
    return 'Needs Work';
  }

  // Render 
  return (
    <div className="page-shell">
      <div>
        <h1 className="page-title flex items-center gap-3">
          <Mic className="w-10 h-10" strokeWidth={2.5} />
          Voice Viva
        </h1>
        <p className="page-subtitle">Simulated oral examination and concept testing.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr,0.85fr]">
        
        {/* Viva Session Area */}
        <div className="card-brutal bg-white flex flex-col items-center justify-center min-h-[500px] text-center p-6 md:p-8 relative">
          
          {stage === "idle" && (
             <div className="w-full max-w-md mx-auto flex flex-col items-center gap-6 animate-in slide-in-from-bottom-2">
                <div className="w-24 h-24 rounded-full bg-accent border-[6px] border-black flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                  <Mic className="w-12 h-12 text-black" strokeWidth={3} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black uppercase text-center text-black tracking-tight">Audio Assessment</h2>
                  <p className="text-gray-600 font-medium px-4">Start a custom viva from the sidebar or click an upcoming study topic.</p>
                </div>
             </div>
          )}

          {stage === "custom_setup" && (
             <div className="w-full text-left max-w-md mx-auto bg-white border-[6px] border-black p-6 md:p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] relative transform transition-all animate-in slide-in-from-bottom-2">
                <div className="mb-8 flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-black uppercase tracking-tight leading-none">Setup Custom<br/>Viva</h2>
                  </div>
                  <button onClick={() => setStage("idle")} className="btn-brutal bg-red-500 text-white p-2 hover:bg-black transition-transform hover:-translate-y-1 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    <X strokeWidth={4} className="w-5 h-5"/>
                  </button>
                </div>
                <form onSubmit={handleCustomVivaSubmit} className="space-y-6">
                  <div className="bg-gray-50 border-4 border-black p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    <label className="block font-black uppercase text-sm mb-3">Topic or Subject</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Data Structures, React hooks..." 
                      className="w-full bg-white border-2 border-black p-3 font-medium text-lg placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/50"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      required
                    />
                  </div>
                  <div className="bg-gray-50 border-4 border-black p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    <label className="block font-black uppercase text-sm mb-3">Select Difficulty</label>
                    <select 
                      className="w-full bg-white border-2 border-black p-3 font-black text-lg cursor-pointer focus:outline-none focus:ring-4 focus:ring-primary/50 appearance-none" 
                      value={difficulty} 
                      onChange={(e) => setDifficulty(e.target.value)}
                    >
                      <option value="Easy">🟩 Beginner / Easy</option>
                      <option value="Medium">🟨 Intermediate / Medium</option>
                      <option value="Hard">🟥 Advanced / Hard</option>
                    </select>
                  </div>
                  <button type="submit" disabled={!topic.trim()} className="mt-8 w-full bg-primary border-4 border-black font-black uppercase text-xl py-4 flex items-center justify-center gap-3 shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-primary">
                     <Award strokeWidth={3} className="w-6 h-6" /> Generate Question
                  </button>
                </form>
             </div>
          )}

          {stage === "fetching" && (
             <div className="flex flex-col items-center gap-4 animate-pulse text-indigo-700">
               <Loader2 className="w-12 h-12 animate-spin" strokeWidth={3} />
               <p className="font-bold uppercase tracking-widest">Consulting LLM for Question...</p>
             </div>
          )}

          {stage === "error" && (
             <div className="w-full max-w-md mx-auto flex flex-col items-center gap-4">
                <div className="bg-red-100 border-4 border-red-500 text-red-900 font-bold p-4 w-full text-left text-sm uppercase">
                  {error}
                </div>
                <button onClick={() => setStage("idle")} className="btn-brutal bg-black text-white w-full uppercase">Go Back</button>
             </div>
          )}

          {(stage === "ready" || stage === "recording") && (
             <div className="w-full relative flex flex-col items-center pt-8">
                <div className="absolute top-0 left-0 right-0 -mt-12 bg-black text-white px-3 py-1 font-bold uppercase text-sm inline-block mx-auto max-w-max border-2 border-black transform -rotate-1">
                  TOPIC: {topic} ({difficulty.toUpperCase()})
                </div>
                
                <div className="mb-8 mt-4 w-full">
                  <h2 className="text-2xl md:text-3xl font-extrabold mb-4">{question}</h2>
                  <p className="text-gray-600 font-medium">Take your time. Speak clearly when ready.</p>
                </div>

                <div className="mb-6 flex flex-col items-center justify-center gap-4">
                   {stage === "ready" ? (
                     <button 
                       onClick={startRecording}
                       className="w-24 h-24 rounded-full flex justify-center items-center border-[6px] border-black transition-transform hover:scale-105 bg-primary shadow-brutal-sm"
                     >
                       <Mic className="w-12 h-12" strokeWidth={3} />
                     </button>
                   ) : (
                     <button 
                       onClick={stopRecording}
                       className="w-24 h-24 rounded-full flex justify-center items-center border-[6px] border-black transition-transform hover:scale-105 bg-red-500 shadow-[6px_6px_0px_rgba(0,0,0,1)] animate-pulse"
                     >
                       <Square className="w-10 h-10 text-white" fill="white" />
                     </button>
                   )}
                   {stage === "recording" && (
                     <div className="flex flex-col items-center gap-1">
                       <span className="font-mono text-2xl font-black">{fmtTime(elapsed)}</span>
                       <p className="font-bold text-red-600 animate-bounce uppercase tracking-wider text-sm mb-4">Listening & Recording...</p>
                       
                       {/* Audio Visualization Bar */}
                       <div className="w-full max-w-xs h-16 bg-gray-200 border-4 border-black relative overflow-hidden flex items-end">
                         <div 
                           ref={volumeBarRef} 
                           className="w-full bg-green-400 absolute bottom-0 left-0 transition-all duration-75 origin-bottom border-t-4 border-black" 
                           style={{ height: '5%' }} 
                         />
                         <div className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-overlay">
                            <span className="font-black uppercase text-2xl text-black tracking-widest opacity-30">VOL</span>
                         </div>
                       </div>
                     </div>
                   )}
                </div>
             </div>
          )}

          {stage === "processing" && (
            <div className="flex flex-col items-center gap-4 animate-pulse text-primary">
              <RefreshCcw className="w-12 h-12 animate-spin text-black" strokeWidth={3} />
              <p className="font-black uppercase tracking-widest text-xl text-black">Processing Audio via Azure TTS...</p>
            </div>
          )}

          {stage === "result" && report && (
             <div className="w-full text-left space-y-6 animate-in slide-in-from-bottom-5">
               {error && (
                 <div className="bg-red-500 text-white font-bold p-3 mb-4 uppercase text-sm border-4 border-black">
                   {error}
                 </div>
               )}
               <div className="flex justify-between items-end border-b-4 border-black pb-3">
                 <div>
                   <span className="bg-primary px-2 border-2 border-black font-bold uppercase text-xs">VIVA REPORT</span>
                   <h2 className="text-2xl font-black mt-1">Assessment Complete</h2>
                 </div>
                 <div className="text-right">
                   <div className="text-3xl font-black">{report.answerScore}/10</div>
                   <div className="text-[10px] font-bold uppercase text-gray-500">Overall Score</div>
                 </div>
               </div>

               <div className="bg-gray-100 border-2 border-black p-4 text-sm font-medium italic relative">
                 <Mic className="absolute top-2 right-2 opacity-10" size={40} />
                 "{report.transcript}"
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                 <div className="bg-white border-2 border-black p-3 text-center">
                   <p className="text-[10px] font-bold uppercase tracking-widest">Pronunciation</p>
                   <p className="text-2xl font-black text-indigo-600">{report.pronunciation}</p>
                 </div>
                 <div className="bg-white border-2 border-black p-3 text-center">
                   <p className="text-[10px] font-bold uppercase tracking-widest">Fluency</p>
                   <p className="text-2xl font-black text-cyan-600">{report.fluency}</p>
                 </div>
                 <div className="bg-white border-2 border-black p-3 text-center">
                   <p className="text-[10px] font-bold uppercase tracking-widest">Accuracy</p>
                   <p className="text-2xl font-black text-amber-500">{report.accuracy}</p>
                 </div>
                 <div className="bg-white border-2 border-black p-3 text-center">
                   <p className="text-[10px] font-bold uppercase tracking-widest">Pace</p>
                   <p className="text-2xl font-black">{report.wpm} <span className="text-xs">wpm</span></p>
                 </div>
               </div>

               <div className="card-brutal bg-black text-white p-5 shadow-none mt-4">
                 <h4 className="font-bold uppercase mb-2 text-primary flex items-center gap-2"><Award className="w-5 h-5"/> Examiner's Feedback</h4>
                 <p className="text-sm leading-relaxed text-gray-300">{report.feedback}</p>
               </div>

               <div className="flex gap-4 pt-2">
                 <button onClick={() => setStage("idle")} className="btn-brutal flex-1 bg-white text-center flex justify-center items-center uppercase font-bold text-sm">
                   Return to Hub
                 </button>
                 <button onClick={() => fetchQuestion(topic, difficulty)} className="btn-brutal flex-1 bg-primary border-black border-2 font-bold uppercase text-sm">
                   Next Question
                 </button>
               </div>
             </div>
          )}
        </div>

        {/* Sidebar / History */}
        <div className="space-y-5">
          {/* Action to start custom if currently idle */}
          {(stage === "idle" || stage === "result") && (
            <button onClick={() => setStage("custom_setup")} className="w-full btn-brutal bg-accent text-black font-black text-lg py-5 uppercase flex justify-center items-center gap-2 shadow-brutal hover:-translate-y-1 transition-transform">
               <Mic strokeWidth={3}/> Start Custom Viva
            </button>
          )}

          <div className="card-brutal bg-secondary">
             <h3 className="font-bold uppercase tracking-wider text-xl mb-4 flex items-center gap-2">
               <Award strokeWidth={3} /> Last Session Feedback
             </h3>
             {lastSession ? (
               <>
                 <div className="bg-white border-2 border-black p-4 mb-4 relative">
                   <div className="absolute -top-3 -right-2 bg-primary border-2 border-black font-black px-2 py-0.5 transform rotate-3">
                     {getGradeScore(lastSession.answer_score)}
                   </div>
                   <div className="flex justify-between items-center mb-2 pr-6">
                     <span className="font-bold uppercase truncate">{lastSession.base_topic}</span>
                   </div>
                   <p className="font-medium text-sm line-clamp-3 text-gray-700">{lastSession.feedback}</p>
                 </div>
                 <div className="grid grid-cols-3 gap-1 mb-4 border-2 border-black bg-black p-0.5">
                   <div className="bg-white text-center py-1">
                     <div className="font-black text-sm">{lastSession.pronunciation}</div>
                     <div className="text-[9px] font-bold uppercase">Pronunc.</div>
                   </div>
                   <div className="bg-white text-center py-1">
                     <div className="font-black text-sm">{lastSession.fluency}</div>
                     <div className="text-[9px] font-bold uppercase">Fluency</div>
                   </div>
                   <div className="bg-white text-center py-1">
                     <div className="font-black text-sm">{lastSession.answer_score}/10</div>
                     <div className="text-[9px] font-bold uppercase">Score</div>
                   </div>
                 </div>
                 <button className="btn-brutal bg-white w-full flex justify-center items-center gap-2 text-sm text-gray-400 cursor-not-allowed">
                    <Play strokeWidth={3} className="w-4 h-4" fill="currentColor" /> Play Recording (Coming Soon)
                 </button>
               </>
             ) : (
               <div className="bg-white border-2 border-black p-4 text-center text-sm font-bold text-gray-500 uppercase">
                 No past vivas found.
               </div>
             )}
          </div>

          <div className="card-brutal bg-white">
             <h3 className="font-bold uppercase tracking-wider text-xl mb-4 flex items-center gap-2">
               <Calendar strokeWidth={3}/> Upcoming Vivas
             </h3>
             <ul className="space-y-3">
               {upcomingVivas.length > 0 ? upcomingVivas.map((ev) => {
                 const timeStr = new Date(ev.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                 return (
                   <li key={ev.id} className="flex justify-between items-center border-b-2 border-dashed border-gray-300 pb-2">
                     <div className="flex flex-col">
                         <span className="font-bold font-medium truncate max-w-[160px]">{ev.title.replace(/^\[.*?\]\s*/, '').replace('Study: ', '')}</span>
                         <span className="text-[10px] uppercase font-bold text-gray-500">{timeStr}</span>
                       </div>
                       <button
                         onClick={() => {
                           const cleanTitle = ev.title.replace(/^\[.*?\]\s*/, '').replace('Study: ', '');
                           setActiveEventId(ev.id);
                           setActiveTopicId(ev.topic_id);
                           setTopic(cleanTitle);
                           fetchQuestion(cleanTitle, 'Medium');
                       }}
                       className="btn-brutal text-xs px-2 py-1 bg-primary text-black flex items-center shadow-none hover:bg-black hover:text-white"
                     >
                       START <ChevronRight className="w-4 h-4 ml-1" />
                     </button>
                   </li>
                 );
               }) : (
                 <li className="text-center font-bold uppercase text-gray-400 py-2 border-dashed border-2 border-gray-200">
                   No vivas scheduled today.
                 </li>
               )}
             </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
