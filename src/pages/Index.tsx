import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Brain, Clock, Cpu, Award, Zap, Network } from 'lucide-react';

export default function Index() {
  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Navigation */}
      <nav className="p-6 flex justify-between items-center border-b-4 border-black bg-white sticky top-0 z-50">
        <div className="text-3xl font-black uppercase tracking-tighter bg-primary px-3 py-1 border-2 border-black inline-block shadow-brutal-sm">
          NeuroCanopy
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="font-bold border-2 border-transparent px-4 py-2 hover:border-black hover:bg-gray-100 transition-colors hidden sm:block">
            Log in
          </Link>
          <Link to="/register" className="btn-brutal bg-accent text-white py-2">
            Start Now <ArrowRight className="inline-block w-5 h-5 ml-1" />
          </Link>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b-4 border-black bg-[#FAF9F6] px-6 py-20 lg:py-28">
          <div className="hero-ambient" aria-hidden>
            <div className="hero-pulse-grid" />
            <div className="hero-orb orb-a" />
            <div className="hero-orb orb-b" />
            <div className="hero-orb orb-c" />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto flex flex-col items-center text-center">
            
            <div className="bg-primary border-4 border-black px-4 py-2 font-bold uppercase tracking-wider mb-8 shadow-[4px_4px_0px_rgba(0,0,0,1)] -rotate-2">
              The anti-procrastination engine
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-[0.9] text-black">
              Hack your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-red-600 block mt-2">attention span.</span>
            </h1>
            
            <p className="text-xl md:text-2xl mt-8 font-medium max-w-3xl leading-snug">
              Stop fighting your brain. NeuroCanopy uses hard-locked focus blocks, active AI oral vivas, and chronological pacing to brute-force your learning.
            </p>
            
            <div className="mt-12 flex flex-col sm:flex-row gap-6">
              <Link to="/register" className="btn-brutal text-2xl px-10 py-5 bg-primary hover:bg-yellow-400">
                Claim Your Brain <Zap className="inline-block ml-2 w-6 h-6" fill="currentColor" />
              </Link>
              <button className="btn-brutal text-2xl px-10 py-5 bg-white hover:bg-gray-50 flex items-center justify-center gap-2">
                See How It Works
              </button>
            </div>
            
            {/* Decorative Brutalist Elements */}
            <div className="mt-16 flex gap-4 opacity-70">
              <div className="w-16 h-16 border-4 border-black rotate-12 bg-secondary"></div>
              <div className="w-16 h-16 border-4 border-black rounded-full bg-accent"></div>
              <div className="w-16 h-16 border-4 border-black -rotate-12 bg-primary"></div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6 bg-white border-b-4 border-black">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tight mb-16 text-center">
              Ruthless Features
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="card-brutal bg-primary hover:-translate-y-2 transition-transform h-full flex flex-col">
                <Brain className="w-16 h-16 mb-6" strokeWidth={2} />
                <h3 className="text-3xl font-bold uppercase mb-4 leading-tight">AI Voice Viva</h3>
                <p className="font-medium text-lg flex-1">
                  Passive reading is a myth. Our AI interrogates you orally on your syllabus to expose what you don't actually know.
                </p>
              </div>

              <div className="card-brutal bg-white hover:-translate-y-2 transition-transform h-full flex flex-col">
                <Clock className="w-16 h-16 mb-6 text-accent" strokeWidth={2} />
                <h3 className="text-3xl font-bold uppercase mb-4 leading-tight">Quantum Scheduling</h3>
                <p className="font-medium text-lg flex-1">
                  Input your chronotype, sleep schedule, and exams. We generate a merciless, minute-by-minute survival plan.
                </p>
              </div>

              <div className="card-brutal bg-[#FAF9F6] border-red-500 hover:-translate-y-2 transition-transform h-full flex flex-col">
                <Cpu className="w-16 h-16 mb-6 text-red-600" strokeWidth={2} />
                <h3 className="text-3xl font-bold uppercase mb-4 leading-tight text-red-600">Panic Mode</h3>
                <p className="font-medium text-lg flex-1">
                  When deadlines compress, the app goes red. Notifications get aggressive. Site-blocking locks down tight.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Testimonials / Social Proof */}
        <section className="py-24 px-6 bg-secondary border-b-4 border-black overflow-hidden relative">
          <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tight mb-16 text-center max-w-6xl mx-auto">
            Beta Survivor Logs
          </h2>
          
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="card-brutal bg-white flex gap-4">
               <div className="w-16 h-16 bg-accent flex items-center justify-center border-4 border-black text-white font-black text-2xl shrink-0">
                 DK
               </div>
               <div>
                 <p className="font-bold text-xl italic leading-snug">"The Voice Viva literally roasted my misunderstanding of Pointers. Forced me to actually learn it."</p>
                 <p className="font-bold uppercase tracking-wider text-sm mt-4 text-gray-500">— CS Sophmore</p>
               </div>
            </div>

            <div className="card-brutal bg-white flex gap-4">
               <div className="w-16 h-16 bg-primary flex items-center justify-center border-4 border-black font-black text-2xl shrink-0">
                 SJ
               </div>
               <div>
                 <p className="font-bold text-xl italic leading-snug">"I was failing OS. Panic Mode kicked in, blocked Reddit for 3 days, and mapped out an exact recovery path."</p>
                 <p className="font-bold uppercase tracking-wider text-sm mt-4 text-gray-500">— Senior Eng</p>
               </div>
            </div>
          </div>
        </section>

        {/* CTA Bar */}
        <section className="py-16 px-6 bg-accent text-white border-b-4 border-black text-center">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-8">
              Still scrolling? Start studying.
            </h2>
            <Link to="/register" className="btn-brutal text-2xl px-12 py-6 bg-primary text-black hover:bg-yellow-400 inline-block">
              Begin Onboarding Flow
            </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white p-12 border-t-8 border-primary">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="w-full md:w-1/3">
            <div className="text-4xl font-black uppercase tracking-tighter mb-4 text-primary">
              NeuroCanopy
            </div>
            <p className="font-medium text-gray-400">
              The uncompromising neo-brutalist learning environment for students who actually want to pass.
            </p>
          </div>
          
          <div className="w-full md:w-2/3 grid grid-cols-2 md:grid-cols-3 gap-8 font-bold uppercase tracking-wider">
             <div className="flex flex-col gap-3">
               <h4 className="text-gray-500 mb-2">Platform</h4>
               <Link to="#" className="hover:text-primary transition-colors">Features</Link>
               <Link to="#" className="hover:text-primary transition-colors">Philosophy</Link>
               <Link to="#" className="hover:text-primary transition-colors">Pricing</Link>
             </div>
             <div className="flex flex-col gap-3">
               <h4 className="text-gray-500 mb-2">Support</h4>
               <Link to="#" className="hover:text-primary transition-colors">Help Docs</Link>
               <Link to="#" className="hover:text-primary transition-colors">Discord</Link>
               <Link to="#" className="hover:text-primary transition-colors">Contact</Link>
             </div>
             <div className="flex flex-col gap-3">
               <h4 className="text-gray-500 mb-2">Legal</h4>
               <Link to="#" className="hover:text-primary transition-colors">Privacy</Link>
               <Link to="#" className="hover:text-primary transition-colors">Terms</Link>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
