import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Brain, Clock, Cpu, Award, Zap, Network } from 'lucide-react';

export default function Index() {
  return (
    <div className="min-h-screen relative flex flex-col manga-shell overflow-hidden bg-white">
      {/* Decorative Manga Screentone Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] z-0"></div>

      {/* Navigation - Manga Panel Header Style */}
      <nav className="px-4 py-3 flex justify-between items-center border-b-8 border-black bg-white sticky top-0 z-50 relative">
        {/* Speed lines in navbar */}
        <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(90deg,transparent,transparent_20px,#000_20px,#000_40px)] pointer-events-none"></div>
        
        <div className="relative z-10 flex items-center group">
          <div className="absolute inset-0 bg-accent translate-x-1 translate-y-1 border-4 border-black transition-transform group-hover:translate-x-2 group-hover:translate-y-2"></div>
          <div className="text-3xl font-black uppercase tracking-tighter bg-primary px-4 py-2 border-4 border-black relative transform -rotate-2 group-hover:-rotate-3 transition-transform text-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            NeuroCanopy
          </div>
        </div>
        
        <div className="flex gap-6 items-center relative z-10">
          <Link to="/login" className="font-black uppercase tracking-widest text-xl px-2 py-1 transform rotate-1 hover:-rotate-2 transition-transform hidden sm:block relative hover:text-accent group">
             <span className="relative z-10">Log in</span>
             <span className="absolute bottom-0 left-0 w-full h-1 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
          </Link>
          
          <div className="relative group">
            <div className="absolute inset-0 bg-primary border-4 border-black translate-x-1 translate-y-1 transition-transform group-hover:translate-x-2 group-hover:translate-y-2"></div>
            <Link to="/register" className="relative flex items-center gap-2 bg-accent text-white font-black uppercase text-xl px-6 py-3 border-4 border-black transform rotate-1 group-hover:rotate-0 transition-transform shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              Start Now <Zap className="w-6 h-6 fill-white" strokeWidth={3} />
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 relative z-10">
        {/* Hero Section - Manga Title Page Style */}
        <section className="relative overflow-hidden border-b-8 border-black bg-[#FAF9F6] py-20 lg:py-32 flex justify-center border-x-8 lg:border-x-0 border-black mx-4 lg:mx-0 my-4 lg:my-0 shadow-[8px_8px_0_0_rgba(0,0,0,1)] lg:shadow-none bg-[radial-gradient(#000_1.5px,transparent_1.5px)] [background-size:24px_24px]">
          
          {/* Giant Abstract Action Manga Background Frame */}
          <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[120%] bg-[#FFD700] border-l-8 border-black transform rotate-12 flex items-center justify-center overflow-hidden">
             {/* Hypnotizing Spiral Animation */}
             <div className="absolute w-[200%] h-[200%] opacity-30 bg-[repeating-radial-gradient(circle_at_45%_45%,transparent,transparent_15px,#000_15px,#000_30px)] animate-[spin_20s_linear_infinite]"></div>
          </div>
          
          {/* Abstract Halftone left element */}
          <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 bg-accent rounded-full border-8 border-black opacity-90 mix-blend-multiply"></div>

          <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center text-center px-4">
            
            {/* Episode/Chapter Title Box */}
            <div className="relative group mb-8">
              <div className="absolute inset-0 bg-accent border-4 border-black translate-x-2 translate-y-2"></div>
              <div className="bg-white border-4 border-black px-6 py-3 font-black uppercase tracking-widest text-xl relative transform -rotate-3 group-hover:rotate-0 transition-transform">
                Episode 1: The Anti-Procrastination Engine
              </div>
            </div>
            
            {/* Massive Manga Action Impact Typography */}
            <div className="relative inline-block w-full max-w-4xl">
              <div className="absolute -inset-10 opacity-30 pointer-events-none scale-150 rotate-12 pattern-dots-md text-red-500"></div>
              <h1 className="text-[clamp(4rem,10vw,12rem)] font-black uppercase tracking-tighter leading-[0.85] text-black relative z-10 drop-shadow-[8px_8px_0_rgba(255,255,255,1)]" style={{ WebkitTextStroke: '3px black' }}>
                <span className="block transform -skew-x-6 hover:scale-105 transition-transform bg-white pr-4 inline-block mb-2 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]">Hack Your</span> <br/>
                <span className="relative inline-block mt-4">
                  <span className="absolute inset-0 bg-accent blur-md opacity-50 translate-y-4"></span>
                  <span className="text-white relative bg-red-600 px-6 py-2 border-8 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] transform rotate-2 inline-block">Attention</span>
                </span>
                <span className="text-white relative bg-primary px-6 py-2 border-8 border-t-0 lg:border-t-8 border-black lg:-ml-4 shadow-[12px_12px_0_0_rgba(0,0,0,1)] transform -rotate-2 inline-block mt-4 lg:mt-0">Span!</span>
              </h1>
            </div>
            
            {/* Comic Speech Bubble Box */}
            <div className="relative mt-16 max-w-4xl">
              <div className="bg-white border-8 border-black p-8 shadow-[12px_12px_0_0_rgba(0,0,0,1)] transform rotate-1">
                <p className="text-2xl md:text-3xl font-bold leading-snug uppercase tracking-wide">
                  Stop fighting your brain. NeuroCanopy uses hard-locked focus blocks, active AI oral vivas, and chronological pacing to brute-force your learning.
                </p>
              </div>
              <div className="absolute -top-8 right-12 w-8 h-8 bg-white border-l-8 border-t-8 border-black rotate-45"></div>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-16 flex flex-col sm:flex-row gap-8 items-center">
              
              {/* Primary Manga Call to Action (SFX Style) */}
              <div className="relative group cursor-pointer">
                {/* Comic Action starburst back */}
                <div className="absolute inset-[-20%] bg-primary border-4 border-black rotate-[-15deg] scale-0 group-hover:scale-100 transition-transform duration-300 rounded-lg"></div>
                <div className="absolute inset-0 bg-black translate-x-3 translate-y-3 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform border-4 border-black"></div>
                <Link to="/register" className="relative flex items-center gap-3 bg-accent text-white font-black uppercase text-3xl px-12 py-6 border-8 border-black transform -rotate-2 group-hover:rotate-0 transition-transform">
                  Claim Your Brain! <Brain strokeWidth={3} className="w-10 h-10 animate-bounce" />
                </Link>
                {/* SFX Text */}
                <div className="absolute -top-6 -right-10 text-xl font-black uppercase text-secondary stroke-black transform rotate-12 opacity-0 group-hover:opacity-100 transition-opacity" style={{ WebkitTextStroke: '1px black' }}>BAM!</div>
              </div>

              <div className="relative group cursor-pointer mt-4 sm:mt-0">
                <div className="absolute inset-0 bg-black translate-x-2 translate-y-2 border-4 border-black"></div>
                <button className="relative flex items-center justify-center gap-2 bg-white text-black font-black uppercase text-2xl px-10 py-5 border-8 border-black transform rotate-2 group-hover:rotate-0 transition-transform shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                  See How It Works
                </button>
              </div>
            </div>
            
          </div>
        </section>

        {/* Features Section - Manga Panel Grid System */}
        <section className="py-24 px-4 bg-white border-b-8 border-black overflow-hidden relative">
          <div className="max-w-[1400px] mx-auto">
            {/* Bold Title */}
            <div className="flex flex-col items-center mb-20 relative z-20">
               <div className="bg-black text-white px-8 py-3 font-black uppercase text-4xl md:text-6xl transform -skew-x-6 border-4 border-black shadow-[12px_12px_0_0_#FFB800] relative">
                 <span className="absolute -top-4 -left-4 w-8 h-8 bg-accent border-4 border-black rounded-full shadow-[4px_4px_0_0_rgba(0,0,0,1)]"></span>
                 Ruthless Features
               </div>
            </div>
            
            {/* Comic Vertical Panels Layout */}
            <div className="flex flex-col md:flex-row h-auto md:h-[650px] gap-8 md:gap-4 lg:gap-6 px-2 md:px-8">
              
              {/* Panel 1: AI Voice Viva (Blue) */}
              <div className="relative flex-1 group overflow-hidden border-8 border-black bg-[#0084FF] shadow-[8px_8px_0_0_rgba(0,0,0,1)] transform md:-skew-x-6 hover:scale-[1.02] hover:z-20 transition-transform duration-300 min-h-[450px]">
                {/* Halftone Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.25)_3px,transparent_3px)] [background-size:20px_20px]"></div>
                {/* Manga Speed Lines */}
                <div className="absolute inset-0 origin-center" style={{ background: 'repeating-conic-gradient(from 0deg at 50% 50%, transparent 0deg 3deg, rgba(0,0,0,0.15) 3deg 6deg)' }}></div>
                
                {/* Panel Content (Un-skewed) */}
                <div className="relative z-10 flex flex-col h-full transform md:skew-x-6 p-4 lg:p-8 justify-center items-center">
                  <div className="bg-white border-4 md:border-8 border-black p-6 w-full max-w-[300px] shadow-[6px_6px_0_0_rgba(0,0,0,1)] transform -rotate-2 group-hover:-rotate-1 transition-transform relative mt-10">
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#0084FF] border-4 border-black w-20 h-20 rounded-full flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)] group-hover:-translate-y-2 transition-transform">
                      <Brain className="w-10 h-10 text-white" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mt-6 mb-3 leading-none text-center">AI Voice<br/>Viva</h3>
                    <div className="w-full h-2 bg-black mb-4"></div>
                    <p className="font-bold text-[15px] leading-snug text-center">
                      Passive reading is a myth. Our AI interrogates you orally on your syllabus to expose what you don't actually know.
                    </p>
                  </div>
                </div>
              </div>

              {/* Panel 2: Quantum Scheduling (Yellow/Orange) */}
              <div className="relative flex-1 group overflow-hidden border-8 border-black bg-[#FFB800] shadow-[8px_8px_0_0_rgba(0,0,0,1)] transform md:-skew-x-6 hover:scale-[1.02] hover:z-20 transition-transform duration-300 min-h-[450px]">
                {/* Halftone Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.2)_3px,transparent_3px)] [background-size:20px_20px]"></div>
                {/* Manga Speed Lines */}
                <div className="absolute inset-0 origin-center" style={{ background: 'repeating-conic-gradient(from 0deg at 50% 50%, transparent 0deg 4deg, rgba(0,0,0,0.12) 4deg 8deg)' }}></div>
                
                {/* Panel Content (Un-skewed) */}
                <div className="relative z-10 flex flex-col h-full transform md:skew-x-6 p-4 lg:p-8 justify-center items-center">
                  <div className="bg-white border-4 md:border-8 border-black p-6 w-full max-w-[300px] shadow-[6px_6px_0_0_rgba(0,0,0,1)] transform rotate-1 group-hover:rotate-2 transition-transform relative mt-10">
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#FFB800] border-4 border-black w-20 h-20 rounded-[8px] transform rotate-12 flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)] group-hover:-translate-y-2 group-hover:-rotate-12 transition-transform duration-300">
                      <Clock className="w-10 h-10 text-black transform -rotate-12 group-hover:rotate-12 transition-transform duration-300" strokeWidth={3} />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mt-6 mb-3 leading-none text-center">Quantum<br/>Scheduling</h3>
                    <div className="w-full h-2 bg-black mb-4"></div>
                    <p className="font-bold text-[15px] leading-snug text-center">
                      Input your chronotype, sleep schedule, and exams. We generate a merciless, minute-by-minute survival plan.
                    </p>
                  </div>
                </div>
              </div>

              {/* Panel 3: Panic Mode (Red) */}
              <div className="relative flex-1 group overflow-hidden border-8 border-black bg-accent shadow-[8px_8px_0_0_rgba(0,0,0,1)] transform md:-skew-x-6 hover:scale-[1.02] hover:z-20 transition-transform duration-300 min-h-[450px]">
                {/* Halftone Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.25)_3px,transparent_3px)] [background-size:20px_20px]"></div>
                {/* Manga Speed Lines */}
                <div className="absolute inset-0 origin-center" style={{ background: 'repeating-conic-gradient(from 0deg at 50% 50%, transparent 0deg 5deg, rgba(0,0,0,0.2) 5deg 10deg)' }}></div>
                
                {/* Panel Content (Un-skewed) */}
                <div className="relative z-10 flex flex-col h-full transform md:skew-x-6 p-4 lg:p-8 justify-center items-center">
                  <div className="bg-white border-4 md:border-8 border-black p-6 w-full max-w-[300px] shadow-[6px_6px_0_0_rgba(0,0,0,1)] transform -rotate-1 group-hover:rotate-0 transition-transform relative mt-16">
                    {/* Starburst icon container */}
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 group-hover:-translate-y-2 transition-transform">
                       <div className="relative bg-accent border-4 border-black w-20 h-20 rotate-45 flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)] animate-pulse-slow">
                         <div className="absolute inset-0 bg-accent border-4 border-black rotate-45"></div>
                         <Cpu className="w-10 h-10 text-white relative z-10 -rotate-45" strokeWidth={3} />
                       </div>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mt-6 mb-3 leading-none text-center">Panic<br/>Mode</h3>
                    <div className="w-full h-2 bg-black mb-4"></div>
                    <p className="font-bold text-[15px] leading-snug text-center">
                      When deadlines compress, the app goes red. Notifications get aggressive. Site-blocking locks down tight.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Expanded How it Works Manga Panel Flow */}
        <section className="py-24 px-4 bg-white border-b-8 border-black overflow-hidden relative">
          {/* Subtle Halftone Dot Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_2px,transparent_2px)] [background-size:24px_24px] pointer-events-none"></div>
          
          <div className="max-w-[1000px] mx-auto relative z-10">
            {/* Title */}
            <div className="flex justify-center mb-24 relative z-20">
              <div className="bg-[#FFD700] border-8 border-black px-12 py-3 shadow-[12px_12px_0_0_rgba(0,0,0,1)] transform rotate-[-2deg] hover:rotate-0 transition-transform">
                <h2 className="text-4xl md:text-6xl font-black uppercase text-black tracking-tight" style={{ textShadow: '2px 2px 0px #fff, -1px -1px 0px #fff' }}>
                  The Battle Plan
                </h2>
              </div>
            </div>

            {/* Drawing structured steps container */}
            <div className="relative flex flex-col gap-12 md:gap-8 pb-12">
              
              {/* Central Black Spine (Desktop only) */}
              <div className="hidden md:block absolute top-[5%] bottom-[-5%] left-1/2 w-4 bg-black -translate-x-1/2 z-0">
                 {/* Decorative slash marks crossing the spine */}
                 <div className="absolute top-[28%] left-1/2 w-20 h-4 bg-black -translate-x-1/2 rotate-[15deg]"></div>
                 <div className="absolute top-[74%] left-1/2 w-20 h-4 bg-black -translate-x-1/2 rotate-[15deg]"></div>
                 <div className="absolute top-[98%] left-1/2 w-24 h-4 bg-black -translate-x-1/2 rotate-0"></div>
              </div>

              {/* Step 1: Left */}
              <div className="flex w-full md:justify-start justify-center relative z-10">
                <div className="md:w-[45%] w-full relative">
                  {/* Comic Explosion Blast Background */}
                  <div className="absolute -inset-8 bg-yellow-400 z-0" style={{ clipPath: 'polygon(50% 0%, 65% 15%, 100% 10%, 85% 35%, 100% 60%, 75% 70%, 85% 100%, 50% 85%, 15% 100%, 25% 70%, 0% 60%, 15% 35%, 0% 10%, 35% 15%)' }}></div>
                  <div className="absolute -inset-6 bg-red-600 z-0" style={{ clipPath: 'polygon(50% 0%, 65% 15%, 100% 10%, 85% 35%, 100% 60%, 75% 70%, 85% 100%, 50% 85%, 15% 100%, 25% 70%, 0% 60%, 15% 35%, 0% 10%, 35% 15%)' }}></div>
                  
                  {/* Comic Cloud Bubble Shape */}
                  <div className="bg-white border-8 border-black p-8 md:p-10 shadow-[10px_10px_0_0_rgba(0,0,0,1)] transform rotate-1 hover:-translate-y-1 transition-transform relative z-10 rounded-2xl" style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }}>
                     {/* Step Number Badge */}
                     <div className="absolute -top-6 -left-6 bg-black text-white w-14 h-14 flex items-center justify-center font-black text-3xl rotate-[5deg] z-20">1</div>
                     
                     <h3 className="text-2xl font-black uppercase mb-4 border-b-4 border-black pb-2 text-[#0084FF] tracking-tight relative z-10 pl-6">Feed the Engine</h3>
                     <p className="font-bold text-[17px] leading-relaxed text-gray-900 relative z-10 text-center px-4">
                       Upload your syllabus, lecture slides, and past papers. Our system immediately devours the content and identifies your exact vulnerabilities.
                     </p>
                  </div>
                </div>
              </div>

              {/* Step 2: Right */}
              <div className="flex w-full md:justify-end justify-center relative z-10 mt-8 md:-mt-4">
                <div className="md:w-[45%] w-full relative">
                  {/* Comic Explosion Blast Background */}
                  <div className="absolute -inset-8 bg-yellow-400 z-0 rotate-[15deg] scale-105" style={{ clipPath: 'polygon(50% 0%, 65% 15%, 100% 10%, 85% 35%, 100% 60%, 75% 70%, 85% 100%, 50% 85%, 15% 100%, 25% 70%, 0% 60%, 15% 35%, 0% 10%, 35% 15%)' }}></div>
                  <div className="absolute -inset-6 bg-blue-600 z-0 rotate-[15deg] scale-105" style={{ clipPath: 'polygon(50% 0%, 65% 15%, 100% 10%, 85% 35%, 100% 60%, 75% 70%, 85% 100%, 50% 85%, 15% 100%, 25% 70%, 0% 60%, 15% 35%, 0% 10%, 35% 15%)' }}></div>

                  {/* Comic Cloud Bubble Shape */}
                  <div className="bg-white border-8 border-black p-8 md:p-10 shadow-[10px_10px_0_0_rgba(0,0,0,1)] transform -rotate-[1.5deg] hover:-translate-y-1 transition-transform relative z-10 rounded-2xl" style={{ borderRadius: '50% 40% 30% 70% / 60% 50% 40% 50%' }}>
                     {/* Step Number Badge */}
                     <div className="absolute -top-6 -left-6 bg-black text-white w-14 h-14 flex items-center justify-center font-black text-3xl rotate-[-8deg] z-20">2</div>
                     
                     <h3 className="text-2xl font-black uppercase mb-4 border-b-[3px] border-black pb-2 text-[#FFB800] tracking-tight relative z-10 pl-6">Survive the Viva</h3>
                     <p className="font-bold text-[17px] leading-relaxed text-gray-900 relative z-10 text-center px-4">
                       Don't just stare at notes. The AI will verbally cross-examine you. If you can't explain it back, you don't know it. We force active recall.
                     </p>
                  </div>
                </div>
              </div>

              {/* Step 3: Left */}
              <div className="flex w-full md:justify-start justify-center relative z-10 mt-8 md:mt-8">
                <div className="md:w-[45%] w-full relative">
                  {/* Comic Explosion Blast Background */}
                  <div className="absolute -inset-8 bg-yellow-400 z-0 rotate-[-10deg] scale-110" style={{ clipPath: 'polygon(50% 0%, 65% 15%, 100% 10%, 85% 35%, 100% 60%, 75% 70%, 85% 100%, 50% 85%, 15% 100%, 25% 70%, 0% 60%, 15% 35%, 0% 10%, 35% 15%)' }}></div>
                  <div className="absolute -inset-6 bg-[#00E572] z-0 rotate-[-10deg] scale-110" style={{ clipPath: 'polygon(50% 0%, 65% 15%, 100% 10%, 85% 35%, 100% 60%, 75% 70%, 85% 100%, 50% 85%, 15% 100%, 25% 70%, 0% 60%, 15% 35%, 0% 10%, 35% 15%)' }}></div>

                  {/* Comic Cloud Bubble Shape */}
                  <div className="bg-white border-8 border-black p-8 md:p-10 shadow-[10px_10px_0_0_rgba(0,0,0,1)] transform rotate-[1deg] hover:-translate-y-1 transition-transform relative z-10 rounded-2xl" style={{ borderRadius: '60% 40% 50% 50% / 40% 50% 60% 40%' }}>
                     {/* Safe area for background blob so it doesn't clip the badge */}
                     <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[inherit]">
                       {/* Decorative background blob for Step 3 */}
                       <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-[#FFD1C1] rounded-full opacity-80"></div>
                     </div>
                     
                     {/* Step Number Badge */}
                     <div className="absolute -top-6 -left-8 bg-black text-white w-14 h-14 flex items-center justify-center font-black text-3xl rotate-[3deg] z-20">3</div>
                     
                     <div className="relative z-10">
                       <h3 className="text-2xl font-black uppercase mb-4 border-b-[3px] border-black pb-2 text-[#FF3B30] tracking-tight pl-8">DOMINATE EXAMS</h3>
                       <p className="font-bold text-[17px] leading-relaxed text-gray-900 text-center px-4">
                         With optimized scheduling and brutal focus tracking, you physically won't be able to procrastinate. Walk into the exam room over-prepared.
                       </p>
                     </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Philosophy / Value Prop Section */}
        <section className="py-24 px-6 bg-black text-white border-b-8 border-black relative overflow-hidden">
          {/* Manga Action Lines in White */}
          <div className="absolute inset-0 opacity-10" style={{ background: 'repeating-conic-gradient(from 0deg at 50% 50%, transparent 0deg 2deg, #fff 2deg 4deg)' }}></div>
          
          <div className="max-w-5xl mx-auto relative z-10 text-center">
            <h2 className="text-5xl md:text-7xl font-black uppercase mb-10 text-primary drop-shadow-[4px_4px_0_rgba(255,255,255,1)] transform -rotate-1" style={{ WebkitTextStroke: '2px black' }}>
              Why We Built This.
            </h2>
            
            <div className="text-2xl md:text-3xl font-bold leading-relaxed space-y-6 bg-white text-black p-8 md:p-12 border-8 border-primary shadow-[16px_16px_0_0_rgba(255,184,0,1)] text-left transform rotate-1">
              <p>
                Traditional study apps are passive. They give you a neat little calendar and polite desktop notifications. <strong className="text-accent uppercase underline decoration-4">They fail.</strong>
              </p>
              <p>
                NeuroCanopy is a <strong className="bg-[#0084FF] text-white px-2">brute-force</strong> engine. We believe that if you want a top-tier grade, you need an environment that physically prevents you from slacking off. 
              </p>
              <div className="border-l-8 border-accent pl-6 mt-8 py-2 italic font-black text-gray-800">
                "We don't ask you nicely to study. We lock your browser, start a voice interrogation, and force you to level up."
              </div>
            </div>
            
            <div className="mt-16 inline-block">
              <Link to="/tree" className="bg-white text-black border-4 border-primary px-8 py-4 font-black uppercase text-xl flex items-center gap-3 hover:bg-primary hover:scale-105 transition-all shadow-[8px_8px_0_0_#fff]">
                <Network strokeWidth={3} /> View the Knowledge Tree System
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials / Social Proof */}
        <section className="py-32 px-6 bg-[#00E572] border-b-8 border-black text-center relative overflow-hidden">
          {/* Halftone dot pattern background */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '16px 16px' }}></div>
          
          <div className="relative z-10">
            <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tight mb-20 text-center max-w-6xl mx-auto rotate-[-2deg] bg-white border-8 border-black inline-block px-12 py-4 shadow-[16px_16px_0_0_#000]">
              Beta Survivor<br />Logs
            </h2>
            
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
              {/* Testimonial 1 */}
              <div className="bg-white p-8 border-8 border-black shadow-[16px_16px_0_0_rgba(0,0,0,1)] text-left flex flex-col gap-6 transform hover:-translate-y-2 transition-transform relative translate-y-8">
                 <div className="absolute -top-8 -left-8 text-6xl text-[#FFB800] drop-shadow-[4px_4px_0_rgba(0,0,0,1)] font-serif rotate-12">"</div>
                 <p className="font-bold text-2xl leading-snug border-l-8 border-accent pl-6 bg-gray-50 p-4">
                   The Voice Viva literally roasted my misunderstanding of Pointers. Forced me to actually learn it.
                 </p>
                 <div className="flex items-center gap-4 mt-auto border-t-4 border-black pt-6">
                   <div className="w-16 h-16 bg-accent border-4 border-black text-white font-black text-2xl flex items-center justify-center transform -rotate-6 shadow-[4px_4px_0_0_#000]">
                     DK
                   </div>
                   <div>
                     <p className="font-black text-xl uppercase">David K.</p>
                     <p className="font-bold text-gray-500 uppercase tracking-wider text-sm">CS Sophomore</p>
                   </div>
                 </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-white p-8 border-8 border-black shadow-[16px_16px_0_0_rgba(0,0,0,1)] text-left flex flex-col gap-6 transform hover:-translate-y-2 transition-transform rotate-2 relative">
                 <div className="absolute -top-8 -right-8 text-6xl text-[#0084FF] drop-shadow-[4px_4px_0_rgba(0,0,0,1)] font-serif -rotate-12">"</div>
                 <p className="font-bold text-2xl leading-snug border-l-8 border-primary pl-6 bg-gray-50 p-4">
                   I was failing OS. Panic Mode kicked in, blocked Reddit for 3 days, and mapped out an exact recovery path.
                 </p>
                 <div className="flex items-center gap-4 mt-auto border-t-4 border-black pt-6">
                   <div className="w-16 h-16 bg-primary border-4 border-black flex items-center justify-center font-black text-2xl transform rotate-6 shadow-[4px_4px_0_0_#000]">
                     SJ
                   </div>
                   <div>
                     <p className="font-black text-xl uppercase">Sarah J.</p>
                     <p className="font-bold text-gray-500 uppercase tracking-wider text-sm">Senior Eng</p>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Bar */}
        <section className="py-24 px-6 bg-accent text-white border-b-8 border-black text-center relative overflow-hidden">
            {/* Speed lines */}
            <div className="absolute inset-0 opacity-30" style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px)' }}></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight mb-12 bg-black inline-block px-8 py-4 transform -rotate-2 border-4 border-white shadow-[8px_8px_0_0_#FFF]">
                Still scrolling? Start studying.
              </h2>
              <div className="relative group inline-block mt-4">
                <div className="absolute inset-0 bg-primary border-8 border-black shadow-[16px_16px_0_0_#000] rotate-3 group-hover:rotate-6 transition-transform"></div>
                <Link to="/register" className="relative z-10 block bg-white text-black border-8 border-black text-3xl md:text-5xl font-black uppercase px-16 py-8 hover:-translate-y-2 hover:-translate-x-2 transition-transform shadow-[8px_8px_0_0_#000]">
                  Begin Onboarding Flow
                </Link>
                {/* Comic speech bubble accent */}
                <div className="absolute -top-16 -right-16 bg-[#0084FF] text-white border-4 border-black p-4 font-black uppercase text-xl rounded-full rounded-bl-none shadow-[8px_8px_0_0_#000] z-20 w-32 h-32 flex items-center justify-center text-center rotate-12 animate-bounce">
                  Do It NOW!
                </div>
              </div>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white p-12 md:p-24 border-t-[16px] border-primary relative overflow-hidden">
        {/* Decorative caution tape */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-yellow-400 opacity-50" style={{ background: 'repeating-linear-gradient(45deg, #FFB800, #FFB800 10px, #000 10px, #000 20px)' }}></div>
        
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start gap-16 relative z-10">
          <div className="w-full lg:w-2/5">
            <div className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 text-white inline-block border-b-8 border-primary pb-4">
              NeuroCanopy
            </div>
            <p className="font-bold text-xl md:text-2xl text-gray-300 leading-relaxed bg-[#111] border-l-8 border-accent p-6">
              The uncompromising neo-brutalist learning environment for students who actually want to pass.
            </p>
          </div>
          
          <div className="w-full lg:w-3/5 grid grid-cols-2 md:grid-cols-3 gap-12 font-black uppercase tracking-widest text-lg">
             <div className="flex flex-col gap-6">
               <h4 className="text-[#FFB800] text-2xl mb-4 border-b-4 border-[#333] pb-2">Platform</h4>
               <Link to="#" className="hover:text-primary hover:translate-x-2 transition-transform flex items-center gap-2"><div className="w-2 h-2 bg-primary"></div> Features</Link>
               <Link to="#" className="hover:text-primary hover:translate-x-2 transition-transform flex items-center gap-2"><div className="w-2 h-2 bg-primary"></div> Philosophy</Link>
               <Link to="#" className="hover:text-primary hover:translate-x-2 transition-transform flex items-center gap-2"><div className="w-2 h-2 bg-primary"></div> Pricing</Link>
             </div>
             <div className="flex flex-col gap-6">
               <h4 className="text-[#0084FF] text-2xl mb-4 border-b-4 border-[#333] pb-2">Support</h4>
               <Link to="#" className="hover:text-[#0084FF] hover:translate-x-2 transition-transform flex items-center gap-2"><div className="w-2 h-2 bg-[#0084FF]"></div> Help Docs</Link>
               <Link to="#" className="hover:text-[#0084FF] hover:translate-x-2 transition-transform flex items-center gap-2"><div className="w-2 h-2 bg-[#0084FF]"></div> Discord</Link>
               <Link to="#" className="hover:text-[#0084FF] hover:translate-x-2 transition-transform flex items-center gap-2"><div className="w-2 h-2 bg-[#0084FF]"></div> Contact</Link>
             </div>
             <div className="flex flex-col gap-6">
               <h4 className="text-accent text-2xl mb-4 border-b-4 border-[#333] pb-2">Legal</h4>
               <Link to="#" className="hover:text-accent hover:translate-x-2 transition-transform flex items-center gap-2"><div className="w-2 h-2 bg-accent"></div> Privacy</Link>
               <Link to="#" className="hover:text-accent hover:translate-x-2 transition-transform flex items-center gap-2"><div className="w-2 h-2 bg-accent"></div> Terms</Link>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
