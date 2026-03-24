import React from 'react';
import { Network, Plus, CheckCircle, Circle } from 'lucide-react';

export default function KnowledgeTree() {
  const categories = [
    { title: "Computer Science Core", progress: 65, status: "healthy" },
    { title: "Mathematics", progress: 80, status: "healthy" },
    { title: "Physics", progress: 30, status: "at-risk" },
  ];

  const nodes = [
    { id: 1, label: "Data Structures", status: "completed" },
    { id: 2, label: "Algorithms", status: "in-progress" },
    { id: 3, label: "Operating Systems", status: "locked" },
  ];

  return (
    <div className="page-shell">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <Network className="w-10 h-10" strokeWidth={2.5} />
            Knowledge Tree
          </h1>
          <p className="page-subtitle">Map your learning progression visually.</p>
        </div>
        <button className="btn-brutal bg-accent text-white flex items-center gap-2">
          <Plus strokeWidth={3} /> Add Topic
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[340px,1fr]">
        {/* Categories Sidebar */}
        <div className="space-y-4">
          {categories.map((category, idx) => (
            <div key={idx} className={`card-brutal flex flex-col ${category.status === 'at-risk' ? 'bg-[#FF3D00] text-white' : 'bg-white'}`}>
              <h3 className="font-bold uppercase tracking-wider text-lg mb-3">{category.title}</h3>
              <div className="mt-auto">
                <div className="text-3xl font-black">{category.progress}%</div>
                <div className="w-full h-3 bg-gray-200 mt-2 border-2 border-black rounded-sm">
                  <div 
                    className={`h-full border-r-2 border-black ${category.status === 'at-risk' ? 'bg-black' : 'bg-primary'}`} 
                    style={{ width: `${category.progress}%` }} 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tree Visualization Placeholder */}
        <div className="space-y-4">
          <div className="card-brutal bg-[#FAF9F6] min-h-[460px] flex flex-col justify-center items-center relative border-dashed border-4">
            
            {/* Extremely simple visual representation for now */}
            <h2 className="text-xl font-bold mb-8 uppercase text-center absolute top-5 left-5">
              CS Core Pathway
            </h2>

            <div className="flex flex-col items-center gap-6 px-4 py-12">
              {nodes.map((node) => (
                <div key={node.id} className="flex flex-col items-center">
                  <div className={`min-w-[220px] p-4 border-4 border-black font-bold uppercase text-base text-center transform transition-transform hover:scale-105 cursor-pointer ${
                    node.status === 'completed' ? 'bg-primary shadow-brutal' :
                    node.status === 'in-progress' ? 'bg-secondary' : 'bg-gray-200 opacity-70'
                  }`}>
                    <div className="flex justify-center items-center gap-2">
                      {node.status === 'completed' && <CheckCircle strokeWidth={3} />}
                      {node.status === 'in-progress' && <Circle strokeWidth={3} />}
                      {node.label}
                    </div>
                  </div>
                  {node.id !== nodes.length && (
                    <div className="w-2 h-12 bg-black mt-2 hidden md:block" />
                  )}
                </div>
              ))}
            </div>

            <p className="absolute bottom-5 font-medium text-gray-500 uppercase tracking-widest text-xs">Interactive graph mode in progress</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="card-brutal bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wider">Nodes Completed</p>
              <p className="mt-1 text-2xl font-black">31</p>
            </div>
            <div className="card-brutal bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wider">Next Unlock</p>
              <p className="mt-1 text-sm font-black uppercase">OS Scheduling</p>
            </div>
            <div className="card-brutal bg-secondary p-4">
              <p className="text-xs font-bold uppercase tracking-wider">Risk Branches</p>
              <p className="mt-1 text-2xl font-black">2</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
