import React from 'react';
import { Target, Flame, Brain, Clock, Plus, Zap, AlertTriangle, Swords, Trophy, CheckSquare, UploadCloud, Mic as MicIcon, PlayCircle, Shield } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="manga-shell space-y-8">
      
      {/* Chapter Header Style */}
      <div className="relative border-8 border-black bg-white p-6 shadow-[12px_12px_0_0_rgba(0,0,0,1)] overflow-hidden">
        {/* Abstract comic burst background */}
        <div className="absolute top-[-50%] right-[-10%] w-[60%] h-[200%] bg-primary transform rotate-12 -z-0 border-l-8 border-black">
           <div className="absolute inset-0 bg-[radial-gradient(#000_3px,transparent_3px)] [background-size:24px_24px] opacity-10"></div>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex-1">
            <div className="inline-block bg-accent text-white px-4 py-1 mb-4 border-4 border-black font-black uppercase text-xl transform -rotate-2">
              Chapter 1: The Grind
            </div>
            <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-tighter leading-none" style={{ WebkitTextStroke: '2px black', color: 'white' }}>
              OVERVIEW
            </h1>
            
            {/* Comic book narration box */}
            <div className="mt-6 bg-[#fff9c4] border-4 border-black p-4 max-w-xl transform rotate-1 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              <p className="font-bold text-lg leading-tight italic">
                "Welcome back to the battlefield. The situation is dire, and you are currently in <span className="text-accent text-xl not-italic uppercase font-black underline decoration-4 underline-offset-4">Panic Mode</span>."
              </p>
            </div>
          </div>
          
          {/* Action Button - Comic Burst Style */}
          <div className="relative group shrink-0 self-center md:self-end mt-4 md:mt-0">
             <div className="absolute inset-0 bg-accent translate-x-2 translate-y-2 border-4 border-black"></div>
             <button className="relative bg-primary border-4 border-black px-6 py-4 font-black uppercase text-xl flex items-center gap-3 hover:-translate-y-1 hover:-translate-x-1 transition-transform group-active:translate-x-2 group-active:translate-y-2 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
               <Plus strokeWidth={4} className="animate-spin-slow" /> Start Focus Block
             </button>
          </div>
        </div>
      </div>

      {/* Manga Panel Grid System */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative">
        
        {/* Left Column panels */}
        <div className="md:col-span-8 flex flex-col gap-6">
          
          {/* Top Row: Mini Panels */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-primary border-8 border-black p-4 shadow-[6px_6px_0_0_rgba(0,0,0,1)] transform -rotate-1 flex flex-col hover:scale-105 transition-transform z-10 hover:z-20">
              <div className="flex justify-between items-start mb-2 border-b-4 border-black pb-2">
                <h3 className="font-black uppercase text-sm leading-tight">Study Streak</h3>
                <Flame className="w-6 h-6 shrink-0" strokeWidth={3} />
              </div>
              <div className="mt-auto text-center pt-2">
                <div className="text-3xl font-black tracking-tighter">12 <span className="text-sm">DAYS</span></div>
                {/* Scream bubble effect */}
                <div className="absolute -top-3 -right-3 bg-white border-2 border-black rounded-full px-2 py-0.5 text-[10px] font-black transform rotate-12">HOT!</div>
              </div>
            </div>

            <div className="bg-white border-8 border-black p-4 shadow-[6px_6px_0_0_rgba(0,0,0,1)] transform rotate-2 flex flex-col hover:scale-105 transition-transform z-10 hover:z-20">
              <div className="flex justify-between items-start mb-2 border-b-4 border-black pb-2">
                <h3 className="font-black uppercase text-sm leading-tight">Syllabus</h3>
                <Target className="w-6 h-6 shrink-0" strokeWidth={3} />
              </div>
              <div className="mt-auto pt-2">
                <div className="text-3xl font-black text-center tracking-tighter mb-1">42%</div>
                <div className="w-full h-3 border-2 border-black bg-gray-200">
                  <div className="h-full bg-accent border-r-2 border-black" style={{ width: '42%' }} />
                </div>
              </div>
            </div>

            <div className="bg-secondary border-8 border-black p-4 shadow-[6px_6px_0_0_rgba(0,0,0,1)] transform -rotate-2 flex flex-col hover:scale-105 transition-transform z-10 hover:z-20 relative overflow-hidden">
               <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:8px_8px]"></div>
              <div className="relative z-10 flex justify-between items-start mb-2 border-b-4 border-black pb-2">
                <h3 className="font-black uppercase text-sm leading-tight">Avg Score</h3>
                <Brain className="w-6 h-6 shrink-0" strokeWidth={3} />
              </div>
              <div className="relative z-10 mt-auto text-center pt-2">
                <div className="text-4xl font-black tracking-tighter text-accent" style={{ textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}>B+</div>
              </div>
            </div>

            <div className="bg-white border-8 border-black p-4 shadow-[6px_6px_0_0_rgba(0,0,0,1)] transform rotate-1 flex flex-col hover:scale-105 transition-transform z-10 hover:z-20">
              <div className="flex justify-between items-start mb-2 border-b-4 border-black pb-2">
                <h3 className="font-black uppercase text-sm leading-tight">Focus Hrs</h3>
                <Clock className="w-6 h-6 shrink-0" strokeWidth={3} />
              </div>
              <div className="mt-auto text-center pt-2">
                <div className="text-3xl font-black tracking-tighter">8.5 <span className="text-sm">H</span></div>
              </div>
            </div>
          </div>

          {/* Large Action Panel: Decay Radar */}
          <section className="bg-white border-8 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] relative p-6">
            {/* Halftone corner detail */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary opacity-30 border-l-8 border-b-8 border-black rounded-bl-full pointer-events-none mix-blend-multiply"></div>
            
            <h2 className="text-3xl font-black uppercase mb-6 flex items-center justify-between border-b-8 border-black pb-4 relative z-10">
              <span className="flex items-center gap-3">
                 <AlertTriangle size={36} strokeWidth={3} className="text-accent" /> Decay Radar
              </span>
              <span className="bg-black text-white px-4 py-2 text-lg transform rotate-[-4deg]">2 AT RISK!</span>
            </h2>
            
            <div className="space-y-6 relative z-10">
              {/* Target Item 1 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-primary border-4 border-black translate-x-2 translate-y-2"></div>
                <div className="relative bg-white border-4 border-black p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-transform group-hover:-translate-y-1">
                  <div>
                    <h4 className="font-black text-xl uppercase">Machine Learning: Neural Nets</h4>
                    <div className="inline-block mt-2 bg-accent text-white font-bold text-sm px-2 py-1 uppercase border-2 border-black transform -rotate-1">
                      Last reviewed 14 days ago
                    </div>
                  </div>
                  <button className="bg-black text-white font-black uppercase px-6 py-3 hover:bg-primary hover:text-black border-2 border-black transition-colors w-full sm:w-auto">
                    Review Now!
                  </button>
                </div>
              </div>

              {/* Target Item 2 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-accent border-4 border-black translate-x-2 translate-y-2"></div>
                <div className="relative bg-white border-4 border-black p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-transform group-hover:-translate-y-1">
                  <div>
                    <h4 className="font-black text-xl uppercase">Data Structures: Trees</h4>
                    <div className="inline-block mt-2 bg-accent text-white font-bold text-sm px-2 py-1 uppercase border-2 border-black transform rotate-1">
                      Last reviewed 11 days ago
                    </div>
                  </div>
                  <button className="bg-black text-white font-black uppercase px-6 py-3 hover:bg-primary hover:text-black border-2 border-black transition-colors w-full sm:w-auto">
                    Review Now!
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column (Sidebar Manga Panels) */}
        <div className="md:col-span-4 flex flex-col gap-6 h-full">
          
          {/* Vertical Impact Panel */}
          <section className="flex-1 bg-accent border-8 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] p-6 relative overflow-hidden flex flex-col justify-center min-h-[300px]">
             {/* Speed lines effect */}
             <div className="absolute inset-0 opacity-20" style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px)' }}></div>
             
             <div className="relative z-10 bg-white border-4 border-black p-6 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
               <h2 className="text-3xl font-black uppercase flex items-center justify-center gap-3 border-b-4 border-black pb-4 text-center">
                 <Zap className="text-secondary" size={40} strokeWidth={3} fill="#ffeb3b" /> NEXT EXAM
               </h2>
               <div className="text-center mt-6">
                 <div className="text-6xl font-black tracking-tighter leading-none transform scale-110 mb-2">7 <span className="text-2xl">DAYS</span></div>
                 <div className="text-xl font-bold uppercase py-2 bg-black text-white mt-4 mx-[-1.5rem]">Mid-Term: Comp Arch</div>
               </div>
               
               {/* Internal Thought Bubble */}
               <div className="mt-6 relative bg-primary p-3 border-2 border-black rounded-lg text-sm font-bold uppercase italic text-center">
                 "Schedule compressed."
                 <div className="absolute -top-3 left-1/2 w-4 h-4 bg-primary border-2 border-black rounded-full"></div>
                 <div className="absolute -top-6 left-[45%] w-2 h-2 bg-primary border-2 border-black rounded-full"></div>
               </div>
             </div>
          </section>

          {/* Activity Panel */}
          <section className="bg-secondary border-8 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-5 relative">
            <h2 className="text-2xl font-black uppercase mb-5 border-b-8 border-black pb-2 bg-white px-3 py-1 inline-block transform -skew-x-6 border-l-4 border-t-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              Activity Log
            </h2>
            <ul className="space-y-4 bg-white border-4 border-black p-4">
              <li className="flex gap-4 items-start pb-4 border-b-2 border-dashed border-black">
                <div className="relative group shrink-0">
                  <div className="w-8 h-8 rounded-full bg-accent border-4 border-black flex items-center justify-center z-10 relative text-white font-black text-xs">V</div>
                  <div className="absolute inset-0 bg-black rounded-full translate-x-1 translate-y-1"></div>
                </div>
                <div>
                  <p className="font-black uppercase text-sm leading-tight">Oral Viva Cleared!</p>
                  <p className="text-xs font-bold bg-primary px-1 mt-1 inline-block border-2 border-black">Scored A- (OS Memory)</p>
                </div>
              </li>
              <li className="flex gap-4 items-start">
               <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary border-4 border-black flex items-center justify-center z-10 relative text-black font-black text-xs">P</div>
                  <div className="absolute inset-0 bg-black rounded-full translate-x-1 translate-y-1"></div>
                </div>
                <div>
                  <p className="font-black uppercase text-sm leading-tight">PDF Uploaded</p>
                  <p className="text-xs font-bold mt-1 text-gray-700">AI extracted 12 topics.</p>
                </div>
              </li>
            </ul>
          </section>

        </div>
      </div>

      {/* Expanded Dashboard Row: Quests and Training */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        
        {/* Daily Bounties Panel */}
        <section className="bg-primary border-8 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] p-6 relative group overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.15)_2px,transparent_2px)] [background-size:12px_12px]"></div>
          
          <div className="relative z-10 h-full flex flex-col">
            <h2 className="text-3xl font-black uppercase flex items-center gap-3 border-b-8 border-black pb-4 mb-6 bg-white p-3 transform -rotate-1 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              <Swords className="text-accent" size={32} strokeWidth={3} /> Daily Bounties
            </h2>
            
            <ul className="space-y-4 flex-1">
              {[
                { task: "Complete 2 Focus Blocks", reward: "50 EXP", done: true },
                { task: "Defeat 'Pointers' Viva", reward: "Unlock Ch.5", done: false },
                { task: "Upload Physics Syllabus", reward: "10 EXP", done: false }
              ].map((bounty, i) => (
                <li key={i} className={`flex items-center justify-between p-4 border-4 border-black transition-transform hover:scale-[1.02] cursor-pointer ${bounty.done ? 'bg-secondary/50 line-through opacity-75' : 'bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 flex items-center justify-center border-4 border-black shrink-0 ${bounty.done ? 'bg-accent' : 'bg-white'}`}>
                      {bounty.done && <CheckSquare className="text-white" strokeWidth={4} size={20} />}
                    </div>
                    <span className="font-black uppercase text-lg leading-tight">{bounty.task}</span>
                  </div>
                  <span className="bg-black text-primary font-black px-2 py-1 text-sm transform rotate-2 shrink-0">{bounty.reward}</span>
                </li>
              ))}
            </ul>
             <button className="w-full mt-6 bg-black text-white font-black uppercase tracking-widest text-lg py-3 hover:-translate-y-1 hover:shadow-[4px_4px_0_0_rgba(255,255,255,1)] transition-all border-4 border-white">
                Claim Rewards!
             </button>
          </div>
        </section>

        {/* Training Grounds Panel */}
        <section className="bg-[#FAF9F6] border-8 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] p-6 relative flex flex-col">
          <div className="absolute top-0 right-0 w-full h-full bg-[repeating-linear-gradient(-45deg,transparent,transparent_10px,rgba(0,0,0,0.05)_10px,rgba(0,0,0,0.05)_20px)] pointer-events-none"></div>
          <div className="relative z-10 flex-1 flex flex-col">
            <h2 className="text-3xl font-black uppercase flex justify-between items-center border-b-8 border-black pb-4 mb-6">
              <span className="flex items-center gap-3">
                <Trophy className="text-black" size={32} strokeWidth={3} fill="#000" /> Training Camp
              </span>
              <span className="text-sm font-black bg-primary border-4 border-black px-3 py-1 shadow-[4px_4px_0_0_rgba(0,0,0,1)] transform rotate-2">
                ACTIVE
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              <button className="flex flex-col items-center justify-center p-6 bg-white border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all group min-h-[140px]">
                <MicIcon size={40} strokeWidth={2.5} className="mb-3 group-hover:scale-110 transition-transform text-accent" />
                <span className="font-black uppercase text-lg text-center leading-tight">AI Mock Viva</span>
                <span className="text-xs font-bold text-gray-500 mt-2 border-t-2 border-black pt-1 w-full text-center">Start Interrogation</span>
              </button>

              <button className="flex flex-col items-center justify-center p-6 bg-white border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all group min-h-[140px]">
                <UploadCloud size={40} strokeWidth={2.5} className="mb-3 group-hover:scale-110 transition-transform text-blue-600" />
                <span className="font-black uppercase text-lg text-center leading-tight">Add Grimoire</span>
                <span className="text-xs font-bold text-gray-500 mt-2 border-t-2 border-black pt-1 w-full text-center">Upload PDF Syllabus</span>
              </button>

              <button className="flex flex-col items-center justify-center p-4 md:p-6 bg-black text-primary border-4 border-black shadow-[4px_4px_0_0_rgba(255,184,0,1)] hover:-translate-y-1 transition-all group md:col-span-2 mt-2 group">
                <span className="font-black uppercase text-xl flex items-center justify-center gap-3 text-center">
                  <PlayCircle className="text-white group-hover:scale-110 transition-transform" size={32} /> ENTER HYPERBOLIC FOCUS
                </span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Expanded Dashboard Row: Skill Arsenal (Knowledge Tree Preview) */}
      <section className="bg-white border-8 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] p-6 relative overflow-hidden mt-2 mb-8">
         {/* Action burst background */}
         <div className="absolute right-[-10%] top-[-50%] w-[40%] h-[200%] bg-secondary opacity-30 rounded-full blur-3xl pointer-events-none"></div>
         
         <div className="relative z-10">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-8 border-black pb-6 mb-8 gap-4">
             <div>
               <div className="bg-black text-white px-3 py-1 font-black uppercase inline-block mb-3 transform -rotate-2 border-2 border-transparent">Arc Progression</div>
               <h2 className="text-4xl font-black uppercase text-black" style={{ textShadow: '2px 2px 0 #fff' }}>Current Arsenal</h2>
             </div>
             <button className="font-black uppercase underline decoration-4 underline-offset-4 hover:text-accent transition-colors bg-[#FAF9F6] px-4 py-2 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                View Full Tree
             </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              
              {/* Skill Node 1 */}
              <div className="bg-white border-8 border-black p-6 relative hover:bg-primary transition-colors cursor-pointer group shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
                 <div className="flex justify-between items-center mb-6">
                   <h3 className="font-black text-2xl uppercase leading-tight pr-2">Data Structs</h3>
                   <span className="bg-accent text-white px-2 py-1 text-sm font-black transform rotate-3 border-2 border-black flex-shrink-0">LVL 4</span>
                 </div>
                 <div className="w-full h-5 border-4 border-black bg-gray-200 overflow-hidden relative">
                   <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,rgba(0,0,0,0.1)_5px,rgba(0,0,0,0.1)_10px)]"></div>
                   <div className="h-full bg-black border-r-4 border-black w-[80%] relative z-10"></div>
                 </div>
                 <p className="font-bold text-sm mt-4 opacity-70 group-hover:opacity-100 uppercase tracking-widest flex justify-between">
                    <span>Next unlock:</span> <span className="text-black">Graph DFS</span>
                 </p>
              </div>

              {/* Skill Node 2 */}
              <div className="bg-white border-8 border-black p-6 relative hover:bg-secondary transition-colors cursor-pointer group shadow-[8px_8px_0_0_rgba(0,0,0,1)] transform -translate-y-2">
                 <div className="flex justify-between items-center mb-6">
                   <h3 className="font-black text-2xl uppercase leading-tight pr-2">Algorithms</h3>
                   <span className="bg-primary text-black px-2 py-1 text-sm font-black transform -rotate-2 border-4 border-black flex-shrink-0">LVL 2</span>
                 </div>
                 <div className="w-full h-5 border-4 border-black bg-gray-200 overflow-hidden relative">
                   <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,rgba(0,0,0,0.1)_5px,rgba(0,0,0,0.1)_10px)]"></div>
                   <div className="h-full bg-accent border-r-4 border-black w-[35%] animate-pulse relative z-10"></div>
                 </div>
                 <p className="font-bold text-sm mt-4 opacity-70 group-hover:opacity-100 uppercase tracking-widest flex justify-between">
                    <span>Training Reqd:</span> <span className="text-black">35%</span>
                 </p>
                 {/* Upgrade icon block */}
                 <div className="absolute -top-5 -right-5 bg-white border-4 border-black rounded-full p-2 text-accent font-black tracking-tighter transform rotate-12 shadow-[4px_4px_0_0_rgba(0,0,0,1)] bg-primary group-hover:scale-110 transition-transform">
                    ▲ UP!
                 </div>
              </div>

              {/* Skill Node 3 (Locked) */}
              <div className="bg-gray-100 border-8 border-black p-6 relative hover:bg-gray-200 transition-colors cursor-pointer group overflow-hidden">
                 <div className="flex justify-between items-center mb-6 relative z-10">
                   <h3 className="font-black text-2xl uppercase opacity-50 leading-tight">Web Sec</h3>
                   <span className="bg-gray-400 text-black px-2 py-1 text-sm font-black transform rotate-1 border-2 border-black flex-shrink-0">LOCKED</span>
                 </div>
                 <div className="w-full h-5 border-4 border-black bg-gray-300 opacity-50 relative z-10"></div>
                 <p className="font-bold text-sm mt-4 opacity-70 uppercase tracking-widest relative z-10 border-t-2 border-dashed border-gray-400 pt-2">
                    Defeat 'Algorithms' to unlock
                 </p>
                 <Shield size={100} className="absolute -bottom-4 -right-4 text-black opacity-[0.05] -rotate-12 pointer-events-none group-hover:opacity-10 transition-opacity" strokeWidth={1} />
              </div>

           </div>
         </div>
      </section>

    </div>
  );
}
