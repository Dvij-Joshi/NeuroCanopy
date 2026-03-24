import React from 'react';
import { BookOpen, Upload, Trash2, Edit3, CheckSquare, Square } from 'lucide-react';

export default function Syllabus() {
  const materials = [
    { id: 1, title: "Operating Systems Notes - Midterm", type: "PDF", added: "2 days ago", parsed: true, isSelected: false },
    { id: 2, title: "CS101 Intro Lecture Video", type: "MP4", added: "1 week ago", parsed: true, isSelected: true },
    { id: 3, title: "Research Paper: Paxos Consensus", type: "PDF", added: "Just now", parsed: false, isSelected: false },
  ];

  return (
    <div className="page-shell">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <BookOpen className="w-10 h-10" strokeWidth={2.5} />
            Syllabus Manager
          </h1>
          <p className="page-subtitle">Upload materials, auto-extract topics.</p>
        </div>
        <button className="btn-brutal bg-black text-white flex items-center gap-2">
          <Upload strokeWidth={3} /> Upload File
        </button>
      </div>

      <div className="card-brutal bg-white p-0 overflow-hidden">
        {/* Bulk Actions Header */}
        <div className="bg-gray-100 border-b-4 border-black p-3 flex justify-between items-center">
          <div className="flex items-center gap-4 font-bold uppercase tracking-wider">
            <Square className="cursor-pointer" strokeWidth={3} />
            <span>Select All</span>
          </div>
          <div className="flex gap-2">
            <button className="bg-black text-white p-2 border-2 border-transparent hover:bg-gray-800" title="Edit Selected">
              <Edit3 className="w-5 h-5" />
            </button>
            <button className="bg-red-500 text-white p-2 border-2 border-black hover:bg-red-600 shadow-[2px_2px_0px_rgba(0,0,0,1)]" title="Delete Selected">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Table/List View */}
        <div className="divide-y-4 divide-black">
          {materials.map((mat) => (
            <div key={mat.id} className={`p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 transition-colors ${mat.isSelected ? 'bg-secondary bg-opacity-30' : 'hover:bg-[#FAF9F6]'}`}>
              <div className="flex items-center gap-4">
                {mat.isSelected ? (
                   <CheckSquare className="text-black cursor-pointer" strokeWidth={3} />
                ) : (
                   <Square className="text-gray-400 cursor-pointer hover:text-black" strokeWidth={3} />
                )}
                
                <div className="w-12 h-12 bg-primary border-2 border-black flex items-center justify-center font-bold uppercase">
                  {mat.type}
                </div>
                
                <div>
                  <h3 className="text-lg font-bold">{mat.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm font-medium uppercase tracking-wide">
                    <span className="text-gray-600">Added {mat.added}</span>
                    <span className="w-1 h-1 bg-black rounded-full" />
                    {mat.parsed ? (
                      <span className="text-green-600 font-bold">● AI Parsed (12 Topics)</span>
                    ) : (
                      <span className="text-accent font-bold animate-pulse">● Parsing in progress...</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                <button className="flex-1 md:flex-none px-4 py-2 border-2 border-black font-bold uppercase text-sm bg-white hover:bg-gray-100">
                  View Data
                </button>
                <button className="px-3 py-2 border-2 border-black text-red-600 bg-white hover:bg-red-50">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          {/* Empty State / Dropzone (Optional visual addition) */}
          <div className="m-5 cursor-pointer border-4 border-dashed border-gray-300 bg-gray-50 p-8 text-center transition-colors hover:border-black">
             <Upload className="mx-auto mb-4 h-10 w-10 text-gray-400" strokeWidth={2} />
             <h3 className="text-xl font-bold uppercase mb-2">Drag & Drop More Files Here</h3>
             <p className="font-medium text-gray-600">Supports PDF, PPTX, MP4, and raw text.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
