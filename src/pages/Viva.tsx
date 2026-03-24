import React, { useState } from 'react';
import { Mic, MicOff, Play, Square, Award } from 'lucide-react';

export default function Viva() {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="page-shell">
      
      {/* Header */}
      <div>
        <h1 className="page-title flex items-center gap-3">
          <Mic className="w-10 h-10" strokeWidth={2.5} />
          Voice Viva
        </h1>
        <p className="page-subtitle">Simulated oral examination and concept testing.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr,0.85fr]">
        
        {/* Viva Session Area */}
        <div className="card-brutal bg-white flex flex-col items-center justify-center min-h-[420px] text-center p-6 md:p-8 relative">
          
          <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 font-bold uppercase text-sm">
            Topic: Operating Systems CPU Scheduling
          </div>
          
          <div className="mb-8 mt-10">
            <h2 className="text-xl md:text-2xl font-bold mb-4">"Explain the difference between Preemptive and Non-Preemptive scheduling."</h2>
            <p className="text-gray-600 font-medium">Take your time. Speak clearly when ready.</p>
          </div>

          <div className="mb-6 flex items-center justify-center gap-6">
             <button 
               onClick={() => setIsRecording(!isRecording)}
               className={`w-24 h-24 rounded-full flex justify-center items-center border-4 border-black transition-transform hover:scale-105 ${
                 isRecording ? 'bg-red-500 shadow-[4px_4px_0px_rgba(0,0,0,1)] animate-pulse' : 'bg-primary shadow-[6px_6px_0px_rgba(0,0,0,1)]'
               }`}
             >
               {isRecording ? <Square className="w-10 h-10 text-white" fill="white" /> : <Mic className="w-10 h-10" strokeWidth={3} />}
             </button>
          </div>
          
          {isRecording && (
            <p className="font-bold text-red-600 animate-pulse uppercase tracking-wider">Listening...</p>
          )}

          <div className="mt-6 grid w-full gap-2 sm:grid-cols-3">
            <div className="surface-muted p-2 text-left">
              <p className="text-[11px] font-bold uppercase tracking-wider">Clarity</p>
              <p className="text-xl font-black">84</p>
            </div>
            <div className="surface-muted p-2 text-left">
              <p className="text-[11px] font-bold uppercase tracking-wider">Coverage</p>
              <p className="text-xl font-black">72</p>
            </div>
            <div className="surface-muted p-2 text-left">
              <p className="text-[11px] font-bold uppercase tracking-wider">Confidence</p>
              <p className="text-xl font-black">79</p>
            </div>
          </div>

        </div>

        {/* Feedback & History */}
        <div className="space-y-5">
          <div className="card-brutal bg-secondary">
             <h3 className="font-bold uppercase tracking-wider text-xl mb-4 flex items-center gap-2">
               <Award strokeWidth={3} /> Last Session Feedback
             </h3>
             <div className="bg-white border-2 border-black p-4 mb-4">
               <div className="flex justify-between items-center mb-2">
                 <span className="font-bold uppercase">Memory Management</span>
                 <span className="bg-black text-white px-2 py-1 font-bold text-sm">Score: A-</span>
               </div>
               <p className="font-medium text-sm">You clearly understood paging vs segmentation. However, you missed mentioning translation lookaside buffers (TLBs) when discussing performance.</p>
             </div>
             <button className="btn-brutal bg-white w-full flex justify-center items-center gap-2">
                <Play strokeWidth={3} className="w-5 h-5" fill="currentColor" /> Play Recording
             </button>
          </div>

          <div className="card-brutal bg-white">
             <h3 className="font-bold uppercase tracking-wider text-xl mb-4">Upcoming Vivas</h3>
             <ul className="space-y-3">
               <li className="flex justify-between items-center border-b-2 border-dashed border-gray-300 pb-2">
                 <span className="font-bold font-medium">Data Structures</span>
                 <span className="text-sm border-2 border-black px-2 py-1 bg-primary font-bold uppercase">10:45 AM</span>
               </li>
               <li className="flex justify-between items-center border-b-2 border-dashed border-gray-300 pb-2">
                 <span className="font-bold font-medium">Networking Basics</span>
                 <span className="text-sm border-2 border-black px-2 py-1 font-bold uppercase">Tomorrow</span>
               </li>
             </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
