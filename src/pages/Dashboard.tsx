import React from 'react';
import { Target, Flame, Brain, Clock, Plus, Zap } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="page-shell">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="page-title">Overview</h1>
          <p className="page-subtitle">Welcome back. You are currently in <span className="text-accent underline decoration-4 underline-offset-4">Panic Mode</span>.</p>
        </div>
        <button className="btn-brutal flex items-center gap-2 text-sm sm:text-base">
          <Plus strokeWidth={3} /> Start Focus Block
        </button>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        
        <div className="card-brutal bg-primary flex flex-col hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold uppercase tracking-wider text-sm">Study Streak</h3>
            <Flame className="w-8 h-8" strokeWidth={2.5} />
          </div>
          <div className="mt-auto">
            <div className="text-4xl font-black">12 <span className="text-xl">Days</span></div>
          </div>
        </div>

        <div className="card-brutal bg-white flex flex-col hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold uppercase tracking-wider text-sm">Syllabus Progress</h3>
            <Target className="w-8 h-8" strokeWidth={2.5} />
          </div>
          <div className="mt-auto">
            <div className="text-4xl font-black">42%</div>
            <div className="w-full h-2 bg-gray-200 mt-2 border border-black rounded-sm">
              <div className="w-[42%] h-full bg-accent border-r border-black" />
            </div>
          </div>
        </div>

        <div className="card-brutal bg-secondary flex flex-col hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold uppercase tracking-wider text-sm">Avg Viva Score</h3>
            <Brain className="w-8 h-8" strokeWidth={2.5} />
          </div>
          <div className="mt-auto">
            <div className="text-4xl font-black">B+</div>
            <p className="font-bold text-sm mt-1 uppercase">Top 15%</p>
          </div>
        </div>

        <div className="card-brutal bg-white flex flex-col hover:-translate-y-1 transition-transform">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold uppercase tracking-wider text-sm">Focus Hours</h3>
            <Clock className="w-8 h-8" strokeWidth={2.5} />
          </div>
          <div className="mt-auto">
            <div className="text-4xl font-black">8.5 <span className="text-xl">h</span></div>
            <p className="font-bold text-sm mt-1 uppercase">This week</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Main Content Area */}
        <div className="space-y-5 lg:col-span-2">
          
          {/* Decay Radar */}
          <section className="card-brutal bg-white">
            <h2 className="mb-5 flex items-center justify-between border-b-4 border-black pb-3 text-xl font-bold uppercase">
              Decay Radar
              <span className="text-sm bg-accent text-white px-2 py-1">2 AT RISK</span>
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 border-2 border-black hover:bg-[#FAF9F6] transition-colors">
                <div>
                  <h4 className="font-bold text-lg">Machine Learning: Neural Nets</h4>
                  <p className="text-sm font-medium text-red-600">Last reviewed 14 days ago</p>
                </div>
                <button className="btn-brutal py-2 bg-primary">Review Now</button>
              </div>
              <div className="flex justify-between items-center p-4 border-2 border-black hover:bg-[#FAF9F6] transition-colors">
                <div>
                  <h4 className="font-bold text-lg">Data Structures: Red-Black Trees</h4>
                  <p className="text-sm font-medium text-red-600">Last reviewed 11 days ago</p>
                </div>
                <button className="btn-brutal py-2 bg-primary">Review Now</button>
              </div>
            </div>
          </section>

          <section className="card-brutal bg-white">
            <h2 className="mb-4 border-b-4 border-black pb-3 text-xl font-bold uppercase">Pacing Summary</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="surface-muted p-3">
                <p className="text-xs font-bold uppercase tracking-wider">Urgent Topics</p>
                <p className="mt-1 text-2xl font-black">5</p>
              </div>
              <div className="surface-muted p-3">
                <p className="text-xs font-bold uppercase tracking-wider">Sessions Done</p>
                <p className="mt-1 text-2xl font-black">14</p>
              </div>
              <div className="surface-muted p-3">
                <p className="text-xs font-bold uppercase tracking-wider">Recovery Index</p>
                <p className="mt-1 text-2xl font-black">74</p>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-5">
          <section className="card-brutal bg-accent text-white">
            <h2 className="text-2xl font-bold uppercase mb-4 flex items-center gap-2">
              <Zap strokeWidth={3} /> Next Exam
            </h2>
            <div className="text-4xl font-black mt-2">7 Days left</div>
            <div className="mt-4 font-bold text-lg">Mid-Term: Comp Architecture</div>
            <p className="mt-2 font-medium">Schedule has been automatically compressed to Panic Mode.</p>
          </section>

          <section className="card-brutal bg-white">
            <h2 className="text-2xl font-bold uppercase mb-4 border-b-4 border-black pb-2">Recent Activity</h2>
            <ul className="space-y-4">
              <li className="flex gap-4 items-start">
                <div className="w-3 h-3 bg-secondary rounded-full mt-2 border-2 border-black flex-shrink-0" />
                <div>
                  <p className="font-bold">Completed Oral Viva</p>
                  <p className="text-sm font-medium">Scored A- in OS Memory Management.</p>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <div className="w-3 h-3 bg-primary rounded-full mt-2 border-2 border-black flex-shrink-0" />
                <div>
                  <p className="font-bold">Uploaded PDF</p>
                  <p className="text-sm font-medium">AI successfully extracted 12 topics.</p>
                </div>
              </li>
            </ul>
          </section>
        </div>
      </div>

    </div>
  );
}
